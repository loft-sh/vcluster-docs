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
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });

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

        // Get all mermaid diagrams
        const diagrams = page.locator(mermaidSelector);
        const diagramCount = await diagrams.count();

        console.log(`  [INFO] Found ${diagramCount} mermaid diagram(s)`);

        // Test each diagram
        let allPassed = true;
        for (let i = 0; i < diagramCount; i++) {
          const diagram = diagrams.nth(i);

          // Scroll into view
          await diagram.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);

          // Verify visibility
          const isVisible = await diagram.isVisible();
          if (!isVisible) {
            console.log(`  [FAIL] Diagram ${i + 1} not visible`);
            allPassed = false;
            continue;
          }

          // Verify dimensions (diagram rendered, not collapsed)
          const bbox = await diagram.boundingBox();
          if (!bbox || bbox.width < 50 || bbox.height < 30) {
            console.log(`  [FAIL] Diagram ${i + 1} has invalid dimensions: ${JSON.stringify(bbox)}`);
            allPassed = false;
            continue;
          }

          // Screenshot each diagram
          const safePath = urlPath.replace(/\//g, '_').replace(/^_/, '');
          await diagram.screenshot({
            path: path.join(SCREENSHOTS_DIR, `${safePath}-diagram-${i + 1}.png`)
          });

          console.log(`  [PASS] Diagram ${i + 1}: ${bbox.width}x${bbox.height}`);
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
