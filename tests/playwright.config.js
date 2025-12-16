const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './specs',
  testMatch: '**/*.spec.js',

  // Legacy iOS uses global setup/teardown for BrowserStack Local
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  timeout: 600000,
  expect: { timeout: 15000 },

  fullyParallel: false,
  workers: 1,
  retries: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    screenshot: 'only-on-failure',
    trace: 'off',
    actionTimeout: 15000,
    navigationTimeout: 45000,
  },

  projects: [
    {
      name: 'local',
      use: { ...devices['Desktop Safari'] },
    },
    {
      // Legacy iOS - direct WebSocket, no SDK
      // Format: browser@device:osVersion@browserstack-ios
      name: 'safari@iPhone 15:17@browserstack-ios',
      use: { browserName: 'webkit' },
    },
  ],
});
