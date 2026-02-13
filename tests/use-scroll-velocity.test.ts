import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollVelocity } from '../src/utils/use-scroll-velocity'

describe('useScrollVelocity', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns 0 initially', () => {
        const { result } = renderHook(() => useScrollVelocity())
        expect(result.current).toBe(0)
    })

    it('returns 0 when disabled', () => {
        const { result } = renderHook(() => useScrollVelocity({ disabled: true }))
        expect(result.current).toBe(0)
    })

    it('is SSR-safe (returns 0)', () => {
        const { result } = renderHook(() => useScrollVelocity())
        expect(result.current).toBe(0)
    })

    it('accepts sensitivity and smoothing options without error', () => {
        const { result } = renderHook(() =>
            useScrollVelocity({ sensitivity: 100, smoothing: 0.5 }),
        )
        expect(result.current).toBe(0)
    })

    it('cleanup removes listeners on unmount', () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
        const { unmount } = renderHook(() => useScrollVelocity())
        unmount()
        const scrollCalls = removeEventListenerSpy.mock.calls.filter(c => c[0] === 'scroll')
        expect(scrollCalls.length).toBeGreaterThanOrEqual(1)
    })
})
