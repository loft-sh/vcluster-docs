/**
 * Content Negotiation Tests (DOC-1321)
 *
 * Verifies the Netlify Edge Function at netlify/edge-functions/content-negotiation.ts
 * serves sibling .md files when the client sends Accept: text/markdown, and
 * falls through to HTML otherwise.
 *
 * Uses the `page` fixture with context.setExtraHTTPHeaders so each request
 * is issued by a real BrowserStack browser session (Safari, Chromium, iOS
 * Safari) under the run-e2e label. The edge function runs at Netlify's
 * CDN layer — identical for every browser — but routing this through real
 * browsers confirms the response is accepted by each engine.
 *
 * Triggered in CI by applying the `run-e2e` label to a PR
 * (.github/workflows/integration-tests.yml).
 *
 * Run locally against a deploy preview:
 *   TEST_BASE_URL=https://deploy-preview-1960--vcluster-docs-site.netlify.app \
 *     npm run test:local -- content-negotiation.spec.js
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.TEST_BASE_URL
  || (process.env.TEST_URL ? process.env.TEST_URL.replace(/\/docs\/.*$/, '') : null)
  || 'https://www.vcluster.com';

// Paths with a known .md sibling (listed in llms.txt).
const MD_BACKED_PATHS = [
  '/docs/vcluster/configure/vcluster-yaml/sleep',
  '/docs/platform',
  '/docs/vcluster',
];

test.describe('Content negotiation edge function', () => {
  for (const p of MD_BACKED_PATHS) {
    test(`${p} returns markdown when Accept: text/markdown`, async ({ page, context }) => {
      await context.setExtraHTTPHeaders({ accept: 'text/markdown' });

      const response = await page.goto(`${BASE_URL}${p}`, { waitUntil: 'commit' });

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type'] || '').toMatch(/^text\/markdown/);
      expect((response.headers()['vary'] || '').toLowerCase()).toContain('accept');

      // Strong check: body must be markdown, not HTML.
      const body = await response.text();
      expect(body).not.toMatch(/^<!DOCTYPE html>/i);
      expect(body).toMatch(/^(---|#\s|import\s)/m);
    });

    test(`${p} returns HTML without the Accept header`, async ({ page }) => {
      // Default browser Accept does not include text/markdown — edge function
      // should fall through and serve the HTML page.
      const response = await page.goto(`${BASE_URL}${p}`);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type'] || '').toMatch(/text\/html/);
    });
  }
});
