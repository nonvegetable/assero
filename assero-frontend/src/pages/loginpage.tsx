"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useRouter();
  const { isConnected, connect, loading, ready } = useAuth();

  useEffect(() => {
    if (ready && !loading && isConnected) {
      toast.success("Connected via MetaMask");
      router.replace("/dashboard");
    }
  }, [loading, isConnected, ready, router]);

  if (!ready || loading) {
    return <div>Loading...</div>; // Wait until ready
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl mb-8">Connect with MetaMask to Login</h1>
      <button
        onClick={connect}
        className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 transition"
        disabled={loading}
      >
        {loading ? "Connecting..." : "Connect MetaMask"}
      </button>
    </div>
  );
};

export default LoginPage;