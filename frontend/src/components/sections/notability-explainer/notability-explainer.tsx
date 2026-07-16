import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import Modal from '@/components/ui/modal/modal'
import styles from './notability-explainer.module.scss'

export default function NotabilityExplainer() {
  return (
    <Modal
      trigger={
        <button type="button" className={styles.trigger}>
          <Info size={16} aria-hidden="true" />
          How is this calculated?
        </button>
      }
      title="How notability works"
      description="A plain-English explanation of the evidence-tier badge shown on some articles."
    >
      <p>
        New & Notable is sorted by publication date, but a date alone doesn&rsquo;t say anything
        about how much weight to put on a brand-new finding — so we add a real signal: the kind of
        study it is.
      </p>
      <p className={styles.formulaLine}>
        <code className={styles.chip}>Meta-Analysis / Systematic Review</code>
        {' > '}
        <code className={styles.chip}>Randomized Controlled Trial</code>
        {' > '}
        <code className={styles.chip}>Clinical Trial / Multicenter / Comparative Study</code>
      </p>
      <p>
        This is the same evidence hierarchy used in clinical practice — a systematic review
        synthesizes many studies, a randomized controlled trial is the gold-standard single-study
        design, and so on. Articles matching one of these types get a badge and rank above
        everything else in the window; other articles (plain journal articles, case reports,
        editorials) show no badge and simply fall back to today&rsquo;s recency order.
      </p>
      <p>
        Publication type comes straight from PubMed&rsquo;s own metadata — nothing here is
        inferred or guessed.
      </p>
      <Link to="/how-it-works" className={styles.link}>
        Read the full explanation →
      </Link>
    </Modal>
  )
}
