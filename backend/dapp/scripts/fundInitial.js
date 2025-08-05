<<<<<<< Updated upstream
const { ethers, network } = require("hardhat");
=======
const { ethers } = require("hardhat");
>>>>>>> Stashed changes
require("dotenv").config();

async function main() {
	const initialOwner = process.env.INITOWNER_ADDRESS;

<<<<<<< Updated upstream
	const richAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"; // Hardhat account #0
	await network.provider.request({
		method: "hardhat_impersonateAccount",
		params: [richAddress],
	});

	const funder = await ethers.getSigner(richAddress);

	// Send ETH to initial owner
	const tx = await funder.sendTransaction({
=======
	const [deployer] = await ethers.getSigners(); // Account #0

	console.log("Funding from:", deployer.address);
	console.log("Funding to INITOWNER:", initialOwner);

	const tx = await deployer.sendTransaction({
>>>>>>> Stashed changes
		to: initialOwner,
		value: ethers.parseEther("10"),
	});

	await tx.wait();
<<<<<<< Updated upstream
	console.log(`Sent 10 ETH to ${initialOwner}`);
=======
	console.log(`✅ Sent 10 ETH to ${initialOwner}`);
>>>>>>> Stashed changes
}

main().catch(console.error);
