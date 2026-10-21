"use client";

import React from "react";
import { FieldIconKey } from "@/lib/types/erp";

export const ALL_FIELD_ICONS: {
  key: FieldIconKey;
  label: string;
  gradient: string;
  accent: string;
}[] = [
  { key: "python", label: "Python & Coding", gradient: "from-[#0B2E59] to-[#1D63EB]", accent: "#FACC15" },
  { key: "arduino", label: "Arduino & IoT", gradient: "from-[#064E3B] to-[#0D9488]", accent: "#34D399" },
  { key: "astronomy", label: "Astronomy & Space", gradient: "from-[#091E3A] to-[#1E3A8A]", accent: "#38E4FF" },
  { key: "printing", label: "3D Printing & CAD", gradient: "from-[#1E293B] to-[#3B82F6]", accent: "#60A5FA" },
  { key: "data", label: "Data Science", gradient: "from-[#0F172A] to-[#2563EB]", accent: "#38BDF8" },
  { key: "ai-ml", label: "AI & Neural Nets", gradient: "from-[#1E1B4B] to-[#4F46E5]", accent: "#A78BFA" },
  { key: "cybersecurity", label: "Cybersecurity", gradient: "from-[#062E22] to-[#059669]", accent: "#6EE7B7" },
  { key: "web-dev", label: "Web & Mobile Dev", gradient: "from-[#0C4A6E] to-[#0284C7]", accent: "#7DD3FC" },
  { key: "robotics", label: "Robotics & Control", gradient: "from-[#312E81] to-[#6366F1]", accent: "#C4B5FD" },
  { key: "quantum", label: "Quantum Physics", gradient: "from-[#06182C] to-[#0369A1]", accent: "#38E4FF" },
  { key: "chemistry", label: "Chemistry & Lab", gradient: "from-[#064E3B] to-[#10B981]", accent: "#A7F3D0" },
  { key: "biotech", label: "Biotech & Genetics", gradient: "from-[#134E4A] to-[#14B8A6]", accent: "#5EEAD4" },
  { key: "mathematics", label: "Mathematics & Logic", gradient: "from-[#1E3A8A] to-[#3B82F6]", accent: "#93C5FD" },
  { key: "ui-ux", label: "UI/UX & Graphic Design", gradient: "from-[#4C1D95] to-[#7C3AED]", accent: "#DDD6FE" },
  { key: "media-photo", label: "Media & Photography", gradient: "from-[#7C2D12] to-[#EA580C]", accent: "#FDBA74" },
  { key: "scientific-writing", label: "LaTeX & Research", gradient: "from-[#0F172A] to-[#334155]", accent: "#38E4FF" },
  { key: "public-speaking", label: "Public Speaking", gradient: "from-[#78350F] to-[#D97706]", accent: "#FDE68A" },
  { key: "leadership", label: "Leadership & Mentorship", gradient: "from-[#713F12] to-[#EAB308]", accent: "#FEF08A" },
  { key: "logistics", label: "Logistics & Operations", gradient: "from-[#1E293B] to-[#475569]", accent: "#94A3B8" },
  { key: "entrepreneurship", label: "Startups & Innovation", gradient: "from-[#7C2D12] to-[#F59E0B]", accent: "#FDE047" },
  { key: "electronics", label: "Electronics & PCB", gradient: "from-[#064E3B] to-[#047857]", accent: "#6EE7B7" },
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
            <path
              d="M15.8 4C11.2 4 11.5 6 11.5 6V8.5H16V9.5H9.5C9.5 9.5 6 9.1 6 14C6 18.9 9.1 18.7 9.1 18.7H11V16.2C11 16.2 10.9 13.1 14 13.1H19.2C19.2 13.1 22 13.1 22 10.4V6.6C22 6.6 22.4 4 15.8 4Z"
              fill="#38BDF8"
            />
            <path
              d="M16.2 28C20.8 28 20.5 26 20.5 26V23.5H16V22.5H22.5C22.5 22.5 26 22.9 26 18C26 13.1 22.9 13.3 22.9 13.3H21V15.8C21 15.8 21.1 18.9 18 18.9H12.8C12.8 18.9 10 18.9 10 21.6V25.4C10 25.4 9.6 28 16.2 28Z"
              fill="#FACC15"
            />
            <circle cx="13.5" cy="6.6" r="1.1" fill="#06182C" />
            <circle cx="18.5" cy="25.4" r="1.1" fill="#06182C" />
          </svg>
        );
      case "astronomy":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="6.5" fill="#38E4FF" fillOpacity="0.9" />
            <ellipse
              cx="16"
              cy="16"
              rx="13"
              ry="4.8"
              transform="rotate(-24 16 16)"
              stroke="#FACC15"
              strokeWidth="2.2"
            />
            <circle cx="25" cy="7" r="1.6" fill="#FFFFFF" />
            <circle cx="7" cy="23" r="1.2" fill="#38E4FF" />
          </svg>
        );
      case "arduino":
      case "electronics":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="8" y="8" width="16" height="16" rx="3.5" fill="#10B981" fillOpacity="0.22" stroke="#34D399" strokeWidth="2" />
            <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#34D399" />
            <path d="M11 4V8M16 4V8M21 4V8M11 24V28M16 24V28M21 24V28M4 11H8M4 16H8M4 21H8M24 11H28M24 16H28M24 21H28" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "printing":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path d="M16 5L26 10.5V21.5L16 27L6 21.5V10.5L16 5Z" fill="#3B82F6" fillOpacity="0.25" stroke="#60A5FA" strokeWidth="2" />
            <path d="M16 5V16M16 16L26 10.5M16 16L6 10.5M16 16V27" stroke="#38E4FF" strokeWidth="1.8" />
            <circle cx="16" cy="16" r="2.5" fill="#FACC15" />
          </svg>
        );
      case "data":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="6" y="17" width="4.5" height="9" rx="1.5" fill="#60A5FA" />
            <rect x="13.5" y="12" width="4.5" height="14" rx="1.5" fill="#38E4FF" />
            <rect x="21" y="7" width="4.5" height="19" rx="1.5" fill="#FACC15" />
            <path d="M7 13L15 8L23 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <circle cx="23" cy="5" r="2" fill="#38E4FF" />
          </svg>
        );
      case "ai-ml":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path d="M9 10L16 6L23 10M9 22L16 26L23 22M9 10L23 22M23 10L9 22M16 6V26" stroke="#A78BFA" strokeWidth="1.8" strokeOpacity="0.8" />
            <circle cx="16" cy="6" r="2.6" fill="#38E4FF" />
            <circle cx="9" cy="10" r="2.6" fill="#C4B5FD" />
            <circle cx="23" cy="10" r="2.6" fill="#C4B5FD" />
            <circle cx="16" cy="16" r="3.4" fill="#FACC15" />
            <circle cx="9" cy="22" r="2.6" fill="#C4B5FD" />
            <circle cx="23" cy="22" r="2.6" fill="#C4B5FD" />
            <circle cx="16" cy="26" r="2.6" fill="#38E4FF" />
          </svg>
        );
      case "cybersecurity":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path d="M16 4L25 8V15.5C25 21.5 21.2 26.2 16 28C10.8 26.2 7 21.5 7 15.5V8L16 4Z" fill="#10B981" fillOpacity="0.22" stroke="#34D399" strokeWidth="2.2" />
            <rect x="12.5" y="14.5" width="7" height="6" rx="1.5" fill="#6EE7B7" />
            <path d="M14 14.5V12.5C14 11.4 14.9 10.5 16 10.5C17.1 10.5 18 11.4 18 12.5V14.5" stroke="#FFFFFF" strokeWidth="1.8" />
          </svg>
        );
      case "quantum":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <ellipse cx="16" cy="16" rx="12" ry="5" transform="rotate(-30 16 16)" stroke="#38E4FF" strokeWidth="1.8" />
            <ellipse cx="16" cy="16" rx="12" ry="5" transform="rotate(30 16 16)" stroke="#60A5FA" strokeWidth="1.8" />
            <ellipse cx="16" cy="16" rx="12" ry="5" transform="rotate(90 16 16)" stroke="#FACC15" strokeWidth="1.8" />
            <circle cx="16" cy="16" r="3" fill="#FFFFFF" />
          </svg>
        );
      case "chemistry":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path d="M12 5H20M14 5V12L8 23C7.2 24.5 8.3 26.5 10 26.5H22C23.7 26.5 24.8 24.5 24 23L18 12V5" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 20H22L23.5 23.5C24 24.5 23.2 25.5 22 25.5H10C8.8 25.5 8 24.5 8.5 23.5L10 20Z" fill="#10B981" fillOpacity="0.55" />
            <circle cx="15" cy="22" r="1.5" fill="#A7F3D0" />
            <circle cx="18.5" cy="18" r="1.2" fill="#38E4FF" />
          </svg>
        );
      case "biotech":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path d="M10 5C10 12 22 12 22 19C22 23 18 26 10 27" stroke="#2DD4BF" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M22 5C22 12 10 12 10 19C10 23 14 26 22 27" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M12 9H20M13 16H19M12 23H20" stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case "scientific-writing":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="7" y="5" width="18" height="22" rx="3" fill="#38BDF8" fillOpacity="0.18" stroke="#38E4FF" strokeWidth="2" />
            <path d="M11 11H21M11 15.5H21M11 20H16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20.5" cy="20.5" r="2.5" fill="#FACC15" />
          </svg>
        );
      case "leadership":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path d="M16 4L19.3 10.8L26.8 11.9L21.4 17.1L22.7 24.6L16 21L9.3 24.6L10.6 17.1L5.2 11.9L12.7 10.8L16 4Z" fill="#FACC15" stroke="#FEF08A" strokeWidth="1.6" />
          </svg>
        );
      case "robotics":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="7" y="10" width="18" height="14" rx="4" fill="#6366F1" fillOpacity="0.3" stroke="#A5B4FC" strokeWidth="2" />
            <circle cx="12.5" cy="16.5" r="2" fill="#38E4FF" />
            <circle cx="19.5" cy="16.5" r="2" fill="#38E4FF" />
            <path d="M16 5V10M13 21H19" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="5" r="1.8" fill="#FACC15" />
          </svg>
        );
      case "ui-ux":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="5" y="6" width="22" height="16" rx="3" stroke="#C4B5FD" strokeWidth="2" />
            <circle cx="12" cy="14" r="3" fill="#38E4FF" />
            <path d="M17 11H23M17 15H21" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 26H20" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "media-photo":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="5" y="9" width="22" height="16" rx="3.5" fill="#EA580C" fillOpacity="0.25" stroke="#FDBA74" strokeWidth="2" />
            <circle cx="16" cy="17" r="4.5" stroke="#38E4FF" strokeWidth="2.2" />
            <path d="M11 9L12.8 6.5H19.2L21 9" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="10" stroke="#38E4FF" strokeWidth="2.2" />
            <path d="M16 10V16L20 19" stroke="#FACC15" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  if (!boxed) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{renderSvg()}</span>;
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} shadow-md border border-white/15 shrink-0 overflow-hidden ${className}`}
      style={{ width: size + 20, height: size + 20 }}
    >
      <div
        className="absolute -top-3 -right-3 w-8 h-8 rounded-full opacity-35 blur-sm"
        style={{ background: meta.accent }}
      />
      {renderSvg()}
    </div>
  );
}
