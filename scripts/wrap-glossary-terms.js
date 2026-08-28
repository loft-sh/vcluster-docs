#!/usr/bin/env node

/**
 * wrap-glossary-terms.js
 * 
 * This script automatically wraps glossary terms found in MDX files with <GlossaryTerm> components.
 * 
 * Rules:
 * - Only wraps terms that exist in glossary.yaml
 * - Only wraps the first occurrence of each term in a document
 * - Terms must be in canonical form (lowercase)
 * - Respects the glossary.yaml type setting (vcluster, platform, or both)
 * 
 * Usage:
 *   node scripts/wrap-glossary-terms.js <file-or-directory>
 *   npm run wrap-glossary <file-or-directory>
 * 
 * Examples:
 *   node scripts/wrap-glossary-terms.js vcluster/deploy/basics.mdx
 *   node scripts/wrap-glossary-terms.js vcluster/deploy/
 *   node scripts/wrap-glossary-terms.js platform/
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

// Load the glossary data
const glossaryPath = path.join(__dirname, '../src/data/glossary.yaml');
const glossaryData = yaml.load(fs.readFileSync(glossaryPath, 'utf8'));

// Create a map of canonical terms (lowercase) to their keys
const canonicalTermMap = {};
Object.entries(glossaryData).forEach(([key, data]) => {
  const canonicalTerm = data.term.toLowerCase();
  canonicalTermMap[canonicalTerm] = key;
});

// Function to determine if a file should process a term based on its type
function shouldProcessTerm(filePath, termData) {
  const type = termData.type;
  
  // If type is an array, check if it includes the appropriate type
  if (Array.isArray(type)) {
    if (filePath.includes('/vcluster/') || filePath.includes('/vcluster_versioned_docs/')) {
      return type.includes('vcluster');
    }
    if (filePath.includes('/platform/') || filePath.includes('/platform_versioned_docs/')) {
      return type.includes('platform');
    }
    // For other paths (like docs/), accept if it has either type
    return type.includes('vcluster') || type.includes('platform');
  }
  
  // If type is a string
  if (filePath.includes('/vcluster/') || filePath.includes('/vcluster_versioned_docs/')) {
    return type === 'vcluster';
  }
  if (filePath.includes('/platform/') || filePath.includes('/platform_versioned_docs/')) {
    return type === 'platform';
  }
  
  // For other paths, accept any type
  return true;
}

// Function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function positionInRanges(position, ranges) {
  return ranges.some(({ start, end }) => position >= start && position < end);
}

// Return line-oriented fenced code ranges. Closing fences must use the same
// character and at least as many markers as the opening fence. This preserves
// triple-backtick examples nested inside a four-backtick fence.
function findFencedCodeRanges(content) {
  const ranges = [];
  let fence = null;
  let lineStart = 0;

  while (lineStart <= content.length) {
    const newline = content.indexOf('\n', lineStart);
    const lineEnd = newline === -1 ? content.length : newline;
    const rangeEnd = newline === -1 ? content.length : newline + 1;
    const line = content.substring(lineStart, lineEnd);
    const markerMatch = line.match(/^[ \t]*(?:>[ \t]*)*(`{3,}|~{3,})(.*)$/);

    if (fence) {
      if (markerMatch) {
        const marker = markerMatch[1];
        const remainder = markerMatch[2];
        if (
          marker[0] === fence.character &&
          marker.length >= fence.length &&
          remainder.trim() === ''
        ) {
          ranges.push({ start: fence.start, end: rangeEnd });
          fence = null;
        }
      }
    } else if (markerMatch) {
      const marker = markerMatch[1];
      const remainder = markerMatch[2];
      // Backticks aren't allowed in the info string of a backtick fence.
      if (marker[0] !== '`' || !remainder.includes('`')) {
        fence = {
          start: lineStart,
          character: marker[0],
          length: marker.length,
        };
      }
    }

    if (newline === -1) {
      break;
    }
    lineStart = newline + 1;
  }

  if (fence) {
    ranges.push({ start: fence.start, end: content.length });
  }

  return ranges;
}

// Match inline code spans by delimiter length. An unmatched run is literal
// text, and runs inside fenced code are ignored.
function findInlineCodeRanges(content, fencedRanges) {
  const ranges = [];

  for (let i = 0; i < content.length;) {
    const fencedRange = fencedRanges.find(({ start, end }) => i >= start && i < end);
    if (fencedRange) {
      i = fencedRange.end;
      continue;
    }

    if (content[i] !== '`') {
      i++;
      continue;
    }

    let runLength = 1;
    while (content[i + runLength] === '`') {
      runLength++;
    }

    let closingStart = -1;
    for (let j = i + runLength; j < content.length;) {
      const skippedFence = fencedRanges.find(({ start, end }) => j >= start && j < end);
      if (skippedFence) {
        j = skippedFence.end;
        continue;
      }
      if (content[j] !== '`') {
        j++;
        continue;
      }

      let closingLength = 1;
      while (content[j + closingLength] === '`') {
        closingLength++;
      }
      if (closingLength === runLength) {
        closingStart = j;
        break;
      }
      j += closingLength;
    }

    if (closingStart !== -1) {
      const end = closingStart + runLength;
      ranges.push({ start: i, end });
      i = end;
    } else {
      i += runLength;
    }
  }

  return ranges;
}

function findMdxCommentRanges(content) {
  const ranges = [];
  const pattern = /\{\/\*[\s\S]*?\*\/\}/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges;
}

// Find HTML/JSX tags without treating a `>` inside a quoted attribute or JSX
// expression as the end of the tag. Code and comment ranges are excluded by
// the caller so examples containing tag-like text don't affect the scan.
function findHtmlJsxTags(content, excludedRanges) {
  const tags = [];

  for (let i = 0; i < content.length;) {
    const excluded = excludedRanges.find(({ start, end }) => i >= start && i < end);
    if (excluded) {
      i = excluded.end;
      continue;
    }

    if (content[i] !== '<') {
      i++;
      continue;
    }

    // Protect HTML comments as tag-like markup even though they don't have a
    // name or participate in element nesting.
    if (content.startsWith('<!--', i)) {
      const commentEnd = content.indexOf('-->', i + 4);
      const end = commentEnd === -1 ? content.length : commentEnd + 3;
      tags.push({ start: i, end, name: null, closing: false, selfClosing: true });
      i = end;
      continue;
    }

    let cursor = i + 1;
    let closing = false;
    if (content[cursor] === '/') {
      closing = true;
      cursor++;
    }

    // Fragments (`<>` and `</>`) are valid JSX tags without names.
    let name = null;
    if (content[cursor] === '>') {
      tags.push({
        start: i,
        end: cursor + 1,
        name,
        closing,
        selfClosing: !closing,
      });
      i = cursor + 1;
      continue;
    }

    const nameMatch = content.substring(cursor).match(/^[A-Za-z][A-Za-z0-9_.:-]*/);
    if (!nameMatch) {
      i++;
      continue;
    }
    name = nameMatch[0];
    cursor += name.length;

    let quote = null;
    let escaped = false;
    let braceDepth = 0;
    let lineComment = false;
    let blockComment = false;

    while (cursor < content.length) {
      const ch = content[cursor];
      const next = content[cursor + 1];

      if (lineComment) {
        if (ch === '\n') {
          lineComment = false;
        }
      } else if (blockComment) {
        if (ch === '*' && next === '/') {
          blockComment = false;
          cursor++;
        }
      } else if (quote) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === quote) {
          quote = null;
        }
      } else if (braceDepth > 0 && ch === '/' && next === '/') {
        lineComment = true;
        cursor++;
      } else if (braceDepth > 0 && ch === '/' && next === '*') {
        blockComment = true;
        cursor++;
      } else if (ch === '"' || ch === "'" || (braceDepth > 0 && ch === '`')) {
        quote = ch;
      } else if (ch === '{') {
        braceDepth++;
      } else if (ch === '}' && braceDepth > 0) {
        braceDepth--;
      } else if (ch === '>' && braceDepth === 0) {
        const beforeClose = content.substring(i, cursor).trimEnd();
        const end = cursor + 1;
        tags.push({
          start: i,
          end,
          name,
          closing,
          selfClosing: !closing && beforeClose.endsWith('/'),
        });
        i = end;
        break;
      }
      cursor++;
    }

    // An apparent tag without a real closing `>` is just prose. Advance past
    // its `<` so later valid tags can still be found.
    if (cursor >= content.length) {
      i++;
    }
  }

  return tags;
}

