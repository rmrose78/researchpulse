import type { ArticleSearchResult } from '@/types'
import ArticleCard from '../article-card/article-card'
import styles from './article-list.module.scss'

interface ArticleListProps {
  articles: ArticleSearchResult[]
}

export default function ArticleList({ articles }: ArticleListProps) {
  return (
    <ul className={styles.list}>
      {articles.map((article) => (
        <li key={article.pmid} className={styles.item}>
          <ArticleCard article={article} />
        </li>
      ))}
    </ul>
  )
}
