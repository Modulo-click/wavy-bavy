'use client'

import { useId, useMemo, useState } from 'react'
import type { WaveRendererProps, GradientConfig } from '../types'
import { DEFAULT_VIEWBOX_WIDTH } from '../constants'
import type { CSSProperties } from 'react'
import { useIntersection } from '../utils/use-intersection'

// ── Path utilities ──

/**
 * Extract the wave contour from a full SVG path string.
 * Removes baseline segments (bottom-left start, right-edge drop, close)
 * so only the wave curve portion remains.
 *
 * Generated paths follow: M 0 {h} L 0 {y} [curves...] L {w} {h} Z
 * Wave contour:           M 0 {y} [curves...]
 */
function extractWaveContour(path: string): string {
    const commands = path.match(/[MLCQSTAHVZmlcsqtahvz][^MLCQSTAHVZmlcsqtahvz]*/gi)
    if (!commands || commands.length < 4) return path

    const contour = commands.slice(1, -2)
    contour[0] = contour[0].replace(/^L/i, 'M')

    return contour.join(' ').trim()
}

/**
 * Extend the path below the SVG viewbox to prevent visible edge
 * artifacts at the bottom baseline. Clipped by the viewbox.
 */
function extendPathBelow(pathStr: string, height: number): string {
    const ext = height + 50
    return pathStr
        .replace(/^M\s+(-?\d+\.?\d*)\s+[\d.]+/, `M $1 ${ext}`)
        .replace(/L\s+(-?\d+\.?\d*)\s+[\d.]+(\s*Z\s*)$/, `L $1 ${ext}$2`)
}

/**
 * Invert the path to cover the TOP area (above the wave curve).
 * Corners go to y=-50 (above viewbox) to hide top-edge filter artifacts.
 *
 * Original: M 0 {height} → [wave] → L {width} {height} Z  (bottom area)
 * Inverted: M 0 -50      → [wave] → L {width} -50      Z  (top area)
 */
function invertPathToTop(pathStr: string): string {
    return pathStr
        .replace(/^M\s+(-?\d+\.?\d*)\s+[\d.]+/, 'M $1 -50')
        .replace(/L\s+(-?\d+\.?\d*)\s+[\d.]+(\s*Z\s*)$/, 'L $1 -50$2')
}

/**
 * Render an SVG gradient definition element.
 */
function renderGradientDef(config: GradientConfig, id: string) {
    if (config.type === 'radial') {
        return (
            <radialGradient id={id} cx="50%" cy="50%" r="50%">
                {config.stops.map((stop, i) => (
                    <stop key={i} offset={`${stop.offset * 100}%`} stopColor={stop.color} />
                ))}
            </radialGradient>
        )
    }
    // Linear gradient — convert angle to SVG x1/y1/x2/y2
    const angle = config.angle ?? 0
    const rad = (angle * Math.PI) / 180
    const x1 = `${50 - Math.cos(rad) * 50}%`
    const y1 = `${50 + Math.sin(rad) * 50}%`
    const x2 = `${50 + Math.cos(rad) * 50}%`
    const y2 = `${50 - Math.sin(rad) * 50}%`
    return (
        <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
            {config.stops.map((stop, i) => (
                <stop key={i} offset={`${stop.offset * 100}%`} stopColor={stop.color} />
            ))}
        </linearGradient>
    )
}

/**
 * WaveRenderer — low-level SVG wave renderer.
 *
 * Renders a wave using two SVG paths separated by the wave curve:
 *   Path 1 (top area): containerColor + effects — the owning section's area
 *   Path 2 (bottom area): fillColor, no effects — the adjacent section's area
 *
 * Effects (inner shadow, glow, texture, drop shadow) are applied to Path 1
 * so they appear on the owning section's side of the wave curve.
 *
 * Animations are applied to a wrapper div between the container and SVG
 * for reliable CSS transform behavior on HTML elements.
 *
 * Stroke traces only the wave contour (no baseline edges).
 */
