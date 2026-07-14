# PRD: Trending Research Discovery (Phase 2)

## Problem
Clinicians, health IT analysts, and policy professionals have no way to see which biomedical research is gaining real traction within their specialty — generic citation leaderboards (Semantic Scholar, Altmetric) aren't scoped to clinical relevance, and ResearchPulse currently only supports keyword search. Separately, the reading-list backend built in Phase 1 has never been wired into the frontend, so users have no way to save an article they find.

## Success Criteria
- [ ] User can pick a specialty and a mode (Trending / Most Cited / New & Notable) and see a ranked list of articles for that combination
- [ ] Rankings reflect real citation signal, not a misleading formula — Trending is bounded to recently-published articles with a smoothed velocity calculation, not raw citations/age
- [ ] New & Notable surfaces genuinely new articles despite PubMed's MeSH-indexing lag
- [ ] A specialty/mode combination never renders empty due to a strict citation-count cutoff — a fallback keeps the list populated
- [ ] After the first-ever load of a given specialty/mode, subsequent visits never wait on a live Semantic Scholar computation
- [ ] A visible "Updated X ago" freshness indicator is always shown, not just on failure
- [ ] User can save/remove any article — from search results or Trending — and view all saved articles on a dedicated Reading List page
- [ ] Reading List page shows live, re-fetched citation counts for saved articles
- [ ] Returning users see rank-movement indicators ("↑3" / "NEW") and land back on their last-used specialty

## User Stories
- As a clinician, I want to see what's trending in my specialty so I can stay current without manually searching.
- As a policy professional, I want a plain-English reason a paper is trending, not just a raw citation number.
- As a returning user, I want to see what changed since my last visit so there's a reason to check back.
- As any user, I want to save an article I find — from search or from Trending — and review my saved list later.
- As any user, I want the reading list state (saved/not saved) to be consistent everywhere I see that article.

## Design Direction
Color palette: Deep navy `#0A1628` (primary background), clean white `#F8FAFC` (content background), electric blue `#2973C1` (primary accent/CTA/links), slate gray `#64748B` (secondary text/metadata), success green `#059669`, error red `#DC2626` — per `docs/reference/design-direction.md`.

Typography: Inter (headings weight 600–700, body 400), JetBrains Mono for PMIDs/DOIs.

Visual tone: Clinical credibility meets modern clarity — precise and trustworthy, not playful or corporate. Subtle shadows, 6–8px card radius, generous whitespace, hover states on all interactive elements, 150–200ms ease transitions.

Key interactions:
- Specialty selector + mode segmented-control tabs, both visible at once (structural decision locked; exact visual treatment deferred to a dedicated design pass during `/4-tdd`)
- Bookmark/save toggle on `ArticleCard`, optimistic update with a toast + Undo action rather than a silent flip
- Rank-movement badges ("↑3" / "NEW") on trending cards
- A plain-English "why it's trending" line per card (e.g. "41 citations in its first 90 days"), executing the "explained in plain English" product pitch

Mobile behavior: Not specifically discussed in the interview — follow the responsive patterns already established in `Layout`/`SearchResults`/`ArticleCard`. Flagged under Open Questions.

## UI States
| State | What the user sees |
|-------|-------------------|
| Loading (Trending) | Skeleton cards, reusing the existing `SearchSkeleton` pattern |
| Loading (Reading List) | Skeleton cards, same pattern |
| Empty (Trending) | Reuses `EmptyState` — should be rare given the minimum-results fallback; only occurs if a specialty genuinely has nothing qualifying |
| Empty (Reading List) | Reuses `EmptyState` with copy inviting the user to save an article from search or Trending |
| Error (Trending fetch) | Never a hard error page — last good cached results are served, with the freshness stamp visible (e.g. "Updated 6h ago") so the user knows it's not live |
| Error (save/remove action) | Reuses existing `ErrorState`/retry pattern already used for search failures |
| Success (Trending) | Ranked list renders with citation stat, "why it's trending" line, and rank-movement badge per card |
| Success (save toggle) | Optimistic UI update immediately; toast with Undo confirms the action; a 409 (already saved) is treated as success, not an error |

## Scope

