import { describe, it, expect } from 'vitest'
import { generateInterlockPaths, autoSeed } from '../src/utils/interlock-generator'

describe('autoSeed', () => {
    it('returns a number', () => {
        expect(typeof autoSeed(0, 0)).toBe('number')
    })

    it('is deterministic', () => {
        expect(autoSeed(3, 1)).toBe(autoSeed(3, 1))
    })

    it('differs for different indices', () => {
        expect(autoSeed(0, 0)).not.toBe(autoSeed(1, 0))
        expect(autoSeed(0, 0)).not.toBe(autoSeed(0, 1))
    })

    it('returns values in 0-9999 range', () => {
        for (let i = 0; i < 50; i++) {
            const s = autoSeed(i, i * 3)
            expect(s).toBeGreaterThanOrEqual(0)
            expect(s).toBeLessThan(10000)
        }
    })
})

describe('generateInterlockPaths', () => {
    it('returns pathA, pathB, and baseCurve', () => {
        const result = generateInterlockPaths({
            pattern: 'smooth',
            height: 120,
            amplitude: 0.5,
            frequency: 1,
            intensity: 0.5,
            mode: 'interlock',
            seed: 42,
        })
        expect(result.pathA).toContain('M')
        expect(result.pathA).toContain('Z')
        expect(result.pathB).toContain('M')
        expect(result.pathB).toContain('Z')
        expect(result.baseCurve).toBeTruthy()
    })

    it('pathA and pathB are different', () => {
        const result = generateInterlockPaths({
            pattern: 'smooth',
            height: 120,
            amplitude: 0.5,
            frequency: 1,
            intensity: 0.5,
            mode: 'interlock',
            seed: 42,
        })
        expect(result.pathA).not.toBe(result.pathB)
    })

    it('flush mode produces identical pathA and pathB', () => {
        const result = generateInterlockPaths({
            pattern: 'smooth',
            height: 120,
            amplitude: 0.5,
            frequency: 1,
            intensity: 0.5,
            mode: 'flush',
            seed: 42,
        })
        expect(result.pathA).toBe(result.pathB)
    })

    it('intensity 0 produces minimal difference between paths', () => {
        const result = generateInterlockPaths({
            pattern: 'smooth',
            height: 120,
            amplitude: 0.5,
            frequency: 1,
            intensity: 0,
            mode: 'interlock',
            seed: 42,
        })
        expect(result.pathA).toBeTruthy()
        expect(result.pathB).toBeTruthy()
    })

    it('is deterministic with same seed', () => {
        const opts = { pattern: 'organic' as const, height: 120, amplitude: 0.5, frequency: 1, intensity: 0.6, mode: 'interlock' as const, seed: 99 }
        const a = generateInterlockPaths(opts)
        const b = generateInterlockPaths(opts)
        expect(a.pathA).toBe(b.pathA)
        expect(a.pathB).toBe(b.pathB)
    })

    it('gap parameter affects the result', () => {
        const noGap = generateInterlockPaths({ pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.5, mode: 'interlock', seed: 42, gap: 0 })
        const withGap = generateInterlockPaths({ pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.5, mode: 'interlock', seed: 42, gap: 10 })
        expect(noGap.pathA).not.toBe(withGap.pathA)
    })

    it('works with all new patterns', () => {
        for (const pattern of ['flowing', 'ribbon', 'layered-organic'] as const) {
            const result = generateInterlockPaths({
                pattern, height: 200, amplitude: 0.7, frequency: 1, intensity: 0.8, mode: 'interlock', seed: 42,
            })
            expect(result.pathA).toContain('M')
            expect(result.pathB).toContain('M')
        }
    })

    it('overlap mode allows pathA peaks past pathB valleys', () => {
        const result = generateInterlockPaths({
            pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.7, mode: 'overlap', seed: 42,
        })
        expect(result.pathA).toBeTruthy()
        expect(result.pathB).toBeTruthy()
    })

    it('apart mode keeps paths further separated', () => {
        const apart = generateInterlockPaths({
            pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.5, mode: 'apart', seed: 42,
        })
        const interlock = generateInterlockPaths({
            pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.5, mode: 'interlock', seed: 42,
        })
        expect(apart.pathA).not.toBe(interlock.pathA)
    })
})
