import { formatAuthors, formatRelativeTime, toPubMedDate, truncate } from './format'

describe('toPubMedDate', () => {
  it('converts an ISO date to PubMed slash format', () => {
    // Arrange
    const isoDate = '2024-01-31'

    // Act
    const result = toPubMedDate(isoDate)

    // Assert
    expect(result).toBe('2024/01/31')
  })
})

describe('truncate', () => {
  it('leaves short text unchanged', () => {
    expect(truncate('short', 10)).toBe('short')
  })
})

describe('formatAuthors', () => {
  it('handles an empty author list', () => {
    expect(formatAuthors([])).toBe('Unknown authors')
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2024-01-01T12:00:00Z')

  it('shows "just now" for a timestamp under a minute old', () => {
    expect(formatRelativeTime('2024-01-01T11:59:30Z', now)).toBe('just now')
  })

  it('shows minutes ago for a timestamp under an hour old', () => {
    expect(formatRelativeTime('2024-01-01T11:45:00Z', now)).toBe('15m ago')
  })

  it('shows hours ago for a timestamp under a day old', () => {
    expect(formatRelativeTime('2024-01-01T09:00:00Z', now)).toBe('3h ago')
  })

  it('shows days ago for a timestamp a day or more old', () => {
    expect(formatRelativeTime('2023-12-30T12:00:00Z', now)).toBe('2d ago')
  })
})
