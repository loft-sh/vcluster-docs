#!/usr/bin/env node

/**
 * Reports likely drift between Platform docs UI tokens and the Platform UI source.
 *
 * Usage:
 *   npm run report-platform-ui-drift
 *   node scripts/report-platform-ui-drift.js --json
 *   node scripts/report-platform-ui-drift.js --ui-src ../loft-enterprise/ui/src
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DOC_COMPONENTS = ['Button', 'Label', 'NavStep', 'Field', 'Input'];
const UI_TEXT_PROPS = [
  'aria-label',
  'description',
  'displayName',
  'label',
  'name',
  'placeholder',
  'saveText',
  'submitLabel',
  'title',
  'tooltip',
];
const INSTRUCTION_PHRASES = [
  /\bdrop ?down arrow\b/gi,
  /\bdrop ?down menu\b/gi,
  /\bdrawer\b/gi,
  /\bconfiguration pane\b/gi,
  /\btextarea\b/gi,
  /\bcheckbox\b/gi,
  /\bleft menu\b/gi,
  /\bleft sidebar\b/gi,
];
const DEFAULT_DOCS_ROOT = path.join(__dirname, '..', 'platform');
const DEFAULT_UI_SRC = path.join(__dirname, '..', '..', 'loft-enterprise', 'ui', 'src');
const UI_FILE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const UI_IGNORE = [
  '**/__mocks__/**',
  '**/gen/**',
  '**/schemas/**',
  '**/*.spec.*',
  '**/*.test.*',
  '**/*.d.ts',
];
const MIN_TOKEN_LENGTH = 3;
// Tokens that are real UI text but can never match the UI source, because the
// string is defined outside it. Listing them keeps the actionable findings
// actionable: a report where most findings are known false positives trains
// people to skim past the real ones. Each entry needs a reason, and they are
// printed in their own section rather than suppressed.
const KNOWN_DYNAMIC_TOKENS = [
  {
    match: /^destinationnamespace$|^otlpendpoint$|^platformhost$/,
    reason: 'Template parameter name, rendered from the template\'s own schema',
  },
  {
    match: /^fleet observability: /,
    reason: 'Argo CD Application Template name, created by the operator or shipped as a stack',
  },
  {
    match: /^nvsentinel$/,
    reason: 'Third-party application name, not Platform UI text',
  },
  {
    match: /^argo cd (template|application) id$/,
    reason: "Built from the entityTypeName prop in the shared form controls, not a literal",
  },
  {
    match: /namespace constraints$/,
    reason:
      'Feature exists (breadcrumb at breadcumbsTransforms.ts, route /clusters/spaceconstraints) ' +
      'but has no dedicated component file with literal strings',
  },
];

function knownDynamicReason(token) {
  const entry = KNOWN_DYNAMIC_TOKENS.find((candidate) => candidate.match.test(token.normalized));
  return entry ? entry.reason : null;
}
// `**Section > Item**` and `` `Section` > `Item` `` in prose.
const PROSE_NAV_PATTERNS = [
  /\*\*[A-Z][A-Za-z &]+(?: > [A-Z][A-Za-z &]+)+\*\*/g,
  /`[A-Z][A-Za-z &]+`(?: > `[A-Z][A-Za-z &]+`)+/g,
];

function parseArgs(argv) {
  const args = {
    docsRoot: DEFAULT_DOCS_ROOT,
    uiSrc: DEFAULT_UI_SRC,
    json: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--json') {
      args.json = true;
      continue;
    }

    if (arg === '--docs-root') {
      args.docsRoot = path.resolve(argv[++i]);
      continue;
    }

    if (arg === '--ui-src') {
      args.uiSrc = path.resolve(argv[++i]);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function assertDirectory(dir, label) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`${label} does not exist or is not a directory: ${dir}`);
  }
}

