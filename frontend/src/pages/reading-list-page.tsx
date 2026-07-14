import styles from './reading-list-page.module.scss'

export default function ReadingListPage() {
  return (
    <section className={styles.container} aria-labelledby="reading-list-heading">
      <h1 id="reading-list-heading" className={styles.heading}>
        Reading List
      </h1>
      <p className={styles.message}>
        Saving articles for later is coming soon — check back shortly.
      </p>
    </section>
  )
}
