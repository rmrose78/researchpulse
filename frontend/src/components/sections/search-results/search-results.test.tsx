import { describe, it, expect, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import SearchResults from './search-results'
import type { ArticleSearchResult } from '@/types'

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

const loadMoreDefaults = {
  total: 1,
  hasMore: false,
  isLoadingMore: false,
  loadMoreError: null,
  onLoadMore: jest.fn(),
}

describe('SearchResults', () => {
  it('shows a heading with the searched query', () => {
    // Arrange & Act
    render(
      <SearchResults
        status="success"
        results={[makeArticle()]}
        query="cardiac"
        onBack={jest.fn()}
        onRetry={jest.fn()}
        {...loadMoreDefaults}
      />
    )

    // Assert
    expect(screen.getByRole('heading', { name: /results for 'cardiac'/i })).toBeInTheDocument()
  })

  it('moves focus to the heading on mount', async () => {
    // Arrange & Act
    render(
      <SearchResults
        status="success"
        results={[makeArticle()]}
        query="cardiac"
        onBack={jest.fn()}
        onRetry={jest.fn()}
        {...loadMoreDefaults}
      />
    )

    // Assert
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /results for 'cardiac'/i })).toHaveFocus()
    )
  })

  it('calls onBack when the back button is clicked', async () => {
    // Arrange
    const onBack = jest.fn()
    render(
      <SearchResults
        status="success"
        results={[]}
        query="cardiac"
        onBack={onBack}
        onRetry={jest.fn()}
        {...loadMoreDefaults}
      />
    )

    // Act
    await userEvent.click(screen.getByRole('button', { name: /new search/i }))

    // Assert
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('renders a skeleton while loading', () => {
    // Arrange & Act
    render(
      <SearchResults
        status="loading"
        results={[]}
        query="cardiac"
        onBack={jest.fn()}
        onRetry={jest.fn()}
        {...loadMoreDefaults}
      />
    )

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/loading results/i)
  })

  it('renders the article list on success', () => {
    // Arrange & Act
    render(
      <SearchResults
        status="success"
        results={[makeArticle({ title: 'Unique cardiac title' })]}
        query="cardiac"
        onBack={jest.fn()}
        onRetry={jest.fn()}
        {...loadMoreDefaults}
      />
    )

    // Assert
    expect(screen.getByRole('heading', { name: /unique cardiac title/i })).toBeInTheDocument()
  })

  it('renders the empty state with the query on empty', () => {
    // Arrange & Act
    render(
      <SearchResults
        status="empty"
        results={[]}
        query="zzznotreal"
        onBack={jest.fn()}
        onRetry={jest.fn()}
        {...loadMoreDefaults}
      />
    )

    // Assert
    expect(screen.getByText(/no results found for 'zzznotreal'/i)).toBeInTheDocument()
  })

  it('renders the error state and wires retry on error', async () => {
    // Arrange
    const onRetry = jest.fn()
    render(
      <SearchResults
        status="error"
        results={[]}
        query="cardiac"
        onBack={jest.fn()}
        onRetry={onRetry}
        {...loadMoreDefaults}
      />
    )

    // Act
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))

    // Assert
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('has no automatically detectable accessibility violations for each status', async () => {
    // Arrange
    const statuses = ['loading', 'success', 'empty', 'error'] as const

    for (const status of statuses) {
      const { container, unmount } = render(
        <SearchResults
          status={status}
          results={[makeArticle()]}
          query="cardiac"
          onBack={jest.fn()}
          onRetry={jest.fn()}
          {...loadMoreDefaults}
        />
      )

      // Act
      const results = await axe(container)

      // Assert
      expect(results).toHaveNoViolations()
      unmount()
    }
  })

  it('shows the Load more footer on success when more results are available', () => {
    // Arrange & Act
    render(
      <SearchResults
        status="success"
        results={[makeArticle()]}
        query="cardiac"
        onBack={jest.fn()}
        onRetry={jest.fn()}
        {...loadMoreDefaults}
        total={40}
        hasMore
      />
    )

    // Assert
    expect(screen.getByText('Showing 1 of 40 results')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument()
  })

  it('calls onLoadMore when the Load more button is clicked', async () => {
    // Arrange
    const onLoadMore = jest.fn()
    render(
      <SearchResults
        status="success"
        results={[makeArticle()]}
        query="cardiac"
        onBack={jest.fn()}
        onRetry={jest.fn()}
        {...loadMoreDefaults}
        total={40}
        hasMore
        onLoadMore={onLoadMore}
      />
    )

    // Act
    await userEvent.click(screen.getByRole('button', { name: /load more/i }))

    // Assert
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('does not show the Load more footer on non-success statuses', () => {
    // Arrange & Act
    render(
      <SearchResults
        status="loading"
        results={[]}
        query="cardiac"
        onBack={jest.fn()}
        onRetry={jest.fn()}
        {...loadMoreDefaults}
        total={40}
        hasMore
      />
    )

    // Assert
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
  })
})
