# PRD: Search Results List

## Problem
Clinicians, health IT analysts, and policy professionals need to quickly search PubMed and scan results to judge relevance, without waiting on the full article detail experience.

## Success Criteria
- [ ] User can enter a query (2+ characters, frontend-validated) and optional journal/date filters, then explicitly submit (no live/debounced search)
- [ ] Results render as cards showing title, a truncated abstract, and a secondary metadata line (authors, journal, pub date)
- [ ] Clicking a card expands its full abstract inline (no navigation)
- [ ] "Load more" fetches the next batch of results via new backend offset-based pagination, appending to the existing list
- [ ] Skeleton placeholder cards show during initial search load
- [ ] "Load more" shows an inline spinner in the button while fetching, without disturbing already-visible results
- [ ] Zero-result and backend-failure (502) states are visually distinct from each other and from normal results

## User Stories
- As a user, I want to search PubMed by query with optional journal/date filters so that I can narrow results to what's relevant to me.
- As a user, I want to scan result cards by title and abstract so that I can judge relevance without opening each article.
- As a user, I want to expand a card's abstract inline so that I can read more without leaving the results list.
- As a user, I want to load more results on demand so that I can see beyond the first batch without the page fetching everything up front.
- As a user, I want clear feedback when there are no results or when something fails so that I know what happened and what to do next.

## Scope

### In Scope
- Search query box with explicit submit (Enter or button click)
- Journal and date-range filters
- Frontend validation blocking submission for queries under 2 characters
- Result cards: title, truncated abstract snippet, authors/journal/pub date metadata line
- Inline abstract expansion on card click
- "Load more" pagination, backed by a new offset/`retstart` param on `/api/search/`
- Skeleton loading state for initial search
- Inline button spinner for "Load more"
- Distinct empty-results and error (502) states with retry action on error

### Out of Scope
- Article detail page/route
- Save-to-reading-list integration
- AI summarization (Phase 3)
- Trending/citation velocity (Phase 2/4)

## Data

### Inputs
- Query text (string, 2+ characters)
- Optional journal filter
- Optional date range filter (from/to)
- Offset/page cursor for "Load more"

### Outputs
- List of article results, each with: pmid, title, abstract, authors, journal, pub_date, doi
- Total result count (for knowing when more pages exist)

### Stored
- Nothing new persisted to the database — this feature only reads from PubMed via the existing search service.

## Edge Cases
- Query under 2 characters → blocked client-side with inline validation message, never sent to backend
- Zero results → friendly empty state: "No results found for '{query}' — try a different search term"
- Backend/PubMed failure (502) → distinct error state with a retry action
- Rapid "Load more" clicks → pagination stays user-paced (click-triggered only), relying on existing backend 429 retry/backoff rather than new client-side throttling

## Open Questions
None outstanding — all decisions were resolved during /grill-me.
