#!/bin/bash
set -e

echo "Setting up workspace for vcluster-docs development..."

echo "Checking Node.js and npm..."
node --version
npm --version

# Install Vale linter
echo "Installing Vale linter..."

# Direct download of Vale binary
VALE_VERSION="3.9.6"
VALE_URL="https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz"

# Create a temporary directory for the download
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

# Download and extract Vale
echo "Downloading Vale v${VALE_VERSION}..."
curl -L -o vale.tar.gz $VALE_URL
tar xf vale.tar.gz

# Move vale binary to a location in PATH
echo "Installing Vale binary..."
sudo mv vale /usr/local/bin/
sudo chmod +x /usr/local/bin/vale

# Clean up
cd -
rm -rf $TEMP_DIR

# Verify installation
echo "Vale installed:"
vale --version
echo "Development environment setup complete!"
echo ""
echo "Use 'npm start' to start the development server."
echo ""