function normalizeText(value) {
  return value
    .replace(/\{['"`]\s*['"`]\}/g, ' ')
    .replace(/\{['"`]([^'"`]+)['"`]\}/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeForSearch(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/argocd/g, 'argo cd')
    .replace(/vcluster/g, 'vcluster')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[.。]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getNavStepSegments(value) {
  return normalizeText(value)
    .split('>')
    .map((segment) => normalizeForSearch(segment))
    .filter((segment) => segment.length >= MIN_TOKEN_LENGTH);
}

function getLineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

function extractTokens(filePath, docsRoot, uiSectionLabels = new Set()) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tokens = [];
  const skippedDynamic = [];
  const instructionPhrases = [];

  for (const component of DOC_COMPONENTS) {
    const pattern = new RegExp(`<${component}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${component}>`, 'g');
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const text = normalizeText(match[1]);
      const normalized = normalizeForSearch(text);
      const line = getLineNumber(content, match.index);

      if (/[{}]/.test(normalized)) {
        skippedDynamic.push({
          component,
          text,
          file: path.relative(docsRoot, filePath),
          line,
        });
        continue;
      }

      if (normalized.length < MIN_TOKEN_LENGTH) {
        continue;
      }

      tokens.push({
        component,
        text,
        normalized,
        file: path.relative(docsRoot, filePath),
        line,
      });
    }
  }

  const contentLines = content.split('\n');
  const proseContent = contentLines
    .map((line) => (/^\s*import\s/.test(line) ? '' : line))
    .join('\n');

  for (const phrasePattern of INSTRUCTION_PHRASES) {
    let match;

    while ((match = phrasePattern.exec(proseContent)) !== null) {
      instructionPhrases.push({
        text: normalizeText(match[0]),
        normalized: normalizeForSearch(match[0]),
        file: path.relative(docsRoot, filePath),
        line: getLineNumber(proseContent, match.index),
      });
    }
  }

  // Nav paths also get written as bold or backticked prose rather than <NavStep>.
  // Those are the same drift with the same reader impact, and a component-only
  // scan cannot see them. DOC-1790 found seven that way, after the NavStep pass
  // reported clean.
  for (const pattern of PROSE_NAV_PATTERNS) {
    let match;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(proseContent)) !== null) {
      const text = normalizeText(match[0].replace(/[`*]/g, ''));
      const normalized = normalizeForSearch(text);

      if (normalized.length < MIN_TOKEN_LENGTH || /[{}]/.test(normalized)) {
        continue;
      }

      const firstSegment = getNavStepSegments(text)[0];
      if (!firstSegment || !uiSectionLabels.has(firstSegment)) {
        continue;
      }

      tokens.push({
        component: 'NavStep',
        viaProse: true,
        text,
        normalized,
        file: path.relative(docsRoot, filePath),
        line: getLineNumber(proseContent, match.index),
      });
    }
  }

  return { tokens, skippedDynamic, instructionPhrases };
}

function getMdxFiles(docsRoot) {
  return glob.sync('**/*.mdx', {
    cwd: docsRoot,
    absolute: true,
    nodir: true,
    ignore: ['**/node_modules/**', '**/build/**', '**/.docusaurus/**'],
  });
}

function getUiFiles(uiSrc) {
  return glob
    .sync('**/*', {
      cwd: uiSrc,
      absolute: true,
      nodir: true,
      ignore: UI_IGNORE,
    })
    .filter((file) => UI_FILE_EXTENSIONS.has(path.extname(file)));
}

// Sidebar section labels, used to tell a prose nav path from a click sequence.
function loadSectionLabels(uiSrc) {
  const file = path.join(uiSrc, 'Layout', 'Sidebar', 'config', 'sections.ts');
  const labels = new Set();

  if (!fs.existsSync(file)) {
    return labels;
  }

  const source = fs.readFileSync(file, 'utf8');
  const pattern = /label:\s*["'`]([^"'`]+)["'`]/g;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    labels.add(normalizeForSearch(match[1]));
  }

  return labels;
}

// Many UI strings are built from RESOURCE_LABELS rather than written literally,
// e.g. `Deploy to ${RESOURCE_LABELS.cluster.singular}` or, in JSX,
// {RESOURCE_LABELS.cluster.titleCase.singular} ID. Without resolving those,
// every such label reports as drift forever and real drift hides in the noise.
// Returns a flat map of dotted path -> string, or null if the file moved.
function loadResourceLabels(uiSrc) {
  const file = path.join(uiSrc, 'constants', 'resource-labels.ts');

  if (!fs.existsSync(file)) {
    return null;
  }

  const source = fs.readFileSync(file, 'utf8');
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');

  if (start === -1 || end === -1) {
    return null;
  }

  const objectLiteral = source
    .slice(start, end + 1)
    .replace(/\/\/[^\n]*/g, '')
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    .replace(/,(\s*[}\]])/g, '$1');

  let parsed;
  try {
    parsed = JSON.parse(objectLiteral);
  } catch {
    return null;
  }

  const flat = new Map();
  const walk = (node, prefix) => {
    for (const [key, value] of Object.entries(node)) {
      const next = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object') {
        walk(value, next);
      } else if (typeof value === 'string') {
        flat.set(next, value);
      }
    }
  };
  walk(parsed, '');

  return flat;
}

function resolveResourceLabels(content, labels) {
  if (!labels) {
    return content;
  }

  return content.replace(/\$?\{\s*RESOURCE_LABELS\.([\w.]+)\s*\}/g, (whole, key) =>
    labels.has(key) ? labels.get(key) : whole
  );
}

function buildUiIndex(uiSrc) {
  const files = getUiFiles(uiSrc);
  const labels = loadResourceLabels(uiSrc);
  const haystack = files
    .map((file) => normalizeUiSource(resolveResourceLabels(fs.readFileSync(file, 'utf8'), labels)))
    .join('\n');

  return {
    fileCount: files.length,
    resourceLabelCount: labels ? labels.size : 0,
    hasToken: (token) => haystack.includes(token),
  };
}

function normalizeUiSource(content) {
  return [content, extractUiTextProps(content)].map((value) => normalizeForSearch(value)).join('\n');
}

function extractUiTextProps(content) {
  const propPattern = new RegExp(
    `(?:${UI_TEXT_PROPS.join('|')})\\s*=\\s*(?:"([^"]+)"|'([^']+)'|\\{\\s*["'\`]([^"'\`]+)["'\`]\\s*\\})`,
    'g'
  );
  const values = [];
  let match;

  while ((match = propPattern.exec(content)) !== null) {
    values.push(match[1] ?? match[2] ?? match[3]);
  }

  return values.join('\n');
}

