## vCluster platform fails to mark vCluster status as ready due to TSNet connection failures

### **Issue Summary**

Some users may encounter an issue where a vCluster appears to be **running** but vcluster is not marked as ready in vCluster platform UI. The root cause is typically related to TSNet being **unable to establish a stable connection** with the vCluster platform. This blocks communication from  vcluster on connected cluster to Cluster platform.

---

### **Symptoms**

The vCluster is listed as `Running` in the remote host cluster.

You are able to connect to the vCluster via `vcluster connect`.

However, the vcluster status is not marked as ready in platform UI.

The vCluster logs contain a TSNet error similar to:

```

ERROR ts-net-controller tsnet/tsnet.go:148 Check if TSNet is online {
 "component": "vcluster",
 "failCounter": 5,
 "error": "vcluster tsnet server is not online: ...
 Tailscale could not connect to any relay server. ...
 The last login error was: register request: Post \"https://vcluster-test.io/coordinator/machine/register\":
 connection attempts aborted by context: context deadline exceeded"
}
```

---

### **Root Cause**

The error stems from a **TSNet connectivity failure** within the vCluster control plane. Specifically, TSNet fails to reach the coordination server (`https://<your-loft-host>/coordinator/...`) due to:

**Restricted egress** in the host cluster (e.g., GKE, EKS).

**Ingress controllers** (e.g., Istio) blocking or interfering with WebSocket upgrades.

**TSNet attempting a direct connection**, which fails in these environments.

---

### **Default Behavior in vCluster**

If the environment variable `TS_DEBUG_DIAL_DIRECT` is **not explicitly set**, the vCluster defaults to enabling **direct connection mode.**

This means that unless users **override the variable**, the vCluster will attempt direct connections, which are not always compatible with cloud environments or custom ingress controllers.

---

### **Resolution**

Override the default behavior by explicitly setting:

```
controlPlane:
  statefulSet:
    env:
    - name: "TS_DEBUG_DIAL_DIRECT"
      value: "false"
```

This instructs TSNet to **disable direct peer-to-peer connections** and instead use vcluster platform agent on connected cluster for communication.
