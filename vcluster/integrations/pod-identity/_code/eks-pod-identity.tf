provider "aws" {
  region = var.aws_region
}

provider "http" {
    alias = "default"
}

provider "helm" {
  kubernetes {
    config_path = "${path.module}/kubeconfig_${var.cluster_name}"
  }
}


# Filter out local zones, which are not currently supported
# with managed node groups
data "aws_availability_zones" "available" {
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

locals {
  cluster_name = var.cluster_name
}

resource "random_string" "suffix" {
  length  = 8
  special = false
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.8.1"

  name = "education-vpc"

  cidr = "10.0.0.0/16"
  azs  = slice(data.aws_availability_zones.available.names, 0, 3)

  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.8.5"

  cluster_name    = local.cluster_name
  cluster_version = "1.29"

  cluster_endpoint_public_access           = true
  enable_cluster_creator_admin_permissions = true

  cluster_addons = {
    aws-ebs-csi-driver = {
      service_account_role_arn = module.irsa-ebs-csi.iam_role_arn
    }

    eks-pod-identity-agent = {}
  }

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_group_defaults = {
    ami_type = "AL2_x86_64"

  }

  eks_managed_node_groups = {
    one = {
      name = "node-group-1"

      instance_types = ["t3.small"]

      min_size     = 1
      max_size     = 3
      desired_size = 2
    }

    two = {
      name = "node-group-2"

      instance_types = ["t3.small"]

      min_size     = 1
      max_size     = 2
      desired_size = 1
    }
  }
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["pods.eks.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole",
      "sts:TagSession"
    ]
  }
}

resource "aws_iam_role" "example" {
  name               = "eks-pod-identity-example"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "example_s3" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
  role       = aws_iam_role.example.name
}


# https://aws.amazon.com/blogs/containers/amazon-ebs-csi-driver-is-now-generally-available-in-amazon-eks-add-ons/
data "aws_iam_policy" "ebs_csi_policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

module "irsa-ebs-csi" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "5.39.0"

  create_role                   = true
  role_name                     = "AmazonEKSTFEBSCSIRole-${module.eks.cluster_name}"
  provider_url                  = module.eks.oidc_provider
  role_policy_arns              = [data.aws_iam_policy.ebs_csi_policy.arn]
  oidc_fully_qualified_subjects = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
}

resource "null_resource" "update_kubeconfig" {
  provisioner "local-exec" {
    command = <<EOT
eksctl utils write-kubeconfig --cluster=${module.eks.cluster_name} --region=${var.aws_region} --kubeconfig=${path.module}/kubeconfig_${module.eks.cluster_name}
EOT
  }
  depends_on = [ module.eks ]
}

module "synced_service_account_name" {
  source        = "github.com/loft-sh/vcluster-terraform-modules//single-namespace-rename"

  providers = {
    http.default = http.default
  }


  host                 = "https://localhost:8080"
  auth_token          = var.auth_token
  resource_name       = var.service_account_name
  resource_namespace  = var.service_account_namespace
  vcluster_name       = var.vcluster_name
}

resource "helm_release" "my_vcluster" {
  name             = var.vcluster_name
  namespace        = var.vcluster_name
  create_namespace = true

  repository       = "https://charts.loft.sh"
  chart            = "vcluster"
  version          = "0.20.0-beta.6"

  values = [
    file("${path.module}/vcluster.yaml")
  ]

  depends_on = [ null_resource.update_kubeconfig ]
}

resource "null_resource" "apply_example_workload" {
  provisioner "local-exec" {
    command = "vcluster connect ${var.vcluster_name} -n ${var.vcluster_name} -- kubectl apply -f ${path.module}/example-workload.yaml"
    environment = {
      "KUBECONFIG" = "${path.module}/kubeconfig_${module.eks.cluster_name}"
    }
  }

  depends_on = [ helm_release.my_vcluster ]
}

resource "aws_eks_pod_identity_association" "example" {
  cluster_name    = module.eks.cluster_name
  namespace       = var.vcluster_name
  service_account = module.synced_service_account_name.name
  role_arn        = aws_iam_role.example.arn

  depends_on = [ null_resource.apply_example_workload ]
}
