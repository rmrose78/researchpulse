import type { ArticleSearchResult } from '@/types'
import { useReadingList } from '@/hooks/use-reading-list'
import ArticleCard from '../article-card/article-card'
import styles from './article-list.module.scss'

interface ArticleListProps {
  articles: ArticleSearchResult[]
}

export default function ArticleList({ articles }: ArticleListProps) {
  const { isSaved, toggleSave } = useReadingList()

  return (
    <ul className={styles.list}>
      {articles.map((article) => (
        <li key={article.pmid} className={styles.item}>
          <ArticleCard article={article} isSaved={isSaved(article.pmid)} onSaveToggle={toggleSave} />
        </li>
      ))}
    </ul>
  )
}
