import type { ResolvedPresetConfig } from '../types'
import { PRESETS, DEFAULTS } from '../constants'

/**
 * Resolve a preset name to a fully hydrated config with no undefined fields.
 * Returns null if the preset name doesn't exist.
 */
export function resolvePreset(name: string): ResolvedPresetConfig | null {
    const preset = PRESETS[name]
    if (!preset) return null

    return {
        pattern: preset.pattern ?? DEFAULTS.pattern,
        height: typeof preset.height === 'number' ? preset.height : DEFAULTS.height,
        amplitude: preset.amplitude ?? DEFAULTS.amplitude,
        frequency: preset.frequency ?? DEFAULTS.frequency,
        animate: preset.animate === false ? 'none' : (preset.animate ?? DEFAULTS.animate),
        shadow: !!preset.shadow,
        glow: !!preset.glow,
        layers: preset.layers ?? 1,
        layerOpacity: preset.layerOpacity ?? 0.3,
    }
}

/**
 * Resolve all built-in presets to their fully hydrated configs.
 */
export function getAllPresets(): Record<string, ResolvedPresetConfig> {
    const result: Record<string, ResolvedPresetConfig> = {}
    for (const name of Object.keys(PRESETS)) {
        const resolved = resolvePreset(name)
        if (resolved) result[name] = resolved
    }
    return result
}
