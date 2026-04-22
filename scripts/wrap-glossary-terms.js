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

// Check if a file/directory argument was provided
const target = process.argv[2];
if (!target) {
  console.error('Error: Please provide a file or directory to process.');
  console.error('Usage: node scripts/wrap-glossary-terms.js <file-or-directory>');
  process.exit(1);
}

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

// Function to check if a position is inside a code block, link, front matter, or existing GlossaryTerm
function isInProtectedArea(content, position, term) {
  // Check if inside front matter (between --- markers at the start of file)
  if (content.startsWith('---')) {
    const endOfFrontMatter = content.indexOf('\n---\n', 4);
    if (endOfFrontMatter !== -1 && position < endOfFrontMatter + 4) {
      return true;
    }
  }
  
  // Check if inside an import statement
  const lineStart = content.lastIndexOf('\n', position) + 1;
  const lineEnd = content.indexOf('\n', position);
  const currentLine = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
  if (currentLine.trim().startsWith('import ')) {
    return true;
  }
  
  // Check if inside a markdown header (# ## ### etc.)
  const headerPattern = /^#{1,6}\s/;
  if (headerPattern.test(currentLine.trim())) {
    return true;
  }
  
  // Check if inside an admonition title (:::note, :::warning, :::tip, :::info, :::caution, :::danger)
  const admonitionPattern = /^:::(note|warning|tip|info|caution|danger)\s/;
  if (admonitionPattern.test(currentLine.trim())) {
    return true;
  }
  
  // Check if inside code blocks (backticks)
  let insideCode = false;
  let backticksCount = 0;
  
  for (let i = 0; i < position; i++) {
    if (content[i] === '`') {
      if (content[i + 1] === '`' && content[i + 2] === '`') {
        // Triple backticks
        insideCode = !insideCode;
        i += 2;
      } else if (!insideCode) {
        // Single backtick
        backticksCount++;
      }
    }
  }
  
  if (insideCode || backticksCount % 2 === 1) {
    return true;
  }
  
  // Check if inside a link [text](url) or [text][ref]
  const beforeContent = content.substring(0, position);
  const afterContent = content.substring(position + term.length);
  
  // Check for markdown link pattern
  const linkPattern = /\[[^\]]*$/;
  if (linkPattern.test(beforeContent) && /^[^\]]*\]/.test(afterContent)) {
    return true;
  }
  
  // Check if already inside a GlossaryTerm
  const glossaryPattern = /<GlossaryTerm[^>]*>/;
  let lastGlossaryOpen = beforeContent.lastIndexOf('<GlossaryTerm');
  let lastGlossaryClose = beforeContent.lastIndexOf('</GlossaryTerm>');
  
  if (lastGlossaryOpen > lastGlossaryClose && lastGlossaryOpen !== -1) {
    return true;
  }
  
  // Check if the term is part of a GlossaryTerm tag itself
  const tagContext = content.substring(Math.max(0, position - 50), position + term.length + 50);
  if (tagContext.includes('<GlossaryTerm') || tagContext.includes('</GlossaryTerm>')) {
    return true;
  }
  
  // Check if inside HTML/JSX tags (between < and >)
  let insideTag = false;
  for (let i = 0; i < position; i++) {
    if (content[i] === '<') {
      insideTag = true;
    } else if (content[i] === '>') {
      insideTag = false;
    }
  }
  
  if (insideTag) {
    return true;
  }
  
  // Also check if we're currently inside an unclosed tag
  const lastOpenTag = content.lastIndexOf('<', position);
  const lastCloseTag = content.lastIndexOf('>', position);
  if (lastOpenTag > lastCloseTag) {
    return true;
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