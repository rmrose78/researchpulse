import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import type { SearchFilters as SearchFiltersValue } from '@/types'
import SearchFilters from './search-filters'
import styles from './search-bar.module.scss'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  filters: SearchFiltersValue
  onFiltersChange: (filters: SearchFiltersValue) => void
  isLoading?: boolean
  autoFocus?: boolean
}

const MIN_QUERY_LENGTH = 2

export default function SearchBar({
  value,
  onChange,
  onSearch,
  filters,
  onFiltersChange,
  isLoading = false,
  autoFocus = false,
}: SearchBarProps) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
    if (validationError) setValidationError(null)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setValidationError(`Enter at least ${MIN_QUERY_LENGTH} characters to search`)
      return
    }
    onSearch(trimmed)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor="search-input" className={styles.label}>
        Search PubMed
      </label>
      <div className={styles.controls}>
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          className={styles.input}
          placeholder="Search PubMed articles..."
          value={value}
          onChange={handleChange}
          aria-invalid={validationError ? true : undefined}
          aria-describedby={validationError ? 'search-validation-error' : undefined}
        />
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Searching…' : 'Search'}
        </button>
      </div>
      {validationError && (
        <p id="search-validation-error" role="alert" className={styles.validationError}>
          {validationError}
        </p>
      )}
      <SearchFilters filters={filters} onChange={onFiltersChange} />
    </form>
  )
}
