import { useState, useCallback } from 'react'
import { WaveProvider, WaveSection, WaveSectionCSS, useScrollProgress } from 'wavy-bavy'
import DevToolsDemo from './DevToolsDemo'
import DemoSection from './DemoSection'

// ── Scroll Progress Indicator ──
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
    // ── State for intersection callback demo ──
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
                {/* HERO */}
                {/* ============================================================ */}
                <DemoSection label="Hero" role="hero" background="#ffffff" wavePosition="bottom">
                    <div className="section-content">
                        <div className="badge" style={{ background: '#e8e4ff', color: '#6c5ce7' }}>
                            Playground
                        </div>
                        <h1>wavy-bavy</h1>
                        <p>
                            Seamless, automatic wave transitions between page sections.
                            Scroll down to explore patterns, animations, effects, and interactions.
                        </p>
                    </div>
                </DemoSection>

                {/* ============================================================ */}
                {/* PATTERNS */}
                {/* ============================================================ */}

                {/* ── Smooth ── */}
                <DemoSection label="Smooth" background="#F0F0EE" pattern="smooth">
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
                </DemoSection>

                {/* ── Organic ── */}
                <DemoSection label="Organic" background="#1a1a2e" pattern="organic" seed={42}>
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
                </DemoSection>

                {/* ── Geometric: Sharp + Mountain ── */}
                <DemoSection
                    label="Geometric"
                    background="#00b894"
                    pattern="sharp"
                    frequency={3}
                    amplitude={0.6}
                    upperWave={{ pattern: 'organic', amplitude: 0.5, frequency: 1, seed: 55 }}
                    lowerWave={{ pattern: 'sharp', amplitude: 0.6, frequency: 3 }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Pattern
                        </div>
                        <h2>Geometric Patterns</h2>
                        <p>
                            Angular waves and triangle peaks. Switch between <code>sharp</code> and <code>mountain</code> using the pattern control below.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Sharp</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Zigzag angular wave with adjustable frequency</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Mountain</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Triangle peaks -- mountain range silhouette</p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ── Advanced: Flowing + Ribbon + Layered-Organic ── */}
                <DemoSection
                    label="Advanced Patterns"
                    background="#ff7675"
                    pattern="flowing"
                    amplitude={0.7}
                    height={140}
                    upperWave={{ pattern: 'flowing', amplitude: 0.7, frequency: 1 }}
                    lowerWave={{ pattern: 'ribbon', amplitude: 0.5, frequency: 2, seed: 33 }}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Pattern
                        </div>
                        <h2>Advanced Patterns</h2>
                        <p>
                            Switch between <code>flowing</code>, <code>ribbon</code>, and <code>layered-organic</code> using the pattern control.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Flowing</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Dramatic S-curve for hero sections</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Ribbon</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Varying thickness, seed-controlled personality</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Layered Organic</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Dense organic contour with 5 bezier segments</p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ============================================================ */}
                {/* ANIMATIONS */}
                {/* ============================================================ */}

                {/* ── Transform Animations: Flow + Pulse + Bounce ── */}
                <DemoSection
                    label="Animations"
                    background="#0984e3"
                    pattern="smooth"
                    animate="flow"
                    animationDuration={4}
                    showAnimationControls
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Animation
                        </div>
                        <h2>Animations</h2>
                        <p>
                            Switch between animation types using the control below.
                            Flow uses SVG path morphing; pulse and bounce use CSS transforms.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Flow</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Gentle horizontal phase drift via path morphing</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Pulse</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Rhythmic scale breathing effect</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Bounce</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Playful elastic vertical bounce</p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ── Path Morphing: Drift + Breathe + Undulate + Ripple-Out ── */}
                <DemoSection
                    label="Path Morphing"
                    background="#e17055"
                    pattern="organic"
                    seed={33}
                    animate="undulate"
                    amplitude={0.7}
                    height={160}
                    glow={{ color: '#fd79a8', intensity: 15, opacity: 0.4 }}
                    showAnimationControls
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Animation
                        </div>
                        <h2>Path Morphing</h2>
                        <p>
                            The wave shape itself changes via SVG <code>d: path()</code> CSS interpolation.
                            Switch between drift, breathe, undulate, and ripple-out.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Drift</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Horizontal phase glide</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Breathe</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Amplitude grows and shrinks</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Undulate</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Phase + amplitude combined</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Ripple-Out</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Center-outward disturbance</p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ============================================================ */}
                {/* EFFECTS */}
                {/* ============================================================ */}

                {/* ── Stroke Effects ── */}
                <DemoSection
                    label="Stroke Effects"
                    background="#ffffff"
                    pattern="smooth"
                    stroke={{ color: '#6c5ce7', width: 3, fill: true }}
                    shadow={true}
                    showEffectControls
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#e8e4ff', color: '#6c5ce7' }}>
                            Effect
                        </div>
                        <h2>Stroke Effects</h2>
                        <p>
                            SVG stroke outlines on the wave path. Supports solid, dashed, fill or outline-only modes.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Custom Color</h3>
                                <p><code>color: '#6c5ce7'</code></p>
                            </div>
                            <div className="demo-card light">
                                <h3>Stroke Width</h3>
                                <p><code>width: 3</code> -- Adjustable via slider</p>
                            </div>
                            <div className="demo-card light">
                                <h3>+ Shadow</h3>
                                <p>Composes with drop shadow effect</p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ── Blur + Glow ── */}
                <DemoSection
                    label="Blur + Glow"
                    background="#6c5ce7"
                    pattern="smooth"
                    blur={{ radius: 12, opacity: 0.6, saturation: 1.5, section: true }}
                    animate="flow"
                    animationDuration={6}
                    showAnimationControls
                    showEffectControls
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Effect
                        </div>
                        <h2>Blur + Glow</h2>
                        <p>
                            Frosted glass backdrop-filter extends to both the wave and section content.
                            Combined with path-morphing flow for a dreamy look.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Section Blur</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>section: true</code> -- Blur extends to content</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Saturation</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>saturation: 1.5</code> -- Vibrancy boost</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>+ Flow</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Path morphing <code>animate="flow"</code></p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ── Texture + Shadows ── */}
                <DemoSection
                    label="Texture + Shadows"
                    background="#0c0c1d"
                    pattern="organic"
                    seed={88}
                    height={160}
                    texture={{ type: 'turbulence', frequency: 0.03, octaves: 4, scale: 8, seed: 42 }}
                    glow={{ color: '#00b894', intensity: 15, opacity: 0.4 }}
                    innerShadow={{ color: 'rgba(0,0,0,0.35)', blur: 12, offsetX: 0, offsetY: 4 }}
                    showEffectControls
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(0, 184, 148, 0.25)', color: '#55efc4' }}>
                            Effect
                        </div>
                        <h2>Texture + Shadows</h2>
                        <p>
                            SVG feTurbulence creates distorted texture. Inner shadow adds a carved, inset look.
                            Combined with glow for an ethereal effect.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Turbulence</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>frequency: 0.03</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Inner Shadow</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>blur: 12, offsetY: 4</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>+ Glow</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Green glow adds atmosphere</p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ── Combined Effects ── */}
                <DemoSection
                    label="Combined Effects"
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
                    showAnimationControls
                    showEffectControls
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(108, 92, 231, 0.3)', color: '#a29bfe' }}>
                            Effect
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
                </DemoSection>

                {/* ============================================================ */}
                {/* INTERACTION */}
                {/* ============================================================ */}

                {/* ── Scroll + Parallax ── */}
                <DemoSection
                    label="Scroll + Parallax"
                    background="#0984e3"
                    pattern="smooth"
                    animate="flow"
                    animationDuration={4}
                    scrollAnimate={true}
                    layers={3}
                    layerOpacity={0.3}
                    height={200}
                    parallax={{ speed: 0.5, direction: 'vertical' }}
                    showAnimationControls
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Interaction
                        </div>
                        <h2>Scroll + Parallax</h2>
                        <p>
                            Scroll-linked animation driven by your scroll position.
                            Multi-layer parallax creates depth as each layer moves at a different speed.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Scroll-Driven</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>scrollAnimate={'{true}'}</code></p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>3 Layers</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>layers: 3</code> -- Each at different speed</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Parallax</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>speed: 0.5</code> -- Vertical depth effect</p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ── Hover + Callbacks ── */}
                <DemoSection
                    label="Hover + Callbacks"
                    background="#fdcb6e"
                    pattern="smooth"
                    hover={{ scale: 1.04, lift: -6, glow: false, transition: 'transform 0.3s ease' }}
                    shadow={true}
                    onEnter={handleEnter}
                    onExit={handleExit}
                    onProgress={handleProgress}
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#ffeaa7', color: '#d63031' }}>
                            Interaction
                        </div>
                        <h2>Hover + Callbacks</h2>
                        <p>
                            Hover over the wave to see it scale and lift. Intersection callbacks fire as you scroll.
                        </p>

                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Scale + Lift</h3>
                                <p><code>scale: 1.04, lift: -6</code></p>
                            </div>
                            <div className="demo-card light">
                                <h3>onEnter / onExit</h3>
                                <p>Fires when section enters/exits viewport</p>
                            </div>
                            <div className="demo-card light">
                                <h3>onProgress</h3>
                                <p>Continuous 0-1 progress as you scroll</p>
                            </div>
                        </div>

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
                </DemoSection>

                {/* ============================================================ */}
                {/* ADVANCED */}
                {/* ============================================================ */}

                {/* ── Dual-Wave Modes ── */}
                <DemoSection
                    label="Dual-Wave"
                    background="#0c0c1d"
                    pattern="smooth"
                    separation={{ mode: 'interlock', intensity: 0.6 }}
                    height={160}
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(108, 92, 231, 0.3)', color: '#a29bfe' }}>
                            Advanced
                        </div>
                        <h2>Dual-Wave Modes</h2>
                        <p>
                            Two independent SVG paths mesh together. Switch between interlock, overlap, and apart modes
                            by changing the <code>separation</code> prop.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Interlock</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Zipper teeth -- paths mesh together</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Overlap</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Paths cross over each other</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Apart</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loose separation with visible gap</p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ── Dual-Wave + Effects Combined ── */}
                <DemoSection
                    label="Dual-Wave + Effects"
                    background="#e84393"
                    pattern="flowing"
                    separation={{ mode: 'interlock', intensity: 0.5, strokeColor: 'rgba(232, 67, 147, 0.4)', strokeWidth: 1 }}
                    animate="undulate"
                    height={180}
                    amplitude={0.7}
                    glow={{ color: '#e84393', intensity: 20, opacity: 0.5 }}
                    showAnimationControls
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            Advanced
                        </div>
                        <h2>Dual-Wave + Effects</h2>
                        <p>
                            Interlocking dual paths + undulate morphing + glow + stroke.
                            Both paths animate independently via CSS <code>d: path()</code>.
                        </p>
                    </div>
                </DemoSection>

                {/* ── Gradients ── */}
                <DemoSection
                    label="Gradients"
                    background="#1a1a2e"
                    pattern="smooth"
                    amplitude={0.6}
                    autoGradient
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(108, 92, 231, 0.25)', color: '#a29bfe' }}>
                            Advanced
                        </div>
                        <h2>Gradients</h2>
                        <p>
                            <code>autoGradient</code> blends from this section's color to the next.
                            Also supports manual <code>fillGradient</code> and <code>containerGradient</code> with linear or radial stops.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Auto-Gradient</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Automatic 3-stop gradient from neighbors</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Fill Gradient</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Custom gradient on the wave SVG fill</p>
                            </div>
                            <div className="demo-card">
                                <h3 style={{ color: '#fff' }}>Container Gradient</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Gradient on the section background</p>
                            </div>
                        </div>
                    </div>
                </DemoSection>

                {/* ── Dual Gradient + Animation ── */}
                <DemoSection
                    label="Dual Gradient"
                    background="#2d3436"
                    pattern="flowing"
                    amplitude={0.7}
                    animate="drift"
                    fillGradient={{
                        type: 'linear',
                        angle: 45,
                        stops: [
                            { color: '#e17055', offset: 0 },
                            { color: '#fdcb6e', offset: 1 },
                        ],
                    }}
                    containerGradient={{
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { color: '#6c5ce7', offset: 0 },
                            { color: '#0984e3', offset: 1 },
                        ],
                    }}
                    glow
                    showAnimationControls
                >
                    <div className="section-content" style={{ color: '#ffffff' }}>
                        <div className="badge" style={{ background: 'rgba(108, 92, 231, 0.3)', color: '#a29bfe' }}>
                            Advanced
                        </div>
                        <h2>Dual Gradient + Animation</h2>
                        <p>
                            Both <code>fillGradient</code> and <code>containerGradient</code> with drift animation and glow.
                        </p>
                    </div>
                </DemoSection>

                {/* ============================================================ */}
                {/* UTILITIES */}
                {/* ============================================================ */}

                {/* ── CSS-Only + Responsive ── */}
                <WaveSectionCSS
                    background="#fdcb6e"
                    pattern="smooth"
                    height={100}
                    amplitude={0.4}
                    wavePosition="both"
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#ffeaa7', color: '#d63031' }}>
                            Utility
                        </div>
                        <h2>CSS-Only Mode</h2>
                        <p>
                            <code>&lt;WaveSectionCSS&gt;</code> uses CSS clip-path polygon instead of SVG.
                            No animation, no context -- perfect for static pages and SSG.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>Zero SVG</h3>
                                <p>Pure CSS <code>clip-path: polygon()</code></p>
                            </div>
                            <div className="demo-card light">
                                <h3>Tiny Footprint</h3>
                                <p>No context, no IntersectionObserver overhead</p>
                            </div>
                            <div className="demo-card light">
                                <h3>Both Edges</h3>
                                <p><code>wavePosition="both"</code></p>
                            </div>
                        </div>
                    </div>
                </WaveSectionCSS>

                {/* ── Responsive Heights ── */}
                <WaveSection
                    background="#ffeaa7"
                    pattern="ribbon"
                    seed={42}
                    height={{ sm: 60, md: 120, lg: 200 }}
                >
                    <div className="section-content">
                        <div className="badge" style={{ background: '#ffeaa7', color: '#d63031' }}>
                            Utility
                        </div>
                        <h2>Responsive Heights</h2>
                        <p>
                            Wave height adapts to viewport: 60px on mobile, 120px on tablet, 200px on desktop.
                        </p>
                        <div className="demo-grid">
                            <div className="demo-card light">
                                <h3>sm (640px+)</h3>
                                <p>60px wave height</p>
                            </div>
                            <div className="demo-card light">
                                <h3>md (768px+)</h3>
                                <p>120px wave height</p>
                            </div>
                            <div className="demo-card light">
                                <h3>lg (1024px+)</h3>
                                <p>200px wave height</p>
                            </div>
                        </div>
                    </div>
                </WaveSection>

                {/* ── DevTools ── */}
                <WaveSection background="#f8f9fa" pattern="smooth">
                    <div className="section-content">
                        <div className="badge" style={{ background: '#e8e4ff', color: '#6c5ce7' }}>
                            Utility
                        </div>
                        <h2>Dev Tools</h2>
                        <p>
                            Debug panel, pattern gallery, SVG/PNG export, and preset introspection.
                            Import from <code>wavy-bavy/devtools</code> -- zero bytes in production.
                        </p>
                    </div>
                    <DevToolsDemo />
                </WaveSection>

                {/* ============================================================ */}
                {/* FOOTER */}
                {/* ============================================================ */}
                <DemoSection label="Footer" role="footer" background="#191919" preset="footer" wavePosition="none">
                    <footer style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <p>
                            <strong style={{ color: '#fff' }}>wavy-bavy</strong> -- Playground
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
                </DemoSection>
            </WaveProvider>
        </>
    )
}
