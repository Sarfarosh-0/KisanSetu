import React from "react";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  onBackToApp?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, onBackToApp }) => {
  return (
    <div className="min-h-screen w-full bg-surface-50 flex flex-col lg:flex-row antialiased selection:bg-brand-100 selection:text-brand-700">

      {/*Authentication Form Panel */}
      <main 
        id="auth-content"
        className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto relative bg-linear-to-br from-surface-50 via-white to-brand-50/30"
      >
        {/* Subtle decorative ambient background orbs */}
        {/* <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-[15%] right-[-5%] w-72 h-72 bg-brand-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] left-[-8%] w-64 h-64 bg-surface-200/50 rounded-full blur-3xl" />
          <div className="absolute top-[60%] right-[30%] w-48 h-48 bg-brand-50/60 rounded-full blur-3xl" />
        </div> */}

        <div className="relative z-10 w-full max-w-120 mx-auto flex justify-between items-center text-xs text-ink-500 mb-2 sm:mb-3">
          {onBackToApp ? (
            <button
              type="button"
              onClick={onBackToApp}
              className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 bg-white/70 backdrop-blur-sm hover:bg-brand-50 px-3 py-1 rounded-full border border-brand-200/80 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Explore Marketplace</span>
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Floating Glass Card */}
        <div className="relative z-10 w-full max-w-120 mx-auto my-auto">
          <div className="relative bg-white/80 backdrop-blur-xl rounded-4xl border border-brand-600 shadow-xl p-5 sm:p-7 overflow-hidden">
            {children}
          </div>
        </div>

        {/* Bottom subtle copyright / legal line — outside the card
        <div className="relative z-10 w-full max-w-120 mx-auto pt-3 sm:pt-4 text-center text-[10px] sm:text-[11px] text-ink-500/60">
          © 2026 किसानSetu Technologies Private Limited. All rights reserved.
        </div> */}
      </main>
    </div>
  );
};

