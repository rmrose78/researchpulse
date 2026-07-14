# Issue 0: Routing Foundation

## What
Add client-side routing so the app has real, navigable pages for Search, Trending, and Reading List instead of one single-view state machine.

## Why
Phase 1 crammed everything into `App.tsx`'s status enum with `SearchResults` swapping in place. Phase 2 adds two genuinely separate pages (Trending, Reading List) that need their own URLs, their own state, and nav entry points — bolting them onto the search state machine would be brittle and clunky.

## Acceptance Criteria
- [ ] `react-router` added as a frontend dependency
- [ ] Three routes exist: `/` (search, current behavior preserved), `/trending`, `/reading-list`
- [ ] `Layout` header has nav links to all three, with an active-route indicator
- [ ] `/trending` and `/reading-list` render placeholder pages for now (real content lands in later issues)
- [ ] Existing search flow at `/` behaves exactly as it does today — no regression

## Layers Touched
- [ ] Database — none
- [ ] Backend — none
- [ ] Frontend — add `react-router`, restructure `App.tsx` to a router, add nav links in `layout.tsx`, add two placeholder page components

## Edge Cases
- Direct navigation to `/trending` or `/reading-list` (not via nav click) → route still renders correctly, no reliance on client-side-only state
- Unknown route → falls back to `/`

## Blocked By
None — independent, first issue in this feature.

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
