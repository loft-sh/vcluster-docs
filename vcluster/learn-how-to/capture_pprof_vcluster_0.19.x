---
title: Steps to capture Pprof (CPU & Memory profiling) for vCluster 0.19.x
---

Capturing pprof is essential for identifying performance bottlenecks and optimizing resource usage, ultimately enhancing application performance. pprof, or Performance Profiling in Go, plays a crucial role in this process.

In vCluster, users occasionally encounter performance challenges due to high CPU and memory usage. In such cases, pinpointing potential bottlenecks and optimizing performance is key to ensuring smooth application operation.

## Steps to setup & capture pprof on vCluster version 0.19.x

### 1) Enable verbose logging & pprof endpoint
To make the logging more verbose & to enable the endpoint that will serve pprof data, add the following environment variable in the Helm chart values:

```yaml
syncer:
  env:
    - name: DEBUG
      value: "true"
```

> **Note:** You need to be on the kube-context of the host cluster where the vCluster is running. If you're not using the templates from the UI, you can execute the following commands from your local command prompt (as shown below).
>
> If a template is not used, the values should be added directly to `.spec.template.helmRelease.values` in the `VirtualClusterInstance`.

### 2) Port-forward to the vCluster pod
In the first terminal from local, execute:
![Image Description](image11.png)

```sh
kubectl port-forward -n vclusternamespace pod/vclustername-0 10443:8443
```

This command allows accessing services running inside the virtual cluster (vCluster) from your local machine without exposing them publicly through the host Kubernetes cluster’s services or ingress.

### 3) Capture CPU profile
In the second terminal from local, execute:
![Image Description](image12.png)

```sh
curl -k "https://localhost:10443/debug/pprof/profile?second=60" > profile60.prof
```

This command fetches a CPU profile of the vCluster pod's processes (such as the virtual Kubernetes API server) for the past 60 seconds. You should see a `profile60.prof` file created on your local system.

### 4) Capture memory profile
In the second terminal from local, execute:

![Image Description](image13.png)
```sh
curl -k https://localhost:10443/debug/pprof/heap -o heapprofile.prof
```

This command fetches a heap profile from the vCluster pod by sending a request to the `/debug/pprof/heap` endpoint. You should see a `heapprofile.prof` file created on your local system.

## Next Steps

Once you've captured these files, feel free to send them to us. This will enable us to identify opportunities for optimization and enhance the performance of your application.
