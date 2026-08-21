import axios from 'axios';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PROVIDERS = [
  { id: 'gemini', label: 'Gemini', icon: '✨' },
  { id: 'groq', label: 'Groq', icon: '⚡' },
  { id: 'openai', label: 'OpenAI', icon: '🤖' },
] as const;
// Mirrors the backend PROVIDERS[].models so the picker and the API stay in sync.
const PROVIDER_MODELS: Record<ProviderId, string[]> = {
  gemini: ['gemini-3.6-flash', 'gemini-3.5-flash-lite'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  openai: ['gpt-4o-mini', 'gpt-4o'],
};
type ProviderId = (typeof PROVIDERS)[number]['id'];

const TASKS = [
  { id: 'grammar', label: 'Grammar', icon: '✏️' },
  { id: 'proofreading', label: 'Proofreading', icon: '🔍' },
  { id: 'pacing', label: 'Pacing', icon: '⏱️' },
  { id: 'character development', label: 'Characters', icon: '🎭' },
  { id: 'setting', label: 'Setting', icon: '🏞️' },
  { id: 'dialogue', label: 'Dialogue', icon: '💬' },
  { id: 'consistency', label: 'Consistency', icon: '🔗' },
] as const;

type Severity = 'low' | 'medium' | 'high';

interface SuggestionLocation {
  start?: number;
  end?: number;
  excerpt?: string;
}

interface Suggestion {
  category: string;
  severity: Severity;
  issue: string;
  explanation: string;
  suggestion: string;
  location?: SuggestionLocation;
}

const SEVERITY_STYLES: Record<Severity, { badgeBg: string; badgeColor: string; border: string }> = {
  low: { badgeBg: '#e3fafc', badgeColor: '#0b7285', border: '#c5f6fa' },
  medium: { badgeBg: '#fff3bf', badgeColor: '#e67700', border: '#ffec99' },
  high: { badgeBg: '#ffe3e3', badgeColor: '#c92a2a', border: '#ffc9c9' },
};

export default function Home() {
  const [text, setText] = useState('');
  const [task, setTask] = useState<string>('grammar');
  const [provider, setProvider] = useState<ProviderId>('gemini');
  const [model, setModel] = useState<string>(PROVIDER_MODELS.gemini[0]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Paste a draft, pick a lens, and analyze.');
  const [results, setResults] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!text.trim()) {
      setError('Please paste some manuscript text first.');
      setResults(null);
      return;
    }
    setLoading(true);
    setError('');
    const providerLabel = PROVIDERS.find((p) => p.id === provider)?.label ?? provider;
    setStatus(`Analyzing with ${providerLabel} · ${model} (${task})…`);
    setResults(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/editor/analyze`,
        { text, task, provider, model },
        { timeout: 120000 },
      );
      const data = response.data as { provider?: string; model?: string; results: Suggestion[] };
      setResults(data.results || []);
      const count = (data.results || []).length;
      const usedModel = data.model ?? model;
      setStatus(
        count === 0
          ? `No issues found from ${providerLabel} (${usedModel}) — clean writing!`
          : `${count} ${count === 1 ? 'suggestion' : 'suggestions'} found via ${providerLabel} (${usedModel}).`,
      );
    } catch (err) {
      let message = `Could not reach the analysis service at ${API_URL}. Is the backend running?`;
      if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
        message = err.response.data.error.message;
      }
      setError(message);
      setStatus('Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f6f4ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2b2b2b; }
        .page { max-width: 860px; margin: 0 auto; padding: 48px 24px 80px; }
        header { text-align: center; margin-bottom: 36px; }
        h1 { font-family: Georgia, 'Times New Roman', serif; font-size: 40px; font-weight: 700; letter-spacing: -0.5px; margin: 0 0 8px; color: #1c1c1c; }
        .subtitle { font-size: 16px; color: #6b6b6b; margin: 0; line-height: 1.5; }
        .card { background: #ffffff; border: 1px solid #e5e0d6; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .editor { padding: 20px; }
        textarea { width: 100%; min-height: 260px; resize: vertical; border: 1px solid #d8d2c6; border-radius: 10px; padding: 14px 16px; font-size: 15px; line-height: 1.6; font-family: Georgia, 'Times New Roman', serif; color: #2b2b2b; background: #fffdf9; }
        textarea:focus { outline: none; border-color: #8a7f6f; box-shadow: 0 0 0 3px rgba(138,127,111,0.15); }
        .task-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8a7f6f; margin: 18px 0 10px; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip { border: 1px solid #d8d2c6; background: #fff; color: #4a4a4a; border-radius: 999px; padding: 8px 14px; font-size: 14px; cursor: pointer; transition: all 0.15s ease; }
        .chip:hover { border-color: #8a7f6f; }
        .chip.active { background: #2b2b2b; border-color: #2b2b2b; color: #fff; }
        .model-select { width: 100%; border: 1px solid #d8d2c6; background: #fff; color: #2b2b2b; border-radius: 10px; padding: 10px 14px; font-size: 14px; font-family: inherit; }
        .model-select:focus { outline: none; border-color: #8a7f6f; box-shadow: 0 0 0 3px rgba(138,127,111,0.15); }
        .actions { display: flex; align-items: center; gap: 16px; margin-top: 18px; }
        .analyze-btn { background: #b4532a; color: #fff; border: none; border-radius: 10px; padding: 12px 28px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.15s ease; }
        .analyze-btn:hover:not(:disabled) { background: #96421f; }
        .analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .status { font-size: 13px; color: #8a8a8a; }
        .error { margin-top: 16px; background: #fff5f5; border: 1px solid #ffc9c9; color: #c92a2a; border-radius: 10px; padding: 12px 16px; font-size: 14px; line-height: 1.5; }
        .results { margin-top: 28px; }
        .results-title { font-size: 15px; font-weight: 600; color: #4a4a4a; margin: 0 0 12px; }
        .result { padding: 16px 18px; margin-bottom: 12px; border-left-width: 4px; border-left-style: solid; }
        .result-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 10px; border-radius: 999px; }
        .issue-title { font-size: 15px; font-weight: 600; margin: 0; }
        .result-body { font-size: 14px; line-height: 1.55; color: #444; }
        .result-body p { margin: 0 0 8px; }
        .suggestion { background: #faf8f3; border-radius: 8px; padding: 10px 12px; }
        .suggestion strong { color: #2b2b2b; }
        .excerpt { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 12.5px; background: #2b2b2b; color: #e9e4d8; border-radius: 6px; padding: 8px 10px; display: inline-block; margin-top: 6px; }
        .empty { color: #6b6b6b; font-size: 14px; padding: 20px; text-align: center; }
        .footer { text-align: center; margin-top: 48px; font-size: 12px; color: #b0aaa0; }
      `}</style>

      <header>
        <h1>Storyforge</h1>
        <p className="subtitle">
          Paste a draft, pick an editorial lens, and get structured, advisory feedback from
          your chosen AI provider — Gemini, Groq, or OpenAI. Your manuscript is never rewritten
          automatically.
        </p>
      </header>

      <div className="card editor">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'She walk into the room and saw John sitting by the window.\n\nPaste your manuscript scene here…'}
          aria-label="Manuscript text"
        />
        <div className="task-label">AI provider</div>
        <div className="chips">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`chip ${provider === p.id ? 'active' : ''}`}
              onClick={() => {
                setProvider(p.id);
                setModel(PROVIDER_MODELS[p.id][0]);
              }}
            >
              <span style={{ marginRight: 6 }}>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
        <div className="task-label">Model</div>
        <select
          className="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          aria-label="AI model"
        >
          {PROVIDER_MODELS[provider].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div className="task-label">Editorial lens</div>
        <div className="chips">
          {TASKS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`chip ${task === t.id ? 'active' : ''}`}
              onClick={() => setTask(t.id)}
            >
              <span style={{ marginRight: 6 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="analyze-btn" onClick={analyze} disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
          <span className="status">{status}</span>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      {results !== null && (
        <div className="results">
          <p className="results-title">
            Suggestions for “{TASKS.find((t) => t.id === task)?.label ?? task}”
          </p>
          {results.length === 0 ? (
            <div className="card empty">No issues found — nice writing! ✨</div>
          ) : (
            results.map((r, idx) => {
              const style = SEVERITY_STYLES[r.severity] || SEVERITY_STYLES.low;
              return (
                <div key={idx} className="card result" style={{ borderLeftColor: style.badgeBg }}>
                  <div className="result-head">
                    <span className="badge" style={{ background: style.badgeBg, color: style.badgeColor }}>
                      {r.severity}
                    </span>
                    <h3 className="issue-title">{r.issue}</h3>
                  </div>
                  <div className="result-body">
                    <p>{r.explanation}</p>
                    <div className="suggestion">
                      <strong>Suggestion:</strong> {r.suggestion}
                    </div>
                    {r.location?.excerpt && (
                      <span className="excerpt">“{r.location.excerpt}”</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="footer">Storyforge · AI-assisted manuscript analysis</div>
    </div>
  );
}
