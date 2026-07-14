import type { SearchFilters, SearchResponse } from '@/types'
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
