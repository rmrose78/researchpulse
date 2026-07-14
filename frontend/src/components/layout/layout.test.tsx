import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import Layout from './layout'

function renderLayout(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Layout>
        <p>Page content</p>
      </Layout>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  it('renders nav and main landmarks with a working skip link', () => {
    // Arrange
    renderLayout()

    // Act
    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    const main = screen.getByRole('main')

    // Assert
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: /primary/i })
    ).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', `#${main.id}`)
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('nav is wrapped in a header landmark, and the brand links home', () => {
    // Arrange
    renderLayout()

    // Act
    const header = screen.getByRole('banner')
    const nav = screen.getByRole('navigation', { name: /primary/i })
    const brandLink = screen.getByRole('link', { name: /researchpulse home/i })

    // Assert
    expect(header).toContainElement(nav)
    expect(nav).toContainElement(brandLink)
    expect(brandLink).toHaveAttribute('href', '/')
  })

  it('renders nav links to trending and reading list, with the brand also covering home', () => {
    // Arrange
    renderLayout()

    // Act & Assert
    expect(screen.getByRole('link', { name: /^trending$/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /^reading list$/i })).toHaveAttribute(
      'href',
      '/reading-list'
    )
    expect(screen.queryByRole('link', { name: /^search$/i })).not.toBeInTheDocument()
  })

  it('marks the brand and the trending link as active via aria-current on the merged trending/search route, and no others', () => {
    // Arrange
    renderLayout('/')

    // Act
    const brandLink = screen.getByRole('link', { name: /researchpulse home/i })
    const trendingLink = screen.getByRole('link', { name: /^trending$/i })
    const readingListLink = screen.getByRole('link', { name: /^reading list$/i })

    // Assert
    expect(brandLink).toHaveAttribute('aria-current', 'page')
    expect(trendingLink).toHaveAttribute('aria-current', 'page')
    expect(readingListLink).not.toHaveAttribute('aria-current')
  })

  it('renders a footer landmark with a copyright notice', () => {
    // Arrange
    renderLayout()

    // Act
    const footer = screen.getByRole('contentinfo')

    // Assert
    expect(footer).toHaveTextContent(/researchpulse/i)
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = renderLayout()

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
