provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

resource "helm_release" "$RESOURCE_NAME" {
  name             = "$VCLUSTER_NAME"
  namespace        = "$VCLUSTER_NAMESPACE"

  repository       = "https://charts.loft.sh"
  chart            = "vcluster"
  version          = "$VCLUSTER_VERSION"

  # If you didn't create a vcluster.yaml, remove the values section.
  values = [
    file("${path.module}/vcluster.yaml")
  ]
}