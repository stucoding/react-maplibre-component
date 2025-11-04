import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'src/tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    browserName: 'chromium',
    headless: true,
    trace: 'on-first-retry',
  },
  // Start a preview server after build and before tests
  webServer: {
    command: 'vite preview --strictPort --port=4173',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

