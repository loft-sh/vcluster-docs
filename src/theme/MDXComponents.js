import React from "react";
// eslint-disable-next-line
import MDXComponents from "@theme-original/MDXComponents";
import GlossaryTerm from "@site/src/components/GlossaryTerm";
import PageVariables from "@site/src/components/PageVariables";
import InterpolatedCodeBlock from "@site/src/components/InterpolatedCodeBlock";

export default {
  ...MDXComponents,
  GlossaryTerm: GlossaryTerm,
  PageVariables: PageVariables,
  InterpolatedCodeBlock: InterpolatedCodeBlock,
};
