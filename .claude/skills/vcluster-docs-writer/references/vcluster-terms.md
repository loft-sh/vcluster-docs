# vCluster Terminology and Naming Conventions

## Company and Product Names

### vCluster Labs
**vCluster Labs** is the company name.

- ✅ DO: "vCluster Labs is the company behind vCluster"
- ❌ DON'T: Use "Loft", "LoftLabs", or "Loft Platform" to refer to vCluster products

### vCluster (The Trademark)

**"vCluster"** is a trademark. There are strict legal frameworks around how to use a trademark.

**Critical Rule**: A trademark **cannot be used in plural form**.

- ✅ DO: "Create multiple clusters"
- ✅ DO: "Deploy vCluster instances"
- ✅ DO: "Use vCluster to create clusters"
- ❌ DON'T: "vClusters" (legally incorrect)
- ❌ DON'T: "Deploy multiple vClusters"

### Clusters

When talking about the **actual clusters that vCluster creates**, use the plain
term **"cluster"** (plural allowed because it's a descriptive term, not a
trademark). Both "virtual cluster" and "tenant cluster" are legacy terms and
should not be used in new or edited prose.

The Tenant primitive claims the word "tenant" for the customer organization, so
the cluster gives the word back. The product already shipped this:
`ui/src/constants/resource-labels.ts` in `loft-sh/loft-enterprise` renders
`vcluster` as "cluster".

- ✅ DO: "Create three clusters"
- ✅ DO: "Each cluster runs in isolation"
- ✅ DO: "List all clusters in the namespace"
- ❌ DON'T: "Create three vClusters"
- ❌ DON'T: "Each vCluster runs in isolation"
- ❌ DON'T: "virtual clusters" or "tenant clusters" (legacy terms, retired)

### Tenants

A **Tenant** is a customer organization, not a cluster. It sits above Projects
and is the boundary a platform admin grants inventory to. Capitalize it only
when naming the API resource, the same way "Project" is capitalized.

The hierarchy, in order:

1. A **system admin** installs Platform onto a Kubernetes cluster, which becomes
   the **control plane cluster**.
2. A **platform admin** creates **Tenants**.
3. A **tenant admin** divides the Tenant boundary across **Projects**.
4. A **project user** creates a **cluster**.

- ✅ DO: "The platform admin creates a Tenant for each customer"
- ✅ DO: "Each tenant admin manages their own projects"
- ❌ DON'T: "tenant" as a shorthand for a cluster
- ❌ DON'T: shorten "tenant cluster" to "tenant" (both terms are retired anyway)

### Isolation is "tenant isolation"

One term, at every layer. The tenant is what is being isolated whether the
boundary is the Tenant primitive in the management plane, the cluster's own
control plane and API, or dedicated nodes underneath. Don't coin "cluster
isolation", and don't convert existing "tenant isolation" prose.

To be precise about *how* separation happens, name the mechanism instead of
reaching for a second category: private nodes, vNode, API-level and namespace
separation, resource proxy ownership labels, per-class sync scoping.

**"Multi-Tenancy" is the licensed feature's name and stays.** It appears on the
Platform License page and in `loft-sh/plans`. Use it only when naming that
feature. As a descriptor, "multi-tenancy" and "multitenancy" are retired.

- ✅ DO: "Multi-Tenancy is available in the Scale plan" (naming the feature)
- ✅ DO: "Tenant isolation keeps one customer's inventory out of another's view"
- ✅ DO: "Private nodes give each tenant dedicated hardware"
- ❌ DON'T: "multi-tenancy" or "multitenancy" as a descriptor in prose
- ❌ DON'T: "cluster isolation" as a coined alternative to tenant isolation

## Products

### vCluster
The open source project that provisions and manages clusters.

- Use when referring to the project or software itself
- Example: "vCluster is an open source tool for creating clusters"

### "vCluster Pro" does not exist

There is no product, tier, or plan called "vCluster Pro". License-gated
features are **Enterprise** features, unlocked through a vCluster Platform
Enterprise plan (Dev, Prod, or Scale), not a separate "Pro" product a
customer buys or deploys.

- ❌ DON'T: "This feature is available in vCluster Pro"
- ❌ DON'T: "Deploy a vCluster Pro instance with advanced security features"
- ❌ DON'T: "This is a Pro feature" (still implies a "Pro" product/tier)
- ✅ DO: "This is an Enterprise feature, available with a vCluster Platform license"
- ✅ DO: "Enable this Enterprise feature by connecting to vCluster Platform"
- The `vcluster-pro` container image, the `loft-sh/vcluster-pro` repository
  name, and the `sidebar_class_name: pro` frontmatter value are unaffected
  code/engineering identifiers — never change those. The `pro` sidebar class
  renders as an "ENTERPRISE" badge (see `src/css/sidebar.scss`); the class
  name is internal, the label a reader sees is "Enterprise".

