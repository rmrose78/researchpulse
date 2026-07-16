import { TIME_RANGES } from '@/utils/time-ranges'
import styles from './time-range-selector.module.scss'

interface TimeRangeSelectorProps {
  selected: number
  onSelect: (days: number) => void
}

export default function TimeRangeSelector({ selected, onSelect }: TimeRangeSelectorProps) {
  return (
    <div className={styles.group} role="radiogroup" aria-label="Time range">
      {TIME_RANGES.map((range) => (
        <button
          key={range.days}
          type="button"
          role="radio"
          aria-checked={range.days === selected}
          className={styles.option}
          data-selected={range.days === selected}
          onClick={() => onSelect(range.days)}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
