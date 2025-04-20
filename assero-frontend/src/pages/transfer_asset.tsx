import React from "react";
import TransferAssetForm from "@/components/transfer_page/transfer_asset_form";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function TransferAsset() {
  return (
    <div className="">
      <ProtectedRoute>
        <TransferAssetForm />
      </ProtectedRoute>
    </div>
  );
}
