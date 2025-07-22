"use client";

import React from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useRouter();

  // Simple MetaMask connect (optional)
  const connect = async () => {
    if (!(window as any).ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }
    try {
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      toast.success("Connected via MetaMask");
      router.replace("/dashboard");
    } catch (e) {
      toast.error("Connection failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl mb-8">Connect with MetaMask to Login</h1>
      <button
        onClick={connect}
        className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 transition"
      >
        Connect MetaMask
      </button>
    </div>
  );
};

export default LoginPage;