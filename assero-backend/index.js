require('dotenv').config();
const express = require("express");
const { create } = require("ipfs-http-client");
const multer = require("multer");
const ethers = require("ethers");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })
});

const app = express();
app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize IPFS
const ipfs = create({ url: process.env.IPFS_URL });

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

const User = mongoose.model('User', models);

// Middleware for Firebase authentication
const authenticateFirebase = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new Error('No token provided');

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Generate nonce for wallet authentication
app.post("/auth/nonce", async (req, res) => {
  try {
    const { address } = req.body;
    const nonce = Math.floor(Math.random() * 1000000).toString();
    await User.findOneAndUpdate(
      { address }, 
      { nonce }, 
      { upsert: true }
    );
    res.json({ nonce });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify signature and issue Firebase custom token
app.post("/auth/verify", async (req, res) => {
  try {
    const { address, signature } = req.body;
    const user = await User.findOne({ address });
    
    const signerAddr = ethers.verifyMessage(user.nonce, signature);
    if (signerAddr.toLowerCase() !== address.toLowerCase()) {
      throw new Error("Invalid signature");
    }

    // Create custom token with Firebase Admin
    const customToken = await admin.auth().createCustomToken(address);
    res.json({ customToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Upload file to IPFS
app.post("/upload", authenticateFirebase, upload.single('file'), async (req, res) => {
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
      }
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
app.get("/files", authenticateFirebase, async (req, res) => {
  try {
    const user = await User.findOne({ address: req.user.address });
    res.json(user.files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, () => {
  console.log("Backend running on port 4000");
});
