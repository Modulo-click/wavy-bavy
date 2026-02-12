import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'
import { WaveProvider } from '../src/context/WaveProvider'
import { WaveSection } from '../src/components/WaveSection'
import { WaveRenderer } from '../src/components/WaveRenderer'
import { WaveLayer } from '../src/components/WaveLayer'
import { WaveSectionCSS } from '../src/components/WaveSectionCSS'
import { generatePath } from '../src/utils/path-generator'
import { DEFAULT_STROKE, DEFAULT_BLUR, DEFAULT_TEXTURE, DEFAULT_INNER_SHADOW } from '../src/constants'

// ============================================================
// WaveProvider
// ============================================================

describe('WaveProvider', () => {
    it('renders children', () => {
        render(
            <WaveProvider>
                <div data-testid="child">Hello</div>
            </WaveProvider>,
        )
        expect(screen.getByTestId('child')).toBeDefined()
    })

    it('shows debug overlay when debug=true', () => {
        render(
            <WaveProvider debug={true}>
                <div>Content</div>
            </WaveProvider>,
        )
        expect(screen.getByText(/wavy-bavy debug/)).toBeDefined()
    })

    it('hides debug overlay by default', () => {
        render(
            <WaveProvider>
                <div>Content</div>
            </WaveProvider>,
        )
        expect(screen.queryByText(/wavy-bavy debug/)).toBeNull()
    })
})

// ============================================================
// WaveSection (standalone — without WaveProvider)
// ============================================================

describe('WaveSection (standalone)', () => {
    it('renders children content', () => {
        render(
            <WaveSection background="#fff">
                <p data-testid="content">Hello Wave</p>
            </WaveSection>,
        )
        expect(screen.getByTestId('content').textContent).toBe('Hello Wave')
    })

    it('renders as <section> by default', () => {
        render(
            <WaveSection background="#fff">
                <p>Content</p>
            </WaveSection>,
        )
        const section = document.querySelector('section.wavy-bavy-section')
        expect(section).not.toBeNull()
    })

    it('applies custom className', () => {
        render(
            <WaveSection background="#fff" className="my-class">
                <p>Content</p>
            </WaveSection>,
        )
        const section = document.querySelector('.my-class')
        expect(section).not.toBeNull()
    })

    it('applies background color style', () => {
        render(
            <WaveSection background="#ff0000">
                <p>Red Section</p>
            </WaveSection>,
        )
        const section = document.querySelector('.wavy-bavy-section') as HTMLElement
        expect(section?.style.backgroundColor).toBe('rgb(255, 0, 0)')
    })

    it('applies aria-label', () => {
        render(
            <WaveSection background="#fff" aria-label="Hero Section">
                <p>Content</p>
            </WaveSection>,
        )
        expect(screen.getByLabelText('Hero Section')).toBeDefined()
    })

    it('does not render waves when standalone (no provider)', () => {
        render(
            <WaveSection background="#fff">
                <p>Standalone</p>
            </WaveSection>,
        )
        const waves = document.querySelectorAll('.wavy-bavy-wave')
        expect(waves.length).toBe(0)
    })

    it('applies gradient background', () => {
        render(
            <WaveSection background="linear-gradient(to right, #ff0000, #0000ff)">
                <p>Gradient</p>
            </WaveSection>,
        )
        const section = document.querySelector('.wavy-bavy-section') as HTMLElement
        expect(section?.style.background).toContain('linear-gradient')
    })
})

// ============================================================
// WaveRenderer
// ============================================================

