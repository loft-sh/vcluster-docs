import React from "react";
// eslint-disable-next-line
import MDXComponents from "@theme-original/MDXComponents";
import GlossaryTerm from "@site/src/components/GlossaryTerm";
import PageVariables from "@site/src/components/PageVariables";
import InterpolatedCodeBlock from "@site/src/components/InterpolatedCodeBlock";

// Config reference pages render each field card as <details className="config-field">.
// Docusaurus's mdx-loader rewrites every <details> to its React-controlled <Details>
// theme component at compile time (remark/details: "MDX 2 doesn't allow to substitute
// html elements with the provider anymore"), so the runtime mapping that matters is
// `Details` (capital), not lowercase `details`. That controlled component owns the
// open/closed state via a `collapsed` React state and `data-collapsed`.
//
// The config-reference client modules (ConfigNavigationClient and DetailsClicksClient)
// instead drive these cards imperatively — setting `el.open`, dispatching
// `summary.click()`, and toggling `data-collapsed` — for deep-link auto-expansion, TOC
// highlighting, and the copy-as-YAML buttons. Those imperative writes happen outside
// React's knowledge, so the controlled component reverts them on its next render:
// clicking a card expands it briefly, then it snaps shut and locks up until a refresh
// (DOC-1528). Rendering config-field cards as plain, uncontrolled native <details>
// removes the conflict and lets the scripts own the element as they were written to.
// All other details keep Docusaurus's component.
const OriginalDetails = MDXComponents.Details;

function isConfigField(className) {
  return (
    typeof className === "string" &&
    className.split(/\s+/).includes("config-field")
  );
}

function ConfigAwareDetails(props) {
  if (isConfigField(props.className)) {
    return <details {...props} />;
  }
  return <OriginalDetails {...props} />;
}

export default {
  ...MDXComponents,
  details: ConfigAwareDetails,
  Details: ConfigAwareDetails,
  GlossaryTerm: GlossaryTerm,
  PageVariables: PageVariables,
  InterpolatedCodeBlock: InterpolatedCodeBlock,
};
