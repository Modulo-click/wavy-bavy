import { describe, it, expect } from 'vitest'
import { generateClipPath, generateDualClipPath } from '../src/utils/clip-path'
import { generatePath } from '../src/utils/path-generator'

describe('generateClipPath', () => {
    it('returns a polygon string for bottom position', () => {
        const path = generatePath('smooth', { height: 120 })
        const clip = generateClipPath(path, 120, 'bottom')
        expect(clip).toMatch(/^polygon\(/)
        expect(clip).toContain('0% 0%') // starts top-left
    })

    it('returns a polygon string for top position', () => {
        const path = generatePath('smooth', { height: 120 })
        const clip = generateClipPath(path, 120, 'top')
        expect(clip).toMatch(/^polygon\(/)
        expect(clip).toContain('0% 100%') // starts bottom-left
    })

    it('returns "none" for empty path', () => {
        expect(generateClipPath('', 120)).toBe('none')
    })

    it('defaults to bottom position', () => {
        const path = generatePath('smooth', { height: 120 })
        const clip = generateClipPath(path, 120)
        expect(clip).toContain('0% 0%')
    })

    it('produces percentage-based values', () => {
        const path = generatePath('smooth', { height: 120 })
        const clip = generateClipPath(path, 120)
        // All values should be percentages
        const points = clip.replace('polygon(', '').replace(')', '')
        expect(points).toMatch(/%/)
    })
})

describe('generateDualClipPath', () => {
    it('generates a polygon from two paths', () => {
        const top = generatePath('smooth', { height: 120 })
        const bottom = generatePath('smooth', { height: 120 })
        const clip = generateDualClipPath(top, bottom, 120)
        expect(clip).toMatch(/^polygon\(/)
        expect(clip).toContain('100% 100%') // right edge
    })

    it('returns "none" for empty paths', () => {
        expect(generateDualClipPath('', '', 120)).toBe('none')
    })
})
