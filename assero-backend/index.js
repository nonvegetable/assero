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
    res.json(user.files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, () => {
  console.log("Backend running on port 4000");
});
