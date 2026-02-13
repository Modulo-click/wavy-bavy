import { useState } from 'react'
import { WaveDebugPanel, WavePatternGallery, exportWaveAsSVG, generateClipPathCSS, resolvePreset, getAllPresets } from 'wavy-bavy/devtools'
import type { PatternName } from 'wavy-bavy'

export default function DevToolsDemo() {
    const [selectedPattern, setSelectedPattern] = useState<PatternName>('smooth')
    const [exportLog, setExportLog] = useState<string[]>([])

    const addLog = (msg: string) => {
        setExportLog((prev) => [...prev.slice(-4), msg])
    }

    const handleExportSVG = () => {
        const svg = exportWaveAsSVG({ pattern: selectedPattern, fillColor: '#6c5ce7' })
        addLog(`SVG exported (${svg.length} chars, pattern: ${selectedPattern})`)
        // In a real app you'd call downloadSVG(svg) here
    }

    const handleCopyClipPath = () => {
        const css = generateClipPathCSS({ pattern: selectedPattern })
        navigator.clipboard.writeText(css).then(
            () => addLog(`Clip-path copied (pattern: ${selectedPattern})`),
            () => addLog('Failed to copy to clipboard'),
        )
    }

    const handleShowPresets = () => {
        const all = getAllPresets()
        addLog(`${Object.keys(all).length} presets: ${Object.keys(all).join(', ')}`)
    }

    const handleResolvePreset = (name: string) => {
        const resolved = resolvePreset(name)
        if (resolved) {
            addLog(`${name}: ${resolved.pattern}, h:${resolved.height}, A:${resolved.amplitude}`)
        }
    }

    return (
        <>
            {/* Debug panel (opt-in from devtools) */}
            <WaveDebugPanel config={{ position: 'top-right', showBoundaries: true }} />

            {/* ── Pattern Gallery ── */}
            <div className="section-content">
                <div className="badge" style={{ background: '#e8e4ff', color: '#6c5ce7' }}>
                    Phase 5 DevTools
                </div>
                <h2>Pattern Gallery</h2>
                <p>
                    Click a pattern to select it. The selected pattern is used for export demos below.
                </p>
                <p style={{ opacity: 0.6, fontSize: 14 }}>
                    Selected: <code>{selectedPattern}</code>
                </p>
                <WavePatternGallery
                    onSelect={(p) => setSelectedPattern(p)}
                    fillColor="#6c5ce7"
                    backgroundColor="#f8f9fa"
                />
            </div>

            {/* ── Export Demos ── */}
            <div className="section-content" style={{ marginTop: 32 }}>
                <h2>Export Utilities</h2>
                <p>
                    Generate SVGs, copy clip-paths, and inspect presets -- all from the
                    <code> wavy-bavy/devtools</code> entry point.
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                    <button className="demo-button" onClick={handleExportSVG}>
                        Export SVG
                    </button>
                    <button className="demo-button" onClick={handleCopyClipPath}>
                        Copy Clip-Path CSS
                    </button>
                    <button className="demo-button" onClick={handleShowPresets}>
                        List Presets
                    </button>
                    <button className="demo-button" onClick={() => handleResolvePreset('hero')}>
                        Resolve "hero"
                    </button>
                    <button className="demo-button" onClick={() => handleResolvePreset('dramatic')}>
                        Resolve "dramatic"
                    </button>
                </div>

                {/* Event log */}
                <div className="callback-log" style={{ marginTop: 16 }}>
                    <div className="callback-log-header">Export Log</div>
                    {exportLog.length === 0 ? (
                        <div className="callback-log-empty">Click a button above...</div>
                    ) : (
                        exportLog.map((entry, i) => (
                            <div key={i} className="callback-log-entry">
                                <code>{entry}</code>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}
