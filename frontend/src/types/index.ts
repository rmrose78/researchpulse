export interface ArticleSearchResult {
  pmid: string
  title: string
  abstract: string | null
  authors: string[]
  journal: string | null
  pub_date: string | null
  doi: string | null
}

export interface SearchResponse {
  total: number
  results: ArticleSearchResult[]
  query: string
}

export interface SearchFilters {
  journal: string
  date_from: string
  date_to: string
}

export interface SavedArticle {
  id: number
  pmid: string
  title: string
  authors: string | null
  journal: string | null
  pub_date: string | null
  doi: string | null
  saved_at: string
}

export interface CitationStat {
  count: number
  velocity: number
}

export interface TrendingArticle extends ArticleSearchResult {
  citation_count: number
  velocity: number
}

export interface TrendingResponse {
  specialty: string
  computed_at: string
  results: TrendingArticle[]
}
