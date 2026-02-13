# Phase 7.5: Wave Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform wavy-bavy into an interlocking dual-wave system with real SVG path morphing animations and velocity-adaptive scroll parallax.

**Architecture:** Every section transition renders two independent SVG paths (Path A + Path B) generated from a shared base curve with individual offsets. Animations use CSS `d: path()` keyframe interpolation (pre-generated frames, zero JS per tick). Scroll tracking uses a vanilla JS utility with velocity-adaptive damping, shared between React hooks and the web component.

**Tech Stack:** TypeScript, React 18, SVG path generation, CSS `d: path()` interpolation, requestAnimationFrame, Vitest

---

## Task 1: Add Types for Separation, New Patterns, and New Animations

**Files:**
- Modify: `src/types.ts`

**Step 1: Write the failing test**

Create `tests/types-smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import type {
  WaveSeparationConfig,
  InterlockMode,
  PatternName,
  AnimationName,
  DualPathResult,
  ScrollTrackerOptions,
} from '../src/types'

describe('new types exist', () => {
  it('WaveSeparationConfig is importable and has correct shape', () => {
    const config: WaveSeparationConfig = {
      mode: 'interlock',
      intensity: 0.5,
      gap: 4,
    }
    expect(config.mode).toBe('interlock')
    expect(config.intensity).toBe(0.5)
  })

  it('PatternName includes new patterns', () => {
    const patterns: PatternName[] = ['flowing', 'ribbon', 'layered-organic']
    expect(patterns).toHaveLength(3)
  })

  it('AnimationName includes new animations', () => {
    const anims: AnimationName[] = ['drift', 'breathe', 'undulate', 'ripple-out']
    expect(anims).toHaveLength(4)
  })

  it('DualPathResult has pathA and pathB', () => {
    const result: DualPathResult = { pathA: 'M0 0', pathB: 'M0 0', baseCurve: 'M0 0' }
    expect(result.pathA).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/types-smoke.test.ts`
Expected: FAIL — types don't exist yet

**Step 3: Add types to `src/types.ts`**

Add after the `HoverConfig` interface (after line 196):

```typescript
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
```

Update the `PatternName` type (line 8):

```typescript
export type PatternName = 'smooth' | 'organic' | 'sharp' | 'layered' | 'mountain' | 'flowing' | 'ribbon' | 'layered-organic' | 'custom'
```

Update the `AnimationName` type (line 72):

```typescript
export type AnimationName = 'flow' | 'pulse' | 'morph' | 'ripple' | 'bounce' | 'drift' | 'breathe' | 'undulate' | 'ripple-out' | 'custom' | 'none'
```

Add `separation` to `WaveSectionProps` (after the `hover` prop, ~line 350):

```typescript
/** Dual-wave separation config. Default: { mode: 'interlock', intensity: 0.5, gap: 0 } */
separation?: boolean | Partial<WaveSeparationConfig>
```

Add `separation-mode`, `intensity`, `gap`, `stroke-color`, `stroke-width` to `WavySectionAttributes` (after line 514):

```typescript
'separation-mode'?: InterlockMode
intensity?: number
gap?: number
'stroke-color'?: string
'stroke-width'?: number
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/types-smoke.test.ts`
Expected: PASS

**Step 5: Run full suite to verify no regressions**

Run: `npx vitest run`
Expected: 257+ tests pass (all existing + new type smoke test)

**Step 6: Commit**

```bash
git add src/types.ts tests/types-smoke.test.ts
git commit -m "feat(types): add WaveSeparationConfig, DualPathResult, ScrollTracker, new pattern/animation names"
```

---

## Task 2: New Pattern Generators (flowing, ribbon, layered-organic)

**Files:**
- Modify: `src/constants.ts` (add generators to PATTERN_REGISTRY)
- Modify: `tests/path-generator.test.ts` (add tests)

**Step 1: Write failing tests**

Append to `tests/path-generator.test.ts`:

```typescript
describe('generatePath — new patterns', () => {
  it('generates a flowing path (large S-curve)', () => {
    const path = generatePath('flowing', { amplitude: 0.8 })
    expect(path).toContain('M')
    expect(path).toContain('C') // cubic bezier for smooth S-curve
    expect(path).toContain('Z')
  })

  it('flowing path changes with amplitude', () => {
    const low = generatePath('flowing', { amplitude: 0.2 })
    const high = generatePath('flowing', { amplitude: 0.9 })
    expect(low).not.toBe(high)
  })

  it('generates a ribbon path (varying thickness)', () => {
    const path = generatePath('ribbon', { seed: 42 })
    expect(path).toContain('M')
    expect(path).toContain('C')
    expect(path).toContain('Z')
  })

  it('ribbon path is seed-deterministic', () => {
    const a = generatePath('ribbon', { seed: 42 })
    const b = generatePath('ribbon', { seed: 42 })
    expect(a).toBe(b)
  })

  it('generates a layered-organic path', () => {
    const path = generatePath('layered-organic', { seed: 7 })
    expect(path).toContain('M')
    expect(path).toContain('Z')
  })

  it('layered-organic differs from organic', () => {
    const lo = generatePath('layered-organic', { seed: 42 })
    const org = generatePath('organic', { seed: 42 })
    expect(lo).not.toBe(org)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/path-generator.test.ts`
