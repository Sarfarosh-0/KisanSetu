import React from "react";
import { Sprout, ShoppingBag } from "lucide-react";
import { UserRole } from "../../types/auth";

interface RoleSelectorProps {
  role: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  lang?: "en" | "hi";
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  role,
  onChange,
  disabled = false,
  lang = "en"
}) => {
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-xs font-bold text-ink-950 uppercase tracking-wider">
        {lang === "hi" ? "1. अपनी भूमिका चुनें (Select Role)" : "1. Select Your Role"}
      </label>

      <div
        role="tablist"
        aria-label="Account Role Selection"
        className="grid grid-cols-2 gap-2 bg-earth-100/60 p-1.5 rounded-2xl border-2 border-surface-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={role === "farmer"}
          disabled={disabled}
          onClick={() => onChange("farmer")}
          className={`min-h-14 px-3 py-2 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm sm:text-base transition-all cursor-pointer border-2 ${role === "farmer"
            ? "bg-brand-600 text-white border-brand-700 shadow-md scale-[1.02]"
            : "bg-white text-ink-700 border-transparent hover:bg-earth-50"
            }`}
        >
          <span className="text-xl" aria-hidden="true"><Sprout /></span>
          <div className="text-left leading-tight">
            <div>{lang === "hi" ? "किसान" : "Farmer"}</div>
            <div className="text-[10px] opacity-80 font-normal">FPO / Producer</div>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={role === "buyer"}
          disabled={disabled}
          onClick={() => onChange("buyer")}
          className={`min-h-14 px-3 py-2 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm sm:text-base transition-all cursor-pointer border-2 ${role === "buyer"
            ? "bg-brand-600 text-white border-brand-700 shadow-md scale-[1.02]"
            : "bg-white text-ink-700 border-transparent hover:bg-earth-50"
            }`}
        >
          <span className="text-xl" aria-hidden="true"><ShoppingBag /></span>
          <div className="text-left leading-tight">
            <div>{lang === "hi" ? "खरीददार" : "Buyer"}</div>
            <div className="text-[10px] opacity-80 font-normal">Trader / Business</div>
          </div>
        </button>
      </div>
    </div>
  );
};