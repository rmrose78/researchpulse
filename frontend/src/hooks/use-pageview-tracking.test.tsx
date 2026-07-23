import type { ReactNode } from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { usePageViewTracking } from './use-pageview-tracking'
import { postPageView } from '@/utils/api'
import { setAnalyticsExcluded } from '@/utils/analytics-exclusion'

jest.mock('@/utils/api', () => ({
  postPageView: jest.fn(),
}))

const mockedPostPageView = jest.mocked(postPageView)

function renderTracking(initialEntry = '/') {
  function wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  }
  return renderHook(() => usePageViewTracking(), { wrapper })
}

beforeEach(() => {
  mockedPostPageView.mockReset()
  mockedPostPageView.mockResolvedValue(undefined)
  window.localStorage.clear()
})

describe('usePageViewTracking', () => {
  it('pings the backend with the current path and referrer on mount', async () => {
    // Arrange & Act
    renderTracking('/trending')

    // Assert
    await waitFor(() => expect(mockedPostPageView).toHaveBeenCalledWith('/trending', document.referrer))
  })

  it('does not ping when this browser has opted out', async () => {
    // Arrange
    setAnalyticsExcluded(true)

    // Act
    renderTracking('/trending')
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Assert
    expect(mockedPostPageView).not.toHaveBeenCalled()
  })

  it('never throws when the ping itself fails', async () => {
    // Arrange
    mockedPostPageView.mockRejectedValue(new Error('API error: 500'))

    // Act & Assert
    expect(() => renderTracking('/trending')).not.toThrow()
    await waitFor(() => expect(mockedPostPageView).toHaveBeenCalled())
  })
})
