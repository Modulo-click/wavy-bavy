import { describe, it, expect } from 'vitest'
import { DEFAULTS, BREAKPOINTS, PATTERN_REGISTRY, PRESETS, DEFAULT_SHADOW, DEFAULT_GLOW, DEFAULT_SEPARATION } from '../src/constants'

describe('DEFAULTS', () => {
    it('has expected default values', () => {
        expect(DEFAULTS.height).toBe(120)
        expect(DEFAULTS.pattern).toBe('smooth')
        expect(DEFAULTS.amplitude).toBe(0.5)
        expect(DEFAULTS.frequency).toBe(1)
        expect(DEFAULTS.animate).toBe('none')
        expect(DEFAULTS.respectReducedMotion).toBe(true)
    })
})

describe('BREAKPOINTS', () => {
    it('matches Tailwind defaults', () => {
        expect(BREAKPOINTS.sm).toBe(640)
        expect(BREAKPOINTS.md).toBe(768)
        expect(BREAKPOINTS.lg).toBe(1024)
        expect(BREAKPOINTS.xl).toBe(1280)
        expect(BREAKPOINTS['2xl']).toBe(1536)
    })
})

describe('PATTERN_REGISTRY', () => {
    it('has all 4 built-in patterns', () => {
        expect(PATTERN_REGISTRY).toHaveProperty('smooth')
        expect(PATTERN_REGISTRY).toHaveProperty('organic')
        expect(PATTERN_REGISTRY).toHaveProperty('sharp')
        expect(PATTERN_REGISTRY).toHaveProperty('mountain')
    })

    it('each pattern is a function', () => {
        for (const gen of Object.values(PATTERN_REGISTRY)) {
            expect(typeof gen).toBe('function')
        }
    })

    it('each pattern generates a valid path', () => {
        const config = { width: 1440, height: 120, amplitude: 0.5, frequency: 1, phase: 0, mirror: false }
        for (const [name, gen] of Object.entries(PATTERN_REGISTRY)) {
            const path = gen(config)
            expect(path, `${name} should produce a path`).toContain('M')
            expect(path, `${name} should close path`).toContain('Z')
        }
    })
})

describe('PRESETS', () => {
    it('has all 7 presets', () => {
        expect(Object.keys(PRESETS)).toEqual(
            expect.arrayContaining(['hero', 'footer', 'dark-light', 'dramatic', 'subtle', 'angular', 'peaks']),
        )
    })

    it('hero preset has correct config', () => {
        expect(PRESETS.hero.height).toBe(200)
        expect(PRESETS.hero.amplitude).toBe(0.6)
        expect(PRESETS.hero.pattern).toBe('smooth')
    })

    it('subtle preset has small height', () => {
        expect(PRESETS.subtle.height).toBe(80)
        expect(PRESETS.subtle.amplitude).toBe(0.3)
    })
})

describe('DEFAULT_SHADOW', () => {
    it('has expected values', () => {
        expect(DEFAULT_SHADOW.blur).toBe(10)
        expect(DEFAULT_SHADOW.offsetY).toBe(4)
    })
})

describe('DEFAULT_GLOW', () => {
    it('has expected values', () => {
        expect(DEFAULT_GLOW.intensity).toBe(20)
        expect(DEFAULT_GLOW.opacity).toBe(0.5)
    })
})

describe('DEFAULT_SEPARATION', () => {
    it('has correct defaults', () => {
        expect(DEFAULT_SEPARATION.mode).toBe('interlock')
        expect(DEFAULT_SEPARATION.intensity).toBe(0.5)
        expect(DEFAULT_SEPARATION.gap).toBe(0)
    })
})

describe('new presets', () => {
    it('has hero-dramatic preset', () => {
        expect(PRESETS['hero-dramatic']).toBeDefined()
        expect(PRESETS['hero-dramatic'].pattern).toBe('flowing')
    })

    it('has section-subtle preset', () => {
        expect(PRESETS['section-subtle']).toBeDefined()
    })

    it('has section-bold preset', () => {
        expect(PRESETS['section-bold']).toBeDefined()
    })

    it('has cta-sweep preset', () => {
        expect(PRESETS['cta-sweep']).toBeDefined()
        expect(PRESETS['cta-sweep'].pattern).toBe('ribbon')
    })

    it('has clean-divide preset', () => {
        expect(PRESETS['clean-divide']).toBeDefined()
    })
})
