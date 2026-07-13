import { useState } from 'react'
import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import SearchBar from './search-bar'

function ControlledSearchBar({
  onSearch,
  isLoading,
}: {
  onSearch: (query: string) => void
  isLoading?: boolean
}) {
  const [value, setValue] = useState('')
  return <SearchBar value={value} onChange={setValue} onSearch={onSearch} isLoading={isLoading} />
}

describe('SearchBar', () => {
  it('does not call onSearch while typing', async () => {
    // Arrange
    const onSearch = jest.fn()
    render(<ControlledSearchBar onSearch={onSearch} />)

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac')

    // Assert
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('calls onSearch with the query when the Search button is clicked', async () => {
    // Arrange
    const onSearch = jest.fn()
    render(<ControlledSearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    // Assert
    expect(onSearch).toHaveBeenCalledWith('cardiac')
  })

  it('calls onSearch with the query when Enter is pressed', async () => {
    // Arrange
    const onSearch = jest.fn()
    render(<ControlledSearchBar onSearch={onSearch} />)

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'cardiac{Enter}')

    // Assert
    expect(onSearch).toHaveBeenCalledWith('cardiac')
  })

  it('shows the current value passed in from a parent', () => {
    // Arrange & Act
    render(<SearchBar value="cardiac" onChange={jest.fn()} onSearch={jest.fn()} />)

    // Assert
    expect(screen.getByRole('textbox', { name: /search pubmed/i })).toHaveValue('cardiac')
  })

  it('blocks submit and shows a validation message for a query under 2 characters', async () => {
    // Arrange
    const onSearch = jest.fn()
    render(<ControlledSearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'a')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    // Assert
    expect(onSearch).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/at least 2 characters/i)
  })

  it('blocks submit for a whitespace-only query', async () => {
    // Arrange
    const onSearch = jest.fn()
    render(<ControlledSearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), '  ')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    // Assert
    expect(onSearch).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('clears the validation message once the user types a valid query', async () => {
    // Arrange
    const onSearch = jest.fn()
    render(<ControlledSearchBar onSearch={onSearch} />)
    const input = screen.getByRole('textbox', { name: /search pubmed/i })
    await userEvent.type(input, 'a')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Act
    await userEvent.type(input, 'b')

    // Assert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('focuses the input on mount when autoFocus is true', () => {
    // Arrange & Act
    render(<SearchBar value="cardiac" onChange={jest.fn()} onSearch={jest.fn()} autoFocus />)

    // Assert
    expect(screen.getByRole('textbox', { name: /search pubmed/i })).toHaveFocus()
  })

  it('does not focus the input on mount when autoFocus is false', () => {
    // Arrange & Act
    render(<SearchBar value="" onChange={jest.fn()} onSearch={jest.fn()} />)

    // Assert
    expect(screen.getByRole('textbox', { name: /search pubmed/i })).not.toHaveFocus()
  })

  it('disables the search button while isLoading is true', () => {
    // Arrange & Act
    render(<SearchBar value="cardiac" onChange={jest.fn()} onSearch={jest.fn()} isLoading />)

    // Assert
    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled()
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<SearchBar value="" onChange={jest.fn()} onSearch={jest.fn()} />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })

  it('has no automatically detectable accessibility violations while loading', async () => {
    // Arrange
    const { container } = render(<SearchBar value="cardiac" onChange={jest.fn()} onSearch={jest.fn()} isLoading />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })

  it('has no automatically detectable accessibility violations with a validation error shown', async () => {
    // Arrange
    const onSearch = jest.fn()
    const { container } = render(<ControlledSearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox', { name: /search pubmed/i }), 'a')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
