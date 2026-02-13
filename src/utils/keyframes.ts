import type { PatternName } from '../types'
import { generatePath } from './path-generator'

// ============================================================
// Pure CSS Keyframe Generators (no React dependency)
// ============================================================

/**
 * Legacy CSS @keyframes for the 'flow' animation (translateX-based).
 * @deprecated Use path morphing flow instead (via PATH_MORPH_GENERATORS).
 */
export function flowLegacyKeyframes(id: string): string {
    return `
@keyframes ${id} {
  0%   { transform: translateX(0); }
  50%  { transform: translateX(-5%); }
  100% { transform: translateX(0); }
}`
}
/** @deprecated Alias for flowLegacyKeyframes */
export const flowKeyframes = flowLegacyKeyframes

/**
 * Generate CSS @keyframes for the 'pulse' animation.
 * Vertical scaling — waves grow and shrink.
 */
export function pulseKeyframes(id: string): string {
    return `
@keyframes ${id} {
  0%   { transform: scaleY(1); }
  50%  { transform: scaleY(1.3); }
  100% { transform: scaleY(1); }
}`
}

/**
 * Legacy CSS @keyframes for the 'morph' animation (scaleX/scaleY-based).
 * @deprecated Use path morphing morph instead (via PATH_MORPH_GENERATORS).
 */
export function morphLegacyKeyframes(id: string): string {
    return `
@keyframes ${id} {
  0%   { transform: scaleY(1) scaleX(1); }
  25%  { transform: scaleY(1.08) scaleX(1.02); }
  50%  { transform: scaleY(0.92) scaleX(1.04); }
  75%  { transform: scaleY(1.05) scaleX(0.98); }
  100% { transform: scaleY(1) scaleX(1); }
}`
}
/** @deprecated Alias for morphLegacyKeyframes */
export const morphKeyframes = morphLegacyKeyframes

/**
 * Legacy CSS @keyframes for the 'ripple' animation (translateX/scaleY-based).
 * @deprecated Use path morphing ripple instead (via PATH_MORPH_GENERATORS).
 */
export function rippleLegacyKeyframes(id: string): string {
    return `
@keyframes ${id} {
  0%   { transform: translateX(0) scaleY(1); }
  20%  { transform: translateX(-2%) scaleY(1.05); }
  40%  { transform: translateX(1%) scaleY(0.95); }
  60%  { transform: translateX(-1%) scaleY(1.03); }
  80%  { transform: translateX(0.5%) scaleY(0.98); }
  100% { transform: translateX(0) scaleY(1); }
}`
}
/** @deprecated Alias for rippleLegacyKeyframes */
export const rippleKeyframes = rippleLegacyKeyframes

/**
 * Generate CSS @keyframes for the 'bounce' animation.
 * Subtle bounce effect on the wave.
 */
export function bounceKeyframes(id: string): string {
    return `
@keyframes ${id} {
  0%   { transform: translateY(0); }
  40%  { transform: translateY(-8px); }
  60%  { transform: translateY(-4px); }
  80%  { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}`
}

// ============================================================
// Keyframe Registry (CSS transform-based — pulse & bounce only)
// ============================================================

type TransformAnimationName = 'pulse' | 'bounce'

export const KEYFRAME_GENERATORS: Record<TransformAnimationName, (id: string) => string> = {
    pulse: pulseKeyframes,
    bounce: bounceKeyframes,
}

// ============================================================
// Path Morphing Keyframe Generators (d: path() interpolation)
// ============================================================

export interface PathKeyframeOptions {
    basePath: string
    frameCount: number
    phaseRange: number
    amplitudeVariation: number
    pattern: PatternName
    config: { height: number; amplitude: number; frequency: number; phase?: number; seed?: number }
}

/**
 * Generate an array of SVG path strings for keyframe interpolation.
 * Each frame shifts phase and varies amplitude. First and last frame are identical (loopable).
 */
export function generatePathKeyframes(options: PathKeyframeOptions): string[] {
    const { frameCount, phaseRange, amplitudeVariation, pattern, config } = options
    const frames: string[] = []

    for (let i = 0; i < frameCount; i++) {
        // Loop: 0 and last frame are identical
        const t = i === frameCount - 1 ? 0 : i / (frameCount - 1)
        const phaseShift = Math.sin(t * Math.PI * 2) * phaseRange
        const ampFactor = 1 + Math.sin(t * Math.PI * 2) * amplitudeVariation

        frames.push(generatePath(pattern === 'custom' ? 'smooth' : pattern, {
            ...config,
            phase: (config.phase ?? 0) + phaseShift,
            amplitude: config.amplitude * ampFactor,
        }))
    }

    return frames
}

/**
 * Build a CSS @keyframes rule from path frames using d: path() interpolation.
 */
function buildPathKeyframesCSS(id: string, frames: string[]): string {
    const steps = frames.map((path, i) => {
        const pct = Math.round((i / (frames.length - 1)) * 100)
        return `  ${pct}% { d: path("${path}"); }`
    }).join('\n')

    return `@keyframes ${id} {\n${steps}\n}`
}

/**
 * Drift animation — horizontal phase shift.
 * Waves appear to glide left/right.
 */
export function driftKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
    const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
    const frames = generatePathKeyframes({
        basePath, frameCount: 5, phaseRange: 0.4, amplitudeVariation: 0.05, pattern, config: cfg,
    })
    return buildPathKeyframesCSS(id, frames)
}

/**
 * Breathe animation — amplitude grows/shrinks rhythmically.
 */
