import { defineConfig, devices } from '@playwright/test';
const port = process.env.PLAYWRIGHT_PORT || '3000';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    ...devices['Desktop Chrome'],
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    viewport: { width: 1440, height: 1100 },
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-webgl'] },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: `http://127.0.0.1:${port}/mission/crew`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