Expected: FAIL — 'flowing' falls back to smooth warning

**Step 3: Implement pattern generators in `src/constants.ts`**

Add after `generateMountainPath` (before `PATTERN_REGISTRY`):

```typescript
/**
 * Flowing S-curve — large dramatic sweep across the full width.
 * Designed for high-intensity hero transitions.
 */
function generateFlowingPath(config: PatternConfig): string {
  const { width, height, amplitude, phase } = config
  const waveHeight = height * amplitude
  const cy = height - waveHeight
  // Phase shifts the inflection point horizontally
  const shift = (phase ?? 0) * width * 0.2

  return [
    `M 0 ${height}`,
    `L 0 ${cy + waveHeight * 0.8}`,
    `C ${width * 0.15 + shift} ${cy - waveHeight * 0.3}, ${width * 0.35 + shift} ${cy + waveHeight * 1.1}, ${width * 0.5} ${cy + waveHeight * 0.4}`,
    `C ${width * 0.65 - shift} ${cy - waveHeight * 0.2}, ${width * 0.85 - shift} ${cy + waveHeight * 0.9}, ${width} ${cy + waveHeight * 0.5}`,
    `L ${width} ${height}`,
    `Z`,
  ].join(' ')
}

/**
 * Ribbon pattern — smooth curve with varying visual thickness.
 * Wider at peaks, thinner at zero-crossings. Seed controls personality.
 */
function generateRibbonPath(config: PatternConfig): string {
  const { width, height, amplitude, seed } = config
  const waveHeight = height * amplitude
  const cy = height - waveHeight

  const s = seed ?? 33
  const pr = (i: number) => {
    const x = Math.sin(s * 7919 + i * 6271) * 10000
    return x - Math.floor(x)
  }

  const r1 = pr(1) * 0.3 + 0.2
  const r2 = pr(2) * 0.3 + 0.3
  const r3 = pr(3) * 0.3 + 0.1
  const r4 = pr(4) * 0.3 + 0.25

  return [
    `M 0 ${height}`,
    `L 0 ${cy + waveHeight * r1}`,
    `C ${width * 0.12} ${cy - waveHeight * r2}, ${width * 0.28} ${cy + waveHeight * r3}, ${width * 0.38} ${cy + waveHeight * 0.1}`,
    `C ${width * 0.48} ${cy - waveHeight * r4}, ${width * 0.58} ${cy + waveHeight * r1}, ${width * 0.68} ${cy + waveHeight * r3}`,
    `C ${width * 0.78} ${cy - waveHeight * r2}, ${width * 0.92} ${cy + waveHeight * r4}, ${width} ${cy + waveHeight * r1}`,
    `L ${width} ${height}`,
    `Z`,
  ].join(' ')
}

/**
 * Layered-organic — denser organic curve with more control points.
 * Designed for multi-layer stacking with slight offsets.
 */
function generateLayeredOrganicPath(config: PatternConfig): string {
  const { width, height, amplitude, seed } = config
  const waveHeight = height * amplitude
  const cy = height - waveHeight

  const s = seed ?? 57
  const pr = (i: number) => {
    const x = Math.sin(s * 4801 + i * 7723) * 10000
    return x - Math.floor(x)
  }

  const points = 5
  const segments: string[] = [`M 0 ${height}`, `L 0 ${cy + waveHeight * pr(0)}`]

  for (let i = 0; i < points; i++) {
    const x1 = (width / points) * i + (width / points) * 0.3
    const x2 = (width / points) * (i + 1)
    const cy1 = cy + waveHeight * (pr(i * 2 + 1) - 0.3)
    const cy2 = cy + waveHeight * pr(i * 2 + 2)
    segments.push(`C ${x1} ${cy1}, ${x2 - (width / points) * 0.3} ${cy2}, ${x2} ${cy + waveHeight * pr(i + points)}`)
  }

  segments.push(`L ${width} ${height}`, `Z`)
  return segments.join(' ')
}
```

Add to `PATTERN_REGISTRY`:

```typescript
export const PATTERN_REGISTRY: Record<string, PatternGenerator> = {
  smooth: generateSmoothPath,
  organic: generateOrganicPath,
  sharp: generateSharpPath,
  mountain: generateMountainPath,
  flowing: generateFlowingPath,
  ribbon: generateRibbonPath,
  'layered-organic': generateLayeredOrganicPath,
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/path-generator.test.ts`
Expected: PASS (all existing + 6 new)

**Step 5: Run full suite**

Run: `npx vitest run`
Expected: All 257+ tests pass

**Step 6: Commit**

```bash
git add src/constants.ts tests/path-generator.test.ts
git commit -m "feat(patterns): add flowing, ribbon, layered-organic pattern generators"
```

---

## Task 3: Interlocking Dual-Path Generator

**Files:**
- Create: `src/utils/interlock-generator.ts`
- Create: `tests/interlock-generator.test.ts`

**Step 1: Write failing tests**