function isProtectedElementName(name) {
  return /^(?:a|link|button|code|pre|codeblock|summary|td|th|h[1-6]|glossaryterm)$/i.test(name);
}

// Protect child content where inserting the interactive GlossaryTerm component
// would either corrupt code semantics, nest interactive elements, or reproduce
// the table/title rendering problems handled for Markdown syntax above.
function findProtectedElementRanges(tags) {
  const ranges = [];
  const openElements = [];

  for (const tag of tags) {
    if (!tag.name || !isProtectedElementName(tag.name)) {
      continue;
    }
    const normalizedName = tag.name.toLowerCase();

    if (!tag.closing && !tag.selfClosing) {
      openElements.push({ ...tag, normalizedName });
      continue;
    }
    if (!tag.closing) {
      continue;
    }

    for (let i = openElements.length - 1; i >= 0; i--) {
      if (openElements[i].normalizedName === normalizedName) {
        ranges.push({ start: openElements[i].start, end: tag.end });
        openElements.splice(i, 1);
        break;
      }
    }
  }

  return ranges;
}

function scanJavaScriptBalance(text, state) {
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (state.lineComment) {
      continue;
    }
    if (state.blockComment) {
      if (ch === '*' && next === '/') {
        state.blockComment = false;
        i++;
      }
      continue;
    }
    if (state.quote) {
      if (state.escaped) {
        state.escaped = false;
      } else if (ch === '\\') {
        state.escaped = true;
      } else if (ch === state.quote) {
        state.quote = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      state.lineComment = true;
      i++;
    } else if (ch === '/' && next === '*') {
      state.blockComment = true;
      i++;
    } else if (ch === '"' || ch === "'" || ch === '`') {
      state.quote = ch;
    } else if (ch === '{') {
      state.braces++;
    } else if (ch === '}') {
      state.braces--;
    } else if (ch === '(') {
      state.parens++;
    } else if (ch === ')') {
      state.parens--;
    } else if (ch === '[') {
      state.brackets++;
    } else if (ch === ']') {
      state.brackets--;
    } else if (ch === ';') {
      state.sawSemicolon = true;
    }
  }
  state.lineComment = false;
}

