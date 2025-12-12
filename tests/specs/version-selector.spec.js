/**
 * Version Selector Rendering Tests
 *
 * Tests that version selector renders correctly on desktop and mobile across browsers.
 * Tests both vCluster and Platform documentation sections.
 *
 * Test coverage:
 * - Desktop: Version selector visible in sidebar
 * - Mobile: Version selector visible above "On this page" TOC
 * - Dropdown functionality works on both viewports
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

// Base URL for testing (from CI or default to production)
const BASE_URL = process.env.TEST_BASE_URL || 'https://www.vcluster.com';

// Test pages - one from each docs section
const TEST_PAGES = [
  { path: '/docs/vcluster/', section: 'vCluster', pluginId: 'vcluster' },
  { path: '/docs/platform/', section: 'Platform', pluginId: 'platform' }
];

// Viewport sizes
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

// Screenshots directory
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

test.describe('Version Selector', () => {

  test.describe('Desktop', () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    for (const testPage of TEST_PAGES) {
      test(`renders in sidebar for ${testPage.section} docs`, async ({ page }) => {
        const fullUrl = `${BASE_URL}${testPage.path}`;
        console.log(`[TEST] Desktop version selector: ${testPage.section}`);

        await page.goto(fullUrl, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(1000);

        // Desktop sidebar version selector
        const versionSelector = page.locator('[class*="version-selector"] a').first();
        await expect(versionSelector).toBeVisible({ timeout: 10000 });

        const selectorText = await versionSelector.textContent();
        console.log(`  [INFO] Version selector text: ${selectorText}`);

        // Verify version pattern (vX.XX or main)
        expect(selectorText).toMatch(/v\d+\.\d+|main/i);

        // Take screenshot
        const safeName = testPage.section.toLowerCase().replace(/\s+/g, '-');
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `version-selector-desktop-${safeName}.png`),
          fullPage: false
        });

        console.log(`  [PASS] Desktop version selector visible for ${testPage.section}`);
      });
    }

    test('dropdown opens and shows versions for vCluster', async ({ page }) => {
      const fullUrl = `${BASE_URL}/docs/vcluster/`;
      console.log('[TEST] Desktop version dropdown functionality');

      await page.goto(fullUrl, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Find and click version selector
      const versionSelector = page.locator('[class*="version-selector"] a').first();
      await expect(versionSelector).toBeVisible({ timeout: 10000 });
      await versionSelector.click();
      await page.waitForTimeout(500);

      // Look for dropdown menu
      const dropdownMenu = page.locator('[class*="dropdown__menu"]');
      await expect(dropdownMenu).toBeVisible({ timeout: 5000 });

      // Verify dropdown contains multiple version options
      const versionOptions = dropdownMenu.locator('a, li');
      const optionCount = await versionOptions.count();
      console.log(`  [INFO] Found ${optionCount} version options in dropdown`);

      expect(optionCount).toBeGreaterThan(1);

      // Take screenshot
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'version-selector-desktop-dropdown-open.png'),
        fullPage: false
      });

      console.log('  [PASS] Desktop version dropdown opens and shows multiple versions');
    });
  });

  test.describe('Mobile', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    for (const testPage of TEST_PAGES) {
      test(`version selector visible above TOC for ${testPage.section}`, async ({ page }) => {
        const fullUrl = `${BASE_URL}${testPage.path}`;
        console.log(`[TEST] Mobile version selector visibility: ${testPage.section}`);

        await page.goto(fullUrl, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(1000);

        // Mobile version selector uses tocCollapsible class from TOCCollapsible wrapper
        // It appears above "On this page" TOC (not in hamburger menu)
        // We look for the first tocCollapsible which is the version selector
        const versionSelector = page.locator('[class*="tocCollapsible"]').first();
        await expect(versionSelector).toBeVisible({ timeout: 10000 });

        // Find the button within the version selector (shows current version label)
        const versionButton = versionSelector.locator('button').first();
        await expect(versionButton).toBeVisible({ timeout: 5000 });

        const selectorText = await versionButton.textContent();
        console.log(`  [INFO] Mobile version selector text: ${selectorText}`);

        // Verify version pattern (vX.XX or main or Stable)
        expect(selectorText).toMatch(/v\d+\.\d+|main|Stable/i);

        // Take screenshot
        const safeName = testPage.section.toLowerCase().replace(/\s+/g, '-');
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `version-selector-mobile-${safeName}.png`),
          fullPage: false
        });

        console.log(`  [PASS] Mobile version selector visible for ${testPage.section}`);
      });

      test(`version collapsible opens and shows versions for ${testPage.section}`, async ({ page }) => {
        const fullUrl = `${BASE_URL}${testPage.path}`;
        console.log(`[TEST] Mobile version collapsible functionality: ${testPage.section}`);

        await page.goto(fullUrl, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(1000);

        // Click version selector button to expand collapsible
        const versionSelector = page.locator('[class*="tocCollapsible"]').first();
        const versionButton = versionSelector.locator('button').first();
        await expect(versionButton).toBeVisible({ timeout: 10000 });
        await versionButton.click();
        await page.waitForTimeout(500);

        // Verify collapsible content appears with multiple versions
        const collapsibleContent = versionSelector.locator('[class*="tocCollapsibleContent"]');
        await expect(collapsibleContent).toBeVisible({ timeout: 5000 });

        const versionOptions = collapsibleContent.locator('a');
        const optionCount = await versionOptions.count();
        console.log(`  [INFO] Found ${optionCount} version options in collapsible`);

        expect(optionCount).toBeGreaterThan(1);

        // Take screenshot of expanded collapsible
        const safeName = testPage.section.toLowerCase().replace(/\s+/g, '-');
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `version-selector-mobile-expanded-${safeName}.png`),
          fullPage: false
        });

        console.log(`  [PASS] Mobile version collapsible shows ${optionCount} versions for ${testPage.section}`);
      });
    }

    test('selecting version navigates to correct URL for vCluster', async ({ page }) => {
      const fullUrl = `${BASE_URL}/docs/vcluster/`;
      console.log('[TEST] Mobile version navigation');

      await page.goto(fullUrl, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Expand version selector
      const versionSelector = page.locator('[class*="tocCollapsible"]').first();
      const versionButton = versionSelector.locator('button').first();
      await expect(versionButton).toBeVisible({ timeout: 10000 });
      await versionButton.click();
      await page.waitForTimeout(500);

      // Find and click on a different version (e.g., v0.29)
      const collapsibleContent = versionSelector.locator('[class*="tocCollapsibleContent"]');
      const v029Option = collapsibleContent.locator('a').filter({ hasText: /v0\.29/i }).first();

      if (await v029Option.count() > 0) {
        await v029Option.click();
        await page.waitForTimeout(2000);

        // Verify URL changed to include the version
        const currentUrl = page.url();
        console.log(`  [INFO] Navigated to: ${currentUrl}`);

        expect(currentUrl).toMatch(/0\.29/);
        console.log('  [PASS] Version navigation works correctly');
      } else {
        console.log('  [SKIP] v0.29 option not found, skipping navigation test');
      }

      // Take screenshot
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'version-selector-mobile-navigation.png'),
        fullPage: false
      });
    });
  });
});
