'use client'

import { useMemo, useState } from 'react'
import type { WaveRendererProps } from '../types'
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
        .replace(/^M\s+0\s+[\d.]+/, `M 0 ${ext}`)
        .replace(/L\s+([\d.]+)\s+[\d.]+(\s*Z\s*)$/, `L $1 ${ext}$2`)
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
        .replace(/^M\s+0\s+[\d.]+/, 'M 0 -50')
        .replace(/L\s+([\d.]+)\s+[\d.]+(\s*Z\s*)$/, 'L $1 -50$2')
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
    className = '',
    animationStyle,
}: WaveRendererProps & { animationStyle?: CSSProperties }) {
    const viewBoxWidth = DEFAULT_VIEWBOX_WIDTH
    const isUp = direction === 'up'
    const [isHovered, setIsHovered] = useState(false)

    // Lazy rendering via IntersectionObserver
    const [intersectionRef, isVisible] = useIntersection({
        rootMargin: '100px',
        once: true,
    })

    // Build SVG filter for shadow/glow/texture/innerShadow effects
    const hasFilter = !!shadow || !!glow || !!texture || !!innerShadow
    const filterId = hasFilter ? `wave-filter-${Math.random().toString(36).slice(2, 8)}` : undefined

    // Extract wave contour for stroke (excludes baseline edges)
    const strokePath = useMemo(
        () => (stroke ? extractWaveContour(path) : undefined),
        [path, !!stroke],
    )

    // Top area path: covers above the wave curve, gets effects
    const topPath = useMemo(() => invertPathToTop(path), [path])

    // Bottom area path: covers below the wave curve, no effects
    const bottomPath = useMemo(() => extendPathBelow(path, height), [path, height])

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
                    viewBox={`0 ${parallaxY} ${viewBoxWidth} ${height}`}
                    preserveAspectRatio="none"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Filters */}
                    {hasFilter && (
                        <defs>
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
                        </defs>
                    )}

                    {/* Path 1: Top area — containerColor + effects (owning section) */}
                    <path
                        d={topPath}
                        fill={containerColor}
                        fillOpacity={blur ? blur.opacity : undefined}
                        filter={filterId ? `url(#${filterId})` : undefined}
                    />

                    {/* Path 2: Bottom area — fillColor, no effects (adjacent section) */}
                    <path
                        d={bottomPath}
                        fill={stroke && !stroke.fill ? 'none' : fillColor}
                    />

                    {/* Stroke path (wave contour only — no baseline edges) */}
                    {stroke && strokePath && (
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
