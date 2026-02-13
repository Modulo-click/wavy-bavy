# Phase 7.5: Wave Polish — Design Document

**Date:** 2026-02-13
**Status:** Approved
**Scope:** wavy-bavy core library improvements before Phase 8 (sinthu-consulting integration)

---

## Overview

Phase 7.5 transforms wavy-bavy from a static SVG wave divider into a living, interlocking dual-wave system with real 2D wave motion and scroll-responsive parallax. Every section transition renders two independent wave paths that interlock like zipper teeth, each with its own procedurally generated shape.

## 1. Interlocking Dual-Wave System

### Core Concept

Each section transition renders **two independent SVG paths** — one for the bottom edge of the section above (Path A) and one for the top edge of the section below (Path B). They interlock like zipper teeth.

### Generation Algorithm

1. Generate a **shared base curve** — a sine/bezier function sampled at N control points across the viewport width
2. **Path A** is offset above the base curve (section A's "teeth" extend downward)
3. **Path B** is offset below the base curve (section B's "teeth" extend upward)
4. Each path receives its own **variation seed** that adds independent wobble to the control points — they are clearly interlocking but not perfect mirrors
5. **Interlock depth** (how deep the teeth penetrate) is controlled by the `intensity` parameter

### Intensity Levels

| Intensity | Visual | Height | Use case |
|-----------|--------|--------|----------|
| `0.1 - 0.3` | Subtle — barely any teeth, gentle undulation | 40-80px | Between similar-colored sections |
| `0.4 - 0.6` | Medium — clear interlocking, balanced | 100-160px | Standard section transitions |
| `0.7 - 0.9` | Dramatic — deep teeth, bold S-curves | 200-400px | Hero/CTA transitions |
| `1.0` | Maximum — large flowing shapes | 400-600px | Full-bleed dramatic dividers |

### Interaction Modes

| Mode | Behavior |
|------|----------|
| `'interlock'` | Default. Teeth mesh together. Configurable `gap` (0 to N pixels) between the two paths. |
| `'overlap'` | Teeth overlap — Path A's peaks extend past Path B's valleys. Layered/woven effect. |
| `'apart'` | Teeth don't reach each other. Clear space between, like a loose zipper. Reveals background. |
| `'flush'` | No teeth. Single flat or gently curved edge. Simple clean divider. |

All modes support a `gap` parameter (px) to add visible space between edges. A `strokeColor` and `strokeWidth` can be applied to either or both path edges.

### TypeScript Interface

```typescript
interface WaveSeparationConfig {
  mode: 'interlock' | 'overlap' | 'apart' | 'flush'
  intensity: number        // 0.0 - 1.0
  gap: number             // px between paths (default: 0)
  strokeColor?: string    // edge stroke color
  strokeWidth?: number    // edge stroke width (px)
}
```

## 2. Animation System — Real 2D Wave Motion

### Approach: Multi-Path SVG `d` Attribute Interpolation

Pre-generate 6-8 SVG path keyframes per wave edge, each with shifted `phase` and varied `amplitude`. Use CSS `@keyframes` with `d: path(...)` interpolation — the browser handles smooth morphing natively with zero JS per frame.

### Path Keyframe Generation

For each wave edge, generate frames by incrementally shifting parameters:
- Frame N: `phase = basePhase + (N / totalFrames) * phaseRange`
- Frame N: `amplitude = baseAmplitude * (1 + sin(N / totalFrames * 2PI) * amplitudeVariation)`

This produces a wave that drifts horizontally AND breathes vertically simultaneously.

### Independent Timing

Path A and Path B animate independently but stay coordinated:
- Path B's animation is offset ~30% behind Path A's timing
- This creates a "chasing" effect where the interlocking teeth appear to ripple in sequence

### Animation Variants

| Name | Effect | Duration | Suited for |
|------|--------|----------|------------|
| `'drift'` | Horizontal phase shift — peaks glide left/right | 8-12s | Default, all sections |
| `'breathe'` | Amplitude grows/shrinks rhythmically | 6-10s | Subtle, ambient sections |
| `'undulate'` | Combined phase + amplitude — full 2D wave motion | 10-16s | Hero, dramatic transitions |
| `'ripple-out'` | Disturbance radiates from center outward | 8-12s | Interactive, scroll trigger |
| `'none'` | Static. No animation. | - | Performance, reduced motion |

### Fallback Strategy

1. **Modern browsers (95%+):** CSS `d: path()` keyframes — GPU-composited, zero JS
2. **Older browsers:** SMIL `<animate attributeName="d">` — SVG-native
3. **Very old / reduced motion:** Static path, no animation

### CSS Keyframe Example

```css
@keyframes wavy-drift-a {
  0%   { d: path("M 0 120 L 0 84 Q 360 36, 720 72 Q 1080 108, 1440 60 L 1440 120 Z"); }
  25%  { d: path("M 0 120 L 0 72 Q 360 48, 720 84 Q 1080 96, 1440 48 L 1440 120 Z"); }
  50%  { d: path("M 0 120 L 0 60 Q 360 60, 720 96 Q 1080 84, 1440 72 L 1440 120 Z"); }
  75%  { d: path("M 0 120 L 0 48 Q 360 72, 720 60 Q 1080 72, 1440 84 L 1440 120 Z"); }
  100% { d: path("M 0 120 L 0 84 Q 360 36, 720 72 Q 1080 108, 1440 60 L 1440 120 Z"); }
}
```

## 3. Scroll-Responsive Parallax

### Velocity-Adaptive Damping

The wave parallax offset tracks scroll position with damping that adapts to scroll speed:

| Scroll Speed | Damping | Effect |
|-------------|---------|--------|
| Fast (>1000px/s) | 0.02 | Near-instant response — no perceived lag |
| Medium (200-1000px/s) | 0.08 | Smooth tracking |
| Slow (<200px/s) | 0.15 | Buttery smooth, no jitter |
| Stopped | Settle to exact | No drift |

### Formula

```
velocity = abs(currentScroll - lastScroll) / deltaTime
damping = lerp(0.02, 0.15, 1 - clamp(velocity / maxVelocity, 0, 1))
currentOffset += (targetOffset - currentOffset) * (1 - damping)
```

### Differential Parallax

Path A and Path B have **different parallax speeds**:
- Path A: speed `0.3` (moves more)
- Path B: speed `0.2` (moves less)

As the user scrolls, the interlocking gap appears to breathe open/closed, enhancing depth.

### Scroll-Linked Animation Speed

Wave animation duration scales with scroll velocity:
- Stopped: ambient pace (full duration)
- Scrolling: faster undulation (duration * 0.5 at peak velocity)
- Implemented via CSS custom property `--wave-duration` updated in rAF

### Shared Utility

The velocity-adaptive scroll tracker is a vanilla JS utility (no React dependency):

```typescript
function createScrollTracker(element: HTMLElement, options: ScrollTrackerOptions): ScrollTracker
```

Used by both the React `useScrollProgress` hook and the web component.

## 4. New Pattern Generators

### New Patterns

| Pattern | Shape | Inspiration |
|---------|-------|-------------|
| `'flowing'` | Large sweeping S-curve — one or two dramatic bends across full width | Baulig hero wave (image 3) |
| `'ribbon'` | Smooth ribbon with varying thickness — wider at peaks, thinner at crossings | Organic blob-wave (image 4) |
| `'layered-organic'` | Multiple organic curves stacked with slight offsets | Multi-layer depth |

These join the existing 4 patterns (`smooth`, `organic`, `sharp`, `mountain`) for 7 total.

The `flowing` and `ribbon` patterns are specifically designed for the interlocking system — they produce curves that interlock beautifully at high intensity.

### New Presets

| Preset | Pattern | Intensity | Mode | Animation | Use case |
|--------|---------|-----------|------|-----------|----------|
| `'hero-dramatic'` | `flowing` | `0.9` | `interlock` | `undulate` | Hero to first section |
| `'section-subtle'` | `smooth` | `0.2` | `interlock` | `drift` | Between similar sections |
| `'section-bold'` | `organic` | `0.5` | `interlock` | `breathe` | Standard contrasting sections |
| `'cta-sweep'` | `ribbon` | `0.8` | `overlap` | `undulate` | Before CTA/footer |
| `'clean-divide'` | `smooth` | `0.1` | `flush` | `none` | Minimal divider |

## 5. Procedural Uniqueness

### Auto-Seeding from Position

Each wave transition gets a unique, deterministic seed based on DOM position:

```typescript
function autoSeed(sectionIndex: number, transitionIndex: number): number {
  return ((sectionIndex * 2654435761 + transitionIndex * 340573321) >>> 0) % 10000
}
```

Properties:
- Same page always produces the same waves (deterministic, SSR-safe)
- Different transitions on the same page always get different shapes
- The seed controls: control point positions, amplitude variations, phase offsets
- Manual `seed` prop overrides auto-seeding

## 6. Web Component Updates

The `<wavy-section>` web component gains:

### New Attributes

- `separation-mode`: `'interlock' | 'overlap' | 'apart' | 'flush'`
- `intensity`: `number` (0.0 - 1.0)
- `gap`: `number` (px)
- `stroke-color`: `string`
- `stroke-width`: `number`
- `parallax-speed-a`: `number`
- `parallax-speed-b`: `number`
- `animate` values expanded: `'drift' | 'breathe' | 'undulate' | 'ripple-out' | 'none'`

### Shared Utilities

Extract to framework-agnostic modules:
- `src/utils/interlock-generator.ts` — dual-path generation with base curve + offsets
- `src/utils/scroll-tracker.ts` — velocity-adaptive damping (vanilla JS)
- `src/utils/keyframes.ts` — enhanced with `d: path()` keyframe generation

## 7. Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| CREATE | `src/utils/interlock-generator.ts` | Dual-path interlocking generation algorithm |
| CREATE | `src/utils/scroll-tracker.ts` | Vanilla JS velocity-adaptive scroll tracker |
| MODIFY | `src/utils/keyframes.ts` | Add `d: path()` keyframe generators for drift, breathe, undulate, ripple-out |
| MODIFY | `src/utils/path-generator.ts` | Add flowing, ribbon, layered-organic pattern generators |
| MODIFY | `src/utils/animation.ts` | New `useWaveAnimation` supporting path morphing + scroll-linked speed |
| MODIFY | `src/constants.ts` | New patterns in registry, new presets, default separation config |
| MODIFY | `src/types.ts` | `WaveSeparationConfig`, updated `AnimationName`, new pattern names |
| MODIFY | `src/components/WaveRenderer.tsx` | Render dual paths, apply `d: path()` animation |
| MODIFY | `src/components/WaveSection.tsx` | Accept `separation`, `intensity` props, pass to renderer |
| MODIFY | `src/web-component.ts` | Add new attributes, dual-path rendering, scroll tracker |
| CREATE | `tests/interlock-generator.test.ts` | Dual-path generation tests |
| CREATE | `tests/scroll-tracker.test.ts` | Velocity-adaptive damping tests |
| MODIFY | `tests/animation.test.ts` | Tests for new animation variants |
| MODIFY | `tests/path-generator.test.ts` | Tests for flowing, ribbon, layered-organic |

## 8. Success Criteria

1. Two independent wave paths render for each section transition
2. Paths interlock like zipper teeth with configurable intensity and mode
3. Wave shapes undulate with real 2D motion (SVG path morphing, not CSS transforms)
4. Each transition has a unique procedurally generated shape
5. Scroll parallax responds instantly at high speed, smoothly at low speed
6. Path A and Path B have differential parallax creating depth
7. All new features work in both React components and web component
8. `prefers-reduced-motion` disables animations gracefully
9. Bundle size increase < 8 KB gzipped for index entry point
10. All existing 257 tests still pass, new tests added for all new utilities