### vCluster Platform
The management platform and UI for managing clusters and Tenants across one or more control plane clusters.

- Use when referring to the management/control plane software
- Example: "Access the vCluster Platform UI to manage your clusters"
- Example: "Install vCluster Platform in your Kubernetes cluster"

## CLI

The command line interface name is **`vcluster`** (all lowercase).

- ✅ DO: "Run `vcluster create my-cluster`"
- ✅ DO: "Install the `vcluster` CLI"
- ❌ DON'T: "Run `vCluster create`" (incorrect case)

## Kubernetes Distros

Use these abbreviations consistently:

### K3s
[Lightweight Kubernetes](https://k3s.io/)
- ✅ DO: "K3s"
- Note: Capital K, number 3, lowercase s

### K8s
[Kubernetes](https://kubernetes.io/)
- ✅ DO: "K8s"
- Note: Capital K, number 8, lowercase s

### k0s
[Zero Friction Kubernetes](https://k0sproject.io/)
- ✅ DO: "k0s"
- Note: **Lowercase k** (k0s is the only Kubernetes distro to use a lowercase 'k')

### EKS
[AWS Elastic Kubernetes Service](https://aws.amazon.com/eks/)
- ✅ DO: "EKS"
- Note: All caps

## Other Product Terms

Use these product names with correct capitalization:

- **AWS** [EKS](https://aws.amazon.com/eks/)
- **CoreDNS** - [coredns.io](https://coredns.io/)
- **etcd** - [etcd.io](https://etcd.io/) (all lowercase)

## Common Mistakes to Avoid

### ❌ WRONG:
```markdown
Deploy multiple vClusters to your K8S cluster.
Each vCluster can run different workloads.
Use the vCluster CLI to manage your vClusters.
Deploy tenant clusters on the host cluster.
```

### ✅ CORRECT:
```markdown
Deploy multiple clusters to your K8s cluster using vCluster.
Each cluster can run different workloads.
Use the vcluster CLI to manage your clusters.
Deploy clusters on a control plane cluster.
```

## Quick Reference Table

| Term | Correct Usage | Incorrect Usage |
|------|---------------|-----------------|
| vCluster | "Use vCluster to..." | "vClusters", "VCluster" |
| cluster | "Create clusters" | "Create vClusters", "virtual clusters", "tenant clusters" |
| control plane cluster | "Deploy on a control plane cluster" | "host cluster", "Host Cluster" |
| Tenant | "Create a Tenant for each customer" | "tenant" meaning a cluster |
| tenant isolation | "Tenant isolation separates customer organizations" | "cluster isolation" as a coined alternative |
| Multi-Tenancy | "Multi-Tenancy is in the Scale plan" (feature name only) | "multi-tenancy" as a descriptor in prose |
| vCluster Platform | "Install vCluster Platform" | "vCluster platform", "Loft Platform" |
| Enterprise feature | "This Enterprise feature requires a vCluster Platform license" | "vCluster Pro", "Pro feature", "Upgrade to vCluster Pro" (not a product) |
| vcluster (CLI) | "`vcluster create`" | "`vCluster create`" |
| K8s | "Deploy to K8s" | "K8S", "k8s" |
| K3s | "Running on K3s" | "k3s", "K3S" |
| k0s | "Using k0s" | "K0s", "K0S" |
| etcd | "Backed by etcd" | "ETCD", "Etcd" |

## Usage Examples in Context

### Documentation Title
✅ "Deploy vCluster on AWS EKS"
❌ "Deploy vClusters on AWS EKS"

### Feature Description
✅ "vCluster allows you to create multiple clusters on a control plane cluster"
❌ "vCluster allows you to create multiple vClusters within a single host cluster"
❌ "vCluster allows you to create multiple tenant clusters within a single host cluster"

### CLI Reference
✅ "The `vcluster` CLI provides commands to create and manage clusters"
❌ "The `vCluster` CLI provides commands to create and manage vClusters"

### Product Comparison
✅ "This Enterprise feature offers enhanced security for clusters, available with a vCluster Platform license"
❌ "vCluster Pro offers enhanced security features for vClusters"
❌ "This Pro feature offers enhanced security for clusters"
