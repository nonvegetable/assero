"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isConnected, loading, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !loading && !isConnected) {
      console.log("[ProtectedRoute] User not authenticated; redirecting to /login");
      router.replace("/login");
    }
  }, [isConnected, loading, ready, router]);

  if (!ready || loading) {
    return <div>Loading...</div>; // Wait until ready
  }

  return <>{isConnected ? children : null}</>;
};

export default ProtectedRoute;