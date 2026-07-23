import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import AnalyticsPage from './analytics-page'
import { getAnalyticsSummary } from '@/utils/api'
import { isAnalyticsExcluded } from '@/utils/analytics-exclusion'
import type { AnalyticsSummary } from '@/types'

jest.mock('@/utils/api', () => ({
  getAnalyticsSummary: jest.fn(),
}))

const mockedGetAnalyticsSummary = jest.mocked(getAnalyticsSummary)

function emptyBucket() {
  return { total_views: 0, top_paths: [], top_referrers: [] }
}

function makeSummary(overrides: Partial<AnalyticsSummary> = {}): AnalyticsSummary {
  return {
    today: emptyBucket(),
    this_week: emptyBucket(),
    this_month: emptyBucket(),
    this_year: emptyBucket(),
    all_time: emptyBucket(),
    ...overrides,
  }
}

function renderPage(initialEntry = '/analytics?key=secret123') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AnalyticsPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  mockedGetAnalyticsSummary.mockReset()
  window.localStorage.clear()
})

describe('AnalyticsPage', () => {
  it('shows a loading state, then fetches with the key from the URL', async () => {
    // Arrange
    mockedGetAnalyticsSummary.mockResolvedValue(makeSummary())

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    await waitFor(() => expect(mockedGetAnalyticsSummary).toHaveBeenCalledWith('secret123'))
  })

  it('renders all five time buckets with total views on success', async () => {
    // Arrange
    mockedGetAnalyticsSummary.mockResolvedValue(
      makeSummary({
        today: { total_views: 3, top_paths: [{ path: '/', count: 3 }], top_referrers: [] },
      })
    )

    // Act
    renderPage()

    // Assert
    expect(await screen.findByRole('heading', { name: /^today$/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /this week/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /this month/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /this year/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /all time/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByText('3 views')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
  })

  it('shows an error state with a working retry on fetch failure', async () => {
    // Arrange
    mockedGetAnalyticsSummary.mockRejectedValueOnce(new Error('API error: 404'))
    mockedGetAnalyticsSummary.mockResolvedValueOnce(makeSummary())
    renderPage()
    await screen.findByRole('alert')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))

    // Assert
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(await screen.findByRole('heading', { name: /^today$/i, level: 2 })).toBeInTheDocument()
  })

  it('toggles the self-exclusion flag and persists it to localStorage', async () => {
    // Arrange
    mockedGetAnalyticsSummary.mockResolvedValue(makeSummary())
    renderPage()
    await screen.findByRole('heading', { name: /^today$/i, level: 2 })
    expect(isAnalyticsExcluded()).toBe(false)

    // Act
    await userEvent.click(screen.getByRole('button', { name: /exclude this browser/i }))

    // Assert
    expect(isAnalyticsExcluded()).toBe(true)
    expect(
      screen.getByRole('button', { name: /this browser is excluded/i })
    ).toBeInTheDocument()
  })

  it('has no automatically detectable accessibility violations while loading', async () => {
    // Arrange
    mockedGetAnalyticsSummary.mockReturnValue(new Promise(() => {}))

    // Act
    const { container } = renderPage()

    // Assert
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no automatically detectable accessibility violations on success', async () => {
    // Arrange
    mockedGetAnalyticsSummary.mockResolvedValue(makeSummary())
    const { container } = renderPage()
    await screen.findByRole('heading', { name: /^today$/i, level: 2 })

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })

  it('has no automatically detectable accessibility violations on error', async () => {
    // Arrange
    mockedGetAnalyticsSummary.mockRejectedValue(new Error('API error: 404'))
    const { container } = renderPage()
    await screen.findByRole('alert')

    // Act
    const results = await axe(container)

    // Assert
    expect(results).toHaveNoViolations()
  })
})