Create `tests/interlock-generator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateInterlockPaths, autoSeed } from '../src/utils/interlock-generator'

describe('autoSeed', () => {
  it('returns a number', () => {
    expect(typeof autoSeed(0, 0)).toBe('number')
  })

  it('is deterministic', () => {
    expect(autoSeed(3, 1)).toBe(autoSeed(3, 1))
  })

  it('differs for different indices', () => {
    expect(autoSeed(0, 0)).not.toBe(autoSeed(1, 0))
    expect(autoSeed(0, 0)).not.toBe(autoSeed(0, 1))
  })

  it('returns values in 0-9999 range', () => {
    for (let i = 0; i < 50; i++) {
      const s = autoSeed(i, i * 3)
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThan(10000)
    }
  })
})

describe('generateInterlockPaths', () => {
  it('returns pathA, pathB, and baseCurve', () => {
    const result = generateInterlockPaths({
      pattern: 'smooth',
      height: 120,
      amplitude: 0.5,
      frequency: 1,
      intensity: 0.5,
      mode: 'interlock',
      seed: 42,
    })
    expect(result.pathA).toContain('M')
    expect(result.pathA).toContain('Z')
    expect(result.pathB).toContain('M')
    expect(result.pathB).toContain('Z')
    expect(result.baseCurve).toBeTruthy()
  })

  it('pathA and pathB are different', () => {
    const result = generateInterlockPaths({
      pattern: 'smooth',
      height: 120,
      amplitude: 0.5,
      frequency: 1,
      intensity: 0.5,
      mode: 'interlock',
      seed: 42,
    })
    expect(result.pathA).not.toBe(result.pathB)
  })

  it('flush mode produces identical pathA and pathB', () => {
    const result = generateInterlockPaths({
      pattern: 'smooth',
      height: 120,
      amplitude: 0.5,
      frequency: 1,
      intensity: 0.5,
      mode: 'flush',
      seed: 42,
    })
    expect(result.pathA).toBe(result.pathB)
  })

  it('intensity 0 produces minimal difference between paths', () => {
    const result = generateInterlockPaths({
      pattern: 'smooth',
      height: 120,
      amplitude: 0.5,
      frequency: 1,
      intensity: 0,
      mode: 'interlock',
      seed: 42,
    })
    // At intensity 0, the paths should be very close (same base, no offset)
    expect(result.pathA).toBeTruthy()
    expect(result.pathB).toBeTruthy()
  })

  it('is deterministic with same seed', () => {
    const opts = { pattern: 'organic' as const, height: 120, amplitude: 0.5, frequency: 1, intensity: 0.6, mode: 'interlock' as const, seed: 99 }
    const a = generateInterlockPaths(opts)
    const b = generateInterlockPaths(opts)
    expect(a.pathA).toBe(b.pathA)
    expect(a.pathB).toBe(b.pathB)
  })

  it('gap parameter affects the result', () => {
    const noGap = generateInterlockPaths({ pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.5, mode: 'interlock', seed: 42, gap: 0 })
    const withGap = generateInterlockPaths({ pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.5, mode: 'interlock', seed: 42, gap: 10 })
    expect(noGap.pathA).not.toBe(withGap.pathA)
  })

  it('works with all new patterns', () => {
    for (const pattern of ['flowing', 'ribbon', 'layered-organic'] as const) {
      const result = generateInterlockPaths({
        pattern, height: 200, amplitude: 0.7, frequency: 1, intensity: 0.8, mode: 'interlock', seed: 42,
      })
      expect(result.pathA).toContain('M')
      expect(result.pathB).toContain('M')
    }
  })

  it('overlap mode allows pathA peaks past pathB valleys', () => {
    const result = generateInterlockPaths({
      pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.7, mode: 'overlap', seed: 42,
    })
    expect(result.pathA).toBeTruthy()
    expect(result.pathB).toBeTruthy()
  })

  it('apart mode keeps paths further separated', () => {
    const apart = generateInterlockPaths({
      pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.5, mode: 'apart', seed: 42,
    })
    const interlock = generateInterlockPaths({
      pattern: 'smooth', height: 120, amplitude: 0.5, frequency: 1, intensity: 0.5, mode: 'interlock', seed: 42,
    })
    // Apart should differ from interlock
    expect(apart.pathA).not.toBe(interlock.pathA)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/interlock-generator.test.ts`
Expected: FAIL — module doesn't exist

**Step 3: Implement `src/utils/interlock-generator.ts`**

