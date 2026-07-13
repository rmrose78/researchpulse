# Visual Verification

Run before the pre-commit checklist, in place of a plain eyeball check.

Precondition: dev server running — `cd frontend && npm run dev` (`http://localhost:5173`).

## If a target design screenshot was provided for this component/page

1. View the target screenshot.
2. Use the Playwright MCP tools to navigate to the relevant route and capture
   screenshots at:
   - Mobile — 375px wide
   - Desktop — 1440px wide

   (mobile-first, matching this project's breakpoint convention)
3. Compare the rendered screenshots against both the target image and
   CLAUDE.md's Design Direction section:
   - Palette — navy `#0A1628`, white `#F8FAFC`, electric blue `#2D7DD2`,
     slate `#64748B`, success/error greens/reds
   - Typography — Inter, heading 600–700, body 400
   - Spacing — 4px base scale (4, 8, 12, 16, 24, 32, 48, 64)
   - Radius — 6–8px on cards
   - Shadows — subtle, not flat/heavy
   - Transitions — 150–200ms ease on hover/interactive states

   "Modern sleek" is graded against these concrete tokens, not vibes.
4. Score confidence 0–100%. If under 95%, list concrete gaps, e.g.:
   `spacing is 12px, should be 16px per the spacing scale`
   `accent color is #3B82F6, should be #2D7DD2`
5. Fix the code, re-screenshot, re-compare. Cap at 5 iterations. If still
   under 95% after 5 rounds, stop looping — report the remaining gaps to
   the developer instead of continuing indefinitely.
6. Capture console messages during each pass (feeds the pre-commit
   "no console errors or warnings" item).

## If no target screenshot was supplied

Fall back to the standard manual check — this loop only runs when there's
something concrete to compare against:

```
VISUAL VERIFICATION REQUIRED

URL: http://localhost:5173/<path>

Expected behavior:
- [ ] <what user sees>
- [ ] <what happens on interaction>
- [ ] <edge case behavior>

Keyboard test:
- Tab through page — all interactive elements reachable
- Enter/Space activates buttons

Waiting for your confirmation before committing.
```

## Always

Regardless of automated confidence score, end with the developer
confirmation gate before committing. Never auto-commit — the automated
loop assists iteration, it does not replace human sign-off.
