import Layout from '@/components/layout/layout'
import Hero from '@/components/sections/hero/hero'
import SearchBar from '@/components/sections/search-bar/search-bar'

function App() {
  return (
    <Layout>
      <Hero>
        <SearchBar onSearch={(query) => console.log('search:', query)} />
      </Hero>
    </Layout>
  )
}

export default App
