import React from "react";
import {
  Sprout,
  CreditCard,
  Radio,
  Plus,
  MapPin,
  LogOut,
  Layers,
  Truck,
  X
} from "lucide-react";
import type { User, UserRole } from "../types";

export interface SidebarProps {
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: "en" | "hi";
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  // Optional backward-compatibility props
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleLang?: (lang: "en" | "hi") => void;
  onOpenNewListing?: () => void;
  onResetData?: () => void;
  onSignOut?: () => void;
  onOpenApiDocs?: () => void;
  onSelectUserRole?: (role: UserRole) => void;
}

interface NavItemConfig {
  id: string;
  targetTab: string;
  labelEn: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onSelectTab,
  lang,
  isOpen,
  onClose,
  onToggle,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenNewListing,
  onSignOut,
  onSelectUserRole
}) => {
  // Role-appropriate navigation items with zero promo badges or clutter
  const farmerNavItems: NavItemConfig[] = [
    {
      id: "inventory",
      targetTab: "inventory",
      labelEn: "Farm Inventory",
      labelHi: "मेरी फसल व उपज",
      icon: Sprout
    },
    {
      id: "buyer_requests",
      targetTab: "buyer_requests",
      labelEn: "Buyer Demands",
      labelHi: "खरीदार मांग (RFQ)",
      icon: Layers
    },
    {
      id: "payouts",
      targetTab: "payouts",
      labelEn: "Payouts & Escrow",
      labelHi: "भुगतान व एस्क्रो",
      icon: CreditCard
    },
    {
      id: "pricing",
      targetTab: "pricing",
      labelEn: "Mandi Rates",
      labelHi: "लाइव मंडी भाव",
      icon: Radio
    }
  ];

  const buyerNavItems: NavItemConfig[] = [
    {
      id: "bulk_orders",
      targetTab: "bulk_orders",
      labelEn: "Bulk RFQs",
      labelHi: "थोक मांग",
      icon: Layers
    },
    {
      id: "contracts",
      targetTab: "contracts",
      labelEn: "Contracts Tracking",
      labelHi: "अनुबंध ट्रैकिंग",
      icon: Truck
    },
    {
      id: "payments",
      targetTab: "payments",
      labelEn: "Payments & Escrow",
      labelHi: "भुगतान व एस्क्रो",
      icon: CreditCard
    },
    {
      id: "pricing",
      targetTab: "pricing",
      labelEn: "Mandi Rates",
      labelHi: "लाइव मंडी भाव",
      icon: Radio
    }
  ];

  const navItems = user.role === "FARMER" ? farmerNavItems : buyerNavItems;

  // Determine sidebar visibility from unified or legacy props
  const isSidebarOpen = isOpen !== undefined
    ? isOpen
    : (isMobileOpen !== undefined ? isMobileOpen : !isCollapsed);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onCloseMobile) {
      onCloseMobile();
    } else if (onToggleCollapse && !isCollapsed) {
      onToggleCollapse();
    } else if (onToggle) {
      onToggle();
    }
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleNavClick = (item: NavItemConfig) => {
    onSelectTab(item.targetTab);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      handleClose();
    }
  };

  const handleQuickAction = () => {
    if (user.role === "FARMER") {
      if (onOpenNewListing) {
        onOpenNewListing();
      } else {
        onSelectTab("inventory");
      }
    } else {
      onSelectTab("bulk_orders");
    }
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      handleClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (Active only when sidebar is open on small screens) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Modern Collapsible Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transition-transform duration-300 ease-in-out flex flex-col select-none shadow-xl lg:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
        aria-label="Application Sidebar"
        aria-hidden={!isSidebarOpen}
      >
        {/* =================================================================== */}
        {/* 1. Header with App Branding & Close Button (X)                      */}
        {/* =================================================================== */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200/70 shrink-0">
          <button
            type="button"
            onClick={() => {
              const defaultTab = user.role === "FARMER" ? "inventory" : "bulk_orders";
              onSelectTab(defaultTab);
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                handleClose();
              }
            }}
            className="flex items-center gap-2.5 text-left rounded-xl cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]/30"
            title="किसानSetu Agricultural Exchange"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F6A53] to-[#0B5745] flex items-center justify-center text-white shadow-xs group-hover:scale-[1.03] transition-transform duration-200 shrink-0">
              <Sprout className="w-5 h-5 text-white" strokeWidth={2.2} aria-hidden="true" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                किसान<span className="text-[#0F6A53]">Setu</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 mt-1 leading-none truncate">
                {user.role === "FARMER"
                  ? (lang === "hi" ? "किसान पोर्टल" : "Producer Portal")
                  : (lang === "hi" ? "थोक खरीदार" : "Wholesale Desk")}
              </span>
            </div>
          </button>

          {/* Close button (X) inside the expanded Sidebar */}
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200/80 transition cursor-pointer"
            title="Close navigation sidebar"
            aria-label="Close navigation sidebar"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>


        {/* =================================================================== */}
        {/* 2. Streamlined Navigation Menu Items                                */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <nav className="space-y-1" role="navigation" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.targetTab;
              const itemLabel = lang === "hi" ? item.labelHi : item.labelEn;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`w-full group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer text-left ${isActive
                      ? "bg-[#F0F8F5] text-[#0F6A53] font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-150 ${isActive ? "text-[#0F6A53]" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="truncate">{itemLabel}</span>

                  {/* Active indicator bar on left */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#0F6A53] rounded-r-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>


        {/* =================================================================== */}
        {/* 3. Quick Action CTA (Role-Aware)                                    */}
        {/* =================================================================== */}
        <div className="p-3 shrink-0">
          <button
            type="button"
            onClick={handleQuickAction}
            className="w-full h-10 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs text-white bg-gradient-to-r from-[#0F6A53] to-[#0B5745] hover:brightness-105 active:scale-[0.99] transition shadow-xs hover:shadow cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" strokeWidth={2.4} />
            <span>
              {user.role === "FARMER"
                ? (lang === "hi" ? "नई फसल जोड़ें" : "List New Harvest")
                : (lang === "hi" ? "थोक मांग भेजें" : "Post Bulk RFQ")}
            </span>
          </button>
        </div>


        {/* =================================================================== */}
        {/* 4. User Profile Footer Card & Sign Out                              */}
        {/* =================================================================== */}
        <div className="p-3 border-t border-slate-200/70 bg-slate-50/50 shrink-0">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F6A53] to-[#0B5745] text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  <span>{user.district}, {user.state}</span>
                </div>
              </div>
            </div>

            {/* Sign Out Option */}
            {onSignOut && (
              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  handleClose();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "लॉग आउट करें" : "Sign Out"}</span>
              </button>
            )}
          </div>
        </div>

      </aside>
    </>
  );
};
