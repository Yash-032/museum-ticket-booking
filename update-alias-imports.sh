#!/bin/bash

# Function to update alias imports
update_alias_imports() {
    local file=$1
    
    # Skip backup files
    if [[ $file == *.bak ]]; then
        return
    fi
    
    # Create a temporary file
    local temp_file="${file}.temp"
    
    # Update import statements with @ aliases
    sed -E '
        s/from "@shared\/([^"]+)\.ts"/from "@shared\/\1.js"/g;
        s/from "@shared\/([^"]+)\.tsx"/from "@shared\/\1.jsx"/g;
        s/from "@\/([^"]+)\.ts"/from "@\/\1.js"/g;
        s/from "@\/([^"]+)\.tsx"/from "@\/\1.jsx"/g;
    ' "$file" > "$temp_file"
    
    # Replace the original file with the updated one
    mv "$temp_file" "$file"
    
    echo "Updated alias imports in: $file"
}

# Process client side files
echo "Updating alias imports in client JS files..."
find ./client/src -name "*.js" -o -name "*.jsx" | while read file; do
    update_alias_imports "$file"
done

# Process server side files
echo "Updating alias imports in server JS files..."
find ./server -name "*.js" | while read file; do
    update_alias_imports "$file"
done

echo "Alias import updates complete!"