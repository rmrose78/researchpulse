# Issue 5: "Why It's Trending" Line + Reading List Crossover

## What
Add a plain-English sentence explaining each trending article's citation traction, wire the save toggle into trending cards, and show live re-fetched citation counts on the Reading List page.

## Why
Directly executes the product pitch — "trending biomedical research, explained in plain English" — rather than leaving users to interpret a raw citation-velocity number. Tying the reading list to trending data (badge already-saved articles, show live citation growth for saved ones) connects the two halves of this phase into one coherent feature.

## Acceptance Criteria
- [x] Each trending card shows a one-line plain-English elaboration computed from data already fetched (e.g. "41 citations in its first 90 days") — no extra API calls beyond what Issue 2 already fetches. In Trending/Most Cited this is folded into the existing citation-stat line rather than a parallel sentence (see Implementation Notes) — New & Notable keeps a standalone sentence since its signal never repeats the citation count.
- [x] Save/remove toggle (from Issue 1) is available on trending cards, not just search results
- [x] Trending cards for articles already in the user's reading list show a saved-state indicator
- [x] The Reading List page (from Issue 1) re-fetches live citation counts for all saved articles via one Semantic Scholar batch call, so saved articles visibly reflect current citation counts rather than a stale snapshot from when they were saved

## Layers Touched
- [x] Database — none
- [x] Backend — new `GET /api/reading-list/citations` endpoint batches saved PMIDs through the existing Semantic Scholar batch client from Issue 2 to get live citation counts
- [x] Frontend — "why it's trending" sentence rendering on `ArticleCard`, saved-state indicator on trending cards, Reading List page updated to show live citation counts

## Edge Cases
- Reading list has an article Semantic Scholar has no data for → citation count simply not shown for that card, not an error
- User has a large reading list → batch call still respects the 500-ID batch endpoint limit (chunk if ever needed, though unlikely at portfolio-project scale)

## Blocked By
Issue 1 (save mechanism must exist), Issue 2 (trending cards + Semantic Scholar batch client must exist)

## Definition of Done
- [x] Tests written and passing
- [x] Red-green verified
- [x] Manually tested in browser

## Implementation Notes

**Scope decision (confirmed with developer before starting):** the "why"
signal appears on all 3 modes, not just Trending, with mode-specific
content — Trending: `"41 citations in its first 90 days"` (the issue's
own example). Most Cited: `"41 citations overall"` (no velocity framing —
raw count is the point of that mode). New & Notable: `"Systematic Review
· published 3 days ago"` when tiered, else `"Published 3 days ago"`.

**Post-ship revision (developer feedback after seeing it live):** the
first version rendered this as a standalone sentence above the citation-
stat line in every mode — but in Trending/Most Cited both lines stated
the citation count, adding a full line of card height for no new
information (e.g. "41 citations in its first 90 days" followed by
"41 citations · velocity 0.20"). Fixed by folding the elaboration
directly into the existing citation-stat line instead of a parallel
sentence: `CitationStat` gained an optional `detail` field
(`frontend/src/types/index.ts`), computed by
`citationDetail(article, mode)` in `frontend/src/utils/format.ts` and
rendered inline in `ArticleCard`'s citation-stat paragraph — Trending now
reads `"41 citations in its first 90 days · velocity 0.20"` as one line,
Most Cited reads `"41 citations overall"` as one line. New & Notable is
**unchanged** — its sentence (`whyTrendingSentence`, now new_notable-only)
stays standalone since it carries evidence-tier/recency information that
never repeats the citation count, and its citation-stat line is usually
absent entirely (0-citation articles are the normal case in that mode).
Both functions are unit-tested directly in `format.test.ts`.

**Save toggle + saved-state indicator needed zero new code.**
`ReadingListProvider` already wraps the entire app in `App.tsx`, and
`ArticleList` already calls `useReadingList()` unconditionally for every
card regardless of page — so the mechanism from Issue 1 was already fully
functional on Trending cards before this issue started. Added one explicit
test (`trending-page.test.tsx`) proving it, since it's a named acceptance
criterion and deserves direct coverage even though the underlying
mechanism is inherited from shared components.

**New backend field**: `age_days: int` added to `TrendingArticle`
(computed already in `rank_articles`, just not previously exposed) — not
a new fetch, just a new field on the response the frontend already
fetches, satisfying the "no extra API calls" constraint.

**New backend endpoint**: `GET /api/reading-list/citations` mirrors the
`/api/trending/availability` endpoint's design — a separate, decoupled,
best-effort call rather than folding into the primary `GET
/api/reading-list/` response, so a slow or failed Semantic Scholar call
never blocks the reading list itself from rendering. New service function
`reading_list_service.get_live_citation_counts(db, client)` fetches saved
pmids and delegates to the existing (unchanged)
`semantic_scholar_service.get_citation_counts`.

**Frontend reuse**: the Reading List page's live counts are rendered via
`ArticleList`'s pre-existing `citationStats` prop and `ArticleCard`'s
pre-existing citation-line rendering — no new UI component needed. Only
`{ count }` is set (no `velocity`), which the component already renders
correctly with the velocity clause omitted (same behavior verified for
Most Cited/New & Notable in earlier issues).

**Known minor rough edge (flagging, not fixing without product input):**
PubMed dates are month-precision only, so an article published in the
current month computes `age_days = 0`, producing "9 citations in its
first 0 days" for Trending/Most Cited-style sentences. This is a
pre-existing data-granularity limit (the same `age_days = 0` already fed
into the velocity calculation before this issue), just newly visible in
plain English rather than buried in a formula. Confirmed via live
verification against real PubMed data. Left as-is since the exact
alternate wording (e.g. "published today", "so far") is a product/copy
decision, not a correctness bug.

**Live verification** (Playwright against real dev servers, real PubMed +
Semantic Scholar data): confirmed Trending and Most Cited each render one
merged citation-stat line (not two) with real data; confirmed New &
Notable is pixel-for-pixel unchanged (still its own italic sentence line,
badge unaffected); confirmed clicking Save on a live Trending card
immediately flips it to "Remove from reading list" with
`aria-pressed="true"`; confirmed the Reading List page shows the same
live citation count for a saved article that Trending showed; confirmed
an article Semantic Scholar has no record for (a brand-new "published 0
days ago" article) correctly shows no citation line at all on the Reading
List page, rather than "0 citations" or an error. 0 console errors
throughout (one transient 502 from the live external API during a
cold-cache load, unrelated to this frontend-only change — the page
recovered and rendered correctly on the retry).

Suggested commit message:
```
feat: add "why it's trending" sentences and reading-list citation sync

Adds a mode-specific plain-English sentence to every trending card
("41 citations in its first 90 days" / "41 citations overall" /
"Systematic Review · published 3 days ago") computed entirely from
data already fetched. Confirms the save toggle already works on
trending cards via the shared ArticleList/ReadingListProvider. Adds
GET /api/reading-list/citations so the Reading List page shows live
Semantic Scholar citation counts instead of a stale save-time snapshot.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```
