// Mermaid Diagram Rendering - WebdriverIO version
// Tests that mermaid diagrams render correctly on iOS Safari

const MERMAID_PAGES = [
  '/docs/vcluster/deploy/basics',
  '/docs/vcluster/configure/vcluster-yaml/sync/',
  '/docs/platform/install/quick-start-guide',
];

describe('Mermaid Diagram Rendering', () => {
  for (const pagePath of MERMAID_PAGES) {
    it(`renders diagrams on ${pagePath}`, async () => {
      await browser.url(pagePath);
      await browser.pause(1000);

      const diagrams = await $$('svg[id^="mermaid"]');

      if (diagrams.length === 0) {
        console.log(`  [SKIP] No mermaid diagrams on ${pagePath}`);
        return;
      }

      console.log(`  [INFO] Found ${diagrams.length} diagram(s)`);

      for (let i = 0; i < diagrams.length; i++) {
        const diagram = diagrams[i];
        const isDisplayed = await diagram.isDisplayed();
        const size = await diagram.getSize();

        expect(isDisplayed).toBe(true);
        expect(size.width).toBeGreaterThan(50);
        expect(size.height).toBeGreaterThan(30);

        console.log(`  [PASS] Diagram ${i + 1}: ${size.width}x${size.height}`);
      }
    });
  }
});
