"use client";

import React from "react";
import { FieldIconKey } from "@/lib/types/erp";

export const ALL_FIELD_ICONS: {
  key: FieldIconKey;
  label: string;
  gradient: string;
  accent: string;
  code: string;
}[] = [
  { key: "python", label: "Python & Coding", gradient: "from-[#050D1E] to-[#0B1E3D]", accent: "#38E4FF", code: "PY" },
  { key: "arduino", label: "Arduino & IoT", gradient: "from-[#041614] to-[#082F29]", accent: "#34D399", code: "IO" },
  { key: "astronomy", label: "Astronomy & Space", gradient: "from-[#040917] to-[#0D1E42]", accent: "#38E4FF", code: "AS" },
  { key: "printing", label: "3D Printing & CAD", gradient: "from-[#071124] to-[#11264D]", accent: "#60A5FA", code: "3D" },
  { key: "data", label: "Data Science", gradient: "from-[#050E20] to-[#0C244A]", accent: "#38BDF8", code: "DS" },
  { key: "ai-ml", label: "AI & Neural Nets", gradient: "from-[#0B0924] to-[#1E174C]", accent: "#A78BFA", code: "AI" },
  { key: "cybersecurity", label: "Cybersecurity", gradient: "from-[#041512] to-[#063227]", accent: "#34D399", code: "CS" },
  { key: "web-dev", label: "Web & Mobile Dev", gradient: "from-[#051224] to-[#09294E]", accent: "#38E4FF", code: "WD" },
  { key: "robotics", label: "Robotics & Control", gradient: "from-[#090B24] to-[#191D52]", accent: "#818CF8", code: "RB" },
  { key: "quantum", label: "Quantum Physics", gradient: "from-[#030917] to-[#092349]", accent: "#38E4FF", code: "QT" },
  { key: "chemistry", label: "Chemistry & Lab", gradient: "from-[#041613] to-[#08332A]", accent: "#34D399", code: "CH" },
  { key: "biotech", label: "Biotech & Genetics", gradient: "from-[#041718] to-[#0A3538]", accent: "#2DD4BF", code: "BT" },
  { key: "mathematics", label: "Mathematics & Logic", gradient: "from-[#061024] to-[#102652]", accent: "#60A5FA", code: "MT" },
  { key: "ui-ux", label: "UI/UX & Graphic Design", gradient: "from-[#110926] to-[#261454]", accent: "#C084FC", code: "UX" },
  { key: "media-photo", label: "Media & Photography", gradient: "from-[#1A0D06] to-[#3B1D0E]", accent: "#FB923C", code: "MD" },
  { key: "scientific-writing", label: "LaTeX & Research", gradient: "from-[#050C1A] to-[#11223E]", accent: "#38E4FF", code: "LX" },
  { key: "public-speaking", label: "Public Speaking", gradient: "from-[#1A1205] to-[#38270B]", accent: "#FBBF24", code: "PS" },
  { key: "leadership", label: "Leadership & Mentorship", gradient: "from-[#191305] to-[#36280A]", accent: "#FACC15", code: "LD" },
  { key: "logistics", label: "Logistics & Operations", gradient: "from-[#070E1B] to-[#16233B]", accent: "#94A3B8", code: "OP" },
  { key: "entrepreneurship", label: "Startups & Innovation", gradient: "from-[#191005] to-[#38230A]", accent: "#FBBF24", code: "IN" },
  { key: "electronics", label: "Electronics & PCB", gradient: "from-[#041512] to-[#073026]", accent: "#34D399", code: "EL" },
];

