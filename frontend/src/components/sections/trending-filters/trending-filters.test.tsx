import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import TrendingFilters from './trending-filters'
import { DEFAULT_MODE } from '@/utils/trending-modes'
import { DEFAULT_SPECIALTY } from '@/utils/specialties'
import { DEFAULT_WINDOW_DAYS } from '@/utils/time-ranges'

function renderFilters(overrides = {}) {
  return render(
    <TrendingFilters
      mode={DEFAULT_MODE}
      onModeSelect={jest.fn()}
      specialty={DEFAULT_SPECIALTY}
      onSpecialtySelect={jest.fn()}
      windowDays={DEFAULT_WINDOW_DAYS}
      onWindowDaysSelect={jest.fn()}
      {...overrides}
    />
  )
}

describe('TrendingFilters', () => {
  it('renders a mobile toggle button collapsed by default', () => {
    // Arrange & Act
    renderFilters()

    // Assert
    expect(screen.getByRole('button', { name: /show filters/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('expands the toggle button on click', async () => {
    // Arrange
    renderFilters()

    // Act
    await userEvent.click(screen.getByRole('button', { name: /show filters/i }))

    // Assert
    expect(screen.getByRole('button', { name: /hide filters/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('always renders all three filter sections regardless of toggle state', () => {
    // Arrange & Act — visibility below the toggle breakpoint is CSS-only, so
    // the sections stay in the DOM (and remain usable/testable) either way
    renderFilters()

    // Assert
    expect(screen.getByRole('radiogroup', { name: /mode/i })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /specialty/i })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /time range/i })).toBeInTheDocument()
  })

  it('labels each section with a visible heading', () => {
    // Arrange & Act
    renderFilters()

    // Assert
    expect(screen.getByRole('heading', { name: /^mode$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^specialty$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^time range$/i })).toBeInTheDocument()
  })

  it('calls onModeSelect when a mode is picked', async () => {
    // Arrange
    const onModeSelect = jest.fn()
    renderFilters({ onModeSelect })

    // Act
    await userEvent.click(screen.getByRole('radio', { name: /most cited/i }))

    // Assert
    expect(onModeSelect).toHaveBeenCalledWith('most_cited')
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = renderFilters()

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