describe('WaveRenderer', () => {
    const path = generatePath('smooth', { height: 120 })

    it('renders an SVG with the given path', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath).not.toBeNull()
        expect(svgPath?.getAttribute('d')).toBe(path)
        expect(svgPath?.getAttribute('fill')).toBe('#ff0000')
    })

    it('sets aria-hidden on the container', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
            />,
        )
        const container = document.querySelector('.wavy-bavy-wave')
        expect(container?.getAttribute('aria-hidden')).toBe('true')
    })

    it('sets role=presentation', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
            />,
        )
        const container = document.querySelector('.wavy-bavy-wave')
        expect(container?.getAttribute('role')).toBe('presentation')
    })

    it('applies rotation for up direction', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="up"
            />,
        )
        const container = document.querySelector('.wavy-bavy-wave') as HTMLElement
        expect(container?.style.transform).toBe('rotate(180deg)')
    })

    it('no rotation for down direction', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
            />,
        )
        const container = document.querySelector('.wavy-bavy-wave') as HTMLElement
        expect(container?.style.transform).toBe('')
    })

    it('sets container background color', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#00ff00"
                height={120}
                direction="down"
            />,
        )
        const container = document.querySelector('.wavy-bavy-wave') as HTMLElement
        expect(container?.style.backgroundColor).toBe('rgb(0, 255, 0)')
    })

    it('renders shadow filter when shadow is provided', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                shadow={{ color: 'rgba(0,0,0,0.1)', blur: 10, offsetX: 0, offsetY: 4 }}
            />,
        )
        const filter = document.querySelector('filter')
        expect(filter).not.toBeNull()
    })

    it('renders glow filter when glow is provided', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                glow={{ color: '#ff0000', intensity: 20, opacity: 0.5 }}
            />,
        )
        const filter = document.querySelector('filter')
        expect(filter).not.toBeNull()
    })

    it('does not render filter when no effects', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
            />,
        )
        const filter = document.querySelector('filter')
        expect(filter).toBeNull()
    })

    it('applies animationStyle', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                animationStyle={{ willChange: 'transform' }}
            />,
        )
        const container = document.querySelector('.wavy-bavy-wave') as HTMLElement
        expect(container?.style.willChange).toBe('transform')
    })
})

// ============================================================
// WaveLayer
// ============================================================

describe('WaveLayer', () => {
    it('renders single path via WaveRenderer when only 1 path', () => {
        const path = generatePath('smooth', { height: 120 })
        render(
            <WaveLayer
                paths={[path]}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                baseOpacity={0.3}
            />,
        )
        const waves = document.querySelectorAll('.wavy-bavy-wave')
        expect(waves.length).toBe(1)
    })

    it('renders multiple layers for multiple paths', () => {
        const paths = [
            generatePath('smooth', { height: 120 }),
            generatePath('smooth', { height: 120, amplitude: 0.4 }),
            generatePath('smooth', { height: 120, amplitude: 0.3 }),
        ]
        render(
            <WaveLayer
                paths={paths}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                baseOpacity={0.3}
            />,
        )
        const waves = document.querySelectorAll('.wavy-bavy-wave')
        expect(waves.length).toBe(3)
    })

    it('sets aria-hidden on the multi-layer container', () => {
        const paths = [
            generatePath('smooth', { height: 120 }),
            generatePath('smooth', { height: 120, amplitude: 0.4 }),
        ]
        render(
            <WaveLayer
                paths={paths}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                baseOpacity={0.3}
            />,
        )
        const container = document.querySelector('[aria-hidden="true"][role="presentation"]')
        expect(container).not.toBeNull()
    })
})

// ============================================================
// WaveRenderer — Stroke effects
// ============================================================

describe('WaveRenderer (stroke)', () => {
    const path = generatePath('smooth', { height: 120 })

    it('renders stroke attributes when stroke config provided', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                stroke={DEFAULT_STROKE}
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath?.getAttribute('stroke')).toBe(DEFAULT_STROKE.color)
        expect(svgPath?.getAttribute('stroke-width')).toBe(String(DEFAULT_STROKE.width))
    })

    it('removes fill when stroke.fill is false', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                stroke={{ ...DEFAULT_STROKE, fill: false }}
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath?.getAttribute('fill')).toBe('none')
    })

    it('keeps fill when stroke.fill is true', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                stroke={{ ...DEFAULT_STROKE, fill: true }}
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath?.getAttribute('fill')).toBe('#ff0000')
    })

    it('renders stroke-dasharray when provided', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                stroke={{ ...DEFAULT_STROKE, dashArray: '5 3' }}
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath?.getAttribute('stroke-dasharray')).toBe('5 3')
    })

    it('does not render stroke attributes when no stroke config', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath?.getAttribute('stroke')).toBeNull()
    })
})

