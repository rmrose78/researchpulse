import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import Hero from './hero'

describe('Hero', () => {
  it('renders a labelled section with a heading and the given children', () => {
    // Arrange
    render(
      <Hero>
        <p>Child content</p>
      </Hero>
    )

    // Act
    const heading = screen.getByRole('heading', { level: 1 })
    const section = screen.getByRole('region', { name: heading.textContent ?? '' })

    // Assert
    expect(section).toContainElement(heading)
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(
      <Hero>
        <p>Child content</p>
      </Hero>
    )

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
