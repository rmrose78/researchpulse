import { SPECIALTIES } from '@/utils/specialties'
import styles from './specialty-selector.module.scss'

interface SpecialtySelectorProps {
  selected: string
  onSelect: (specialty: string) => void
}

export default function SpecialtySelector({ selected, onSelect }: SpecialtySelectorProps) {
  return (
    <div className={styles.group} role="radiogroup" aria-label="Specialty">
      {SPECIALTIES.map((specialty) => (
        <button
          key={specialty.key}
          type="button"
          role="radio"
          aria-checked={specialty.key === selected}
          className={styles.option}
          data-selected={specialty.key === selected}
          onClick={() => onSelect(specialty.key)}
        >
          {specialty.label}
        </button>
      ))}
    </div>
  )
}