// ============================================================
// WaveRenderer — Blur effects
// ============================================================

describe('WaveRenderer (blur)', () => {
    const path = generatePath('smooth', { height: 120 })

    it('applies backdrop-filter when blur config provided', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                blur={DEFAULT_BLUR}
            />,
        )
        const container = document.querySelector('.wavy-bavy-wave') as HTMLElement
        expect(container?.style.backdropFilter).toContain('blur(8px)')
    })

    it('sets fill-opacity on path when blur config provided', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                blur={DEFAULT_BLUR}
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath?.getAttribute('fill-opacity')).toBe(String(DEFAULT_BLUR.opacity))
    })
})

// ============================================================
// WaveRenderer — Texture effects
// ============================================================

describe('WaveRenderer (texture)', () => {
    const path = generatePath('smooth', { height: 120 })

    it('renders texture filter elements when texture config provided', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                texture={DEFAULT_TEXTURE}
            />,
        )
        const filter = document.querySelector('filter')
        expect(filter).not.toBeNull()
        // jsdom doesn't support querying SVG filter primitives by tag name,
        // so check innerHTML for feTurbulence and feDisplacementMap
        const filterHtml = filter?.innerHTML ?? ''
        expect(filterHtml).toContain('feTurbulence')
        expect(filterHtml).toContain('feDisplacementMap')
    })

    it('applies filter to path element for texture', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                texture={DEFAULT_TEXTURE}
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath?.getAttribute('filter')).toContain('url(#wave-filter-')
    })
})

// ============================================================
// WaveRenderer — Inner Shadow
// ============================================================

describe('WaveRenderer (innerShadow)', () => {
    const path = generatePath('smooth', { height: 120 })

    it('renders inner shadow filter elements', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                innerShadow={DEFAULT_INNER_SHADOW}
            />,
        )
        const filter = document.querySelector('filter')
        expect(filter).not.toBeNull()
        // jsdom doesn't support querying SVG filter primitives by tag name
        const filterHtml = filter?.innerHTML ?? ''
        expect(filterHtml).toContain('feComponentTransfer')
        expect(filterHtml).toContain('feGaussianBlur')
    })

    it('applies filter to path element for inner shadow', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                innerShadow={DEFAULT_INNER_SHADOW}
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath?.getAttribute('filter')).toContain('url(#wave-filter-')
    })
})

// ============================================================
// WaveRenderer — Lazy rendering
// ============================================================

describe('WaveRenderer (lazy)', () => {
    const path = generatePath('smooth', { height: 120 })

    it('renders placeholder (no SVG) when lazy and not visible', () => {
        // Mock IntersectionObserver to keep element NOT visible
        const originalIO = (globalThis as any).IntersectionObserver
        ;(globalThis as any).IntersectionObserver = class {
            observe = vi.fn()
            unobserve = vi.fn()
            disconnect = vi.fn()
            constructor() {}
        }

        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                lazy={true}
            />,
        )
        // Should render the container div but no SVG
        const container = document.querySelector('.wavy-bavy-wave')
        expect(container).not.toBeNull()
        const svg = document.querySelector('svg')
        expect(svg).toBeNull()

        ;(globalThis as any).IntersectionObserver = originalIO
    })

    it('renders SVG when not lazy', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                lazy={false}
            />,
        )
        const svg = document.querySelector('svg')
        expect(svg).not.toBeNull()
    })
})

// ============================================================
// WaveRenderer — Combined effects
// ============================================================

