# Issue 8: Fix Misleading "0 Days" Wording When age_days Is 0

## What
When a trending article was published in the current calendar month, `age_days` computes to `0` (PubMed dates are month-precision only), producing plain-English text like "9 citations in its first 0 days" or "Published 0 days ago" — reads like a data bug even though the underlying citation velocity is accurate.

## Why
Found via developer review of live Trending data: an article showing "9 citations in 0 days" looked wrong at a glance. The velocity number itself is correct given PubMed's precision limit (out of our control), but the wording is fully within our control and currently misleads rather than clarifies — directly undercuts the product's "explained in plain English" pitch.

## Acceptance Criteria
- [x] When `age_days === 0`, Trending mode's citation-stat detail reads "so far" instead of "in its first 0 days" (e.g. "9 citations so far · velocity 4.50")
- [x] When `age_days === 0`, New & Notable's sentence reads "Published this month" instead of "Published 0 days ago" (evidence-tier prefix, if present, unchanged)
- [x] Most Cited is unaffected (its detail is always "overall", never age-based)
- [x] Non-zero `age_days` values are unaffected (existing "in its first N days" / "N days ago" wording unchanged)

## Layers Touched
- [ ] Database — none
- [ ] Backend — none
- [ ] Frontend — `citationDetail` and `whyTrendingSentence` in `frontend/src/utils/format.ts`

## Edge Cases
- `age_days === 0` with no `notable_type` (New & Notable) → "Published this month"
- `age_days === 0` with a `notable_type` (New & Notable) → "<Type> · published this month"
- `age_days === 1` → unaffected, still reads "in its first 1 day" / "published 1 day ago" (singular already handled)

## Blocked By
None — pure wording fix on top of Issue #15's existing `age_days` field.

## Definition of Done
- [x] Tests written and passing
- [x] Red-green verified
- [x] Manually tested in browser

## Implementation Notes

Both `citationDetail` and `whyTrendingSentence` in
`frontend/src/utils/format.ts` now special-case `age_days === 0`:
- Trending: `"so far"` instead of `"in its first 0 days"`
- New & Notable: `"published this month"` instead of `"published 0 days
  ago"` (tiered prefix, e.g. `"Systematic Review · "`, unaffected)
- Most Cited was never age-based (`"overall"` always), so untouched

Non-zero `age_days` paths are unchanged — only the exact-zero branch is
new. 3 new unit tests added to `format.test.ts` (confirmed RED before
implementing, then GREEN). Full frontend suite: 283/283 passing. `tsc
--noEmit` clean. `eslint` clean (aside from the pre-existing unrelated
`jest-globals.d.ts` parsing error).

**Live verification** (Playwright against real dev servers, real data):
the exact article that prompted this issue — a same-month Mediterranean
diet meta-analysis with 9 citations — now reads `"9 citations so far ·
velocity 0.43"` in Trending mode instead of `"9 citations in its first 0
days"`. New & Notable confirmed both `"Systematic Review · published this
month"` (tiered) and `"Published this month"` (untiered) render for
same-month articles, while 16-day-old articles in the same list still
correctly read `"published 16 days ago"`. 0 console errors/warnings.

Suggested commit message:
```
fix: replace misleading "0 days" wording with "so far"/"this month"

PubMed dates are month-precision only, so a same-month trending article
computes age_days = 0, producing text like "9 citations in its first 0
days" that reads like a bug even though the velocity is accurate. Special-
cases age_days === 0 in citationDetail (Trending → "so far") and
whyTrendingSentence (New & Notable → "published this month").

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```
