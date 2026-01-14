#!/bin/bash

echo "🚀 Quick Start - Kubernetes RBAC Generator"
echo "=========================================="
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""
echo "Starting development server..."
echo "The app will be available at http://localhost:5173"
echo ""

npm run dev
