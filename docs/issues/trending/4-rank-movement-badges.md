# Issue 4: Trending — Rank-Movement Badges

## What
Show "↑3" / "↓1" / "NEW" badges on trending cards by comparing the current ranking snapshot to the previous one for that specialty/mode.

## Why
A static leaderboard gives a returning user no reason to check back. Showing what changed since their last visit is a cheap, visible way to make the feature feel alive — and the data's already there since `trending_snapshots` is insert-only.

## Acceptance Criteria
- [ ] For each (specialty, mode), the two most recent `trending_snapshots` rows are diffed by `pmid`
- [ ] An article present in both snapshots shows its rank delta (e.g. "↑3" if it moved up 3 positions, "↓1" if down)
- [ ] An article present in the current snapshot but not the previous one shows a "NEW" badge
- [ ] An article with no rank change shows no badge (not "↔0" or similar noise)
- [ ] Badge renders on the `ArticleCard` alongside the citation stat, for all 3 modes
- [ ] If there's no previous snapshot yet (first-ever computation for that specialty/mode), no badges are shown rather than everything being marked "NEW"

## Layers Touched
- [ ] Database — no schema change; reads two most recent rows per (specialty, mode) from the existing `trending_snapshots` table
- [ ] Backend — diffing logic added to the trending service, included in the `GET /api/trending/` response payload
- [ ] Frontend — rank-movement badge component on `ArticleCard`

## Edge Cases
- Only one snapshot exists so far for a combination → no badges shown, not treated as an error
- An article drops out of the ranking entirely between snapshots → no badge needed for it since it no longer appears in the current list (nothing to render)

## Blocked By
Issue 2 (snapshot table must exist), Issue 3 (badges apply across all 3 modes)

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
