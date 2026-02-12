'use client'

import {
    useEffect,
    useId,
    useMemo,
    useRef,
    type CSSProperties,
} from 'react'
import type {
    WaveSectionProps,
    ShadowConfig,
    GlowConfig,
    StrokeConfig,
    BlurConfig,
    TextureConfig,
    InnerShadowConfig,
    PatternName,
} from '../types'
import { useOptionalWaveContext } from '../context/useWaveContext'
import { WaveRenderer } from './WaveRenderer'
import { WaveLayer } from './WaveLayer'
import { parseBackground } from '../utils/color-utils'
import { generatePath, generateLayeredPaths } from '../utils/path-generator'
import {
    DEFAULTS,
    DEFAULT_SHADOW,
    DEFAULT_GLOW,
    DEFAULT_STROKE,
    DEFAULT_BLUR,
    DEFAULT_TEXTURE,
    DEFAULT_INNER_SHADOW,
    PRESETS,
} from '../constants'
import { useWaveAnimation } from '../utils/animation'
import { generateClipPath } from '../utils/clip-path'
import { useIntersection } from '../utils/use-intersection'

/**
 * WaveSection — the main public API component.
 *
 * Wraps a page section and automatically generates seamless wave transitions
 * between adjacent sections. Uses React Context to detect neighboring sections
 * and auto-configure wave colors.
 *
 * @example
 * ```tsx
 * <WaveProvider>
 *   <WaveSection background="#ffffff">
 *     <h1>Hero</h1>
 *   </WaveSection>
 *
 *   <WaveSection background="#F7F7F5">
 *     <h2>Features</h2>
 *     {/* Wave auto-created: white → lightGray *\/}
 *   </WaveSection>
 * </WaveProvider>
 * ```
 */
