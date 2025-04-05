import { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ethers } from 'ethers';
import { auth } from '@/utils/firebase';
import { signInWithCustomToken } from 'firebase/auth';

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  loading: boolean
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  connect: async () => {},
  disconnect: async () => {},
  loading: false,
  error: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask!');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // Get nonce from backend
      const nonceResponse = await fetch('http://localhost:4000/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }

      const { nonce } = await nonceResponse.json();

      // Sign message
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonce);

      // Get Firebase custom token
      const tokenResponse = await fetch('http://localhost:4000/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to verify signature');
      }

      const { customToken } = await tokenResponse.json();

      // Sign in with Firebase
      await signInWithCustomToken(auth, customToken);

    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      connect,
      disconnect,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);