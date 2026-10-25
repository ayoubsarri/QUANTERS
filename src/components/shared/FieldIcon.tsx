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
  { key: "python", label: "Python & Coding", gradient: "from-[#182C4E] to-[#101F38]", accent: "#38BDF8", code: "PY" },
  { key: "arduino", label: "Arduino & IoT", gradient: "from-[#182C4E] to-[#101F38]", accent: "#38BDF8", code: "IO" },
  { key: "astronomy", label: "Astronomy & Space", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "AS" },
  { key: "printing", label: "3D Printing & CAD", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "3D" },
  { key: "data", label: "Data Science", gradient: "from-[#182C4E] to-[#101F38]", accent: "#38BDF8", code: "DS" },
  { key: "ai-ml", label: "AI & Neural Nets", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "AI" },
  { key: "cybersecurity", label: "Cybersecurity", gradient: "from-[#182C4E] to-[#101F38]", accent: "#38BDF8", code: "CS" },
  { key: "web-dev", label: "Web & Mobile Dev", gradient: "from-[#182C4E] to-[#101F38]", accent: "#38BDF8", code: "WD" },
  { key: "robotics", label: "Robotics & Control", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "RB" },
  { key: "quantum", label: "Quantum Physics", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "QT" },
  { key: "chemistry", label: "Chemistry & Lab", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "CH" },
  { key: "biotech", label: "Biotech & Genetics", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "BT" },
  { key: "mathematics", label: "Mathematics & Logic", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "MT" },
  { key: "ui-ux", label: "UI/UX & Graphic Design", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "UX" },
  { key: "media-photo", label: "Media & Photography", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "MD" },
  { key: "scientific-writing", label: "LaTeX & Research", gradient: "from-[#182C4E] to-[#101F38]", accent: "#38BDF8", code: "LX" },
  { key: "public-speaking", label: "Public Speaking", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "PS" },
  { key: "leadership", label: "Leadership & Mentorship", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "LD" },
  { key: "logistics", label: "Logistics & Operations", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "OP" },
  { key: "entrepreneurship", label: "Startups & Innovation", gradient: "from-[#182C4E] to-[#101F38]", accent: "#7DD3FC", code: "IN" },
  { key: "electronics", label: "Electronics & PCB", gradient: "from-[#182C4E] to-[#101F38]", accent: "#38BDF8", code: "EL" },
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

