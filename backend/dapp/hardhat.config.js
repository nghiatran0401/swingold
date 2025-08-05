require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  networks: {
<<<<<<< Updated upstream
    localreal: {
      url: process.env.LOCALREAL_RPC_URL,
      accounts: [process.env.INITOWNER_PRIVATE_KEY],
=======
    // Local node
    localreal: {
      url: process.env.LOCALREAL_RPC_URL, // http://127.0.0.1:8545
      accounts: [process.env.INITOWNER_PRIVATE_KEY],
    },

    // Hardhat in-memory node (used for coverage if account lack gas money)
    hardhat: {
      accounts: [
        {
          privateKey: process.env.INITOWNER_PRIVATE_KEY,
          balance: "10000000000000000000000", // 10,000 ETH
        },
      ],
>>>>>>> Stashed changes
    },
  },
  solidity: "0.8.20",
};
