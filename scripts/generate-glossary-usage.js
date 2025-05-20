#!/usr/bin/env node

/**
 * generate-glossary-usage.js
 * 
 * This script scans all MDX files to find where each glossary term is used
 * and generates a JSON file with the results.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

// Load the glossary data
const glossaryPath = path.join(__dirname, '../src/data/glossary.yaml');
const glossaryData = yaml.load(fs.readFileSync(glossaryPath, 'utf8'));

// Define the regex pattern to match GlossaryTerm components
const glossaryTermPattern = /<GlossaryTerm\s+term=["']([^"']+)["']/g;

// Get all MDX files
const mdxFiles = [
  ...glob.sync('docs/**/*.mdx'),
  ...glob.sync('vcluster/**/*.mdx'),
  ...glob.sync('platform/**/*.mdx'),
];

// Initialize usage data structure
const usageData = {};

// Initialize each term with an empty array of usages
Object.keys(glossaryData).forEach(term => {
  usageData[term] = [];
});

// Scan each MDX file for GlossaryTerm components
mdxFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  
  // Extract title from frontmatter
  const titleMatch = content.match(/---\s*\r?\n([\s\S]*?)\r?\n---/);
  let title = filename;
  
  if (titleMatch && titleMatch[1]) {
    const titleLineMatch = titleMatch[1].match(/title:\s*["']?(.*?)["']?\s*(\r?\n|$)/);
    if (titleLineMatch && titleLineMatch[1]) {
      title = titleLineMatch[1];
    }
  }
  
  // Collect all term usage
  let match;
  while ((match = glossaryTermPattern.exec(content)) !== null) {
    const term = match[1];
    
    if (glossaryData[term]) {
      if (!usageData[term].find(u => u.path === filePath)) {
        usageData[term].push({
          path: filePath,
          title: title,
          displayPath: filePath.replace(/\.mdx$/, '')
        });
      }
    }
  }
});

// Write the usage data to a JSON file
const outputPath = path.join(__dirname, '../src/data/glossary-usage.json');
fs.writeFileSync(outputPath, JSON.stringify(usageData, null, 2));

console.log(`Glossary usage data generated at ${outputPath}`);
console.log(`Found usages for ${Object.keys(usageData).filter(k => usageData[k].length > 0).length} terms in ${mdxFiles.length} MDX files`);