export function readStorage<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private browsing / storage disabled / quota exceeded — persistence is
    // a nice-to-have here, so a write failure should never break search.
  }
}
