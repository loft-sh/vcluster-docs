import DocItemLayout from '@theme-original/DocItem/Layout';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useActivePluginAndVersion} from '@docusaurus/plugin-content-docs/client';
import {
  getDocsearchProduct,
  getVersionFacetValue,
  getVersionStatus,
  isStableVersion,
} from '@site/src/config/docsearch';

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
  const pluginId = activePluginAndVersion?.activePlugin?.pluginId;
  const version = activePluginAndVersion?.activeVersion;
  const isLast = activePluginAndVersion?.activeVersion?.isLast ?? true;
  const product = pluginId ? getDocsearchProduct(pluginId) : null;
  const versionFacetValue =
    pluginId && version
      ? getVersionFacetValue({pluginId, versionName: version.name})
      : null;
  const versionStatus =
    pluginId && version
      ? getVersionStatus({pluginId, versionName: version.name})
      : null;
  const isStable =
    pluginId && version
      ? isStableVersion({pluginId, versionName: version.name})
      : false;

  return (
    <>
      {product && version && versionFacetValue && versionStatus && (
        <Head>
          <meta name="docsearch:product" content={product.pluginId} />
          <meta name="docsearch:version" content={versionFacetValue} />
          <meta name="docsearch:version_label" content={version.label} />
          <meta name="docsearch:version_status" content={versionStatus} />
          <meta
            name="docsearch:stable_version"
            content={product.stableVersion}
          />
          <meta
            name="docsearch:is_stable"
            content={isStable ? 'true' : 'false'}
          />
          <meta
            name="docsearch:is_latest"
            content={version.isLast ? 'true' : 'false'}
          />
          <meta name="docsearch:page_category" content="docs" />
        </Head>
      )}
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
