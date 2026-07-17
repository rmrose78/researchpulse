import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { act, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import ArticleList from './article-list'
import ReadingListProvider from '@/components/providers/reading-list-provider'
import { getSavedArticles } from '@/utils/api'
import type { ArticleSearchResult, CitationStat, RankMovement } from '@/types'

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
    publication_types: [],
    ...overrides,
  }
}

async function renderList(
  articles: ArticleSearchResult[],
  citationStats?: Record<string, CitationStat>,
  notableTypes?: Record<string, string>,
  rankMovements?: Record<string, RankMovement>,
  whyTrending?: Record<string, string>
) {
  const utils = render(
    <ReadingListProvider>
      <ArticleList
        articles={articles}
        citationStats={citationStats}
        notableTypes={notableTypes}
        rankMovements={rankMovements}
        whyTrending={whyTrending}
      />
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

  it('passes the matching citationStat through to each card by pmid', async () => {
    // Arrange
    const articles = [makeArticle({ pmid: '1' }), makeArticle({ pmid: '2' })]
    const citationStats = { '1': { count: 14, velocity: 0.8 } }

    // Act
    await renderList(articles, citationStats)

    // Assert
    expect(screen.getByText('14 citations · velocity 0.80')).toBeInTheDocument()
  })

  it('passes the matching notableType through to each card by pmid', async () => {
    // Arrange
    const articles = [makeArticle({ pmid: '1' }), makeArticle({ pmid: '2' })]
    const notableTypes = { '1': 'Randomized Controlled Trial' }

    // Act
    await renderList(articles, undefined, notableTypes)

    // Assert
    expect(screen.getByText('Randomized Controlled Trial')).toBeInTheDocument()
  })

  it('passes the matching rankMovement through to each card by pmid', async () => {
    // Arrange
    const articles = [makeArticle({ pmid: '1' }), makeArticle({ pmid: '2' })]
    const rankMovements = { '1': { delta: null, isNew: true } }

    // Act
    await renderList(articles, undefined, undefined, rankMovements)

    // Assert
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })

  it('passes the matching whyTrending sentence through to each card by pmid', async () => {
    // Arrange
    const articles = [makeArticle({ pmid: '1' }), makeArticle({ pmid: '2' })]
    const whyTrending = { '1': '41 citations in its first 90 days' }

    // Act
    await renderList(articles, undefined, undefined, undefined, whyTrending)

    // Assert
    expect(screen.getByText('41 citations in its first 90 days')).toBeInTheDocument()
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
