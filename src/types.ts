import type { CSSProperties, ReactNode, ElementType } from 'react'

// ============================================================
// Wave Pattern Types
// ============================================================

/** Available built-in wave patterns */
export type PatternName = 'smooth' | 'organic' | 'sharp' | 'layered' | 'mountain' | 'flowing' | 'ribbon' | 'layered-organic' | 'custom'

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
// Gradient Types
// ============================================================

/** A single color stop in a gradient */
export interface GradientStop {
    /** CSS color value */
    color: string
    /** Position in the gradient (0-1) */
    offset: number
}

/** SVG gradient configuration for wave fills */
export interface GradientConfig {
    /** Gradient type */
    type: 'linear' | 'radial'
    /** Color stops (minimum 2) */
    stops: GradientStop[]
    /** Angle in degrees for linear gradients (0 = left-to-right, 90 = top-to-bottom). Default: 0 */
    angle?: number
}

// ============================================================
// Animation Types
// ============================================================

/** Built-in animation names */
export type AnimationName = 'flow' | 'pulse' | 'morph' | 'ripple' | 'bounce' | 'drift' | 'breathe' | 'undulate' | 'ripple-out' | 'custom' | 'none'

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
    /** Also apply backdrop-filter to the section element. Default: false */
    section?: boolean
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
// Scroll & Interaction Types
// ============================================================

/** Scroll-linked animation configuration */
export interface ScrollAnimationConfig {
    /** Progress source — 'element' uses element scroll progress, 'page' uses document scroll ratio. Default: 'element' */
    progress?: 'element' | 'page'
    /** Smoothing factor for scroll position (0-1). Default: 0.1 */
    damping?: number
    /** Reverse the animation direction. Default: false */
    reverse?: boolean
}

/** Parallax layer configuration */
export interface ParallaxConfig {
    /** Parallax multiplier (0 = static, 1 = full scroll speed). Default: 0.3 */
    speed?: number
    /** Transform axis. Default: 'vertical' */
    direction?: 'vertical' | 'horizontal'
}

/** Hover effect configuration */
export interface HoverConfig {
    /** Transform scale on hover. Default: 1.02 */
    scale?: number
    /** TranslateY on hover (px, negative = up). Default: -4 */
    lift?: number
    /** Enhance glow effect on hover. Default: false */
    glow?: boolean
    /** CSS transition string. Default: 'transform 0.3s ease, filter 0.3s ease' */
    transition?: string
}

// ============================================================
// Interlocking Wave Separation Types
// ============================================================

/** Interaction mode for dual-wave interlocking */
export type InterlockMode = 'interlock' | 'overlap' | 'apart' | 'flush'

/** Configuration for how two wave edges interact at a section transition */
export interface WaveSeparationConfig {
    /** How the two wave paths interact. Default: 'interlock' */
    mode: InterlockMode
    /** Depth of interlocking teeth (0.0-1.0). Default: 0.5 */
    intensity: number
    /** Gap in px between the two wave edges. Default: 0 */
    gap: number
    /** Stroke color applied to wave edges. Default: undefined */
    strokeColor?: string
    /** Stroke width in px for wave edges. Default: undefined */
    strokeWidth?: number
}

/** Result of dual-path interlocking generation */
export interface DualPathResult {
    /** SVG path for the upper section's bottom edge */
    pathA: string
    /** SVG path for the lower section's top edge */
    pathB: string
    /** The shared base curve both paths derive from */
    baseCurve: string
}

/** Per-edge wave configuration for independent upper/lower wave control */
export interface WaveEdgeConfig {
    pattern?: PatternName
    amplitude?: number
    frequency?: number
    height?: number
    phase?: number
    mirror?: boolean
    seed?: number
}

/** Options for the vanilla JS scroll tracker */
export interface ScrollTrackerOptions {
    /** Maximum velocity threshold in px/s. Default: 2000 */
    maxVelocity?: number
    /** Minimum damping (at max speed). Default: 0.02 */
    minDamping?: number
    /** Maximum damping (at zero speed). Default: 0.15 */
    maxDamping?: number
}

/** Return value from createScrollTracker */
export interface ScrollTracker {
    /** Current smoothed scroll offset */
    readonly offset: number
    /** Current scroll velocity in px/s */
    readonly velocity: number
    /** Current adaptive damping factor */
    readonly damping: number
    /** Update with new scroll position — call in rAF */
    update(scrollY: number, timestamp: number): void
    /** Reset to initial state */
    reset(): void
}

// ============================================================
// Section Registration (Context)
// ============================================================

