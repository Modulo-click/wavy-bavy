// ============================================================
// wavy-bavy — Public API
// ============================================================

// Core components
export { WaveSection } from './components/WaveSection'
export { WaveRenderer } from './components/WaveRenderer'
export { WaveLayer } from './components/WaveLayer'
export { WaveSectionCSS } from './components/WaveSectionCSS'
export type { WaveSectionCSSProps } from './components/WaveSectionCSS'

// Context
export { WaveProvider } from './context/WaveProvider'
export { useWaveContext, useOptionalWaveContext } from './context/useWaveContext'

// Utilities
export { parseBackground, hexToRgb, rgbToHex, interpolateColors, isDark } from './utils/color-utils'
export { generatePath, generateLayeredPaths, flipPathVertically } from './utils/path-generator'
export { useWaveAnimation, useReducedMotion, generateMorphFrames } from './utils/animation'
export type { UseWaveAnimationOptions, UseWaveAnimationResult } from './utils/animation'
export { KEYFRAME_GENERATORS, PATH_MORPH_GENERATORS, generatePathKeyframes } from './utils/keyframes'
export { generateClipPath, generateDualClipPath } from './utils/clip-path'
export { useIntersection, useMergedRef } from './utils/use-intersection'
export type { UseIntersectionOptions } from './utils/use-intersection'
export { optimizePath } from './utils/path-optimizer'
export { generateInterlockPaths, autoSeed } from './utils/interlock-generator'
export type { InterlockOptions } from './utils/interlock-generator'
export { createScrollTracker } from './utils/scroll-tracker'
export { useScrollProgress } from './utils/use-scroll-progress'
export type { ScrollProgressOptions } from './utils/use-scroll-progress'
export { useScrollVelocity } from './utils/use-scroll-velocity'
export type { ScrollVelocityOptions } from './utils/use-scroll-velocity'

// Constants & presets
export {
    DEFAULTS,
    PRESETS,
    BREAKPOINTS,
    PATTERN_REGISTRY,
    DEFAULT_SHADOW,
    DEFAULT_GLOW,
    DEFAULT_STROKE,
    DEFAULT_BLUR,
    DEFAULT_TEXTURE,
    DEFAULT_INNER_SHADOW,
    DEFAULT_SCROLL_ANIMATION,
    DEFAULT_PARALLAX,
    DEFAULT_HOVER,
    DEFAULT_SEPARATION,
} from './constants'

// Tailwind plugin (re-exported for convenience; primary access via 'wavy-bavy/tailwind')
export { wavyBavyPlugin } from './tailwind/plugin'
export type { WavyBavyPluginOptions, WavePresetConfig } from './tailwind/plugin'

// Types
export type {
    // Main API
    WaveSectionProps,
    WaveProviderProps,
    WaveRendererProps,

    // Patterns
    PatternName,
    PatternGenerator,
    PatternConfig,

    // Animations
    AnimationName,
    AnimationConfig,

    // Effects
    ShadowConfig,
    GlowConfig,
    StrokeConfig,
    BlurConfig,
    TextureConfig,
    InnerShadowConfig,

    // Scroll & Interaction
    ScrollAnimationConfig,
    ParallaxConfig,
    HoverConfig,

    // Layout
    WavePosition,
    WaveDirection,
    ResponsiveValue,
    Breakpoint,

    // Background
    BackgroundValue,
    ParsedBackground,

    // Context
    WaveContextValue,
    WaveDefaults,
    SectionRegistration,

    // Presets
    WavePreset,

    // Debug
    DebugPanelConfig,
    DebugPanelPosition,
    DebugMeta,

    // Export
    ExportSVGOptions,
    ExportRasterOptions,
    ResolvedPresetConfig,

    // Separation / Interlock
    WaveSeparationConfig,
    InterlockMode,
    DualPathResult,

    // Scroll Tracker
    ScrollTracker,
    ScrollTrackerOptions,

    // Web Component
    WavySectionAttributes,
} from './types'
