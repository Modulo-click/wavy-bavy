import { describe, it, expect } from 'vitest'
import { createScrollTracker } from '../src/utils/scroll-tracker'

describe('createScrollTracker', () => {
    it('creates a tracker with default options', () => {
        const tracker = createScrollTracker()
        expect(tracker.offset).toBe(0)
        expect(tracker.velocity).toBe(0)
        expect(tracker.damping).toBeGreaterThan(0)
    })

    it('tracks scroll position after update', () => {
        const tracker = createScrollTracker()
        tracker.update(100, 16)
        tracker.update(100, 32)
        expect(tracker.offset).toBeGreaterThan(0)
    })

    it('calculates velocity from position delta', () => {
        const tracker = createScrollTracker()
        tracker.update(0, 0)
        tracker.update(500, 100)
        expect(tracker.velocity).toBeGreaterThan(0)
    })

    it('uses low damping at high velocity', () => {
        const tracker = createScrollTracker({ maxVelocity: 2000, minDamping: 0.02, maxDamping: 0.15 })
        tracker.update(0, 0)
        tracker.update(2000, 100)
        expect(tracker.damping).toBeLessThan(0.1)
    })

    it('uses high damping at low velocity', () => {
        const tracker = createScrollTracker({ maxVelocity: 2000, minDamping: 0.02, maxDamping: 0.15 })
        tracker.update(0, 0)
        tracker.update(5, 100)
        expect(tracker.damping).toBeGreaterThan(0.1)
    })

    it('reset returns to initial state', () => {
        const tracker = createScrollTracker()
        tracker.update(500, 16)
        tracker.update(500, 32)
        tracker.reset()
        expect(tracker.offset).toBe(0)
        expect(tracker.velocity).toBe(0)
    })

    it('respects custom options', () => {
        const tracker = createScrollTracker({
            maxVelocity: 1000,
            minDamping: 0.05,
            maxDamping: 0.2,
        })
        tracker.update(0, 0)
        tracker.update(10, 100)
        expect(tracker.damping).toBeLessThanOrEqual(0.2)
        expect(tracker.damping).toBeGreaterThanOrEqual(0.05)
    })

    it('offset smoothly approaches target', () => {
        const tracker = createScrollTracker()
        for (let i = 0; i < 60; i++) {
            tracker.update(100, i * 16)
        }
        expect(tracker.offset).toBeGreaterThan(90)
        expect(tracker.offset).toBeLessThanOrEqual(100)
    })
})
