# Issue 3: Trending — Most Cited and New & Notable Modes

## What
Add the remaining two modes — Most Cited and New & Notable — with a segmented-control tab switcher alongside the existing specialty selector.

## Why
Citation velocity alone doesn't cover every use case: sometimes a user wants the all-time most-cited work in a specialty, or wants to catch genuinely brand-new papers before they've accumulated citations at all.

## Acceptance Criteria
- [ ] Segmented-control tabs for Trending / Most Cited / New & Notable, alongside the specialty selector from Issue 2
- [ ] Most Cited: same specialty pool, sorted by raw total citation count, no date/age bound, no velocity calculation
- [ ] New & Notable: recency-sorted, and — because PubMed doesn't assign MeSH terms for weeks after publication — uses a hybrid MeSH-OR-title/abstract-keyword query so genuinely new articles aren't systematically missed
- [ ] New & Notable includes 0-citation articles (recency is the point, not citation count)
- [ ] Each mode's results cached independently in `trending_snapshots` (same table/mechanism as Issue 2, keyed by mode as well as specialty)
- [ ] Switching modes updates the URL/state so the combination is shareable/bookmarkable within the session

## Layers Touched
- [ ] Database — no new tables; `trending_snapshots` rows now written for all 3 modes, not just Trending
- [ ] Backend — `GET /api/trending/` accepts a mode parameter; Most Cited and New & Notable query/ranking logic added to the trending service from Issue 2
- [ ] Frontend — mode segmented-control component, `useTrending` hook extended to track mode alongside specialty

## Edge Cases
- New & Notable's hybrid query still returns too few results for a niche specialty → same minimum-results fallback pattern as Issue 2 (widen the recency window)
- User switches modes rapidly → each mode's cache is independent, no cross-contamination; in-flight requests for an abandoned mode are safe to let complete and cache (not cancelled)

## Blocked By
Issue 2 (Trending mode + caching infrastructure must exist first)

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
