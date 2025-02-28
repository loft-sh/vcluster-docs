#!/bin/bash
set -e

echo "Setting up workspace for vcluster-docs development..."

echo "Checking Node.js and npm..."
node --version
npm --version

# TODO:(piotr1215) install vale
echo "Development environment setup complete!"
echo ""
echo "Use 'npm start' to start the development server."
echo ""