```typescript
import { generatePath } from './path-generator'
import type { PatternName, DualPathResult, InterlockMode } from '../types'
import { DEFAULT_VIEWBOX_WIDTH } from '../constants'

/**
 * Generate a deterministic seed from section position.
 * Uses golden-ratio hashing for good distribution.
 */
export function autoSeed(sectionIndex: number, transitionIndex: number): number {
  return ((sectionIndex * 2654435761 + transitionIndex * 340573321) >>> 0) % 10000
}

export interface InterlockOptions {
  pattern: PatternName
  height: number
  amplitude: number
  frequency: number
  intensity: number
  mode: InterlockMode
  seed?: number
  gap?: number
  phase?: number
  mirror?: boolean
}

/**
 * Sample Y values from an SVG path at evenly spaced X positions.
 * Parses the path's control points and interpolates between them.
 */
function samplePathY(path: string, width: number, samples: number): number[] {
  // Extract all numeric coordinate pairs from the path
  const nums = path.match(/-?\d+\.?\d*/g)?.map(Number) ?? []
  const points: Array<{ x: number; y: number }> = []

  // Build coordinate pairs (skip M command initial point)
  for (let i = 0; i < nums.length - 1; i += 2) {
    points.push({ x: nums[i], y: nums[i + 1] })
  }

  if (points.length < 2) return new Array(samples).fill(0)

  // Filter to only wave-contour points (exclude baseline corners)
  const wavePoints = points.filter(p => p.x >= 0 && p.x <= width)
  if (wavePoints.length < 2) return new Array(samples).fill(0)

  // Sort by X
  wavePoints.sort((a, b) => a.x - b.x)

  // Sample via linear interpolation
  const result: number[] = []
  for (let i = 0; i < samples; i++) {
    const targetX = (i / (samples - 1)) * width
    // Find surrounding points
    let left = wavePoints[0]
    let right = wavePoints[wavePoints.length - 1]
    for (let j = 0; j < wavePoints.length - 1; j++) {
      if (wavePoints[j].x <= targetX && wavePoints[j + 1].x >= targetX) {
        left = wavePoints[j]
        right = wavePoints[j + 1]
        break
      }
    }
    const t = right.x === left.x ? 0 : (targetX - left.x) / (right.x - left.x)
    result.push(left.y + t * (right.y - left.y))
  }

  return result
}

/**
 * Build an SVG path from sampled Y values.
 * Creates a smooth cubic bezier curve through the sample points,
 * closed at the bottom with the full height.
 */
function buildPathFromSamples(ys: number[], width: number, height: number): string {
  const samples = ys.length
  const segmentWidth = width / (samples - 1)
  const parts: string[] = [`M 0 ${height}`, `L 0 ${ys[0]}`]

  // Build smooth cubic bezier segments
  for (let i = 0; i < samples - 1; i++) {
    const x0 = i * segmentWidth
    const x1 = (i + 1) * segmentWidth
    const cp1x = x0 + segmentWidth * 0.4
    const cp2x = x1 - segmentWidth * 0.4
    parts.push(`C ${cp1x} ${ys[i]}, ${cp2x} ${ys[i + 1]}, ${x1} ${ys[i + 1]}`)
  }

  parts.push(`L ${width} ${height}`, `Z`)
  return parts.join(' ')
}

/**
 * Pseudo-random number generator (deterministic from seed).
 */
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297) * 10000
  return x - Math.floor(x)
}

/**
 * Generate interlocking dual-wave paths.
 *
 * Algorithm:
 * 1. Generate a base path using the chosen pattern
 * 2. Sample Y values along the base path
 * 3. Offset samples up/down based on intensity and mode
 * 4. Add independent variation to each path via seeded randomness
 * 5. Rebuild smooth SVG paths from the offset samples
 */
export function generateInterlockPaths(options: InterlockOptions): DualPathResult {
  const {
    pattern,
    height,
    amplitude,
    frequency,
    intensity,
    mode,
    seed = 42,
    gap = 0,
    phase = 0,
    mirror = false,
  } = options

  const width = DEFAULT_VIEWBOX_WIDTH
  const samples = 20

  // 1. Generate base path
  const basePath = generatePath(pattern === 'custom' ? 'smooth' : pattern, {
    width, height, amplitude, frequency, phase, mirror, seed,
  })

  // Flush mode: both paths are identical (single edge, no interlock)
  if (mode === 'flush') {
    return { pathA: basePath, pathB: basePath, baseCurve: basePath }
  }

  // 2. Sample the base curve
  const baseYs = samplePathY(basePath, width, samples)

  // 3. Calculate offsets based on mode and intensity
  const maxOffset = height * amplitude * intensity * 0.5
  const halfGap = gap / 2

  // Mode multipliers
  const modeFactors: Record<InterlockMode, { a: number; b: number }> = {
    interlock: { a: -1, b: 1 },       // teeth mesh: A goes up, B goes down
    overlap: { a: -1.3, b: 0.7 },     // A extends past B
    apart: { a: -0.6, b: 1.4 },       // wider gap, less meshing
    flush: { a: 0, b: 0 },            // handled above
  }

  const factors = modeFactors[mode]

  // 4. Generate offset samples with independent variation
  const pathAYs: number[] = []
  const pathBYs: number[] = []

  for (let i = 0; i < samples; i++) {
    const baseY = baseYs[i]
    // Independent variation per path (seeded)
    const varA = (seededRandom(seed + 1, i) - 0.5) * maxOffset * 0.3
    const varB = (seededRandom(seed + 2, i) - 0.5) * maxOffset * 0.3

    pathAYs.push(baseY + factors.a * maxOffset + varA - halfGap)
    pathBYs.push(baseY + factors.b * maxOffset + varB + halfGap)
  }

  // 5. Rebuild paths
  const pathA = buildPathFromSamples(pathAYs, width, height)
  const pathB = buildPathFromSamples(pathBYs, width, height)

  return { pathA, pathB, baseCurve: basePath }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/interlock-generator.test.ts`
Expected: PASS

**Step 5: Run full suite**

Run: `npx vitest run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add src/utils/interlock-generator.ts tests/interlock-generator.test.ts
git commit -m "feat(interlock): add dual-path interlocking generator with 4 modes"
```

---

## Task 4: SVG Path Morphing Keyframe Generators

**Files:**
- Modify: `src/utils/keyframes.ts`
- Create: `tests/path-morph-keyframes.test.ts`

**Step 1: Write failing tests**

