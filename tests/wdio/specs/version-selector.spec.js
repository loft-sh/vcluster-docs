// Version Selector - WebdriverIO version
// Tests version selector visibility and functionality on iOS Safari

const TEST_PAGES = [
  { path: '/docs/vcluster/', section: 'vCluster' },
  { path: '/docs/platform/', section: 'Platform' },
];

describe('Version Selector', () => {
  for (const testPage of TEST_PAGES) {
    it(`visible on mobile for ${testPage.section}`, async () => {
      await browser.url(testPage.path);
      await browser.pause(1000);

      // Find TOC collapsible which contains version selector
      const collapsible = await $('[class*="tocCollapsible"]');
      expect(await collapsible.isDisplayed()).toBe(true);

      console.log(`  [PASS] Version selector visible for ${testPage.section}`);
    });

    it(`collapsible works for ${testPage.section}`, async () => {
      await browser.url(testPage.path);
      await browser.pause(1000);

      // Find TOC collapsible
      const collapsible = await $('[class*="tocCollapsible"]');
      const button = await collapsible.$('button');
      await button.click();
      await browser.pause(500);

      // Check content expanded
      const content = await collapsible.$('[class*="tocCollapsibleContent"]');
      expect(await content.isDisplayed()).toBe(true);

      console.log(`  [PASS] Version collapsible works for ${testPage.section}`);
    });
  }
});
