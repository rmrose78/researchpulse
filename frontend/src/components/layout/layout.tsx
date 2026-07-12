import type { ReactNode } from 'react'
import styles from './layout.module.scss'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <header>
        <nav className={styles.nav} aria-label="Primary">
          <a href="/" className={styles.brand} aria-label="ResearchPulse home">
            ResearchPulse
          </a>
        </nav>
      </header>
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </>
  )
}
