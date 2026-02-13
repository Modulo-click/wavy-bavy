/**
 * `<wavy-section>` — Web Component for wavy-bavy
 *
 * A standalone custom element that renders SVG wave transitions using Shadow DOM.
 * Reuses the same pure utility functions as the React components, but without
 * any React dependency.
 *
 * **Usage:**
 * ```html
 * <script type="module">
 *   import 'wavy-bavy/web-component'
 * </script>
 *
 * <wavy-section background="#1a1a2e" fill-color="#e94560" pattern="organic" animate="flow">
 *   <h2>My Section</h2>
 * </wavy-section>
 * ```
 *
 * @module wavy-bavy/web-component
 */

import { generatePath } from './utils/path-generator'
import { KEYFRAME_GENERATORS, PATH_MORPH_GENERATORS } from './utils/keyframes'
import { DEFAULT_VIEWBOX_WIDTH } from './constants'
import { generateInterlockPaths } from './utils/interlock-generator'
import { createScrollTracker } from './utils/scroll-tracker'
import type { PatternName, AnimationName, InterlockMode, ScrollTracker } from './types'

const SVG_NS = 'http://www.w3.org/2000/svg'

const OBSERVED_ATTRIBUTES = [
    'pattern',
    'height',
    'amplitude',
    'frequency',
    'background',
    'fill-color',
    'animate',
    'animation-duration',
    'wave-position',
    'phase',
    'mirror',
    'seed',
    'separation-mode',
    'intensity',
    'gap',
    'stroke-color',
    'stroke-width',
] as const

type ObservedAttribute = (typeof OBSERVED_ATTRIBUTES)[number]

/**
 * `<wavy-section>` custom element.
 *
 * Renders an SVG wave divider inside Shadow DOM with content projection via `<slot>`.
 */
class WavySectionElement extends HTMLElement {
    static get observedAttributes(): readonly string[] {
        return OBSERVED_ATTRIBUTES
    }

    private _shadow: ShadowRoot
    private _styleEl: HTMLStyleElement
    private _reducedMotion = false
    private _motionQuery: MediaQueryList | null = null
    private _motionHandler: (() => void) | null = null
    private _scrollTracker: ScrollTracker | null = null
    private _rafId: number | null = null

    constructor() {
        super()
        this._shadow = this.attachShadow({ mode: 'open' })
        this._styleEl = document.createElement('style')
        this._shadow.appendChild(this._styleEl)
    }

    connectedCallback(): void {
        this._setupReducedMotion()
        this._setupScrollTracker()
        this._render()
    }

    disconnectedCallback(): void {
        this._teardownReducedMotion()
        this._teardownScrollTracker()
    }

    attributeChangedCallback(_name: string, _oldVal: string | null, _newVal: string | null): void {
        if (_oldVal !== _newVal) {
            this._render()
        }
    }

    // ── Attribute helpers ──────────────────────────────────────

    private _getAttr(name: ObservedAttribute, fallback: string): string {
        return this.getAttribute(name) ?? fallback
    }

    private _getNumAttr(name: ObservedAttribute, fallback: number): number {
        const raw = this.getAttribute(name)
        if (raw === null) return fallback
        const n = parseFloat(raw)
        return isNaN(n) ? fallback : n
    }

    private _getBoolAttr(name: ObservedAttribute, fallback: boolean): boolean {
        const raw = this.getAttribute(name)
        if (raw === null) return fallback
        return raw !== 'false'
    }

    // ── Reduced motion ─────────────────────────────────────────

    private _setupReducedMotion(): void {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
        this._motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        this._reducedMotion = this._motionQuery.matches
        this._motionHandler = () => {
            this._reducedMotion = this._motionQuery!.matches
            this._render()
        }
        this._motionQuery.addEventListener('change', this._motionHandler)
    }

    private _teardownReducedMotion(): void {
        if (this._motionQuery && this._motionHandler) {
            this._motionQuery.removeEventListener('change', this._motionHandler)
        }
        this._motionQuery = null
        this._motionHandler = null
    }

    // ── Scroll tracker ────────────────────────────────────────

    private _setupScrollTracker(): void {
        if (typeof window === 'undefined') return
        this._scrollTracker = createScrollTracker()

        const onScroll = () => {
            if (this._rafId !== null) return
            this._rafId = requestAnimationFrame((timestamp) => {
                this._rafId = null
                this._scrollTracker?.update(window.scrollY, timestamp)
            })
        }
        window.addEventListener('scroll', onScroll, { passive: true })
    }

