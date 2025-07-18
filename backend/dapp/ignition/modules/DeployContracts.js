const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployContracts", (m) => {
  const token = m.contract("Token", [ethers.parseEther("10000")]);
  const tradeManager = m.contract("TradeManager", [token]);

  return { token, tradeManager };
});
