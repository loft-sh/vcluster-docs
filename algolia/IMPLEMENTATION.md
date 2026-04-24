# Algolia Search Implementation Runbook

This document covers the full rollout for the version-aware DocSearch work:

- docs-site implementation changes
- Algolia index settings changes
- crawler configuration changes
- post-deploy reindex and verification

## Files in This Folder

- `docsearch.config.js`
  Proposed crawler configuration in DocSearch `new Crawler(...)` format for reference.
- `export-vcluster-settings.preview.json`
  Preview of the updated index settings import for the `vcluster` index.

## What This Work Changes

### Docs Site

The docs implementation adds:

- version-aware search metadata to doc pages via `meta` tags
- a better search page UX with explicit version filters
- a more visible DocSearch modal CTA to open the full search page
- default search bias toward current stable docs

Relevant files:

- [docusaurus.config.js](/Users/daryl/git/vcluster/vcluster-docs/docusaurus.config.js)
- [src/theme/DocItem/Layout/index.js](/Users/daryl/git/vcluster/vcluster-docs/src/theme/DocItem/Layout/index.js)
- [src/config/docsearch.js](/Users/daryl/git/vcluster/vcluster-docs/src/config/docsearch.js)
- [src/theme/SearchBar/index.js](/Users/daryl/git/vcluster/vcluster-docs/src/theme/SearchBar/index.js)
- [src/theme/SearchBar/styles.css](/Users/daryl/git/vcluster/vcluster-docs/src/theme/SearchBar/styles.css)
- [src/theme/SearchPage/index.js](/Users/daryl/git/vcluster/vcluster-docs/src/theme/SearchPage/index.js)
- [src/theme/SearchPage/styles.module.css](/Users/daryl/git/vcluster/vcluster-docs/src/theme/SearchPage/styles.module.css)

### Algolia

The Algolia changes add support for:

- version-aware facets
- stable/current version boosting
- product-aware filtering
- crawler-level `pageRank` values that make the current stable docs rank higher

## Rollout Order

Do the rollout in this order:

1. Review and merge the docs-site PR.
2. Wait for the preview to look good and production to deploy.
3. Back up the current Algolia crawler config and current index settings.
4. Apply the updated index settings to the existing `vcluster` index.
5. Patch the crawler configuration.
6. Trigger a full reindex after the docs changes are live on production.
7. Verify extracted records and search behavior.

Important:

- Don’t trigger the reindex before the docs-site changes are deployed.
- The new crawler depends on `docsearch:*` meta tags that only exist after the PR is live.
- `initialIndexSettings` in the crawler don’t re-apply to an existing index, so update the index settings directly with the Search API.

Source references:

