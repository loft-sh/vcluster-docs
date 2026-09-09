/**
 * Unit tests for scripts/wrap-glossary-terms.js.
 *
 * Uses Node's built-in test runner (node --test); no extra dependencies.
 * Run: node --test tests/wrap-glossary-terms.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { isInProtectedArea } = require('../scripts/wrap-glossary-terms.js');

// Finds the first case-insensitive match of `term` in `content` and asserts
// whether isInProtectedArea considers that position protected.
function checkTerm(content, term) {
  const index = content.toLowerCase().indexOf(term.toLowerCase());
  assert.notEqual(index, -1, `fixture must contain "${term}"`);
  return isInProtectedArea(content, index, term);
}

test('does not protect a plain prose mention', () => {
  const content = 'The tenant cluster scales down its workloads.';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term inside a markdown table row', () => {
  const content = '| Method | Behavior |\n| --- | --- |\n| Manual | Pauses the vcluster CLI. |\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside an indented markdown table row', () => {
  const content = '  | Method | Behavior |\n  | Manual | Pauses the vcluster CLI. |\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term in markdown link text', () => {
  const content = 'See [the vcluster CLI](../cli/overview.mdx) for details.';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a markdown link destination', () => {
  const content = 'See [Configure auto sleep](../configure/vcluster-yaml/sleep.mdx) for details.';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a link destination with balanced parens', () => {
  const content = 'See [docs](https://example.test/foo_(bar)/k3s/reference) for details.';
  assert.equal(checkTerm(content, 'k3s'), true);
});

test('protects a term after an escaped parenthesis in a link destination', () => {
  const content = 'See [docs](https://example.test/foo_\\)/k3s/reference) for details.';
  assert.equal(checkTerm(content, 'k3s'), true);
});

test('does not protect prose that follows a closed link on the same line', () => {
  const content = 'See [Configure auto sleep](../configure/vcluster-yaml/sleep.mdx) for tenant cluster details.';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term inside a link reference definition', () => {
  const content = 'See [the repo][repo] for details.\n\n[repo]: https://github.com/loft-sh/vcluster-selinux\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a link reference definition without whitespace', () => {
  const content = '[repo]:https://github.com/loft-sh/vcluster-selinux\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a multiline link reference destination', () => {
  const content = '[repo]:\n  https://github.com/loft-sh/vcluster-selinux\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a GFM bare URL autolink', () => {
  const content = 'Workflow: https://github.com/loft-demos/k8s-image-mirror/actions';
  assert.equal(checkTerm(content, 'k8s'), true);
});

test('does not protect prose following a bare URL on the same line', () => {
  const content = 'See https://example.test/docs before the tenant cluster description.';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term inside a code span', () => {
  const content = 'Run `vcluster --version` in a terminal.';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term already inside a GlossaryTerm tag', () => {
  const content = 'The <GlossaryTerm term="tenant-cluster">tenant cluster</GlossaryTerm> is ready.';
  assert.equal(checkTerm(content, 'tenant cluster'), true);
});

test('does not protect a later, distinct term near a closed GlossaryTerm tag', () => {
  const content = 'The <GlossaryTerm term="tenant-cluster">tenant cluster</GlossaryTerm> and the syncer work together.';
  assert.equal(checkTerm(content, 'syncer'), false);
});

test('protects a term inside frontmatter', () => {
  const content = '---\ntitle: About vcluster\n---\n\nBody text.\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term in a markdown heading', () => {
  const content = '## Configure vcluster\n\nBody text.\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a four-backtick fence', () => {
  const content = '````yaml\nkey: vcluster\n````\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('does not protect prose following a four-backtick fence', () => {
  const content = '````yaml\nkey: value\n````\n\nThe tenant cluster scales down its workloads.\n';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term inside a single-line MDX comment', () => {
  const content = '{/* mentions vcluster internally */}\n\nBody text.\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a multiline MDX comment', () => {
  const content = [
    '{/*',
    'One possible usage for adding annotations to all the vCluster components.',
    '*/}',
    '',
    'Body text about vCluster elsewhere.',
  ].join('\n');
  const firstIndex = content.indexOf('vCluster');
  assert.equal(isInProtectedArea(content, firstIndex, 'vCluster'), true);
});

