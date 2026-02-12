import type { WaveDefaults, WavePreset, PatternGenerator, PatternConfig, StrokeConfig, BlurConfig, TextureConfig, InnerShadowConfig } from './types'

// ============================================================
// Default Configuration
// ============================================================

export const DEFAULT_WAVE_HEIGHT = 120
export const DEFAULT_PATTERN = 'smooth' as const
export const DEFAULT_AMPLITUDE = 0.5
export const DEFAULT_FREQUENCY = 1
export const DEFAULT_ANIMATION = 'none' as const
export const DEFAULT_VIEWBOX_WIDTH = 1440

export const DEFAULTS: WaveDefaults = {
    height: DEFAULT_WAVE_HEIGHT,
    pattern: DEFAULT_PATTERN,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    animate: DEFAULT_ANIMATION,
    respectReducedMotion: true,
}

// ============================================================
// Responsive Breakpoints (matches Tailwind defaults)
// ============================================================

export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const

// ============================================================
// Built-in Pattern Generators
// ============================================================

/**
 * Smooth sine-wave curve (classic wave divider)
 */
function generateSmoothPath(config: PatternConfig): string {
    const { width, height, amplitude } = config
    const waveHeight = height * amplitude
    const cy = height - waveHeight

    return [
        `M 0 ${height}`,
        `L 0 ${cy + waveHeight * 0.6}`,
        `Q ${width * 0.25} ${cy - waveHeight * 0.4}, ${width * 0.5} ${cy + waveHeight * 0.2}`,
        `Q ${width * 0.75} ${cy + waveHeight * 0.8}, ${width} ${cy + waveHeight * 0.3}`,
        `L ${width} ${height}`,
        `Z`,
    ].join(' ')
}

/**
 * Organic blob-like curve — irregular, natural shape
 */
function generateOrganicPath(config: PatternConfig): string {
    const { width, height, amplitude, seed } = config
    const waveHeight = height * amplitude

    // Use seed for reproducible randomness
    const s = seed ?? 42
    const pseudoRandom = (i: number) => {
        const x = Math.sin(s * 9301 + i * 5381) * 10000
        return x - Math.floor(x)
    }

    const cy = height - waveHeight
    const r1 = pseudoRandom(1) * 0.4 + 0.1
    const r2 = pseudoRandom(2) * 0.4 + 0.3
    const r3 = pseudoRandom(3) * 0.4 + 0.2

    return [
        `M 0 ${height}`,
        `L 0 ${cy + waveHeight * r1}`,
        `C ${width * 0.2} ${cy - waveHeight * r2}, ${width * 0.35} ${cy + waveHeight * r3}, ${width * 0.5} ${cy + waveHeight * 0.15}`,
        `C ${width * 0.65} ${cy - waveHeight * r1}, ${width * 0.8} ${cy + waveHeight * r2}, ${width} ${cy + waveHeight * r3}`,
        `L ${width} ${height}`,
        `Z`,
    ].join(' ')
}

/**
 * Sharp angular wave — geometric, modern feel
 */
function generateSharpPath(config: PatternConfig): string {
    const { width, height, amplitude, frequency } = config
    const waveHeight = height * amplitude
    const cy = height - waveHeight
    const peakCount = Math.max(1, Math.round(frequency))
    const segmentWidth = width / (peakCount * 2)

    const points: string[] = [`M 0 ${height}`, `L 0 ${cy + waveHeight}`]

    for (let i = 0; i < peakCount * 2; i++) {
        const x = segmentWidth * (i + 1)
        const y = i % 2 === 0 ? cy : cy + waveHeight
        points.push(`L ${x} ${y}`)
    }

    points.push(`L ${width} ${height}`, `Z`)
    return points.join(' ')
}

/**
 * Mountain peak pattern — triangular shapes
 */
function generateMountainPath(config: PatternConfig): string {
    const { width, height, amplitude, frequency } = config
    const waveHeight = height * amplitude
    const cy = height - waveHeight
    const peakCount = Math.max(1, Math.round(frequency))
    const segmentWidth = width / peakCount

    const points: string[] = [`M 0 ${height}`, `L 0 ${cy + waveHeight}`]

    for (let i = 0; i < peakCount; i++) {
        const peakX = segmentWidth * i + segmentWidth * 0.5
        const valleyX = segmentWidth * (i + 1)
        points.push(`L ${peakX} ${cy}`)
        points.push(`L ${valleyX} ${cy + waveHeight}`)
    }

    points.push(`L ${width} ${height}`, `Z`)
    return points.join(' ')
}

/**
 * Registry of all built-in pattern generators
 */
export const PATTERN_REGISTRY: Record<string, PatternGenerator> = {
    smooth: generateSmoothPath,
    organic: generateOrganicPath,
    sharp: generateSharpPath,
    mountain: generateMountainPath,
}

// ============================================================
// Built-in Presets
// ============================================================

export const PRESETS: Record<string, WavePreset> = {
    hero: {
        pattern: 'smooth',
        height: 200,
        amplitude: 0.6,
        frequency: 1,
    },
    footer: {
        pattern: 'smooth',
        height: 150,
        amplitude: 0.4,
        frequency: 1,
    },
    'dark-light': {
        pattern: 'smooth',
        height: 120,
        amplitude: 0.5,
        frequency: 1,
    },
    dramatic: {
        pattern: 'organic',
        height: 250,
        amplitude: 0.7,
        frequency: 1,
    },
    subtle: {
        pattern: 'smooth',
        height: 80,
        amplitude: 0.3,
        frequency: 1,
    },
    angular: {
        pattern: 'sharp',
        height: 120,
        amplitude: 0.5,
        frequency: 2,
    },
    peaks: {
        pattern: 'mountain',
        height: 150,
        amplitude: 0.6,
        frequency: 3,
    },
}

// ============================================================
// Default Effect Configs
// ============================================================

export const DEFAULT_SHADOW = {
    color: 'rgba(0, 0, 0, 0.1)',
    blur: 10,
    offsetX: 0,
    offsetY: 4,
}

export const DEFAULT_GLOW = {
    color: 'currentColor',
    intensity: 20,
    opacity: 0.5,
}

export const DEFAULT_STROKE: StrokeConfig = {
    color: 'rgba(0, 0, 0, 0.3)',
    width: 2,
    fill: true,
}

export const DEFAULT_BLUR: BlurConfig = {
    radius: 8,
    opacity: 0.7,
    saturation: 1.2,
}

export const DEFAULT_TEXTURE: TextureConfig = {
    type: 'turbulence',
    frequency: 0.02,
    octaves: 3,
    scale: 5,
    seed: 0,
}

export const DEFAULT_INNER_SHADOW: InnerShadowConfig = {
    color: 'rgba(0, 0, 0, 0.2)',
    blur: 8,
    offsetX: 0,
    offsetY: 2,
}
