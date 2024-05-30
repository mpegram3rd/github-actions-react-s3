/// <reference types="vitest" />

import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        css: true,
        setupFiles: ['./vitest.setup.ts'],
    },
})