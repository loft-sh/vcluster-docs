provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

resource "helm_release" "my_vcluster" {
  name             = "my-vcluster"
  namespace        = "my-vcluster"
  create_namespace = true

  repository       = "https://charts.loft.sh"
  chart            = "vcluster"

  values = [
    file("${path.module}/vcluster.yaml")
  ]
}
