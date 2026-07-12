import type { SearchResponse } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL

export async function searchArticles(query: string): Promise<SearchResponse> {
  const res = await fetch(`${BASE_URL}/api/search/?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
