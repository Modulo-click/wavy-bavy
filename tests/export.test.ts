import { describe, it, expect, vi } from 'vitest'
import { exportWaveAsSVG, downloadSVG } from '../src/devtools/export-svg'
import { exportWaveAsRaster } from '../src/devtools/export-raster'
import { generateClipPathCSS } from '../src/devtools/export-clipboard'
import { resolvePreset, getAllPresets } from '../src/devtools/preset-resolver'

// ============================================================
// exportWaveAsSVG
// ============================================================

describe('exportWaveAsSVG', () => {
    it('returns a valid SVG string with defaults', () => {
        const svg = exportWaveAsSVG()
        expect(svg).toContain('<svg')
        expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
        expect(svg).toContain('</svg>')
        expect(svg).toContain('viewBox="0 0 1440 120"')
    })

    it('uses provided fillColor and backgroundColor', () => {
        const svg = exportWaveAsSVG({ fillColor: '#ff0000', backgroundColor: '#00ff00' })
        expect(svg).toContain('fill="#ff0000"')
        expect(svg).toContain('fill="#00ff00"')
    })

    it('uses custom pattern', () => {
        const svgSmooth = exportWaveAsSVG({ pattern: 'smooth' })
        const svgSharp = exportWaveAsSVG({ pattern: 'sharp', frequency: 3 })
        // Different patterns should produce different paths
        expect(svgSmooth).not.toBe(svgSharp)
    })

    it('uses custom dimensions', () => {
        const svg = exportWaveAsSVG({ width: 800, height: 200 })
        expect(svg).toContain('viewBox="0 0 800 200"')
    })

    it('includes shadow filter when shadow option provided', () => {
        const svg = exportWaveAsSVG({
            shadow: { color: 'rgba(0,0,0,0.2)', blur: 10, offsetX: 0, offsetY: 4 },
        })
        expect(svg).toContain('<filter')
        expect(svg).toContain('feDropShadow')
        expect(svg).toContain('url(#wave-shadow)')
    })

    it('does not include filter when no shadow', () => {
        const svg = exportWaveAsSVG()
        expect(svg).not.toContain('<filter')
        expect(svg).not.toContain('feDropShadow')
    })

    it('includes stroke attributes when stroke option provided', () => {
        const svg = exportWaveAsSVG({
            stroke: { color: '#333', width: 2, fill: true },
        })
        expect(svg).toContain('stroke="#333"')
        expect(svg).toContain('stroke-width="2"')
    })

    it('sets fill to none when stroke.fill is false', () => {
        const svg = exportWaveAsSVG({
            stroke: { color: '#333', width: 2, fill: false },
        })
        expect(svg).toContain('fill="none"')
    })

    it('includes stroke-dasharray when specified', () => {
        const svg = exportWaveAsSVG({
            stroke: { color: '#333', width: 2, fill: true, dashArray: '8 4' },
        })
        expect(svg).toContain('stroke-dasharray="8 4"')
    })

    it('is deterministic — same options produce same SVG', () => {
        const opts = { pattern: 'organic' as const, seed: 42, amplitude: 0.6 }
        const svg1 = exportWaveAsSVG(opts)
        const svg2 = exportWaveAsSVG(opts)
        expect(svg1).toBe(svg2)
    })
})

// ============================================================
// downloadSVG
// ============================================================

describe('downloadSVG', () => {
    it('creates and clicks an anchor element', () => {
        const createObjectURL = vi.fn(() => 'blob:test')
        const revokeObjectURL = vi.fn()
        globalThis.URL.createObjectURL = createObjectURL
        globalThis.URL.revokeObjectURL = revokeObjectURL

        const click = vi.fn()
        const appendChild = vi.fn()
        const removeChild = vi.fn()
        vi.spyOn(document, 'createElement').mockReturnValue({
            href: '',
            download: '',
            click,
            style: {},
        } as unknown as HTMLAnchorElement)
        vi.spyOn(document.body, 'appendChild').mockImplementation(appendChild)
        vi.spyOn(document.body, 'removeChild').mockImplementation(removeChild)

        downloadSVG('<svg></svg>', 'test.svg')

        expect(createObjectURL).toHaveBeenCalled()
        expect(click).toHaveBeenCalled()
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')

        vi.restoreAllMocks()
    })
})

