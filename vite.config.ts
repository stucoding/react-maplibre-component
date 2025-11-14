import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';
import type { UserConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/*',
      exclude: [
        'node_modules',
        'src/tests',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.test.tsx',
        '**/*.spec.tsx',
      ],
      extension: ['.ts', '.tsx'],
      requireEnv: false,
    }),
  ],
  server: {
    open: false, // Disable automatic browser opening
  },
  build: {
    sourcemap: true, // Required for coverage mapping back to source
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
        100: false, // Don't require 100% coverage, just the thresholds above
      },
      all: true, // Include all files in coverage calculation
      exclude: [
        'node_modules/**',
        'src/tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'dist/**',
        'coverage/**',
      ],
    },
    include: ['src/**/*.test.{ts,tsx}'],
  },
} as UserConfig);
