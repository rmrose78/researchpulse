# Issue 3: Inline Abstract Expansion

## What
A user can click a result card to expand its full abstract inline, without leaving the results list.

## Why
Lets a user read enough to judge relevance before deciding whether an article is worth deeper attention — without the cost of a full navigation to a detail page (which is out of scope for this feature).

## Acceptance Criteria
- [ ] Clicking a card expands it in place to show the full abstract text
- [ ] Clicking an expanded card again collapses it back to the truncated snippet
- [ ] Expanding one card does not affect the state of other cards (each card's expanded/collapsed state is independent)
- [ ] No navigation or route change occurs on click

## Layers Touched
- [ ] Database — not touched
- [ ] Backend — no changes; abstract text is already present in the `GET /api/search/` response
- [ ] Frontend — ArticleCard component gains expand/collapse state and full-abstract rendering

## Edge Cases
- Article with no abstract (`abstract` is null) → clicking the card does nothing, or shows "No abstract available" instead of an empty expansion

## Blocked By
Issue 1 (needs ArticleCard to exist)

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
