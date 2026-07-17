# Issue 4: Trending — Rank-Movement Badges

## What
Show "↑3" / "↓1" / "NEW" badges on trending cards by comparing the current ranking snapshot to the previous one for that specialty/mode.

## Why
A static leaderboard gives a returning user no reason to check back. Showing what changed since their last visit is a cheap, visible way to make the feature feel alive — and the data's already there since `trending_snapshots` is insert-only.

## Acceptance Criteria
- [x] For each (specialty, mode), the two most recent `trending_snapshots` rows are diffed by `pmid`
- [x] An article present in both snapshots shows its rank delta (e.g. "↑3" if it moved up 3 positions, "↓1" if down)
- [x] An article present in the current snapshot but not the previous one shows a "NEW" badge
- [x] An article with no rank change shows no badge (not "↔0" or similar noise)
- [x] Badge renders on the `ArticleCard` alongside the citation stat, for all 3 modes
- [x] If there's no previous snapshot yet (first-ever computation for that specialty/mode), no badges are shown rather than everything being marked "NEW"

## Layers Touched
- [x] Database — no schema change; reads two most recent rows per (specialty, mode, window_days) from the existing `trending_snapshots` table
- [x] Backend — diffing logic added to the trending service, included in the `GET /api/trending/` response payload
- [x] Frontend — rank-movement badge component on `ArticleCard`

## Edge Cases
- Only one snapshot exists so far for a combination → no badges shown, not treated as an error
- An article drops out of the ranking entirely between snapshots → no badge needed for it since it no longer appears in the current list (nothing to render)

## Blocked By
Issue 2 (snapshot table must exist), Issue 3 (badges apply across all 3 modes)

## Definition of Done
- [x] Tests written and passing
- [x] Red-green verified
- [x] Manually tested in browser

## Implementation Notes

**Diffing is computed at read-time, not stored.** The "two most recent
snapshots" for a `(specialty, mode, window_days)` key shifts as new rows
get written (stale-while-revalidate, 8h TTL — already built in a prior
issue), so `attach_rank_movements` re-queries the next-most-recent snapshot
and diffs on every `GET /api/trending/` call rather than baking rank
history into the stored `payload`. Rank has no explicit column — it's each
article's index position within a snapshot's already-sorted `payload` list.

**New backend functions** (`backend/app/services/trending.py`):
- `_previous_snapshot` — finds the next-most-recent row for the same
  `(specialty, mode, window_days)` key, `None` if none exists.
- `_rank_movements` — pure pmid→`(delta, is_new)` diff; an entry is only
  present when there's something to show (unchanged rank and "no
  previous snapshot at all" both collapse to "absent from this dict").
- `attach_rank_movements` — orchestrates the two above and returns the
  fully-populated `TrendingArticle` list for the router.

**Schema**: `TrendingArticle` gained `rank_delta: int | None` and
`is_new: bool` (both default to the "no badge" state, so old cached rows
and the cold-start case are safe by construction).

**Frontend**: a `rankMovements` `useMemo` in `trending-page.tsx` mirrors
the existing `citationStats`/`notableTypes` pattern — built once per
render, threaded through `ArticleList` → `ArticleCard` as
`Record<pmid, RankMovement>`. Unlike `notableTypes` (New & Notable-only),
this map has no mode gate, matching the acceptance criterion that badges
apply across all 3 modes. The badge renders in a new `.statsRow` flex
container alongside `.citationStat` (not the title, where the evidence-tier
badge lives) — up uses `$success`, down uses `$error`, NEW reuses
`$clinical-blue`, all pre-existing design tokens.

**Live verification** (Playwright against real dev servers, seeded
snapshot data since natural traffic wouldn't produce two rows quickly
enough to observe): confirmed all three badge states render correctly
("↑2" green, "NEW" blue, "↓2" red) with a dropped-out article correctly
absent rather than erroring; confirmed a specialty with exactly one
snapshot ever computed shows zero badges anywhere (the cold-start edge
case); confirmed badges render identically across Trending, Most Cited,
and New & Notable modes. 0 console errors throughout.

Suggested commit message:
```
feat: add rank-movement badges to Trending cards

Diffs each snapshot against the next-most-recent one for the same
(specialty, mode, window_days) key at read-time, surfacing "↑N"/"↓N"/
"NEW" on ArticleCard next to the citation stat across all 3 modes. No
badge when rank is unchanged or when there's no prior snapshot yet
(cold start).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```
