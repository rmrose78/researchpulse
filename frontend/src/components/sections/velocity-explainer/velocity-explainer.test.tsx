import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import VelocityExplainer from './velocity-explainer'

function renderExplainer() {
  return render(
    <MemoryRouter>
      <VelocityExplainer />
    </MemoryRouter>
  )
}

describe('VelocityExplainer', () => {
  it('renders a trigger with a visible accessible label', () => {
    // Arrange & Act
    renderExplainer()

    // Assert
    expect(screen.getByRole('button', { name: /how is this calculated/i })).toBeInTheDocument()
  })

  it('opens a dialog explaining the velocity formula when clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    renderExplainer()

    // Act
    await user.click(screen.getByRole('button', { name: /how is this calculated/i }))

    // Assert
    expect(await screen.findByRole('dialog', { name: /how citation velocity works/i })).toBeInTheDocument()
    expect(screen.getByText(/citations ÷ \(days since publication \+ 21\)/i)).toBeInTheDocument()
    expect(screen.getByText(/semantic scholar/i)).toBeInTheDocument()
  })

  it('contains a working link to the full How It Works page', async () => {
    // Arrange
    const user = userEvent.setup()
    renderExplainer()
    await user.click(screen.getByRole('button', { name: /how is this calculated/i }))
    await screen.findByRole('dialog')

    // Act & Assert
    expect(screen.getByRole('link', { name: /read the full explanation/i })).toHaveAttribute(
      'href',
      '/how-it-works'
    )
  })

  it('has no automatically detectable accessibility violations when open', async () => {
    // Arrange
    const user = userEvent.setup()
    renderExplainer()
    await user.click(screen.getByRole('button', { name: /how is this calculated/i }))
    await screen.findByRole('dialog')

    // Act
    const results = await axe(document.body)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
