// backend/index.js or backend/app.js
const express = require("express");
const { create } = require("ipfs-http-client");
const app = express();

// For file uploads (multer or any library)
// const multer = require("multer");
// const upload = multer({ dest: 'uploads/' });

// Initialize IPFS
const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });

app.post("/upload", async (req, res) => {
  try {
    // Suppose you get the file buffer from request
    // const fileBuffer = req.file.buffer;
    // const added = await ipfs.add(fileBuffer);

    // For a simple example (no file uploads):
    const content = Buffer.from("Hello IPFS");
    const added = await ipfs.add(content);

    return res.json({ cid: added.path });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "IPFS upload failed" });
  }
});

app.listen(4000, () => {
  console.log("Backend running on port 4000");
});
