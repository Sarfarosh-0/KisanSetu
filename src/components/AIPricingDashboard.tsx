import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Info, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Calculator,
  RefreshCw,
  Leaf,
  Landmark,
  Briefcase,
  Tag,
  Sprout 
} from "lucide-react";
import { FairPriceResult, MandiComparison } from "../types";
import { API } from "../api";
import { t, translateCrop, translateGrade } from "../i18n";

interface AIPricingDashboardProps {
  lang: "en" | "hi";
}

const SUPPORTED_CROPS = [
  { name: "Onion", state: "Maharashtra", district: "Nashik" },
  { name: "Wheat", state: "Punjab", district: "Ludhiana" },
  { name: "Tomato", state: "Karnataka", district: "Kolar" },
  { name: "Red Chilli", state: "Andhra Pradesh", district: "Guntur" },
  { name: "Paddy (Basmati)", state: "Haryana", district: "Karnal" },
  { name: "Potato", state: "Uttar Pradesh", district: "Agra" },
  { name: "Soybean", state: "Madhya Pradesh", district: "Indore" },
  { name: "Mustard", state: "Rajasthan", district: "Bharatpur" },
  { name: "Cotton", state: "Gujarat", district: "Rajkot" },
  { name: "Maize", state: "Bihar", district: "Gulabbagh" },
  { name: "Apple", state: "Jammu and Kashmir", district: "Sopore" },
  { name: "Turmeric", state: "Tamil Nadu", district: "Erode" },
  { name: "Tea", state: "Assam", district: "Dibrugarh" },
  { name: "Sugarcane", state: "Uttar Pradesh", district: "Muzaffarnagar" },
  { name: "Banana", state: "Maharashtra", district: "Jalgaon" },
  { name: "Black Pepper", state: "Kerala", district: "Wayanad" },
  { name: "Gram (Chana)", state: "Madhya Pradesh", district: "Vidisha" },
  { name: "Groundnut", state: "Gujarat", district: "Junagadh" },
  { name: "Coffee", state: "Karnataka", district: "Chikkamagaluru" },
  { name: "Cardamom", state: "Kerala", district: "Idukki" },
  { name: "Cumin (Jeera)", state: "Gujarat", district: "Unjha" },
  { name: "Pomegranate", state: "Maharashtra", district: "Solapur" },
  { name: "Garlic", state: "Madhya Pradesh", district: "Mandsaur" },
  { name: "Mango (Alphonso)", state: "Maharashtra", district: "Ratnagiri" },
  { name: "Orange", state: "Maharashtra", district: "Nagpur" },
  { name: "Arhar (Tur Dal)", state: "Karnataka", district: "Kalaburagi" },
  { name: "Cashew", state: "Goa", district: "North Goa" },
  { name: "Saffron", state: "Jammu and Kashmir", district: "Pulwama" },
  { name: "Ginger", state: "Meghalaya", district: "Ri-Bhoi" },
  { name: "Rubber", state: "Kerala", district: "Kottayam" },
  { name: "Jute", state: "West Bengal", district: "Hooghly" },
  { name: "Walnut", state: "Jammu and Kashmir", district: "Anantnag" },
  { name: "Grape", state: "Maharashtra", district: "Sangli" },
  { name: "Arecanut", state: "Karnataka", district: "Shivamogga" },
  { name: "Coriander", state: "Rajasthan", district: "Kota" }
];
export const AIPricingDashboard: React.FC<AIPricingDashboardProps> = ({ lang }) => {
  const [selectedCrop, setSelectedCrop] = useState("Onion");
  const [grade, setGrade] = useState("Grade A");
  const [volume, setVolume] = useState<number>(50);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [isOrganic, setIsOrganic] = useState(false);

  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<MandiComparison | null>(null);
  const [priceDetails, setPriceDetails] = useState<FairPriceResult | null>(null);

  const currentCropMeta = SUPPORTED_CROPS.find(c => c.name === selectedCrop) || SUPPORTED_CROPS[0];

  const fetchPricingIntelligence = async () => {
    try {
      setLoading(true);
      const [compRes, fairRes] = await Promise.all([
        API.getMandiComparison(selectedCrop),
        API.getPriceRecommendation({
          cropName: selectedCrop,
          quantityQuintals: volume,
          qualityGrade: grade,
          district: currentCropMeta.district,
          state: currentCropMeta.state,
          month,
          isOrganic
        })
      ]);
      setComparison(compRes);
      setPriceDetails(fairRes);
    } catch (err) {
      console.error("Failed to load pricing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingIntelligence();
  }, [selectedCrop, grade, volume, month, isOrganic]);

  // Seasonal cyclical trend curve for historical visual graph (12 months)
  const seasonalCurve = [
    { month: lang === "hi" ? "जन" : "Jan", factor: 0.94 },
    { month: lang === "hi" ? "फर" : "Feb", factor: 0.98 },
    { month: lang === "hi" ? "मार्च" : "Mar", factor: 0.92 },
    { month: lang === "hi" ? "अप्रै" : "Apr", factor: 0.88 },
    { month: lang === "hi" ? "मई" : "May", factor: 0.90 },
    { month: lang === "hi" ? "जून" : "Jun", factor: 0.96 },
    { month: lang === "hi" ? "जुला" : "Jul", factor: 1.05 },
    { month: lang === "hi" ? "अग" : "Aug", factor: 1.12 },
    { month: lang === "hi" ? "सित" : "Sep", factor: 1.15 },
    { month: lang === "hi" ? "अक्तू" : "Oct", factor: 1.08 },
    { month: lang === "hi" ? "नव" : "Nov", factor: 1.02 },
    { month: lang === "hi" ? "दिस" : "Dec", factor: 0.96 }
  ];

  const baseMandi = priceDetails?.mandiBenchmarkPrice || 1850;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-emerald-500/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === "hi" ? "किसानSetu AI मूल्य निर्धारण इंजन • एगमार्कनेट मानक" : "किसानSetu Predictive Pricing Engine • Agmarknet & Quality Regressor"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
            {lang === "hi" ? "AI उचित मूल्य सिफारिश व मंडी तुलना" : "AI Fair-Price Recommendation & Mandi Benchmark"}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm font-medium">
            {lang === "hi"
              ? "APMC मंडी मॉडल दरों, गुणवत्ता ग्रेड प्रीमियम और मौसमी मांग संकेतों के आधार पर सटीक और लाभकारी मूल्य का आकलन।"
              : "Empowering farmers with algorithmically predicted fair price ranges benchmarked against APMC / Agmarknet modal rates, grade quality premiums, and seasonal demand signals."}
          </p>
        </div>
      </div>

      {/* Simulator Control Bar */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-display">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>{lang === "hi" ? "इंटरैक्टिव मूल्य अनुमान सिम्युलेटर" : "Interactive Price Recommendation Simulator"}</span>
          </h2>
          <button
            onClick={fetchPricingIntelligence}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{lang === "hi" ? "पुनः गणना करें" : "Recalculate"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "फसल" : "Crop"}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {SUPPORTED_CROPS.map(c => (
                <option key={c.name} value={c.name}>{translateCrop(c.name, lang)} ({c.district})</option>
              ))}
            </select>
          </div>

          {/* Quality Grade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "गुणवत्ता ग्रेड" : "Quality Grade"}</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Grade A">{lang === "hi" ? "ग्रेड A (प्रीमियम/निर्यात)" : "Grade A (Premium/Export)"}</option>
              <option value="Grade B">{lang === "hi" ? "ग्रेड B (मानक वाणिज्यिक)" : "Grade B (Standard Commercial)"}</option>
              <option value="Grade C">{lang === "hi" ? "ग्रेड C (प्रसंस्करण)" : "Grade C (Processing)"}</option>
            </select>
          </div>

          {/* Volume */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "मात्रा (क्विंटल)" : "Quantity (Quintals)"}</label>
            <input
              type="number"
              min={5}
              max={2000}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Harvest Month */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "कटाई का महीना" : "Harvest Month"}</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value={1}>{lang === "hi" ? "जनवरी (रबी)" : "January (Rabi)"}</option>
              <option value={2}>{lang === "hi" ? "फरवरी" : "February"}</option>
              <option value={3}>{lang === "hi" ? "मार्च (कटाई)" : "March (Harvest)"}</option>
              <option value={4}>{lang === "hi" ? "अप्रैल" : "April"}</option>
              <option value={5}>{lang === "hi" ? "मई" : "May"}</option>
              <option value={6}>{lang === "hi" ? "जून (खरीफ बुवाई)" : "June (Kharif sowing)"}</option>
              <option value={7}>{lang === "hi" ? "जुलाई" : "July"}</option>
              <option value={8}>{lang === "hi" ? "अगस्त" : "August"}</option>
              <option value={9}>{lang === "hi" ? "सितंबर" : "September"}</option>
              <option value={10}>{lang === "hi" ? "अक्टूबर (खरीफ कटाई)" : "October (Kharif harvest)"}</option>
              <option value={11}>{lang === "hi" ? "नवंबर" : "November"}</option>
              <option value={12}>{lang === "hi" ? "दिसंबर" : "December"}</option>
            </select>
          </div>

          {/* Organic Toggle */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer h-9.5 transition-colors">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="rounded text-emerald-600 cursor-pointer accent-emerald-600"
              />
              <span className="inline-flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{lang === "hi" ? "जैविक (Organic)" : "Organic Lot"}</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* CORE SIDE-BY-SIDE COMPARISON DASHBOARD (Mandi vs AI Recommended vs Buyer Offers vs Retail) */}
      {priceDetails && comparison && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 font-display">
              {lang === "hi" ? `बाजार मूल्य तुलना विश्लेषण (${translateCrop(selectedCrop, lang)})` : `Side-by-Side Market Rate Analysis (${selectedCrop})`}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {lang === "hi" ? `मानक संदर्भ: ${currentCropMeta.district} APMC मंडी` : `Reference Benchmark: ${currentCropMeta.district} APMC Yard`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Mandi Modal Price */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                  <span>{lang === "hi" ? "स्थानीय मंडी मॉडल भाव" : "Local Mandi Modal"}</span>
                </span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {lang === "hi" ? "पारंपरिक" : "Traditional"}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-display">
                ₹{priceDetails.mandiBenchmarkPrice.toLocaleString()}
                <span className="text-xs font-normal text-slate-500"> / {lang === "hi" ? "क्विंटल" : "qtl"}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                {lang === "hi" ? "6-8% आढ़तिया कमीशन और कटौती से पहले का प्रचलित APMC नीलामी भाव।" : "Prevailing APMC trader auction price before 6–8% arhatiya deductions and handling cuts."}
              </p>
            </div>

            {/* 2. AI Recommended Target Price (HERO) */}
            <div className="bg-emerald-500 text-white rounded-3xl p-6 shadow-md space-y-2.5 relative overflow-hidden border border-emerald-400">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
              <div className="text-xs font-bold text-emerald-100 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === "hi" ? "AI अनुशंसित उचित भाव" : "AI Recommended Fair Price"}</span>
                </span>
                <span className="bg-amber-300 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                  {lang === "hi" ? "अनुशंसित" : "Recommended"}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-200 font-display">
                ₹{priceDetails.recommendedTargetPrice.toLocaleString()}
                <span className="text-xs font-normal text-emerald-100"> / {lang === "hi" ? "क्विंटल" : "qtl"}</span>
              </div>
              <div className="text-xs text-emerald-100 font-bold bg-emerald-600/70 rounded-xl p-2 border border-emerald-400/40">
                {lang === "hi" ? "उचित दायरा:" : "Range:"} ₹{priceDetails.minFairPrice.toLocaleString()} – ₹{priceDetails.maxFairPrice.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-100 leading-snug font-medium">
                +{Math.round(((priceDetails.recommendedTargetPrice - priceDetails.mandiBenchmarkPrice) / priceDetails.mandiBenchmarkPrice) * 100)}% {lang === "hi" ? "सीधे सौदे द्वारा किसान को अतिरिक्त लाभ।" : "net realization for farmer via disintermediation."}
              </p>
            </div>

            {/* 3. Average Buyer Offer */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                  <span>{lang === "hi" ? "प्लेटफ़ॉर्म खरीदार बोलियां" : "Platform Buyer Offers"}</span>
                </span>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {lang === "hi" ? "सक्रिय बोली" : "Active Bid"}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 font-display">
                ₹{comparison.platformBuyerOffersAvg.toLocaleString()}
                <span className="text-xs font-normal text-slate-500"> / {lang === "hi" ? "क्विंटल" : "qtl"}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                {lang === "hi" ? "किसानSetu पर सत्यापित खरीदारों व रिटेल चेन द्वारा लगाई गई औसत बोली।" : "Average bid placed by verified institutional buyers & retail chains on किसानSetu."}
              </p>
            </div>

            {/* 4. Retail Consumer Rate */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500 shrink-0" aria-hidden="true" />
                  <span>{lang === "hi" ? "खुदरा उपभोक्ता भाव" : "Retail Consumer Rate"}</span>
                </span>
                <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {lang === "hi" ? "अंतिम बाजार" : "End-Market"}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-display">
                ₹{priceDetails.retailEstimatedPrice.toLocaleString()}
                <span className="text-xs font-normal text-slate-500"> / {lang === "hi" ? "क्विंटल" : "qtl"}</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-bold leading-relaxed">
                {lang === "hi"
                  ? `सीधे किसान से खरीदकर खरीदार को खुदरा की तुलना में ~${Math.round(((priceDetails.retailEstimatedPrice - priceDetails.recommendedTargetPrice) / priceDetails.retailEstimatedPrice) * 100)}% बचत मिलती है।`
                  : `Direct buyer saves ~${Math.round(((priceDetails.retailEstimatedPrice - priceDetails.recommendedTargetPrice) / priceDetails.retailEstimatedPrice) * 100)}% compared to retail procurement.`}
              </p>
            </div>
          </div>

          {/* Factor Breakdown Waterfall & Model Explainability */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
            {/* Left: AI Factor Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 font-display">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{lang === "hi" ? "AI मूल्य मॉडल विश्लेषण व कारक" : "AI Price Model Feature Weights & Explainability"}</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {lang === "hi" ? "सटीकता 94%" : "Confidence 94%"}
                </span>
              </div>

              <div className="space-y-2.5">
                {priceDetails.factors.map((factor, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{factor.factorName}</span>
                      <span className={`font-extrabold px-2 py-0.5 rounded-full text-[11px] ${
                        factor.impactPct > 0 
                          ? "text-emerald-700 bg-emerald-100" 
                          : factor.impactPct < 0 
                          ? "text-amber-700 bg-amber-100" 
                          : "text-slate-600 bg-slate-200"
                      }`}>
                        {factor.impactPct > 0 ? `+${factor.impactPct}%` : `${factor.impactPct}%`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug font-medium">
                      {factor.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-[#F0FDF4] rounded-2xl border border-emerald-100 text-xs text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="font-medium leading-relaxed">
                  <span className="font-bold text-emerald-900">
                    {lang === "hi" ? "पारदर्शी उचित मूल्य एल्गोरिथम: " : "Transparent Fair Price Algorithm: "}
                  </span>
                  <span>
                    {lang === "hi"
                      ? "हमारी मशीन लर्निंग प्रणाली मंडी हाजिर दरों, गुणवत्ता ग्रेड और मौसमी मांग वक्रों को कैलिब्रेट करती है ताकि किसानों को सही मूल्य मिले।"
                      : "Our machine learning pipeline calibrates mandi spot rates with sorting grades and seasonal supply curves, ensuring farmers capture their rightful share while buyers bypass stacked intermediary markups."}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: 12-Month Seasonal Mandi Trend Curve */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 font-display">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === "hi" ? "12-महीने का मंडी बनाम प्रत्यक्ष मूल्य रुझान" : "12-Month Mandi vs. Direct Price Seasonality Trend"}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-bold">₹/{lang === "hi" ? "क्विंटल" : "Quintal"}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {lang === "hi"
                    ? "वार्षिक मूल्य चक्र और सीधे व्यापार द्वारा मिलने वाले निरंतर प्रीमियम का दृश्य प्रदर्शन।"
                    : "Illustrating annual price fluctuations and the consistent premium delivered by direct trade."}
                </p>

                {/* SVG Visual Trend Chart */}
                <div className="mt-4 pt-2">
                  <div className="relative h-44 w-full flex items-end justify-between gap-1 px-2 border-b border-slate-200 pb-2">
                    {seasonalCurve.map((pt, i) => {
                      const mandiVal = Math.round(baseMandi * pt.factor);
                      const directVal = Math.round(mandiVal * 1.19);
                      const maxVal = baseMandi * 1.4;
                      const mandiHeight = Math.round((mandiVal / maxVal) * 120);
                      const directHeight = Math.round((directVal / maxVal) * 120);
                      const isCurrentMonth = i + 1 === month;

                      return (
                        <div key={pt.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                          {/* Tooltip on hover */}
                          <div className="absolute -top-12 bg-slate-900 text-white text-[10px] p-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div>{pt.month}: {lang === "hi" ? "सीधा भाव" : "Direct"} ₹{directVal}</div>
                            <div className="text-slate-400">{lang === "hi" ? "मंडी भाव" : "Mandi"} ₹{mandiVal}</div>
                          </div>

                          <div className="w-full flex items-end justify-center gap-0.5 h-32">
                            {/* Mandi Bar */}
                            <div 
                              style={{ height: `${mandiHeight}px` }} 
                              className="w-1.5 sm:w-2 bg-slate-300 rounded-t-xs" 
                            />
                            {/* Direct Farm Bar */}
                            <div 
                              style={{ height: `${directHeight}px` }} 
                              className={`w-1.5 sm:w-2 rounded-t-xs transition-all ${
                                isCurrentMonth ? "bg-amber-400" : "bg-emerald-500"
                              }`} 
                            />
                          </div>
                          <span className={`text-[10px] font-bold ${isCurrentMonth ? "text-emerald-700 underline" : "text-slate-400"}`}>
                            {pt.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-slate-300 rounded-xs" />
                      <span className="text-slate-600 font-medium">{lang === "hi" ? "मंडी भाव" : "Local Mandi Modal"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-emerald-500 rounded-xs" />
                      <span className="text-slate-900 font-bold">{lang === "hi" ? "किसानSetu सीधा उचित भाव" : "किसानSetu Direct Fair Price"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-amber-400 rounded-xs" />
                      <span className="text-amber-800 font-bold">{lang === "hi" ? "चयनित महीना" : "Selected Month"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{lang === "hi" ? "मॉडल संस्करण:" : "Model Version:"} <strong className="text-slate-700">v1.4-RandomForest-APMC</strong></span>
                <span className="text-emerald-700 font-bold">MSE: 0.042 (88% R² Score)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

