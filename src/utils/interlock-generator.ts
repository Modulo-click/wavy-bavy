import { generatePath } from './path-generator'
import type { PatternName, DualPathResult, InterlockMode } from '../types'
import { DEFAULT_VIEWBOX_WIDTH } from '../constants'

/**
 * Generate a deterministic seed from section position.
 * Uses golden-ratio hashing for good distribution.
 */
export function autoSeed(sectionIndex: number, transitionIndex: number): number {
    return ((sectionIndex * 2654435761 + transitionIndex * 340573321) >>> 0) % 10000
}

export interface InterlockOptions {
    pattern: PatternName
    height: number
    amplitude: number
    frequency: number
    intensity: number
    mode: InterlockMode
    seed?: number
    gap?: number
    phase?: number
    mirror?: boolean
}

/**
 * Sample Y values from an SVG path at evenly spaced X positions.
 * Parses the path's control points and interpolates between them.
 */
function samplePathY(path: string, width: number, samples: number): number[] {
    const nums = path.match(/-?\d+\.?\d*/g)?.map(Number) ?? []
    const points: Array<{ x: number; y: number }> = []

    for (let i = 0; i < nums.length - 1; i += 2) {
        points.push({ x: nums[i], y: nums[i + 1] })
    }

    if (points.length < 2) return new Array(samples).fill(0)

    const wavePoints = points.filter(p => p.x >= 0 && p.x <= width)
    if (wavePoints.length < 2) return new Array(samples).fill(0)

    wavePoints.sort((a, b) => a.x - b.x)

    const result: number[] = []
    for (let i = 0; i < samples; i++) {
        const targetX = (i / (samples - 1)) * width
        let left = wavePoints[0]
        let right = wavePoints[wavePoints.length - 1]
        for (let j = 0; j < wavePoints.length - 1; j++) {
            if (wavePoints[j].x <= targetX && wavePoints[j + 1].x >= targetX) {
                left = wavePoints[j]
                right = wavePoints[j + 1]
                break
            }
        }
        const t = right.x === left.x ? 0 : (targetX - left.x) / (right.x - left.x)
        result.push(left.y + t * (right.y - left.y))
    }

    return result
}

/**
 * Build an SVG path from sampled Y values.
 * Creates a smooth cubic bezier curve through the sample points,
 * closed at the bottom with the full height.
 */
function buildPathFromSamples(ys: number[], width: number, height: number): string {
    const samples = ys.length
    const segmentWidth = width / (samples - 1)
    const parts: string[] = [`M 0 ${height}`, `L 0 ${ys[0]}`]

    for (let i = 0; i < samples - 1; i++) {
        const x0 = i * segmentWidth
        const x1 = (i + 1) * segmentWidth
        const cp1x = x0 + segmentWidth * 0.4
        const cp2x = x1 - segmentWidth * 0.4
        parts.push(`C ${cp1x} ${ys[i]}, ${cp2x} ${ys[i + 1]}, ${x1} ${ys[i + 1]}`)
    }

    parts.push(`L ${width} ${height}`, `Z`)
    return parts.join(' ')
}

/**
 * Pseudo-random number generator (deterministic from seed).
 */
function seededRandom(seed: number, index: number): number {
    const x = Math.sin(seed * 9301 + index * 49297) * 10000
    return x - Math.floor(x)
}

/**
 * Generate interlocking dual-wave paths.
 *
 * Algorithm:
 * 1. Generate a base path using the chosen pattern
 * 2. Sample Y values along the base path
 * 3. Offset samples up/down based on intensity and mode
 * 4. Add independent variation to each path via seeded randomness
 * 5. Rebuild smooth SVG paths from the offset samples
 */
export function generateInterlockPaths(options: InterlockOptions): DualPathResult {
    const {
        pattern,
        height,
        amplitude,
        frequency,
        intensity,
        mode,
        seed = 42,
        gap = 0,
        phase = 0,
        mirror = false,
    } = options

    const width = DEFAULT_VIEWBOX_WIDTH
    const samples = 20

    // 1. Generate base path
    const basePath = generatePath(pattern === 'custom' ? 'smooth' : pattern, {
        width, height, amplitude, frequency, phase, mirror, seed,
    })

    // Flush mode: both paths are identical (single edge, no interlock)
    if (mode === 'flush') {
        return { pathA: basePath, pathB: basePath, baseCurve: basePath }
    }

    // 2. Sample the base curve
    const baseYs = samplePathY(basePath, width, samples)

    // 3. Calculate offsets based on mode and intensity
    const maxOffset = height * amplitude * intensity * 0.5
    const halfGap = gap / 2

    // Mode multipliers
    const modeFactors: Record<InterlockMode, { a: number; b: number }> = {
        interlock: { a: -1, b: 1 },
        overlap: { a: -1.3, b: 0.7 },
        apart: { a: -0.6, b: 1.4 },
        flush: { a: 0, b: 0 },
    }

    const factors = modeFactors[mode]

    // 4. Generate offset samples with independent variation
    const pathAYs: number[] = []
    const pathBYs: number[] = []

    for (let i = 0; i < samples; i++) {
        const baseY = baseYs[i]
        const varA = (seededRandom(seed + 1, i) - 0.5) * maxOffset * 0.3
        const varB = (seededRandom(seed + 2, i) - 0.5) * maxOffset * 0.3

        pathAYs.push(baseY + factors.a * maxOffset + varA - halfGap)
        pathBYs.push(baseY + factors.b * maxOffset + varB + halfGap)
    }

    // 5. Rebuild paths
    const pathA = buildPathFromSamples(pathAYs, width, height)
    const pathB = buildPathFromSamples(pathBYs, width, height)

    return { pathA, pathB, baseCurve: basePath }
}
