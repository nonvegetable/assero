// src/utils/contract.ts

import { ethers } from "ethers";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const contractABI = [
  "function createAsset(string memory tokenURI) public returns (uint256)",
  "function transferAsset(address to, uint256 tokenId) public",
  "function getAssetsByOwner(address owner) public view returns (uint256[])",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)"
];

// Returns a contract instance connected to the given signer (MetaMask)
export const getContract = (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  // Only access window.ethereum in browser environment
  if (typeof window !== "undefined") {
    const provider = signerOrProvider || new ethers.BrowserProvider((window as any).ethereum);
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
  }

  throw new Error("Web3 provider not available");
};
