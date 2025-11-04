import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  use: {
    baseURL: 'http://localhost:4173',   // vite preview default
    headless: true,
  },
  webServer: {
    command: 'npm run preview',          // start server
    url: 'http://localhost:4173',        // wait for this to respond
    timeout: 120 * 1000,                 // 2 minutes
    reuseExistingServer: !process.env.CI // don’t restart locally
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
});