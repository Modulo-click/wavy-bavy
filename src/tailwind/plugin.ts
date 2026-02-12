/**
 * wavy-bavy Tailwind CSS Plugin
 *
 * Adds utility classes for wave sections:
 *   - wave-{pattern}       → pattern selection (smooth, organic, sharp, etc.)
 *   - wave-h-{size}        → wave height (sm, md, lg, xl, 2xl)
 *   - wave-animate-{name}  → animation preset (flow, pulse, morph, etc.)
 *   - wave-duration-{speed} → animation duration (fast, normal, slow)
 *   - wave-pos-{position}  → wave position (top, bottom, both, none)
 *   - wave-layers-{n}      → layer count
 *   - wave-amplitude-{n}   → amplitude value
 *   - wave-frequency-{n}   → frequency value
 *
 * @example
 * ```js
 * // tailwind.config.js
 * const wavyBavy = require('wavy-bavy/tailwind')
 *
 * module.exports = {
 *   plugins: [
 *     wavyBavy({
 *       waves: {
 *         hero: { height: '300px', pattern: 'organic', animate: 'flow' },
 *       }
 *     })
 *   ]
 * }
 * ```
 */

import { defaultWaveTheme } from './theme'

// Type for Tailwind's plugin API (inline to avoid dependency on tailwindcss)
interface PluginAPI {
    addUtilities: (utilities: Record<string, Record<string, string>>, options?: unknown) => void
    addComponents: (components: Record<string, Record<string, string>>, options?: unknown) => void
    matchUtilities: (
        utilities: Record<string, (value: string) => Record<string, string>>,
        options?: { values?: Record<string, string>; type?: string | string[] },
    ) => void
    theme: (path: string, defaultValue?: unknown) => unknown
    e: (value: string) => string
}

interface WavePresetConfig {
    height?: string
    pattern?: string
    animate?: string
    duration?: string
}

interface WavyBavyPluginOptions {
    waves?: Record<string, WavePresetConfig>
}

function wavyBavyPlugin(options: WavyBavyPluginOptions = {}) {
    return function plugin(api: PluginAPI) {
        const { addUtilities, matchUtilities } = api
        const theme = defaultWaveTheme

        // ── Static pattern utilities ──
        const patternUtilities: Record<string, Record<string, string>> = {}
        for (const pattern of theme.patterns) {
            patternUtilities[`.wave-${pattern}`] = {
                '--wavy-bavy-pattern': pattern,
            }
        }
        addUtilities(patternUtilities)

        // ── Static position utilities ──
        addUtilities({
            '.wave-pos-top': { '--wavy-bavy-position': 'top' },
            '.wave-pos-bottom': { '--wavy-bavy-position': 'bottom' },
            '.wave-pos-both': { '--wavy-bavy-position': 'both' },
            '.wave-pos-none': { '--wavy-bavy-position': 'none' },
        })

        // ── Height utilities (with JIT support) ──
        matchUtilities(
            {
                'wave-h': (value: string) => ({
                    '--wavy-bavy-height': value,
                }),
            },
            { values: theme.heights, type: ['length'] },
        )

        // ── Animation utilities ──
        const animationUtilities: Record<string, Record<string, string>> = {}
        for (const anim of theme.animations) {
            animationUtilities[`.wave-animate-${anim}`] = {
                '--wavy-bavy-animate': anim,
            }
        }
        animationUtilities['.wave-animate-none'] = {
            '--wavy-bavy-animate': 'none',
        }
        addUtilities(animationUtilities)

        // ── Duration utilities ──
        matchUtilities(
            {
                'wave-duration': (value: string) => ({
                    '--wavy-bavy-duration': value,
                }),
            },
            { values: theme.durations, type: ['time'] },
        )

        // ── Layer count utilities ──
        matchUtilities(
            {
                'wave-layers': (value: string) => ({
                    '--wavy-bavy-layers': value,
                }),
            },
            {
                values: { '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' },
            },
        )

        // ── Amplitude utilities ──
        matchUtilities(
            {
                'wave-amplitude': (value: string) => ({
                    '--wavy-bavy-amplitude': value,
                }),
            },
            {
                values: {
                    '10': '0.1', '20': '0.2', '30': '0.3', '40': '0.4',
                    '50': '0.5', '60': '0.6', '70': '0.7', '80': '0.8',
                    '90': '0.9', '100': '1',
                },
            },
        )

        // ── Frequency utilities ──
        matchUtilities(
            {
                'wave-frequency': (value: string) => ({
                    '--wavy-bavy-frequency': value,
                }),
            },
            {
                values: { '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' },
            },
        )

        // ── Shadow / glow toggles ──
        addUtilities({
            '.wave-shadow': { '--wavy-bavy-shadow': '1' },
            '.wave-glow': { '--wavy-bavy-glow': '1' },
        })

        // ── User-defined preset utilities ──
        if (options.waves) {
            const presetUtilities: Record<string, Record<string, string>> = {}
            for (const [name, config] of Object.entries(options.waves)) {
                const styles: Record<string, string> = {}
                if (config.height) styles['--wavy-bavy-height'] = config.height
                if (config.pattern) styles['--wavy-bavy-pattern'] = config.pattern
                if (config.animate) styles['--wavy-bavy-animate'] = config.animate
                if (config.duration) styles['--wavy-bavy-duration'] = config.duration
                presetUtilities[`.wave-${name}`] = styles
            }
            addUtilities(presetUtilities)
        }
    }
}

export default wavyBavyPlugin
export { wavyBavyPlugin }
export type { WavyBavyPluginOptions, WavePresetConfig }
