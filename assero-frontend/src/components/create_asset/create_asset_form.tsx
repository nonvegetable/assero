'use client';
import React, { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";

const CreateAsset = () => {
  const [assetType, setAssetType] = useState("vehicle");
  const [formData, setFormData] = useState({
    ownerName: "",
    dateOfBirth: "",
    idNumber: "",
    email: "",
    mobile: "",
    address: "",
    // Vehicle specific fields
    registrationNumber: "",
    vin: "",
    engineNumber: "",
    makeModel: "",
    fuelType: "",
    manufactureYear: "",
    color: "",
    insuranceDetails: "",
    pucCertificate: "",
    // Property specific fields
    propertyAddress: "",
    propertyType: "",
    propertyArea: "",
    registrationId: "",
    surveyNumber: "",
    marketValue: "",
    constructionYear: "",
    coOwnerDetails: "",
  });
  const [isPending, setIsPending] = useState(false);

  const inputClass = "w-full border border-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAssetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssetType(e.target.value);
  };

  const handleSubmit = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      setIsPending(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
  
      // If no accounts are connected, prompt once
      if (!accounts.length) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }
  
      const signer = await provider.getSigner();
      // ... call your contract
    } catch (err) {
      // if user dismisses MetaMask or already pending
      console.error("Error creating asset:", err);
    }
    finally {
      setIsPending(false);
    }
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
            create your asset
          </h1>

          <div className="mb-6">
            <label htmlFor="assetType" className="block text-[1.5rem] font-medium mb-1 text-black">
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

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="ownerName" className="block text-[1.5rem] font-medium mb-1 text-black">
                full name of owner
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-[1.5rem] font-medium mb-1 text-black">
                date of birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="idNumber" className="block text-[1.5rem] font-medium mb-1 text-black">
                aadhar or pan number
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[1.5rem] font-medium mb-1 text-black">
                email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {assetType === "vehicle" ? (
            <>
              {/* Vehicle Specific Fields */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="registrationNumber" className="block text-[1.5rem] font-medium mb-1 text-black">
                    registration number
                  </label>
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="vin" className="block text-[1.5rem] font-medium mb-1 text-black">
                    vehicle identification number (vin)
                  </label>
                  <input
                    type="text"
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="makeModel" className="block text-[1.5rem] font-medium mb-1 text-black">
                  make/model
                </label>
                <input
                  type="text"
                  id="makeModel"
                  name="makeModel"
                  value={formData.makeModel}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </>
          ) : (
            <>
              {/* Property Specific Fields */}
              <div className="mb-6">
                <label htmlFor="propertyAddress" className="block text-[1.5rem] font-medium mb-1 text-black">
                  property address
                </label>
                <textarea
                  id="propertyAddress"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  className={inputClass}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="propertyType" className="block text-[1.5rem] font-medium mb-1 text-black">
                    property type
                  </label>
                  <input
                    type="text"
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="propertyArea" className="block text-[1.5rem] font-medium mb-1 text-black">
                    property area (sq ft)
                  </label>
                  <input
                    type="text"
                    id="propertyArea"
                    name="propertyArea"
                    value={formData.propertyArea}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-[#17F538] text-black py-2 px-4 rounded-lg font-medium hover:opacity-80 transition duration-300 border-2 border-black"
          >
            create asset
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAsset;
