#!/bin/sh

set -e

# Default values if not provided
export VITE_API_URL="${VITE_API_URL:-http://localhost:8080/api/v1}"
export VITE_FEATURE_CLUSTER_BROWSER="${VITE_FEATURE_CLUSTER_BROWSER:-true}"
export VITE_NETLIFY_DEMO="${VITE_NETLIFY_DEMO:-false}"

if [ "${VITE_API_URL%/api/v1}" = "${VITE_API_URL}" ]; then
    echo "WARNING: VITE_API_URL does not end with '/api/v1'"
    echo "   Current value: ${VITE_API_URL}"
    echo "   Expected format: http(s)://your-domain/api/v1"
fi

echo "Generating runtime configuration..."
echo "API_URL: ${VITE_API_URL}"
echo "FEATURE_CLUSTER_BROWSER: ${VITE_FEATURE_CLUSTER_BROWSER}"
echo "NETLIFY_DEMO: ${VITE_NETLIFY_DEMO}"

# Generate config.js from template using envsubst
envsubst < /tmp/runtime-config/config.template.js > /tmp/runtime-config/config.js

if [ $? -eq 0 ]; then
    echo "Runtime configuration generated successfully at /tmp/runtime-config/config.js"
else
    echo "Failed to generate runtime configuration"
    exit 1
fi

echo "Runtime configuration generated successfully"

# Execute the main container command
exec "$@"
