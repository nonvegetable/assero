import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { create } from 'ipfs-http-client';
import multer from 'multer';
import * as ethers from 'ethers';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize IPFS
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http'
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// User Schema
const userSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  nonce: { type: String, required: true },
  files: [{ 
    cid: String, 
    name: String, 
    timestamp: Date 
  }]
});

const User = mongoose.model('User', userSchema);

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Generate nonce for wallet authentication
app.post("/auth/nonce", async (req, res) => {
  try {
    const { address } = req.body;
    const nonce = Math.floor(Math.random() * 1000000).toString(); // Generate random nonce
    await User.findOneAndUpdate(
      { address },
      { nonce },
      { upsert: true } // Create user if not exists
    );
    res.json({ nonce });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify signature and issue JWT
app.post("/auth/verify", async (req, res) => {
  try {
    const { address, signature } = req.body;
    const user = await User.findOne({ address });
    if (!user) throw new Error("User not found");

    const signerAddr = ethers.verifyMessage(user.nonce, signature);
    if (signerAddr.toLowerCase() !== address.toLowerCase()) {
      throw new Error("Invalid signature");
    }

    // Reset nonce to prevent replay attacks
    const newNonce = Math.floor(Math.random() * 1000000).toString();
    await User.findOneAndUpdate({ address }, { nonce: newNonce });

    // Create JWT
    const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Upload file to IPFS
app.post("/upload", authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const fileBuffer = req.file.buffer;
    const added = await ipfs.add(fileBuffer);

    // Save file reference to user's document
    await User.findOneAndUpdate(
      { address: req.user.address },
      { 
        $push: { 
          files: {
            cid: added.path,
            name: req.file.originalname,
            timestamp: new Date()
          }
        }
      },
      { upsert: true } // Ensure user document exists
    );

    return res.json({ 
      cid: added.path,
      name: req.file.originalname 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's files
app.get("/files", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findOne({ address: req.user.address });
    if (!user) throw new Error("User not found");
    res.json(user.files)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// Initialize provider and wallet
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
