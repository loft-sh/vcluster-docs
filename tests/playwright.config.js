const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',

  // Timeout settings
  timeout: 60000,
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
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
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
