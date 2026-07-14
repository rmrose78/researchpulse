import { describe, it, expect, beforeAll } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import ArticleCard from './article-card'
import type { ArticleSearchResult } from '@/types'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  })
})

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

  it('renders the abstract collapsed (clamped) by default', () => {
    // Arrange
    const longAbstract = 'x'.repeat(400)

    // Act
    render(<ArticleCard article={makeArticle({ abstract: longAbstract })} />)

    // Assert
    expect(screen.getByText(longAbstract)).toHaveAttribute('data-expanded', 'false')
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

  it('does not render an expand control when abstract is null', () => {
    // Arrange & Act
    render(<ArticleCard article={makeArticle({ abstract: null })} />)

    // Assert
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders a collapsed Read more button when an abstract is present', () => {
    // Arrange & Act
    render(<ArticleCard article={makeArticle()} />)

    // Assert
    const button = screen.getByRole('button', { name: /read more/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands to show the full abstract when the button is clicked', async () => {
    // Arrange
    const longAbstract = 'x'.repeat(400)
    const user = userEvent.setup()
    render(<ArticleCard article={makeArticle({ abstract: longAbstract })} />)

    // Act
    await user.click(screen.getByRole('button', { name: /read more/i }))

    // Assert
    expect(screen.getByText(longAbstract)).toHaveAttribute('data-expanded', 'true')
    const button = screen.getByRole('button', { name: /show less/i })
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses back to the clamped abstract when clicked again', async () => {
    // Arrange
    const longAbstract = 'x'.repeat(400)
    const user = userEvent.setup()
    render(<ArticleCard article={makeArticle({ abstract: longAbstract })} />)
    await user.click(screen.getByRole('button', { name: /read more/i }))

    // Act
    await user.click(screen.getByRole('button', { name: /show less/i }))

    // Assert
    expect(screen.getByText(longAbstract)).toHaveAttribute('data-expanded', 'false')
    expect(screen.getByRole('button', { name: /read more/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('keeps each card expanded/collapsed independently of other cards', async () => {
    // Arrange
    const user = userEvent.setup()
    render(
      <>
        <ArticleCard article={makeArticle({ pmid: '1', abstract: 'x'.repeat(400) })} />
        <ArticleCard article={makeArticle({ pmid: '2', abstract: 'y'.repeat(400) })} />
      </>
    )

    // Act
    const [firstButton] = screen.getAllByRole('button', { name: /read more/i })
    await user.click(firstButton)

    // Assert
    expect(screen.getByText('x'.repeat(400))).toHaveAttribute('data-expanded', 'true')
    expect(screen.getByText('y'.repeat(400))).toHaveAttribute('data-expanded', 'false')
    expect(screen.getByRole('button', { name: /read more/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('has no automatically detectable accessibility violations when collapsed', async () => {
    // Arrange
    const { container } = render(<ArticleCard article={makeArticle()} />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })

  it('has no automatically detectable accessibility violations when expanded', async () => {
    // Arrange
    const user = userEvent.setup()
    const { container } = render(<ArticleCard article={makeArticle()} />)
    await user.click(screen.getByRole('button', { name: /read more/i }))

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
