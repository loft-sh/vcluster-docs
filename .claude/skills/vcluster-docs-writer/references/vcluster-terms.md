# vCluster Terminology and Naming Conventions

## Company and Product Names

### vCluster Labs
**vCluster Labs** is the company name.

- ✅ DO: "vCluster Labs is the company behind vCluster"
- ❌ DON'T: Use "Loft", "LoftLabs", or "Loft Platform" to refer to vCluster products

### vCluster (The Trademark)

**"vCluster"** is a trademark. There are strict legal frameworks around how to use a trademark.

**Critical Rule**: A trademark **cannot be used in plural form**.

- ✅ DO: "Create multiple virtual clusters"
- ✅ DO: "Deploy vCluster instances"
- ✅ DO: "Use vCluster to create virtual clusters"
- ❌ DON'T: "vClusters" (legally incorrect)
- ❌ DON'T: "Deploy multiple vClusters"

### Tenant Clusters

When talking about the **actual clusters that vCluster creates**, use the term **"tenant clusters"** (plural allowed because it's a descriptive term, not a trademark). "Virtual clusters" is the legacy term and should not be used in new or edited prose.

- ✅ DO: "Create three tenant clusters"
- ✅ DO: "Each tenant cluster runs in isolation"
- ✅ DO: "List all tenant clusters in the namespace"
- ❌ DON'T: "Create three vClusters"
- ❌ DON'T: "Each vCluster runs in isolation"
- ❌ DON'T: "virtual clusters" (legacy term, retired)

## Products

### vCluster
The open source project that provisions and manages tenant clusters.

- Use when referring to the project or software itself
- Example: "vCluster is an open source tool for creating tenant clusters"

### vCluster Pro
A single enhanced/paid/upgraded tenant cluster that uses Pro functionality (as labeled "Pro" in the docs).

- Use when referring to paid/commercial features
- Example: "This feature is available in vCluster Pro"
- Example: "Deploy a vCluster Pro instance with advanced security features"

### vCluster Platform
The management platform and UI for managing tenant clusters across one or more Control Plane Clusters.

- Use when referring to the management/control plane software
- Example: "Access the vCluster Platform UI to manage your tenant clusters"
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
Deploy virtual clusters on the host cluster.
```

### ✅ CORRECT:
```markdown
Deploy multiple tenant clusters to your K8s cluster using vCluster.
Each tenant cluster can run different workloads.
Use the vcluster CLI to manage your tenant clusters.
Deploy tenant clusters on a Control Plane Cluster.
```

## Quick Reference Table

| Term | Correct Usage | Incorrect Usage |
|------|---------------|-----------------|
| vCluster | "Use vCluster to..." | "vClusters", "VCluster" |
| tenant clusters | "Create tenant clusters" | "Create vClusters", "virtual clusters" |
| Control Plane Cluster | "Deploy on a Control Plane Cluster" | "host cluster", "Host Cluster" |
| vCluster Pro | "Upgrade to vCluster Pro" | "vCluster pro", "vcluster Pro" |
| vCluster Platform | "Install vCluster Platform" | "vCluster platform", "Loft Platform" |
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
✅ "vCluster allows you to create multiple tenant clusters on a Control Plane Cluster"
❌ "vCluster allows you to create multiple vClusters within a single host cluster"
❌ "vCluster allows you to create multiple virtual clusters within a single host cluster"

### CLI Reference
✅ "The `vcluster` CLI provides commands to create and manage tenant clusters"
❌ "The `vCluster` CLI provides commands to create and manage vClusters"

### Product Comparison
✅ "vCluster Pro offers enhanced security features for tenant clusters"
❌ "vCluster pro offers enhanced security features for vClusters"
