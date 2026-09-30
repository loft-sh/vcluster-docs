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

- [docusaurus.config.js](../docusaurus.config.js)
- [src/theme/DocItem/Layout/index.js](../src/theme/DocItem/Layout/index.js)
- [src/config/docsearch.js](../src/config/docsearch.js)
- [src/theme/SearchBar/index.js](../src/theme/SearchBar/index.js)
- [src/theme/SearchBar/styles.css](../src/theme/SearchBar/styles.css)
- [src/theme/SearchPage/index.js](../src/theme/SearchPage/index.js)
- [src/theme/SearchPage/styles.module.css](../src/theme/SearchPage/styles.module.css)

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
4. Apply the updated index settings **and synonyms** to the existing `vcluster` index. They are separate endpoints; see Step 4.
5. Patch the crawler configuration.
6. Trigger a full reindex after the docs changes are live on production.
7. Verify extracted records and search behavior.

Important:

- Don’t trigger the reindex before the docs-site changes are deployed.
- The new crawler depends on `docsearch:*` meta tags that only exist after the PR is live.
- `initialIndexSettings` in the crawler don’t re-apply to an existing index, so update the index settings directly with the Search API.

Source references:

- [Algolia update index settings](https://www.algolia.com/doc/rest-api/search/set-settings)
- [Algolia save synonyms batch](https://www.algolia.com/doc/rest-api/search/save-synonyms)
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

These are added in [src/theme/DocItem/Layout/index.js](../src/theme/DocItem/Layout/index.js).

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

Back up current synonyms. Step 4 replaces them wholesale, so this is the only
way back:

```bash
curl --request POST \
  --url "https://$ALGOLIA_APP_ID.algolia.net/1/indexes/$ALGOLIA_INDEX/synonyms/search" \
  --header "x-algolia-application-id: $ALGOLIA_APP_ID" \
  --header "x-algolia-api-key: $ALGOLIA_ADMIN_KEY" \
  --header "content-type: application/json" \
  --data '{"query":"","hitsPerPage":1000}' \
  --output /tmp/vcluster-synonyms.backup.json
```

Then reconcile that backup against the file before going any further. Step 4
sends `replaceExistingSynonyms=true`, which deletes every synonym the file does
not contain, including any added directly in the Algolia dashboard and never
committed here:

```bash
python3 - <<'EOF'
import json
live = {h["objectID"] for h in json.load(open("/tmp/vcluster-synonyms.backup.json"))["hits"]}
repo = {s["objectID"] for s in json.load(
    open("algolia/export-vcluster-settings.preview.json"))["synonyms"]}
print("in Algolia but not in the file (will be DELETED):", sorted(live - repo) or "none")
print("in the file but not in Algolia (will be added):  ", sorted(repo - live) or "none")
EOF
```

Expect the first list to hold only the four superseded objectIDs from the
bidirectional set this PR replaced: `syn-virtual-tenant-cluster`,
`syn-host-control-plane-cluster`, `syn-multi-tenancy-isolation`, and
`syn-neocloud-ai-cloud`. Anything else in that list is a synonym someone
created in the dashboard. Commit it to the file first, or you will silently
drop it.

## Step 4: Apply Updated Index Settings and Synonyms

[export-vcluster-settings.preview.json](export-vcluster-settings.preview.json)
is a wrapper holding three separate Algolia resources:

```json
{ "settings": { ... }, "rules": [ ... ], "synonyms": [ ... ] }
```

Each one has its own endpoint. Sending the whole file to any single endpoint
silently does nothing useful: Algolia ignores unknown top-level keys, returns
200, and leaves everything unchanged. Split it first.

### Index settings

```bash
python3 -c "import json;print(json.dumps(json.load(open('algolia/export-vcluster-settings.preview.json'))['settings']))" \
  > /tmp/vcluster-index-settings.json

curl --request PUT \
  --url "https://$ALGOLIA_APP_ID.algolia.net/1/indexes/$ALGOLIA_INDEX/settings" \
  --header "x-algolia-application-id: $ALGOLIA_APP_ID" \
  --header "x-algolia-api-key: $ALGOLIA_ADMIN_KEY" \
  --header "content-type: application/json" \
  --data @/tmp/vcluster-index-settings.json
```

This is required because the crawler’s `initialIndexSettings` won’t update an already-existing index.

### Synonyms

Synonyms are not index settings. They have their own endpoint, and the settings
call above will not change them.

```bash
python3 -c "import json;print(json.dumps(json.load(open('algolia/export-vcluster-settings.preview.json'))['synonyms']))" \
  > /tmp/vcluster-synonyms.json

curl --request POST \
  --url "https://$ALGOLIA_APP_ID.algolia.net/1/indexes/$ALGOLIA_INDEX/synonyms/batch?replaceExistingSynonyms=true" \
  --header "x-algolia-application-id: $ALGOLIA_APP_ID" \
  --header "x-algolia-api-key: $ALGOLIA_ADMIN_KEY" \
  --header "content-type: application/json" \
  --data @/tmp/vcluster-synonyms.json
```

`replaceExistingSynonyms=true` makes the file authoritative, so a synonym
deleted from it is deleted from the index. That is what you want here, since
the file is the source of truth in git.

Synonyms take effect immediately. They do not need the reindex in Step 6.

The entries map retired terminology onto the terms the docs now use, so a
reader searching the old word still lands somewhere.

**They are deliberately one-way.** A `type: "synonym"` group makes every term in
it equivalent in both directions. Written that way, `cluster` would expand to
`virtual cluster` and `tenant cluster` on every search, and `cluster` is the
single most common query these docs get. Each one would pull in the versioned
and generated pages that still use the retired wording and rank them against
current pages. `type: "oneWaySynonym"` fires only when the query contains
`input`, which is the behavior actually wanted here: the old word finds the new
pages, and the new word is left alone.

| Entry | Query that fires it | Also matches |
| -- | -- | -- |
| `syn-virtual-cluster-to-cluster` | "virtual cluster" | "cluster" |
| `syn-tenant-cluster-to-cluster` | "tenant cluster" | "cluster" |
| `syn-host-cluster-to-control-plane-cluster` | "host cluster" | "control plane cluster" |
| `syn-multi-tenancy-to-tenant-isolation` | "multi-tenancy" | "tenant isolation" |
| `syn-multitenancy-to-tenant-isolation` | "multitenancy" | "tenant isolation" |
| `syn-neocloud-to-ai-cloud` | "neocloud" | "AI cloud" |
| `syn-neoclouds-to-ai-cloud` | "neoclouds" | "AI cloud" |

`syn-multi-tenancy-spellings` is the one deliberate exception, and it stays
bidirectional. "multi-tenancy" and "multitenancy" are two spellings of one word
rather than an old term and its replacement, and "Multi-Tenancy" is still a
live feature name on the License page, so a reader typing either spelling
should reach it.

### Rules

`rules` is empty today. If it ever is not, it needs
`POST /1/indexes/$ALGOLIA_INDEX/rules/batch?clearExistingRules=true`, the same
shape as the synonyms call.


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

Check synonyms:

```bash
curl --request POST \
  --url "https://$ALGOLIA_APP_ID.algolia.net/1/indexes/$ALGOLIA_INDEX/synonyms/search" \
  --header "x-algolia-application-id: $ALGOLIA_APP_ID" \
  --header "x-algolia-api-key: $ALGOLIA_ADMIN_KEY" \
  --header "content-type: application/json" \
  --data '{"query":"","hitsPerPage":1000}'
```

Expect the eight entries listed in Step 4, and check the `type` field on each:
anything reading `synonym` other than `syn-multi-tenancy-spellings` is a
bidirectional group that shouldn't be there. A 200 from the settings call in
Step 4 says nothing about synonyms, so check them here rather than assuming.

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
- searching a retired term reaches **current** pages. Don't treat any result as
  a pass. The retired wording is still present in roughly 1,800 indexed files:
  every versioned snapshot keeps the terminology its release shipped, the
  generated CLI and API reference is regenerated from source that still uses it,
  and a few production-guide pages use it deliberately. A query for "virtual
  cluster" therefore returns hits whether or not a single synonym is installed,
  so a plain non-empty result proves nothing.

  Filter to `Current stable` and confirm that "virtual cluster", "tenant
  cluster", "host cluster" and "neocloud" each return current-version pages that
  do not contain the queried phrase at all. That result can only come from the
  synonym. The synonym endpoint check in Step 7 is the authoritative test;
  this one confirms it reaches readers.
- unreleased docs don’t dominate results unless intentionally targeted

## External Site Reindex (vNode and vMetal)

The crawler now covers three domains: `vcluster.com`, `vnode.com`, and `vmetal.ai`. The Saturday schedule crawls all three automatically. However, vnode-docs and vmetal-docs deploy independently and have no per-deploy crawler hook — a manual reindex is required after either external site ships significant content changes.

### When to trigger a manual reindex

Trigger after any deploy to `vnode-docs` or `vmetal-docs` that adds or substantially changes pages. Small edits don't warrant a reindex — the Saturday crawl will pick them up.

### Before triggering the reindex

Verify the external site is live with the correct meta tags. Check page source on any doc page and confirm:

```
<meta name="docsearch:product" content="vnode">   <!-- or vmetal -->
<meta name="docsearch:page_category" content="docs">
```

If the tags are missing (e.g. the `DocItem/Layout` swizzle wasn't deployed), the crawler falls back to the `defaultValue` fields in `docsearch.config.js`. Results will still be faceted correctly, but confirm this before proceeding.

### Trigger the reindex

```bash
curl --request POST \
  --url "https://crawler.algolia.com/api/1/crawlers/$CRAWLER_ID/reindex" \
  --header "Authorization: Basic $CRAWLER_BASIC_AUTH"
```

### Verify

After the crawl completes, open the Algolia index browser and filter by `product:vnode` and `product:vmetal` to confirm records are present with correct `version_label` and `is_latest` values.

## After Each Stable Release

When a new stable version ships for either product:

1. Update `stableVersion` in `src/config/docsearch.js` to the new stable version string.
2. Trigger a full reindex (Step 6) so the crawler re-extracts `docsearch:stable_version` and `docsearch:is_stable` meta tags with the new value and updates `pageRank` scores.

If you skip step 1, the search modal and search page default filters will continue biasing toward the old stable version.

## Notes and Follow-Up Ideas

- The preview settings file carries eight synonym entries, added after the
  DOC-1372 terminology sweep. Seven are one-way mappings from a retired term to
  its replacement; see Step 4 for why the direction matters. `rules` is still
  empty. Both are applied separately from index settings, which is easy to
  miss.
- If the crawler is already running with a blocked or stale configuration, it may be safer to trigger a fresh reindex after patching instead of trying to resume old work.
