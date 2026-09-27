import React, { useState } from "react";
import { 
  FileText, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  KeyRound, 
  QrCode, 
  Download, 
  ExternalLink, 
  AlertCircle,
  Building,
  UserCheck,
  ChevronRight
} from "lucide-react";
import { BuyerContract, Order, User } from "../../types";
import { MOCK_BUYER_CONTRACTS } from "../../data/mockAgriData";
import { t, translateCrop, translateOrderStatus, translatePaymentStatus } from "../../i18n";

interface BuyerContractsTrackingProps {
  buyer: User;
  orders: Order[];
  lang: "en" | "hi";
  onOrderStatusUpdate: (orderId: number, status: string, otp?: string) => Promise<void>;
}

export const BuyerContractsTracking: React.FC<BuyerContractsTrackingProps> = ({
  buyer,
  orders,
  lang,
  onOrderStatusUpdate
}) => {
  const [contracts] = useState<BuyerContract[]>(MOCK_BUYER_CONTRACTS);
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "contracts">("orders");
  
  // OTP Verification modal state
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Filter orders for this buyer
  const buyerOrders = orders.filter(o => o.buyerId === buyer.id || !o.buyerId);

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingOrder) return;
    setOtpError("");
    setVerifying(true);

    try {
      if (enteredOtp !== verifyingOrder.deliveryOtp) {
        setOtpError(
          lang === "hi"
            ? `गलत OTP! अपने ऑर्डर कार्ड पर प्रदर्शित डिलीवरी OTP (${verifyingOrder.deliveryOtp}) दर्ज करें।`
            : `Incorrect OTP! Check the delivery OTP displayed on your order card (${verifyingOrder.deliveryOtp}).`
        );
        setVerifying(false);
        return;
      }

      await onOrderStatusUpdate(verifyingOrder.id, "DELIVERED", enteredOtp);
      setVerifySuccess(true);
      setTimeout(() => {
        setVerifyingOrder(null);
        setVerifySuccess(false);
        setEnteredOtp("");
      }, 2000);
    } catch (err: any) {
      setOtpError(err.message || (lang === "hi" ? "डिलीवरी OTP सत्यापित करने में विफल" : "Failed to verify delivery OTP"));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {lang === "hi" ? "अनुबंध व डिलीवरी ट्रैकिंग" : "Bilateral Contracts & Fleet Dispatch"}
            </span>
            <span className="text-xs text-slate-500 font-medium">• {lang === "hi" ? "OTP एस्क्रो भुगतान रिलीज" : "OTP Escrow Release"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {t("buyerContracts.title", lang)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            {t("buyerContracts.subtitle", lang)}
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "orders"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? `सक्रिय ऑर्डर (${buyerOrders.length})` : `Active Orders (${buyerOrders.length})`}</span>
          </button>
          <button
            onClick={() => setActiveSubTab("contracts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "contracts"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? `डिजिटल अनुबंध (${contracts.length})` : `Supply Contracts (${contracts.length})`}</span>
          </button>
        </div>
      </div>

      {/* View 1: Active Orders & Dispatch Tracking */}
      {activeSubTab === "orders" && (
        <div className="space-y-4">
          {buyerOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-emerald-100 space-y-3">
              <Truck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">
                {lang === "hi" ? "कोई सक्रिय ऑर्डर नहीं मिला" : "No Active Orders Found"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                {lang === "hi" 
                  ? "बिना किसी बिचौलिए के सीधे खेत से ताज़ा उपज खरीदने के लिए हमारे मार्केटप्लेस को देखें।" 
                  : "Browse our fresh produce marketplace to place your first direct farm-gate order with zero intermediary brokerage."}
              </p>
            </div>
          ) : (
            buyerOrders.map((order) => {
              const isDelivered = order.status === "DELIVERED" || order.status === "COMPLETED";
              const isInTransit = order.status === "IN_TRANSIT";
              const isConfirmed = order.status === "CONFIRMED" || order.status === "BATCH_ASSIGNED";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-5"
                >
                  {/* Top Bar of Order */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {lang === "hi" ? "ऑर्डर दिनांक:" : "Placed on"} {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base mt-1 font-display">
                        {translateCrop(order.cropName, lang)} • {order.quantityOrdered} {lang === "hi" ? "क्विंटल" : "Quintals"} ({(order.quantityOrdered * 100).toLocaleString()} kg)
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-extrabold text-base text-slate-900 font-display">
                          ₹{(order.totalAmount ?? 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          ₹{order.pricePerQuintal}/{lang === "hi" ? "क्विंटल" : "qtl"} {lang === "hi" ? "+ रसद" : "+ logistics"}
                        </span>
                      </div>

                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : isInTransit
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {translateOrderStatus(order.status, lang)}
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Stepper */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="space-y-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center mx-auto">
                        ✓
                      </div>
                      <span className="font-bold text-slate-800 text-[11px] block">
                        {lang === "hi" ? "ऑर्डर दिया" : "Order Placed"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {lang === "hi" ? "एस्क्रो जमा" : "KisanEscrow Funded"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center mx-auto ${
                        isConfirmed || isInTransit || isDelivered
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {isConfirmed || isInTransit || isDelivered ? "✓" : "2"}
                      </div>
                      <span className="font-bold text-slate-800 text-[11px] block">
                        {lang === "hi" ? "किसान स्वीकृत" : "Farmer Confirmed"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {lang === "hi" ? "गुणवत्ता जांच पूर्ण" : "Quality Inspected"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center mx-auto ${
                        isInTransit || isDelivered
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {isInTransit || isDelivered ? "✓" : "3"}
                      </div>
                      <span className="font-bold text-slate-800 text-[11px] block">
                        {lang === "hi" ? "पारगमन में" : "In Transit"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {lang === "hi" ? "मार्ग में" : "Optimized Route"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center mx-auto ${
                        isDelivered
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {isDelivered ? "✓" : "4"}
                      </div>
                      <span className="font-bold text-slate-800 text-[11px] block">
                        {lang === "hi" ? "डिलीवर व भुगतान" : "Delivered & Settled"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {lang === "hi" ? "OTP सत्यापित" : "OTP Verified"}
                      </span>
                    </div>
                  </div>

                  {/* Order Details & OTP Box */}
                  <div className="bg-[#F0FDF4] p-4 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs text-slate-700">
                      <div className="font-bold flex items-center gap-1.5 text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === "hi" ? "डिलीवरी गंतव्य:" : "Delivery Destination:"} {order.deliveryAddress} ({order.deliveryPincode})</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        {lang === "hi" ? "विक्रेता:" : "Seller:"} <strong>{order.farmerName || (lang === "hi" ? "सह्याद्री FPO उत्पादक" : "Sahyadri FPO Producer")}</strong> • {lang === "hi" ? "एस्क्रो स्थिति:" : "Payout Escrow:"} <strong>{translatePaymentStatus(order.paymentStatus, lang)}</strong>
                      </p>
                    </div>

                    {/* Delivery OTP Display or Verify Action */}
                    <div className="flex items-center gap-3">
                      {!isDelivered && (
                        <div className="bg-white px-3 py-2 rounded-xl border border-emerald-200 text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            {t("buyerContracts.deliveryOtp", lang)}
                          </span>
                          <span className="font-mono font-extrabold text-emerald-800 text-base tracking-widest">
                            {order.deliveryOtp}
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            {lang === "hi" ? "माल जांचने के बाद ही साझा करें" : "Share only after inspecting"}
                          </span>
                        </div>
                      )}

                      {isInTransit && (
                        <button
                          onClick={() => {
                            setVerifyingOrder(order);
                            setEnteredOtp(order.deliveryOtp);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t("buyerContracts.verifyOtpBtn", lang)}</span>
                        </button>
                      )}

                      {isDelivered && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>{lang === "hi" ? "डिलीवर व एस्क्रो जारी" : "Delivered & Escrow Released"}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View 2: Formal Bilateral Contracts */}
      {activeSubTab === "contracts" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {contracts.map((c) => (
            <div
              key={c.contractId}
              className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                      {c.contractNumber}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1 font-display">
                      {translateCrop(c.cropName, lang)} ({c.variety})
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    c.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {c.status === "COMPLETED" ? (lang === "hi" ? "सफल" : "COMPLETED") : (lang === "hi" ? "सक्रिय" : c.status)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === "hi" ? "उत्पादक / FPO:" : "Producer / FPO:"}</span>
                    <strong className="text-slate-900">{c.fpoName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === "hi" ? "अनुबंधित मात्रा:" : "Contracted Volume:"}</span>
                    <strong className="text-slate-900">{c.volumeQuintals} {lang === "hi" ? "क्विंटल" : "Qtl"} ({(c.volumeQuintals * 100).toLocaleString()} kg)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === "hi" ? "सहमति दर:" : "Agreed Rate:"}</span>
                    <strong className="text-emerald-700">₹{c.pricePerQuintal}/{lang === "hi" ? "क्विंटल" : "Qtl"}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                    <span className="text-slate-700">{lang === "hi" ? "कुल अनुबंध मूल्य:" : "Total Value:"}</span>
                    <span className="text-slate-900 font-display">₹{c.contractValue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>{lang === "hi" ? "अंतिम डिलीवरी तिथि:" : "Valid Due:"} <strong>{c.deliveryDueDate}</strong></div>
                  <div className="flex items-center gap-1 font-semibold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === "hi" ? "एस्क्रो स्थिति:" : "Escrow:"} {translatePaymentStatus(c.escrowStatus, lang)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert(lang === "hi" ? `डिजिटल कृषि अनुबंध ${c.contractNumber} मॉडल APMC अनुबंध खेती ढांचे के तहत कानूनी रूप से बाध्यकारी है।` : `Digital Agrarian Contract ${c.contractNumber} is legally binding under Model APMC Contract Farming framework.`)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "कानूनी अनुबंध PDF देखें" : "View Legal Contract PDF"}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* OTP Delivery Verification Modal */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-emerald-100 overflow-hidden">
            <div className="px-6 py-4 bg-[#F0FDF4] border-b border-emerald-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  {t("buyerContracts.modalTitle", lang)}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {translateCrop(verifyingOrder.cropName, lang)} • {verifyingOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setVerifyingOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {verifySuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm font-display">
                  {lang === "hi" ? "डिलीवरी सत्यापित व एस्क्रो भुगतान जारी!" : "Delivery Verified & Escrow Released!"}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {lang === "hi"
                    ? `₹${(verifyingOrder.totalProduceAmount ?? 0).toLocaleString()} का भुगतान किसान के सत्यापित बैंक खाते में IMPS द्वारा स्थानांतरित कर दिया गया है।`
                    : `Payment of ₹${(verifyingOrder.totalProduceAmount ?? 0).toLocaleString()} has been transferred via IMPS to the farmer's verified bank account.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="p-6 space-y-4 text-xs">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-[11px] text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === "hi" ? "निरीक्षण चेकलिस्ट:" : "Inspection Checklist:"}</span>
                  </div>
                  <p>{lang === "hi" ? "1. जांचें कि उपज ग्रेड व गुणवत्ता समझौते के अनुसार है।" : "1. Check produce grade & quality matches agreement."}</p>
                  <p>{lang === "hi" ? "2. तोले गए सकल वजन (टन भार) का मिलान करें।" : "2. Verify weighed gross tonnage."}</p>
                  <p>{lang === "hi" ? "3. भुगतान जारी करने के लिए नीचे गुप्त OTP दर्ज करें।" : "3. Enter your secret OTP below to release payment."}</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t("buyerContracts.enterOtpPrompt", lang)}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    required
                    placeholder="e.g. 5812"
                    className="w-full text-center font-mono text-xl tracking-widest bg-slate-50 border border-slate-200 rounded-xl py-2.5 font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 block text-center mt-1">
                    {lang === "hi" ? "आपका निर्धारित OTP है" : "Your assigned OTP is"} <strong>{verifyingOrder.deliveryOtp}</strong>
                  </span>
                </div>

                {otpError && (
                  <p className="text-red-600 text-xs font-bold">{otpError}</p>
                )}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  {verifying 
                    ? (lang === "hi" ? "एस्क्रो राशि जारी हो रही है..." : "Releasing Escrow...") 
                    : (lang === "hi" ? `रसीद पुष्टि करें और ₹${(verifyingOrder.totalAmount ?? 0).toLocaleString()} जारी करें` : `Confirm Receipt & Release ₹${(verifyingOrder.totalAmount ?? 0).toLocaleString()}`)}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

