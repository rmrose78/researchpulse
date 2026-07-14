# Issue 5: "Why It's Trending" Line + Reading List Crossover

## What
Add a plain-English sentence explaining each trending article's citation traction, wire the save toggle into trending cards, and show live re-fetched citation counts on the Reading List page.

## Why
Directly executes the product pitch — "trending biomedical research, explained in plain English" — rather than leaving users to interpret a raw citation-velocity number. Tying the reading list to trending data (badge already-saved articles, show live citation growth for saved ones) connects the two halves of this phase into one coherent feature.

## Acceptance Criteria
- [ ] Each trending card shows a one-line plain-English sentence computed from data already fetched (e.g. "41 citations in its first 90 days") — no extra API calls beyond what Issue 2 already fetches
- [ ] Save/remove toggle (from Issue 1) is available on trending cards, not just search results
- [ ] Trending cards for articles already in the user's reading list show a saved-state indicator
- [ ] The Reading List page (from Issue 1) re-fetches live citation counts for all saved articles via one Semantic Scholar batch call, so saved articles visibly reflect current citation counts rather than a stale snapshot from when they were saved

## Layers Touched
- [ ] Database — none
- [ ] Backend — Reading List endpoint (or a new lightweight enrichment call) batches saved PMIDs through the existing Semantic Scholar batch client from Issue 2 to get live citation counts
- [ ] Frontend — "why it's trending" sentence rendering on `ArticleCard`, saved-state indicator on trending cards, Reading List page updated to show live citation counts

## Edge Cases
- Reading list has an article Semantic Scholar has no data for → citation count simply not shown for that card, not an error
- User has a large reading list → batch call still respects the 500-ID batch endpoint limit (chunk if ever needed, though unlikely at portfolio-project scale)

## Blocked By
Issue 1 (save mechanism must exist), Issue 2 (trending cards + Semantic Scholar batch client must exist)

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
