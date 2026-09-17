import React from "react";
import {
  Home,
  ShoppingBag,
  Users,
  Mail,
  Tractor,
  Handshake,
  ClipboardList,
  Headphones,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Sprout,
  Leaf,
  Wheat,
  Trees
} from "lucide-react";
import type { UserRole } from "../types";
import { t } from "../i18n";

export interface FooterProps {
  onSelectTab?: (tab: string) => void;
  onSelectUserRole?: (role: UserRole) => void;
  onOpenPolicy?: (policy: "terms" | "escrow" | "pricing") => void;
  onOpenApiDocs?: () => void;
  currentRole?: UserRole;
  lang?: "en" | "hi";
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onSelectUserRole,
  lang = "hi"
}) => {
  const handleNavigate = (tab: string, role?: UserRole) => {
    if (role && onSelectUserRole) {
      onSelectUserRole(role);
    }
    if (onSelectTab) {
      onSelectTab(tab);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="app-footer"
      className="relative bg-[#06241B] text-[#D1E3DA] overflow-hidden border-t border-[#0C382B] selection:bg-[#4ADE80] selection:text-[#06241B]"
      aria-label="Site Footer"
    >
      {/* Background Farm Landscape Icons (Replacing SVG Silhouette) */}
      <div
        className="absolute right-4 bottom-2 pointer-events-none select-none opacity-15 flex items-end gap-3 text-[#4ADE80]"
        aria-hidden="true"
      >
        <Trees className="w-20 h-20 sm:w-28 sm:h-28 stroke-[1.2]" />
        <Wheat className="w-16 h-16 sm:w-24 sm:h-24 stroke-[1.2] -ml-4" />
        <Sprout className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.2] -ml-2" />
      </div>

      {/* Main Footer Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Column 1: Brand & Socials */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3.5 lg:pr-6 lg:border-r lg:border-[#0E4233]">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-[#0F6A53] to-[#0B5745] flex items-center justify-center text-white shadow-xs border border-emerald-500/20 shrink-0">
                  <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.2} aria-hidden="true" />
                </div>

                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans leading-none">
                  किसान<span className="text-[#4ADE80]">Setu</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#B7D1C5] leading-relaxed max-w-sm font-normal">
                {t("footer.mission", lang)}
              </p>
            </div>

            <div className="pt-1 flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#0B3B2D] hover:bg-[#4ADE80] text-white hover:text-[#06241B] flex items-center justify-center transition-all duration-200 shadow-xs border border-[#144F3D] hover:border-[#4ADE80] group"
                aria-label={lang === "hi" ? "किसानSetu फेसबुक पर" : "किसानSetu on Facebook"}
              >
                <Facebook className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#0B3B2D] hover:bg-[#4ADE80] text-white hover:text-[#06241B] flex items-center justify-center transition-all duration-200 shadow-xs border border-[#144F3D] hover:border-[#4ADE80] group"
                aria-label={lang === "hi" ? "किसानSetu ट्विटर पर" : "किसानSetu on Twitter"}
              >
                <Twitter className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#0B3B2D] hover:bg-[#4ADE80] text-white hover:text-[#06241B] flex items-center justify-center transition-all duration-200 shadow-xs border border-[#144F3D] hover:border-[#4ADE80] group"
                aria-label={lang === "hi" ? "किसानSetu इंस्टाग्राम पर" : "किसानSetu on Instagram"}
              >
                <Instagram className="w-3.5 h-3.5 transition-transform group-hover:scale-110" strokeWidth={2.2} />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#0B3B2D] hover:bg-[#4ADE80] text-white hover:text-[#06241B] flex items-center justify-center transition-all duration-200 shadow-xs border border-[#144F3D] hover:border-[#4ADE80] group"
                aria-label={lang === "hi" ? "किसानSetu लिंक्डइन पर" : "किसानSetu on LinkedIn"}
              >
                <Linkedin className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 xl:col-span-2 space-y-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t("footer.quickLinks", lang)}
              </h3>
              <div className="w-7 h-0.5 bg-[#4ADE80] rounded-full mt-1.5" />
            </div>

            <ul className="space-y-2 pt-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate("inventory")}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-[#C4DDD2] hover:text-[#4ADE80] transition-colors cursor-pointer group text-left"
                >
                  <Home className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.home", lang)}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate("marketplace", "BUYER")}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-[#C4DDD2] hover:text-[#4ADE80] transition-colors cursor-pointer group text-left"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.products", lang)}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate("pricing_ai")}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-[#C4DDD2] hover:text-[#4ADE80] transition-colors cursor-pointer group text-left"
                >
                  <Users className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.aboutUs", lang)}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate("logistics")}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-[#C4DDD2] hover:text-[#4ADE80] transition-colors cursor-pointer group text-left"
                >
                  <Mail className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.contactUs", lang)}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: For Farmers */}
          <div className="lg:col-span-3 space-y-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t("footer.forFarmers", lang)}
              </h3>
              <div className="w-7 h-0.5 bg-[#4ADE80] rounded-full mt-1.5" />
            </div>

            <ul className="space-y-2 pt-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate("inventory", "FARMER")}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-[#C4DDD2] hover:text-[#4ADE80] transition-colors cursor-pointer group text-left"
                >
                  <Tractor className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.sellProducts", lang)}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate("buyer_requests", "FARMER")}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-[#C4DDD2] hover:text-[#4ADE80] transition-colors cursor-pointer group text-left"
                >
                  <Handshake className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.findBuyers", lang)}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate("contracts")}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-[#C4DDD2] hover:text-[#4ADE80] transition-colors cursor-pointer group text-left"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.trackOrders", lang)}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate("payouts", "FARMER")}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-[#C4DDD2] hover:text-[#4ADE80] transition-colors cursor-pointer group text-left"
                >
                  <Headphones className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.support", lang)}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="lg:col-span-3 space-y-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t("footer.contact", lang)}
              </h3>
              <div className="w-7 h-0.5 bg-[#4ADE80] rounded-full mt-1.5" />
            </div>

            <ul className="space-y-2 pt-0.5 text-xs sm:text-sm text-[#C4DDD2]">
              <li>
                <a
                  href="mailto:info@kisansetu.in"
                  className="flex items-center gap-2.5 hover:text-[#4ADE80] transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span className="truncate">info@kisansetu.in</span>
                </a>
              </li>

              <li>
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2.5 hover:text-[#4ADE80] transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 text-[#4ADE80] group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.8} />
                  <span>+91 98765 43210</span>
                </a>
              </li>

              <li>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.india", lang)}</span>
                </div>
              </li>

              <li>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" strokeWidth={1.8} />
                  <span>{t("footer.workingHours", lang)}</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright with Lucide Leaf Icons */}
        <div className="mt-5 pt-3.5 border-t border-[#0E4233] flex items-center justify-center">
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#C4DDD2] font-medium text-center">
            <Leaf className="w-4 h-4 text-[#4ADE80] shrink-0" strokeWidth={2} />
            <span>{t("footer.copyright", lang)}</span>
            <Leaf className="w-4 h-4 text-[#4ADE80] shrink-0 -scale-x-100" strokeWidth={2} />
          </div>
        </div>

      </div>
    </footer>
  );
};