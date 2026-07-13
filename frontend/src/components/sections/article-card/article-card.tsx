import type { ArticleSearchResult } from '@/types'
import { truncate, formatAuthors } from '@/utils/format'
import styles from './article-card.module.scss'

interface ArticleCardProps {
  article: ArticleSearchResult
}

const ABSTRACT_PREVIEW_LENGTH = 220

export default function ArticleCard({ article }: ArticleCardProps) {
  const metadata = [formatAuthors(article.authors), article.journal, article.pub_date]
    .filter((part): part is string => Boolean(part))
    .join(' · ')

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{article.title}</h3>
      {article.abstract && (
        <p className={styles.abstract}>{truncate(article.abstract, ABSTRACT_PREVIEW_LENGTH)}</p>
      )}
      <p className={styles.metadata}>{metadata}</p>
    </article>
  )
}
