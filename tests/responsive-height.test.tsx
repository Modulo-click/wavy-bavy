import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { WaveProvider } from '../src/context/WaveProvider'
import { WaveSection } from '../src/components/WaveSection'

describe('Responsive Height', () => {
    it('renders with numeric height (no responsive CSS)', () => {
        const { container } = render(
            <WaveProvider>
                <WaveSection background="#ffffff" height={120}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )
        // No <style> tag should be injected for responsive heights
        const styles = container.querySelectorAll('style')
        const responsiveStyles = Array.from(styles).filter(s => s.textContent?.includes('wavy-bavy-rh'))
        expect(responsiveStyles.length).toBe(0)
    })

    it('injects responsive CSS when height is an object', () => {
        const { container } = render(
            <WaveProvider>
                <WaveSection background="#ffffff" height={{ sm: 80, md: 120, lg: 180 }}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )
        const styles = container.querySelectorAll('style')
        const responsiveStyles = Array.from(styles).filter(s => s.textContent?.includes('wavy-bavy-rh'))
        expect(responsiveStyles.length).toBeGreaterThan(0)
    })

    it('generates media queries for each breakpoint', () => {
        const { container } = render(
            <WaveProvider>
                <WaveSection background="#ffffff" height={{ sm: 80, md: 120, lg: 180 }}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )
        const styles = container.querySelectorAll('style')
        const css = Array.from(styles).map(s => s.textContent).join('')
        // Should contain media queries for sm (640), md (768), lg (1024)
        expect(css).toContain('min-width: 640px')
        expect(css).toContain('min-width: 768px')
        expect(css).toContain('min-width: 1024px')
        expect(css).toContain('80px')
        expect(css).toContain('120px')
        expect(css).toContain('180px')
    })

    it('uses max height for SVG path generation', () => {
        const { container } = render(
            <WaveProvider>
                <WaveSection background="#ffffff" height={{ sm: 60, lg: 200 }}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )
        // The SVG viewBox should use the max height (200)
        const svg = container.querySelector('svg')
        if (svg) {
            const viewBox = svg.getAttribute('viewBox')
            expect(viewBox).toContain('200')
        }
    })

    it('adds responsive class to wave container', () => {
        const { container } = render(
            <WaveProvider>
                <WaveSection background="#ffffff" height={{ sm: 80, md: 120 }}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )
        const waveElements = container.querySelectorAll('.wavy-bavy-wave')
        const hasResponsiveClass = Array.from(waveElements).some(el =>
            Array.from(el.classList).some(c => c.startsWith('wavy-bavy-rh'))
        )
        expect(hasResponsiveClass).toBe(true)
    })
})
