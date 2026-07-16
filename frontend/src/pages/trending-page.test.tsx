import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import TrendingPage from './trending-page'
import ReadingListProvider from '@/components/providers/reading-list-provider'
import { getSavedArticles, getTrending, getTrendingAvailability, searchArticles } from '@/utils/api'
import { DEFAULT_SPECIALTY } from '@/utils/specialties'
import { DEFAULT_WINDOW_DAYS } from '@/utils/time-ranges'
import type { ArticleSearchResult, SearchResponse, TrendingResponse } from '@/types'

jest.mock('@/utils/api', () => ({
  searchArticles: jest.fn(),
  getSavedArticles: jest.fn(),
  saveArticle: jest.fn(),
  removeSavedArticle: jest.fn(),
  getTrending: jest.fn(),
  getTrendingAvailability: jest.fn(),
}))

const mockedSearchArticles = jest.mocked(searchArticles)
const mockedGetSavedArticles = jest.mocked(getSavedArticles)
const mockedGetTrending = jest.mocked(getTrending)
const mockedGetTrendingAvailability = jest.mocked(getTrendingAvailability)

function makeTrendingResponse(overrides: Partial<TrendingResponse> = {}): TrendingResponse {
  return {
    specialty: DEFAULT_SPECIALTY,
    window_days: DEFAULT_WINDOW_DAYS,
    computed_at: '2026-01-01T00:00:00Z',
    results: [],
    ...overrides,
  }
}

async function renderPage() {
  const utils = render(
    <MemoryRouter>
      <ReadingListProvider>
        <TrendingPage />
      </ReadingListProvider>
    </MemoryRouter>
  )
  // Flush the provider's initial getSavedArticles() fetch so its resolution
  // doesn't land after the test (and its act(...) wrapper) has finished.
  await act(async () => {})
  return utils
}

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
  mockedGetSavedArticles.mockReset()
  mockedGetSavedArticles.mockResolvedValue([])
  mockedGetTrending.mockReset()
  mockedGetTrending.mockResolvedValue(makeTrendingResponse())
  mockedGetTrendingAvailability.mockReset()
  mockedGetTrendingAvailability.mockResolvedValue({ window_days: DEFAULT_WINDOW_DAYS, available: {} })
  sessionStorage.clear()
})

async function expandSearch() {
  await userEvent.click(screen.getByRole('button', { name: /^search pubmed$/i }))
}

