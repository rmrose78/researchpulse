import { getTrending, searchArticles, PAGE_SIZE } from './api'
import type { SearchFilters } from '@/types'

jest.mock('./env', () => ({ API_BASE_URL: 'http://localhost:8000' }))

const noFilters: SearchFilters = { journal: '', date_from: '', date_to: '' }

function mockFetchOnce() {
  const mockResponse = { total: 0, results: [], query: 'cardiac' }
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => mockResponse,
  }) as jest.Mock
}

function calledParams(): URLSearchParams {
  const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
  return new URL(url).searchParams
}

describe('searchArticles', () => {
  it('omits all filter params when filters are empty', async () => {
    // Arrange
    mockFetchOnce()

    // Act
    await searchArticles('cardiac', noFilters)

    // Assert
    const params = calledParams()
    expect(params.get('q')).toBe('cardiac')
    expect(params.has('journal')).toBe(false)
    expect(params.has('date_from')).toBe(false)
    expect(params.has('date_to')).toBe(false)
  })

  it('includes the journal param when set', async () => {
    // Arrange
    mockFetchOnce()

    // Act
    await searchArticles('cardiac', { ...noFilters, journal: 'The Lancet' })

    // Assert
    expect(calledParams().get('journal')).toBe('The Lancet')
  })

  it('converts date_from and date_to to PubMed slash format', async () => {
    // Arrange
    mockFetchOnce()

    // Act
    await searchArticles('cardiac', { journal: '', date_from: '2024-01-01', date_to: '2024-12-31' })

    // Assert
    const params = calledParams()
    expect(params.get('date_from')).toBe('2024/01/01')
    expect(params.get('date_to')).toBe('2024/12/31')
  })

  it('sends a single-sided date range as-is, omitting the unset side', async () => {
    // Arrange
    mockFetchOnce()

    // Act
    await searchArticles('cardiac', { journal: '', date_from: '2024-01-01', date_to: '' })

    // Assert
    const params = calledParams()
    expect(params.get('date_from')).toBe('2024/01/01')
    expect(params.has('date_to')).toBe(false)
  })

  it('always sends max_results as the fixed page size', async () => {
    // Arrange
    mockFetchOnce()

    // Act
    await searchArticles('cardiac', noFilters)

    // Assert
    expect(calledParams().get('max_results')).toBe(String(PAGE_SIZE))
  })

  it('defaults offset to 0 when not provided', async () => {
    // Arrange
    mockFetchOnce()

    // Act
    await searchArticles('cardiac', noFilters)

    // Assert
    expect(calledParams().get('offset')).toBe('0')
  })

  it('sends the given offset when provided', async () => {
    // Arrange
    mockFetchOnce()

    // Act
    await searchArticles('cardiac', noFilters, 20)

    // Assert
    expect(calledParams().get('offset')).toBe('20')
  })
})

describe('getTrending', () => {
  it('sends the specialty as a query param', async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ specialty: 'cardiology', computed_at: '2024-01-01T00:00:00Z', results: [] }),
    }) as jest.Mock

    // Act
    await getTrending('cardiology')

    // Assert
    expect(calledParams().get('specialty')).toBe('cardiology')
  })

  it('throws on a non-ok response', async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 422 }) as jest.Mock

    // Act & Assert
    await expect(getTrending('not_real')).rejects.toThrow('422')
  })
})
