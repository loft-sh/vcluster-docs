const { test, expect } = require('@playwright/test');

// Test URL - can be overridden via environment variable
const TEST_URL = process.env.TEST_URL ||
  'https://www.vcluster.com/docs/vcluster/deploy/worker-nodes/private-nodes/vpn';

test.describe('Mermaid Diagram Rendering', () => {
  test('diagrams render correctly with proper dimensions', async ({ page }) => {
    // Navigate to the documentation page
    await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for mermaid diagrams to render
    await page.waitForSelector('svg[id^="mermaid"]', { timeout: 15000 });

    // Additional wait for full rendering
    await page.waitForTimeout(3000);

    // Get all mermaid diagrams
    const diagrams = page.locator('svg[id^="mermaid"]');
    const diagramCount = await diagrams.count();

    // Ensure at least one diagram exists
    expect(diagramCount).toBeGreaterThan(0);

    // Verify each diagram is visible and has proper dimensions
    for (let i = 0; i < diagramCount; i++) {
      const diagram = diagrams.nth(i);

      // Check visibility
      await expect(diagram).toBeVisible();

      // Check dimensions
      const bbox = await diagram.boundingBox();
      expect(bbox).not.toBeNull();
      expect(bbox.width).toBeGreaterThan(0);
      expect(bbox.height).toBeGreaterThan(0);
    }
  });
});