describe('TrendingPage', () => {
  it('shows trending content, the specialty selector, and a search toggle by default', async () => {
    // Arrange & Act
    await renderPage()

    // Assert
    expect(screen.getByRole('heading', { name: /^trending$/i })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /specialty/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^search pubmed$/i })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /search pubmed/i })).not.toBeInTheDocument()
  })

  it('shows trending results once loaded, with a freshness indicator', async () => {
    // Arrange
    mockedGetTrending.mockResolvedValue(
      makeTrendingResponse({
        computed_at: '2026-01-01T00:00:00Z',
        results: [
          {
            pmid: '123',
            title: 'A trending cardiac study',
            abstract: null,
            authors: [],
            journal: null,
            pub_date: '2025/Jan',
            doi: null,
            citation_count: 14,
            velocity: 0.8,
          },
        ],
      })
    )

    // Act
    await renderPage()

    // Assert
    expect(await screen.findByRole('heading', { name: /a trending cardiac study/i })).toBeInTheDocument()
    expect(screen.getByText('14 citations · velocity 0.80')).toBeInTheDocument()
    expect(screen.getByText(/updated .* · via semantic scholar/i)).toBeInTheDocument()
  })

  it('shows a "how is this calculated" trigger next to the freshness line once loaded', async () => {
    // Arrange & Act
    await renderPage()

    // Assert
    expect(
      await screen.findByRole('button', { name: /how is this calculated/i })
    ).toBeInTheDocument()
  })

  it('shows an empty state when a specialty has no trending results', async () => {
    // Arrange
    mockedGetTrending.mockResolvedValue(makeTrendingResponse({ results: [] }))

    // Act
    await renderPage()

    // Assert
    expect(await screen.findByText(/no trending articles found/i)).toBeInTheDocument()
  })

  it('shows an error state with retry when trending fails to load', async () => {
    // Arrange
    mockedGetTrending.mockRejectedValueOnce(new Error('API error: 502'))
    mockedGetTrending.mockResolvedValueOnce(makeTrendingResponse())
    await renderPage()
    await screen.findByRole('alert')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))

    // Assert
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })

  it('switching specialty requests trending data for the newly selected specialty', async () => {
    // Arrange
    await renderPage()
    await waitFor(() => expect(mockedGetTrending).toHaveBeenCalledTimes(1))

    // Act
    await userEvent.click(screen.getByRole('radio', { name: /oncology/i }))

    // Assert
    await waitFor(() =>
      expect(mockedGetTrending).toHaveBeenLastCalledWith('oncology', DEFAULT_WINDOW_DAYS)
    )
  })

  it('shows the time range selector and switching it requests the current specialty at the new range', async () => {
    // Arrange
    await renderPage()
    await waitFor(() => expect(mockedGetTrending).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('radiogroup', { name: /time range/i })).toBeInTheDocument()

    // Act
    await userEvent.click(screen.getByRole('radio', { name: '60 days' }))

    // Assert
    await waitFor(() =>
      expect(mockedGetTrending).toHaveBeenLastCalledWith(DEFAULT_SPECIALTY, 60)
    )
  })

  it('disables a specialty pill already known to have no results at the current range', async () => {
    // Arrange
    mockedGetTrendingAvailability.mockResolvedValue({
      window_days: DEFAULT_WINDOW_DAYS,
      available: { oncology: false },
    })

    // Act
    await renderPage()

    // Assert
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: /oncology/i })).toBeDisabled()
    )
  })

  it('clicking the search toggle reveals the search form and hides the trending content', async () => {
    // Arrange
    await renderPage()

    // Act
    await expandSearch()

    // Assert
    expect(screen.getByRole('textbox', { name: /search pubmed/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /^trending$/i })).not.toBeInTheDocument()
    // The collapse ("Hide search") control is deferred for now — no toggle
    // button is rendered once the search form is expanded.
    expect(screen.queryByRole('button', { name: /^search pubmed$/i })).not.toBeInTheDocument()
  })

  it('blocks a short query without calling the API or leaving the search form', async () => {
    // Arrange
    await renderPage()
    await expandSearch()

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'a{Enter}')

    // Assert
    expect(mockedSearchArticles).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /search pubmed/i })).toBeInTheDocument()
  })

  it('searches and shows results as cards, replacing the search form', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    await renderPage()
    await expandSearch()

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac{Enter}')

    // Assert
    expect(screen.queryByRole('textbox', { name: /search pubmed/i })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('heading', { name: /a cardiac study/i })).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: /results for 'cardiac'/i })).toBeInTheDocument()
  })

  it('going back to trending from results preserves the typed query without re-calling the API on an unchanged resubmit', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    await renderPage()
    await expandSearch()
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac{Enter}')
    await waitFor(() => expect(screen.getByRole('heading', { name: /a cardiac study/i })).toBeInTheDocument())

    // Act
    await userEvent.click(screen.getByRole('button', { name: /back to trending/i }))

    // Assert — back on the trending default, not the empty search form
    expect(screen.getByRole('heading', { name: /^trending$/i })).toBeInTheDocument()

    // Act — reopen search, the query is still there, resubmit unchanged
    await expandSearch()
    const input = screen.getByRole('textbox', { name: /search pubmed/i })
    expect(input).toHaveValue('cardiac')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    // Assert — cached results reappear without a second network call
    await waitFor(() => expect(screen.getByRole('heading', { name: /a cardiac study/i })).toBeInTheDocument())
    expect(mockedSearchArticles).toHaveBeenCalledTimes(1)
  })

  it('shows an empty state for zero results, not an error', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([]))
    await renderPage()
    await expandSearch()

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'zzznotreal{Enter}')

    // Assert
    await waitFor(() => expect(screen.getByText(/no results found for 'zzznotreal'/i)).toBeInTheDocument())
  })

  it('passes filled-in filters through to the search request', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    await renderPage()
    await expandSearch()
    await userEvent.click(screen.getByRole('button', { name: /show filters/i }))
    await userEvent.type(screen.getByLabelText(/journal/i), 'The Lancet')
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    // Assert
    await waitFor(() => expect(mockedSearchArticles).toHaveBeenCalledTimes(1))
    expect(mockedSearchArticles).toHaveBeenCalledWith('cardiac', {
      journal: 'The Lancet',
      date_from: '',
      date_to: '',
    })
  })

  it('shows an error state on API failure with a working retry', async () => {
    // Arrange
    mockedSearchArticles.mockRejectedValueOnce(new Error('API error: 502'))
    mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle()]))
    await renderPage()
    await expandSearch()
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac{Enter}')
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

    // Act
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))

    // Assert
    await waitFor(() => expect(screen.getByRole('heading', { name: /a cardiac study/i })).toBeInTheDocument())
    expect(mockedSearchArticles).toHaveBeenCalledTimes(2)
  })

  it('has no automatically detectable accessibility violations on the trending default', async () => {
    // Arrange
    const { container } = await renderPage()

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })

  it('has no automatically detectable accessibility violations with the search form expanded', async () => {
    // Arrange
    const { container } = await renderPage()
    await expandSearch()

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
