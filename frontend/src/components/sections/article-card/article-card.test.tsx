import { describe, it, expect, beforeAll, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import ArticleCard from './article-card'
import type { ArticleSearchResult, CitationStat } from '@/types'

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

function renderCard(
  overrides: Partial<ArticleSearchResult> = {},
  isSaved = false,
  citationStat?: CitationStat
) {
  return render(
    <ArticleCard
      article={makeArticle(overrides)}
      isSaved={isSaved}
      onSaveToggle={jest.fn()}
      citationStat={citationStat}
    />
  )
}

describe('ArticleCard', () => {
  it('renders the title', () => {
    // Arrange & Act
    renderCard()

    // Assert
    expect(
      screen.getByRole('heading', { name: /cardiac remodeling after myocardial infarction/i })
    ).toBeInTheDocument()
  })

  it('renders the abstract collapsed (clamped) by default', () => {
    // Arrange
    const longAbstract = 'x'.repeat(400)

    // Act
    renderCard({ abstract: longAbstract })

    // Assert
    expect(screen.getByText(longAbstract)).toHaveAttribute('data-expanded', 'false')
  })

  it('renders no abstract paragraph when abstract is null', () => {
    // Arrange & Act
    renderCard({ abstract: null })

    // Assert
    expect(screen.queryByText(/short abstract/i)).not.toBeInTheDocument()
  })

  it('shows authors, journal, and pub date in the metadata line', () => {
    // Arrange & Act
    renderCard()

    // Assert
    expect(screen.getByText(/smith j, lee k/i)).toBeInTheDocument()
    expect(screen.getByText(/journal of cardiology/i)).toBeInTheDocument()
    expect(screen.getByText(/2026-01-15/)).toBeInTheDocument()
  })

  it('does not render an abstract expand control when abstract is null', () => {
    // Arrange & Act
    renderCard({ abstract: null })

    // Assert
    expect(screen.queryByRole('button', { name: /read more/i })).not.toBeInTheDocument()
  })

  it('renders a collapsed Read more button when an abstract is present', () => {
    // Arrange & Act
    renderCard()

    // Assert
    const button = screen.getByRole('button', { name: /read more/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands to show the full abstract when the button is clicked', async () => {
    // Arrange
    const longAbstract = 'x'.repeat(400)
    const user = userEvent.setup()
    renderCard({ abstract: longAbstract })

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
    renderCard({ abstract: longAbstract })
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
        <ArticleCard
          article={makeArticle({ pmid: '1', abstract: 'x'.repeat(400) })}
          isSaved={false}
          onSaveToggle={jest.fn()}
        />
        <ArticleCard
          article={makeArticle({ pmid: '2', abstract: 'y'.repeat(400) })}
          isSaved={false}
          onSaveToggle={jest.fn()}
        />
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

  it('shows an unpressed save toggle labeled to save when not yet saved', () => {
    // Arrange & Act
    renderCard({}, false)

    // Assert
    const button = screen.getByRole('button', { name: /save to reading list/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows a pressed save toggle labeled to remove when already saved', () => {
    // Arrange & Act
    renderCard({}, true)

    // Assert
    const button = screen.getByRole('button', { name: /remove from reading list/i })
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onSaveToggle with the article when the save toggle is clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSaveToggle = jest.fn()
    const article = makeArticle()
    render(<ArticleCard article={article} isSaved={false} onSaveToggle={onSaveToggle} />)

    // Act
    await user.click(screen.getByRole('button', { name: /save to reading list/i }))

    // Assert
    expect(onSaveToggle).toHaveBeenCalledWith(article)
  })

  it('renders no citation stat line when citationStat is not provided', () => {
    // Arrange & Act
    renderCard()

    // Assert
    expect(screen.queryByText(/citation/i)).not.toBeInTheDocument()
  })

  it('renders the citation count and velocity when citationStat is provided', () => {
    // Arrange & Act
    renderCard({}, false, { count: 14, velocity: 0.8 })

    // Assert
    expect(screen.getByText('14 citations · velocity 0.80')).toBeInTheDocument()
  })

  it('uses singular "citation" for a count of exactly one', () => {
    // Arrange & Act
    renderCard({}, false, { count: 1, velocity: 0.1 })

    // Assert
    expect(screen.getByText(/^1 citation ·/)).toBeInTheDocument()
  })

  it('has no automatically detectable accessibility violations when collapsed', async () => {
    // Arrange
    const { container } = renderCard()

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })

  it('has no automatically detectable accessibility violations when expanded', async () => {
    // Arrange
    const user = userEvent.setup()
    const { container } = renderCard()
    await user.click(screen.getByRole('button', { name: /read more/i }))

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
