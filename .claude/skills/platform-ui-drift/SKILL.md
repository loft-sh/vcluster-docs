---
name: platform-ui-drift
description: Audit and fix drift between Platform docs UI tokens and the loft-enterprise UI source. Use when running the drift report, interpreting its output, verifying findings against loft-enterprise, or fixing stale nav paths, labels, and informal prose in platform docs.
context: fork
---

# Platform UI Drift

The `report-platform-ui-drift` script compares UI tokens in platform docs (text wrapped in `<Button>`, `<Label>`, `<NavStep>`, `<Input>`, `<Field>`) against the loft-enterprise UI source. It also flags informal prose that should use proper doc components.

Run it before a release, when a support engineer reports drift, or when reviewing a batch of platform doc files.

## Run the report

```bash
npm run report-platform-ui-drift
# or with JSON output for scripting:
node scripts/report-platform-ui-drift.js --json
```

Requires `loft-enterprise` checked out as a sibling of this repo at `../loft-enterprise`.

## Interpret the output

### Unmatched tokens section

Tokens in `<Button>`, `<Label>`, `<NavStep>`, `<Input>` that the script did not find in the loft-enterprise UI source. These are **leads, not proof** — some are genuine drift, some are script limitations.

**High-confidence drift signals:**

- `<Button>` text not found — buttons rename frequently (e.g. "Create Space Template" → "Create Namespace Template")
- `<Label>` text not found — field labels rename when forms are redesigned
- Single-segment `<NavStep>` not found (e.g. `<NavStep>Allowed Templates</NavStep>`) — tab or section name changed
- `<Input>` placeholder text not found — placeholder copy changes silently

**Lower-confidence (verify before fixing):**

- Multi-part `<NavStep>` paths like `Infrastructure > Control Plane Clusters` — the script checks each segment separately; a match means each word exists *somewhere* in 1779 UI files, not necessarily as a nav label. Spot-check in `loft-enterprise/ui/src/Layout/Sidebar/config/sections.tsx` and the relevant page layout file.

**Common false negatives (real drift the script misses):**

- `Admin > Config` — matched because "admin" and "config" appear elsewhere in code, but the real nav path is `Platform > Platform Config`. Always verify `Admin > *` paths manually.

### Instruction phrases section

Prose that uses informal UI terminology outside of a doc component. These are always real leads — the UI check adds no signal here, so every occurrence is worth reviewing.

| Phrase found | What to do |
|---|---|
| `left menu` / `left sidebar` | Remove — the nav component conveys location implicitly |
| `drop down arrow` / `drop down menu` / `dropdown menu` | Replace the whole step with `Click <Button>X</Button>` |
| `drawer` | Replace with "configuration sheet" |
| `configuration pane` | Replace with "tab" (e.g. "click the `<Label>Agent</Label>` tab") |
| `textarea` | Replace with "field" |
| `checkbox` | Replace with "enable `<Label>X</Label>`" |

## Verify a finding against loft-enterprise

Before fixing, confirm what the UI actually says. The UI source is at `../loft-enterprise/ui/src`.

### Nav paths

```bash
# Section labels and item names
cat ../loft-enterprise/ui/src/Layout/Sidebar/config/sections.tsx

# Sub-nav tabs for a given view (e.g. clusters)
cat ../loft-enterprise/ui/src/views/Clusters/hooks/useClusterTabs.tsx
```

**Current sidebar structure (as of 2026-06):**

| Section label | Key items |
|---|---|
| Infrastructure | Infra Providers, Control Plane Clusters, Connectors, Bare Metal Servers |
| Tenant Management | Cluster Templates, Namespace Templates, Argo CD Templates, Apps |
| Access & Secrets | Users & Roles, SSH Keys, Global Secrets |
| Platform | Logs & Activity, Cost Control, Platform Config |

Control Plane Clusters sub-tabs: Host Clusters, Cluster Access, Cluster Roles, VPN.

### Button and label text

```bash
# Text in JSX children (most reliable)
grep -r "Button text or label" ../loft-enterprise/ui/src --include="*.tsx" | grep -v "spec\|test\|//"

# Text in JSX props (label=, title=, placeholder=, submitLabel=)
grep -r 'label="Button text"' ../loft-enterprise/ui/src --include="*.tsx" | grep -v "spec\|test"
```

