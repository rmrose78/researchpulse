import { useId } from 'react'
import SearchBar from '@/components/sections/search-bar/search-bar'
import SearchResults from '@/components/sections/search-results/search-results'
import { useSearch } from '@/hooks/use-search'
import styles from './search-page.module.scss'

export default function SearchPage() {
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
    retry,
    total,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
  } = useSearch()
  const searchPanelId = useId()

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
    <section className={styles.section} aria-labelledby="search-heading">
      <h1 id="search-heading" className={styles.heading}>
        Search PubMed
      </h1>
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
    </section>
  )
}
