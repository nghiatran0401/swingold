const { ethers } = require("hardhat");

async function main() {
  console.log("🔐 Generating a new custom wallet...");
  console.log("This is like creating a new bank account for your dApp\n");

  const wallet = ethers.Wallet.createRandom();

  console.log("✅ Wallet generated successfully!");
  console.log("📋 WALLET DETAILS:");
  console.log("📍 Address:", wallet.address);
  console.log("🔑 Private Key:", wallet.privateKey);
  console.log("💾 Mnemonic:", wallet.mnemonic.phrase);
}

main().catch(console.error);
