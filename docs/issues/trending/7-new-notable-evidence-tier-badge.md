# Issue 7: New & Notable — Evidence-Tier Badge

## What
Give New & Notable a real notability signal — PubMed's `PublicationType`
metadata (Randomized Controlled Trial, Meta-Analysis, Systematic Review,
etc.) — shown as a badge and used to reorder results, instead of the mode
being a plain date sort with no signal behind the word "notable."

## Why
Developer review found that New & Notable currently has no way to convey
*why* an article is notable beyond recency — two articles from the same
week rank identically whether one is a landmark systematic review or a
case report, and the citation-count line was already hidden at 0 (correctly,
since it's not a meaningful signal this early). Publication type maps
directly onto the evidence-based-medicine hierarchy the target audience
(clinicians, health IT analysts) already uses to judge research quality,
and PubMed already assigns it to every article for free — it's real,
external, structured data, not an invented heuristic.

## Acceptance Criteria
- [x] `PublicationType` values extracted from PubMed XML for every article (search and detail endpoints)
- [x] Evidence tiers defined: Tier 1 (Meta-Analysis, Systematic Review), Tier 2 (Randomized Controlled Trial), Tier 3 (Clinical Trial and its phases, Multicenter Study, Comparative Study) — everything else is untiered
- [x] In New & Notable mode only, results sort by tier first (best tier surfaces first), then recency within a tier/among untiered articles — a wider time window no longer means a pure date list with no differentiation
- [x] A badge is shown on the article card only for tiered (1–3) articles, displaying the matched publication type (e.g. "Randomized Controlled Trial"); untiered/plain articles show no badge
- [x] Trending and Most Cited modes are entirely unaffected — no badge, no sort change, `notable_type` is always null in those modes
- [x] A "How is this calculated?" explainer (mirroring the existing Trending velocity explainer) is available in New & Notable mode, explaining the evidence-tier concept
- [x] How It Works page has a new section explaining the evidence-tier notability signal

## Layers Touched
- [x] Database — no schema changes; cached `trending_snapshots` rows for `new_notable` will include the new fields once recomputed
- [x] Backend — `pubmed.py` extracts `PublicationType`; `ArticleSearchResult` schema gains `publication_types`; `TrendingArticle` schema gains `notable_type`; `trending.py`'s `rank_articles` computes tier and re-sorts for `new_notable` mode only
- [x] Frontend — `ArticleCard` renders the badge; `trending-page.tsx` builds a per-pmid notable-type map; new `NotabilityExplainer` component; How It Works page gets a new card

## Edge Cases
- Article has multiple `PublicationType` values (e.g. both "Randomized Controlled Trial" and "Multicenter Study") → use the single best (lowest-numbered) tier match
- Article has no `PublicationType` element at all → `publication_types` is an empty list, no tier, no badge, ranks by recency same as before this issue
- Niche specialty where nothing in the window is tiered → falls back to today's pure-recency order, no regression

## Blocked By
Issue 3 (Most Cited and New & Notable modes must exist first)

## Definition of Done
- [x] Tests written and passing
- [x] Red-green verified
- [x] Manually tested in browser

## Implementation Notes

**Tiers exactly as specified**, defined in `backend/app/services/trending.py`
as `NOTABILITY_TIERS: dict[str, int]` (Meta-Analysis/Systematic Review = 1,
Randomized Controlled Trial = 2, Clinical Trial + phases/Multicenter
Study/Comparative Study = 3). A new `_notability(publication_types)` helper
picks the single best (lowest-number) match; `rank_articles` uses it — for
`new_notable` only — to set each article's `notable_type` and to sort by
`(tier_or_untiered_sentinel, age_days)`, so a tiered article always outranks
a newer untiered one, and recency breaks ties within/among the rest.
`trending`/`most_cited` are untouched — `notable_type` stays `None`.

**Verified live against real PubMed data** (not just unit tests): switching
Cardiology to New & Notable produced Systematic Review-tagged articles
first, then Randomized Controlled Trial, then Multicenter/Comparative
Study, then untiered articles — exactly the intended order. Notably, one
untiered article's *title* literally contained the words "Meta-Analysis"
but got no badge, because PubMed's structured `PublicationType` metadata
for that record didn't include it — confirming the feature reads real
metadata rather than pattern-matching titles, which was an explicit design
goal (not an invented heuristic).

**Badge placement**: a `.titleGroup` wrapper was added around `ArticleCard`'s
title so the badge sits directly above it, visually distinct from the
citation-stat line (a ranking number) below the metadata — badge is a
classification signal, citation stat is a ranking signal, kept in separate
visual zones.

**`NotabilityExplainer`** mirrors `VelocityExplainer` exactly (same `Modal`
wrapper, same trigger placement in `.freshnessRow`, same scss visual
language) and is shown only in `new_notable` mode, mutually exclusive with
`VelocityExplainer` (`trending` mode only) — never both at once.

**Scope confirmed with developer during planning**: this only affects
New & Notable. Trending (velocity) and Most Cited (raw count) already have
working signals, so extending badges there would be scope creep with no
problem to solve.
