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
    animation.ts               # Animation system (flow, pulse, morph, ripple, bounce)
    clip-path.ts               # CSS clip-path polygon generation
  tailwind/
    plugin.ts                  # Tailwind CSS plugin (utility classes, JIT, presets)
    theme.ts                   # Default theme tokens (heights, patterns, durations)
tests/                         # Vitest test suite (106 tests, 8 files)
playground/                    # Vite + React demo app
```

## Architecture

- `WaveProvider` wraps the page and tracks all registered `WaveSection` components via context
- Each `WaveSection` auto-registers on mount, providing its background color and config
- Adjacent sections are detected automatically; wave colors are derived from neighboring backgrounds
- `WaveRenderer` generates SVG paths using pattern generators (smooth, organic, sharp, mountain)
- Animations use CSS keyframe injection via `useWaveAnimation` hook

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

### Phase 3: Effects & Performance -- TODO
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
