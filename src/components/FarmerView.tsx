import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  Package, 
  Calendar,
  X,
  Star,
  Tractor,
  Leaf,
  FileText,
  CreditCard,
  CloudSun,
  Building,
  Lock,
  Sprout
} from "lucide-react";
import { CropListing, FairPriceResult, Order, QualityGrade, User } from "../types";
import { API } from "../api";
import { t, translateCrop, translateGrade } from "../i18n";
import { FarmerInventory } from "./farmer/FarmerInventory";
import { FarmerBuyerRequests } from "./farmer/FarmerBuyerRequests";
import { FarmerPayouts } from "./farmer/FarmerPayouts";
import { FarmerWeatherInsights } from "./farmer/FarmerWeatherInsights";

export type FarmerSubTab = "inventory" | "buyer_requests" | "payouts" | "pricing";

interface FarmerViewProps {
  farmer: User;
  listings: CropListing[];
  orders: Order[];
  onListingCreated: (listing: CropListing) => void;
  onOrderStatusUpdate: (orderId: number, status: string) => void;
  lang: "en" | "hi";
  openCreateModal?: boolean;
  onCloseCreateModal?: () => void;
  activeSubTab?: FarmerSubTab;
  onSelectSubTab?: (tab: FarmerSubTab) => void;
}

const COMMON_CROPS = [
  { name: "Onion", varieties: ["Nashik Red (Garwa)", "Pusa White", "Bangalore Rose"], unit: "Quintals" },
  { name: "Wheat", varieties: ["Sharbati Gold Premium", "Lokwan High-Gluten", "Durum"], unit: "Quintals" },
  { name: "Tomato", varieties: ["Kolar Hybrid 1057", "Vaibhav", "Abhinav Red"], unit: "Quintals" },
  { name: "Red Chilli", varieties: ["Guntur Sannam S4", "Byadgi Wrinkled", "Teja"], unit: "Quintals" },
  { name: "Paddy (Basmati)", varieties: ["1121 Pusa Super", "Traditional Basmati", "PR-126"], unit: "Quintals" },
  { name: "Potato", varieties: ["Kufri Jyoti", "Chipsona Processing", "Lauvkar Red"], unit: "Quintals" },
  { name: "Soybean", varieties: ["JS 335 Gold", "JS 9560 High Oil", "NRC 37"], unit: "Quintals" },
  { name: "Mustard", varieties: ["Pusa Bold Seed", "Giriraj Super"], unit: "Quintals" },
  { name: "Cotton", varieties: ["Bt Cotton Long Staple", "DCH-32 Hybrid"], unit: "Quintals" },
  { name: "Maize", varieties: ["Kaveri 50 Sweet", "Pioneer Yellow Feed"], unit: "Quintals" }
];

