# Issue 0: Frontend Foundation

## What
Scaffold the React frontend with Vite, SCSS architecture, layout
components, and API client so all feature issues have a working
base to build on.

## Why
Without a foundation — folder structure, design tokens, layout,
and API client — every feature issue starts from scratch and has
nowhere to attach. This is the prerequisite for all other issues.

## Acceptance Criteria
- [ ] Vite 8 + React 19 + TypeScript scaffolded and running on localhost:5173
- [ ] Default Vite boilerplate completely removed
- [ ] SCSS architecture in place — `_variables.scss`, `_mixins.scss`, `globals.scss` with design tokens defined
- [ ] Layout component renders with accessible Nav (skip link, landmark regions) and main content area
- [ ] API client configured pointing to `VITE_API_URL` from `.env`
- [ ] Frontend `.env` created with `VITE_API_URL=http://localhost:8000`
- [ ] App renders a clean, modern shell — not blank, not default Vite
- [ ] Section 508 base requirements met — skip link, landmark roles, focus-visible styles

## Layers Touched
- [ ] Database — not touched
- [ ] Backend — not touched
- [ ] Frontend — entire frontend scaffold, SCSS architecture, layout, API client

## Edge Cases
- VITE_API_URL missing from .env → API client throws a clear error at startup, not a silent undefined

## Blocked By
None — this runs before all other issues.

## Definition of Done
- [ ] `npm run dev` shows a clean modern layout at localhost:5173
- [ ] No default Vite boilerplate visible anywhere
- [ ] SCSS variables importable in any component
- [ ] Skip link visible on keyboard focus
- [ ] Nav and main landmark regions present in DOM
- [ ] API client exported and ready to use
- [ ] Manually verified in browser