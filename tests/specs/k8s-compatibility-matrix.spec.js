/**
 * Kubernetes Compatibility Matrix Tests
 *
 * Tests that the data-driven compatibility matrix renders correctly,
 * including the known-issue status with footnotes.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const compatibilityData = require('../../static/api/k8s-compatibility.json');

const BASE_URL = process.env.TEST_BASE_URL || 'https://www.vcluster.com';
const MATRIX_PATH = '/docs/vcluster/next/reference/lifecycle-policy#kubernetes-compatibility-matrix';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Match the component's CSS module class, not the header wording, so a
// terminology change in the header doesn't break the locator.
const MATRIX_TABLE = 'table[class*="matrixTable"]';

// Cells that carry a footnote reference, from the same data the component renders.
const NOTED_CELL_COUNT = compatibilityData.matrix
  .flatMap((row) => Object.values(row.vcluster))
  .filter((cell) => typeof cell === 'object' && cell !== null && cell.note).length;

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

test.describe('Kubernetes Compatibility Matrix', () => {
  test.describe('Desktop', () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    test('renders table with correct structure', async ({ page }) => {
      await page.goto(`${BASE_URL}${MATRIX_PATH}`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Table exists with header rows
      const table = page.locator(MATRIX_TABLE);
      await expect(table).toBeVisible({ timeout: 10000 });

      // One data row per Kubernetes version in the data
      const dataRows = table.locator('tbody tr');
      await expect(dataRows).toHaveCount(compatibilityData.matrix.length);

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
      test.skip(compatibilityData.notes.length === 0, 'No known issues in k8s-compatibility.json');

      await page.goto(`${BASE_URL}${MATRIX_PATH}`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Every noted cell renders a superscript footnote reference
      await expect(page.locator(`${MATRIX_TABLE} sup`)).toHaveCount(NOTED_CELL_COUNT);

      // Each note's text renders in the list below the table
      const footnotes = page.locator(`${MATRIX_TABLE} ~ ol`);
      await expect(footnotes).toBeVisible({ timeout: 10000 });
      await expect(footnotes.locator('li')).toHaveCount(compatibilityData.notes.length);

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

      const table = page.locator(MATRIX_TABLE);
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
