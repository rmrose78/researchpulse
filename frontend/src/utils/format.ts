export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

export function formatAuthors(authors: string[], max = 3): string {
  if (authors.length === 0) return 'Unknown authors'
  if (authors.length <= max) return authors.join(', ')
  return `${authors.slice(0, max).join(', ')}, et al.`
}

export function toPubMedDate(isoDate: string): string {
  return isoDate.replaceAll('-', '/')
}

export function formatRelativeTime(isoDate: string, now = new Date()): string {
  const then = new Date(isoDate)
  const diffMs = now.getTime() - then.getTime()
  const minutes = Math.floor(diffMs / 60_000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
