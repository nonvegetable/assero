"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ViewAsset from "@/components/view-asset/view-asset";

export default function ViewAssetPage() {
  return (
    <ProtectedRoute>
      <ViewAsset />
    </ProtectedRoute>
  );
}