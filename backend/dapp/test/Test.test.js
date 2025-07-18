const { expect } = require("chai");
const hre = require("hardhat");
const { parseEther, formatEther } = require("ethers");

const { ethers } = hre;

describe("Token & TradeManager Integration (Ethers v6)", function () {
  let gold, trade;
  let owner, buyer, seller, other;

  beforeEach(async () => {
    [owner, buyer, seller, other] = await ethers.getSigners();

    // Deploy Token
    const Token = await ethers.getContractFactory("Token");
    gold = await Token.connect(owner).deploy(parseEther("10000"));
    await gold.waitForDeployment();

    // Deploy TradeManager with token address
    const TradeManager = await ethers.getContractFactory("TradeManager");
    trade = await TradeManager.connect(owner).deploy(await gold.getAddress());
    await trade.waitForDeployment();

    // Transfer and approve tokens
    await gold.connect(owner).transfer(await buyer.getAddress(), parseEther("1000"));
    await gold.connect(buyer).approve(await trade.getAddress(), parseEther("1000"));
  });

  it("should allow buyer to create a trade and store data correctly", async () => {
    await trade.connect(buyer).createTrade(await seller.getAddress(), "Sword", parseEther("100"));
    const t = await trade.trades(1);

    expect(t.buyer).to.equal(await buyer.getAddress());
    expect(t.seller).to.equal(await seller.getAddress());
    expect(t.itemName).to.equal("Sword");
    expect(t.itemPrice).to.equal(parseEther("100"));
    expect(t.completed).to.be.false;
  });

  it("should not allow confirm after 10 minutes", async () => {
    await trade.connect(buyer).createTrade(await seller.getAddress(), "Bow", parseEther("50"));

    // Fast-forward >10 minutes
    await ethers.provider.send("evm_increaseTime", [11 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(trade.connect(buyer).confirmTrade(1)).to.be.revertedWith("Expired");
  });

  it("should allow confirmation within time and transfer Gold", async () => {
    await trade.connect(buyer).createTrade(await seller.getAddress(), "Shield", parseEther("200"));
    const balanceBefore = await gold.balanceOf(await seller.getAddress());
    await trade.connect(buyer).confirmTrade(1);
    const t = await trade.trades(1);
    expect(t.confirmed).to.be.true;
    expect(t.completed).to.be.true;
    const balanceAfter = await gold.balanceOf(await seller.getAddress());
    expect(balanceAfter - balanceBefore).to.equal(parseEther("200"));
  });

  it("should cancel trade automatically after 10 minutes by anyone", async () => {
    await trade.connect(buyer).createTrade(await seller.getAddress(), "Potion", parseEther("30"));

    await ethers.provider.send("evm_increaseTime", [11 * 60]);
    await ethers.provider.send("evm_mine");

    await trade.connect(seller).cancelTrade(1);

    const t = await trade.trades(1);
    expect(t.completed).to.be.true;
    expect(t.confirmed).to.be.false;
  });

  it("should not deduct Gold on cancel", async () => {
    await trade.connect(buyer).createTrade(await seller.getAddress(), "Scroll", parseEther("10"));

    const balBefore = await gold.balanceOf(await buyer.getAddress());

    await ethers.provider.send("evm_increaseTime", [11 * 60]);
    await ethers.provider.send("evm_mine");

    await trade.connect(buyer).cancelTrade(1);

    const balAfter = await gold.balanceOf(await buyer.getAddress());
    expect(balAfter).to.equal(balBefore);
  });

  it("should record transfer history on token", async () => {
    await gold.connect(buyer).transferGold(await seller.getAddress(), parseEther("20"));

    const buyerHistory = await gold.getHistory(await buyer.getAddress());
    expect(buyerHistory.length).to.equal(1);
    expect(buyerHistory[0].counterparty).to.equal(await seller.getAddress());

    const sellerHistory = await gold.getHistory(await seller.getAddress());
    expect(sellerHistory.length).to.equal(1);
    expect(sellerHistory[0].counterparty).to.equal(await buyer.getAddress());
  });

  it("should view wallet balance properly", async () => {
    const bal = await gold.connect(buyer).getMyBalance();
    expect(bal).to.equal(parseEther("1000"));
  });
});
