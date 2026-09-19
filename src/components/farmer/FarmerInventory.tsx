import React, { useState } from "react";
import { 
  Package, 
  Leaf, 
  Calendar, 
  TrendingUp, 
  Check, 
  Truck, 
  CheckCircle, 
  Lock, 
  ShieldCheck,
  Search,
  Filter,
  Edit3,
  Trash2,
  Camera,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CropListing, Order, User } from "../../types";
import { t, translateCrop, translateStatus, translateGrade } from "../../i18n";

const DEFAULT_INVENTORY_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80";

// ─── Per-card gallery component ─────────────────────────────────────────────
interface InventoryCardImageProps {
  listing: CropListing;
  lang: "en" | "hi";
}

const InventoryCardImage: React.FC<InventoryCardImageProps> = ({ listing, lang }) => {
  const images: string[] =
    listing.images && listing.images.length > 0
      ? listing.images
      : listing.imageUrl
      ? [listing.imageUrl]
      : [DEFAULT_INVENTORY_IMAGE];

  const [activeIndex, setActiveIndex] = useState(0);
  const currentImage = images[activeIndex] || images[0] || DEFAULT_INVENTORY_IMAGE;

  return (
    <div className="relative h-36 bg-slate-100 overflow-hidden group/inv">
      <img
        src={currentImage}
        alt={listing.cropName}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-300 group-hover/inv:scale-105"
      />

      {/* Arrow navigation – only when multiple images exist */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + images.length) % images.length); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover/inv:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-sm z-10"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % images.length); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover/inv:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-sm z-10"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          {/* Counter */}
          <div className="absolute bottom-9 right-2 bg-black/55 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
            {activeIndex + 1}/{images.length}
          </div>
        </>
      )}

      {/* Grade & Organic badges */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-xs ${
          listing.qualityGrade === "Grade A" 
            ? "bg-emerald-600 text-white" 
            : "bg-amber-500 text-white"
        }`}>
          {translateGrade(listing.qualityGrade, lang)}
        </span>
        {listing.isOrganic && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
            <Leaf className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>{t("common.organic", lang)}</span>
          </span>
        )}
      </div>

      {/* Quantity & photo count */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        {images.length > 1 && (
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Camera className="w-3 h-3 text-emerald-400" />
            <span>{images.length}</span>
          </span>
        )}
        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          {listing.quantityQuintals} {t("common.quintals", lang)}
        </span>
      </div>
    </div>
  );
};

interface FarmerInventoryProps {
  farmer: User;
  listings: CropListing[];
  orders: Order[];
  lang: "en" | "hi";
  onOrderStatusUpdate: (orderId: number, status: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal?: (listing: CropListing) => void;
  onListingDeleted?: (listingId: number) => void;
  externalSearch?: string;
}

export const FarmerInventory: React.FC<FarmerInventoryProps> = ({
  farmer,
  listings,
  orders,
  lang,
  onOrderStatusUpdate,
  onOpenCreateModal,
  onOpenEditModal,
  onListingDeleted,
  externalSearch = ""
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const farmerListings = listings.filter(l => l.farmerId === farmer.id);
  const incomingOrders = orders.filter(o => o.farmerId === farmer.id);

  const effectiveSearch = (searchTerm || externalSearch).trim().toLowerCase();

  const filteredListings = farmerListings.filter(l => {
    if (filterStatus !== "ALL" && l.status !== filterStatus) return false;
    if (effectiveSearch) {
      return l.cropName.toLowerCase().includes(effectiveSearch) || l.variety.toLowerCase().includes(effectiveSearch);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Main Grid: Active Listings & Incoming Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Active Listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>{lang === "hi" ? "सक्रिय फसल लिस्टिंग" : "Registered Harvest Lots"}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                {farmerListings.length}
              </span>
            </h3>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === "hi" ? "फसल या किस्म खोजें..." : "Search crop or variety..."}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium w-36 sm:w-44"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">{t("common.all", lang)}</option>
                <option value="ACTIVE">{t("status.active", lang)}</option>
                <option value="IN_NEGOTIATION">{t("status.inNegotiation", lang)}</option>
                <option value="SOLD">{t("status.sold", lang)}</option>
              </select>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-emerald-100 p-8 text-center space-y-3 shadow-sm">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">
                {lang === "hi" ? "कोई फसल लिस्टिंग नहीं मिली" : "No listings matching your filter"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                {lang === "hi"
                  ? "सत्यापित संस्थागत खरीदारों से सीधे जुड़ने के लिए अपनी ताज़ा फसल को अभी लिस्ट करें।"
                  : "List your freshly harvested or standing crop to connect directly with verified institutional buyers."}
              </p>
              <button
                onClick={onOpenCreateModal}
                className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-700 shadow-xs transition-all"
              >
                {lang === "hi" ? "नई फसल लिस्ट करें" : "Create New Listing"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredListings.map((listing) => (
                <div 
                  key={listing.id}
                  className="bg-white rounded-3xl border border-emerald-100 shadow-sm hover:border-emerald-300 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <InventoryCardImage listing={listing} lang={lang} />

                    <div className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base font-display">
                            {translateCrop(listing.cropName, lang)}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {listing.variety}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {translateStatus(listing.status, lang)}
                        </span>
                      </div>

                      <div className="bg-[#F0FDF4] rounded-2xl p-3 space-y-1 border border-emerald-100 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">{lang === "hi" ? "आपकी मांग कीमत:" : "Your Ask Price:"}</span>
                          <span className="font-bold text-slate-900 text-sm font-display">₹{listing.expectedPricePerQuintal.toLocaleString()}/{lang === "hi" ? "क्विंटल" : "qtl"}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">{lang === "hi" ? "मंडी मानक:" : "Local Mandi Modal:"}</span>
                          <span className="text-slate-500 font-medium line-through">₹{listing.mandiBenchmarkPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-emerald-700 font-bold">
                          <span>{lang === "hi" ? "AI उचित दायरा:" : "AI Fair Range:"}</span>
                          <span>₹{listing.aiRecommendedMin.toLocaleString()} - ₹{listing.aiRecommendedMax.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 space-y-2">
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{lang === "hi" ? "कटाई:" : "Harvest:"} {listing.harvestDate}</span>
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        +{Math.round(((listing.expectedPricePerQuintal - listing.mandiBenchmarkPrice) / listing.mandiBenchmarkPrice) * 100)}% {lang === "hi" ? "मंडी से अधिक" : "vs Mandi"}
                      </span>
                    </div>

                    {/* Edit & Delete Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {onOpenEditModal && (
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(listing)}
                          className="flex-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold py-2 rounded-xl border border-slate-200 hover:border-emerald-300 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lang === "hi" ? "संपादित करें" : "Edit Lot"}</span>
                        </button>
                      )}

                      {onListingDeleted && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(lang === "hi" ? "क्या आप निश्चित रूप से इस फसल लिस्टिंग को हटाना चाहते हैं?" : "Are you sure you want to delete this crop listing?")) {
                              try {
                                await import("../../api").then(m => m.API.deleteListing(listing.id));
                                onListingDeleted(listing.id);
                              } catch (err: any) {
                                alert("Failed to delete listing: " + err.message);
                              }
                            }
                          }}
                          className="bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 p-2 rounded-xl border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                          title={lang === "hi" ? "हटायें" : "Delete lot"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Incoming Buyer Orders */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>{lang === "hi" ? "आने वाले खरीदार ऑर्डर" : "Direct Buyer Orders"}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
              {incomingOrders.length}
            </span>
          </h3>

          <div className="space-y-3">
            {incomingOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-emerald-100 p-6 text-center text-xs text-slate-500 shadow-sm font-medium">
                {lang === "hi"
                  ? "अभी कोई ऑर्डर नहीं है। सत्यापित खरीदार मार्केटप्लेस देखकर सीधे ऑर्डर करते हैं।"
                  : "No orders yet. Verified buyers browse the marketplace and place direct farm-gate orders."}
              </div>
            ) : (
              incomingOrders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white rounded-3xl border border-emerald-100 p-5 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {order.orderNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1 font-display">
                        {translateCrop(order.cropName, lang)}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {lang === "hi" ? "खरीदार:" : "Buyer:"} {order.buyerName || (lang === "hi" ? "संस्थागत खरीदार" : "Institutional Buyer")}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      order.status === "DELIVERED" || order.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "IN_TRANSIT"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {translateStatus(order.status, lang)}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 border border-slate-100">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">{lang === "hi" ? "मात्रा:" : "Order Quantity:"}</span>
                      <span className="font-bold text-slate-900">{order.quantityOrdered} {t("common.quintals", lang)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">{lang === "hi" ? "कुल राशि:" : "Produce Total:"}</span>
                      <span className="font-bold text-emerald-700 font-display">₹{order.totalProduceAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-slate-500">{lang === "hi" ? "एस्क्रो सुरक्षा:" : "Escrow Security:"}</span>
                      <span className="font-semibold text-slate-800">
                        {order.paymentStatus === "ESCROW_HELD" ? (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <Lock className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />
                            <span>{lang === "hi" ? "एस्क्रो में सुरक्षित" : "Held in Escrow"}</span>
                          </span>
                        ) : (
                          translateStatus(order.paymentStatus, lang)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions based on state */}
                  {order.status === "PLACED" && (
                    <button
                      onClick={() => onOrderStatusUpdate(order.id, "CONFIRMED")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === "hi" ? "ऑर्डर स्वीकार करें" : "Accept & Confirm Order"}</span>
                    </button>
                  )}

                  {order.status === "CONFIRMED" && (
                    <button
                      onClick={() => onOrderStatusUpdate(order.id, "IN_TRANSIT")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>{lang === "hi" ? "वाहन को सौंपें (In-Transit)" : "Handover to Logistics"}</span>
                    </button>
                  )}

                  {order.status === "IN_TRANSIT" && (
                    <div className="text-[11px] text-blue-800 bg-blue-50 p-2.5 rounded-xl font-medium text-center border border-blue-100 flex items-center justify-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                      <span>
                        {lang === "hi"
                          ? "KisanExpress द्वारा परिवहन में। खरीदार OTP सत्यापन के बाद तुरंत भुगतान जारी होगा।"
                          : "In-Transit with KisanExpress. Payout auto-releases upon buyer OTP check."}
                      </span>
                    </div>
                  )}

                  {order.status === "DELIVERED" && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl font-semibold text-center flex items-center justify-center gap-1 border border-emerald-100">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {lang === "hi"
                          ? `डिलीवर हो गया! ₹${order.totalProduceAmount.toLocaleString()} आपके खाते में जमा कर दिए गए हैं।`
                          : `Delivered! ₹${order.totalProduceAmount.toLocaleString()} released to your account.`}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

