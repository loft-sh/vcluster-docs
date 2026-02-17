# vCluster Documentation Release Skill

Automates vCluster documentation releases with version updates, configuration changes, and SEO setup.

## Quick Start

**For AI:**
```
User: "Prepare docs for vCluster 0.30 release"
Assistant: *loads vcluster-docs-releaser skill*
```

**For Users:**
```bash
# 1. Create versioned docs
npm run docusaurus docs:version:vcluster 0.30.0

# 2. AI handles config updates (automatic)

# 3. Run verification
./scripts/verify-release.sh 0.30.0

# 4. Build and test
npm run build
```

## Files

```
vcluster-docs-releaser/
├── skill.md                              # Main skill documentation
├── README.md                             # This file
├── scripts/
│   └── verify-release.sh                 # Verification script
└── references/
    ├── release-checklist.md              # Complete checklist
    └── version-changes-pattern.md        # Before/after examples
```

## Usage

### AI Triggers
- "vCluster release"
- "prepare vCluster docs"
- "new vCluster version"
- Linear issue: "docs updates for vCluster vX.Y release"

### Workflow
1. **User:** Create versioned docs (`npm run docusaurus docs:version:vcluster X.Y.Z`)
2. **AI:** Update configurations (docusaurus.config.js, netlify.toml, hurl tests)
3. **User:** Manual tasks (support dates, compatibility matrix, enterprise tags)
4. **User:** Build and test (`npm run build`, hurl tests)

## Division of Labor

| Task | Responsible | Checklist Item |
|------|-------------|----------------|
| Create versioned docs | User | 1 |
| Update banner | AI | 2 |
| Update netlify redirect | AI | 3 |
| Verify CLI docs | AI | 4 |
| Create hurl test | AI | 5 |
| Review enterprise tags | User | 6 |
| Partials PR | User | 7 |
| Support dates | User | 8 |
| Compatibility matrix | User | 9 |

## Key Files Modified

- `docusaurus.config.js` - 7 locations (label, SEO, versions, banner)
- `netlify.toml` - 1 location (redirect)
- `hack/test-vcluster-X.Y.hurl` - New file

## Verification

```bash
# Quick check
./scripts/verify-release.sh 0.30.0

# Manual checks
ls vcluster_versioned_docs/version-0.30.0/
cat vcluster_versions.json
git diff docusaurus.config.js netlify.toml
```

## Testing

```bash
# Build (user runs)
npm run build

# Hurl tests (after PR deployed)
hurl --test --variable BASE_URL=https://deploy-preview-XXXX--vcluster-docs-site.netlify.app \
  hack/test-vcluster-0.30.hurl
```

## Related Skills

- **vcluster-docs-archiver** - Archive EOL versions to dedicated branches
- **platform-docs-releaser** (future) - Platform release process

## Notes

- This skill is for **vCluster only** (Platform has separate process)
- User runs build - AI does not run npm commands
- Hurl tests run after PR is deployed to Netlify
- Keep 5-6 versions in `onlyIncludeVersions` for performance
- Always remove "Stable" label from previous version when adding new one

## Example Session

```
User: Prepare docs for vCluster 0.30 release

AI: I'll help you prepare the vCluster 0.30.0 release.

First, have you created the versioned docs?
Run: npm run docusaurus docs:version:vcluster 0.30.0

User: Done

AI: *updates docusaurus.config.js (7 locations)*
    *updates netlify.toml*
    *creates hack/test-vcluster-0.30.hurl*
    *verifies CLI docs exist*

✅ Configuration complete!

Your tasks:
- Review enterprise/pro tags
- Update support dates
- Update compatibility matrix
- Run: npm run build
- Run hurl tests (after PR deployed)

Ready to commit!
```

## Version History

- **2025-10-28**: Initial skill created based on 0.30.0 release
- Captures real workflow from ENG-9160 Linear issue
- Includes next→main merge process (for future use)
