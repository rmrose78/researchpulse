import { SPECIALTIES } from '@/utils/specialties'
import styles from './specialty-selector.module.scss'

interface SpecialtySelectorProps {
  selected: string
  onSelect: (specialty: string) => void
  disabledSpecialties?: Set<string>
}

export default function SpecialtySelector({
  selected,
  onSelect,
  disabledSpecialties = new Set(),
}: SpecialtySelectorProps) {
  return (
    <div className={styles.group} role="radiogroup" aria-label="Specialty">
      {SPECIALTIES.map((specialty) => {
        const isDisabled = disabledSpecialties.has(specialty.key)
        return (
          <button
            key={specialty.key}
            type="button"
            role="radio"
            aria-checked={specialty.key === selected}
            aria-disabled={isDisabled}
            aria-label={isDisabled ? `${specialty.label} (no results at this range)` : undefined}
            disabled={isDisabled}
            className={styles.option}
            data-selected={specialty.key === selected}
            data-disabled={isDisabled}
            onClick={() => onSelect(specialty.key)}
          >
            {specialty.label}
          </button>
        )
      })}
    </div>
  )
}
