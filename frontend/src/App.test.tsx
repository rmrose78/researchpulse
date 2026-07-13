import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
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

describe('App', () => {
  it('shows the search screen with no results screen on first load', () => {
    // Arrange & Act
    render(<App />)

    // Assert
    expect(screen.getByRole('textbox', { name: /search pubmed/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /results for/i })).not.toBeInTheDocument()
  })

  it('blocks a short query without calling the API or leaving the search screen', async () => {
    // Arrange
    render(<App />)

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'a{Enter}')

    // Assert
    expect(mockedSearchArticles).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /search pubmed/i })).toBeInTheDocument()
  })

  it('searches, hides the search bar, and shows results as cards', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    render(<App />)

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac{Enter}')

    // Assert
    expect(screen.queryByRole('textbox', { name: /search pubmed/i })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('heading', { name: /a cardiac study/i })).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: /results for 'cardiac'/i })).toBeInTheDocument()
  })

  it('going back preserves the typed query and does not re-call the API on an unchanged resubmit', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    render(<App />)
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac{Enter}')
    await waitFor(() => expect(screen.getByRole('heading', { name: /a cardiac study/i })).toBeInTheDocument())

    // Act
    await userEvent.click(screen.getByRole('button', { name: /new search/i }))

    // Assert
    const input = screen.getByRole('textbox', { name: /search pubmed/i })
    expect(input).toHaveValue('cardiac')

    // Act — resubmit the identical query
    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    // Assert — cached results reappear without a second network call
    await waitFor(() => expect(screen.getByRole('heading', { name: /a cardiac study/i })).toBeInTheDocument())
    expect(mockedSearchArticles).toHaveBeenCalledTimes(1)
  })

  it('shows an empty state for zero results, not an error', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([]))
    render(<App />)

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'zzznotreal{Enter}')

    // Assert
    await waitFor(() => expect(screen.getByText(/no results found for 'zzznotreal'/i)).toBeInTheDocument())
  })

  it('passes filled-in filters through to the search request', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    render(<App />)
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

  it('submitting with no filters set matches unfiltered search behavior', async () => {
    // Arrange
    mockedSearchArticles.mockResolvedValue(makeResponse([makeArticle()]))
    render(<App />)

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac{Enter}')

    // Assert
    await waitFor(() => expect(mockedSearchArticles).toHaveBeenCalledTimes(1))
    expect(mockedSearchArticles).toHaveBeenCalledWith('cardiac', {
      journal: '',
      date_from: '',
      date_to: '',
    })
  })

  it('shows an error state on API failure with a working retry', async () => {
    // Arrange
    mockedSearchArticles.mockRejectedValueOnce(new Error('API error: 502'))
    mockedSearchArticles.mockResolvedValueOnce(makeResponse([makeArticle()]))
    render(<App />)
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac{Enter}')
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

    // Act
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))

    // Assert
    await waitFor(() => expect(screen.getByRole('heading', { name: /a cardiac study/i })).toBeInTheDocument())
    expect(mockedSearchArticles).toHaveBeenCalledTimes(2)
  })
})
