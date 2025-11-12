const { webkit, chromium, firefox } = require('playwright');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

// Get Playwright version
const clientPlaywrightVersion = cp
  .execSync('npx playwright --version')
  .toString()
  .trim()
  .split(' ')[1];

// Configuration
const TEST_URL = process.env.TEST_URL || 'https://deploy-preview-1368--vclustertestdocs.netlify.app/docs/vcluster/deploy/topologies/multi-namespace-mode/';
const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || process.env.BROWSER_STACK_USER;
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || process.env.BROWSER_STACK_API_KEY;
const RUN_LOCAL = process.env.PLAYWRIGHT_LOCAL === 'true';

// Browser test configurations for BrowserStack
const BROWSER_CONFIGS = [
  // Safari
  {
    name: 'Safari 17.3 on macOS Sonoma',
    os: 'osx',
    os_version: 'Sonoma',
    browser: 'playwright-webkit',
    browser_version: 'latest',
    browserType: webkit,
  },
  {
    name: 'Safari 15.6 on macOS Monterey',
    os: 'osx',
    os_version: 'Monterey',
    browser: 'playwright-webkit',
    browser_version: 'latest',
    browserType: webkit,
  },
  {
    name: 'Safari 16.5 on macOS Ventura',
    os: 'osx',
    os_version: 'Ventura',
    browser: 'playwright-webkit',
    browser_version: 'latest',
    browserType: webkit,
  },
  // Chrome
  {
    name: 'Chrome 131 on macOS Sonoma',
    os: 'osx',
    os_version: 'Sonoma',
    browser: 'playwright-chromium',
    browser_version: 'latest',
    browserType: chromium,
  },
  {
    name: 'Chrome 131 on Windows 11',
    os: 'Windows',
    os_version: '11',
    browser: 'playwright-chromium',
    browser_version: 'latest',
    browserType: chromium,
  },
  // Firefox
  {
    name: 'Firefox 133 on macOS Sonoma',
    os: 'osx',
    os_version: 'Sonoma',
    browser: 'playwright-firefox',
    browser_version: 'latest',
    browserType: firefox,
  },
  {
    name: 'Firefox 133 on Windows 11',
    os: 'Windows',
    os_version: '11',
    browser: 'playwright-firefox',
    browser_version: 'latest',
    browserType: firefox,
  },
];

async function runTest(config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${config.name}`);
  console.log(`${'='.repeat(60)}\n`);

  const caps = {
    ...config,
    'browserstack.username': BROWSERSTACK_USERNAME,
    'browserstack.accessKey': BROWSERSTACK_ACCESS_KEY,
    'client.playwrightVersion': clientPlaywrightVersion,
    'browserstack.debug': 'true',
    'browserstack.console': 'info',
    'browserstack.networkLogs': 'true',
    build: 'vCluster Mermaid Diagram Test',
    name: `Mermaid Rendering - ${config.name}`,
    project: 'vCluster Documentation',
  };

  let browser;
  let page;
  let testPassed = false;
  let errorMessage = '';

  try {
    // Connect to BrowserStack
    const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
    console.log('Connecting to BrowserStack...');
    browser = await config.browserType.connect(wsEndpoint);

    // Create new page
    page = await browser.newPage();
    console.log(`Navigating to: ${TEST_URL}`);

    // Navigate to the page
    await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded');

    // Wait for mermaid diagrams to render
    console.log('Waiting for mermaid diagrams to render...');
    await page.waitForSelector('svg[id^="mermaid"]', { timeout: 15000 });
    console.log('Mermaid SVG elements found');

    // Wait a bit more for full rendering
    await page.waitForTimeout(3000);

    // Check how many mermaid diagrams are present
    const diagramCount = await page.locator('svg[id^="mermaid"]').count();
    console.log(`Found ${diagramCount} mermaid diagram(s)`);

    // Take screenshot of the full page
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const sanitizedName = config.name.replace(/[^a-zA-Z0-9]/g, '_');
    const screenshotPath = path.join(screenshotDir, `${sanitizedName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    // Verify diagrams are visible
    for (let i = 0; i < diagramCount; i++) {
      const diagram = page.locator('svg[id^="mermaid"]').nth(i);
      const isVisible = await diagram.isVisible();
      const bbox = await diagram.boundingBox();

      console.log(`Diagram ${i + 1}: visible=${isVisible}, dimensions=${bbox ? `${bbox.width}x${bbox.height}` : 'N/A'}`);

      if (!isVisible || !bbox || bbox.width === 0 || bbox.height === 0) {
        throw new Error(`Diagram ${i + 1} is not properly rendered`);
      }
    }

    testPassed = true;
    console.log('\n✅ TEST PASSED: All mermaid diagrams rendered correctly');
  } catch (error) {
    testPassed = false;
    errorMessage = error.message;
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
    }
  }

  return {
    config: config.name,
    passed: testPassed,
    error: errorMessage,
  };
}

async function runLocalTest() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Running LOCAL test (not on BrowserStack)');
  console.log(`${'='.repeat(60)}\n`);

  const browser = await webkit.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to: ${TEST_URL}`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 30000 });

    await page.waitForSelector('svg[id^="mermaid"]', { timeout: 15000 });
    const diagramCount = await page.locator('svg[id^="mermaid"]').count();
    console.log(`Found ${diagramCount} mermaid diagram(s)`);

    const screenshotPath = path.join(__dirname, 'screenshots', 'local_test.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    console.log('\n✅ LOCAL TEST PASSED');
    return { config: 'Local WebKit', passed: true, error: '' };
  } catch (error) {
    console.error('\n❌ LOCAL TEST FAILED:', error.message);
    return { config: 'Local WebKit', passed: false, error: error.message };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('\n🧪 vCluster Documentation - Mermaid Diagram Rendering Tests\n');
  console.log(`Playwright version: ${clientPlaywrightVersion}`);
  console.log(`Test URL: ${TEST_URL}`);
  console.log(`Running in ${RUN_LOCAL ? 'LOCAL' : 'BROWSERSTACK'} mode\n`);

  if (RUN_LOCAL) {
    const result = await runLocalTest();
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`${result.config}: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    process.exit(result.passed ? 0 : 1);
  }

  if (!BROWSERSTACK_USERNAME || !BROWSERSTACK_ACCESS_KEY) {
    console.error('❌ ERROR: BrowserStack credentials not found!');
    console.error('Please set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables');
    process.exit(1);
  }

  const results = [];

  // Run tests sequentially to avoid overwhelming BrowserStack
  for (const config of BROWSER_CONFIGS) {
    const result = await runTest(config);
    results.push(result);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  results.forEach(result => {
    console.log(`${result.config}: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log('-'.repeat(60) + '\n');

  // Exit with error if any test failed
  process.exit(failedCount > 0 ? 1 : 0);
}

// Run tests
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
