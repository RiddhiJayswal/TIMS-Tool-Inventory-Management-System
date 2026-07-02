// @ts-check
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: '../test-results/e2e-results.json' }],
    ['html', { outputFolder: '../test-results/e2e-html-report', open: 'never' }],
  ],
  webServer: {
    command: 'npm.cmd run dev -- --host 127.0.0.1 --port 5174 --strictPort',
    cwd: '../frontend',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: true,
    timeout: 120000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  outputDir: '../test-results/e2e-artifacts',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
