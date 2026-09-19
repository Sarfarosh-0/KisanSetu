import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Menu,
  PanelLeft,
  Search,
  Bell,
  ShieldCheck,
  MapPin,
  LogOut,
  KeyRound,
  Code2,
  RefreshCw,
  Building2,
  CreditCard,
  Sparkles,
  Package,
  X,
  Languages,
  Sprout
} from "lucide-react";
import type { User } from "../types";
import { API } from "../api";

export interface HeaderProps {
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: "en" | "hi";
  onToggleLang?: (lang: "en" | "hi") => void;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  isSidebarCollapsed?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenNewListing?: () => void;
  onResetData?: () => void;
  onSignOut?: () => void;
  onOpenApiDocs?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  targetTab?: string;
  type: "order" | "escrow" | "mandi" | "rfq";
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onSelectTab,
  lang,
  onToggleLang,
  onToggleSidebar,
  isSidebarOpen,
  isSidebarCollapsed = false,
  searchQuery = "",
  onSearchChange,
  onResetData,
  onSignOut,
  onOpenApiDocs
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState(searchQuery);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Live mock notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: lang === "hi" ? "नई खरीदार मांग (RFQ)" : "New Procurement Demand",
      message: "BigBasket requested 40 Qtl Nashik Red Onion at ₹2,350/qtl target.",
      time: "10m ago",
      unread: true,
      targetTab: "buyer_requests",
      type: "rfq"
    },
    {
      id: "n2",
      title: lang === "hi" ? "एस्क्रो सुरक्षा सक्रिय" : "Escrow Deposit Confirmed",
      message: "₹42,500 held in KisanEscrow dual-custody for Order #KS-9821.",
      time: "1h ago",
      unread: true,
      targetTab: "payouts",
      type: "escrow"
    },
    {
      id: "n3",
      title: lang === "hi" ? "मंडी भाव वृद्धि अलर्ट" : "Agmarknet Mandi Alert",
      message: "Lasalgaon wholesale onion modal price rose +8.4% today.",
      time: "3h ago",
      unread: false,
      targetTab: "pricing",
      type: "mandi"
    }
  ]);

  // Fetch real contextual notifications from backend (Gap 10)
  useEffect(() => {
    let isMounted = true;
    API.getNotifications(user.id, user.role)
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setNotifications(data as NotificationItem[]);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [user.id, user.role]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const closePopovers = useCallback(() => {
    setNotificationsOpen(false);
    setProfileMenuOpen(false);
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (Escape to close dropdowns)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopovers();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closePopovers]);

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    if (item.targetTab) {
      onSelectTab(item.targetTab);
    }
    closePopovers();
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Single source of truth state for sidebar open status, with fallbacks
  const isOpen = isSidebarOpen !== undefined ? isSidebarOpen : !isSidebarCollapsed;

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "R";
  const userScoreLabel = user.trustScore ? `${user.trustScore}% Score` : "4.9★";

  return (
    <header
      className="sticky top-0 z-20 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-2xs transition-all duration-200"
      role="banner"
    >
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">

        {/* =================================================================== */}
        {/* Left: Desktop Sidebar Toggle + App Name                             */}
        {/* =================================================================== */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Sidebar Toggle Button (Desktop & Mobile) */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex w-10 h-10 rounded-xl items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 bg-white shadow-2xs transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]/30 shrink-0"
            title={isOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
            aria-label={isOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <PanelLeft className="w-4.5 h-4.5 text-slate-700" strokeWidth={2.2} />
            ) : (
              <Menu className="w-4.5 h-4.5 text-slate-700" strokeWidth={2.2} />
            )}
          </button>

          {/* App Name & Branding */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#0F6A53] to-[#0B5745] flex items-center justify-center text-white shadow-2xs shrink-0">
              <Sprout className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <div className="flex items-baseline min-w-0">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none truncate">
                किसान<span className="text-[#0F6A53]">Setu</span>
              </span>
            </div>
          </div>
        </div>


        {/* =================================================================== */}
        {/* Right: Language Switcher, Notifications, Profile                    */}
        {/* =================================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Language Switcher */}
          {onToggleLang && (
            <div
              className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shadow-2xs shrink-0"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => onToggleLang("en")}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${lang === "en"
                    ? "bg-[#0F6A53] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
                title="Switch interface to English"
                aria-pressed={lang === "en"}
              >
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleLang("hi")}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${lang === "hi"
                    ? "bg-[#0F6A53] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
                title="हिंदी भाषा चुनें"
                aria-pressed={lang === "hi"}
              >
                <span>हिंदी</span>
              </button>
            </div>
          )}

          {/* Notifications Popover */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileMenuOpen(false);
              }}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer border focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]/30 ${notificationsOpen
                  ? "bg-slate-100 border-slate-300 text-[#0F6A53]"
                  : "bg-white/90 text-slate-700 hover:bg-slate-100/70 border-slate-200/80 shadow-2xs"
                }`}
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
            >
              <Bell className="w-4 h-4 text-slate-700" strokeWidth={1.8} aria-hidden="true" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#0F6A53] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-88 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                role="region"
                aria-label="Notifications Panel"
              >
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {lang === "hi" ? "सूचनाएं" : "Notifications"}
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-[#B9E2D1]/40 text-[#0F6A53] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] text-[#0F6A53] hover:text-[#0B5745] font-semibold cursor-pointer transition"
                    >
                      {lang === "hi" ? "सब पढ़े हुए मार्क करें" : "Mark all read"}
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 text-left hover:bg-[#F0F8F5] transition cursor-pointer flex gap-3 ${n.unread ? "bg-[#F0F8F5]/50" : ""
                        }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === "rfq" && <Building2 className="w-4 h-4 text-amber-600" strokeWidth={1.8} />}
                        {n.type === "escrow" && <CreditCard className="w-4 h-4 text-[#0F6A53]" strokeWidth={1.8} />}
                        {n.type === "mandi" && <Sparkles className="w-4 h-4 text-[#0F6A53]" strokeWidth={1.8} />}
                        {n.type === "order" && <Package className="w-4 h-4 text-[#0F6A53]" strokeWidth={1.8} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                      {n.unread && (
                        <div className="w-2 h-2 rounded-full bg-[#0F6A53] shrink-0 self-center" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 px-3 border-t border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-medium">
                    National Agmarknet & Escrow Real-Time Stream
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(!profileMenuOpen);
                setNotificationsOpen(false);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F6A53]/30 ${profileMenuOpen
                  ? "bg-slate-100 ring-2 ring-[#0F6A53]/20"
                  : "bg-transparent hover:bg-slate-100/80"
                }`}
              aria-label="User profile menu"
              aria-expanded={profileMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#0F6A53] to-[#0B5745] text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                {userInitial}
              </div>
            </button>

            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                role="menu"
              >
                <div className="px-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0F6A53] to-[#0B5745] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {user.name}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0F6A53] shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {user.phone}
                      </p>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 border border-emerald-200 text-emerald-800 bg-emerald-50">
                        {user.role === "BUYER" ? "Institutional Buyer" : "Producer (FPO Member)"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{user.district}, {user.state}</span>
                    </span>
                    <span className="font-bold text-[#0F6A53] shrink-0">
                      {userScoreLabel}
                    </span>
                  </div>
                </div>

                <div className="py-1 text-xs">
                  {onOpenApiDocs && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenApiDocs();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F0F8F5] flex items-center gap-2.5 text-slate-700 hover:text-[#0F6A53] transition cursor-pointer"
                      role="menuitem"
                    >
                      <Code2 className="w-4 h-4 text-slate-400" />
                      <span>API & Integration Specs</span>
                    </button>
                  )}

                  {onResetData && (
                    <button
                      type="button"
                      onClick={() => {
                        onResetData();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F0F8F5] flex items-center gap-2.5 text-slate-700 hover:text-[#0F6A53] transition cursor-pointer"
                      role="menuitem"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400" />
                      <span>Sync Baseline Mandi Catalog</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab("auth");
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F0F8F5] flex items-center gap-2.5 text-slate-700 hover:text-[#0F6A53] transition cursor-pointer"
                    role="menuitem"
                  >
                    <KeyRound className="w-4 h-4 text-[#0F6A53]" />
                    <span>Switch Account / Login with OTP</span>
                  </button>
                </div>

                {onSignOut && (
                  <div className="pt-1 border-t border-slate-100 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSignOut();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-xs font-bold transition cursor-pointer"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>{lang === "hi" ? "लॉग आउट करें" : "Sign Out"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};