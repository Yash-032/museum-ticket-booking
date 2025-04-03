#!/bin/bash

# Function to update import statements
update_imports() {
    local file=$1
    
    # Skip backup files
    if [[ $file == *.bak ]]; then
        return
    fi
    
    # Create a temporary file
    local temp_file="${file}.temp"
    
    # Update import statements from .ts to .js and .tsx to .jsx
    sed -E '
        s/from "(.+)\.ts"/from "\1.js"/g;
        s/from "(.+)\.tsx"/from "\1.jsx"/g;
        s/from '"'"'(.+)\.ts'"'"'/from '"'"'\1.js'"'"'/g;
        s/from '"'"'(.+)\.tsx'"'"'/from '"'"'\1.jsx'"'"'/g;
        s/import "(.+)\.ts"/import "\1.js"/g;
        s/import "(.+)\.tsx"/import "\1.jsx"/g;
        s/import '"'"'(.+)\.ts'"'"'/import '"'"'\1.js'"'"'/g;
        s/import '"'"'(.+)\.tsx'"'"'/import '"'"'\1.jsx'"'"'/g;
    ' "$file" > "$temp_file"
    
    # Replace the original file with the updated one
    mv "$temp_file" "$file"
    
    echo "Updated imports in: $file"
}

# Process client side files
echo "Updating imports in client JS files..."
find ./client/src -name "*.js" -o -name "*.jsx" | while read file; do
    update_imports "$file"
done

# Process server side files
echo "Updating imports in server JS files..."
find ./server -name "*.js" | while read file; do
    update_imports "$file"
done

# Process shared files
echo "Updating imports in shared JS files..."
find ./shared -name "*.js" | while read file; do
    update_imports "$file"
done

# Update root JS files
echo "Updating imports in root JS files..."
find . -maxdepth 1 -name "*.js" | while read file; do
    update_imports "$file"
done

echo "Import updates complete!"