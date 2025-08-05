require("dotenv").config();
const hre = require("hardhat");
const { parseEther, Wallet } = hre.ethers;

async function main() {
  const provider = hre.ethers.provider;

  const INITIAL_MINT_AMOUNT = "10000";
  const MIN_ETH_BALANCE = "1";

  const initialOwner = process.env.INITOWNER_ADDRESS;
  const initialPrivateKey = process.env.INITOWNER_PRIVATE_KEY;

  // Validate environment variables
  if (!initialOwner || !initialPrivateKey) {
    console.error("Missing required environment variables: INITOWNER_ADDRESS or INITOWNER_PRIVATE_KEY");
    process.exit(1);
  }

  // Connect to wallet using private key
  const ownerWallet = new Wallet(initialPrivateKey, provider);

  console.log("Network:", hre.network.name);
  console.log("Deploying contracts from:", ownerWallet.address);

  // 1. Check and log initial ETH balance
  const balance = await provider.getBalance(initialOwner);
  if (balance < parseEther(MIN_ETH_BALANCE)) {
    console.log(`Not enough ETH. Need at least ${MIN_ETH_BALANCE} ETH. Current: ${hre.ethers.formatEther(balance)}`);
    process.exit(1);
  } else {
    console.log("Owner wallet has enough ETH:", hre.ethers.formatEther(balance));
  }

  // 2. Deploy Swingold contract with initialOwner
  console.log("\nDeploying Swingold contract...");
  const Swingold = await hre.ethers.getContractFactory("Swingold", ownerWallet);
  const swingold = await Swingold.deploy(initialOwner);
  await swingold.waitForDeployment();
  const swingoldAddress = await swingold.getAddress();
  console.log("✅ Swingold deployed to:", swingoldAddress);

  // 3. Deploy TradeManager with the Swingold address
  console.log("\nDeploying TradeManager contract...");
  const TradeManager = await hre.ethers.getContractFactory("TradeManager", ownerWallet);
  const tradeManager = await TradeManager.deploy(swingoldAddress);
  await tradeManager.waitForDeployment();
  const tradeManagerAddress = await tradeManager.getAddress();
  console.log("✅ TradeManager deployed to:", tradeManagerAddress);

  // 4. Mint SG tokens to initialOwner
  console.log(`\nMinting ${INITIAL_MINT_AMOUNT} SG tokens...`);
  const recipients = [initialOwner];
  for (const addr of recipients) {
    const tx = await swingold.connect(ownerWallet).mint(addr, parseEther(INITIAL_MINT_AMOUNT));
    await tx.wait();
    console.log(`✅ Minted ${INITIAL_MINT_AMOUNT} SG to ${initialOwner}`);
  }

  console.log("\n🎉 Deployment completed successfully!");
}

main().catch(console.error);
