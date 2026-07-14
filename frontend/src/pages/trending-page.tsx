import { useId } from 'react'
import Hero from '@/components/sections/hero/hero'
import SearchBar from '@/components/sections/search-bar/search-bar'
import SearchResults from '@/components/sections/search-results/search-results'
import { useSearch } from '@/hooks/use-search'
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
  const searchPanelId = useId()
  const searchExpanded = view === 'search'

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
          <p className={styles.message}>
            Specialty-scoped citation trends are on their way — check back soon.
          </p>
        </section>
      )}
    </Hero>
  )
}
