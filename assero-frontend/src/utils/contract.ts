import { ethers } from "ethers";

// 1. Your contract’s address on Ethereum testnet
const contractAddress = "0xYourDeployedContractAddressHere";

// 2. The contract ABI (Application Binary Interface)
// Minimal example: if you have a function mintAsset(address) and a standard ERC-721,
// list them here. 
// You can copy ABI from your `artifacts/contracts/AssetNFT.sol/AssetNFT.json` 
// or use a simplified array if you only need a few calls.
const contractABI = [
  "function mintAsset(address to) public returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  // etc...
];

// 3. We'll define a function that, given a provider or signer, 
//    returns an ethers.js Contract instance
export function getContract(signerOrProvider: ethers.BrowserProvider | ethers.Signer) {
  return new ethers.Contract(contractAddress, contractABI, signerOrProvider);
}
