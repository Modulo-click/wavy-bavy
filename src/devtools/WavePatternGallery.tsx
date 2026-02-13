'use client'

import { useMemo } from 'react'
import type { PatternName } from '../types'
import { PATTERN_REGISTRY, DEFAULT_VIEWBOX_WIDTH } from '../constants'
import { generatePath } from '../utils/path-generator'

interface WavePatternGalleryProps {
    /** Background color for the preview SVGs. Default: '#ffffff' */
    backgroundColor?: string
    /** Fill color for the wave. Default: '#6c5ce7' */
    fillColor?: string
    /** Callback when a pattern is selected */
    onSelect?: (pattern: PatternName) => void
    /** Additional CSS class */
    className?: string
}

const PREVIEW_HEIGHT = 80

/**
 * WavePatternGallery — standalone pattern preview grid.
 *
 * Iterates the built-in pattern registry and renders mini SVG previews.
 * No context dependency — works anywhere.
 *
 * @example
 * ```tsx
 * import { WavePatternGallery } from 'wavy-bavy/devtools'
 *
 * <WavePatternGallery onSelect={(pattern) => setPattern(pattern)} />
 * ```
 */
export function WavePatternGallery({
    backgroundColor = '#ffffff',
    fillColor = '#6c5ce7',
    onSelect,
    className = '',
}: WavePatternGalleryProps) {
    const patterns = useMemo(() => Object.keys(PATTERN_REGISTRY) as PatternName[], [])

    return (
        <div
            data-testid="wave-pattern-gallery"
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16,
            }}
        >
            {patterns.map((name) => (
                <PatternCard
                    key={name}
                    name={name}
                    backgroundColor={backgroundColor}
                    fillColor={fillColor}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}

function PatternCard({
    name,
    backgroundColor,
    fillColor,
    onSelect,
}: {
    name: PatternName
    backgroundColor: string
    fillColor: string
    onSelect?: (pattern: PatternName) => void
}) {
    const path = useMemo(
        () =>
            generatePath(name, {
                width: DEFAULT_VIEWBOX_WIDTH,
                height: PREVIEW_HEIGHT,
                amplitude: 0.5,
                frequency: name === 'sharp' || name === 'mountain' ? 3 : 1,
            }),
        [name],
    )

    return (
        <div
            data-testid={`pattern-card-${name}`}
            onClick={() => onSelect?.(name)}
            style={{
                cursor: onSelect ? 'pointer' : 'default',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.1)',
                background: backgroundColor,
                transition: 'box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                    '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
            }}
        >
            <svg
                viewBox={`0 0 ${DEFAULT_VIEWBOX_WIDTH} ${PREVIEW_HEIGHT}`}
                preserveAspectRatio="none"
                style={{ width: '100%', height: PREVIEW_HEIGHT, display: 'block' }}
            >
                <rect width={DEFAULT_VIEWBOX_WIDTH} height={PREVIEW_HEIGHT} fill={backgroundColor} />
                <path d={path} fill={fillColor} />
            </svg>
            <div
                style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    textAlign: 'center',
                    color: '#333',
                }}
            >
                {name}
            </div>
        </div>
    )
}
