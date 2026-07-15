import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { RESET_TO_TRENDING_EVENT } from '@/hooks/use-search'
import styles from './layout.module.scss'

interface LayoutProps {
  children: ReactNode
}

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
}

// React Router doesn't remount TrendingPage when you click a link to the
// route you're already on, so the trending/search view state wouldn't reset
// on its own — this nudges it back to the trending default explicitly.
function resetToTrending() {
  window.dispatchEvent(new Event(RESET_TO_TRENDING_EVENT))
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <header>
        <nav className={styles.nav} aria-label="Primary">
          <NavLink
            to="/"
            end
            className={styles.brand}
            aria-label="ResearchPulse home"
            onClick={resetToTrending}
          >
            ResearchPulse
          </NavLink>
          <ul className={styles.navLinks}>
            <li>
              <NavLink to="/" end className={navLinkClassName} onClick={resetToTrending}>
                Trending
              </NavLink>
            </li>
            <li>
              <NavLink to="/reading-list" className={navLinkClassName}>
                Reading List
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main-content" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} ResearchPulse</p>
      </footer>
    </div>
  )
}
