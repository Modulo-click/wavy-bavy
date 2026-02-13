import { describe, it, expect, beforeAll, afterEach } from 'vitest'

// Import registers the custom element
import '../src/web-component'

describe('WavySectionElement', () => {
    beforeAll(() => {
        // Ensure the custom element is registered
        expect(customElements.get('wavy-section')).toBeDefined()
    })

    afterEach(() => {
        // Clean up any elements added to the document
        document.body.querySelectorAll('wavy-section').forEach((el) => el.remove())
    })

    it('is registered as a custom element', () => {
        const Ctor = customElements.get('wavy-section')
        expect(Ctor).toBeDefined()
    })

    it('creates a shadow root', () => {
        const el = document.createElement('wavy-section')
        document.body.appendChild(el)
        expect(el.shadowRoot).toBeTruthy()
    })

    it('shadow root contains a <style> element', () => {
        const el = document.createElement('wavy-section')
        document.body.appendChild(el)
        const style = el.shadowRoot!.querySelector('style')
        expect(style).toBeTruthy()
        expect(style!.textContent).toContain(':host')
    })

    it('shadow root contains a <slot> for content projection', () => {
        const el = document.createElement('wavy-section')
        document.body.appendChild(el)
        const slot = el.shadowRoot!.querySelector('slot')
        expect(slot).toBeTruthy()
    })

    it('renders an SVG with default smooth pattern', () => {
        const el = document.createElement('wavy-section')
        document.body.appendChild(el)
        const svg = el.shadowRoot!.querySelector('svg')
        expect(svg).toBeTruthy()
        const path = svg!.querySelector('path')
        expect(path).toBeTruthy()
        expect(path!.getAttribute('d')).toBeTruthy()
    })

    it('defaults to bottom wave position', () => {
        const el = document.createElement('wavy-section')
        document.body.appendChild(el)
        const bottom = el.shadowRoot!.querySelector('.wavy-bottom')
        const top = el.shadowRoot!.querySelector('.wavy-top')
        expect(bottom).toBeTruthy()
        expect(top).toBeNull()
    })

    it('defaults to #6c5ce7 fill color', () => {
        const el = document.createElement('wavy-section')
        document.body.appendChild(el)
        const path = el.shadowRoot!.querySelector('svg path')
        expect(path!.getAttribute('fill')).toBe('#6c5ce7')
    })

    it('respects fill-color attribute', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('fill-color', '#ff0000')
        document.body.appendChild(el)
        const path = el.shadowRoot!.querySelector('svg path')
        expect(path!.getAttribute('fill')).toBe('#ff0000')
    })

    it('respects wave-position="top"', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('wave-position', 'top')
        document.body.appendChild(el)
        const top = el.shadowRoot!.querySelector('.wavy-top')
        const bottom = el.shadowRoot!.querySelector('.wavy-bottom')
        expect(top).toBeTruthy()
        expect(bottom).toBeNull()
    })

    it('respects wave-position="both"', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('wave-position', 'both')
        document.body.appendChild(el)
        const top = el.shadowRoot!.querySelector('.wavy-top')
        const bottom = el.shadowRoot!.querySelector('.wavy-bottom')
        expect(top).toBeTruthy()
        expect(bottom).toBeTruthy()
    })

    it('sets background from attribute', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('background', '#1a1a2e')
        document.body.appendChild(el)
        const style = el.shadowRoot!.querySelector('style')
        expect(style!.textContent).toContain('#1a1a2e')
    })

    it('sets height on SVG', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('height', '200')
        document.body.appendChild(el)
        const svg = el.shadowRoot!.querySelector('svg')
        expect(svg!.getAttribute('viewBox')).toContain('200')
    })

    it('changes pattern via attribute', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('pattern', 'sharp')
        document.body.appendChild(el)
        const path = el.shadowRoot!.querySelector('svg path')
        const d = path!.getAttribute('d')!
        // Sharp pattern uses L commands (linear), not Q/C (curves)
        expect(d).toContain('L')
    })

    it('re-renders on attribute change', () => {
        const el = document.createElement('wavy-section')
        document.body.appendChild(el)
        const pathBefore = el.shadowRoot!.querySelector('svg path')!.getAttribute('d')

        el.setAttribute('pattern', 'mountain')
        const pathAfter = el.shadowRoot!.querySelector('svg path')!.getAttribute('d')

        expect(pathBefore).not.toBe(pathAfter)
    })

    it('injects keyframes when animate is set (path morph)', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('animate', 'flow')
        document.body.appendChild(el)
        // flow is now a path morph animation — keyframes are in SVG <defs> <style>
        const svgStyle = el.shadowRoot!.querySelector('svg style')
        expect(svgStyle!.textContent).toContain('@keyframes')
        expect(svgStyle!.textContent).toContain('wavy-wc-morph-a-flow')
    })

    it('does not inject keyframes when animate is "none"', () => {
        const el = document.createElement('wavy-section')
        document.body.appendChild(el)
        const style = el.shadowRoot!.querySelector('style')
        expect(style!.textContent).not.toContain('@keyframes')
    })

    it('applies animation style to SVG when animate is set', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('animate', 'pulse')
        document.body.appendChild(el)
        const svg = el.shadowRoot!.querySelector('svg')
        expect(svg!.style.cssText).toContain('animation')
    })

    it('respects animation-duration attribute', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('animate', 'flow')
        el.setAttribute('animation-duration', '8')
        document.body.appendChild(el)
        // flow is path morph — duration goes on the <path> element, not <svg>
        const path = el.shadowRoot!.querySelector('svg path')
        expect(path!.getAttribute('style')).toContain('8s')
    })

    it('applies transform for top wave direction', () => {
        const el = document.createElement('wavy-section')
        el.setAttribute('wave-position', 'top')
        document.body.appendChild(el)
        const path = el.shadowRoot!.querySelector('.wavy-top svg path')
        expect(path!.getAttribute('transform')).toContain('scale(1, -1)')
    })
})
