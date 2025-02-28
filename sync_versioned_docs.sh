#!/bin/bash
# sync_versioned_docs.sh
# This script copies updated files from the 'vcluster' folder
# to the 'vcluster_versioned_docs/version-0.23.0' folder.

SRC="vcluster"
DEST="vcluster_versioned_docs/version-0.23.0"

# Check if source folder exists
if [ ! -d "$SRC" ]; then
  echo "Error: Source folder '$SRC' does not exist."
  exit 1
fi

# Create the destination folder if it doesn't exist
if [ ! -d "$DEST" ]; then
  echo "Destination folder '$DEST' does not exist. Creating it..."
  mkdir -p "$DEST"
fi

# Use rsync to copy only changed files
rsync -av --update "$SRC"/ "$DEST"/

echo "Changes have been synced from '$SRC' to '$DEST'."
