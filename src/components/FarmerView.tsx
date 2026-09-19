import React, { useState, useEffect } from "react";
import { CropListing, Order, User } from "../types";
import { FarmerInventory } from "./farmer/FarmerInventory";
import { FarmerBuyerRequests } from "./farmer/FarmerBuyerRequests";
import { FarmerPayouts } from "./farmer/FarmerPayouts";
import { FarmerWeatherInsights } from "./farmer/FarmerWeatherInsights";
import { FarmerCropForm } from "./farmer/FarmerCropForm";

export type FarmerSubTab = "inventory" | "buyer_requests" | "payouts" | "pricing";

interface FarmerViewProps {
  farmer: User;
  listings: CropListing[];
  orders: Order[];
  onListingCreated: (listing: CropListing) => void;
  onListingUpdated?: (listing: CropListing) => void;
  onListingDeleted?: (listingId: number) => void;
  onOrderStatusUpdate: (orderId: number, status: string) => void;
  lang: "en" | "hi";
  openCreateModal?: boolean;
  onCloseCreateModal?: () => void;
  activeSubTab?: FarmerSubTab;
  onSelectSubTab?: (tab: FarmerSubTab) => void;
  externalSearch?: string;
}

export const FarmerView: React.FC<FarmerViewProps> = ({
  farmer,
  listings,
  orders,
  onListingCreated,
  onListingUpdated,
  onListingDeleted,
  onOrderStatusUpdate,
  lang,
  openCreateModal,
  onCloseCreateModal,
  activeSubTab = "inventory",
  externalSearch
}) => {
  const [internalTab, setInternalTab] = useState<FarmerSubTab>(activeSubTab);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<CropListing | null>(null);

  useEffect(() => {
    if (activeSubTab) {
      setInternalTab(activeSubTab);
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (openCreateModal) {
      setEditingListing(null);
      setIsFormOpen(true);
      onCloseCreateModal?.();
    }
  }, [openCreateModal, onCloseCreateModal]);

  const handleOpenCreateForm = () => {
    setEditingListing(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (listing: CropListing) => {
    setEditingListing(listing);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (listing: CropListing) => {
    setIsFormOpen(false);
    if (editingListing) {
      if (onListingUpdated) onListingUpdated(listing);
      else onListingCreated(listing);
    } else {
      onListingCreated(listing);
    }
    setEditingListing(null);
  };

  if (isFormOpen) {
    return (
      <FarmerCropForm
        farmer={farmer}
        editingListing={editingListing}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingListing(null);
        }}
        lang={lang}
      />
    );
  }

  return (
    <div className="space-y-6">
      {internalTab === "inventory" && (
        <FarmerInventory
          farmer={farmer}
          listings={listings}
          orders={orders}
          lang={lang}
          onOrderStatusUpdate={onOrderStatusUpdate}
          onOpenCreateModal={handleOpenCreateForm}
          onOpenEditModal={handleOpenEditForm}
          onListingDeleted={onListingDeleted}
          externalSearch={externalSearch}
        />
      )}

      {internalTab === "buyer_requests" && (
        <FarmerBuyerRequests
          farmer={farmer}
          listings={listings}
          lang={lang}
        />
      )}

      {internalTab === "payouts" && (
        <FarmerPayouts
          farmer={farmer}
          orders={orders}
          lang={lang}
          onOrderStatusUpdate={onOrderStatusUpdate}
        />
      )}

      {internalTab === "pricing" && (
        <FarmerWeatherInsights
          farmer={farmer}
          lang={lang}
        />
      )}
    </div>
  );
};