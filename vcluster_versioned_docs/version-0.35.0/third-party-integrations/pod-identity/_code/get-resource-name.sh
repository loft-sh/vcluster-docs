#!/bin/bash

get_resource_name() {
  # Description:
  # This function retrieves the name of a Kubernetes resource synced back from a vCluster instance to the hosting cluster
  # by making an HTTP request to the vCluster Platform API.
  #
  # Arguments:
  #   resource_name:        The name of the Kubernetes resource created in virtual cluster.
  #   resource_namespace:   The namespace of the Kubernetes resource created in virtual cluster.
  #   vcluster_name:        The name of the virtual cluster.
  #   host:                 The host URL of the vCluster Platform.
  #   auth_token:           The authentication token for accessing the vCluster Platform API.
  #
  # Returns:
  #   The name that this Kubernetes resource would have after syncing it back to hosting cluster.

  local resource_name=$1
  local resource_namespace=$2
  local vcluster_name=$3
  local host=$4
  local auth_token=$5

  local resource_path="/kubernetes/management/apis/management.loft.sh/v1/translatevclusterresourcenames"
  local host_with_scheme
  host_with_scheme=$([[ $host =~ ^(http|https):// ]] && echo "$host" || echo "https://$host")
  local sanitized_host
  sanitized_host="${host_with_scheme%/}"
  local full_url
  full_url="${sanitized_host}${resource_path}"

  local response
  response=$(curl -s -k -X POST "$full_url" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${auth_token}" \
    -d @- <<EOF
{
  "spec": {
    "name": "${resource_name}",
    "namespace": "${resource_namespace}",
    "vclusterName": "${vcluster_name}"
  }
}
EOF
  )

  local status_name
  status_name=$(echo "$response" | jq -r '.status.name')
  if [[ -z "$status_name" || "$status_name" == "null" ]]; then
    echo "Error: Unable to fetch resource name from response: $response"
    exit 1
  fi
  echo "$status_name"
}
