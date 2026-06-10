# ResearchPulse

> Full stack biomedical research discovery platform — actively in development.
> Built with FastAPI, PostgreSQL, and React + TypeScript.

## The Problem
PubMed indexes 35+ million biomedical articles. Finding what's actually relevant — and understanding it — is the real challenge. ResearchPulse surfaces trending research using citation velocity and explains it in plain English for clinicians, health IT analysts, and policy professionals who need to act on resea rch, not just find it.

## Status
**Active development** — Phase 1 (Core) in progress

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** FastAPI + Pydantic + SQLAlchemy
- **Database:** PostgreSQL
- **Hosting:** Netlify (frontend) + Railway (backend)
- **External APIs:** PubMed NCBI E-utilities, Semantic Scholar (Phase 2)

## Features
### Phase 1 — Core (in progress)
- Search PubMed by keyword with date and journal filters
- View full article details including MeSH terms and keywords
- Save articles to a personal reading list

### Phase 2 — Trending (planned)
- Citation velocity algorithm to surface trending research
- Three modes: Trending, Most Cited, New & Notable
- Powered by Semantic Scholar API
- Results cached on the backend to minimize API calls

### Phase 3 — AI Summarization (planned)
- Plain-English summaries of article abstracts
- Powered by Anthropic API
- Targeted at non-researcher audiences

### Phase 4 — Citation Network (planned)
- Interactive citation graph
- Related articles via react-force-graph or D3.js

## Architecture
React Frontend (Netlify)
↕
FastAPI Backend (Railway)  ←→  PostgreSQL (Railway)
↕
PubMed API + Semantic Scholar API

## API Endpoints
GET  /health                    — health check
GET  /api/search/               — search PubMed by keyword
GET  /api/search/{pmid}         — get full article detail
POST /api/reading-list/         — save article to reading list
GET  /api/reading-list/         — get saved articles
DELETE /api/reading-list/{pmid} — remove saved article

## Running Locally

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
### Environment Variables
Create a `.env` file in `backend/`:

PUBMED_API_KEY=your_key_here
DATABASE_URL=postgresql://localhost/researchpulse

### Running Tests
```bash
pytest tests/ -v
```

## Background
Built as a portfolio project by a biomedical engineer with 4 years of frontend experience learning Python and FastAPI. Targeting health IT and defense contractor roles in the Fort Meade, Maryland area.