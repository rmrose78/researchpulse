import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/layout'
import TrendingPage from '@/pages/trending-page'
import ReadingListPage from '@/pages/reading-list-page'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<TrendingPage />} />
          <Route path="/reading-list" element={<ReadingListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
