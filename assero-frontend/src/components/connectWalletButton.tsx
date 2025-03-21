"use client";
import React from "react";

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

// We'll add a function soon
const connectMetaMask = async () => {
  // 1) Check if MetaMask exists
  if (!window.ethereum) {
    alert("MetaMask not detected. Please install it.");
    return;
  }
  // 2) Ask user for account access
  await window.ethereum.request({ method: "eth_requestAccounts" });

  console.log("MetaMask is connected!");
};

export default function ConnectWalletButton() {
  return (
    <button onClick={connectMetaMask}>
      Connect Wallet
    </button>
  );
}