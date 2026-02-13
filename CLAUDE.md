# wavy-bavy

NPM-publishable React library for seamless, automatic wave transitions between page sections.

## Project Info

- **Package**: `wavy-bavy` (org: `@modulo-click`)
- **Target**: React 18+, Next.js 13+, Tailwind CSS v3/v4
- **License**: MIT
- **Repo**: `https://github.com/Modulo-click/wavy-bavy`

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Build**: tsup (ESM + CJS dual output)
- **Test**: Vitest + @testing-library/react + jsdom
- **Target**: ES2020

## Commands

```bash
npm run build        # Build with tsup (ESM + CJS + DTS)
npm run dev          # Build in watch mode
npm run test         # Vitest run
npm run test:watch   # Vitest watch
npm run lint         # TypeScript check (tsc --noEmit)
npm run size         # Bundle size check
```

## Project Structure

```
src/
  index.ts                     # Public API barrel exports
  types.ts                     # All TypeScript interfaces
  constants.ts                 # Defaults, presets, pattern registry
  components/
    WaveSection.tsx            # Main wrapper component (primary public API)
    WaveRenderer.tsx           # SVG wave renderer with filters
    WaveLayer.tsx              # Multi-layer wave stacking
  context/
    WaveProvider.tsx           # Context provider (section registry + debug overlay)
    useWaveContext.ts          # Hooks (useWaveContext + useOptionalWaveContext)
  web-component.ts               # <wavy-section> custom element (vanilla JS / Astro)
  utils/
    path-generator.ts          # SVG path math (generatePath, flipPathVertically)
    color-utils.ts             # Color parsing, hex/rgb conversion, interpolation
    animation.ts               # Animation system (flow, pulse, morph, ripple, bounce, custom)
    keyframes.ts               # Pure CSS keyframe generators + path morphing (no React dependency)
    interlock-generator.ts     # Dual-path interlock generation (autoSeed, generateInterlockPaths)
    scroll-tracker.ts          # Velocity-adaptive scroll tracker (vanilla JS, no React)
    clip-path.ts               # CSS clip-path polygon generation
    use-intersection.ts        # IntersectionObserver hook (lazy rendering + throttling)
    path-optimizer.ts          # SVG path simplification (Ramer-Douglas-Peucker)
  components/
    WaveSection.tsx            # Main wrapper component (primary public API)
    WaveRenderer.tsx           # SVG wave renderer with filters
    WaveLayer.tsx              # Multi-layer wave stacking
    WaveSectionCSS.tsx         # CSS-only wave component (clip-path, no SVG)
  effects.ts                   # Effects barrel export entry point
  animations.ts                # Animations barrel export entry point
  tailwind/
    plugin.ts                  # Tailwind CSS plugin (utility classes, JIT, presets)
    theme.ts                   # Default theme tokens (heights, patterns, durations)
  devtools/
    index.ts                   # Devtools barrel export entry point (wavy-bavy/devtools)
    WaveDebugPanel.tsx         # Enhanced debug overlay (opt-in, collapsible, boundary outlines)
    WavePatternGallery.tsx     # Pattern preview grid (standalone, no context)
    export-svg.ts              # SVG export utility (deterministic, SSR-safe)
    export-raster.ts           # PNG/WebP export via Canvas (browser-only)
    export-clipboard.ts        # Clip-path CSS clipboard copy
    preset-resolver.ts         # Preset introspection (resolvePreset, getAllPresets)
tests/                         # Vitest test suite (225 tests, 14 files)
playground/                    # Vite + React demo app
```

## Architecture

