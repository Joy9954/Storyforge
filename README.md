# Storyforge

An AI-powered manuscript editor for personal creative writing. Features story memory, developmental editing, and automatic continuity checking.

## Features

- **Story Memory**: Track characters, plot points, locations, and timeline
- **Developmental Editing**: AI-powered feedback on pacing, tone, and structure
- **Continuity Checker**: Automatic detection of inconsistencies in names, dates, and facts
- **Manuscript Editor**: Upload and edit manuscripts with real-time AI assistance

## Tech Stack

- **Frontend**: React + TypeScript (Vercel)
- **Backend**: Python FastAPI (Render)
- **Database**: SQLite
- **AI**: Ollama (local) or Claude API (optional)

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload
```

Server runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Deployment

- **Frontend**: Push to GitHub → Auto-deploys on Vercel
- **Backend**: Push to GitHub → Deploy on Render free tier
- **Database**: SQLite stored in repo (with .gitignore for sensitive files)

## Project Structure

```
Storyforge/
├── backend/           # FastAPI server
├── frontend/          # React app
├── docs/              # Documentation
└── README.md
```

## Next Steps

1. Set up local development (backend + frontend)
2. Build story memory system
3. Integrate AI for editing feedback
4. Add continuity checking
5. Deploy to Vercel + Render

## License

MIT
