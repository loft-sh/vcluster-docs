#!/usr/bin/env bash

set -e
set -o pipefail

OUTDIR=gen/partials
SCHEMA_PATH=schema.json

if [ ! -z $1 ]; then
    SCHEMA_PATH=$1
fi

if [ ! -z $2 ]; then
    OUTDIR=$2
fi

if [ ! -z $DEBUG ]; then
   DEBUG_FLAG="--debug"
   echo "Debug mode enabled"
fi

rm -rf $OUTDIR || true
mkdir -p $OUTDIR

# generate partials
go run hack/partials/main.go --schema-path $SCHEMA_PATH --out-dir $OUTDIR $DEBUG_FLAG

