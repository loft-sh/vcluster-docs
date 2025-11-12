// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

const __webpack_public_path__ = "/docs/";

import resolveGlob from "resolve-glob";

const newDocTemplate = `---
title: Your Document Title
sidebar_label: Short Label
description: Brief description of the document
---

Write your content here...
`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "vCluster docs | Virtual Clusters for Kubernetes",
  tagline: "Virtual Clusters for Kubernetes",
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
          lastVersion: "current",
          versions: {
            current: {
              label: "v0.30",
              banner: "none",
              badge: false,
            },
          },
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**', '/search/**', '*/page/*'],
          filename: 'sitemap.xml',
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);

            // Filter out pagination and unwanted pages
            const filteredItems = items.filter((item) => !item.url.includes('/page/'));

            // Enhance items with custom priorities and change frequencies
            return filteredItems.map((item) => {
              // Main landing pages get highest priority
              if (item.url === 'https://vcluster.com/docs/' ||
                  item.url === 'https://vcluster.com/docs/vcluster/' ||
                  item.url === 'https://vcluster.com/docs/platform/') {
                return { ...item, priority: 1.0, changefreq: 'daily' };
              }

              // Latest stable versions get highest priority (0.30.0 for vCluster, 4.5.0 for platform)
              if (item.url.match(/\/vcluster\/0\.30\.0\//) ||
                  item.url.match(/\/platform\/4\.5\.0\//)) {
                return { ...item, priority: 1.0, changefreq: 'daily' };
              }

              // Current/next versions (non-versioned URLs) get high priority
              if ((item.url.includes('/vcluster/') && !item.url.match(/\/vcluster\/\d+\.\d+\.\d+\//)) ||
                  (item.url.includes('/platform/') && !item.url.match(/\/platform\/\d+\.\d+\.\d+\//))) {
                return { ...item, priority: 0.8, changefreq: 'weekly' };
              }

              // ALL other versioned docs get very low priority (0.19-0.29 for vCluster, older platform versions)
              if (item.url.match(/\/vcluster\/\d+\.\d+\.\d+\//) ||
                  item.url.match(/\/platform\/\d+\.\d+\.\d+\//)) {
                return { ...item, priority: 0.1, changefreq: 'yearly' };
              }

              // Default priority for other pages
              return item;
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
        lastVersion: "0.30.0",
        onlyIncludeVersions: ["current", "0.30.0", "0.29.0", "0.28.0", "0.27.0", "0.26.0"],
        versions: {
          current: {
            label: "main 🚧",
          },
          "0.30.0": {
            label: "v0.30 Stable",
            banner: "none",
            badge: true,
          },
          "0.29.0": {
            label: "v0.29",
            banner: "none",
            badge: true,
          },
          "0.28.0": {
            label: "v0.28",
            banner: "none",
            badge: true,
          },
          "0.27.0": {
            label: "v0.27 (EOS)",
            banner: "none",
            badge: true,
          },
          "0.26.0": {
            label: "v0.26 (EOS)",
            banner: "none",
            badge: true,
          },
          "0.25.0": {
            label: "v0.25 (EOS)",
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
        lastVersion: "4.5.0",
        onlyIncludeVersions: ["current", "4.5.0", "4.4.0", "4.3.0"],
        versions: {
          current: {
            label: "main 🚧",
          },
          "4.5.0": {
            label: "v4.5 Stable",
            banner: "none",
            badge: true,
          },
          "4.4.0": {
            label: "v4.4",
            banner: "none",
            badge: true,
          },
          "4.3.0": {
            label: "v4.3",
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
            htmlLabels: true,
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
          // Right-side items
          {
            href: "https://loft.sh/blog",
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
        apiKey: "057a9f939df7215d92c8171d47352c54",
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
              },
              {
                html: `
                  <a href="https://devpod.sh/open#https://github.com/loft-sh/vcluster-docs" target="_blank" class="footer-devpod-link" aria-label="Open in DevPod">
                    Open in DevPod
                  </a>
                `
              }
            ]
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()}<span class="footer-space-before"><a href="https://loft.sh/">LoftLabs</a></span><span class="footer-separator">|</span>Documentation released under<span class="footer-space-before"><a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Universal</a></span>.`,
      },
      prism: {
        theme: prismThemes.dracula,
        additionalLanguages: ["bash", "hcl"],
      },
      announcementBar: {
        id: "platform-4-5-release",
        content:
          '🚀 <strong>New releases: <a href="https://www.vcluster.com/releases/en/changelog?hideLogo=true&hideMenu=true&theme=dark&embed=true&c=vCluster" target="_blank">vCluster Platform 4.5 and vCluster 0.30</a></strong>',
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