export function FieldIcon({ field, size = 26, boxed = false, className = "" }: FieldIconProps) {
  const key = resolveFieldKey(field);
  const meta = ALL_FIELD_ICONS.find((f) => f.key === key) || ALL_FIELD_ICONS[0];

  const renderSvg = () => {
    switch (key) {
      case "python":
      case "web-dev":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="3" stroke="#7DD3FC" strokeWidth="1.75" />
            <path d="M7.5 9.5L10.5 12L7.5 14.5" stroke="#FFFFFF" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.5 14.5H16.5" stroke="#38BDF8" strokeWidth="1.85" strokeLinecap="round" />
          </svg>
        );
      case "astronomy":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4.5" fill="#38BDF8" fillOpacity="0.22" stroke="#FFFFFF" strokeWidth="1.75" />
            <ellipse
              cx="12"
              cy="12"
              rx="9.5"
              ry="3.4"
              transform="rotate(-24 12 12)"
              stroke="#7DD3FC"
              strokeWidth="1.65"
            />
            <circle cx="19" cy="6" r="1.1" fill="#7DD3FC" />
          </svg>
        );
      case "arduino":
      case "electronics":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="#38BDF8" fillOpacity="0.18" stroke="#FFFFFF" strokeWidth="1.75" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="0.8" stroke="#7DD3FC" strokeWidth="1.5" />
            <path
              d="M9.5 3.5V6.5M14.5 3.5V6.5M9.5 17.5V20.5M14.5 17.5V20.5M3.5 9.5H6.5M3.5 14.5H6.5M17.5 9.5H20.5M17.5 14.5H20.5"
              stroke="#7DD3FC"
              strokeWidth="1.65"
              strokeLinecap="round"
            />
          </svg>
        );
      case "printing":
      case "logistics":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3.5L19.5 7.8V16.2L12 20.5L4.5 16.2V7.8L12 3.5Z"
              fill="#38BDF8"
              fillOpacity="0.18"
              stroke="#FFFFFF"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path d="M4.5 7.8L12 12L19.5 7.8M12 12V20.5" stroke="#7DD3FC" strokeWidth="1.65" strokeLinejoin="round" />
          </svg>
        );
      case "data":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M5 19.5V14M10 19.5V10.5M15 19.5V7M20 19.5V4.5" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" />
            <path d="M5 11.5L10 8.5L15 5.5L20 3.5" stroke="#7DD3FC" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "ai-ml":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M12 5.5L6.5 16.5H17.5L12 5.5Z" stroke="#7DD3FC" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="12" cy="5.5" r="2.1" fill="#182C4E" stroke="#FFFFFF" strokeWidth="1.7" />
            <circle cx="6.5" cy="16.5" r="2.1" fill="#182C4E" stroke="#FFFFFF" strokeWidth="1.7" />
            <circle cx="17.5" cy="16.5" r="2.1" fill="#182C4E" stroke="#FFFFFF" strokeWidth="1.7" />
            <circle cx="12" cy="12.5" r="1.4" fill="#38BDF8" />
          </svg>
        );
      case "cybersecurity":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3.5L19 6.5V12C19 16.5 16 19.8 12 21.2C8 19.8 5 16.5 5 12V6.5L12 3.5Z"
              fill="#38BDF8"
              fillOpacity="0.18"
              stroke="#FFFFFF"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path d="M9.5 12.2L11.2 13.9L14.8 10.3" stroke="#7DD3FC" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "quantum":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(35 12 12)" stroke="#FFFFFF" strokeWidth="1.65" />
            <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-35 12 12)" stroke="#7DD3FC" strokeWidth="1.65" />
            <circle cx="12" cy="12" r="2" fill="#38BDF8" />
          </svg>
        );
      case "chemistry":
      case "biotech":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M9.5 4H14.5M10.5 4V9.5L5.8 17.5C5.2 18.6 6 20 7.3 20H16.7C18 20 18.8 18.6 18.2 17.5L13.5 9.5V4"
              stroke="#FFFFFF"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M7.5 15H16.5" stroke="#7DD3FC" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        );
      case "mathematics":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M17.5 5.5H7L12.8 12L7 18.5H17.5"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="17.5" cy="12" r="1.4" fill="#7DD3FC" />
          </svg>
        );
      case "scientific-writing":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="5.5" y="3.5" width="13" height="17" rx="2" fill="#38BDF8" fillOpacity="0.16" stroke="#FFFFFF" strokeWidth="1.75" />
            <path d="M8.5 8.5H15.5M8.5 12H15.5M8.5 15.5H12.5" stroke="#7DD3FC" strokeWidth="1.65" strokeLinecap="round" />
          </svg>
        );
      case "robotics":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="5" y="8" width="14" height="11" rx="3" fill="#38BDF8" fillOpacity="0.18" stroke="#FFFFFF" strokeWidth="1.75" />
            <path d="M12 4.5V8" stroke="#7DD3FC" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="9.5" cy="13" r="1.3" fill="#7DD3FC" />
            <circle cx="14.5" cy="13" r="1.3" fill="#7DD3FC" />
          </svg>
        );
      case "ui-ux":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="#FFFFFF" strokeWidth="1.75" />
            <path d="M4 9.5H20" stroke="#7DD3FC" strokeWidth="1.6" />
            <circle cx="9" cy="14.2" r="1.8" fill="#38BDF8" />
          </svg>
        );
      case "media-photo":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="4" y="7" width="16" height="12" rx="2.5" fill="#38BDF8" fillOpacity="0.16" stroke="#FFFFFF" strokeWidth="1.75" />
            <circle cx="12" cy="13" r="3" stroke="#7DD3FC" strokeWidth="1.75" />
            <path d="M9 7L10.2 5H13.8L15 7" stroke="#FFFFFF" strokeWidth="1.65" strokeLinecap="round" />
          </svg>
        );
      case "public-speaking":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="9" y="4" width="6" height="10" rx="3" fill="#38BDF8" fillOpacity="0.2" stroke="#FFFFFF" strokeWidth="1.75" />
            <path d="M6.5 11.5C6.5 14.5 9 17 12 17C15 17 17.5 14.5 17.5 11.5M12 17V20" stroke="#7DD3FC" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        );
      case "leadership":
      case "entrepreneurship":
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3.5L14.4 9.6L20.5 12L14.4 14.4L12 20.5L9.6 14.4L3.5 12L9.6 9.6L12 3.5Z"
              fill="#38BDF8"
              fillOpacity="0.22"
              stroke="#FFFFFF"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="1.6" fill="#7DD3FC" />
          </svg>
        );
    }
  };

  if (!boxed) {
    return (
      <span className={`inline-flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${className}`}>
        {renderSvg()}
      </span>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-b ${meta.gradient} border border-[#2B4875]/60 shadow-[0_4px_12px_rgba(16,31,56,0.15),inset_0_1px_0_rgba(255,255,255,0.14)] shrink-0 overflow-hidden group ${className}`}
      style={{ width: size + 18, height: size + 18 }}
    >
      <div className="relative z-10 transition-transform duration-200 group-hover:scale-105">
        {renderSvg()}
      </div>
    </div>
  );
}
