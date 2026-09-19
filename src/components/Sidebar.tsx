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
  ShoppingBasket,
  TrendingUp,
  Navigation,
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
  shortLabelEn: string;
  shortLabelHi: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onSelectTab,
  lang,
  isOpen = true,
  onClose,
  onOpenNewListing,
  onSignOut
}) => {
  const farmerNavItems: NavItemConfig[] = [
    {
      id: "inventory",
      targetTab: "inventory",
      labelEn: "Farm Inventory",
      labelHi: "मेरी फसल व उपज",
      shortLabelEn: "Inventory",
      shortLabelHi: "उपज",
      icon: Sprout
    },
    {
      id: "ai_pricing",
      targetTab: "ai_pricing",
      labelEn: "AI Price Engine",
      labelHi: "AI मूल्य इंजन",
      shortLabelEn: "AI Price",
      shortLabelHi: "AI भाव",
      icon: TrendingUp
    },
    {
      id: "route_optimizer",
      targetTab: "route_optimizer",
      labelEn: "Logistics Routes",
      labelHi: "लॉजिस्टिक्स मार्ग",
      shortLabelEn: "Routes",
      shortLabelHi: "मार्ग",
      icon: Navigation
    },
    {
      id: "pricing",
      targetTab: "pricing",
      labelEn: "Mandi Rates",
      labelHi: "लाइव मंडी भाव",
      shortLabelEn: "Mandi",
      shortLabelHi: "मंडी भाव",
      icon: Radio
    },
    {
      id: "buyer_requests",
      targetTab: "buyer_requests",
      labelEn: "Buyer Demands",
      labelHi: "खरीदार मांग (RFQ)",
      shortLabelEn: "Demands",
      shortLabelHi: "मांग",
      icon: Layers
    },
    {
      id: "payouts",
      targetTab: "payouts",
      labelEn: "Payouts & Escrow",
      labelHi: "भुगतान व एस्क्रो",
      shortLabelEn: "Payouts",
      shortLabelHi: "भुगतान",
      icon: CreditCard
    }
  ];

  const buyerNavItems: NavItemConfig[] = [
    {
      id: "marketplace",
      targetTab: "marketplace",
      labelEn: "Crop Marketplace",
      labelHi: "फसल बाज़ार",
      shortLabelEn: "Marketplace",
      shortLabelHi: "बाज़ार",
      icon: ShoppingBasket
    },
    {
      id: "ai_pricing",
      targetTab: "ai_pricing",
      labelEn: "AI Price Engine",
      labelHi: "AI मूल्य इंजन",
      shortLabelEn: "AI Price",
      shortLabelHi: "AI भाव",
      icon: TrendingUp
    },
    {
      id: "route_optimizer",
      targetTab: "route_optimizer",
      labelEn: "Logistics Routes",
      labelHi: "लॉजिस्टिक्स मार्ग",
      shortLabelEn: "Routes",
      shortLabelHi: "मार्ग",
      icon: Navigation
    },
    {
      id: "bulk_orders",
      targetTab: "bulk_orders",
      labelEn: "Bulk RFQs",
      labelHi: "थोक मांग",
      shortLabelEn: "Bulk RFQs",
      shortLabelHi: "थोक मांग",
      icon: Layers
    },
    {
      id: "contracts",
      targetTab: "contracts",
      labelEn: "Contracts Tracking",
      labelHi: "अनुबंध ट्रैकिंग",
      shortLabelEn: "Contracts",
      shortLabelHi: "अनुबंध",
      icon: Truck
    },
    {
      id: "payments",
      targetTab: "payments",
      labelEn: "Payments & Escrow",
      labelHi: "भुगतान व एस्क्रो",
      shortLabelEn: "Payments",
      shortLabelHi: "भुगतान",
      icon: CreditCard
    },
    {
      id: "pricing",
      targetTab: "pricing",
      labelEn: "Mandi Rates",
      labelHi: "लाइव मंडी भाव",
      shortLabelEn: "Mandi",
      shortLabelHi: "मंडी भाव",
      icon: Radio
    }
  ];

  const navItems = user.role === "FARMER" ? farmerNavItems : buyerNavItems;
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleQuickAction = () => {
    if (user.role === "FARMER") {
      if (onOpenNewListing) {
        onOpenNewListing();
      } else {
        onSelectTab("inventory");
      }
    } else {
      onSelectTab("marketplace");
    }
  };

  // Split farmer navigation into left/right groups for mobile bottom bar center CTA slot
  const farmerLeftNav = farmerNavItems.slice(0, 2); // inventory, ai_pricing
  const farmerRightNav = farmerNavItems.slice(2);   // route_optimizer, pricing, buyer_requests, payouts

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* =================================================================== */}
      {/* SIDEBAR NAVIGATION (Desktop Sidebar + Mobile Off-Canvas Drawer)     */}
      {/* =================================================================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:z-30 w-64 bg-white border-r border-slate-200/80 transition-transform duration-300 ease-in-out flex flex-col select-none shadow-2xl lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-label="Application Sidebar"
      >
        {/* Branding Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200/70 shrink-0">
          <button
            type="button"
            onClick={() => {
              const defaultTab = user.role === "FARMER" ? "inventory" : "marketplace";
              onSelectTab(defaultTab);
              onClose?.();
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

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <nav className="space-y-1.5" role="navigation" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.targetTab;
              const itemLabel = lang === "hi" ? item.labelHi : item.labelEn;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.targetTab);
                    onClose?.();
                  }}
                  className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]/40 ${
                    isActive
                      ? "bg-[#0F6A53] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  <span className="truncate">{itemLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Action CTA */}
        <div className="p-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              handleQuickAction();
              onClose?.();
            }}
            className="w-full h-10 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs text-white bg-gradient-to-r from-[#0F6A53] to-[#0B5745] hover:brightness-105 active:scale-[0.99] transition shadow-xs hover:shadow cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]/40"
          >
            <Plus className="w-4 h-4 text-white" strokeWidth={2.4} />
            <span>
              {user.role === "FARMER"
                ? (lang === "hi" ? "नई फसल जोड़ें" : "List New Harvest")
                : (lang === "hi" ? "फसल बाज़ार देखें" : "Browse Marketplace")}
            </span>
          </button>
        </div>

        {/* User Profile Footer Card */}
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

            {onSignOut && (
              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  onClose?.();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "लॉग आउट करें" : "Sign Out"}</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on screens below lg)          */}
      {/* =================================================================== */}
      <nav
        className="flex lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-lg px-1.5 py-1 items-center justify-start sm:justify-center overflow-x-auto no-scrollbar min-h-[58px] pb-[max(0.35rem,env(safe-area-inset-bottom))] gap-1"
        aria-label="Mobile Navigation"
      >
        {user.role === "FARMER" ? (
          <>
            {/* Left Farmer Nav Items (Inventory + AI Price Engine) */}
            {farmerLeftNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.targetTab;
              const shortLabel = lang === "hi" ? item.shortLabelHi : item.shortLabelEn;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.targetTab)}
                  className={`flex-1 min-w-[56px] max-w-[72px] shrink-0 flex flex-col items-center justify-center min-h-[52px] py-1 px-0.5 text-center transition-colors cursor-pointer rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]/30 ${
                    isActive ? "text-[#0F6A53] font-bold" : "text-slate-500 hover:text-slate-800 font-medium"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-[#0F6A53]" : "text-slate-400"}`}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  <span className="text-[10px] leading-tight mt-1 truncate max-w-[62px]">{shortLabel}</span>
                </button>
              );
            })}

            {/* Prominent Center "Add New Crop" Action Button */}
            <div className="flex flex-col items-center justify-center -mt-4 shrink-0 px-1">
              <button
                type="button"
                onClick={handleQuickAction}
                aria-label={lang === "hi" ? "नई फसल जोड़ें" : "List New Harvest"}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0F6A53] to-[#0B5745] text-white flex items-center justify-center shadow-md hover:brightness-105 active:scale-95 transition-transform border-2 border-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]"
              >
                <Plus className="w-6 h-6 text-white" strokeWidth={2.6} />
              </button>
              <span className="text-[10px] font-bold text-[#0F6A53] mt-0.5 truncate max-w-[68px]">
                {lang === "hi" ? "नई फसल" : "Add Crop"}
              </span>
            </div>

            {/* Right Farmer Nav Items (Logistics Routes + Mandi + Demands + Payouts) */}
            {farmerRightNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.targetTab;
              const shortLabel = lang === "hi" ? item.shortLabelHi : item.shortLabelEn;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.targetTab)}
                  className={`flex-1 min-w-[56px] max-w-[72px] shrink-0 flex flex-col items-center justify-center min-h-[52px] py-1 px-0.5 text-center transition-colors cursor-pointer rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]/30 ${
                    isActive ? "text-[#0F6A53] font-bold" : "text-slate-500 hover:text-slate-800 font-medium"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-[#0F6A53]" : "text-slate-400"}`}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  <span className="text-[10px] leading-tight mt-1 truncate max-w-[62px]">{shortLabel}</span>
                </button>
              );
            })}
          </>
        ) : (
          /* Buyer Navigation Items — All items including AI Price & Routes with smooth horizontal scroll */
          buyerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.targetTab;
            const shortLabel = lang === "hi" ? item.shortLabelHi : item.shortLabelEn;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.targetTab)}
                className={`flex-1 min-w-[56px] max-w-[72px] shrink-0 flex flex-col items-center justify-center min-h-[52px] py-1 px-0.5 text-center transition-colors cursor-pointer rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]/30 ${
                  isActive ? "text-[#0F6A53] font-bold" : "text-slate-500 hover:text-slate-800 font-medium"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-[#0F6A53]" : "text-slate-400"}`}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                <span className="text-[10px] leading-tight mt-1 truncate max-w-[62px]">{shortLabel}</span>
              </button>
            );
          })
        )}
      </nav>
    </>
  );
};