import Layout from '@/components/layout/layout'
import Hero from '@/components/sections/hero/hero'
import SearchBar from '@/components/sections/search-bar/search-bar'
import SearchResults from '@/components/sections/search-results/search-results'
import { useSearch } from '@/hooks/use-search'

function App() {
  const { query, setQuery, view, status, results, searchedQuery, search, goBack, retry } = useSearch()

  return (
    <Layout>
      {view === 'search' ? (
        <Hero>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={search}
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
        />
      )}
    </Layout>
  )
}

export default App
