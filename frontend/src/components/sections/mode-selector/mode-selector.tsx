import { TRENDING_MODES } from '@/utils/trending-modes'
import styles from './mode-selector.module.scss'

interface ModeSelectorProps {
  selected: string
  onSelect: (mode: string) => void
}

export default function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <div className={styles.group} role="radiogroup" aria-label="Mode">
      {TRENDING_MODES.map((mode) => (
        <button
          key={mode.key}
          type="button"
          role="radio"
          aria-checked={mode.key === selected}
          className={styles.option}
          data-selected={mode.key === selected}
          onClick={() => onSelect(mode.key)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
