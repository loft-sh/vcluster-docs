// BrowserStack Legacy Integration for iOS Safari
// Direct WebSocket connection avoids SDK socket idle issues on iOS

const base = require("@playwright/test");
const BrowserStackLocal = require("browserstack-local");

exports.bsLocal = new BrowserStackLocal.Local();

exports.BS_LOCAL_ARGS = {
  key: process.env.BROWSERSTACK_ACCESS_KEY || "ACCESSKEY",
};

// Parse project name format: browser@device:osVersion@browserstack-ios
const getIosCaps = (testInfo) => {
  const name = testInfo.project.name;
  const combination = name.split(/@browserstack/)[0];
  const [browserCaps, osCaps] = combination.split(/:/);
  const [browser, deviceName] = browserCaps.split(/@/);
  const osVersion = osCaps ? osCaps.trim() : "17";

  return {
    browser: browser || "safari",
    deviceName: deviceName || "iPhone 15",
    osVersion: osVersion,
    realMobile: "true",
    name: `${testInfo.file} - ${testInfo.title}`,
    build: process.env.BROWSERSTACK_BUILD_NAME || "vCluster Docs - Mobile",
    "browserstack.username": process.env.BROWSERSTACK_USERNAME,
    "browserstack.accessKey": process.env.BROWSERSTACK_ACCESS_KEY,
    "browserstack.local": process.env.BROWSERSTACK_LOCAL || "true",
    "browserstack.idleTimeout": 300,
  };
};

exports.test = base.test.extend({
  page: async ({ page, playwright }, use, testInfo) => {
    if (testInfo.project.name.match(/browserstack-ios/)) {
      const caps = getIosCaps(testInfo);

      const browser = await playwright.webkit.connect({
        wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
          JSON.stringify(caps)
        )}`,
      });

      const context = await browser.newContext(testInfo.project.use);
      const vPage = await context.newPage();

      await use(vPage);

      await vPage.close();
      await browser.close();
    } else {
      await use(page);
    }
  },

  beforeEach: [
    async ({ page }, use, testInfo) => {
      // Tracing not supported on iOS
      if (!testInfo.project.name.match(/browserstack-ios/)) {
        await page.context().tracing.start({ screenshots: true, snapshots: true, sources: true });
      }
      await use();
    },
    { auto: true },
  ],

  afterEach: [
    async ({ page }, use, testInfo) => {
      await use();

      if (testInfo.status === "failed") {
        const isIOS = testInfo.project.name.match(/browserstack-ios/);
        try {
          await page.screenshot({ path: `${testInfo.outputDir}/screenshot.png` });
          await testInfo.attach("screenshot", {
            path: `${testInfo.outputDir}/screenshot.png`,
            contentType: "image/png",
          });

          if (!isIOS) {
            await page.context().tracing.stop({ path: `${testInfo.outputDir}/trace.zip` });
            await testInfo.attach("trace", {
              path: `${testInfo.outputDir}/trace.zip`,
              contentType: "application/zip",
            });
          }
        } catch (e) {
          console.log("Failed to capture screenshot/trace:", e.message);
        }
      }
    },
    { auto: true },
  ],
});

exports.expect = base.expect;
