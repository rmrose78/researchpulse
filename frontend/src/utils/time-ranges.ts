// Mirrors backend/app/services/trending.py's VALID_WINDOW_DAYS — the
// user-selectable time ranges for the Trending pool.
export interface TimeRange {
  days: number
  label: string
}

export const TIME_RANGES: TimeRange[] = [
  { days: 60, label: '60 days' },
  { days: 180, label: '6 months' },
  { days: 365, label: '1 year' },
  { days: 730, label: '2 years' },
]

export const DEFAULT_WINDOW_DAYS = 365
