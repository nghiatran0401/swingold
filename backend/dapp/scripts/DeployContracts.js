require("dotenv").config();
const hre = require("hardhat");
const { parseEther, Wallet } = hre.ethers;

async function main() {
	const provider = hre.ethers.provider;

	const initialOwner = process.env.INITOWNER_ADDRESS;
	const initialPrivateKey = process.env.INITOWNER_PRIVATE_KEY;

	// Connect to wallet using private key
	const ownerWallet = new Wallet(initialPrivateKey, provider);

	console.log("Deploying contracts from:", ownerWallet.address);

	// 1. Check and log initial ETH balance
	const balance = await provider.getBalance(initialOwner);
	if (balance < parseEther("1")) {
		console.log("Not enough ETH. Please fund the initial owner wallet.");
		process.exit(1);
	} else {
		console.log("Owner wallet has enough ETH:", hre.ethers.formatEther(balance));
	}

	// 2. Deploy Swingold contract with initialOwner as the constructor argument
	const Swingold = await hre.ethers.getContractFactory("Swingold", ownerWallet);
	const swingold = await Swingold.deploy(initialOwner);
	await swingold.waitForDeployment();
	const swingoldAddress = await swingold.getAddress();
	console.log("Swingold deployed to:", swingoldAddress);

	// 3. Deploy TradeManager with the token address
	const TradeManager = await hre.ethers.getContractFactory("TradeManager", ownerWallet);
	const tradeManager = await TradeManager.deploy(swingoldAddress);
	await tradeManager.waitForDeployment();
	const tradeManagerAddress = await tradeManager.getAddress();
	console.log("TradeManager deployed to:", tradeManagerAddress);

	// 4. Mint SG tokens to initialOwner only (or add others if needed)
	const recipients = [initialOwner];
	for (const addr of recipients) {
		const tx = await swingold.connect(ownerWallet).mint(addr, parseEther("10000"));
		await tx.wait();
		console.log(`Minted 10,000 SG to ${addr}`);
	}
}

main().catch((error) => {
	console.error("Deployment failed:", error);
	process.exit(1);
});
