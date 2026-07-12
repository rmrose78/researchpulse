# ResearchPulse

> Full stack biomedical research discovery platform — actively in development.
> Built with FastAPI, PostgreSQL, and React + TypeScript.

## The Problem
PubMed indexes 35+ million biomedical articles. Finding what's actually
relevant — and understanding it — is the real challenge. ResearchPulse
surfaces trending research using citation velocity and explains it in
plain English for clinicians, health IT analysts, and policy professionals
who need to act on research, not just find it.

## Status
**Active development** — Phase 1 (Core) complete, frontend in progress

## Tech Stack
- **Frontend:** React 19 + TypeScript + Vite 8
- **Backend:** FastAPI + Pydantic V2 + SQLAlchemy
- **Database:** PostgreSQL 16
- **Hosting:** Netlify (frontend) + Railway (backend)
- **External APIs:** PubMed NCBI E-utilities, Semantic Scholar (Phase 2), Anthropic API (Phase 3)

## Features
### Phase 1 — Core (complete)
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
PubMed API + Semantic Scholar API + Anthropic API

## AI-Assisted Development Workflow

This project uses Claude Code CLI with a custom skill workflow modeled
after structured AI engineering practices. Rather than vibe coding,
every feature follows a disciplined pipeline:
/grill-me    → AI interviews developer about feature requirements
before any code is written
/to-prd      → converts interview into a Product Requirements Document
/to-issues   → breaks PRD into vertical slice GitHub Issues
/tdd         → implements each issue using red-green-refactor TDD

**Vertical slices** — each issue cuts through all layers (database,
backend, frontend) and delivers something visible and testable. No
horizontal slicing.

**Custom skills** live in `.claude/skills/workflow-v1/` and are designed
to work in air-gapped environments — plain markdown files with no
external dependencies.

## API Endpoints
GET    /health                    — health check
GET    /api/search/               — search PubMed by keyword
GET    /api/search/{pmid}         — get full article detail
POST   /api/reading-list/         — save article to reading list
GET    /api/reading-list/         — get saved articles
DELETE /api/reading-list/{pmid}   — remove saved article

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
Copy `.env.example` to `.env` in `backend/` and fill in your values:
PUBMED_API_KEY=your_key_here
DATABASE_URL=postgresql://localhost/researchpulse
ANTHROPIC_API_KEY=your_key_here
AI_ENABLED=false

### Running Tests
```bash
cd backend && pytest tests/ -v
```

## Background
Built as a portfolio project by a biomedical engineer with 4 years of
frontend experience, learning Python and FastAPI. Targeting health IT
and defense contractor roles in the Fort Meade, Maryland area.

Demonstrates: full stack development, external API integration,
PostgreSQL persistence, AI-assisted engineering workflow, and
domain expertise in biomedical research.