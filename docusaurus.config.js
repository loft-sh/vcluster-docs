__webpack_public_path__ = "/docs/";

const resolveGlob = require("resolve-glob");

module.exports = {
  title: "vcluster docs | Virtual Clusters for Kubernetes",
  tagline: "Virtual Clusters for Kubernetes",
  url: "https://vcluster.com",
  baseUrl: __webpack_public_path__,
  favicon: "/media/vcluster_symbol.svg",
  organizationName: "loft-sh", // Usually your GitHub org/user name.
  projectName: "vcluster-docs", // Usually your repo name.
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  themeConfig: {
    announcementBar: {
        id: 'beta',
        isCloseable: false,
        content: 'vCluster v0.20 is in beta. Do not use in production. Questions? Join our <a href="https://slack.loft.sh" target="_blank">Slack community</a>.',
        backgroundColor: '#f2f2f2',
        textColor: '#17202A',
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
        href: "https://vcluster.com/",
        target: "_self",
      },
      items: [
        {
          type: "docsVersionDropdown",
          position: "left",
          dropdownItemsAfter: [
            { to: "https://vcluster.com/docs/v0.19", label: "Stable v0.19" },
          ],
          dropdownActiveClassDisabled: true,
        },
        {
          href: "https://vcluster.com/",
          label: "Website",
          position: "left",
          target: "_self",
        },
        {
          label: "Docs",
          position: "left",
          to: "/",
        },
        {
          href: "https://loft.sh/blog",
          label: "Blog",
          position: "left",
          target: "_self",
        },
        {
          href: "https://slack.loft.sh/",
          className: "slack-link",
          "aria-label": "Slack",
          position: "right",
        },
        {
          href: "https://github.com/loft-sh/vcluster-docs",
          className: "github-link",
          "aria-label": "GitHub",
          position: "right",
        },
      ],
    },
    algolia: {
      appId: "K85RIQNFGF",
      apiKey: "42375731adc726ebb99849e9051aa9b4",
      indexName: "vcluster",
      placeholder: "Search...",
      algoliaOptions: {},
    },
    footer: {
      style: "light",
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://loft.sh/">Loft Labs, Inc.</a>`,
    },
    prism: {
      additionalLanguages: ["bash", "hcl"],
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/loft-sh/vcluster-docs/edit/main/",
          lastVersion: "current",
          versions: {
            current: {
              label: "Latest v0.20",
              banner: "none",
              badge: true,
            },
          },
        },
        theme: {
          customCss: resolveGlob.sync(["./src/css/**/*.scss"]),
        },
      },
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
  themes: ["@saucelabs/theme-github-codeblock"],
  plugins: ["docusaurus-plugin-sass", "plugin-image-zoom"],
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
};
