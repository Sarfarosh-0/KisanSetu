import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { User, UserRole } from "../types";

export interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: "en" | "hi";
  onToggleLang: (lang: "en" | "hi") => void;
  onOpenNewListing?: () => void;
  onResetData?: () => void;
  onSignOut?: () => void;
  onOpenApiDocs?: () => void;
  onSelectUserRole?: (role: UserRole) => void;
  /** Called whenever the global header search value changes (Gap 6) */
  onSearchChange?: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  activeTab,
  onSelectTab,
  lang,
  onToggleLang,
  onOpenNewListing,
  onResetData,
  onSignOut,
  onOpenApiDocs,
  onSelectUserRole,
  onSearchChange
}) => {
  // Single source of truth for desktop sidebar open/closed state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        return false;
      }
      const saved = localStorage.getItem("kisansetu_sidebar_open");
      if (saved !== null) {
        return saved === "true";
      }
      return typeof window !== "undefined" ? window.innerWidth >= 1024 : true;
    } catch {
      return false;
    }
  });

  // Global search state
  const [searchQuery, setSearchQuery] = useState("");

  // Persist desktop sidebar state
  useEffect(() => {
    try {
      localStorage.setItem("kisansetu_sidebar_open", String(isSidebarOpen));
    } catch {
      // Ignore storage errors
    }
  }, [isSidebarOpen]);

  // Keyboard shortcut: Cmd/Ctrl + B toggles desktop sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 antialiased">
      {/* Sidebar Component (Desktop Sidebar & Mobile Bottom Nav) */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        lang={lang}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onToggle={handleToggleSidebar}
        onOpenNewListing={onOpenNewListing}
        onResetData={onResetData}
        onSignOut={onSignOut}
        onOpenApiDocs={onOpenApiDocs}
        onSelectUserRole={onSelectUserRole}
      />

      {/* Main Content Area (Fluidly offsets according to sidebar open state on desktop) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out pb-20 lg:pb-0 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-0"
          }`}
      >
        {/* Header */}
        <Header
          user={user}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          lang={lang}
          onToggleLang={onToggleLang}
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            onSearchChange?.(q);
          }}
          onOpenNewListing={onOpenNewListing}
          onResetData={onResetData}
          onSignOut={onSignOut}
          onOpenApiDocs={onOpenApiDocs}
        />

        {/* Page Content */}
        <div className="flex-1 flex flex-col w-full">
          {children}
        </div>
      </div>
    </div>
  );
};