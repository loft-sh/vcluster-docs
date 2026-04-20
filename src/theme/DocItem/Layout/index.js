import React from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

/**
 * Wraps every doc page with a visually-hidden directive pointing to llms.txt.
 *
 * Agents that arrive at a doc URL via training-data recall have no other way
 * to discover the documentation index. This element is invisible to human
 * readers but present in the DOM for LLM agents and other crawlers.
 *
 * Satisfies the `llms-txt-directive` check from the agent-docs spec:
 * https://agentdocsspec.com/spec/#llms-txt-directive
 */
export default function DocItemLayoutWrapper(props) {
  const llmsTxtUrl = useBaseUrl('/llms.txt');
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
        }}
      >
        For the complete documentation index, see{' '}
        <a href={llmsTxtUrl}>llms.txt</a>
      </div>
      <DocItemLayout {...props} />
    </>
  );
}