export const FarmerView: React.FC<FarmerViewProps> = ({
  farmer,
  listings,
  orders,
  onListingCreated,
  onOrderStatusUpdate,
  lang,
  openCreateModal,
  onCloseCreateModal,
  activeSubTab = "inventory",
  onSelectSubTab
}) => {
  const [internalTab, setInternalTab] = useState<FarmerSubTab>(activeSubTab);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (activeSubTab) {
      setInternalTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabChange = (tab: FarmerSubTab) => {
    setInternalTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };

  useEffect(() => {
    if (openCreateModal) {
      setShowModal(true);
      onCloseCreateModal?.();
    }
  }, [openCreateModal, onCloseCreateModal]);

  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiGuidance, setAiGuidance] = useState<FairPriceResult | null>(null);

  // Form State
  const [cropName, setCropName] = useState("Onion");
  const [variety, setVariety] = useState("Nashik Red (Garwa)");
  const [quantity, setQuantity] = useState<number>(60);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>("Grade A");
  const [isOrganic, setIsOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split("T")[0]);
  const [district, setDistrict] = useState(farmer.district || "Nashik");
  const [state, setState] = useState(farmer.state || "Maharashtra");
  const [pincode, setPincode] = useState("422209");
  const [expectedPrice, setExpectedPrice] = useState<number>(2200);
  const [notes, setNotes] = useState("");

  // Update variety list when crop changes
  useEffect(() => {
    const found = COMMON_CROPS.find(c => c.name === cropName);
    if (found && found.varieties.length > 0) {
      setVariety(found.varieties[0]);
    }
  }, [cropName]);

  // Fetch AI guidance when key parameters change
  useEffect(() => {
    if (!showModal) return;
    let isMounted = true;
    const fetchGuidance = async () => {
      try {
        setLoadingAI(true);
        const res = await API.getPriceRecommendation({
          cropName,
          quantityQuintals: Number(quantity) || 10,
          qualityGrade,
          district,
          state,
          isOrganic
        });
        if (isMounted) {
          setAiGuidance(res);
          if (!expectedPrice || expectedPrice === 2200) {
            setExpectedPrice(res.recommendedTargetPrice);
          }
        }
      } catch (err) {
        console.error("AI Price recommendation fetch error:", err);
      } finally {
        if (isMounted) setLoadingAI(false);
      }
    };

    const timer = setTimeout(fetchGuidance, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [cropName, quantity, qualityGrade, isOrganic, district, state, showModal]);

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const newListing = await API.createListing({
        farmerId: farmer.id,
        cropName,
        variety,
        quantityQuintals: Number(quantity),
        qualityGrade,
        harvestDate,
        district,
        state,
        pincode,
        lat: farmer.lat || 20.17,
        lng: farmer.lng || 73.98,
        isOrganic,
        expectedPricePerQuintal: Number(expectedPrice),
        notes: notes || (lang === "hi" ? "नमी मानक के अनुसार ताज़ा कटी फसल।" : "Freshly harvested produce with optimal moisture content."),
        imageUrl: cropName === "Onion"
          ? "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80"
          : cropName === "Wheat"
          ? "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80"
          : cropName === "Tomato"
          ? "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
          : cropName === "Red Chilli"
          ? "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80"
      });
      onListingCreated(newListing);
      setShowModal(false);
    } catch (err: any) {
      alert("Error listing crop: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const farmerListings = listings.filter(l => l.farmerId === farmer.id);

  return (
    <div className="space-y-6">
      {/* Farmer View Content Area */}
      <div className="space-y-6">
        {internalTab === "inventory" && (
          <FarmerInventory
            farmer={farmer}
            listings={listings}
            orders={orders}
            lang={lang}
            onOrderStatusUpdate={onOrderStatusUpdate}
            onOpenCreateModal={() => setShowModal(true)}
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

      {/* Modal: Create Crop Listing with Live AI Price Engine Guidance */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin  border border-emerald-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-emerald-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg font-display">
                    {t("farmerModal.title", lang)}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t("farmerModal.subtitle", lang)}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitListing} className="p-6 space-y-5">
              {/* Crop & Variety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("farmerModal.selectCrop", lang)} *
                  </label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {COMMON_CROPS.map((c) => (
                      <option key={c.name} value={c.name}>{translateCrop(c.name, lang)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("farmerModal.selectVariety", lang)} *
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    required
                    placeholder="e.g. Nashik Red, Kolar 1057"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quantity, Grade & Organic Check */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("farmerModal.quantityQuintals", lang)} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                    ~{(Number(quantity) * 100).toLocaleString()} kg
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("farmerModal.qualityGrade", lang)} *
                  </label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Grade A">{translateGrade("Grade A", lang)}</option>
                    <option value="Grade B">{translateGrade("Grade B", lang)}</option>
                    <option value="Grade C">{translateGrade("Grade C", lang)}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("farmerModal.harvestDateLabel", lang)} *
                  </label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Organic Checkbox */}
              <div className="flex items-center gap-2 bg-[#F0FDF4] p-3 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="organic"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="organic" className="text-xs font-bold text-emerald-900 cursor-pointer flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t("farmerModal.organicLabel", lang)} (+15-20% Premium)</span>
                </label>
              </div>

              {/* Live AI Fair-Price Guidance Box */}
              <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-emerald-900">
                      {t("farmerModal.aiPricingHeading", lang)}
                    </span>
                  </div>
                  {loadingAI && (
                    <span className="text-[11px] text-emerald-700 animate-pulse font-medium">
                      {lang === "hi" ? "गणना हो रही है..." : "Computing..."}
                    </span>
                  )}
                </div>

                {aiGuidance ? (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-white p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-400 block font-medium">{t("farmerModal.mandiBenchmark", lang)}</span>
                        <span className="font-bold text-slate-700 text-xs">₹{aiGuidance.mandiBenchmarkPrice}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-emerald-100 ring-2 ring-emerald-500">
                        <span className="text-[10px] text-emerald-700 font-bold block">{lang === "hi" ? "सुझाया गया लक्ष्य" : "Recommended Target"}</span>
                        <span className="font-extrabold text-emerald-800 text-sm font-display">₹{aiGuidance.recommendedTargetPrice}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-400 block font-medium">{t("farmerModal.recommendedRange", lang)}</span>
                        <span className="font-bold text-slate-700 text-xs">₹{aiGuidance.minFairPrice} - {aiGuidance.maxFairPrice}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-emerald-800 pt-1 leading-relaxed font-medium">
                      💡 {aiGuidance.methodology}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === "hi" ? "लाइव मंडी भाव लोड हो रहे हैं..." : "Loading Agmarknet live price feeds..."}
                  </p>
                )}
              </div>

              {/* Expected Price Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {t("farmerModal.expectedPriceLabel", lang)} *
                  </label>
                  {aiGuidance && (
                    <button
                      type="button"
                      onClick={() => setExpectedPrice(aiGuidance.recommendedTargetPrice)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      {lang === "hi" ? `AI लक्ष्य भाव का उपयोग करें (₹${aiGuidance.recommendedTargetPrice})` : `Use AI Target (₹${aiGuidance.recommendedTargetPrice})`}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="1000"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
                    required
                    className="w-full pl-8 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-display"
                  />
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "जिला" : "District"} *</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "राज्य" : "State"} *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "पिनकोड" : "Pincode"} *</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Produce Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === "hi" ? "अतिरिक्त विवरण (नमी, छँटाई, पैकिंग)" : "Produce Quality & Packaging Notes"}
                </label>
                <textarea
                  rows={8}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={lang === "hi" ? "उदा. अच्छी तरह सूखी फसल, नमी < 12%, हवादार भंडार गृह में सुरक्षित, निरीक्षण के लिए तैयार।" : "e.g. Well-cured crop, moisture < 12%, stored in ventilated farm shed, ready for inspection."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t("common.cancel", lang)}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{submitting ? (lang === "hi" ? "मार्केटप्लेस में प्रकाशित कर रहे हैं..." : "Publishing to Marketplace...") : t("farmerModal.submitListing", lang)}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

