# Issue 3: Trending — Most Cited and New & Notable Modes

## What
Add the remaining two modes — Most Cited and New & Notable — with a segmented-control tab switcher alongside the existing specialty selector.

## Why
Citation velocity alone doesn't cover every use case: sometimes a user wants the all-time most-cited work in a specialty, or wants to catch genuinely brand-new papers before they've accumulated citations at all.

## Acceptance Criteria
- [x] Mode switcher for Trending / Most Cited / New & Notable, alongside the specialty selector from Issue 2 (built as a left filter rail, not segmented tabs — see Implementation Notes)
- [x] Most Cited: same specialty pool, sorted by raw total citation count, no date/age bound, no velocity calculation
- [x] New & Notable: recency-sorted, and — because PubMed doesn't assign MeSH terms for weeks after publication — uses a hybrid MeSH-OR-title/abstract-keyword query so genuinely new articles aren't systematically missed
- [x] New & Notable includes 0-citation articles (recency is the point, not citation count)
- [x] Each mode's results cached independently in `trending_snapshots` (same table/mechanism as Issue 2, keyed by mode as well as specialty)
- [x] Switching modes updates the URL/state so the combination is shareable/bookmarkable within the session

## Layers Touched
- [x] Database — no new tables; `trending_snapshots` rows now written for all 3 modes, not just Trending
- [x] Backend — `GET /api/trending/` accepts a mode parameter; Most Cited and New & Notable query/ranking logic added to the trending service from Issue 2
- [x] Frontend — mode selector component, `useTrending` hook extended to track mode alongside specialty

## Edge Cases
- New & Notable's hybrid query still returns too few results for a niche specialty → same minimum-results fallback pattern as Issue 2 (widen the recency window)
- User switches modes rapidly → each mode's cache is independent, no cross-contamination; in-flight requests for an abandoned mode are safe to let complete and cache (not cancelled)

## Blocked By
Issue 2 (Trending mode + caching infrastructure must exist first)

## Definition of Done
- [x] Tests written and passing
- [x] Red-green verified
- [x] Manually tested in browser

## Implementation Notes

