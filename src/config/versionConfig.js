/**
 * Centralized version configuration for EOL/EOS versions.
 *
 * MAINTAINER NOTE: Update this file when archiving docs versions.
 * Both desktop sidebar and mobile TOC read from here.
 *
 * Active versions are managed in docusaurus.config.js under each plugin's
 * `versions` and `onlyIncludeVersions` config.
 */

// Archive branch: this build serves a single version, so there is no version
// dropdown to populate. Emptying these leaves getDesktopVersions([]) returning
// [], which is what empties the dropdown — no change to the DocSidebar swizzle
// is needed.
export const vclusterHiddenVersions = [];
export const platformHiddenVersions = [];

export const vclusterEOLVersions = [];

export const platformEOLVersions = [];

// Desktop sidebar uses arrow suffix
export const getDesktopVersions = (versions) =>
  versions.map(v => ({ ...v, label: `${v.label} ↗` }));
