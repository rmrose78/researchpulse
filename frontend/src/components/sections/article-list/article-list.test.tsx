import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { act, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import ArticleList from './article-list'
import ReadingListProvider from '@/components/providers/reading-list-provider'
import { getSavedArticles } from '@/utils/api'
import type { ArticleSearchResult } from '@/types'

jest.mock('@/utils/api', () => ({
  getSavedArticles: jest.fn(),
  saveArticle: jest.fn(),
  removeSavedArticle: jest.fn(),
}))

const mockedGetSavedArticles = jest.mocked(getSavedArticles)

function makeArticle(overrides: Partial<ArticleSearchResult> = {}): ArticleSearchResult {
  return {
    pmid: '123',
    title: 'Cardiac remodeling after myocardial infarction',
    abstract: 'Short abstract.',
    authors: ['Smith J'],
    journal: 'Journal of Cardiology',
    pub_date: '2026-01-15',
    doi: null,
    ...overrides,
  }
}

async function renderList(articles: ArticleSearchResult[]) {
  const utils = render(
    <ReadingListProvider>
      <ArticleList articles={articles} />
    </ReadingListProvider>
  )
  // Flush the provider's initial getSavedArticles() fetch so its resolution
  // doesn't land after the test (and its act(...) wrapper) has finished.
  await act(async () => {})
  return utils
}

beforeEach(() => {
  mockedGetSavedArticles.mockReset()
  mockedGetSavedArticles.mockResolvedValue([])
})

describe('ArticleList', () => {
  it('renders one card per article', async () => {
    // Arrange
    const articles = [
      makeArticle({ pmid: '1', title: 'First article' }),
      makeArticle({ pmid: '2', title: 'Second article' }),
    ]

    // Act
    await renderList(articles)

    // Assert
    expect(screen.getByRole('heading', { name: /first article/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /second article/i })).toBeInTheDocument()
  })

  it('renders an empty list with no items when given no articles', async () => {
    // Arrange & Act
    await renderList([])

    // Assert
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = await renderList([makeArticle()])

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
