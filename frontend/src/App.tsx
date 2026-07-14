import Layout from '@/components/layout/layout'
import Hero from '@/components/sections/hero/hero'
import SearchBar from '@/components/sections/search-bar/search-bar'
import SearchResults from '@/components/sections/search-results/search-results'
import { useSearch } from '@/hooks/use-search'

function App() {
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

  return (
    <Layout>
      {view === 'search' ? (
        <Hero>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={search}
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={status === 'loading'}
            autoFocus={status !== 'idle'}
          />
        </Hero>
      ) : (
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
      )}
    </Layout>
  )
}

export default App
