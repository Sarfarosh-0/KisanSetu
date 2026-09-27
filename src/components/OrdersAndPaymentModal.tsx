import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Truck, 
  PackageCheck, 
  ShieldCheck, 
  QrCode, 
  ArrowRight,
  Smartphone,
  Star,
  Lock,
  Receipt,
  Copy,
  AlertCircle,
  Check,
  Package,
  MapPin
} from "lucide-react";
import { CropListing, Order, User } from "../types";
import { API } from "../api";
import { t, translateCrop, translateOrderStatus, translatePaymentStatus, translateGrade } from "../i18n";

interface OrdersAndPaymentModalProps {
  orders: Order[];
  currentUser: User;
  onOrderStatusUpdate: (orderId: number, status: string, otp?: string) => void;
  activeListingToOrder: CropListing | null;
  onCloseOrderModal: () => void;
  onOrderPlaced: (order: Order) => void;
  lang: "en" | "hi";
}

export const OrdersAndPaymentModal: React.FC<OrdersAndPaymentModalProps> = ({
  orders,
  currentUser,
  onOrderStatusUpdate,
  activeListingToOrder,
  onCloseOrderModal,
  onOrderPlaced,
  lang
}) => {
  // Order Placement Form State
  const [orderQty, setOrderQty] = useState<number>(20);
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Plot 48, Agro Logistics Park, Turbhe MIDC, Navi Mumbai, Maharashtra"
  );
  const [deliveryPincode, setDeliveryPincode] = useState("400705");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Active UPI Escrow Payment Modal
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("GPay");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");

  // OTP Verification Modal
  const [otpOrder, setOtpOrder] = useState<Order | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Rating Modal
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [starCount, setStarCount] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("Outstanding produce quality! Exactly as graded.");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Handle Order Submit
  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListingToOrder) return;
    try {
      setSubmittingOrder(true);
      const newOrder = await API.placeOrder({
        listingId: activeListingToOrder.id,
        buyerId: currentUser.id,
        quantityOrdered: Number(orderQty),
        deliveryAddress,
        deliveryPincode
      });
      onOrderPlaced(newOrder);
      // Immediately open UPI Escrow payment flow
      setPaymentOrder(newOrder);
      onCloseOrderModal();
    } catch (err: any) {
      alert(lang === "hi" ? "ऑर्डर दर्ज करने में विफल: " + err.message : "Failed to place order: " + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Handle UPI Escrow Verification
  const handleConfirmUpiPayment = async () => {
    if (!paymentOrder) return;
    try {
      setProcessingPayment(true);
      const utr = "UPI-UTR-" + Math.floor(10000000 + Math.random() * 90000000);
      const res = await API.verifyUpiPayment({
        orderId: paymentOrder.id,
        upiId: `${currentUser.name.toLowerCase().replace(/\s+/g, "")}@okaxis`,
        amount: paymentOrder.totalAmount,
        utrNumber: utr
      });
      setPaymentSuccessMsg(res.escrowMessage);
      onOrderStatusUpdate(paymentOrder.id, "CONFIRMED");
      setTimeout(() => {
        setPaymentOrder(null);
        setPaymentSuccessMsg("");
      }, 2400);
    } catch (err: any) {
      alert(lang === "hi" ? "भुगतान विफल: " + err.message : "Payment failed: " + err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle OTP Delivery Verification
  const handleVerifyOtp = async () => {
    if (!otpOrder) return;
    try {
      setVerifyingOtp(true);
      setOtpError("");
      await onOrderStatusUpdate(otpOrder.id, "DELIVERED", enteredOtp);
      setOtpOrder(null);
      setEnteredOtp("");
      // Open review modal
      setRatingOrder(otpOrder);
    } catch (err: any) {
      setOtpError(lang === "hi" ? "अमान्य OTP। कृपया खरीदार रसीद पर दिया गया 4-अंकीय कोड जांचें।" : "Invalid OTP. Please check the 4-digit code provided on buyer order receipt.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setRatingOrder(null);
      setReviewSubmitted(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {lang === "hi" ? "एस्क्रो-सुरक्षित व्यापार" : "Escrow-Secured Trade"}
            </span>
            <span className="text-xs text-slate-500 font-medium">• {lang === "hi" ? "0% बिचौलिया कटौती" : "0% Middleman Deduction"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {lang === "hi" ? "ऑर्डर जीवनचक्र व एस्क्रो सत्यापन" : "Order Lifecycle & Escrow Verification"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            {lang === "hi"
              ? "बैंक-ग्रेड UPI एस्क्रो और OTP रिलीज के साथ फसल कटाई रवानगी से लेकर द्वार डिलीवरी तक ट्रैकिंग।"
              : "Track transactions from farm harvest dispatch to door delivery with bank-grade UPI escrow and OTP release."}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#F0FDF4] p-3.5 rounded-2xl border border-emerald-200 text-xs">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">{lang === "hi" ? "किसान-एस्क्रो द्वारा सुरक्षित:" : "Protected by KisanEscrow:"}</span>
            <p className="text-[11px] text-slate-600 font-medium">
              {lang === "hi" 
                ? "धनराशि एस्क्रो में सुरक्षित रहती है जब तक कि खरीदार उत्पाद की जांच करके OTP सत्यापित न कर ले।"
                : "Funds are held safely in escrow until the buyer inspects produce and verifies OTP."}
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-display">
            {lang === "hi" ? `सक्रिय व पूर्व ऑर्डर (${orders.length})` : `Active & Historic Orders (${orders.length})`}
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{lang === "hi" ? "स्वतः समन्वयित" : "Auto-synced"}</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center space-y-3 shadow-sm">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">{lang === "hi" ? "अभी तक कोई ऑर्डर नहीं दिया गया" : "No orders placed yet"}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {lang === "hi" ? "अपनी पहली सीधी खेत खरीद के लिए खरीदार मंडी टैब पर जाएं।" : "Visit the Buyer Market tab to place your first direct farm purchase."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isDelivered = order.status === "DELIVERED" || order.status === "COMPLETED";
              const isPaid = order.paymentStatus === "ESCROW_HELD" || order.paymentStatus === "RELEASED_TO_FARMER";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-4 hover:border-emerald-200 transition-colors"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-base shadow-xs">
                        <Package className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 px-2.5 py-0.5 rounded-lg text-slate-800">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(order.createdAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-base mt-0.5 font-display">
                          {translateCrop(order.cropName, lang)}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Payment Status Pill */}
                      <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        order.paymentStatus === "RELEASED_TO_FARMER"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.paymentStatus === "ESCROW_HELD"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        <Lock className="w-3 h-3" />
                        <span>
                          {translatePaymentStatus(order.paymentStatus, lang)}
                        </span>
                      </span>

                      {/* Order Status Pill */}
                      <span className={`text-xs font-extrabold px-3.5 py-1 rounded-full ${
                        isDelivered
                          ? "bg-emerald-600 text-white"
                          : order.status === "IN_TRANSIT"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-white"
                      }`}>
                        {translateOrderStatus(order.status, lang)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Lifecycle Stepper */}
                  <div className="py-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 relative">
                      <div className="absolute top-3.5 left-6 right-6 h-1 bg-slate-200 rounded-full -z-0" />
                      
                      {/* Step 1: Placed */}
                      <div className="flex flex-col items-center gap-1.5 relative z-10">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                        <span>{lang === "hi" ? "दर्ज हुआ" : "Placed"}</span>
                      </div>

                      {/* Step 2: Confirmed */}
                      <div className="flex flex-col items-center gap-1.5 relative z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                          order.status !== "PLACED" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {order.status !== "PLACED" ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : "2"}
                        </div>
                        <span>{lang === "hi" ? "पुष्ट" : "Confirmed"}</span>
                      </div>

                      {/* Step 3: In-Transit */}
                      <div className="flex flex-col items-center gap-1.5 relative z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                          order.status === "IN_TRANSIT" || isDelivered ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {order.status === "IN_TRANSIT" || isDelivered ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : "3"}
                        </div>
                        <span>{lang === "hi" ? "मार्ग में" : "In-Transit"}</span>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="flex flex-col items-center gap-1.5 relative z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                          isDelivered ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {isDelivered ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : "4"}
                        </div>
                        <span>{lang === "hi" ? "डिलीवर हुआ" : "Delivered"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid & Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                    {/* Produce & Pricing */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2 border border-slate-100">
                      <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        {lang === "hi" ? "मूल्य निर्धारण व मात्रा" : "Pricing & Quantity"}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{lang === "hi" ? "मात्रा:" : "Quantity:"}</span>
                        <span className="font-bold text-slate-900">{order.quantityOrdered ?? 0} {lang === "hi" ? "क्विंटल" : "Quintals"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{lang === "hi" ? "खेत भाव:" : "Farm Rate:"}</span>
                        <span className="font-bold text-slate-900">₹{(order.pricePerQuintal ?? 0).toLocaleString()}/{lang === "hi" ? "क्विं" : "qtl"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{lang === "hi" ? "लॉजिस्टिक्स शुल्क:" : "Logistics Fee:"}</span>
                        <span className="text-slate-700 font-semibold">₹{(order.logisticsFee ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 font-extrabold text-sm text-slate-900">
                        <span>{lang === "hi" ? "कुल राशि:" : "Total Amount:"}</span>
                        <span className="text-emerald-700 font-display">₹{(order.totalAmount ?? 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2 border border-slate-100">
                      <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        {lang === "hi" ? "पक्ष व डिलीवरी हब" : "Parties & Delivery Hub"}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{lang === "hi" ? "किसान:" : "Farmer:"}</span>
                        <span className="font-semibold text-slate-900">{order.farmerName || (lang === "hi" ? "किसान" : "Farmer")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{lang === "hi" ? "खरीदार:" : "Buyer:"}</span>
                        <span className="font-semibold text-slate-900">{order.buyerName || (lang === "hi" ? "खरीदार" : "Buyer")}</span>
                      </div>
                      <div className="pt-1.5 text-[11px] text-slate-500 truncate font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">{order.deliveryAddress}</span>
                      </div>
                    </div>

                    {/* Verification & Action Trigger */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 flex flex-col justify-between space-y-2.5 border border-slate-100">
                      <div>
                        <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          {lang === "hi" ? "सुरक्षा व OTP" : "Security & OTP"}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-slate-600 font-medium">{lang === "hi" ? "डिलीवरी OTP:" : "Delivery OTP:"}</span>
                          <span className="font-mono font-extrabold text-slate-900 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 text-xs">
                            {order.deliveryOtp}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {lang === "hi" ? "उत्पाद निरीक्षण के बाद यह OTP ड्राइवर के साथ साझा करें।" : "Share this OTP with the driver upon inspecting produce."}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div>
                        {order.paymentStatus === "PENDING" && (
                          <button
                            onClick={() => setPaymentOrder(order)}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>{lang === "hi" ? "UPI एस्क्रो द्वारा भुगतान करें" : "Pay via UPI Escrow"}</span>
                          </button>
                        )}

                        {order.paymentStatus === "ESCROW_HELD" && order.status === "IN_TRANSIT" && (
                          <button
                            onClick={() => {
                              setOtpOrder(order);
                              setEnteredOtp(order.deliveryOtp); // pre-populate for quick testing
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{lang === "hi" ? "डिलीवरी OTP सत्यापित करें" : "Verify Delivery OTP"}</span>
                          </button>
                        )}

                        {isDelivered && (
                          <button
                            onClick={() => setRatingOrder(order)}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{lang === "hi" ? "किसान व उत्पाद को रेटिंग दें" : "Rate Farmer & Produce"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Place Order Drawer (When user clicks Order on Marketplace) */}
      {activeListingToOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-emerald-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-emerald-100 flex items-center justify-between bg-[#F0FDF4]">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  {lang === "hi" ? "सीधा खेत ऑर्डर प्रविष्टि" : "Direct Farm Order Placement"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === "hi" ? `${activeListingToOrder.farmerName} के साथ सीधा व्यापार करें` : `Transact directly with ${activeListingToOrder.farmerName}`}
                </p>
              </div>
              <button 
                onClick={onCloseOrderModal}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-emerald-100/50 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrderSubmit} className="p-6 space-y-4 text-xs">
              {/* Item Summary */}
              <div className="bg-[#F0FDF4] p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {translateCrop(activeListingToOrder.cropName, lang)} ({activeListingToOrder.variety})
                  </h4>
                  <p className="text-slate-600 font-medium">
                    {lang === "hi" ? "ग्रेड:" : "Grade:"} <strong className="text-emerald-800">{translateGrade(activeListingToOrder.qualityGrade, lang)}</strong> • {activeListingToOrder.district}, {activeListingToOrder.state}
                  </p>
                </div>
                <div className="text-right font-extrabold text-base text-emerald-800 font-display">
                  ₹{activeListingToOrder.expectedPricePerQuintal.toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-500 block">/ {lang === "hi" ? "क्विंटल" : "Quintal"}</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-slate-700">{lang === "hi" ? "ऑर्डर मात्रा (क्विंटल):" : "Order Quantity (Quintals):"}</label>
                  <span className="text-slate-500 font-medium">{lang === "hi" ? "अधिकतम:" : "Max:"} {activeListingToOrder.quantityQuintals} {lang === "hi" ? "क्विं" : "Qtl"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={activeListingToOrder.quantityQuintals}
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-extrabold text-base text-slate-900 w-16 text-right font-display">
                    {orderQty} {lang === "hi" ? "क्विं" : "Qtl"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                  ~{(orderQty * 100).toLocaleString()} {lang === "hi" ? "किग्रा ताजा उपज" : "kg fresh crop"}
                </span>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">{lang === "hi" ? "डिलीवरी गंतव्य / डिपो पता:" : "Delivery Destination / Depot Address:"}</label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">{lang === "hi" ? "गंतव्य पिनकोड:" : "Destination Pincode:"}</label>
                <input
                  type="text"
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Price Calculation Card */}
              <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2 border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>{lang === "hi" ? `उपज उप-योग (${orderQty} क्विं @ ₹${activeListingToOrder.expectedPricePerQuintal}):` : `Produce Subtotal (${orderQty} Qtl @ ₹${activeListingToOrder.expectedPricePerQuintal}):`}</span>
                  <span className="font-bold text-slate-900">
                    ₹{(orderQty * activeListingToOrder.expectedPricePerQuintal).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{lang === "hi" ? "एकीकृत कृषि-लॉजिस्टिक्स शुल्क:" : "Consolidated Agri-Logistics Fee:"}</span>
                  <span className="font-semibold text-slate-900">
                    ₹{(orderQty * 45 + 500).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{lang === "hi" ? "प्लेटफ़ॉर्म कमीशन:" : "Platform Commission:"}</span>
                  <span className="font-bold text-emerald-700">{lang === "hi" ? "₹0 (शून्य शुल्क सीधा व्यापार)" : "₹0 (Zero Fee Direct Trade)"}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold border-t border-slate-200 pt-2 text-slate-900 font-display">
                  <span>{lang === "hi" ? "अनुमानित कुल राशि:" : "Estimated Total:"}</span>
                  <span className="text-emerald-700 text-base">
                    ₹{(orderQty * activeListingToOrder.expectedPricePerQuintal + (orderQty * 45 + 500)).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {submittingOrder 
                  ? (lang === "hi" ? "ऑर्डर की पुष्टि की जा रही है..." : "Confirming Order...")
                  : (lang === "hi" ? "ऑर्डर दें व UPI एस्क्रो पर आगे बढ़ें" : "Place Order & Proceed to UPI Escrow")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: UPI Escrow Payment Gateway Flow */}
      {paymentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-emerald-100 overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-600 text-white p-6 text-center relative">
              <button 
                onClick={() => setPaymentOrder(null)}
                className="absolute right-4 top-4 text-white/70 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-11 h-11 rounded-2xl bg-emerald-700/60 border border-emerald-400/30 mx-auto flex items-center justify-center mb-2 shadow-xs">
                <Smartphone className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-lg font-extrabold font-display">
                {lang === "hi" ? "UPI एस्क्रो गेटवे" : "UPI Escrow Gateway"}
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                {lang === "hi" ? "किसानSetu प्रत्यक्ष एस्क्रो प्रणाली" : "किसानSetu Direct Escrow Rail"}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {paymentSuccessMsg ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 font-display">
                    {lang === "hi" ? "भुगतान एस्क्रो में सुरक्षित!" : "Payment Secured in Escrow!"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {paymentSuccessMsg}
                  </p>
                </div>
              ) : (
                <>
                  {/* Amount Card */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 text-center border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {lang === "hi" ? "सुरक्षित राशि" : "Secured Amount"}
                    </span>
                    <div className="text-2xl font-black text-slate-900 font-display">
                      ₹{(paymentOrder.totalAmount ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {translateCrop(paymentOrder.cropName, lang)} ({paymentOrder.quantityOrdered} {lang === "hi" ? "क्विंटल" : "Qtl"})
                    </div>
                  </div>

                  {/* Direct Escrow UPI QR & VPA Payment Gateway */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                    <div className="w-36 h-36 border border-slate-700 rounded-xl p-2 bg-slate-900 text-white flex flex-col items-center justify-center text-center shadow-xs">
                      <QrCode className="w-20 h-20 text-white" />
                      <span className="text-[9px] font-mono tracking-wider mt-1 text-emerald-300">
                        kisanpay.escrow@upi
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <span>VPA:</span>
                      <strong className="font-mono text-slate-800">kisanpay.escrow@upi</strong>
                    </div>
                  </div>

                  {/* App selector */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5 text-center">
                      {lang === "hi" ? "UPI एप्लिकेशन चुनें:" : "Select UPI Application:"}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setSelectedUpiApp(app)}
                          className={`py-2.5 rounded-xl font-bold text-xs border transition cursor-pointer ${
                            selectedUpiApp === app
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Escrow Disclaimer */}
                  <div className="flex items-start gap-2.5 bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-950 font-medium">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      {lang === "hi"
                        ? "धनराशि तब तक एस्क्रो में सुरक्षित रहेगी जब तक आप माल का निरीक्षण न कर लें और ट्रांसपोर्टर को 4-अंकीय डिलीवरी OTP प्रदान न कर दें।"
                        : "Funds will remain safely locked in escrow until you verify the produce and provide the 4-digit Delivery OTP to the transporter."}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmUpiPayment}
                    disabled={processingPayment}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {processingPayment 
                      ? (lang === "hi" ? "बैंक एस्क्रो ट्रांसफर सत्यापित हो रहा है..." : "Verifying Bank Escrow Transfer...")
                      : (lang === "hi" ? `UPI द्वारा ₹${(paymentOrder.totalAmount ?? 0).toLocaleString()} अधिकृत व एस्क्रो करें` : `Authorize & Escrow ₹${(paymentOrder.totalAmount ?? 0).toLocaleString()} via UPI`)}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: OTP Verification Drawer */}
      {otpOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-emerald-100 overflow-hidden">
            <div className="p-5 border-b border-emerald-100 flex items-center justify-between bg-[#F0FDF4]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm font-display">
                  {lang === "hi" ? "डिलीवरी OTP सत्यापन" : "Delivery OTP Verification"}
                </h3>
              </div>
              <button 
                onClick={() => setOtpOrder(null)} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed font-medium">
                {lang === "hi"
                  ? <><strong>{otpOrder.deliveryAddress}</strong> पर <strong>{translateCrop(otpOrder.cropName, lang)}</strong> ({otpOrder.quantityOrdered} क्विंटल) की प्राप्ति की पुष्टि करें।</>
                  : <>Confirm receipt of <strong>{otpOrder.cropName}</strong> ({otpOrder.quantityOrdered} Quintals) at <strong>{otpOrder.deliveryAddress}</strong>.</>}
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-center">
                  {lang === "hi" ? "4-अंकीय डिलीवरी OTP दर्ज करें:" : "Enter 4-Digit Delivery OTP:"}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="e.g. 5821"
                  className="w-full text-center tracking-widest text-2xl font-mono font-bold bg-slate-50 border-2 border-slate-300 rounded-xl py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 text-center block mt-1 font-medium">
                  {lang === "hi" ? "खरीदार डिलीवरी सत्यापन कोड:" : "Buyer Delivery Verification Code:"} <strong className="text-emerald-700 font-mono tracking-widest">{otpOrder.deliveryOtp}</strong>
                </span>
              </div>

              {otpError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || enteredOtp.length !== 4}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {verifyingOtp 
                  ? (lang === "hi" ? "सत्यापित हो रहा है..." : "Verifying...")
                  : (lang === "hi" ? "डिलीवरी की पुष्टि करें व एस्क्रो जारी करें" : "Confirm Delivery & Release Escrow")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Review & Rating Drawer */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-emerald-100 overflow-hidden">
            <div className="p-5 border-b border-emerald-100 flex items-center justify-between bg-[#F0FDF4]">
              <h3 className="font-extrabold text-slate-900 text-sm font-display">
                {lang === "hi" ? "किसान व गुणवत्ता को रेटिंग दें" : "Rate Farmer & Quality"}
              </h3>
              <button 
                onClick={() => setRatingOrder(null)} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 font-display">
                  {lang === "hi" ? "रेटिंग दर्ज की गई!" : "Rating Recorded!"}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === "hi" ? "किसान का विश्वसनीयता स्कोर सफलतापूर्वक अपडेट हुआ।" : "Farmer's Trust Score updated successfully."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="p-5 space-y-3.5 text-xs">
                <div className="text-center">
                  <span className="text-slate-500 font-medium">
                    {lang === "hi" ? `${ratingOrder.farmerName} से उपज की गुणवत्ता कैसी थी?` : `How was the produce from ${ratingOrder.farmerName}?`}
                  </span>
                  <div className="flex justify-center gap-2 mt-2.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStarCount(s)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 ${s <= starCount ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-700 mt-1.5 block">
                    {starCount === 5 
                      ? (lang === "hi" ? "उत्कृष्ट ग्रेड A" : "Exceptional Grade A")
                      : starCount >= 4 
                      ? (lang === "hi" ? "बहुत अच्छी गुणवत्ता" : "Very Good Quality")
                      : (lang === "hi" ? "उचित गुणवत्ता" : "Fair Quality")}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === "hi" ? "प्रतिक्रिया / गुणवत्ता समीक्षा:" : "Feedback / Quality Review:"}
                  </label>
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  {lang === "hi" ? "समीक्षा व विश्वसनीयता स्कोर सबमिट करें" : "Submit Review & Trust Score"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

