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

**Known expected unmatched tokens (ignore these):**

Some tokens will never match because their text is generated at runtime or the feature has no dedicated UI component files in the source:

| Token | File | Reason |
|---|---|---|
| `<Label>Argo CD Template ID</Label>` | `integrations/argocd/deploy-applications.mdx` | Label built from `entityTypeName` prop in `ArgoCDApplicationTemplates.tsx` — not a literal string |
| `<Label>Argo CD Application ID</Label>` | `integrations/argocd/deploy-applications.mdx` | Same — built from `entityTypeName` in `ArgoCDApplicationConfigForm.tsx` |
| `<Button>Create Namespace Constraints</Button>` | `_partials/space-constraints/create-ui.mdx`, `use-platform/namespaces/_partials/space-constraints/create-ui.mdx` | Feature exists (breadcrumb in `breadcumbsTransforms.ts`) but has no dedicated UI component files in source |
| `<Label>Enforce Namespace Constraints</Label>` | `use-platform/namespaces/_partials/space-constraints/enforce-ui.mdx` | Same — no component file to grep |
| `<Label>Fleet Observability: Cluster Collector</Label>` | `maintenance/observability/configure-edge-collectors.mdx` | Argo CD Application Template name, rendered from `ManagementV1ArgoCDApplicationTemplate` resources in `ArgoCDApplicationTemplateSelect.tsx` — not a literal string |
| `<Label>Fleet Observability: Prometheus</Label>` | `maintenance/observability/install-observability-gateway.mdx` | Same — template name from the same dynamic select |
| `<Label>Fleet Observability: Grafana</Label>` | `maintenance/observability/query-fleet-metrics.mdx` | Same |
| `<Label>NVSentinel</Label>` | `maintenance/observability/nvsentinel-gpu-observability.mdx` | Same |
| `<Label>destinationNamespace</Label>` | `maintenance/observability/configure-edge-collectors.mdx`, `maintenance/observability/install-observability-gateway.mdx` | Argo CD Application Template parameter name, rendered from `selectedTemplate.spec.parameters` in `TemplateParametersSection.tsx` — not a literal string |
| `<Label>platformHost</Label>` | `maintenance/observability/query-fleet-metrics.mdx` | Same — template parameter name |

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

**Current sidebar structure (as of 2026-08-13):**

| Section label | Key items |
|---|---|
| Infrastructure | Nodes & Providers, Control Plane Clusters, Connectors, Bare Metal Servers, KubeVirt, Operating System, VPN |
| Management | Templates, Apps |
| Access & Secrets | Users & Roles, Global Secrets |
| Platform | Fleet Observability, Logs & Activity, Cost Control, Platform Config |

Control Plane Clusters sub-tabs: Host Clusters, Cluster Access, Cluster Roles, VPN.

The `Tenant Management` section was renamed `Management` and consolidated: the
old `Cluster Templates`/`Namespace Templates`/`Argo CD Templates` nav items no
longer exist as separate entries. Instead:

- `Templates` (`ui/src/views/Templates/TemplatesPageLayout.tsx`) has two tabs:
  `Tenant Clusters` and `Namespaces`.
- `Apps` (`ui/src/views/Templates/AppsPageLayout.tsx`) has two tabs: `ArgoCD Apps`
  (literally no space, unlike the "Argo CD" prose spelling elsewhere) and
  `Helm Apps`.

Both layouts hide the tab bar entirely when only one of the two sibling
features is enabled (`tabs: visibleTabs.length > 1 ? visibleTabs : undefined`)
and redirect straight to the single remaining page instead — no tab bar
renders, so there's nothing to click. Never write a bare "click the X tab"
for these two pages; see "Conditionally hidden tabs" under Fix patterns below.

So `Go to <NavStep>Tenant Management > Cluster Templates</NavStep>` becomes
`Go to <NavStep>Management > Templates</NavStep> and click the
<Label>Tenant Clusters</Label> tab`, and similarly for Namespaces and
Argo CD Templates/Apps. This is a **common false negative**: the script
matched `Tenant Management > *` paths for years because "tenant" and
"management" each exist elsewhere in the UI source, not because the section
still exists. Multi-part `NavStep` matches are leads, not proof — see above.

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

