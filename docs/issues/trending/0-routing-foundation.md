# Issue 0: Routing Foundation

## What
Add client-side routing so the app has real, navigable pages instead of one single-view state machine, with a merged Trending + Search landing page at `/` and a separate Reading List page.

## Why
Phase 1 crammed everything into `App.tsx`'s status enum with `SearchResults` swapping in place. Phase 2 adds a genuinely separate page (Reading List) that needs its own URL, state, and nav entry point. Trending is the stated differentiator (`docs/reference/roadmap.md`) and the main reason a user comes back, so it owns `/` rather than sitting behind a nav click. Trending and Search were initially split into two routes (`/` and `/search`), but that was reworked once built: the developer's mental model is that they're genuinely one page — Trending shown by default, with a "Search PubMed" toggle that reveals the search form in place, rather than navigating away. A separate `/search` route/nav link would contradict that.

## Acceptance Criteria
- [ ] `react-router` added as a frontend dependency
- [ ] Two routes exist: `/` (merged Trending + Search landing page — Trending content is a placeholder until Issue 2, Search is the existing flow reachable via an in-page toggle), `/reading-list` (placeholder — real content lands in Issue 1)
- [ ] No standalone `/search` route, redirect, or nav link — search is reached only via the toggle on `/`
- [ ] `Layout` header nav has two explicit links — Trending (`/`), Reading List — plus the brand logo also linking to `/`, so there's always a one-click way back to the landing page from Reading List
- [ ] Active route is indicated via `aria-current`, with a visible (non-color-only) indicator — not text-color alone, per the a11y checklist's "information never conveyed by color alone"
- [ ] The merged page has a three-state view model (`trending` | `search` | `results`): `trending` is the default, a "Search PubMed" toggle moves to `search` (revealing the existing search form, unchanged behavior), submitting moves to `results`, and the results view's back button ("← Back to Trending") returns to `trending`. A collapse-back-to-trending control from the `search` state is deliberately deferred (not built yet) until the UI/UX pass — for now `expandSearch` is one-directional except via a submitted search or the results page's back button
- [ ] `view` state persists verbatim across remounts/refreshes (not derived from `status`) — whichever of the three views the user was looking at is what they see again, since a cached result set existing doesn't mean they were looking at it

## Layers Touched
- [ ] Database — none
- [ ] Backend — none
- [ ] Frontend — add `react-router`, restructure `App.tsx` to a router, update nav links in `layout.tsx`, merge the search flow into `trending-page.tsx` with a search-toggle, add a Reading List placeholder page, extend `use-search.ts`'s `view` state to three values with a persisted (not derived) initial state

## Edge Cases
- Direct navigation to `/reading-list` (not via nav click) → route still renders correctly, no reliance on client-side-only state
- Unknown route → falls back to `/` (the merged landing page)
- Navigating `/` → `/reading-list` → `/` with the search form expanded or results cached → the exact prior view (`trending` | `search` | `results`) reappears immediately, not a reset to the trending default
- Nav link hover/active state must not shift sibling links — any state-dependent style change (e.g. font-weight) that alters an element's box size in a flex row will cause this; use an absolutely-positioned indicator instead

## Blocked By
None — independent, first issue in this feature.

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
