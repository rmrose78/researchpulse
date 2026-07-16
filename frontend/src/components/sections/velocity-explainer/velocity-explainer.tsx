import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import Modal from '@/components/ui/modal/modal'
import styles from './velocity-explainer.module.scss'

export default function VelocityExplainer() {
  return (
    <Modal
      trigger={
        <button type="button" className={styles.trigger}>
          <Info size={16} aria-hidden="true" />
          How is this calculated?
        </button>
      }
      title="How citation velocity works"
      description="A plain-English explanation of the trending ranking formula."
    >
      <p>
        Velocity measures how fast an article is being cited relative to its age — not just a raw
        citation count.
      </p>
      <p className={styles.formulaLine}>
        <code className={styles.chip}>citations ÷ (days since publication + 21)</code>
      </p>
      <p>
        Without the <strong>+21</strong>, a 2-day-old article with a single citation would outscore
        a well-established one purely from a tiny denominator. The three-week smoothing keeps very
        fresh articles from spiking the ranking on one early citation.
      </p>
      <p>
        Citation counts come from Semantic Scholar and are refreshed periodically — see the
        &ldquo;Updated X ago&rdquo; note next to the results.
      </p>
      <Link to="/how-it-works" className={styles.link}>
        Read the full explanation →
      </Link>
    </Modal>
  )
}
