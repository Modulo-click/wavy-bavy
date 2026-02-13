import type { PatternName } from '../types'
import { generatePath } from './path-generator'

// ============================================================
// Pure CSS Keyframe Generators (no React dependency)
// ============================================================

/**
 * Generate CSS @keyframes for the 'flow' animation.
 * Gentle horizontal phase shift — waves appear to move sideways.
 */
export function flowKeyframes(id: string): string {
    return `
@keyframes ${id} {
  0%   { transform: translateX(0); }
  50%  { transform: translateX(-5%); }
  100% { transform: translateX(0); }
}`
}

/**
 * Generate CSS @keyframes for the 'pulse' animation.
 * Vertical scaling — waves grow and shrink.
 */
export function pulseKeyframes(id: string): string {
    return `
@keyframes ${id} {
  0%   { transform: scaleY(1); }
  50%  { transform: scaleY(1.15); }
  100% { transform: scaleY(1); }
}`
}

/**
 * Generate CSS @keyframes for the 'morph' animation.
 * Uses SVG path morphing via changing the 'd' attribute.
 * Falls back to scale + translate combo in CSS.
 */
export function morphKeyframes(id: string): string {
    return `
@keyframes ${id} {
  0%   { transform: scaleY(1) scaleX(1); }
  25%  { transform: scaleY(1.08) scaleX(1.02); }
  50%  { transform: scaleY(0.92) scaleX(1.04); }
  75%  { transform: scaleY(1.05) scaleX(0.98); }
  100% { transform: scaleY(1) scaleX(1); }
}`
}

/**
 * Generate CSS @keyframes for the 'ripple' animation.
 * Wave-like ripple effect via translate + scale.
 */
export function rippleKeyframes(id: string): string {
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
// Keyframe Registry (CSS transform-based — backwards compatible)
// ============================================================

type TransformAnimationName = 'flow' | 'pulse' | 'morph' | 'ripple' | 'bounce'

export const KEYFRAME_GENERATORS: Record<TransformAnimationName, (id: string) => string> = {
    flow: flowKeyframes,
    pulse: pulseKeyframes,
    morph: morphKeyframes,
    ripple: rippleKeyframes,
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

// ============================================================
// Path Morph Registry (d: path() interpolation — new animations)
// ============================================================

export const PATH_MORPH_GENERATORS: Record<string, (id: string, basePath: string, pattern?: PatternName, config?: Partial<PathKeyframeOptions['config']>) => string> = {
    drift: driftKeyframes,
    breathe: breatheKeyframes,
    undulate: undulateKeyframes,
    'ripple-out': rippleOutKeyframes,
}
