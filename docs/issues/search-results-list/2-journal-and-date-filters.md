# Issue 2: Journal and Date Filters

## What
A user can narrow their search by journal name and/or a publication date range, in addition to the query text.

## Why
Clinicians and analysts often need to restrict results to a trusted journal or a specific time window rather than scanning everything PubMed returns.

## Acceptance Criteria
- [ ] Search UI includes an optional journal filter input
- [ ] Search UI includes an optional date-range filter (from/to)
- [ ] Submitting a search with filters set passes `journal`, `date_from`, and `date_to` to the existing `GET /api/search/` endpoint (these params already exist on the backend)
- [ ] Submitting with filters cleared behaves identically to Issue 1's unfiltered search
- [ ] Filters persist across a "Load more" fetch of the same search (once Issue 4 is implemented) — for this issue, only initial-search behavior needs to be correct

## Layers Touched
- [ ] Database — not touched
- [ ] Backend — no changes; `journal`, `date_from`, `date_to` params already exist on `GET /api/search/`
- [ ] Frontend — filter inputs added to the SearchBar component, wired into the existing search request

## Edge Cases
- Only one of date_from/date_to set → send as-is; backend already only applies the date filter when both are present
- Filter fields left empty → omitted from the request, identical to Issue 1's base search

## Blocked By
Issue 1 (needs the base SearchBar and results flow to extend)

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
