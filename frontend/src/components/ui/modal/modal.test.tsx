import { describe, it, expect } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Modal from './modal'

function renderModal() {
  return render(
    <Modal
      trigger={<button type="button">Open modal</button>}
      title="Test Title"
      description="Test description text"
    >
      <p>Modal body content</p>
    </Modal>
  )
}

describe('Modal', () => {
  it('is closed by default and opens when the trigger is clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    renderModal()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Act
    await user.click(screen.getByRole('button', { name: 'Open modal' }))

    // Assert
    expect(await screen.findByRole('dialog', { name: 'Test Title' })).toBeInTheDocument()
    expect(screen.getByText('Modal body content')).toBeInTheDocument()
  })

  it('moves focus into the dialog when opened', async () => {
    // Arrange
    const user = userEvent.setup()
    renderModal()

    // Act
    await user.click(screen.getByRole('button', { name: 'Open modal' }))
    const dialog = await screen.findByRole('dialog')

    // Assert
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))
  })

  it('closes when Escape is pressed', async () => {
    // Arrange
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: 'Open modal' }))
    await screen.findByRole('dialog')

    // Act
    await user.keyboard('{Escape}')

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes when the close button is clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: 'Open modal' }))
    await screen.findByRole('dialog')

    // Act
    await user.click(screen.getByRole('button', { name: /close/i }))

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes when clicking outside the dialog content', async () => {
    // Arrange
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: 'Open modal' }))
    await screen.findByRole('dialog')

    // Act
    await user.click(screen.getByTestId('modal-overlay'))

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('has no accessibility violations closed or open', async () => {
    // Arrange
    const { container } = renderModal()

    // Act & Assert — closed state
    expect(await axe(container)).toHaveNoViolations()

    // Act — open it
    await userEvent.click(screen.getByRole('button', { name: 'Open modal' }))
    await screen.findByRole('dialog')

    // Assert — open state (portal renders outside `container`)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
