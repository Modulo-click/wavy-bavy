import { DEFAULT_VIEWBOX_WIDTH } from '../constants'

// ============================================================
// Clip-path Generator
// ============================================================

/**
 * Generate a CSS `clip-path: polygon(...)` value from an SVG wave path.
 * Used to clip background images to a wave shape.
 *
 * @param path - SVG path string (must use absolute coordinates)
 * @param height - Total height of the viewBox
 * @param position - Whether the wave is at 'top' or 'bottom'
 * @returns CSS clip-path polygon string
 */
export function generateClipPath(
    path: string,
    height: number,
    position: 'top' | 'bottom' = 'bottom',
): string {
    const width = DEFAULT_VIEWBOX_WIDTH

    // Extract all coordinate pairs from the SVG path
    const coordRegex = /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g
    const points: Array<[number, number]> = []
    let match: RegExpExecArray | null

    while ((match = coordRegex.exec(path)) !== null) {
        points.push([
            parseFloat(match[1]),
            parseFloat(match[2]),
        ])
    }

    if (points.length === 0) return 'none'

    // Convert to percentage-based polygon points
    const toPercent = (x: number, y: number): string => {
        const px = ((x / width) * 100).toFixed(2)
        const py = ((y / height) * 100).toFixed(2)
        return `${px}% ${py}%`
    }

    // Build polygon based on position
    if (position === 'bottom') {
        // Wave at bottom: start top-left, trace wave, end top-right
        const polygonPoints = [
            '0% 0%',
            ...points.map(([x, y]) => toPercent(x, y)),
            '100% 0%',
        ]
        return `polygon(${polygonPoints.join(', ')})`
    } else {
        // Wave at top: start bottom-left, trace wave, end bottom-right
        const polygonPoints = [
            '0% 100%',
            ...points.map(([x, y]) => toPercent(x, y)),
            '100% 100%',
        ]
        return `polygon(${polygonPoints.join(', ')})`
    }
}

/**
 * Generate a CSS `clip-path` with both top and bottom waves.
 * Useful for sections that have waves on both sides.
 */
export function generateDualClipPath(
    topPath: string,
    bottomPath: string,
    height: number,
): string {
    const width = DEFAULT_VIEWBOX_WIDTH

    const toPercent = (x: number, y: number): string => {
        const px = ((x / width) * 100).toFixed(2)
        const py = ((y / height) * 100).toFixed(2)
        return `${px}% ${py}%`
    }

    const coordRegex = /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g

    // Extract top wave points
    const topPoints: Array<[number, number]> = []
    let match: RegExpExecArray | null
    while ((match = coordRegex.exec(topPath)) !== null) {
        topPoints.push([parseFloat(match[1]), parseFloat(match[2])])
    }

    // Extract bottom wave points
    coordRegex.lastIndex = 0
    const bottomPoints: Array<[number, number]> = []
    while ((match = coordRegex.exec(bottomPath)) !== null) {
        bottomPoints.push([parseFloat(match[1]), parseFloat(match[2])])
    }

    if (topPoints.length === 0 && bottomPoints.length === 0) return 'none'

    const polygonPoints = [
        // Top wave (left to right)
        ...topPoints.map(([x, y]) => toPercent(x, y)),
        // Right edge
        '100% 100%',
        // Bottom wave (right to left — reversed)
        ...bottomPoints.reverse().map(([x, y]) => toPercent(x, height - y)),
        // Left edge
        '0% 0%',
    ]

    return `polygon(${polygonPoints.join(', ')})`
}
