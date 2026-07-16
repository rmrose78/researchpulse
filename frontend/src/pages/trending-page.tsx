import { useId, useMemo } from 'react'
import Hero from '@/components/sections/hero/hero'
import SearchBar from '@/components/sections/search-bar/search-bar'
import SearchResults from '@/components/sections/search-results/search-results'
import ArticleList from '@/components/sections/article-list/article-list'
import SearchSkeleton from '@/components/sections/search-skeleton/search-skeleton'
import EmptyState from '@/components/sections/empty-state/empty-state'
import ErrorState from '@/components/sections/error-state/error-state'
import SpecialtySelector from '@/components/sections/specialty-selector/specialty-selector'
import { useSearch } from '@/hooks/use-search'
import { useTrending } from '@/hooks/use-trending'
import { formatRelativeTime } from '@/utils/format'
import type { CitationStat } from '@/types'
import styles from './trending-page.module.scss'

export default function TrendingPage() {
  const {
    query,
    setQuery,
    filters,
    setFilters,
    view,
    status,
    results,
    searchedQuery,
    search,
    goBack,
    expandSearch,
    retry,
    total,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
  } = useSearch()
  const {
    specialty,
    setSpecialty,
    status: trendingStatus,
    articles: trendingArticles,
    computedAt,
    retry: retryTrending,
  } = useTrending()
  const searchPanelId = useId()
  const searchExpanded = view === 'search'

  const citationStats = useMemo(() => {
    const map: Record<string, CitationStat> = {}
    for (const article of trendingArticles) {
      map[article.pmid] = { count: article.citation_count, velocity: article.velocity }
    }
    return map
  }, [trendingArticles])

  if (view === 'results') {
    return (
      <SearchResults
        status={status}
        results={results}
        query={searchedQuery}
        onBack={goBack}
        onRetry={retry}
        total={total}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        loadMoreError={loadMoreError}
        onLoadMore={loadMore}
      />
    )
  }

  return (
    <Hero>
      {/* "Hide search" collapse control removed for now, pending the UI/UX
          pass once Trending has real content — expandSearch still works,
          there's just no in-place way back to trending from here yet. */}
      {!searchExpanded && (
        <button
          type="button"
          className={styles.searchToggle}
          aria-expanded={searchExpanded}
          aria-controls={searchPanelId}
          onClick={expandSearch}
        >
          Search PubMed
        </button>
      )}

      {searchExpanded ? (
        <div id={searchPanelId}>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={search}
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={status === 'loading'}
            autoFocus
          />
        </div>
      ) : (
        <section className={styles.trendingContent} aria-labelledby="trending-heading">
          <h2 id="trending-heading" className={styles.heading}>
            Trending
          </h2>
          <SpecialtySelector selected={specialty} onSelect={setSpecialty} />
          {computedAt && (
            <p className={styles.freshness}>
              Updated {formatRelativeTime(computedAt)} · via Semantic Scholar
            </p>
          )}
          <div aria-live="polite" className={styles.trendingResults}>
            {trendingStatus === 'loading' && <SearchSkeleton />}
            {trendingStatus === 'success' && trendingArticles.length === 0 && (
              <EmptyState message="No trending articles found for this specialty yet — check back soon." />
            )}
            {trendingStatus === 'success' && trendingArticles.length > 0 && (
              <ArticleList articles={trendingArticles} citationStats={citationStats} />
            )}
            {trendingStatus === 'error' && <ErrorState onRetry={retryTrending} />}
          </div>
        </section>
      )}
    </Hero>
  )
}
