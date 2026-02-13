# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Wave Polish** (Phase 7.5): 3 new pattern generators (flowing, ribbon, layered-organic), interlocking dual-wave system with 4 modes (interlock, overlap, apart, flush), SVG path morphing animations (drift, breathe, undulate, ripple-out), velocity-adaptive scroll tracker, procedural uniqueness via `autoSeed()`, 5 new presets
- **Library Polish** (Phase 8): SVG gradient fills (`fillGradient`, `containerGradient`), responsive heights via breakpoint object, prop validation with console warnings, stable filter IDs via `useId()`
- **Wave Quality** (Phase 8.5): True SVG path morphing replacing slide transforms, coordinated dual-path animation sync, auto-gradient from adjacent sections, section-level frosted glass blur, SVG edge fix (viewBox extension)
- **Playground Reorganization** (Phase 8.6): Per-section inline controls (`DemoSection`), wave edge clipping fix (path generators extended -20/+20px), playground reorganized by feature type, consolidated ~35 sections to ~18

## [0.1.0] - 2025-02-13

### Added

- **Core Architecture** (Phase 1): Context system with automatic section registration and adjacent detection, auto color matching, 4 pattern generators (smooth, organic, sharp, mountain), 7 presets, shadow/glow effects via SVG filters, multi-layer depth
- **Animations & Tailwind** (Phase 2): 5 animation types (flow, pulse, morph, ripple, bounce), `useWaveAnimation` hook with CSS keyframe injection, `flipPathVertically` SVG path parser, CSS clip-path polygon generation, Tailwind CSS plugin with utility classes and JIT support
- **Effects & Performance** (Phase 3): `useReducedMotion` hook, lazy rendering via IntersectionObserver, animation throttling, stroke/blur/texture/innerShadow effects, custom keyframes, SVG path optimization (Ramer-Douglas-Peucker), CSS-only `WaveSectionCSS` component, separate `./effects` and `./animations` entry points
- **Scroll & Interaction** (Phase 4): `useScrollProgress` and `useScrollVelocity` hooks, scroll-linked animations, parallax layers, hover effects, intersection callbacks (`onEnter`, `onExit`, `onProgress`)
- **Dev Tools & Export** (Phase 5): Debug panel, pattern gallery, SVG/raster export, clip-path clipboard copy, preset introspection, separate `wavy-bavy/devtools` entry point
- **Multi-Framework Support** (Phase 6): `<wavy-section>` web component (Shadow DOM, slot projection), pure keyframe generators, SSR-safe guards, `prefers-reduced-motion` listener, separate `wavy-bavy/web-component` entry point
- **CI/CD & Publishing** (Phase 7): GitHub Actions CI (Node 18/20/22 matrix), NPM publish workflow with provenance, bundle size gates via size-limit, CHANGELOG

[0.1.0]: https://github.com/Modulo-click/wavy-bavy/releases/tag/v0.1.0
