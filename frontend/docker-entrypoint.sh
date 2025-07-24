#!/bin/sh
set -e

# Ensure ABI directory exists
mkdir -p /app/src/shared-abis

# Copy ABIs if they exist (don't fail if none yet)
cp /app/shared-abis/*.json /app/src/shared-abis/ 2>/dev/null || true

# Start the app
exec npm start 