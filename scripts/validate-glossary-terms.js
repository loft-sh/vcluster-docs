#!/usr/bin/env node

/**
 * validate-glossary-terms.js
 * 
 * This script scans MDX files for <GlossaryTerm> tags and validates that 
 * the referenced terms exist in the glossary.yaml file.
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
  
  while ((match = glossaryTermPattern.exec(content)) !== null) {
    const term = match[1];
    
    if (!glossaryData[term]) {
      console.error(`Error: Term "${term}" not found in glossary, but referenced in ${filePath}`);
      hasErrors = true;
    }
  }
});

if (hasErrors) {
  console.error('\nValidation failed. Some terms referenced in MDX files do not exist in the glossary.');
  process.exit(1);
} else {
  console.log('\nValidation successful! All glossary terms referenced in MDX files exist in the glossary.');
  process.exit(0);
}