import styles from './search-skeleton.module.scss'

interface SearchSkeletonProps {
  count?: number
}

export default function SearchSkeleton({ count = 3 }: SearchSkeletonProps) {
  return (
    <div className={styles.list} role="status" aria-live="polite">
      <span className={styles.visuallyHidden}>Loading results…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.card} aria-hidden="true">
          <div className={styles.titleLine} />
          <div className={styles.textLine} />
          <div className={styles.textLineShort} />
          <div className={styles.metaLine} />
        </div>
      ))}
    </div>
  )
}
