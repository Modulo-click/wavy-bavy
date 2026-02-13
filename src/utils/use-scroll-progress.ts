'use client'

import { useRef, useState, useEffect, useCallback, type RefCallback } from 'react'

// ============================================================
// useScrollProgress — scroll position tracking hook
// ============================================================

export interface ScrollProgressOptions {
    /** Shift the trigger zone in px. Default: 0 */
    offset?: number
    /** Constrain progress to 0-1 range. Default: true */
    clamp?: boolean
    /** Skip all listeners. Default: false */
    disabled?: boolean
}

/**
 * Hook: useScrollProgress
 *
 * Tracks how far an element has scrolled through the viewport.
 * Returns 0 when the element's bottom enters the viewport bottom,
 * and 1 when the element's top leaves the viewport top.
 *
 * Uses `requestAnimationFrame` throttling to avoid layout thrashing.
 * SSR-safe: returns progress=0 when `window` is undefined.
 *
 * @param options - Scroll progress options
 * @returns [ref, progress] — attach ref to the target element
 */
export function useScrollProgress(
    options: ScrollProgressOptions = {},
): [RefCallback<HTMLElement>, number] {
    const { offset = 0, clamp = true, disabled = false } = options
    const [progress, setProgress] = useState(0)
    const elementRef = useRef<HTMLElement | null>(null)
    const rafRef = useRef<number | null>(null)

    const calculate = useCallback(() => {
        const el = elementRef.current
        if (!el || typeof window === 'undefined') return

        const rect = el.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // progress = 0 when element bottom enters viewport bottom
        // progress = 1 when element top leaves viewport top
        const totalTravel = windowHeight + rect.height
        const traveled = windowHeight - rect.top + offset

        let p = totalTravel > 0 ? traveled / totalTravel : 0

        if (clamp) {
            p = Math.max(0, Math.min(1, p))
        }

        setProgress(prev => Math.abs(prev - p) < 0.001 ? prev : p)
    }, [offset, clamp])

    const onScroll = useCallback(() => {
        if (rafRef.current !== null) return
        rafRef.current = requestAnimationFrame(() => {
            calculate()
            rafRef.current = null
        })
    }, [calculate])

    const setRef: RefCallback<HTMLElement> = useCallback(
        (node: HTMLElement | null) => {
            elementRef.current = node
        },
        [],
    )

    useEffect(() => {
        if (disabled || typeof window === 'undefined') return

        // Calculate initial position
        calculate()

        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [disabled, onScroll, calculate])

    return [setRef, progress]
}
