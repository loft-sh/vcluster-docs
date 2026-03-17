// Feature Table Mobile Rendering - WebdriverIO version
// Tests that feature comparison tables are scrollable and readable on iOS Safari
//
// These pages contain FeatureTable components. In CI, runs against Netlify deploy
// preview where paths don't include /next/. Locally against dev server they do.

const FEATURE_TABLE_PAGES = [
  '/docs/platform/free-vs-enterprise',
];

const WRAPPER_SELECTOR = '[class*="featureTableWrapper"]';

describe('Feature Table Mobile Rendering', () => {
  for (const pagePath of FEATURE_TABLE_PAGES) {
    describe(pagePath, () => {
      it('renders feature table with visible headers', async () => {
        await browser.url(pagePath);

        // Wait for the FeatureTable React component to render
        const wrapper = await $(WRAPPER_SELECTOR);
        await wrapper.waitForExist({ timeout: 10000 });

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

        const wrapper = await $(WRAPPER_SELECTOR);
        await wrapper.waitForExist({ timeout: 10000 });

        // Check that the wrapper enables horizontal scrolling
        const scrollData = await browser.execute(() => {
          const w = document.querySelector('[class*="featureTableWrapper"]');
          if (!w) return null;
          return {
            scrollWidth: w.scrollWidth,
            clientWidth: w.clientWidth,
            isScrollable: w.scrollWidth > w.clientWidth,
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

        const wrapper = await $(WRAPPER_SELECTOR);
        await wrapper.waitForExist({ timeout: 10000 });

        // Verify feature name cells are visible and have content
        const featureNames = await browser.execute(() => {
          const w = document.querySelector('[class*="featureTableWrapper"]');
          if (!w) return [];
          const cells = w.querySelectorAll('tbody tr td:first-child');
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

        const wrapper = await $(WRAPPER_SELECTOR);
        await wrapper.waitForExist({ timeout: 10000 });

        const iconData = await browser.execute(() => {
          const w = document.querySelector('[class*="featureTableWrapper"]');
          if (!w) return null;
          const checkmarks = w.querySelectorAll('[title*="Available in"]');
          const crosses = w.querySelectorAll('[title*="Not available in"]');
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
