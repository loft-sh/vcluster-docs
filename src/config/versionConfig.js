/**
 * Centralized version configuration for EOL/EOS versions.
 *
 * MAINTAINER NOTE: Update this file when archiving docs versions.
 * Both desktop sidebar and mobile TOC read from here.
 *
 * Active versions are managed in docusaurus.config.js under each plugin's
 * `versions` and `onlyIncludeVersions` config.
 */

export const vclusterEOLVersions = [
  { to: "https://vcluster.com/docs/v0.26", label: "v0.26 (EOL)" },
  { to: "https://vcluster.com/docs/v0.25", label: "v0.25 (EOL)" },
  { to: "https://vcluster.com/docs/v0.24", label: "v0.24 (EOL)" },
  { to: "https://vcluster.com/docs/v0.23", label: "v0.23 (EOL)" },
  { to: "https://vcluster.com/docs/v0.22", label: "v0.22 (EOL)" },
  { to: "https://vcluster.com/docs/v0.21", label: "v0.21 (EOL)" },
  { to: "https://vcluster.com/docs/v0.20", label: "v0.20 (EOL)" },
  { to: "https://vcluster.com/docs/v0.19", label: "v0.19 (EOL)" },
];

export const platformEOLVersions = [
  { to: "https://platform-v4-4--vcluster-docs-site.netlify.app/docs/platform/", label: "v4.4 (EOS)" },
  { to: "https://platform-v4-3--vcluster-docs-site.netlify.app/docs/platform/", label: "v4.3 (EOS)" },
  { to: "https://vcluster.com/docs/v4.2", label: "v4.2 (EOL)" },
  { to: "https://loft.sh/docs/getting-started/install", label: "v3.4 (EOL)" },
];

// Desktop sidebar uses arrow suffix
export const getDesktopVersions = (versions) =>
  versions.map(v => ({ ...v, label: `${v.label} ↗` }));
