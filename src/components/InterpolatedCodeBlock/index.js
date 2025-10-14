import React, { useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { usePageVariables } from '../PageVariables/PageVariablesContext';

/**
 * InterpolatedCodeBlock - Interactive code block with editable variables
 *
 * Creates a code block that allows users to customize variable values.
 * Variables are defined directly in the code using [[VAR:NAME:default]] syntax.
 * Global variables can be referenced using [[GLOBAL:NAME]] syntax.
 *
 * Features:
 * - Automatically detects variables in the code
 * - Generates input fields for each variable
 * - Populates input fields with default values
 * - Updates the code in real-time as users type
 * - Works with any language syntax highlighting
 * - Supports page-level global variables via PageVariables component
 *
 * Usage Example (local variables):
 * ```jsx
 * <InterpolatedCodeBlock
 *   code={`# Create a Kubernetes namespace
 * kubectl create namespace [[VAR:NAMESPACE:my-namespace]]
 *
 * # Set up Helm with custom values
 * helm install my-app ./chart --set region=[[VAR:REGION:us-west-1]]`}
 *   language="bash"
 * />
 * ```
 *
 * Usage Example (global variables):
 * ```jsx
 * <PageVariables VCLUSTER_VERSION="0.25.0" REGISTRY="ecr.io/myteam" />
 *
 * <InterpolatedCodeBlock
 *   code={`export VCLUSTER_VERSION=[[GLOBAL:VCLUSTER_VERSION]]
 * export REGISTRY=[[GLOBAL:REGISTRY]]`}
 *   language="bash"
 * />
 * ```
 *
 * @param {string} code - The code block content with variables in [[VAR:NAME:default]] or [[GLOBAL:NAME]] format
 * @param {string} language - Language for syntax highlighting (default: "bash")
 */
const InterpolatedCodeBlock = ({ code = '', language = 'bash' }) => {
  // Get global variables from page store
  const globalVariables = usePageVariables();

  // Parse variables using [[VAR:name:default]] pattern
  const varPattern = /\[\[VAR:([^:]+):([^\]]*)\]\]/g;
  // Parse global variables using [[GLOBAL:name]] pattern
  const globalPattern = /\[\[GLOBAL:([^\]]+)\]\]/g;

  // Extract all local variables from the code
  const initialVariables = {};
  let match;

  // Create a copy of the pattern to avoid state issues with regex
  const patternForMatching = new RegExp(varPattern);

  if (typeof code === 'string') {
    // Find all local variables in the code
    while ((match = patternForMatching.exec(code)) !== null) {
      initialVariables[match[1]] = match[2];
    }
  }

  const [values, setValues] = useState(initialVariables);

  // Replace placeholders with values for rendering
  const processedCode = typeof code === 'string'
    ? code
        // First replace global variables
        .replace(globalPattern, (_, name) => {
          return globalVariables[name] || `[[GLOBAL:${name}]]`;
        })
        // Then replace local variables
        .replace(varPattern, (_, name) => {
          return values[name] || initialVariables[name] || '';
        })
    : code;

  // Skip rendering the interactive UI if no local variables found
  // (global variables don't need inputs since they're defined at page level)
  if (Object.keys(initialVariables).length === 0) {
    return <CodeBlock language={language}>{processedCode}</CodeBlock>;
  }

  // Simple wrapper with light grey background
  return (
    <div className="interpolated-code-wrapper" style={{ 
      marginBottom: 'var(--ifm-leading)',
      border: '1px solid var(--ifm-color-emphasis-300)',
      borderRadius: 'var(--ifm-code-border-radius)',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      padding: '1rem'
    }}>
      {/* Variable Input Container */}
      <div className="interpolated-code-inputs" style={{
        marginBottom: '1rem'
      }}>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--ifm-color-emphasis-600)',
          marginBottom: '8px',
          fontStyle: 'italic'
        }}>
          Modify the following with your specific values to generate a copyable command:
        </div>
        {Object.entries(initialVariables).map(([key, defaultValue]) => (
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
                minWidth: '150px',
                color: 'var(--ifm-font-color-base)', /* Regular text color */
                fontSize: '0.9rem',
                fontWeight: '600', /* Semi-bold for emphasis */
                marginRight: '10px'
              }}
            >
              {key}
            </label>
            <input
              type="text"
              value={values[key] || ''}
              onChange={(e) => setValues(prev => ({ ...prev, [key]: e.target.value }))}
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
      
      {/* Code Block Container */}
      <div>
        <CodeBlock language={language}>
          {processedCode}
        </CodeBlock>
      </div>
    </div>
  );
};

export default InterpolatedCodeBlock;