import React, { useEffect } from 'react';
import { setPageVariables, updatePageVariable, usePageVariables } from './PageVariablesContext';

/**
 * PageVariables - Define global variables for use across multiple code blocks
 *
 * Sets page-level variables that can be referenced in any InterpolatedCodeBlock
 * on the page, eliminating the need for repeated export statements.
 * Renders input fields so users can customize these values, and all code blocks
 * using these variables will update automatically.
 *
 * Usage Example:
 * ```jsx
 * <PageVariables
 *   VCLUSTER_VERSION="0.25.0"
 *   REGISTRY="ecr.io/myteam"
 * />
 * ```
 *
 * Then in code blocks, reference these variables:
 * ```jsx
 * <InterpolatedCodeBlock
 *   code={`export VCLUSTER_VERSION=[[GLOBAL:VCLUSTER_VERSION]]
 * export REGISTRY=[[GLOBAL:REGISTRY]]`}
 *   language="bash"
 * />
 * ```
 *
 * @param {Object} props - All props become available as page variables
 */
const PageVariables = (props) => {
  // Initialize variables IMMEDIATELY (synchronously) before first render
  // Use a ref to ensure this only happens once
  const initializedRef = React.useRef(false);
  if (!initializedRef.current) {
    setPageVariables(props);
    initializedRef.current = true;
  }

  const currentValues = usePageVariables();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't clear variables on unmount as other components might still need them
    };
  }, []);

  // If no variables defined, don't render anything
  if (Object.keys(props).length === 0) {
    return null;
  }

  return (
    <div className="page-variables-wrapper" style={{
      marginBottom: 'var(--ifm-leading)',
      border: '1px solid var(--ifm-color-emphasis-300)',
      borderRadius: 'var(--ifm-code-border-radius)',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      padding: '1rem'
    }}>
      <div style={{
        fontSize: '0.8rem',
        color: 'var(--ifm-color-emphasis-600)',
        marginBottom: '8px',
        fontStyle: 'italic'
      }}>
        Modify the following with your specific values to replace on the whole page and generate copyable commands:
      </div>
      {Object.entries(props).map(([key, defaultValue]) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5rem',
            fontFamily: 'var(--ifm-font-family-monospace)',
          }}
        >
          <label
            style={{
              minWidth: '200px',
              color: 'var(--ifm-font-color-base)',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginRight: '10px'
            }}
          >
            {key}
          </label>
          <input
            type="text"
            value={currentValues[key] || defaultValue}
            onChange={(e) => updatePageVariable(key, e.target.value)}
            placeholder={defaultValue}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 'var(--ifm-global-radius)',
              padding: '0.3rem 0.5rem',
              color: 'var(--ifm-font-color-base)',
              fontFamily: 'var(--ifm-font-family-monospace)',
              fontSize: '0.9rem',
              width: '100%',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--ifm-color-primary)';
              e.target.style.boxShadow = '0 0 0 1px var(--ifm-color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--ifm-color-emphasis-300)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default PageVariables;
export { usePageVariables } from './PageVariablesContext';