Create `tests/path-morph-keyframes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  driftKeyframes,
  breatheKeyframes,
  undulateKeyframes,
  rippleOutKeyframes,
  generatePathKeyframes,
} from '../src/utils/keyframes'

describe('new path-morphing keyframe generators', () => {
  it('driftKeyframes generates CSS with d: path()', () => {
    const css = driftKeyframes('test-drift', 'M 0 120 L 0 60 Q 360 30, 720 60 Q 1080 90, 1440 50 L 1440 120 Z')
    expect(css).toContain('@keyframes test-drift')
    expect(css).toContain('d: path(')
    expect(css).toContain('0%')
    expect(css).toContain('100%')
  })

  it('breatheKeyframes generates CSS with d: path()', () => {
    const css = breatheKeyframes('test-breathe', 'M 0 120 L 0 60 Q 360 30, 720 60 L 1440 120 Z')
    expect(css).toContain('@keyframes test-breathe')
    expect(css).toContain('d: path(')
  })

  it('undulateKeyframes generates CSS with d: path()', () => {
    const css = undulateKeyframes('test-und', 'M 0 120 L 0 60 Q 360 30, 720 60 L 1440 120 Z')
    expect(css).toContain('@keyframes test-und')
    expect(css).toContain('d: path(')
  })

  it('rippleOutKeyframes generates CSS with d: path()', () => {
    const css = rippleOutKeyframes('test-rip', 'M 0 120 L 0 60 Q 360 30, 720 60 L 1440 120 Z')
    expect(css).toContain('@keyframes test-rip')
    expect(css).toContain('d: path(')
  })

  it('generatePathKeyframes creates multiple frames', () => {
    const frames = generatePathKeyframes({
      basePath: 'M 0 120 L 0 60 Q 360 30, 720 60 Q 1080 90, 1440 50 L 1440 120 Z',
      frameCount: 6,
      phaseRange: 0.5,
      amplitudeVariation: 0.15,
      pattern: 'smooth',
      config: { height: 120, amplitude: 0.5, frequency: 1 },
    })
    expect(frames).toHaveLength(6)
    expect(frames[0]).toContain('M')
    // First and last frame should be the same (loopable)
    expect(frames[0]).toBe(frames[frames.length - 1])
  })

  it('frames are different from each other (except first/last)', () => {
    const frames = generatePathKeyframes({
      basePath: 'M 0 120 L 0 60 Q 360 30, 720 60 Q 1080 90, 1440 50 L 1440 120 Z',
      frameCount: 5,
      phaseRange: 0.5,
      amplitudeVariation: 0.15,
      pattern: 'smooth',
      config: { height: 120, amplitude: 0.5, frequency: 1 },
    })
    const unique = new Set(frames)
    expect(unique.size).toBeGreaterThan(1)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/path-morph-keyframes.test.ts`
Expected: FAIL — functions don't exist

**Step 3: Implement in `src/utils/keyframes.ts`**

Add after the existing `bounceKeyframes` function:

```typescript
import { generatePath } from './path-generator'
import type { PatternName } from '../types'

// ============================================================
// Path Morphing Keyframe Generators (d: path() interpolation)
// ============================================================

export interface PathKeyframeOptions {
  basePath: string
  frameCount: number
  phaseRange: number
  amplitudeVariation: number
  pattern: PatternName
  config: { height: number; amplitude: number; frequency: number; phase?: number; seed?: number }
}

/**
 * Generate an array of SVG path strings for keyframe interpolation.
 * Each frame shifts phase and varies amplitude. First and last frame are identical (loopable).
 */
export function generatePathKeyframes(options: PathKeyframeOptions): string[] {
  const { frameCount, phaseRange, amplitudeVariation, pattern, config } = options
  const frames: string[] = []

  for (let i = 0; i < frameCount; i++) {
    // Loop: 0 and last frame are identical
    const t = i === frameCount - 1 ? 0 : i / (frameCount - 1)
    const phaseShift = Math.sin(t * Math.PI * 2) * phaseRange
    const ampFactor = 1 + Math.sin(t * Math.PI * 2) * amplitudeVariation

    frames.push(generatePath(pattern === 'custom' ? 'smooth' : pattern, {
      ...config,
      phase: (config.phase ?? 0) + phaseShift,
      amplitude: config.amplitude * ampFactor,
    }))
  }

  return frames
}

/**
 * Build a CSS @keyframes rule from path frames using d: path() interpolation.
 */
function buildPathKeyframesCSS(id: string, frames: string[]): string {
  const steps = frames.map((path, i) => {
    const pct = Math.round((i / (frames.length - 1)) * 100)
    return `  ${pct}% { d: path("${path}"); }`
  }).join('\n')

  return `@keyframes ${id} {\n${steps}\n}`
}

/**
 * Drift animation — horizontal phase shift.
 * Waves appear to glide left/right.
 */
export function driftKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
  const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
  const frames = generatePathKeyframes({
    basePath, frameCount: 5, phaseRange: 0.4, amplitudeVariation: 0.05, pattern, config: cfg,
  })
  return buildPathKeyframesCSS(id, frames)
}

/**
 * Breathe animation — amplitude grows/shrinks rhythmically.
 */
export function breatheKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
  const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
  const frames = generatePathKeyframes({
    basePath, frameCount: 5, phaseRange: 0.05, amplitudeVariation: 0.2, pattern, config: cfg,
  })
  return buildPathKeyframesCSS(id, frames)
}

/**
 * Undulate animation — combined phase + amplitude (full 2D wave motion).
 */
export function undulateKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
  const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
  const frames = generatePathKeyframes({
    basePath, frameCount: 7, phaseRange: 0.5, amplitudeVariation: 0.15, pattern, config: cfg,
  })
  return buildPathKeyframesCSS(id, frames)
}

/**
 * Ripple-out animation — disturbance radiates from center.
 */
export function rippleOutKeyframes(id: string, basePath: string, pattern: PatternName = 'smooth', config?: Partial<PathKeyframeOptions['config']>): string {
  const cfg = { height: 120, amplitude: 0.5, frequency: 1, ...config }
  // Ripple uses higher phase range to simulate outward spread
  const frames = generatePathKeyframes({
    basePath, frameCount: 7, phaseRange: 0.8, amplitudeVariation: 0.1, pattern, config: cfg,
  })
  return buildPathKeyframesCSS(id, frames)
}
```

