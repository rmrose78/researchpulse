import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import EmptyState from './empty-state'

describe('EmptyState', () => {
  it('shows the friendly no-results message including the query', () => {
    // Arrange & Act
    render(<EmptyState query="cardiac" />)

    // Assert
    expect(screen.getByText(/no results found for 'cardiac' — try a different search term/i)).toBeInTheDocument()
  })

  it('shows a custom message when provided, ignoring query', () => {
    // Arrange & Act
    render(<EmptyState message="Your reading list is empty — save an article from search to see it here." />)

    // Assert
    expect(
      screen.getByText(/your reading list is empty — save an article from search to see it here\./i)
    ).toBeInTheDocument()
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<EmptyState query="cardiac" />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
