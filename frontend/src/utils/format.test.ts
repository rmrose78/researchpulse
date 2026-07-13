import { formatAuthors, toPubMedDate, truncate } from './format'

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
