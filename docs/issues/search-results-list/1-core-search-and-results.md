# Issue 1: Core Search and Results List

## What
A user can type a query into a search box, submit it explicitly, and see the matching PubMed articles rendered as result cards — including proper loading, empty, and error states.

## Why
This is the foundation of the product pitch: without a working search-to-results flow, nothing else (filters, pagination, detail view) has anything to attach to.

## Acceptance Criteria
- [ ] Search box accepts a text query; submit only happens on Enter or a Search button click (no live/debounced search)
- [ ] Query under 2 characters is blocked client-side with an inline validation message and is never sent to the backend
- [ ] On submit, the existing `GET /api/search/` endpoint is called and results render as cards
- [ ] Each card shows: title, a truncated abstract snippet, and a secondary metadata line (authors, journal, pub date)
- [ ] While the request is in flight, skeleton placeholder cards render in place of results
- [ ] Zero results shows a friendly empty state: "No results found for '{query}' — try a different search term"
- [ ] A backend failure (502) shows a distinct error state with a retry action that re-submits the same query

## Layers Touched
- [ ] Database — not touched, this feature persists nothing
- [ ] Backend — no changes; consumes existing `GET /api/search/` endpoint as-is
- [ ] Frontend — new SearchBar component (query input + submit + client-side validation), new ArticleList/ArticleCard components, skeleton loading component, empty-state and error-state components

## Edge Cases
- Query under 2 characters → inline validation message, submit blocked
- Zero results → empty state, not treated as an error
- PubMed/backend 502 → distinct error state with retry button, retry re-runs the exact same request

## Blocked By
None — this is the foundational slice.

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
