import { useState } from 'react'
import './App.css'
import Editor from './components/Editor'
import StoryMemory from './components/StoryMemory'
import ContinuityChecker from './components/ContinuityChecker'

function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'memory' | 'continuity'>('editor')
  const [storyContent, setStoryContent] = useState('')

  return (
    <div className="app">
      <header className="header">
        <h1>📖 Storyforge</h1>
        <p>AI-Powered Manuscript Editor</p>
      </header>

      <nav className="nav">
        <button
          className={activeTab === 'editor' ? 'active' : ''}
          onClick={() => setActiveTab('editor')}
        >
          ✍️ Editor
        </button>
        <button
          className={activeTab === 'memory' ? 'active' : ''}
          onClick={() => setActiveTab('memory')}
        >
          🧠 Story Memory
        </button>
        <button
          className={activeTab === 'continuity' ? 'active' : ''}
          onClick={() => setActiveTab('continuity')}
        >
          🔍 Continuity Check
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'editor' && (
          <Editor content={storyContent} onContentChange={setStoryContent} />
        )}
        {activeTab === 'memory' && <StoryMemory content={storyContent} />}
        {activeTab === 'continuity' && <ContinuityChecker content={storyContent} />}
      </main>
    </div>
  )
}

export default App
