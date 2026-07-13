import { useState } from 'react'
import { describe, it, expect, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import SearchFilters from './search-filters'
import type { SearchFilters as SearchFiltersValue } from '@/types'

const emptyFilters: SearchFiltersValue = { journal: '', date_from: '', date_to: '' }

function ControlledSearchFilters({ onChange }: { onChange: (filters: SearchFiltersValue) => void }) {
  const [filters, setFilters] = useState(emptyFilters)
  return (
    <SearchFilters
      filters={filters}
      onChange={(next) => {
        setFilters(next)
        onChange(next)
      }}
    />
  )
}

describe('SearchFilters', () => {
  it('is collapsed by default', () => {
    // Arrange & Act
    render(<SearchFilters filters={emptyFilters} onChange={jest.fn()} />)

    // Assert
    expect(screen.getByRole('button', { name: /show filters/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.queryByLabelText(/journal/i)).not.toBeInTheDocument()
  })

  it('expands to reveal filter fields when the toggle is clicked', async () => {
    // Arrange
    render(<SearchFilters filters={emptyFilters} onChange={jest.fn()} />)

    // Act
    await userEvent.click(screen.getByRole('button', { name: /show filters/i }))

    // Assert
    expect(screen.getByRole('button', { name: /hide filters/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByLabelText(/journal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^from$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^to$/i)).toBeInTheDocument()
  })

  it('calls onChange with the updated journal value', async () => {
    // Arrange
    const onChange = jest.fn()
    render(<ControlledSearchFilters onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /show filters/i }))

    // Act
    await userEvent.type(screen.getByLabelText(/journal/i), 'Lancet')

    // Assert
    expect(onChange).toHaveBeenLastCalledWith({ ...emptyFilters, journal: 'Lancet' })
  })

  it('calls onChange with the updated date_from value', async () => {
    // Arrange
    const onChange = jest.fn()
    render(<SearchFilters filters={emptyFilters} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /show filters/i }))

    // Act
    fireEvent.change(screen.getByLabelText(/^from$/i), { target: { value: '2024-01-01' } })

    // Assert
    expect(onChange).toHaveBeenCalledWith({ ...emptyFilters, date_from: '2024-01-01' })
  })

  it('includes a known journal suggestion in the datalist', async () => {
    // Arrange
    render(<SearchFilters filters={emptyFilters} onChange={jest.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /show filters/i }))

    // Act
    const journalInput = screen.getByLabelText(/journal/i)
    const listId = journalInput.getAttribute('list')

    // Assert
    expect(document.getElementById(listId as string)?.textContent).toContain('JAMA')
  })

  it('has no automatically detectable accessibility violations when collapsed', async () => {
    // Arrange
    const { container } = render(<SearchFilters filters={emptyFilters} onChange={jest.fn()} />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })

  it('has no automatically detectable accessibility violations when expanded', async () => {
    // Arrange
    const { container } = render(<SearchFilters filters={emptyFilters} onChange={jest.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /show filters/i }))

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
