import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { postPageView } from '@/utils/api'
import { isAnalyticsExcluded } from '@/utils/analytics-exclusion'

export function usePageViewTracking(): void {
  const { pathname } = useLocation()

  useEffect(() => {
    if (isAnalyticsExcluded()) return
    // Fire-and-forget — a failure here must never affect navigation or
    // surface anywhere in the UI.
    postPageView(pathname, document.referrer).catch(() => {})
  }, [pathname])
}
