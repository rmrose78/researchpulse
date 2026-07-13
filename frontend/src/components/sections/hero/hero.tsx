import type { ReactNode } from 'react'
import styles from './hero.module.scss'

interface HeroProps {
  children: ReactNode
}

export default function Hero({ children }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <h1 id="hero-heading" className={styles.heading}>
        Trending biomedical research, explained in plain English.
      </h1>
      <p className={styles.subtitle}>
        PubMed shows you everything. ResearchPulse shows you what matters right now — and what it
        means.
      </p>
      {children}
    </section>
  )
}
