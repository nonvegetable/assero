"use client";

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any class modifications that could cause hydration mismatches
  useEffect(() => {
    // Client-side only code here
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  );
}