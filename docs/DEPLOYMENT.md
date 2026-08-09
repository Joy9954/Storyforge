# Deployment Guide

## Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and import your GitHub repo
4. Vercel auto-detects it's a React/Vite project
5. Set environment variable: `VITE_API_URL=https://your-backend-url.com`
6. Click "Deploy" - done!

## Backend Deployment (Render)

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Environment**: Python 3.11
   - **Build command**: `pip install -r backend/requirements.txt`
   - **Start command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`
6. Click "Create Web Service" - done!

## Database Setup

### Option 1: SQLite (Simple, Local)
- Database file stores in project directory
- Push to GitHub (make sure it's in .gitignore for production)
- Works great for hobby projects

### Option 2: Supabase (PostgreSQL, Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy connection string
4. Set `DATABASE_URL` in Render environment variables

## Environment Variables

**Frontend (.env.local)**
```
VITE_API_URL=https://your-backend-render-url.com/api/v1
```

**Backend (Render)**
```
FASTAPI_ENV=production
DEBUG=false
DATABASE_URL=your_database_url
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
CORS_ORIGINS=["https://your-frontend-vercel-url.com"]
```

## Local AI (Ollama)

For free AI without API costs:

1. Install [Ollama](https://ollama.ai)
2. Run: `ollama run mistral`
3. Backend automatically connects to local Ollama

## Connecting Backend & Frontend

When both are deployed:
1. Update frontend CORS origin in backend `.env`
2. Update frontend API URL to point to Render backend
3. Test API calls from browser DevTools
