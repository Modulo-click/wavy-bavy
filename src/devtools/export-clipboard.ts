import type { PatternName } from '../types'
import { generatePath } from '../utils/path-generator'
import { generateClipPath } from '../utils/clip-path'
import { DEFAULT_VIEWBOX_WIDTH } from '../constants'

export interface ClipPathCSSOptions {
    /** Wave pattern. Default: 'smooth' */
    pattern?: PatternName
    /** Wave height in px. Default: 120 */
    height?: number
    /** Wave amplitude (0-1). Default: 0.5 */
    amplitude?: number
    /** Number of wave peaks. Default: 1 */
    frequency?: number
    /** Wave position. Default: 'bottom' */
    position?: 'top' | 'bottom'
    /** Viewbox width. Default: 1440 */
    width?: number
    /** Seed for organic patterns */
    seed?: number
}

/**
 * Generate a CSS `clip-path: polygon(...)` string from wave config.
 * Wraps the existing `generateClipPath()` utility.
 */
export function generateClipPathCSS(options: ClipPathCSSOptions = {}): string {
    const {
        pattern = 'smooth',
        height = 120,
        amplitude = 0.5,
        frequency = 1,
        position = 'bottom',
        width = DEFAULT_VIEWBOX_WIDTH,
        seed,
    } = options

    const path = generatePath(pattern, {
        width,
        height,
        amplitude,
        frequency,
        phase: 0,
        mirror: false,
        seed,
    })

    return generateClipPath(path, height, position)
}

/**
 * Copy a clip-path CSS value to the clipboard.
 * Browser-only — uses navigator.clipboard.writeText.
 */
export async function copyClipPathToClipboard(options: ClipPathCSSOptions = {}): Promise<void> {
    const css = generateClipPathCSS(options)
    await navigator.clipboard.writeText(css)
}
