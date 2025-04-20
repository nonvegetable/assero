"use client";

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth instance is undefined.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Handle auth state changes if needed
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <Toaster position="top-right" />
      {children}
    </AuthProvider>
  );
}