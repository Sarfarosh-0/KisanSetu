import React, { useState } from "react";
import { Scale, X } from "lucide-react";

interface AuthFooterProps {
  onToggleSignUp?: () => void;
  isSignUp?: boolean;
  lang?: "en" | "hi";
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  onToggleSignUp,
  isSignUp = false,
  lang = "hi"
}) => {
  const [modalContent, setModalContent] = useState<"terms" | "privacy" | null>(null);

  return (
    <>
      <footer className="w-full space-y-2 text-center">
        {/* Signup / Signin Toggle */}
        <div className="text-xs text-ink-500 font-medium">
          {isSignUp ? (
            <span>
              {lang === "hi" ? "पहले से खाता मौजूद है? " : "Already have an account? "}
              <button
                type="button"
                onClick={onToggleSignUp}
                className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm"
              >
                {lang === "hi" ? "लॉगिन करें (Sign In)" : "Sign in"}
              </button>
            </span>
          ) : (
            <span>
              {lang === "hi" ? "खाता नहीं है? " : "Don't have an account? "}
              <button
                type="button"
                onClick={onToggleSignUp}
                className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm"
              >
                {lang === "hi" ? "पंजीकरण करें (Sign Up)" : "Sign up"}
              </button>
            </span>
          )}
        </div>

        {/* Legal Agreements */}
        <p className="text-[11px] text-ink-500 leading-tight max-w-sm mx-auto">
          {lang === "hi" ? (
            <>
              आगे बढ़कर, आप किसानSetu की{" "}
              <button
                type="button"
                onClick={() => setModalContent("terms")}
                className="text-ink-700 hover:text-brand-600 underline underline-offset-2 cursor-pointer font-bold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand-500 rounded-xs"
              >
                सेवा शर्तों
              </button>{" "}
              और{" "}
              <button
                type="button"
                onClick={() => setModalContent("privacy")}
                className="text-ink-700 hover:text-brand-600 underline underline-offset-2 cursor-pointer font-bold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand-500 rounded-xs"
              >
                गोपनीयता नीति
              </button>{" "}
              से सहमत होते हैं।
            </>
          ) : (
            <>
              By continuing, you agree to किसानSetu's{" "}
              <button
                type="button"
                onClick={() => setModalContent("terms")}
                className="text-ink-700 hover:text-brand-600 underline underline-offset-2 cursor-pointer font-bold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand-500 rounded-xs"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setModalContent("privacy")}
                className="text-ink-700 hover:text-brand-600 underline underline-offset-2 cursor-pointer font-bold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand-500 rounded-xs"
              >
                Privacy Policy
              </button>
              .
            </>
          )}
        </p>
      </footer>

      {/* Accessible Legal Modals */}
      {modalContent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-brand-500 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-surface-200 pb-3">
              <div className="flex items-center gap-2 text-brand-700 font-extrabold text-sm">
                <Scale className="w-4 h-4 text-brand-600 shrink-0" aria-hidden="true" />
                <h3 id="legal-modal-title">
                  {modalContent === "terms"
                    ? (lang === "hi" ? "कृषि सेवा की शर्तें (Terms of Service)" : "Terms of Agricultural Service")
                    : (lang === "hi" ? "डेटा गोपनीयता एवं किसान सुरक्षा" : "Data Privacy & Producer Protection")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalContent(null)}
                aria-label="Close dialog"
                className="p-1 rounded-lg text-ink-500 hover:text-ink-950 hover:bg-surface-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-ink-700 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1 font-medium">
              {modalContent === "terms" ? (
                lang === "hi" ? (
                  <>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>1. प्रत्यक्ष उत्पादक अनुबंध:</strong> किसानSetu पर किया गया प्रत्येक लेनदेन एक सत्यापित किसान/FPO और संस्थागत खरीददार के बीच सीधा व्यावसायिक समझौता है।
                    </p>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>2. शून्य बिचौलिया शुल्क:</strong> हम खेत से सीधी बिक्री पर 0% कमीशन नीति का पालन करते हैं। सभी मंडी भाव सीधे Agmarknet लाइव रिपोर्ट पर आधारित हैं।
                    </p>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>3. एस्क्रो सुरक्षा (Escrow Protection):</strong> फसल की भौतिक प्राप्ति पर OTP सत्यापन होने तक आपका भुगतान सुरक्षित एस्क्रो खाते में सुरक्षित रहता है।
                    </p>
                  </>
                ) : (
                  <>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>1. Direct Producer Contracts:</strong> Every transaction executed on किसानSetu represents an unmediated commercial agreement between a verified farmer or Farmer Producer Organization (FPO) and an institutional buyer.
                    </p>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>2. Zero Middleman Markups:</strong> We uphold a 0% commission policy on farm-gate produce. All mandi price benchmarks derive directly from live Agmarknet reports.
                    </p>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>3. Escrow Security:</strong> Payments remain in dual-custody nodal escrow until physical OTP confirmation upon crop gate receipt.
                    </p>
                  </>
                )
              ) : (
                lang === "hi" ? (
                  <>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>1. गोपनीय कृषि रिकॉर्ड:</strong> आपकी भूमि के विवरण, फसल पूर्वानुमान और व्यक्तिगत फोन नंबर 256-बिट एन्क्रिप्शन के साथ पूरी तरह सुरक्षित रखे जाते हैं।
                    </p>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>2. संचार सुरक्षा:</strong> आपके मोबाइल नंबर का उपयोग केवल SMS सत्यापन, परिवहन समन्वय और भुगतान सूचनाओं के लिए किया जाता है। हम कभी भी डेटा तीसरे पक्ष को नहीं बेचते।
                    </p>
                  </>
                ) : (
                  <>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>1. Confidential Farm Records:</strong> Your land records, harvest projections, and personal phone numbers are secured using industry-standard 256-bit encryption.
                    </p>
                    <p className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
                      <strong>2. Communication Safeguards:</strong> Phone numbers are utilized strictly for SMS verification, transport coordination, and settlement notifications. We never sell producer data.
                    </p>
                  </>
                )
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="w-full min-h-12 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                {lang === "hi" ? "समझ गया (Got It)" : "I Understand"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};