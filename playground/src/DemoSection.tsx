import { useState, type ReactNode } from 'react'
import { WaveSection } from 'wavy-bavy'
import type { AnimationName, PatternName, WavePosition, WaveEdgeConfig } from 'wavy-bavy'

const PATTERNS: PatternName[] = ['smooth', 'organic', 'sharp', 'mountain', 'flowing', 'ribbon', 'layered-organic']
const ANIMATIONS: (AnimationName | 'none')[] = ['none', 'flow', 'pulse', 'morph', 'ripple', 'bounce', 'drift', 'breathe', 'undulate', 'ripple-out']
const WAVE_POSITIONS: WavePosition[] = ['bottom', 'top', 'both', 'none']

interface DemoSectionProps {
    label: string
    role?: 'hero' | 'footer' | 'section'
    background: string
    pattern?: PatternName
    amplitude?: number
    frequency?: number
    height?: number
    seed?: number
    phase?: number
    mirror?: boolean
    animate?: AnimationName | false
    animationDuration?: number
    wavePosition?: WavePosition
    showAnimationControls?: boolean
    showEffectControls?: boolean
    showSeparationControls?: boolean
    customKeyframes?: string
    shadow?: any
    glow?: any
    stroke?: any
    blur?: any
    texture?: any
    innerShadow?: any
    scrollAnimate?: any
    parallax?: any
    hover?: any
    separation?: any
    layers?: number
    layerOpacity?: number
    fillGradient?: any
    containerGradient?: any
    autoGradient?: boolean
    onEnter?: () => void
    onExit?: () => void
    onProgress?: (p: number) => void
    preset?: string
    upperWave?: WaveEdgeConfig
    lowerWave?: WaveEdgeConfig
    children: ReactNode
}

