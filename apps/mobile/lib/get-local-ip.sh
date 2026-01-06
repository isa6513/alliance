#!/bin/bash

OUTPUT_DIR="${1:-.}"
OUTPUT_FILE="$OUTPUT_DIR/local-ip.ts"

get_ip() {
    local ip=""
    
    # Try 'ip' command first (modern Linux)
    if command -v ip &> /dev/null; then
        ip=$(ip -4 addr show 2>/dev/null | grep -o '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -n 1)
        [ -n "$ip" ] && echo "$ip" && return
    fi
    
    # Try 'ifconfig' (macOS, older Linux)
    if command -v ifconfig &> /dev/null; then
        ip=$(ifconfig 2>/dev/null | grep -oE 'inet (addr:)?([0-9]+\.){3}[0-9]+' | grep -oE '([0-9]+\.){3}[0-9]+' | grep -v '127.0.0.1' | head -n 1)
        [ -n "$ip" ] && echo "$ip" && return
    fi
    
    echo ""
}

LOCAL_IP=$(get_ip)

if [ -z "$LOCAL_IP" ]; then
    echo "Error: Could not determine local IP address" >&2
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Write to TypeScript file
echo "export const local_ip = \"$LOCAL_IP\";" > "$OUTPUT_FILE"

echo "Wrote local IP ($LOCAL_IP) to $OUTPUT_FILE"