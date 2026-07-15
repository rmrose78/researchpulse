import { useEffect } from 'react'
import styles from './toast.module.scss'

export const TOAST_DURATION_MS = 5000

interface ToastProps {
  message: string
  onUndo?: () => void
  onDismiss: () => void
}

export default function Toast({ message, onUndo, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <p className={styles.message}>{message}</p>
      {onUndo && (
        <button type="button" className={styles.undoButton} onClick={onUndo}>
          Undo
        </button>
      )}
    </div>
  )
}
