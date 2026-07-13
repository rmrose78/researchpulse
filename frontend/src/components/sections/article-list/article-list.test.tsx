import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import ArticleList from './article-list'
import type { ArticleSearchResult } from '@/types'

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

describe('ArticleList', () => {
  it('renders one card per article', () => {
    // Arrange
    const articles = [
      makeArticle({ pmid: '1', title: 'First article' }),
      makeArticle({ pmid: '2', title: 'Second article' }),
    ]

    // Act
    render(<ArticleList articles={articles} />)

    // Assert
    expect(screen.getByRole('heading', { name: /first article/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /second article/i })).toBeInTheDocument()
  })

  it('renders an empty list with no items when given no articles', () => {
    // Arrange & Act
    render(<ArticleList articles={[]} />)

    // Assert
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<ArticleList articles={[makeArticle()]} />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
