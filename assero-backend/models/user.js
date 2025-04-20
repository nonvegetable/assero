const mongoose = require('mongoose');

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
module.exports = User;