export function WaveSection({
    // Background
    background,
    backgroundImage,
    clipImage = false,

    // Wave config
    preset,
    wavePosition: wavePositionProp,
    height: heightProp,

    // Pattern
    pattern: patternProp,
    customPath,
    amplitude: amplitudeProp,
    frequency: frequencyProp,
    phase,
    mirror,
    seed,

    // Animation
    animate,
    animationDuration,
    customKeyframes,

    // Effects
    shadow: shadowProp,
    glow: glowProp,
    stroke: strokeProp,
    blur: blurProp,
    texture: textureProp,
    innerShadow: innerShadowProp,
    layers: layerCount = 1,
    layerOpacity = 0.3,

    // Performance
    lazy = false,

    // Layout
    as: Component = 'section',
    className = '',
    style,
    overlap = 0,

    // Accessibility
    'aria-label': ariaLabel,

    // Children
    children,
}: WaveSectionProps) {
    const sectionId = useId()
    const sectionRef = useRef<HTMLElement>(null)
    const ctx = useOptionalWaveContext()
    const defaults = ctx?.defaults ?? DEFAULTS
    const registeredRef = useRef(false)

    // ── Resolve preset ──
    const resolvedPreset = preset ? PRESETS[preset] : undefined

    // ── Parse background ──
    const bgValue = backgroundImage ? `url(${backgroundImage})` : background
    const parsedBg = useMemo(() => parseBackground(bgValue), [bgValue])

    // ── Register once on mount, update on prop changes ──
    useEffect(() => {
        if (!ctx) return

        const wavePos = wavePositionProp ?? 'bottom'

        if (!registeredRef.current) {
            // First mount — register
            const cleanup = ctx.register(sectionId, {
                id: sectionId,
                background: parsedBg,
                wavePosition: wavePos,
                element: sectionRef.current,
            })
            registeredRef.current = true
            return () => {
                registeredRef.current = false
                cleanup()
            }
        } else {
            // Subsequent renders — just update
            ctx.update(sectionId, {
                background: parsedBg,
                wavePosition: wavePos,
            })
        }
    }, [ctx, sectionId, parsedBg, wavePositionProp])

    // Update element ref after mount
    useEffect(() => {
        if (!ctx || !sectionRef.current) return
        ctx.update(sectionId, { element: sectionRef.current })
    }, [ctx, sectionId])

    // ── Resolve wave config ──
    const pattern: PatternName = patternProp ?? resolvedPreset?.pattern ?? defaults.pattern
    const height = heightProp ?? resolvedPreset?.height ?? defaults.height
    const amplitude = amplitudeProp ?? resolvedPreset?.amplitude ?? defaults.amplitude
    const frequency = frequencyProp ?? resolvedPreset?.frequency ?? defaults.frequency

    // Resolve responsive height
    const resolvedHeight = typeof height === 'number' ? height : (height.md ?? height.sm ?? 120)

    // ── Shadow / Glow / Stroke / Blur / Texture / Inner Shadow ──
    const shadow: ShadowConfig | undefined =
        shadowProp === true
            ? DEFAULT_SHADOW
            : shadowProp === false || shadowProp === undefined
                ? undefined
                : shadowProp

    const glow: GlowConfig | undefined =
        glowProp === true
            ? DEFAULT_GLOW
            : glowProp === false || glowProp === undefined
                ? undefined
                : glowProp

    const stroke: StrokeConfig | undefined =
        strokeProp === true
            ? DEFAULT_STROKE
            : strokeProp === false || strokeProp === undefined
                ? undefined
                : strokeProp

    const blur: BlurConfig | undefined =
        blurProp === true
            ? DEFAULT_BLUR
            : blurProp === false || blurProp === undefined
                ? undefined
                : blurProp

    const texture: TextureConfig | undefined =
        textureProp === true
            ? DEFAULT_TEXTURE
            : textureProp === false || textureProp === undefined
                ? undefined
                : textureProp

    const innerShadow: InnerShadowConfig | undefined =
        innerShadowProp === true
            ? DEFAULT_INNER_SHADOW
            : innerShadowProp === false || innerShadowProp === undefined
                ? undefined
                : innerShadowProp

    // ── Animation (with optional throttling via intersection) ──
    const [throttleRef, isInView] = useIntersection({ once: false })

    const { animationStyle } = useWaveAnimation({
        animate,
        duration: animationDuration,
        customKeyframes,
    })

    // Animation throttling: pause when off-screen
    const throttledAnimationStyle: CSSProperties = useMemo(() => {
        if (!animationStyle.animation) return animationStyle
        return {
            ...animationStyle,
            animationPlayState: isInView ? animationStyle.animationPlayState : 'paused',
        }
    }, [animationStyle, isInView])

    // ── Determine adjacent sections ──
    const prevSection = ctx?.getSectionBefore(sectionId) ?? null
    const nextSection = ctx?.getSectionAfter(sectionId) ?? null

    // ── Determine wave position ──
    // Default: 'bottom' — each section owns the wave BELOW it.
    // This prevents duplicate waves between adjacent sections.
    const wavePosition = wavePositionProp ?? 'bottom'
    const showTopWave = (wavePosition === 'top' || wavePosition === 'both') && prevSection !== null
    const showBottomWave = (wavePosition === 'bottom' || wavePosition === 'both') && nextSection !== null

    // ── Generate wave paths ──
    const patternConfig = {
        height: resolvedHeight,
        amplitude,
        frequency,
        phase: phase ?? 0,
        mirror: mirror ?? false,
        seed,
    }

    const topWavePaths = useMemo(() => {
        if (!showTopWave) return []
        if (layerCount > 1) return generateLayeredPaths(pattern, layerCount, patternConfig)
        return [generatePath(pattern === 'custom' && customPath ? 'smooth' : pattern, patternConfig)]
    }, [showTopWave, pattern, layerCount, amplitude, frequency, phase, mirror, seed, resolvedHeight])

    const bottomWavePaths = useMemo(() => {
        if (!showBottomWave) return []
        if (layerCount > 1) return generateLayeredPaths(pattern, layerCount, patternConfig)
        return [generatePath(pattern === 'custom' && customPath ? 'smooth' : pattern, patternConfig)]
    }, [showBottomWave, pattern, layerCount, amplitude, frequency, phase, mirror, seed, resolvedHeight])

    // ── Wave colors ──
    // Top wave: transitions from PREVIOUS section color to THIS section color
    const topWaveFillColor = parsedBg.dominantColor // This section's color fills the wave
    const topWaveContainerColor = prevSection?.background.dominantColor ?? 'transparent'

    // Bottom wave: transitions from THIS section color to NEXT section color
    const bottomWaveFillColor = nextSection?.background.dominantColor ?? 'transparent'
    const bottomWaveContainerColor = parsedBg.dominantColor

    // ── Clip-path for background images ──
    const clipPathStyle = useMemo(() => {
        if (!clipImage || !bottomWavePaths[0]) return undefined
        return generateClipPath(bottomWavePaths[0], resolvedHeight, 'bottom')
    }, [clipImage, bottomWavePaths, resolvedHeight])

    // ── Section styles ──
    const sectionStyle: CSSProperties = {
        position: 'relative',
        ...(parsedBg.type === 'color' && { backgroundColor: parsedBg.value }),
        ...(parsedBg.type === 'gradient' && { background: parsedBg.value }),
        ...(parsedBg.type === 'image' && {
            backgroundImage: parsedBg.value,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }),
        ...(overlap !== 0 && { marginTop: -overlap, marginBottom: -overlap }),
        ...(clipPathStyle && { clipPath: clipPathStyle }),
        ...style,
    }

    // Shared props for wave renderers
    const sharedEffects = { stroke, blur, texture, innerShadow, lazy }

    return (
        <>
            {/* Top Wave */}
            {showTopWave && (
                layerCount > 1 ? (
                    <WaveLayer
                        paths={topWavePaths}
                        fillColor={topWaveFillColor}
                        containerColor={topWaveContainerColor}
                        height={resolvedHeight}
                        direction="down"
                        baseOpacity={layerOpacity}
                    />
                ) : (
                    <WaveRenderer
                        path={topWavePaths[0] || ''}
                        fillColor={topWaveFillColor}
                        containerColor={topWaveContainerColor}
                        height={resolvedHeight}
                        direction="down"
                        shadow={shadow}
                        glow={glow}
                        {...sharedEffects}
                        animationStyle={throttledAnimationStyle}
                    />
                )
            )}

            {/* Section Content */}
            <Component
                ref={(node: HTMLElement | null) => {
                    // Merge refs: sectionRef + throttleRef for animation throttling
                    ;(sectionRef as React.MutableRefObject<HTMLElement | null>).current = node
                    throttleRef(node)
                }}
                className={`wavy-bavy-section ${className}`}
                style={sectionStyle}
                aria-label={ariaLabel}
            >
                {children}
            </Component>

            {/* Bottom Wave */}
            {showBottomWave && (
                layerCount > 1 ? (
                    <WaveLayer
                        paths={bottomWavePaths}
                        fillColor={bottomWaveFillColor}
                        containerColor={bottomWaveContainerColor}
                        height={resolvedHeight}
                        direction="down"
                        baseOpacity={layerOpacity}
                    />
                ) : (
                    <WaveRenderer
                        path={bottomWavePaths[0] || ''}
                        fillColor={bottomWaveFillColor}
                        containerColor={bottomWaveContainerColor}
                        height={resolvedHeight}
                        direction="down"
                        shadow={shadow}
                        glow={glow}
                        {...sharedEffects}
                        animationStyle={throttledAnimationStyle}
                    />
                )
            )}
        </>
    )
}
