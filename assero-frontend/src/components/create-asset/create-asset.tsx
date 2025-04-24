"use client";
import React, { useState } from "react";
import { getContract } from "@/utils/contract";
import toast from "react-hot-toast";
import BackButton from '../common/BackButton';

type AssetType = "house" | "car" | "land";

interface AssetData {
  assetType: AssetType;
  tokenURI: string;
  metadata: {
    title: string;
    description: string;
    creationDate: string;
    [key: string]: any;
  };
}

const CreateAsset = () => {
  const [assetType, setAssetType] = useState<AssetType>("house");
  const [assetData, setAssetData] = useState<AssetData>({
    assetType: "house",
    tokenURI: "",
    metadata: {
      title: "",
      description: "",
      creationDate: new Date().toISOString().split('T')[0],
    },
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "assetType") {
      setAssetType(value as AssetType);
      setAssetData(prev => ({
        ...prev,
        assetType: value as AssetType,
        metadata: {
          ...prev.metadata,
          title: "",
          description: "",
        }
      }));
    } else if (name.startsWith("metadata.")) {
      const metadataField = name.split(".")[1];
      setAssetData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate metadata URI
      const metadataString = JSON.stringify(assetData.metadata);
      const tokenURI = `data:application/json;base64,${btoa(metadataString)}`;

      const contract = getContract();
      const tx = await contract.createAsset(tokenURI);
      await tx.wait();
      
      toast.success("Asset created successfully!");
      // Reset form
      setAssetData({
        assetType: "house",
        tokenURI: "",
        metadata: {
          title: "",
          description: "",
          creationDate: new Date().toISOString().split('T')[0],
        },
      });
    } catch (error: any) {
      console.error("Error creating asset:", error);
      toast.error(error.message || "Error creating asset");
    }
    
    setLoading(false);
  };

  const renderAssetSpecificFields = () => {
    switch (assetType) {
      case "house":
        return (
          <>
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">
                House ID
              </label>
              <input
                type="text"
                name="metadata.houseId"
                value={assetData.metadata.houseId || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">
                Property Address
              </label>
              <input
                type="text"
                name="metadata.propertyAddress"
                value={assetData.metadata.propertyAddress || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">
                Square Footage
              </label>
              <input
                type="number"
                name="metadata.squareFootage"
                value={assetData.metadata.squareFootage || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded"
                required
              />
            </div>
          </>
        );

      case "car":
        return (
          <>
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">
                Registration Number
              </label>
              <input
                type="text"
                name="metadata.registrationNumber"
                value={assetData.metadata.registrationNumber || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">
                License Plate
              </label>
              <input
                type="text"
                name="metadata.licensePlate"
                value={assetData.metadata.licensePlate || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">
                Make & Model
              </label>
              <input
                type="text"
                name="metadata.makeModel"
                value={assetData.metadata.makeModel || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded"
                required
              />
            </div>
          </>
        );

      case "land":
        return (
          <>
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">
                Land Registry Number
              </label>
              <input
                type="text"
                name="metadata.registryNumber"
                value={assetData.metadata.registryNumber || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">
                Plot Size (sq ft)
              </label>
              <input
                type="number"
                name="metadata.plotSize"
                value={assetData.metadata.plotSize || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">
                Location Coordinates
              </label>
              <input
                type="text"
                name="metadata.coordinates"
                value={assetData.metadata.coordinates || ""}
                onChange={handleInputChange}
                placeholder="lat,long"
                className="w-full px-3 py-2 border-2 border-black rounded"
                required
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      <BackButton />
      <div className="absolute right-0 top-0 h-full w-16 bg-[#17F538]"></div>
      
      <div className="p-6 pr-20 pt-20">
        <h1 className="text-[3.5rem] font-bold mb-6 text-black">create asset</h1>
        
        <form onSubmit={handleCreateAsset} className="max-w-md">
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">
              Asset Type
            </label>
            <select
              name="assetType"
              value={assetType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-2 border-black rounded"
              required
            >
              <option value="house">House</option>
              <option value="car">Car</option>
              <option value="land">Land</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              name="metadata.title"
              value={assetData.metadata.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-2 border-black rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="metadata.description"
              value={assetData.metadata.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-2 border-black rounded"
              required
              rows={3}
            />
          </div>

          {renderAssetSpecificFields()}
          
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