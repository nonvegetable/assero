// src/utils/contract.ts

import { ethers } from "ethers";

const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace with your deployed contract address

const contractABI = [
  "function createAsset(string memory tokenURI) public returns (uint256)",
  "function transferAsset(address to, uint256 tokenId) public",
  "function getAssetsByOwner(address owner) public view returns (uint256[])",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "event AssetCreated(uint256 tokenId, address owner, string tokenURI)",
  "event AssetTransferred(uint256 tokenId, address from, address to)"
];

export function getContract(providerOrSigner: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(contractAddress, contractABI, providerOrSigner);
}
