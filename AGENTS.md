# vCluster Docs — Agent Instructions

See `CLAUDE.md` for AI-specific guidelines and `CONTRIBUTING.md` for general style.

## Cursor Cloud specific instructions

### Environment overview

This is a Docusaurus 3.8 documentation site. Node 20 is required (see `.nvmrc`).

### Running the dev server

```bash
nvm use 20
npm run start -- --port 3000 --no-open
```

The site serves at `http://localhost:3000/docs/`.

### Lint / validation

- `npm run validate-glossary` — validates glossary term references
- `npm run build` — full production build (catches broken links)

### Key caveats

- The `npm install` step is sufficient for all development work. No Go tooling is needed unless regenerating partials/CLI docs from source.
- If build errors mention stale cache, run `npm run clear` before retrying.
- The dev server uses Rspack for fast rebuilds; first startup takes ~60-90s to compile all docs.
