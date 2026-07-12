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
