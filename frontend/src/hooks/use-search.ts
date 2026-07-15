import { useCallback, useEffect, useRef, useState } from 'react'
import { searchArticles } from '@/utils/api'
import { readStorage, writeStorage } from '@/utils/storage'
import type { ArticleSearchResult, SearchFilters } from '@/types'

export type SearchView = 'trending' | 'search' | 'results'
export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export const SEARCH_STORAGE_KEY = 'researchpulse:search'

// Clicking the Trending nav link (or brand logo) dispatches this so the page
// resets to the trending default even when React Router doesn't remount
// TrendingPage (navigating to the route you're already on).
export const RESET_TO_TRENDING_EVENT = 'researchpulse:reset-to-trending'

const EMPTY_FILTERS: SearchFilters = { journal: '', date_from: '', date_to: '' }

interface PersistedSearch {
  query: string
  filters: SearchFilters
  view: SearchView
  searchedQuery: string
  searchedFilters: SearchFilters
  results: ArticleSearchResult[]
  status: SearchStatus
  total: number
}

interface UseSearchResult {
  query: string
  setQuery: (value: string) => void
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
  view: SearchView
  status: SearchStatus
  results: ArticleSearchResult[]
  searchedQuery: string
  search: (query: string) => void
  goBack: () => void
  expandSearch: () => void
  retry: () => void
  total: number
  hasMore: boolean
  isLoadingMore: boolean
  loadMoreError: string | null
  loadMore: () => void
}

function normalize(query: string): string {
  return query.trim().toLowerCase()
}

function filtersEqual(a: SearchFilters, b: SearchFilters): boolean {
  return (
    a.journal.trim().toLowerCase() === b.journal.trim().toLowerCase() &&
    a.date_from === b.date_from &&
    a.date_to === b.date_to
  )
}

export function useSearch(): UseSearchResult {
  const [persisted] = useState(() => readStorage<PersistedSearch>(SEARCH_STORAGE_KEY))

  const [query, setQuery] = useState(persisted?.query ?? '')
  const [filters, setFilters] = useState<SearchFilters>(persisted?.filters ?? EMPTY_FILTERS)
  const [view, setView] = useState<SearchView>(persisted?.view ?? 'trending')
  const [status, setStatus] = useState<SearchStatus>(persisted?.status ?? 'idle')
  const [results, setResults] = useState<ArticleSearchResult[]>(persisted?.results ?? [])
  const [searchedQuery, setSearchedQuery] = useState(persisted?.searchedQuery ?? '')
  const [searchedFilters, setSearchedFilters] = useState<SearchFilters>(
    persisted?.searchedFilters ?? EMPTY_FILTERS
  )
  const [total, setTotal] = useState(persisted?.total ?? 0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  // Skip persisting transient states — a refresh mid-request or right after a
  // failure should fall back to the last known-good cache, not overwrite it.
  // `view` is persisted verbatim (not derived from status) so a refresh or
  // route remount lands exactly where the user left off — on the input
  // screen if that's what they were looking at, on results otherwise.
  useEffect(() => {
    if (status === 'loading' || status === 'error') return
    writeStorage<PersistedSearch>(SEARCH_STORAGE_KEY, {
      query,
      filters,
      view,
      searchedQuery,
      searchedFilters,
      results,
      status,
      total,
    })
  }, [query, filters, view, searchedQuery, searchedFilters, results, status, total])

  useEffect(() => {
    const handleReset = () => setView('trending')
    window.addEventListener(RESET_TO_TRENDING_EVENT, handleReset)
    return () => window.removeEventListener(RESET_TO_TRENDING_EVENT, handleReset)
  }, [])

  // Bumped on every fetch; a resolving/rejecting request only applies its
  // outcome if it's still the latest one, so a superseded (stale) response
  // can never clobber a newer search's results.
  const requestIdRef = useRef(0)

  const runFetch = useCallback(
    (rawQuery: string, activeFilters: SearchFilters) => {
      const requestId = ++requestIdRef.current
      setSearchedQuery(rawQuery)
      setSearchedFilters(activeFilters)
      setStatus('loading')
      setView('results')
      setIsLoadingMore(false)
      setLoadMoreError(null)

      searchArticles(rawQuery, activeFilters)
        .then((response) => {
          if (requestIdRef.current !== requestId) return
          setResults(response.results)
          setTotal(response.total)
          setStatus(response.results.length === 0 ? 'empty' : 'success')
        })
        .catch(() => {
          if (requestIdRef.current !== requestId) return
          setStatus('error')
        })
    },
    []
  )

  const loadMore = useCallback(() => {
    if (isLoadingMore || results.length >= total) return

    const requestId = ++requestIdRef.current
    setIsLoadingMore(true)
    setLoadMoreError(null)

    searchArticles(searchedQuery, searchedFilters, results.length)
      .then((response) => {
        if (requestIdRef.current !== requestId) return
        setResults((prev) => [...prev, ...response.results])
        setTotal(response.total)
        setIsLoadingMore(false)
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return
        setLoadMoreError("Couldn't reach PubMed to load more results — this may be a temporary rate limit.")
        setIsLoadingMore(false)
      })
  }, [isLoadingMore, results.length, total, searchedQuery, searchedFilters])

  const search = useCallback(
    (rawQuery: string) => {
      const trimmed = rawQuery.trim()
      const isCacheHit =
        (status === 'success' || status === 'empty') &&
        normalize(trimmed) === normalize(searchedQuery) &&
        filtersEqual(filters, searchedFilters)

      if (isCacheHit) {
        setView('results')
        return
      }
      runFetch(trimmed, filters)
    },
    [status, searchedQuery, filters, searchedFilters, runFetch]
  )

  const retry = useCallback(() => {
    runFetch(searchedQuery, searchedFilters)
  }, [runFetch, searchedQuery, searchedFilters])

  const goBack = useCallback(() => {
    setView('trending')
  }, [])

  const expandSearch = useCallback(() => {
    setView('search')
  }, [])

  return {
    query,
    setQuery,
    filters,
    setFilters,
    view,
    status,
    results,
    searchedQuery,
    search,
    goBack,
    expandSearch,
    retry,
    total,
    hasMore: results.length < total,
    isLoadingMore,
    loadMoreError,
    loadMore,
  }
}
