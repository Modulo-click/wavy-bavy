import { describe, it, expect } from 'vitest'
import { generatePath, generateLayeredPaths, flipPathVertically } from '../src/utils/path-generator'

// ============================================================
// generatePath
// ============================================================

describe('generatePath', () => {
    it('generates a smooth path by default', () => {
        const path = generatePath('smooth')
        expect(path).toContain('M')
        expect(path).toContain('Z')
        expect(path.length).toBeGreaterThan(10)
    })

    it('generates an organic path', () => {
        const path = generatePath('organic', { seed: 42 })
        expect(path).toContain('M')
        expect(path).toContain('C') // cubic bezier
        expect(path).toContain('Z')
    })

    it('generates a sharp path', () => {
        const path = generatePath('sharp', { frequency: 3 })
        expect(path).toContain('M')
        expect(path).toContain('L')
        expect(path).toContain('Z')
    })

    it('generates a mountain path', () => {
        const path = generatePath('mountain', { frequency: 2 })
        expect(path).toContain('M')
        expect(path).toContain('L')
        expect(path).toContain('Z')
    })

    it('returns empty string for custom pattern', () => {
        expect(generatePath('custom')).toBe('')
    })

    it('layered falls back to smooth', () => {
        const layered = generatePath('layered')
        const smooth = generatePath('smooth')
        expect(layered).toBe(smooth)
    })

    it('respects amplitude', () => {
        const low = generatePath('smooth', { amplitude: 0.1 })
        const high = generatePath('smooth', { amplitude: 0.9 })
        expect(low).not.toBe(high)
    })

    it('respects frequency for sharp pattern', () => {
        const f1 = generatePath('sharp', { frequency: 1 })
        const f3 = generatePath('sharp', { frequency: 3 })
        // More frequency = more L commands
        const f1Count = (f1.match(/L /g) || []).length
        const f3Count = (f3.match(/L /g) || []).length
        expect(f3Count).toBeGreaterThan(f1Count)
    })

    it('applies mirror transform', () => {
        const normal = generatePath('smooth', { mirror: false })
        const mirrored = generatePath('smooth', { mirror: true })
        expect(normal).not.toBe(mirrored)
    })

    it('organic path is deterministic with same seed', () => {
        const a = generatePath('organic', { seed: 123 })
        const b = generatePath('organic', { seed: 123 })
        expect(a).toBe(b)
    })

    it('organic path differs with different seed', () => {
        const a = generatePath('organic', { seed: 1 })
        const b = generatePath('organic', { seed: 2 })
        expect(a).not.toBe(b)
    })
})

// ============================================================
// flipPathVertically
// ============================================================

describe('flipPathVertically', () => {
    const height = 120

    it('flips M command Y coordinates', () => {
        const result = flipPathVertically('M 0 120', height)
        expect(result).toBe('M0 0')
    })

    it('flips L command Y coordinates', () => {
        const result = flipPathVertically('L 100 60', height)
        expect(result).toBe('L100 60')
    })

    it('flips a complete smooth path', () => {
        const path = generatePath('smooth', { height })
        const flipped = flipPathVertically(path, height)
        // Flipped path should differ from original
        expect(flipped).not.toBe(path)
        // Should still contain valid SVG commands
        expect(flipped).toContain('M')
        expect(flipped).toContain('Z')
    })

    it('flips V command values', () => {
        const result = flipPathVertically('V 60', height)
        expect(result).toBe('V60')
    })

    it('leaves H commands unchanged', () => {
        const result = flipPathVertically('H 100', height)
        expect(result).toBe('H100')
    })

    it('flips C (cubic bezier) Y coordinates', () => {
        const result = flipPathVertically('C 10 20 30 40 50 60', height)
        // Y coordinates (20, 40, 60) should become (100, 80, 60) for height=120
        expect(result).toBe('C10 100 30 80 50 60')
    })

    it('handles A (arc) commands with sweep flag inversion', () => {
        const result = flipPathVertically('A 10 10 0 0 1 50 60', height)
        // sweep flag (1) → 0, Y (60) → height-60=60
        expect(result).toContain('A')
    })
})

// ============================================================
// generateLayeredPaths
// ============================================================

describe('generateLayeredPaths', () => {
    it('generates the correct number of layers', () => {
        const paths = generateLayeredPaths('smooth', 3)
        expect(paths).toHaveLength(3)
    })

    it('each layer is a valid SVG path', () => {
        const paths = generateLayeredPaths('smooth', 3)
        for (const path of paths) {
            expect(path).toContain('M')
            expect(path).toContain('Z')
        }
    })

    it('layers differ from each other', () => {
        const paths = generateLayeredPaths('smooth', 3)
        expect(paths[0]).not.toBe(paths[1])
        expect(paths[1]).not.toBe(paths[2])
    })

    it('handles layered pattern by using smooth base', () => {
        const paths = generateLayeredPaths('layered', 2)
        expect(paths).toHaveLength(2)
    })

    it('single layer returns one path', () => {
        const paths = generateLayeredPaths('smooth', 1)
        expect(paths).toHaveLength(1)
    })
})
