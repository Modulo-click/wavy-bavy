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
  utils/
    path-generator.ts          # SVG path math (generatePath, flipPathVertically)
    color-utils.ts             # Color parsing, hex/rgb conversion, interpolation
    animation.ts               # Animation system (flow, pulse, morph, ripple, bounce, custom)
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
tests/                         # Vitest test suite (150 tests, 10 files)
playground/                    # Vite + React demo app
```

## Architecture

- `WaveProvider` wraps the page and tracks all registered `WaveSection` components via context
- Each `WaveSection` auto-registers on mount, providing its background color and config
- Adjacent sections are detected automatically; wave colors are derived from neighboring backgrounds
- `WaveRenderer` generates SVG paths using pattern generators (smooth, organic, sharp, mountain)
- Animations use CSS keyframe injection via `useWaveAnimation` hook (supports custom keyframes)
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
### Phase 4: Scroll & Interaction -- TODO
### Phase 5: Dev Tools -- TODO
### Phase 6: Multi-Framework Support -- TODO
### Phase 7: NPM Publishing & CI/CD -- TODO
### Phase 8: Integration into sinthu-consulting -- TODO

## Conventions

- All public API exports go through `src/index.ts`
- Pattern generators follow the `PatternGenerator` interface from `types.ts`
- Animations follow the `AnimationConfig` interface
- Peer dependencies only: react, react-dom (zero external runtime deps)
- `sideEffects: false` for tree-shaking
