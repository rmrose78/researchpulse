import styles from './empty-state.module.scss'

interface EmptyStateProps {
  query: string
}

export default function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className={styles.container} role="status">
      <p className={styles.message}>No results found for '{query}' — try a different search term</p>
    </div>
  )
}
