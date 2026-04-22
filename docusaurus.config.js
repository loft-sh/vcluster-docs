// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

const __webpack_public_path__ = "/docs/";

import resolveGlob from "resolve-glob";
import remarkVersionTokens from "./plugins/remark-version-tokens.js";
import rehypeStripComments from "./plugins/rehype-strip-comments.js";

const newDocTemplate = `---
title: Your Document Title
sidebar_label: Short Label
description: Brief description of the document
---

Write your content here...
`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Tenant cluster management",
  tagline: "Manage tenant clusters like a hyperscaler",
  url: "https://vcluster.com",
  baseUrl: __webpack_public_path__,
  organizationName: "loft-sh", // Usually your GitHub org/user name.
  projectName: "vcluster-docs", // Usually your repo name.
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        href: '/docs/media/rebranding/vCluster_favicon_docs.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        href: '/docs/media/rebranding/vCluster_favicon_docs_dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    },
  ],

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  themes: ["@saucelabs/theme-github-codeblock", "@docusaurus/theme-mermaid"],
  markdown: {
    mermaid: true,
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/loft-sh/vcluster-docs/edit/main/",
          editCurrentVersion: true,
          beforeDefaultRemarkPlugins: [
            [remarkVersionTokens, { siteDir: __dirname }],
          ],
          lastVersion: "current",
          versions: {
            current: {
              label: "v0.32",
              banner: "none",
              badge: false,
            },
          },
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: [
            '/tags/**',
            '/search',
            '/search/**',
            '*/page/*',
            // Exclude versioned URLs from the sitemap. Unversioned paths (served
            // by lastVersion) are the canonical entry points for search engines.
            // The matching `noindex,follow` meta tag is emitted by the DocItem
            // swizzle at src/theme/DocItem/Layout/index.js. See DOC-1325.
            '/vcluster/[0-9]*.[0-9]*.[0-9]*/**',
            '/platform/[0-9]*.[0-9]*.[0-9]*/**',
            '/vcluster/next/**',
            '/platform/next/**',
          ],
          filename: 'sitemap.xml',
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);

            // Filter out pagination and any remaining versioned URLs that
            // slipped past ignorePatterns. Belt-and-braces: the version regex
            // here catches any X.Y.Z path segment under /vcluster/ or /platform/.
            const filteredItems = items.filter((item) => {
              if (item.url.includes('/page/')) return false;
              if (item.url.match(/\/vcluster\/\d+\.\d+\.\d+\//)) return false;
              if (item.url.match(/\/platform\/\d+\.\d+\.\d+\//)) return false;
              if (item.url.match(/\/vcluster\/next(\/|$)/)) return false;
              if (item.url.match(/\/platform\/next(\/|$)/)) return false;
              return true;
            });

            // Landing pages get highest priority; everything else stays
            // on the default sitemap priority.
            return filteredItems.map((item) => {
              if (item.url === 'https://vcluster.com/docs/' ||
                  item.url === 'https://vcluster.com/docs/vcluster/' ||
                  item.url === 'https://vcluster.com/docs/platform/') {
                return { ...item, priority: 1.0, changefreq: 'daily' };
              }
              return { ...item, priority: 0.8, changefreq: 'weekly' };
            });
          },
        },
        theme: {
          customCss: resolveGlob.sync(["./src/css/**/*.scss"]),
        },
      }),
    ],
    [
      "redocusaurus",
      {
        specs: [
          {
            spec: "schemas/config-openapi.json",
          },
        ],
        theme: {
          primaryColor: "#00bdff",
          redocOptions: {
            hideDownloadButton: false,
            disableSearch: true,
            colors: {
              border: {
                dark: "#00bdff",
                light: "#00bdff",
              },
            },
          },
        },
      },
    ],
  ],

  plugins: [
    "docusaurus-plugin-sass",
    "plugin-image-zoom",
    [
      "@signalwire/docusaurus-plugin-llms-txt",
      {
        content: {
          enableLlmsFullTxt: true,
          includeDocs: true,
          includeBlog: false,
          includePages: false,
          includeVersionedDocs: false,
          excludeRoutes: [
            '/search/**',
            '/tags/**',
            // CLI reference pages are auto-generated --help output; exclude
            // individual entries to keep llms.txt under 50K. The pattern
            // includes the site baseUrl (`/docs/`) because the signalwire
            // plugin matches against the full route path.
            '/docs/vcluster/cli/**',
            // Aggregate config reference renders to ~380K — well above the
            // 100K agent truncation limit. Sub-pages are indexed individually.
            '/docs/vcluster/configure/vcluster-yaml$',
            // Aggregate sync reference renders to ~161K; sub-pages are indexed.
            '/docs/vcluster/configure/vcluster-yaml/sync$',
            // Platform API reference renders to ~116K; no sub-pages exist.
            // Silent truncation on a dense API reference causes incorrect answers.
            '/docs/platform/api/resources/project/templates$',
          ],
          // Emit absolute URLs (https://www.vcluster.com/docs/...) instead of
          // site-relative paths. Downstream consumers (R2R RAG, LLM agents)
          // surface these links to users in CLI contexts where relative paths
          // are not clickable or resolvable. See ENGAI-58.
          relativePaths: false,
          // Strip React-emitted `<!-- -->` JSX expression markers before the
          // HTML→Markdown conversion. Runs at the hast stage, ahead of
          // rehype-remark, so comment nodes are gone before mdast is built.
          // See DOC-1322.
          beforeDefaultRehypePlugins: [rehypeStripComments],
        },
        siteTitle: 'vCluster Documentation',
        siteDescription: 'Documentation for vCluster (virtual Kubernetes clusters) and vCluster Platform (multi-cluster management)',
        // Descriptions are disabled to keep llms.txt under the 50K agent
        // truncation threshold (~43K savings). Titles carry sufficient signal
        // for discovery; full content is available at the linked .md URLs.
        enableDescriptions: false,
        depth: 2,
      },
    ],
    function(context, options) {
      return {
        name: 'yaml-loader',
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /\.ya?ml$/,
                  use: 'yaml-loader',
                },
              ],
            },
          };
        },
      };
    },

    [
      "@docusaurus/plugin-content-docs",
      {
        id: "vcluster",
        path: "vcluster",
        routeBasePath: "vcluster",
        sidebarPath: require.resolve("./sidebarsVCluster.js"),
        editUrl: ({ versionDocsDirPath, docPath }) =>
          `https://github.com/loft-sh/vcluster-docs/edit/main/${versionDocsDirPath}/${docPath}`,
        editCurrentVersion: true,
        beforeDefaultRemarkPlugins: [
          [remarkVersionTokens, { siteDir: __dirname }],
        ],
        lastVersion: "0.33.0",
        onlyIncludeVersions: ["current", "0.33.0", "0.32.0", "0.31.0", "0.30.0"],
        versions: {
          current: {
            label: "main 🚧",
          },
          "0.33.0": {
            label: "v0.33 Stable",
            banner: "none",
            badge: true,
          },
          "0.32.0": {
            label: "v0.32",
            banner: "none",
            badge: true,
          },
          "0.31.0": {
            label: "v0.31",
            banner: "none",
            badge: true,
          },
          "0.30.0": {
            label: "v0.30 (EOS)",
            banner: "none",
            badge: true,
          },
        },
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "platform",
        path: "platform",
        routeBasePath: "platform",
        sidebarPath: require.resolve("./sidebarsPlatform.js"),
        editUrl: ({ versionDocsDirPath, docPath }) =>
          `https://github.com/loft-sh/vcluster-docs/edit/main/${versionDocsDirPath}/${docPath}`,
        editCurrentVersion: true,
        beforeDefaultRemarkPlugins: [
          [remarkVersionTokens, { siteDir: __dirname }],
        ],
        lastVersion: "4.8.0",
        onlyIncludeVersions: ["current", "4.8.0", "4.7.0", "4.6.0"],
        versions: {
          current: {
            label: "main 🚧",
          },
          "4.8.0": {
            label: "v4.8 Stable",
            banner: "none",
            badge: true,
          },
          "4.7.0": {
            label: "v4.7",
            banner: "none",
            badge: true,
          },
          "4.6.0": {
            label: "v4.6",
            banner: "none",
            badge: true,
          },
        },
      },
    ],
  ],

  scripts: [
    {
      src:
        "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js",
      async: true,
    },
  ],
  clientModules: [
    './src/client/MermaidPolyfillsClient.js',
    './src/client/ConfigNavigationClient.js',
    './src/client/DetailsClicksClient.js',
  ],

  themeConfig: (
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */

    {
      imageZoom: {
        selector: '.markdown img, .intro-card img',
        options: {
          background: 'rgba(0, 0, 0, 0.8)',
          scrollOffset: 0,
        }
      },
      mermaid: {
        theme: { light: "default", dark: "dark" },
        options: {
          flowchart: {
            htmlLabels: false,
            curve: 'basis'
          },
          fontSize: 14
        },
      },
      tableOfContents: {
        // default is ##, ### so add ####
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      colorMode: {
        defaultMode: "light",
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: "",
        logo: {
          alt: "vCluster",
          src: "/media/rebranding/vCluster_favicon_docs_orange.svg",
        },
        items: [
          // Product tabs
          {
            to: "/vcluster/",
            position: "left",
            label: "vCluster",
          },
          {
            to: "/platform/",
            position: "left",
            label: "vCluster Platform",
          },
          {
            href: "https://www.vnode.com/docs",
            label: "vNode",
            position: "left",
            target: "_blank",
          },
          {
            href: "https://www.vmetal.ai/docs",
            label: "vMetal",
            position: "left",
            target: "_blank",
          },
          // Right-side items
          {
            href: "https://www.vcluster.com/blog",
            label: "Blog",
            position: "right",
            target: "_blank",
          },
          {
            href: "https://www.vcluster.com/releases/en/changelog?hideLogo=true&hideMenu=true&theme=dark&embed=true&c=vCluster",
            label: "Changelog",
            position: "right",
            target: "_blank",
          },
          {
            href: "https://slack.loft.sh/",
            className: "slack-link",
            "aria-label": "Slack",
            position: "right",
          },
          {
            href: "https://github.com/loft-sh/vcluster",
            className: "github-link",
            "aria-label": "GitHub",
            position: "right",
          },
        ],
      },
      algolia: {
        appId: "K85RIQNFGF",
        apiKey: "7c88fbdab6aea75d67f1f52e41b5d456",
        indexName: "vcluster",
        placeholder: "Search...",
        externalUrlRegex: "vcluster\\.com\/docs\/v0\\.19",
        algoliaOptions: {},
      },
      footer: {
        style: "light",
        links: [
          {
            // Use a non-breaking space to prevent any title from showing
            title: "\u00A0",
            items: [
              {
                html: `
                  <a href="https://github.com/loft-sh/vcluster-docs/new/main/staging?filename=your-doc-name.mdx&value=${encodeURIComponent(newDocTemplate)}" target="_blank" class="footer-create-link" aria-label="Create New Doc">
                    Create New Doc
                  </a>
                `
              }
            ]
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()}<span class="footer-space-before"><a href="https://www.vcluster.com/">vCluster Labs</a></span><span class="footer-separator">|</span>Documentation released under<span class="footer-space-before"><a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Universal</a></span>.`,
      },
      prism: {
        theme: prismThemes.dracula,
        additionalLanguages: ["bash", "hcl"],
      },
      announcementBar: {
        id: "vcluster-0-33-platform-4-8-release",
        content:
          '🚀 <strong>New releases: <a href="https://www.vcluster.com/releases/en/changelog?hideLogo=true&hideMenu=true&theme=dark&embed=true&c=vCluster" target="_blank">vCluster Platform 4.8 and vCluster 0.33</a></strong>',
        backgroundColor: "#4a90e2",
        textColor: "#ffffff",
        isCloseable: true,
      },
    }
  ),

  // Enable experimental faster features with required v4 flags
  future: {
    experimental_faster: true,
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
    },
  },
};

export default config;