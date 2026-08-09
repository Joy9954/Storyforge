import React, { useState } from 'react'
import './StoryMemory.css'

interface StoryMemoryProps {
  content: string
}

interface Character {
  name: string
  description: string
  traits: string[]
}

const StoryMemory: React.FC<StoryMemoryProps> = ({ content }) => {
  const [characters, setCharacters] = useState<Character[]>([])
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '' })

  const addCharacter = () => {
    if (newCharacter.name.trim()) {
      setCharacters([...characters, { ...newCharacter, traits: [] }])
      setNewCharacter({ name: '', description: '' })
    }
  }

  return (
    <div className="story-memory">
      <h2>🧠 Story Memory</h2>
      <p className="description">Track characters, locations, plot points, and timeline events</p>

      <div className="memory-sections">
        <div className="section">
          <h3>👥 Characters</h3>
          <div className="character-form">
            <input
              type="text"
              placeholder="Character name"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              value={newCharacter.description}
              onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
            />
            <button onClick={addCharacter}>Add Character</button>
          </div>

          <div className="characters-list">
            {characters.length === 0 ? (
              <p className="empty">No characters yet. Add one to get started!</p>
            ) : (
              characters.map((char, idx) => (
                <div key={idx} className="character-card">
                  <h4>{char.name}</h4>
                  <p>{char.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h3>📍 Locations</h3>
          <p className="placeholder">Locations and world-building details coming soon</p>
        </div>

        <div className="section">
          <h3>📌 Plot Points</h3>
          <p className="placeholder">Track major story events and plot developments</p>
        </div>

        <div className="section">
          <h3>⏱️ Timeline</h3>
          <p className="placeholder">Track chronology and time-related consistency</p>
        </div>
      </div>
    </div>
  )
}

export default StoryMemory
