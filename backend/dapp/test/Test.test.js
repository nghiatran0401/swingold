const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther, formatEther } = ethers;

describe("Swingold & TradeManager Full Integration Test", function () {
	let gold, trade;
	let accounts;
	let buyer, seller;

	beforeEach(async () => {
		accounts = await ethers.getSigners();
		[buyer, seller] = accounts;

		// Deploy Swingold
		const Swingold = await ethers.getContractFactory("Swingold");
		gold = await Swingold.connect(buyer).deploy(await buyer.getAddress());
		await gold.waitForDeployment();

		// Mint 10,000 SG to all accounts
		for (const acct of accounts) {
			await gold.connect(buyer).mint(acct.address, parseEther("10000"));
		}

		// Deploy TradeManager
		const TradeManager = await ethers.getContractFactory("TradeManager");
		trade = await TradeManager.connect(buyer).deploy(await gold.getAddress());
		await trade.waitForDeployment();

		// Approve TradeManager for buyer to spend SG
		await gold.connect(buyer).approve(await trade.getAddress(), parseEther("10000"));
	});

	it("1. All accounts should receive 10,000 Swingold", async () => {
		for (const acct of accounts) {
			const balance = await gold.balanceOf(acct.address);
			expect(balance).to.equal(parseEther("10000"));
		}
	});

	it("2. Buyer and seller can create trade with each other", async () => {
		await trade.connect(buyer).createTrade(
			seller.address,
			"Book",
			"Education",
			parseEther("200")
		);

		const tradeInfo = await trade.trades("Book");
		expect(tradeInfo.itemName).to.equal("Book");
		expect(tradeInfo.buyer).to.equal(buyer.address);
		expect(tradeInfo.seller).to.equal(seller.address);
		expect(tradeInfo.itemPrice).to.equal(parseEther("200"));
		expect(tradeInfo.confirmed).to.be.false;
	});

	it("3. Buyer loses SG after confirming the trade", async () => {
		await trade.connect(buyer).createTrade(seller.address, "Bag", "Gear", parseEther("300"));

		const buyerBefore = await gold.balanceOf(buyer.address);
		await trade.connect(buyer).confirmTrade("Bag");
		const buyerAfter = await gold.balanceOf(buyer.address);

		expect(buyerBefore - buyerAfter).to.equal(parseEther("300"));
	});

	it("4. Seller gains SG after trade confirmation", async () => {
		await trade.connect(buyer).createTrade(seller.address, "Pen", "Stationery", parseEther("150"));

		const sellerBefore = await gold.balanceOf(seller.address);
		await trade.connect(buyer).confirmTrade("Pen");
		const sellerAfter = await gold.balanceOf(seller.address);

		expect(sellerAfter - sellerBefore).to.equal(parseEther("150"));
	});

	it("5. Cannot confirm trade after 10 minutes (timeout)", async () => {
		await trade.connect(buyer).createTrade(seller.address, "Clock", "Tool", parseEther("250"));

		// Simulate 11 minutes later
		await ethers.provider.send("evm_increaseTime", [11 * 60]);
		await ethers.provider.send("evm_mine");

		await expect(
			trade.connect(buyer).confirmTrade("Clock")
		).to.be.revertedWith("Trade expired");
	});

	it("6. After timeout, trade should auto cancel (confirmed = false, completed = false)", async () => {
		await trade.connect(buyer).createTrade(seller.address, "Lamp", "Electronics", parseEther("120"));

		await ethers.provider.send("evm_increaseTime", [11 * 60]);
		await ethers.provider.send("evm_mine");

		const tradeInfo = await trade.trades("Lamp");
		expect(tradeInfo.confirmed).to.be.false;
		expect(tradeInfo.completed).to.be.false;
	});

	it("7. ETH cannot be directly used in TradeManager (expect revert)", async () => {
		await expect(
			trade.connect(buyer).createTrade(
				seller.address,
				"ETH Item",
				"Test",
				parseEther("1"),
				{ value: parseEther("1") } // sending ETH along
			)
		).to.be.reverted; // trade does not accept ETH
	});

	it("8. ETH can be swapped to SG by deposit()", async () => {
		// Buyer deposits 1 ETH and receives 1 SG
		const depositTx = await gold.connect(buyer).deposit({ value: parseEther("1") });
		await depositTx.wait();

		const balance = await gold.balanceOf(buyer.address);
		expect(balance).to.equal(parseEther("10001")); // 10,000 initial + 1 from deposit
	});
});
