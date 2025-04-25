const hre = require("hardhat");

async function main() {
  console.log("Deploying AssetNFT contract...");
  
  const AssetNFT = await hre.ethers.getContractFactory("AssetNFT");
  const assetNFT = await AssetNFT.deploy();
  await assetNFT.waitForDeployment();

  const address = await assetNFT.getAddress();
  console.log("AssetNFT deployed to:", address);

  // Wait for contract deployment to be confirmed
  console.log("Waiting for blockchain confirmations...");
  await assetNFT.deploymentTransaction().wait(5); // Wait for 5 block confirmations

  // Verify contract on Etherscan
  console.log("Verifying contract on Etherscan...");
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [],
  });

  console.log("Contract verified successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });