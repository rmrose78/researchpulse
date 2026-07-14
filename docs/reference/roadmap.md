# Phases

### Phase 1 — Core (in progress)
Search PubMed, view article details, save to reading list.
Not the differentiator — required foundation.

### Phase 2 — Trending (the differentiator)
Citation velocity algorithm: `velocity = total_citations / article_age_in_days`
Three modes: Trending, Most Cited, New & Notable.
Semantic Scholar for citation data. Results cached on backend.

### Phase 3 — AI Summarization (accessibility layer)
Plain-English summaries via Anthropic API.
Feature flagged: `ai_enabled: bool` in config.
Endpoint: `GET /api/search/{pmid}/summary`

### Phase 4 — Citation Network
Interactive citation graph via react-force-graph or D3.js.
