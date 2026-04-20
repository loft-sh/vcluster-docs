/**
 * Markdown content parity regression tests.
 *
 * Guards the fix from DOC-1322: React emits empty `<!-- -->` markers
 * around JSX expression boundaries (e.g. around `<GlossaryTerm>`
 * mid-sentence), and those markers used to survive the HTML → Markdown
 * pipeline in @signalwire/docusaurus-plugin-llms-txt. Any `.md` emitted
 * with `<!--` / `-->` substrings means the rehype plugin at
 * plugins/rehype-strip-comments.js has regressed or been unhooked.
 *
 * The sample pages are ones that were heavily affected before the fix
 * (glossary terms appear mid-sentence, so the JSX comment markers
 * clustered on them).
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.TEST_BASE_URL || 'https://www.vcluster.com';

const SAMPLE_PAGES = [
  '/docs/vcluster/key-features/sleep.md',
  '/docs/vcluster/manage/backup-restore/backup.md',
  '/docs/vcluster/manage/sleep-wakeup.md',
];

test.describe('llms-txt markdown parity', () => {
  for (const path of SAMPLE_PAGES) {
    test(`${path} contains no JSX comment markers`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'load', timeout: 30000 });
      expect(response?.status()).toBe(200);

      const body = await page.evaluate(() => document.body.innerText);

      expect(body, `${path} has <!-- markers leaking through from JSX boundaries`).not.toContain('<!--');
      expect(body, `${path} has --> markers leaking through from JSX boundaries`).not.toContain('-->');
    });
  }
});