- `WaveProvider` wraps the page and tracks all registered `WaveSection` components via context
- Each `WaveSection` auto-registers on mount, providing its background color and config
- Adjacent sections are detected automatically; wave colors are derived from neighboring backgrounds
- `WaveRenderer` generates SVG paths using pattern generators (smooth, organic, sharp, mountain)
- Two animation pipelines: transform-based (pulse, bounce) via `useWaveAnimation` hook on wrapper div, and path morph (flow, morph, ripple, drift, breathe, undulate, ripple-out) via CSS `d: path()` interpolation directly on SVG `<path>` elements
- Path morph animations animate both the top path (container area) and bottom path (fill area) in sync — the top path keyframes are derived from the bottom by applying `invertPathToTop()` to each morph frame
- `animationDuration` prop flows from `WaveSection` through to `WaveRenderer` for path morph timing (default 4s)
- `useReducedMotion` auto-disables animations when user prefers reduced motion
- Effects (stroke, blur, texture, innerShadow) compose via SVG filter pipeline in `WaveRenderer`
- Lazy rendering and animation throttling use `useIntersection` (IntersectionObserver)

### Stability Patterns (Critical)

- `WaveProvider` uses `useCallback` with empty deps for `register`/`update` methods
- `setSections` uses functional updates with value equality checks to prevent unnecessary re-renders
- `WaveSection` uses `registeredRef` to ensure single registration on mount
- `lastConfigRef` tracks previously sent config to prevent redundant context updates
- All registration/update logic is in a single `useEffect`

## Implementation Status

### Phase 1: Core Architecture -- COMPLETE
- Context system, section registration, adjacent detection, auto color matching
- 4 pattern generators (smooth, organic, sharp, mountain)
- 7 presets (hero, footer, dark-light, dramatic, subtle, angular, peaks)
- Effects (shadow, glow via SVG filters), multi-layer depth
- Build: ESM 21.77 KB, CJS 22.55 KB, DTS 12.75 KB

### Phase 2: Animations, Clip-path, Tailwind & Tests -- COMPLETE
- 5 animation types: flow, pulse, morph, ripple, bounce
- `useWaveAnimation` hook with CSS keyframe injection, pause/resume
- `flipPathVertically` SVG path parser (all commands: M, L, C, S, Q, T, A, H, V)
- `generateClipPath` / `generateDualClipPath` for CSS polygon clip-paths
- Tailwind CSS plugin with utility classes, JIT support, custom presets
- 106 unit tests across 8 files (utils, components, context, plugin)
- Playground demos for all 5 animation types
- Build: ESM 33.32 KB, CJS 34.31 KB, DTS 15.14 KB + Tailwind plugin 3.32 KB

### Phase 3: Effects, Animations & Performance -- COMPLETE
- `useReducedMotion` hook (prefers-reduced-motion media query, SSR-safe)
- Lazy rendering via `useIntersection` (IntersectionObserver, placeholder until visible)
- Animation throttling (auto-pause off-screen, auto-resume on scroll back)
- Stroke/outline waves (`stroke` prop with StrokeConfig: color, width, dashArray, fill)
- Blur/frosted glass (`blur` prop with BlurConfig: backdrop-filter, opacity, saturation)
- Texture overlays (`texture` prop with TextureConfig: feTurbulence + feDisplacementMap)
- Inner shadows (`innerShadow` prop with InnerShadowConfig: SVG filter pipeline)
- Custom keyframes (`animate='custom'` + `customKeyframes` prop)
- SVG path optimization (`optimizePath` — Ramer-Douglas-Peucker algorithm)
- Zero-overhead static rendering (lazy ID generation, no-op callbacks, shared empty objects)
- Code-splitting: separate `./effects` and `./animations` entry points
- CSS-only mode: `WaveSectionCSS` component (clip-path polygon, no SVG, no context)
- 150 unit tests across 10 files
- Build: ESM index 44.56 KB, animations 9.54 KB, effects 739 B, Tailwind plugin 3.32 KB
### Phase 4: Scroll & Interaction -- COMPLETE
- `useScrollProgress` hook (element/page scroll progress, damping)
- `useScrollVelocity` hook (scroll speed/direction detection)
- Scroll-linked animations (`scrollAnimate` prop: paused + negative delay from scroll progress)
- Parallax layers (`parallax` prop with ParallaxConfig: speed, vertical/horizontal)
- Hover effects (`hover` prop with HoverConfig: scale, lift, glow boost, transition)
- Intersection callbacks (`onEnter`, `onExit`, `onProgress` props)
- 187 unit tests across 12 files
- Build: ESM index 55.79 KB, animations 9.54 KB, effects 739 B, Tailwind plugin 3.32 KB

