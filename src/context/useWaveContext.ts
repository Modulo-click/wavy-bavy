'use client'

import { useContext } from 'react'
import { WaveContext } from './WaveProvider'
import type { WaveContextValue } from '../types'

/**
 * Hook to access the WaveProvider context.
 * Must be used inside a <WaveProvider>.
 *
 * @example
 * ```tsx
 * const { defaults, getSectionBefore } = useWaveContext()
 * ```
 */
export function useWaveContext(): WaveContextValue {
    const ctx = useContext(WaveContext)
    if (!ctx) {
        throw new Error(
            '[wavy-bavy] useWaveContext must be used inside a <WaveProvider>. ' +
            'Wrap your layout with <WaveProvider> to enable automatic wave transitions.',
        )
    }
    return ctx
}

/**
 * Optional hook — returns null instead of throwing when outside a provider.
 * Useful for components that should work with or without a provider.
 */
export function useOptionalWaveContext(): WaveContextValue | null {
    return useContext(WaveContext)
}
