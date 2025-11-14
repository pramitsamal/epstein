#!/bin/bash
set -e

echo "Installing root dependencies..."
npm install

echo "Installing frontend dependencies..."
cd network-ui
npm install

echo "Building frontend..."
npm run build

echo "Build complete!"