The UI generally uses a space: "Argo CD" not "ArgoCD". The script normalizes this so it matches, but fix prose spelling when you touch the file.

Exception: the `Apps` page tab is literally labeled `ArgoCD Apps` (no space) in
`AppsPageLayout.tsx`. When a `<Label>` or `<NavStep>` represents that exact tab
text, keep it as `ArgoCD Apps` — changing it to `Argo CD Apps` would itself be
drift, since it wouldn't match what the tab says on screen.

### Conditionally hidden tabs (Templates/Apps)

`TemplatesPageLayout.tsx` and `AppsPageLayout.tsx` only render a tab bar when
both sibling features are enabled; with just one enabled, the page redirects
straight there and no tab exists to click. Any instruction that tells a user
to click `Tenant Clusters`/`Namespaces` (Templates) or `ArgoCD Apps`/`Helm Apps`
(Apps) needs the click to be conditional:

```mdx
<!-- Before -->
Go to <NavStep>Management > Templates</NavStep> and click the
<Label>Tenant Clusters</Label> tab.

<!-- After -->
Go to <NavStep>Management > Templates</NavStep> and, if shown, click the
<Label>Tenant Clusters</Label> tab.
```

For a step that references both tabs of a page in one sentence (for example
a shared "find your template" step spanning Templates and Apps), use "If a
tab bar is shown, click the tab for..." instead of stapling "if shown" onto
each label individually.

Check for this same collapse-to-redirect pattern on any other page layout
gated by two mutually exclusive feature flags — look for a `.length > 1 ? ... : undefined`
guard on the `tabs:` prop before writing a bare tab-click instruction.

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

## Drift baseline (as of 2026-08-13)

After the Management/Templates/Apps sidebar restructuring sweep, the report stands at 10 unmatched tokens (all in the "known expected" table above) and 0 instruction phrases. Any new findings above this baseline represent genuine drift introduced since that date.

This sweep found a real restructuring the script's multi-part `NavStep` matching had masked for some time: `Tenant Management` was renamed `Management`, and the `Cluster Templates`/`Namespace Templates`/`Argo CD Templates` nav items were merged into two items (`Templates` with `Tenant Clusters`/`Namespaces` tabs, and `Apps` with `ArgoCD Apps`/`Helm Apps` tabs). Fixed across `_partials/namespace-template/create-ui.mdx`, `administer/templates/create-templates.mdx`, `administer/templates/versioning.mdx`, `integrations/argocd/deploy-applications.mdx`, `use-platform/apps/use-in-templates.mdx`, and `use-platform/apps/use-parameters.mdx`. Also fixed along the way: a stale `<Button>Add App</Button>` (now `Create App Template`), a stale bold `**Add Namespace Template**` (now the `<Button>` component with the correct `Create Namespace Template` text), and a stale `<Label>Recommended App</Label>` (the UI label is `Recommend App`, no "-ed").

A PR review on the same sweep caught a further issue the drift script can't detect at all: the `Templates`/`Apps` tab-click steps assumed the tab bar always renders, but it collapses away when only one sibling feature is enabled (see "Conditionally hidden tabs" under Fix patterns). Reworded all 8 affected steps across the same six files to make the click conditional.

Previously (2026-07-28, after the fleet observability sweep): 10 unmatched tokens, 0 instruction phrases. Previously (2026-06-26, after the DOC-1574 sweep): 4 unmatched tokens, 0 instruction phrases. The six fleet observability tokens added since then are all Argo CD Application Template names/parameters (dynamic content, not literal UI strings) — see the known-expected table. One genuine drift item from that sweep, a stale `<Label>Deploy to vCluster</Label>` in `configure-edge-collectors.mdx` that should have read `Deploy to tenant cluster`, was found and fixed rather than added to the known-expected list.

## Release checklist use

Run the report as part of platform release prep:

1. `npm run report-platform-ui-drift > .user/ui-drift-$(date +%Y%m%d).txt`
2. Review unmatched tokens — focus on `<Button>` and single-segment `<NavStep>` first
3. Spot-check two or three Label findings against loft-enterprise source
4. Fix confirmed drift files; treat instruction phrases as a separate writing-quality pass
5. Re-run report to confirm unmatched count dropped
