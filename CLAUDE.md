## Commands
- Activate venv: `source backend/venv/bin/activate`
- Start backend: `cd backend && uvicorn app.main:app --reload`
- Run tests: `cd backend && pytest tests/ -v`
- Install dependencies: `cd backend && pip install -r requirements.txt`

## Critical Rules
- Never commit .env
- Routers stay thin — all logic goes in services
- Never write raw SQL — SQLAlchemy only
- All route handlers and service methods must be async
- Tests follow AAA structure
- SCSS modules only on frontend — no inline styles, no Tailwind
- Run tests before every commit
  
## Teaching Style
- Explain what you're doing and why as you build it — no silent execution
- Use TypeScript analogies for every Python concept
- One concept at a time — don't stack explanations
- Lead with the concept name, then one sentence definition, then why it matters
- Use code comparisons side by side when possible:
  Python on left, TypeScript equivalent on right
- Bold the most important word in any explanation
- Flag gotchas explicitly with: ⚠️ GOTCHA:
- Keep prose minimal — bullets and short sentences over paragraphs
- If a concept needs a visual, use a simple diagram or flow
- Never explain what the person already knows — no restating the obvious

# CLAUDE.md — ResearchPulse
This file gives Claude Code full context on the ResearchPulse project.
Read this before writing any code or making any decisions.

---

## What This Project Is

ResearchPulse is a full stack biomedical research discovery platform.
Product pitch: "Trending biomedical research, explained in plain English."

PubMed shows you everything. ResearchPulse shows you what matters right
now — and what it means.

Target users: clinicians, health IT analysts, policy professionals —
people who need to act on research, not write it.

Portfolio project targeting health IT and defense contractor roles in
the Fort Meade, Maryland area (Leidos, Booz Allen).

---

## Developer Context

- Biomedical engineering degree — domain knowledge is an asset, use it
- 4 years React/TypeScript experience — frontend is comfortable territory
- Learning Python and FastAPI — explain backend concepts clearly
- Explain Python through TypeScript analogies where helpful:
  - Pydantic models ↔ TypeScript interfaces (but runtime enforced)
  - `self` ↔ `this`
  - `__init__` ↔ constructor
  - f-strings ↔ template literals
  - list comprehensions ↔ `.map()`
  - FastAPI routers ↔ Express routers
  - SQLAlchemy models ↔ Entity classes / DTOs

---

## Tech Stack

### Backend
- Python 3.12.6
- FastAPI + Pydantic V2 + SQLAlchemy
- PostgreSQL 16
- httpx for async HTTP calls to external APIs
- pytest for testing (AAA structure)

### Frontend
- React 19 + TypeScript + Vite 8
- SCSS modules — one `.module.scss` per component, no exceptions
- NO Tailwind — pure SCSS modules only
- Radix UI for accessible primitives (Dialog, etc.)
- Framer Motion for animations
- Jest + React Testing Library for tests

### External APIs
- PubMed NCBI E-utilities — search and article data
- Semantic Scholar — citation counts for velocity algorithm (Phase 2)
- Anthropic API — AI summarization (Phase 3)

### Hosting
- Netlify — frontend
- Railway — backend + PostgreSQL

---

## Architecture
React Frontend (Netlify)

↕

FastAPI Backend (Railway)  ←→  PostgreSQL (Railway)

↕

PubMed API + Semantic Scholar API + Anthropic API

---

## Backend Folder Structure
backend/

├── app/

│   ├── init.py

│   ├── main.py           # FastAPI app, middleware, router registration

│   ├── config.py         # Pydantic settings, reads from .env

│   ├── database.py       # SQLAlchemy engine and session (to be created)

│   ├── routers/          # Route handlers — thin, delegate to services

│   │   ├── init.py

│   │   ├── search.py     # ✅ complete

│   │   └── reading_list.py  # to be created

│   ├── schemas/          # Pydantic request/response models

│   │   ├── init.py

│   │   └── pubmed.py     # ✅ complete

│   ├── services/         # Business logic

