const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { transformFileSync } = require('@babel/core');
const yaml = require('yaml');
const jiti = require('jiti')(__filename);

const config = jiti('../docusaurus.config.js').default;
const options = config.plugins.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === '@signalwire/docusaurus-plugin-llms-txt',
)[1].content;
const { convertHtmlToMarkdown } = jiti(
  '../node_modules/@signalwire/docusaurus-plugin-llms-txt/lib/transformation/html-parser.js',
);
const glossary = yaml.parse(fs.readFileSync(
  path.join(__dirname, '../src/data/glossary.yaml'), 'utf8',
));

// Render the real component, substituting only the webpack CSS and YAML loaders.
function loadGlossaryTerm(data = glossary) {
  const { code } = transformFileSync(
    path.join(__dirname, '../src/components/GlossaryTerm/index.jsx'),
    {
      babelrc: false,
      configFile: false,
      plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
    },
  );
  const componentModule = { exports: {} };
  const componentRequire = (id) => {
    if (id === './styles.module.css') {
      return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    }
    if (id === '@site/src/data/glossary.yaml') return data;
    return require(id);
  };
  new Function('require', 'module', 'exports', code)(
    componentRequire, componentModule, componentModule.exports,
  );
  return componentModule.exports.default;
}

const GlossaryTerm = loadGlossaryTerm();
const term = (id, children) => React.createElement(GlossaryTerm, { term: id }, children);
const render = (...children) => renderToStaticMarkup(
  React.createElement('main', null, React.createElement('p', null, ...children)),
);
const markdown = (html) => convertHtmlToMarkdown(
  html, { ...options, siteUrl: config.url }, ['main'],
).content.trim();

test('platform sentence exports only the visible glossary labels', () => {
  const html = render(
    'operating ', term('tenant-cluster', 'tenant clusters'),
    ' across one or more ', term('control-plane-cluster', 'control plane clusters'),
  );
  assert.equal(markdown(html), 'operating tenant clusters across one or more control plane clusters');
});

test('all glossary terms keep their HTML tooltips and export only their labels', () => {
  for (const [id, data] of Object.entries(glossary)) {
    const html = render(term(id));
    assert.match(html, /data-glossary-tooltip=/, id);
    const definition = React.createElement('span', { className: 'tooltipDefinition' }, data.definition);
    assert.ok(html.includes(renderToStaticMarkup(definition)), id);
    const label = data.url
      ? React.createElement('a', { href: data.url }, data.term)
      : data.term;
    assert.equal(markdown(html), markdown(render(label)), id);
  }
});

test('custom labels and inline formatting survive conversion', () => {
  assert.equal(
    markdown(render('These ', term('tenant-cluster', React.createElement('strong', null, 'clusters')), ' run workloads.')),
    'These **clusters** run workloads.',
  );
});

test('linked terms retain the visible link without the tooltip link or definition', () => {
  const LinkedTerm = loadGlossaryTerm({
    linked: { term: 'Linked term', definition: 'Tooltip definition.', url: 'https://example.com/term' },
  });
  const html = render(React.createElement(LinkedTerm, { term: 'linked' }, 'custom label'));
  assert.ok(html.includes('Tooltip definition.'));
  assert.equal(markdown(html), '[custom label](https://example.com/term)');
});

test('unknown glossary terms keep their fallback text', () => {
  assert.equal(markdown(render(term('unknown-term'))), 'unknown-term');
  assert.equal(markdown(render(term('unknown-term', 'custom label'))), 'custom label');
});

test('definitions in ordinary page content are preserved', () => {
  const definition = glossary['tenant-cluster'].definition;
  assert.equal(markdown(render(definition)), definition);
});

test('existing React comment filtering still runs', () => {
  assert.equal(markdown('<main><p>operating <!-- -->clusters<!-- --> today</p></main>'), 'operating clusters today');
});
