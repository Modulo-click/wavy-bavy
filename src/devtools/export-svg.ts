import type { ExportSVGOptions } from '../types'
import { generatePath } from '../utils/path-generator'
import { DEFAULT_VIEWBOX_WIDTH } from '../constants'

/**
 * Generate a standalone SVG string from wave config.
 * Deterministic — regenerates from config, not DOM serialization.
 */
export function exportWaveAsSVG(options: ExportSVGOptions = {}): string {
    const {
        pattern = 'smooth',
        height = 120,
        amplitude = 0.5,
        frequency = 1,
        fillColor = '#6c5ce7',
        backgroundColor = '#ffffff',
        width = DEFAULT_VIEWBOX_WIDTH,
        seed,
        stroke,
        shadow,
    } = options

    const path = generatePath(pattern, {
        width,
        height,
        amplitude,
        frequency,
        phase: 0,
        mirror: false,
        seed,
    })

    const filterId = shadow ? 'wave-shadow' : undefined
    const filterDef = shadow
        ? `<defs><filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">` +
          `<feDropShadow dx="${shadow.offsetX}" dy="${shadow.offsetY}" ` +
          `stdDeviation="${shadow.blur / 2}" flood-color="${shadow.color}" />` +
          `</filter></defs>`
        : ''

    const strokeAttr = stroke
        ? ` stroke="${stroke.color}" stroke-width="${stroke.width}"${stroke.dashArray ? ` stroke-dasharray="${stroke.dashArray}"` : ''}`
        : ''

    const fillAttr = stroke && !stroke.fill ? 'none' : fillColor
    const filterAttr = filterId ? ` filter="url(#${filterId})"` : ''

    return [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`,
        filterDef,
        `<rect width="${width}" height="${height}" fill="${backgroundColor}" />`,
        `<path d="${path}" fill="${fillAttr}"${strokeAttr}${filterAttr} />`,
        `</svg>`,
    ].join('\n')
}

/**
 * Trigger a browser download of an SVG string.
 * Browser-only — uses Blob + object URL.
 */
export function downloadSVG(svg: string, filename = 'wave.svg'): void {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
