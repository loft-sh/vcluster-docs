# Mintlify evaluation: supplementary documentation tool

Issue: [DOC-1256](https://linear.app/loft/issue/DOC-1256)
Date: 2026-03-06
Status: Evaluation complete

## TL;DR

Mintlify excels at AI-native features (search, llms.txt, MCP server, auto-updating agent) and OpenAPI playground generation. However, its manual versioning model is a dealbreaker for the version-heavy OSS docs (7 vCluster versions + 3 Platform versions). Recommendation: pilot for Platform API reference only, where versioning demands are low and OpenAPI integration adds clear value. Do not migrate existing docs.

---

## Current infrastructure summary

| Dimension | Current (Docusaurus) |
|-----------|---------------------|
| Versions managed | 7 vCluster + 3 Platform = 10 version trees |
| Custom components | 26 React components |
| Partials | 138 vCluster + 194 Platform = 332 reusable content chunks |
| CI workflows | 18 GitHub Actions (linting, testing, sync, lifecycle) |
| Custom plugins | remark-version-tokens, glossary automation, lifecycle JSON generation |
| Search | Algolia |
| API reference | Redocusaurus (107KB OpenAPI spec) |
| Hosting | Netlify |

## Mintlify capabilities vs requirements

### Versioning (dealbreaker for full migration)

Mintlify uses manual JSON configuration per version. Each version duplicates navigation blocks in `docs.json`. No auto-versioning from Git tags or branches.

- Docusaurus: `docusaurus docs:version X.Y` snapshots the entire docs folder automatically
- Mintlify: Create version folders manually, duplicate navigation JSON, wire up each version

With 10 active version trees, the Mintlify approach creates unmanageable config duplication. All official Mintlify examples show 2-3 versions. A GitHub issue (#402) requests multi-version navigation groups, confirming this is a known pain point.

Verdict: Blocker for OSS docs. Acceptable for a new standalone section with 1-2 versions.

### OpenAPI / API playground (strong fit)

Mintlify auto-generates interactive API pages from OpenAPI specs with:
- Code snippets in 18+ languages
- Live request execution with authentication
- Multi-server environment support
- Custom endpoint overrides via `x-mint` extension

Current setup uses Redocusaurus, which renders a static Redoc page. Mintlify's playground is a meaningful upgrade for the Platform API reference.

Verdict: Clear win. The Platform API reference is the strongest pilot candidate.

### AI features (significant upside)

| Feature | Mintlify | Current |
|---------|----------|---------|
| Search | AI-powered (Claude Sonnet 4.5 + Trieve RAG) with conversational answers | Algolia keyword search |
| llms.txt | Auto-generated, zero maintenance | None |
| MCP server | Auto-generated at `/mcp` endpoint | Manual (vcluster-yaml MCP, Algolia MCP) |
| Doc update suggestions | Mintlify Agent monitors PRs, proposes doc updates | Claude PR reviews (manual trigger) |
| Analytics | Page feedback, AI traffic tracking, search gap analysis | None built-in |

The AI search alone is a substantial upgrade. Algolia requires manual crawler configuration and returns keyword matches. Mintlify returns synthesized answers with citations.

Verdict: Strong value-add, especially for developer experience.

### Custom component equivalents

| Current component | Mintlify equivalent | Gap |
|-------------------|--------------------|----|
| InterpolatedCodeBlock | No equivalent | Would need custom snippet or be dropped |
| PageVariables | No equivalent | Would need custom snippet |
| GlossaryTerm | Tooltip component exists | Partial match (no YAML-driven glossary system) |
| FeatureTable | No equivalent | Would need static tables |
| Flow (diagrams) | Mermaid support built-in | Covered |
| Steps/Tabs | Built-in Steps, Tabs | Covered |
| Accordion/Expander | Built-in Accordion | Covered |
| ProLabel | Badge component | Partial match |

For a pilot limited to API reference, most custom components are irrelevant since API docs don't use InterpolatedCodeBlock or FeatureTable.

### Custom tooling (cannot migrate)

None of the following can run in Mintlify's managed build pipeline:
- Vale linting with custom Loft style rules
- Glossary term wrapping/validation
- Lifecycle JSON generation from MDX partials
- Feature table sync with upstream repos
- Version token replacement (remark plugin)
- Cross-browser E2E tests via BrowserStack

Verdict: Custom tooling stays in Docusaurus. A Mintlify pilot section would operate independently.

### Pricing

| Tier | Cost | Notes |
|------|------|-------|
| Hobby (Free) | $0 | No AI assistant, 1 editor, no preview deploys |
| Pro | $300/mo | 5 editors, 250 AI msgs/mo, Mintlify Agent |
| Enterprise | $600+/mo | SSO, RBAC, SLA, migration services |

Pro tier is the minimum viable option. AI overage at $0.15/msg adds $30-100+/mo for active usage. Realistic cost: $400-500/mo.

### Risks

1. Vendor lock-in: Cloud-only SaaS, no self-hosting. Content is MDX (portable), but navigation config and AI features are not.
2. Security track record: November 2025 incidents (XSS, path traversal, SSR code execution). All patched quickly, post-mortem published, but revealed systemic design gaps.
3. GitHub permissions: Mintlify GitHub App requests access to all org repositories, not per-repo scoping.
4. Cost unpredictability: AI message quotas create variable monthly costs.

---

## Pilot recommendation

### Candidate: Platform API reference

Why this section:
- OpenAPI spec already exists (107KB, `schemas/config-openapi.json`)
- Current Redocusaurus rendering is static — Mintlify playground is a clear upgrade
- API reference has minimal versioning needs (1 active version)
- No custom components needed (no InterpolatedCodeBlock, FeatureTable, etc.)
- Self-contained section that can link back to main Docusaurus docs

What the pilot tests:
- OpenAPI auto-generation quality with our spec
- AI search effectiveness for API documentation
- Developer experience with the API playground
- Analytics value (are developers finding what they need?)
- llms.txt and MCP server usefulness for AI coding tools

### Migration effort estimate

| Task | Effort |
|------|--------|
| Convert OpenAPI spec from Swagger 2.0 to OpenAPI 3.x | 4-8 hours |
| Set up Mintlify project with docs.json | 2-4 hours |
| Configure API playground authentication | 2-4 hours |
| Migrate narrative API docs (if any) to Mintlify MDX | 4-8 hours |
| Cross-linking between Mintlify API ref and Docusaurus main docs | 2-4 hours |
| Testing and QA | 4-8 hours |
| Total | 18-36 hours |

### What NOT to pilot

- vCluster OSS docs (7 versions, heavy custom components, partials system)
- Platform configuration docs (deep integration with partials, InterpolatedCodeBlock)
- Getting started guides (better served by existing Docusaurus setup with version-aware content)

---

## Decision matrix

| Option | Pros | Cons |
|--------|------|------|
| Pilot API ref on Mintlify | Interactive playground, AI search, analytics, llms.txt for API | $300+/mo, two doc platforms to maintain, vendor lock-in |
| Defer | No cost, no complexity | Miss AI search improvements, static API ref |
| Decline | Focus on Docusaurus improvements | Lose Mintlify's AI features entirely |

## Recommendation

Proceed with pilot for Platform API reference section only, at Pro tier ($300/mo). Evaluate for 3 months against these success metrics:
- API playground usage (sessions, requests made)
- AI assistant query volume and satisfaction
- Developer feedback on API discoverability
- llms.txt/MCP adoption by AI coding tools

If the pilot succeeds, consider expanding to a standalone "Getting Started" microsite. Do not migrate existing versioned docs — the versioning gap is too large.
