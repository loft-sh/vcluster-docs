#!/usr/bin/env bash
set -eo pipefail

go run hack/redirect-resolver/main.go -mode detect

if [ -f "hack/path-changes.json" ] && [ "$(jq '.changes | length' hack/path-changes.json)" -gt 0 ]; then
    go run hack/redirect-resolver/main.go -mode update
fi

rm -f hack/path-changes.json