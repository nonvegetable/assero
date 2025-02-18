"use client";
import React, { useState } from "react";

const TransferAsset = () => {
  const [assetType, setAssetType] = useState("vehicle");
  const [formData, setFormData] = useState({
    assetId: "",
    currentOwner: "",
    newOwnerName: "",
    newOwnerEmail: "",
    newOwnerWallet: "",
  });

  const inputClass =
    "w-full border border-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAssetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssetType(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Transfer Request Submitted:", formData);
    // Add blockchain asset transfer logic here
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Green Strip */}
      <div className="absolute right-0 top-0 h-full w-16 bg-[#17F538]"></div>

      <div className="p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-3xl p-8 text-black"
        >
          <h1 className="text-[3.5rem] font-bold mb-6 text-black">
            transfer your asset
          </h1>

          <div className="mb-6">
            <label
              htmlFor="assetType"
              className="block text-[1.5rem] font-medium mb-1 text-black"
            >
              asset type
            </label>
            <select
              id="assetType"
              name="assetType"
              value={assetType}
              onChange={handleAssetTypeChange}
              className={inputClass}
            >
              <option value="vehicle">vehicle</option>
              <option value="property">property</option>
            </select>
          </div>

          <div className="mb-6">
            <label
              htmlFor="assetId"
              className="block text-[1.5rem] font-medium mb-1 text-black"
            >
              asset ID (Registration Number / Property ID)
            </label>
            <input
              type="text"
              id="assetId"
              name="assetId"
              value={formData.assetId}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="currentOwner"
              className="block text-[1.5rem] font-medium mb-1 text-black"
            >
              current owner
            </label>
            <input
              type="text"
              id="currentOwner"
              name="currentOwner"
              value={formData.currentOwner}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <h2 className="text-[2rem] font-semibold mb-4 text-black">
            new owner details
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="newOwnerName"
                className="block text-[1.5rem] font-medium mb-1 text-black"
              >
                full name
              </label>
              <input
                type="text"
                id="newOwnerName"
                name="newOwnerName"
                value={formData.newOwnerName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="newOwnerEmail"
                className="block text-[1.5rem] font-medium mb-1 text-black"
              >
                email address
              </label>
              <input
                type="email"
                id="newOwnerEmail"
                name="newOwnerEmail"
                value={formData.newOwnerEmail}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="newOwnerWallet"
              className="block text-[1.5rem] font-medium mb-1 text-black"
            >
              new owner wallet address
            </label>
            <input
              type="text"
              id="newOwnerWallet"
              name="newOwnerWallet"
              value={formData.newOwnerWallet}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#17F538] text-black py-2 px-4 rounded-lg font-medium hover:opacity-80 transition duration-300 border-2 border-black"
          >
            transfer asset
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferAsset;