// ============================================================
// generateClipPathCSS
// ============================================================

describe('generateClipPathCSS', () => {
    it('returns a polygon string for default options', () => {
        const css = generateClipPathCSS()
        expect(css).toMatch(/^polygon\(/)
        expect(css).toContain('%')
    })

    it('returns different results for top vs bottom position', () => {
        const bottom = generateClipPathCSS({ position: 'bottom' })
        const top = generateClipPathCSS({ position: 'top' })
        expect(bottom).not.toBe(top)
    })

    it('returns different results for different patterns', () => {
        const smooth = generateClipPathCSS({ pattern: 'smooth' })
        const sharp = generateClipPathCSS({ pattern: 'sharp', frequency: 3 })
        expect(smooth).not.toBe(sharp)
    })
})

// ============================================================
// resolvePreset
// ============================================================

describe('resolvePreset', () => {
    it('returns null for unknown preset', () => {
        expect(resolvePreset('nonexistent')).toBeNull()
    })

    it('resolves hero preset with all fields filled', () => {
        const resolved = resolvePreset('hero')!
        expect(resolved).not.toBeNull()
        expect(resolved.pattern).toBe('smooth')
        expect(resolved.height).toBe(200)
        expect(resolved.amplitude).toBe(0.6)
        expect(resolved.frequency).toBe(1)
        expect(resolved.animate).toBe('none')
        expect(resolved.shadow).toBe(false)
        expect(resolved.glow).toBe(false)
        expect(resolved.layers).toBe(1)
        expect(resolved.layerOpacity).toBe(0.3)
    })

    it('resolves angular preset', () => {
        const resolved = resolvePreset('angular')!
        expect(resolved.pattern).toBe('sharp')
        expect(resolved.frequency).toBe(2)
    })

    it('resolves dramatic preset', () => {
        const resolved = resolvePreset('dramatic')!
        expect(resolved.pattern).toBe('organic')
        expect(resolved.height).toBe(250)
        expect(resolved.amplitude).toBe(0.7)
    })

    it('resolves all 7 built-in presets', () => {
        const names = ['hero', 'footer', 'dark-light', 'dramatic', 'subtle', 'angular', 'peaks']
        for (const name of names) {
            const resolved = resolvePreset(name)
            expect(resolved).not.toBeNull()
            // No undefined fields
            for (const [key, value] of Object.entries(resolved!)) {
                expect(value).not.toBeUndefined()
            }
        }
    })
})

// ============================================================
// getAllPresets
// ============================================================

describe('getAllPresets', () => {
    it('returns all 12 presets', () => {
        const all = getAllPresets()
        expect(Object.keys(all)).toHaveLength(12)
    })

    it('every preset is fully resolved', () => {
        const all = getAllPresets()
        for (const [name, preset] of Object.entries(all)) {
            expect(preset.pattern).toBeDefined()
            expect(preset.height).toBeDefined()
            expect(preset.amplitude).toBeDefined()
            expect(preset.frequency).toBeDefined()
            expect(preset.animate).toBeDefined()
            expect(typeof preset.shadow).toBe('boolean')
            expect(typeof preset.glow).toBe('boolean')
            expect(typeof preset.layers).toBe('number')
            expect(typeof preset.layerOpacity).toBe('number')
        }
    })
})

// ============================================================
// exportWaveAsRaster (browser-only edge cases)
// ============================================================

describe('exportWaveAsRaster', () => {
    it('is a function', () => {
        expect(typeof exportWaveAsRaster).toBe('function')
    })
})
