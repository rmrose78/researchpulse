import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import ArticleCard from './article-card'
import type { ArticleSearchResult } from '@/types'

function makeArticle(overrides: Partial<ArticleSearchResult> = {}): ArticleSearchResult {
  return {
    pmid: '123',
    title: 'Cardiac remodeling after myocardial infarction',
    abstract: 'Short abstract.',
    authors: ['Smith J', 'Lee K'],
    journal: 'Journal of Cardiology',
    pub_date: '2026-01-15',
    doi: null,
    ...overrides,
  }
}

describe('ArticleCard', () => {
  it('renders the title', () => {
    // Arrange & Act
    render(<ArticleCard article={makeArticle()} />)

    // Assert
    expect(
      screen.getByRole('heading', { name: /cardiac remodeling after myocardial infarction/i })
    ).toBeInTheDocument()
  })

  it('truncates a long abstract', () => {
    // Arrange
    const longAbstract = 'x'.repeat(400)

    // Act
    render(<ArticleCard article={makeArticle({ abstract: longAbstract })} />)

    // Assert
    const rendered = screen.getByText(/x+…/)
    expect(rendered.textContent!.length).toBeLessThan(longAbstract.length)
    expect(rendered.textContent!.endsWith('…')).toBe(true)
  })

  it('renders no abstract paragraph when abstract is null', () => {
    // Arrange & Act
    render(<ArticleCard article={makeArticle({ abstract: null })} />)

    // Assert
    expect(screen.queryByText(/short abstract/i)).not.toBeInTheDocument()
  })

  it('shows authors, journal, and pub date in the metadata line', () => {
    // Arrange & Act
    render(<ArticleCard article={makeArticle()} />)

    // Assert
    expect(screen.getByText(/smith j, lee k/i)).toBeInTheDocument()
    expect(screen.getByText(/journal of cardiology/i)).toBeInTheDocument()
    expect(screen.getByText(/2026-01-15/)).toBeInTheDocument()
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<ArticleCard article={makeArticle()} />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
