import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ShieldCheck, RotateCw, Loader2, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { UserRole } from "../../types/auth";

interface OtpVerificationProps {
  phone: string;
  role: UserRole;
  onBack: () => void;
  onVerifySuccess: (otp: string) => void;
  onResendOtp?: () => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  phone,
  role,
  onBack,
  onVerifySuccess,
  onResendOtp
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const triggerVerification = (otpString: string) => {
    if (otpString.length < 6) {
      setError("कृपया 6 अंकों का पूरा कोड दर्ज करें (Enter complete 6-digit code)");
      return;
    }
    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      setIsVerifying(false);
      onVerifySuccess(otpString);
    }, 500);
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    const next = [...digits];

    if (!rawVal) {
      next[index] = "";
      setDigits(next);
      return;
    }

    next[index] = rawVal.slice(-1);
    setDigits(next);
    if (error) setError(null);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (next.join("").length === 6) {
      triggerVerification(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      <button
        type="button"
        onClick={onBack}
        className="min-h-11 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 font-bold text-xs text-ink-950 inline-flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-brand-600" />
        <span>नंबर बदलें (Change Phone Number)</span>
      </button>

      <div className="space-y-1 bg-brand-50 p-3.5 rounded-2xl border-2 border-brand-200">
        <div className="flex items-center gap-2 text-ink-950 font-extrabold text-base">
          <span className="text-xl">🔒</span>
          <h2>ओटीपी सत्यापन (OTP Verification)</h2>
        </div>
        <p className="text-xs text-ink-700 font-medium">
          एसएमएस द्वारा भेजा गया 6 अंकों का कोड दर्ज करें: <strong className="font-mono font-bold text-ink-950">+91 {phone}</strong>
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); triggerVerification(digits.join("")); }} className="space-y-5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isVerifying}
              onChange={(e) => handleChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black font-mono rounded-2xl border-2 transition-all focus:outline-hidden ${error
                ? "border-red-500 bg-red-50 text-red-700"
                : digit
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-950 bg-white text-ink-950 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                }`}
            />
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border-2 border-red-200 flex items-center gap-2 text-xs text-red-700 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isVerifying || digits.join("").length < 6}
          className="w-full min-h-14 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-700 text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer border-2 border-brand-700"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>सत्यापित किया जा रहा है...</span>
            </>
          ) : (
            <span>सत्यापित करें और प्रवेश करें (Verify)</span>
          )}
        </button>

        <div className="text-center pt-1">
          {countdown > 0 ? (
            <p className="text-xs text-ink-500 font-bold">
              पुनः कोड भेजें (Resend in): <span className="font-mono text-ink-950 font-black">0:{countdown < 10 ? `0${countdown}` : countdown}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => { setCountdown(30); onResendOtp?.(); }}
              className="min-h-11 px-4 py-2 rounded-xl bg-earth-100 hover:bg-earth-100/80 border border-surface-200 font-black text-xs text-brand-700 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>पुनः ओटीपी भेजें (Resend OTP)</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};