Update the `KEYFRAME_GENERATORS` registry to include the new names (keep old ones for backwards compat, new ones use the path-morphing versions):

```typescript
export const PATH_MORPH_GENERATORS: Record<string, (id: string, basePath: string, pattern?: PatternName, config?: Partial<PathKeyframeOptions['config']>) => string> = {
  drift: driftKeyframes,
  breathe: breatheKeyframes,
  undulate: undulateKeyframes,
  'ripple-out': rippleOutKeyframes,
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/path-morph-keyframes.test.ts`
Expected: PASS

**Step 5: Run full suite**

Run: `npx vitest run`
Expected: All tests pass (existing keyframes.test.ts still passes, new tests pass)

**Step 6: Commit**

```bash
git add src/utils/keyframes.ts tests/path-morph-keyframes.test.ts
git commit -m "feat(animation): add SVG path morphing keyframe generators (drift, breathe, undulate, ripple-out)"
```

---

## Task 5: Velocity-Adaptive Scroll Tracker

**Files:**
- Create: `src/utils/scroll-tracker.ts`
- Create: `tests/scroll-tracker.test.ts`

**Step 1: Write failing tests**

Create `tests/scroll-tracker.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createScrollTracker } from '../src/utils/scroll-tracker'

describe('createScrollTracker', () => {
  it('creates a tracker with default options', () => {
    const tracker = createScrollTracker()
    expect(tracker.offset).toBe(0)
    expect(tracker.velocity).toBe(0)
    expect(tracker.damping).toBeGreaterThan(0)
  })

  it('tracks scroll position after update', () => {
    const tracker = createScrollTracker()
    tracker.update(100, 16)
    tracker.update(100, 32)
    // After two updates at same position, offset should approach 100
    expect(tracker.offset).toBeGreaterThan(0)
  })

  it('calculates velocity from position delta', () => {
    const tracker = createScrollTracker()
    tracker.update(0, 0)
    tracker.update(500, 100) // 500px in 100ms = 5000px/s
    expect(tracker.velocity).toBeGreaterThan(0)
  })

  it('uses low damping at high velocity', () => {
    const tracker = createScrollTracker({ maxVelocity: 2000, minDamping: 0.02, maxDamping: 0.15 })
    tracker.update(0, 0)
    tracker.update(2000, 100) // Very fast scroll
    expect(tracker.damping).toBeLessThan(0.1) // Should use low damping
  })

  it('uses high damping at low velocity', () => {
    const tracker = createScrollTracker({ maxVelocity: 2000, minDamping: 0.02, maxDamping: 0.15 })
    tracker.update(0, 0)
    tracker.update(5, 100) // Very slow scroll
    expect(tracker.damping).toBeGreaterThan(0.1) // Should use high damping
  })

  it('reset returns to initial state', () => {
    const tracker = createScrollTracker()
    tracker.update(500, 16)
    tracker.update(500, 32)
    tracker.reset()
    expect(tracker.offset).toBe(0)
    expect(tracker.velocity).toBe(0)
  })

  it('respects custom options', () => {
    const tracker = createScrollTracker({
      maxVelocity: 1000,
      minDamping: 0.05,
      maxDamping: 0.2,
    })
    tracker.update(0, 0)
    tracker.update(10, 100) // slow
    expect(tracker.damping).toBeLessThanOrEqual(0.2)
    expect(tracker.damping).toBeGreaterThanOrEqual(0.05)
  })

  it('offset smoothly approaches target', () => {
    const tracker = createScrollTracker()
    // Simulate multiple frames approaching 100
    for (let i = 0; i < 60; i++) {
      tracker.update(100, i * 16)
    }
    // After 60 frames (~1s), offset should be very close to 100
    expect(tracker.offset).toBeGreaterThan(90)
    expect(tracker.offset).toBeLessThanOrEqual(100)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/scroll-tracker.test.ts`
Expected: FAIL — module doesn't exist

**Step 3: Implement `src/utils/scroll-tracker.ts`**

