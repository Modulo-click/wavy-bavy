'use client'

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import type { WaveContextValue, WaveDefaults, SectionRegistration, WaveProviderProps, DebugPanelConfig } from '../types'
import { DEFAULTS } from '../constants'

// ============================================================
// Context
// ============================================================

export const WaveContext = createContext<WaveContextValue | null>(null)
WaveContext.displayName = 'WaveContext'

// ============================================================
// Provider
// ============================================================

/**
 * WaveProvider — wraps your page layout and tracks all WaveSections.
 *
 * Provides automatic section ordering, adjacent section detection,
 * and global default configuration.
 *
 * @example
 * ```tsx
 * <WaveProvider defaults={{ height: 150, pattern: 'organic' }}>
 *   <WaveSection background="#fff">...</WaveSection>
 *   <WaveSection background="#f5f5f5">...</WaveSection>
 * </WaveProvider>
 * ```
 */
export function WaveProvider({ defaults: userDefaults, debug: debugProp = false, children }: WaveProviderProps) {
    // Store sections in a ref to avoid re-renders on every registration
    // This breaks the infinite loop cycle
    const sectionsRef = useRef<SectionRegistration[]>([])
    const [version, setVersion] = useState(0) // Used to trigger updates
    const orderCounter = useRef(0)

    // Resolve debug config
    const debugConfig: Partial<DebugPanelConfig> | undefined =
        typeof debugProp === 'object' ? debugProp : undefined
    const [debugEnabled, setDebugEnabled] = useState(!!debugProp)

    // Keyboard shortcut toggle
    const shortcut = debugConfig?.toggleShortcut ?? 'ctrl+shift+d'
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const parts = shortcut.toLowerCase().split('+')
            const key = parts[parts.length - 1]
            const needCtrl = parts.includes('ctrl')
            const needShift = parts.includes('shift')
            const needAlt = parts.includes('alt')

            if (
                e.key.toLowerCase() === key &&
                e.ctrlKey === needCtrl &&
                e.shiftKey === needShift &&
                e.altKey === needAlt
            ) {
                e.preventDefault()
                setDebugEnabled((prev) => !prev)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [shortcut])

    const defaults = useMemo<WaveDefaults>(
        () => ({ ...DEFAULTS, ...userDefaults }),
        [userDefaults],
    )

    // Helper to force update
    const bumpVersion = useCallback(() => setVersion((v) => v + 1), [])

    // Register a section — returns unregister cleanup
    const register = useCallback(
        (id: string, config: Omit<SectionRegistration, 'order'>) => {
            const order = orderCounter.current++

            // Check if already registered to avoid unnecessary work
            const existing = sectionsRef.current.find(s => s.id === id)
            if (existing) return () => { }

            const newSection = { ...config, order }
            sectionsRef.current = [...sectionsRef.current, newSection].sort((a, b) => a.order - b.order)

            // Trigger update so other components know about the new section
            bumpVersion()

            // Cleanup
            return () => {
                sectionsRef.current = sectionsRef.current.filter((s) => s.id !== id)
                bumpVersion()
            }
        },
        [bumpVersion],
    )

    // Update a section's config
    const update = useCallback((id: string, partial: Partial<SectionRegistration>) => {
        const index = sectionsRef.current.findIndex((s) => s.id === id)
        if (index === -1) return

        const current = sectionsRef.current[index]
        // Shallow comparison to avoid unnecessary updates
        const hasChanges = Object.entries(partial).some(([key, val]) => current[key as keyof SectionRegistration] !== val)

        if (!hasChanges) return

        const updated = { ...current, ...partial }
        const newSections = [...sectionsRef.current]
        newSections[index] = updated
        sectionsRef.current = newSections

        // Only trigger re-render if visual properties changed that might affect neighbors
        if (partial.background || partial.wavePosition) {
            bumpVersion()
        }
    }, [bumpVersion])

    // Get the section immediately before a given ID
    const getSectionBefore = useCallback(
        (id: string): SectionRegistration | null => {
            const idx = sectionsRef.current.findIndex((s) => s.id === id)
            return idx > 0 ? sectionsRef.current[idx - 1] : null
        },
        [], // Stable! No dependencies on state
    )

    // Get the section immediately after a given ID
    const getSectionAfter = useCallback(
        (id: string): SectionRegistration | null => {
            const idx = sectionsRef.current.findIndex((s) => s.id === id)
            return idx >= 0 && idx < sectionsRef.current.length - 1 ? sectionsRef.current[idx + 1] : null
        },
        [], // Stable! No dependencies on state
    )

    const value = useMemo<WaveContextValue>(
        () => ({
            sections: sectionsRef.current,
            register,
            update,
            getSectionBefore,
            getSectionAfter,
            defaults,
            debug: debugEnabled
        }),
        [version, register, update, getSectionBefore, getSectionAfter, defaults, debugEnabled],
    )

    return (
        <WaveContext.Provider value={value}>
            {debugEnabled && <WaveDebugOverlay sections={sectionsRef.current} />}
            {children}
        </WaveContext.Provider>
    )
}

// ============================================================
// Debug Overlay (dev only)
// ============================================================

function WaveDebugOverlay({ sections }: { sections: SectionRegistration[] }) {
    return (
        <div
            style={{
                position: 'fixed',
                top: 8,
                right: 8,
                zIndex: 99999,
                background: 'rgba(0,0,0,0.85)',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'monospace',
                maxWidth: 300,
                pointerEvents: 'none',
            }}
        >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>🌊 wavy-bavy debug</div>
            {sections.length === 0 && <div style={{ opacity: 0.6 }}>No sections registered</div>}
            {sections.map((s, i) => (
                <div key={s.id} style={{ marginBottom: 4 }}>
                    <span style={{ opacity: 0.5 }}>{i}.</span>{' '}
                    <span
                        style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: s.background.dominantColor,
                            border: '1px solid rgba(255,255,255,0.3)',
                            marginRight: 4,
                            verticalAlign: 'middle',
                        }}
                    />
                    <span>{s.background.dominantColor}</span>
                    <span style={{ opacity: 0.4, marginLeft: 6 }}>{s.wavePosition}</span>
                </div>
            ))}
        </div>
    )
}
