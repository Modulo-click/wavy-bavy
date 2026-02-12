import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { WaveProvider } from '../src/context/WaveProvider'
import { useWaveContext, useOptionalWaveContext } from '../src/context/useWaveContext'

describe('useWaveContext', () => {
    it('throws when used outside WaveProvider', () => {
        expect(() => {
            renderHook(() => useWaveContext())
        }).toThrow('[wavy-bavy] useWaveContext must be used inside a <WaveProvider>')
    })

    it('returns context value inside WaveProvider', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WaveProvider>{children}</WaveProvider>
        )

        const { result } = renderHook(() => useWaveContext(), { wrapper })
        expect(result.current).toBeDefined()
        expect(result.current.sections).toEqual([])
        expect(typeof result.current.register).toBe('function')
        expect(typeof result.current.update).toBe('function')
        expect(typeof result.current.getSectionBefore).toBe('function')
        expect(typeof result.current.getSectionAfter).toBe('function')
    })

    it('provides default values', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WaveProvider>{children}</WaveProvider>
        )

        const { result } = renderHook(() => useWaveContext(), { wrapper })
        expect(result.current.defaults.height).toBe(120)
        expect(result.current.defaults.pattern).toBe('smooth')
        expect(result.current.defaults.animate).toBe('none')
    })

    it('merges custom defaults', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WaveProvider defaults={{ height: 200, pattern: 'organic' }}>
                {children}
            </WaveProvider>
        )

        const { result } = renderHook(() => useWaveContext(), { wrapper })
        expect(result.current.defaults.height).toBe(200)
        expect(result.current.defaults.pattern).toBe('organic')
        // Other defaults preserved
        expect(result.current.defaults.amplitude).toBe(0.5)
    })
})

describe('useOptionalWaveContext', () => {
    it('returns null outside WaveProvider', () => {
        const { result } = renderHook(() => useOptionalWaveContext())
        expect(result.current).toBeNull()
    })

    it('returns context inside WaveProvider', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WaveProvider>{children}</WaveProvider>
        )

        const { result } = renderHook(() => useOptionalWaveContext(), { wrapper })
        expect(result.current).not.toBeNull()
        expect(result.current?.sections).toEqual([])
    })
})
