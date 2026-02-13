import { defineConfig } from 'tsup'

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        effects: 'src/effects.ts',
        animations: 'src/animations.ts',
        'tailwind/plugin': 'src/tailwind/plugin.ts',
        devtools: 'src/devtools/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    treeshake: true,
    splitting: false,
    minify: false,
    target: 'es2020',
})
