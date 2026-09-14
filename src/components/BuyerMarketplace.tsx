import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  Star, 
  ShoppingCart, 
  CheckCircle2, 
  ArrowUpDown,
  SlidersHorizontal,
  Info,
  Calendar,
  Leaf
} from "lucide-react";
import { CropListing, User } from "../types";
import { t, translateCrop, translateGrade } from "../i18n";

interface BuyerMarketplaceProps {
  buyer: User;
  listings: CropListing[];
  onOpenOrderModal: (listing: CropListing) => void;
  lang: "en" | "hi";
}

const CROP_CATEGORIES = [
  "All",
  "Onion",
  "Wheat",
  "Tomato",
  "Red Chilli",
  "Paddy (Basmati)",
  "Potato",
  "Soybean"
];

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({
  buyer,
  listings,
  onOpenOrderModal,
  lang
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "rating" | "quantity">("price-low");

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Category filter
      if (selectedCategory !== "All" && !item.cropName.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }
      // Grade filter
      if (selectedGrade !== "All" && item.qualityGrade !== selectedGrade) {
        return false;
      }
      // Organic filter
      if (organicOnly && !item.isOrganic) {
        return false;
      }
      // Max price
      if (item.expectedPricePerQuintal > maxPrice) {
        return false;
      }
      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
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
  }, [listings, selectedCategory, selectedGrade, organicOnly, maxPrice, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={lang === "hi" ? "फसल, किस्म या किसान खोजें..." : "Search crops, varieties, districts, or farmers..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-900 font-medium"
            />
          </div>

          {/* Quick Selects */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="All">{t("common.all", lang)} {lang === "hi" ? "ग्रेड" : "Grades"}</option>
              <option value="Grade A">{lang === "hi" ? "ग्रेड A (उत्कृष्ट)" : "Grade A (Premium)"}</option>
              <option value="Grade B">{lang === "hi" ? "ग्रेड B (मानक)" : "Grade B (Standard)"}</option>
              <option value="Grade C">{lang === "hi" ? "ग्रेड C (औद्योगिक/प्रोसेसिंग)" : "Grade C (Processing)"}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
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
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t("buyer.organicOnly", lang)}</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {translateCrop(cat, lang)}
            </button>
          ))}
          <div className="ml-auto text-xs text-slate-500 font-bold whitespace-nowrap hidden sm:block">
            {filteredListings.length} {lang === "hi" ? "लॉट उपलब्ध" : "active farm lots available"}
          </div>
        </div>
      </div>

      {/* Produce Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center space-y-3 shadow-sm">
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
            className="text-xs bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-600 shadow-sm"
          >
            {lang === "hi" ? "सभी फ़िल्टर रीसेट करें" : "Reset All Filters"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((listing) => {
            const retailEstimate = Math.round(listing.expectedPricePerQuintal * 1.35);
            const savingsPercent = Math.round(((retailEstimate - listing.expectedPricePerQuintal) / retailEstimate) * 100);
            const farmerUplift = Math.round(((listing.expectedPricePerQuintal - listing.mandiBenchmarkPrice) / listing.mandiBenchmarkPrice) * 100);

            return (
              <div
                key={listing.id}
                className="bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Top Image + Badges */}
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={listing.cropName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase shadow-xs ${
                        listing.qualityGrade === "Grade A"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}>
                        {translateGrade(listing.qualityGrade, lang)}
                      </span>
                      {listing.isOrganic && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-900/90 text-white backdrop-blur">
                          {lang === "hi" ? "100% जैविक" : "100% Organic"}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      {listing.quantityQuintals} {lang === "hi" ? "क्विंटल उपलब्ध" : "Quintals Available"}
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 space-y-3">
                    {/* Farmer Trust Badge */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="truncate max-w-[140px]">{listing.farmerName || (lang === "hi" ? "सत्यापित उत्पादक" : "Verified Producer")}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" aria-hidden="true" />
                        <span>{listing.farmerTrustScore || 4.9}</span>
                        <span className="text-slate-400 font-normal">{lang === "hi" ? "सत्यापित" : "Verified"}</span>
                      </div>
                    </div>

                    {/* Title & Variety */}
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">
                        {translateCrop(listing.cropName, lang)}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {listing.variety} • {lang === "hi" ? "कटाई:" : "Harvest:"} {listing.harvestDate}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{listing.district}, {listing.state} (PIN {listing.pincode})</span>
                    </div>

                    {/* Notes Snippet */}
                    {listing.notes && (
                      <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{listing.notes}"
                      </p>
                    )}

                    {/* Price Comparison Widget */}
                    <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs text-slate-500 font-medium">{lang === "hi" ? "सीधा खेत मूल्य:" : "Direct Farm Price:"}</span>
                          <div className="text-xl font-extrabold text-slate-900 font-display">
                            ₹{listing.expectedPricePerQuintal.toLocaleString()}
                            <span className="text-xs font-normal text-slate-500"> / {lang === "hi" ? "क्विंटल" : "Quintal"}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            {lang === "hi" ? `खुदरा से ~${savingsPercent}% बचत` : `Save ~${savingsPercent}% vs Retail`}
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

                {/* Footer Action Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onOpenOrderModal(listing)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{lang === "hi" ? "सीधा ऑर्डर करें (UPI एस्क्रो)" : "Order Direct • Secure Escrow"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

