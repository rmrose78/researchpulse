import type { ArticleSearchResult, CitationStat, RankMovement } from '@/types'
import { useReadingList } from '@/hooks/use-reading-list'
import ArticleCard from '../article-card/article-card'
import styles from './article-list.module.scss'

interface ArticleListProps {
  articles: ArticleSearchResult[]
  citationStats?: Record<string, CitationStat>
  notableTypes?: Record<string, string>
  rankMovements?: Record<string, RankMovement>
}

export default function ArticleList({
  articles,
  citationStats,
  notableTypes,
  rankMovements,
}: ArticleListProps) {
  const { isSaved, toggleSave } = useReadingList()

  return (
    <ul className={styles.list}>
      {articles.map((article) => (
        <li key={article.pmid} className={styles.item}>
          <ArticleCard
            article={article}
            isSaved={isSaved(article.pmid)}
            onSaveToggle={toggleSave}
            citationStat={citationStats?.[article.pmid]}
            notableType={notableTypes?.[article.pmid]}
            rankMovement={rankMovements?.[article.pmid]}
          />
        </li>
      ))}
    </ul>
  )
}
