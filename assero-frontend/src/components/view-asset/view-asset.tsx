"use client";
import React, { useState, useEffect } from "react";
import { getContract } from "@/utils/contract";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import BackButton from '../common/BackButton';
import NavBar from '../common/NavBar';
import { FaCopy } from 'react-icons/fa';

interface AssetMetadata {
  title: string;
  description: string;
  creationDate: string;
  assetType: "house" | "car" | "land";
  [key: string]: any;
}

interface Asset {
  tokenId: string;
  metadata: AssetMetadata;
}

const ViewAsset = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      
      // Get the signer's address
      const address = await signer.getAddress();
      
      // Get token IDs owned by the address
      const tokenIds = await contract.getAssetsByOwner(address);
      
      const assetPromises = tokenIds.map(async (tokenId: bigint) => {
        try {
          const tokenURI = await contract.tokenURI(tokenId);
          // Handle base64 encoded JSON data
          const metadata = JSON.parse(atob(tokenURI.split(',')[1]));
          return {
            tokenId: tokenId.toString(),
            metadata
          };
        } catch (error) {
          console.error(`Error fetching metadata for token ${tokenId}:`, error);
          return null;
        }
      });

      const fetchedAssets = (await Promise.all(assetPromises)).filter(asset => asset !== null);
      setAssets(fetchedAssets as Asset[]);
    } catch (error: any) {
      console.error("Error fetching assets:", error);
      toast.error(error.message || "Error fetching assets");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Token ID copied to clipboard!');
  };

  const renderAssetDetails = (asset: Asset) => {
    const { metadata } = asset;

    const renderSpecificFields = () => {
      switch (metadata.assetType) {
        case "house":
          return (
            <div className="mt-2">
              <p><span className="font-bold">House ID:</span> {metadata.houseId}</p>
              <p><span className="font-bold">Address:</span> {metadata.propertyAddress}</p>
              <p><span className="font-bold">Square Footage:</span> {metadata.squareFootage} sq ft</p>
            </div>
          );
        case "car":
          return (
            <div className="mt-2">
              <p><span className="font-bold">Registration:</span> {metadata.registrationNumber}</p>
              <p><span className="font-bold">License Plate:</span> {metadata.licensePlate}</p>
              <p><span className="font-bold">Make & Model:</span> {metadata.makeModel}</p>
            </div>
          );
        case "land":
          return (
            <div className="mt-2">
              <p><span className="font-bold">Registry Number:</span> {metadata.registryNumber}</p>
              <p><span className="font-bold">Plot Size:</span> {metadata.plotSize} sq ft</p>
              <p><span className="font-bold">Coordinates:</span> {metadata.coordinates}</p>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div key={asset.tokenId} className="bg-white p-6 rounded-lg shadow-md mb-4 border-2 border-black">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-black">{metadata.title}</h3>
            <div className="flex items-center gap-2 mt-2 bg-gray-100 p-2 rounded">
              <span className="text-sm font-semibold text-black">Token ID: {asset.tokenId}</span>
              <button 
                onClick={() => copyToClipboard(asset.tokenId)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy Token ID"
              >
                <FaCopy className="text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-black-600 mt-1 text-black">Created: {metadata.creationDate}</p>
          </div>
          <span className="bg-[#17F538] px-3 py-1 rounded-full text-sm capitalize text-black">
            {metadata.assetType}
          </span>
        </div>
        
        <p className="mt-3 text-black">{metadata.description}</p>
        
        {renderSpecificFields()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="absolute right-0 top-0 h-full w-16 bg-[#17F538]"></div>
      <NavBar />
      <BackButton />
      
      
      <div className="p-6 pr-24 pt-32">
        <h1 className="text-[3.5rem] font-bold mb-6 text-black">your assets</h1>
        
        {loading ? (
          <p>Loading assets...</p>
        ) : assets.length === 0 ? (
          <p className="text-black">No assets found. Create some assets to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(asset => renderAssetDetails(asset))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAsset;
