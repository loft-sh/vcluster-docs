import {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import SchemaExplorer from './index';

/**
 * LazySchemaExplorer: fetch a generated KubeSchemaDocument payload from a static
 * URL at runtime, then render the explorer.
 *
 * The payloads are large (the sync/toHost section is ~800KB). A static
 * `import payload from '....json'` inlines that whole blob into the page's route
 * JS chunk, so every visitor downloads it on first load even if they never open
 * the Explorer tab. Fetching a static asset instead keeps the payload out of the
 * bundle: it is requested only when this component actually renders. Pair it with
 * MountWhenVisible (which defers rendering until the tab is shown) so neither the
 * 87KB runtime nor the payload load until the reader opens the tab.
 *
 * Adding a new section is then just: generate another JSON under static/ and
 * point a new <LazySchemaExplorer src="..."/> at it. No central import registry,
 * no route-chunk growth.
 *
 * `src` is a site-root-relative path (e.g. "/schema-explorer/vcluster/sync/toHost.explorer.json");
 * useBaseUrl prefixes the site baseUrl (/docs/) so it resolves under any deploy.
 */
export default function LazySchemaExplorer({src, ...props}) {
  const url = useBaseUrl(src);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <div className="kdoc-loading" style={{padding: '1rem', opacity: 0.7}}>
        Could not load the schema explorer ({String(error.message || error)}).
      </div>
    );
  }

  if (!data) {
    return (
      <div className="kdoc-loading" style={{padding: '1rem', opacity: 0.7}}>
        Loading schema explorer…
      </div>
    );
  }

  return <SchemaExplorer data={data} {...props} />;
}
