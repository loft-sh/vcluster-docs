#!/bin/bash

# Set up environment variables
export AWS_REGION="eu-central-1"  # Replace with your actual AWS region if different
export CLUSTER_NAME="pod-identity-1"  # Replace with your actual EKS cluster name if different
export NODE_INSTANCE_TYPE="t3.medium"  # Replace with your actual instance type if different
export SERVICE_ACCOUNT_NAME="demo-sa"  # Replace with your actual service account name if different
export SERVICE_ACCOUNT_NAMESPACE="default"  # Replace with your actual namespace if different
export VCLUSTER_NAME="my-vcluster"  # Replace with your actual vCluster name if different
export HOST=https://your.loft.host  # Replace with your actual host
export AUTH_TOKEN=abcd1234  # Replace with your actual auth token
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export SA_ROLE_NAME="AmazonEKSTFEBSCSIRole-${CLUSTER_NAME}"

# Define the function to get the KSA name using curl
get_ksa_name() {
  local vcluster_ksa_name=$1
  local vcluster_ksa_namespace=$2
  local vcluster_name=$3
  local host=$4
  local auth_token=$5

  local resource_path="/kubernetes/management/apis/management.loft.sh/v1/translatevclusterresourcenames"
  local host_with_scheme=$([[ $host =~ ^(http|https):// ]] && echo "$host" || echo "https://$host")
  local sanitized_host="${host_with_scheme%/}"
  local full_url="${sanitized_host}${resource_path}"

  local response=$(curl -s -k -X POST "$full_url" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${auth_token}" \
    -d @- <<EOF
{
  "spec": {
    "name": "${vcluster_ksa_name}",
    "namespace": "${vcluster_ksa_namespace}",
    "vclusterName": "${vcluster_name}"
  }
}
EOF
  )

  local status_name=$(echo "$response" | jq -r '.status.name')
  if [[ -z "$status_name" || "$status_name" == "null" ]]; then
    echo "Error: Unable to fetch KSA name from response: $response"
    exit 1
  fi
  echo "$status_name"
}

# Get the KSA name
KSA_NAME=$(get_ksa_name "$SERVICE_ACCOUNT_NAME" "$SERVICE_ACCOUNT_NAMESPACE" "$VCLUSTER_NAME" "$HOST" "$AUTH_TOKEN")

# Create EKS cluster using eksctl
eksctl create cluster \
  --name ${CLUSTER_NAME} \
  --region ${AWS_REGION} \
  --node-type ${NODE_INSTANCE_TYPE}

# Associate IAM OIDC provider with the EKS cluster
eksctl utils associate-iam-oidc-provider --region=${AWS_REGION} --cluster=${CLUSTER_NAME} --approve

# Create IAM role for the EBS CSI driver and associate policy
eksctl create iamserviceaccount \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster ${CLUSTER_NAME} \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --approve \
  --role-only \
  --role-name ${SA_ROLE_NAME} \
  --region ${AWS_REGION}

# Install the AWS EBS CSI driver as an EKS managed add-on
eksctl create addon \
  --name aws-ebs-csi-driver \
  --cluster ${CLUSTER_NAME} \
  --service-account-role-arn arn:aws:iam::${AWS_ACCOUNT_ID}:role/${SA_ROLE_NAME} \
  --region ${AWS_REGION} \
  --force

# Deploy EKS Pod Identity Webhook
aws eks create-addon --region ${AWS_REGION} --cluster-name ${CLUSTER_NAME} --addon-name eks-pod-identity-agent --addon-version v1.0.0-eksbuild.1

# Wait for EKS Pod Identity Webhook to be up and running
sleep 60

kubectl get pods -n kube-system | grep 'eks-pod-identity-webhook'

# Create vcluster.yaml content dynamically
cat <<EOF > vcluster.yaml
sync:
  toHost:
    serviceAccounts:
      enabled: true
EOF

# Deploy vcluster using vcluster-cli
vcluster create ${VCLUSTER_NAME} --namespace ${VCLUSTER_NAME} -f vcluster.yaml

# Connect to the vCluster
vcluster connect ${VCLUSTER_NAME}

# Create example-workload.yaml content dynamically
cat <<EOF > example-workload.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: demo-sa
  namespace: default
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: s3-list-buckets
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: s3-list-buckets
  template:
    metadata:
      labels:
        app: s3-list-buckets
    spec:
      serviceAccountName: demo-sa
      containers:
      - image: public.ecr.aws/aws-cli/aws-cli
        command:
          - "aws"
          - "s3"
          - "ls"
        name: aws-pod
EOF

cat >my-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::*"
        }
    ]
}
EOF

aws iam create-policy --policy-name my-policy --policy-document file://my-policy.json

cat >trust-relationship.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowEksAuthToAssumeRoleForPodIdentity",
            "Effect": "Allow",
            "Principal": {
                "Service": "pods.eks.amazonaws.com"
            },
            "Action": [
                "sts:AssumeRole",
                "sts:TagSession"
            ]
        }
    ]
}
EOF

aws iam create-role --role-name my-role --assume-role-policy-document file://trust-relationship.json --description "my-role-description"

aws iam attach-role-policy --role-name my-role --policy-arn=arn:aws:iam::${AWS_ACCOUNT_ID}:policy/my-policy

aws eks create-pod-identity-association --cluster-name ${CLUSTER_NAME} --role-arn arn:aws:iam::${AWS_ACCOUNT_ID}:role/my-role --namespace ${VCLUSTER_NAME} --service-account ${KSA_NAME}

kubectl logs -l app=s3-list-buckets -n default
