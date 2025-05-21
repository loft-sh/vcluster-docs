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
const mdxFiles = [
  ...glob.sync('docs/**/*.mdx'),
  ...glob.sync('vcluster/**/*.mdx'),
  ...glob.sync('platform/**/*.mdx'),
];

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