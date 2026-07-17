## Skill Shortcuts
- "write tests for <file>" → read .claude/skills/pytest-backend.md and write tests for that file
- "fix failing tests" → read .claude/skills/pytest-fix.md and fix failures using TDD

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
- Pydantic schemas define all request/response shapes
- External API calls go through services — never call them from routers
- Environment variables loaded via pydantic-settings, never hardcoded
- Frontend conventions (component structure, SCSS modules, TypeScript rules,
  folder layout) are canonical in `.claude/skills/4-tdd/fe-standards.md` —
  read that before writing any component, don't duplicate it here

## Collaboration Style

Two modes — pick based on what's being asked.

**Teaching mode** — backend/Python explanations, new concepts, anything learning-related:
- Explain what you're doing and why as you build it — no silent execution
- Use TypeScript analogies for every Python concept (see Developer Context)
- One concept at a time — don't stack explanations
- Lead with the concept name, then one sentence definition, then why it matters
- Side-by-side code comparisons where possible (Python left, TypeScript right)
- Bold the most important word in any explanation
- Flag gotchas explicitly with: ⚠️ GOTCHA:
- Keep prose minimal — bullets over paragraphs
- Never restate what the person already knows

**Quick mode** — everyday snippets, fixes, and frontend work unrelated to learning:
- No conversational filler ("Certainly!", "Here is the code", summaries)
- Plain, direct English — no corporate or academic jargon
- Don't explain obvious logic — only complex algorithmic decisions
- Return only the code, or code + immediate unit tests
- Minimal reproducible snippet for fixes, not the whole file, unless asked
- Long outputs go in an Artifact so they're editable section by section

# CLAUDE.md — ResearchPulse
This file gives Claude Code full context on the ResearchPulse project.
Read this before writing any code or making any decisions.

---

## What This Project Is

ResearchPulse is a full stack biomedical research discovery platform.
Product pitch: "Trending biomedical research, explained in plain English."

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

## Current Priority
Phase 1 (Core search + reading list) is complete, frontend and backend both.
Phase 2 (Trending) is nearly done — citation-velocity rankings, all three
ranking modes, the specialty/mode/time-range filter rail, evidence-tier
badges, rank-movement badges, and the "why it's trending" + reading-list
citation sync are all built and merged.

Completed:
- GET /health ✅
- GET /api/search/ ✅
- GET /api/search/{pmid} ✅
- POST /api/reading-list/ ✅
- GET /api/reading-list/ ✅
- DELETE /api/reading-list/{pmid} ✅
- GET /api/reading-list/citations ✅ (live citation counts, best-effort)
- GET /api/trending/ (modes: trending, most_cited, new_notable) ✅
- GET /api/trending/availability ✅
- Trending page: PubMed-style left filter rail (Mode / Specialty / Time
  Range), mobile hamburger nav ✅
- New & Notable evidence-tier badge ✅
- Rank-movement badges (↑/↓/NEW) ✅
- "Why it's trending" line + reading list crossover ✅ (Trending/Most
  Cited fold the detail into the citation-stat line; New & Notable keeps
  a standalone sentence; both handle the age_days === 0 edge case with
  "so far" / "published this month" wording)

Only open issue in `docs/issues/trending/`: #16 Sticky Specialty/Mode
Selection.

---

## Docs

Detail that doesn't need to load into every conversation lives here —
read the relevant one when the task touches it:

- Tech stack + hosting → `docs/reference/tech-stack.md`
- Architecture diagram → `docs/reference/architecture.md`
- Design direction (palette, typography, spacing, component feel) → `docs/reference/design-direction.md`
- API endpoint status → `docs/reference/api-endpoints.md`
- Phases / roadmap → `docs/reference/roadmap.md`
- Environment variables → `docs/reference/environment.md`
- Frontend conventions, SCSS architecture, folder structure → `.claude/skills/4-tdd/fe-standards.md`
