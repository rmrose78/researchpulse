# Issue 2: Trending — Citation-Velocity Rankings by Specialty

## What
The core differentiator: the `/` landing page where a user picks a clinical specialty and sees biomedical articles ranked by citation velocity, backed by cached Semantic Scholar data.

## Why
This is what makes ResearchPulse different from a plain PubMed search — a credible, specialty-relevant signal for what's gaining traction, not just a keyword match.

## Acceptance Criteria
- [ ] Specialty selector with 6 categories: Cardiology, Oncology/Cancer, Infectious Disease, Neurology, Alzheimer's & Dementia, Public Health & Policy — each mapped to an explicit MeSH query string
- [ ] `GET /api/trending/` backend endpoint accepts a specialty parameter and returns ranked results for Trending mode
- [ ] Trending pool is bounded to articles published in the last 180 days
- [ ] Velocity = `citations / (age_days + 14)` — not raw `citations / age_days`
- [ ] Semantic Scholar citation data fetched via the **batch** endpoint (`POST /graph/v1/paper/batch`, `PMID:` IDs) — one call per specialty per refresh, never per-article
- [ ] Articles with 0 citations excluded from the ranking
- [ ] Minimum-results fallback: if a specialty's 180-day pool has too few qualifying (≥1 citation) articles, widen the date window rather than rendering a near-empty page
- [ ] Results cached: lazy-computed on first request, TTL ~6-12h, served stale-while-revalidate after expiry (never blocks a request on a live recompute except the very first ever for that specialty)
- [ ] Concurrent cold-cache requests for the same specialty are guarded by a per-key single-flight lock — only one computation runs
- [ ] A visible "Updated X ago · via Semantic Scholar" freshness indicator always shown, not just on failure
- [ ] Results render using `ArticleCard` with an added citation stat (count + velocity)
- [ ] `SEMANTIC_SCHOLAR_API_KEY` added via pydantic-settings and to `docs/reference/environment.md`

## Layers Touched
- [ ] Database — new `trending_snapshots` table: one row **inserted** per (specialty, mode, computed_at) — never overwritten, so later issues can diff against prior snapshots
- [ ] Backend — new `GET /api/trending/` endpoint, new Semantic Scholar service (batch client), new trending ranking service (PubMed pool query + velocity calc + cache read/write + single-flight lock), shared `httpx.AsyncClient` via FastAPI lifespan (fixes the current per-request client creation in `pubmed.py`, needed since trending adds a second external API client)
- [ ] Frontend — `/` page (route from Issue 0), specialty selector, `useTrending` hook mirroring `use-search`, `ArticleCard` extended with a `citationStat` prop

## Edge Cases
- Semantic Scholar API failure/rate limit during a refresh → serve last good cached snapshot with its freshness stamp, never a hard error page
- A specialty with almost no citation data yet (e.g. a slow news day for that field) → minimum-results fallback widens the window instead of showing an empty page
- PubMed returns duplicate or malformed entries in the pool → excluded from ranking rather than crashing the computation

## Blocked By
Issue 0 (routing foundation — needs the `/` route to exist and to already render the Trending placeholder)

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
