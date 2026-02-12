import { describe, it, expect } from 'vitest'
import { optimizePath } from '../src/utils/path-optimizer'
import { generatePath } from '../src/utils/path-generator'

describe('optimizePath', () => {
    it('returns the same path for epsilon <= 0', () => {
        const path = 'M 0 120 L 0 80 L 100 60 L 200 80 L 200 120 Z'
        expect(optimizePath(path, 0)).toBe(path)
        expect(optimizePath(path, -1)).toBe(path)
    })

    it('returns the path unchanged when only 2 or fewer points', () => {
        const path = 'M 0 0 L 100 100 Z'
        expect(optimizePath(path, 10)).toBe(path)
    })

    it('reduces the number of points with higher epsilon', () => {
        const path = generatePath('sharp', { frequency: 4 })
        const low = optimizePath(path, 1)
        const high = optimizePath(path, 50)

        // Higher epsilon = fewer points = shorter string
        expect(high.length).toBeLessThanOrEqual(low.length)
    })

    it('produces a valid path (starts with M, ends with Z)', () => {
        const path = generatePath('mountain', { frequency: 3 })
        const optimized = optimizePath(path, 5)
        expect(optimized).toMatch(/^M\s/)
        expect(optimized).toMatch(/Z$/)
    })

    it('preserves start and end points', () => {
        const path = 'M 0 120 L 0 80 L 720 60 L 1440 80 L 1440 120 Z'
        const optimized = optimizePath(path, 5)
        expect(optimized).toContain('M 0 120')
        // Last point before Z should be close to 1440 120
        expect(optimized).toContain('1440 120')
    })
})