export function resolveFieldKey(raw?: string): FieldIconKey {
  if (!raw) return "python";
  const r = raw.toLowerCase();
  if (r.includes("astro") || r.includes("telescope") || r.includes("space")) return "astronomy";
  if (r.includes("python") || r.includes("code2") || r.includes("coding")) return "python";
  if (r.includes("arduino") || r.includes("iot")) return "arduino";
  if (r.includes("3d") || r.includes("print")) return "printing";
  if (r.includes("data") || r.includes("chart")) return "data";
  if (r.includes("ai") || r.includes("neural") || r.includes("brain")) return "ai-ml";
  if (r.includes("cyber") || r.includes("shield") || r.includes("sec")) return "cybersecurity";
  if (r.includes("web") || r.includes("app")) return "web-dev";
  if (r.includes("robot") || r.includes("bot")) return "robotics";
  if (r.includes("quantum") || r.includes("orbit") || r.includes("atom")) return "quantum";
  if (r.includes("chem") || r.includes("safety") || r.includes("flask") || r.includes("lab")) return "chemistry";
  if (r.includes("bio") || r.includes("dna") || r.includes("gene")) return "biotech";
  if (r.includes("math") || r.includes("sigma")) return "mathematics";
  if (r.includes("ui") || r.includes("ux") || r.includes("design")) return "ui-ux";
  if (r.includes("media") || r.includes("photo") || r.includes("camera")) return "media-photo";
  if (r.includes("latex") || r.includes("research") || r.includes("writ") || r.includes("comm") || r.includes("message"))
    return "scientific-writing";
  if (r.includes("speak") || r.includes("mic") || r.includes("pitch")) return "public-speaking";
  if (r.includes("lead") || r.includes("award") || r.includes("team") || r.includes("user")) return "leadership";
  if (r.includes("logist") || r.includes("pack")) return "logistics";
  if (r.includes("innov") || r.includes("light") || r.includes("start")) return "entrepreneurship";
  if (r.includes("elec") || r.includes("cpu") || r.includes("chip")) return "electronics";
  return "python";
}

interface FieldIconProps {
  field: FieldIconKey | string;
  size?: number;
  boxed?: boolean;
  className?: string;
}

