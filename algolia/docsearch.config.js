/*
 * DocSearch crawler template for https://vcluster.com/docs
 *
 * Apply this in the Algolia crawler editor. After changing
 * `initialIndexSettings`, delete the existing index and trigger a fresh crawl
 * so Algolia recreates the index with the new settings.
 */

new Crawler({
  appId: "YOUR_APP_ID",
  apiKey: "YOUR_API_KEY",
  rateLimit: 8,
  maxDepth: 10,
  startUrls: ["https://www.vcluster.com/docs/"],
  sitemaps: ["https://www.vcluster.com/docs/sitemap.xml"],
  ignoreCanonicalTo: true,
  discoveryPatterns: ["https://www.vcluster.com/docs/**"],
  exclusionPatterns: ["https://www.vcluster.com/docs/v0.19/**"],
  actions: [
    {
      indexName: "vcluster",
      pathsToMatch: ["https://www.vcluster.com/docs/**"],
      recordExtractor: ({ $, helpers, url }) => {
        $(".hash-link").remove();

        const pathname = url.pathname.replace(/^\/docs/, "") || "/";
        const product =
          $('meta[name="docsearch:product"]').attr("content") || "docs";
        const version =
          $('meta[name="docsearch:version"]').attr("content") || "unknown";
        const versionLabel =
          $('meta[name="docsearch:version_label"]').attr("content") || version;
        const versionStatus =
          $('meta[name="docsearch:version_status"]').attr("content") ||
          "unknown";
        const stableVersion =
          $('meta[name="docsearch:stable_version"]').attr("content") || "";
        const isStable =
          $('meta[name="docsearch:is_stable"]').attr("content") || "false";
        const isLatest =
          $('meta[name="docsearch:is_latest"]').attr("content") || "false";
        const pageCategory =
          $('meta[name="docsearch:page_category"]').attr("content") || "docs";

        const pageRankByStatus = {
          stable: 120,
          versioned: 60,
          unreleased: 20,
          unknown: 0,
        };

        const pageRank =
          pathname === `/${product}/` || pathname === `/${product}`
            ? 160
            : pageRankByStatus[versionStatus] ?? 0;

        const lvl0 =
          $(
            ".menu__link.menu__link--sublist.menu__link--active, .navbar__item.navbar__link--active"
          )
            .last()
            .text() || "Documentation";

        return helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: "",
              defaultValue: lvl0,
            },
            lvl1: ["header h1", "article h1"],
            lvl2: "article h2",
            lvl3: "article h3",
            lvl4: "article h4",
            lvl5: "article h5, article td:first-child",
            lvl6: "article h6",
            content: "article p, article li, article td:last-child",
            product: {
              defaultValue: product,
            },
            version: {
              defaultValue: version,
            },
            version_label: {
              defaultValue: versionLabel,
            },
            version_status: {
              defaultValue: versionStatus,
            },
            stable_version: {
              defaultValue: stableVersion,
            },
            is_stable: {
              defaultValue: isStable,
            },
            is_latest: {
              defaultValue: isLatest,
            },
            page_category: {
              defaultValue: pageCategory,
            },
            pageRank,
          },
          indexHeadings: true,
          aggregateContent: true,
          recordVersion: "v3",
        });
      },
    },
  ],
  initialIndexSettings: {
    vcluster: {
      attributesForFaceting: [
        "type",
        "lang",
        "language",
        "version",
        "docusaurus_tag",
        "searchable(product)",
        "searchable(version_label)",
        "filterOnly(version_status)",
        "filterOnly(stable_version)",
        "filterOnly(is_stable)",
        "filterOnly(is_latest)",
        "filterOnly(page_category)",
      ],
      attributesToRetrieve: [
        "hierarchy",
        "content",
        "anchor",
        "url",
        "url_without_anchor",
        "type",
        "product",
        "version",
        "version_label",
        "version_status",
        "is_stable",
        "is_latest",
      ],
      attributesToHighlight: ["hierarchy", "content"],
      attributesToSnippet: ["content:12"],
      camelCaseAttributes: ["hierarchy", "content"],
      searchableAttributes: [
        "unordered(hierarchy.lvl0)",
        "unordered(hierarchy.lvl1)",
        "unordered(hierarchy.lvl2)",
        "unordered(hierarchy.lvl3)",
        "unordered(hierarchy.lvl4)",
        "unordered(hierarchy.lvl5)",
        "unordered(hierarchy.lvl6)",
        "content",
      ],
      distinct: true,
      attributeForDistinct: "url",
      customRanking: [
        "desc(weight.pageRank)",
        "desc(weight.level)",
        "asc(weight.position)",
      ],
      ranking: [
        "words",
        "filters",
        "typo",
        "attribute",
        "proximity",
        "exact",
        "custom",
      ],
      highlightPreTag:
        '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: "</span>",
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: "allOptional",
      separatorsToIndex: "_",
    },
  },
});