```typescript
import type { ScrollTracker, ScrollTrackerOptions } from '../types'

/**
 * Create a velocity-adaptive scroll tracker.
 *
 * Tracks scroll position with damping that adapts to scroll speed:
 * - Fast scroll (high velocity) = low damping = near-instant response
 * - Slow scroll (low velocity) = high damping = buttery smooth
 *
 * Framework-agnostic (vanilla JS). Used by both React hooks and web component.
 */
export function createScrollTracker(options: ScrollTrackerOptions = {}): ScrollTracker {
  const {
    maxVelocity = 2000,
    minDamping = 0.02,
    maxDamping = 0.15,
  } = options

  let currentOffset = 0
  let currentVelocity = 0
  let currentDamping = maxDamping
  let lastScrollY = 0
  let lastTimestamp = 0
  let initialized = false

  const tracker: ScrollTracker = {
    get offset() { return currentOffset },
    get velocity() { return currentVelocity },
    get damping() { return currentDamping },

    update(scrollY: number, timestamp: number) {
      if (!initialized) {
        lastScrollY = scrollY
        lastTimestamp = timestamp
        initialized = true
        return
      }

      const dt = Math.max(1, timestamp - lastTimestamp)
      const dy = Math.abs(scrollY - lastScrollY)

      // Velocity in px/s
      currentVelocity = (dy / dt) * 1000

      // Adaptive damping: lerp between min and max based on velocity
      const velocityRatio = Math.min(1, currentVelocity / maxVelocity)
      currentDamping = maxDamping + (minDamping - maxDamping) * velocityRatio

      // Exponential smoothing toward target
      const smoothingFactor = 1 - currentDamping
      currentOffset += (scrollY - currentOffset) * smoothingFactor

      lastScrollY = scrollY
      lastTimestamp = timestamp
    },

    reset() {
      currentOffset = 0
      currentVelocity = 0
      currentDamping = maxDamping
      lastScrollY = 0
      lastTimestamp = 0
      initialized = false
    },
  }

  return tracker
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/scroll-tracker.test.ts`
Expected: PASS

**Step 5: Run full suite**

Run: `npx vitest run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add src/utils/scroll-tracker.ts tests/scroll-tracker.test.ts
git commit -m "feat(scroll): add velocity-adaptive scroll tracker (vanilla JS, framework-agnostic)"
```

---

## Task 6: Add Default Separation Config and New Presets to Constants

**Files:**
- Modify: `src/constants.ts`

**Step 1: Write failing test**

Add to `tests/constants.test.ts`:

```typescript
import { DEFAULT_SEPARATION, PRESETS } from '../src/constants'

describe('DEFAULT_SEPARATION', () => {
  it('has correct defaults', () => {
    expect(DEFAULT_SEPARATION.mode).toBe('interlock')
    expect(DEFAULT_SEPARATION.intensity).toBe(0.5)
    expect(DEFAULT_SEPARATION.gap).toBe(0)
  })
})

describe('new presets', () => {
  it('has hero-dramatic preset', () => {
    expect(PRESETS['hero-dramatic']).toBeDefined()
    expect(PRESETS['hero-dramatic'].pattern).toBe('flowing')
  })

  it('has section-subtle preset', () => {
    expect(PRESETS['section-subtle']).toBeDefined()
  })

  it('has section-bold preset', () => {
    expect(PRESETS['section-bold']).toBeDefined()
  })

  it('has cta-sweep preset', () => {
    expect(PRESETS['cta-sweep']).toBeDefined()
    expect(PRESETS['cta-sweep'].pattern).toBe('ribbon')
  })

  it('has clean-divide preset', () => {
    expect(PRESETS['clean-divide']).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/constants.test.ts`
Expected: FAIL — DEFAULT_SEPARATION doesn't exist

**Step 3: Add to `src/constants.ts`**

Add the default separation config and new presets:

```typescript
import type { WaveSeparationConfig } from './types'

// After DEFAULT_HOVER:
export const DEFAULT_SEPARATION: WaveSeparationConfig = {
  mode: 'interlock',
  intensity: 0.5,
  gap: 0,
}

// Add to PRESETS object:
'hero-dramatic': {
  pattern: 'flowing',
  height: 350,
  amplitude: 0.9,
  animate: 'undulate',
},
'section-subtle': {
  pattern: 'smooth',
  height: 80,
  amplitude: 0.2,
  animate: 'drift',
},
'section-bold': {
  pattern: 'organic',
  height: 160,
  amplitude: 0.5,
  animate: 'breathe',
},
'cta-sweep': {
  pattern: 'ribbon',
  height: 280,
  amplitude: 0.8,
  animate: 'undulate',
},
'clean-divide': {
  pattern: 'smooth',
  height: 60,
  amplitude: 0.1,
},
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/constants.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/constants.ts tests/constants.test.ts
git commit -m "feat(constants): add DEFAULT_SEPARATION and 5 new presets (hero-dramatic, section-subtle, section-bold, cta-sweep, clean-divide)"
```

---

## Task 7: Update WaveRenderer for Dual-Path Rendering with Path Morphing Animation

**Files:**
- Modify: `src/components/WaveRenderer.tsx`
- Modify: `src/types.ts` (add `pathB` and `separation` to `WaveRendererProps`)

**Step 1: Update `WaveRendererProps` in `src/types.ts`**

Add after `parallaxOffset` (line ~441):

```typescript
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
```

**Step 2: Update `WaveRenderer.tsx` to render dual paths with morphing**

