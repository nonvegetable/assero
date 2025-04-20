"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface AuthContextType {
  user: { account: string; signer: ethers.JsonRpcSigner } | null;
  isConnected: boolean;
  loading: boolean;
  ready: boolean; // New state to indicate readiness
  connect: () => Promise<void>;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isConnected: false,
  loading: false,
  ready: false, // Default to false
  connect: async () => {},
  disconnect: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ account: string; signer: ethers.JsonRpcSigner } | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false); // New state

  const connect = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask not detected. Please install it!");
      return;
    }
    try {
      setLoading(true);
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setUser({ account: accounts[0], signer });
        setIsConnected(true);
        localStorage.setItem("isConnected", "true");
      }
    } catch (error) {
      console.error("MetaMask connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem("isConnected");
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          localStorage.setItem("isConnected", "true");
        }
      }
      setReady(true); // Mark as ready after checking connection
    };
    checkConnection();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isConnected, loading, ready, connect, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);