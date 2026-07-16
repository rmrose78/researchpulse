import { useMemo } from 'react'
import Hero from '@/components/sections/hero/hero'
import ArticleList from '@/components/sections/article-list/article-list'
import SearchSkeleton from '@/components/sections/search-skeleton/search-skeleton'
import EmptyState from '@/components/sections/empty-state/empty-state'
import ErrorState from '@/components/sections/error-state/error-state'
import TrendingFilters from '@/components/sections/trending-filters/trending-filters'
import VelocityExplainer from '@/components/sections/velocity-explainer/velocity-explainer'
import { useTrending } from '@/hooks/use-trending'
import { formatRelativeTime } from '@/utils/format'
import type { CitationStat } from '@/types'
import styles from './trending-page.module.scss'

export default function TrendingPage() {
  const {
    specialty,
    setSpecialty,
    mode,
    setMode,
    windowDays,
    setWindowDays,
    status: trendingStatus,
    articles: trendingArticles,
    computedAt,
    disabledSpecialties,
    retry: retryTrending,
  } = useTrending()

  const citationStats = useMemo(() => {
    const map: Record<string, CitationStat> = {}
    for (const article of trendingArticles) {
      // A 0-citation article is the expected, normal case in New & Notable
      // (recency is the point) — showing "0 citations" there reads as a
      // contradiction of "notable," so we omit the line entirely. A
      // nonzero count on a brand-new article is a genuine signal worth
      // keeping.
      if (mode === 'new_notable' && article.citation_count === 0) continue
      map[article.pmid] =
        mode === 'trending'
          ? { count: article.citation_count, velocity: article.velocity }
          : { count: article.citation_count }
    }
    return map
  }, [trendingArticles, mode])

  return (
    <Hero>
      <section className={styles.trendingLayout} aria-label="Trending">
        <TrendingFilters
          mode={mode}
          onModeSelect={setMode}
          specialty={specialty}
          onSpecialtySelect={setSpecialty}
          disabledSpecialties={disabledSpecialties}
          windowDays={windowDays}
          onWindowDaysSelect={setWindowDays}
        />
        <div className={styles.trendingMain}>
          {computedAt && (
            <div className={styles.freshnessRow}>
              <p className={styles.freshness}>
                Updated {formatRelativeTime(computedAt)} · via Semantic Scholar
              </p>
              {mode === 'trending' && <VelocityExplainer />}
            </div>
          )}
          <div aria-live="polite" className={styles.trendingResults}>
            {trendingStatus === 'loading' && <SearchSkeleton />}
            {trendingStatus === 'success' && trendingArticles.length === 0 && (
              <EmptyState message="No trending articles found for this specialty at this time range — try a wider range." />
            )}
            {trendingStatus === 'success' && trendingArticles.length > 0 && (
              <ArticleList articles={trendingArticles} citationStats={citationStats} />
            )}
            {trendingStatus === 'error' && <ErrorState onRetry={retryTrending} />}
          </div>
        </div>
      </section>
    </Hero>
  )
}