test('does not protect a visible mention after an MDX comment', () => {
  const content = [
    '{/*',
    'One possible usage for adding annotations to all the vCluster components.',
    '*/}',
    '',
    'Body text about vCluster elsewhere.',
  ].join('\n');
  const lastIndex = content.lastIndexOf('vCluster');
  assert.equal(isInProtectedArea(content, lastIndex, 'vCluster'), false);
});

test('protects a triple-backtick example nested inside a four-backtick fence', () => {
  const content = [
    '````md',
    '```yaml',
    'name: vcluster',
    '```',
    '````',
  ].join('\n');
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('does not protect prose after a nested fenced example', () => {
  const content = [
    '````md',
    '```yaml',
    'name: value',
    '```',
    '````',
    '',
    'The tenant cluster is visible prose.',
  ].join('\n');
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('allows a longer backtick run to close a shorter opening fence', () => {
  const content = '```yaml\nname: value\n````\n\nThe tenant cluster is visible prose.\n';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term inside a tilde fence', () => {
  const content = '~~~yaml\nname: vcluster\n~~~\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('does not protect prose following a tilde fence', () => {
  const content = '~~~yaml\nname: value\n~~~\n\nThe tenant cluster is visible prose.\n';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term inside a fenced blockquote', () => {
  const content = '> ~~~yaml\n> name: vcluster\n> ~~~\n';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a variable-length inline code span', () => {
  const content = 'Use ``vcluster `literal` output`` here.';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('does not protect prose following a variable-length inline code span', () => {
  const content = 'Use ``a `literal` output`` before the tenant cluster description.';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('does not treat an unmatched backtick as an inline code span', () => {
  const content = 'An unmatched ` marker appears before tenant cluster prose.';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term inside an exported MDX value', () => {
  const content = 'export const label = "vCluster Platform";\n\nVisible prose.';
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('protects a term inside a multiline exported MDX component', () => {
  const content = [
    'export const Example = () => {',
    '  const label = "vCluster Platform";',
    '',
    '  return <span>{label}</span>;',
    '};',
    '',
    'Visible prose.',
  ].join('\n');
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('does not protect prose after an exported MDX component', () => {
  const content = [
    'export const Example = () => {',
    '  return <span>Example</span>;',
    '};',
    '',
    'The tenant cluster is visible prose.',
  ].join('\n');
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term inside a standalone MDX expression', () => {
  const content = '{enabled ? "vCluster" : "other"}\n\nVisible prose.';
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('does not protect prose after a standalone MDX expression', () => {
  const content = '{enabled ? "enabled" : "disabled"} then tenant cluster prose.';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term inside an HTML code element', () => {
  const content = 'Use <code>vcluster.yaml</code> for configuration.';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a Docusaurus CodeBlock component', () => {
  const content = '<CodeBlock>vcluster create demo</CodeBlock>';
  assert.equal(checkTerm(content, 'vcluster'), true);
});

test('protects a term inside a Docusaurus Link component', () => {
  const content = '<Link to="/docs/platform">vCluster Platform</Link>';
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('protects a term inside a raw anchor', () => {
  const content = '<a href="/docs/platform">vCluster Platform</a>';
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('protects a term inside a details summary', () => {
  const content = '<details><summary>Configure vCluster</summary>Visible prose.</details>';
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('protects a term inside a JSX heading', () => {
  const content = '<h3>Configure vCluster</h3>\n\nVisible prose.';
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('does not protect prose after a protected JSX element', () => {
  const content = '<Link to="/docs/platform">Platform docs</Link> describe the tenant cluster.';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects a term after a greater-than sign in a double-quoted JSX attribute', () => {
  const content = '<Component label="value > vCluster" />';
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('protects a term after a greater-than sign in a single-quoted JSX attribute', () => {
  const content = "<Component label='value > vCluster' />";
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('protects a term in a JSX expression after a greater-than operator', () => {
  const content = '<Component label={count > 0 ? "vCluster" : "none"} />';
  assert.equal(checkTerm(content, 'vCluster'), true);
});

test('does not protect prose following a tag with a quoted greater-than sign', () => {
  const content = '<Component label="done > now" /> The tenant cluster is visible prose.';
  assert.equal(checkTerm(content, 'tenant cluster'), false);
});

test('protects paired JSX children when an attribute contains a greater-than sign', () => {
  const content = '<Link title="x > y" to="/docs">vCluster</Link>';
  assert.equal(checkTerm(content, 'vCluster'), true);
});
