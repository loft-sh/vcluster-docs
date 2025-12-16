const BASE_URL = process.env.TEST_BASE_URL || 'https://www.vcluster.com';

// Build name from CI environment or fallback
const buildName = process.env.BROWSERSTACK_BUILD_NAME || 'vCluster Docs - Mobile (WDIO)';

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  specs: ['./specs/*.spec.js'],
  maxInstances: 1,

  capabilities: [{
    'bstack:options': {
      deviceName: 'iPhone 15',
      osVersion: '17',
      projectName: 'vCluster Docs',
      buildName: buildName,
      local: true,
      debug: true,
    },
    browserName: 'safari',
  }],

  services: [
    ['browserstack', {
      browserstackLocal: true,
    }]
  ],

  baseUrl: BASE_URL,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    timeout: 300000,
  },
};
