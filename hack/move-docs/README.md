# Docs move tooling

Scripts for moving or renaming pages in the unversioned docs trees
(`platform/`, `vcluster/`, and `docs/`). They came out of the Platform 5.0 and
vCluster 0.38 restructure. Run them from anywhere in the repo, because each
one changes to the repo root first. They need Python 3 and no extra packages.

## Move pages

| Script | What it does |
| --- | --- |
| `move_docs.py` | Moves files or folders with `git mv` and rewrites the unversioned links and imports that point at them, including `@site/` imports. Writes the matching redirects to a file and warns when an existing rule would match an old URL first. Doesn't edit versioned docs or `netlify.toml`. |
| `insert_redirects.py` | Inserts the redirect block that `move_docs.py` wrote above the `AUTO-GENERATED REDIRECTS START` marker in `netlify.toml`, and retargets existing rules whose `to` points at a moved URL. |

```bash
SECTION=vcluster REDIRECTS_OUT=/tmp/redirects.toml \
  python3 hack/move-docs/move_docs.py vcluster/old-folder=vcluster/new-folder
python3 hack/move-docs/insert_redirects.py /tmp/redirects.toml "DOC-1234: move old-folder to new-folder"
```

`SECTION` defaults to `platform`. Set it to `platform`, `vcluster`, or `docs`,
whichever tree the moved paths are in. Pass several `OLD=NEW` pairs to move
them in one run. The script checks every pair before it moves anything, and
stops if a path is outside `SECTION`, a destination already exists, or a
moved file would change its extension.

Root docs moves (`SECTION=docs`) use the root docs URL layout. Links and
redirects point at `/docs/<route>`, with no `/next/` and no stable copy.

Review these in the output and the diff before you commit:

- **Cross-section links go to `/next/`.** A link from another tree to a moved
  page is rewritten as `/docs/SECTION/next/<new route>`, even if it pointed at
  the stable docs. On `main`, that sends readers of released docs to
  unreleased ones. Revert the rewrite where the stable URL still works.
- **vCluster moves also get stable redirects.** With `SECTION=vcluster`, the
  redirect file includes `/docs/vcluster/<old>` to `/docs/vcluster/<new>`.
  Netlify skips a redirect while a page exists at its source, so the rule
  stays dormant until the release removes the old page. Platform moves get
  only `/next/` redirects.
- **`VERSIONED IMPORT` lines.** Versioned docs sometimes import unversioned
  content with `@site/...`. The script lists each one that imports a moved
  file but doesn't change it, so that version's build breaks until you fix
  it. Keep the old file, or update the import by hand with approval.

## Check links and redirects

| Script | What it does |
| --- | --- |
| `check_rel.py` | Lists relative links and imports that don't resolve to a file. A few are known and pre-existing, so compare the count before and after a move. |
| `audit_redirects.py` | Audits `netlify.toml` for malformed, duplicate, shadowed, self-pointing, chained, and dead rules, plus dormant rules whose source page still exists. Reads the stable versions from `lastVersion` in `docusaurus.config.js`. |

```bash
python3 hack/move-docs/check_rel.py platform vcluster docs
python3 hack/move-docs/audit_redirects.py
```

## What the scripts don't catch

Check these by hand after every move:

- JSX props such as `to="/old/path"` on `LinkCard`, `VersionAwareDocLink`, or
  `Link`. Root docs pages often use `<Link to="/old-route">`, which is relative
  to the site's `/docs/` base URL.
- `docs_url` in `src/data/features.yaml` and `src/data/products.yaml`. Run
  `npm run sync-feature-tables` after changing one.
- `/docs/platform-ui-link/...` redirects. Point them straight at the new page,
  since a chain that starts at a UI link fails `check-redirects`.
- Site-root links in versioned docs, such as `](/vcluster/<path>.mdx)`.
- Paths named in `hack/` generators, `tests/specs/`, `.claude/skills/`, and
  page-scoped sections of `.vale.ini`.
- Existing redirects with a trailing slash in `to`, which aren't retargeted.

Then run the repo checks and a full build:

```bash
npm run check-redirects
npm run validate-mdx-links
npm run validate-reusable-imports
npm run validate-feature-tables
npm run build
```
