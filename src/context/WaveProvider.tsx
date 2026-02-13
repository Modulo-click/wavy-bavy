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
    const [sections, setSections] = useState<SectionRegistration[]>([])
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

    // Register a section — returns unregister cleanup
    const register = useCallback(
        (id: string, config: Omit<SectionRegistration, 'order'>) => {
            const order = orderCounter.current++

            setSections((prev) => {
                // Avoid duplicates
                if (prev.some((s) => s.id === id)) return prev
                const next = [...prev, { ...config, order }]
                // Sort by order to maintain insertion sequence
                next.sort((a, b) => a.order - b.order)
                return next
            })

            // Cleanup
            return () => {
                setSections((prev) => prev.filter((s) => s.id !== id))
            }
        },
        [],
    )

    // Update a section's config (only triggers re-render if values actually changed)
    const update = useCallback((id: string, partial: Partial<SectionRegistration>) => {
        setSections((prev) => {
            let changed = false
            const next = prev.map((s) => {
                if (s.id !== id) return s
                // Check if any value actually differs (deep compare for plain objects)
                for (const key of Object.keys(partial) as (keyof SectionRegistration)[]) {
                    const oldVal = s[key]
                    const newVal = partial[key]
                    // Skip DOM element comparison (circular refs) — use reference equality
                    if (key === 'element') {
                        if (oldVal !== newVal) {
                            changed = true
                            return { ...s, ...partial }
                        }
                    } else if (typeof oldVal === 'object' && oldVal !== null && typeof newVal === 'object' && newVal !== null) {
                        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                            changed = true
                            return { ...s, ...partial }
                        }
                    } else if (oldVal !== newVal) {
                        changed = true
                        return { ...s, ...partial }
                    }
                }
                return s
            })
            return changed ? next : prev
        })
    }, [])

    // Ref-based lookups — avoids recreating callbacks on every sections change,
    // preventing unnecessary context-triggered re-renders of all consumers.
    const sectionsRef = useRef(sections)
    sectionsRef.current = sections

    const getSectionBefore = useCallback(
        (id: string): SectionRegistration | null => {
            const s = sectionsRef.current
            const idx = s.findIndex((sec) => sec.id === id)
            return idx > 0 ? s[idx - 1] : null
        },
        [],
    )

    const getSectionAfter = useCallback(
        (id: string): SectionRegistration | null => {
            const s = sectionsRef.current
            const idx = s.findIndex((sec) => sec.id === id)
            return idx >= 0 && idx < s.length - 1 ? s[idx + 1] : null
        },
        [],
    )

    const value = useMemo<WaveContextValue>(
        () => ({ sections, register, update, getSectionBefore, getSectionAfter, defaults, debug: debugEnabled }),
        [sections, register, update, getSectionBefore, getSectionAfter, defaults, debugEnabled],
    )

    return (
        <WaveContext.Provider value={value}>
            {debugEnabled && <WaveDebugOverlay sections={sections} />}
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