/** Debug metadata attached to registered sections when debug mode is active */
export interface DebugMeta {
    /** Pattern in use */
    pattern: PatternName
    /** Amplitude value */
    amplitude: number
    /** Frequency value */
    frequency: number
    /** Animation name */
    animate: AnimationName | false
}

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
    /** Debug metadata (only present when debug mode is active) */
    debugMeta?: DebugMeta
    /** Independent upper (top) edge wave configuration */
    upperWave?: WaveEdgeConfig
    /** Independent lower (bottom) edge wave configuration */
    lowerWave?: WaveEdgeConfig
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
    /** Whether debug mode is active */
    debug: boolean
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

    // --- Gradient Fills ---
    /** SVG gradient for the wave fill area. Overrides auto-detected fill color. */
    fillGradient?: GradientConfig
    /** SVG gradient for the container area behind the wave. Overrides auto-detected container color. */
    containerGradient?: GradientConfig
    /** Auto-generate gradient from adjacent section colors. Default: false */
    autoGradient?: boolean

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

    // --- Scroll & Interaction ---
    /** Scroll-linked animation: drive animation timeline from scroll position. Default: false */
    scrollAnimate?: boolean | ScrollAnimationConfig
    /** Parallax effect on wave layers. Default: false */
    parallax?: boolean | ParallaxConfig
    /** Hover effect on wave. Default: false */
    hover?: boolean | HoverConfig
    /** Dual-wave separation config. Default: { mode: 'interlock', intensity: 0.5, gap: 0 } */
    separation?: boolean | Partial<WaveSeparationConfig>
    /** Independent config for this section's upper (top) wave edge */
    upperWave?: WaveEdgeConfig
    /** Independent config for this section's lower (bottom) wave edge */
    lowerWave?: WaveEdgeConfig
    /** Callback fired when section enters viewport */
    onEnter?: () => void
    /** Callback fired when section leaves viewport */
    onExit?: () => void
    /** Callback fired on each scroll frame while section is visible */
    onProgress?: (progress: number) => void

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

/** Debug panel position */
export type DebugPanelPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

/** Configuration for the enhanced debug panel */
export interface DebugPanelConfig {
    /** Panel position on screen. Default: 'top-right' */
    position: DebugPanelPosition
    /** Show section boundary outlines on the page. Default: true */
    showBoundaries: boolean
    /** Show section configuration details. Default: true */
    showConfig: boolean
    /** Keyboard shortcut to toggle debug. Default: 'ctrl+shift+d' */
    toggleShortcut: string
}

export interface WaveProviderProps {
    /** Global default settings for all WaveSections */
    defaults?: Partial<WaveDefaults>
    /** Enable debug mode. Pass true for minimal overlay, or a config object for enhanced mode. Default: false */
    debug?: boolean | Partial<DebugPanelConfig>
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
    /** SVG gradient for the wave fill area */
    fillGradient?: GradientConfig
    /** SVG gradient for the container area */
    containerGradient?: GradientConfig
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
    /** Hover effect config */
    hover?: HoverConfig
    /** Parallax offset (px). Y applied via viewBox shift, X via CSS transform. */
    parallaxOffset?: { x: number; y: number }
    /** Second interlocking path (Path B). When provided, dual-path mode is active. */
    pathB?: string
    /** Separation config for dual-path mode */
    separation?: WaveSeparationConfig
    /** Pre-generated CSS keyframes for Path A (d: path() morphing) */
    pathAKeyframesCSS?: string
    /** Pre-generated CSS keyframes for Path B (d: path() morphing) */
    pathBKeyframesCSS?: string
    /** Unique animation ID for path A */
    pathAAnimId?: string
    /** Unique animation ID for path B */
    pathBAnimId?: string
    /** Animation duration in seconds for path morph animations. Default: 4 */
    animationDuration?: number
    /** Additional class */
    className?: string
}

// ============================================================
// Export & Devtools Types
// ============================================================

/** Options for SVG export */
export interface ExportSVGOptions {
    /** Wave pattern. Default: 'smooth' */
    pattern?: PatternName
    /** Wave height in px. Default: 120 */
    height?: number
    /** Wave amplitude (0-1). Default: 0.5 */
    amplitude?: number
    /** Number of wave peaks. Default: 1 */
    frequency?: number
    /** Fill color for the wave area. Default: '#6c5ce7' */
    fillColor?: string
    /** Background color behind the wave. Default: '#ffffff' */
    backgroundColor?: string
    /** Viewbox width. Default: 1440 */
    width?: number
    /** Seed for organic patterns */
    seed?: number
    /** Stroke config */
    stroke?: StrokeConfig
    /** Shadow config */
    shadow?: ShadowConfig
}

/** Options for raster (PNG/WebP) export */
export interface ExportRasterOptions extends ExportSVGOptions {
    /** Output format. Default: 'png' */
    format?: 'png' | 'webp'
    /** Output image width in px. Default: 1440 */
    imageWidth?: number
    /** Scale factor (e.g. 2 for retina). Default: 1 */
    scale?: number
}

/** A fully resolved preset with no undefined fields */
export interface ResolvedPresetConfig {
    pattern: PatternName
    height: number
    amplitude: number
    frequency: number
    animate: AnimationName
    shadow: boolean
    glow: boolean
    layers: number
    layerOpacity: number
}

// ============================================================
// Web Component Types
// ============================================================

/** Attributes accepted by the `<wavy-section>` custom element */
export interface WavySectionAttributes {
    pattern?: PatternName
    height?: number
    amplitude?: number
    frequency?: number
    background?: string
    'fill-color'?: string
    animate?: AnimationName | 'none'
    'animation-duration'?: number
    'wave-position'?: 'top' | 'bottom' | 'both'
    phase?: number
    mirror?: boolean
    seed?: number
    'separation-mode'?: InterlockMode
    intensity?: number
    gap?: number
    'stroke-color'?: string
    'stroke-width'?: number
}
