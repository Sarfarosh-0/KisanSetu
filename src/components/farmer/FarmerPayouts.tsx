import React, { useState } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Building, 
  FileText, 
  Download, 
  ExternalLink,
  Info,
  DollarSign
} from "lucide-react";
import { Order, PayoutRecord, User } from "../../types";
import { MOCK_PAYOUTS } from "../../data/mockAgriData";
import { t, translateCrop, translateStatus } from "../../i18n";

interface FarmerPayoutsProps {
  farmer: User;
  orders: Order[];
  lang: "en" | "hi";
  onOrderStatusUpdate?: (orderId: number, status: string) => void;
}

export const FarmerPayouts: React.FC<FarmerPayoutsProps> = ({
  farmer,
  orders,
  lang,
  onOrderStatusUpdate
}) => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>(MOCK_PAYOUTS);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  const farmerOrders = orders.filter(o => o.farmerId === farmer.id);

  const totalReleased = payouts
    .filter(p => p.status === "RELEASED")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalInEscrow = payouts
    .filter(p => p.status === "ESCROW_LOCKED")
    .reduce((sum, p) => sum + p.amount, 0);

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard?.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {lang === "hi" ? "डायरेक्ट बैंक पेआउट्स" : "Direct Bank Settlements"}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              • {lang === "hi" ? "0% कमीशन कटौती" : "0% Commission Deduction"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {lang === "hi" ? "प्रत्यक्ष भुगतान व एस्क्रो खाता" : "Direct Payout History & Escrow Ledger"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            {lang === "hi"
              ? "संस्थागत खरीदारों से प्राप्त सभी भुगतान RBI-अनुपालक एस्क्रो में सुरक्षित रखे जाते हैं और डिलीवरी सत्यापन के तुरंत बाद आपके किसान खाते में भेज दिए जाते हैं।"
              : "All proceeds from institutional buyer trades are held safely in RBI-compliant dual-custody escrow and disbursed directly to your Kisan bank account upon verified delivery."}
          </p>
        </div>

        {/* Linked Bank Account Card */}
        <div className="bg-[#F0FDF4] p-4 rounded-2xl border border-emerald-200 text-xs min-w-70">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold uppercase text-[10px]">
              {lang === "hi" ? "जुड़ा हुआ बैंक खाता" : "Linked Payout Account"}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{lang === "hi" ? "सत्यापित" : "Verified"}</span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <Building className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-xs">Bank of Maharashtra (Kisan Credit)</p>
              <p className="text-slate-500 font-mono text-[11px]">A/C •••• •••• 4029 • MAHB0001092</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === "hi" ? "बैंक में भेजा गया कुल भुगतान" : "Total Released to Bank"}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            ₹{totalReleased.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? "100% बिना बिचौलियों के सीधे जमा" : "100% credited without intermediary cuts"}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === "hi" ? "एस्क्रो में सुरक्षित राशि" : "Locked in KisanEscrow"}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-display">
            ₹{totalInEscrow.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 pt-1">
            <Lock className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? "खरीदार द्वारा जमा; OTP प्राप्ति पर तुरंत जारी" : "Funds deposited by buyer; releasing upon OTP receipt"}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === "hi" ? "औसत भुगतान समय" : "Average Settlement Speed"}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-display">
            {lang === "hi" ? "< 4 घंटे" : "< 4 Hours"}
          </div>
          <div className="text-[11px] text-slate-500 font-medium pt-1">
            {lang === "hi" ? "डिलीवरी सत्यापन के बाद स्वचालित IMPS/NEFT भुगतान" : "Automated IMPS/NEFT payout upon buyer delivery sign-off"}
          </div>
        </div>
      </div>

      {/* Payouts Ledger Table */}
      <div className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              {lang === "hi" ? `बैंक भुगतान बहीखाता (${payouts.length})` : `Bank Disbursement Ledger (${payouts.length})`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {lang === "hi"
                ? "सीधे आपके बैंक खाते में स्थानांतरित सभी UPI / NEFT भुगतानों का लाइव रिकॉर्ड।"
                : "Real-time records of all UPI / NEFT payouts transferred directly to your bank account."}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">{lang === "hi" ? "लेनदेन संदर्भ व ऑर्डर" : "Transaction Ref & Order"}</th>
                <th className="px-6 py-3.5">{lang === "hi" ? "उपज व मात्रा" : "Produce & Volume"}</th>
                <th className="px-6 py-3.5">{lang === "hi" ? "भुगतान बैंक" : "Disbursement Bank"}</th>
                <th className="px-6 py-3.5">{lang === "hi" ? "राशि (₹)" : "Amount (₹)"}</th>
                <th className="px-6 py-3.5">{lang === "hi" ? "स्थिति" : "Status"}</th>
                <th className="px-6 py-3.5">{lang === "hi" ? "तारीख" : "Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {payouts.map((p) => {
                const isReleased = p.status === "RELEASED";
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {p.orderNumber}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                        <span className="font-mono">{p.utrNumber.slice(0, 18)}...</span>
                        <button
                          onClick={() => handleCopyUtr(p.utrNumber)}
                          className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                          title="Copy Full UTR Reference"
                        >
                          {copiedUtr === p.utrNumber ? (lang === "hi" ? "कॉपी हुआ" : "Copied") : (lang === "hi" ? "कॉपी" : "Copy")}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{translateCrop(p.cropName, lang)}</div>
                      <div className="text-slate-500 text-[11px]">{p.quantityQuintals} {t("common.quintals", lang)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{p.bankName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{p.accountMasked}</div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-sm text-slate-900 font-display">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        isReleased
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {isReleased ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Lock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{isReleased ? (lang === "hi" ? "खाते में जमा" : "Credited to Bank") : (lang === "hi" ? "एस्क्रो में सुरक्षित" : "Escrow Locked")}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {p.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

