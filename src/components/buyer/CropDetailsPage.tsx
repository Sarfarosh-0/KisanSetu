import React, { useState } from "react";
import { 
  ArrowLeft, 
  ShieldCheck, 
  MapPin, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Send, 
  Leaf, 
  Truck, 
  Calendar, 
  Package, 
  Droplets, 
  Clock, 
  CheckCircle2, 
  Info, 
  Share2, 
  Heart, 
  TrendingUp, 
  Building2,
  Sparkles,
  HelpCircle,
  X
} from "lucide-react";
import { CropListing, User } from "../../types";
import { t, translateCrop, translateGrade } from "../../i18n";

interface CropDetailsPageProps {
  listing: CropListing;
  buyer: User;
  lang: "en" | "hi";
  onBack: () => void;
  onOpenRfqModal: (listing: CropListing) => void;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80";

export const CropDetailsPage: React.FC<CropDetailsPageProps> = ({
  listing,
  buyer,
  lang,
  onBack,
  onOpenRfqModal
}) => {
  // Normalize images array to ensure at least 1 image
  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [listing.imageUrl || DEFAULT_IMAGE];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentImage = images[activeImageIdx] || images[0] || DEFAULT_IMAGE;

  const moq = listing.minOrderQuantityQuintals || 10;
  const retailEstimate = Math.round(listing.expectedPricePerQuintal * 1.35);
  const savingsPercent = Math.round(((retailEstimate - listing.expectedPricePerQuintal) / retailEstimate) * 100);
  const farmerUplift = Math.round(((listing.expectedPricePerQuintal - listing.mandiBenchmarkPrice) / listing.mandiBenchmarkPrice) * 100);

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Breadcrumb & Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === "hi" ? "मार्केटप्लेस पर वापस जाएं" : "Back to Marketplace"}</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">{translateCrop(listing.cropName, lang)}</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 truncate max-w-[200px]">{listing.variety}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copiedLink ? (lang === "hi" ? "लिंक कॉपी हुआ!" : "Link Copied!") : (lang === "hi" ? "साझा करें" : "Share")}</span>
          </button>
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isWishlisted 
                ? "bg-rose-50 border-rose-200 text-rose-600" 
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
            title="Add to Watchlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Main Product Details (Flipkart-Style 2-Column Responsive Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: MULTI-IMAGE GALLERY & ACTION BUTTONS (5 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-sm space-y-4">
            
            {/* Gallery: Side-by-side on desktop (Flipkart style) */}
            <div className="flex flex-col-reverse md:flex-row gap-3">
              
              {/* Thumbnail strip (vertical on desktop, horizontal scroll on mobile) */}
              {images.length > 1 && (
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[380px] scrollbar-thin py-1 shrink-0">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      onMouseEnter={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 relative ${
                        activeImageIdx === idx 
                          ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-102 shadow-xs" 
                          : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
                      }`}
                      aria-label={`Thumbnail image ${idx + 1}`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${listing.cropName} thumb ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Large Primary Preview Image */}
              <div className="relative flex-1 h-72 sm:h-96 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 group/img">
                <img
                  src={currentImage}
                  alt={`${listing.cropName} - ${listing.variety}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Arrow Controls (Overlay) */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={handlePrevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md z-10 opacity-90 group-hover/img:opacity-100 shadow-md"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={handleNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md z-10 opacity-90 group-hover/img:opacity-100 shadow-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full z-10 shadow-xs">
                      {activeImageIdx + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Fullscreen zoom lightbox trigger */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="Zoom full image"
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer z-10"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Grade & Organic Tags Overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase shadow-xs ${
                    listing.qualityGrade === "Grade A"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}>
                    {translateGrade(listing.qualityGrade, lang)}
                  </span>
                  {listing.isOrganic && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-900/90 text-white backdrop-blur-sm">
                      {lang === "hi" ? "100% जैविक" : "100% Organic"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Action Button (Prominent Request to Buy / Send RFQ) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenRfqModal(listing)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold py-3.5 px-5 rounded-2xl text-sm transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{lang === "hi" ? "खरीद अनुरोध / RFQ भेजें" : "Request to Buy / Send RFQ"}</span>
              </button>
              <p className="text-[11px] text-center text-slate-500 pt-2 font-medium">
                {lang === "hi" 
                  ? "सीधे किसान से बातचीत • कोई तत्काल भुगतान आवश्यक नहीं" 
                  : "Direct negotiation with farmer • Zero upfront commitment"}
              </p>
            </div>

            {/* Quality & Escrow Assurances */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700 font-medium">{lang === "hi" ? "मंडी भाव प्रमाणित" : "APMC Benchmarked"}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700 font-medium">{lang === "hi" ? "गुणवत्ता निरीक्षण" : "100% Quality Inspected"}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700 font-medium">{lang === "hi" ? "एस्क्रो सुरक्षा" : "KisanSetu Escrow"}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700 font-medium">{lang === "hi" ? "खेत से सीधी लोडिंग" : "Farm-Gate Pickup"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: DETAILED CROP LISTING INFORMATION (7 cols)  */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Header Card: Farmer Identity & Badges */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-sm">
                  {listing.farmerName ? listing.farmerName.charAt(0) : "F"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{listing.farmerName || "Verified Producer"}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.2 rounded-full font-bold">
                      {lang === "hi" ? "सत्यापित किसान" : "Verified Farmer"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {listing.fpoName || (lang === "hi" ? "सह्याद्री कृषि विकास प्रोड्यूसर कंपनी" : "Regional Farmer Producer Org")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl font-bold text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{listing.farmerTrustScore || 4.9}</span>
                  <span className="text-slate-400 font-normal">/ 5.0</span>
                </div>
              </div>
            </div>

            {/* Title & Variety */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                {translateCrop(listing.cropName, lang)}
              </h1>
              <p className="text-sm font-semibold text-emerald-700">
                {listing.variety} • {lang === "hi" ? "कटाई:" : "Harvest:"} {listing.harvestDate}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.district}, {listing.state} (PIN {listing.pincode})</span>
              </div>
            </div>

            {/* Pricing Box (B2B Rates & Mandi Comparison) */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">
                    {lang === "hi" ? "खेत-खलिहान उत्पाद दर (Farm-Gate):" : "Direct Farm-Gate Price:"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 font-display">
                      ₹{listing.expectedPricePerQuintal.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      / {lang === "hi" ? "क्विंटल" : "Quintal"} (₹{(listing.expectedPricePerQuintal / 100).toFixed(2)}/kg)
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-200/70 px-3 py-1 rounded-full">
                    {lang === "hi" ? `खुदरा से ~${savingsPercent}% बचत` : `Save ~${savingsPercent}% vs Retail`}
                  </span>
                </div>
              </div>

              {/* Mandi comparison breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-200/70 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">{lang === "hi" ? "मंडी बेंचमार्क:" : "Mandi Modal:"}</span>
                  <span className="font-bold text-slate-800">₹{listing.mandiBenchmarkPrice.toLocaleString()} /qtl</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">{lang === "hi" ? "किसान प्राप्ति:" : "Farmer Uplift:"}</span>
                  <span className="font-bold text-emerald-700">+{farmerUplift}% vs Mandi</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[11px]">{lang === "hi" ? "अनुमानित खुदरा:" : "Retail Value:"}</span>
                  <span className="font-bold text-slate-800">~₹{retailEstimate.toLocaleString()} /qtl</span>
                </div>
              </div>
            </div>

            {/* AI Fair Price Range Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === "hi" ? "एआई उचित मूल्य अनुशंसा बैंड" : "AI Fair-Price Recommendation Band"}</span>
                </span>
                <span className="text-emerald-700 font-mono">₹{listing.aiRecommendedTarget.toLocaleString()} /qtl target</span>
              </div>
              <div className="grid grid-cols-3 text-center text-[11px] text-slate-500 pt-1">
                <div>
                  <span className="block text-slate-400">Min Fair</span>
                  <span className="font-bold text-slate-700">₹{listing.aiRecommendedMin.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-emerald-700 font-bold">Recommended</span>
                  <span className="font-bold text-emerald-800">₹{listing.aiRecommendedTarget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Max Fair</span>
                  <span className="font-bold text-slate-700">₹{listing.aiRecommendedMax.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>{lang === "hi" ? "लॉट विनिर्देश व व्यापार पैरामीटर" : "Lot Specifications & Trade Parameters"}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-500 block text-[11px]">{lang === "hi" ? "उपलब्ध मात्रा:" : "Available Stock:"}</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {listing.quantityQuintals} Quintals
                </span>
                <span className="text-[11px] text-slate-500 block">
                  ({(listing.quantityQuintals * 100).toLocaleString()} kg)
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-500 block text-[11px]">{lang === "hi" ? "न्यूनतम ऑर्डर (MOQ):" : "Min Order Qty (MOQ):"}</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {moq} Quintals
                </span>
                <span className="text-[11px] text-slate-500 block">
                  ({(moq * 100).toLocaleString()} kg)
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-500 block text-[11px]">{lang === "hi" ? "गुणवत्ता ग्रेड:" : "Quality Grade:"}</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {translateGrade(listing.qualityGrade, lang)}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {listing.isOrganic ? (lang === "hi" ? "100% जैविक" : "100% Organic") : (lang === "hi" ? "मानक कृषि" : "Conventional")}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-500 block text-[11px]">{lang === "hi" ? "कटाई तिथि:" : "Harvest Date:"}</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {listing.harvestDate}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {lang === "hi" ? "ताजा फसल" : "Fresh Harvest"}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-500 block text-[11px]">{lang === "hi" ? "पैकेजिंग प्रकार:" : "Packaging Type:"}</span>
                <span className="font-bold text-slate-900 text-xs">
                  {listing.packagingType || (lang === "hi" ? "50 किग्रा जूट बोरी" : "50 kg Clean Bags")}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-500 block text-[11px]">{lang === "hi" ? "नमी / शेल्फ लाइफ:" : "Moisture / Shelf Life:"}</span>
                <span className="font-bold text-slate-900 text-xs">
                  {listing.moisturePct ? `${listing.moisturePct}% moisture` : "Optimal"} • {listing.shelfLifeDays || 90}d
                </span>
              </div>
            </div>
          </div>

          {/* Description & Notes */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>{lang === "hi" ? "फसल विवरण व किसान नोट्स" : "Crop Description & Farmer Notes"}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
              "{listing.notes || (lang === "hi" ? "खेत से सीधे एकत्रित, हाथ से छांटी गई निर्यात-गुणवत्ता वाली उपज। सुरक्षित भंडारण व तत्काल लोडिंग के लिए तैयार।" : "Direct farm-gate harvested, uniformly graded produce. Cleaned, sorted, and ready for commercial dispatch.")}"
            </p>
          </div>

          {/* Bottom Sticky Action Box */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-extrabold font-display text-emerald-300">
                {lang === "hi" ? "इस लॉट की खरीद हेतु तैयार हैं?" : "Ready to procure this lot?"}
              </h4>
              <p className="text-xs text-slate-300">
                {lang === "hi" 
                  ? "अपनी आवश्यक मात्रा व लक्षित मूल्य के साथ किसान को सीधा RFQ भेजें।" 
                  : "Submit a customized Request to Buy (RFQ) with your target quantity and price."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenRfqModal(listing)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{lang === "hi" ? "खरीद अनुरोध / RFQ भेजें" : "Request to Buy / Send RFQ"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Fullscreen Image Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={currentImage} 
              alt={listing.cropName} 
              className="max-h-[75vh] w-auto object-contain rounded-2xl border border-white/20 shadow-2xl" 
            />
            {images.length > 1 && (
              <div className="flex items-center gap-4 mt-4 text-white">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold font-mono">{activeImageIdx + 1} / {images.length}</span>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
