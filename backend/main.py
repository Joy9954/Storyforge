"""Storyforge backend: FastAPI service that analyzes manuscript text with an AI provider.

POST /api/v1/editor/analyze
  Body: {"text": "<non-empty string>", "task": "<one of 7 tasks>", "provider": "gemini"|"groq", "context": {"genre"?, "sceneTitle"?, "storyBible"?}}
  Calls the selected provider (Gemini gemini-3.6-flash or Groq llama-3.3-70b-versatile,
  both via OpenAI-compatible endpoints) with a schema-strict prompt, then validates the
  returned JSON array and returns structured suggestions.
  Original text is never modified — suggestions are advisory only.
"""
import asyncio
import json
import os
import re
from typing import Any, Optional

import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Each provider shares the same OpenAI-compatible request shape, JSON schema
# instruction, and extract_json/validate pipeline below. A provider only differs
# by its own env key and endpoint/model.
PROVIDERS = {
    "gemini": {
        "key_env": "GEMINI_API_KEY",
        "model": "gemini-3.6-flash",
        "models": ["gemini-3.6-flash", "gemini-3.5-flash-lite"],
        "endpoint": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    },
    "groq": {
        "key_env": "GROQ_API_KEY",
        "model": "llama-3.3-70b-versatile",
        "models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
        "endpoint": "https://api.groq.com/openai/v1/chat/completions",
    },
    "openai": {
        "key_env": "OPENAI_API_KEY",
        "model": "gpt-4o-mini",
        "models": ["gpt-4o-mini", "gpt-4o"],
        "endpoint": "https://api.openai.com/v1/chat/completions",
    },
}

ANALYSIS_TASKS = [
    "grammar",
    "proofreading",
    "pacing",
    "character development",
    "setting",
    "dialogue",
    "consistency",
]
SEVERITIES = {"low", "medium", "high"}

SYSTEM_PROMPTS = {
    "grammar": "You are a precise grammar editor. Identify grammar, spelling, and punctuation issues without rewriting the author's voice.",
    "proofreading": "You are a careful proofreader. Find typos, usage errors, and unclear wording while preserving the author's intent.",
    "pacing": "You are a fiction pacing editor. Assess momentum, transitions, and scene rhythm with actionable, text-grounded notes.",
    "character development": "You are a character-development editor. Assess motivation, agency, emotional change, and consistency.",
    "setting": "You are a setting editor. Assess sensory grounding, spatial clarity, atmosphere, and world consistency.",
    "dialogue": "You are a dialogue editor. Assess voice, subtext, beats, attribution, and natural conversational flow.",
    "consistency": "You are a continuity editor. Find contradictions in facts, timeline, names, point of view, and story logic.",
}

# The exact JSON shape every provider must return (per item). The server
# overwrites `category` with the requested task, so it is omitted here.
SCHEMA_INSTRUCTION = """

Respond with ONLY a JSON array of issues found in the text. No markdown, no code fences, no prose outside the JSON, and no extra keys.

Each item must be a JSON object with exactly these fields:
- "severity": one of "low", "medium", or "high"
- "issue": a short title for the problem (string)
- "explanation": why it is an issue, grounded in the text (string)
- "suggestion": a concrete fix that preserves the author's voice (string)
- "location": an object with "start" (character offset into the text), "end" (character offset), and "excerpt" (the exact offending span of text) — optional but strongly preferred

Example item:
{"severity":"medium","issue":"Subject-verb disagreement","explanation":"The subject is plural but the verb is singular.","suggestion":"Change the verb to agree with the subject.","location":{"start":0,"end":12,"excerpt":"The birds sings"}}

If you find no issues, return an empty array: []"""


def build_system_prompt(task: str) -> str:
    return SYSTEM_PROMPTS[task] + SCHEMA_INSTRUCTION


class ProviderError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


def extract_json(content: str) -> Any:
    """Robustly parse provider content into a JSON value.

    1. Strip markdown code fences (```json ... ```) and surrounding whitespace.
    2. json.loads the result; if it is a wrapper object (some json_object modes
       wrap the array, e.g. {"results": [...]}), unwrap the single array value.
    3. If parsing fails, extract the first bracketed JSON array [...] from the
       content before giving up.
    """
    trimmed = content.strip()
    match = re.match(r"^```(?:json)?\s*([\s\S]*?)```\s*$", trimmed)
    text = (match.group(1) if match else trimmed).strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            arrays = [v for v in parsed.values() if isinstance(v, list)]
            if len(arrays) == 1:
                return arrays[0]
        return parsed
    except (json.JSONDecodeError, ValueError):
        pass  # fall through to array extraction

    start = text.find("[")
    if start != -1:
        depth = 0
        in_string = False
        escaped = False
        for i in range(start, len(text)):
            ch = text[i]
            if in_string:
                if escaped:
                    escaped = False
                elif ch == "\\":
                    escaped = True
                elif ch == '"':
                    in_string = False
            elif ch == '"':
                in_string = True
            elif ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start : i + 1])
                    except (json.JSONDecodeError, ValueError):
                        break

    raise ProviderError("malformed_response", "Provider returned invalid JSON.")


