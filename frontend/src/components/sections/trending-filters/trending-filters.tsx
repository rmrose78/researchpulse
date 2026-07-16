import { useId, useState } from 'react'
import ModeSelector from '@/components/sections/mode-selector/mode-selector'
import SpecialtySelector from '@/components/sections/specialty-selector/specialty-selector'
import TimeRangeSelector from '@/components/sections/time-range-selector/time-range-selector'
import styles from './trending-filters.module.scss'

interface TrendingFiltersProps {
  mode: string
  onModeSelect: (mode: string) => void
  specialty: string
  onSpecialtySelect: (specialty: string) => void
  disabledSpecialties?: Set<string>
  windowDays: number
  onWindowDaysSelect: (days: number) => void
}

export default function TrendingFilters({
  mode,
  onModeSelect,
  specialty,
  onSpecialtySelect,
  disabledSpecialties,
  windowDays,
  onWindowDaysSelect,
}: TrendingFiltersProps) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const modeHeadingId = useId()
  const specialtyHeadingId = useId()
  const rangeHeadingId = useId()

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? 'Hide filters' : 'Show filters'}
      </button>

      <div id={panelId} className={styles.panel} data-expanded={expanded}>
        <section aria-labelledby={modeHeadingId}>
          <h2 id={modeHeadingId} className={styles.sectionHeading}>
            Mode
          </h2>
          <ModeSelector selected={mode} onSelect={onModeSelect} />
        </section>

        <section aria-labelledby={specialtyHeadingId}>
          <h2 id={specialtyHeadingId} className={styles.sectionHeading}>
            Specialty
          </h2>
          <SpecialtySelector
            selected={specialty}
            onSelect={onSpecialtySelect}
            disabledSpecialties={disabledSpecialties}
          />
        </section>

        <section aria-labelledby={rangeHeadingId}>
          <h2 id={rangeHeadingId} className={styles.sectionHeading}>
            Time Range
          </h2>
          <TimeRangeSelector selected={windowDays} onSelect={onWindowDaysSelect} />
        </section>
      </div>
    </div>
  )
}
