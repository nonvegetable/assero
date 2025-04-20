import React from "react";
import CreateAssetForm from "../components/create_asset/create_asset_form";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CreateAsset() {
  return (
    <div className="">
      <ProtectedRoute>
        <CreateAssetForm />
      </ProtectedRoute>
    </div>
  );
}

