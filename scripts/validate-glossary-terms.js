#!/usr/bin/env node

/**
 * validate-glossary-terms.js
 * 
 * This script scans MDX files for <GlossaryTerm> tags and validates that:
 * 1. The referenced terms exist in the glossary.yaml file
 * 2. Each term is only wrapped once per document (first occurrence only)
 * 
 * Usage:
 *   npm run validate-glossary
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
// Handle both glob v7 and v10 formats
let mdxFiles = [];
try {
  // For glob v7
  mdxFiles = glob.sync('**/*.mdx', {
    ignore: [
      'node_modules/**',
      'build/**',
      '.docusaurus/**',
      '.vscode/**'
    ]
  });
} catch (error) {
  // For newer versions, fall back to the directory-specific approach
  mdxFiles = [
    ...glob.sync('docs/**/*.mdx'),
    ...glob.sync('vcluster/**/*.mdx'),
    ...glob.sync('platform/**/*.mdx'),
    ...glob.sync('platform_versioned_docs/**/*.mdx'),
    ...glob.sync('vcluster_versioned_docs/**/*.mdx'),
  ];
}

let hasErrors = false;

// Scan each MDX file for GlossaryTerm components
mdxFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  const usedTermsInFile = new Set();
  
  while ((match = glossaryTermPattern.exec(content)) !== null) {
    const term = match[1];
    
    // Check if term exists in glossary
    if (!glossaryData[term]) {
      console.error(`Error: Term "${term}" not found in glossary, but referenced in ${filePath}`);
      hasErrors = true;
    }
    
    // Check if term has already been used in this file
    if (usedTermsInFile.has(term)) {
      console.error(`Error: Term "${term}" is wrapped multiple times in ${filePath}. Only wrap the first occurrence.`);
      hasErrors = true;
    }
    
    usedTermsInFile.add(term);
  }
});

if (hasErrors) {
  console.error('\nValidation failed. Please fix the errors above before continuing.');
  process.exit(1);
} else {
  console.log('\nValidation successful! All glossary terms referenced in MDX files exist in the glossary.');
  process.exit(0);
}