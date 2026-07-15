import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { useReadingList } from './use-reading-list'
import ReadingListProvider from '@/components/providers/reading-list-provider'
import { getSavedArticles, removeSavedArticle, saveArticle } from '@/utils/api'
import type { ArticleSearchResult, SavedArticle } from '@/types'

jest.mock('@/utils/api', () => ({
  getSavedArticles: jest.fn(),
  saveArticle: jest.fn(),
  removeSavedArticle: jest.fn(),
}))

const mockedGetSavedArticles = jest.mocked(getSavedArticles)
const mockedSaveArticle = jest.mocked(saveArticle)
const mockedRemoveSavedArticle = jest.mocked(removeSavedArticle)

function makeArticle(overrides: Partial<ArticleSearchResult> = {}): ArticleSearchResult {
  return {
    pmid: '123',
    title: 'A cardiac study',
    abstract: 'Abstract text',
    authors: ['Smith J'],
    journal: 'Journal of Cardiology',
    pub_date: '2026-01-01',
    doi: null,
    ...overrides,
  }
}

function makeSaved(overrides: Partial<SavedArticle> = {}): SavedArticle {
  return {
    id: 1,
    pmid: '123',
    title: 'A cardiac study',
    authors: 'Smith J',
    journal: 'Journal of Cardiology',
    pub_date: '2026-01-01',
    doi: null,
    saved_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function renderReadingList() {
  return renderHook(() => useReadingList(), {
    wrapper: ({ children }) => <ReadingListProvider>{children}</ReadingListProvider>,
  })
}

beforeEach(() => {
  mockedGetSavedArticles.mockReset()
  mockedSaveArticle.mockReset()
  mockedRemoveSavedArticle.mockReset()
  mockedGetSavedArticles.mockResolvedValue([])
})

describe('useReadingList', () => {
  it('loads saved articles on mount and reflects them via isSaved', async () => {
    // Arrange
    mockedGetSavedArticles.mockResolvedValue([makeSaved()])

    // Act
    const { result } = renderReadingList()
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Assert
    expect(result.current.articles).toHaveLength(1)
    expect(result.current.isSaved('123')).toBe(true)
    expect(result.current.isSaved('999')).toBe(false)
  })

  it('sets error status when the initial load fails, and retry recovers', async () => {
    // Arrange
    mockedGetSavedArticles.mockRejectedValueOnce(new Error('API error: 502'))
    mockedGetSavedArticles.mockResolvedValueOnce([makeSaved()])
    const { result } = renderReadingList()
    await waitFor(() => expect(result.current.status).toBe('error'))

    // Act
    act(() => result.current.retry())

    // Assert
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.articles).toHaveLength(1)
  })

  it('toggling an unsaved article adds it optimistically and shows a success toast', async () => {
    // Arrange
    mockedSaveArticle.mockResolvedValue(makeSaved())
    const { result } = renderReadingList()
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Act
    act(() => result.current.toggleSave(makeArticle()))

    // Assert — optimistic update is synchronous
    expect(result.current.isSaved('123')).toBe(true)
    await screen.findByText('Saved to reading list')
  })

  it('treats a 409 (already saved) as success, not an error', async () => {
    // Arrange
    mockedSaveArticle.mockResolvedValue(null)
    const { result } = renderReadingList()
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Act
    act(() => result.current.toggleSave(makeArticle()))

    // Assert
    expect(result.current.isSaved('123')).toBe(true)
    await screen.findByText('Saved to reading list')
    expect(screen.queryByText(/couldn't save/i)).not.toBeInTheDocument()
  })

  it('rolls back the optimistic add and shows an error toast on a real save failure', async () => {
    // Arrange
    mockedSaveArticle.mockRejectedValue(new Error('API error: 500'))
    const { result } = renderReadingList()
    await waitFor(() => expect(result.current.status).toBe('success'))

    // Act
    act(() => result.current.toggleSave(makeArticle()))
    expect(result.current.isSaved('123')).toBe(true)

    // Assert
    await screen.findByText(/couldn't save/i)
    expect(result.current.isSaved('123')).toBe(false)
  })

  it('toggling a saved article removes it and shows a success toast', async () => {
    // Arrange
    mockedGetSavedArticles.mockResolvedValue([makeSaved()])
    mockedRemoveSavedArticle.mockResolvedValue(undefined)
    const { result } = renderReadingList()
    await waitFor(() => expect(result.current.isSaved('123')).toBe(true))

    // Act
    act(() => result.current.toggleSave(makeArticle()))

    // Assert
    expect(result.current.isSaved('123')).toBe(false)
    await screen.findByText('Removed from reading list')
  })

  it('rolls back the optimistic remove and shows an error toast on a real remove failure', async () => {
    // Arrange
    mockedGetSavedArticles.mockResolvedValue([makeSaved()])
    mockedRemoveSavedArticle.mockRejectedValue(new Error('API error: 500'))
    const { result } = renderReadingList()
    await waitFor(() => expect(result.current.isSaved('123')).toBe(true))

    // Act
    act(() => result.current.toggleSave(makeArticle()))
    expect(result.current.isSaved('123')).toBe(false)

    // Assert
    await screen.findByText(/couldn't remove/i)
    expect(result.current.isSaved('123')).toBe(true)
  })

  it('undoing a save toast removes the article again', async () => {
    // Arrange
    mockedSaveArticle.mockResolvedValue(makeSaved())
    mockedRemoveSavedArticle.mockResolvedValue(undefined)
    const { result } = renderReadingList()
    await waitFor(() => expect(result.current.status).toBe('success'))
    act(() => result.current.toggleSave(makeArticle()))
    await screen.findByText('Saved to reading list')

    // Act
    await act(async () => {
      await screen.getByRole('button', { name: /undo/i }).click()
    })

    // Assert
    await waitFor(() => expect(result.current.isSaved('123')).toBe(false))
  })

  it('undoing a remove toast re-adds the article', async () => {
    // Arrange
    mockedGetSavedArticles.mockResolvedValue([makeSaved()])
    mockedRemoveSavedArticle.mockResolvedValue(undefined)
    mockedSaveArticle.mockResolvedValue(makeSaved())
    const { result } = renderReadingList()
    await waitFor(() => expect(result.current.isSaved('123')).toBe(true))
    act(() => result.current.toggleSave(makeArticle()))
    await screen.findByText('Removed from reading list')

    // Act
    await act(async () => {
      await screen.getByRole('button', { name: /undo/i }).click()
    })

    // Assert
    await waitFor(() => expect(result.current.isSaved('123')).toBe(true))
  })
})
