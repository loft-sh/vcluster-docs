# Documentation Release Checklist

## ⚠️ NEVER MODIFY VERSIONED DOCS UNLESS EXPLICITLY REQUESTED ⚠️

**IMPORTANT**: Do NOT modify files in `vcluster_versioned_docs/version-*/` folders unless the user specifically asks you to update a particular version.

- Versioned docs represent historical snapshots of documentation for specific releases
- They should remain unchanged to preserve accuracy for users on older versions
- Only update files in the main `vcluster/` folder for current documentation
- Modifying multiple version folders wastes resources and changes historical documentation incorrectly

**Example**: If fixing a Terraform syntax issue, only update `vcluster/` files, NOT `vcluster_versioned_docs/version-0.20.0/`, `version-0.21.0/`, etc.

## ⚠️ BEFORE CUTTING A NEW DOCS RELEASE ⚠️

When preparing a new documentation release (especially for versioned docs), ALWAYS check for broken links:

### 1. Docusaurus Link Resolution Rules

- **USE relative file paths with `.mdx` extensions** - Docusaurus will resolve them correctly
- **Relative file paths are PREFERRED over URL paths** - they're less sensitive to trailing slashes
- **Relative paths must be correct for the file's location**
- **Absolute paths starting with `/docs/` often break** - use relative file paths instead

### 2. Common Broken Link Patterns to Fix

#### ❌ WRONG (URL paths - sensitive to trailing slashes):
```markdown
[Pod Identity](/vcluster/integrations/pod-identity/eks-pod-identity)
[Backing Store](../../../configure/vcluster-yaml/control-plane/components/backing-store)
[FIPS Guide](/vcluster/deploy/security/fips)
[Policies](../../../../configure/vcluster-yaml/policies/)
```

#### ✅ CORRECT (file paths with .mdx - robust):
```markdown
[Pod Identity](../../../../third-party-integrations/pod-identity/eks-pod-identity.mdx)
[Backing Store](../../../configure/vcluster-yaml/control-plane/components/backing-store/README.mdx)
[FIPS Guide](./fips.mdx)
[Policies](../../../configure/vcluster-yaml/policies/README.mdx)
```

### 3. Release Process - MUST CHECK VERSIONED DOCS

**CRITICAL**: When cutting a new release (e.g., 0.27.0), the versioned docs folder (`vcluster_versioned_docs/version-X.X.X/`) may contain OLD absolute paths that need updating!

```bash
# Check for problematic patterns in the new version folder:
grep -r "/vcluster/integrations\|/vcluster/deploy/security" vcluster_versioned_docs/version-0.27.0/
```

Common files that need fixing in versioned docs:
- `deploy/control-plane/container/environment/eks.mdx`
- `deploy/control-plane/container/environment/gke.mdx`
- `deploy/control-plane/container/high-availability.mdx`
- `deploy/control-plane/container/security/air-gapped.mdx`
- `deploy/worker-nodes/host-nodes/isolated-workloads.mdx`

### 4. Build Error Troubleshooting

If you see: `Error: Docusaurus found broken links!`

#### 🚨 SUPER IMPORTANT: Efficient Broken Link Debugging Method 🚨

When you see a broken link error like:
```
Broken link on source page path = /docs/vcluster/configure/vcluster-yaml/sync/:
   -> linking to ../control-plane/other/advanced/virtual-scheduler
```

**DO THIS:**
1. **CD into the versioned folder** matching the path structure
   ```bash
   cd vcluster_versioned_docs/version-0.21.0/configure/vcluster-yaml/sync/
   ```
2. **Grep for the referenced file** by name to find where it's being used
   ```bash
   grep -r "virtual-scheduler" . --include="*.mdx"
   ```
3. **Fix the relative path** in the file that shows up

This is MUCH faster than trying to calculate relative paths manually!

#### Other Troubleshooting Steps:

1. **Clear ALL caches first**:
   ```bash
   rm -rf .docusaurus build node_modules/.cache
   ```

2. **Check BOTH locations**:
   - Main docs: `/vcluster/`
   - Versioned docs: `/vcluster_versioned_docs/version-X.X.X/`

3. **Count the `../` levels carefully** - they must match the directory depth

4. **Remember**: Links are resolved at build time, not runtime - broken links will fail the build

## Trailing Slash Behavior

Different static hosting providers handle trailing slashes differently. Docusaurus uses file paths with `.mdx` extensions to avoid these issues entirely.

### Common Problems with URL Paths:
- SEO/perf issues: when browsing `/myPath`, your host redirects to `/myPath/`
- 404 issues: relative link such as `<a href="otherPath">` are resolved differently (`/otherPath` or `/myPath/otherPath` depending on the presence/absence of a trailing slash
- UX issues: your host adds a trailing slash, and later your single-page-application frontend router removes it, leading to a confusing experience and flickering url

### Why File Paths Are Better:

Using relative file paths (with `.md`/`.mdx` extensions) instead of relative URL links provides the following benefits:

- Links will keep working on the GitHub interface and many Markdown editors
- You can customize the files' slugs without having to update all the links
- Moving files around the folders can be tracked by your editor, and some editors may automatically update file links
- A versioned doc will link to another doc of the exact same version
- **Relative URL links are very likely to break if you update the trailingSlash config**

### Important Note

Markdown file references only work when the source and target files are processed by the same plugin instance. This is a technical limitation of Docusaurus's Markdown processing architecture. If you are linking files between plugins (e.g., linking to a doc page from a blog post), you have to use URL links.
