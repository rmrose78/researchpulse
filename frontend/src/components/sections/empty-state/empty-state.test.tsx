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

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<EmptyState query="cardiac" />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
