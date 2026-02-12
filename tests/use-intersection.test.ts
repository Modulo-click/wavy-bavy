import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIntersection, useMergedRef } from '../src/utils/use-intersection'

// ============================================================
// Mock IntersectionObserver
// ============================================================

let observerCallback: IntersectionObserverCallback
let observerInstances: MockIntersectionObserver[] = []

class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | null = null
    readonly rootMargin: string = '0px'
    readonly thresholds: readonly number[] = [0]

    constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
        observerCallback = callback
        observerInstances.push(this)
    }

    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}

beforeEach(() => {
    observerInstances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
    vi.restoreAllMocks()
})

function triggerIntersect(isIntersecting: boolean) {
    act(() => {
        observerCallback(
            [{ isIntersecting } as IntersectionObserverEntry],
            observerInstances[observerInstances.length - 1],
        )
    })
}

// ============================================================
// useIntersection
// ============================================================

describe('useIntersection', () => {
    it('returns [ref, false] initially', () => {
        const { result } = renderHook(() => useIntersection())
        const [ref, isVisible] = result.current
        expect(typeof ref).toBe('function')
        expect(isVisible).toBe(false)
    })

    it('becomes visible when observer fires', () => {
        const { result } = renderHook(() => useIntersection())

        // Attach ref to a real element
        const el = document.createElement('div')
        act(() => result.current[0](el))

        expect(observerInstances.length).toBeGreaterThan(0)

        // Trigger intersection
        triggerIntersect(true)
        expect(result.current[1]).toBe(true)
    })

    it('disconnects after first intersection when once=true', () => {
        const { result } = renderHook(() => useIntersection({ once: true }))

        const el = document.createElement('div')
        act(() => result.current[0](el))

        const observer = observerInstances[observerInstances.length - 1]
        triggerIntersect(true)

        expect(observer.disconnect).toHaveBeenCalled()
    })

    it('does NOT disconnect when once=false', () => {
        const { result } = renderHook(() => useIntersection({ once: false }))

        const el = document.createElement('div')
        act(() => result.current[0](el))

        const observer = observerInstances[observerInstances.length - 1]
        triggerIntersect(true)

        // Should not disconnect — keeps observing
        expect(observer.disconnect).not.toHaveBeenCalled()

        // Can go invisible again
        triggerIntersect(false)
        expect(result.current[1]).toBe(false)
    })

    it('falls back to visible when IntersectionObserver is unavailable', () => {
        vi.stubGlobal('IntersectionObserver', undefined)

        const { result } = renderHook(() => useIntersection())
        const el = document.createElement('div')
        act(() => result.current[0](el))

        expect(result.current[1]).toBe(true)
    })
})

// ============================================================
// useMergedRef
// ============================================================

describe('useMergedRef', () => {
    it('calls multiple refs with the same node', () => {
        const refA = vi.fn()
        const refB = { current: null as HTMLElement | null }

        const { result } = renderHook(() => useMergedRef<HTMLElement>(refA, refB))
        const el = document.createElement('div')

        act(() => result.current(el))

        expect(refA).toHaveBeenCalledWith(el)
        expect(refB.current).toBe(el)
    })

    it('handles null refs gracefully', () => {
        const refA = vi.fn()

        const { result } = renderHook(() => useMergedRef<HTMLElement>(refA, null, undefined))
        const el = document.createElement('div')

        act(() => result.current(el))
        expect(refA).toHaveBeenCalledWith(el)
    })
})
