import type { WaveDefaults, WavePreset, PatternGenerator, PatternConfig, StrokeConfig, BlurConfig, TextureConfig, InnerShadowConfig, ScrollAnimationConfig, ParallaxConfig, HoverConfig, WaveSeparationConfig } from './types'

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
        `M -20 ${height}`,
        `L -20 ${cy + waveHeight * 0.6}`,
        `Q ${width * 0.25} ${cy - waveHeight * 0.4}, ${width * 0.5} ${cy + waveHeight * 0.2}`,
        `Q ${width * 0.75} ${cy + waveHeight * 0.8}, ${width + 20} ${cy + waveHeight * 0.3}`,
        `L ${width + 20} ${height}`,
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
        `M -20 ${height}`,
        `L -20 ${cy + waveHeight * r1}`,
        `C ${width * 0.2} ${cy - waveHeight * r2}, ${width * 0.35} ${cy + waveHeight * r3}, ${width * 0.5} ${cy + waveHeight * 0.15}`,
        `C ${width * 0.65} ${cy - waveHeight * r1}, ${width * 0.8} ${cy + waveHeight * r2}, ${width + 20} ${cy + waveHeight * r3}`,
        `L ${width + 20} ${height}`,
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

    const points: string[] = [`M -20 ${height}`, `L -20 ${cy + waveHeight}`]

    for (let i = 0; i < peakCount * 2; i++) {
        const x = segmentWidth * (i + 1)
        const y = i % 2 === 0 ? cy : cy + waveHeight
        points.push(`L ${x} ${y}`)
    }

    points.push(`L ${width + 20} ${cy + waveHeight}`, `L ${width + 20} ${height}`, `Z`)
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

    const points: string[] = [`M -20 ${height}`, `L -20 ${cy + waveHeight}`]

    for (let i = 0; i < peakCount; i++) {
        const peakX = segmentWidth * i + segmentWidth * 0.5
        const valleyX = segmentWidth * (i + 1)
        points.push(`L ${peakX} ${cy}`)
        points.push(`L ${valleyX} ${cy + waveHeight}`)
    }

    points.push(`L ${width + 20} ${cy + waveHeight}`, `L ${width + 20} ${height}`, `Z`)
    return points.join(' ')
}

/**
 * Flowing S-curve — large dramatic sweep across the full width.
 * Designed for high-intensity hero transitions.
 */
function generateFlowingPath(config: PatternConfig): string {
    const { width, height, amplitude, phase } = config
    const waveHeight = height * amplitude
    const cy = height - waveHeight
    const shift = (phase ?? 0) * width * 0.2

    return [
        `M -20 ${height}`,
        `L -20 ${cy + waveHeight * 0.8}`,
        `C ${width * 0.15 + shift} ${cy - waveHeight * 0.3}, ${width * 0.35 + shift} ${cy + waveHeight * 1.1}, ${width * 0.5} ${cy + waveHeight * 0.4}`,
        `C ${width * 0.65 - shift} ${cy - waveHeight * 0.2}, ${width * 0.85 - shift} ${cy + waveHeight * 0.9}, ${width + 20} ${cy + waveHeight * 0.5}`,
        `L ${width + 20} ${height}`,
        `Z`,
    ].join(' ')
}

/**
 * Ribbon pattern — smooth curve with varying visual thickness.
 * Wider at peaks, thinner at zero-crossings. Seed controls personality.
 */
