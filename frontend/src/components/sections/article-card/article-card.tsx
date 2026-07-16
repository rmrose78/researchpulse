import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Bookmark, BookmarkCheck, ChevronDown } from 'lucide-react'
import type { ArticleSearchResult, CitationStat } from '@/types'
import { formatAuthors } from '@/utils/format'
import styles from './article-card.module.scss'

interface ArticleCardProps {
  article: ArticleSearchResult
  isSaved: boolean
  onSaveToggle: (article: ArticleSearchResult) => void
  citationStat?: CitationStat
  notableType?: string
}

const ANIMATION_TRANSITION = { type: 'tween', duration: 0.2, ease: 'easeInOut' } as const

const chevronRotate = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
} as const

export default function ArticleCard({
  article,
  isSaved,
  onSaveToggle,
  citationStat,
  notableType,
}: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const abstractId = useId()
  const reducedMotion = useReducedMotion()
  const transition = reducedMotion ? { ...ANIMATION_TRANSITION, duration: 0 } : ANIMATION_TRANSITION

  const metadata = [formatAuthors(article.authors), article.journal, article.pub_date]
    .filter((part): part is string => Boolean(part))
    .join(' · ')

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          {notableType && <span className={styles.notableBadge}>{notableType}</span>}
          <h3 className={styles.title}>{article.title}</h3>
        </div>
        <button
          type="button"
          className={styles.saveToggle}
          aria-pressed={isSaved}
          aria-label={isSaved ? 'Remove from reading list' : 'Save to reading list'}
          onClick={() => onSaveToggle(article)}
        >
          {isSaved ? <BookmarkCheck size={20} aria-hidden="true" /> : <Bookmark size={20} aria-hidden="true" />}
        </button>
      </div>
      {article.abstract && (
        <>
          <motion.div layout className={styles.abstractWrapper} transition={transition}>
            <p id={abstractId} className={styles.abstract} data-expanded={expanded}>
              {article.abstract}
            </p>
          </motion.div>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={expanded}
            aria-controls={abstractId}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? 'Show less' : 'Read more'}
            <motion.span
              aria-hidden="true"
              className={styles.chevron}
              variants={chevronRotate}
              animate={expanded ? 'expanded' : 'collapsed'}
              transition={transition}
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>
        </>
      )}
      <p className={styles.metadata}>{metadata}</p>
      {citationStat && (
        <p className={styles.citationStat}>
          {citationStat.count} {citationStat.count === 1 ? 'citation' : 'citations'}
          {citationStat.velocity !== undefined && <> · velocity {citationStat.velocity.toFixed(2)}</>}
        </p>
      )}
    </article>
  )
}
