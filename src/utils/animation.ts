'use client'

import { useRef, useEffect, useCallback, useState, useSyncExternalStore } from 'react'
import type { AnimationName, AnimationConfig } from '../types'
import { generatePath } from './path-generator'
import type { PatternName, PatternConfig } from '../types'

// ============================================================
// useReducedMotion — prefers-reduced-motion detection
// ============================================================

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function getReducedMotionSnapshot(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    const mql = window.matchMedia(REDUCED_MOTION_QUERY)
    return mql?.matches ?? false
}

function getReducedMotionServerSnapshot(): boolean {
    return false
}

function subscribeReducedMotion(callback: () => void): () => void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
    const mql = window.matchMedia(REDUCED_MOTION_QUERY)
    mql.addEventListener('change', callback)
    return () => mql.removeEventListener('change', callback)
}

/**
 * Hook: useReducedMotion
 *
 * Detects whether the user prefers reduced motion via the
 * `prefers-reduced-motion: reduce` media query.
 *
 * @returns `true` if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
    return useSyncExternalStore(
        subscribeReducedMotion,
        getReducedMotionSnapshot,
        getReducedMotionServerSnapshot,
    )
}

// ============================================================
// Animation Keyframe Generators
// ============================================================

/**
 * Generate CSS @keyframes for the 'flow' animation.
 * Gentle horizontal phase shift — waves appear to move sideways.
 */
