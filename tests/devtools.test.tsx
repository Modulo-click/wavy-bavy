import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { WaveProvider } from '../src/context/WaveProvider'
import { useWaveContext } from '../src/context/useWaveContext'
import { WaveDebugPanel } from '../src/devtools/WaveDebugPanel'
import { WavePatternGallery } from '../src/devtools/WavePatternGallery'

// ============================================================
// WaveDebugPanel
// ============================================================

describe('WaveDebugPanel', () => {
    it('renders inside WaveProvider', () => {
        render(
            <WaveProvider debug>
                <WaveDebugPanel />
            </WaveProvider>,
        )
        expect(screen.getByTestId('wave-debug-panel')).toBeDefined()
    })

    it('throws when used outside WaveProvider', () => {
        expect(() => render(<WaveDebugPanel />)).toThrow()
    })

    it('shows "No sections registered" when no sections exist', () => {
        render(
            <WaveProvider debug>
                <WaveDebugPanel />
            </WaveProvider>,
        )
        const panel = screen.getByTestId('wave-debug-panel')
        expect(within(panel).getByText('No sections registered')).toBeDefined()
    })

    it('displays section count in header', () => {
        render(
            <WaveProvider debug>
                <WaveDebugPanel />
            </WaveProvider>,
        )
        const panel = screen.getByTestId('wave-debug-panel')
        expect(within(panel).getByText(/\(0\)/)).toBeDefined()
    })

    it('collapses and expands on header click', () => {
        render(
            <WaveProvider debug>
                <WaveDebugPanel />
            </WaveProvider>,
        )
        const panel = screen.getByTestId('wave-debug-panel')
        const header = within(panel).getByText('wavy-bavy debug')
        // Initially expanded — shows "No sections registered"
        expect(within(panel).getByText('No sections registered')).toBeDefined()

        // Click to collapse
        fireEvent.click(header)
        expect(within(panel).queryByText('No sections registered')).toBeNull()

        // Click to expand again
        fireEvent.click(header)
        expect(within(panel).getByText('No sections registered')).toBeDefined()
    })

    it('respects position config', () => {
        const { container } = render(
            <WaveProvider debug>
                <WaveDebugPanel config={{ position: 'bottom-left' }} />
            </WaveProvider>,
        )
        const panel = screen.getByTestId('wave-debug-panel')
        expect(panel.style.bottom).toBe('8px')
        expect(panel.style.left).toBe('8px')
    })

    it('defaults to top-right position', () => {
        render(
            <WaveProvider debug>
                <WaveDebugPanel />
            </WaveProvider>,
        )
        const panel = screen.getByTestId('wave-debug-panel')
        expect(panel.style.top).toBe('8px')
        expect(panel.style.right).toBe('8px')
    })
})

// ============================================================
// WavePatternGallery
// ============================================================

describe('WavePatternGallery', () => {
    it('renders the gallery container', () => {
        render(<WavePatternGallery />)
        expect(screen.getByTestId('wave-pattern-gallery')).toBeDefined()
    })

    it('renders all 4 built-in patterns', () => {
        render(<WavePatternGallery />)
        expect(screen.getByTestId('pattern-card-smooth')).toBeDefined()
        expect(screen.getByTestId('pattern-card-organic')).toBeDefined()
        expect(screen.getByTestId('pattern-card-sharp')).toBeDefined()
        expect(screen.getByTestId('pattern-card-mountain')).toBeDefined()
    })

    it('displays pattern names', () => {
        render(<WavePatternGallery />)
        expect(screen.getByText('smooth')).toBeDefined()
        expect(screen.getByText('organic')).toBeDefined()
        expect(screen.getByText('sharp')).toBeDefined()
        expect(screen.getByText('mountain')).toBeDefined()
    })

    it('calls onSelect when a pattern card is clicked', () => {
        const onSelect = vi.fn()
        render(<WavePatternGallery onSelect={onSelect} />)

        fireEvent.click(screen.getByTestId('pattern-card-smooth'))
        expect(onSelect).toHaveBeenCalledWith('smooth')

        fireEvent.click(screen.getByTestId('pattern-card-sharp'))
        expect(onSelect).toHaveBeenCalledWith('sharp')
    })

    it('renders SVGs with custom colors', () => {
        const { container } = render(
            <WavePatternGallery backgroundColor="#000" fillColor="#fff" />,
        )
        const rects = container.querySelectorAll('rect')
        expect(rects.length).toBe(7) // one per pattern (4 original + 3 new)
        rects.forEach((rect) => {
            expect(rect.getAttribute('fill')).toBe('#000')
        })
    })

    it('applies custom className', () => {
        render(<WavePatternGallery className="my-gallery" />)
        const gallery = screen.getByTestId('wave-pattern-gallery')
        expect(gallery.className).toContain('my-gallery')
    })
})

// ============================================================
// WaveProvider debug context
// ============================================================

describe('WaveProvider debug context', () => {
    it('exposes debug=true when debug prop is true', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WaveProvider debug>{children}</WaveProvider>
        )
        const { result } = renderHook(() => useWaveContext(), { wrapper })
        expect(result.current.debug).toBe(true)
    })

    it('exposes debug=false when debug prop is false', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WaveProvider>{children}</WaveProvider>
        )
        const { result } = renderHook(() => useWaveContext(), { wrapper })
        expect(result.current.debug).toBe(false)
    })

    it('exposes debug=true when debug prop is an object', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WaveProvider debug={{ position: 'bottom-left' }}>{children}</WaveProvider>
        )
        const { result } = renderHook(() => useWaveContext(), { wrapper })
        expect(result.current.debug).toBe(true)
    })
})
