#!/bin/bash

# Set up environment variables
export GSA_NAME=my-gke-sa
export VCLUSTER_KSA_NAME=demo-sa  # Replace with your actual resource name
export VCLUSTER_KSA_NAMESPACE=default  # Replace with your actual resource namespace
export GCP_PROJECT_ID=my-project-424114
export VCLUSTER_NAME=my-vcluster
export HOST=https://my.loft.host  # Replace with your actual host
export AUTH_TOKEN=...

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

# Connect to the vCluster
vcluster connect ${VCLUSTER_NAME}

# Apply the Kubernetes deployment
kubectl apply -f gcs-list-buckets-deployment.yaml

# Get the KSA name
KSA_NAME=$(get_ksa_name "$VCLUSTER_KSA_NAME" "$VCLUSTER_KSA_NAMESPACE" "$VCLUSTER_NAME" "$HOST" "$AUTH_TOKEN")

# Create a new GCP Service Account
gcloud iam service-accounts create ${GSA_NAME} \
  --display-name "Workload Identity experiment SA"

# Bind IAM policy for Workload Identity User
gcloud iam service-accounts add-iam-policy-binding ${GSA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com \
  --member "serviceAccount:${GCP_PROJECT_ID}.svc.id.goog[${VCLUSTER_NAME}/${KSA_NAME}]" \
  --role "roles/iam.workloadIdentityUser"

# Bind IAM policy for Storage Object Viewer
gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member "serviceAccount:${GSA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role "roles/storage.objectViewer"

# Add IAM policy binding to the GCP project
gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member "serviceAccount:${GSA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role "roles/editor"

# Annotate the Kubernetes Service Account
kubectl annotate serviceaccount \
  --namespace ${VCLUSTER_KSA_NAMESPACE} \
  ${VCLUSTER_KSA_NAME} \
  iam.gke.io/gcp-service-account=${GSA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com