// Protect complete top-level MDX ESM declarations, including multiline
// imports and exported component definitions with internal blank lines.
function findMdxEsmRanges(content, excludedRanges) {
  const ranges = [];
  const lines = [];
  let lineStart = 0;

  while (lineStart <= content.length) {
    const newline = content.indexOf('\n', lineStart);
    const lineEnd = newline === -1 ? content.length : newline;
    lines.push({
      start: lineStart,
      end: newline === -1 ? content.length : newline + 1,
      text: content.substring(lineStart, lineEnd),
    });
    if (newline === -1) {
      break;
    }
    lineStart = newline + 1;
  }

  for (let i = 0; i < lines.length; i++) {
    if (
      positionInRanges(lines[i].start, excludedRanges) ||
      !/^\s*(?:import|export)\b/.test(lines[i].text)
    ) {
      continue;
    }

    const start = lines[i].start;
    let end = lines[i].end;
    const state = {
      braces: 0,
      parens: 0,
      brackets: 0,
      quote: null,
      escaped: false,
      lineComment: false,
      blockComment: false,
      sawSemicolon: false,
    };

    for (let j = i; j < lines.length; j++) {
      scanJavaScriptBalance(lines[j].text, state);
      end = lines[j].end;

      const balanced =
        state.braces === 0 &&
        state.parens === 0 &&
        state.brackets === 0 &&
        !state.quote &&
        !state.blockComment;
      const nextLineIsBoundary =
        j + 1 >= lines.length || lines[j + 1].text.trim() === '';

      if (balanced && (state.sawSemicolon || nextLineIsBoundary)) {
        i = j;
        break;
      }
    }
    ranges.push({ start, end });
  }

  return ranges;
}

