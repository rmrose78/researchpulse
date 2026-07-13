import { useCallback, useRef, useState } from 'react'
import { searchArticles } from '@/utils/api'
import type { ArticleSearchResult } from '@/types'

export type SearchView = 'search' | 'results'
export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

interface UseSearchResult {
  query: string
  setQuery: (value: string) => void
  view: SearchView
  status: SearchStatus
  results: ArticleSearchResult[]
  searchedQuery: string
  search: (query: string) => void
  goBack: () => void
  retry: () => void
}

function normalize(query: string): string {
  return query.trim().toLowerCase()
}

export function useSearch(): UseSearchResult {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<SearchView>('search')
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<ArticleSearchResult[]>([])
  const [searchedQuery, setSearchedQuery] = useState('')

  // Bumped on every fetch; a resolving/rejecting request only applies its
  // outcome if it's still the latest one, so a superseded (stale) response
  // can never clobber a newer search's results.
  const requestIdRef = useRef(0)

  const runFetch = useCallback((rawQuery: string) => {
    const requestId = ++requestIdRef.current
    setSearchedQuery(rawQuery)
    setStatus('loading')
    setView('results')

    searchArticles(rawQuery)
      .then((response) => {
        if (requestIdRef.current !== requestId) return
        setResults(response.results)
        setStatus(response.results.length === 0 ? 'empty' : 'success')
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return
        setStatus('error')
      })
  }, [])

  const search = useCallback(
    (rawQuery: string) => {
      const trimmed = rawQuery.trim()
      const isCacheHit =
        (status === 'success' || status === 'empty') && normalize(trimmed) === normalize(searchedQuery)

      if (isCacheHit) {
        setView('results')
        return
      }
      runFetch(trimmed)
    },
    [status, searchedQuery, runFetch]
  )

  const retry = useCallback(() => {
    runFetch(searchedQuery)
  }, [runFetch, searchedQuery])

  const goBack = useCallback(() => {
    setView('search')
  }, [])

  return { query, setQuery, view, status, results, searchedQuery, search, goBack, retry }
}
