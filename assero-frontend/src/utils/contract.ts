// src/utils/contract.ts

import { ethers } from "ethers";

// 1) Put your deployed contract’s address here
const contractAddress = "0xYOURCONTRACTADDRESS"; // e.g., 0xabcd123...

// 2) List the functions (ABI) you want to call in your contract
// This is minimal, add more if your contract has them
const contractABI = [
  "function mintAsset(address to) public returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
];

// 3) Provide a function to get the contract
export function getContract(signerOrProvider: ethers.BrowserProvider | ethers.Signer) {
  return new ethers.Contract(contractAddress, contractABI, signerOrProvider);
}
