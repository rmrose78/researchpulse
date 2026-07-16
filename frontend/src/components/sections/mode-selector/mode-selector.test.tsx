import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import ModeSelector from './mode-selector'
import { TRENDING_MODES, DEFAULT_MODE } from '@/utils/trending-modes'

function renderSelector(selected = DEFAULT_MODE, onSelect = jest.fn()) {
  return render(<ModeSelector selected={selected} onSelect={onSelect} />)
}

describe('ModeSelector', () => {
  it('renders a radiogroup with one radio per mode', () => {
    // Arrange
    renderSelector()

    // Act
    const group = screen.getByRole('radiogroup', { name: /mode/i })
    const options = screen.getAllByRole('radio')

    // Assert
    expect(group).toBeInTheDocument()
    expect(options).toHaveLength(TRENDING_MODES.length)
    TRENDING_MODES.forEach((mode) => {
      expect(screen.getByRole('radio', { name: mode.label })).toBeInTheDocument()
    })
  })

  it('marks the selected mode as checked, and no others', () => {
    // Arrange
    renderSelector(TRENDING_MODES[1].key)

    // Act & Assert
    expect(screen.getByRole('radio', { name: TRENDING_MODES[1].label })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('radio', { name: TRENDING_MODES[0].label })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('calls onSelect with the clicked mode key', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderSelector(DEFAULT_MODE, onSelect)

    // Act
    await user.click(screen.getByRole('radio', { name: TRENDING_MODES[2].label }))

    // Assert
    expect(onSelect).toHaveBeenCalledWith(TRENDING_MODES[2].key)
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
