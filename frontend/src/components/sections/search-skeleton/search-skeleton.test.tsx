import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import SearchSkeleton from './search-skeleton'

describe('SearchSkeleton', () => {
  it('announces loading to assistive tech', () => {
    // Arrange & Act
    render(<SearchSkeleton />)

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/loading results/i)
  })

  it('renders the requested number of placeholder cards', () => {
    // Arrange & Act
    const { container } = render(<SearchSkeleton count={5} />)

    // Assert
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5)
  })

  it('defaults to 3 placeholder cards', () => {
    // Arrange & Act
    const { container } = render(<SearchSkeleton />)

    // Assert
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3)
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<SearchSkeleton />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
