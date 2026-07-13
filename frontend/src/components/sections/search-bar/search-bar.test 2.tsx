import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import SearchBar from './search-bar'

describe('SearchBar', () => {
  it('does not call onSearch while typing', async () => {
    // Arrange
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} />)

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac')

    // Assert
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('calls onSearch with the query when the Search button is clicked', async () => {
    // Arrange
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    // Assert
    expect(onSearch).toHaveBeenCalledWith('cardiac')
  })

  it('calls onSearch with the query when Enter is pressed', async () => {
    // Arrange
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} />)

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac{Enter}')

    // Assert
    expect(onSearch).toHaveBeenCalledWith('cardiac')
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<SearchBar onSearch={jest.fn()} />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
