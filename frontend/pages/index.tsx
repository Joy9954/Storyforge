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
  low: { badgeBg: '#143e42', badgeColor: '#7ce8df', border: '#245b60' },
  medium: { badgeBg: '#4a3410', badgeColor: '#f5c76a', border: '#6b4d1a' },
  high: { badgeBg: '#4a1622', badgeColor: '#ff9dab', border: '#6b2432' },
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
        body {
          margin: 0;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #eae6ff;
          background:
            radial-gradient(1100px 760px at 88% -4%, rgba(140,105,255,0.16), transparent 62%),
            radial-gradient(900px 680px at -8% 108%, rgba(70,84,190,0.26), transparent 62%),
            radial-gradient(560px 420px at 24% 0%, rgba(250,196,120,0.07), transparent 60%),
            linear-gradient(162deg, #0b1026 0%, #101636 45%, #1a1f3c 100%);
          background-attachment: fixed;
          -webkit-font-smoothing: antialiased;
        }
        /* Star field — fixed layer of faint starlight dots. */
        body::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background-image:
            radial-gradient(1.4px 1.4px at 12% 18%, rgba(255,255,255,0.85), transparent 100%),
            radial-gradient(1px 1px at 26% 62%, rgba(255,255,255,0.55), transparent 100%),
            radial-gradient(1.6px 1.6px at 33% 26%, rgba(255,255,255,0.9), transparent 100%),
            radial-gradient(1px 1px at 46% 82%, rgba(255,255,255,0.5), transparent 100%),
            radial-gradient(1.2px 1.2px at 54% 12%, rgba(255,255,255,0.7), transparent 100%),
            radial-gradient(1px 1px at 63% 44%, rgba(255,255,255,0.6), transparent 100%),
            radial-gradient(1.5px 1.5px at 71% 68%, rgba(255,255,255,0.85), transparent 100%),
            radial-gradient(1px 1px at 78% 24%, rgba(255,255,255,0.5), transparent 100%),
            radial-gradient(1.2px 1.2px at 86% 56%, rgba(255,255,255,0.75), transparent 100%),
            radial-gradient(1px 1px at 93% 14%, rgba(255,255,255,0.6), transparent 100%),
            radial-gradient(1px 1px at 8% 44%, rgba(255,255,255,0.45), transparent 100%),
            radial-gradient(1.1px 1.1px at 17% 86%, rgba(255,255,255,0.6), transparent 100%),
            radial-gradient(1.3px 1.3px at 38% 4%, rgba(255,255,255,0.7), transparent 100%),
            radial-gradient(1px 1px at 59% 90%, rgba(255,255,255,0.5), transparent 100%),
            radial-gradient(1.1px 1.1px at 82% 78%, rgba(255,255,255,0.65), transparent 100%),
            radial-gradient(1.9px 1.9px at 48% 40%, rgba(255,255,255,0.95), transparent 100%),
            radial-gradient(1px 1px at 90% 4%, rgba(255,255,255,0.6), transparent 100%),
            radial-gradient(1.2px 1.2px at 30% 94%, rgba(255,255,255,0.55), transparent 100%);
        }
        .page { max-width: 860px; margin: 0 auto; padding: 56px 24px 80px; }
        header { text-align: center; margin-bottom: 40px; }
        h1 {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 44px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin: 0 0 8px;
          color: #f5efe0;
          text-shadow: 0 0 24px rgba(245,199,106,0.18);
        }
        .subtitle { font-size: 16px; color: #b6aed0; margin: 0 auto; line-height: 1.6; max-width: 620px; }
        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .editor { padding: 22px; }
        textarea {
          width: 100%;
          min-height: 260px;
          resize: vertical;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 15px;
          line-height: 1.6;
          font-family: Georgia, 'Times New Roman', serif;
          color: #ece7f8;
          background: rgba(9,12,30,0.6);
        }
        textarea::placeholder { color: #6f6a90; }
        textarea:focus { outline: none; border-color: #f0b429; box-shadow: 0 0 0 3px rgba(240,180,41,0.18); }
        .task-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8f87b3; margin: 18px 0 10px; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: #cfcadf;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .chip:hover { border-color: rgba(245,199,106,0.6); color: #f5efe0; }
        .chip.active {
          background: linear-gradient(180deg, #f5c76a, #eaa93d);
          border-color: #f5c76a;
          color: #221a06;
          box-shadow: 0 0 18px rgba(240,180,41,0.35);
        }
        .model-select {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(9,12,30,0.6);
          color: #ece7f8;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: inherit;
        }
        .model-select:focus { outline: none; border-color: #f0b429; box-shadow: 0 0 0 3px rgba(240,180,41,0.18); }
        .actions { display: flex; align-items: center; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
        .analyze-btn {
          background: linear-gradient(180deg, #f5c76a, #eaa93d);
          color: #221a06;
          border: none;
          border-radius: 12px;
          padding: 12px 30px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 0 22px rgba(240,180,41,0.28);
        }
        .analyze-btn:hover:not(:disabled) { background: linear-gradient(180deg, #ffd98a, #f2b64e); box-shadow: 0 0 30px rgba(240,180,41,0.42); }
        .analyze-btn:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
        .status { font-size: 13px; color: #b6aed0; }
        .error {
          margin-top: 16px;
          background: rgba(199,44,44,0.14);
          border: 1px solid #b0343f;
          color: #ffb3b3;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        .results { margin-top: 28px; }
        .results-title { font-size: 15px; font-weight: 600; color: #cfcadf; margin: 0 0 12px; }
        .result { padding: 16px 18px; margin-bottom: 12px; border-left-width: 4px; border-left-style: solid; }
        .result-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
        .badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 10px; border-radius: 999px; }
        .issue-title { font-size: 15px; font-weight: 600; margin: 0; color: #f0ebfb; }
        .result-body { font-size: 14px; line-height: 1.55; color: #c9c3dd; }
        .result-body p { margin: 0 0 8px; }
        .suggestion {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 10px 12px;
        }
        .suggestion strong { color: #f5c76a; }
        .excerpt {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 12.5px;
          background: rgba(8,10,26,0.55);
          border: 1px solid rgba(255,255,255,0.08);
          color: #d8d1ec;
          border-radius: 6px;
          padding: 8px 10px;
          display: inline-block;
          margin-top: 6px;
        }
        .empty { color: #b6aed0; font-size: 14px; padding: 20px; text-align: center; }
        .footer { text-align: center; margin-top: 56px; font-size: 12px; color: #8f87b3; }
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
                <div key={idx} className="card result" style={{ borderLeftColor: style.badgeColor }}>
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
