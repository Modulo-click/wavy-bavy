import type { PatternConfig, PatternName } from '../types'
import { PATTERN_REGISTRY, DEFAULT_VIEWBOX_WIDTH } from '../constants'

// ============================================================
// Path Generation
// ============================================================

/**
 * Generate an SVG path string for a given pattern.
 *
 * @param pattern - Pattern name or custom generator
 * @param config - Partial config (defaults are applied)
 * @returns SVG path string
 */
export function generatePath(
    pattern: PatternName,
    config: Partial<PatternConfig> = {},
): string {
    const fullConfig: PatternConfig = {
        width: config.width ?? DEFAULT_VIEWBOX_WIDTH,
        height: config.height ?? 120,
        amplitude: config.amplitude ?? 0.5,
        frequency: config.frequency ?? 1,
        phase: config.phase ?? 0,
        mirror: config.mirror ?? false,
        seed: config.seed,
    }

    // Custom path passthrough
    if (pattern === 'custom') {
        return '' // Custom paths are handled by the customPath prop
    }

    // Layered generates multiple paths — use smooth as base
    if (pattern === 'layered') {
        return PATTERN_REGISTRY['smooth'](fullConfig)
    }

    const generator = PATTERN_REGISTRY[pattern]
    if (!generator) {
        const available = Object.keys(PATTERN_REGISTRY).join(', ')
        console.warn(`[wavy-bavy] Unknown pattern "${pattern}", falling back to "smooth". Available patterns: ${available}`)
        return PATTERN_REGISTRY['smooth'](fullConfig)
    }

    const path = generator(fullConfig)

    // Apply mirror transform
    if (fullConfig.mirror) {
        return mirrorPath(path, fullConfig.width)
    }

    return path
}

/**
 * Flip a wave path vertically (for "up" direction waves).
 * Transforms a downward wave into an upward wave by inverting Y coordinates.
 *
 * Handles M, L, C, S, Q, T, and A commands.
 * Relative commands (m, l, c, s, q, t) negate Y; arc commands invert sweep flag.
 */
export function flipPathVertically(path: string, height: number): string {
    // Tokenize the path into commands + coordinate groups
    return path.replace(
        /([MLCSQTAHVZmlcsqtahvz])([^MLCSQTAHVZmlcsqtahvz]*)/g,
        (_match, cmd: string, args: string) => {
            const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number)
            if (nums.length === 0 || nums.some(isNaN)) return `${cmd}${args}`

            const upper = cmd.toUpperCase()
            const isRelative = cmd !== upper

            switch (upper) {
                case 'M':
                case 'L':
                case 'T':
                    // (x, y) pairs
                    for (let i = 1; i < nums.length; i += 2) {
                        nums[i] = isRelative ? -nums[i] : height - nums[i]
                    }
                    break

                case 'H':
                    // Horizontal — no Y to flip
                    break

                case 'V':
                    // Vertical — single Y value
                    for (let i = 0; i < nums.length; i++) {
                        nums[i] = isRelative ? -nums[i] : height - nums[i]
                    }
                    break

                case 'C':
                    // Cubic Bézier: (x1, y1, x2, y2, x, y)
                    for (let i = 0; i < nums.length; i++) {
                        if (i % 2 === 1) {
                            nums[i] = isRelative ? -nums[i] : height - nums[i]
                        }
                    }
                    break

                case 'S':
                case 'Q':
                    // Smooth cubic / Quadratic: (x2, y2, x, y) or (x1, y1, x, y)
                    for (let i = 0; i < nums.length; i++) {
                        if (i % 2 === 1) {
                            nums[i] = isRelative ? -nums[i] : height - nums[i]
                        }
                    }
                    break

                case 'A':
                    // Arc: (rx, ry, rotation, large-arc, sweep, x, y)
                    for (let g = 0; g < nums.length; g += 7) {
                        // Invert sweep flag (index 4 within each group)
                        nums[g + 4] = nums[g + 4] === 1 ? 0 : 1
                        // Flip end Y (index 6)
                        nums[g + 6] = isRelative ? -nums[g + 6] : height - nums[g + 6]
                    }
                    break

                case 'Z':
                    break
            }

            return `${cmd}${nums.join(' ')}`
        },
    )
}

/**
 * Mirror a path horizontally
 */
function mirrorPath(path: string, width: number): string {
    // For mirroring, we reverse the path direction
    // Simple approach: reflect X coordinates around center
    return path.replace(
        /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g,
        (_match, x: string, y: string) => {
            const mirroredX = width - parseFloat(x)
            return `${mirroredX} ${y}`
        },
    )
}

/**
 * Generate multiple wave layer paths with variations.
 * Used for the 'layered' pattern effect.
 *
 * @param basePattern - The base pattern to layer
 * @param layers - Number of layers
 * @param config - Base config
 * @returns Array of path strings
 */
export function generateLayeredPaths(
    basePattern: PatternName,
    layers: number,
    config: Partial<PatternConfig> = {},
): string[] {
    const paths: string[] = []

    for (let i = 0; i < layers; i++) {
        const layerConfig: Partial<PatternConfig> = {
            ...config,
            amplitude: (config.amplitude ?? 0.5) * (1 - i * 0.15),
            phase: (config.phase ?? 0) + i * 0.2,
        }
        paths.push(generatePath(basePattern === 'layered' ? 'smooth' : basePattern, layerConfig))
    }

    return paths
}
