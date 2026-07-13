import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import ErrorState from './error-state'

describe('ErrorState', () => {
  it('shows a distinct error message', () => {
    // Arrange & Act
    render(<ErrorState onRetry={jest.fn()} />)

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('calls onRetry when the retry button is clicked', async () => {
    // Arrange
    const onRetry = jest.fn()
    render(<ErrorState onRetry={onRetry} />)

    // Act
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))

    // Assert
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('disables the retry button while a retry is already in flight', () => {
    // Arrange & Act
    render(<ErrorState onRetry={jest.fn()} isRetrying />)

    // Assert
    expect(screen.getByRole('button', { name: /retrying/i })).toBeDisabled()
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    const { container } = render(<ErrorState onRetry={jest.fn()} />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })

  it('has no automatically detectable accessibility violations while retrying', async () => {
    // Arrange
    const { container } = render(<ErrorState onRetry={jest.fn()} isRetrying />)

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
