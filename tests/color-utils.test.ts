import { describe, it, expect } from 'vitest'
import { hexToRgb, rgbToHex, interpolateColors, parseBackground, isDark } from '../src/utils/color-utils'

// ============================================================
// hexToRgb
// ============================================================

describe('hexToRgb', () => {
    it('parses 6-digit hex', () => {
        expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
        expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
        expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('parses 3-digit hex', () => {
        expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
        expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('parses without hash prefix', () => {
        expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('returns null for invalid input', () => {
        expect(hexToRgb('notacolor')).toBeNull()
        expect(hexToRgb('')).toBeNull()
    })
})

// ============================================================
// rgbToHex
// ============================================================

describe('rgbToHex', () => {
    it('converts RGB to hex', () => {
        expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
        expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
        expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
        expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
        expect(rgbToHex(0, 0, 0)).toBe('#000000')
    })

    it('clamps values to 0-255', () => {
        expect(rgbToHex(300, -10, 128)).toBe('#ff0080')
    })

    it('rounds fractional values', () => {
        expect(rgbToHex(127.6, 0, 0)).toBe('#800000')
    })
})

// ============================================================
// interpolateColors
// ============================================================

describe('interpolateColors', () => {
    it('returns color1 at factor 0', () => {
        expect(interpolateColors('#000000', '#ffffff', 0)).toBe('#000000')
    })

    it('returns color2 at factor 1', () => {
        expect(interpolateColors('#000000', '#ffffff', 1)).toBe('#ffffff')
    })

    it('returns midpoint at factor 0.5', () => {
        expect(interpolateColors('#000000', '#ffffff', 0.5)).toBe('#808080')
    })

    it('returns color1 when one color is invalid', () => {
        expect(interpolateColors('#ff0000', 'invalid', 0.5)).toBe('#ff0000')
    })
})

// ============================================================
// parseBackground
// ============================================================

describe('parseBackground', () => {
    it('defaults to white for undefined', () => {
        const result = parseBackground(undefined)
        expect(result).toEqual({ type: 'color', value: '#ffffff', dominantColor: '#ffffff' })
    })

    it('parses hex colors', () => {
        const result = parseBackground('#ff0000')
        expect(result.type).toBe('color')
        expect(result.dominantColor).toBe('#ff0000')
    })

    it('parses 3-digit hex colors', () => {
        const result = parseBackground('#f00')
        expect(result.type).toBe('color')
        expect(result.dominantColor).toBe('#ff0000')
    })

    it('parses rgb() colors', () => {
        const result = parseBackground('rgb(255, 0, 0)')
        expect(result.type).toBe('color')
        expect(result.dominantColor).toBe('#ff0000')
    })

    it('detects gradient backgrounds', () => {
        const result = parseBackground('linear-gradient(to right, #ff0000, #0000ff)')
        expect(result.type).toBe('gradient')
        expect(result.dominantColor).toBe('#ff0000')
    })

    it('detects url() as image', () => {
        const result = parseBackground('url(/hero.jpg)')
        expect(result.type).toBe('image')
    })

    it('recognizes named colors', () => {
        const result = parseBackground('white')
        expect(result.type).toBe('color')
        expect(result.dominantColor).toBe('#ffffff')
    })

    it('handles hsl colors', () => {
        const result = parseBackground('hsl(0, 100%, 50%)')
        expect(result.type).toBe('color')
    })
})

// ============================================================
// isDark
// ============================================================

describe('isDark', () => {
    it('black is dark', () => {
        expect(isDark('#000000')).toBe(true)
    })

    it('white is not dark', () => {
        expect(isDark('#ffffff')).toBe(false)
    })

    it('dark gray is dark', () => {
        expect(isDark('#333333')).toBe(true)
    })

    it('light gray is not dark', () => {
        expect(isDark('#cccccc')).toBe(false)
    })

    it('returns false for invalid hex', () => {
        expect(isDark('invalid')).toBe(false)
    })
})
