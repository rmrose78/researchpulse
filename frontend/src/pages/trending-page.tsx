import { useMemo } from 'react'
import Hero from '@/components/sections/hero/hero'
import ArticleList from '@/components/sections/article-list/article-list'
import SearchSkeleton from '@/components/sections/search-skeleton/search-skeleton'
import EmptyState from '@/components/sections/empty-state/empty-state'
import ErrorState from '@/components/sections/error-state/error-state'
import SpecialtySelector from '@/components/sections/specialty-selector/specialty-selector'
import TimeRangeSelector from '@/components/sections/time-range-selector/time-range-selector'
import VelocityExplainer from '@/components/sections/velocity-explainer/velocity-explainer'
import { useTrending } from '@/hooks/use-trending'
import { formatRelativeTime } from '@/utils/format'
import type { CitationStat } from '@/types'
import styles from './trending-page.module.scss'

export default function TrendingPage() {
  const {
    specialty,
    setSpecialty,
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
      map[article.pmid] = { count: article.citation_count, velocity: article.velocity }
    }
    return map
  }, [trendingArticles])

  return (
    <Hero>
      <section className={styles.trendingContent} aria-label="Trending">
        <SpecialtySelector
          selected={specialty}
          onSelect={setSpecialty}
          disabledSpecialties={disabledSpecialties}
        />
        <TimeRangeSelector selected={windowDays} onSelect={setWindowDays} />
        {computedAt && (
          <div className={styles.freshnessRow}>
            <p className={styles.freshness}>
              Updated {formatRelativeTime(computedAt)} · via Semantic Scholar
            </p>
            <VelocityExplainer />
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
      </section>
    </Hero>
  )
}
