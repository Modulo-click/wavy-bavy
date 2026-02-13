'use client'

import { useMemo, type CSSProperties, type ReactNode, type ElementType } from 'react'
import type { PatternName } from '../types'
import { generatePath } from '../utils/path-generator'
import { generateClipPath } from '../utils/clip-path'

// ============================================================
// WaveSectionCSS — CSS-only wave component
// ============================================================

export interface WaveSectionCSSProps {
    /** Background color or gradient */
    background?: string
    /** Wave pattern. Default: 'smooth' */
    pattern?: PatternName
    /** Wave height in px. Default: 120 */
    height?: number
    /** Wave amplitude (0-1). Default: 0.5 */
    amplitude?: number
    /** Number of wave peaks. Default: 1 */
    frequency?: number
    /** Wave position. Default: 'bottom' */
    wavePosition?: 'top' | 'bottom' | 'both'
    // direction is intentionally omitted — CSS-only mode uses clip-path only
    /** HTML element type. Default: 'section' */
    as?: ElementType
    /** Additional CSS classes */
    className?: string
    /** Inline styles */
    style?: CSSProperties
    /** Accessible label */
    'aria-label'?: string
    children: ReactNode
}

/**
 * WaveSectionCSS — a lightweight, CSS-only wave section.
 *
 * Uses CSS `clip-path: polygon()` instead of SVG. No animation support,
 * no context registration, minimal JavaScript. Ideal for static pages
 * and SSR/SSG scenarios where bundle size matters.
 *
 * @example
 * ```tsx
 * <WaveSectionCSS background="#ffffff" pattern="smooth">
 *   <h1>Hero Section</h1>
 * </WaveSectionCSS>
 * ```
 */
export function WaveSectionCSS({
    background,
    pattern = 'smooth',
    height = 120,
    amplitude = 0.5,
    frequency = 1,
    wavePosition = 'bottom',
    as: Component = 'section',
    className = '',
    style,
    'aria-label': ariaLabel,
    children,
}: WaveSectionCSSProps) {
    const clipPath = useMemo(() => {
        const path = generatePath(pattern, { height, amplitude, frequency })

        if (wavePosition === 'both') {
            // For 'both', use bottom clip-path (CSS-only mode clips both ends via padding)
            return generateClipPath(path, height, 'bottom')
        }

        const position = wavePosition === 'top' ? 'top' : 'bottom'
        return generateClipPath(path, height, position)
    }, [pattern, height, amplitude, frequency, wavePosition])

    const sectionStyle: CSSProperties = {
        position: 'relative',
        ...(background && (
            background.includes('gradient')
                ? { background }
                : { backgroundColor: background }
        )),
        clipPath,
        // Padding prevents content from being clipped by the wave shape.
        // Negative margins collapse the transparent (clipped) area so
        // adjacent sections flow seamlessly behind the wave.
        ...(wavePosition === 'bottom' && { paddingBottom: height, marginBottom: -height }),
        ...(wavePosition === 'top' && { paddingTop: height, marginTop: -height }),
        ...(wavePosition === 'both' && { paddingTop: height, paddingBottom: height, marginTop: -height, marginBottom: -height }),
        ...style,
    }

    return (
        <Component
            className={`wavy-bavy-section-css ${className}`}
            style={sectionStyle}
            aria-label={ariaLabel}
        >
            {children}
        </Component>
    )
}
