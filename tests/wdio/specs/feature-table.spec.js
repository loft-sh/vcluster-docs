// Feature Table Mobile Rendering - WebdriverIO version
// Tests that feature comparison tables are scrollable and readable on iOS Safari

const FEATURE_TABLE_PAGES = [
  '/docs/platform/free-vs-enterprise',
  '/docs/platform/use-platform/virtual-clusters/key-features/sleep-mode',
];

describe('Feature Table Mobile Rendering', () => {
  for (const pagePath of FEATURE_TABLE_PAGES) {
    describe(pagePath, () => {
      it('renders feature table with visible headers', async () => {
        await browser.url(pagePath);
        await browser.pause(2000);

        const wrapper = await $('[class*="featureTableWrapper"]');
        expect(await wrapper.isDisplayed()).toBe(true);

        const table = await wrapper.$('table');
        expect(await table.isDisplayed()).toBe(true);

        // Verify column headers are present (Free, Dev, Prod, Scale)
        const headers = await table.$$('thead th');
        const headerTexts = [];
        for (const header of headers) {
          const text = await header.getText();
          if (text.trim()) headerTexts.push(text.trim());
        }

        expect(headerTexts).toContain('Free');
        expect(headerTexts).toContain('Scale');

        console.log(`  [PASS] Feature table headers visible on ${pagePath}: ${headerTexts.join(', ')}`);
      });

      it('is horizontally scrollable on mobile viewport', async () => {
        await browser.url(pagePath);
        await browser.pause(2000);

        // Check that the wrapper enables horizontal scrolling
        const scrollData = await browser.execute(() => {
          const wrapper = document.querySelector('[class*="featureTableWrapper"]');
          if (!wrapper) return null;
          return {
            scrollWidth: wrapper.scrollWidth,
            clientWidth: wrapper.clientWidth,
            isScrollable: wrapper.scrollWidth > wrapper.clientWidth,
          };
        });

        expect(scrollData).not.toBeNull();
        expect(scrollData.isScrollable).toBe(true);

        console.log(
          `  [PASS] Feature table scrollable on ${pagePath}: ` +
          `scrollWidth=${scrollData.scrollWidth}, clientWidth=${scrollData.clientWidth}`
        );
      });

      it('shows feature names without clipping', async () => {
        await browser.url(pagePath);
        await browser.pause(2000);

        // Verify feature name cells are visible and have content
        const featureNames = await browser.execute(() => {
          const wrapper = document.querySelector('[class*="featureTableWrapper"]');
          if (!wrapper) return [];
          const cells = wrapper.querySelectorAll('tbody tr td:first-child');
          return Array.from(cells).slice(0, 5).map(td => ({
            text: td.textContent.trim(),
            width: td.getBoundingClientRect().width,
          }));
        });

        expect(featureNames.length).toBeGreaterThan(0);

        for (const feature of featureNames) {
          expect(feature.text.length).toBeGreaterThan(0);
          expect(feature.width).toBeGreaterThan(50);
        }

        console.log(
          `  [PASS] Feature names readable on ${pagePath}: ` +
          `${featureNames.map(f => f.text).join(', ')}`
        );
      });

      it('shows checkmarks and crosses in tier columns', async () => {
        await browser.url(pagePath);
        await browser.pause(2000);

        const iconData = await browser.execute(() => {
          const wrapper = document.querySelector('[class*="featureTableWrapper"]');
          if (!wrapper) return null;
          const checkmarks = wrapper.querySelectorAll('[title*="Available in"]');
          const crosses = wrapper.querySelectorAll('[title*="Not available in"]');
          return {
            checkmarks: checkmarks.length,
            crosses: crosses.length,
            total: checkmarks.length + crosses.length,
          };
        });

        expect(iconData).not.toBeNull();
        expect(iconData.total).toBeGreaterThan(0);

        console.log(
          `  [PASS] Tier icons on ${pagePath}: ` +
          `${iconData.checkmarks} checkmarks, ${iconData.crosses} crosses`
        );
      });
    });
  }
});
