// src/utils/contract.ts

import { ethers } from "ethers";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractABI = [
  "function createAsset(string memory tokenURI) public returns (uint256)",
  "function transferAsset(address to, uint256 tokenId) public",
  "function getAssetsByOwner(address owner) public view returns (uint256[])",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

export const getContract = () => contract;
export const getSigner = () => signer;
