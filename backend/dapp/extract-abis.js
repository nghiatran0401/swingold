const fs = require("fs");
const path = require("path");

// This script is used to extract the ABIs of the contracts from the artifacts and save them to the contracts directory to use them in the wapp (web3.py)

const outputDir = process.env.ABI_OUTPUT_DIR || "./contracts";

const contracts = [
  { name: "TradeManager", artifactPath: "./artifacts/contracts/TradeManager.sol/TradeManager.json", abiOut: "TradeManagerABI.json" },
  { name: "Swingold", artifactPath: "./artifacts/contracts/Swingold.sol/Swingold.json", abiOut: "SwingoldABI.json" },
];

if (!fs.existsSync(path.resolve(__dirname, outputDir))) {
  fs.mkdirSync(path.resolve(__dirname, outputDir), { recursive: true });
}

contracts.forEach((contract) => {
  const artifact = JSON.parse(fs.readFileSync(path.resolve(__dirname, contract.artifactPath)));
  const abiPath = path.resolve(__dirname, outputDir, contract.abiOut);
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`Extracted ABI for ${contract.name} to ${abiPath}`);
});
