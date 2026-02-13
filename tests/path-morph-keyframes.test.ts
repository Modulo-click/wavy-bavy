import { describe, it, expect } from 'vitest'
import {
    driftKeyframes,
    breatheKeyframes,
    undulateKeyframes,
    rippleOutKeyframes,
    generatePathKeyframes,
} from '../src/utils/keyframes'

describe('new path-morphing keyframe generators', () => {
    it('driftKeyframes generates CSS with d: path()', () => {
        const css = driftKeyframes('test-drift', 'M 0 120 L 0 60 Q 360 30, 720 60 Q 1080 90, 1440 50 L 1440 120 Z')
        expect(css).toContain('@keyframes test-drift')
        expect(css).toContain('d: path(')
        expect(css).toContain('0%')
        expect(css).toContain('100%')
    })

    it('breatheKeyframes generates CSS with d: path()', () => {
        const css = breatheKeyframes('test-breathe', 'M 0 120 L 0 60 Q 360 30, 720 60 L 1440 120 Z')
        expect(css).toContain('@keyframes test-breathe')
        expect(css).toContain('d: path(')
    })

    it('undulateKeyframes generates CSS with d: path()', () => {
        const css = undulateKeyframes('test-und', 'M 0 120 L 0 60 Q 360 30, 720 60 L 1440 120 Z')
        expect(css).toContain('@keyframes test-und')
        expect(css).toContain('d: path(')
    })

    it('rippleOutKeyframes generates CSS with d: path()', () => {
        const css = rippleOutKeyframes('test-rip', 'M 0 120 L 0 60 Q 360 30, 720 60 L 1440 120 Z')
        expect(css).toContain('@keyframes test-rip')
        expect(css).toContain('d: path(')
    })

    it('generatePathKeyframes creates multiple frames', () => {
        const frames = generatePathKeyframes({
            basePath: 'M 0 120 L 0 60 Q 360 30, 720 60 Q 1080 90, 1440 50 L 1440 120 Z',
            frameCount: 6,
            phaseRange: 0.5,
            amplitudeVariation: 0.15,
            pattern: 'smooth',
            config: { height: 120, amplitude: 0.5, frequency: 1 },
        })
        expect(frames).toHaveLength(6)
        expect(frames[0]).toContain('M')
        // First and last frame should be the same (loopable)
        expect(frames[0]).toBe(frames[frames.length - 1])
    })

    it('frames are different from each other (except first/last)', () => {
        const frames = generatePathKeyframes({
            basePath: 'M 0 120 L 0 60 Q 360 30, 720 60 Q 1080 90, 1440 50 L 1440 120 Z',
            frameCount: 5,
            phaseRange: 0.5,
            amplitudeVariation: 0.15,
            pattern: 'smooth',
            config: { height: 120, amplitude: 0.5, frequency: 1 },
        })
        const unique = new Set(frames)
        expect(unique.size).toBeGreaterThan(1)
    })
})
