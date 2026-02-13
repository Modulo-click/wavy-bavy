import { describe, it, expect } from 'vitest'

describe('SSR safety', () => {
    it('main entry exports are importable without errors', async () => {
        const mod = await import('../src/index')
        expect(mod.generatePath).toBeDefined()
        expect(mod.DEFAULTS).toBeDefined()
        expect(mod.PATTERN_REGISTRY).toBeDefined()
        expect(mod.KEYFRAME_GENERATORS).toBeDefined()
    })

    it('keyframes module is importable without errors', async () => {
        const mod = await import('../src/utils/keyframes')
        expect(mod.KEYFRAME_GENERATORS).toBeDefined()
        expect(mod.flowKeyframes).toBeDefined()
    })

    it('path-generator works without DOM', async () => {
        const { generatePath } = await import('../src/utils/path-generator')
        const path = generatePath('smooth', { width: 1440, height: 120, amplitude: 0.5 })
        expect(path).toContain('M')
        expect(path).toContain('Z')
    })

    it('color-utils work without DOM', async () => {
        const { hexToRgb, rgbToHex } = await import('../src/utils/color-utils')
        const rgb = hexToRgb('#ff0000')
        expect(rgb).toEqual({ r: 255, g: 0, b: 0 })
        expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
    })

    it('web-component module import does not throw in jsdom', async () => {
        // jsdom has customElements, so this tests the guard + registration
        await expect(import('../src/web-component')).resolves.toBeDefined()
    })
})
