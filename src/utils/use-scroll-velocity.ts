'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

// ============================================================
// useScrollVelocity — scroll speed detection hook
// ============================================================

export interface ScrollVelocityOptions {
    /** px/frame threshold for max velocity. Default: 50 */
    sensitivity?: number
    /** Exponential moving average factor (0-1). Default: 0.3 */
    smoothing?: number
    /** Skip all listeners. Default: false */
    disabled?: boolean
}

/**
 * Hook: useScrollVelocity
 *
 * Tracks how fast the user is scrolling.
 * Returns a normalized value (0-1) where 0 = stationary, 1 = fast scroll.
 *
 * Uses `requestAnimationFrame` throttling and exponential moving average
 * for smooth velocity tracking. Decays toward 0 when scrolling stops.
 * SSR-safe: returns 0 when `window` is undefined.
 *
 * @param options - Scroll velocity options
 * @returns velocity (0-1)
 */
export function useScrollVelocity(options: ScrollVelocityOptions = {}): number {
    const { sensitivity = 50, smoothing = 0.3, disabled = false } = options
    const [velocity, setVelocity] = useState(0)
    const lastScrollYRef = useRef(0)
    const smoothedRef = useRef(0)
    const rafRef = useRef<number | null>(null)
    const decayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const onScroll = useCallback(() => {
        if (rafRef.current !== null) return
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null

            if (typeof window === 'undefined') return

            const currentY = window.scrollY
            const delta = Math.abs(currentY - lastScrollYRef.current)
            lastScrollYRef.current = currentY

            // Normalize delta by sensitivity
            const raw = Math.min(1, delta / sensitivity)

            // Exponential moving average
            smoothedRef.current = smoothedRef.current * (1 - smoothing) + raw * smoothing

            setVelocity(smoothedRef.current)

            // Reset decay timer
            if (decayTimerRef.current !== null) {
                clearTimeout(decayTimerRef.current)
            }

            // Decay velocity toward 0 when scrolling stops
            decayTimerRef.current = setTimeout(() => {
                smoothedRef.current = 0
                setVelocity(0)
            }, 150)
        })
    }, [sensitivity, smoothing])

    useEffect(() => {
        if (disabled || typeof window === 'undefined') return

        lastScrollYRef.current = window.scrollY

        window.addEventListener('scroll', onScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', onScroll)
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
            if (decayTimerRef.current !== null) {
                clearTimeout(decayTimerRef.current)
                decayTimerRef.current = null
            }
        }
    }, [disabled, onScroll])

    return velocity
}
