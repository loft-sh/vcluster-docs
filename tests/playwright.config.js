const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './specs',
  testMatch: '**/*.spec.js',

  // Timeout settings
  timeout: 600000, // 10 minutes for full page iteration
  expect: {
    timeout: 15000,
  },

  // Run tests sequentially in CI for stability
  fullyParallel: false,
  workers: 1,

  // Retry failed tests once
  retries: 1,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // Screenshots on failure
  // Note: trace disabled - BrowserStack doesn't support tracingStartChunk on iOS/some platforms
  use: {
    screenshot: 'only-on-failure',
    trace: 'off',
  },

  // Local testing project (for development without BrowserStack)
  projects: [
    {
      name: 'local',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
});