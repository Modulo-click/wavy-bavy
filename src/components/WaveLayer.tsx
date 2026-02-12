'use client'

import { WaveRenderer } from './WaveRenderer'

/**
 * WaveLayer — renders multiple stacked wave layers with decreasing opacity.
 *
 * Used when `layers > 1` to create a layered, depth effect.
 */
interface WaveLayerProps {
    paths: string[]
    fillColor: string
    containerColor: string
    height: number
    direction: 'up' | 'down'
    baseOpacity: number
}

export function WaveLayer({
    paths,
    fillColor,
    containerColor,
    height,
    direction,
    baseOpacity,
}: WaveLayerProps) {
    if (paths.length <= 1) {
        return (
            <WaveRenderer
                path={paths[0] || ''}
                fillColor={fillColor}
                containerColor={containerColor}
                height={height}
                direction={direction}
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
                        />
                    </div>
                )
            })}
        </div>
    )
}
