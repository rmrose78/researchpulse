import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import ReadingListPage from './reading-list-page'

describe('ReadingListPage', () => {
  it('renders a heading and placeholder message', () => {
    // Arrange & Act
    render(<ReadingListPage />)

    // Assert
    expect(screen.getByRole('heading', { name: /^reading list$/i })).toBeInTheDocument()
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<ReadingListPage />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