### In Scope
- Trending owns the `/` landing route (it's the differentiator — the developer decided it should be visible on page load rather than behind a click); specialty selector (Cardiology, Oncology/Cancer, Infectious Disease, Neurology, Alzheimer's & Dementia, Public Health & Policy) + mode tabs (Trending, Most Cited, New & Notable). Search is merged into the same `/` page rather than a separate route — Trending shows by default, and a "Search PubMed" toggle reveals the search form in place.
- Backend: `GET /api/trending/` endpoint, PubMed pool query per specialty (MeSH-scoped, hybrid MeSH+keyword for New & Notable to beat indexing lag), Semantic Scholar **batch** citation lookup, cached ranking with stale-while-revalidate + per-key single-flight lock
- Trending pool for the Trending mode bounded to articles published in the last 180 days; velocity = `citations / (age_days + 14)`
- 0-citation articles excluded from Trending/Most Cited, included in New & Notable
- Minimum-results fallback so a specialty/mode never renders empty on a technicality
- Rank-movement badges via an insert-only snapshot table (not overwritten each refresh)
- New `/reading-list` route consuming the existing (Phase 1) reading-list endpoints, plus live re-fetch of citation counts for saved articles
- Existing search flow merged into the `/` landing page behind an in-page "Search PubMed" toggle, behavior otherwise unchanged
- Save/remove toggle added to `ArticleCard`, usable from both Search and Trending
- `react-router` added to the frontend for the two routes (`/`, `/reading-list`)
- Prerequisite backend fix: reading-list router converted to async + logic moved to a service (per CLAUDE.md conventions); fix the import-time-evaluated `saved_at` default in `models/reading_list.py` that currently gives every saved article the same timestamp
- Sticky specialty/mode selection persisted in localStorage

### Out of Scope
- AI plain-English summaries (Phase 3)
- Interactive citation network graph (Phase 4)
- Per-visitor reading-list scoping (anonymous localStorage UUID header) — noted as a future step if this needs to support multiple concurrent real users, not built now
- Final pixel-level visual design of the specialty + mode selector — deferred to a dedicated `/4-tdd` design-iteration pass
- Broader async-SQLAlchemy migration beyond what reading-list/trending need (see Open Questions)

## Data

### Inputs
- Specialty selection (one of the 6 curated categories)
- Mode selection (Trending / Most Cited / New & Notable)
- Save/remove action on a given `pmid`, from either Search or Trending

### Outputs
- Ranked list of articles per specialty/mode: pmid, title, abstract, authors, journal, pub_date, doi (existing `ArticleSearchResult` shape) plus a citation stat (count + computed velocity + plain-English sentence) and a rank-movement badge
- Saved/not-saved state per article, available wherever an `ArticleCard` renders
- Reading List page: all saved articles with live re-fetched citation counts
- Freshness timestamp for the currently-displayed trending data

### Stored
- New `trending_snapshots` table: one row inserted per (specialty, mode) computation, not overwritten, so the prior snapshot can be diffed for rank-movement badges
- Existing `saved_articles` table (Phase 1) — no schema change required beyond fixing the `saved_at` default bug
- New env var: `SEMANTIC_SCHOLAR_API_KEY`

## Edge Cases
- Recent/new specialty pool has mostly 0-citation articles → New & Notable still shows them (recency-based, not citation-gated); Trending/Most Cited fall back to widening the date window rather than rendering empty
- Semantic Scholar API failure or rate limit → serve the last good cached snapshot with its freshness stamp; batch calls (one per specialty per refresh) keep total request volume low enough that rate limiting shouldn't occur in normal operation
- Concurrent first-ever requests for the same specialty/mode (cold cache) → guarded by a per-key single-flight lock so only one computation runs, others wait on that result rather than triggering redundant fetches
- Duplicate save request → existing backend 409 reused, surfaced to the user as success (already saved), not an error
- MeSH indexing lag on very recent articles → New & Notable's query is MeSH-OR-keyword hybrid specifically to avoid missing them

## Open Questions
- Mobile-specific layout behavior for the Trending and Reading List pages was not discussed in the interview — assume existing responsive patterns apply until reviewed during `/4-tdd`
- Exact visual treatment of the specialty + mode selector is deferred to a dedicated design-iteration pass during `/4-tdd`, per the developer's explicit request during grill-me
- Scope of the async-SQLAlchemy migration: the current `database.py` uses a fully synchronous engine/session (`create_engine`, `sessionmaker`). CLAUDE.md requires async route handlers and service methods project-wide. This PRD only requires the reading-list router and new trending code to be properly async — whether to migrate the rest of the backend (search router's DB-free code is unaffected either way) is a separate decision outside this feature's scope
