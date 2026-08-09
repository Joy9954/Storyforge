import React, { useState } from 'react'
import './ContinuityChecker.css'

interface ContinuityCheckerProps {
  content: string
}

interface Issue {
  type: string
  severity: 'critical' | 'warning' | 'info'
  description: string
  suggestion: string
}

const ContinuityChecker: React.FC<ContinuityCheckerProps> = ({ content }) => {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (!content.trim()) {
      alert('Please enter some story content first!')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/v1/continuity/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: 'temp',
          text: content,
        }),
      })
      const data = await response.json()
      setIssues(data)
    } catch (error) {
      console.error(error)
      alert('Error checking continuity. Make sure backend is running!')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#e74c3c'
      case 'warning':
        return '#f39c12'
      case 'info':
        return '#3498db'
      default:
        return '#95a5a6'
    }
  }

  return (
    <div className="continuity-checker">
      <h2>🔍 Continuity Checker</h2>
      <p className="description">Automatically detect inconsistencies in names, dates, and facts</p>

      <button onClick={handleCheck} disabled={loading} className="check-btn">
        {loading ? '⏳ Checking...' : '🔍 Check for Issues'}
      </button>

      <div className="issues-container">
        {issues.length === 0 ? (
          <div className="empty-state">
            <p>✨ No continuity issues found!</p>
            <p className="hint">Or click the button above to analyze your manuscript</p>
          </div>
        ) : (
          <div className="issues-list">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="issue-card"
                style={{ borderLeftColor: getSeverityColor(issue.severity) }}
              >
                <div className="issue-header">
                  <span className="issue-type">{issue.type}</span>
                  <span className="severity" style={{ backgroundColor: getSeverityColor(issue.severity) }}>
                    {issue.severity.toUpperCase()}
                  </span>
                </div>
                <p className="issue-description">{issue.description}</p>
                {issue.suggestion && <p className="suggestion">💡 {issue.suggestion}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContinuityChecker
