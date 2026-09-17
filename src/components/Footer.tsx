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
      className="relative bg-[#084738] text-[#D1E3DA] overflow-hidden border-t border-[#0C382B] selection:bg-[#4ADE80] selection:text-[#06241B]"
      aria-label="Site Footer"
    >
      {/* Background Farm Landscape Icons (Replacing SVG Silhouette) */}
      <div
        className="absolute right-0 bottom-0 pointer-events-none select-none overflow-hidden opacity-25 lg:opacity-35 w-[320px] sm:w-105 md:w-125 h-35 sm:h-42"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 600 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover object-bottom"
        >

          <path
            d="M160 220C240 180 340 160 460 175C530 185 575 200 600 220H160Z"
            fill="#0B3E2F"
            opacity="0.6"
          />
          <path
            d="M0 220C120 160 280 140 430 150C520 156 570 180 600 200V220H0Z"
            fill="#093527"
            opacity="0.7"
          />

          {/* Contour Lines / Furrows */}
          <path
            d="M200 220C310 185 410 178 600 190"
            stroke="#216D54"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M250 220C350 192 460 185 600 205"
            stroke="#216D54"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M320 220C400 200 500 195 600 215"
            stroke="#216D54"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Tree Cluster 1 (Left Hill) */}
          <circle cx="210" cy="182" r="14" fill="#0C4534" />
          <circle cx="222" cy="178" r="11" fill="#0E4F3C" />
          <circle cx="202" cy="180" r="10" fill="#0E4F3C" />
          <rect x="210" y="188" width="3" height="12" fill="#072A1F" />

          {/* Barn House & Silo Silhouette */}
          <g transform="translate(415, 125)" fill="#0E4F3C">
            {/* Silo */}
            <rect x="42" y="18" width="14" height="38" rx="2" fill="#105742" />
            <path d="M42 18C42 10 56 10 56 18H42Z" fill="#13664E" />
            {/* Main Barn */}
            <path d="M0 24L20 8L40 24V56H0V24Z" fill="#105742" />
            {/* Barn Roof line */}
            <path d="M-2 25L20 7L42 25" stroke="#258265" strokeWidth="2" fill="none" />
            {/* Barn Door */}
            <rect x="13" y="36" width="14" height="20" rx="1" fill="#06241B" />
            <line x1="13" y1="36" x2="27" y2="56" stroke="#105742" strokeWidth="1" />
            <line x1="27" y1="36" x2="13" y2="56" stroke="#105742" strokeWidth="1" />
            {/* Barn Window */}
            <rect x="16" y="18" width="8" height="8" rx="1" fill="#06241B" />
          </g>

          {/* Windmill Silhouette */}
          <g transform="translate(485, 120)" stroke="#1B6951" strokeWidth="1.5">
            {/* Tower */}
            <line x1="10" y1="20" x2="4" y2="58" />
            <line x1="10" y1="20" x2="16" y2="58" />
            <line x1="6" y1="32" x2="14" y2="32" />
            <line x1="5" y1="44" x2="15" y2="44" />
            {/* Hub & Blades */}
            <circle cx="10" cy="18" r="2" fill="#28896B" stroke="none" />
            <line x1="10" y1="18" x2="10" y2="4" />
            <line x1="10" y1="18" x2="22" y2="12" />
            <line x1="10" y1="18" x2="18" y2="28" />
            <line x1="10" y1="18" x2="2" y2="26" />
            <line x1="10" y1="18" x2="0" y2="10" />
          </g>

          {/* Majestic Large Oak Tree (Right) */}
          <g transform="translate(525, 115)">
            <rect x="22" y="45" width="6" height="30" fill="#082A20" />
            <circle cx="25" cy="35" r="24" fill="#0D4635" />
            <circle cx="15" cy="30" r="18" fill="#105440" />
            <circle cx="35" cy="28" r="19" fill="#13634C" />
            <circle cx="26" cy="16" r="16" fill="#18775B" />
          </g>

          {/* Small Bush Trees */}
          <circle cx="380" cy="172" r="9" fill="#0C4534" />
          <circle cx="392" cy="170" r="12" fill="#0F523E" />
          <circle cx="475" cy="174" r="8" fill="#0C4534" />
        </svg>
      </div >

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


          {/* Column 2: For Farmers */}
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
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright with Lucide Leaf Icons */}
        <div className="mt-5 pt-3.5 border-t border-[#0E4233] flex items-center justify-center">
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#C4DDD2] font-medium text-center">
            <Leaf className="w-4 h-4 text-[#4ADE80] shrink-0" strokeWidth={2} />
            <span>{t("footer.copyright", lang)}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};