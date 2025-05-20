import React, { useState, useRef } from 'react';
import styles from './styles.module.css';
import glossaryData from '@site/src/data/glossary.yaml';

export default function GlossaryTerm({ term, children }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const termRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const termData = glossaryData[term];
  
  if (!termData) {
    // Enhanced error handling - in development, this will be more visible
    if (process.env.NODE_ENV === 'development') {
      console.error(`Term "${term}" not found in glossary! Check your spelling or add it to the glossary.yaml file.`);
      // Return with a red dotted underline to highlight the issue during development
      return <span style={{ borderBottom: '1px dotted red', color: 'red' }}>{children || term}</span>;
    }
    // In production, just log a warning and render the term normally
    console.warn(`Term "${term}" not found in glossary`);
    return <>{children || term}</>;
  }
  
  // Removed copyToClipboard function
  
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };
  
  // Create padding area between term and tooltip
  const handleMouseMove = (e) => {
    if (!showTooltip) {
      setShowTooltip(true);
    }
  };
  
  const handleMouseLeave = (e) => {
    // Skip this logic for right-clicks and context menu events
    if (e.button === 2 || e.type === 'contextmenu') {
      return;
    }
    
    try {
      // Don't hide tooltip if mouse is moving to the tooltip
      if (tooltipRef.current && e.relatedTarget && 
          (tooltipRef.current.contains(e.relatedTarget) || 
          tooltipRef.current === e.relatedTarget)) {
        return;
      }
      
      // Check if we're in the gap between term and tooltip
      if (termRef.current) {
        const termRect = termRef.current.getBoundingClientRect();
        const mouseY = e.clientY;
        
        // Add a small buffer zone below the term (10px)
        if (mouseY > termRect.bottom && mouseY < termRect.bottom + 15) {
          return;
        }
      }
    } catch (error) {
      // If there's an error with the DOM checks, just ignore it
      console.debug('Error in term mouse handling', error);
      return;
    }
    
    setShowTooltip(false);
  };
  
  // Handler for the tooltip itself
  const handleTooltipMouseLeave = (e) => {
    // Skip this logic for right-clicks and context menu events
    if (e.button === 2 || e.type === 'contextmenu') {
      return;
    }
    
    try {
      // Don't hide if moving to the term
      if (termRef.current && e.relatedTarget && 
          (termRef.current.contains(e.relatedTarget) || 
          termRef.current === e.relatedTarget)) {
        return;
      }
    } catch (error) {
      // If there's an error with the DOM checks, just ignore it
      console.debug('Error in tooltip mouse handling', error);
      return;
    }
    
    setShowTooltip(false);
  };
  
  return (
    <span className={styles.container}>
      <span
        ref={termRef}
        className={styles.term}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children || termData.term}
      </span>
      
      {showTooltip && (
        <span 
          ref={tooltipRef}
          className={styles.tooltip}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          onContextMenu={(e) => {
            // Prevent the context menu from closing the tooltip
            e.stopPropagation();
          }}
        >
          <strong>{termData.term}</strong>
          <p>{termData.definition}</p>
          {termData.related && (
            <div className={styles.related}>
              <span>Related: </span>
              {termData.related.map((relatedTerm, index) => (
                <span key={relatedTerm}>
                  {index > 0 && ', '}
                  {glossaryData[relatedTerm]?.term || relatedTerm}
                </span>
              ))}
            </div>
          )}
        </span>
      )}
    </span>
  );
}