│   │   ├── init.py

│   │   └── pubmed.py     # ✅ complete

│   └── models/           # SQLAlchemy database models

│       ├── init.py

│       └── reading_list.py  # to be created

├── tests/

│   ├── init.py

│   ├── test_health.py    # ✅ complete

│   └── test_search.py    # ✅ complete

├── venv/

├── .env                  # never commit

├── .env.example          # commit this

└── requirements.txt

---

## Frontend Folder Structure
frontend/

├── src/

│   ├── components/

│   │   ├── layout/       # Nav, Footer

│   │   ├── sections/     # SearchBar, ArticleList, ArticleDetail

│   │   └── ui/           # Button, Card, Modal — reusable primitives

│   ├── hooks/            # Custom React hooks

│   ├── styles/

│   │   ├── globals.scss

│   │   ├── _variables.scss

│   │   └── _mixins.scss

│   ├── types/            # Shared TypeScript interfaces

│   ├── utils/            # Pure helper functions

│   └── assets/

├── public/

└── vite.config.ts

---

## API Endpoints
GET    /health                      ✅ done

GET    /api/search/                 ✅ done

GET    /api/search/{pmid}           ✅ done

POST   /api/reading-list/           — to be built

GET    /api/reading-list/           — to be built

DELETE /api/reading-list/{pmid}     — to be built

GET    /api/search/{pmid}/summary   — Phase 3

GET    /api/trending/               — Phase 2

---

## Phases

### Phase 1 — Core (in progress)
Search PubMed, view article details, save to reading list.
Not the differentiator — required foundation.

### Phase 2 — Trending (the differentiator)
Citation velocity algorithm: `velocity = total_citations / article_age_in_days`
Three modes: Trending, Most Cited, New & Notable.
Semantic Scholar for citation data. Results cached on backend.

### Phase 3 — AI Summarization (accessibility layer)
Plain-English summaries via Anthropic API.
Feature flagged: `ai_enabled: bool` in config.
Endpoint: `GET /api/search/{pmid}/summary`

### Phase 4 — Citation Network
Interactive citation graph via react-force-graph or D3.js.

---

## Backend Conventions

- Routers are thin — validate input, call service, return response
- Services own all business logic
- Pydantic schemas define all request/response shapes
- SQLAlchemy models define database tables
- All external API calls go through services, never routers
- Environment variables loaded via pydantic-settings, never hardcoded
- Tests follow AAA structure (Arrange, Act, Assert)
- Async everywhere — all service methods and route handlers are async

---

## Frontend Conventions

- SCSS modules — one `.module.scss` file per component
- Class names in camelCase inside modules
- No inline styles ever
- Mobile-first — always min-width media queries, never max-width
- Every `<section>` gets `aria-labelledby`
- Every icon-only button gets `aria-label`
- Animations respect `prefers-reduced-motion`
- Framer Motion variants defined outside components
- Tests follow AAA with React Testing Library
- Never use `any` in TypeScript

---

## SCSS Architecture

### _variables.scss
All design tokens — colors, fonts, spacing, breakpoints, transitions.

### _mixins.scss
Reusable patterns — breakpoints, section padding, visually-hidden.

### Mobile-first pattern
```scss
.element {
  padding: 1rem;           // mobile base
  @include desktop {
    padding: 3rem;         // desktop override
  }
}
```

---

## Environment Variables

### backend/.env (never commit)
PUBMED_API_KEY=your_key_here

DATABASE_URL=postgresql://localhost/researchpulse

ANTHROPIC_API_KEY=your_key_here

AI_ENABLED=false

### frontend/.env (never commit)
VITE_API_URL=http://localhost:8000

---

## Current Priority

Finish Phase 1 backend:
1. Set up PostgreSQL database
2. Create SQLAlchemy database session (database.py)
3. Create SavedArticle model (models/reading_list.py)
4. Create reading list schema (schemas/reading_list.py)
5. Build reading list router (routers/reading_list.py)
6. Write tests for reading list endpoints
7. Then start React frontend