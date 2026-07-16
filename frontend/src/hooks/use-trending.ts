import { useCallback, useEffect, useRef, useState } from 'react'
import { getTrending, getTrendingAvailability } from '@/utils/api'
import { DEFAULT_SPECIALTY } from '@/utils/specialties'
import { DEFAULT_WINDOW_DAYS } from '@/utils/time-ranges'
import type { TrendingArticle } from '@/types'

export type TrendingStatus = 'loading' | 'success' | 'error'

interface UseTrendingResult {
  specialty: string
  setSpecialty: (specialty: string) => void
  windowDays: number
  setWindowDays: (days: number) => void
  status: TrendingStatus
  articles: TrendingArticle[]
  computedAt: string | null
  disabledSpecialties: Set<string>
  retry: () => void
}

export function useTrending(): UseTrendingResult {
  const [specialty, setSpecialtyState] = useState(DEFAULT_SPECIALTY)
  const [windowDays, setWindowDaysState] = useState(DEFAULT_WINDOW_DAYS)
  const [status, setStatus] = useState<TrendingStatus>('loading')
  const [articles, setArticles] = useState<TrendingArticle[]>([])
  const [computedAt, setComputedAt] = useState<string | null>(null)
  const [disabledSpecialties, setDisabledSpecialties] = useState<Set<string>>(new Set())

  // Bumped on every fetch; a resolving/rejecting request only applies its
  // outcome if it's still the latest one, so switching specialty or time
  // range quickly can't have an earlier response clobber a newer one.
  const requestIdRef = useRef(0)

  const fetchTrending = useCallback((activeSpecialty: string, activeWindowDays: number) => {
    const requestId = ++requestIdRef.current

    getTrending(activeSpecialty, activeWindowDays)
      .then((response) => {
        if (requestIdRef.current !== requestId) return
        setArticles(response.results)
        setComputedAt(response.computed_at)
        setStatus('success')
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return
        setStatus('error')
      })
  }, [])

  // Cache-only on the backend (never triggers a PubMed/Semantic Scholar
  // call), so this is safe to call on every time-range change. Best-effort:
  // a failure here just means pills stay clickable as normal, never blocks
  // or errors the page.
  const fetchAvailability = useCallback((activeWindowDays: number) => {
    getTrendingAvailability(activeWindowDays)
      .then((response) => {
        const disabled = new Set(
          Object.entries(response.available)
            .filter(([, available]) => !available)
            .map(([key]) => key)
        )
        setDisabledSpecialties(disabled)
      })
      .catch(() => {})
  }, [])

  // Mount-only fetch for the default specialty/window — `status` already
  // defaults to 'loading', so nothing needs to be set synchronously here.
  useEffect(() => {
    fetchTrending(specialty, windowDays)
    fetchAvailability(windowDays)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setSpecialty = useCallback(
    (next: string) => {
      setSpecialtyState(next)
      setStatus('loading')
      fetchTrending(next, windowDays)
    },
    [fetchTrending, windowDays]
  )

  const setWindowDays = useCallback(
    (next: number) => {
      setWindowDaysState(next)
      setStatus('loading')
      fetchTrending(specialty, next)
      fetchAvailability(next)
    },
    [fetchTrending, fetchAvailability, specialty]
  )

  const retry = useCallback(() => {
    setStatus('loading')
    fetchTrending(specialty, windowDays)
  }, [fetchTrending, specialty, windowDays])

  return {
    specialty,
    setSpecialty,
    windowDays,
    setWindowDays,
    status,
    articles,
    computedAt,
    disabledSpecialties,
    retry,
  }
}
