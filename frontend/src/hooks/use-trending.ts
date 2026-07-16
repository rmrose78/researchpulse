import { useCallback, useEffect, useRef, useState } from 'react'
import { getTrending } from '@/utils/api'
import { DEFAULT_SPECIALTY } from '@/utils/specialties'
import type { TrendingArticle } from '@/types'

export type TrendingStatus = 'loading' | 'success' | 'error'

interface UseTrendingResult {
  specialty: string
  setSpecialty: (specialty: string) => void
  status: TrendingStatus
  articles: TrendingArticle[]
  computedAt: string | null
  retry: () => void
}

export function useTrending(): UseTrendingResult {
  const [specialty, setSpecialtyState] = useState(DEFAULT_SPECIALTY)
  const [status, setStatus] = useState<TrendingStatus>('loading')
  const [articles, setArticles] = useState<TrendingArticle[]>([])
  const [computedAt, setComputedAt] = useState<string | null>(null)

  // Bumped on every fetch; a resolving/rejecting request only applies its
  // outcome if it's still the latest one, so switching specialties quickly
  // can't have an earlier response clobber a newer one.
  const requestIdRef = useRef(0)

  const fetchTrending = useCallback((activeSpecialty: string) => {
    const requestId = ++requestIdRef.current

    getTrending(activeSpecialty)
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

  // Mount-only fetch for the default specialty — `status` already defaults
  // to 'loading', so nothing needs to be set synchronously here (only the
  // async .then/.catch above touch state).
  useEffect(() => {
    fetchTrending(specialty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setSpecialty = useCallback(
    (next: string) => {
      setSpecialtyState(next)
      setStatus('loading')
      fetchTrending(next)
    },
    [fetchTrending]
  )

  const retry = useCallback(() => {
    setStatus('loading')
    fetchTrending(specialty)
  }, [fetchTrending, specialty])

  return { specialty, setSpecialty, status, articles, computedAt, retry }
}
