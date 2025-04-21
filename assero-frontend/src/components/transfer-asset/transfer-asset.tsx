"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";
import toast from "react-hot-toast";

export {};

declare global {
  interface Window {
    ethereum?: any;
  }
}

const TransferAsset = () => {
  const [tokenId, setTokenId] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      
      const tx = await contract.transferAsset(toAddress, tokenId);
      await tx.wait();
      
      toast.success("Asset transferred successfully!");
      setTokenId("");
      setToAddress("");
    } catch (error: any) {
      console.error("Error transferring asset:", error);
      toast.error(error.message || "Error transferring asset");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="absolute right-0 top-0 h-full w-16 bg-[#17F538]"></div>
      
      <div className="p-6 pr-20">
        <h1 className="text-[3.5rem] font-bold mb-6 text-black">transfer asset</h1>
        
        <form onSubmit={handleTransfer} className="max-w-md">
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">
              Token ID:
            </label>
            <input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">
              Recipient Address:
            </label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? "Transferring..." : "Transfer Asset"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferAsset;