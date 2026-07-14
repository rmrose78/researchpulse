import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import App from './App'
import { searchArticles } from '@/utils/api'

jest.mock('@/utils/api', () => ({
  searchArticles: jest.fn(),
}))

function navigateTo(path: string) {
  window.history.pushState({}, '', path)
}

beforeEach(() => {
  jest.mocked(searchArticles).mockReset()
  sessionStorage.clear()
  navigateTo('/')
})

describe('App routing', () => {
  it('renders the merged trending/search landing page at /', () => {
    // Arrange & Act
    render(<App />)

    // Assert
    expect(screen.getByRole('heading', { name: /^trending$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^search pubmed$/i })).toBeInTheDocument()
  })

  it('renders the reading list placeholder at /reading-list', () => {
    // Arrange
    navigateTo('/reading-list')

    // Act
    render(<App />)

    // Assert
    expect(screen.getByRole('heading', { name: /^reading list$/i })).toBeInTheDocument()
  })

  it('redirects an unknown route back to / (the merged landing page)', () => {
    // Arrange
    navigateTo('/this-route-does-not-exist')

    // Act
    render(<App />)

    // Assert
    expect(screen.getByRole('heading', { name: /^trending$/i })).toBeInTheDocument()
  })

  it('has working nav links to trending and reading list, and a home link to the landing page', () => {
    // Arrange
    render(<App />)

    // Act & Assert
    expect(screen.queryByRole('link', { name: /^search$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^trending$/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /^reading list$/i })).toHaveAttribute(
      'href',
      '/reading-list'
    )
    expect(screen.getByRole('link', { name: /researchpulse home/i })).toHaveAttribute('href', '/')
  })

  it('the trending nav link is reachable from the reading list page', () => {
    // Arrange
    navigateTo('/reading-list')

    // Act
    render(<App />)

    // Assert
    expect(screen.getByRole('link', { name: /^trending$/i })).toHaveAttribute('href', '/')
  })
})
