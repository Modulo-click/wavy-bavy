# 🌊 wavy-bavy

Seamless, automatic wave transitions between page sections. Context-aware, responsive, and customizable.

[![CI](https://github.com/Modulo-click/wavy-bavy/actions/workflows/ci.yml/badge.svg)](https://github.com/Modulo-click/wavy-bavy/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/wavy-bavy.svg)](https://www.npmjs.com/package/wavy-bavy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Automatic** — Context detects adjacent sections, auto-generates waves
- 🎨 **Color Matching** — Waves auto-match section background colors
- 📐 **6+ Patterns** — Smooth, organic, sharp, layered, mountain, custom
- 🖼️ **Image Clipping** — Background images follow the wave contour
- ✨ **Effects** — Shadows, glow, stroke, blur, texture, inner shadows
- 🎬 **Animations** — Flow, pulse, morph, ripple, bounce, drift, breathe + custom
- 📱 **Responsive** — Different heights per breakpoint
- ♿ **Accessible** — Respects `prefers-reduced-motion`
- 🪶 **Lightweight** — Zero runtime dependencies, tree-shakable

## Installation

```bash
npm install wavy-bavy
```

## Quick Start

```tsx
import { WaveProvider, WaveSection } from 'wavy-bavy'

export default function Page() {
  return (
    <WaveProvider>
      <WaveSection background="#ffffff">
        <h1>Hero Section</h1>
      </WaveSection>

      <WaveSection background="#F7F7F5">
        <h2>Features</h2>
        {/* Wave auto-created: white → light gray */}
      </WaveSection>

      <WaveSection background="#191919">
        <h2 style={{ color: '#fff' }}>Dark Section</h2>
        {/* Wave auto-created: light gray → dark */}
      </WaveSection>
    </WaveProvider>
  )
}
```

That's it! Waves are automatically generated between sections.

## Patterns

```tsx
<WaveSection pattern="smooth" />    {/* Classic sine curve */}
<WaveSection pattern="organic" />   {/* Irregular, natural shape */}
<WaveSection pattern="sharp" />     {/* Geometric angles */}
<WaveSection pattern="mountain" />  {/* Triangle peaks */}
<WaveSection pattern="layered" />   {/* Multiple overlapping waves */}
```

## Presets

```tsx
<WaveSection preset="hero" />       {/* Tall, dramatic wave */}
<WaveSection preset="footer" />     {/* Subtle footer transition */}
<WaveSection preset="dramatic" />   {/* Large organic shape */}
<WaveSection preset="subtle" />     {/* Minimal wave */}
<WaveSection preset="angular" />    {/* Sharp geometric */}
<WaveSection preset="peaks" />      {/* Mountain range */}
```

## Animations

```tsx
<WaveSection animate="flow" />           {/* Gentle horizontal drift */}
<WaveSection animate="pulse" />          {/* Vertical grow/shrink */}
<WaveSection animate="morph" />          {/* Shape morphing */}
<WaveSection animate="ripple" />         {/* Wave ripple */}
<WaveSection animate="bounce" />         {/* Subtle bounce */}
<WaveSection animate="drift" />          {/* Horizontal glide */}
<WaveSection animate="breathe" />        {/* Rhythmic amplitude */}
<WaveSection animate="undulate" />       {/* Full 2D wave motion */}

{/* Control speed */}
<WaveSection animate="flow" animationDuration={6} />
```

## Customization

```tsx
<WaveSection
  background="#1a1a2e"
  pattern="organic"
  height={200}
  amplitude={0.7}
  frequency={2}
  seed={42}                        {/* Reproducible random shape */}
  shadow={{ blur: 15, color: 'rgba(0,0,0,0.2)' }}
  layers={3}
  layerOpacity={0.25}
>
  <h2>Fully Customized</h2>
</WaveSection>
```

## Provider Configuration

```tsx
<WaveProvider
  defaults={{
    height: 150,
    pattern: 'organic',
    amplitude: 0.6,
    respectReducedMotion: true,
  }}
  debug={process.env.NODE_ENV === 'development'}
>
  {/* All WaveSections inherit these defaults */}
</WaveProvider>
```

## API Reference

### `<WaveSection>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `background` | `string` | — | CSS color, gradient, or `url()` |
| `backgroundImage` | `string` | — | Image URL shorthand |
| `clipImage` | `boolean` | `false` | Clip background to wave shape |
| `preset` | `string` | — | Named preset configuration |
| `wavePosition` | `'top' \| 'bottom' \| 'both' \| 'none'` | `'both'` | Where to render waves |
| `height` | `number \| ResponsiveValue` | `120` | Wave height in px |
| `pattern` | `PatternName` | `'smooth'` | Wave pattern shape |
| `amplitude` | `number` | `0.5` | Wave amplitude (0–1) |
| `frequency` | `number` | `1` | Number of wave peaks |
| `phase` | `number` | `0` | Horizontal offset (0–1) |
| `mirror` | `boolean` | `false` | Mirror the wave pattern |
| `seed` | `number` | — | Seed for reproducible random patterns |
| `shadow` | `boolean \| ShadowConfig` | `false` | Drop shadow effect |
| `glow` | `boolean \| GlowConfig` | `false` | Glow effect |
| `stroke` | `boolean \| StrokeConfig` | `false` | Stroke/outline on wave |
| `blur` | `boolean \| BlurConfig` | `false` | Frosted glass effect |
| `texture` | `boolean \| TextureConfig` | `false` | Texture overlay |
| `innerShadow` | `boolean \| InnerShadowConfig` | `false` | Inner shadow effect |
| `animate` | `AnimationName \| false` | `'none'` | Animation type |
| `animationDuration` | `number` | `4` | Animation duration in seconds |
| `layers` | `number` | `1` | Stacked wave layers |
| `layerOpacity` | `number` | `0.3` | Opacity for extra layers |
| `as` | `ElementType` | `'section'` | HTML element type |
| `className` | `string` | — | CSS classes |
| `overlap` | `number` | `0` | Overlap with adjacent section (px) |

### `<WaveProvider>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaults` | `Partial<WaveDefaults>` | — | Global defaults for all sections |
| `debug` | `boolean` | `false` | Show debug overlay |

## License

MIT © [Modulo-click](https://github.com/Modulo-click)
