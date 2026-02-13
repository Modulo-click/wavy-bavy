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
