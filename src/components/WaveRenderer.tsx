'use client'

import type { WaveRendererProps } from '../types'
import { DEFAULT_VIEWBOX_WIDTH } from '../constants'
import type { CSSProperties } from 'react'
import { useIntersection } from '../utils/use-intersection'

/**
 * WaveRenderer — low-level SVG wave renderer.
 *
 * Renders a single wave as an SVG element with configurable
 * fill color, container color, shadow, glow, stroke, blur, texture,
 * inner shadow, and animation.
 *
 * This is an internal component. Use `<WaveSection>` for the public API.
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
    className = '',
    animationStyle,
}: WaveRendererProps & { animationStyle?: CSSProperties }) {
    const viewBoxWidth = DEFAULT_VIEWBOX_WIDTH
    const isUp = direction === 'up'

    // Lazy rendering via IntersectionObserver
    const [intersectionRef, isVisible] = useIntersection({
        rootMargin: '100px',
        once: true,
    })

    // Build SVG filter for shadow/glow/texture/innerShadow effects
    const hasFilter = !!shadow || !!glow || !!texture || !!innerShadow
    const filterId = hasFilter ? `wave-filter-${Math.random().toString(36).slice(2, 8)}` : undefined

    // Container styles
    const containerStyle: CSSProperties = {
        width: '100%',
        height,
        overflow: 'hidden',
        lineHeight: 0,
        fontSize: 0,
        backgroundColor: containerColor,
        transform: isUp ? 'rotate(180deg)' : undefined,
        ...animationStyle,
    }

    // Blur: apply backdrop-filter on the container
    if (blur) {
        containerStyle.backdropFilter = `blur(${blur.radius}px) saturate(${blur.saturation})`
        containerStyle.WebkitBackdropFilter = `blur(${blur.radius}px) saturate(${blur.saturation})`
    }

    // Lazy: render placeholder until visible
    if (lazy && !isVisible) {
        return (
            <div
                ref={intersectionRef}
                className={`wavy-bavy-wave ${className}`}
                style={containerStyle}
                aria-hidden="true"
                role="presentation"
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
        >
            <svg
                viewBox={`0 0 ${viewBoxWidth} ${height}`}
                preserveAspectRatio="none"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                }}
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
                                        floodColor={glow.color === 'currentColor' ? fillColor : glow.color}
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
                                    {/* Inner shadow: invert alpha, blur, offset, composite back */}
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

                {/* Wave Path */}
                <path
                    d={path}
                    fill={stroke && !stroke.fill ? 'none' : fillColor}
                    fillOpacity={blur ? blur.opacity : undefined}
                    filter={filterId ? `url(#${filterId})` : undefined}
                    stroke={stroke ? stroke.color : undefined}
                    strokeWidth={stroke ? stroke.width : undefined}
                    strokeDasharray={stroke?.dashArray}
                />
            </svg>
        </div>
    )
}
