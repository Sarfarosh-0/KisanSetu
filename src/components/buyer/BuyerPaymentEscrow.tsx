import React, { useState } from "react";
import { 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  FileText, 
  ArrowUpRight, 
  Lock, 
  Smartphone, 
  Building, 
  Download, 
  Sparkles, 
  Receipt,
  AlertCircle
} from "lucide-react";
import { Order, User } from "../../types";
import { t, translateCrop, translatePaymentStatus } from "../../i18n";

interface BuyerPaymentEscrowProps {
  buyer: User;
  orders: Order[];
  lang: "en" | "hi";
  onVerifyPayment?: (payload: { orderId: number; upiId: string; amount: number }) => Promise<void>;
}

export const BuyerPaymentEscrow: React.FC<BuyerPaymentEscrowProps> = ({
  buyer,
  orders,
  lang,
  onVerifyPayment
}) => {
  const [selectedGateway, setSelectedGateway] = useState<"UPI" | "NEFT" | "CARD">("UPI");
  const [upiId, setUpiId] = useState("procurement@okaxis");
  const [topupAmount, setTopupAmount] = useState<number>(50000);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const buyerOrders = orders.filter(o => o.buyerId === buyer.id || !o.buyerId);
  const totalEscrowLocked = buyerOrders
    .filter(o => o.paymentStatus === "ESCROW_HELD")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalSettled = buyerOrders
    .filter(o => o.paymentStatus === "RELEASED_TO_FARMER")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleSimulateTopup = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatingPayment(true);
    setPaymentSuccessMsg("");

    setTimeout(() => {
      setSimulatingPayment(false);
      setPaymentSuccessMsg(
        lang === "hi"
          ? `किसान-एस्क्रो वॉलेट में UPI (${upiId}) द्वारा ₹${topupAmount.toLocaleString()} जमा हो गए! UTR: UPI/2026/89218491`
          : `KisanEscrow wallet funded with ₹${topupAmount.toLocaleString()} via UPI (${upiId})! UTR: UPI/2026/89218491`
      );
      setTimeout(() => {
        setPaymentSuccessMsg("");
      }, 3500);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {lang === "hi" ? "किसान-एस्क्रो सुरक्षित गेटवे" : "KisanEscrow Dual-Custody Gateway"}
            </span>
            <span className="text-xs text-slate-500 font-medium">• {lang === "hi" ? "RBI दिशानिर्देशों के अनुरूप" : "RBI Guidelines Compliant"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {t("buyerEscrow.title", lang)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            {t("buyerEscrow.subtitle", lang)}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F0FDF4] p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold">{lang === "hi" ? "शून्य-जोखिम गुणवत्ता गारंटी" : "Zero-Risk Quality Guarantee"}</div>
            <div className="text-[11px] text-slate-500 font-medium">
              {lang === "hi" ? "गुणवत्ता न मिलने पर स्वतः धनवापसी" : "Auto-refund if grade criteria failed"}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === "hi" ? "एस्क्रो में सुरक्षित राशि" : "Protected in Escrow"}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-display">
            ₹{(totalEscrowLocked || 185000).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium pt-1 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === "hi" ? "सुरक्षित रखी गई; आपके OTP देने पर ही जारी होगी" : "Safely held; released only upon your OTP entry"}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === "hi" ? "कुल निपटाए गए सौदे" : "Total Settled Trades"}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            ₹{(totalSettled || 420000).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold pt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? "सीधे सत्यापित किसानों को स्थानांतरित" : "Transferred directly to verified farmers"}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === "hi" ? "मंडी शुल्क व बिचौलियों की बचत" : "Mandi Fee & Middlemen Saved"}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-display">
            ₹78,400
          </div>
          <div className="text-[11px] text-slate-500 font-medium pt-1">
            {lang === "hi" ? "APMC मंडी कमीशन की तुलना में 18% लागत बचत" : "18% cost reduction compared to APMC yard commission"}
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Gateways & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gateway Management */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                {lang === "hi" ? "समर्थित संस्थागत भुगतान गेटवे" : "Supported Institutional Gateways"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {lang === "hi" ? "खरीद अनुबंधों के लिए अपनी पसंदीदा भुगतान विधि चुनें।" : "Choose your enterprise payment method for procurement contracts."}
              </p>
            </div>
          </div>

          {/* Gateway Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedGateway("UPI")}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                selectedGateway === "UPI"
                  ? "bg-[#F0FDF4] border-emerald-500 text-emerald-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <Smartphone className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
              <span className="text-xs block">UPI / GPay / PhonePe</span>
            </button>

            <button
              onClick={() => setSelectedGateway("NEFT")}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                selectedGateway === "NEFT"
                  ? "bg-[#F0FDF4] border-emerald-500 text-emerald-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <Building className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
              <span className="text-xs block">{lang === "hi" ? "RTGS / वर्चुअल एस्क्रो" : "RTGS / Virtual Escrow"}</span>
            </button>

            <button
              onClick={() => setSelectedGateway("CARD")}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                selectedGateway === "CARD"
                  ? "bg-[#F0FDF4] border-emerald-500 text-emerald-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
              <span className="text-xs block">{lang === "hi" ? "कॉर्पोरेट किसान कार्ड" : "Corporate Kisan Card"}</span>
            </button>
          </div>

          {/* Gateway Content */}
          {selectedGateway === "UPI" && (
            <form onSubmit={handleSimulateTopup} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === "hi" ? "संस्थागत UPI आईडी / VPA:" : "Institutional UPI VPA / Handle:"}
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                  placeholder="e.g. greenbite@icici"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === "hi" ? "एस्क्रो में जमा करने की राशि (₹):" : "Amount to Fund Escrow (₹):"}
                </label>
                <input
                  type="number"
                  min={5000}
                  step={5000}
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {paymentSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{paymentSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={simulatingPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>
                  {simulatingPayment
                    ? (lang === "hi" ? "एस्क्रो जमा अधिकृत हो रहा है..." : "Authorizing Escrow Deposit...")
                    : (lang === "hi" ? `एस्क्रो में ₹${topupAmount.toLocaleString()} जमा करें` : `Deposit ₹${topupAmount.toLocaleString()} to Escrow`)}
                </span>
              </button>
            </form>
          )}

          {selectedGateway === "NEFT" && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">
                {lang === "hi" ? "वर्चुअल बैंक एस्क्रो विवरण:" : "Virtual Bank Escrow Coordinates:"}
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{lang === "hi" ? "लाभार्थी:" : "Beneficiary:"}</span>
                <strong className="text-slate-900">किसानSetu Escrow / GreenBite</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{lang === "hi" ? "वर्चुअल खाता संख्या:" : "Virtual A/C No:"}</span>
                <strong className="font-mono text-slate-900">KSE9820044556</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{lang === "hi" ? "बैंक व IFSC कोड:" : "Bank & IFSC:"}</span>
                <strong className="font-mono text-slate-900">YESB0CMSNOC</strong>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                {lang === "hi" 
                  ? "RTGS बैंक ट्रांसफर 15 मिनट के भीतर आपके सक्रिय खरीद लॉट में स्वतः जमा हो जाते हैं।"
                  : "Wire RTGS transfers are credited to your active procurement lot automatically within 15 minutes."}
              </p>
            </div>
          )}

          {selectedGateway === "CARD" && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">
                {lang === "hi" ? "पंजीकृत कॉर्पोरेट कृषि कार्ड:" : "Registered Corporate Agri Card:"}
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{lang === "hi" ? "कार्डधारक:" : "Cardholder:"}</span>
                <strong className="text-slate-900">{buyer.name} (GreenBite)</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{lang === "hi" ? "कार्ड संख्या:" : "Card Number:"}</span>
                <strong className="font-mono text-slate-900">•••• •••• •••• 9104</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{lang === "hi" ? "उपलब्ध कृषि क्रेडिट सीमा:" : "Agri Credit Line:"}</span>
                <strong className="text-emerald-700 font-bold">₹10,00,000 ({lang === "hi" ? "उपलब्ध" : "Available"})</strong>
              </div>
            </div>
          )}
        </div>

        {/* GST Invoices & Receipts */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              {lang === "hi" ? `टैक्स इनवॉइस व डिजिटल रसीदें (${buyerOrders.length})` : `Tax Invoices & Digital Receipts (${buyerOrders.length})`}
            </h3>
            <span className="text-xs text-slate-500 font-medium">B2B Compliant</span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {buyerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-mono font-bold text-slate-900 text-xs">
                    INV-{order.orderNumber}
                  </div>
                  <div className="font-semibold text-slate-700 text-xs mt-0.5">
                    {translateCrop(order.cropName, lang)} ({order.quantityOrdered} {lang === "hi" ? "क्विंटल" : "Qtl"})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {lang === "hi" ? "विक्रेता:" : "Seller:"} {order.farmerName || (lang === "hi" ? "सह्याद्री FPO" : "Sahyadri FPO")} • {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-slate-900 font-display text-sm">
                    ₹{(order.totalAmount ?? 0).toLocaleString()}
                  </div>
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{lang === "hi" ? "GST टैक्स इनवॉइस देखें" : "View GST Tax Invoice"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GST Invoice View Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-emerald-100 overflow-hidden">
            <div className="px-6 py-4 bg-[#F0FDF4] border-b border-emerald-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  {lang === "hi" ? "आधिकारिक डिजिटल B2B कृषि इनवॉइस" : "Official Digital B2B Agri Invoice"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === "hi" ? "टैक्स इनवॉइस:" : "Tax Invoice:"} INV-{selectedInvoiceOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{lang === "hi" ? "कंसाइनी (खरीदार)" : "Consignee (Buyer)"}</span>
                  <div className="font-bold text-slate-900 text-xs">{buyer.name}</div>
                  <div className="text-slate-500 text-[11px]">{buyer.fpoName || "GreenBite Wholesale"}</div>
                  <div className="text-slate-500 text-[11px]">GSTIN: 27AABCG1234F1Z8</div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{lang === "hi" ? "कंसाइनर (उत्पादक FPO)" : "Consignor (Producer FPO)"}</span>
                  <div className="font-bold text-slate-900 text-xs">{selectedInvoiceOrder.farmerName || (lang === "hi" ? "सह्याद्री FPO" : "Sahyadri FPO")}</div>
                  <div className="text-slate-500 text-[11px]">{lang === "hi" ? "खेत से सीधा प्रेषण" : "Farm Gate Direct Origin"}</div>
                  <div className="text-slate-500 text-[11px]">Kisan ID: KSN-2026-081</div>
                </div>
              </div>

              <table className="w-full text-left">
                <thead className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                  <tr>
                    <th className="py-1.5">{lang === "hi" ? "विवरण" : "Description"}</th>
                    <th className="py-1.5">{lang === "hi" ? "HSN कोड" : "HSN Code"}</th>
                    <th className="py-1.5 text-right">{lang === "hi" ? "मात्रा" : "Quantity"}</th>
                    <th className="py-1.5 text-right">{lang === "hi" ? "दर" : "Rate"}</th>
                    <th className="py-1.5 text-right">{lang === "hi" ? "कुल" : "Total"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 font-bold text-slate-900">{translateCrop(selectedInvoiceOrder.cropName, lang)}</td>
                    <td className="py-2 font-mono text-slate-500">07031010</td>
                    <td className="py-2 text-right">{selectedInvoiceOrder.quantityOrdered} {lang === "hi" ? "क्विंटल" : "Qtl"}</td>
                    <td className="py-2 text-right">₹{selectedInvoiceOrder.pricePerQuintal}</td>
                    <td className="py-2 text-right font-bold">₹{(selectedInvoiceOrder.totalProduceAmount ?? 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">{lang === "hi" ? "कोल्ड चेन लॉजिस्टिक्स" : "Cold Chain Logistics"}</td>
                    <td className="py-2 font-mono text-slate-500">996511</td>
                    <td className="py-2 text-right">1 Trip</td>
                    <td className="py-2 text-right">₹{selectedInvoiceOrder.logisticsFee}</td>
                    <td className="py-2 text-right font-bold">₹{(selectedInvoiceOrder.logisticsFee ?? 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-right">
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === "hi" ? "उप-योग:" : "Subtotal:"}</span>
                  <span className="font-bold">₹{(selectedInvoiceOrder.totalAmount ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === "hi" ? "APMC मंडी शुल्क:" : "APMC Mandi Yard Tax:"}</span>
                  <span className="font-bold text-emerald-700">{lang === "hi" ? "₹0 (सीधे व्यापार में छूट)" : "₹0 (Exempt under Direct Trade)"}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-extrabold text-sm text-slate-900">
                  <span>{lang === "hi" ? "एस्क्रो द्वारा कुल भुगतान:" : "Total Settled via Escrow:"}</span>
                  <span className="font-display">₹{(selectedInvoiceOrder.totalAmount ?? 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => alert(lang === "hi" ? "आपकी लेखा टीम के लिए इनवॉइस PDF सफलतापूर्वक तैयार किया गया।" : "Invoice PDF successfully generated for your accounting team.")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "हस्ताक्षरित PDF डाउनलोड करें" : "Download Signed PDF"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

