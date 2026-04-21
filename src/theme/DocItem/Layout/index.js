import DocItemLayout from '@theme-original/DocItem/Layout';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useActivePluginAndVersion} from '@docusaurus/plugin-content-docs/client';

/**
 * Wraps every doc page with a visually-hidden directive pointing to llms.txt.
 *
 * Agents that arrive at a doc URL via training-data recall have no other way
 * to discover the documentation index. This element is invisible to human
 * readers but present in the DOM for LLM agents and other crawlers.
 *
 * Satisfies the `llms-txt-directive` check from the agent-docs spec:
 * https://agentdocsspec.com/spec/#llms-txt-directive
 *
 * Also emits `<meta name="robots" content="noindex,follow">` on any doc page
 * that is not the current stable version. Unversioned URLs (served by
 * lastVersion) stay indexable; every versioned path — including the stable
 * version's versioned URL, prior stable/EOS versions, and the `current`
 * (next/main) preview — is marked noindex so search engines prefer the
 * canonical unversioned routes. See DOC-1325.
 */
export default function DocItemLayoutWrapper(props) {
  const llmsTxtUrl = useBaseUrl('/llms.txt');
  const activePluginAndVersion = useActivePluginAndVersion();
  const isLast = activePluginAndVersion?.activeVersion?.isLast ?? true;

  return (
    <>
      {!isLast && (
        <Head>
          <meta name="robots" content="noindex,follow" />
        </Head>
      )}
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
