import React, {useCallback, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {DocSearchButton, useDocSearchKeyboardEvents} from '@docsearch/react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {useHistory} from '@docusaurus/router';
import {
  isRegexpStringMatch,
  useSearchLinkCreator,
} from '@docusaurus/theme-common';
import {
  useAlgoliaContextualFacetFilters,
  useSearchResultUrlProcessor,
} from '@docusaurus/theme-search-algolia/client';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useActivePluginAndVersion} from '@docusaurus/plugin-content-docs/client';
import translations from '@theme/SearchTranslations';
import {
  DOCSEARCH_PRODUCTS,
  getVersionFacetValue,
  getVersionStatus,
} from '@site/src/config/docsearch';

let DocSearchModal = null;

function importDocSearchModalIfNeeded() {
  if (DocSearchModal) {
    return Promise.resolve();
  }

  return Promise.all([
    import('@docsearch/react/modal'),
    import('@docsearch/react/style'),
    import('./styles.css'),
  ]).then(([{DocSearchModal: Modal}]) => {
    DocSearchModal = Modal;
  });
}

function useNavigator({externalUrlRegex}) {
  const history = useHistory();
  const [navigator] = useState(() => {
    return {
      navigate(params) {
        if (isRegexpStringMatch(externalUrlRegex, params.itemUrl)) {
          window.location.href = params.itemUrl;
        } else {
          history.push(params.itemUrl);
        }
      },
    };
  });

  return navigator;
}

function useTransformSearchClient() {
  const {
    siteMetadata: {docusaurusVersion},
  } = useDocusaurusContext();

  return useCallback(
    (searchClient) => {
      searchClient.addAlgoliaAgent('docusaurus', docusaurusVersion);
      return searchClient;
    },
    [docusaurusVersion],
  );
}

function useTransformItems(props) {
  const processSearchResultUrl = useSearchResultUrlProcessor();
  const [transformItems] = useState(() => {
    return (items) =>
      props.transformItems
        ? props.transformItems(items)
        : items.map((item) => ({
            ...item,
            url: processSearchResultUrl(item.url),
          }));
  });

  return transformItems;
}

function useResultsFooterComponent({closeModal}) {
  return useMemo(
    () =>
      ({state}) =>
        <ResultsFooter state={state} onClose={closeModal} />,
    [closeModal],
  );
}

function Hit({hit, children}) {
  return <Link to={hit.url}>{children}</Link>;
}

function ResultsFooter({state, onClose}) {
  const createSearchLink = useSearchLinkCreator();

  return (
    <Link
      to={createSearchLink(state.query)}
      onClick={onClose}
      className="docsearch-full-results-pill">
      All results
    </Link>
  );
}

function useSearchParameters({contextualSearch, ...props}) {
  const contextualSearchFacetFilters = useAlgoliaContextualFacetFilters();
  const activePluginAndVersion = useActivePluginAndVersion();
  const configFacetFilters = props.searchParameters?.facetFilters ?? [];
  const pluginId = activePluginAndVersion?.activePlugin?.pluginId;
  const versionName = activePluginAndVersion?.activeVersion?.name;

  function normalizeFilters(filters) {
    if (!filters) {
      return [];
    }

    return Array.isArray(filters) ? filters : [filters];
  }

  const facetFilters = contextualSearch
    ? [
        ...normalizeFilters(contextualSearchFacetFilters),
        ...normalizeFilters(configFacetFilters),
      ]
    : normalizeFilters(configFacetFilters);

  const optionalFilters = [];

  if (pluginId && versionName) {
    const versionFacetValue = getVersionFacetValue({pluginId, versionName});
    const versionStatus = getVersionStatus({pluginId, versionName});

    if (versionStatus !== "unreleased") {
      optionalFilters.unshift(
        `docusaurus_tag:docs-${pluginId}-${versionFacetValue}<score=4>`,
      );
    }
  } else {
    Object.values(DOCSEARCH_PRODUCTS).forEach((product) => {
      optionalFilters.push(
        `docusaurus_tag:docs-${product.pluginId}-${product.stableVersion}<score=2>`,
      );
    });
  }

  return {
    ...props.searchParameters,
    facetFilters,
    optionalFilters,
  };
}

function DocSearch({externalUrlRegex, ...props}) {
  const navigator = useNavigator({externalUrlRegex});
  const searchParameters = useSearchParameters({...props});
  const transformItems = useTransformItems(props);
  const transformSearchClient = useTransformSearchClient();
  const searchContainer = useRef(null);
  const searchButtonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState(undefined);

  const prepareSearchContainer = useCallback(() => {
    if (!searchContainer.current) {
      const divElement = document.createElement('div');
      searchContainer.current = divElement;
      document.body.insertBefore(divElement, document.body.firstChild);
    }
  }, []);

  const openModal = useCallback(() => {
    prepareSearchContainer();
    importDocSearchModalIfNeeded().then(() => setIsOpen(true));
  }, [prepareSearchContainer]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    searchButtonRef.current?.focus();
    setInitialQuery(undefined);
  }, []);

  const handleInput = useCallback(
    (event) => {
      if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
        return;
      }

      event.preventDefault();
      setInitialQuery(event.key);
      openModal();
    },
    [openModal],
  );

  const resultsFooterComponent = useResultsFooterComponent({closeModal});

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: openModal,
    onClose: closeModal,
    onInput: handleInput,
    searchButtonRef,
  });

  return (
    <>
      <Head>
        <link
          rel="preconnect"
          href={`https://${props.appId}-dsn.algolia.net`}
          crossOrigin="anonymous"
        />
      </Head>

      <DocSearchButton
        onTouchStart={importDocSearchModalIfNeeded}
        onFocus={importDocSearchModalIfNeeded}
        onMouseOver={importDocSearchModalIfNeeded}
        onClick={openModal}
        ref={searchButtonRef}
        translations={props.translations?.button ?? translations.button}
      />

      {isOpen &&
        DocSearchModal &&
        searchContainer.current &&
        createPortal(
          <DocSearchModal
            onClose={closeModal}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            navigator={navigator}
            transformItems={transformItems}
            hitComponent={Hit}
            transformSearchClient={transformSearchClient}
            {...(props.searchPagePath && {
              resultsFooterComponent,
            })}
            placeholder={translations.placeholder}
            {...props}
            translations={props.translations?.modal ?? translations.modal}
            searchParameters={searchParameters}
          />,
          searchContainer.current,
        )}
    </>
  );
}

export default function SearchBar() {
  const {siteConfig} = useDocusaurusContext();

  return <DocSearch {...siteConfig.themeConfig.algolia} />;
}
