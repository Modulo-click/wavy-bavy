import { describe, it, expect } from 'vitest'
import {
    flowKeyframes,
    pulseKeyframes,
    morphKeyframes,
    rippleKeyframes,
    bounceKeyframes,
    KEYFRAME_GENERATORS,
} from '../src/utils/keyframes'

describe('keyframe generators', () => {
    it('flowKeyframes returns valid CSS @keyframes', () => {
        const css = flowKeyframes('test-flow')
        expect(css).toContain('@keyframes test-flow')
        expect(css).toContain('translateX')
    })

    it('pulseKeyframes returns valid CSS @keyframes', () => {
        const css = pulseKeyframes('test-pulse')
        expect(css).toContain('@keyframes test-pulse')
        expect(css).toContain('scaleY')
    })

    it('morphKeyframes returns valid CSS @keyframes', () => {
        const css = morphKeyframes('test-morph')
        expect(css).toContain('@keyframes test-morph')
        expect(css).toContain('scaleY')
        expect(css).toContain('scaleX')
    })

    it('rippleKeyframes returns valid CSS @keyframes', () => {
        const css = rippleKeyframes('test-ripple')
        expect(css).toContain('@keyframes test-ripple')
        expect(css).toContain('translateX')
        expect(css).toContain('scaleY')
    })

    it('bounceKeyframes returns valid CSS @keyframes', () => {
        const css = bounceKeyframes('test-bounce')
        expect(css).toContain('@keyframes test-bounce')
        expect(css).toContain('translateY')
    })
})

describe('KEYFRAME_GENERATORS registry', () => {
    it('contains all 5 animation types', () => {
        expect(Object.keys(KEYFRAME_GENERATORS)).toEqual(['flow', 'pulse', 'morph', 'ripple', 'bounce'])
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
