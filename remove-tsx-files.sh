#!/bin/bash

# This script removes all .tsx files from the project source code
# It excludes node_modules and .bak files

echo "Removing all .tsx files from the project source code..."

# Find and remove all .tsx files in the client/src directory
find ./client/src -name "*.tsx" | grep -v "\.bak" | while read file; do
  echo "Removing $file"
  rm "$file"
done

# Find and remove all .tsx files in the server directory
find ./server -name "*.tsx" | grep -v "\.bak" | while read file; do
  echo "Removing $file"
  rm "$file"
done

# Find and remove all .tsx files in the shared directory
find ./shared -name "*.tsx" | grep -v "\.bak" | while read file; do
  echo "Removing $file"
  rm "$file"
done

echo "All .tsx files have been removed!"