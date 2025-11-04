import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 0.9,
        functions: 0.9,
        branches: 0.9,
        statements: 0.9,
      },
    },
    include: ['src/**/*.test.{ts,tsx}'],
  },
} as UserConfig)
