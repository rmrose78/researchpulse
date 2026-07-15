import styles from './empty-state.module.scss'

interface EmptyStateProps {
  query?: string
  message?: string
}

export default function EmptyState({ query, message }: EmptyStateProps) {
  const text = message ?? `No results found for '${query}' — try a different search term`

  return (
    <div className={styles.container} role="status">
      <p className={styles.message}>{text}</p>
    </div>
  )
}
