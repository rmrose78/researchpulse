import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import HowItWorksPage from './how-it-works-page'

describe('HowItWorksPage', () => {
  it('renders the page heading and all five section headings', () => {
    // Arrange & Act
    render(<HowItWorksPage />)

    // Assert
    expect(screen.getByRole('heading', { name: /^how it works$/i, level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /data sources/i, level: 2 })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /specialties & time range/i, level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /citation velocity/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^notability$/i, level: 2 })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /freshness & caching/i, level: 2 })
    ).toBeInTheDocument()
  })

  it('explains the velocity formula and the data sources', () => {
    // Arrange & Act
    render(<HowItWorksPage />)

    // Assert
    expect(screen.getByText(/citations ÷ \(days since publication \+ 21\)/i)).toBeInTheDocument()
    expect(screen.getAllByText(/pubmed/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/semantic scholar/i)).toBeInTheDocument()
  })

  it('explains the evidence-tier notability signal', () => {
    // Arrange & Act
    render(<HowItWorksPage />)

    // Assert
    expect(screen.getAllByText(/randomized controlled trial/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/meta-analysis|systematic review/i).length).toBeGreaterThan(0)
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<HowItWorksPage />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
