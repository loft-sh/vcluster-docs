import React from 'react';
import styles from './styles.module.css';
import glossaryData from '@site/src/data/glossary.yaml';

const GlossaryTerm = ({ term, children }) => {
  
  // Get term data
  const termData = glossaryData[term];
  
  // Handle missing term data
  if (!termData) {
    return <>{children || term}</>;
  }
  
  // For first occurrence, render with tooltip
  const termContent = children || termData.term;
  const hasUrl = termData.url && termData.url.length > 0;
  
  return (
    <span className={styles.termWrapper}>
      {hasUrl ? (
        <a href={termData.url} className={styles.term}>
          {termContent}
        </a>
      ) : (
        <span className={styles.term}>
          {termContent}
        </span>
      )}
      <span className={styles.tooltip}>
        <span className={styles.tooltipHeader}>
          {hasUrl ? (
            <a href={termData.url} className={styles.tooltipHeaderLink}>
              {termData.term}
            </a>
          ) : (
            termData.term
          )}
        </span>
        <span className={styles.tooltipDefinition}>{termData.definition}</span>
        {termData.related && (
          <span className={styles.related}>
            <span>Related: </span>
            {termData.related.map((relatedTermId, index) => {
              const relatedTerm = glossaryData[relatedTermId];
              return (
                <span key={relatedTermId}>
                  {index > 0 && ', '}
                  {relatedTerm ? (
                    <span className={styles.relatedTerm}>
                      {relatedTerm.term}
                    </span>
                  ) : (
                    relatedTermId
                  )}
                </span>
              );
            })}
          </span>
        )}
      </span>
    </span>
  );
};

export default GlossaryTerm;