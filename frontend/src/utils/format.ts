export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

export function formatAuthors(authors: string[], max = 3): string {
  if (authors.length === 0) return 'Unknown authors'
  if (authors.length <= max) return authors.join(', ')
  return `${authors.slice(0, max).join(', ')}, et al.`
}
