# Issue 2: Trending — Citation-Velocity Rankings by Specialty

## What
The core differentiator: the `/` landing page where a user picks a clinical specialty and sees biomedical articles ranked by citation velocity, backed by cached Semantic Scholar data.

## Why
This is what makes ResearchPulse different from a plain PubMed search — a credible, specialty-relevant signal for what's gaining traction, not just a keyword match.

## Acceptance Criteria
- [x] Specialty selector with 6 categories: Cardiology, Oncology/Cancer, Infectious Disease, Neurology, Alzheimer's & Dementia, Public Health & Policy — each mapped to an explicit MeSH query string
- [x] `GET /api/trending/` backend endpoint accepts a specialty parameter and returns ranked results for Trending mode
- [x] Trending pool bounded to a **user-selectable time range** — 60 days / 6 months / 1 year / 2 years, defaulting to 1 year (superseded from the original fixed "last 180 days" — see Follow-up below)
- [x] Velocity = `citations / (age_days + 14)` — not raw `citations / age_days`
- [x] Semantic Scholar citation data fetched via the **batch** endpoint (`POST /graph/v1/paper/batch`, `PMID:` IDs) — one call per (specialty, time range) computation, never per-article
- [x] Articles with 0 citations excluded from the ranking
- [x] Results cached: lazy-computed on first request per (specialty, time range), TTL 8h, served stale-while-revalidate after expiry (never blocks a request on a live recompute except the very first ever for that combination)
- [x] Concurrent cold-cache requests for the same (specialty, time range) are guarded by a per-key single-flight lock — only one computation runs
- [x] A visible "Updated X ago · via Semantic Scholar" freshness indicator always shown, not just on failure
- [x] Results render using `ArticleCard` with an added citation stat (count + velocity)
- [x] `SEMANTIC_SCHOLAR_API_KEY` added via pydantic-settings and to `docs/reference/environment.md`

## Layers Touched
- [x] Database — new `trending_snapshots` table: one row **inserted** per (specialty, mode, window_days, computed_at) — never overwritten, so later issues can diff against prior snapshots
- [x] Backend — new `GET /api/trending/` endpoint, new `GET /api/trending/availability` cache-only endpoint, new Semantic Scholar service (batch client), new trending ranking service (multi-slice PubMed pool sampling + velocity calc + cache read/write + single-flight lock), shared `httpx.AsyncClient` via FastAPI lifespan (fixes the current per-request client creation in `pubmed.py`, needed since trending adds a second external API client)
- [x] Frontend — `/` page (route from Issue 0), specialty selector, time-range selector, `useTrending` hook mirroring `use-search`, `ArticleCard` extended with a `citationStat` prop

## Edge Cases
- Semantic Scholar API failure/rate limit during a refresh → serve last good cached snapshot with its freshness stamp, never a hard error page
- A specialty genuinely thin at the user's selected time range → shows the empty state with a "try a wider range" hint; no silent widening past what the user picked
- A specialty pill already known (from cache) to be empty at the current time range is greyed out and disabled — determined from cached data only, never a live check across all 6 specialties, to avoid bursting Semantic Scholar calls on every range change
- PubMed returns duplicate or malformed entries in the pool → excluded from ranking rather than crashing the computation

## Blocked By
Issue 0 (routing foundation — needs the `/` route to exist and to already render the Trending placeholder)

## Definition of Done
- [x] Tests written and passing
- [x] Red-green verified
- [x] Manually tested in browser

## Implementation Notes

**PubMed pool sizing**: `POOL_SIZE = 200` (not a smaller number) — within a
recency-bounded pool, only a small fraction of articles have accrued any
citations yet, so a thin pool starves the ranking before the min-results
fallback even gets a chance to help. 200 is also the practical ceiling
before `pubmed.py`'s GET-based `efetch` call hits a URL-length limit (414)
on the id list — going bigger would require chunking `efetch` into multiple
calls, which felt like scope creep for this issue.

**Two real bugs found via live testing, not caught by mocked unit tests**:
1. Semantic Scholar's batch response nests a PubMed id under
   `externalIds.PubMed`, not `externalIds.PMID` (the `PMID:` string is only
   the *request-side* id prefix). My first unit tests baked in the wrong
   key in their own mocks, so they passed against a service that returned
   `{}` for every real call — the router-level "real specialty" test also
   passed vacuously, since `for article in []: assert ...` never runs. Fixed
   the key, corrected the tests to match the real response shape, and
   tightened the router test to assert `len(results) > 0`.
2. A single empty/malformed PMID in a batch — or a batch where Semantic
   Scholar recognizes none of the ids — makes the endpoint reject the
   *whole* batch with a 400 (`"No valid paper ids given"`) instead of
   returning nulls for the unmatched ones. Now filtered/handled explicitly
   instead of surfacing as a hard failure.

## Follow-up: User-Selectable Time Range (post-ship fix)

Shortly after shipping, several specialty sections were reported showing
few or no articles. Root cause: the original "minimum-results fallback"
(widen 180 days → 365 days) only pushed the date range's far boundary
back while still asking PubMed for newest-first results — since `esearch`
always returns most-recent-first, "widening the window" fetched the
*exact same* top-200-most-recent articles regardless of window size. Most
of those are too fresh to have any Semantic Scholar citation linkage yet.

This was fixed and, in discussion with the developer, turned into a real
feature rather than an invisible tuning change:
- The time range is now a **visible dropdown** (60 days / 6 months / 1
  year / 2 years, default 1 year) rather than an automatic backend
  fallback. Switching it never happens silently — whatever the user picks
  is exactly what gets queried.
- **Pool sampling now spans the whole selected window** instead of just
  its newest slice: the range is split into ~90-day slices, and articles
  are sampled from each one before being combined into a single Semantic
  Scholar batch call (call volume is unchanged — this only changes which
  ids go into the same one call).
- The cache key (`trending_snapshots`) now includes `window_days`, so each
  (specialty, time range) pair is cached independently.
- A new cache-only `GET /api/trending/availability` endpoint reports which
  specialties are already *known* (from a prior cached computation) to be
  empty at the current range, so the frontend can grey those pills out —
  without ever proactively checking all 6 specialties live, which would
  risk bursting Semantic Scholar's rate limit on every range change.

**Correcting the earlier note above**: "Public Health & Policy" was
*not* actually a specialty with sparse Semantic Scholar coverage — that
conclusion was drawn while the newest-first sampling bug was still
present. Once sampling was fixed to span the full window, this specialty
returned 22 qualifying articles at the 1-year range (up from ~0-1 under
the old, buggy sampling). The earlier finding was an artifact of the bug,
not a real characteristic of the literature.