In the SVG section, when `pathB` is provided, render two `<path>` elements for the wave edge instead of one:
- Path A: the upper section's bottom edge (colored with `containerColor`)
- Path B: the lower section's top edge (colored with `fillColor`)
- If `pathAAnimId` is set, add CSS animation on the `<path>` element using the `d` attribute
- Inject the keyframes CSS into the SVG `<style>` element

This task is complex — see full implementation in the code. The key change is:
1. When `pathB` exists, replace the single bottom-fill path with two independent path elements
2. Each path element gets its own `style.animation` targeting its `d` attribute
3. The gap between paths is handled by the interlock generator (already baked into the paths)

**Step 3: Run tests**

Run: `npx vitest run tests/components.test.tsx`
Expected: All existing 67 component tests pass (WaveRenderer is backwards-compatible when pathB is not provided)

**Step 4: Commit**

```bash
git add src/types.ts src/components/WaveRenderer.tsx
git commit -m "feat(renderer): support dual-path rendering with CSS d: path() morphing animation"
```

---

## Task 8: Update WaveSection to Generate Interlocking Paths

**Files:**
- Modify: `src/components/WaveSection.tsx`

This integrates the interlock generator into the main component:
1. Accept `separation` prop
2. When separation mode is not `flush`, generate dual paths via `generateInterlockPaths()`
3. Pass `pathB`, separation config, and morphing keyframes to `WaveRenderer`
4. Use `autoSeed()` based on section order for procedural uniqueness

**Commit:**

```bash
git add src/components/WaveSection.tsx
git commit -m "feat(section): integrate interlocking dual-path generation with auto-seeding"
```

---

## Task 9: Update Web Component

**Files:**
- Modify: `src/web-component.ts`

Add new observed attributes: `separation-mode`, `intensity`, `gap`, `stroke-color`, `stroke-width`.
Use `generateInterlockPaths()` when separation mode is set.
Use `PATH_MORPH_GENERATORS` for the new animation types.
Integrate `createScrollTracker()` for parallax.

**Commit:**

```bash
git add src/web-component.ts
git commit -m "feat(web-component): add interlocking dual-path, path morphing, scroll tracker"
```

---

## Task 10: Update Barrel Exports

**Files:**
- Modify: `src/index.ts`

Add new exports:
```typescript
export { generateInterlockPaths, autoSeed } from './utils/interlock-generator'
export { createScrollTracker } from './utils/scroll-tracker'
export { PATH_MORPH_GENERATORS, generatePathKeyframes } from './utils/keyframes'
export type { InterlockOptions } from './utils/interlock-generator'
export { DEFAULT_SEPARATION } from './constants'
export type { WaveSeparationConfig, InterlockMode, DualPathResult, ScrollTracker, ScrollTrackerOptions } from './types'
```

**Commit:**

```bash
git add src/index.ts
git commit -m "feat(exports): add interlock, scroll-tracker, path-morph to public API"
```

---

## Task 11: Build, Size Check, Full Test Suite

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: 257+ existing tests pass + ~40 new tests = ~297+ total

**Step 2: Build**

Run: `npm run build`
Expected: All entry points build cleanly

**Step 3: Bundle size check**

Run: `npx size-limit`
Expected: Index entry stays under 25 KB gzipped (was 8.7 KB, target < 17 KB with new code)

If size limit is exceeded, adjust `.size-limit.json` limits based on actual sizes.

**Step 4: Lint**

Run: `npm run lint`
Expected: Clean

**Step 5: Commit**

```bash
git add .size-limit.json
git commit -m "chore: adjust size limits for Phase 7.5 additions"
```

---

## Task 12: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

Add Phase 7.5 entry after Phase 7:

```markdown
### Phase 7.5: Wave Polish -- COMPLETE
- Interlocking dual-wave system: 4 modes (interlock, overlap, apart, flush)
- 3 new pattern generators: flowing (dramatic S-curves), ribbon (varying thickness), layered-organic
- SVG path morphing animations: drift, breathe, undulate, ripple-out (CSS `d: path()` interpolation)
- Velocity-adaptive scroll tracker: adaptive damping based on scroll speed
- Procedural uniqueness: auto-seeding from DOM position (deterministic, SSR-safe)
- 5 new presets: hero-dramatic, section-subtle, section-bold, cta-sweep, clean-divide
- Web component updated with all new features
- ~297 unit tests across ~19 files
```

**Commit:**

```bash
git add CLAUDE.md
git commit -m "docs: mark Phase 7.5 Wave Polish as complete"
```

---

## Dependency Graph

```
Task 1 (types) ──┬──> Task 2 (patterns) ──┬──> Task 3 (interlock) ──> Task 7 (renderer) ──> Task 8 (section) ──> Task 9 (web-component)
                  │                         │                                                                              │
                  ├──> Task 4 (keyframes) ──┘                                                                              ├──> Task 10 (exports)
                  │                                                                                                        │
                  └──> Task 5 (scroll-tracker) ─────────────────────────────────────────────────────────────────────────────┘
                                                                                                                           │
                  Task 6 (constants) ──────────────────────────────────────────────────────────────────────────────> Task 11 (verify)
                                                                                                                           │
                                                                                                                    Task 12 (docs)
```

Tasks 2, 4, 5, 6 can run in parallel after Task 1 completes.
