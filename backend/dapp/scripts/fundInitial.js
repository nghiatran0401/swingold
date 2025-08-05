const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const initialOwner = process.env.INITOWNER_ADDRESS;
  const fundingAmount = process.env.FUNDING_AMOUNT || "10"; // Configurable amount

  // Validate environment variables
  if (!initialOwner) {
    console.error("❌ INITOWNER_ADDRESS not found in environment variables");
    process.exit(1);
  }

  // Validate address format
  if (!ethers.isAddress(initialOwner)) {
    console.error("❌ Invalid INITOWNER_ADDRESS format");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners(); // Account #0

  console.log("💰 Funding Configuration:");
  console.log("From:", deployer.address);
  console.log("To:", initialOwner);
  console.log("Amount:", fundingAmount, "ETH");

  // Check deployer balance
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  const requiredAmount = ethers.parseEther(fundingAmount);

  if (deployerBalance < requiredAmount) {
    console.error(`❌ Insufficient balance. Need ${fundingAmount} ETH, have ${ethers.formatEther(deployerBalance)} ETH`);
    process.exit(1);
  }

  // Check if recipient already has sufficient balance
  const recipientBalance = await ethers.provider.getBalance(initialOwner);
  if (recipientBalance >= requiredAmount) {
    console.log(`ℹ️  Recipient already has ${ethers.formatEther(recipientBalance)} ETH (sufficient)`);
    return;
  }

  console.log("🚀 Sending transaction...");
  const tx = await deployer.sendTransaction({
    to: initialOwner,
    value: requiredAmount,
  });

  await tx.wait();
  console.log(`✅ Successfully sent ${fundingAmount} ETH to ${initialOwner}`);
  console.log(`Transaction hash: ${tx.hash}`);

  // Verify the transfer
  const newBalance = await ethers.provider.getBalance(initialOwner);
  console.log(`New balance: ${ethers.formatEther(newBalance)} ETH`);
}

main().catch(console.error);
