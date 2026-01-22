#!/bin/sh
# docker/init-config.sh - Generate runtime configuration for K8s deployment

set -e

# Default values if not provided
export VITE_API_URL="${VITE_API_URL:-http://localhost:8080/api/v1}"
export VITE_FEATURE_CLUSTER_BROWSER="${VITE_FEATURE_CLUSTER_BROWSER:-true}"
export VITE_NETLIFY_DEMO="${VITE_NETLIFY_DEMO:-false}"

echo "=== K8s RBACtory Frontend - Runtime Config Generation ==="
echo "API_URL: ${VITE_API_URL}"
echo "FEATURE_CLUSTER_BROWSER: ${VITE_FEATURE_CLUSTER_BROWSER}"
echo "NETLIFY_DEMO: ${VITE_NETLIFY_DEMO}"

# Validate API_URL format
if [ "${VITE_API_URL%/api/v1}" = "${VITE_API_URL}" ]; then
    echo "WARNING: VITE_API_URL does not end with '/api/v1'"
    echo "   Current value: ${VITE_API_URL}"
    echo "   Expected format: http(s)://your-domain/api/v1"
fi

# Check if template exists
if [ ! -f /tmp/config.template.js ]; then
    echo "ERROR: Config template not found at /tmp/config.template.js"
    exit 1
fi

# Check if output directory is writable
if [ ! -w /runtime-config ]; then
    echo "ERROR: /runtime-config is not writable"
    exit 1
fi

echo "Generating config.js from template..."

# Generate config.js from template using envsubst
if envsubst < /tmp/config.template.js > /runtime-config/config.js; then
    echo "✓ Runtime configuration generated successfully"
    echo ""
    echo "Generated config.js:"
    echo "---"
    cat /runtime-config/config.js
    echo "---"
else
    echo "ERROR: Failed to generate runtime configuration"
    exit 1
fi

echo "=== Configuration generation complete ==="
