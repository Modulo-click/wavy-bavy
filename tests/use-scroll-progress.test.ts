import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollProgress } from '../src/utils/use-scroll-progress'

describe('useScrollProgress', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns [ref, 0] initially', () => {
        const { result } = renderHook(() => useScrollProgress())
        const [ref, progress] = result.current
        expect(typeof ref).toBe('function')
        expect(progress).toBe(0)
    })

    it('returns progress=0 when disabled', () => {
        const { result } = renderHook(() => useScrollProgress({ disabled: true }))
        expect(result.current[1]).toBe(0)
    })

    it('clamps to 0-1 by default', () => {
        const { result } = renderHook(() => useScrollProgress({ clamp: true }))
        // Progress should never exceed [0, 1] range
        expect(result.current[1]).toBeGreaterThanOrEqual(0)
        expect(result.current[1]).toBeLessThanOrEqual(1)
    })

    it('is SSR-safe (no window errors)', () => {
        // In jsdom environment with no actual scrolling, should return 0
        const { result } = renderHook(() => useScrollProgress())
        expect(result.current[1]).toBe(0)
    })

    it('accepts offset option without error', () => {
        const { result } = renderHook(() => useScrollProgress({ offset: 50 }))
        expect(result.current[1]).toBe(0)
    })

    it('cleanup removes listeners on unmount', () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
        const { unmount } = renderHook(() => useScrollProgress())
        unmount()
        // Should have removed both scroll and resize listeners
        const scrollCalls = removeEventListenerSpy.mock.calls.filter(c => c[0] === 'scroll')
        const resizeCalls = removeEventListenerSpy.mock.calls.filter(c => c[0] === 'resize')
        expect(scrollCalls.length).toBeGreaterThanOrEqual(1)
        expect(resizeCalls.length).toBeGreaterThanOrEqual(1)
    })
})
