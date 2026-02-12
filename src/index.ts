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
export { generateClipPath, generateDualClipPath } from './utils/clip-path'
export { useIntersection, useMergedRef } from './utils/use-intersection'
export type { UseIntersectionOptions } from './utils/use-intersection'
export { optimizePath } from './utils/path-optimizer'

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
} from './types'