**Layout: PubMed-style left filter rail, not segmented tabs.** The issue as
written called for "segmented-control tabs... alongside the specialty
selector." Before building, the developer raised a real concern — stacking
a third row of pill/tab controls above Specialty and Time Range risked
reading as cluttered — and pointed at PubMed's own results page
(`pubmed.ncbi.nlm.nih.gov/?term=...`) as a reference: a narrow left rail of
grouped filters beside the results column. Since Mode/Specialty/Time Range
are all the same shape (single-select category lists), this pattern fit
better and scales cleanly if a later issue adds a 4th filter dimension.
Built as a new `TrendingFilters` component (left rail on desktop, sticky;
collapses to a "Show/Hide filters" toggle on mobile, reusing the exact
collapse pattern from Search's `search-filters.tsx`). `SpecialtySelector`
and `TimeRangeSelector` were restyled from horizontal pill rows to vertical
list rows to match (no prop/logic changes — both are single-consumer
components, so this was a safe pure-CSS change). Search's own Journal/Date
filters were explicitly left untouched — confirmed with the developer this
issue's scope is Trending-page-only.

**Velocity UI hidden outside Trending mode.** The "How is this calculated?"
popup trigger and the citation card's "· velocity X.XX" text only apply to
Trending's ranking formula — showing them next to a Most Cited or New &
Notable list would explain a number that isn't actually driving what's on
screen. Confirmed with the developer and implemented as: `VelocityExplainer`
only renders when `mode === 'trending'`; `CitationStat.velocity` is now
optional, and `ArticleCard` omits the velocity clause entirely when absent.

**New & Notable keyword lists were authored during this build, not
supplied.** `SPECIALTY_KEYWORDS` in `backend/app/services/specialties.py`
is a first draft of title/abstract terms per specialty (e.g. cardiology →
"heart attack", "heart failure", "arrhythmia", "coronary artery disease"),
ORed with the existing MeSH query for New & Notable's PubMed search. These
are reasonable starting terms, not a definitive taxonomy — worth revisiting
if a specialty's New & Notable results look off-topic in practice.

**Bookmarkability implemented via URL query params**, not just component
state. `useTrending` previously had zero persistence (confirmed via
exploration — pure in-memory `useState`, lost on refresh); specialty, mode,
and window_days now all live in the URL via `useSearchParams`, each
validated against its known list with a fallback to default for a
missing/stale value. This is deliberately separate from Issue 6's future
`localStorage`-based cross-visit persistence — this issue's "shareable
within the session" requirement is specifically about a URL that can be
copied/bookmarked/reloaded, which only a URL-based store actually satisfies.

**0-citation handling**: `rank_articles` now defaults a missing citation
count to `0` rather than excluding it outright, but only *keeps* 0-count
articles when `mode == "new_notable"` — Trending and Most Cited still
exclude them exactly as before Issue 3.

## Follow-up: New & Notable Sampling Fix + "0 Citations" Copy + Mobile Hamburger Nav (post-ship)

During developer visual review (before commit), two issues surfaced:

**Window-days dilution bug in New & Notable.** The mode reused the same
multi-slice pool-sampling as Trending/Most Cited (`window_days` split into
~90-day slices, `POOL_SIZE=200` divided evenly across them). For a
recency-sorted mode this was backwards: picking **2 years** diluted the
newest slice's candidate budget (200 ÷ ~8 slices ≈ 25) compared to
**60 days** (the full 200, one slice) — wider range meant *fewer* genuinely
new candidates, the opposite of user intuition. Fixed by splitting
`_rank_for_window`'s fetch logic into two helpers in
`backend/app/services/trending.py`: `_fetch_sliced_pool` (unchanged
behavior, still used by `trending`/`most_cited`) and a new `_fetch_newest`
(a single non-sliced PubMed query spanning the full selected window,
relying on newest-first ordering) used only for `new_notable`. Verified
live: the top articles at a 60-day window and a 730-day window are now
identical — `window_days` for this mode only matters as a thinness
safety-valve (a wider range surfaces older-but-still-recent content once
the newest well runs dry), not a dilution factor.

**"0 citations" hidden in New & Notable.** A 0-citation card next to the
word "notable" read as a contradiction — there's no independent
significance signal in this mode beyond specialty relevance (via the
hybrid query) and recency, so a bald "0 citations" undersold articles that
are supposed to be here precisely because they're brand new. Fixed in
`frontend/src/pages/trending-page.tsx`'s `citationStats` memo: no map
entry is created (so `ArticleCard` renders no stat line at all) when
`mode === 'new_notable' && article.citation_count === 0`. A nonzero count
on a brand-new article is still shown — it's a genuine signal (already
gaining traction despite being new) worth keeping.

**Mobile hamburger nav.** The nav bar previously just wrapped its 4 links
onto multiple lines on narrow screens — no hamburger at all. Added a new
`frontend/src/components/layout/mobile-nav/mobile-nav.tsx`, a controlled
Radix Dialog (same `@radix-ui/react-dialog` dependency as
`components/ui/modal/`) opening a full-screen frosted-glass overlay with
large stacked nav links, visible only below the desktop breakpoint (the
existing horizontal `.navLinks` list is now desktop-only via CSS). Nav
items were extracted into a shared `frontend/src/components/layout/nav-items.ts`
so the desktop list and the mobile overlay render from one source instead
of duplicating the link set.

**Housekeeping**: also found and removed ~15 stray duplicate files across
the repo (`<name> 2.py`/`.ts`), an iCloud Drive sync-conflict artifact
(this repo lives under `Desktop/`) unrelated to any of this session's
edits. Several were stale pre-mode-threading test/source snapshots that
pytest's `test_*.py` glob was picking up alongside the real files, causing
spurious failures against the *current* code — this, not a missed
pre-commit check, was the cause of the test failures the developer saw.
All were verified as strict stale subsets of their canonical counterparts
(via `diff`) before removal; they were tracked-but-clean in git, so
nothing is lost (recoverable via `git checkout` from history if ever
needed).