- [Algolia update index settings](https://www.algolia.com/doc/rest-api/search/set-settings)
- [Algolia crawler update configuration](https://www.algolia.com/doc/rest-api/crawler/patch-config)
- [Algolia start a crawl](https://www.algolia.com/doc/rest-api/crawler/start-reindex)
- [Algolia initialIndexSettings behavior](https://www.algolia.com/doc/tools/crawler/apis/configuration/initial-index-settings/)

## Step 1: Merge and Deploy the Docs Changes

Merge the PR that contains the docs-site search implementation.

After deploy, confirm production pages under `https://www.vcluster.com/docs/` emit metadata like:

- `docsearch:product`
- `docsearch:version`
- `docsearch:version_label`
- `docsearch:version_status`
- `docsearch:stable_version`
- `docsearch:is_stable`
- `docsearch:is_latest`
- `docsearch:page_category`

These are added in [src/theme/DocItem/Layout/index.js](/Users/daryl/git/vcluster/vcluster-docs/src/theme/DocItem/Layout/index.js).

## Step 2: Set Environment Variables

Run these commands locally before making API calls:

```bash
export ALGOLIA_APP_ID="YOUR_ALGOLIA_APP_ID"
export ALGOLIA_INDEX="YOUR_ALGOLIA_INDEX_NAME"
export ALGOLIA_ADMIN_KEY="<search-api-key-with-editSettings>"
export CRAWLER_ID="<your-crawler-uuid>"
export CRAWLER_USER_ID="<your-crawler-user-id>"
export CRAWLER_API_KEY="<your-crawler-api-key>"
export CRAWLER_BASIC_AUTH="$(printf '%s:%s' "$CRAWLER_USER_ID" "$CRAWLER_API_KEY" | base64)"
```

Notes:

- `ALGOLIA_ADMIN_KEY` is a regular Algolia key for Search API operations on the index.
- `CRAWLER_USER_ID` and `CRAWLER_API_KEY` are crawler-specific credentials from the Algolia crawler dashboard.
- The crawler indexing `apiKey` used inside crawler config is separate again. Don’t use the Algolia Admin API key there.

## Step 3: Back Up Current Config and Settings

Back up the crawler:

```bash
curl --request GET \
  --url "https://crawler.algolia.com/api/1/crawlers/$CRAWLER_ID?withConfig=true" \
  --header "Authorization: Basic $CRAWLER_BASIC_AUTH" \
  --output /tmp/vcluster-crawler.backup.json
```

Back up current index settings:

```bash
curl --request GET \
  --url "https://$ALGOLIA_APP_ID.algolia.net/1/indexes/$ALGOLIA_INDEX/settings" \
  --header "x-algolia-application-id: $ALGOLIA_APP_ID" \
  --header "x-algolia-api-key: $ALGOLIA_ADMIN_KEY" \
  --header "accept: application/json" \
  --output /tmp/vcluster-index-settings.backup.json
```

## Step 4: Apply Updated Index Settings

Import the new index settings from [export-vcluster-settings.preview.json](/Users/daryl/git/vcluster/vcluster-docs/algolia/export-vcluster-settings.preview.json):

```bash
curl --request PUT \
  --url "https://$ALGOLIA_APP_ID.algolia.net/1/indexes/$ALGOLIA_INDEX/settings" \
  --header "x-algolia-application-id: $ALGOLIA_APP_ID" \
  --header "x-algolia-api-key: $ALGOLIA_ADMIN_KEY" \
  --header "content-type: application/json" \
  --data @/Users/daryl/git/vcluster/vcluster-docs/algolia/export-vcluster-settings.preview.json
```

This is required because the crawler’s `initialIndexSettings` won’t update an already-existing index.

## Step 5: Patch the Crawler Configuration

The crawler API expects JSON, not the `new Crawler(...)` JS wrapper.

Create a local JSON payload:

```bash
cat > /tmp/vcluster-crawler-config.json <<'EOF'
{
  "appId": "K85RIQNFGF",
  "apiKey": "<crawler-indexing-api-key>",
  "rateLimit": 8,
  "maxDepth": 10,
  "startUrls": [
    "https://www.vcluster.com/docs/"
  ],
  "renderJavaScript": false,
  "sitemaps": [
    "https://www.vcluster.com/docs/sitemap.xml"
  ],
  "ignoreCanonicalTo": true,
  "discoveryPatterns": [
    "https://www.vcluster.com/docs/**"
  ],
  "exclusionPatterns": [
    "https://www.vcluster.com/docs/v0.19/**"
  ],
  "schedule": "at 05:00 on Saturday",
  "actions": [
    {
      "indexName": "vcluster",
      "pathsToMatch": [
        "https://www.vcluster.com/docs/**"
      ],
      "recordExtractor": {
        "__type": "function",
        "source": "({ $, helpers, url }) => {\n  $('.hash-link').remove();\n\n  const pathname = url.pathname.replace(/^\\/docs/, '') || '/';\n  const product = $('meta[name=\"docsearch:product\"]').attr('content') || 'docs';\n  const version = $('meta[name=\"docsearch:version\"]').attr('content') || 'unknown';\n  const versionLabel = $('meta[name=\"docsearch:version_label\"]').attr('content') || version;\n  const versionStatus = $('meta[name=\"docsearch:version_status\"]').attr('content') || 'unknown';\n  const stableVersion = $('meta[name=\"docsearch:stable_version\"]').attr('content') || '';\n  const isStable = $('meta[name=\"docsearch:is_stable\"]').attr('content') || 'false';\n  const isLatest = $('meta[name=\"docsearch:is_latest\"]').attr('content') || 'false';\n  const pageCategory = $('meta[name=\"docsearch:page_category\"]').attr('content') || 'docs';\n\n  const pageRankByStatus = {\n    stable: 120,\n    versioned: 60,\n    unreleased: 20,\n    unknown: 0,\n  };\n\n  const pageRank =\n    pathname === `/${product}/` || pathname === `/${product}`\n      ? 160\n      : pageRankByStatus[versionStatus] ?? 0;\n\n  const lvl0 =\n    $('.menu__link.menu__link--sublist.menu__link--active, .navbar__item.navbar__link--active')\n      .last()\n      .text() || 'Documentation';\n\n  return helpers.docsearch({\n    recordProps: {\n      lvl0: {\n        selectors: '',\n        defaultValue: lvl0,\n      },\n      lvl1: ['header h1', 'article h1'],\n      lvl2: 'article h2',\n      lvl3: 'article h3',\n      lvl4: 'article h4',\n      lvl5: 'article h5, article td:first-child',\n      lvl6: 'article h6',\n      content: 'article p, article li, article td:last-child',\n      product: {\n        defaultValue: product,\n      },\n      version: {\n        defaultValue: version,\n      },\n      version_label: {\n        defaultValue: versionLabel,\n      },\n      version_status: {\n        defaultValue: versionStatus,\n      },\n      stable_version: {\n        defaultValue: stableVersion,\n      },\n      is_stable: {\n        defaultValue: isStable,\n      },\n      is_latest: {\n        defaultValue: isLatest,\n      },\n      page_category: {\n        defaultValue: pageCategory,\n      },\n      pageRank\n    },\n    indexHeadings: true,\n    aggregateContent: true,\n    recordVersion: 'v3'\n  });\n}"
      }
    }
  ]
}
EOF
```

Replace:

- `<crawler-indexing-api-key>`

That key must have the required crawler indexing permissions.

Patch the crawler config:

```bash
curl --request PATCH \
  --url "https://crawler.algolia.com/api/1/crawlers/$CRAWLER_ID/config" \
  --header "Authorization: Basic $CRAWLER_BASIC_AUTH" \
  --header "Content-Type: application/json" \
  --data @/tmp/vcluster-crawler-config.json
```

## Step 6: Trigger a Full Reindex

Only do this after the docs-site changes are live on production.

```bash
curl --request POST \
  --url "https://crawler.algolia.com/api/1/crawlers/$CRAWLER_ID/reindex" \
  --header "Authorization: Basic $CRAWLER_BASIC_AUTH"
```

## Step 7: Verify the New State

Check crawler config:

```bash
curl --request GET \
  --url "https://crawler.algolia.com/api/1/crawlers/$CRAWLER_ID?withConfig=true" \
  --header "Authorization: Basic $CRAWLER_BASIC_AUTH"
```

Check index settings:

```bash
curl --request GET \
  --url "https://$ALGOLIA_APP_ID.algolia.net/1/indexes/$ALGOLIA_INDEX/settings" \
  --header "x-algolia-application-id: $ALGOLIA_APP_ID" \
  --header "x-algolia-api-key: $ALGOLIA_ADMIN_KEY" \
  --header "accept: application/json"
```

Verify the index now supports:

- `product`
- `version_label`
- `version_status`
- `stable_version`
- `is_stable`
- `is_latest`
- `page_category`

## Step 8: Smoke Test Search

### Modal Search

Check:

- the modal opens normally
- typing doesn’t reset the query
- results still appear normally
- the `All results` pill shows only once there are results
- the pill stays bottom-right without obscuring content

### `/docs/search`

Check:

- the page loads correctly
- version selectors render underneath the query field
- desktop layout shows the product filters side by side
- mobile layout stacks them cleanly
- filters work for:
  - `Current stable`
  - specific version
  - `All versions`

### Relevance

Check:

- current stable docs rank above older docs for common queries
- older docs still show up when explicitly filtered
- unreleased docs don’t dominate results unless intentionally targeted

## After Each Stable Release

When a new stable version ships for either product:

1. Update `stableVersion` in `src/config/docsearch.js` to the new stable version string.
2. Trigger a full reindex (Step 6) so the crawler re-extracts `docsearch:stable_version` and `docsearch:is_stable` meta tags with the new value and updates `pageRank` scores.

If you skip step 1, the search modal and search page default filters will continue biasing toward the old stable version.

## Notes and Follow-Up Ideas

- The preview settings file leaves `rules` and `synonyms` empty. That’s okay for rollout.
- A later pass could add synonyms for common variants such as:
  - `vcluster` and `virtual cluster`
  - `platform` and `vcluster platform`
- If the crawler is already running with a blocked or stale configuration, it may be safer to trigger a fresh reindex after patching instead of trying to resume old work.