// Find MDX brace expressions while respecting JavaScript strings and
// comments. Code, ESM, and MDX comment ranges are excluded by the caller.
function findMdxExpressionRanges(content, excludedRanges) {
  const ranges = [];

  for (let i = 0; i < content.length;) {
    const excluded = excludedRanges.find(({ start, end }) => i >= start && i < end);
    if (excluded) {
      i = excluded.end;
      continue;
    }

    if (content[i] !== '{' || content[i - 1] === '\\') {
      i++;
      continue;
    }

    const start = i;
    let depth = 1;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    i++;

    while (i < content.length && depth > 0) {
      const ch = content[i];
      const next = content[i + 1];

      if (lineComment) {
        if (ch === '\n') {
          lineComment = false;
        }
      } else if (blockComment) {
        if (ch === '*' && next === '/') {
          blockComment = false;
          i++;
        }
      } else if (quote) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === quote) {
          quote = null;
        }
      } else if (ch === '/' && next === '/') {
        lineComment = true;
        i++;
      } else if (ch === '/' && next === '*') {
        blockComment = true;
        i++;
      } else if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch;
      } else if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
      }
      i++;
    }

    if (depth === 0) {
      ranges.push({ start, end: i });
    }
  }

  return ranges;
}

// Function to check if a position is inside a code block, link, front matter, or existing GlossaryTerm
function isInProtectedArea(content, position, term) {
  // Check if inside front matter (between --- markers at the start of file)
  if (content.startsWith('---')) {
    const endOfFrontMatter = content.indexOf('\n---\n', 4);
    if (endOfFrontMatter !== -1 && position < endOfFrontMatter + 4) {
      return true;
    }
  }
  
  // Check if inside a single-line import or export statement. Complete
  // multiline ESM blocks are checked below.
  const lineStart = content.lastIndexOf('\n', position) + 1;
  const lineEnd = content.indexOf('\n', position);
  const currentLine = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
  if (/^(?:import|export)\b/.test(currentLine.trim())) {
    return true;
  }

  // Check if inside a markdown header (# ## ### etc.)
  const headerPattern = /^#{1,6}\s/;
  if (headerPattern.test(currentLine.trim())) {
    return true;
  }

  // Check if inside a markdown table row (GlossaryTerm breaks table cell rendering)
  if (currentLine.trim().startsWith('|')) {
    return true;
  }

  // Check if on a link reference definition line: [label]: url "title".
  // Whitespace after the colon is optional.
  if (/^\[[^\]]+\]:/.test(currentLine.trim())) {
    return true;
  }

  // A reference destination may appear on the line after a bare [label]:.
  if (lineStart > 0) {
    const previousLineEnd = lineStart - 1;
    const previousLineStart = content.lastIndexOf('\n', previousLineEnd - 1) + 1;
    const previousLine = content.substring(previousLineStart, previousLineEnd);
    if (/^\[[^\]]+\]:\s*$/.test(previousLine.trim())) {
      return true;
    }
  }

  // Check if inside an admonition title (:::note, :::warning, :::tip, :::info, :::caution, :::danger)
  const admonitionPattern = /^:::(note|warning|tip|info|caution|danger)\s/;
  if (admonitionPattern.test(currentLine.trim())) {
    return true;
  }
  
  const fencedCodeRanges = findFencedCodeRanges(content);
  const inlineCodeRanges = findInlineCodeRanges(content, fencedCodeRanges);
  if (
    positionInRanges(position, fencedCodeRanges) ||
    positionInRanges(position, inlineCodeRanges)
  ) {
    return true;
  }

  // Check if inside an MDX comment: {/* ... */}
  const mdxCommentRanges = findMdxCommentRanges(content);
  if (positionInRanges(position, mdxCommentRanges)) {
    return true;
  }

  const htmlJsxTags = findHtmlJsxTags(content, [
    ...fencedCodeRanges,
    ...inlineCodeRanges,
    ...mdxCommentRanges,
  ]);
  if (positionInRanges(position, htmlJsxTags)) {
    return true;
  }

  const protectedElementRanges = findProtectedElementRanges(htmlJsxTags);
  if (positionInRanges(position, protectedElementRanges)) {
    return true;
  }

  // Check MDX ESM declarations and brace expressions. Inserting JSX into a
  // JavaScript string or expression makes the MDX module invalid.
  const mdxEsmRanges = findMdxEsmRanges(content, [
    ...fencedCodeRanges,
    ...inlineCodeRanges,
    ...mdxCommentRanges,
    ...protectedElementRanges,
  ]);
  if (positionInRanges(position, mdxEsmRanges)) {
    return true;
  }
  const mdxExpressionRanges = findMdxExpressionRanges(content, [
    ...fencedCodeRanges,
    ...inlineCodeRanges,
    ...mdxCommentRanges,
    ...protectedElementRanges,
    ...mdxEsmRanges,
  ]);
  if (positionInRanges(position, mdxExpressionRanges)) {
    return true;
  }

  // Check if inside a link [text](url) or [text][ref]
  const beforeContent = content.substring(0, position);
  const afterContent = content.substring(position + term.length);

  // Check GFM bare URL autolinks. Inserting JSX into the URL token prevents
  // Docusaurus from recognizing it and corrupts the destination.
  const positionOnLine = position - lineStart;
  const beforeOnLine = currentLine.substring(0, positionOnLine);
  const urlStart = Math.max(
    beforeOnLine.lastIndexOf('https://'),
    beforeOnLine.lastIndexOf('http://')
  );
  if (urlStart !== -1 && !/\s/.test(beforeOnLine.substring(urlStart))) {
    return true;
  }
  
  // Check for markdown link text: [text](url)
  const linkPattern = /\[[^\]]*$/;
  if (linkPattern.test(beforeContent) && /^[^\]]*\]/.test(afterContent)) {
    return true;
  }

  // Check for markdown link destination: [text](url) or [text](url "title").
  // A term inside the URL/path breaks the link target. Track paren depth from
  // the nearest "](" so destinations with balanced parens (rare but valid,
  // e.g. Wikipedia-style URLs) aren't mistaken for a closed link, and stop at
  // a line break since destinations here never span lines.
  const linkDestStart = beforeContent.lastIndexOf('](');
  if (linkDestStart !== -1) {
    const between = content.substring(linkDestStart + 2, position);
    let depth = 0;
    let stillInDestination = true;
    let escaped = false;
    for (const ch of between) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '\n') {
        stillInDestination = false;
        break;
      } else if (ch === '(') {
        depth++;
      } else if (ch === ')') {
        if (depth === 0) {
          stillInDestination = false;
          break;
        }
        depth--;
      }
    }
    if (stillInDestination) {
      return true;
    }
  }

  return false;
}

