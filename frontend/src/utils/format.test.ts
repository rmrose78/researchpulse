import { citationDetail, formatAuthors, formatRelativeTime, toPubMedDate, truncate, whyTrendingSentence } from './format'
import type { TrendingArticle } from '@/types'

function makeArticle(overrides: Partial<TrendingArticle> = {}): TrendingArticle {
  return {
    pmid: '1',
    title: 'An article',
    abstract: null,
    authors: [],
    journal: null,
    pub_date: '2026/Jan',
    doi: null,
    publication_types: [],
    citation_count: 41,
    velocity: 0.4,
    notable_type: null,
    rank_delta: null,
    is_new: false,
    age_days: 90,
    ...overrides,
  }
}

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

describe('citationDetail', () => {
  it('describes trending mode with the article age', () => {
    // Arrange
    const article = makeArticle({ age_days: 90 })

    // Act & Assert
    expect(citationDetail(article, 'trending')).toBe('in its first 90 days')
  })

  it('uses singular "day" for trending mode', () => {
    // Arrange
    const article = makeArticle({ age_days: 1 })

    // Act & Assert
    expect(citationDetail(article, 'trending')).toBe('in its first 1 day')
  })

  it('describes most_cited mode as an "overall" qualifier', () => {
    // Arrange
    const article = makeArticle()

    // Act & Assert
    expect(citationDetail(article, 'most_cited')).toBe('overall')
  })

  it('returns undefined for new_notable mode', () => {
    // Arrange
    const article = makeArticle()

    // Act & Assert
    expect(citationDetail(article, 'new_notable')).toBeUndefined()
  })
})

describe('whyTrendingSentence', () => {
  it('describes new_notable mode with the evidence tier when present', () => {
    // Arrange
    const article = makeArticle({ notable_type: 'Systematic Review', age_days: 3 })

    // Act & Assert
    expect(whyTrendingSentence(article)).toBe(
      'Systematic Review · published 3 days ago'
    )
  })

  it('describes new_notable mode by recency alone when untiered', () => {
    // Arrange
    const article = makeArticle({ notable_type: null, age_days: 3 })

    // Act & Assert
    expect(whyTrendingSentence(article)).toBe('Published 3 days ago')
  })

  it('uses singular "day" for new_notable mode', () => {
    // Arrange
    const article = makeArticle({ notable_type: null, age_days: 1 })

    // Act & Assert
    expect(whyTrendingSentence(article)).toBe('Published 1 day ago')
  })
})
