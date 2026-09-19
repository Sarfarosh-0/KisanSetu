import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Layout } from "./components/Layout";
import { Footer } from "./components/Footer";
import { FarmerView, FarmerSubTab } from "./components/FarmerView";
import { BuyerDashboard, BuyerSubTab } from "./components/buyer/BuyerDashboard";
import { OrdersAndPaymentModal } from "./components/OrdersAndPaymentModal";
import { ApiDocsModal } from "./components/ApiDocsModal";
import { AIPricingDashboard } from "./components/AIPricingDashboard";
import { RouteOptimizationView } from "./components/RouteOptimizationView";
import { LoginPage, AuthSuccessPayload } from "./components/auth";
import { CropListing, Order, User, UserRole } from "./types";
import { API } from "./api";
import { t, getInitialLanguage } from "./i18n";
import { 
  Sprout, 
  ShieldCheck, 
  Scale, 
  X, 
  ArrowRight,
  AlertTriangle,
  ArrowRightLeft,
  Construction
} from "lucide-react";

const FALLBACK_USERS: User[] = [
  {
    id: 1,
    name: "Ramesh Kumar Patel",
    phone: "+91 98220 11223",
    email: "ramesh.patel@sahyadrikisan.in",
    role: "FARMER",
    fpoName: "Sahyadri Krishi Vikas Producer Co.",
    district: "Nashik",
    state: "Maharashtra",
    lat: 20.1746,
    lng: 73.9875,
    trustScore: 4.9,
    verified: true,
    kycStatus: "AADHAAR_KYC_VERIFIED",
    totalTrades: 42,
    ratingCount: 39,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "BigBasket Fresh Sourcing (Tata Enterprise)",
    phone: "+91 80 4040 5000",
    email: "procurement@bigbasket.com",
    role: "BUYER",
    district: "Bengaluru Urban",
    state: "Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    trustScore: 5.0,
    verified: true,
    kycStatus: "GST_ROC_VERIFIED",
    totalTrades: 124,
    ratingCount: 118,
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(FALLBACK_USERS[0]);
  const [users, setUsers] = useState<User[]>(FALLBACK_USERS);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Persisted language state - defaults to Hindi ("hi") first
  const [lang, setLang] = useState<"en" | "hi">(() => {
    return getInitialLanguage();
  });

  const handleToggleLang = (newLang: "en" | "hi") => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kisansetu_lang", newLang);
        document.documentElement.lang = newLang;
      } catch {
        // Ignore storage access errors
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  // ---------------------------------------------------------------------------
  // URL Query-Param Deep-Link Sync (Gap 9)
  // Read initial tab from ?tab= in URL; push updates back on change
  // ---------------------------------------------------------------------------
  const getTabFromUrl = (): string => {
    if (typeof window === "undefined") return "inventory";
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("tab") || "inventory";
    } catch {
      return "inventory";
    }
  };

  // Navigation tab state — initializes from URL query param
  const [activeTab, setActiveTab] = useState<string>(getTabFromUrl);

  // Modal triggers
  const [activeListingToOrder, setActiveListingToOrder] = useState<CropListing | null>(null);
  const [openCreateListingModal, setOpenCreateListingModal] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<"terms" | "escrow" | "pricing" | null>(null);
  // Global header search query threaded to active view (Gap 6)
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>("");

  // Load baseline platform data
  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, listingsData, ordersData] = await Promise.all([
        API.getUsers().catch(() => FALLBACK_USERS),
        API.getListings().catch(() => []),
        API.getOrders().catch(() => [])
      ]);
      const validUsers = Array.isArray(usersData) && usersData.length > 0 ? usersData : FALLBACK_USERS;
      setUsers(validUsers);
      setListings(Array.isArray(listingsData) ? listingsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      // Default active user to Farmer Ramesh Patel if not set
      if (!currentUser) {
        const defaultFarmer = validUsers.find(u => u.role === "FARMER") || validUsers[0];
        setCurrentUser(defaultFarmer);
        setActiveTab("inventory");
      }
    } catch (err) {
      console.error("Failed to load platform data:", err);
      if (!currentUser) {
        setCurrentUser(FALLBACK_USERS[0]);
        setActiveTab("inventory");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Permitted tabs mapping for RBAC enforcement (includes ai_pricing + route_optimizer for all roles)
  const farmerAllowedTabs = useMemo(() => ["inventory", "buyer_requests", "payouts", "pricing", "ai_pricing", "route_optimizer", "auth", "api"], []);
  const buyerAllowedTabs = useMemo(() => ["marketplace", "bulk_orders", "contracts", "payments", "pricing", "ai_pricing", "route_optimizer", "auth", "api"], []);

  // Sync activeTab → URL query param whenever tab changes (Gap 9)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (activeTab && activeTab !== "auth") {
        params.set("tab", activeTab);
        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.replaceState(null, "", newUrl);
      }
    } catch {
      // Ignore history API errors
    }
  }, [activeTab]);

  // Support browser Back/Forward navigation with URL query params (Gap 9)
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromUrl();
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Switch role handler with strict RBAC tab default
  const handleSelectUserRole = (role: UserRole) => {
    const matched = users.find((u) => u.role === role) || (role === "FARMER" ? FALLBACK_USERS[0] : FALLBACK_USERS[1]);
    if (matched) {
      setCurrentUser(matched);
      if (role === "FARMER") {
        setActiveTab("inventory");
      } else {
        // Default buyer landing tab is marketplace (Gap 4)
        setActiveTab("marketplace");
      }
    }
  };

  // Seamless tab switcher that prevents invalid RBAC states
  const handleSelectTab = (tab: string) => {
    if (tab === "auth" || tab === "api") {
      setActiveTab(tab);
      return;
    }
    // If a farmer selects a buyer-specific tab, auto-switch user role to BUYER
    if (currentUser?.role === "FARMER" && buyerAllowedTabs.includes(tab) && !farmerAllowedTabs.includes(tab)) {
      const buyerUser = users.find((u) => u.role === "BUYER") || FALLBACK_USERS[1];
      if (buyerUser) setCurrentUser(buyerUser);
      setActiveTab(tab);
      return;
    }
    // If a buyer selects a farmer-specific tab, auto-switch user role to FARMER
    if (currentUser?.role === "BUYER" && farmerAllowedTabs.includes(tab) && !buyerAllowedTabs.includes(tab)) {
      const farmerUser = users.find((u) => u.role === "FARMER") || FALLBACK_USERS[0];
      if (farmerUser) setCurrentUser(farmerUser);
      setActiveTab(tab);
      return;
    }
    setActiveTab(tab);
  };

  // Open harvest listing modal (Farmer action)
  const handleOpenNewListing = () => {
    if (currentUser?.role !== "FARMER") {
      handleSelectUserRole("FARMER");
    }
    setActiveTab("inventory");
    setOpenCreateListingModal(true);
  };

  // Callback when a new listing is created
  const handleListingCreated = (newListing: CropListing) => {
    setListings((prev) => [newListing, ...prev.filter((l) => l.id !== newListing.id)]);
    setActiveTab("inventory");
    setOpenCreateListingModal(false);
  };

  // Callback when a listing is updated
  const handleListingUpdated = (updatedListing: CropListing) => {
    setListings((prev) => prev.map((l) => (l.id === updatedListing.id ? updatedListing : l)));
    setActiveTab("inventory");
  };

  // Callback when a listing is deleted
  const handleListingDeleted = (deletedId: number) => {
    setListings((prev) => prev.filter((l) => l.id !== deletedId));
  };

  // Callback when order status is updated
  const handleOrderStatusUpdate = async (orderId: number, status: string, otp?: string) => {
    try {
      const updated = await API.updateOrderStatus(orderId, status, otp);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err: any) {
      console.error("Order status update failed:", err);
      throw err;
    }
  };

  // Callback when an order is placed
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    API.getListings().then(setListings);
  };

  // Reset baseline market data — ONLY available in development mode (Gap 2)
  const handleResetData = import.meta.env.DEV ? async () => {
    const prompt = lang === "hi" 
      ? "क्या आप मूल कृषि कैटलॉग और लाइव मंडी भाव पुनर्स्थापित करना चाहते हैं?" 
      : "Restore baseline agricultural catalog and live market rates?";
    if (confirm(prompt)) {
      await API.resetSeedData();
      await loadData();
    }
  } : undefined;

  // Callback from Login & OTP flow — fetch real user profile from backend (Gap 5)
  const handleAuthSuccess = async (payload: AuthSuccessPayload) => {
    try {
      // Attempt to fetch the authenticated user profile from backend
      const meUser = await API.getMe();
      if (meUser) {
        setCurrentUser(meUser);
        // Refresh full users list in background so role switching stays accurate
        API.getUsers().then(fresh => {
          if (Array.isArray(fresh) && fresh.length > 0) setUsers(fresh);
        }).catch(() => {});
        const targetTab = meUser.role === "FARMER" ? "inventory" : "marketplace";
        setActiveTab(targetTab);
        return;
      }
    } catch {
      // Fall through to fallback handling if backend is unavailable
    }
    // Fallback: use in-memory user matching payload role
    if (payload.role === "farmer") {
      const farmerUser = users.find(u => u.role === "FARMER") || currentUser;
      if (farmerUser) setCurrentUser(farmerUser);
      setActiveTab("inventory");
    } else {
      const buyerUser = users.find(u => u.role === "BUYER") || currentUser;
      if (buyerUser) setCurrentUser(buyerUser);
      setActiveTab("marketplace");
    }
  };

  // Determine if activeTab is authorized for currentUser
  const isUnauthorized = useMemo(() => {
    if (!currentUser) return false;
    if (activeTab === "auth" || activeTab === "api") return false;
    if (currentUser.role === "FARMER") {
      return !farmerAllowedTabs.includes(activeTab);
    }
    if (currentUser.role === "BUYER") {
      return !buyerAllowedTabs.includes(activeTab);
    }
    // LOGISTICS / GOVT_OFFICIAL roles — not yet fully implemented in frontend (Gap 12)
    // Treat as authorized so they don't get stuck in RBAC loop; a friendly notice is shown below
    return false;
  }, [currentUser, activeTab, farmerAllowedTabs, buyerAllowedTabs]);

  // Check if the current user's role has no dedicated UI (Gap 12)
  const isUnsupportedRole = useMemo(() => {
    return currentUser?.role === "LOGISTICS" || currentUser?.role === "GOVT_OFFICIAL";
  }, [currentUser]);

  // Check if activeTab belongs to role-specific dashboard views
  const isFarmerSubTab = useMemo(() => {
    return ["inventory", "buyer_requests", "payouts", "pricing"].includes(activeTab);
  }, [activeTab]);

  const isBuyerSubTab = useMemo(() => {
    return ["marketplace", "bulk_orders", "contracts", "payments"].includes(activeTab);
  }, [activeTab]);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg animate-bounce mb-3">
          <Sprout className="w-7 h-7 text-amber-300" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 font-display">KisanSetu • किसान सेतु</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">{t("app.loading", lang)}</p>
      </div>
    );
  }

  // Dedicated Full-Screen Login & OTP Authentication Page
  if (activeTab === "auth") {
    return (
      <LoginPage
        initialRole={currentUser.role === "BUYER" ? "buyer" : "farmer"}
        onLoginSuccess={handleAuthSuccess}
        onBackToApp={() => setActiveTab(currentUser.role === "FARMER" ? "inventory" : "marketplace")}
        lang={lang}
      />
    );
  }

  return (
    <Layout
      user={currentUser}
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      lang={lang}
      onToggleLang={handleToggleLang}
      onOpenNewListing={handleOpenNewListing}
      onResetData={handleResetData}
      onSignOut={() => setActiveTab("auth")}
      onOpenApiDocs={() => setActiveTab("api")}
      onSelectUserRole={handleSelectUserRole}
      onSearchChange={setGlobalSearchQuery}
    >
      {/* Main View Container with Strict RBAC Guards */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* RBAC Violation Notice & Redirect Helper */}
        {isUnauthorized && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wide">
                  {t("rbac.restrictedTitle", lang)}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 font-display">
                  {currentUser.role === "FARMER"
                    ? t("rbac.farmerRestricted", lang)
                    : t("rbac.buyerRestricted", lang)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  {t("rbac.description", lang)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab(currentUser.role === "FARMER" ? "inventory" : "marketplace")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition"
              >
                {currentUser.role === "FARMER" ? t("rbac.returnToFarmer", lang) : t("rbac.returnToBuyer", lang)}
              </button>
              <button
                onClick={() => handleSelectUserRole(currentUser.role === "FARMER" ? "BUYER" : "FARMER")}
                className="bg-white border border-amber-300 text-slate-800 hover:bg-amber-100 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                <span>{currentUser.role === "FARMER" ? t("rbac.switchToBuyer", lang) : t("rbac.switchToFarmer", lang)}</span>
              </button>
            </div>
          </div>
        )}

        {/* Unsupported Role Notice (LOGISTICS, GOVT_OFFICIAL) — Gap 12 */}
        {isUnsupportedRole && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 shadow-xs flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Construction className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                {lang === "hi" ? "पोर्टल जल्द आ रहा है" : "Portal Coming Soon"}
              </h3>
              <p className="text-sm text-slate-600 font-medium mt-1 max-w-md">
                {lang === "hi"
                  ? `${currentUser.role === "LOGISTICS" ? "लॉजिस्टिक्स" : "सरकारी अधिकारी"} पोर्टल अभी विकास में है। कृपया किसान या खरीदार खाते से लॉग इन करें।`
                  : `The ${currentUser.role === "LOGISTICS" ? "Logistics Partner" : "Government Official"} portal is under active development. Please sign in with a Farmer or Buyer account.`
                }
              </p>
            </div>
            <button
              onClick={() => setActiveTab("auth")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition shadow-xs"
            >
              {lang === "hi" ? "अलग खाते से लॉग इन करें" : "Sign In with Different Account"}
            </button>
          </div>
        )}

        {/* Farmer Dashboard & Vendor Sub-Views */}
        {!isUnauthorized && !isUnsupportedRole && currentUser.role === "FARMER" && isFarmerSubTab && (
          <FarmerView
            farmer={currentUser}
            listings={listings}
            orders={orders}
            onListingCreated={handleListingCreated}
            onListingUpdated={handleListingUpdated}
            onListingDeleted={handleListingDeleted}
            onOrderStatusUpdate={handleOrderStatusUpdate}
            lang={lang}
            openCreateModal={openCreateListingModal}
            onCloseCreateModal={() => setOpenCreateListingModal(false)}
            activeSubTab={activeTab as FarmerSubTab}
            onSelectSubTab={(subTab) => setActiveTab(subTab)}
            externalSearch={globalSearchQuery}
          />
        )}

        {/* Buyer Dashboard & Purchasing Sub-Views */}
        {!isUnauthorized && !isUnsupportedRole && currentUser.role === "BUYER" && isBuyerSubTab && (
          <BuyerDashboard
            buyer={currentUser}
            listings={listings}
            orders={orders}
            lang={lang}
            activeTab={activeTab as BuyerSubTab}
            onSelectTab={(subTab) => setActiveTab(subTab)}
            onOpenOrderModal={(listing) => setActiveListingToOrder(listing)}
            onOrderStatusUpdate={handleOrderStatusUpdate}
            externalSearch={globalSearchQuery}
          />
        )}

        {/* Mandi Rates for Buyer (if pricing tab clicked while in Buyer role) */}
        {!isUnauthorized && !isUnsupportedRole && currentUser.role === "BUYER" && activeTab === "pricing" && (
          <AIPricingDashboard lang={lang} />
        )}

        {/* AI Pricing Dashboard — available to all authenticated roles (Gap 1) */}
        {activeTab === "ai_pricing" && !isUnsupportedRole && (
          <AIPricingDashboard lang={lang} />
        )}

        {/* Route Optimization View — available to all authenticated roles (Gap 1) */}
        {activeTab === "route_optimizer" && !isUnsupportedRole && (
          <RouteOptimizationView lang={lang} />
        )}

        {/* API & Microservices Documentation Modal/View */}
        {activeTab === "api" && (
          <ApiDocsModal />
        )}
      </main>

      {/* Direct Order Modal (Purchasing Action) */}
      {activeListingToOrder && currentUser.role === "BUYER" && (
        <OrdersAndPaymentModal
          orders={orders}
          currentUser={currentUser}
          onOrderStatusUpdate={handleOrderStatusUpdate}
          activeListingToOrder={activeListingToOrder}
          onCloseOrderModal={() => setActiveListingToOrder(null)}
          onOrderPlaced={handleOrderPlaced}
          lang={lang}
        />
      )}

      {/* Production-Grade Modern Footer */}
      <Footer
        onSelectTab={setActiveTab}
        onSelectUserRole={handleSelectUserRole}
        onOpenPolicy={(policy) => setActivePolicyModal(policy)}
        onOpenApiDocs={() => setActiveTab("api")}
        currentRole={currentUser.role}
        lang={lang}
      />

      {/* Production Policy & Terms Modal */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Scale className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>
                  {activePolicyModal === "terms" && t("footer.terms", lang)}
                  {activePolicyModal === "escrow" && t("footer.escrowPolicy", lang)}
                  {activePolicyModal === "pricing" && t("footer.pricingDisclosure", lang)}
                </span>
              </div>
              <button
                onClick={() => setActivePolicyModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed font-medium">
              {activePolicyModal === "terms" && (
                lang === "hi" ? (
                  <>
                    <p>
                      <strong>1. प्रत्यक्ष खेत अनुबंध:</strong> किसानSetu पर शुरू किए गए सभी व्यापार सत्यापित किसानों/एफपीओ और संस्थागत खरीदारों के बीच बाध्यकारी व्यावसायिक समझौते हैं।
                    </p>
                    <p>
                      <strong>2. शून्य बिचौलिया कमीशन:</strong> किसानSetu खेत-खलिहान उत्पाद मूल्यों पर शून्य कमीशन मॉडल के तहत काम करता है।
                    </p>
                    <p>
                      <strong>3. सुपुर्दगी व OTP रसीद:</strong> भौतिक निरीक्षण के बाद खरीदार द्वारा प्रदान किए गए 4-अंकीय OTP के सत्यापन पर ही माल सुपुर्द माना जाता है।
                    </p>
                    <p>
                      <strong>4. गुणवत्ता ग्रेड विवाद:</strong> डिलीवरी के 24 घंटे के भीतर किसी भी ग्रेड अंतर की रिपोर्ट की जा सकती है, जिसका निपटारा एगमार्क मानकों के आधार पर किया जाता है।
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>1. Direct Farm-Gate Contracts:</strong> All trades initiated on किसानSetu constitute binding commercial agreements between verified farmers/FPOs and institutional purchasers.
                    </p>
                    <p>
                      <strong>2. Zero Middleman Commission:</strong> किसानSetu operates under a zero-commission model on farm-gate produce values, charging no transaction cuts to agricultural producers.
                    </p>
                    <p>
                      <strong>3. Physical Delivery & OTP Receipts:</strong> Transfer of custody requires a cryptographically generated 4-digit OTP supplied by the buyer upon physical inspection at the designated destination.
                    </p>
                    <p>
                      <strong>4. Quality Grade Disputes:</strong> Buyers must log any grade or moisture variance within 24 hours of delivery. Platform arbiters utilize standardized AGMARK parameters to resolve reconciliations.
                    </p>
                  </>
                )
              )}

              {activePolicyModal === "escrow" && (
                lang === "hi" ? (
                  <>
                    <p>
                      <strong>1. दोहरे नियंत्रण वाला एस्क्रो वॉल्ट:</strong> ऑर्डर भुगतान फसल रवानगी से पहले आरबीआई-अनुपालन नोडल एस्क्रो खाते में सुरक्षित रखा जाता है।
                    </p>
                    <p>
                      <strong>2. तत्काल T+0 भुगतान:</strong> गेट पर वैध OTP सत्यापन होते ही एस्क्रो धनराशि किसान के बैंक खाते में UPI/RTGS द्वारा तुरंत हस्तांतरित हो जाती है।
                    </p>
                    <p>
                      <strong>3. पारगमन बीमा:</strong> किसानएक्सप्रेस के माध्यम से बुक की गई सभी यात्राओं में पारगमन क्षति के लिए स्वतः सुरक्षा शामिल है।
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>1. Dual-Custody Escrow Vault:</strong> Order payments are held securely in a dual-custody RBI-compliant nodal escrow account prior to harvest transit dispatch.
                    </p>
                    <p>
                      <strong>2. Instant T+0 Settlement:</strong> Upon valid OTP verification at gate receipt, escrow funds are instantly transferred directly to the farmer’s linked bank account via UPI / RTGS.
                    </p>
                    <p>
                      <strong>3. Transit Insurance:</strong> All consolidated reefer trips booked through KisanExpress include automatic transit loss protection for transit spoilage or accidents.
                    </p>
                  </>
                )
              )}

              {activePolicyModal === "pricing" && (
                lang === "hi" ? (
                  <>
                    <p>
                      <strong>1. मंडी फीड एकीकरण:</strong> वास्तविक समय के बेंचमार्क भाव प्रमुख राज्य मंडियों की एगमार्कनेट एपीएमसी दैनिक व्यापार रिपोर्टों पर आधारित हैं।
                    </p>
                    <p>
                      <strong>2. गुणवत्ता ग्रेड समायोजन:</strong> गुणवत्ता ग्रेड A को 8-15% का प्रीमियम मिलता है, जबकि ग्रेड C को औद्योगिक उपयोग के लिए समायोजित किया जाता है।
                    </p>
                    <p>
                      <strong>3. मौसमी गुणांक:</strong> मूल्य निर्धारण में 12 महीने के ऐतिहासिक फसल आवक चक्र और मौसमी मांग का स्वतः विश्लेषण किया जाता है।
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>1. Mandi Feed Integration:</strong> Real-time benchmark rates are grounded continuously with Agmarknet APMC modal daily trade reports across major state mandis.
                    </p>
                    <p>
                      <strong>2. Quality Spread Adjustments:</strong> Quality Grade A commands an algorithmically weighted premium (8–15%), while Grade C is discounted for industrial and processing utility.
                    </p>
                    <p>
                      <strong>3. Seasonality Coefficients:</strong> Pricing recommendations dynamically evaluate historical 12-month harvest inflow surges, post-monsoon storage cycles, and pre-festival demand spikes.
                    </p>
                  </>
                )
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActivePolicyModal(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition shadow-xs"
              >
                {lang === "hi" ? "समझ लिया व बंद करें" : "Understood & Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

