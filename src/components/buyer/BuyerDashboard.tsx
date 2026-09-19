import React from "react";
import { CropListing, Order, User } from "../../types";
import { BuyerMarketplace } from "../BuyerMarketplace";
import { BuyerBulkOrders } from "./BuyerBulkOrders";
import { BuyerContractsTracking } from "./BuyerContractsTracking";
import { BuyerPaymentEscrow } from "./BuyerPaymentEscrow";

export type BuyerSubTab = "marketplace" | "bulk_orders" | "contracts" | "payments";

interface BuyerDashboardProps {
  buyer: User;
  listings: CropListing[];
  orders: Order[];
  lang: "en" | "hi";
  activeTab: BuyerSubTab;
  onSelectTab: (tab: BuyerSubTab) => void;
  onOpenOrderModal: (listing: CropListing) => void;
  onOrderStatusUpdate: (orderId: number, status: string, otp?: string) => Promise<void>;
  onVerifyPayment?: (payload: { orderId: number; upiId: string; amount: number }) => Promise<void>;
  externalSearch?: string;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  buyer,
  listings,
  orders,
  lang,
  activeTab,
  onOpenOrderModal,
  onOrderStatusUpdate,
  onVerifyPayment,
  externalSearch
}) => {
  return (
    <div className="space-y-6">
      {activeTab === "marketplace" && (
        <BuyerMarketplace
          buyer={buyer}
          listings={listings}
          onOpenOrderModal={onOpenOrderModal}
          lang={lang}
          externalSearch={externalSearch}
        />
      )}

      {activeTab === "bulk_orders" && (
        <BuyerBulkOrders
          buyer={buyer}
          listings={listings}
          lang={lang}
          onOpenOrderModal={onOpenOrderModal}
        />
      )}

      {activeTab === "contracts" && (
        <BuyerContractsTracking
          buyer={buyer}
          orders={orders}
          lang={lang}
          onOrderStatusUpdate={onOrderStatusUpdate}
        />
      )}

      {activeTab === "payments" && (
        <BuyerPaymentEscrow
          buyer={buyer}
          orders={orders}
          lang={lang}
          onVerifyPayment={onVerifyPayment}
        />
      )}
    </div>
  );
};