function EdgePanel({
    title,
    pattern,
    setPattern,
    amplitude,
    setAmplitude,
    frequency,
    setFrequency,
    height,
    setHeight,
    seed,
    setSeed,
}: {
    title: string
    pattern: PatternName
    setPattern: (v: PatternName) => void
    amplitude: number
    setAmplitude: (v: number) => void
    frequency: number
    setFrequency: (v: number) => void
    height: number
    setHeight: (v: number) => void
    seed: number
    setSeed: (v: number) => void
}) {
    return (
        <div className="edge-panel">
            <div className="edge-panel-title">{title}</div>
            <div className="control-group">
                <label>Pattern</label>
                <select value={pattern} onChange={e => setPattern(e.target.value as PatternName)}>
                    {PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div className="control-group">
                <label>Amplitude <span className="control-value">{amplitude.toFixed(2)}</span></label>
                <input type="range" min="0" max="1" step="0.05" value={amplitude} onChange={e => setAmplitude(+e.target.value)} />
            </div>
            <div className="control-group">
                <label>Frequency <span className="control-value">{frequency.toFixed(1)}</span></label>
                <input type="range" min="0.5" max="8" step="0.5" value={frequency} onChange={e => setFrequency(+e.target.value)} />
            </div>
            <div className="control-group">
                <label>Height <span className="control-value">{height}px</span></label>
                <input type="range" min="40" max="300" step="10" value={height} onChange={e => setHeight(+e.target.value)} />
            </div>
            <div className="control-group">
                <label>Seed <span className="control-value">{seed}</span></label>
                <input type="range" min="0" max="100" step="1" value={seed} onChange={e => setSeed(+e.target.value)} />
            </div>
        </div>
    )
}

export default function DemoSection(props: DemoSectionProps) {
    const {
        label,
        role,
        background,
        children,
        showAnimationControls = false,
        showEffectControls = false,
        customKeyframes,
        scrollAnimate,
        parallax,
        hover,
        onEnter,
        onExit,
        onProgress,
        layers,
        layerOpacity,
        fillGradient: initialFillGradient,
        containerGradient: initialContainerGradient,
        autoGradient: initialAutoGradient,
        preset,
    } = props

    // Upper wave state
    const [upperPattern, setUpperPattern] = useState<PatternName>(props.upperWave?.pattern ?? props.pattern ?? 'smooth')
    const [upperAmplitude, setUpperAmplitude] = useState(props.upperWave?.amplitude ?? props.amplitude ?? 0.5)
    const [upperFrequency, setUpperFrequency] = useState(props.upperWave?.frequency ?? props.frequency ?? 1)
    const [upperHeight, setUpperHeight] = useState(props.upperWave?.height ?? props.height ?? 120)
    const [upperSeed, setUpperSeed] = useState(props.upperWave?.seed ?? props.seed ?? 42)

    // Lower wave state
    const [lowerPattern, setLowerPattern] = useState<PatternName>(props.lowerWave?.pattern ?? props.pattern ?? 'smooth')
    const [lowerAmplitude, setLowerAmplitude] = useState(props.lowerWave?.amplitude ?? props.amplitude ?? 0.5)
    const [lowerFrequency, setLowerFrequency] = useState(props.lowerWave?.frequency ?? props.frequency ?? 1)
    const [lowerHeight, setLowerHeight] = useState(props.lowerWave?.height ?? props.height ?? 120)
    const [lowerSeed, setLowerSeed] = useState(props.lowerWave?.seed ?? props.seed ?? 42)

    const [wavePosition, setWavePosition] = useState<WavePosition>(props.wavePosition ?? 'bottom')
    const [collapsed, setCollapsed] = useState(false)

    // Animation state
    const [animate, setAnimate] = useState<AnimationName | 'none'>(
        props.animate === false ? 'none' : props.animate ?? 'none'
    )
    const [duration, setDuration] = useState(props.animationDuration ?? 4)

    // Effect state
    const [blurRadius, setBlurRadius] = useState(
        props.blur && typeof props.blur === 'object' ? props.blur.radius : 0
    )
    const [glowIntensity, setGlowIntensity] = useState(
        props.glow && typeof props.glow === 'object' ? props.glow.intensity : 0
    )
    const [textureScale, setTextureScale] = useState(
        props.texture && typeof props.texture === 'object' ? props.texture.scale : 0
    )
    const [strokeWidth, setStrokeWidth] = useState(
        props.stroke && typeof props.stroke === 'object' ? props.stroke.width : 0
    )
    const [strokeColor, setStrokeColor] = useState(
        props.stroke && typeof props.stroke === 'object' ? props.stroke.color : '#6c5ce7'
    )

    const roleLabel = role === 'hero' ? 'Hero' : role === 'footer' ? 'Footer' : label

    // Determine which panels to show
    const isHero = role === 'hero'
    const isFooter = role === 'footer'
    const showUpperPanel = !isHero && wavePosition !== 'bottom' && wavePosition !== 'none'
    const showLowerPanel = !isFooter && wavePosition !== 'top' && wavePosition !== 'none'
    // For default 'bottom' position, show lower panel
    const showLowerDefault = wavePosition === 'bottom'

    // Build WaveSection props from state
    const waveSectionProps: Record<string, any> = {
        background,
        pattern: lowerPattern,
        amplitude: lowerAmplitude,
        frequency: lowerFrequency,
        height: Math.max(upperHeight, lowerHeight),
        seed: lowerSeed,
        wavePosition,
        preset,
        customKeyframes,
        scrollAnimate,
        parallax,
        hover,
        onEnter,
        onExit,
        onProgress,
        layers,
        layerOpacity,
        fillGradient: initialFillGradient,
        containerGradient: initialContainerGradient,
        autoGradient: initialAutoGradient,
        shadow: props.shadow,
        innerShadow: props.innerShadow,
    }

    // Set independent edge configs
    waveSectionProps.upperWave = {
        pattern: upperPattern,
        amplitude: upperAmplitude,
        frequency: upperFrequency,
        height: upperHeight,
        seed: upperSeed,
    }
    waveSectionProps.lowerWave = {
        pattern: lowerPattern,
        amplitude: lowerAmplitude,
        frequency: lowerFrequency,
        height: lowerHeight,
        seed: lowerSeed,
    }

    if (animate !== 'none') {
        waveSectionProps.animate = animate
        waveSectionProps.animationDuration = duration
    }

    if (blurRadius > 0) {
        waveSectionProps.blur = { radius: blurRadius, opacity: 0.6, saturation: 1.5 }
    }
    if (glowIntensity > 0) {
        waveSectionProps.glow = { color: '#6c5ce7', intensity: glowIntensity, opacity: 0.5 }
    }
    if (textureScale > 0) {
        waveSectionProps.texture = { type: 'turbulence', frequency: 0.02, octaves: 3, scale: textureScale, seed: lowerSeed }
    }
    if (strokeWidth > 0) {
        waveSectionProps.stroke = { color: strokeColor, width: strokeWidth, fill: true }
    }

    // Pass through non-controlled effects from props when sliders are at zero
    if (blurRadius === 0 && props.blur) waveSectionProps.blur = props.blur
    if (glowIntensity === 0 && props.glow) waveSectionProps.glow = props.glow
    if (textureScale === 0 && props.texture) waveSectionProps.texture = props.texture
    if (strokeWidth === 0 && props.stroke) waveSectionProps.stroke = props.stroke

    // Pass through separation
    if (props.separation) waveSectionProps.separation = props.separation

    return (
        <WaveSection {...waveSectionProps}>
            {children}

            <div className="demo-controls">
                <div className="demo-controls-header" onClick={() => setCollapsed(!collapsed)}>
                    <span className="demo-controls-label">{roleLabel}</span>
                    <span className="demo-controls-wave-info">
                        {wavePosition === 'both' ? 'Upper + Lower Wave' :
                         wavePosition === 'top' ? 'Upper Wave' :
                         wavePosition === 'none' ? 'No Wave' : 'Lower Wave'}
                    </span>
                    <span className="demo-controls-toggle">{collapsed ? '+' : '-'}</span>
                </div>

                {!collapsed && (
                    <div className="demo-controls-body">
                        <div className="controls-row">
                            <div className="control-group">
                                <label>Wave Position</label>
                                <select value={wavePosition} onChange={e => setWavePosition(e.target.value as WavePosition)}>
                                    {(role === 'hero'
                                        ? (['bottom', 'none'] as WavePosition[])
                                        : role === 'footer'
                                        ? (['top', 'none'] as WavePosition[])
                                        : WAVE_POSITIONS
                                    ).map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                                {wavePosition === 'none' && role !== 'hero' && role !== 'footer' && (
                                    <span className="control-warning">No wave connection to adjacent sections</span>
                                )}
                            </div>
                        </div>

                        {/* Edge control panels */}
                        {wavePosition !== 'none' && (
                            <div className={`edge-controls-grid ${(showUpperPanel || showLowerDefault) && !showLowerPanel && !showUpperPanel ? 'single' : ''}`}>
                                {showUpperPanel && (
                                    <EdgePanel
                                        title="Upper Wave"
                                        pattern={upperPattern}
                                        setPattern={setUpperPattern}
                                        amplitude={upperAmplitude}
                                        setAmplitude={setUpperAmplitude}
                                        frequency={upperFrequency}
                                        setFrequency={setUpperFrequency}
                                        height={upperHeight}
                                        setHeight={setUpperHeight}
                                        seed={upperSeed}
                                        setSeed={setUpperSeed}
                                    />
                                )}
                                {(showLowerPanel || showLowerDefault) && (
                                    <EdgePanel
                                        title="Lower Wave"
                                        pattern={lowerPattern}
                                        setPattern={setLowerPattern}
                                        amplitude={lowerAmplitude}
                                        setAmplitude={setLowerAmplitude}
                                        frequency={lowerFrequency}
                                        setFrequency={setLowerFrequency}
                                        height={lowerHeight}
                                        setHeight={setLowerHeight}
                                        seed={lowerSeed}
                                        setSeed={setLowerSeed}
                                    />
                                )}
                            </div>
                        )}

                        {showAnimationControls && (
                            <div className="controls-row">
                                <div className="control-group">
                                    <label>Animation</label>
                                    <select value={animate} onChange={e => setAnimate(e.target.value as AnimationName | 'none')}>
                                        {ANIMATIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div className="control-group">
                                    <label>Duration <span className="control-value">{duration}s</span></label>
                                    <input type="range" min="1" max="15" step="0.5" value={duration} onChange={e => setDuration(+e.target.value)} />
                                </div>
                            </div>
                        )}

                        {showEffectControls && (
                            <>
                                <div className="controls-row">
                                    <div className="control-group">
                                        <label>Blur <span className="control-value">{blurRadius}</span></label>
                                        <input type="range" min="0" max="20" step="1" value={blurRadius} onChange={e => setBlurRadius(+e.target.value)} />
                                    </div>
                                    <div className="control-group">
                                        <label>Glow <span className="control-value">{glowIntensity}</span></label>
                                        <input type="range" min="0" max="40" step="1" value={glowIntensity} onChange={e => setGlowIntensity(+e.target.value)} />
                                    </div>
                                </div>
                                <div className="controls-row">
                                    <div className="control-group">
                                        <label>Texture <span className="control-value">{textureScale}</span></label>
                                        <input type="range" min="0" max="15" step="1" value={textureScale} onChange={e => setTextureScale(+e.target.value)} />
                                    </div>
                                    <div className="control-group">
                                        <label>Stroke <span className="control-value">{strokeWidth}px</span></label>
                                        <input type="range" min="0" max="8" step="0.5" value={strokeWidth} onChange={e => setStrokeWidth(+e.target.value)} />
                                    </div>
                                </div>
                                {strokeWidth > 0 && (
                                    <div className="controls-row">
                                        <div className="control-group">
                                            <label>Stroke Color</label>
                                            <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </WaveSection>
    )
}
