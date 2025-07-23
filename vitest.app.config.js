import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: './src/setupTests.js',

    environment: 'jsdom',
    include: ['**/*.test.js'],
    exclude: ['**/*.node.test.js'],
    silent: true,
  },
})
