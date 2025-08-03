#!/bin/sh
set -e

# Start Hardhat node in the background
npx hardhat node &
HARDHAT_PID=$!

# Wait for the node to be ready
sleep 5

# Deploy contracts (update this if your deploy command is different)
npx hardhat ignition deploy ./ignition/modules/DeployContracts.js --network localhost

# Extract ABIs
node extract-abis.js

# Keep the Hardhat node running in the foreground
wait $HARDHAT_PID