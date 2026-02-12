import { describe, it, expect, vi } from 'vitest'
import wavyBavyPlugin, { wavyBavyPlugin as namedExport } from '../src/tailwind/plugin'

describe('Tailwind plugin', () => {
    it('exports a default function', () => {
        expect(typeof wavyBavyPlugin).toBe('function')
    })

    it('exports a named function', () => {
        expect(typeof namedExport).toBe('function')
        expect(namedExport).toBe(wavyBavyPlugin)
    })

    it('returns a plugin function when called', () => {
        const plugin = wavyBavyPlugin()
        expect(typeof plugin).toBe('function')
    })

    it('calls addUtilities with pattern classes', () => {
        const addUtilities = vi.fn()
        const matchUtilities = vi.fn()
        const api = { addUtilities, matchUtilities, theme: vi.fn(), e: vi.fn() }

        const plugin = wavyBavyPlugin()
        plugin(api as any)

        // Should have been called multiple times (patterns, positions, animations, shadow/glow)
        expect(addUtilities).toHaveBeenCalled()

        // Find the call that includes pattern utilities
        const allCalls = addUtilities.mock.calls.map(c => c[0])
        const hasPattern = allCalls.some(obj => '.wave-smooth' in obj)
        expect(hasPattern).toBe(true)
    })

    it('calls matchUtilities for height, duration, layers, amplitude, frequency', () => {
        const addUtilities = vi.fn()
        const matchUtilities = vi.fn()
        const api = { addUtilities, matchUtilities, theme: vi.fn(), e: vi.fn() }

        const plugin = wavyBavyPlugin()
        plugin(api as any)

        // matchUtilities should be called for: wave-h, wave-duration, wave-layers, wave-amplitude, wave-frequency
        expect(matchUtilities).toHaveBeenCalledTimes(5)
    })

    it('adds custom preset utilities from options', () => {
        const addUtilities = vi.fn()
        const matchUtilities = vi.fn()
        const api = { addUtilities, matchUtilities, theme: vi.fn(), e: vi.fn() }

        const plugin = wavyBavyPlugin({
            waves: {
                hero: { height: '300px', pattern: 'organic', animate: 'flow' },
            },
        })
        plugin(api as any)

        const allCalls = addUtilities.mock.calls.map(c => c[0])
        const hasPreset = allCalls.some(obj => '.wave-hero' in obj)
        expect(hasPreset).toBe(true)
    })

    it('wave-h matcher sets CSS variable', () => {
        const addUtilities = vi.fn()
        const matchUtilities = vi.fn()
        const api = { addUtilities, matchUtilities, theme: vi.fn(), e: vi.fn() }

        const plugin = wavyBavyPlugin()
        plugin(api as any)

        // Find the wave-h matchUtilities call
        const waveHCall = matchUtilities.mock.calls.find(c => 'wave-h' in c[0])
        expect(waveHCall).toBeDefined()

        // Execute the utility function
        const fn = waveHCall![0]['wave-h']
        expect(fn('120px')).toEqual({ '--wavy-bavy-height': '120px' })
    })
})