The script now extracts both — but grepping directly is faster for spot-checking.

### Cluster/form sheet tabs

```bash
# Cluster edit sheet tabs
grep -n "label" ../loft-enterprise/ui/src/views/Clusters/ClusterDrawer/ClusterDrawer.tsx
# Current tabs: Agent, Direct Access, Argo CD, Management Access

# Project form section titles
grep -rn "title=" ../loft-enterprise/ui/src/views/Projects/ProjectForm/Sections --include="*.tsx"
# Current: Members and Roles, Control Plane Clusters, Template Options, Quotas, Advanced, Argo CD Integration
```

### Role sheet sections

```bash
grep -n "title=" ../loft-enterprise/ui/src/views/Roles/RoleForm/RoleForm.tsx
# Sections: Rules (tabs: RBAC Rules, Aggregation Rule), Management Access
```

## Fix patterns

### Navigation steps

Replace the old `<NavStep>` path with the current one. Always use `Infrastructure > Control Plane Clusters` for the clusters section.

```mdx
<!-- Before -->
Go to the <NavStep>Clusters</NavStep> view using the menu on the left.

<!-- After -->
Go to <NavStep>Infrastructure > Control Plane Clusters</NavStep>.
```

Remove trailing "using the menu on the left" — the `<NavStep>` component conveys location.

### Cluster actions menu (Edit)

The cluster list has a per-row actions menu (gear icon). Reference the action text directly:

```mdx
<!-- Before -->
Click the drop down arrow next to the cluster name you wish to modify. In
the drop down menu click the <Label>Edit</Label> button.

<!-- After -->
Click the <Button>Edit</Button> option for the cluster you want to modify.
```

### Configuration sheet (formerly "drawer")

```mdx
<!-- Before -->
In the drawer that appears from the right, click on the <Label>Agent</Label>
configuration pane.

<!-- After -->
In the configuration sheet that opens, click the <Label>Agent</Label> tab.
```

### Section names in forms

| Old | Current |
|---|---|
| `Access` (cluster role form) | `Management Access` |
| `Allowed Templates` (project) | `Template Options` |
| `Allowed Clusters` (project) | `Control Plane Clusters` |
| `Configure Project Quotas` | `Quotas` |
| `Cluster Role` tab | `Cluster Roles` |

### Argo CD

The UI uses a space: "Argo CD" not "ArgoCD". The script normalizes this so it matches, but fix prose spelling when you touch the file.

## After fixing: Vale

Run Vale on every file you touch and fix all warnings — not just the drift-related lines.

```bash
vale platform/path/to/file.mdx
```

Common warnings triggered by drift fixes:
- `click on` → `click`
- Headings ending in `-ing` (Finding, Setting, Troubleshooting) → use imperative (Find, Set, Troubleshoot)
- Title-case headings → sentence case
- `via` → `using`

## Files with known drift clusters

These files contain multiple unmatched tokens or instruction phrases and are good candidates for a batch fix pass:

- `administer/clusters/advanced/ingress-suffix.mdx` — same nav/drawer/dropdown pattern as agent-config
- `configure/agent-settings/agent-upgrade.mdx` — same pattern
- `configure/agent-settings/customization.mdx` — same pattern
- `administer/clusters/cluster-roles.mdx` — fixed 2026-06-26
- `administer/clusters/advanced/agent-config.mdx` — fixed 2026-06-26
- `administer/projects/` — Allowed Templates / Allowed Clusters / Configure Project Quotas all stale
- `administer/templates/` — "left menu" throughout, dropdown references
- All files with `left sidebar` in `integrations/argocd/` — two occurrences

## Release checklist use

Run the report as part of platform release prep:

1. `npm run report-platform-ui-drift > .user/ui-drift-$(date +%Y%m%d).txt`
2. Review unmatched tokens — focus on `<Button>` and single-segment `<NavStep>` first
3. Spot-check two or three Label findings against loft-enterprise source
4. Fix confirmed drift files; treat instruction phrases as a separate writing-quality pass
5. Re-run report to confirm unmatched count dropped
