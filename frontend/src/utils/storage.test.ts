import { describe, it, expect, beforeEach } from '@jest/globals'
import { readStorage, writeStorage } from './storage'

beforeEach(() => {
  sessionStorage.clear()
})

describe('readStorage', () => {
  it('returns null when nothing is stored for the key', () => {
    // Arrange & Act
    const result = readStorage('missing-key')

    // Assert
    expect(result).toBeNull()
  })

  it('returns the parsed value when present', () => {
    // Arrange
    sessionStorage.setItem('some-key', JSON.stringify({ a: 1 }))

    // Act
    const result = readStorage<{ a: number }>('some-key')

    // Assert
    expect(result).toEqual({ a: 1 })
  })

  it('returns null instead of throwing on malformed JSON', () => {
    // Arrange
    sessionStorage.setItem('bad-key', '{not valid json')

    // Act
    const result = readStorage('bad-key')

    // Assert
    expect(result).toBeNull()
  })
})

describe('writeStorage', () => {
  it('writes a JSON-serialized value that readStorage can read back', () => {
    // Arrange & Act
    writeStorage('round-trip', { b: 2 })

    // Assert
    expect(readStorage('round-trip')).toEqual({ b: 2 })
  })

  it('does not throw when sessionStorage.setItem throws', () => {
    // Arrange
    const original = sessionStorage.setItem
    sessionStorage.setItem = () => {
      throw new Error('QuotaExceededError')
    }

    // Act & Assert
    expect(() => writeStorage('any-key', { c: 3 })).not.toThrow()

    sessionStorage.setItem = original
  })
})