export function breatheKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
    const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
    const frames = generatePathKeyframes({
        basePath, frameCount: 5, phaseRange: 0.05, amplitudeVariation: 0.2, pattern, config: cfg,
    })
    return buildPathKeyframesCSS(id, frames)
}

/**
 * Undulate animation — combined phase + amplitude (full 2D wave motion).
 */
export function undulateKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
    const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
    const frames = generatePathKeyframes({
        basePath, frameCount: 7, phaseRange: 0.5, amplitudeVariation: 0.15, pattern, config: cfg,
    })
    return buildPathKeyframesCSS(id, frames)
}

/**
 * Ripple-out animation — disturbance radiates from center.
 */
export function rippleOutKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
    const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
    const frames = generatePathKeyframes({
        basePath, frameCount: 7, phaseRange: 0.8, amplitudeVariation: 0.1, pattern, config: cfg,
    })
    return buildPathKeyframesCSS(id, frames)
}

/**
 * Flow animation (path morphing) — gentle horizontal phase drift.
 * Replaces the legacy translateX-based flow animation.
 */
export function flowPathMorphKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
    const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
    const frames = generatePathKeyframes({
        basePath, frameCount: 5, phaseRange: 0.3, amplitudeVariation: 0.03, pattern, config: cfg,
    })
    return buildPathKeyframesCSS(id, frames)
}

/**
 * Morph animation (path morphing) — shape change via amplitude variation.
 * Replaces the legacy scaleX/scaleY-based morph animation.
 */
export function morphPathMorphKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
    const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
    const frames = generatePathKeyframes({
        basePath, frameCount: 5, phaseRange: 0.2, amplitudeVariation: 0.12, pattern, config: cfg,
    })
    return buildPathKeyframesCSS(id, frames)
}

/**
 * Ripple animation (path morphing) — wave ripple via phase + amplitude.
 * Replaces the legacy translateX/scaleY-based ripple animation.
 */
export function ripplePathMorphKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
    const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
    const frames = generatePathKeyframes({
        basePath, frameCount: 7, phaseRange: 0.5, amplitudeVariation: 0.06, pattern, config: cfg,
    })
    return buildPathKeyframesCSS(id, frames)
}

// ============================================================
// Dual-Path Coordinated Keyframes (sync A and B together)
// ============================================================

/**
 * Generate coordinated path-morphing keyframes for dual-path interlock mode.
 * Both paths use identical phase/amplitude parameters per frame to stay in sync.
 */
export function generateDualPathMorphKeyframes(
    idA: string,
    idB: string,
    _basePathA: string,
    _basePathB: string,
    animName: string,
    pattern: PatternName,
    config: Partial<PathKeyframeOptions['config']>,
): { cssA: string; cssB: string } {
    const gen = PATH_MORPH_GENERATORS[animName]
    if (!gen) return { cssA: '', cssB: '' }

    // Look up the animation parameters from the registry defaults
    const paramMap: Record<string, { frameCount: number; phaseRange: number; amplitudeVariation: number }> = {
        flow: { frameCount: 5, phaseRange: 0.3, amplitudeVariation: 0.03 },
        morph: { frameCount: 5, phaseRange: 0.2, amplitudeVariation: 0.12 },
        ripple: { frameCount: 7, phaseRange: 0.5, amplitudeVariation: 0.06 },
        drift: { frameCount: 5, phaseRange: 0.4, amplitudeVariation: 0.05 },
        breathe: { frameCount: 5, phaseRange: 0.05, amplitudeVariation: 0.2 },
        undulate: { frameCount: 7, phaseRange: 0.5, amplitudeVariation: 0.15 },
        'ripple-out': { frameCount: 7, phaseRange: 0.8, amplitudeVariation: 0.1 },
    }

    const params = paramMap[animName] ?? { frameCount: 5, phaseRange: 0.3, amplitudeVariation: 0.05 }
    const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }

    // Generate frames for both paths using identical t values
    const framesA: string[] = []
    const framesB: string[] = []

    for (let i = 0; i < params.frameCount; i++) {
        const t = i === params.frameCount - 1 ? 0 : i / (params.frameCount - 1)
        const phaseShift = Math.sin(t * Math.PI * 2) * params.phaseRange
        const ampFactor = 1 + Math.sin(t * Math.PI * 2) * params.amplitudeVariation

        const frameConfig = {
            ...cfg,
            phase: (cfg.phase ?? 0) + phaseShift,
            amplitude: cfg.amplitude * ampFactor,
        }

        framesA.push(generatePath(pattern === 'custom' ? 'smooth' : pattern, frameConfig))
        framesB.push(generatePath(pattern === 'custom' ? 'smooth' : pattern, {
            ...frameConfig,
            seed: (frameConfig.seed ?? 0) + 1000, // Different seed for path B but same anim params
        }))
    }

    return {
        cssA: buildPathKeyframesCSS(idA, framesA),
        cssB: buildPathKeyframesCSS(idB, framesB),
    }
}

// ============================================================
// Path Morph Registry (d: path() interpolation)
// ============================================================

export const PATH_MORPH_GENERATORS: Record<string, (id: string, basePath: string, pattern?: PatternName, config?: Partial<PathKeyframeOptions['config']>) => string> = {
    flow: flowPathMorphKeyframes,
    morph: morphPathMorphKeyframes,
    ripple: ripplePathMorphKeyframes,
    drift: driftKeyframes,
    breathe: breatheKeyframes,
    undulate: undulateKeyframes,
    'ripple-out': rippleOutKeyframes,
}
