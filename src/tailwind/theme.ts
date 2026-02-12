/**
 * Default Tailwind theme tokens for wavy-bavy.
 * Extend or override via the plugin's `waves` option.
 */
export const defaultWaveTheme = {
    heights: {
        sm: '80px',
        md: '120px',
        lg: '190px',
        xl: '250px',
        '2xl': '300px',
    },
    patterns: ['smooth', 'organic', 'sharp', 'layered', 'mountain'] as const,
    animations: ['flow', 'pulse', 'morph', 'ripple', 'bounce'] as const,
    durations: {
        fast: '2s',
        normal: '4s',
        slow: '6s',
    },
}
