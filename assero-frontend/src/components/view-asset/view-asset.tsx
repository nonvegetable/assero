"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";
import toast from "react-hot-toast";

interface Asset {
  id: number;
  owner: string;
  uri: string;
}

const ViewAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);

        const contract = getContract(provider);
        const ownedTokens = await contract.getAssetsByOwner(address);
        
        const assetData = await Promise.all(
          ownedTokens.map(async (tokenId: number) => {
            const uri = await contract.tokenURI(tokenId);
            return {
              id: tokenId,
              owner: address,
              uri
            };
          })
        );
        
        setAssets(assetData);
      } catch (error: any) {
        console.error("Error loading assets:", error);
        toast.error(error.message || "Error loading assets");
      }
      setLoading(false);
    };

    loadAssets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="absolute right-0 top-0 h-full w-16 bg-[#17F538]"></div>

      <div className="p-6 pr-20">
        <h1 className="text-[3.5rem] font-bold mb-6 text-black">your assets</h1>
        
        {userAddress && (
          <p className="text-black mb-4">
            Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border-2 border-black rounded-lg shadow-lg p-4 hover:-translate-y-1 transition-transform"
            >
              <h2 className="text-[1.5rem] font-bold text-black mb-2">
                Asset #{asset.id}
              </h2>
              <p className="text-black text-sm">
                <span className="font-semibold">URI:</span> {asset.uri}
              </p>
            </div>
          ))}
        </div>

        {assets.length === 0 && (
          <p className="text-black mt-6">You don't own any assets yet.</p>
        )}
      </div>
    </div>
  );
};

export default ViewAssets;
