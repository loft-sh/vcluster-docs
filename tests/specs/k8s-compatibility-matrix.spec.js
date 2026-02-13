/**
 * Kubernetes Compatibility Matrix Tests
 *
 * Tests that the data-driven compatibility matrix renders correctly,
 * including the known-issue status with footnotes.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const BASE_URL = process.env.TEST_BASE_URL || 'https://www.vcluster.com';
const MATRIX_PATH = '/docs/vcluster/next/deploy/upgrade/supported_versions#kubernetes-compatibility-matrix';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

test.describe('Kubernetes Compatibility Matrix', () => {
  test.describe('Desktop', () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    test('renders table with correct structure', async ({ page }) => {
      await page.goto(`${BASE_URL}${MATRIX_PATH}`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Table exists with header rows
      const table = page.locator('table').filter({ hasText: 'Host Cluster Kubernetes Version' });
      await expect(table).toBeVisible({ timeout: 10000 });

      // Has data rows (at least 3 kubernetes versions)
      const dataRows = table.locator('tbody tr');
      const rowCount = await dataRows.count();
      expect(rowCount).toBeGreaterThanOrEqual(3);

      // Each row starts with a version label like "v1.34"
      const firstRowLabel = dataRows.first().locator('td').first();
      await expect(firstRowLabel).toHaveText(/v\d+\.\d+/);
    });

    test('displays legend with all statuses', async ({ page }) => {
      await page.goto(`${BASE_URL}${MATRIX_PATH}`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Legend shows all three statuses
      const legend = page.locator('ul').filter({ hasText: 'Tested and verified' });
      await expect(legend).toBeVisible({ timeout: 10000 });
      await expect(legend.getByText('Likely compatible')).toBeVisible();
      await expect(legend.getByText('Known issues')).toBeVisible();
    });

    test('known-issue cells have footnote markers', async ({ page }) => {
      await page.goto(`${BASE_URL}${MATRIX_PATH}`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000);

      // At least one superscript footnote reference exists
      const noteRefs = page.locator('table sup');
      const refCount = await noteRefs.count();
      expect(refCount).toBeGreaterThanOrEqual(1);

      // Footnote text renders below the table
      const footnotes = page.locator('ol').filter({ hasText: 'EndpointSlice' });
      await expect(footnotes).toBeVisible({ timeout: 10000 });

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'k8s-matrix-desktop.png'),
        fullPage: false
      });
    });
  });

  test.describe('Mobile', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test('table is accessible on mobile viewport', async ({ page }) => {
      await page.goto(`${BASE_URL}${MATRIX_PATH}`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000);

      const table = page.locator('table').filter({ hasText: 'Host Cluster Kubernetes Version' });
      await expect(table).toBeVisible({ timeout: 10000 });

      // Legend still visible
      const legend = page.locator('ul').filter({ hasText: 'Tested and verified' });
      await expect(legend).toBeVisible({ timeout: 10000 });

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'k8s-matrix-mobile.png'),
        fullPage: false
      });
    });
  });
});
