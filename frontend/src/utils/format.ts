import type { TrendingArticle } from '@/types'

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`
}

// A one-line evidence-tier/recency sentence for New & Notable — the only
// mode where this signal doesn't just repeat the citation count shown
// elsewhere on the card, so it stays a standalone sentence.
export function whyTrendingSentence(article: TrendingArticle): string {
  // PubMed dates are month-precision only, so a same-month article computes
  // age_days = 0 — "published 0 days ago" reads like a bug, not a fact.
  const recency =
    article.age_days === 0
      ? 'published this month'
      : `published ${article.age_days} ${pluralize(article.age_days, 'day')} ago`
  if (article.notable_type) return `${article.notable_type} · ${recency}`
  return recency.charAt(0).toUpperCase() + recency.slice(1)
}

// Trending/Most Cited: rather than a parallel sentence repeating the
// citation count, this is folded straight into the existing citation-stat
// line as a trailing qualifier — computed entirely from fields the
// trending response already carries — never an extra API call.
export function citationDetail(article: TrendingArticle, mode: string): string | undefined {
  if (mode === 'trending') {
    // See age_days = 0 note in whyTrendingSentence above.
    return article.age_days === 0
      ? 'so far'
      : `in its first ${article.age_days} ${pluralize(article.age_days, 'day')}`
  }
  if (mode === 'most_cited') {
    return 'overall'
  }
  return undefined
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

export function formatAuthors(authors: string[], max = 3): string {
  if (authors.length === 0) return 'Unknown authors'
  if (authors.length <= max) return authors.join(', ')
  return `${authors.slice(0, max).join(', ')}, et al.`
}

export function toPubMedDate(isoDate: string): string {
  return isoDate.replaceAll('-', '/')
}

export function formatRelativeTime(isoDate: string, now = new Date()): string {
  const then = new Date(isoDate)
  const diffMs = now.getTime() - then.getTime()
  const minutes = Math.floor(diffMs / 60_000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
