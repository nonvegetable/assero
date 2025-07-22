import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as ethers from 'ethers';

const app = express();
app.use(express.json());
app.use(cors());

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function mintAsset(address to, string memory tokenURI) returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function getAssetsByOwner(address owner) public view returns (uint256[])",
];

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Get all assets
app.get("/assets", async (req, res) => {
  try {
    const totalSupply = await contract.totalSupply();
    const assets = [];

    for (let i = 0; i < totalSupply; i++) {
      const owner = await contract.ownerOf(i);
      const uri = await contract.tokenURI(i);
      
      assets.push({
        id: i,
        owner,
        uri
      });
    }

    res.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create new asset
app.post("/assets", async (req, res) => {
  try {
    const { address, tokenURI } = req.body;

    if (!address || !tokenURI) {
      throw new Error("Missing required parameters");
    }

    const tx = await contract.mintAsset(address, tokenURI);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(500).json({ error: error.message });
  }
});

// Transfer asset
app.post("/transfer", async (req, res) => {
  try {
    const { from, to, tokenId } = req.body;

    if (!from || !to || tokenId === undefined) {
      throw new Error("Missing required parameters");
    }

    const tx = await contract.transferFrom(from, to, tokenId);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error("Error transferring asset:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get single asset details
app.get("/assets/:tokenId", async (req, res) => {
  try {
    const tokenId = req.params.tokenId;
    const owner = await contract.ownerOf(tokenId);
    const uri = await contract.tokenURI(tokenId);

    res.json({
      id: parseInt(tokenId),
      owner,
      uri
    });
  } catch (error) {
    console.error("Error fetching asset:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get assets by owner
app.get("/assets/owner/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const ownedTokens = await contract.getAssetsByOwner(address);
    
    const assets = await Promise.all(
      ownedTokens.map(async (tokenId) => {
        const uri = await contract.tokenURI(tokenId);
        return {
          id: tokenId,
          owner: address,
          uri
        };
      })
    );

    res.json(assets);
  } catch (error) {
    console.error("Error fetching owner's assets:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, () => {
  console.log("Backend running on port 4000");
});