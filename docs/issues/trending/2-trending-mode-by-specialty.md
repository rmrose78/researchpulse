# Issue 2: Trending — Citation-Velocity Rankings by Specialty

## What
The core differentiator: the `/` landing page where a user picks a clinical specialty and sees biomedical articles ranked by citation velocity, backed by cached Semantic Scholar data.

## Why
This is what makes ResearchPulse different from a plain PubMed search — a credible, specialty-relevant signal for what's gaining traction, not just a keyword match.

## Acceptance Criteria
- [x] Specialty selector with 6 categories: Cardiology, Oncology/Cancer, Infectious Disease, Neurology, Alzheimer's & Dementia, Public Health & Policy — each mapped to an explicit MeSH query string
- [x] `GET /api/trending/` backend endpoint accepts a specialty parameter and returns ranked results for Trending mode
- [x] Trending pool is bounded to articles published in the last 180 days
- [x] Velocity = `citations / (age_days + 14)` — not raw `citations / age_days`
- [x] Semantic Scholar citation data fetched via the **batch** endpoint (`POST /graph/v1/paper/batch`, `PMID:` IDs) — one call per specialty per refresh, never per-article
- [x] Articles with 0 citations excluded from the ranking
- [x] Minimum-results fallback: if a specialty's 180-day pool has too few qualifying (≥1 citation) articles, widen the date window rather than rendering a near-empty page
- [x] Results cached: lazy-computed on first request, TTL ~6-12h, served stale-while-revalidate after expiry (never blocks a request on a live recompute except the very first ever for that specialty)
- [x] Concurrent cold-cache requests for the same specialty are guarded by a per-key single-flight lock — only one computation runs
- [x] A visible "Updated X ago · via Semantic Scholar" freshness indicator always shown, not just on failure
- [x] Results render using `ArticleCard` with an added citation stat (count + velocity)
- [x] `SEMANTIC_SCHOLAR_API_KEY` added via pydantic-settings and to `docs/reference/environment.md`

## Layers Touched
- [x] Database — new `trending_snapshots` table: one row **inserted** per (specialty, mode, computed_at) — never overwritten, so later issues can diff against prior snapshots
- [x] Backend — new `GET /api/trending/` endpoint, new Semantic Scholar service (batch client), new trending ranking service (PubMed pool query + velocity calc + cache read/write + single-flight lock), shared `httpx.AsyncClient` via FastAPI lifespan (fixes the current per-request client creation in `pubmed.py`, needed since trending adds a second external API client)
- [x] Frontend — `/` page (route from Issue 0), specialty selector, `useTrending` hook mirroring `use-search`, `ArticleCard` extended with a `citationStat` prop

## Edge Cases
- Semantic Scholar API failure/rate limit during a refresh → serve last good cached snapshot with its freshness stamp, never a hard error page
- A specialty with almost no citation data yet (e.g. a slow news day for that field) → minimum-results fallback widens the window instead of showing an empty page
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

**Known real-world characteristic, not a bug**: "Public Health & Policy" is
a very broad, high-volume MeSH pairing, and its literature appears to have
materially sparser Semantic Scholar PMID-linkage than the other five
specialties — verified live across several window/pool-size combinations,
including a mature (150+ day old) 600-article sample that still returned
essentially no citation matches. In practice this specialty will show the
"No trending articles found" empty state more often than the others. This
is the PRD's designed fallback behavior working as intended, not a crash —
flagging it since it's a real, testable gap worth a look (narrower/different
MeSH terms, or accepting it) rather than something this session tried to
paper over.
