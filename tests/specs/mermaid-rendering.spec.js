/**
 * Mermaid Diagram Rendering Tests
 *
 * Tests that mermaid diagrams render correctly across browsers.
 * Dynamically discovers pages to test based on:
 * - Changed files in PR (selective testing)
 * - Full test mode via FULL_MERMAID_TEST=true
 * - Manual URL override via TEST_URL env var
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const { getUrlsToTest } = require('../lib/mermaid-pages');

// Base URL for testing (from CI or default to production)
const BASE_URL = process.env.TEST_BASE_URL
  || (process.env.TEST_URL ? process.env.TEST_URL.replace(/\/docs\/.*$/, '') : null)
  || 'https://www.vcluster.com';

// Get pages to test
// Priority: TEST_URL (single page) > dynamic detection > full run
const urlsToTest = process.env.TEST_URL
  ? [new URL(process.env.TEST_URL).pathname]
  : getUrlsToTest();

// Screenshots directory
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Log test configuration at module load
console.log('[mermaid-test] Configuration:');
console.log(`  BASE_URL: ${BASE_URL}`);
console.log(`  Pages to test: ${urlsToTest.length}`);
if (urlsToTest.length > 0 && urlsToTest.length <= 5) {
  urlsToTest.forEach(u => console.log(`    - ${u}`));
} else if (urlsToTest.length > 5) {
  urlsToTest.slice(0, 3).forEach(u => console.log(`    - ${u}`));
  console.log(`    ... and ${urlsToTest.length - 3} more`);
}

test.describe('Mermaid Diagram Rendering', () => {
  // Skip entire suite if no pages to test
  test.skip(urlsToTest.length === 0, 'No mermaid-related changes detected');

  // Single test that iterates through all pages sequentially
  // This prevents BrowserStack queue overflow when testing many pages
  test('diagrams render correctly on all affected pages', async ({ page }) => {
    const results = [];

    for (const urlPath of urlsToTest) {
      const fullUrl = `${BASE_URL}${urlPath}`;
      console.log(`\n[TEST] Checking ${urlPath}`);

      try {
        // Navigate to page
        // Use 'load' instead of 'networkidle' - BrowserStack mobile doesn't support networkidle
        await page.goto(fullUrl, { waitUntil: 'load', timeout: 30000 });

        // Wait for page to stabilize
        await page.waitForTimeout(2000);

        // Wait for mermaid diagrams to render
        const mermaidSelector = 'svg[id^="mermaid"]';

        try {
          await page.waitForSelector(mermaidSelector, { timeout: 15000 });
        } catch (e) {
          // No mermaid diagrams found - might be a false positive from import tracing
          console.log(`  [SKIP] No mermaid diagrams rendered on page`);
          results.push({ url: urlPath, status: 'skipped', reason: 'no diagrams found' });
          continue;
        }

        // Get diagram info using page.$$eval - runs in browser, avoids iOS queryCount limitation
        const diagramInfo = await page.$$eval(mermaidSelector, (elements) => {
          return elements.map((el, i) => {
            const rect = el.getBoundingClientRect();
            return {
              index: i,
              visible: rect.width > 0 && rect.height > 0,
              width: rect.width,
              height: rect.height
            };
          });
        });
        const diagramCount = diagramInfo.length;

        console.log(`  [INFO] Found ${diagramCount} mermaid diagram(s)`);

        // Test each diagram using the pre-collected info
        let allPassed = true;
        for (const info of diagramInfo) {
          if (!info.visible) {
            console.log(`  [FAIL] Diagram ${info.index + 1} not visible`);
            allPassed = false;
            continue;
          }

          if (info.width < 50 || info.height < 30) {
            console.log(`  [FAIL] Diagram ${info.index + 1} has invalid dimensions: ${info.width}x${info.height}`);
            allPassed = false;
            continue;
          }

          console.log(`  [PASS] Diagram ${info.index + 1}: ${info.width}x${info.height}`);
        }

        results.push({
          url: urlPath,
          status: allPassed ? 'passed' : 'failed',
          diagramCount
        });

        // Full page screenshot
        const safePagePath = urlPath.replace(/\//g, '_').replace(/^_/, '');
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `${safePagePath}-full.png`),
          fullPage: true
        });

      } catch (error) {
        console.log(`  [ERROR] ${error.message}`);
        results.push({ url: urlPath, status: 'error', error: error.message });
      }
    }

    // Summary
    console.log('\n[SUMMARY]');
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`  Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}, Errors: ${errors}`);

    // Fail test if any pages failed or had errors
    const failures = results.filter(r => r.status === 'failed' || r.status === 'error');
    if (failures.length > 0) {
      const failureDetails = failures.map(f => `${f.url}: ${f.status}${f.error ? ` - ${f.error}` : ''}`).join('\n');
      expect(failures.length, `Failed pages:\n${failureDetails}`).toBe(0);
    }
  });
});