### Phase 5: Dev Tools & Export -- COMPLETE
- Enhanced debug panel (`WaveDebugPanel` from `wavy-bavy/devtools`): section list, color swatches, pattern/amplitude/frequency, boundary outlines, collapsible, configurable position
- Pattern gallery (`WavePatternGallery`): mini SVG previews for all patterns, `onSelect` callback, standalone (no context)
- SVG export (`exportWaveAsSVG`): deterministic config-based generation, stroke/shadow support, `downloadSVG` browser helper
- Raster export (`exportWaveAsRaster`): PNG/WebP via Canvas, scale factor, `downloadRaster` helper (browser-only)
- Clip-path clipboard (`generateClipPathCSS`, `copyClipPathToClipboard`): wraps existing clip-path utility
- Preset introspection (`resolvePreset`, `getAllPresets`): fully hydrated preset configs with no undefined fields
- Keyboard debug toggle (Ctrl+Shift+D), `debug` on WaveContextValue, `debugMeta` on SectionRegistration
- Separate `wavy-bavy/devtools` entry point (zero bytes in production)
- 225 unit tests across 14 files
- Build: ESM devtools 18.65 KB, index 55.79 KB (unchanged)
### Phase 6: Multi-Framework Support -- COMPLETE
- `<wavy-section>` web component (Shadow DOM, `<slot>` content projection, 12 observed attributes)
- Extracted pure keyframe generators to `src/utils/keyframes.ts` (no React dependency)
- Web component reuses `generatePath`, `KEYFRAME_GENERATORS`, `DEFAULT_VIEWBOX_WIDTH` from core
- SSR-safe: `customElements.define` guarded, all browser APIs guarded
- `prefers-reduced-motion` media query listener auto-disables animations
- Safe DOM construction (no innerHTML — uses `createElementNS` for SVG)
- Separate `wavy-bavy/web-component` entry point (zero React in bundle)
- `WavySectionAttributes` TypeScript interface for type-safe attribute access
- Next.js and Remix already supported (all client files have `'use client'`, SSR-safe)
- Astro supported via `@astrojs/react` (React) or native web component
- 257 unit tests across 17 files (32 new: web-component, keyframes, SSR safety)
- Build: ESM web-component 11.35 KB, index 55.87 KB (unchanged)
### Phase 7: NPM Publishing & CI/CD -- COMPLETE
- GitHub Actions CI workflow (Node 18/20/22 matrix, lint, test, build, size check)
- GitHub Actions publish workflow (NPM publish with provenance on tag push, GitHub release)
- Bundle size gates via size-limit for all 6 entry points
- `peerDependenciesMeta` (react/react-dom optional for web-component users)
- Enhanced `prepublishOnly` (lint + test + build)
- CHANGELOG.md (Keep a Changelog format)
- CI badge in README
### Phase 7.5: Wave Polish -- COMPLETE
- Interlocking dual-wave system: 4 modes (interlock, overlap, apart, flush) via `generateInterlockPaths()`
- 3 new pattern generators: flowing (S-curves), ribbon (varying thickness), layered-organic (dense organic)
- SVG path morphing animations: drift, breathe, undulate, ripple-out via CSS `d: path()` interpolation
- `PATH_MORPH_GENERATORS` registry (separate from transform-based `KEYFRAME_GENERATORS`)
- Velocity-adaptive scroll tracker (`createScrollTracker`) with exponential smoothing
- Procedural uniqueness via `autoSeed()` (golden-ratio hash from section position)
- `WaveSeparationConfig` type + `separation` prop on `WaveSection`
- `DEFAULT_SEPARATION` config + 5 new presets (hero-dramatic, section-subtle, section-bold, cta-sweep, clean-divide)
- Web component updated: 5 new attributes (separation-mode, intensity, gap, stroke-color, stroke-width)
- Full backward compatibility: single-path mode remains default
- 300 unit tests across 21 files (43 new)
- Build: ESM index 72.11 KB, web-component 24.57 KB, all entries within size budget
### Phase 8: Library Polish -- COMPLETE
- SVG gradient fills: `GradientConfig` type, `fillGradient` / `containerGradient` props on WaveSection & WaveRenderer
- Linear and radial gradient support via SVG `<linearGradient>` / `<radialGradient>` defs
- Responsive heights: `height={{ sm: 80, md: 120, lg: 180 }}` generates CSS media queries per breakpoint
- Performance: stable filter IDs via `useId()` (no `Math.random()`), ref-based `getSectionBefore`/`getSectionAfter` to prevent unnecessary context re-renders
- Prop validation: amplitude clamped [0,1], frequency clamped [0.1,20] with console warnings
- Improved error messages: unknown patterns/animations list available options
- 318 unit tests across 24 files (18 new: gradient, responsive-height, validation)
- Build: ESM index 75.73 KB (11.22 KB brotli), all entries within size budget
### Phase 8.5: Wave Quality & Interactive Playground -- COMPLETE
- Replaced slide animations (flow, morph, ripple) with true SVG path morphing via CSS `d: path()` interpolation
- `KEYFRAME_GENERATORS` reduced to transform-based only (pulse, bounce); `PATH_MORPH_GENERATORS` expanded to 7 entries
- Legacy keyframe functions preserved with `Legacy` suffix aliases for backward compatibility
- Coordinated dual-path animation sync via `generateDualPathMorphKeyframes()` (no more -3s delay ripping)
- Auto-gradient from adjacent section colors: `autoGradient` prop generates 3-stop gradient from neighboring backgrounds
- `generateAutoGradient()` utility using `interpolateColors()` for midpoint blending
- Section-level frosted glass: `blur.section` extends backdrop-filter to section content area
- SVG edge fix: viewBox extended horizontally (-20/+40) to prevent filter/transform edge clipping
- Interactive playground sandbox (`WaveSandbox`): real-time controls for pattern, shape, animation, effects, stroke, seed
- Web component updated: morph animation duration respects `animation-duration` attribute, dual-path sync fixed
- 326 unit tests across 24 files (8 new/updated)
- Build: ESM index 79.31 KB (11.45 KB brotli), web-component 24.95 KB (3.77 KB brotli), all entries within size budget
### Phase 8.6: Playground Reorganization -- COMPLETE
- Per-section inline controls (`DemoSection` component) replacing global `WaveSandbox`
- Wave edge clipping fix: all 7 path generators + interlock generator extended horizontally (-20/+20px)
- Playground reorganized by feature type (patterns, animations, effects, interaction, advanced, utilities)
- Consolidated ~35 sections down to ~18 with feature-descriptive labels
- Removed all phase tags, badges, and banner sections
- 326 unit tests across 24 files (unchanged)
- Build: ESM index 79.57 KB (11.48 KB brotli), all entries within size budget
### Bugfix: Broken Animations (post-Phase 8.6)
- Fixed path morph animations (flow, ripple, drift, etc.) being invisible: top SVG path was static while bottom path animated, masking half the oscillation. Now both paths animate in sync.
- Fixed hardcoded 10s animation duration: `animationDuration` prop now passed through `WaveRendererProps` to all path morph `<path>` elements (default 4s).
- Increased pulse `scaleY` from 1.15 to 1.3 for visible effect.
- Build: ESM index 85.73 KB, web-component 25.21 KB, all entries within size budget

### Phase 9: Integration into sinthu-consulting -- TODO

## Conventions

- All public API exports go through `src/index.ts`
- Pattern generators follow the `PatternGenerator` interface from `types.ts`
- Animations follow the `AnimationConfig` interface
- Peer dependencies only: react, react-dom (zero external runtime deps)
- `sideEffects: false` for tree-shaking
