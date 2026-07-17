# Pre-Commit Checklist

Run through every item before committing. Do not commit if any item fails.

## All Changes
- [ ] Tests pass — `pytest tests/ -v` (backend)
- [ ] For frontend changes: run these checks in parallel (one message,
      multiple Task/subagent calls) since they're independent of each other —
      then merge all results into one pass/fail report before continuing:
      1. `npm run build` (catches TypeScript errors `npm test` won't —
         e.g. stray/stale files with outdated prop types)
      2. `npm test` (jest + jest-axe, jsdom)
- [ ] visual-verification.md already ran earlier in the tdd flow (step 8) —
      don't re-run a Playwright browser audit here, it's the same routes,
      same accessibility-tree snapshot, and same console messages already
      captured there
- [ ] No console errors or warnings (from the console messages captured
      during visual-verification.md)
- [ ] .env not staged — run `git status` and confirm
- [ ] `CLAUDE.md`, `docs/reference/*.md`, and `README.md` reflect this
      issue's outcome — update "Current Priority" (CLAUDE.md), the
      endpoint list (`docs/reference/api-endpoints.md` + README), and the
      feature/roadmap list (`docs/reference/roadmap.md` + README) if this
      issue added, changed, or closed out anything they currently
      describe. Skip if nothing in those docs is now stale — don't edit
      just to edit

## Backend Only
- [ ] New endpoints have tests
- [ ] Tests follow AAA structure
- [ ] Red-green verified — test was seen failing before passing
- [ ] No raw SQL — SQLAlchemy only
- [ ] Router is thin — logic is in service not router

## Frontend Only
- [ ] a11y-checklist.md completed — all items pass
- [ ] Every new component with rendered markup has a jest-axe test (`expect(await axe(container)).toHaveNoViolations()`), with one axe assertion per meaningfully distinct render state (loading, empty, error, success, expanded/collapsed, etc.) — not just the default render
- [ ] Developer confirmed visual verification
- [ ] SCSS module exists for every new component
- [ ] No inline styles
- [ ] No Tailwind classes
- [ ] No `any` in TypeScript
- [ ] All async states handled — loading, empty, error, success
- [ ] Framer Motion variants defined outside components
- [ ] `prefers-reduced-motion` respected on all animations
- [ ] API calls go through `src/utils/api.ts` — no direct fetch in components

## Git
- [ ] Commit message follows format:
      `feat: <what>` or `fix: <what>` or `chore: <what>`
- [ ] Only files related to this issue are staged
- [ ] Branch is up to date with main