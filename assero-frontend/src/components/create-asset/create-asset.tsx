"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";
import toast from "react-hot-toast";

const CreateAsset = () => {
  const [tokenURI, setTokenURI] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      
      const tx = await contract.createAsset(tokenURI);
      await tx.wait();
      
      toast.success("Asset created successfully!");
      setTokenURI("");
    } catch (error: any) {
      console.error("Error creating asset:", error);
      toast.error(error.message || "Error creating asset");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="absolute right-0 top-0 h-full w-16 bg-[#17F538]"></div>
      
      <div className="p-6 pr-20">
        <h1 className="text-[3.5rem] font-bold mb-6 text-black">create asset</h1>
        
        <form onSubmit={handleCreateAsset} className="max-w-md">
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">
              Asset URI:
            </label>
            <input
              type="text"
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
              placeholder="e.g., ipfs://your-asset-uri"
              className="w-full px-3 py-2 border-2 border-black rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Asset"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAsset;