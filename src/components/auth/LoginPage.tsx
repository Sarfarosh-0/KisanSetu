import React, { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { PhoneLoginForm } from "./PhoneLoginForm";
import { OtpVerification } from "./OtpVerification";
import { UserRole, AuthStep, LoginState, AuthSuccessPayload } from "../../types/auth";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface LoginPageProps {
  initialRole?: UserRole;
  onLoginSuccess?: (payload: AuthSuccessPayload) => void;
  onBackToApp?: () => void;
  lang?: "en" | "hi";
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = "farmer",
  onLoginSuccess,
  onBackToApp,
  lang = "en"
}) => {
  const [loginState, setLoginState] = useState<LoginState>({
    role: initialRole,
    step: "phone",
    phone: "",
    otp: ""
  });

  const [authSuccess, setAuthSuccess] = useState<AuthSuccessPayload | null>(null);

  // Handle role switch (Farmer / Buyer)
  const handleRoleChange = (newRole: UserRole) => {
    setLoginState((prev) => ({
      ...prev,
      role: newRole
    }));
  };

  // Step 1: Submit phone number -> move to OTP
  const handleSubmitPhone = (enteredPhone: string) => {
    setLoginState((prev) => ({
      ...prev,
      phone: enteredPhone,
      step: "otp"
    }));
  };

  // Step 2: Back button from OTP -> return to phone step
  const handleBackToPhone = () => {
    setLoginState((prev) => ({
      ...prev,
      step: "phone",
      otp: ""
    }));
  };

  // Step 3: Verify OTP successfully
  const handleVerifySuccess = (enteredOtp: string) => {
    const payload: AuthSuccessPayload = {
      role: loginState.role,
      phone: loginState.phone,
      method: "otp",
      userProfile: {
        name: loginState.role === "farmer" ? "Ramesh Patel (FPO)" : "Priya Sharma (Retail)",
        district: loginState.role === "farmer" ? "Nashik" : "Pune",
        state: "Maharashtra"
      }
    };

    setAuthSuccess(payload);

    setTimeout(() => {
      onLoginSuccess?.(payload);
    }, 1200);
  };

  // Alternative Google sign in
  const handleGoogleSuccess = (role: UserRole) => {
    const payload: AuthSuccessPayload = {
      role: role,
      phone: "9823012345",
      method: "google",
      userProfile: {
        name: role === "farmer" ? "Ramesh Patel (Google)" : "Priya Sharma (Google)",
        district: "Nashik",
        state: "Maharashtra"
      }
    };

    setAuthSuccess(payload);

    setTimeout(() => {
      onLoginSuccess?.(payload);
    }, 1200);
  };

  return (
    <AuthLayout onBackToApp={onBackToApp}>
      {authSuccess ? (
        /* Smooth authentication success feedback card */
        <div 
          role="status"
          aria-live="polite"
          className="w-full text-center p-6 sm:p-8 bg-white/50 rounded-xl space-y-4 animate-in zoom-in-95 duration-200"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-brand-600 animate-bounce" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-ink-950 font-display">
              Authentication Verified
            </h2>
            <p className="text-xs sm:text-sm text-ink-500 font-medium">
              Signed in successfully as{" "}
              <strong className="text-brand-700 font-bold capitalize">
                {authSuccess.role === "farmer" ? "Farmer / FPO" : "Verified Buyer"}
              </strong>
            </p>
          </div>

          <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 text-xs text-ink-700 font-mono">
            +91 {authSuccess.phone.slice(0, 5)} {authSuccess.phone.slice(5)}
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-brand-600">
            <span>Entering किसानSetu Exchange...</span>
            <ArrowRight className="w-4 h-4 animate-pulse" aria-hidden="true" />
          </div>
        </div>
      ) : loginState.step === "phone" ? (
        <PhoneLoginForm
          role={loginState.role}
          onRoleChange={handleRoleChange}
          onSubmitPhone={handleSubmitPhone}
          onGoogleSuccess={handleGoogleSuccess}
          initialPhone={loginState.phone}
        />
      ) : (
        <OtpVerification
          phone={loginState.phone}
          role={loginState.role}
          onBack={handleBackToPhone}
          onVerifySuccess={handleVerifySuccess}
          onResendOtp={() => {
            // OTP re-send is handled server-side; no client action needed here
          }}
        />
      )}
    </AuthLayout>
  );
};
