#!/bin/bash

# This script removes all .ts files from the project source code
# It excludes node_modules, .tsx.bak files, and files in the shared directory

echo "Removing all .ts files from the project source code..."

# Find and remove all .ts files in the client/src directory
find ./client/src -name "*.ts" ! -name "*.tsx.bak" | while read file; do
  echo "Removing $file"
  rm "$file"
done

# Find and remove all .ts files in the server directory
find ./server -name "*.ts" ! -name "*.tsx.bak" | while read file; do
  echo "Removing $file"
  rm "$file"
done

# We'll keep the schema.ts file in the shared directory as it might be needed for reference
# This would prevent removing critical type definitions

echo "All .ts files have been removed!"