function generateRibbonPath(config: PatternConfig): string {
    const { width, height, amplitude, seed } = config
    const waveHeight = height * amplitude
    const cy = height - waveHeight

    const s = seed ?? 33
    const pr = (i: number) => {
        const x = Math.sin(s * 7919 + i * 6271) * 10000
        return x - Math.floor(x)
    }

    const r1 = pr(1) * 0.3 + 0.2
    const r2 = pr(2) * 0.3 + 0.3
    const r3 = pr(3) * 0.3 + 0.1
    const r4 = pr(4) * 0.3 + 0.25

    return [
        `M -20 ${height}`,
        `L -20 ${cy + waveHeight * r1}`,
        `C ${width * 0.12} ${cy - waveHeight * r2}, ${width * 0.28} ${cy + waveHeight * r3}, ${width * 0.38} ${cy + waveHeight * 0.1}`,
        `C ${width * 0.48} ${cy - waveHeight * r4}, ${width * 0.58} ${cy + waveHeight * r1}, ${width * 0.68} ${cy + waveHeight * r3}`,
        `C ${width * 0.78} ${cy - waveHeight * r2}, ${width * 0.92} ${cy + waveHeight * r4}, ${width + 20} ${cy + waveHeight * r1}`,
        `L ${width + 20} ${height}`,
        `Z`,
    ].join(' ')
}

/**
 * Layered-organic — denser organic curve with more control points.
 * Designed for multi-layer stacking with slight offsets.
 */
function generateLayeredOrganicPath(config: PatternConfig): string {
    const { width, height, amplitude, seed } = config
    const waveHeight = height * amplitude
    const cy = height - waveHeight

    const s = seed ?? 57
    const pr = (i: number) => {
        const x = Math.sin(s * 4801 + i * 7723) * 10000
        return x - Math.floor(x)
    }

    const points = 5
    const segments: string[] = [`M -20 ${height}`, `L -20 ${cy + waveHeight * pr(0)}`]

    for (let i = 0; i < points; i++) {
        const x1 = (width / points) * i + (width / points) * 0.3
        const x2 = (width / points) * (i + 1)
        const cy1 = cy + waveHeight * (pr(i * 2 + 1) - 0.3)
        const cy2 = cy + waveHeight * pr(i * 2 + 2)
        segments.push(`C ${x1} ${cy1}, ${x2 - (width / points) * 0.3} ${cy2}, ${x2} ${cy + waveHeight * pr(i + points)}`)
    }

    segments.push(`L ${width + 20} ${cy + waveHeight * pr(points - 1)}`, `L ${width + 20} ${height}`, `Z`)
    return segments.join(' ')
}

/**
 * Registry of all built-in pattern generators
 */
export const PATTERN_REGISTRY: Record<string, PatternGenerator> = {
    smooth: generateSmoothPath,
    organic: generateOrganicPath,
    sharp: generateSharpPath,
    mountain: generateMountainPath,
    flowing: generateFlowingPath,
    ribbon: generateRibbonPath,
    'layered-organic': generateLayeredOrganicPath,
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
    'hero-dramatic': {
        pattern: 'flowing',
        height: 350,
        amplitude: 0.9,
        animate: 'undulate',
    },
    'section-subtle': {
        pattern: 'smooth',
        height: 80,
        amplitude: 0.2,
        animate: 'drift',
    },
    'section-bold': {
        pattern: 'organic',
        height: 160,
        amplitude: 0.5,
        animate: 'breathe',
    },
    'cta-sweep': {
        pattern: 'ribbon',
        height: 280,
        amplitude: 0.8,
        animate: 'undulate',
    },
    'clean-divide': {
        pattern: 'smooth',
        height: 60,
        amplitude: 0.1,
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

// ============================================================
// Default Scroll & Interaction Configs
// ============================================================

export const DEFAULT_SCROLL_ANIMATION: ScrollAnimationConfig = {
    progress: 'element',
    damping: 0.1,
    reverse: false,
}

export const DEFAULT_PARALLAX: ParallaxConfig = {
    speed: 0.3,
    direction: 'vertical',
}

export const DEFAULT_HOVER: HoverConfig = {
    scale: 1.02,
    lift: -4,
    glow: false,
    transition: 'transform 0.3s ease, filter 0.3s ease',
}

export const DEFAULT_SEPARATION: WaveSeparationConfig = {
    mode: 'interlock',
    intensity: 0.5,
    gap: 0,
}
