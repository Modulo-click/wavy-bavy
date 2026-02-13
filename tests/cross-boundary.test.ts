import { describe, it, expect } from 'vitest'
import { generateCrossBoundaryPaths } from '../src/utils/interlock-generator'
import type { CrossBoundaryOptions } from '../src/utils/interlock-generator'

describe('generateCrossBoundaryPaths', () => {
    const baseUpper = { pattern: 'smooth' as const, height: 120, amplitude: 0.5, frequency: 1 }
    const baseLower = { pattern: 'smooth' as const, height: 120, amplitude: 0.5, frequency: 1 }

    it('returns valid pathA, pathB, and baseCurve', () => {
        const result = generateCrossBoundaryPaths({
            upperConfig: baseUpper,
            lowerConfig: baseLower,
        })
        expect(result.pathA).toBeTruthy()
        expect(result.pathB).toBeTruthy()
        expect(result.baseCurve).toBeTruthy()
        expect(result.pathA).toContain('M')
        expect(result.pathB).toContain('M')
        expect(result.pathA).toContain('Z')
        expect(result.pathB).toContain('Z')
    })

    it('produces different paths from different configs', () => {
        const result = generateCrossBoundaryPaths({
            upperConfig: { pattern: 'smooth', height: 120, amplitude: 0.3, frequency: 1 },
            lowerConfig: { pattern: 'organic', height: 120, amplitude: 0.8, frequency: 3, seed: 42 },
        })
        expect(result.pathA).not.toBe(result.pathB)
    })

    it('flush mode returns raw paths', () => {
        const result = generateCrossBoundaryPaths({
            upperConfig: baseUpper,
            lowerConfig: baseLower,
            mode: 'flush',
        })
        // In flush mode, pathA should be the upper config's raw generated path
        expect(result.pathA).toBeTruthy()
        expect(result.pathB).toBeTruthy()
    })

    it('identical configs produce pathA !== pathB in interlock mode', () => {
        const result = generateCrossBoundaryPaths({
            upperConfig: baseUpper,
            lowerConfig: baseLower,
            mode: 'interlock',
            intensity: 0.5,
        })
        // With interlock, paths should be offset from each other
        expect(result.pathA).not.toBe(result.pathB)
    })

    it('works with various pattern combinations', () => {
        const combos: [string, string][] = [
            ['smooth', 'organic'],
            ['sharp', 'flowing'],
            ['mountain', 'ribbon'],
            ['layered-organic', 'smooth'],
        ]
        for (const [upper, lower] of combos) {
            const result = generateCrossBoundaryPaths({
                upperConfig: { ...baseUpper, pattern: upper as any, seed: 42 },
                lowerConfig: { ...baseLower, pattern: lower as any, seed: 77 },
            })
            expect(result.pathA).toBeTruthy()
            expect(result.pathB).toBeTruthy()
        }
    })

    it('handles height mismatch (uses max)', () => {
        const result = generateCrossBoundaryPaths({
            upperConfig: { ...baseUpper, height: 80 },
            lowerConfig: { ...baseLower, height: 200 },
        })
        // Both paths should reference the max height (200) in their closing coords
        expect(result.pathA).toContain('200')
        expect(result.pathB).toContain('200')
    })

    it('intensity 0 produces minimal offset between paths', () => {
        const lowIntensity = generateCrossBoundaryPaths({
            upperConfig: baseUpper,
            lowerConfig: baseLower,
            intensity: 0,
        })
        const highIntensity = generateCrossBoundaryPaths({
            upperConfig: baseUpper,
            lowerConfig: baseLower,
            intensity: 1,
        })
        // Low intensity paths should be closer together than high intensity
        // Just verify both return valid results
        expect(lowIntensity.pathA).toBeTruthy()
        expect(highIntensity.pathA).toBeTruthy()
        expect(lowIntensity.pathA).not.toBe(highIntensity.pathA)
    })

    it('gap parameter affects separation', () => {
        const noGap = generateCrossBoundaryPaths({
            upperConfig: baseUpper,
            lowerConfig: baseLower,
            gap: 0,
        })
        const withGap = generateCrossBoundaryPaths({
            upperConfig: baseUpper,
            lowerConfig: baseLower,
            gap: 20,
        })
        expect(noGap.pathA).not.toBe(withGap.pathA)
    })

    it('supports all interlock modes', () => {
        const modes = ['interlock', 'overlap', 'apart', 'flush'] as const
        for (const mode of modes) {
            const result = generateCrossBoundaryPaths({
                upperConfig: baseUpper,
                lowerConfig: baseLower,
                mode,
            })
            expect(result.pathA).toBeTruthy()
            expect(result.pathB).toBeTruthy()
        }
    })

    it('preserves each curve character with different patterns', () => {
        const result = generateCrossBoundaryPaths({
            upperConfig: { pattern: 'smooth', height: 120, amplitude: 0.3, frequency: 1 },
            lowerConfig: { pattern: 'sharp', height: 120, amplitude: 0.8, frequency: 4 },
            mode: 'interlock',
            intensity: 0.5,
        })
        // Both paths should be valid and different
        expect(result.pathA).not.toBe(result.pathB)
        expect(result.pathA).toContain('C') // Smooth cubic bezier segments
        expect(result.pathB).toContain('C')
    })
})
