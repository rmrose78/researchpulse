import { useCallback, useEffect, useRef, useState } from 'react'
import { searchArticles } from '@/utils/api'
import { readStorage, writeStorage } from '@/utils/storage'
import type { ArticleSearchResult, SearchFilters } from '@/types'

export type SearchView = 'search' | 'results'
export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export const SEARCH_STORAGE_KEY = 'researchpulse:search'

const EMPTY_FILTERS: SearchFilters = { journal: '', date_from: '', date_to: '' }

interface PersistedSearch {
  query: string
  filters: SearchFilters
  searchedQuery: string
  searchedFilters: SearchFilters
  results: ArticleSearchResult[]
  status: SearchStatus
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
  retry: () => void
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
  const [view, setView] = useState<SearchView>('search')
  const [status, setStatus] = useState<SearchStatus>(persisted?.status ?? 'idle')
  const [results, setResults] = useState<ArticleSearchResult[]>(persisted?.results ?? [])
  const [searchedQuery, setSearchedQuery] = useState(persisted?.searchedQuery ?? '')
  const [searchedFilters, setSearchedFilters] = useState<SearchFilters>(
    persisted?.searchedFilters ?? EMPTY_FILTERS
  )

  // Skip persisting transient states — a refresh mid-request or right after a
  // failure should fall back to the last known-good cache, not overwrite it.
  useEffect(() => {
    if (status === 'loading' || status === 'error') return
    writeStorage<PersistedSearch>(SEARCH_STORAGE_KEY, {
      query,
      filters,
      searchedQuery,
      searchedFilters,
      results,
      status,
    })
  }, [query, filters, searchedQuery, searchedFilters, results, status])

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

      searchArticles(rawQuery, activeFilters)
        .then((response) => {
          if (requestIdRef.current !== requestId) return
          setResults(response.results)
          setStatus(response.results.length === 0 ? 'empty' : 'success')
        })
        .catch(() => {
          if (requestIdRef.current !== requestId) return
          setStatus('error')
        })
    },
    []
  )

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
    retry,
  }
}
