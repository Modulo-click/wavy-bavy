import { WaveProvider, WaveSection } from 'wavy-bavy'

export default function App() {
    return (
        <WaveProvider debug={true}>
            {/* ============================================================ */}
            {/* 1. Hero — White */}
            {/* ============================================================ */}
            <WaveSection background="#ffffff" wavePosition="bottom">
                <div className="section-content">
                    <div className="badge" style={{ background: '#e8e4ff', color: '#6c5ce7' }}>
                        Playground
                    </div>
                    <h1>🌊 wavy-bavy</h1>
                    <p>
                        Seamless, automatic wave transitions between page sections.
                        Scroll down to see every pattern, preset, and effect in action.
                    </p>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 2. Smooth Pattern — Light Gray */}
            {/* ============================================================ */}
            <WaveSection background="#F0F0EE" pattern="smooth">
                <div className="section-content">
                    <div className="badge" style={{ background: '#d4edda', color: '#155724' }}>
                        Pattern
                    </div>
                    <h2>Smooth</h2>
                    <p>
                        Classic sine-wave curve. The default pattern — clean and elegant.
                    </p>
                    <div className="demo-grid">
                        <div className="demo-card light">
                            <h3>Default Amplitude</h3>
                            <p><code>amplitude: 0.5</code> — Balanced curve height</p>
                        </div>
                        <div className="demo-card light">
                            <h3>Single Frequency</h3>
                            <p><code>frequency: 1</code> — One smooth peak</p>
                        </div>
                        <div className="demo-card light">
                            <h3>Auto Colors</h3>
                            <p>Wave colors auto-detected from section backgrounds</p>
                        </div>
                    </div>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 3. Organic Pattern — Dark */}
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
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>seed: 42</code> — Same shape every render</p>
                        </div>
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Context-Aware</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Detects adjacent sections automatically</p>
                        </div>
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Dark ↔ Light</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Works with any color transitions</p>
                        </div>
                    </div>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 4. Sharp Pattern — Teal */}
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
                    <div className="demo-grid">
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>High Frequency</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>frequency: 3</code> — Three sharp peaks</p>
                        </div>
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Higher Amplitude</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>amplitude: 0.6</code> — More dramatic</p>
                        </div>
                    </div>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 5. Mountain Pattern — Warm Gradient-like */}
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
                    <div className="demo-grid">
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>4 Peaks</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>frequency: 4</code> — Mountain range</p>
                        </div>
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>High Amplitude</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>amplitude: 0.7</code> — Tall peaks</p>
                        </div>
                    </div>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 6. Shadow Effect — White */}
            {/* ============================================================ */}
            <WaveSection background="#ffffff" pattern="smooth" shadow={true}>
                <div className="section-content">
                    <div className="badge" style={{ background: '#fff3cd', color: '#856404' }}>
                        Effect
                    </div>
                    <h2>Shadow Effect</h2>
                    <p>
                        Drop shadow on the wave adds depth and separation between sections.
                    </p>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 7. Layered Effect — Deep Purple */}
            {/* ============================================================ */}
            <WaveSection
                background="#6c5ce7"
                pattern="smooth"
                layers={3}
                layerOpacity={0.25}
                height={180}
            >
                <div className="section-content" style={{ color: '#ffffff' }}>
                    <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                        Effect
                    </div>
                    <h2>Layered Waves</h2>
                    <p>
                        Multiple stacked wave layers create a sense of depth and movement.
                    </p>
                    <div className="demo-grid">
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>3 Layers</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>layers: 3</code></p>
                        </div>
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Custom Opacity</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>layerOpacity: 0.25</code></p>
                        </div>
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Taller Height</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>height: 180</code></p>
                        </div>
                    </div>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 8. Glow Effect — Dark */}
            {/* ============================================================ */}
            <WaveSection
                background="#0c0c1d"
                pattern="organic"
                seed={99}
                glow={{ color: '#6c5ce7', intensity: 25, opacity: 0.6 }}
            >
                <div className="section-content" style={{ color: '#ffffff' }}>
                    <div className="badge" style={{ background: 'rgba(108, 92, 231, 0.3)', color: '#a29bfe' }}>
                        Effect
                    </div>
                    <h2>Glow Effect</h2>
                    <p>
                        Neon-style glow using SVG filters. Great for dark themes.
                    </p>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 9. Animation: Flow — Ocean Blue */}
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
                    <div className="demo-grid">
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Continuous</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>animate="flow"</code></p>
                        </div>
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>4s Duration</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>animationDuration={'{4}'}</code></p>
                        </div>
                    </div>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 10. Animation: Pulse — Emerald */}
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
                        Rhythmic scale pulse — the wave breathes in and out.
                    </p>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 11. Animation: Bounce — Coral */}
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
                        Playful vertical bounce effect — elastic and fun.
                    </p>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 12. Animation: Ripple — Indigo */}
            {/* ============================================================ */}
            <WaveSection
                background="#5f27cd"
                pattern="smooth"
                frequency={2}
                animate="ripple"
                animationDuration={5}
            >
                <div className="section-content" style={{ color: '#ffffff' }}>
                    <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                        Animation
                    </div>
                    <h2>Ripple Animation</h2>
                    <p>
                        Water-like ripple motion — combines horizontal shift with subtle vertical scaling.
                    </p>
                    <div className="demo-grid">
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Multi-axis</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>animate="ripple"</code></p>
                        </div>
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Slow Duration</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>animationDuration={'{5}'}</code></p>
                        </div>
                    </div>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 13. Animation: Morph — Forest Green */}
            {/* ============================================================ */}
            <WaveSection
                background="#10ac84"
                pattern="organic"
                seed={55}
                animate="morph"
                animationDuration={6}
            >
                <div className="section-content" style={{ color: '#ffffff' }}>
                    <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                        Animation
                    </div>
                    <h2>Morph Animation</h2>
                    <p>
                        Shape-shifting motion — the wave subtly morphs between different forms.
                    </p>
                    <div className="demo-grid">
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Organic Base</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>pattern="organic"</code></p>
                        </div>
                        <div className="demo-card">
                            <h3 style={{ color: '#fff' }}>Long Cycle</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}><code>animationDuration={'{6}'}</code></p>
                        </div>
                    </div>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 14. Preset: Hero — Light Blue */}
            {/* ============================================================ */}
            <WaveSection background="#e8f4fd" preset="hero">
                <div className="section-content">
                    <div className="badge" style={{ background: '#cce5ff', color: '#004085' }}>
                        Preset
                    </div>
                    <h2>Hero Preset</h2>
                    <p>
                        Tall, dramatic wave — ideal for hero sections.
                        <br />
                        <code>height: 200, amplitude: 0.6</code>
                    </p>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 10. Preset: Subtle — Warm Beige */}
            {/* ============================================================ */}
            <WaveSection background="#ffeaa7" preset="subtle">
                <div className="section-content">
                    <div className="badge" style={{ background: '#fff3cd', color: '#856404' }}>
                        Preset
                    </div>
                    <h2>Subtle Preset</h2>
                    <p>
                        Minimal, delicate wave — barely visible but adds polish.
                        <br />
                        <code>height: 80, amplitude: 0.3</code>
                    </p>
                </div>
            </WaveSection>

            {/* ============================================================ */}
            {/* 11. Footer — Dark */}
            {/* ============================================================ */}
            <WaveSection background="#191919" preset="footer" wavePosition="none">
                <footer style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <p>
                        🌊 <strong style={{ color: '#fff' }}>wavy-bavy</strong> — Playground Demo
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
    )
}
