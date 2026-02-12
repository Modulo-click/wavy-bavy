import type { CSSProperties, ReactNode, ElementType } from 'react'

// ============================================================
// Wave Pattern Types
// ============================================================

/** Available built-in wave patterns */
export type PatternName = 'smooth' | 'organic' | 'sharp' | 'layered' | 'mountain' | 'custom'

/** Function that generates an SVG path string for a wave */
export type PatternGenerator = (config: PatternConfig) => string

/** Configuration passed to pattern generators */
export interface PatternConfig {
    /** Width of the SVG viewBox */
    width: number
    /** Height of the SVG viewBox */
    height: number
    /** Wave amplitude multiplier (0-1). Default: 0.5 */
    amplitude: number
    /** Number of wave peaks. Default: 1 */
    frequency: number
    /** Horizontal offset (0-1). Default: 0 */
    phase: number
    /** Whether to mirror the pattern. Default: false */
    mirror: boolean
    /** Seed for reproducible random patterns. Default: undefined */
    seed?: number
}

// ============================================================
// Wave Position & Direction
// ============================================================

/** Where waves are placed on a section */
export type WavePosition = 'top' | 'bottom' | 'both' | 'none'

/** Direction the wave curves toward */
export type WaveDirection = 'up' | 'down'

// ============================================================
// Responsive Values
// ============================================================

/** Breakpoint names */
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/** A value that can vary by breakpoint */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

// ============================================================
// Color & Background Types
// ============================================================

/** Supported background value types */
export type BackgroundValue = string // CSS color, gradient, or url()

/** Parsed background info used internally */
export interface ParsedBackground {
    type: 'color' | 'gradient' | 'image' | 'video'
    /** The raw CSS value */
    value: string
    /** Dominant color for wave matching (hex) */
    dominantColor: string
}

// ============================================================
// Animation Types
// ============================================================

/** Built-in animation names */
export type AnimationName = 'flow' | 'pulse' | 'morph' | 'ripple' | 'bounce' | 'custom' | 'none'

/** Custom animation configuration */
export interface AnimationConfig {
    /** Animation name or 'none' to disable */
    name: AnimationName
    /** Duration in seconds. Default: 4 */
    duration: number
    /** CSS timing function. Default: 'ease-in-out' */
    easing: string
    /** Number of iterations. Default: Infinity */
    iterations: number | 'infinite'
    /** Whether animation is paused */
    paused: boolean
    /** Custom CSS @keyframes string (used when name='custom') */
    keyframes?: string
}

// ============================================================
// Effect Types
// ============================================================

/** Shadow effect configuration */
export interface ShadowConfig {
    /** Color of the shadow. Default: 'rgba(0,0,0,0.1)' */
    color: string
    /** Blur radius in px. Default: 10 */
    blur: number
    /** X offset in px. Default: 0 */
    offsetX: number
    /** Y offset in px. Default: 4 */
    offsetY: number
}

/** Glow effect configuration */
export interface GlowConfig {
    /** Glow color. Default: inherits wave color */
    color: string
    /** Glow intensity (blur radius). Default: 20 */
    intensity: number
    /** Glow opacity (0-1). Default: 0.5 */
    opacity: number
}

/** Stroke/outline wave configuration */
export interface StrokeConfig {
    /** Stroke color. Default: 'rgba(0,0,0,0.3)' */
    color: string
    /** Stroke width in px. Default: 2 */
    width: number
    /** SVG stroke-dasharray value. Default: undefined (solid) */
    dashArray?: string
    /** Whether to keep the fill. Default: true */
    fill: boolean
}

/** Blur/frosted glass effect configuration */
export interface BlurConfig {
    /** Blur radius in px. Default: 8 */
    radius: number
    /** Fill opacity (0-1). Default: 0.7 */
    opacity: number
    /** Saturation multiplier. Default: 1.2 */
    saturation: number
}

/** Texture overlay configuration */
export interface TextureConfig {
    /** Texture type. Default: 'turbulence' */
    type: 'turbulence' | 'fractalNoise'
    /** Base frequency for feTurbulence. Default: 0.02 */
    frequency: number
    /** Number of octaves. Default: 3 */
    octaves: number
    /** Displacement scale. Default: 5 */
    scale: number
    /** Random seed for reproducibility. Default: 0 */
    seed: number
}

/** Inner shadow configuration */
export interface InnerShadowConfig {
    /** Shadow color. Default: 'rgba(0,0,0,0.2)' */
    color: string
    /** Blur radius in px. Default: 8 */
    blur: number
    /** X offset in px. Default: 0 */
    offsetX: number
    /** Y offset in px. Default: 2 */
    offsetY: number
}

// ============================================================
// Section Registration (Context)
// ============================================================

/** Config stored per registered section in context */
export interface SectionRegistration {
    /** Unique section ID */
    id: string
    /** Registration order (index) */
    order: number
    /** Parsed background information */
    background: ParsedBackground
    /** Wave position preference */
    wavePosition: WavePosition
    /** The DOM element ref for measurements */
    element: HTMLElement | null
}