function isTokenFound(token, uiIndex) {
  if (token.component !== 'NavStep') {
    return uiIndex.hasToken(token.normalized);
  }

  const segments = getNavStepSegments(token.text);
  if (segments.length > 1) {
    return segments.every((segment) => uiIndex.hasToken(segment));
  }

  return uiIndex.hasToken(token.normalized);
}

function summarize(tokens, uiIndex) {
  const byKey = new Map();

  for (const token of tokens) {
    const key = `${token.component}\0${token.normalized}`;
    const existing = byKey.get(key);

    if (existing) {
      existing.occurrences.push({ file: token.file, line: token.line });
      continue;
    }

    byKey.set(key, {
      component: token.component,
      text: token.text,
      normalized: token.normalized,
      foundInUi: isTokenFound(token, uiIndex),
      knownDynamic: knownDynamicReason(token),
      occurrences: [{ file: token.file, line: token.line }],
    });
  }

  return Array.from(byKey.values()).sort((a, b) => {
    if (a.foundInUi !== b.foundInUi) return a.foundInUi ? 1 : -1;
    if (a.component !== b.component) return a.component.localeCompare(b.component);
    return a.text.localeCompare(b.text);
  });
}

function groupByFile(unmatched) {
  const groups = new Map();

  for (const token of unmatched) {
    for (const occurrence of token.occurrences) {
      const group = groups.get(occurrence.file) ?? [];
      group.push({
        line: occurrence.line,
        component: token.component,
        text: token.text,
      });
      groups.set(occurrence.file, group);
    }
  }

  return Array.from(groups.entries())
    .map(([file, tokens]) => ({
      file,
      tokens: tokens.sort((a, b) => a.line - b.line || a.text.localeCompare(b.text)),
    }))
    .sort((a, b) => a.file.localeCompare(b.file));
}

function summarizeInstructionPhrases(phrases) {
  const byKey = new Map();

  for (const phrase of phrases) {
    const key = `${phrase.file}\0${phrase.line}\0${phrase.normalized}`;
    if (byKey.has(key)) {
      continue;
    }

    byKey.set(key, {
      text: phrase.text,
      normalized: phrase.normalized,
      file: phrase.file,
      line: phrase.line,
    });
  }

  return Array.from(byKey.values()).sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line || a.text.localeCompare(b.text);
  });
}

