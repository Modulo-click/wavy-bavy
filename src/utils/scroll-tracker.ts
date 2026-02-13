import type { ScrollTracker, ScrollTrackerOptions } from '../types'

/**
 * Create a velocity-adaptive scroll tracker.
 *
 * Tracks scroll position with damping that adapts to scroll speed:
 * - Fast scroll (high velocity) = low damping = near-instant response
 * - Slow scroll (low velocity) = high damping = buttery smooth
 *
 * Framework-agnostic (vanilla JS). Used by both React hooks and web component.
 */
export function createScrollTracker(options: ScrollTrackerOptions = {}): ScrollTracker {
    const {
        maxVelocity = 2000,
        minDamping = 0.02,
        maxDamping = 0.15,
    } = options

    let currentOffset = 0
    let currentVelocity = 0
    let currentDamping = maxDamping
    let lastScrollY = 0
    let lastTimestamp = 0
    let initialized = false

    const tracker: ScrollTracker = {
        get offset() { return currentOffset },
        get velocity() { return currentVelocity },
        get damping() { return currentDamping },

        update(scrollY: number, timestamp: number) {
            if (!initialized) {
                lastScrollY = scrollY
                lastTimestamp = timestamp
                initialized = true
                return
            }

            const dt = Math.max(1, timestamp - lastTimestamp)
            const dy = Math.abs(scrollY - lastScrollY)

            // Velocity in px/s
            currentVelocity = (dy / dt) * 1000

            // Adaptive damping: lerp between min and max based on velocity
            const velocityRatio = Math.min(1, currentVelocity / maxVelocity)
            currentDamping = maxDamping + (minDamping - maxDamping) * velocityRatio

            // Exponential smoothing toward target
            const smoothingFactor = 1 - currentDamping
            currentOffset += (scrollY - currentOffset) * smoothingFactor

            lastScrollY = scrollY
            lastTimestamp = timestamp
        },

        reset() {
            currentOffset = 0
            currentVelocity = 0
            currentDamping = maxDamping
            lastScrollY = 0
            lastTimestamp = 0
            initialized = false
        },
    }

    return tracker
}
