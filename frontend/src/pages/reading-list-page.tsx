import { useMemo } from 'react'
import { useReadingList } from '@/hooks/use-reading-list'
import ArticleList from '@/components/sections/article-list/article-list'
import SearchSkeleton from '@/components/sections/search-skeleton/search-skeleton'
import EmptyState from '@/components/sections/empty-state/empty-state'
import ErrorState from '@/components/sections/error-state/error-state'
import type { ArticleSearchResult, SavedArticle } from '@/types'
import styles from './reading-list-page.module.scss'

// SavedArticle stores no abstract and joins authors into one string — convert
// back to ArticleSearchResult shape so ArticleList/ArticleCard can be reused as-is.
function toArticleSearchResult(saved: SavedArticle): ArticleSearchResult {
  return {
    pmid: saved.pmid,
    title: saved.title,
    abstract: null,
    authors: saved.authors ? saved.authors.split(', ') : [],
    journal: saved.journal,
    pub_date: saved.pub_date,
    doi: saved.doi,
    publication_types: [],
  }
}

export default function ReadingListPage() {
  const { status, articles, retry } = useReadingList()
  const results = useMemo(() => articles.map(toArticleSearchResult), [articles])

  return (
    <section className={styles.section} aria-labelledby="reading-list-heading">
      <h1 id="reading-list-heading" className={styles.heading}>
        Reading List
      </h1>
      <div aria-live="polite">
        {status === 'loading' && <SearchSkeleton />}
        {status === 'success' && articles.length === 0 && (
          <EmptyState message="Your reading list is empty — save an article from search to see it here." />
        )}
        {status === 'success' && articles.length > 0 && (
          <>
            <h2 className={styles.visuallyHidden}>Saved articles</h2>
            <ArticleList articles={results} />
          </>
        )}
        {status === 'error' && <ErrorState onRetry={retry} />}
      </div>
    </section>
  )
}
