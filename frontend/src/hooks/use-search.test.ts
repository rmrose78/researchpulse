import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useSearch, SEARCH_STORAGE_KEY } from './use-search'
import { searchArticles } from '@/utils/api'
import type { ArticleSearchResult, SearchFilters, SearchResponse } from '@/types'

jest.mock('@/utils/api', () => ({
  searchArticles: jest.fn(),
}))

const mockedSearchArticles = jest.mocked(searchArticles)

function makeArticle(overrides: Partial<ArticleSearchResult> = {}): ArticleSearchResult {
  return {
    pmid: '123',
    title: 'A cardiac study',
    abstract: 'Abstract text',
    authors: ['Smith J'],
    journal: 'Journal of Cardiology',
    pub_date: '2026-01-01',
    doi: null,
    ...overrides,
  }
}

function makeResponse(
  results: ArticleSearchResult[],
  query = 'cardiac',
  total = results.length
): SearchResponse {
  return { total, results, query }
}

function makeFilters(overrides: Partial<SearchFilters> = {}): SearchFilters {
  return { journal: '', date_from: '', date_to: '', ...overrides }
}

beforeEach(() => {
  mockedSearchArticles.mockReset()
  sessionStorage.clear()
})

describe('useSearch', () => {
  it('starts idle on the search screen', () => {
    // Arrange & Act
    const { result } = renderHook(() => useSearch())

    // Assert
    expect(result.current.view).toBe('search')
    expect(result.current.status).toBe('idle')
    expect(result.current.results).toEqual([])
  })

  it('goes to loading then success on a search with results', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    const { result } = renderHook(() => useSearch())

    // Act
    act(() => {
      result.current.search('cardiac')
    })

    // Assert
    expect(result.current.status).toBe('loading')
    expect(result.current.view).toBe('results')
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.results).toHaveLength(1)
    expect(result.current.searchedQuery).toBe('cardiac')
  })

  it('goes to empty status on zero results', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([]))
    const { result } = renderHook(() => useSearch())

    // Act
    act(() => {
      result.current.search('zzzznotarealterm')
    })

    // Assert
    await waitFor(() => expect(result.current.status).toBe('empty'))
    expect(result.current.results).toEqual([])
  })

  it('goes to error status when the API call rejects', async () => {
    // Arrange
    mockedSearchArticles.mockRejectedValue(new Error('API error: 502'))
    const { result } = renderHook(() => useSearch())

    // Act
    act(() => {
      result.current.search('cardiac')
    })

    // Assert
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('does not call the API again for the same query once cached', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.search('cardiac')
    })
    await waitFor(() => expect(result.current.status).toBe('success'))
    act(() => {
      result.current.goBack()
    })
    expect(result.current.view).toBe('search')

    // Act
    act(() => {
      result.current.search('cardiac')
    })

    // Assert
    expect(result.current.view).toBe('results')
    expect(mockedSearchArticles).toHaveBeenCalledTimes(1)
  })

  it('re-fetches when the query differs from the cached one, ignoring case/whitespace', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.search('cardiac')
    })
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Act — same term, different case/whitespace should still be a cache hit
    act(() => {
      result.current.search('  Cardiac  ')
    })

    // Assert
    expect(mockedSearchArticles).toHaveBeenCalledTimes(1)

    // Act — genuinely different term should re-fetch
    act(() => {
      result.current.search('diabetes')
    })
    await waitFor(() => expect(mockedSearchArticles).toHaveBeenCalledTimes(2))
  })

  it('goBack only changes the view, preserving cached results and query', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.search('cardiac')
    })
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Act
    act(() => {
      result.current.goBack()
    })

    // Assert
    expect(result.current.view).toBe('search')
    expect(result.current.status).toBe('success')
    expect(result.current.results).toHaveLength(1)
    expect(result.current.searchedQuery).toBe('cardiac')
  })

  it('retry re-fetches the last query even though it is cached', async () => {
    // Arrange
    mockedSearchArticles.mockRejectedValue(new Error('API error: 502'))
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.search('cardiac')
    })
    await waitFor(() => expect(result.current.status).toBe('error'))
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))

    // Act
    act(() => {
      result.current.retry()
    })

    // Assert
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(mockedSearchArticles).toHaveBeenCalledTimes(2)
  })

  it('re-fetches when filters differ even though the query text is unchanged', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.search('cardiac')
    })
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Act
    act(() => {
      result.current.setFilters({ journal: 'The Lancet', date_from: '', date_to: '' })
    })
    act(() => {
      result.current.search('cardiac')
    })

    // Assert
    await waitFor(() => expect(mockedSearchArticles).toHaveBeenCalledTimes(2))
    expect(mockedSearchArticles).toHaveBeenLastCalledWith('cardiac', {
      journal: 'The Lancet',
      date_from: '',
      date_to: '',
    })
  })

  it('does not re-fetch when both query and filters are unchanged', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.setFilters({ journal: 'The Lancet', date_from: '', date_to: '' })
    })
    act(() => {
      result.current.search('cardiac')
    })
    await waitFor(() => expect(result.current.status).toBe('success'))
    act(() => {
      result.current.goBack()
    })

    // Act — same query, same filters
    act(() => {
      result.current.search('cardiac')
    })

    // Assert
    expect(result.current.view).toBe('results')
    expect(mockedSearchArticles).toHaveBeenCalledTimes(1)
  })

  it('retry reuses the filters from the original request, not any since-edited ones', async () => {
    // Arrange
    mockedSearchArticles.mockRejectedValue(new Error('API error: 502'))
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.setFilters({ journal: 'The Lancet', date_from: '', date_to: '' })
    })
    act(() => {
      result.current.search('cardiac')
    })
    await waitFor(() => expect(result.current.status).toBe('error'))
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))

    // Act — edit filters after the failed search, then retry
    act(() => {
      result.current.setFilters({ journal: 'A Different Journal', date_from: '', date_to: '' })
    })
    act(() => {
      result.current.retry()
    })

    // Assert
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(mockedSearchArticles).toHaveBeenLastCalledWith('cardiac', {
      journal: 'The Lancet',
      date_from: '',
      date_to: '',
    })
  })

  it('discards a stale response when a newer search has superseded it', async () => {
    // Arrange
    let resolveFirst: (value: SearchResponse) => void = () => {}
    const firstCall = new Promise<SearchResponse>((resolve) => {
      resolveFirst = resolve
    })
    mockedSearchArticles.mockReturnValueOnce(firstCall)
    mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle({ pmid: 'second' })], 'diabetes'))
    const { result } = renderHook(() => useSearch())

    // Act — fire the first (slow) search, then a second before it resolves
    act(() => {
      result.current.search('cardiac')
    })
    act(() => {
      result.current.search('diabetes')
    })
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.searchedQuery).toBe('diabetes')

    // Now resolve the stale first request
    act(() => {
      resolveFirst(makeResponse([makeArticle({ pmid: 'first' })], 'cardiac'))
    })

    // Assert — the stale response must not overwrite the newer one
    expect(result.current.searchedQuery).toBe('diabetes')
    expect(result.current.results[0].pmid).toBe('second')
  })

  it('restores the last query and filters from sessionStorage on mount', () => {
    // Arrange
    sessionStorage.setItem(
      SEARCH_STORAGE_KEY,
      JSON.stringify({
        query: 'cardiac',
        filters: makeFilters({ journal: 'The Lancet' }),
        searchedQuery: 'cardiac',
        searchedFilters: makeFilters({ journal: 'The Lancet' }),
        results: [makeArticle()],
        status: 'success',
      })
    )

    // Act
    const { result } = renderHook(() => useSearch())

    // Assert
    expect(result.current.query).toBe('cardiac')
    expect(result.current.filters).toEqual(makeFilters({ journal: 'The Lancet' }))
  })

  it('starts on the search view even when a previous session is restored', () => {
    // Arrange
    sessionStorage.setItem(
      SEARCH_STORAGE_KEY,
      JSON.stringify({
        query: 'cardiac',
        filters: makeFilters(),
        searchedQuery: 'cardiac',
        searchedFilters: makeFilters(),
        results: [makeArticle()],
        status: 'success',
      })
    )

    // Act
    const { result } = renderHook(() => useSearch())

    // Assert
    expect(result.current.view).toBe('search')
  })

  it('does not call the API when resubmitting a query restored from a previous session', () => {
    // Arrange
    sessionStorage.setItem(
      SEARCH_STORAGE_KEY,
      JSON.stringify({
        query: 'cardiac',
        filters: makeFilters(),
        searchedQuery: 'cardiac',
        searchedFilters: makeFilters(),
        results: [makeArticle()],
        status: 'success',
      })
    )
    const { result } = renderHook(() => useSearch())

    // Act
    act(() => {
      result.current.search('cardiac')
    })

    // Assert
    expect(result.current.view).toBe('results')
    expect(result.current.results).toHaveLength(1)
    expect(mockedSearchArticles).not.toHaveBeenCalled()
  })

  it('still re-fetches a restored query if the user changes it before resubmitting', async () => {
    // Arrange
    sessionStorage.setItem(
      SEARCH_STORAGE_KEY,
      JSON.stringify({
        query: 'cardiac',
        filters: makeFilters(),
        searchedQuery: 'cardiac',
        searchedFilters: makeFilters(),
        results: [makeArticle()],
        status: 'success',
      })
    )
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle({ pmid: 'new' })], 'diabetes'))
    const { result } = renderHook(() => useSearch())

    // Act
    act(() => {
      result.current.search('diabetes')
    })

    // Assert
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(mockedSearchArticles).toHaveBeenCalledTimes(1)
    expect(result.current.results[0].pmid).toBe('new')
  })

  it('persists query, filters, and a successful search to sessionStorage', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    const { result } = renderHook(() => useSearch())

    // Act
    act(() => {
      result.current.search('cardiac')
    })
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Assert
    const stored = JSON.parse(sessionStorage.getItem(SEARCH_STORAGE_KEY)!)
    expect(stored.searchedQuery).toBe('cardiac')
    expect(stored.status).toBe('success')
    expect(stored.results).toHaveLength(1)
  })

  it('persists the query as the user types, before any search is submitted', () => {
    // Arrange
    const { result } = renderHook(() => useSearch())

    // Act
    act(() => {
      result.current.setQuery('cardiac')
    })

    // Assert
    const stored = JSON.parse(sessionStorage.getItem(SEARCH_STORAGE_KEY)!)
    expect(stored.query).toBe('cardiac')
  })

  describe('loadMore', () => {
    it('exposes total and hasMore after an initial search', async () => {
      // Arrange
      mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()], 'cardiac', 40))
      const { result } = renderHook(() => useSearch())

      // Act
      act(() => {
        result.current.search('cardiac')
      })
      await waitFor(() => expect(result.current.status).toBe('success'))

      // Assert
      expect(result.current.total).toBe(40)
      expect(result.current.hasMore).toBe(true)
    })

    it('appends the next batch to existing results and updates total', async () => {
      // Arrange
      const first = makeArticle({ pmid: '1' })
      const second = makeArticle({ pmid: '2' })
      mockedSearchArticles.mockResolvedValueOnce(makeResponse([first], 'cardiac', 2))
      const { result } = renderHook(() => useSearch())
      act(() => {
        result.current.search('cardiac')
      })
      await waitFor(() => expect(result.current.status).toBe('success'))
      mockedSearchArticles.mockResolvedValueOnce(makeResponse([second], 'cardiac', 2))

      // Act
      act(() => {
        result.current.loadMore()
      })
      await waitFor(() => expect(result.current.isLoadingMore).toBe(false))

      // Assert
      expect(result.current.results.map((a) => a.pmid)).toEqual(['1', '2'])
      expect(result.current.total).toBe(2)
      expect(result.current.hasMore).toBe(false)
      expect(mockedSearchArticles).toHaveBeenLastCalledWith(
        'cardiac',
        { journal: '', date_from: '', date_to: '' },
        1
      )
    })

    it('sets isLoadingMore while the next batch is in flight', async () => {
      // Arrange
      mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle()], 'cardiac', 2))
      const { result } = renderHook(() => useSearch())
      act(() => {
        result.current.search('cardiac')
      })
      await waitFor(() => expect(result.current.status).toBe('success'))

      let resolveNext: (value: SearchResponse) => void = () => {}
      mockedSearchArticles.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveNext = resolve
        })
      )

      // Act
      act(() => {
        result.current.loadMore()
      })

      // Assert
      expect(result.current.isLoadingMore).toBe(true)
      await act(async () => {
        resolveNext(makeResponse([makeArticle({ pmid: 'second' })], 'cardiac', 2))
      })
      expect(result.current.isLoadingMore).toBe(false)
    })

    it('does not fetch again once all results are loaded', async () => {
      // Arrange
      mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()], 'cardiac', 1))
      const { result } = renderHook(() => useSearch())
      act(() => {
        result.current.search('cardiac')
      })
      await waitFor(() => expect(result.current.status).toBe('success'))
      expect(result.current.hasMore).toBe(false)

      // Act
      act(() => {
        result.current.loadMore()
      })

      // Assert
      expect(mockedSearchArticles).toHaveBeenCalledTimes(1)
    })

    it('keeps existing results and sets loadMoreError when the next batch fails', async () => {
      // Arrange
      mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle()], 'cardiac', 2))
      const { result } = renderHook(() => useSearch())
      act(() => {
        result.current.search('cardiac')
      })
      await waitFor(() => expect(result.current.status).toBe('success'))
      mockedSearchArticles.mockRejectedValueOnce(new Error('API error: 502'))

      // Act
      act(() => {
        result.current.loadMore()
      })
      await waitFor(() => expect(result.current.isLoadingMore).toBe(false))

      // Assert
      expect(result.current.loadMoreError).toBeTruthy()
      expect(result.current.results).toHaveLength(1)
    })

    it('clears a prior loadMoreError on the next successful attempt', async () => {
      // Arrange
      mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle()], 'cardiac', 2))
      const { result } = renderHook(() => useSearch())
      act(() => {
        result.current.search('cardiac')
      })
      await waitFor(() => expect(result.current.status).toBe('success'))
      mockedSearchArticles.mockRejectedValueOnce(new Error('API error: 502'))
      act(() => {
        result.current.loadMore()
      })
      await waitFor(() => expect(result.current.loadMoreError).toBeTruthy())
      mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle({ pmid: 'second' })], 'cardiac', 2))

      // Act
      act(() => {
        result.current.loadMore()
      })
      await waitFor(() => expect(result.current.isLoadingMore).toBe(false))

      // Assert
      expect(result.current.loadMoreError).toBeNull()
      expect(result.current.results).toHaveLength(2)
    })

    it('discards a stale loadMore response superseded by a new search', async () => {
      // Arrange
      mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle({ pmid: '1' })], 'cardiac', 2))
      const { result } = renderHook(() => useSearch())
      act(() => {
        result.current.search('cardiac')
      })
      await waitFor(() => expect(result.current.status).toBe('success'))

      let resolveLoadMore: (value: SearchResponse) => void = () => {}
      mockedSearchArticles.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveLoadMore = resolve
        })
      )
      act(() => {
        result.current.loadMore()
      })

      mockedSearchArticles.mockResolvedValueOnce(
        makeResponse([makeArticle({ pmid: 'new' })], 'diabetes', 1)
      )

      // Act — a brand new search supersedes the in-flight loadMore
      act(() => {
        result.current.search('diabetes')
      })
      await waitFor(() => expect(result.current.status).toBe('success'))
      expect(result.current.searchedQuery).toBe('diabetes')

      act(() => {
        resolveLoadMore(makeResponse([makeArticle({ pmid: 'stale' })], 'cardiac', 2))
      })

      // Assert
      expect(result.current.searchedQuery).toBe('diabetes')
      expect(result.current.results.map((a) => a.pmid)).toEqual(['new'])
    })

    it('persists the full accumulated results and total across a simulated reload', async () => {
      // Arrange
      mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle({ pmid: '1' })], 'cardiac', 2))
      const { result } = renderHook(() => useSearch())
      act(() => {
        result.current.search('cardiac')
      })
      await waitFor(() => expect(result.current.status).toBe('success'))
      mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle({ pmid: '2' })], 'cardiac', 2))
      act(() => {
        result.current.loadMore()
      })
      await waitFor(() => expect(result.current.isLoadingMore).toBe(false))

      // Act — simulate a reload by mounting a fresh hook instance
      const { result: reloaded } = renderHook(() => useSearch())

      // Assert
      expect(reloaded.current.results.map((a) => a.pmid)).toEqual(['1', '2'])
      expect(reloaded.current.total).toBe(2)
      expect(reloaded.current.hasMore).toBe(false)
    })
  })
})
