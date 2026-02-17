# Link Formatting Guidelines

## Core Principle

**Always use relative file paths with `.mdx` extensions, NOT URL paths.**

URL paths are sensitive to trailing slashes and can break easily. File paths are robust and work consistently across different Docusaurus configurations.

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

## ❌ Wrong Examples (URL Paths)

These are examples of **incorrect** link formats that are sensitive to trailing slashes:

```markdown
[Pod Identity](/vcluster/integrations/pod-identity/eks-pod-identity)
[Backing Store](../../../configure/vcluster-yaml/control-plane/components/backing-store)
[FIPS Guide](/vcluster/deploy/security/fips)
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

4. **Remember**: Links are resolved at build time, not runtime - broken links will fail the build
