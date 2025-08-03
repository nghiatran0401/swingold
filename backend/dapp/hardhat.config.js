require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  networks: {
    localreal: {
      url: process.env.LOCALREAL_RPC_URL,
      accounts: [process.env.INITOWNER_PRIVATE_KEY],
    },
  },
  solidity: "0.8.20",
};
