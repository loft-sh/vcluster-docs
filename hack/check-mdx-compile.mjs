#!/usr/bin/env node
// Compile .mdx files the way the docs site parses them, without a full build.
//
// Bare @mdx-js/mdx rejects syntax the site accepts through Docusaurus's MDX 1
// compatibility defaults: HTML comments, which Vale needs for its toggles, and
// custom heading IDs such as `## Title {#anchor}`. This applies the same
// preprocessing and comment plugin as @docusaurus/mdx-loader, so a failure here
// is a real one. Every import comes with @docusaurus/core.
//
// Usage: node hack/check-mdx-compile.mjs <file.mdx> [...]
import fs from 'node:fs';
import {compile} from '@mdx-js/mdx';
import comment from '@slorber/remark-comment';
import gfm from 'remark-gfm';
import directive from 'remark-directive';
import utils from '@docusaurus/utils';

const {unwrapMdxCodeBlocks, escapeMarkdownHeadingIds} = utils;

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node hack/check-mdx-compile.mjs <file.mdx> [...]');
  process.exit(2);
}

let failed = 0;
for (const file of files) {
  const source = escapeMarkdownHeadingIds(
    unwrapMdxCodeBlocks(fs.readFileSync(file, 'utf8')),
  );
  try {
    await compile(source, {jsx: true, remarkPlugins: [gfm, directive, comment]});
    console.log(`OK   ${file}`);
  } catch (e) {
    failed += 1;
    const where = e.line ? `:${e.line}:${e.column}` : '';
    console.log(`FAIL ${file}${where} ${e.reason ?? e.message}`);
  }
}
process.exit(failed ? 1 : 0);
