'use client'

import {
    useEffect,
    useId,
    useMemo,
    useRef,
    type CSSProperties,
    type MutableRefObject,
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
    ScrollAnimationConfig,
    ParallaxConfig,
    HoverConfig,
    WaveSeparationConfig,
    WaveEdgeConfig,
} from '../types'
import { useOptionalWaveContext } from '../context/useWaveContext'
import { WaveRenderer } from './WaveRenderer'
import { WaveLayer } from './WaveLayer'
import { parseBackground, generateAutoGradient } from '../utils/color-utils'
import { generatePath, generateLayeredPaths } from '../utils/path-generator'
import {
    DEFAULTS,
    BREAKPOINTS,
    DEFAULT_SHADOW,
    DEFAULT_GLOW,
    DEFAULT_STROKE,
    DEFAULT_BLUR,
    DEFAULT_TEXTURE,
    DEFAULT_INNER_SHADOW,
    DEFAULT_SCROLL_ANIMATION,
    DEFAULT_PARALLAX,
    DEFAULT_HOVER,
    DEFAULT_SEPARATION,
    PRESETS,
} from '../constants'
import type { Breakpoint } from '../types'
import { useWaveAnimation } from '../utils/animation'
import { generateClipPath } from '../utils/clip-path'
import { useIntersection, useMergedRef } from '../utils/use-intersection'
import { useScrollProgress } from '../utils/use-scroll-progress'
import { generateInterlockPaths, generateCrossBoundaryPaths, autoSeed } from '../utils/interlock-generator'
import { PATH_MORPH_GENERATORS, generateDualPathMorphKeyframes } from '../utils/keyframes'

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

    // Gradient Fills
    fillGradient,
    containerGradient,
    autoGradient,

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

    // Scroll & Interaction
    scrollAnimate: scrollAnimateProp,
    parallax: parallaxProp,
    hover: hoverProp,
    separation: separationProp,
    upperWave,
    lowerWave,
    onEnter,
    onExit,
    onProgress,

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
    const cleanupRef = useRef<(() => void) | null>(null)

    // Extract stable functions from context to avoid depending on the entire ctx object
    // (ctx changes on every sections update because getSectionBefore/After are recreated)
    const ctxRegister = ctx?.register
    const ctxUpdate = ctx?.update

    // ── Resolve preset ──
    const resolvedPreset = preset ? PRESETS[preset] : undefined

    // ── Parse background ──
    const bgValue = backgroundImage ? `url(${backgroundImage})` : background
    const parsedBg = useMemo(() => parseBackground(bgValue), [bgValue])

    // ── Debug metadata (zero overhead when debug is off) ──
    const isDebug = ctx?.debug ?? false
    const debugMeta = isDebug
        ? {
              pattern: patternProp ?? resolvedPreset?.pattern ?? defaults.pattern,
              amplitude: amplitudeProp ?? resolvedPreset?.amplitude ?? defaults.amplitude,
              frequency: frequencyProp ?? resolvedPreset?.frequency ?? defaults.frequency,
              animate: animate ?? resolvedPreset?.animate ?? defaults.animate,
          }
        : undefined

    // ── Register once on mount, update on prop changes (NO cleanup returned) ──
    useEffect(() => {
        if (!ctxRegister || !ctxUpdate) return

        const wavePos = wavePositionProp ?? 'bottom'
        const config = {
            background: parsedBg,
            wavePosition: wavePos,
            debugMeta,
            upperWave,
            lowerWave,
        }

        if (!cleanupRef.current) {
            // First mount — register
            cleanupRef.current = ctxRegister(sectionId, {
                id: sectionId,
                element: sectionRef.current,
                ...config,
            })
        } else {
            // Subsequent renders — update only
            ctxUpdate(sectionId, config)
        }
    }, [ctxRegister, ctxUpdate, sectionId, parsedBg, wavePositionProp, isDebug, debugMeta?.pattern, debugMeta?.amplitude, debugMeta?.frequency, debugMeta?.animate, JSON.stringify(upperWave), JSON.stringify(lowerWave)])

    // Unmount-only cleanup (separate effect to prevent re-registration on prop changes)
    useEffect(() => {
        return () => {
            cleanupRef.current?.()
            cleanupRef.current = null
        }
    }, [])

    // Update element ref after mount
    useEffect(() => {
        if (!ctxUpdate || !sectionRef.current) return
        ctxUpdate(sectionId, { element: sectionRef.current })
    }, [ctxUpdate, sectionId])

    // ── Resolve wave config ──
    const pattern: PatternName = patternProp ?? resolvedPreset?.pattern ?? defaults.pattern
    const height = heightProp ?? resolvedPreset?.height ?? defaults.height
    const rawAmplitude = amplitudeProp ?? resolvedPreset?.amplitude ?? defaults.amplitude
    const rawFrequency = frequencyProp ?? resolvedPreset?.frequency ?? defaults.frequency

    // Validate and clamp numeric props
    const amplitude = Math.max(0, Math.min(1, rawAmplitude))
    const frequency = Math.max(0.1, Math.min(20, rawFrequency))

    // Validate numeric props — warn and clamp
    if (rawAmplitude < 0 || rawAmplitude > 1) {
        console.warn(`[wavy-bavy] amplitude ${rawAmplitude} is outside valid range [0, 1], clamped to ${amplitude}`)
    }
    if (rawFrequency < 0.1 || rawFrequency > 20) {
        console.warn(`[wavy-bavy] frequency ${rawFrequency} is outside valid range [0.1, 20], clamped to ${frequency}`)
    }

    // Resolve responsive height: use max for SVG path generation, CSS media queries for visual
    const isResponsiveHeight = typeof height === 'object'
    const resolvedHeight = typeof height === 'number'
        ? height
        : Math.max(...Object.values(height as Partial<Record<Breakpoint, number>>).filter((v): v is number => typeof v === 'number'), 120)

    // Generate responsive CSS for wave height
    const responsiveHeightCSS = useMemo(() => {
        if (!isResponsiveHeight) return undefined
        const bp = height as Partial<Record<Breakpoint, number>>
        const rules: string[] = []
        // Base height (smallest defined or fallback)
        const baseHeight = bp.sm ?? Object.values(bp).find((v): v is number => typeof v === 'number') ?? 120
        rules.push(`.wavy-bavy-rh-${sectionId.replace(/:/g, '')} { height: ${baseHeight}px; }`)
        // Media queries for each breakpoint
        const bpOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']
        for (const name of bpOrder) {
            if (bp[name] !== undefined) {
                rules.push(`@media (min-width: ${BREAKPOINTS[name]}px) { .wavy-bavy-rh-${sectionId.replace(/:/g, '')} { height: ${bp[name]}px; } }`)
            }
        }
        return rules.join('\n')
    }, [isResponsiveHeight, height, sectionId])

    const responsiveHeightClass = isResponsiveHeight ? `wavy-bavy-rh-${sectionId.replace(/:/g, '')}` : undefined

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

    // ── Resolve scroll & interaction configs ──
    const scrollAnimation: ScrollAnimationConfig | undefined =
        scrollAnimateProp === true
            ? DEFAULT_SCROLL_ANIMATION
            : scrollAnimateProp === false || scrollAnimateProp === undefined
                ? undefined
                : scrollAnimateProp

    const parallax: ParallaxConfig | undefined =
        parallaxProp === true
            ? DEFAULT_PARALLAX
            : parallaxProp === false || parallaxProp === undefined
                ? undefined
                : parallaxProp

    const hover: HoverConfig | undefined =
        hoverProp === true
            ? DEFAULT_HOVER
            : hoverProp === false || hoverProp === undefined
                ? undefined
                : hoverProp

    // ── Separation config ──
    const separation: WaveSeparationConfig | undefined =
        separationProp === true
            ? DEFAULT_SEPARATION
            : separationProp === false || separationProp === undefined
                ? undefined
                : { ...DEFAULT_SEPARATION, ...separationProp }

    // ── Scroll progress (used for scroll-linked animation, parallax, onProgress) ──
    const needsScrollProgress = !!scrollAnimation || !!parallax || !!onProgress
    const [scrollRef, scrollProgress] = useScrollProgress({
        disabled: !needsScrollProgress,
    })

    // ── Animation (with optional throttling via intersection) ──
    const [throttleRef, isInView] = useIntersection({ once: false })

    const { animationStyle } = useWaveAnimation({
        animate,
        duration: animationDuration,
        customKeyframes,
    })

    // Animation throttling: pause when off-screen, or drive via scroll
    const throttledAnimationStyle: CSSProperties = useMemo(() => {
        if (scrollAnimation && animationStyle.animation) {
            // Scroll-linked animation: paused + negative delay mapped from scroll progress
            const durationMatch = animationStyle.animation?.toString().match(/([\d.]+)s/)
            const duration = durationMatch ? parseFloat(durationMatch[1]) : 4
            const p = scrollAnimation.reverse ? 1 - scrollProgress : scrollProgress

            return {
                ...animationStyle,
                animationPlayState: 'paused',
                animationDelay: `-${p * duration}s`,
            }
        }

        if (!animationStyle.animation) return animationStyle
        return {
            ...animationStyle,
            animationPlayState: isInView ? animationStyle.animationPlayState : 'paused',
        }
    }, [animationStyle, isInView, scrollAnimation, scrollProgress])

    // ── Parallax offset for single-layer wave renderers ──
    const parallaxOffset = useMemo(() => {
        if (!parallax) return undefined
        const speed = parallax.speed ?? 0.3
        const offset = (scrollProgress - 0.5) * speed * 100
        if (parallax.direction === 'horizontal') {
            return { x: offset, y: 0 }
        }
        return { x: 0, y: offset }
    }, [parallax, scrollProgress])

    // ── Intersection callbacks (onEnter / onExit) ──
    const [callbackRef, isCallbackVisible] = useIntersection({ once: false })
    const prevVisibleRef = useRef(false)
    const onEnterRef = useRef(onEnter)
    const onExitRef = useRef(onExit)
    const onProgressRef = useRef(onProgress)
    onEnterRef.current = onEnter
    onExitRef.current = onExit
    onProgressRef.current = onProgress

    useEffect(() => {
        if (!onEnterRef.current && !onExitRef.current) return

        if (isCallbackVisible && !prevVisibleRef.current) {
            onEnterRef.current?.()
        } else if (!isCallbackVisible && prevVisibleRef.current) {
            onExitRef.current?.()
        }
        prevVisibleRef.current = isCallbackVisible
    }, [isCallbackVisible])

    // ── onProgress callback ──
    useEffect(() => {
        if (!onProgressRef.current || !needsScrollProgress) return
        onProgressRef.current(scrollProgress)
    }, [scrollProgress, needsScrollProgress])

    // ── Determine adjacent sections ──
    const prevSection = ctx?.getSectionBefore(sectionId) ?? null
    const nextSection = ctx?.getSectionAfter(sectionId) ?? null

    // ── Determine wave position ──
    // Default: 'bottom' — each section owns the wave BELOW it.
    // Deduplication: at any boundary, bottom wave takes priority over top wave.
    // If the previous section already renders a bottom wave at this boundary,
    // this section's top wave is suppressed to prevent doubled/overlapping waves.
    const wavePosition = wavePositionProp ?? 'bottom'
    const prevRendersBottom = prevSection !== null &&
        (prevSection.wavePosition === 'bottom' || prevSection.wavePosition === 'both')
    const showTopWave = (wavePosition === 'top' || wavePosition === 'both') && prevSection !== null && !prevRendersBottom
    const showBottomWave = (wavePosition === 'bottom' || wavePosition === 'both') && nextSection !== null

    // ── Generate wave paths ──

    // ── Helper: resolve edge config from WaveEdgeConfig + section defaults ──
    const resolveEdgeConfig = (
        edge: WaveEdgeConfig | undefined,
        sectionDefaults: { pattern: PatternName; amplitude: number; frequency: number; height: number; phase: number; mirror: boolean; seed?: number }
    ) => {
        if (!edge) return sectionDefaults
        return {
            pattern: edge.pattern ?? sectionDefaults.pattern,
            amplitude: edge.amplitude ?? sectionDefaults.amplitude,
            frequency: edge.frequency ?? sectionDefaults.frequency,
            height: edge.height ?? sectionDefaults.height,
            phase: edge.phase ?? sectionDefaults.phase,
            mirror: edge.mirror ?? sectionDefaults.mirror,
            seed: edge.seed ?? sectionDefaults.seed,
        }
    }

    const sectionDefaults = { pattern, amplitude, frequency, height: resolvedHeight, phase: phase ?? 0, mirror: mirror ?? false, seed }

    const topWavePaths = useMemo(() => {
        if (!showTopWave) return []
        // If dual-path separation is active for the top edge, single paths are not used
        if (separation && separation.mode !== 'flush' && (upperWave || prevSection?.lowerWave)) return []
        const edgeConfig = resolveEdgeConfig(upperWave, sectionDefaults)
        if (layerCount > 1) return generateLayeredPaths(edgeConfig.pattern, layerCount, { height: edgeConfig.height, amplitude: edgeConfig.amplitude, frequency: edgeConfig.frequency, phase: edgeConfig.phase, mirror: edgeConfig.mirror, seed: edgeConfig.seed })
        return [generatePath(edgeConfig.pattern === 'custom' && customPath ? 'smooth' : edgeConfig.pattern, { height: edgeConfig.height, amplitude: edgeConfig.amplitude, frequency: edgeConfig.frequency, phase: edgeConfig.phase, mirror: edgeConfig.mirror, seed: edgeConfig.seed })]
    }, [showTopWave, pattern, layerCount, amplitude, frequency, phase, mirror, seed, resolvedHeight, upperWave, prevSection?.lowerWave, separation])

    const bottomWavePaths = useMemo(() => {
        if (!showBottomWave) return []
        // If dual-path separation is active for the bottom edge, single paths are not used
        if (separation && separation.mode !== 'flush' && (lowerWave || nextSection?.upperWave)) return []
        const edgeConfig = resolveEdgeConfig(lowerWave, sectionDefaults)
        if (layerCount > 1) return generateLayeredPaths(edgeConfig.pattern, layerCount, { height: edgeConfig.height, amplitude: edgeConfig.amplitude, frequency: edgeConfig.frequency, phase: edgeConfig.phase, mirror: edgeConfig.mirror, seed: edgeConfig.seed })
        return [generatePath(edgeConfig.pattern === 'custom' && customPath ? 'smooth' : edgeConfig.pattern, { height: edgeConfig.height, amplitude: edgeConfig.amplitude, frequency: edgeConfig.frequency, phase: edgeConfig.phase, mirror: edgeConfig.mirror, seed: edgeConfig.seed })]
    }, [showBottomWave, pattern, layerCount, amplitude, frequency, phase, mirror, seed, resolvedHeight, lowerWave, nextSection?.upperWave, separation])

    // ── Dual-path interlocking (cross-boundary or separation) ──
    const sectionOrder = ctx?.sections.findIndex(s => s.id === sectionId) ?? 0

    const bottomDualPaths = useMemo(() => {
        if (!showBottomWave) return undefined
        // Dual paths only when separation is explicitly configured
        if (!separation || separation.mode === 'flush') return undefined

        // Cross-boundary mode: use edge configs when available
        if (lowerWave || nextSection?.upperWave) {
            const myLower = resolveEdgeConfig(lowerWave, sectionDefaults)
            const nextUpper = resolveEdgeConfig(nextSection?.upperWave, sectionDefaults)
            return generateCrossBoundaryPaths({
                upperConfig: myLower,
                lowerConfig: nextUpper,
                mode: separation.mode,
                intensity: separation.intensity,
                gap: separation.gap,
            })
        }

        // Legacy dual-path mode (separation prop, no edge configs)
        return generateInterlockPaths({
            pattern,
            height: resolvedHeight,
            amplitude,
            frequency,
            intensity: separation.intensity,
            mode: separation.mode,
            seed: seed ?? autoSeed(sectionOrder, 0),
            gap: separation.gap,
            phase: phase ?? 0,
            mirror: mirror ?? false,
        })
    }, [showBottomWave, lowerWave, nextSection?.upperWave, separation, pattern, resolvedHeight, amplitude, frequency, sectionOrder, seed, phase, mirror])

    const topDualPaths = useMemo(() => {
        if (!showTopWave) return undefined
        // Dual paths only when separation is explicitly configured
        if (!separation || separation.mode === 'flush') return undefined

        // Cross-boundary mode: use edge configs when available
        if (upperWave || prevSection?.lowerWave) {
            const myUpper = resolveEdgeConfig(upperWave, sectionDefaults)
            const prevLower = resolveEdgeConfig(prevSection?.lowerWave, sectionDefaults)
            return generateCrossBoundaryPaths({
                upperConfig: prevLower,
                lowerConfig: myUpper,
                mode: separation.mode,
                intensity: separation.intensity,
                gap: separation.gap,
            })
        }

        // Legacy dual-path mode (separation prop, no edge configs)
        return generateInterlockPaths({
            pattern,
            height: resolvedHeight,
            amplitude,
            frequency,
            intensity: separation.intensity,
            mode: separation.mode,
            seed: seed ?? autoSeed(sectionOrder, 1),
            gap: separation.gap,
            phase: phase ?? 0,
            mirror: mirror ?? false,
        })
    }, [showTopWave, upperWave, prevSection?.lowerWave, separation, pattern, resolvedHeight, amplitude, frequency, sectionOrder, seed, phase, mirror])

    // ── Path morphing keyframes for new animation types ──
    const animateName = animate ?? resolvedPreset?.animate ?? defaults.animate
    const isPathMorphAnim = typeof animateName === 'string' && animateName in PATH_MORPH_GENERATORS

    const bottomMorphKeyframes = useMemo(() => {
        if (!isPathMorphAnim || !showBottomWave) return undefined
        const gen = PATH_MORPH_GENERATORS[animateName as string]
        if (!gen) return undefined
        const basePath = bottomDualPaths?.pathA ?? bottomWavePaths[0] ?? ''
        const animIdA = `wavy-morph-a-${sectionOrder}-bottom`
        const animIdB = `wavy-morph-b-${sectionOrder}-bottom`
        const morphConfig = { height: resolvedHeight, amplitude, frequency }

        if (bottomDualPaths) {
            // Coordinated dual-path keyframes — both paths stay in sync
            const { cssA, cssB } = generateDualPathMorphKeyframes(
                animIdA, animIdB, basePath, bottomDualPaths.pathB,
                animateName as string, pattern, morphConfig,
            )
            return { cssA, cssB, animIdA, animIdB }
        }

        const cssA = gen(animIdA, basePath, pattern, morphConfig)
        return { cssA, cssB: undefined, animIdA, animIdB }
    }, [isPathMorphAnim, showBottomWave, animateName, bottomDualPaths, bottomWavePaths, pattern, resolvedHeight, amplitude, frequency, sectionOrder])

    const topMorphKeyframes = useMemo(() => {
        if (!isPathMorphAnim || !showTopWave) return undefined
        const gen = PATH_MORPH_GENERATORS[animateName as string]
        if (!gen) return undefined
        const basePath = topDualPaths?.pathA ?? topWavePaths[0] ?? ''
        const animIdA = `wavy-morph-a-${sectionOrder}-top`
        const animIdB = `wavy-morph-b-${sectionOrder}-top`
        const morphConfig = { height: resolvedHeight, amplitude, frequency }

        if (topDualPaths) {
            // Coordinated dual-path keyframes — both paths stay in sync
            const { cssA, cssB } = generateDualPathMorphKeyframes(
                animIdA, animIdB, basePath, topDualPaths.pathB,
                animateName as string, pattern, morphConfig,
            )
            return { cssA, cssB, animIdA, animIdB }
        }

        const cssA = gen(animIdA, basePath, pattern, morphConfig)
        return { cssA, cssB: undefined, animIdA, animIdB }
    }, [isPathMorphAnim, showTopWave, animateName, topDualPaths, topWavePaths, pattern, resolvedHeight, amplitude, frequency, sectionOrder])

    // ── Wave colors ──
    // Top wave: transitions from PREVIOUS section color to THIS section color
    const topWaveFillColor = parsedBg.dominantColor // This section's color fills the wave
    const topWaveContainerColor = prevSection?.background.dominantColor ?? 'transparent'

    // Bottom wave: transitions from THIS section color to NEXT section color
    const bottomWaveFillColor = nextSection?.background.dominantColor ?? 'transparent'
    const bottomWaveContainerColor = parsedBg.dominantColor

    // ── Auto-gradient from adjacent section colors ──
    const resolvedFillGradient = fillGradient ?? (autoGradient && showBottomWave
        ? generateAutoGradient(bottomWaveContainerColor, bottomWaveFillColor)
        : undefined)
    const resolvedContainerGradient = containerGradient ?? (autoGradient && showBottomWave
        ? generateAutoGradient(bottomWaveContainerColor, bottomWaveFillColor)
        : undefined)
    const resolvedTopFillGradient = fillGradient ?? (autoGradient && showTopWave
        ? generateAutoGradient(topWaveContainerColor, topWaveFillColor)
        : undefined)
    const resolvedTopContainerGradient = containerGradient ?? (autoGradient && showTopWave
        ? generateAutoGradient(topWaveContainerColor, topWaveFillColor)
        : undefined)

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
        ...(blur?.section && {
            backdropFilter: `blur(${blur.radius}px) saturate(${blur.saturation})`,
            WebkitBackdropFilter: `blur(${blur.radius}px) saturate(${blur.saturation})`,
        }),
        ...style,
    }

    // ── Stable merged ref (prevents infinite re-render from inline ref callbacks) ──
    const mergedRef = useMergedRef<HTMLElement>(
        sectionRef as MutableRefObject<HTMLElement | null>,
        throttleRef,
        scrollRef,
        callbackRef,
    )

    // Shared props for wave renderers
    const sharedEffects = { stroke, blur, texture, innerShadow, lazy, hover }

    // Parallax props for WaveLayer
    const parallaxLayerProps = parallax
        ? {
              parallaxSpeed: parallax.speed ?? 0.3,
              scrollProgress,
              parallaxDirection: parallax.direction ?? ('vertical' as const),
          }
        : {}

    return (
        <>
            {/* Responsive height CSS injection */}
            {responsiveHeightCSS && <style>{responsiveHeightCSS}</style>}

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
                        hover={hover}
                        {...parallaxLayerProps}
                    />
                ) : (
                    <WaveRenderer
                        path={topDualPaths?.pathA ?? topWavePaths[0] ?? ''}
                        fillColor={topWaveFillColor}
                        containerColor={topWaveContainerColor}
                        fillGradient={resolvedTopFillGradient}
                        containerGradient={resolvedTopContainerGradient}
                        height={resolvedHeight}
                        direction="down"
                        shadow={shadow}
                        glow={glow}
                        {...sharedEffects}
                        animationStyle={isPathMorphAnim ? undefined : throttledAnimationStyle}
                        parallaxOffset={parallaxOffset}
                        pathB={topDualPaths?.pathB}
                        separation={separation}
                        pathAKeyframesCSS={topMorphKeyframes?.cssA}
                        pathBKeyframesCSS={topMorphKeyframes?.cssB}
                        pathAAnimId={topMorphKeyframes?.animIdA}
                        pathBAnimId={topMorphKeyframes?.animIdB}
                        animationDuration={animationDuration}
                        className={responsiveHeightClass}
                    />
                )
            )}

            {/* Section Content */}
            <Component
                ref={mergedRef}
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
                        hover={hover}
                        {...parallaxLayerProps}
                    />
                ) : (
                    <WaveRenderer
                        path={bottomDualPaths?.pathA ?? bottomWavePaths[0] ?? ''}
                        fillColor={bottomWaveFillColor}
                        containerColor={bottomWaveContainerColor}
                        fillGradient={resolvedFillGradient}
                        containerGradient={resolvedContainerGradient}
                        height={resolvedHeight}
                        direction="down"
                        shadow={shadow}
                        glow={glow}
                        {...sharedEffects}
                        animationStyle={isPathMorphAnim ? undefined : throttledAnimationStyle}
                        parallaxOffset={parallaxOffset}
                        pathB={bottomDualPaths?.pathB}
                        separation={separation}
                        pathAKeyframesCSS={bottomMorphKeyframes?.cssA}
                        pathBKeyframesCSS={bottomMorphKeyframes?.cssB}
                        pathAAnimId={bottomMorphKeyframes?.animIdA}
                        pathBAnimId={bottomMorphKeyframes?.animIdB}
                        animationDuration={animationDuration}
                        className={responsiveHeightClass}
                    />
                )
            )}
        </>
    )
}
