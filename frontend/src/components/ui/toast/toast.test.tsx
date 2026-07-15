import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Toast, { TOAST_DURATION_MS } from './toast'

beforeEach(() => {
  jest.useFakeTimers({ legacyFakeTimers: false })
})

afterEach(() => {
  jest.useRealTimers()
})

describe('Toast', () => {
  it('renders the message', () => {
    // Arrange & Act
    render(<Toast message="Saved to reading list" onDismiss={jest.fn()} />)

    // Assert
    expect(screen.getByText('Saved to reading list')).toBeInTheDocument()
  })

  it('does not render an Undo button when onUndo is not provided', () => {
    // Arrange & Act
    render(<Toast message="Saved to reading list" onDismiss={jest.fn()} />)

    // Assert
    expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument()
  })

  it('calls onUndo when the Undo button is clicked', async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const onUndo = jest.fn()
    render(<Toast message="Removed from reading list" onUndo={onUndo} onDismiss={jest.fn()} />)

    // Act
    await user.click(screen.getByRole('button', { name: /undo/i }))

    // Assert
    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss automatically after the toast duration', () => {
    // Arrange
    const onDismiss = jest.fn()
    render(<Toast message="Saved to reading list" onDismiss={onDismiss} />)

    // Act
    jest.advanceTimersByTime(TOAST_DURATION_MS)

    // Assert
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('has no automatically detectable accessibility violations', async () => {
    // Arrange
    jest.useRealTimers()
    const { container } = render(
      <Toast message="Saved to reading list" onUndo={jest.fn()} onDismiss={jest.fn()} />
    )

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
