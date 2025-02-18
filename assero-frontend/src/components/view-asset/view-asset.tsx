"use client";
import React, { useState } from "react";

const ViewAssets = () => {
  const [assetType, setAssetType] = useState("all");

  // Dummy Asset Data (Vehicles and Properties)
  const assets = [
    {
      id: "VEH-12345",
      type: "vehicle",
      name: "Hyundai Creta 2022",
      owner: "John Doe",
      registrationNumber: "MH12AB3456",
      vin: "1HGBH41JXMN109186",
      color: "White",
    },
    {
      id: "PROP-67890",
      type: "property",
      name: "Greenwood Apartment",
      owner: "Jane Smith",
      propertyAddress: "Sector 15, Gurgaon",
      area: "1200 sqft",
    },
    {
      id: "VEH-54321",
      type: "vehicle",
      name: "Tata Nexon EV",
      owner: "Alice Johnson",
      registrationNumber: "DL9CA1234",
      vin: "2GBHH78JXMN293456",
      color: "Blue",
    },
    {
      id: "PROP-11223",
      type: "property",
      name: "Palm Villa",
      owner: "Bob Brown",
      propertyAddress: "Kandivali East, Mumbai",
      area: "2000 sqft",
    },
  ];

  // Filtered assets based on assetType
  const filteredAssets =
    assetType === "all"
      ? assets
      : assets.filter((asset) => asset.type === assetType);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Green Strip */}
      <div className="absolute right-0 top-0 h-full w-16 bg-[#17F538]"></div>

      <div className="p-6 pr-20">
        <h1 className="text-[3.5rem] font-bold mb-6 text-black">your assets</h1>

        {/* Dropdown to Filter by Asset Type */}
        <div className="mb-8">
          <label
            htmlFor="assetType"
            className="block text-[1.5rem] font-medium mb-2 text-black"
          >
            filter by asset type
          </label>
          <select
            id="assetType"
            name="assetType"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="w-full border border-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          >
            <option value="all">all</option>
            <option value="vehicle">vehicles</option>
            <option value="property">properties</option>
          </select>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border-2 border-black rounded-lg shadow-lg p-4 flex flex-col justify-between h-48 transition-transform transform hover:-translate-y-2 hover:shadow-2xl duration-300 cursor-pointer"
            >
              <div>
                <h2 className="text-[1.5rem] font-bold text-black mb-2">
                  {asset.name}
                </h2>
                <p className="text-black text-sm">
                  <span className="font-semibold">Owner:</span> {asset.owner}
                </p>
                {asset.type === "vehicle" && (
                  <>
                    <p className="text-black text-sm">
                      <span className="font-semibold">Registration:</span>{" "}
                      {asset.registrationNumber}
                    </p>
                    <p className="text-black text-sm">
                      <span className="font-semibold">VIN:</span> {asset.vin}
                    </p>
                    <p className="text-black text-sm">
                      <span className="font-semibold">Color:</span> {asset.color}
                    </p>
                  </>
                )}
                {asset.type === "property" && (
                  <>
                    <p className="text-black text-sm">
                      <span className="font-semibold">Address:</span>{" "}
                      {asset.propertyAddress}
                    </p>
                    <p className="text-black text-sm">
                      <span className="font-semibold">Area:</span> {asset.area}
                    </p>
                  </>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-600">
                <span className="font-semibold">Asset ID:</span> {asset.id}
              </p>
            </div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <p className="text-black mt-6">No assets found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewAssets;
