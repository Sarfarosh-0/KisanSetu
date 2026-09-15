import React, { useState } from "react";
import { Phone, ArrowRight, Loader2, AlertCircle, HelpCircle, X, CheckCircle2, FileQuestionMark, Info, MessageCircleQuestionMark, Globe } from "lucide-react";
import { UserRole } from "../../types/auth";
import { RoleSelector } from "./RoleSelector";
import { SocialLogin } from "./SocialLogin";
import { AuthFooter } from "./AuthFooter";

interface PhoneLoginFormProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSubmitPhone: (phone: string) => void;
  onGoogleSuccess?: (role: UserRole) => void;
  initialPhone?: string;
}

export const PhoneLoginForm: React.FC<PhoneLoginFormProps> = ({
  role,
  onRoleChange,
  onSubmitPhone,
  onGoogleSuccess,
  initialPhone = ""
}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("hi");
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue.length <= 10) {
      setPhone(rawValue);
      if (error) setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 0) {
      setError(lang === "hi" ? "कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें" : "Please enter your 10-digit mobile number");
      return;
    }
    if (phone.length < 10) {
      setError(lang === "hi" ? "मोबाइल नंबर पूरे 10 अंकों का होना चाहिए" : "Mobile number must be exactly 10 digits");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitPhone(phone);
    }, 400);
  };

  const formattedDisplay = phone.length > 5 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone;

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Language Toggle Bar */}
      <div className="flex items-center justify-between border-b-2 border-surface-200 pb-3">
        <div className="flex items-center gap-2">
          <img src="favicon.svg" alt="" />
          <div>
            <h1 className="text-lg font-black text-ink-950 font-display leading-tight">
              किसान<span className="text-brand-600">Setu</span>
            </h1>
            <p className="text-[11px] text-ink-500 font-bold">
              {lang === "hi" ? "डिजिटल कृषि मंडी" : "Digital Agri Marketplace"}
            </p>
          </div>
        </div>

        {/* Prominent English / Hindi Toggle */}
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="min-h-10 px-3 py-1.5 rounded-xl bg-brand-50 border-2 border-brand-200 text-brand-700 font-extrabold text-xs flex items-center gap-1.5 hover:bg-brand-100 transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4 font-bold" />
          <span>{lang === "en" ? "हिंदी में बदलें" : "Switch to English"}</span>
        </button>
      </div>

      {/* Hero Welcome & Visual Role Context */}
      <div className="space-y-1 bg-earth-50 p-3.5 rounded-2xl border-2 border-surface-200">
        <h2 className="text-lg font-extrabold text-ink-950">
          {lang === "hi" ? "खाते में प्रवेश करें" : "Login to Your Account"}
        </h2>
        <p className="text-xs text-ink-700 font-medium">
          {role === "farmer"
            ? (lang === "hi" ? "अपनी फसल बेचें और मंडी भाव देखें।" : "List your harvest and view mandi rates.")
            : (lang === "hi" ? "सीधे किसानों से ताज़ा फसल खरीदें।" : "Buy fresh produce directly from verified farmers.")}
        </p>
      </div>

      {/* Role Selection */}
      <RoleSelector
        role={role}
        onChange={onRoleChange}
        disabled={isSubmitting}
        lang={lang}
      />

      {/* Primary Phone Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="phone-input"
            className="flex items-center justify-between text-xs font-bold text-ink-950 uppercase tracking-wider"
          >
            <span>{lang === "hi" ? "2. मोबाइल नंबर दर्ज करें" : "2. Enter Mobile Number"}</span>
          </label>

          {/* High Contrast 56px Min-Height Input Box */}
          <div className={`relative flex items-center min-h-14 rounded-2xl border-2 bg-white transition-all overflow-hidden ${error
            ? "border-red-500 ring-2 ring-red-100"
            : "border-earth-950 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100"
            }`}>
            <div className="pl-4 pr-2 text-xl pointer-events-none" aria-hidden="true">
              <Phone className="w-5 h-5" />
            </div>
            <input
              id="phone-input"
              name="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="98765 43210"
              value={formattedDisplay}
              onChange={handlePhoneChange}
              disabled={isSubmitting}
              className="w-full min-h-14 pr-4 text-2xl font-bold font-mono text-ink-950 placeholder:text-ink-500/40 bg-transparent outline-none focus:outline-none focus:ring-0"
            />
          </div>

          {/* High-Visibility Banner Error Message */}
          {error && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border-2 border-red-200 flex items-center gap-2 text-xs text-red-700 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Primary Action Button (Min 56px Target) */}
        <button
          type="submit"
          disabled={isSubmitting || phone.length < 10}
          className="w-full min-h-14 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-700 text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer border-2 border-brand-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{lang === "hi" ? "ओटीपी भेजा जा रहा है..." : "Sending Code..."}</span>
            </>
          ) : (
            <>
              <span>{lang === "hi" ? "आगे बढ़ें (OTP प्राप्त करें)" : "Get OTP Code"}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Need Help / सहायता Button */}
      <div className="flex items-center justify-center gap-2 pt-3 border-t border-surface-200">
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="min-h-11 px-2 py-1 rounded-xl bg-surface-50 hover:bg-surface-100 border border-slate-300 text-ink-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-brand-600" />
          <span className="text-brand-600">{lang === "hi" ? "मदद चाहिए? (Need Help?)" : "Need Help Logging In?"}</span>
        </button>
      </div>

      <SocialLogin role={role} onGoogleSuccess={onGoogleSuccess} disabled={isSubmitting} />
      <AuthFooter isSignUp={false} />

      {/* Visual Support Drawer / Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 border-2 border-brand-500 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-ink-950 flex items-center gap-2">
                <MessageCircleQuestionMark className="text-brand-600" />
                <span>{lang === "hi" ? "लॉगिन में सहायता (Login Guidance)" : "How to Log In"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg hover:bg-surface-100 text-ink-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-ink-700 font-medium">
              {/* Step 1 */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-brand-50 border border-brand-100">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <p>
                  {lang === "hi" ? (
                    <>
                      <strong>1. भूमिका चुनें (Role):</strong> फसल बेचने के लिए <strong>'किसान'</strong> या खरीदने के लिए <strong>'खरीददार'</strong> का चयन करें।
                    </>
                  ) : (
                    <>
                      <strong>1. Role Selection:</strong> Choose <strong>Farmer</strong> if selling crops or <strong>Buyer</strong> if purchasing.
                    </>
                  )}
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-brand-50 border border-brand-100">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <p>
                  {lang === "hi" ? (
                    <>
                      <strong>2. मोबाइल नंबर दर्ज करें:</strong> अपना 10 अंकों का सक्रिय मोबाइल नंबर दर्ज करें।
                    </>
                  ) : (
                    <>
                      <strong>2. Enter Phone Number:</strong> Input your 10-digit mobile number connected to your SIM.
                    </>
                  )}
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-brand-50 border border-brand-100">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <p>
                  {lang === "hi" ? (
                    <>
                      <strong>3. OTP दर्ज करें:</strong> SMS द्वारा प्राप्त 6 अंकों का सुरक्षा कोड दर्ज करके लॉगिन पूरा करें।
                    </>
                  ) : (
                    <>
                      <strong>3. Verify OTP:</strong> Enter the 6-digit code received via SMS to complete login.
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full min-h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs cursor-pointer transition-colors"
            >
              {lang === "hi" ? "समझ गया (Got It)" : "Close Helper"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};