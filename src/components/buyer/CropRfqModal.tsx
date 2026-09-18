import React, { useState } from "react";
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Building2, 
  Calculator, 
  FileText, 
  ArrowLeft,
  Calendar,
  Sparkles,
  Layers,
  ShoppingBag
} from "lucide-react";
import { CropListing, CropRfq, User } from "../../types";
import { API } from "../../api";
import { t, translateCrop, translateGrade } from "../../i18n";

interface CropRfqModalProps {
  listing: CropListing;
  buyer: User;
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "hi";
  onRfqSubmitted?: (rfq: CropRfq) => void;
}

type RfqStep = "FORM" | "REVIEW" | "SUCCESS";

export const CropRfqModal: React.FC<CropRfqModalProps> = ({
  listing,
  buyer,
  isOpen,
  onClose,
  lang,
  onRfqSubmitted
}) => {
  if (!isOpen) return null;

  const moq = listing.minOrderQuantityQuintals || 10;
  const maxStock = listing.quantityQuintals;

  const [step, setStep] = useState<RfqStep>("FORM");
  const [requiredQty, setRequiredQty] = useState<number>(Math.min(moq, maxStock));
  const [expectedPrice, setExpectedPrice] = useState<number>(listing.expectedPricePerQuintal);
  const [deliveryLocation, setDeliveryLocation] = useState<string>(
    buyer.district ? `${buyer.name}'s Fulfillment Depot, ${buyer.district}, ${buyer.state}` : "Central Agri Logistics Hub, Sector 18, Vashi APMC, Navi Mumbai"
  );
  const [deliveryPincode, setDeliveryPincode] = useState<string>("400703");
  const [deliveryTimeline, setDeliveryTimeline] = useState<"Immediate (Within 48h)" | "Within 7 Days" | "Flexible / Scheduled Supply">(
    "Immediate (Within 48h)"
  );
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRfq, setSubmittedRfq] = useState<CropRfq | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const estimatedTotal = requiredQty * expectedPrice;
  const mandiDifference = expectedPrice - listing.mandiBenchmarkPrice;
  const isQtyValid = requiredQty >= moq && requiredQty <= maxStock;

  const handleQtyPreset = (qty: number) => {
    setRequiredQty(Math.max(moq, Math.min(maxStock, qty)));
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiredQty < moq) {
      setErrorMsg(
        lang === "hi" 
          ? `न्यूनतम ऑर्डर मात्रा (MOQ) ${moq} क्विंटल है।` 
          : `Minimum order quantity (MOQ) is ${moq} Quintals.`
      );
      return;
    }
    if (requiredQty > maxStock) {
      setErrorMsg(
        lang === "hi" 
          ? `मात्रा उपलब्ध स्टॉक (${maxStock} क्विंटल) से अधिक नहीं हो सकती।` 
          : `Requested quantity cannot exceed available stock (${maxStock} Quintals).`
      );
      return;
    }
    if (expectedPrice <= 0) {
      setErrorMsg(lang === "hi" ? "कृपया एक मान्य लक्षित मूल्य दर्ज करें।" : "Please enter a valid target price.");
      return;
    }
    setErrorMsg("");
    setStep("REVIEW");
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload: Partial<CropRfq> = {
        listingId: listing.id,
        cropName: listing.cropName,
        variety: listing.variety,
        farmerId: listing.farmerId,
        farmerName: listing.farmerName || "Verified Farmer",
        fpoName: listing.fpoName,
        buyerId: buyer.id,
        buyerName: buyer.name,
        buyerCompany: buyer.fpoName || "Commercial Wholesale Buyer",
        buyerPhone: buyer.phone,
        requiredQuantityQuintals: Number(requiredQty),
        expectedPricePerQuintal: Number(expectedPrice),
        deliveryLocation,
        deliveryPincode,
        deliveryTimeline,
        message: message.trim() || undefined
      };

      const result = await API.submitRfq(payload);
      setSubmittedRfq(result);
      if (onRfqSubmitted) {
        onRfqSubmitted(result);
      }
      setStep("SUCCESS");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit RFQ. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("FORM");
    setErrorMsg("");
    onClose();
  };

  const primaryImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : (listing.imageUrl || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80");

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfq-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 id="rfq-modal-title" className="text-sm sm:text-base font-bold font-display">
                {step === "FORM" && (lang === "hi" ? "खरीद अनुरोध (RFQ) सबमिट करें" : "Request to Buy / Send RFQ")}
                {step === "REVIEW" && (lang === "hi" ? "शर्तों की समीक्षा करें" : "Review Procurement Terms")}
                {step === "SUCCESS" && (lang === "hi" ? "अनुरोध सफलतापूर्वक भेजा गया!" : "RFQ Sent Successfully!")}
              </h2>
              <p className="text-[11px] text-emerald-200/80">
                {step === "FORM" && (lang === "hi" ? "सीधा किसान प्रस्ताव • शून्य बिचौलिया शुल्क" : "Direct Farmer Negotiation • Zero Intermediary Brokerage")}
                {step === "REVIEW" && (lang === "hi" ? "कृपया किसान को भेजने से पहले विवरण जांचें" : "Verify proposal specifications before dispatch")}
                {step === "SUCCESS" && (lang === "hi" ? "किसान को सूचना भेज दी गई है" : "Dispatched directly to verified farmer FPO")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close RFQ Modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container with Scroll */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Crop & Farmer Mini Banner */}
          <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
            <img 
              src={primaryImage} 
              alt={listing.cropName} 
              className="w-16 h-16 rounded-xl object-cover border border-emerald-200 shrink-0" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                  {translateGrade(listing.qualityGrade, lang)}
                </span>
                {listing.isOrganic && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {lang === "hi" ? "जैविक" : "100% Organic"}
                  </span>
                )}
                <span className="text-xs text-slate-500 truncate ml-auto">
                  {listing.district}, {listing.state}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 truncate">
                {translateCrop(listing.cropName, lang)} <span className="font-normal text-slate-600 text-sm">({listing.variety})</span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">{listing.farmerName} • {listing.fpoName || "Sahyadri FPO"}</span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-slate-900">₹{listing.expectedPricePerQuintal.toLocaleString()}/qtl</span>
              </div>
            </div>
          </div>

          {/* STEP 1: FORM VIEW */}
          {step === "FORM" && (
            <form onSubmit={handleProceedToReview} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Required Quantity */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === "hi" ? "आवश्यक मात्रा (क्विंटल)" : "Required Quantity (Quintals)"}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    {lang === "hi" ? `न्यूनतम: ${moq} | उपलब्ध: ${maxStock}` : `MOQ: ${moq} | Stock: ${maxStock} Qtl`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={moq}
                    max={maxStock}
                    value={requiredQty}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRequiredQty(val);
                    }}
                    className={`flex-1 px-4 py-2.5 bg-slate-50 border rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                      !isQtyValid ? "border-rose-400 bg-rose-50/40" : "border-slate-200"
                    }`}
                    placeholder={`Enter quantity (min ${moq})`}
                    required
                  />
                  <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-xs text-slate-600 whitespace-nowrap">
                    {(requiredQty * 100).toLocaleString()} kg
                  </div>
                </div>

                {/* Quick presets */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none text-xs">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">{lang === "hi" ? "त्वरित चयन:" : "Quick:"}</span>
                  <button
                    type="button"
                    onClick={() => handleQtyPreset(moq)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold border border-slate-200 transition cursor-pointer"
                  >
                    MOQ ({moq} Qtl)
                  </button>
                  {maxStock >= 50 && (
                    <button
                      type="button"
                      onClick={() => handleQtyPreset(50)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold border border-slate-200 transition cursor-pointer"
                    >
                      50 Qtl
                    </button>
                  )}
                  {maxStock >= 100 && (
                    <button
                      type="button"
                      onClick={() => handleQtyPreset(100)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold border border-slate-200 transition cursor-pointer"
                    >
                      100 Qtl
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleQtyPreset(maxStock)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold border border-slate-200 transition cursor-pointer"
                  >
                    {lang === "hi" ? "पूरा लॉट" : "Full Lot"} ({maxStock} Qtl)
                  </button>
                </div>
              </div>

              {/* 2. Expected / Target Price per Quintal */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === "hi" ? "लक्षित खरीद मूल्य (₹ / क्विंटल)" : "Target / Expected Price (₹ / Quintal)"}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    {lang === "hi" ? `खेत भाव: ₹${listing.expectedPricePerQuintal}` : `Listed: ₹${listing.expectedPricePerQuintal}/qtl`}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-sm font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min={100}
                    step={10}
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter target price"
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>{lang === "hi" ? "मंडी बेंचमार्क:" : "Mandi Benchmark:"} ₹{listing.mandiBenchmarkPrice.toLocaleString()}/qtl</span>
                  <span className={mandiDifference >= 0 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                    {mandiDifference >= 0 ? `+₹${mandiDifference}/qtl vs Mandi` : `-₹${Math.abs(mandiDifference)}/qtl vs Mandi`}
                  </span>
                </div>
              </div>

              {/* 3. Delivery Location & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === "hi" ? "डिलीवरी स्थान / गंतव्य" : "Delivery Destination Address"}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder="Warehouse / Depot address"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {lang === "hi" ? "पिन कोड" : "PIN Code"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder="Pincode"
                    required
                  />
                </div>
              </div>

              {/* 4. Timeline Urgency */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === "hi" ? "आपूर्ति समय-सीमा / प्राथमिकता" : "Required Supply Timeline"}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(["Immediate (Within 48h)", "Within 7 Days", "Flexible / Scheduled Supply"] as const).map((timeline) => (
                    <button
                      key={timeline}
                      type="button"
                      onClick={() => setDeliveryTimeline(timeline)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                        deliveryTimeline === timeline
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>
                        {timeline === "Immediate (Within 48h)" && (lang === "hi" ? "तत्काल (48 घंटों में)" : "Immediate (48h)")}
                        {timeline === "Within 7 Days" && (lang === "hi" ? "7 दिनों के भीतर" : "Within 7 Days")}
                        {timeline === "Flexible / Scheduled Supply" && (lang === "hi" ? "निर्धारित / लचीला" : "Scheduled Supply")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Optional Message to Farmer */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {lang === "hi" ? "किसान को संदेश / पैकेजिंग व गुणवत्ता निर्देश (वैकल्पिक)" : "Optional Message / Quality & Packaging Instructions"}
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={lang === "hi" 
                    ? "उदा. 50 किग्रा जूट बोरी में पैकिंग आवश्यक, लोडिंग बे #2 पर डिलीवरी, लैब टेस्ट रिपोर्ट साथ भेजें..." 
                    : "e.g. 50 kg clean jute bags preferred, moisture certificate required at dispatch, pallets loading bay..."}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Live Calculation Card */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                    {lang === "hi" ? "अनुमानित कुल उपज मूल्य" : "Estimated Total Produce Value"}
                  </div>
                  <div className="text-xs text-emerald-700">
                    {requiredQty} Qtl × ₹{expectedPrice.toLocaleString()}/Qtl
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 font-display">
                    ₹{estimatedTotal.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {lang === "hi" ? "शून्य तत्काल कटौती" : "No upfront debit on RFQ"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  {lang === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={!isQtyValid || expectedPrice <= 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>{lang === "hi" ? "शर्तों की समीक्षा करें" : "Review Request"}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW BEFORE SUBMIT */}
          {step === "REVIEW" && (
            <div className="space-y-5">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold">
                    {lang === "hi" ? "कृपया खरीद अनुरोध विवरण की पुष्टि करें" : "Please review your RFQ terms before submission"}
                  </strong>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {lang === "hi" 
                      ? "यह अनुरोध सीधे किसान/एफपीओ को भेजा जाएगा। किसान द्वारा स्वीकृति दिए जाने के बाद, भुगतान किसानSetu सुरक्षित एस्क्रो में सुरक्षित किया जाएगा।" 
                      : "This sends a direct formal inquiry to the producer. No payment is charged today. The farmer can accept your terms or offer a tailored counter-rate within 24 hours."}
                  </p>
                </div>
              </div>

              {/* Summary Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="px-4 py-3 flex justify-between items-center bg-slate-50 font-bold text-slate-800">
                  <span>{lang === "hi" ? "प्रस्तावित खरीद पैरामीटर" : "Proposed Procurement Parameter"}</span>
                  <span>{lang === "hi" ? "विवरण" : "Details"}</span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-slate-500">{lang === "hi" ? "फसल व किस्म:" : "Crop & Variety:"}</span>
                  <span className="font-bold text-slate-900">{listing.cropName} ({listing.variety}) - {listing.qualityGrade}</span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-slate-500">{lang === "hi" ? "उत्पादक / एफपीओ:" : "Farmer / FPO Producer:"}</span>
                  <span className="font-bold text-slate-900">{listing.farmerName} • {listing.fpoName || "Sahyadri FPO"}</span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-slate-500">{lang === "hi" ? "मांगी गई मात्रा:" : "Requested Quantity:"}</span>
                  <span className="font-bold text-slate-900">{requiredQty} Quintals ({(requiredQty * 100).toLocaleString()} kg)</span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-slate-500">{lang === "hi" ? "प्रस्तावित दर:" : "Offered Target Rate:"}</span>
                  <span className="font-bold text-emerald-700">₹{expectedPrice.toLocaleString()} / Quintal</span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center bg-emerald-50/60 font-bold">
                  <span className="text-emerald-950">{lang === "hi" ? "कुल अनुमानित मूल्य:" : "Total Estimated Value:"}</span>
                  <span className="text-emerald-900 text-base font-extrabold font-display">₹{estimatedTotal.toLocaleString()}</span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-slate-500">{lang === "hi" ? "डिलीवरी गंतव्य:" : "Delivery Destination:"}</span>
                  <span className="font-medium text-slate-900 max-w-[280px] text-right truncate">{deliveryLocation} (PIN {deliveryPincode})</span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-slate-500">{lang === "hi" ? "समय-सीमा:" : "Supply Timeline:"}</span>
                  <span className="font-bold text-slate-900">{deliveryTimeline}</span>
                </div>
                {message && (
                  <div className="px-4 py-3 flex flex-col gap-1">
                    <span className="text-slate-500">{lang === "hi" ? "विशेष निर्देश:" : "Special Buyer Notes:"}</span>
                    <p className="text-slate-800 bg-slate-50 p-2 rounded-lg font-medium">{message}</p>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Review Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("FORM")}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "शर्तें संपादित करें" : "Edit Details"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{lang === "hi" ? "सबमिट किया जा रहा है..." : "Submitting..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === "hi" ? "पुष्टि करें और किसान को RFQ भेजें" : "Confirm & Send RFQ"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS VIEW */}
          {step === "SUCCESS" && (
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 font-display">
                  {lang === "hi" ? "अनुरोध सफलतापूर्वक किसान को भेजा गया!" : "RFQ Successfully Sent to Farmer!"}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {lang === "hi" 
                    ? `आपका खरीद प्रस्ताव ${listing.farmerName} (${listing.fpoName || "Sahyadri FPO"}) को प्रेषित कर दिया गया है।` 
                    : `Your procurement proposal for ${requiredQty} Quintals of ${listing.cropName} is now delivered to ${listing.farmerName}.`}
                </p>
              </div>

              {/* Reference Details Pill Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>{lang === "hi" ? "संदर्भ संख्या:" : "Reference ID:"}</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {submittedRfq?.id || "RFQ-2026-8912"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>{lang === "hi" ? "स्थिति:" : "Status:"}</span>
                  <span className="font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full text-[11px]">
                    {lang === "hi" ? "किसान समीक्षा में" : "Pending Farmer Response"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>{lang === "hi" ? "प्रस्तावित कुल मूल्य:" : "Total Proposed:"}</span>
                  <span className="text-emerald-700 text-sm font-display">₹{estimatedTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Next Steps Notification */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 max-w-md mx-auto text-left text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{lang === "hi" ? "आगे क्या होगा?" : "What happens next?"}</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {lang === "hi" 
                    ? "किसान को SMS और पोर्टल अलर्ट मिल गया है। किसान द्वारा इसे स्वीकार करने पर आप सीधे किसानSetu एस्क्रो में फंड लॉक कर सकते हैं।" 
                    : "The producer has been notified. When they accept your RFQ or counter-offer, you can fund the secure escrow vault and track cold-chain logistics."}
                </p>
              </div>

              {/* Success Actions */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  {lang === "hi" ? "मार्केटप्लेस पर और फसलें देखें" : "Browse More Crops in Marketplace"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
