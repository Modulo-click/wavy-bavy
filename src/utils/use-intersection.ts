'use client'

import { useRef, useState, useEffect, useCallback, type RefCallback, type MutableRefObject } from 'react'

// ============================================================
// useIntersection — IntersectionObserver hook
// ============================================================

export interface UseIntersectionOptions {
    /** Root margin (CSS margin syntax). Default: '0px' */
    rootMargin?: string
    /** Intersection threshold (0-1). Default: 0 */
    threshold?: number | number[]
    /** If true, stop observing after first intersection. Default: true */
    once?: boolean
}

/**
 * Hook: useIntersection
 *
 * Observes an element's visibility in the viewport using IntersectionObserver.
 * Returns a ref callback and a boolean indicating whether the element is visible.
 *
 * @param options - IntersectionObserver options
 * @returns [ref, isVisible] — attach ref to the target element
 */
export function useIntersection(
    options: UseIntersectionOptions = {},
): [RefCallback<HTMLElement>, boolean] {
    const { rootMargin = '0px', threshold = 0, once = true } = options
    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef<HTMLElement | null>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)

    // Cleanup observer
    const disconnect = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect()
            observerRef.current = null
        }
    }, [])

    // Ref callback — called when the element mounts/unmounts
    const setRef: RefCallback<HTMLElement> = useCallback(
        (node: HTMLElement | null) => {
            // Disconnect old observer
            disconnect()
            elementRef.current = node

            if (!node) return
            if (typeof IntersectionObserver === 'undefined') {
                // Fallback: assume visible in SSR or unsupported environments
                setIsVisible(true)
                return
            }

            observerRef.current = new IntersectionObserver(
                ([entry]) => {
                    const visible = entry.isIntersecting
                    setIsVisible(visible)

                    if (visible && once) {
                        disconnect()
                    }
                },
                { rootMargin, threshold },
            )

            observerRef.current.observe(node)
        },
        [rootMargin, threshold, once, disconnect],
    )

    // Cleanup on unmount
    useEffect(() => disconnect, [disconnect])

    return [setRef, isVisible]
}

// ============================================================
// useMergedRef — combine multiple refs into one
// ============================================================

type ReactRef<T> = RefCallback<T> | MutableRefObject<T | null> | null | undefined

/**
 * Combine multiple React refs into a single ref callback.
 * Useful when a component needs both an internal ref and a forwarded ref.
 */
export function useMergedRef<T>(...refs: ReactRef<T>[]): RefCallback<T> {
    return useCallback(
        (node: T | null) => {
            for (const ref of refs) {
                if (typeof ref === 'function') {
                    ref(node)
                } else if (ref && typeof ref === 'object') {
                    ;(ref as MutableRefObject<T | null>).current = node
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        refs,
    )
}
