/**
 * Rehype plugin: drop HTML comment nodes from the hast tree.
 *
 * React emits empty `<!-- -->` markers around JSX expression boundaries
 * (e.g. `<GlossaryTerm>...</GlossaryTerm>` in the middle of a sentence).
 * These markers survive the HTML → Markdown pipeline in
 * `@signalwire/docusaurus-plugin-llms-txt`, producing literal `<!-- -->`
 * strings inside `.md` output that downstream consumers (RAG, LLM agents)
 * then ingest as noise.
 *
 * This plugin is meant to run as a `beforeDefaultRehypePlugins` entry on
 * the llms-txt plugin pipeline, before `rehype-remark` converts the tree
 * to mdast.
 */

module.exports = function rehypeStripComments() {
  return (tree) => {
    walk(tree);
  };
};

function walk(node) {
  if (!node || !Array.isArray(node.children)) return;
  node.children = node.children.filter((child) => child && child.type !== 'comment');
  for (const child of node.children) walk(child);
}
