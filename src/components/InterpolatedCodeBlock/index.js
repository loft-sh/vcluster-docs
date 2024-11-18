import React, { useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import styles from '@site/src/components/Input/styles.module.scss';

const InterpolatedCodeBlock = ({ variables = {}, code = '' }) => {
  const [values, setValues] = useState(() => {
    if (!variables || typeof variables !== 'object') return {};
    return Object.fromEntries(
      Object.entries(variables).map(([key, defaultValue]) => [key, defaultValue || ''])
    );
  });

  const processedCode = code.replace(
    /\$\{(\w+)\}/g,
    (_, key) => values[key] || variables[key] || ''
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-6 font-mono bg-[var(--prism-background-color)] p-6 rounded">
        {Object.entries(variables).map(([key]) => (
          <div
            key={key}
            className="grid grid-cols-[150px_1fr] items-center"
            style={{
              marginTop: 'calc(var(--ifm-leading) / 2)',
              marginBottom: 'calc(var(--ifm-leading) / 2)'
            }}
          >
            <span className="text-purple-400">{key}</span>
            <input
              type="text"
              value={values[key] || ''}
              onChange={(e) => setValues(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={variables[key]}
              className={`${styles.input} border border-gray-700/30`}
            />
          </div>
        ))}
      </div>
      <CodeBlock className="language-bash">
        {processedCode}
      </CodeBlock>
    </div>
  );
};

export default InterpolatedCodeBlock;