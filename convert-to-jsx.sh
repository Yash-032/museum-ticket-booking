#!/bin/bash

# This script converts TypeScript files to JavaScript files
# It creates backup copies of the original files with the .bak extension

# Function to convert a TypeScript file to JavaScript
convert_ts_to_js() {
    local ts_file=$1
    local js_file=${ts_file%.ts}.js
    
    # If the file is a .tsx file, create a .jsx file instead
    if [[ $ts_file == *.tsx ]]; then
        js_file=${ts_file%.tsx}.jsx
    fi
    
    # Create a backup of the original file
    cp "$ts_file" "${ts_file}.bak"
    
    # Create the JavaScript file by copying the TypeScript file
    # This is a simple copy; in a real scenario, you might want to use a transpiler
    cp "$ts_file" "$js_file"
    
    # Strip type annotations (basic conversion)
    # This is a simple sed script; in a real scenario, use a proper TypeScript transpiler
    sed -i -E '
        # Remove import type statements
        s/import type \{.*\} from ".*";?//g;
        
        # Remove type/interface declarations
        s/(export )?type [A-Za-z0-9_]+ =.*;//g;
        s/(export )?interface [A-Za-z0-9_]+ \{.*\}//g;
        
        # Remove type assertions
        s/as [A-Za-z0-9_]+//g;
        
        # Remove type annotations
        s/: [A-Za-z0-9_<>|\[\]]+( \| [A-Za-z0-9_<>|\[\]]+)*(,|;|\))/\1/g;
        s/: [A-Za-z0-9_<>|\[\]]+( \| [A-Za-z0-9_<>|\[\]]+)*( = )/\2/g;
        
        # Remove generic type parameters
        s/<[A-Za-z0-9_,\s]+>//g;
    ' "$js_file"
    
    echo "Converted $ts_file to $js_file"
}

# Process client side files
echo "Converting client TypeScript files..."
find ./client/src -name "*.ts" -o -name "*.tsx" | while read file; do
    convert_ts_to_js "$file"
done

# Process server side files
echo "Converting server TypeScript files..."
find ./server -name "*.ts" | while read file; do
    convert_ts_to_js "$file"
done

# Process shared files
echo "Converting shared TypeScript files..."
find ./shared -name "*.ts" | while read file; do
    convert_ts_to_js "$file"
done

# Process root TypeScript files
echo "Converting root TypeScript files..."
find . -maxdepth 1 -name "*.ts" | while read file; do
    convert_ts_to_js "$file"
done

echo "Conversion complete!"