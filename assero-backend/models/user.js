const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Wallet authentication
  address: { 
    type: String, 
    required: true, 
    unique: true 
  },
  nonce: { 
    type: String, 
    required: true 
  },
  
  // Asset metadata
  assets: [{
    tokenId: String,
    assetType: String, // 'vehicle' or 'property'
    metadata: {
      name: String,
      description: String,
      registrationNumber: String,
      propertyAddress: String,
      // other asset-specific fields
    },
    documents: [{
      cid: String,      // IPFS content identifier
      name: String,     // Original filename
      type: String,     // Document type
      timestamp: Date   // Upload date
    }]
  }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;