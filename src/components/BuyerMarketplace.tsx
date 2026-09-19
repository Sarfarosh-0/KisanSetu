import React, { useState, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Leaf, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Eye, 
  Layers, 
  PackageCheck,
  Building2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { CropListing, User } from "../types";
import { t, translateCrop, translateGrade } from "../i18n";
import { MOCK_CROP_LISTINGS } from "../data/mockAgriData";
import { CropDetailsPage } from "./buyer/CropDetailsPage";
import { CropRfqModal } from "./buyer/CropRfqModal";

interface BuyerMarketplaceProps {
  buyer: User;
  listings: CropListing[];
  onOpenOrderModal?: (listing: CropListing) => void;
  lang: "en" | "hi";
  externalSearch?: string;
}

const CROP_CATEGORIES = [
  "All",
  "Wheat",
  "Rice",
  "Potato",
  "Tomato",
  "Onion",
  "Maize",
  "Mustard",
  "Sugarcane",
  "Pulses",
  "Seasonal Vegetables",
  "Red Chilli",
  "Soybean"
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80";

interface BuyerListingCardProps {
  listing: CropListing;
  onSelectListing: (listing: CropListing) => void;
  onOpenRfqModal: (listing: CropListing) => void;
  lang: "en" | "hi";
}

const BuyerListingCard: React.FC<BuyerListingCardProps> = ({ 
  listing, 
  onSelectListing, 
  onOpenRfqModal, 
  lang 
}) => {
  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [listing.imageUrl || DEFAULT_IMAGE];
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentImage = images[activeImageIndex] || images[0] || DEFAULT_IMAGE;

  const moq = listing.minOrderQuantityQuintals || 10;
  const retailEstimate = Math.round(listing.expectedPricePerQuintal * 1.35);
  const savingsPercent = Math.round(((retailEstimate - listing.expectedPricePerQuintal) / retailEstimate) * 100);
  const farmerUplift = Math.round(((listing.expectedPricePerQuintal - listing.mandiBenchmarkPrice) / listing.mandiBenchmarkPrice) * 100);

  return (
    <div 
      onClick={() => onSelectListing(listing)}
      className="bg-white rounded-3xl border border-emerald-100/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Card Image Banner */}
        <div className="relative h-52 bg-slate-100 overflow-hidden group/img">
          <img
            src={currentImage}
            alt={listing.cropName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Left / Right Arrow Navigation Overlay */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length); 
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs z-10 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveImageIndex((activeImageIndex + 1) % images.length); 
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs z-10 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {/* Image Counter Pill */}
              <div className="absolute bottom-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10 shadow-xs">
                {activeImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Grade & Organic Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase shadow-xs ${
              listing.qualityGrade === "Grade A"
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white"
            }`}>
              {translateGrade(listing.qualityGrade, lang)}
            </span>
            {listing.isOrganic && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-900/90 text-white backdrop-blur-xs shadow-xs">
                {lang === "hi" ? "100% जैविक" : "100% Organic"}
              </span>
            )}
          </div>

          {/* Available Quantity Pill */}
          <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-xl shadow-xs">
            {listing.quantityQuintals} {lang === "hi" ? "क्विंटल उपलब्ध" : "Quintals"}
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 space-y-3">
          {/* Farmer & Rating Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[150px]">
                {listing.farmerName || (lang === "hi" ? "सत्यापित उत्पादक" : "Verified Producer")}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" aria-hidden="true" />
              <span>{listing.farmerTrustScore || 4.9}</span>
            </div>
          </div>

          {/* Crop Title & Variety */}
          <div>
            <h3 className="text-lg font-black text-slate-900 font-display group-hover:text-emerald-700 transition-colors">
              {translateCrop(listing.cropName, lang)}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {listing.variety} • {lang === "hi" ? "कटाई:" : "Harvest:"} {listing.harvestDate}
            </p>
          </div>

          {/* Location & FPO Details */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[160px]">{listing.district}, {listing.state}</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              MOQ: {moq} Qtl
            </div>
          </div>

          {/* Notes Preview if available */}
          {listing.notes && (
            <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              "{listing.notes}"
            </p>
          )}

          {/* Pricing Highlight Box */}
          <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">{lang === "hi" ? "खेत-खलिहान भाव:" : "Direct Farm Price:"}</span>
                <div className="text-xl font-black text-slate-900 font-display">
                  ₹{listing.expectedPricePerQuintal.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500"> / {lang === "hi" ? "क्विंटल" : "Quintal"}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {lang === "hi" ? `बचत ~${savingsPercent}%` : `Save ~${savingsPercent}%`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-emerald-100 text-[11px]">
              <div className="text-slate-500">
                {lang === "hi" ? "मंडी भाव:" : "Mandi Modal:"} <span className="font-bold text-slate-700">₹{listing.mandiBenchmarkPrice.toLocaleString()}</span>
              </div>
              <div className="text-right text-emerald-700 font-bold">
                {lang === "hi" ? "किसान प्राप्ति:" : "Farmer Realization:"} <span>+{farmerUplift}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 font-medium grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectListing(listing);
          }}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{lang === "hi" ? "पूरी जानकारी" : "View Details"}</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenRfqModal(listing);
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{lang === "hi" ? "RFQ भेजें" : "Send RFQ"}</span>
        </button>
      </div>
    </div>
  );
};

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({
  buyer,
  listings,
  lang,
  externalSearch = ""
}) => {
  // Use mock listings if incoming listings prop is empty or not yet loaded
  const effectiveListings = useMemo(() => {
    if (listings && listings.length > 0) {
      return listings;
    }
    return MOCK_CROP_LISTINGS;
  }, [listings]);

  // Selected listing for the dedicated Crop Details Page
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);

  // Active RFQ modal target listing
  const [rfqListing, setRfqListing] = useState<CropListing | null>(null);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "rating" | "quantity">("price-low");

  const effectiveSearch = (searchTerm || externalSearch).trim().toLowerCase();

  const filteredListings = useMemo(() => {
    return effectiveListings.filter((item) => {
      if (selectedCategory !== "All") {
        const cat = selectedCategory.toLowerCase();
        const name = item.cropName.toLowerCase();
        if (!name.includes(cat) && !cat.includes(name)) {
          return false;
        }
      }
      if (selectedGrade !== "All" && item.qualityGrade !== selectedGrade) {
        return false;
      }
      if (organicOnly && !item.isOrganic) {
        return false;
      }
      if (item.expectedPricePerQuintal > maxPrice) {
        return false;
      }
      if (effectiveSearch) {
        const q = effectiveSearch;
        const matchesName = item.cropName.toLowerCase().includes(q);
        const matchesVariety = item.variety.toLowerCase().includes(q);
        const matchesDistrict = item.district.toLowerCase().includes(q);
        const matchesFarmer = item.farmerName?.toLowerCase().includes(q);
        if (!matchesName && !matchesVariety && !matchesDistrict && !matchesFarmer) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.expectedPricePerQuintal - b.expectedPricePerQuintal;
      if (sortBy === "price-high") return b.expectedPricePerQuintal - a.expectedPricePerQuintal;
      if (sortBy === "rating") return (b.farmerTrustScore || 0) - (a.farmerTrustScore || 0);
      if (sortBy === "quantity") return b.quantityQuintals - a.quantityQuintals;
      return 0;
    });
  }, [effectiveListings, selectedCategory, selectedGrade, organicOnly, maxPrice, effectiveSearch, sortBy]);

  // If a crop is selected, render the dedicated Crop Details Page
  if (selectedListing) {
    return (
      <>
        <CropDetailsPage
          listing={selectedListing}
          buyer={buyer}
          lang={lang}
          onBack={() => setSelectedListing(null)}
          onOpenRfqModal={(target) => setRfqListing(target)}
        />
        {rfqListing && (
          <CropRfqModal
            listing={rfqListing}
            buyer={buyer}
            isOpen={true}
            onClose={() => setRfqListing(null)}
            lang={lang}
          />
        )}
      </>
    );
  }

  // Otherwise render the Marketplace browsing view
  return (
    <div className="space-y-6">
      {/* Marketplace Header Hero */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === "hi" ? "सीधी खेत-खलिहान खरीद • 0% आढ़ती कमीशन" : "Direct Farm-Gate Sourcing • 0% Mandi Brokerage"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
            {lang === "hi" ? "किसानSetu फसल थोक मार्केटप्लेस" : "KisanSetu B2B Crop Marketplace"}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
            {lang === "hi" 
              ? "सत्यापित किसानों और FPO से सीधे उच्च-गुणवत्ता वाली कृषि उपज ब्राउज़ करें। लॉट का निरीक्षण करें और सीधा खरीद अनुरोध (RFQ) सबमिट करें।" 
              : "Browse quality-graded agricultural commodities directly from certified farmer collectives. Inspect specifications and send custom Requests to Buy (RFQ)."}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={lang === "hi" ? "फसल, किस्म या किसान खोजें (उदा. Sharbati Wheat, Basmati Rice, Onion)..." : "Search crops, varieties, districts, or farmers (e.g. Sharbati Wheat, Basmati Rice, Onion)..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-900 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">{t("common.all", lang)} {lang === "hi" ? "ग्रेड" : "Grades"}</option>
              <option value="Grade A">{lang === "hi" ? "ग्रेड A (उत्कृष्ट)" : "Grade A (Premium)"}</option>
              <option value="Grade B">{lang === "hi" ? "ग्रेड B (मानक)" : "Grade B (Standard)"}</option>
              <option value="Grade C">{lang === "hi" ? "ग्रेड C (प्रोसेसिंग)" : "Grade C (Processing)"}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="price-low">{t("buyer.sortPriceLow", lang)}</option>
              <option value="price-high">{t("buyer.sortPriceHigh", lang)}</option>
              <option value="rating">{t("buyer.sortRating", lang)}</option>
              <option value="quantity">{t("buyer.sortQuantity", lang)}</option>
            </select>

            <button
              onClick={() => setOrganicOnly(!organicOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                organicOnly
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t("buyer.organicOnly", lang)}</span>
            </button>
          </div>
        </div>

        {/* Commodity Categories Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {translateCrop(cat, lang)}
            </button>
          ))}
          <div className="ml-auto text-xs text-slate-500 font-bold whitespace-nowrap hidden sm:block">
            {filteredListings.length} {lang === "hi" ? "लॉट उपलब्ध" : "active farm lots"}
          </div>
        </div>
      </div>

      {/* Crop Cards Grid or Empty State */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center space-y-3 shadow-xs">
          <Search className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {lang === "hi" ? "कोई फसल लिस्टिंग नहीं मिली" : "No listings match your criteria"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {lang === "hi" 
              ? "कृपया खोज शब्द, ग्रेड फ़िल्टर बदलें या सभी फ़िल्टर रीसेट करें।" 
              : "Try adjusting your search terms, grade filter, or clearing the organic filter."}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSelectedGrade("All");
              setOrganicOnly(false);
            }}
            className="text-xs bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-700 shadow-xs"
          >
            {lang === "hi" ? "सभी फ़िल्टर रीसेट करें" : "Reset All Filters"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <BuyerListingCard
              key={listing.id}
              listing={listing}
              onSelectListing={(target) => setSelectedListing(target)}
              onOpenRfqModal={(target) => setRfqListing(target)}
              lang={lang}
            />
          ))}
        </div>
      )}

      {/* Global RFQ Modal when triggered from Marketplace Card */}
      {rfqListing && (
        <CropRfqModal
          listing={rfqListing}
          buyer={buyer}
          isOpen={true}
          onClose={() => setRfqListing(null)}
          lang={lang}
        />
      )}
    </div>
  );
};
