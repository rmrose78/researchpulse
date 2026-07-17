# Issue 0: Netlify + Railway Deploy Readiness

## What
Get the codebase ready for its first real deploy — frontend to Netlify, backend + PostgreSQL to Railway — and actually run that deploy, before starting Phase 3. Nothing has been deployed yet; today the app only runs locally.

## Why
Deploying now (rather than after Phase 3 is built) means any environment/infra surprises get caught against the current, simpler codebase instead of a bigger one. It also means Phase 3 work can be smoke-tested against a real deployed environment as it's built, instead of a big-bang deploy at the end.

## Acceptance Criteria
- [x] `backend/requirements.txt` exists, pinned to current working versions (`fastapi`, `uvicorn`, `SQLAlchemy`, `psycopg2-binary`, `pydantic`, `pydantic-settings`, `httpx`, `python-dotenv`, plus test-only deps split out or noted) — Railway/Nixpacks can't detect or build a Python app without one
  - `requirements-dev.txt` (references `-r requirements.txt`) holds `pytest`/`pytest-asyncio`, split out per the criterion
- [x] CORS `allow_origins` in `backend/app/main.py` reads from a new `Settings` field (e.g. `frontend_url` / `FRONTEND_URL`) instead of the hardcoded `["http://localhost:5173"]`, defaulting to the current localhost value so local dev is unaffected
- [x] `netlify.toml` added at the repo root: build command (`cd frontend && npm run build`), publish directory (`frontend/dist`), and an SPA redirect rule (`/* /index.html 200`) so client-side routing doesn't 404 on refresh
- [x] Railway has a working start command for the backend (uvicorn, reading `PORT` from Railway's injected env var) — via `Procfile`, `railway.toml`, or Railway's own dashboard config, whichever this repo's conventions favor
  - Implemented via `backend/Procfile`
- [x] `backend/.env.example` updated to include `SEMANTIC_SCHOLAR_API_KEY` (currently missing)
  - Was already present; added the new `FRONTEND_URL` var alongside it
- [x] `docs/reference/environment.md` updated to match reality: add the new `FRONTEND_URL`/CORS var, and either remove the not-yet-implemented `ANTHROPIC_API_KEY`/`AI_ENABLED` entries or clearly mark them as "Phase 3, not yet read by the app"
- [x] Decide and document the DB schema strategy for this first deploy: either set up Alembic now, or explicitly keep `Base.metadata.create_all()` for this deploy with a follow-up issue filed for real migrations before Phase 3 adds any schema changes — don't silently ship without a documented decision either way
  - **Decision: keep `Base.metadata.create_all()` for this deploy.** Phase 3 is the first thing that will actually change the schema (new columns/tables for AI summaries), so Alembic is deferred to a follow-up issue filed before that work starts rather than set up speculatively now.
- [x] Netlify site created and connected to this repo; Railway service + PostgreSQL instance created and connected
- [x] End-to-end smoke test passes on the real deployed URLs: Netlify-hosted frontend successfully calls the Railway-hosted backend (trending page loads real data), confirming CORS and env wiring both work outside of localhost

## Acceptance criteria — added during this build
- **Startup resilience to transient Railway private-network blips.** The
  deployed backend crashed twice on `postgres.railway.internal` DNS
  failures — once as a cold-start race (backend importing before
  Postgres's private DNS was ready), once mid-flight after several
  minutes of healthy uptime (Postgres itself stayed up throughout per its
  own logs, so this was a network blip, not a DB outage). Added
  `create_tables_with_retry()` (bounded retry with delay) and
  `initialize_database()` (longer retry budget, logs and continues
  instead of crash-looping the container if it's still exhausted — the
  schema already exists from the first successful boot) in
  `backend/app/database.py`, plus `pool_pre_ping=True` on the engine so
  the connection pool recovers from dropped connections during normal
  request handling. — why: discovered live, during this issue's own
  deploy, not anticipated in the original acceptance criteria.

## Layers Touched
- [x] Database — schema-strategy decision (see above); no new tables. Also
      added retry/resilience around the existing `create_all()` call (see
      "added during this build" above)
- [x] Backend — `requirements.txt`, CORS config now settings-driven, start
      command for Railway, `.env.example` update, DB connection retry/resilience
- [x] Frontend — `netlify.toml`, `VITE_API_URL` set in Netlify's env settings
      (no code changes needed — `frontend/src/utils/env.ts` already funneled
      every API call through one constant)

## Edge Cases
- Netlify build succeeds locally (`npm run build`) but fails on Netlify's build image due to Node version mismatch → pin Node version for Netlify (repo already has `frontend/.nvmrc` at `22.22.3`; confirm Netlify respects it or set `NODE_VERSION` in `netlify.toml`)
- Client-side route refresh (e.g. reloading `/reading-list` directly) 404s on Netlify without the SPA redirect rule
- CORS default must still allow `http://localhost:5173` so local dev isn't broken by this change
- Railway's injected `PORT` env var must be honored by the start command — hardcoding `8000` will fail Railway's health check
- Secrets: `PUBMED_API_KEY`, `SEMANTIC_SCHOLAR_API_KEY`, `DATABASE_URL` are backend-only and go in Railway's env settings, never in Netlify (Netlify only needs `VITE_API_URL`, which is not a secret)

## Blocked By
None — independent of Phase 3. Should land before Phase 3 work starts.

## Definition of Done
- [x] Tests written and passing (CORS config change gets a test; DB retry/
      resilience logic added mid-build also gets tests — 127 total passing)
- [x] Red-green verified
- [x] Live smoke test on the deployed Netlify + Railway URLs, not just local
      — confirmed working
