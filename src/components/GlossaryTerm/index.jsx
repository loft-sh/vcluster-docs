import React from 'react';
import styles from './styles.module.css';
import glossaryData from '@site/src/data/glossary.yaml';

// Track terms used per page
const usedTerms = {};

const GlossaryTerm = ({ term, children }) => {
  // Get current page path
  const pagePath = typeof window !== 'undefined' ? window.location.pathname : 'default';
  
  // Initialize page tracking if needed
  if (!usedTerms[pagePath]) {
    usedTerms[pagePath] = new Set();
  }
  
  // Get term data
  const termData = glossaryData[term];
  
  // Check if first occurrence
  const isFirstOccurrence = !usedTerms[pagePath].has(term);
  
  // Mark as used if valid
  if (isFirstOccurrence && termData) {
    usedTerms[pagePath].add(term);
  }
  
  // Handle missing term data
  if (!termData) {
    return <>{children || term}</>;
  }
  
  // If not first occurrence, just render normally
  if (!isFirstOccurrence) {
    return <>{children || termData.term}</>;
  }
  
  // For first occurrence, render with tooltip
  const termContent = children || termData.term;
  const hasUrl = termData.url && termData.url.length > 0;
  
  return (
    <div className={styles.termWrapper}>
      {hasUrl ? (
        <a href={termData.url} className={styles.term}>
          {termContent}
        </a>
      ) : (
        <span className={styles.term}>
          {termContent}
        </span>
      )}
      <div className={styles.tooltip}>
        <div className={styles.tooltipHeader}>
          {hasUrl ? (
            <a href={termData.url} className={styles.tooltipHeaderLink}>
              {termData.term}
            </a>
          ) : (
            termData.term
          )}
        </div>
        <div className={styles.tooltipDefinition}>{termData.definition}</div>
        {termData.related && (
          <div className={styles.related}>
            <span>Related: </span>
            {termData.related.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlossaryTerm;