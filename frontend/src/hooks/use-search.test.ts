import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useSearch } from './use-search'
import { searchArticles } from '@/utils/api'
import type { ArticleSearchResult, SearchResponse } from '@/types'

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

function makeResponse(results: ArticleSearchResult[], query = 'cardiac'): SearchResponse {
  return { total: results.length, results, query }
}

beforeEach(() => {
  mockedSearchArticles.mockReset()
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
})
