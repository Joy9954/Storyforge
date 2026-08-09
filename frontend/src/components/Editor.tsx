import React, { useState } from 'react'
import './Editor.css'

interface EditorProps {
  content: string
  onContentChange: (content: string) => void
}

const Editor: React.FC<EditorProps> = ({ content, onContentChange }) => {
  const [feedback, setFeedback] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/editor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          focus_area: 'pacing',
        }),
      })
      const data = await response.json()
      setFeedback(data.feedback)
    } catch (error) {
      setFeedback('Error analyzing text. Make sure backend is running!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="editor-container">
      <div className="editor-main">
        <h2>📝 Manuscript Editor</h2>
        <textarea
          className="editor-textarea"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Paste or type your story here..."
        />
        <button onClick={handleAnalyze} disabled={loading} className="analyze-btn">
          {loading ? '⏳ Analyzing...' : '✨ Get AI Feedback'}
        </button>
      </div>

      <div className="feedback-panel">
        <h3>🤖 AI Feedback</h3>
        {feedback ? (
          <div className="feedback-content">
            <p>{feedback}</p>
          </div>
        ) : (
          <p className="placeholder">Click "Get AI Feedback" to analyze your writing</p>
        )}
      </div>
    </div>
  )
}

export default Editor
