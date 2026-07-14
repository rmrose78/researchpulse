# Issue 6: Sticky Specialty and Mode Selection

## What
Remember the user's last-selected specialty and mode across visits, so returning to `/trending` lands them back where they left off instead of a default.

## Why
Small detail, but it's what makes a "come back tomorrow" habit feel natural instead of forcing the user to re-select their specialty every visit.

## Acceptance Criteria
- [ ] Last-selected specialty and mode persisted to `localStorage` on change
- [ ] On loading `/trending`, the persisted specialty/mode is restored if present, falling back to a sensible default (e.g. first specialty, Trending mode) on first-ever visit
- [ ] Persisted value is validated against the known specialty/mode lists before use (doesn't crash on a stale/invalid stored value from a prior version)

## Layers Touched
- [ ] Database — none
- [ ] Backend — none
- [ ] Frontend — `useTrending` hook reads/writes `localStorage` for specialty and mode selection

## Edge Cases
- `localStorage` unavailable (private browsing, quota exceeded) → falls back to default selection silently, no crash
- Stored specialty/mode no longer exists (e.g. category list changes in a future release) → falls back to default rather than passing an invalid value to the backend

## Blocked By
Issue 3 (both specialty selector and mode tabs must be fully functional)

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
