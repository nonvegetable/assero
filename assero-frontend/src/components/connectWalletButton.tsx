"use client";
import { useAuth } from '@/contexts/AuthContext';

export default function ConnectWalletButton() {
  const { isAuthenticated, connect, disconnect, loading } = useAuth();

  return (
    <button
      onClick={() => isAuthenticated ? disconnect() : connect()}
      disabled={loading}
      className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 transition"
    >
      {loading ? "Connecting..." : 
       isAuthenticated ? "Disconnect Wallet" : 
       "Connect Wallet"}
    </button>
  );
}