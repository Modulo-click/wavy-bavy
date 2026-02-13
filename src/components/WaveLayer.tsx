'use client'

import type { HoverConfig } from '../types'
import { WaveRenderer } from './WaveRenderer'

/**
 * WaveLayer — renders multiple stacked wave layers with decreasing opacity.
 *
 * Used when `layers > 1` to create a layered, depth effect.
 * When parallax is active, each layer gets a slightly different speed for depth.
 */
interface WaveLayerProps {
    paths: string[]
    fillColor: string
    containerColor: string
    height: number
    direction: 'up' | 'down'
    baseOpacity: number
    /** Parallax speed for the base layer (0 = static, 1 = full scroll). Each subsequent layer gets speed * (1 + index * 0.15) */
    parallaxSpeed?: number
    /** Scroll progress (0-1) for parallax calculations */
    scrollProgress?: number
    /** Parallax direction */
    parallaxDirection?: 'vertical' | 'horizontal'
    /** Hover config to pass through to WaveRenderer */
    hover?: HoverConfig
}

export function WaveLayer({
    paths,
    fillColor,
    containerColor,
    height,
    direction,
    baseOpacity,
    parallaxSpeed,
    scrollProgress = 0,
    parallaxDirection = 'vertical',
    hover,
}: WaveLayerProps) {
    if (paths.length <= 1) {
        const offset = computeParallaxOffset(parallaxSpeed, scrollProgress, parallaxDirection, 0)
        return (
            <WaveRenderer
                path={paths[0] || ''}
                fillColor={fillColor}
                containerColor={containerColor}
                height={height}
                direction={direction}
                hover={hover}
                parallaxOffset={offset}
            />
        )
    }

    return (
        <div
            style={{ position: 'relative', width: '100%', height }}
            aria-hidden="true"
            role="presentation"
        >
            {paths.map((path, i) => {
                const isBase = i === 0
                const opacity = isBase ? 1 : baseOpacity * (1 - i * 0.2)
                const offset = computeParallaxOffset(parallaxSpeed, scrollProgress, parallaxDirection, i)

                return (
                    <div
                        key={i}
                        style={{
                            position: isBase ? 'relative' : 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: isBase ? 1 : opacity,
                        }}
                    >
                        <WaveRenderer
                            path={path}
                            fillColor={fillColor}
                            containerColor={isBase ? containerColor : 'transparent'}
                            height={height}
                            direction={direction}
                            hover={hover}
                            parallaxOffset={offset}
                        />
                    </div>
                )
            })}
        </div>
    )
}

function computeParallaxOffset(
    speed: number | undefined,
    progress: number,
    direction: 'vertical' | 'horizontal',
    layerIndex: number,
): { x: number; y: number } | undefined {
    if (speed === undefined || speed === 0) return undefined

    const layerSpeed = speed * (1 + layerIndex * 0.15)
    // Center the parallax around 0.5 progress so it moves in both directions
    const offset = (progress - 0.5) * layerSpeed * 100

    if (direction === 'horizontal') {
        return { x: offset, y: 0 }
    }
    return { x: 0, y: offset }
}
