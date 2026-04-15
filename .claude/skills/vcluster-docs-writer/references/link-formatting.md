# Link Formatting Guidelines

## Core Principle

**Always use relative file paths with `.mdx` extensions. The `.mdx` suffix is mandatory, not a preference.**

A relative path without `.mdx` is a **silent bug**: Docusaurus does not
rewrite it at build time, so the raw relative string (e.g. `../configure/foo`)
is preserved in the compiled React module. SSR-rendered HTML is correct
because build-time resolution runs against the file path, but the
browser's click-time resolution runs against `window.location` and
produces a different URL — injecting the current page's parent
directory into the path. The bug cannot be caught by inspecting static
HTML, `curl`, or `git grep`. It only fires on click in a real browser.

See [DOC-1311](https://linear.app/loft/issue/DOC-1311) for the full failure mode.

## Markdown Links

There are two ways of adding a link to another page: through a URL path and a file path.

### Example Links

```markdown
- [URL path to another document](./installation)
- [file path to another document](./installation.mdx)
```

URL paths are unprocessed by Docusaurus, and you can see them as directly rendering to `<a href="./installation">`, i.e. it will be resolved according to the page's URL location, rather than its file-system location.

If you want to reference another Markdown file included by the same plugin, you should use the **relative file path** of the document you want to link to. Docusaurus' Markdown loader will convert the file path to the target file's URL path (and hence remove the `.mdx` extension).

### File Path Examples

For example, if you are in `docs/folder/doc1.md` and you want to reference `docs/folder/doc2.md`, `docs/folder/subfolder/doc3.md` and `docs/otherFolder/doc4.md`:

**docs/folder/doc1.md**:
```markdown
I am referencing a [document](doc2.mdx).

Reference to another [document in a subfolder](subfolder/doc3.mdx).

[Relative document](../otherFolder/doc4.mdx) referencing works as well.
```

### Absolute File Paths

Relative file paths are resolved against the current file's directory. Absolute file paths, on the other hand, are resolved relative to the content root, usually `docs/`, `blog/`, or localized ones like `i18n/zh-Hans/plugin-content-docs/current`.

Absolute file paths can also be relative to the site directory. However, **beware that links that begin with `/docs/` or `/blog/` are not portable** as you would need to manually update them if you create new doc versions or localize them.

```markdown
You can write [links](/otherFolder/doc4.mdx) relative to the content root (`/docs/`).

You can also write [links](/docs/otherFolder/doc4.mdx) relative to the site directory, but it's not recommended.
```

## ❌ Wrong Examples

Both classes below produce broken navigation. The second class (relative
paths without `.mdx`) is the more dangerous one — it renders correct
static HTML but 404s on click.

```markdown
<!-- URL paths — sensitive to trailing slashes, miss file-based resolution -->
[Pod Identity](/vcluster/integrations/pod-identity/eks-pod-identity)
[FIPS Guide](/vcluster/deploy/security/fips)

<!-- Relative paths without .mdx — SILENT 404 on click (SPA navigation) -->
[Backing Store](../../../configure/vcluster-yaml/control-plane/components/backing-store)
[Policies](../../../../configure/vcluster-yaml/policies/)
```

## ✅ Correct Examples (File Paths with .mdx)

These are examples of **correct** link formats that are robust and trailing-slash independent:

```markdown
[Pod Identity](../../../../third-party-integrations/pod-identity/eks-pod-identity.mdx)
[Backing Store](../../../configure/vcluster-yaml/control-plane/components/backing-store/README.mdx)
[FIPS Guide](./fips.mdx)
[Policies](../../../configure/vcluster-yaml/policies/README.mdx)
```

## Benefits of File Paths

Using relative file paths (with `.mdx` extensions) instead of relative URL links provides the following benefits:

1. **GitHub compatibility** - Links will keep working on the GitHub interface and many Markdown editors
2. **Slug flexibility** - You can customize the files' slugs without having to update all the links
3. **Editor tracking** - Moving files around the folders can be tracked by your editor, and some editors may automatically update file links
4. **Version consistency** - A versioned doc will link to another doc of the exact same version
5. **Trailing slash independence** - Relative URL links are very likely to break if you update the trailingSlash config

## Important Warning

**Markdown file references only work when the source and target files are processed by the same plugin instance.** This is a technical limitation of Docusaurus's Markdown processing architecture and will be fixed in the future. If you are linking files between plugins (e.g., linking to a doc page from a blog post), you have to use URL links.

## Debugging Broken Links

When Docusaurus reports a broken link, use this efficient debugging method:

### Error Example:
```
Broken link on source page path = /docs/vcluster/configure/vcluster-yaml/sync/:
   -> linking to ../control-plane/other/advanced/virtual-scheduler
```

### Debug Process:

1. **CD into the directory** matching the error path structure:
   ```bash
   cd vcluster_versioned_docs/version-0.21.0/configure/vcluster-yaml/sync/
   ```

2. **Grep for the referenced file** by name to find where it's being used:
   ```bash
   grep -r "virtual-scheduler" . --include="*.mdx"
   ```

3. **Fix the relative path** in the file that shows up

This approach is **MUCH faster** than trying to calculate relative paths manually!

### Additional Debugging Tips:

1. **Clear all caches first**:
   ```bash
   rm -rf .docusaurus build node_modules/.cache
   ```

2. **Check BOTH locations**:
   - Main docs: `/vcluster/`
   - Versioned docs: `/vcluster_versioned_docs/version-X.X.X/`

3. **Count the `../` levels carefully** - they must match the directory depth from your current file to the target file

4. **Resolution happens at build time ONLY when the link ends in `.mdx` or `.md`.** Without the suffix, Docusaurus skips file-reference resolution entirely, emits the raw relative string into the compiled bundle, and the browser resolves it against `window.location` at click time. Such links do NOT fail the build — they render correct HTML and 404 only when clicked. Never rely on the build to catch missing `.mdx` suffixes.

## SSR vs CSR mismatch (the silent 404 class)

Docusaurus is a React SPA. Every markdown link is rendered twice:

- **At build time (SSR):** the MDX plugin rewrites `[text](../foo.mdx)` to a canonical absolute route like `/docs/vcluster/foo` by resolving against the source file's path on disk. This becomes the `<a href>` in the static HTML.
- **At click time (CSR):** the `<Link>` component's React props carry whatever the MDX plugin rewrote the link to. If the plugin left the raw string alone (because the link had no `.mdx` suffix), the click handler calls `history.pushState` with that raw string resolved against `window.location.pathname` — a completely different base than the build-time file path.

When the resolutions agree (link had `.mdx`), SSR and CSR produce the same URL and everything works. When they disagree (no `.mdx`), the static HTML shows the correct URL (so `curl` lies to you), `git grep` for the broken URL returns nothing (it only exists at runtime), but clicking the link silently 404s.

**How to reproduce / verify:** open the page in Chrome DevTools, monkey-patch `history.pushState` to log its argument, click the link. If the pushed URL differs from the `<a>` element's `href` attribute, you have the bug. Fix by adding `.mdx` (or `README.mdx` for directory targets) to the link.
