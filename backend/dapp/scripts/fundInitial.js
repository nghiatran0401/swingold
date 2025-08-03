const { ethers, network } = require("hardhat");
require("dotenv").config();

async function main() {
	const initialOwner = process.env.INITOWNER_ADDRESS;

	const richAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"; // Hardhat account #0
	await network.provider.request({
		method: "hardhat_impersonateAccount",
		params: [richAddress],
	});

	const funder = await ethers.getSigner(richAddress);

	// Send ETH to initial owner
	const tx = await funder.sendTransaction({
		to: initialOwner,
		value: ethers.parseEther("10"),
	});

	await tx.wait();
	console.log(`Sent 10 ETH to ${initialOwner}`);
}

main().catch(console.error);
