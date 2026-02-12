import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { generateMorphFrames, useWaveAnimation, useReducedMotion } from '../src/utils/animation'

describe('generateMorphFrames', () => {
    it('generates the requested number of frames', () => {
        const frames = generateMorphFrames('smooth', 4)
        expect(frames).toHaveLength(4)
    })

    it('each frame is a valid SVG path', () => {
        const frames = generateMorphFrames('smooth', 4)
        for (const frame of frames) {
            expect(frame).toContain('M')
            expect(frame).toContain('Z')
        }
    })

    it('frames differ from each other', () => {
        const frames = generateMorphFrames('smooth', 4)
        // At least some frames should differ
        const unique = new Set(frames)
        expect(unique.size).toBeGreaterThan(1)
    })

    it('works with organic pattern', () => {
        const frames = generateMorphFrames('organic', 3, { seed: 42 })
        expect(frames).toHaveLength(3)
    })

    it('defaults to 4 frames', () => {
        const frames = generateMorphFrames('smooth')
        expect(frames).toHaveLength(4)
    })

    it('respects custom amplitude', () => {
        const low = generateMorphFrames('smooth', 2, { amplitude: 0.1 })
        const high = generateMorphFrames('smooth', 2, { amplitude: 0.9 })
        expect(low[0]).not.toBe(high[0])
    })
})

// ============================================================
// useReducedMotion
// ============================================================

describe('useReducedMotion', () => {
    const originalMatchMedia = window.matchMedia

    afterEach(() => {
        // Restore original matchMedia (may be undefined in jsdom)
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: originalMatchMedia,
        })
    })

    it('returns false when matchMedia is not available', () => {
        const { result } = renderHook(() => useReducedMotion())
        expect(result.current).toBe(false)
    })

    it('returns true when prefers-reduced-motion matches', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: () => ({
                matches: true,
                addEventListener: () => {},
                removeEventListener: () => {},
            }),
        })

        const { result } = renderHook(() => useReducedMotion())
        expect(result.current).toBe(true)
    })
})

// ============================================================
// useWaveAnimation — extended
// ============================================================

describe('useWaveAnimation', () => {
    it('returns empty style for animate=none', () => {
        const { result } = renderHook(() => useWaveAnimation({ animate: 'none' }))
        expect(result.current.animationStyle).toEqual({})
        expect(result.current.isAnimating).toBe(false)
    })

    it('returns animation style for animate=flow', () => {
        const { result } = renderHook(() => useWaveAnimation({ animate: 'flow' }))
        expect(result.current.animationStyle.animation).toBeDefined()
        expect(result.current.animationStyle.animation).toContain('wavy-bavy-anim-')
        expect(result.current.isAnimating).toBe(true)
    })

    it('supports custom keyframes', () => {
        const customKf = '0% { transform: scale(1); } 100% { transform: scale(1.2); }'
        const { result } = renderHook(() =>
            useWaveAnimation({ animate: 'custom', customKeyframes: customKf }),
        )
        expect(result.current.animationStyle.animation).toBeDefined()
        expect(result.current.isAnimating).toBe(true)
    })

    it('provides no-op pause/resume for static waves', () => {
        const { result } = renderHook(() => useWaveAnimation({ animate: 'none' }))
        // Should not throw
        result.current.pause()
        result.current.resume()
        expect(result.current.isAnimating).toBe(false)
    })

    it('pause/resume toggles animation state', () => {
        const { result } = renderHook(() => useWaveAnimation({ animate: 'flow' }))
        expect(result.current.isAnimating).toBe(true)

        act(() => result.current.pause())
        expect(result.current.isAnimating).toBe(false)
        expect(result.current.animationStyle.animationPlayState).toBe('paused')

        act(() => result.current.resume())
        expect(result.current.isAnimating).toBe(true)
        expect(result.current.animationStyle.animationPlayState).toBe('running')
    })

    it('accepts boolean true to default to flow', () => {
        const { result } = renderHook(() => useWaveAnimation({ animate: true }))
        expect(result.current.animationStyle.animation).toBeDefined()
        expect(result.current.isAnimating).toBe(true)
    })
})
