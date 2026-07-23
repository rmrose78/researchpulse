// Lets the developer opt their own browser out of page-view tracking from
// the analytics dashboard (frontend/src/pages/analytics-page.tsx), since an
// IP-based exclusion would break across home/phone/coffee-shop networks.
const STORAGE_KEY = 'researchpulse.analytics.excluded'

export function isAnalyticsExcluded(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setAnalyticsExcluded(excluded: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(excluded))
  } catch {
    // best-effort — private browsing / quota exceeded, no crash
  }
}
