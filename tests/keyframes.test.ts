import { describe, it, expect } from 'vitest'
import {
    flowLegacyKeyframes,
    flowKeyframes,
    pulseKeyframes,
    morphLegacyKeyframes,
    morphKeyframes,
    rippleLegacyKeyframes,
    rippleKeyframes,
    bounceKeyframes,
    KEYFRAME_GENERATORS,
    PATH_MORPH_GENERATORS,
    generateDualPathMorphKeyframes,
} from '../src/utils/keyframes'

describe('legacy keyframe generators', () => {
    it('flowLegacyKeyframes returns valid CSS @keyframes', () => {
        const css = flowLegacyKeyframes('test-flow')
        expect(css).toContain('@keyframes test-flow')
        expect(css).toContain('translateX')
    })

    it('flowKeyframes is an alias for flowLegacyKeyframes', () => {
        expect(flowKeyframes).toBe(flowLegacyKeyframes)
    })

    it('morphLegacyKeyframes returns valid CSS @keyframes', () => {
        const css = morphLegacyKeyframes('test-morph')
        expect(css).toContain('@keyframes test-morph')
        expect(css).toContain('scaleY')
        expect(css).toContain('scaleX')
    })

    it('morphKeyframes is an alias for morphLegacyKeyframes', () => {
        expect(morphKeyframes).toBe(morphLegacyKeyframes)
    })

    it('rippleLegacyKeyframes returns valid CSS @keyframes', () => {
        const css = rippleLegacyKeyframes('test-ripple')
        expect(css).toContain('@keyframes test-ripple')
        expect(css).toContain('translateX')
        expect(css).toContain('scaleY')
    })

    it('rippleKeyframes is an alias for rippleLegacyKeyframes', () => {
        expect(rippleKeyframes).toBe(rippleLegacyKeyframes)
    })
})

describe('active keyframe generators', () => {
    it('pulseKeyframes returns valid CSS @keyframes', () => {
        const css = pulseKeyframes('test-pulse')
        expect(css).toContain('@keyframes test-pulse')
        expect(css).toContain('scaleY')
    })

    it('bounceKeyframes returns valid CSS @keyframes', () => {
        const css = bounceKeyframes('test-bounce')
        expect(css).toContain('@keyframes test-bounce')
        expect(css).toContain('translateY')
    })
})

describe('KEYFRAME_GENERATORS registry', () => {
    it('contains only pulse and bounce (transform-based)', () => {
        expect(Object.keys(KEYFRAME_GENERATORS)).toEqual(['pulse', 'bounce'])
    })

    it('each generator is a function', () => {
        for (const gen of Object.values(KEYFRAME_GENERATORS)) {
            expect(typeof gen).toBe('function')
        }
    })

    it('each generator returns a string containing @keyframes', () => {
        for (const [name, gen] of Object.entries(KEYFRAME_GENERATORS)) {
            const css = gen(`test-${name}`)
            expect(css).toContain(`@keyframes test-${name}`)
        }
    })
})

describe('PATH_MORPH_GENERATORS registry', () => {
    it('contains 7 path morphing animation types', () => {
        expect(Object.keys(PATH_MORPH_GENERATORS).sort()).toEqual(
            ['breathe', 'drift', 'flow', 'morph', 'ripple', 'ripple-out', 'undulate']
        )
    })

    it('each generator is a function', () => {
        for (const gen of Object.values(PATH_MORPH_GENERATORS)) {
            expect(typeof gen).toBe('function')
        }
    })
})

describe('generateDualPathMorphKeyframes', () => {
    it('generates coordinated CSS for both paths', () => {
        const result = generateDualPathMorphKeyframes(
            'test-a', 'test-b', '', '', 'drift', 'smooth', { height: 120, amplitude: 0.5, frequency: 1 }
        )
        expect(result.cssA).toContain('@keyframes test-a')
        expect(result.cssB).toContain('@keyframes test-b')
        expect(result.cssA).toContain('d: path(')
        expect(result.cssB).toContain('d: path(')
    })

    it('returns empty strings for unknown animation', () => {
        const result = generateDualPathMorphKeyframes(
            'a', 'b', '', '', 'nonexistent', 'smooth', {}
        )
        expect(result.cssA).toBe('')
        expect(result.cssB).toBe('')
    })
})