export function WaveRenderer({
    path,
    fillColor,
    containerColor,
    fillGradient,
    containerGradient,
    height,
    direction,
    shadow,
    glow,
    stroke,
    blur,
    texture,
    innerShadow,
    lazy = false,
    hover,
    parallaxOffset,
    pathB,
    separation,
    pathAKeyframesCSS,
    pathBKeyframesCSS,
    pathAAnimId,
    pathBAnimId,
    animationDuration,
    className = '',
    animationStyle,
}: WaveRendererProps & { animationStyle?: CSSProperties }) {
    const viewBoxWidth = DEFAULT_VIEWBOX_WIDTH
    const isUp = direction === 'up'
    const [isHovered, setIsHovered] = useState(false)
    const stableId = useId()

    // Lazy rendering via IntersectionObserver
    const [intersectionRef, isVisible] = useIntersection({
        rootMargin: '100px',
        once: true,
    })

    // Build SVG filter for shadow/glow/texture/innerShadow effects
    const hasFilter = !!shadow || !!glow || !!texture || !!innerShadow
    const filterId = hasFilter ? `wave-filter-${stableId.replace(/:/g, '')}` : undefined

    // Gradient IDs (stable, SSR-safe)
    const fillGradientId = fillGradient ? `wave-fill-grad-${stableId.replace(/:/g, '')}` : undefined
    const containerGradientId = containerGradient ? `wave-container-grad-${stableId.replace(/:/g, '')}` : undefined

    // Resolve fill references (gradient URL or solid color)
    const fillRef = fillGradientId ? `url(#${fillGradientId})` : fillColor
    const containerRef = containerGradientId ? `url(#${containerGradientId})` : containerColor

    // Dual-path mode active when pathB is provided
    const isDualPath = !!pathB

    // Extract wave contour for stroke (excludes baseline edges)
    const strokePath = useMemo(
        () => (stroke ? extractWaveContour(path) : undefined),
        [path, !!stroke],
    )

    // Top area path: covers above the wave curve, gets effects
    const topPath = useMemo(() => invertPathToTop(path), [path])

    // Generate top path morph keyframes from bottom path keyframes
    const topMorphAnim = useMemo(() => {
        if (!pathAKeyframesCSS || !pathAAnimId) return undefined
        const topAnimId = pathAAnimId + '-top'
        const topCSS = pathAKeyframesCSS
            .replace(pathAAnimId, topAnimId)
            .replace(/d:\s*path\("([^"]+)"\)/g, (_: string, pathStr: string) => {
                return `d: path("${invertPathToTop(pathStr)}")`
            })
        return { css: topCSS, animId: topAnimId }
    }, [pathAKeyframesCSS, pathAAnimId])

    // Bottom area path: covers below the wave curve, no effects
    const bottomPath = useMemo(() => extendPathBelow(path, height), [path, height])

    // Dual-path: Path B bottom area
    const bottomPathB = useMemo(
        () => pathB ? extendPathBelow(pathB, height) : undefined,
        [pathB, height],
    )

    // Build path morphing keyframes style block for injection into SVG
    const morphKeyframesCSS = useMemo(() => {
        const parts: string[] = []
        if (pathAKeyframesCSS) parts.push(pathAKeyframesCSS)
        if (pathBKeyframesCSS) parts.push(pathBKeyframesCSS)
        if (topMorphAnim?.css) parts.push(topMorphAnim.css)
        return parts.length > 0 ? parts.join('\n') : undefined
    }, [pathAKeyframesCSS, pathBKeyframesCSS, topMorphAnim?.css])

    // ── Container styles (layout + fallback background + rotation) ──
    const containerStyle: CSSProperties = {
        width: '100%',
        height,
        overflow: 'hidden',
        lineHeight: 0,
        fontSize: 0,
        backgroundColor: fillColor,
        transform: isUp ? 'rotate(180deg)' : undefined,
    }

    // Blur: backdrop-filter on container
    if (blur) {
        containerStyle.backdropFilter = `blur(${blur.radius}px) saturate(${blur.saturation})`
        containerStyle.WebkitBackdropFilter = `blur(${blur.radius}px) saturate(${blur.saturation})`
    }

    // ── Parallax via viewBox shift (Y axis only — no wrapper gap) ──
    const parallaxY = Math.max(-50, Math.min(50, -(parallaxOffset?.y ?? 0)))

    // ── Wrapper styles (animation + hover + horizontal parallax) ──
    const wrapperTransforms: string[] = []
    if (hover && isHovered) {
        const s = hover.scale ?? 1.02
        const l = hover.lift ?? -4
        wrapperTransforms.push(`scale(${s})`)
        wrapperTransforms.push(`translateY(${l}px)`)
    }
    if (parallaxOffset && parallaxOffset.x !== 0) {
        wrapperTransforms.push(`translateX(${parallaxOffset.x}px)`)
    }

    const wrapperStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        transform: wrapperTransforms.length > 0 ? wrapperTransforms.join(' ') : undefined,
        ...animationStyle,
    }

    // Hover transition on wrapper
    if (hover) {
        wrapperStyle.transition = hover.transition ?? 'transform 0.3s ease, filter 0.3s ease'
    }

    // Hover glow boost
    if (hover?.glow && isHovered && glow) {
        wrapperStyle.filter = 'brightness(1.15)'
    }

    // Mouse handlers for hover
    const mouseHandlers = hover
        ? {
              onMouseEnter: () => setIsHovered(true),
              onMouseLeave: () => setIsHovered(false),
          }
        : undefined

    // Lazy: render placeholder until visible
    if (lazy && !isVisible) {
        return (
            <div
                ref={intersectionRef}
                className={`wavy-bavy-wave ${className}`}
                style={containerStyle}
                aria-hidden="true"
                role="presentation"
                {...mouseHandlers}
            />
        )
    }

    return (
        <div
            ref={lazy ? intersectionRef : undefined}
            className={`wavy-bavy-wave ${className}`}
            style={containerStyle}
            aria-hidden="true"
            role="presentation"
            {...mouseHandlers}
        >
            <div style={wrapperStyle}>
                <svg
                    viewBox={`-20 ${parallaxY} ${viewBoxWidth + 40} ${height}`}
                    preserveAspectRatio="none"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Defs: gradients + filters + path morphing keyframes */}
                    <defs>
                        {fillGradient && fillGradientId && renderGradientDef(fillGradient, fillGradientId)}
                        {containerGradient && containerGradientId && renderGradientDef(containerGradient, containerGradientId)}
                        {hasFilter && (
                            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                                {shadow && (
                                    <feDropShadow
                                        dx={shadow.offsetX}
                                        dy={shadow.offsetY}
                                        stdDeviation={shadow.blur / 2}
                                        floodColor={shadow.color}
                                    />
                                )}
                                {glow && (
                                    <>
                                        <feGaussianBlur
                                            in="SourceAlpha"
                                            stdDeviation={glow.intensity / 2}
                                            result="blur"
                                        />
                                        <feFlood
                                            floodColor={glow.color === 'currentColor' ? containerColor : glow.color}
                                            floodOpacity={glow.opacity}
                                            result="color"
                                        />
                                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                                        <feMerge>
                                            <feMergeNode in="glow" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </>
                                )}
                                {texture && (
                                    <>
                                        <feTurbulence
                                            type={texture.type}
                                            baseFrequency={texture.frequency}
                                            numOctaves={texture.octaves}
                                            seed={texture.seed}
                                            result="texture"
                                        />
                                        <feDisplacementMap
                                            in="SourceGraphic"
                                            in2="texture"
                                            scale={texture.scale}
                                            xChannelSelector="R"
                                            yChannelSelector="G"
                                            result="displaced"
                                        />
                                    </>
                                )}
                                {innerShadow && (
                                    <>
                                        <feComponentTransfer in="SourceAlpha" result="innerAlpha">
                                            <feFuncA type="table" tableValues="1 0" />
                                        </feComponentTransfer>
                                        <feGaussianBlur
                                            in="innerAlpha"
                                            stdDeviation={innerShadow.blur / 2}
                                            result="innerBlur"
                                        />
                                        <feOffset
                                            dx={innerShadow.offsetX}
                                            dy={innerShadow.offsetY}
                                            in="innerBlur"
                                            result="innerOffset"
                                        />
                                        <feFlood floodColor={innerShadow.color} result="innerColor" />
                                        <feComposite
                                            in="innerColor"
                                            in2="innerOffset"
                                            operator="in"
                                            result="innerShadow"
                                        />
                                        <feComposite
                                            in="innerShadow"
                                            in2="SourceAlpha"
                                            operator="in"
                                            result="innerClipped"
                                        />
                                        <feMerge>
                                            <feMergeNode in="SourceGraphic" />
                                            <feMergeNode in="innerClipped" />
                                        </feMerge>
                                    </>
                                )}
                            </filter>
                        )}
                        {morphKeyframesCSS && (
                            <style>{morphKeyframesCSS}</style>
                        )}
                    </defs>

                    {/* Path 1: Top area — containerColor + effects (owning section) */}
                    <path
                        d={topPath}
                        fill={containerRef}
                        fillOpacity={blur ? blur.opacity : undefined}
                        filter={filterId ? `url(#${filterId})` : undefined}
                        style={topMorphAnim ? {
                            animation: `${topMorphAnim.animId} ${animationDuration ?? 4}s ease-in-out infinite`,
                        } : undefined}
                    />

                    {isDualPath ? (
                        <>
                            {/* Dual-path mode: Path A (upper edge) with d: path() morphing */}
                            <path
                                d={bottomPath}
                                fill={stroke && !stroke.fill ? 'none' : containerRef}
                                style={pathAAnimId ? {
                                    animation: `${pathAAnimId} ${animationDuration ?? 4}s ease-in-out infinite`,
                                } : undefined}
                            />
                            {/* Dual-path mode: Path B (lower edge) with d: path() morphing */}
                            <path
                                d={bottomPathB}
                                fill={stroke && !stroke.fill ? 'none' : fillRef}
                                style={pathBAnimId ? {
                                    animation: `${pathBAnimId} ${animationDuration ?? 4}s ease-in-out infinite`,
                                } : undefined}
                            />
                            {/* Separation stroke on both edges */}
                            {separation?.strokeColor && (
                                <>
                                    <path
                                        d={extractWaveContour(path)}
                                        fill="none"
                                        stroke={separation.strokeColor}
                                        strokeWidth={separation.strokeWidth ?? 1}
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d={extractWaveContour(pathB!)}
                                        fill="none"
                                        stroke={separation.strokeColor}
                                        strokeWidth={separation.strokeWidth ?? 1}
                                        strokeLinecap="round"
                                    />
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Single-path mode: Bottom area — fillColor, no effects */}
                            <path
                                d={bottomPath}
                                fill={stroke && !stroke.fill ? 'none' : fillRef}
                                style={pathAAnimId ? {
                                    animation: `${pathAAnimId} ${animationDuration ?? 4}s ease-in-out infinite`,
                                } : undefined}
                            />
                        </>
                    )}

                    {/* Stroke path (wave contour only — no baseline edges) */}
                    {stroke && strokePath && !isDualPath && (
                        <path
                            d={strokePath}
                            fill="none"
                            stroke={stroke.color}
                            strokeWidth={stroke.width}
                            strokeDasharray={stroke.dashArray}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}
                </svg>
            </div>
        </div>
    )
}