def validate(data: Any, task: str) -> list:
    if not isinstance(data, list):
        raise ProviderError("malformed_response", "Provider returned a non-array response.")
    results = []
    for item in data:
        if (
            not isinstance(item, dict)
            or item.get("severity") not in SEVERITIES
            or not all(isinstance(item.get(key), str) for key in ("issue", "explanation", "suggestion"))
        ):
            raise ProviderError(
                "malformed_response",
                "Provider response did not match the analysis schema.",
            )
        result = dict(item)
        result["category"] = task
        results.append(result)
    return results


def call_provider(text: str, task: str, context: Optional[dict], provider: str, model: Optional[str] = None) -> list:
    config = PROVIDERS[provider]
    # Resolve the effective model: honour a requested model that this provider
    # exposes; otherwise fall back safely to the provider's default.
    if not model or model not in config.get("models", [config["model"]]):
        model = config["model"]
    key = os.environ.get(config["key_env"])
    if not key:
        raise ProviderError(
            "missing_api_key", f"{config['key_env']} is not configured."
        )

    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": build_system_prompt(task)},
            {"role": "user", "content": json.dumps({"text": text, "context": context})},
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(config["endpoint"], headers=headers, json=body, timeout=120)
    except requests.RequestException:
        raise ProviderError("provider_error", "Unable to reach the AI provider.")

    if response.status_code in (401, 403):
        raise ProviderError("invalid_api_key", "The provider rejected the configured API key.")
    if response.status_code == 429:
        raise ProviderError("rate_limited", "The provider rate limit was reached.")
    if response.status_code != 200:
        raise ProviderError("provider_error", f"Provider request failed ({response.status_code}).")

    try:
        outer = response.json()
        try:
            content = outer["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError):
            content = ""
        parsed = extract_json(content)
    except ProviderError:
        raise
    except (ValueError, json.JSONDecodeError):
        raise ProviderError("malformed_response", "Provider returned invalid JSON.")

    return validate(parsed, task)


class Context(BaseModel):
    genre: Optional[str] = None
    sceneTitle: Optional[str] = None
    storyBible: Optional[Any] = None


class AnalyzeRequest(BaseModel):
    text: str
    task: str
    provider: Optional[str] = "gemini"
    model: Optional[str] = None
    context: Optional[Context] = None


app = FastAPI(
    title="Storyforge API",
    description="AI-powered manuscript editor",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to Storyforge API", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/api/v1/editor/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.text or not request.text.strip() or request.task not in ANALYSIS_TASKS:
        return JSONResponse(
            status_code=400,
            content={
                "error": {
                    "code": "invalid_request",
                    "message": "A non-empty text and a valid task are required.",
                }
            },
        )
    if request.provider not in PROVIDERS:
        return JSONResponse(
            status_code=400,
            content={
                "error": {
                    "code": "invalid_request",
                    "message": "Unknown provider. Choose one of: gemini, groq, openai.",
                }
            },
        )

    context = request.context.model_dump() if request.context else None
    try:
        config = PROVIDERS[request.provider]
        # Graceful model fallback: an unknown/absent model resolves to the default.
        selected_model = (
            request.model
            if request.model and request.model in config.get("models", [config["model"]])
            else config["model"]
        )
        results = await asyncio.get_event_loop().run_in_executor(
            None, lambda: call_provider(request.text, request.task, context, request.provider, selected_model)
        )
    except ProviderError as error:
        status = {
            "missing_api_key": 503,
            "invalid_api_key": 502,
            "rate_limited": 429,
            "provider_error": 502,
            "malformed_response": 502,
        }[error.code]
        return JSONResponse(
            status_code=status,
            content={"error": {"code": error.code, "message": error.message}},
        )

    return {
        "provider": request.provider,
        "model": selected_model,
        "task": request.task,
        "results": results,
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
