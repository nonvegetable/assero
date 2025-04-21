const hre = require("hardhat");

async function main() {
  const AssetNFT = await hre.ethers.getContractFactory("AssetNFT");
  const assetNFT = await AssetNFT.deploy();
  await assetNFT.waitForDeployment();

  const address = await assetNFT.getAddress();
  console.log("AssetNFT deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});