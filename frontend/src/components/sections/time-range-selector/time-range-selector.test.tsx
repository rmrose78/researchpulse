import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import TimeRangeSelector from './time-range-selector'
import { TIME_RANGES, DEFAULT_WINDOW_DAYS } from '@/utils/time-ranges'

function renderSelector(selected = DEFAULT_WINDOW_DAYS, onSelect = jest.fn()) {
  return render(<TimeRangeSelector selected={selected} onSelect={onSelect} />)
}

describe('TimeRangeSelector', () => {
  it('renders a radiogroup with one radio per time range', () => {
    // Arrange
    renderSelector()

    // Act
    const group = screen.getByRole('radiogroup', { name: /time range/i })
    const options = screen.getAllByRole('radio')

    // Assert
    expect(group).toBeInTheDocument()
    expect(options).toHaveLength(TIME_RANGES.length)
    TIME_RANGES.forEach((range) => {
      expect(screen.getByRole('radio', { name: range.label })).toBeInTheDocument()
    })
  })

  it('marks the selected range as checked, and no others', () => {
    // Arrange
    renderSelector(TIME_RANGES[2].days)

    // Act & Assert
    expect(screen.getByRole('radio', { name: TIME_RANGES[2].label })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('radio', { name: TIME_RANGES[0].label })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('defaults to 1 year', () => {
    // Arrange & Act
    renderSelector()

    // Assert
    expect(screen.getByRole('radio', { name: '1 year' })).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onSelect with the clicked range in days', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderSelector(DEFAULT_WINDOW_DAYS, onSelect)

    // Act
    await user.click(screen.getByRole('radio', { name: '60 days' }))

    // Assert
    expect(onSelect).toHaveBeenCalledWith(60)
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