// Function to process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  const wrappedTerms = new Set();
  let changesMade = false;
  
  // Extract existing GlossaryTerm usages
  const existingTermPattern = /<GlossaryTerm\s+term=["']([^"']+)["']/g;
  let match;
  while ((match = existingTermPattern.exec(content)) !== null) {
    wrappedTerms.add(match[1]);
  }
  
  // Process each term in the glossary
  Object.entries(canonicalTermMap).forEach(([canonicalTerm, glossaryKey]) => {
    const termData = glossaryData[glossaryKey];
    
    // Skip if term is already wrapped in this document
    if (wrappedTerms.has(glossaryKey)) {
      return;
    }
    
    // Skip if file type doesn't match term type
    if (!shouldProcessTerm(filePath, termData)) {
      return;
    }
    
    // Create regex pattern for the term (case-insensitive, whole word)
    const pattern = new RegExp(`\\b${escapeRegExp(canonicalTerm)}\\b`, 'gi');
    
    // Find all matches
    const matches = [];
    let searchMatch;
    while ((searchMatch = pattern.exec(content)) !== null) {
      matches.push({
        index: searchMatch.index,
        match: searchMatch[0]
      });
    }
    
    // Find the first valid match (not in protected area)
    for (let i = 0; i < matches.length; i++) {
      const { index, match } = matches[i];
      
      // Check if this position is protected
      if (!isInProtectedArea(content, index, match)) {
        // Wrap the term
        const wrappedTerm = `<GlossaryTerm term="${glossaryKey}">${match}</GlossaryTerm>`;
        content = content.substring(0, index) + wrappedTerm + content.substring(index + match.length);
        changesMade = true;
        wrappedTerms.add(glossaryKey);
        break; // Only wrap the first occurrence
      }
    }
  });
  
  // Write back if changes were made
  if (changesMade) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Processed ${filePath}`);
    return 1;
  }
  
  return 0;
}

module.exports = {
  escapeRegExp,
  isInProtectedArea,
  shouldProcessTerm,
  processFile,
};

if (require.main === module) {
  // Check if a file/directory argument was provided
  const target = process.argv[2];
  if (!target) {
    console.error('Error: Please provide a file or directory to process.');
    console.error('Usage: node scripts/wrap-glossary-terms.js <file-or-directory>');
    process.exit(1);
  }

  // Determine if target is a file or directory
  const targetPath = path.resolve(target);
  let mdxFiles = [];

  try {
    const stats = fs.statSync(targetPath);

    if (stats.isFile()) {
      // Single file
      if (targetPath.endsWith('.mdx') || targetPath.endsWith('.md')) {
        mdxFiles = [targetPath];
      } else {
        console.error('Error: File must be an MDX or MD file.');
        process.exit(1);
      }
    } else if (stats.isDirectory()) {
      // Directory - find all MDX files recursively
      const pattern = path.join(targetPath, '**/*.mdx');
      mdxFiles = glob.sync(pattern, {
        ignore: [
          '**/node_modules/**',
          '**/build/**',
          '**/.docusaurus/**',
          '**/.vscode/**'
        ]
      });

      // Also include .md files if needed
      const mdPattern = path.join(targetPath, '**/*.md');
      const mdFiles = glob.sync(mdPattern, {
        ignore: [
          '**/node_modules/**',
          '**/build/**',
          '**/.docusaurus/**',
          '**/.vscode/**'
        ]
      });

      mdxFiles = [...mdxFiles, ...mdFiles];
    }
  } catch (error) {
    console.error(`Error: Cannot access "${target}": ${error.message}`);
    process.exit(1);
  }

  if (mdxFiles.length === 0) {
    console.log('No MDX/MD files found to process.');
    process.exit(0);
  }

  console.log(`Processing ${mdxFiles.length} file(s)...`);

  let processedCount = 0;
  mdxFiles.forEach(filePath => {
    processedCount += processFile(filePath);
  });

  console.log(`\n✅ Complete! Modified ${processedCount} file(s) with glossary terms.`);
}
