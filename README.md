# ResearchPulse 🚧

> Full stack biomedical research discovery platform — actively in development.
> Built with FastAPI, PostgreSQL, and React + TypeScript.

## Status
**Active development** — Phase 1 (Core) in progress

## Tech Stack
- **Frontend:** React + TypeScript + Vite (coming soon)
- **Backend:** FastAPI + Pydantic + SQLAlchemy
- **Database:** PostgreSQL
- **Hosting:** Netlify (frontend) + Railway (backend)

## Features
### Phase 1 — Core (in progress)
- Search PubMed by keyword
- View full article details
- Save articles to a personal reading list

### Phase 2 — Trending (planned)
- Citation velocity algorithm to surface trending research
- Three modes: Trending, Most Cited, New & Notable
- Powered by Semantic Scholar API

### Phase 3 — Citation Network (planned)
- Interactive citation graph
- Related articles

## Running Locally
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
