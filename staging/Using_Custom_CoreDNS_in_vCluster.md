### **Overview**

Customizing CoreDNS enables tailored DNS management for specific requirements, such as handling custom zones, forwarding DNS queries, and integrating with external DNS providers.

This article explains how to configure and use the custom CoreDNS setup in a vCluster.

---

### **Steps to Configure Custom CoreDNS in vCluster**

#### **1. Define CoreDNS Configuration in vCluster Values**

Create or modify the `vcluster.yaml` file to include a custom CoreDNS configuration using the `overwriteManifests` field. Below is an example configuration:

```
controlPlane:
  backingStore:
    etcd:
      deploy:
        enabled: true
  coredns:
    overwriteManifests: |-
      apiVersion: v1
      kind: ConfigMap
      metadata:
        name: coredns
        namespace: kube-system
      data:
        Corefile: |-
          .:1053 {
              errors
              health
              ready
              rewrite name regex .*\.nodes\.vcluster\.com kubernetes.default.svc.cluster.local
              kubernetes cluster.local in-addr.arpa ip6.arpa {
                  pods insecure
                  fallthrough in-addr.arpa ip6.arpa
              }
              hosts /etc/NodeHosts {
                  ttl 60
                  reload 15s
                  fallthrough
              }
              prometheus :9153
              forward . /etc/resolv.conf
              file /etc/coredns/dg.db dg.in
              cache 30
              loop
              loadbalance
          }
          import /etc/coredns/custom/*.server
        NodeHosts: ""
        dg.db: |
          dg.in. IN SOA ns3.dg.in cto.dg.in  20132601 10800 900 1209600 86400
          ; dg.in file
          *.dg.in.  IN  A 10.211.9.11
          *.dg.in.  IN  A 10.211.9.12
          *.dg.in.  IN  A 10.211.9.13
          *.dg.in.  IN  A 10.211.9.14
          *.dg.in.  IN  A 10.211.9.15
          *.dg.in.  IN  A 10.211.9.16
```

#### **2. Deploy the vCluster**

Deploy the vCluster with the custom CoreDNS configuration using Helm:

```
helm install corednsissue loft/vcluster --version 0.20.0 -f vcluster.yaml
```

#### **3. Upgrade the vCluster to Add or Modify CoreDNS Entries**

To update the CoreDNS configuration, such as adding new zones, extend the `vcluster.yaml` configuration:

Apply the changes using Helm:

---

### **Validation**

#### **1. Verify ConfigMap Changes**

To ensure the CoreDNS ConfigMap reflects your custom configuration:

```
kubectl get cm coredns -n kube-system -o yaml
```

#### **2. Confirm CoreDNS Pod Status**

Check that CoreDNS pods are running and using the updated configuration:

```
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

#### **3. Test DNS Resolution**

Use a test pod to validate that DNS resolution works for your custom zones:

```
kubectl run dns-test --image=busybox --restart=Never --rm -it -- nslookup myapp.da.in
```

---

```
helm upgrade corednsissue loft/vcluster --version 0.20.0 -f vcluster.yaml
```

```
        da.db: |
          dada.in. IN SOA ns3.dada.in cto.da.in  20132601 10800 900 1209600 86400
          ; da.in file
          *.da.in.  IN  A 10.311.9.11
          *.da.in.  IN  A 10.311.9.12
          *.da.in.  IN  A 10.311.9.13
          *.da.in.  IN  A 10.311.9.14
          *.da.in.  IN  A 10.311.9.15
          *.da.in.  IN  A 10.311.9.16
```
