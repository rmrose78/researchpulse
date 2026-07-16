import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useTrending } from './use-trending'
import { getTrending, getTrendingAvailability } from '@/utils/api'
import { SPECIALTIES, DEFAULT_SPECIALTY } from '@/utils/specialties'
import { DEFAULT_WINDOW_DAYS, TIME_RANGES } from '@/utils/time-ranges'
import type { TrendingArticle, TrendingAvailabilityResponse, TrendingResponse } from '@/types'

jest.mock('@/utils/api', () => ({
  getTrending: jest.fn(),
  getTrendingAvailability: jest.fn(),
}))

const mockedGetTrending = jest.mocked(getTrending)
const mockedGetTrendingAvailability = jest.mocked(getTrendingAvailability)

function makeArticle(overrides: Partial<TrendingArticle> = {}): TrendingArticle {
  return {
    pmid: '123',
    title: 'A cardiac study',
    abstract: 'Abstract text',
    authors: ['Smith J'],
    journal: 'Journal of Cardiology',
    pub_date: '2026-01-01',
    doi: null,
    citation_count: 12,
    velocity: 0.6,
    ...overrides,
  }
}

function makeResponse(overrides: Partial<TrendingResponse> = {}): TrendingResponse {
  return {
    specialty: DEFAULT_SPECIALTY,
    window_days: DEFAULT_WINDOW_DAYS,
    computed_at: '2026-01-01T00:00:00Z',
    results: [makeArticle()],
    ...overrides,
  }
}

function makeAvailability(
  overrides: Partial<TrendingAvailabilityResponse> = {}
): TrendingAvailabilityResponse {
  return { window_days: DEFAULT_WINDOW_DAYS, available: {}, ...overrides }
}

beforeEach(() => {
  mockedGetTrending.mockReset()
  mockedGetTrending.mockResolvedValue(makeResponse())
  mockedGetTrendingAvailability.mockReset()
  mockedGetTrendingAvailability.mockResolvedValue(makeAvailability())
})

describe('useTrending', () => {
  it('starts on the default specialty/window and loads both on mount', async () => {
    // Arrange & Act
    const { result } = renderHook(() => useTrending())

    // Assert
    expect(result.current.specialty).toBe(DEFAULT_SPECIALTY)
    expect(result.current.windowDays).toBe(DEFAULT_WINDOW_DAYS)
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(mockedGetTrending).toHaveBeenCalledWith(DEFAULT_SPECIALTY, DEFAULT_WINDOW_DAYS)
    expect(mockedGetTrendingAvailability).toHaveBeenCalledWith(DEFAULT_WINDOW_DAYS)
  })

  it('exposes the fetched articles and freshness timestamp on success', async () => {
    // Arrange
    mockedGetTrending.mockResolvedValue(
      makeResponse({ computed_at: '2026-01-01T06:00:00Z', results: [makeArticle({ pmid: '999' })] })
    )

    // Act
    const { result } = renderHook(() => useTrending())
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Assert
    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0].pmid).toBe('999')
    expect(result.current.computedAt).toBe('2026-01-01T06:00:00Z')
  })

  it('sets error status when the fetch fails, and retry recovers', async () => {
    // Arrange
    mockedGetTrending.mockRejectedValueOnce(new Error('API error: 502'))
    mockedGetTrending.mockResolvedValueOnce(makeResponse())
    const { result } = renderHook(() => useTrending())
    await waitFor(() => expect(result.current.status).toBe('error'))

    // Act
    act(() => result.current.retry())

    // Assert
    await waitFor(() => expect(result.current.status).toBe('success'))
  })

  it('switching specialty flips back to loading and refetches for the new specialty at the current window', async () => {
    // Arrange
    const secondSpecialty = SPECIALTIES[1].key
    const { result } = renderHook(() => useTrending())
    await waitFor(() => expect(result.current.status).toBe('success'))
    mockedGetTrending.mockResolvedValue(makeResponse({ specialty: secondSpecialty }))

    // Act
    act(() => result.current.setSpecialty(secondSpecialty))

    // Assert — flips to loading synchronously, before the new fetch resolves
    expect(result.current.status).toBe('loading')
    expect(result.current.specialty).toBe(secondSpecialty)
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(mockedGetTrending).toHaveBeenLastCalledWith(secondSpecialty, DEFAULT_WINDOW_DAYS)
  })

  it('ignores a stale response from a superseded specialty switch', async () => {
    // Arrange — first request hangs, second resolves first
    let resolveFirst!: (value: TrendingResponse) => void
    mockedGetTrending.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve
      })
    )
    const { result } = renderHook(() => useTrending())
    const secondSpecialty = SPECIALTIES[1].key
    mockedGetTrending.mockResolvedValueOnce(makeResponse({ specialty: secondSpecialty }))

    // Act
    act(() => result.current.setSpecialty(secondSpecialty))
    await waitFor(() => expect(result.current.status).toBe('success'))
    act(() => resolveFirst(makeResponse({ specialty: DEFAULT_SPECIALTY })))

    // Assert — the late first-request response never overwrites the second's result
    expect(result.current.specialty).toBe(secondSpecialty)
    expect(result.current.status).toBe('success')
  })

  it('switching the time range never changes the currently selected specialty', async () => {
    // Arrange
    const { result } = renderHook(() => useTrending())
    await waitFor(() => expect(result.current.status).toBe('success'))
    const newWindow = TIME_RANGES[0].days

    // Act
    act(() => result.current.setWindowDays(newWindow))
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Assert — the range changed, the specialty stayed exactly as it was
    expect(result.current.windowDays).toBe(newWindow)
    expect(result.current.specialty).toBe(DEFAULT_SPECIALTY)
    expect(mockedGetTrending).toHaveBeenLastCalledWith(DEFAULT_SPECIALTY, newWindow)
  })

  it('switching the time range flips to loading and re-fetches availability for the new range', async () => {
    // Arrange
    const { result } = renderHook(() => useTrending())
    await waitFor(() => expect(result.current.status).toBe('success'))
    const newWindow = TIME_RANGES[3].days

    // Act
    act(() => result.current.setWindowDays(newWindow))

    // Assert
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(mockedGetTrendingAvailability).toHaveBeenLastCalledWith(newWindow)
  })

  it('exposes specialties known to be empty at the current window as disabled', async () => {
    // Arrange
    const emptySpecialty = SPECIALTIES[2].key
    mockedGetTrendingAvailability.mockResolvedValue(
      makeAvailability({ available: { [emptySpecialty]: false, [DEFAULT_SPECIALTY]: true } })
    )

    // Act
    const { result } = renderHook(() => useTrending())
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Assert
    expect(result.current.disabledSpecialties.has(emptySpecialty)).toBe(true)
    expect(result.current.disabledSpecialties.has(DEFAULT_SPECIALTY)).toBe(false)
  })

  it('leaves specialties clickable (not disabled) when availability fails to load', async () => {
    // Arrange
    mockedGetTrendingAvailability.mockRejectedValue(new Error('API error: 500'))

    // Act
    const { result } = renderHook(() => useTrending())
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Assert — best-effort only, never blocks or breaks the page
    expect(result.current.disabledSpecialties.size).toBe(0)
  })
})
