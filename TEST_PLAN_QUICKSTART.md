# Quickstart Guide Test Plan

Testing the two complete quickstart guides on macOS Silicon (fresh system).
Goal: verify every copy-paste command works, confirm expected output, and catch anything wrong before writing private-nodes and AI cloud guides.

---

## Part 0: Setup

Everything from scratch.

### 0.1 Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. At the end, run the two `eval` commands it prints to add Homebrew to your PATH.

Verify:
```bash
brew --version
```

---

### 0.2 Install Docker Desktop

Download from https://www.docker.com/products/docker-desktop/ — get the Apple Silicon (ARM) version.

Install, launch, and complete the onboarding. You do NOT need to sign in.

Verify Docker is running:
```bash
docker --version
docker info
```

> **Note:** If `docker info` shows a permissions error, make sure Docker Desktop is running (check the menu bar icon).

---

### 0.3 Enable Kubernetes in Docker Desktop

Docker Desktop includes a single-node Kubernetes cluster you can enable. This will be the Control Plane Cluster for the shared nodes test.

1. Open Docker Desktop → Settings → Kubernetes
2. Check "Enable Kubernetes"
3. Click "Apply & Restart"
4. Wait for the green Kubernetes indicator in the Docker Desktop status bar

Verify:
```bash
kubectl get nodes
```

Expected output:
```
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   ...   v1.x.x
```

> **Note:** kubectl is bundled with Docker Desktop and added to your PATH automatically.

---

### 0.4 Install vCluster CLI

```bash
brew install loft-sh/tap/vcluster
```

Verify:
```bash
vcluster version
```

Expected: prints a version string like `vCluster version 0.x.x`.

---

## Part 1: Shared Nodes Guide

Using Docker Desktop's Kubernetes cluster as the Control Plane Cluster.

**Goal:** Confirm the guide works end-to-end and the isolation demo is correct.

---

### 1.1 Deploy the tenant cluster

Confirm you're on the Docker Desktop context:
```bash
kubectl config current-context
# Expected: docker-desktop
```

Deploy the tenant cluster:
```bash
vcluster create my-vcluster --namespace team-x
```

**Watch for:**
- Any error during deploy
- The CLI should print progress and then automatically connect (switches kube context to the tenant cluster)
- How long does it take? (target: under 60 seconds)

Verify you're inside the tenant cluster:
```bash
kubectl get namespaces
```

**Expected:** Standard K8s system namespaces (`default`, `kube-system`, `kube-public`, `kube-node-lease`). You should NOT see `team-x` here — that's on the Control Plane Cluster.

**Record:** exact output of `kubectl get namespaces`.

---

### 1.2 The isolation demo

Deploy a test workload:
```bash
kubectl create deployment nginx --image=nginx
kubectl get pods
```

**Expected:** nginx pod shows `Running` status. Wait a moment if it shows `ContainerCreating`.

**Record:** exact output of `kubectl get pods`.

Now disconnect and check the host:
```bash
vcluster disconnect
```

**Watch for:** Does the context switch back to `docker-desktop`? Run:
```bash
kubectl config current-context
# Expected: docker-desktop
```

Check the namespace on the Control Plane Cluster:
```bash
kubectl get pods -n team-x
```

**Expected:** Only the vCluster control plane pod visible (something like `my-vcluster-0`). The nginx pod should NOT be here.

**Record:** exact output of `kubectl get pods -n team-x`.

> **What we're checking:** The guide says "The nginx pod you deployed is not here. Only the vCluster control plane pod is visible." Confirm this is accurate. Also check if there's a second namespace (the hidden synced namespace) visible anywhere.

---

### 1.3 Platform step (optional for now)

Skip the `vcluster platform add vcluster` step for today — this requires a Platform instance. Note whether you have access to one or if this needs to be tested separately.

---

### 1.4 Cleanup

```bash
vcluster delete my-vcluster --namespace team-x
```

**Watch for:** Does it delete the namespace too? Run:
```bash
kubectl get namespace team-x
# Expected: Error from server (NotFound)
```

**Record:** whether namespace is auto-deleted or persists.

---

## Part 2: Docker (vind) Guide

**Goal:** Confirm all four Wow moments work as described.

---

### 2.1 Set Docker driver and deploy

```bash
vcluster use driver docker
```

**Record:** any output or confirmation message.

