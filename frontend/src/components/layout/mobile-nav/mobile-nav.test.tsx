import { describe, it, expect } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import MobileNav from './mobile-nav'
import { NAV_ITEMS } from '../nav-items'

function renderMobileNav(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <MobileNav />
    </MemoryRouter>
  )
}

describe('MobileNav', () => {
  it('is closed by default and opens when the hamburger trigger is clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    renderMobileNav()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Act
    await user.click(screen.getByRole('button', { name: /open menu/i }))

    // Assert
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('lists all nav items in the overlay', async () => {
    // Arrange
    renderMobileNav()

    // Act
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }))
    await screen.findByRole('dialog')

    // Assert
    for (const item of NAV_ITEMS) {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.to)
    }
  })

  it('closes the overlay when a nav link is clicked', async () => {
    // Arrange
    renderMobileNav()
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }))
    await screen.findByRole('dialog')

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Reading List' }))

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes when the close button is clicked', async () => {
    // Arrange
    renderMobileNav()
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }))
    await screen.findByRole('dialog')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /close menu/i }))

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes when Escape is pressed', async () => {
    // Arrange
    const user = userEvent.setup()
    renderMobileNav()
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await screen.findByRole('dialog')

    // Act
    await user.keyboard('{Escape}')

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('has no accessibility violations closed or open', async () => {
    // Arrange
    const { container } = renderMobileNav()

    // Act & Assert — closed state
    expect(await axe(container)).toHaveNoViolations()

    // Act — open it
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }))
    await screen.findByRole('dialog')

    // Assert — open state (portal renders outside `container`)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
