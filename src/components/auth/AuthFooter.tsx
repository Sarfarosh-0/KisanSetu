import React, { useState } from "react";
import { ShieldCheck, Scale, X } from "lucide-react";

interface AuthFooterProps {
  onToggleSignUp?: () => void;
  isSignUp?: boolean;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  onToggleSignUp,
  isSignUp = false
}) => {
  const [modalContent, setModalContent] = useState<"terms" | "privacy" | null>(null);

  return (
    <>
      <footer className="w-full space-y-2 text-center">
        {/* Signup / Signin Toggle */}
        <div className="text-xs text-ink-500 font-medium">
          {isSignUp ? (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={onToggleSignUp}
                className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onToggleSignUp}
                className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm"
              >
                Sign up
              </button>
            </span>
          )}
        </div>

        {/* Legal Agreements */}
        <p className="text-[11px] text-ink-500 leading-tight max-w-sm mx-auto">
          By continuing, you agree to किसानSetu's{" "}
          <button
            type="button"
            onClick={() => setModalContent("terms")}
            className="text-ink-700 hover:text-brand-600 underline underline-offset-2 cursor-pointer font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand-500 rounded-xs"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() => setModalContent("privacy")}
            className="text-ink-700 hover:text-brand-600 underline underline-offset-2 cursor-pointer font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand-500 rounded-xs"
          >
            Privacy Policy
          </button>
          .
        </p>
      </footer>

      {/* Accessible Legal Modals */}
      {modalContent && (
        <div 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-surface-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-surface-100 pb-3">
              <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
                <Scale className="w-4 h-4 text-brand-600" aria-hidden="true" />
                <h3 id="legal-modal-title">
                  {modalContent === "terms" ? "Terms of Agricultural Service" : "Data Privacy & Producer Protection"}
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

            <div className="text-xs text-ink-700 space-y-2.5 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {modalContent === "terms" ? (
                <>
                  <p>
                    <strong>1. Direct Producer Contracts:</strong> Every transaction executed on किसानSetu represents an unmediated commercial agreement between a verified farmer or Farmer Producer Organization (FPO) and an institutional buyer.
                  </p>
                  <p>
                    <strong>2. Zero Middleman Markups:</strong> We uphold a 0% commission policy on farm-gate produce. All mandi price benchmarks derive directly from live Agmarknet reports.
                  </p>
                  <p>
                    <strong>3. Escrow Security:</strong> Payments remain in dual-custody nodal escrow until physical OTP confirmation upon crop gate receipt.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Confidential Farm Records:</strong> Your land records, harvest projections, and personal phone numbers are secured using industry-standard 256-bit encryption.
                  </p>
                  <p>
                    <strong>2. Communication Safeguards:</strong> Phone numbers are utilized strictly for SMS verification, transport coordination, and settlement notifications. We never sell producer data.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