/** The context value provided by WaveProvider */
export interface WaveContextValue {
    /** All registered sections in order */
    sections: SectionRegistration[]
    /** Register a section. Returns cleanup function. */
    register: (id: string, config: Omit<SectionRegistration, 'order'>) => () => void
    /** Update a section's config */
    update: (id: string, config: Partial<SectionRegistration>) => void
    /** Get the section before a given ID */
    getSectionBefore: (id: string) => SectionRegistration | null
    /** Get the section after a given ID */
    getSectionAfter: (id: string) => SectionRegistration | null
    /** Global default settings */
    defaults: WaveDefaults
}

/** Global default settings configurable via WaveProvider */
export interface WaveDefaults {
    /** Default wave height in px. Default: 120 */
    height: number
    /** Default pattern. Default: 'smooth' */
    pattern: PatternName
    /** Default amplitude. Default: 0.5 */
    amplitude: number
    /** Default frequency. Default: 1 */
    frequency: number
    /** Default animation. Default: 'none' */
    animate: AnimationName
    /** Whether to respect prefers-reduced-motion. Default: true */
    respectReducedMotion: boolean
}

// ============================================================
// Wave Preset
// ============================================================

/** A preset is a named, reusable wave configuration */
export interface WavePreset {
    pattern?: PatternName
    height?: number | ResponsiveValue<number>
    amplitude?: number
    frequency?: number
    animate?: AnimationName | false
    shadow?: boolean | ShadowConfig
    glow?: boolean | GlowConfig
    layers?: number
    layerOpacity?: number
}

// ============================================================
// WaveSection Props (Main API)
// ============================================================

export interface WaveSectionProps {
    // --- Background ---
    /** Background color, gradient, or url(). Auto-detected for wave color matching. */
    background?: BackgroundValue
    /** Explicit background image URL (shorthand for url()). */
    backgroundImage?: string
    /** If true, clips the background image/video to follow the wave contour. Default: false */
    clipImage?: boolean

    // --- Wave Configuration ---
    /** Use a named preset configuration */
    preset?: string
    /** Where to place waves. Default: auto-detected from context */
    wavePosition?: WavePosition
    /** Wave height in px. Supports responsive values. Default: from provider defaults */
    height?: number | ResponsiveValue<number>

    // --- Pattern ---
    /** Wave pattern shape. Default: 'smooth' */
    pattern?: PatternName
    /** Custom SVG path string (used when pattern='custom') */
    customPath?: string
    /** Wave amplitude (0-1). Default: 0.5 */
    amplitude?: number
    /** Number of wave peaks. Default: 1 */
    frequency?: number
    /** Horizontal offset (0-1). Default: 0 */
    phase?: number
    /** Mirror the wave pattern. Default: false */
    mirror?: boolean
    /** Seed for reproducible random organic patterns */
    seed?: number

    // --- Animation ---
    /** Animation preset or false to disable. Default: 'none' */
    animate?: AnimationName | false
    /** Animation duration in seconds. Default: 4 */
    animationDuration?: number
    /** Custom CSS @keyframes string (used with animate='custom') */
    customKeyframes?: string

    // --- Effects ---
    /** Drop shadow on wave. Default: false */
    shadow?: boolean | ShadowConfig
    /** Glow effect on wave. Default: false */
    glow?: boolean | GlowConfig
    /** Stroke/outline on wave path. Default: false */
    stroke?: boolean | StrokeConfig
    /** Blur/frosted glass effect. Default: false */
    blur?: boolean | BlurConfig
    /** Texture overlay on wave. Default: false */
    texture?: boolean | TextureConfig
    /** Inner shadow on wave. Default: false */
    innerShadow?: boolean | InnerShadowConfig
    /** Number of stacked wave layers. Default: 1 */
    layers?: number
    /** Opacity for stacked layers. Default: 0.3 */
    layerOpacity?: number

    // --- Performance ---
    /** Lazy render: only render SVG when visible. Default: false */
    lazy?: boolean

    // --- Layout ---
    /** HTML element type. Default: 'section' */
    as?: ElementType
    /** Additional CSS classes */
    className?: string
    /** Inline styles */
    style?: CSSProperties
    /** Overlap with adjacent section in px. Default: 0 */
    overlap?: number

    // --- Accessibility ---
    /** Accessible label for the section */
    'aria-label'?: string

    // --- Children ---
    children: ReactNode
}

// ============================================================
// WaveProvider Props
// ============================================================

export interface WaveProviderProps {
    /** Global default settings for all WaveSections */
    defaults?: Partial<WaveDefaults>
    /** Enable debug mode (shows section boundaries). Default: false */
    debug?: boolean
    children: ReactNode
}

// ============================================================
// WaveRenderer Props (Internal)
// ============================================================

export interface WaveRendererProps {
    /** The SVG path to render */
    path: string
    /** Fill color for the wave */
    fillColor: string
    /** Container background color (behind the wave) */
    containerColor: string
    /** Wave height in px */
    height: number
    /** Wave direction */
    direction: WaveDirection
    /** Animation config */
    animation?: AnimationConfig
    /** Shadow config */
    shadow?: ShadowConfig
    /** Glow config */
    glow?: GlowConfig
    /** Stroke config */
    stroke?: StrokeConfig
    /** Blur/frosted glass config */
    blur?: BlurConfig
    /** Texture overlay config */
    texture?: TextureConfig
    /** Inner shadow config */
    innerShadow?: InnerShadowConfig
    /** Whether to lazy-render (show placeholder until visible) */
    lazy?: boolean
    /** Additional class */
    className?: string
}
