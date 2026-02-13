import { useState, useCallback } from 'react'
import { WaveProvider, WaveSection, WaveSectionCSS, useScrollProgress } from 'wavy-bavy'
import DevToolsDemo from './DevToolsDemo'

// ── Scroll Progress Indicator (uses useScrollProgress hook directly) ──
function ScrollProgressBar() {
    const [ref, progress] = useScrollProgress()
    return (
        <div ref={ref} style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}>
            <div
                style={{
                    height: 4,
                    width: `${progress * 100}%`,
                    background: 'linear-gradient(90deg, #6c5ce7, #0984e3, #00b894)',
                    transition: 'width 0.05s linear',
                }}
            />
        </div>
    )
}

export default function App() {
    // ── State for intersection callback demos ──
    const [callbackLog, setCallbackLog] = useState<string[]>([])
    const [sectionProgress, setSectionProgress] = useState(0)

    const handleEnter = useCallback(() => {
        setCallbackLog(prev => [...prev.slice(-4), `onEnter @ ${new Date().toLocaleTimeString()}`])
    }, [])

    const handleExit = useCallback(() => {
        setCallbackLog(prev => [...prev.slice(-4), `onExit  @ ${new Date().toLocaleTimeString()}`])
    }, [])

    const handleProgress = useCallback((p: number) => {
        setSectionProgress(p)
    }, [])

    return (
        <>
            <ScrollProgressBar />

            <WaveProvider debug={false}>
                {/* ============================================================ */}
                {/* 1. Hero -- White */}
                {/* ============================================================ */}
                <WaveSection background="#ffffff" wavePosition="bottom">
                    <div className="section-content">
                        <div className="badge" style={{ background: '#e8e4ff', color: '#6c5ce7' }}>
                            Playground
                        </div>
                        <h1>wavy-bavy</h1>
                        <p>
                            Seamless, automatic wave transitions between page sections.
                            Scroll down to see every pattern, preset, effect, and interaction in action.
                        </p>
                        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <span className="phase-tag phase-1">Phase 1-2: Core</span>
                            <span className="phase-tag phase-3">Phase 3: Effects</span>
                            <span className="phase-tag phase-4">Phase 4: Scroll</span>
                            <span className="phase-tag phase-5">Phase 5: DevTools</span>
                            <span className="phase-tag phase-75">Phase 7.5: Wave Polish</span>
                        </div>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* 2. Smooth Pattern -- Light Gray */}
                {/* ============================================================ */}
                <WaveSection background="#F0F0EE" pattern="smooth">
                    <div className="section-content">
                        <div className="badge" style={{ background: '#d4edda', color: '#155724' }}>
                            Pattern
                        </div>
                        <h2>Smooth</h2>
                        <p>
                            Classic sine-wave curve. The default pattern -- clean and elegant.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Default Amplitude</h3>
                                <p><code>amplitude: 0.5</code> -- Balanced curve height</p>
                            </div>
                            <div className="demo-card light">
                                <h3>Single Frequency</h3>
                                <p><code>frequency: 1</code> -- One smooth peak</p>
                            </div>
                            <div className="demo-card light">
                                <h3>Auto Colors</h3>
                                <p>Wave colors auto-detected from section backgrounds</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* 3. Organic Pattern -- Dark */}
                {/* ============================================================ */}
                <WaveSection background="#1a1a2e" pattern="organic" seed={42}>
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(108, 92, 231, 0.25)', color: '#a29bfe' }}>
                            Pattern
                        </div>
                        <h2>Organic</h2>
                        <p>
                            Irregular, natural blob-like shape. Uses a seed for reproducible randomness.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Seeded Randomness</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>seed: 42</code> -- Same shape every render</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Context-Aware</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Detects adjacent sections automatically</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* 4. Sharp Pattern -- Teal */}
                {/* ============================================================ */}
                <WaveSection background="#00b894" pattern="sharp" frequency={3} amplitude={0.6}>
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Pattern
                        </div>
                        <h2>Sharp</h2>
                        <p>
                            Geometric angular waves. Multiple peaks with adjustable frequency.
                        </p>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* 5. Mountain Pattern -- Warm */}
                {/* ============================================================ */}
                <WaveSection background="#ff7675" pattern="mountain" frequency={4} amplitude={0.7}>
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Pattern
                        </div>
                        <h2>Mountain</h2>
                        <p>
                            Triangle peak shapes. Creates a mountain range silhouette effect.
                        </p>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* 6. Animation: Flow -- Ocean Blue */}
                {/* ============================================================ */}
                <WaveSection
                    background="#0984e3"
                    pattern="smooth"
                    animate="flow"
                    animationDuration={4}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Animation
                        </div>
                        <h2>Flow Animation</h2>
                        <p>
                            Smooth horizontal wave motion. Watch the waves glide left-to-right.
                        </p>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* 7. Animation: Pulse -- Emerald */}
                {/* ============================================================ */}
                <WaveSection
                    background="#00cec9"
                    pattern="organic"
                    seed={77}
                    animate="pulse"
                    animationDuration={3}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Animation
                        </div>
                        <h2>Pulse Animation</h2>
                        <p>
                            Rhythmic scale pulse -- the wave breathes in and out.
                        </p>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* 8. Animation: Bounce -- Coral */}
                {/* ============================================================ */}
                <WaveSection
                    background="#e17055"
                    pattern="sharp"
                    frequency={2}
                    animate="bounce"
                    animationDuration={2}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Animation
                        </div>
                        <h2>Bounce Animation</h2>
                        <p>
                            Playful vertical bounce effect -- elastic and fun.
                        </p>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* PHASE 3: EFFECTS SHOWCASE */}
                {/* ============================================================ */}

                {/* ── Phase 3 Banner ── */}
                <WaveSection background="#2d3436" pattern="smooth">
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <span className="phase-tag phase-3" style={{ fontSize: '1rem' }}>Phase 3</span>
                        <h1 style={{ marginTop: 12 }}>Effects & Performance</h1>
                        <p>
                            Stroke outlines, frosted glass blur, texture overlays, inner shadows,
                            custom keyframes, and CSS-only mode.
                        </p>
                    </div>
                </WaveSection>

                {/* ── 3a. Stroke / Outline Waves ── */}
                <WaveSection
                    background="#ffffff"
                    pattern="smooth"
                    stroke={{ color: '#6c5ce7', width: 3, fill: true }}
                    shadow={true}
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#e8e4ff', color: '#6c5ce7' }}>
                            Phase 3 Effect
                        </div>
                        <h2>Stroke / Outline</h2>
                        <p>
                            Adds an SVG stroke to the wave path. Combine with fill or use stroke-only mode.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Custom Color</h3>
                                <p><code>color: '#6c5ce7'</code></p>
                            </div>
                            <div className="demo-card light">
                                <h3>Stroke Width</h3>
                                <p><code>width: 3</code> -- Thick outline</p>
                            </div>
                            <div className="demo-card light">
                                <h3>+ Shadow</h3>
                                <p>Composes with drop shadow effect</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 3b. Stroke-Only (no fill) + Dash ── */}
                <WaveSection
                    background="#f8f9fa"
                    pattern="organic"
                    seed={33}
                    stroke={{ color: '#e17055', width: 2, dashArray: '8 4', fill: false }}
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#ffeaa7', color: '#d63031' }}>
                            Phase 3 Effect
                        </div>
                        <h2>Dashed Stroke (No Fill)</h2>
                        <p>
                            Outline-only wave with a dashed stroke pattern. No fill -- just the contour.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Dashed</h3>
                                <p><code>dashArray: '8 4'</code></p>
                            </div>
                            <div className="demo-card light">
                                <h3>No Fill</h3>
                                <p><code>fill: false</code> -- Outline only</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 3c. Blur / Frosted Glass ── */}
                <WaveSection
                    background="#6c5ce7"
                    pattern="smooth"
                    blur={{ radius: 12, opacity: 0.6, saturation: 1.5 }}
                    animate="flow"
                    animationDuration={6}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Phase 3 Effect
                        </div>
                        <h2>Blur / Frosted Glass</h2>
                        <p>
                            Backdrop-filter blur creates a frosted glass effect on the wave.
                            Combined with flow animation for a dreamy look.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Blur Radius</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>radius: 12</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Saturation</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>saturation: 1.5</code> -- Vibrancy boost</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>+ Flow</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Animated with <code>animate="flow"</code></p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 3d. Texture Overlay ── */}
                <WaveSection
                    background="#0c0c1d"
                    pattern="organic"
                    seed={88}
                    texture={{ type: 'turbulence', frequency: 0.03, octaves: 4, scale: 8, seed: 42 }}
                    glow={{ color: '#00b894', intensity: 15, opacity: 0.4 }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(0, 184, 148, 0.25)', color: '#55efc4' }}>
                            Phase 3 Effect
                        </div>
                        <h2>Texture Overlay</h2>
                        <p>
                            SVG feTurbulence + feDisplacementMap creates a distorted, organic texture.
                            Combined with glow for an ethereal effect.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Turbulence</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>frequency: 0.03</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Displacement</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>scale: 8</code> -- Intense warping</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>+ Glow</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Green glow adds atmosphere</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 3e. Inner Shadow ── */}
                <WaveSection
                    background="#dfe6e9"
                    pattern="smooth"
                    height={160}
                    innerShadow={{ color: 'rgba(0,0,0,0.35)', blur: 12, offsetX: 0, offsetY: 4 }}
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#b2bec3', color: '#2d3436' }}>
                            Phase 3 Effect
                        </div>
                        <h2>Inner Shadow</h2>
                        <p>
                            SVG filter-based inner shadow creates a carved, inset look on the wave.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Blur Radius</h3>
                                <p><code>blur: 12</code> -- Soft inset shadow</p>
                            </div>
                            <div className="demo-card light">
                                <h3>Offset</h3>
                                <p><code>offsetY: 4</code> -- Directional depth</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 3f. Custom Keyframes Animation ── */}
                <WaveSection
                    background="#e84393"
                    pattern="smooth"
                    animate="custom"
                    animationDuration={3}
                    customKeyframes={`
                        0% { transform: translateX(0) skewX(0deg); }
                        25% { transform: translateX(-2%) skewX(-2deg); }
                        50% { transform: translateX(0) skewX(0deg); }
                        75% { transform: translateX(2%) skewX(2deg); }
                        100% { transform: translateX(0) skewX(0deg); }
                    `}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Phase 3 Animation
                        </div>
                        <h2>Custom Keyframes</h2>
                        <p>
                            Write your own CSS @keyframes. This wave uses a custom skew + translate effect.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Custom CSS</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>animate="custom"</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Skew Effect</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>translateX + skewX combined</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 3g. Combined Effects ── */}
                <WaveSection
                    background="#2d3436"
                    pattern="organic"
                    seed={66}
                    height={180}
                    stroke={{ color: 'rgba(108, 92, 231, 0.6)', width: 2, fill: true }}
                    glow={{ color: '#6c5ce7', intensity: 20, opacity: 0.5 }}
                    texture={{ type: 'fractalNoise', frequency: 0.015, octaves: 3, scale: 4, seed: 7 }}
                    innerShadow={{ color: 'rgba(0,0,0,0.3)', blur: 10, offsetX: 0, offsetY: 3 }}
                    animate="morph"
                    animationDuration={8}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(108, 92, 231, 0.3)', color: '#a29bfe' }}>
                            Phase 3 Composition
                        </div>
                        <h2>Combined Effects</h2>
                        <p>
                            All effects compose together: stroke + glow + texture + inner shadow + morph animation.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>4 Effects</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>stroke + glow + texture + innerShadow</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Animated</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>animate="morph"</code> at 8s</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>SVG Filter Pipeline</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>All effects applied via composable SVG filters</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 3h. CSS-Only Mode (WaveSectionCSS) ── */}
                <WaveSectionCSS
                    background="#fdcb6e"
                    pattern="smooth"
                    height={100}
                    amplitude={0.4}
                    wavePosition="both"
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#ffeaa7', color: '#d63031' }}>
                            Phase 3 Mode
                        </div>
                        <h2>CSS-Only Mode</h2>
                        <p>
                            <code>&lt;WaveSectionCSS&gt;</code> uses CSS clip-path polygon instead of SVG.
                            No animation, no context, minimal JS -- perfect for static pages and SSG.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Zero SVG</h3>
                                <p>Pure CSS <code>clip-path: polygon()</code></p>
                            </div>
                            <div className="demo-card light">
                                <h3>Tiny Footprint</h3>
                                <p>No context, no IntersectionObserver, no animation overhead</p>
                            </div>
                            <div className="demo-card light">
                                <h3>Both Edges</h3>
                                <p><code>wavePosition="both"</code> -- Clipped top and bottom</p>
                            </div>
                        </div>
                    </div>
                </WaveSectionCSS>

                {/* ============================================================ */}
                {/* PHASE 4: SCROLL & INTERACTION SHOWCASE */}
                {/* ============================================================ */}

                {/* ── Phase 4 Banner ── */}
                <WaveSection background="#0c0c1d" pattern="mountain" frequency={3} amplitude={0.5}>
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <span className="phase-tag phase-4" style={{ fontSize: '1rem' }}>Phase 4</span>
                        <h1 style={{ marginTop: 12 }}>Scroll & Interaction</h1>
                        <p>
                            Scroll-linked animations, parallax layers, hover effects,
                            intersection callbacks, and scroll velocity detection.
                        </p>
                    </div>
                </WaveSection>

                {/* ── 4a. Hover Effects ── */}
                <WaveSection
                    background="#ffffff"
                    pattern="smooth"
                    hover={{ scale: 1.04, lift: -6, glow: false, transition: 'transform 0.3s ease' }}
                    shadow={true}
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#d4edda', color: '#155724' }}>
                            Phase 4 Interaction
                        </div>
                        <h2>Hover Effects</h2>
                        <p>
                            Hover over the wave below to see it scale up and lift.
                            Uses CSS transforms with smooth transitions.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Scale</h3>
                                <p><code>scale: 1.04</code> -- Grows on hover</p>
                            </div>
                            <div className="demo-card light">
                                <h3>Lift</h3>
                                <p><code>lift: -6</code> -- Moves up 6px</p>
                            </div>
                            <div className="demo-card light">
                                <h3>Smooth</h3>
                                <p><code>transition: '0.3s ease'</code></p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 4b. Hover + Glow Boost ── */}
                <WaveSection
                    background="#2d3436"
                    pattern="organic"
                    seed={55}
                    glow={{ color: '#00cec9', intensity: 20, opacity: 0.5 }}
                    hover={{ scale: 1.03, lift: -4, glow: true }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(0, 206, 201, 0.25)', color: '#81ecec' }}>
                            Phase 4 Interaction
                        </div>
                        <h2>Hover + Glow Boost</h2>
                        <p>
                            Hover intensifies the glow effect. The wave brightens on mouse-over.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Glow Boost</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>glow: true</code> -- Brightens on hover</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Base Glow</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Cyan glow always visible</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 4c. Scroll-Linked Animation ── */}
                <WaveSection
                    background="#0984e3"
                    pattern="smooth"
                    animate="flow"
                    animationDuration={4}
                    scrollAnimate={true}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Phase 4 Scroll
                        </div>
                        <h2>Scroll-Linked Animation</h2>
                        <p>
                            The flow animation is driven by your scroll position instead of time.
                            Scroll up and down to scrub through the animation timeline.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Scroll-Driven</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>scrollAnimate={'{true}'}</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>CSS Trick</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Paused animation + negative delay from scroll progress</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Any Animation</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Works with flow, pulse, morph, bounce, ripple</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 4d. Scroll-Linked Reversed ── */}
                <WaveSection
                    background="#e17055"
                    pattern="sharp"
                    frequency={2}
                    animate="bounce"
                    animationDuration={3}
                    scrollAnimate={{ progress: 'element', reverse: true }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Phase 4 Scroll
                        </div>
                        <h2>Scroll-Linked (Reversed)</h2>
                        <p>
                            Bounce animation scrubbed in reverse as you scroll. The timeline plays backwards.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Reversed</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>reverse: true</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Element Progress</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>progress: 'element'</code> -- Tracks this section</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 4e. Parallax Layers ── */}
                <WaveSection
                    background="#6c5ce7"
                    pattern="smooth"
                    layers={3}
                    layerOpacity={0.3}
                    height={200}
                    parallax={{ speed: 0.5, direction: 'vertical' }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Phase 4 Scroll
                        </div>
                        <h2>Parallax Layers</h2>
                        <p>
                            Each wave layer moves at a different speed as you scroll,
                            creating a depth / parallax effect. Scroll slowly to see the difference.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>3 Layers</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>layers: 3</code> -- Each at different speed</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Speed</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>speed: 0.5</code> -- Base parallax speed</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Depth</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Layer i: speed * (1 + i * 0.15)</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 4f. Parallax (Horizontal) ── */}
                <WaveSection
                    background="#00b894"
                    pattern="organic"
                    seed={44}
                    parallax={{ speed: 0.4, direction: 'horizontal' }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Phase 4 Scroll
                        </div>
                        <h2>Horizontal Parallax</h2>
                        <p>
                            Parallax along the horizontal axis. The wave shifts left/right as you scroll.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Horizontal</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>direction: 'horizontal'</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Speed 0.4</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>speed: 0.4</code></p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 4g. Intersection Callbacks ── */}
                <WaveSection
                    background="#fdcb6e"
                    pattern="smooth"
                    onEnter={handleEnter}
                    onExit={handleExit}
                    onProgress={handleProgress}
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#ffeaa7', color: '#d63031' }}>
                            Phase 4 Callbacks
                        </div>
                        <h2>Intersection Callbacks</h2>
                        <p>
                            <code>onEnter</code>, <code>onExit</code>, and <code>onProgress</code> fire as you scroll.
                        </p>

                        {/* Live progress bar */}
                        <div className="progress-demo">
                            <div className="progress-label">
                                <span>onProgress</span>
                                <span>{(sectionProgress * 100).toFixed(0)}%</span>
                            </div>
                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${sectionProgress * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Event log */}
                        <div className="callback-log">
                            <div className="callback-log-header">Event Log</div>
                            {callbackLog.length === 0 ? (
                                <div className="callback-log-empty">Scroll to trigger events...</div>
                            ) : (
                                callbackLog.map((entry, i) => (
                                    <div key={i} className="callback-log-entry">
                                        <code>{entry}</code>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </WaveSection>

                {/* ── 4h. Everything Combined ── */}
                <WaveSection
                    background="#0c0c1d"
                    pattern="organic"
                    seed={99}
                    height={180}
                    animate="ripple"
                    animationDuration={5}
                    scrollAnimate={true}
                    parallax={{ speed: 0.3 }}
                    hover={{ scale: 1.03, lift: -3, glow: true }}
                    glow={{ color: '#e84393', intensity: 20, opacity: 0.5 }}
                    stroke={{ color: 'rgba(232, 67, 147, 0.4)', width: 1.5, fill: true }}
                    texture={{ type: 'turbulence', frequency: 0.02, octaves: 3, scale: 3, seed: 11 }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(232, 67, 147, 0.3)', color: '#fd79a8' }}>
                            Phase 3 + 4 Combined
                        </div>
                        <h2>Everything Together</h2>
                        <p>
                            All features composing: scroll-linked ripple animation, parallax, hover with glow boost,
                            stroke, texture, and glow effects -- all on one section.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Scroll-Linked</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Ripple animation driven by scroll</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Parallax</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Depth via scroll offset</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Hover</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Scale + lift + glow boost</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>4 Effects</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>stroke + glow + texture + ripple</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* PHASE 7.5: WAVE POLISH */}
                {/* ============================================================ */}

                {/* ── Phase 7.5 Banner ── */}
                <WaveSection background="#1a1a2e" pattern="flowing" amplitude={0.8} height={160}>
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <span className="phase-tag phase-75" style={{ fontSize: '1rem' }}>Phase 7.5</span>
                        <h1 style={{ marginTop: 12 }}>Wave Polish</h1>
                        <p>
                            New patterns, interlocking dual-wave edges, SVG path morphing animations,
                            and procedural uniqueness via auto-seeding.
                        </p>
                    </div>
                </WaveSection>

                {/* ── 7.5a. Flowing Pattern ── */}
                <WaveSection
                    background="#ff7675"
                    pattern="flowing"
                    amplitude={0.7}
                    height={140}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            New Pattern
                        </div>
                        <h2>Flowing</h2>
                        <p>
                            Dramatic S-curve with phase-adjustable inflection.
                            A bold, sweeping wave for hero sections.
                        </p>
                    </div>
                </WaveSection>

                {/* ── 7.5b. Ribbon Pattern ── */}
                <WaveSection
                    background="#00b894"
                    pattern="ribbon"
                    seed={42}
                    amplitude={0.6}
                    height={140}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            New Pattern
                        </div>
                        <h2>Ribbon</h2>
                        <p>
                            Varying thickness ribbon shape with seed-controlled personality.
                            Each seed produces a unique yet reproducible contour.
                        </p>
                    </div>
                </WaveSection>

                {/* ── 7.5c. Layered-Organic Pattern ── */}
                <WaveSection
                    background="#6c5ce7"
                    pattern="layered-organic"
                    seed={77}
                    amplitude={0.5}
                    height={160}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            New Pattern
                        </div>
                        <h2>Layered Organic</h2>
                        <p>
                            Dense organic contour with 5 cubic bezier segments.
                            Creates rich, complex wave shapes.
                        </p>
                    </div>
                </WaveSection>

                {/* ── 7.5d. Drift Animation (Path Morphing) ── */}
                <WaveSection
                    background="#0984e3"
                    pattern="smooth"
                    animate="drift"
                    height={140}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Path Morphing
                        </div>
                        <h2>Drift Animation</h2>
                        <p>
                            Horizontal phase glide via SVG <code>d: path()</code> CSS interpolation.
                            The wave shape itself changes -- not just transforms.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Real 2D Motion</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Path keyframes with <code>d: path()</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Zero JS per Frame</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Pre-generated CSS keyframes, GPU-composited</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 7.5e. Breathe Animation ── */}
                <WaveSection
                    background="#e17055"
                    pattern="organic"
                    seed={33}
                    animate="breathe"
                    height={140}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Path Morphing
                        </div>
                        <h2>Breathe Animation</h2>
                        <p>
                            Amplitude grows and shrinks -- the wave inhales and exhales.
                            Natural, organic breathing motion.
                        </p>
                    </div>
                </WaveSection>

                {/* ── 7.5f. Undulate Animation ── */}
                <WaveSection
                    background="#2d3436"
                    pattern="flowing"
                    animate="undulate"
                    amplitude={0.7}
                    height={160}
                    glow={{ color: '#fd79a8', intensity: 15, opacity: 0.4 }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(253, 121, 168, 0.3)', color: '#fd79a8' }}>
                            Path Morphing
                        </div>
                        <h2>Undulate Animation</h2>
                        <p>
                            Combined phase + amplitude morphing for rich, premium wave motion.
                            The most dramatic path morphing animation.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Phase + Amplitude</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Both vary simultaneously for complex motion</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>+ Glow</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Composes with SVG filter effects</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 7.5g. Ripple-Out Animation ── */}
                <WaveSection
                    background="#00cec9"
                    pattern="smooth"
                    animate="ripple-out"
                    height={140}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Path Morphing
                        </div>
                        <h2>Ripple-Out Animation</h2>
                        <p>
                            Center-outward disturbance that radiates from the middle.
                            A pulsing ripple effect through the wave shape.
                        </p>
                    </div>
                </WaveSection>

                {/* ── 7.5h. Dual-Wave Interlock ── */}
                <WaveSection
                    background="#0c0c1d"
                    pattern="smooth"
                    separation={{ mode: 'interlock', intensity: 0.6 }}
                    height={160}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(108, 92, 231, 0.3)', color: '#a29bfe' }}>
                            Dual-Wave
                        </div>
                        <h2>Interlock Mode</h2>
                        <p>
                            Two independent SVG paths mesh together like zipper teeth.
                            Each transition renders a unique interlocking edge.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Dual Paths</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Path A + Path B from shared base curve</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Auto-Seeded</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Procedurally unique per section position</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Intensity 0.6</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Controls how much the teeth interweave</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 7.5i. Dual-Wave Overlap ── */}
                <WaveSection
                    background="#e84393"
                    pattern="organic"
                    seed={55}
                    separation={{ mode: 'overlap', intensity: 0.7, strokeColor: 'rgba(255,255,255,0.3)', strokeWidth: 1.5 }}
                    height={160}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Dual-Wave
                        </div>
                        <h2>Overlap Mode</h2>
                        <p>
                            Path A extends past Path B -- edges cross over each other.
                            With a subtle stroke showing both contours.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Overlap</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Paths cross over, creating a layered look</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Stroke</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Both edges outlined for visibility</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 7.5j. Dual-Wave Apart ── */}
                <WaveSection
                    background="#fdcb6e"
                    pattern="ribbon"
                    seed={88}
                    separation={{ mode: 'apart', intensity: 0.5, gap: 8 }}
                    height={160}
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#ffeaa7', color: '#d63031' }}>
                            Dual-Wave
                        </div>
                        <h2>Apart Mode</h2>
                        <p>
                            Paths stay further separated -- a loose zipper effect with a visible gap.
                            Uses the new ribbon pattern.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Gap</h3>
                                <p><code>gap: 8</code> -- Spacing between paths</p>
                            </div>
                            <div className="demo-card light">
                                <h3>Ribbon Pattern</h3>
                                <p>Seed-controlled varying thickness</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── 7.5k. Dual-Wave + Path Morphing Combined ── */}
                <WaveSection
                    background="#0c0c1d"
                    pattern="flowing"
                    separation={{ mode: 'interlock', intensity: 0.5, strokeColor: 'rgba(232, 67, 147, 0.4)', strokeWidth: 1 }}
                    animate="undulate"
                    height={180}
                    amplitude={0.7}
                    glow={{ color: '#e84393', intensity: 20, opacity: 0.5 }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(232, 67, 147, 0.3)', color: '#fd79a8' }}>
                            Phase 7.5 Composition
                        </div>
                        <h2>Everything Together</h2>
                        <p>
                            Dual-wave interlock + undulate path morphing + glow + stroke.
                            The wave edges interlock while both paths morph independently.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Interlock + Morph</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Both Path A and B animate via CSS <code>d: path()</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Flowing Pattern</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Dramatic S-curve base shape</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Glow + Stroke</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>SVG filter effects compose with dual paths</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ============================================================ */}
                {/* PHASE 5: DEV TOOLS & EXPORT */}
                {/* ============================================================ */}

                {/* ── Phase 5 Banner ── */}
                <WaveSection background="#2d3436" pattern="smooth">
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <span className="phase-tag phase-5" style={{ fontSize: '1rem' }}>Phase 5</span>
                        <h1 style={{ marginTop: 12 }}>Dev Tools & Export</h1>
                        <p>
                            Enhanced debug panel, pattern gallery, SVG/PNG export,
                            clip-path clipboard, and preset introspection.
                        </p>
                    </div>
                </WaveSection>

                {/* ── 5a. DevTools Demo ── */}
                <WaveSection background="#f8f9fa" pattern="smooth">
                    <DevToolsDemo />
                </WaveSection>

                {/* ============================================================ */}
                {/* Footer -- Dark */}
                {/* ============================================================ */}
                <WaveSection background="#191919" preset="footer" wavePosition="none">
                    <footer style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <p>
                            <strong style={{ color: '#fff' }}>wavy-bavy</strong> -- Phase 1-7.5 Playground Demo
                            <br />
                            <a
                                href="https://github.com/Modulo-click/wavy-bavy"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub
                            </a>
                        </p>
                    </footer>
                </WaveSection>
            </WaveProvider>
        </>
    )
}
