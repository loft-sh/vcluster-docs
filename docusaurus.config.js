// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

const __webpack_public_path__ = "/docs/";

const resolveGlob = require("resolve-glob");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "vcluster docs | Virtual Clusters for Kubernetes",
  tagline: "Virtual Clusters for Kubernetes",
  url: "https://vcluster.com",
  baseUrl: __webpack_public_path__,
  favicon: "/media/vCluster_favicon_docs_outline.svg",
  organizationName: "loft-sh", // Usually your GitHub org/user name.
  projectName: "vcluster-docs", // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: ["@saucelabs/theme-github-codeblock", "@docusaurus/theme-mermaid"],
  markdown: {
    mermaid: true,
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/loft-sh/vcluster-docs/edit/main/",
          lastVersion: "current",
          versions: {
            current: {
              label: "v0.20",
              banner: "none",
              badge: false,
            },
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
      '@docusaurus/plugin-content-docs',
      {
        id: 'vcluster',
        path: 'vcluster',
        routeBasePath: 'vcluster',
        sidebarPath: require.resolve('./sidebarsVCluster.js'),
        lastVersion: "0.21.0",
        versions: {
          current: {
            label: "main 🚧",
          },
          "0.21.0": {
            label: "v0.21 Stable",
            banner: "none",
            badge: false,
          },
          "0.20.0": {
            label: "v0.20",
            banner: "none",
            badge: false,
          }
        },
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'platform',
        path: 'platform',
        routeBasePath: 'platform',
        sidebarPath: require.resolve('./sidebarsPlatform.js'),
        lastVersion: "current",
        versions: {
          current: {
            label: "v4.x (Stable: v4.1.0)",
            banner: "none",
            badge: false,
          },
        },
        // ... other options
      },
    ],
  ],

  scripts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js",
      async: true,
    },
    {
      src: "/docs/js/custom.js",
      async: true,
    },
  ],
  clientModules: resolveGlob.sync(["./src/js/**/*.js"]),

  themeConfig: (
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */

      {
      mermaid: {
        theme: {light: 'default', dark: 'dark'},
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
        logo: {
          alt: "vcluster",
          src: "/media/vCluster_horizontal-orange.svg",
          href: "https://vcluster.com/docs",
          target: "_self",
        },
        items: [
          {
            href: "https://vcluster.com/",
            label: "Website",
            position: "right",
            target: "_self",
          },
          {
            href: "https://loft.sh/blog",
            label: "Blog",
            position: "right",
            target: "_self",
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
        algoliaOptions: {},
      },
      footer: {
        style: "light",
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} <a href="https://loft.sh/">Loft Labs, Inc.</a> | Documentation released under <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Universal</a>.`,
      },
      prism: {
        theme: prismThemes.dracula,
        additionalLanguages: ["bash", "hcl"],
      },
      announcementBar: {
        id: 'platform-upgrade',
        content: '🚀 <strong>New releases: <a href="https://www.vcluster.com/releases/en/changelog?hideLogo=true&hideMenu=true&theme=dark&embed=true&c=vCluster" target="_blank">platform 4.1 and vCluster 0.21.0</a></strong>',
        backgroundColor: '#4a90e2',
        textColor: '#ffffff',
        isCloseable: true,
     },
    }),
};

export default config;