/**
 * Centralized version configuration for EOL/EOS versions.
 *
 * MAINTAINER NOTE: Update this file when archiving docs versions.
 * Both desktop sidebar and mobile TOC read from here.
 *
 * Active versions are managed in docusaurus.config.js under each plugin's
 * `versions` and `onlyIncludeVersions` config.
 */

export const vclusterEOLVersions = [];

export const platformEOLVersions = [];

// Desktop sidebar uses arrow suffix
export const getDesktopVersions = (versions) =>
  versions.map(v => ({ ...v, label: `${v.label} ↗` }));
