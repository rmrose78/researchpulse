import type {
  ArticleSearchResult,
  SavedArticle,
  SearchFilters,
  SearchResponse,
  TrendingAvailabilityResponse,
  TrendingResponse,
} from '@/types'
import { toPubMedDate } from './format'
import { API_BASE_URL as BASE_URL } from './env'

export const PAGE_SIZE = 20

export async function searchArticles(
  query: string,
  filters: SearchFilters,
  offset = 0
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    max_results: String(PAGE_SIZE),
    offset: String(offset),
  })

  const journal = filters.journal.trim()
  if (journal) params.set('journal', journal)
  if (filters.date_from) params.set('date_from', toPubMedDate(filters.date_from))
  if (filters.date_to) params.set('date_to', toPubMedDate(filters.date_to))

  const res = await fetch(`${BASE_URL}/api/search/?${params.toString()}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// Returns null on a 409 (already saved) — that's treated as success by
// callers, but the response body is an error detail, not a SavedArticle.
export async function saveArticle(article: ArticleSearchResult): Promise<SavedArticle | null> {
  const res = await fetch(`${BASE_URL}/api/reading-list/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pmid: article.pmid,
      title: article.title,
      authors: article.authors,
      journal: article.journal,
      pub_date: article.pub_date,
      doi: article.doi,
    }),
  })
  if (res.status === 409) return null
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function removeSavedArticle(pmid: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/reading-list/${pmid}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) throw new Error(`API error: ${res.status}`)
}

export async function getSavedArticles(): Promise<SavedArticle[]> {
  const res = await fetch(`${BASE_URL}/api/reading-list/`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function getTrending(
  specialty: string,
  mode: string,
  windowDays: number
): Promise<TrendingResponse> {
  const params = new URLSearchParams({ specialty, mode, window_days: String(windowDays) })
  const res = await fetch(`${BASE_URL}/api/trending/?${params.toString()}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// Cache-only lookup — never triggers a PubMed/Semantic Scholar call on the
// backend, so this is safe to call on every time-range change.
export async function getTrendingAvailability(
  mode: string,
  windowDays: number
): Promise<TrendingAvailabilityResponse> {
  const params = new URLSearchParams({ mode, window_days: String(windowDays) })
  const res = await fetch(`${BASE_URL}/api/trending/availability?${params.toString()}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
