# Quickstart Guide Test Plan — Standalone + Private Nodes

Testing the Standalone and Private Nodes quickstart guides using local Ubuntu VMs via Multipass on macOS Silicon.

Goal: verify every copy-paste command works end-to-end on the two guides that haven't yet been tested.

---

## Setup: Install Multipass

```bash
brew install multipass
```

Verify:

```bash
multipass version
```

---

## Create VMs

You need two VMs: one for the Standalone control plane, one to join as a private worker node.

```bash
# Control plane VM — needs more RAM for Kubernetes + Platform
multipass launch 24.04 --name cp --cpus 2 --memory 4G --disk 20G

# Worker node VM
multipass launch 24.04 --name worker --cpus 2 --memory 2G --disk 20G
```

Check both are running:

```bash
multipass list
```

Get the IP addresses — you'll need these later:

```bash
multipass info cp
multipass info worker
```

Note the IPv4 addresses for both. The VMs share a bridge network and can reach each other directly.

---

## Part 1: Standalone Guide

Follow the [Standalone quick start](vcluster/quick-start/standalone.mdx).

### 1.1 Install vCluster CLI (on your Mac)

```bash
brew install loft-sh/tap/vcluster
vcluster version
```

### 1.2 Shell into the control plane VM

```bash
multipass shell cp
```

Run all Standalone install steps from inside this shell.

### 1.3 Install vCluster Standalone

Follow the guide steps exactly. When setting `VCLUSTER_VERSION`, check the [latest release](https://github.com/loft-sh/vcluster/releases) and use that.

**Watch for:**
- Does the installer complete without errors?
- How long does it take?
- Does `kubectl get nodes` show the node as Ready?

**Record:** exact output of `kubectl get nodes` after install.

### 1.4 Access the cluster from your Mac

The guide says to copy `/var/lib/vcluster/kubeconfig.yaml` from the VM and update the `server:` field.

Get the kubeconfig from the VM:

```bash
multipass exec cp -- cat /var/lib/vcluster/kubeconfig.yaml
```

Copy the output to `~/.kube/config` on your Mac. Replace the `server:` value with the control plane VM's IP:

```yaml
server: https://<CP_VM_IP>:6443
```

Verify access from your Mac:

```bash
kubectl get nodes
```

**Watch for:** Does this work without certificate errors? If you get a TLS error, try adding `--insecure-skip-tls-verify` to diagnose.

**Record:** whether remote access works and any TLS issues.

### 1.5 Install vCluster Platform

From your Mac (with the kubeconfig pointing at the Standalone cluster):

```bash
vcluster platform start
```

**Watch for:**
- Does it install without errors?
- Does the UI URL appear in the output?
- Does the browser open automatically?

**Record:** exact login output block.

### 1.6 Notes

- The guide uses a public IP assumption for the `server:` field. For Multipass, the VM's local bridge IP works fine. Note whether the guide needs a callout for this.

---

## Part 2: Private Nodes Guide

Follow the [Private Nodes quick start](vcluster/quick-start/private-nodes.mdx).

Prerequisites from Part 1: Standalone running, Platform installed, kubeconfig pointing at the Standalone cluster from your Mac.

### 2.1 Create the tenant cluster

Follow the guide steps to create `vcluster.yaml` and run `vcluster create`.

**Watch for:**
- Does the LoadBalancer service type work on Standalone? If not, note what service type to use instead.
- Does the CLI connect automatically after create?
- Does `kubectl get nodes` show no resources (expected)?

**Record:** exact output of `kubectl get nodes` after create.

### 2.2 Generate a join token

```bash
vcluster token create --expires=1h
```

**Record:** exact output format. Does it print the full `curl` command ready to run?

### 2.3 Join the worker node

Copy the `curl` command from the token output. Shell into the worker VM:

```bash
multipass shell worker
sudo su -
# paste the curl command here
```

**Watch for:**
- Does the script install without errors?
- How long does it take?
- Does the output end with "This node has joined the cluster"?

**Record:** full terminal output of the join script.

### 2.4 Verify node joined

Back on your Mac:

```bash
kubectl get nodes
```

**Expected:** worker node shows as Ready.

**Record:** exact output including node name format. Does the name match the VM hostname?

### 2.5 Deploy a workload and check isolation

Follow the guide steps for deploying a workload and checking the isolation boundary.

**Watch for:**
- Does the pod schedule onto the worker node?
- After `vcluster disconnect`, is the worker node visible from the Control Plane Cluster with `kubectl get nodes`? (It should not be.)

**Record:** output of `kubectl get nodes` from both inside and outside the tenant cluster.

### 2.6 Clean up

```bash
vcluster delete my-vcluster --namespace team-x
```

Then stop the VMs:

```bash
multipass stop cp worker
# Or delete them entirely:
multipass delete cp worker && multipass purge
```

---

## Notes to Capture

For each step above, record:

1. **Timing:** How long did each major operation take?
2. **Exact CLI output:** Copy terminal output for any step where the guide shows expected output.
3. **Divergences:** Anything the actual output doesn't match what the guide says.
4. **Failures:** Full error message if a command fails.
5. **Multipass-specific issues:** Anything that only applies because we're using local VMs instead of real bare metal.