function flowKeyframes(id: string): string {
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
function pulseKeyframes(id: string): string {
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
function morphKeyframes(id: string): string {
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
function rippleKeyframes(id: string): string {
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
function bounceKeyframes(id: string): string {
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
// Keyframe Registry
// ============================================================

const KEYFRAME_GENERATORS: Record<Exclude<AnimationName, 'none' | 'custom'>, (id: string) => string> = {
    flow: flowKeyframes,
    pulse: pulseKeyframes,
    morph: morphKeyframes,
    ripple: rippleKeyframes,
    bounce: bounceKeyframes,
}

// Track injected stylesheets globally to avoid duplicates
const injectedAnimations = new Set<string>()

function injectKeyframes(animationId: string, name: Exclude<AnimationName, 'none'>, customKeyframes?: string): void {
    if (typeof document === 'undefined') return
    if (injectedAnimations.has(animationId)) return

    let css: string | undefined

    if (name === 'custom' && customKeyframes) {
        // Inject user-provided keyframes with the animation ID
        css = `@keyframes ${animationId} { ${customKeyframes} }`
    } else if (name !== 'custom') {
        const generator = KEYFRAME_GENERATORS[name]
        if (!generator) return
        css = generator(animationId)
    }

    if (!css) return

    const style = document.createElement('style')
    style.setAttribute('data-wavy-bavy-animation', animationId)
    style.textContent = css
    document.head.appendChild(style)
    injectedAnimations.add(animationId)
}

function removeKeyframes(animationId: string): void {
    if (typeof document === 'undefined') return
    const el = document.querySelector(`[data-wavy-bavy-animation="${animationId}"]`)
    if (el) el.remove()
    injectedAnimations.delete(animationId)
}

// ============================================================
// useWaveAnimation Hook
// ============================================================

/** Default animation config */
const DEFAULT_ANIMATION: AnimationConfig = {
    name: 'none',
    duration: 4,
    easing: 'ease-in-out',
    iterations: 'infinite',
    paused: false,
}

export interface UseWaveAnimationOptions {
    /** Animation config or name */
    animate?: AnimationName | Partial<AnimationConfig> | boolean
    /** Duration override */
    duration?: number
    /** Custom CSS keyframes body (used with animate='custom') */
    customKeyframes?: string
    /** Whether to respect prefers-reduced-motion. Default: true */
    respectReducedMotion?: boolean
}

export interface UseWaveAnimationResult {
    /** CSS style to apply to the wave container */
    animationStyle: React.CSSProperties
    /** Whether animation is active */
    isAnimating: boolean
    /** Pause the animation */
    pause: () => void
    /** Resume the animation */
    resume: () => void
}

// No-op callbacks for static (non-animated) waves
const NOOP = () => {}
const EMPTY_STYLE: React.CSSProperties = {}

/**
 * Hook: useWaveAnimation
 *
 * Manages wave animation lifecycle — injects keyframes into the DOM,
 * returns the appropriate CSS style to apply, and provides pause/resume.
 * Supports custom keyframes and respects prefers-reduced-motion.
 */
export function useWaveAnimation(options: UseWaveAnimationOptions = {}): UseWaveAnimationResult {
    const { animate, duration: durationOverride, customKeyframes, respectReducedMotion = true } = options
    const prefersReducedMotion = useReducedMotion()

    // Lazy ID generation — only allocate if we actually animate
    const animationIdRef = useRef<string | null>(null)

    const [paused, setPaused] = useState(false)

    // Resolve animation config
    const config: AnimationConfig = (() => {
        if (animate === undefined || animate === false) return { ...DEFAULT_ANIMATION, name: 'none' as AnimationName }
        if (animate === true) return { ...DEFAULT_ANIMATION, name: 'flow' as AnimationName }
        if (typeof animate === 'string') return { ...DEFAULT_ANIMATION, name: animate }
        return { ...DEFAULT_ANIMATION, ...animate }
    })()

    if (durationOverride !== undefined) config.duration = durationOverride

    // Custom keyframes can come from config or options
    const resolvedKeyframes = config.keyframes ?? customKeyframes

    const animationName = config.name
    const isActive = animationName !== 'none' && !(respectReducedMotion && prefersReducedMotion)

    // Lazy ID: generate only when animation is active
    if (isActive && animationIdRef.current === null) {
        animationIdRef.current = `wavy-bavy-anim-${Math.random().toString(36).slice(2, 8)}`
    }
    const animationId = animationIdRef.current ?? ''

    // Inject/remove keyframes
    useEffect(() => {
        if (!isActive || !animationId) return
        injectKeyframes(animationId, animationName as Exclude<AnimationName, 'none'>, resolvedKeyframes)
        return () => removeKeyframes(animationId)
    }, [animationId, animationName, isActive, resolvedKeyframes])

    const pause = useCallback(() => setPaused(true), [])
    const resume = useCallback(() => setPaused(false), [])

    // Static rendering — return no-ops and empty style
    if (!isActive) {
        return {
            animationStyle: EMPTY_STYLE,
            isAnimating: false,
            pause: NOOP,
            resume: NOOP,
        }
    }

    // Build animation style
    const animationStyle: React.CSSProperties = {
        animation: `${animationId} ${config.duration}s ${config.easing} ${config.iterations === 'infinite' ? 'infinite' : config.iterations}`,
        animationPlayState: paused || config.paused ? 'paused' : 'running',
        transformOrigin: 'center bottom',
        willChange: 'transform',
    }

    return {
        animationStyle,
        isAnimating: !paused,
        pause,
        resume,
    }
}

// ============================================================
// Path Morphing Utilities (Advanced)
// ============================================================

/**
 * Generate multiple path frames for smooth SVG morphing.
 * Used for the 'morph' animation when animating the SVG `d` attribute directly.
 *
 * @param pattern - Base pattern
 * @param frames - Number of frames to generate
 * @param config - Pattern config
 * @returns Array of SVG path strings
 */
export function generateMorphFrames(
    pattern: PatternName,
    frames: number = 4,
    config: Partial<PatternConfig> = {},
): string[] {
    const paths: string[] = []
    for (let i = 0; i < frames; i++) {
        const frameConfig = {
            ...config,
            amplitude: (config.amplitude ?? 0.5) * (1 + Math.sin((i / frames) * Math.PI * 2) * 0.15),
            phase: (config.phase ?? 0) + (i / frames) * 0.5,
        }
        paths.push(generatePath(pattern, frameConfig))
    }
    return paths
}
