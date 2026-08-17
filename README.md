# Storyforge

AI-powered manuscript analysis for fiction and long-form writers. Paste a draft into the editor, pick an editorial lens (grammar, proofreading, pacing, character development, setting, dialogue, or consistency), and get structured, advisory suggestions from Google Gemini (`gemini-3.6-flash`). Your manuscript text is never rewritten automatically — suggestions are advisory only.

## Architecture

- **`backend/`** — FastAPI service. `POST /api/v1/editor/analyze` sends your text to Gemini with a schema-strict prompt, validates the response, and returns structured suggestions (`severity`, `issue`, `explanation`, `suggestion`, optional `location`, and `category`).
- **`frontend/`** — Next.js (pages router) single-page editor that calls the backend and renders suggestions as cards.

## Run locally

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export GEMINI_API_KEY=your_google_ai_studio_key
uvicorn main:app --host 0.0.0.0 --port 8000
```

API: `POST http://localhost:8000/api/v1/editor/analyze`

```json
{
  "text": "She walk into the room…",
  "task": "grammar",
  "context": { "genre": "fantasy", "sceneTitle": "Chapter 1", "storyBible": {} }
}
```

`task` must be one of: `grammar`, `proofreading`, `pacing`, `character development`, `setting`, `dialogue`, `consistency`. `context` is optional.

### Frontend

```bash
cd frontend
npm install
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000. If the backend runs elsewhere, point `NEXT_PUBLIC_API_URL` at it.

## Deployment

- **Render (backend):** set the `GEMINI_API_KEY` environment variable. The app binds to `0.0.0.0` and reads the `PORT` env var (default `8000`), so `uvicorn main:app --host 0.0.0.0 --port $PORT` works as a start command.
- **Vercel (frontend):** set `NEXT_PUBLIC_API_URL` to your Render service URL (e.g. `https://your-backend.onrender.com`). Build is already configured in `vercel.json` (`npm run build`, output `.next`).

Never commit API keys or `.env` files.
