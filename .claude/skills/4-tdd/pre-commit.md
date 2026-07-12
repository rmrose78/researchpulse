# Pre-Commit Checklist

Run through every item before committing. Do not commit if any item fails.

## All Changes
- [ ] Tests pass — `pytest tests/ -v` (backend) or `npm test` (frontend)
- [ ] No console errors or warnings
- [ ] .env not staged — run `git status` and confirm

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