import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,

    environment: 'node',
    include: ['**/*.node.test.js'],
    silent: true,
  },
})