    private _teardownScrollTracker(): void {
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId)
            this._rafId = null
        }
        this._scrollTracker = null
    }

    // ── SVG builder (safe DOM APIs, no innerHTML) ───────────────

    private _buildWaveSvg(path: string, fillColor: string, height: number, direction: 'down' | 'up', animStyle: string, pathB?: string, strokeColor?: string, strokeWidth?: number, morphKeyframesCSS?: string, morphAnimIdA?: string, morphAnimIdB?: string): SVGSVGElement {
        const svg = document.createElementNS(SVG_NS, 'svg')
        svg.setAttribute('xmlns', SVG_NS)
        svg.setAttribute('viewBox', `0 0 ${DEFAULT_VIEWBOX_WIDTH} ${height}`)
        svg.setAttribute('preserveAspectRatio', 'none')
        svg.setAttribute('aria-hidden', 'true')
        svg.style.cssText = `display:block;width:100%;height:${height}px;${animStyle}`

        // Inject path morphing keyframes into SVG defs
        if (morphKeyframesCSS) {
            const defs = document.createElementNS(SVG_NS, 'defs')
            const styleEl = document.createElementNS(SVG_NS, 'style')
            styleEl.textContent = morphKeyframesCSS
            defs.appendChild(styleEl)
            svg.appendChild(defs)
        }

        const pathEl = document.createElementNS(SVG_NS, 'path')
        pathEl.setAttribute('d', path)
        pathEl.setAttribute('fill', fillColor)

        if (direction === 'up') {
            pathEl.setAttribute('transform', `scale(1, -1) translate(0, -${height})`)
        }

        if (morphAnimIdA) {
            pathEl.style.animation = `${morphAnimIdA} 10s ease-in-out infinite`
        }

        svg.appendChild(pathEl)

        // Dual-path: render Path B
        if (pathB) {
            const pathBEl = document.createElementNS(SVG_NS, 'path')
            pathBEl.setAttribute('d', pathB)
            pathBEl.setAttribute('fill', fillColor)

            if (direction === 'up') {
                pathBEl.setAttribute('transform', `scale(1, -1) translate(0, -${height})`)
            }

            if (morphAnimIdB) {
                pathBEl.style.animation = `${morphAnimIdB} 10s ease-in-out infinite`
                pathBEl.style.animationDelay = '-3s'
            }

            svg.appendChild(pathBEl)

            // Stroke on both edges
            if (strokeColor) {
                const sw = strokeWidth ?? 1
                const strokeA = document.createElementNS(SVG_NS, 'path')
                strokeA.setAttribute('d', path)
                strokeA.setAttribute('fill', 'none')
                strokeA.setAttribute('stroke', strokeColor)
                strokeA.setAttribute('stroke-width', String(sw))
                svg.appendChild(strokeA)

                const strokeB = document.createElementNS(SVG_NS, 'path')
                strokeB.setAttribute('d', pathB)
                strokeB.setAttribute('fill', 'none')
                strokeB.setAttribute('stroke', strokeColor)
                strokeB.setAttribute('stroke-width', String(sw))
                svg.appendChild(strokeB)
            }
        }

        return svg
    }

    // ── Render ──────────────────────────────────────────────────

    private _render(): void {
        const pattern = this._getAttr('pattern', 'smooth') as PatternName
        const height = this._getNumAttr('height', 120)
        const amplitude = this._getNumAttr('amplitude', 0.5)
        const frequency = this._getNumAttr('frequency', 1)
        const background = this._getAttr('background', 'transparent')
        const fillColor = this._getAttr('fill-color', '#6c5ce7')
        const animateName = this._getAttr('animate', 'none') as AnimationName | 'none'
        const animationDuration = this._getNumAttr('animation-duration', 4)
        const wavePosition = this._getAttr('wave-position', 'bottom') as 'top' | 'bottom' | 'both'
        const phase = this._getNumAttr('phase', 0)
        const mirror = this._getBoolAttr('mirror', false)
        const seedRaw = this.getAttribute('seed')
        const seed = seedRaw !== null ? parseFloat(seedRaw) : undefined

        // Separation attributes
        const separationMode = this._getAttr('separation-mode', '') as InterlockMode | ''
        const intensity = this._getNumAttr('intensity', 0.5)
        const gap = this._getNumAttr('gap', 0)
        const strokeColor = this.getAttribute('stroke-color') ?? undefined
        const strokeWidth = this._getNumAttr('stroke-width', 1)

        const hasSeparation = separationMode !== '' && separationMode !== 'flush'

        // Generate SVG path(s)
        let path: string
        let pathB: string | undefined

        if (hasSeparation) {
            const result = generateInterlockPaths({
                pattern,
                height,
                amplitude,
                frequency,
                intensity,
                mode: separationMode as InterlockMode,
                seed,
                gap,
                phase,
                mirror,
            })
            path = result.pathA
            pathB = result.pathB
        } else {
            path = generatePath(pattern, {
                width: DEFAULT_VIEWBOX_WIDTH,
                height,
                amplitude,
                frequency,
                phase,
                mirror,
                seed,
            })
        }

        // Animation: check for path morph types first, then transform-based
        const isPathMorphAnim = animateName in PATH_MORPH_GENERATORS
        const isTransformAnim = animateName !== 'none' && animateName !== 'custom' && !isPathMorphAnim
        const shouldAnimate = !this._reducedMotion && (isPathMorphAnim || isTransformAnim)

        let animKeyframes = ''
        let animStyle = ''
        let morphKeyframesCSS: string | undefined
        let morphAnimIdA: string | undefined
        let morphAnimIdB: string | undefined

        if (shouldAnimate && isPathMorphAnim) {
            const gen = PATH_MORPH_GENERATORS[animateName]
            if (gen) {
                morphAnimIdA = `wavy-wc-morph-a-${animateName}`
                morphAnimIdB = pathB ? `wavy-wc-morph-b-${animateName}` : undefined
                const cssA = gen(morphAnimIdA, path, pattern, { height, amplitude, frequency })
                const cssB = pathB && morphAnimIdB ? gen(morphAnimIdB, pathB, pattern, { height, amplitude, frequency }) : ''
                morphKeyframesCSS = cssA + (cssB ? '\n' + cssB : '')
            }
        } else if (shouldAnimate && isTransformAnim) {
            const animId = `wavy-wc-${animateName}`
            const gen = KEYFRAME_GENERATORS[animateName as keyof typeof KEYFRAME_GENERATORS]
            if (gen) {
                animKeyframes = gen(animId)
                animStyle = `animation: ${animId} ${animationDuration}s ease-in-out infinite; transform-origin: center bottom; will-change: transform;`
            }
        }

        // Build CSS
        const css = `
            :host {
                display: block;
                position: relative;
                background: ${background};
            }
            .wavy-top {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                line-height: 0;
            }
            .wavy-bottom {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                line-height: 0;
            }
            .wavy-content {
                position: relative;
                z-index: 1;
            }
            ${animKeyframes}
        `

        this._styleEl.textContent = css

        // Remove old rendered content (keep the <style> element)
        const existingEls = this._shadow.querySelectorAll('.wavy-top, .wavy-bottom, .wavy-content')
        existingEls.forEach((el) => el.remove())

        // Append top wave
        if (wavePosition === 'top' || wavePosition === 'both') {
            const topDiv = document.createElement('div')
            topDiv.className = 'wavy-top'
            topDiv.appendChild(this._buildWaveSvg(path, fillColor, height, 'up', animStyle, pathB, strokeColor, strokeWidth, morphKeyframesCSS, morphAnimIdA, morphAnimIdB))
            this._shadow.appendChild(topDiv)
        }

        // Append content slot
        const contentDiv = document.createElement('div')
        contentDiv.className = 'wavy-content'
        const slot = document.createElement('slot')
        contentDiv.appendChild(slot)
        this._shadow.appendChild(contentDiv)

        // Append bottom wave
        if (wavePosition === 'bottom' || wavePosition === 'both') {
            const bottomDiv = document.createElement('div')
            bottomDiv.className = 'wavy-bottom'
            bottomDiv.appendChild(this._buildWaveSvg(path, fillColor, height, 'down', animStyle, pathB, strokeColor, strokeWidth, morphKeyframesCSS, morphAnimIdA, morphAnimIdB))
            this._shadow.appendChild(bottomDiv)
        }
    }
}

// SSR-safe registration
if (typeof customElements !== 'undefined') {
    if (!customElements.get('wavy-section')) {
        customElements.define('wavy-section', WavySectionElement)
    }
}

export { WavySectionElement }
