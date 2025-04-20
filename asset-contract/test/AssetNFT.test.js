const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AssetNFT", function () {
  let assetNFT;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy contract with owner address as initialOwner
    const AssetNFT = await ethers.getContractFactory("AssetNFT");
    assetNFT = await AssetNFT.deploy(owner.address);
    await assetNFT.waitForDeployment();
  });

  describe("Asset Creation", function () {
    it("Should create a new asset NFT", async function () {
      const tokenURI = "ipfs://QmTest123";
      await assetNFT.mintAsset(user1.address, tokenURI);

      expect(await assetNFT.ownerOf(0)).to.equal(user1.address);
      expect(await assetNFT.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should increment token ID correctly", async function () {
      await assetNFT.mintAsset(user1.address, "ipfs://QmTest1");
      await assetNFT.mintAsset(user2.address, "ipfs://QmTest2");
      
      expect(await assetNFT.ownerOf(1)).to.equal(user2.address);
    });
  });

  describe("Asset Transfer", function () {
    it("Should transfer asset between users", async function () {
      const tokenURI = "ipfs://QmTest123";
      await assetNFT.mintAsset(user1.address, tokenURI);
      
      await assetNFT.connect(user1).transferFrom(user1.address, user2.address, 0);
      expect(await assetNFT.ownerOf(0)).to.equal(user2.address);
    });
  });

  describe("Ownership", function () {
    it("Should set the correct owner", async function () {
      expect(await assetNFT.owner()).to.equal(owner.address);
    });

    it("Should allow only owner to mint", async function () {
      const tokenURI = "ipfs://QmTest123";
      await expect(
        assetNFT.connect(user1).mintAsset(user2.address, tokenURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});

module.exports = {
  solidity: "0.8.24",
  paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./artifacts"
  }
};