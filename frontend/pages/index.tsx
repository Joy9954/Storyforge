import axios from 'axios';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      setFeedback(`Backend is healthy: ${JSON.stringify(response.data)}`);
    } catch (err) {
      setError(`Backend connection failed: ${err}`);
    }
  };

  const analyzeText = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/editor/analyze`);
      setFeedback(response.data.feedback);
      setError('');
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>🚀 Storyforge - AI Manuscript Editor</h1>
      <p>Backend API: {API_URL}</p>
      
      <button onClick={analyzeText} disabled={loading} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        {loading ? 'Analyzing...' : 'Analyze Text'}
      </button>
      
      {feedback && <div style={{ marginTop: '20px', padding: '10px', background: '#e8f5e9', borderRadius: '5px' }}><strong>Feedback:</strong> {feedback}</div>}
      {error && <div style={{ marginTop: '20px', padding: '10px', background: '#ffebee', borderRadius: '5px', color: 'red' }}><strong>Error:</strong> {error}</div>}
    </div>
  );
}
