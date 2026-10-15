// Remove tooltip content only from the llms-txt HTML-to-Markdown pipeline.
// Keep the visible term and its link, and leave the site's HTML unchanged.
module.exports = function rehypeStripGlossaryTooltips() {
  return (tree) => walk(tree);
};

function walk(node) {
  if (!node || !Array.isArray(node.children)) return;
  node.children = node.children.filter((child) => !(
    child.type === 'element' && child.properties?.dataGlossaryTooltip !== undefined
  ));
  for (const child of node.children) walk(child);
}
