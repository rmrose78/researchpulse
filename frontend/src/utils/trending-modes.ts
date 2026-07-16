// Mirrors backend/app/services/trending.py's VALID_MODES — the three
// ranking modes available on the Trending page.
export interface TrendingMode {
  key: string
  label: string
}

export const TRENDING_MODES: TrendingMode[] = [
  { key: 'trending', label: 'Trending' },
  { key: 'most_cited', label: 'Most Cited' },
  { key: 'new_notable', label: 'New & Notable' },
]

export const DEFAULT_MODE = TRENDING_MODES[0].key
