import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { WaveRenderer } from '../src/components/WaveRenderer'
import { generatePath } from '../src/utils/path-generator'
import type { GradientConfig } from '../src/types'

describe('Gradient Fill Support', () => {
    const basePath = generatePath('smooth', { height: 120, amplitude: 0.5, frequency: 1 })

    const linearGradient: GradientConfig = {
        type: 'linear',
        angle: 90,
        stops: [
            { color: '#6c5ce7', offset: 0 },
            { color: '#a29bfe', offset: 1 },
        ],
    }

    const radialGradient: GradientConfig = {
        type: 'radial',
        stops: [
            { color: '#ff0000', offset: 0 },
            { color: '#0000ff', offset: 0.5 },
            { color: '#00ff00', offset: 1 },
        ],
    }

    it('renders SVG gradient defs when fillGradient is provided', () => {
        const { container } = render(
            <WaveRenderer
                path={basePath}
                fillColor="#ffffff"
                containerColor="#000000"
                fillGradient={linearGradient}
                height={120}
                direction="down"
            />
        )
        const svg = container.querySelector('svg')
        const html = svg?.innerHTML ?? ''
        // jsdom may not parse SVG gradient elements via querySelector,
        // so check the raw markup for gradient definition
        expect(html).toContain('stop-color')
        expect(html).toContain('#6c5ce7')
        expect(html).toContain('#a29bfe')
    })

    it('renders radialGradient when containerGradient is radial', () => {
        const { container } = render(
            <WaveRenderer
                path={basePath}
                fillColor="#ffffff"
                containerColor="#000000"
                containerGradient={radialGradient}
                height={120}
                direction="down"
            />
        )
        const svg = container.querySelector('svg')
        const html = svg?.innerHTML ?? ''
        expect(html).toContain('#ff0000')
        expect(html).toContain('#0000ff')
        expect(html).toContain('#00ff00')
    })

    it('uses gradient URL as fill reference on path elements', () => {
        const { container } = render(
            <WaveRenderer
                path={basePath}
                fillColor="#ffffff"
                containerColor="#000000"
                fillGradient={linearGradient}
                height={120}
                direction="down"
            />
        )
        const paths = container.querySelectorAll('path')
        // At least one path should reference the gradient via url(#...)
        const hasGradientFill = Array.from(paths).some(p =>
            p.getAttribute('fill')?.startsWith('url(#')
        )
        expect(hasGradientFill).toBe(true)
    })

    it('renders both fillGradient and containerGradient simultaneously', () => {
        const { container } = render(
            <WaveRenderer
                path={basePath}
                fillColor="#ffffff"
                containerColor="#000000"
                fillGradient={linearGradient}
                containerGradient={radialGradient}
                height={120}
                direction="down"
            />
        )
        const svg = container.querySelector('svg')
        const html = svg?.innerHTML ?? ''
        // Both gradients should be present
        expect(html).toContain('#6c5ce7')  // from fillGradient
        expect(html).toContain('#ff0000')  // from containerGradient
    })

    it('falls back to solid color when no gradient is provided', () => {
        const { container } = render(
            <WaveRenderer
                path={basePath}
                fillColor="#ffffff"
                containerColor="#000000"
                height={120}
                direction="down"
            />
        )
        const svg = container.querySelector('svg')
        const html = svg?.innerHTML ?? ''
        // Should not contain gradient-related markup
        expect(html).not.toContain('stop-color')
    })

    it('uses stable gradient IDs across re-renders', () => {
        const { container, rerender } = render(
            <WaveRenderer
                path={basePath}
                fillColor="#ffffff"
                containerColor="#000000"
                fillGradient={linearGradient}
                height={120}
                direction="down"
            />
        )
        const svg1 = container.querySelector('svg')
        const html1 = svg1?.innerHTML ?? ''
        // Extract gradient ID from url(#...) fill reference
        const match1 = html1.match(/url\(#([^)]+)\)/)

        rerender(
            <WaveRenderer
                path={basePath}
                fillColor="#ffffff"
                containerColor="#000000"
                fillGradient={linearGradient}
                height={120}
                direction="down"
            />
        )
        const svg2 = container.querySelector('svg')
        const html2 = svg2?.innerHTML ?? ''
        const match2 = html2.match(/url\(#([^)]+)\)/)

        expect(match1?.[1]).toBeTruthy()
        expect(match1?.[1]).toBe(match2?.[1])
    })

    it('renders linear gradient stop offsets correctly', () => {
        const { container } = render(
            <WaveRenderer
                path={basePath}
                fillColor="#ffffff"
                containerColor="#000000"
                fillGradient={linearGradient}
                height={120}
                direction="down"
            />
        )
        const svg = container.querySelector('svg')
        const html = svg?.innerHTML ?? ''
        expect(html).toContain('offset="0%"')
        expect(html).toContain('offset="100%"')
    })
})
