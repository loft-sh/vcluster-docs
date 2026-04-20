/**
 * Content Negotiation Tests (DOC-1321)
 *
 * Verifies the Netlify Edge Function at netlify/edge-functions/content-negotiation.ts
 * serves sibling .md files when the client sends Accept: text/markdown, and
 * falls through to HTML otherwise.
 *
 * Uses Playwright's request fixture (no browser) so the test runs headlessly
 * on the `local` project without consuming BrowserStack minutes.
 *
 * Run against a deploy preview:
 *   TEST_BASE_URL=https://deploy-preview-1960--vcluster-docs-site.netlify.app \
 *     npm run test:local -- content-negotiation.spec.js
 */

const { test, expect, request } = require('@playwright/test');

const BASE_URL = process.env.TEST_BASE_URL || 'https://www.vcluster.com';

// Paths with a known .md sibling (listed in llms.txt).
const MD_BACKED_PATHS = [
  '/docs/vcluster/configure/vcluster-yaml/sleep',
  '/docs/platform',
  '/docs/vcluster',
];

test.describe('Content negotiation edge function', () => {
  let api;

  test.beforeAll(async () => {
    api = await request.newContext({ baseURL: BASE_URL });
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  for (const path of MD_BACKED_PATHS) {
    test(`${path} returns markdown when Accept: text/markdown`, async () => {
      const res = await api.get(path, {
        headers: { accept: 'text/markdown' },
        maxRedirects: 0,
      });

      expect(res.status()).toBe(200);
      expect(res.headers()['content-type'] || '').toMatch(/^text\/markdown/);
      expect((res.headers()['vary'] || '').toLowerCase()).toContain('accept');

      // Strong check: body must be markdown, not HTML.
      const body = await res.text();
      expect(body).not.toMatch(/^<!DOCTYPE html>/i);
      expect(body).toMatch(/^(---|#\s|import\s)/m);
    });

    test(`${path} returns HTML with no Accept header`, async () => {
      // Follow redirects — Docusaurus 301s to the trailing-slash variant.
      const res = await api.get(path);

      expect(res.status()).toBe(200);
      expect(res.headers()['content-type'] || '').toMatch(/text\/html/);
      const body = await res.text();
      expect(body).toMatch(/<!doctype html>/i);
    });
  }

  test('Accept: text/html is unaffected', async () => {
    const res = await api.get(MD_BACKED_PATHS[0], {
      headers: { accept: 'text/html' },
    });

    expect(res.status()).toBe(200);
    expect(res.headers()['content-type'] || '').toMatch(/text\/html/);
  });
});
