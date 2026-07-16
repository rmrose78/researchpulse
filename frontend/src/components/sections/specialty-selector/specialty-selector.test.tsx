import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import SpecialtySelector from './specialty-selector'
import { SPECIALTIES, DEFAULT_SPECIALTY } from '@/utils/specialties'

function renderSelector(selected = DEFAULT_SPECIALTY, onSelect = jest.fn()) {
  return render(<SpecialtySelector selected={selected} onSelect={onSelect} />)
}

describe('SpecialtySelector', () => {
  it('renders a radiogroup with one radio per specialty', () => {
    // Arrange
    renderSelector()

    // Act
    const group = screen.getByRole('radiogroup', { name: /specialty/i })
    const options = screen.getAllByRole('radio')

    // Assert
    expect(group).toBeInTheDocument()
    expect(options).toHaveLength(SPECIALTIES.length)
    SPECIALTIES.forEach((specialty) => {
      expect(screen.getByRole('radio', { name: specialty.label })).toBeInTheDocument()
    })
  })

  it('marks the selected specialty as checked, and no others', () => {
    // Arrange
    renderSelector(SPECIALTIES[2].key)

    // Act & Assert
    expect(screen.getByRole('radio', { name: SPECIALTIES[2].label })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('radio', { name: SPECIALTIES[0].label })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('calls onSelect with the clicked specialty key', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderSelector(DEFAULT_SPECIALTY, onSelect)

    // Act
    await user.click(screen.getByRole('radio', { name: SPECIALTIES[1].label }))

    // Assert
    expect(onSelect).toHaveBeenCalledWith(SPECIALTIES[1].key)
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = renderSelector()

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
