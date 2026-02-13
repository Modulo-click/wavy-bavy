import type { ExportRasterOptions } from '../types'
import { exportWaveAsSVG } from './export-svg'

/**
 * Export a wave as a raster image (PNG or WebP) via Canvas.
 * Browser-only — throws in Node.js (no Canvas/Image).
 */
export async function exportWaveAsRaster(options: ExportRasterOptions = {}): Promise<Blob> {
    const {
        format = 'png',
        imageWidth = 1440,
        scale = 1,
        height = 120,
        ...svgOptions
    } = options

    if (typeof document === 'undefined') {
        throw new Error('[wavy-bavy] exportWaveAsRaster is browser-only — not available in Node.js')
    }

    const svg = exportWaveAsSVG({ ...svgOptions, height })
    const scaledWidth = imageWidth * scale
    const scaledHeight = height * scale

    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

    return new Promise<Blob>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = scaledWidth
            canvas.height = scaledHeight
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('[wavy-bavy] Failed to get canvas 2d context'))
                return
            }
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob)
                    else reject(new Error('[wavy-bavy] Canvas toBlob returned null'))
                },
                format === 'webp' ? 'image/webp' : 'image/png',
            )
        }
        img.onerror = () => reject(new Error('[wavy-bavy] Failed to load SVG into Image'))
        img.src = svgDataUrl
    })
}

/**
 * Export and download a wave as a raster image.
 * Browser-only.
 */
export async function downloadRaster(
    options: ExportRasterOptions = {},
    filename?: string,
): Promise<void> {
    const format = options.format ?? 'png'
    const blob = await exportWaveAsRaster(options)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ?? `wave.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
