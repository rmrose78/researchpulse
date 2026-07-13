import { useEffect, useRef } from 'react'
import type { ArticleSearchResult } from '@/types'
import type { SearchStatus } from '@/hooks/use-search'
import ArticleList from '../article-list/article-list'
import SearchSkeleton from '../search-skeleton/search-skeleton'
import EmptyState from '../empty-state/empty-state'
import ErrorState from '../error-state/error-state'
import styles from './search-results.module.scss'

interface SearchResultsProps {
  status: SearchStatus
  results: ArticleSearchResult[]
  query: string
  onBack: () => void
  onRetry: () => void
}

export default function SearchResults({ status, results, query, onBack, onRetry }: SearchResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className={styles.section} aria-labelledby="results-heading">
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          ← New search
        </button>
        <h2 id="results-heading" ref={headingRef} tabIndex={-1} className={styles.heading}>
          Results for '{query}'
        </h2>
      </div>
      <div aria-live="polite">
        {status === 'loading' && <SearchSkeleton />}
        {status === 'success' && <ArticleList articles={results} />}
        {status === 'empty' && <EmptyState query={query} />}
        {status === 'error' && <ErrorState onRetry={onRetry} />}
      </div>
    </section>
  )
}