function groupInstructionPhrasesByFile(phrases) {
  const groups = new Map();

  for (const phrase of phrases) {
    const group = groups.get(phrase.file) ?? [];
    group.push({
      line: phrase.line,
      text: phrase.text,
    });
    groups.set(phrase.file, group);
  }

  return Array.from(groups.entries())
    .map(([file, phrases]) => ({
      file,
      phrases: phrases.sort((a, b) => a.line - b.line || a.text.localeCompare(b.text)),
    }))
    .sort((a, b) => a.file.localeCompare(b.file));
}

function printReport(report) {
  console.log('Platform UI docs drift token report');
  console.log('');
  console.log(`Docs root: ${report.docsRoot}`);
  console.log(`UI src:    ${report.uiSrc}`);
  console.log(`Docs files scanned: ${report.docsFilesScanned}`);
  console.log(`UI files scanned:   ${report.uiFilesScanned}`);
  console.log(`Unique UI tokens:   ${report.uniqueTokens}`);
  console.log(`Matched in UI:      ${report.matchedTokens}`);
  console.log(`Unmatched in UI:    ${report.unmatchedTokens}`);
  console.log(`Skipped dynamic:    ${report.skippedDynamicTokens}`);
  console.log(`Instruction phrases:${report.instructionPhraseCount}`);

  if (report.unmatched.length === 0) {
    console.log('');
    console.log('No unmatched docs UI tokens found.');
    return;
  }

  console.log('');
  console.log('Unmatched tokens by docs file:');

  for (const group of report.unmatched) {
    console.log('');
    console.log(group.file);

    for (const token of group.tokens) {
      console.log(`  ${token.line}: <${token.component}>${token.text}</${token.component}>`);
    }
  }

  console.log('');
  if (report.knownDynamic.length > 0) {
    console.log('');
    console.log('Known dynamic, not drift:');
    console.log('');
    for (const token of report.knownDynamic) {
      console.log(`  ${token.text}  (x${token.occurrences})`);
      console.log(`    ${token.reason}`);
    }
  }

  console.log('');
  console.log('Note: this is a report-only heuristic. Unmatched tokens are review leads, not proof of drift.');

  if (report.instructionPhrases.length === 0) {
    return;
  }

  console.log('');
  console.log('Unwrapped UI-instruction phrases:');

  for (const group of report.instructionPhrases) {
    console.log('');
    console.log(group.file);

    for (const phrase of group.phrases) {
      console.log(`  ${phrase.line}: ${phrase.text}`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv);
  assertDirectory(args.docsRoot, 'Docs root');
  assertDirectory(args.uiSrc, 'UI source directory');

  const mdxFiles = getMdxFiles(args.docsRoot);
  const uiSectionLabels = loadSectionLabels(args.uiSrc);
  const extractionResults = mdxFiles.map((file) =>
    extractTokens(file, args.docsRoot, uiSectionLabels)
  );
  const tokens = extractionResults.flatMap((result) => result.tokens);
  const skippedDynamic = extractionResults.flatMap((result) => result.skippedDynamic);
  const instructionPhrases = extractionResults.flatMap((result) => result.instructionPhrases);
  const uiIndex = buildUiIndex(args.uiSrc);
  const summarized = summarize(tokens, uiIndex);
  const allUnmatched = summarized.filter((token) => !token.foundInUi);
  const unmatched = allUnmatched.filter((token) => !token.knownDynamic);
  const knownDynamic = allUnmatched.filter((token) => token.knownDynamic);
  const matched = summarized.length - allUnmatched.length;
  const summarizedInstructionPhrases = summarizeInstructionPhrases(instructionPhrases);

  const report = {
    docsRoot: args.docsRoot,
    uiSrc: args.uiSrc,
    docsFilesScanned: mdxFiles.length,
    uiFilesScanned: uiIndex.fileCount,
    uniqueTokens: summarized.length,
    matchedTokens: matched,
    unmatchedTokens: unmatched.length,
    knownDynamicTokens: knownDynamic.length,
    knownDynamic: knownDynamic.map((token) => ({
      text: token.text,
      reason: token.knownDynamic,
      occurrences: token.occurrences.length,
    })),
    skippedDynamicTokens: skippedDynamic.length,
    skippedDynamic,
    instructionPhraseCount: summarizedInstructionPhrases.length,
    instructionPhrases: groupInstructionPhrasesByFile(summarizedInstructionPhrases),
    unmatched: groupByFile(unmatched),
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  printReport(report);
}

main();
