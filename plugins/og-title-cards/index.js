/**
 * Docusaurus plugin: generate an Open Graph title card for every docs page.
 *
 * After the static build, this reads each page's title, renders a 1200x630
 * PNG in the style of Design's "Open Graph vCluster B" (dark) component, and
 * points the page's og:image and twitter:image at it.
 *
 * - Pages that set their own `image:` frontmatter keep it. Only pages still
 *   using the site default (themeConfig.image) get a generated card.
 * - Pages that share a title and product (the same page across docs versions)
 *   share one card.
 *
 * It runs in postBuild, after the static build has released most of its
 * memory, so it doesn't raise the build's peak memory (measured for DOC-1965).
 *
 * It only runs for Netlify production deploys (CONTEXT=production), the same
 * gate docusaurus.config.js uses for GTM. Local builds, deploy previews, and
 * branch deploys skip it and keep the default card. To force it either way,
 * set OG_TITLE_CARDS=true or OG_TITLE_CARDS=false.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const WIDTH = 1200;
const HEIGHT = 630;

// Bump when the card layout changes. It's part of each card's file name, so
// a new layout gets new URLs and LinkedIn and other sites don't keep serving
// their cached copies of the old cards.
const TEMPLATE_VERSION = 2;

async function loadAssets() {
  const fontDir = path.dirname(require.resolve('@fontsource/inter/package.json'));
  const [bold, logo] = await Promise.all([
    fs.readFile(path.join(fontDir, 'files/inter-latin-700-normal.woff')),
    fs.readFile(path.join(__dirname, 'logo.svg')),
  ]);
  const dataUri = (buf) => `data:image/svg+xml;base64,${buf.toString('base64')}`;
  return {
    fonts: [{ name: 'Inter', data: bold, weight: 700, style: 'normal' }],
    logo: dataUri(logo),
  };
}

const el = (type, style, children, props = {}) => ({ type, props: { style, children, ...props } });

// Layout follows Open Graph vCluster B (dark): Black-100 background, the
// vCluster logo, and a #373C50 rule. The page title replaces the static
// subtitle, with the product as an orange eyebrow above it. The component's
// line pattern is left out at Design's request (2026-11-10).
function card({ eyebrow, title }, assets) {
  return el('div', {
    width: WIDTH, height: HEIGHT, display: 'flex', position: 'relative',
    backgroundColor: '#050B24', fontFamily: 'Inter',
  }, [
    el('div', {
      position: 'absolute', left: 96, top: 72, width: 880,
      display: 'flex', flexDirection: 'column',
    }, [
      el('img', { width: 315, height: 80 }, undefined, { src: assets.logo, width: 315, height: 80 }),
      el('div', { marginTop: 48, width: 681, height: 4, backgroundColor: '#373C50' }),
      el('div', { marginTop: 48, color: '#FF6600', fontSize: 30, fontWeight: 700 }, eyebrow),
      el('div', {
        marginTop: 16, color: '#FFFFFF', fontSize: 60, fontWeight: 700,
        lineHeight: 1.15, letterSpacing: -1, display: 'flex',
      }, title),
    ]),
  ]);
}

const decodeEntities = (s) => s
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// The production HTML is minified, so attribute values may be unquoted.
const ATTR_VALUE = String.raw`(?:"([^"]*)"|'([^']*)'|([^\s>]+))`;
const OG_IMAGE_RE = new RegExp(String.raw`(<meta[^>]+(?:property=["']?og:image\b|name=["']?twitter:image\b)[^>]*?content=)` + ATTR_VALUE, 'g');
const OG_TITLE_RE = new RegExp(String.raw`<meta[^>]+property=["']?og:title\b[^>]*?content=` + ATTR_VALUE);

function readMeta(html) {
  const img = new RegExp(OG_IMAGE_RE.source).exec(html);
  const title = OG_TITLE_RE.exec(html) || /<title[^>]*>([^<]*)<\/title>/.exec(html);
  return {
    image: img ? (img[2] ?? img[3] ?? img[4]) : null,
    title: title ? decodeEntities(title[1] ?? title[2] ?? title[3] ?? '') : null,
  };
}

function eyebrowFor(route) {
  if (route.startsWith('platform/')) return 'vCluster Platform docs';
  if (route.startsWith('vcluster/')) return 'vCluster docs';
  return 'vCluster Labs docs';
}

function cleanTitle(raw) {
  const t = raw.replace(/\s*\|\s*vCluster\s*$/, '').trim();
  return t.length > 90 ? `${t.slice(0, 87).trimEnd()}...` : t;
}

async function* htmlFiles(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['assets', 'img', 'media', 'og'].includes(entry.name)) yield* htmlFiles(p);
    } else if (entry.name === 'index.html') {
      yield p;
    }
  }
}

function isEnabled(env = process.env) {
  if (env.OG_TITLE_CARDS === 'true') return true;
  if (env.OG_TITLE_CARDS === 'false') return false;
  return env.CONTEXT === 'production';
}

module.exports = function ogTitleCards(context, options = {}) {
  const { siteConfig } = context;
  const concurrency = options.concurrency ?? 4;
  const outSubdir = options.outSubdir ?? 'og';

  return {
    name: 'og-title-cards',

    async postBuild({ outDir }) {
      if (!isEnabled()) {
        console.log('[og-title-cards] skipped: not a Netlify production build (set OG_TITLE_CARDS=true to force)');
        return;
      }
      const defaultImage = siteConfig.themeConfig.image;
      if (!defaultImage) return;
      const defaultUrl = new URL(siteConfig.baseUrl + defaultImage, siteConfig.url).href;
      const cardBase = new URL(`${siteConfig.baseUrl}${outSubdir}/`, siteConfig.url).href;

      const satori = require('satori').default ?? require('satori');
      const { Resvg } = require('@resvg/resvg-js');
      const assets = await loadAssets();
      await fs.mkdir(path.join(outDir, outSubdir), { recursive: true });

      const files = [];
      for await (const f of htmlFiles(outDir)) files.push(f);

      const rendered = new Map();
      const stats = { pages: files.length, updated: 0, custom: 0, skipped: 0 };
      const started = Date.now();

      async function render(info) {
        const key = crypto.createHash('sha1').update(`v${TEMPLATE_VERSION}|${info.eyebrow}|${info.title}`).digest('hex').slice(0, 16);
        if (!rendered.has(key)) {
          rendered.set(key, (async () => {
            const svg = await satori(card(info, assets), { width: WIDTH, height: HEIGHT, fonts: assets.fonts });
            const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
            await fs.writeFile(path.join(outDir, outSubdir, `${key}.png`), png);
          })());
        }
        await rendered.get(key);
        return `${cardBase}${key}.png`;
      }

      async function processFile(file) {
        const html = await fs.readFile(file, 'utf8');
        const meta = readMeta(html);
        if (!meta.image || !meta.title) { stats.skipped++; return; }
        if (meta.image !== defaultUrl) { stats.custom++; return; }
        const route = path.relative(outDir, path.dirname(file)).split(path.sep).join('/') + '/';
        const url = await render({ eyebrow: eyebrowFor(route), title: cleanTitle(meta.title) });
        await fs.writeFile(file, html.replace(OG_IMAGE_RE, `$1"${url}"`));
        stats.updated++;
      }

      let next = 0;
      await Promise.all(Array.from({ length: concurrency }, async () => {
        while (next < files.length) await processFile(files[next++]);
      }));

      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`[og-title-cards] ${rendered.size} cards for ${stats.updated} pages in ${seconds}s `
        + `(${stats.custom} custom, ${stats.skipped} without a title or image)`);
    },
  };
};
