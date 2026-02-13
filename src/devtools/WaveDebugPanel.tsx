'use client'

import { useState, useEffect } from 'react'
import type { DebugPanelConfig, DebugPanelPosition } from '../types'
import { useWaveContext } from '../context/useWaveContext'

const DEFAULT_DEBUG_CONFIG: DebugPanelConfig = {
    position: 'top-right',
    showBoundaries: true,
    showConfig: true,
    toggleShortcut: 'ctrl+shift+d',
}

const POSITION_STYLES: Record<DebugPanelPosition, React.CSSProperties> = {
    'top-right': { top: 8, right: 8 },
    'top-left': { top: 8, left: 8 },
    'bottom-right': { bottom: 8, right: 8 },
    'bottom-left': { bottom: 8, left: 8 },
}

/**
 * WaveDebugPanel — enhanced debug overlay for wavy-bavy.
 *
 * Shows registered sections with color swatches, pattern, amplitude,
 * frequency, animation state, and optional boundary outlines on the page.
 *
 * Must be used inside a `<WaveProvider>`.
 *
 * @example
 * ```tsx
 * import { WaveDebugPanel } from 'wavy-bavy/devtools'
 *
 * <WaveProvider debug>
 *   <WaveDebugPanel />
 *   {children}
 * </WaveProvider>
 * ```
 */
export function WaveDebugPanel({ config }: { config?: Partial<DebugPanelConfig> }) {
    const { sections } = useWaveContext()
    const [collapsed, setCollapsed] = useState(false)

    const resolved: DebugPanelConfig = { ...DEFAULT_DEBUG_CONFIG, ...config }
    const posStyle = POSITION_STYLES[resolved.position]

    // Boundary outlines on section elements
    useEffect(() => {
        if (!resolved.showBoundaries) return

        const cleanups: Array<() => void> = []
        for (const section of sections) {
            if (!section.element) continue
            const el = section.element
            const prev = el.style.outline
            const prevOffset = el.style.outlineOffset
            el.style.outline = '2px dashed rgba(108, 92, 231, 0.6)'
            el.style.outlineOffset = '-2px'
            cleanups.push(() => {
                el.style.outline = prev
                el.style.outlineOffset = prevOffset
            })
        }

        return () => cleanups.forEach((fn) => fn())
    }, [sections, resolved.showBoundaries])

    return (
        <div
            data-testid="wave-debug-panel"
            style={{
                position: 'fixed',
                ...posStyle,
                zIndex: 99999,
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#fff',
                padding: collapsed ? '8px 12px' : '12px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'monospace',
                maxWidth: 360,
                maxHeight: collapsed ? 'auto' : '70vh',
                overflowY: collapsed ? 'hidden' : 'auto',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(108, 92, 231, 0.3)',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: collapsed ? 0 : 8,
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
                onClick={() => setCollapsed(!collapsed)}
            >
                <span style={{ fontWeight: 700 }}>wavy-bavy debug</span>
                <span style={{ opacity: 0.5, marginLeft: 8 }}>
                    {collapsed ? '+' : '-'} ({sections.length})
                </span>
            </div>

            {/* Section list */}
            {!collapsed && (
                <div>
                    {sections.length === 0 && (
                        <div style={{ opacity: 0.5 }}>No sections registered</div>
                    )}
                    {sections.map((s, i) => (
                        <div
                            key={s.id}
                            style={{
                                padding: '6px 0',
                                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.1)' : undefined,
                            }}
                        >
                            {/* Row 1: index + color swatch + hex */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ opacity: 0.4, minWidth: 16 }}>{i}.</span>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: 12,
                                        height: 12,
                                        borderRadius: 3,
                                        backgroundColor: s.background.dominantColor,
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        flexShrink: 0,
                                    }}
                                />
                                <span>{s.background.dominantColor}</span>
                                <span style={{ opacity: 0.4, marginLeft: 'auto' }}>
                                    {s.wavePosition}
                                </span>
                            </div>

                            {/* Row 2: debug metadata (if available and showConfig is on) */}
                            {resolved.showConfig && s.debugMeta && (
                                <div
                                    style={{
                                        marginTop: 4,
                                        marginLeft: 22,
                                        opacity: 0.7,
                                        fontSize: 11,
                                        display: 'flex',
                                        gap: 8,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <span>{s.debugMeta.pattern}</span>
                                    <span>A:{s.debugMeta.amplitude}</span>
                                    <span>F:{s.debugMeta.frequency}</span>
                                    {s.debugMeta.animate && s.debugMeta.animate !== 'none' && (
                                        <span style={{ color: '#a29bfe' }}>
                                            {String(s.debugMeta.animate)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
