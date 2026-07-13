import { useState, type SubmitEvent } from 'react'
import styles from './search-bar.module.scss'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    onSearch(query)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="search-input" className={styles.label}>
        Search PubMed
      </label>
      <div className={styles.controls}>
        <input
          id="search-input"
          type="text"
          className={styles.input}
          placeholder="Search PubMed articles..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" className={styles.button}>
          Search
        </button>
      </div>
    </form>
  )
}
