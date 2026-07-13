import styles from './error-state.module.scss'

interface ErrorStateProps {
  onRetry: () => void
  isRetrying?: boolean
}

export default function ErrorState({ onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    <div className={styles.container} role="alert">
      <p className={styles.message}>Something went wrong loading results. Please try again.</p>
      <button type="button" className={styles.retryButton} onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? 'Retrying…' : 'Retry'}
      </button>
    </div>
  )
}