Deploy with sudo (required on macOS for LoadBalancer):
```bash
sudo vcluster create my-vcluster
```

> **Note:** You'll need to enter your password. The guide says `sudo` is required on macOS for LoadBalancer support.

**Watch for:**
- Any errors during deploy
- Time to deploy (target: under 60 seconds)
- Does it auto-connect and switch context?

Verify nodes:
```bash
kubectl get nodes
```

**Record:** exact node output. How many nodes? What role/name?

---

### 2.2 Pause and resume

```bash
vcluster pause my-vcluster
```

**Record:** any output.

Check status:
```bash
vcluster list
```

**Record:** exact output. Does it show "Paused"? What are the exact column headers and values? The guide shows:
```
NAME          NAMESPACE   STATUS   AGE
my-vcluster               Paused   5m
```
Confirm whether the NAMESPACE column is blank for Docker clusters or shows something else.

Resume:
```bash
vcluster resume my-vcluster
```

**Record:** any output. How long does it take to come back up?

Reconnect:
```bash
vcluster connect my-vcluster
```

Verify you're back inside:
```bash
kubectl get nodes
```

---

### 2.3 LoadBalancer services

```bash
kubectl create deployment hello --image=nginx
kubectl expose deployment hello --port=80 --type=LoadBalancer
```

Watch for the EXTERNAL-IP to appear:
```bash
kubectl get service hello --watch
```

**Record:**
- How long does it take to get an EXTERNAL-IP?
- What IP does it show? (Guide says `127.0.0.1`)
- Does `--watch` work cleanly here or does it hang?

Press Ctrl+C to exit the watch, then:
```bash
curl http://localhost
```

**Expected:** nginx welcome page HTML.

**Record:** does this work? Any port issues?

> **If curl fails:** try `curl http://127.0.0.1` or check `kubectl get service hello` for the exact external IP and port.

---

### 2.4 Virtual worker nodes

Disconnect from the current cluster first:
```bash
vcluster disconnect
```

Create a `vcluster.yaml` with virtual worker nodes:
```bash
cat > vcluster.yaml << 'EOF'
experimental:
  docker:
    nodes:
      - name: worker-1
      - name: worker-2
EOF
```

Deploy a new cluster with this config:
```bash
sudo vcluster create my-cluster --values vcluster.yaml
```

Check nodes:
```bash
kubectl get nodes
```

**Expected:** control-plane node + worker-1 + worker-2.

**Record:** exact output. Do they show as `Ready`? Are the names exactly `worker-1` and `worker-2` or does vind add a prefix?

> **Key question:** Do the worker nodes show up immediately or is there a delay?

---

### 2.5 Check Docker containers

```bash
docker ps --filter name=my-cluster
```

**Record:** container names and how many are running. This helps us document the "what just happened" section accurately.

---

### 2.6 Cleanup

```bash
vcluster delete my-cluster
vcluster delete my-vcluster
```

Verify Docker containers are cleaned up:
```bash
docker ps
```

---

## Part 3: Notes to Capture

For each test above, record:

1. **Timing:** How long did each deploy take?
2. **Exact CLI output:** Copy the actual terminal output for any step where the guide shows expected output — we need to match reality.
3. **Divergences:** Anything the actual output doesn't match what the guide says.
4. **Failures:** If a command fails, capture the full error message.
5. **macOS-specific friction:** Any step that was harder than expected on macOS/Docker Desktop.

### Known uncertainties (things most likely to be wrong)

| Item | Guide says | Check |
|---|---|---|
| `vcluster list` Paused output | Shows `Paused` in STATUS column with blank NAMESPACE | Verify exact columns |
| LoadBalancer EXTERNAL-IP | `127.0.0.1` | Confirm the IP and whether curl works |
| Worker node naming | `worker-1`, `worker-2` | May have a cluster prefix |
| Auto-context switch after `vcluster pause`/`resume` | Not documented | Does pause kick you out of the context? |
| `vcluster disconnect` after Docker cluster | Unclear which context it falls back to | Check what `kubectl config current-context` shows |

---

## What to do with the results

After testing, share the divergences and we'll update the guides before adding private-nodes and AI cloud guides. Specifically:

- Fix any command syntax that's wrong
- Update expected output blocks to match reality
- Note anything that requires a prerequisite we didn't account for
- Flag any step that's too slow or too confusing for a quickstart audience
