# Issue 4: Load More Pagination

## What
A user can click "Load more" to fetch and append the next batch of results for their current search, backed by real offset-based pagination against PubMed.

## Why
PubMed searches can return thousands of matches; fetching everything up front isn't practical, and simply re-fetching from the start wastes calls against a rate-limited external API.

## Acceptance Criteria
- [ ] `GET /api/search/` accepts a new `offset` param and passes it through to PubMed's esearch `retstart` param
- [ ] `pubmed_service.search()` uses the offset when building the esearch request
- [ ] Frontend shows a "Load more" button below the results when more results exist (based on total count vs. results loaded so far)
- [ ] Clicking "Load more" fetches the next batch using the current query/filters plus the next offset, and appends results to the existing list
- [ ] While fetching the next batch, the "Load more" button shows an inline spinner; already-rendered results are undisturbed (no full-list reload, no layout shift)
- [ ] "Load more" is hidden or disabled once all results have been loaded

## Layers Touched
- [ ] Database — not touched
- [ ] Backend — `GET /api/search/` gains an `offset` query param; `pubmed_service.search()` passes `retstart` to PubMed's esearch call
- [ ] Frontend — "Load more" button and inline spinner, append-to-list logic, offset tracking per active search

## Edge Cases
- Rapid repeated "Load more" clicks → pagination stays user-paced (click-triggered only); relies on the existing backend 429 retry/backoff rather than new client-side throttling
- "Load more" clicked after filters/query changed → not applicable; changing the query/filters starts a new search (offset resets to 0)
- Last page reached (offset + max_results >= total) → "Load more" is hidden or disabled instead of firing a request that returns nothing new

## Blocked By
Issue 1 (needs the base search flow and result list to append to)

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
