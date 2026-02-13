import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { WaveProvider } from '../src/context/WaveProvider'
import { WaveSection } from '../src/components/WaveSection'
import { generatePath } from '../src/utils/path-generator'

describe('Prop Validation', () => {
    it('warns when amplitude is out of range', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        render(
            <WaveProvider>
                <WaveSection background="#ffffff" amplitude={1.5}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )

        expect(spy).toHaveBeenCalledWith(
            expect.stringContaining('amplitude 1.5 is outside valid range')
        )
        spy.mockRestore()
    })

    it('warns when amplitude is negative', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        render(
            <WaveProvider>
                <WaveSection background="#ffffff" amplitude={-0.5}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )

        expect(spy).toHaveBeenCalledWith(
            expect.stringContaining('amplitude -0.5 is outside valid range')
        )
        spy.mockRestore()
    })

    it('clamps amplitude to valid range', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const { container } = render(
            <WaveProvider>
                <WaveSection background="#ffffff" amplitude={2.0}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )

        // Should still render without errors
        expect(container.querySelector('.wavy-bavy-section')).toBeTruthy()
        spy.mockRestore()
    })

    it('warns when frequency is out of range', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        render(
            <WaveProvider>
                <WaveSection background="#ffffff" frequency={25}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )

        expect(spy).toHaveBeenCalledWith(
            expect.stringContaining('frequency 25 is outside valid range')
        )
        spy.mockRestore()
    })

    it('does not warn for valid amplitude and frequency', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        render(
            <WaveProvider>
                <WaveSection background="#ffffff" amplitude={0.5} frequency={2}>
                    <p>Section 1</p>
                </WaveSection>
                <WaveSection background="#f5f5f5">
                    <p>Section 2</p>
                </WaveSection>
            </WaveProvider>
        )

        const amplitudeWarnings = spy.mock.calls.filter(call =>
            typeof call[0] === 'string' && call[0].includes('amplitude')
        )
        const frequencyWarnings = spy.mock.calls.filter(call =>
            typeof call[0] === 'string' && call[0].includes('frequency')
        )
        expect(amplitudeWarnings.length).toBe(0)
        expect(frequencyWarnings.length).toBe(0)
        spy.mockRestore()
    })
})

describe('Error Messages', () => {
    it('path-generator warns with available patterns for unknown pattern', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        generatePath('nonexistent' as any, { height: 120, amplitude: 0.5 })

        expect(spy).toHaveBeenCalledWith(
            expect.stringContaining('Available patterns:')
        )
        spy.mockRestore()
    })
})
