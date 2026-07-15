# Issue 1: Reading List — Save, Remove, and View Saved Articles

## What
Wire the existing (Phase 1) reading-list backend into the frontend: a save/remove toggle on article cards in search results, and a Reading List page that lists everything saved.

## Why
The `POST`/`GET`/`DELETE /api/reading-list/` endpoints have existed since Phase 1 but nothing in the UI uses them — users currently have no way to save an article they find.

## Acceptance Criteria
- [x] `saved_at` bug fixed: `backend/app/models/reading_list.py` currently evaluates `datetime.now(timezone.utc)` once at import time, so every saved article gets the same timestamp and `ORDER BY saved_at DESC` is meaningless. Fixed to evaluate per-row (e.g. `default=lambda: datetime.now(timezone.utc)`, or a server-side default).
- [x] `backend/app/routers/reading_list.py` converted to `async def` handlers with DB/business logic moved into a service module, per CLAUDE.md conventions (routers stay thin)
- [x] `ArticleCard` has a save/remove bookmark toggle, usable from the search results view
- [x] Toggling save is optimistic (UI updates immediately) with a toast + Undo action
- [x] A 409 response (already saved) is treated as success client-side, not surfaced as an error
- [x] `/reading-list` page (route added in Issue 0) fetches and displays all saved articles, newest first, using the fixed `saved_at` ordering
- [x] Saved/not-saved state is available at the app level so any `ArticleCard` instance can reflect it correctly

## Layers Touched
- [x] Database — no schema change; fixes the `saved_at` default bug on the existing `saved_articles` table
- [x] Backend — `reading_list.py` router refactored to async + service layer; existing endpoints' contracts unchanged
- [x] Frontend — `ArticleCard` gains `isSaved`/`onSaveToggle` props, app-level saved-PMID context/state, new Reading List page content, toast + Undo component (no pre-existing pattern to reuse, so a lightweight custom `Toast` was built rather than pulling in Radix's toast primitive for a single use)

## Implementation Notes
- App-level saved state lives in a `ReadingListProvider` (React Context) wrapping the whole app in `App.tsx`. It fetches `GET /api/reading-list/` once on mount and exposes `isSaved`/`toggleSave`/`status`/`articles`/`retry`. `ArticleList` consumes this context directly (rather than prop-drilling through `SearchResults`/`TrendingPage`), so both the search results view and the Reading List page share one source of truth and one fetch.
- The Reading List page reuses `ArticleList`/`ArticleCard`/`SearchSkeleton`/`ErrorState` as-is, converting the stored `SavedArticle` shape (joined author string, no abstract) back into `ArticleSearchResult` for display.
- `EmptyState` was generalized with an optional `message` prop (falling back to its original query-based text) so the Reading List's empty state could reuse it with different copy.
- `toggleSave` is symmetric: undo on a "Saved" toast simply re-triggers the remove path, and undo on a "Removed" toast re-triggers the save path, using the article payload already in hand rather than a separate undo code path.

## Edge Cases
- Removing an article not currently in the list → backend 404 already handled; frontend should not surface this as a user-facing error if it happens from a stale optimistic state (reconcile silently)
- Empty reading list → `EmptyState` inviting the user to save an article from search
- Save/remove request fails (network error) → optimistic update rolls back, `ErrorState`/retry pattern reused

## Blocked By
Issue 0 (routing foundation — needs the `/reading-list` route to exist)

## Definition of Done
- [x] Tests written and passing
- [x] Red-green verified
- [x] Manually tested in browser
