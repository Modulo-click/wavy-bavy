import type { ParsedBackground } from '../types'

// ============================================================
// Color Parsing
// ============================================================

/**
 * Parse a hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const clean = hex.replace('#', '')
    const fullHex =
        clean.length === 3
            ? clean
                .split('')
                .map((c) => c + c)
                .join('')
            : clean

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null
}

/**
 * Convert RGB values to hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) =>
        Math.max(0, Math.min(255, Math.round(n)))
            .toString(16)
            .padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Interpolate between two hex colors
 * @param color1 Start color (hex)
 * @param color2 End color (hex)
 * @param factor Interpolation factor (0-1)
 */
export function interpolateColors(color1: string, color2: string, factor: number): string {
    const c1 = hexToRgb(color1)
    const c2 = hexToRgb(color2)
    if (!c1 || !c2) return color1

    return rgbToHex(
        c1.r + (c2.r - c1.r) * factor,
        c1.g + (c2.g - c1.g) * factor,
        c1.b + (c2.b - c1.b) * factor,
    )
}

// ============================================================
// Background Parsing
// ============================================================

/** Known CSS color keywords mapped to hex */
const CSS_COLOR_KEYWORDS: Record<string, string> = {
    white: '#ffffff',
    black: '#000000',
    transparent: '#000000',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    gray: '#808080',
    grey: '#808080',
}

/**
 * Parse a background CSS value into structured info.
 * Extracts the dominant color for wave matching.
 */
export function parseBackground(value: string | undefined): ParsedBackground {
    if (!value) {
        return { type: 'color', value: '#ffffff', dominantColor: '#ffffff' }
    }

    const trimmed = value.trim()

    // URL-based (image)
    if (trimmed.startsWith('url(')) {
        return { type: 'image', value: trimmed, dominantColor: '#ffffff' }
    }

    // Gradient
    if (
        trimmed.includes('gradient(') ||
        trimmed.includes('linear-gradient') ||
        trimmed.includes('radial-gradient') ||
        trimmed.includes('conic-gradient')
    ) {
        // Extract first color from gradient for wave matching
        const colorMatch = trimmed.match(/#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)/)
        const dominantColor = colorMatch ? normalizeColor(colorMatch[0]) : '#ffffff'
        return { type: 'gradient', value: trimmed, dominantColor }
    }

    // Named CSS color
    if (CSS_COLOR_KEYWORDS[trimmed.toLowerCase()]) {
        const hex = CSS_COLOR_KEYWORDS[trimmed.toLowerCase()]
        return { type: 'color', value: hex, dominantColor: hex }
    }

    // Hex color
    if (trimmed.startsWith('#')) {
        const hex = normalizeColor(trimmed)
        return { type: 'color', value: hex, dominantColor: hex }
    }

    // RGB/RGBA
    if (trimmed.startsWith('rgb')) {
        const hex = normalizeColor(trimmed)
        return { type: 'color', value: trimmed, dominantColor: hex }
    }

    // HSL
    if (trimmed.startsWith('hsl')) {
        return { type: 'color', value: trimmed, dominantColor: '#888888' }
    }

    // Fallback
    return { type: 'color', value: trimmed, dominantColor: '#ffffff' }
}

/**
 * Normalize any CSS color string to hex.
 */
function normalizeColor(color: string): string {
    // Already hex
    if (color.startsWith('#')) {
        const clean = color.replace('#', '')
        if (clean.length === 3) {
            return `#${clean
                .split('')
                .map((c) => c + c)
                .join('')}`
        }
        return `#${clean.slice(0, 6)}`
    }

    // RGB(A)
    const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (rgbMatch) {
        return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]))
    }

    return '#ffffff'
}

/**
 * Determine if a color is "dark" (for contrast decisions)
 */
export function isDark(hex: string): boolean {
    const rgb = hexToRgb(hex)
    if (!rgb) return false
    // Luminance formula
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    return luminance < 0.5
}
