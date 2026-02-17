#!/usr/bin/env bash
set -eo pipefail

# Verify that key documentation paths work on the deployed site
# Usage: verify_deployment.sh <base-url>
# Example: verify_deployment.sh https://vcluster-v0-22--vcluster-docs-site.netlify.app

if [[ $# -eq 0 ]]; then
  echo "Usage: verify_deployment.sh <base-url>" >&2
  echo "Example: verify_deployment.sh https://vcluster-v0-22--vcluster-docs-site.netlify.app" >&2
  exit 1
fi

base_url="${1%/}"  # Remove trailing slash if present

echo "Verifying deployment at: $base_url"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
  echo "Error: curl is not installed" >&2
  exit 1
fi

# Function to check a URL
check_url() {
  local url="$1"
  local description="$2"

  echo -n "Checking $description... "

  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [[ "$http_code" == "200" ]]; then
    echo "✅ OK ($http_code)"
    return 0
  else
    echo "❌ FAILED ($http_code)"
    return 1
  fi
}

# Key paths to verify
errors=0

check_url "$base_url/vcluster" "vCluster root" || ((errors++))
check_url "$base_url/docs/vcluster" "vCluster docs" || ((errors++))
check_url "$base_url/platform" "Platform root" || ((errors++))
check_url "$base_url/docs/platform" "Platform docs" || ((errors++))

echo ""

if [[ $errors -eq 0 ]]; then
  echo "✅ All key paths verified successfully!"
  echo ""
  echo "Deployment is accessible at: $base_url"
  exit 0
else
  echo "❌ $errors path(s) failed verification"
  echo ""
  echo "Please check the deployment and build logs."
  exit 1
fi
