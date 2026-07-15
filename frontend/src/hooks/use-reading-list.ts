import { createContext, useContext } from 'react'
import type { ArticleSearchResult, SavedArticle } from '@/types'

export type ReadingListStatus = 'loading' | 'success' | 'error'

export interface ReadingListContextValue {
  status: ReadingListStatus
  articles: SavedArticle[]
  isSaved: (pmid: string) => boolean
  toggleSave: (article: ArticleSearchResult) => void
  retry: () => void
}

export const ReadingListContext = createContext<ReadingListContextValue | null>(null)

export function useReadingList(): ReadingListContextValue {
  const ctx = useContext(ReadingListContext)
  if (!ctx) throw new Error('useReadingList must be used within a ReadingListProvider')
  return ctx
}