describe('WaveRenderer (combined effects)', () => {
    const path = generatePath('smooth', { height: 120 })

    it('renders filter with shadow + texture combined', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                shadow={{ color: 'rgba(0,0,0,0.1)', blur: 10, offsetX: 0, offsetY: 4 }}
                texture={DEFAULT_TEXTURE}
            />,
        )
        const filter = document.querySelector('filter')
        expect(filter).not.toBeNull()
        const filterHtml = filter?.innerHTML ?? ''
        expect(filterHtml).toContain('feDropShadow')
        expect(filterHtml).toContain('feTurbulence')
    })

    it('renders stroke + glow + innerShadow simultaneously', () => {
        render(
            <WaveRenderer
                path={path}
                fillColor="#ff0000"
                containerColor="#ffffff"
                height={120}
                direction="down"
                stroke={DEFAULT_STROKE}
                glow={{ color: '#ff0000', intensity: 20, opacity: 0.5 }}
                innerShadow={DEFAULT_INNER_SHADOW}
            />,
        )
        const svgPath = document.querySelector('path')
        expect(svgPath?.getAttribute('stroke')).toBe(DEFAULT_STROKE.color)
        const filter = document.querySelector('filter')
        const filterHtml = filter?.innerHTML ?? ''
        expect(filterHtml).toContain('feComponentTransfer')
    })
})

// ============================================================
// WaveSectionCSS
// ============================================================

describe('WaveSectionCSS', () => {
    it('renders children content', () => {
        render(
            <WaveSectionCSS background="#ffffff">
                <p data-testid="css-content">Hello CSS Wave</p>
            </WaveSectionCSS>,
        )
        expect(screen.getByTestId('css-content').textContent).toBe('Hello CSS Wave')
    })

    it('renders as <section> by default', () => {
        render(
            <WaveSectionCSS background="#ffffff">
                <p>Content</p>
            </WaveSectionCSS>,
        )
        const section = document.querySelector('section.wavy-bavy-section-css')
        expect(section).not.toBeNull()
    })

    it('applies clip-path polygon style', () => {
        render(
            <WaveSectionCSS background="#ffffff" pattern="smooth">
                <p>Content</p>
            </WaveSectionCSS>,
        )
        const section = document.querySelector('.wavy-bavy-section-css') as HTMLElement
        expect(section?.style.clipPath).toContain('polygon(')
    })

    it('applies background color', () => {
        render(
            <WaveSectionCSS background="#ff0000">
                <p>Red</p>
            </WaveSectionCSS>,
        )
        const section = document.querySelector('.wavy-bavy-section-css') as HTMLElement
        expect(section?.style.backgroundColor).toBe('rgb(255, 0, 0)')
    })

    it('applies gradient background', () => {
        render(
            <WaveSectionCSS background="linear-gradient(to right, red, blue)">
                <p>Gradient</p>
            </WaveSectionCSS>,
        )
        const section = document.querySelector('.wavy-bavy-section-css') as HTMLElement
        expect(section?.style.background).toContain('linear-gradient')
    })

    it('adds bottom padding for bottom wave position', () => {
        render(
            <WaveSectionCSS background="#ffffff" height={100} wavePosition="bottom">
                <p>Content</p>
            </WaveSectionCSS>,
        )
        const section = document.querySelector('.wavy-bavy-section-css') as HTMLElement
        expect(section?.style.paddingBottom).toBe('100px')
    })

    it('adds top padding for top wave position', () => {
        render(
            <WaveSectionCSS background="#ffffff" height={100} wavePosition="top">
                <p>Content</p>
            </WaveSectionCSS>,
        )
        const section = document.querySelector('.wavy-bavy-section-css') as HTMLElement
        expect(section?.style.paddingTop).toBe('100px')
    })

    it('applies aria-label', () => {
        render(
            <WaveSectionCSS background="#ffffff" aria-label="CSS Section">
                <p>Content</p>
            </WaveSectionCSS>,
        )
        expect(screen.getByLabelText('CSS Section')).toBeDefined()
    })

    it('accepts custom className', () => {
        render(
            <WaveSectionCSS background="#ffffff" className="my-css-wave">
                <p>Content</p>
            </WaveSectionCSS>,
        )
        const section = document.querySelector('.my-css-wave')
        expect(section).not.toBeNull()
    })
})
