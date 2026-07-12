import { render, screen } from '@testing-library/react'
import Layout from './layout'

describe('Layout', () => {
  it('renders nav and main landmarks with a working skip link', () => {
    // Arrange
    render(
      <Layout>
        <p>Page content</p>
      </Layout>
    )

    // Act
    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    const main = screen.getByRole('main')

    // Assert
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', `#${main.id}`)
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('nav is wrapped in a header landmark, and the brand links home', () => {
    // Arrange
    render(
      <Layout>
        <p>Page content</p>
      </Layout>
    )

    // Act
    const header = screen.getByRole('banner')
    const nav = screen.getByRole('navigation', { name: /primary/i })
    const brandLink = screen.getByRole('link', { name: /researchpulse home/i })

    // Assert
    expect(header).toContainElement(nav)
    expect(nav).toContainElement(brandLink)
    expect(brandLink).toHaveAttribute('href', '/')
  })
})