export function FieldIcon({ field, size = 28, boxed = false, className = "" }: FieldIconProps) {
  const key = resolveFieldKey(field);
  const meta = ALL_FIELD_ICONS.find((f) => f.key === key) || ALL_FIELD_ICONS[0];

  const renderSvg = () => {
    switch (key) {
      case "python":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            {/* Precision Terminal Brackets + Dual Interlocking Python Paths */}
            <path d="M5 9L2.5 16L5 23" stroke="#38E4FF" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M27 9L29.5 16L27 23" stroke="#FACC15" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
            <path
              d="M15.8 4.5C11.4 4.5 11.6 6.4 11.6 6.4V8.8H16.2V9.8H9.8C9.8 9.8 6.5 9.4 6.5 14.1C6.5 18.8 9.4 18.5 9.4 18.5H11.2V16.1C11.2 16.1 11.1 13.2 14.1 13.2H19.1C19.1 13.2 21.8 13.2 21.8 10.6V6.9C21.8 6.9 22.2 4.5 15.8 4.5Z"
              fill="#38E4FF"
              fillOpacity="0.2"
              stroke="#38E4FF"
              strokeWidth="1.5"
            />
            <path
              d="M16.2 27.5C20.6 27.5 20.4 25.6 20.4 25.6V23.2H15.8V22.2H22.2C22.2 22.2 25.5 22.6 25.5 17.9C25.5 13.2 22.6 13.5 22.6 13.5H20.8V15.9C20.8 15.9 20.9 18.8 17.9 18.8H12.9C12.9 18.8 10.2 18.8 10.2 21.4V25.1C10.2 25.1 9.8 27.5 16.2 27.5Z"
              fill="#FACC15"
              fillOpacity="0.22"
              stroke="#FACC15"
              strokeWidth="1.5"
            />
            <circle cx="13.8" cy="7.2" r="1.15" fill="#FFFFFF" />
            <circle cx="18.2" cy="24.8" r="1.15" fill="#FACC15" />
          </svg>
        );
      case "astronomy":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="11" stroke="#38E4FF" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="16" cy="16" r="5.5" fill="#38E4FF" fillOpacity="0.25" stroke="#38E4FF" strokeWidth="1.6" />
            <ellipse
              cx="16"
              cy="16"
              rx="13.2"
              ry="4.4"
              transform="rotate(-26 16 16)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <circle cx="16" cy="16" r="2.2" fill="#FFE500" />
            <circle cx="25.5" cy="7.5" r="1.5" fill="#38E4FF" />
            <circle cx="6.5" cy="23.5" r="1.2" fill="#FFFFFF" />
          </svg>
        );
      case "arduino":
      case "electronics":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="8.5" y="8.5" width="15" height="15" rx="2.5" fill="#34D399" fillOpacity="0.16" stroke="#34D399" strokeWidth="1.6" />
            <rect x="12.5" y="12.5" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="1.4" />
            <circle cx="16" cy="16" r="1.5" fill="#38E4FF" />
            <path
              d="M11.5 4.5V8.5M16 4.5V8.5M20.5 4.5V8.5M11.5 23.5V27.5M16 23.5V27.5M20.5 23.5V27.5M4.5 11.5H8.5M4.5 16H8.5M4.5 20.5H8.5M23.5 11.5H27.5M23.5 16H27.5M23.5 20.5H27.5"
              stroke="#6EE7B7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );
      case "printing":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path
              d="M16 4.5L26 10.2V21.8L16 27.5L6 21.8V10.2L16 4.5Z"
              fill="#38E4FF"
              fillOpacity="0.14"
              stroke="#60A5FA"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M16 4.5V16M16 16L26 10.2M16 16L6 10.2M16 16V27.5" stroke="#38E4FF" strokeWidth="1.4" />
            <circle cx="16" cy="16" r="2.3" fill="#FFE500" />
            <circle cx="16" cy="4.5" r="1.3" fill="#FFFFFF" />
          </svg>
        );
      case "data":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path d="M5 26.5H27" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" />
            <rect x="7" y="17.5" width="4" height="9" rx="1" fill="#38E4FF" fillOpacity="0.3" stroke="#38E4FF" strokeWidth="1.4" />
            <rect x="14" y="12.5" width="4" height="14" rx="1" fill="#38E4FF" fillOpacity="0.55" stroke="#38E4FF" strokeWidth="1.4" />
            <rect x="21" y="7.5" width="4" height="19" rx="1" fill="#FFE500" fillOpacity="0.85" />
            <path d="M7.5 13L15.5 8.5L23 5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="23" cy="5" r="1.8" fill="#38E4FF" />
          </svg>
        );
      case "ai-ml":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <polygon
              points="16,5 26,10.5 26,21.5 16,27 6,21.5 6,10.5"
              stroke="#A78BFA"
              strokeOpacity="0.45"
              strokeWidth="1.3"
              fill="#A78BFA"
              fillOpacity="0.1"
            />
            <path d="M9 11L16 6.5L23 11M9 21L16 25.5L23 21M9 11L23 21M23 11L9 21M16 6.5V25.5" stroke="#C4B5FD" strokeWidth="1.3" strokeOpacity="0.75" />
            <circle cx="16" cy="6.5" r="2.1" fill="#38E4FF" />
            <circle cx="9" cy="11" r="2" fill="#FFFFFF" />
            <circle cx="23" cy="11" r="2" fill="#FFFFFF" />
            <circle cx="16" cy="16" r="3" fill="#FFE500" />
            <circle cx="9" cy="21" r="2" fill="#C4B5FD" />
            <circle cx="23" cy="21" r="2" fill="#C4B5FD" />
            <circle cx="16" cy="25.5" r="2.1" fill="#38E4FF" />
          </svg>
        );
      case "cybersecurity":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path
              d="M16 4.5L25 8.2V15.5C25 21.3 21.2 25.9 16 27.8C10.8 25.9 7 21.3 7 15.5V8.2L16 4.5Z"
              fill="#34D399"
              fillOpacity="0.16"
              stroke="#34D399"
              strokeWidth="1.6"
            />
            <rect x="12.5" y="14.5" width="7" height="5.8" rx="1.2" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M14 14.5V12.5C14 11.4 14.9 10.5 16 10.5C17.1 10.5 18 11.4 18 12.5V14.5" stroke="#38E4FF" strokeWidth="1.5" />
            <circle cx="16" cy="17.4" r="1.1" fill="#FFE500" />
          </svg>
        );
      case "quantum":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <ellipse cx="16" cy="16" rx="12.5" ry="4.6" transform="rotate(-30 16 16)" stroke="#38E4FF" strokeWidth="1.5" />
            <ellipse cx="16" cy="16" rx="12.5" ry="4.6" transform="rotate(30 16 16)" stroke="#60A5FA" strokeWidth="1.5" />
            <ellipse cx="16" cy="16" rx="12.5" ry="4.6" transform="rotate(90 16 16)" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.3" />
            <circle cx="16" cy="16" r="2.6" fill="#FFE500" />
            <circle cx="25" cy="11" r="1.4" fill="#38E4FF" />
          </svg>
        );
      case "chemistry":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path
              d="M12.5 5H19.5M14 5V11.8L8.2 22.8C7.5 24.2 8.5 26 10.2 26H21.8C23.5 26 24.5 24.2 23.8 22.8L18 11.8V5"
              stroke="#34D399"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M10.2 19.5H21.8L23.2 22.8C23.6 23.8 22.9 24.8 21.8 24.8H10.2C9.1 24.8 8.4 23.8 8.8 22.8L10.2 19.5Z" fill="#34D399" fillOpacity="0.35" />
            <circle cx="14.5" cy="21.5" r="1.3" fill="#FFFFFF" />
            <circle cx="18" cy="17" r="1.1" fill="#38E4FF" />
          </svg>
        );
      case "biotech":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path d="M10 5C10 12 22 12 22 19C22 23 18 26 10 27" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M22 5C22 12 10 12 10 19C10 23 14 26 22 27" stroke="#38E4FF" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 9H20M13 16H19M12 23H20" stroke="#FFE500" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        );
      case "scientific-writing":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="7.5" y="5" width="17" height="22" rx="2" fill="#38E4FF" fillOpacity="0.14" stroke="#38E4FF" strokeWidth="1.6" />
            <path d="M11 10.5H21M11 15H21M11 19.5H16" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="20.5" cy="20.5" r="2.2" fill="#FFE500" />
          </svg>
        );
      case "leadership":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path
              d="M16 4.5L19.1 10.9L26.2 12L21.1 16.9L22.3 24L16 20.6L9.7 24L10.9 16.9L5.8 12L12.9 10.9L16 4.5Z"
              fill="#FACC15"
              fillOpacity="0.25"
              stroke="#FFE500"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="15" r="2" fill="#FFFFFF" />
          </svg>
        );
      case "robotics":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="7" y="10.5" width="18" height="13.5" rx="2.5" fill="#818CF8" fillOpacity="0.2" stroke="#A5B4FC" strokeWidth="1.6" />
            <circle cx="12.5" cy="16.5" r="1.8" fill="#38E4FF" />
            <circle cx="19.5" cy="16.5" r="1.8" fill="#38E4FF" />
            <path d="M16 5.5V10.5M13 21H19" stroke="#FFE500" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="16" cy="5.5" r="1.6" fill="#FFE500" />
          </svg>
        );
      case "ui-ux":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="5.5" y="6.5" width="21" height="15.5" rx="2" stroke="#C4B5FD" strokeWidth="1.6" />
            <circle cx="12" cy="14.2" r="2.8" fill="#38E4FF" fillOpacity="0.35" stroke="#38E4FF" strokeWidth="1.4" />
            <path d="M17.5 11.5H23M17.5 15.5H21" stroke="#FFE500" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M12 25.5H20" stroke="#C4B5FD" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        );
      case "media-photo":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="5.5" y="9.5" width="21" height="15" rx="2.5" fill="#FB923C" fillOpacity="0.18" stroke="#FDBA74" strokeWidth="1.6" />
            <circle cx="16" cy="17" r="4.2" stroke="#38E4FF" strokeWidth="1.8" />
            <circle cx="16" cy="17" r="1.5" fill="#FFE500" />
            <path d="M11.5 9.5L13 7H19L20.5 9.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="9.5" stroke="#38E4FF" strokeWidth="1.6" />
            <path d="M16 10.5V16L19.8 18.8" stroke="#FFE500" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
    }
  };

  if (!boxed) {
    return (
      <span className={`inline-flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${className}`}>
        {renderSvg()}
      </span>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} border border-slate-800/90 shadow-[0_8px_20px_rgba(3,8,18,0.22),inset_0_1px_0_rgba(255,255,255,0.14)] shrink-0 overflow-hidden group ${className}`}
      style={{ width: size + 20, height: size + 20 }}
    >
      {/* Precision Architectural Corner Ticks */}
      <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#38E4FF]/45 pointer-events-none" />
      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#38E4FF]/45 pointer-events-none" />
      <div
        className="absolute -top-3 -right-3 w-8 h-8 rounded-full opacity-30 blur-xs pointer-events-none"
        style={{ background: meta.accent }}
      />
      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
        {renderSvg()}
      </div>
    </div>
  );
}
