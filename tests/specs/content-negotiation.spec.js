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

// BrowserStack Local routes requests through a tunnel with a self-signed
// cert; page.request validates by default, so we opt out of TLS verification
// for this spec. Safe here — we only assert on Netlify CDN responses.
test.use({ ignoreHTTPSErrors: true });

test.describe('Content negotiation edge function', () => {
  for (const p of MD_BACKED_PATHS) {
    test(`${p} returns markdown when Accept: text/markdown`, async ({ page }) => {
      // page.request runs inside the BrowserStack session's network stack
      // but sends only the headers we specify — page.goto() lets Chromium
      // append its default Accept list which outranks the edge-function match.
      const response = await page.request.get(`${BASE_URL}${p}`, {
        headers: { accept: 'text/markdown' },
      });

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type'] || '').toMatch(/^text\/markdown/);
      expect((response.headers()['vary'] || '').toLowerCase()).toContain('accept');

      // Strong check: body must be markdown, not HTML.
      const body = await response.text();
      expect(body).not.toMatch(/^<!DOCTYPE html>/i);
      expect(body).toMatch(/^(---|#\s|import\s)/m);
    });

    test(`${p} returns HTML when the browser navigates normally`, async ({ page }) => {
      // Default browser Accept does not include text/markdown — edge function
      // should fall through and serve the HTML page.
      const response = await page.goto(`${BASE_URL}${p}`);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type'] || '').toMatch(/text\/html/);
    });
  }

  // Sweep a random sample from llms.txt so a regression on any one page
  // (the plugin stops emitting it, the path pattern the edge function
  // can't resolve, Vary mis-set at a CDN node) surfaces in CI. The full
  // list has ~485 entries; sampling 20 keeps each CI run under ~1 minute.
  test('random sample from llms.txt serves markdown', async ({ page }) => {
    test.setTimeout(120000);

    const manifest = await page.request.get(`${BASE_URL}/docs/llms.txt`);
    expect(manifest.status()).toBe(200);

    // Extract URLs out of the llms.txt markdown link syntax: [title](URL).
    // Stop at whitespace and the closing paren so we don't capture it.
    const raw = (await manifest.text()).match(/https?:\/\/[^\s)<>"']+/g) ?? [];
    const paths = [...new Set(
      raw
        .filter((u) => u.includes('/docs/'))
        .map((u) => new URL(u).pathname)
        // llms.txt currently lists `.md` URLs directly — strip to the HTML
        // form so the edge function rewrite is what we're exercising, not
        // static serving of the .md file.
        .map((p) => (p.endsWith('.md') ? p.slice(0, -3) : p)),
    )];
    expect(paths.length).toBeGreaterThan(50);

    const sample = paths.sort(() => Math.random() - 0.5).slice(0, 20);
    const failures = [];

    for (const path of sample) {
      const res = await page.request.get(`${BASE_URL}${path}`, {
        headers: { accept: 'text/markdown' },
      });
      const ct = res.headers()['content-type'] || '';
      const vary = (res.headers()['vary'] || '').toLowerCase();
      if (res.status() !== 200 || !ct.startsWith('text/markdown') || !vary.includes('accept')) {
        failures.push(`${path} → status=${res.status()} ct=${ct} vary=${vary}`);
      }
    }

    expect(failures, `markdown regressions on ${failures.length}/${sample.length} sampled paths`).toEqual([]);
  });
});
