# Local Development Setup

## Prerequisites

- Python 3.9+
- Node.js 18+
- Git
- Optional: Ollama (for free AI)

## Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run development server
python -m uvicorn app.main:app --reload
```

Server will be running at `http://localhost:8000`
- API docs: `http://localhost:8000/docs` (interactive Swagger UI)
- ReDoc: `http://localhost:8000/redoc`

## Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App will open at `http://localhost:5173`

## Optional: Local AI with Ollama

For free AI without API costs:

```bash
# Install Ollama from https://ollama.ai

# Run Ollama service (in another terminal)
ollama serve

# Pull a model
ollama pull mistral

# Backend will automatically use local Ollama at localhost:11434
```

Popular free models:
- `mistral` - Fast, good quality
- `neural-chat` - Optimized for chat
- `llama2` - More powerful but slower

## Project Structure

```
Storyforge/
├── backend/
│   ├── app/
│   │   ├── main.py              # Entry point
│   │   ├── core/                # Config, settings
│   │   ├── api/                 # API endpoints
│   │   │   └── endpoints/       # Route handlers
│   │   ├── services/            # Business logic (future)
│   │   └── models/              # Data models (future)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── App.tsx              # Main app
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── SETUP.md                 # This file
│   └── DEPLOYMENT.md            # Deployment guide
└── README.md
```

## Testing the Setup

### Backend
```bash
# With backend running at localhost:8000
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

### Frontend to Backend Communication
1. Open `http://localhost:5173`
2. Go to Editor tab
3. Paste some text
4. Click "Get AI Feedback"
5. Should see response from backend

## Troubleshooting

**Backend won't start:**
- Check Python version: `python --version` (need 3.9+)
- Check virtual environment is activated
- Try: `pip install -r requirements.txt` again

**Frontend won't connect to backend:**
- Check both servers are running
- Check backend is on `localhost:8000`
- Open browser console for CORS errors
- Check `vite.config.ts` proxy settings

**Ollama connection failed:**
- Make sure Ollama is running: `ollama serve`
- Check `.env` has `OLLAMA_BASE_URL=http://localhost:11434`
- Try: `curl http://localhost:11434/api/tags`

## Next Steps

1. ✅ Get local setup working
2. 📝 Add sample story to test
3. 🧠 Implement story memory features
4. 🔍 Build continuity checking
5. 🚀 Deploy to Vercel + Render
