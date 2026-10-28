"use client";

import React from "react";
import { Lock } from "lucide-react";
import { Badge } from "@/lib/types/erp";
import { FieldIcon } from "../shared/FieldIcon";

interface HexagonBadgeCardProps {
  badge: Badge;
  onClick?: (badge: Badge) => void;
}

export function HexagonBadgeCard({ badge, onClick }: HexagonBadgeCardProps) {
  const isLocked = badge.memberState === "Locked";
  const isInProgress = badge.memberState === "In Progress";
  const uid = `hex-${badge.id}`;

  // Bespoke Luminous Cosmic Badge Theme Engine
  const getTheme = () => {
    if (isLocked) {
      return {
        fill1: "#0F172A",
        fill2: "#0A0F1D",
        stroke1: "#475569",
        stroke2: "#334155",
        innerStroke: "#334155",
        glow: "transparent",
        iconColor: "#64748B",
        iconTextClass: "text-slate-400",
        xpBg: "bg-slate-100 text-slate-500 border border-slate-200",
      };
    }

    const cat = (badge.category || "").toLowerCase();
    const tone = (badge.borderTone || "").toLowerCase();

    // Soft Skills / Leadership / Speech / Communication -> Radiant Warm Gold
    if (
      cat.includes("soft") ||
      cat.includes("speak") ||
      cat.includes("comm") ||
      cat.includes("lead") ||
      tone === "gold"
    ) {
      return {
        fill1: "#2A1D05",
        fill2: "#181003",
        stroke1: "#FDE047",
        stroke2: "#D97706",
        innerStroke: "#FBBF24",
        glow: "rgba(245,158,11,0.32)",
        iconColor: "#FDE047",
        iconTextClass: "text-[#FDE047] drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]",
        xpBg: "bg-amber-50 text-amber-800 border border-amber-300/80",
      };
    }

    // Technology / Coding / Hardware -> Neon Cyber Emerald & Mint
    if (
      cat.includes("tech") ||
      cat.includes("code") ||
      cat.includes("hardware") ||
      cat.includes("robot") ||
      tone === "cyan"
    ) {
      return {
        fill1: "#042421",
        fill2: "#021513",
        stroke1: "#6EE7B7",
        stroke2: "#059669",
        innerStroke: "#34D399",
        glow: "rgba(16,185,129,0.35)",
        iconColor: "#34D399",
        iconTextClass: "text-[#34D399] drop-shadow-[0_0_10px_rgba(52,211,153,0.95)]",
        xpBg: "bg-emerald-50 text-emerald-800 border border-emerald-300/80",
      };
    }

    // Quantum / Violet Tones
    if (tone === "purple" || cat.includes("quantum")) {
      return {
        fill1: "#1A1336",
        fill2: "#0D091D",
        stroke1: "#D8B4FE",
        stroke2: "#7C3AED",
        innerStroke: "#C084FC",
        glow: "rgba(168,85,247,0.35)",
        iconColor: "#C084FC",
        iconTextClass: "text-[#C084FC] drop-shadow-[0_0_10px_rgba(192,132,252,0.95)]",
        xpBg: "bg-purple-50 text-purple-800 border border-purple-300/80",
      };
    }

    // Default: Science & Astrophysics -> Brilliant Stellar Cyan
    return {
      fill1: "#051D3D",
      fill2: "#020E20",
      stroke1: "#7DD3FC",
      stroke2: "#0284C7",
      innerStroke: "#38E4FF",
      glow: "rgba(56,228,255,0.38)",
      iconColor: "#38E4FF",
      iconTextClass: "text-[#38E4FF] drop-shadow-[0_0_10px_rgba(56,228,255,0.95)]",
      xpBg: "bg-sky-50 text-sky-800 border border-sky-300/80",
    };
  };

  const theme = getTheme();

  return (
    <button
      type="button"
      onClick={() => onClick?.(badge)}
      className="group relative flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.06)] hover:shadow-lg hover:border-[#182C4E]/40 active:scale-[0.97] transition-all text-center w-full cursor-pointer overflow-hidden"
    >
      {/* Outer ambient glow behind the hexagon */}
      {!isLocked && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-xl opacity-45 group-hover:opacity-80 transition-opacity pointer-events-none"
          style={{ background: theme.glow }}
        />
      )}

      {/* Hexagonal Shield Plate */}
      <div className="relative w-[78px] h-[86px] flex items-center justify-center mb-2">
        <svg
          width="78"
          height="86"
          viewBox="0 0 80 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id={`${uid}-bg`} x1="10" y1="4" x2="70" y2="84" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={theme.fill1} />
              <stop offset="100%" stopColor={theme.fill2} />
            </linearGradient>
            <linearGradient id={`${uid}-rim`} x1="6" y1="2" x2="74" y2="86" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={theme.stroke1} />
              <stop offset="100%" stopColor={theme.stroke2} />
            </linearGradient>
          </defs>

          {/* Outer Metallic Hexagon Shield */}
          <polygon
            points="40,3 75,23 75,65 40,85 5,65 5,23"
            fill={`url(#${uid}-bg)`}
            stroke={`url(#${uid}-rim)`}
            strokeWidth={isLocked ? "2" : "2.8"}
            strokeLinejoin="round"
          />

          {/* Inner Hexagon Track */}
          <polygon
            points="40,10 69,26.5 69,61.5 40,78 11,61.5 11,26.5"
            fill="none"
            stroke={theme.innerStroke}
            strokeOpacity={isLocked ? "0.2" : "0.55"}
            strokeWidth="1.2"
            strokeDasharray={isInProgress ? "4 3" : undefined}
          />
        </svg>

        {/* Center High-Contrast Luminous Vector Icon */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          {isLocked ? (
            <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-600/50 flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4 text-slate-400 stroke-[2.2]" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              {/* Subtle ambient core glow behind the icon */}
              <div
                className="absolute w-8 h-8 rounded-full blur-sm opacity-40 pointer-events-none"
                style={{ backgroundColor: theme.iconColor }}
              />
              <FieldIcon
                field={`${badge.name} ${badge.iconName}`}
                size={28}
                className={theme.iconTextClass}
              />
            </div>
          )}
        </div>
      </div>

      {/* Badge Name */}
      <span
        className={`text-xs font-black font-display leading-tight line-clamp-2 min-h-[30px] flex items-center justify-center px-0.5 ${
          isLocked ? "text-slate-400" : "text-[#0F1E36]"
        }`}
      >
        {badge.name}
      </span>

      {/* Harmonized High-Contrast XP Pill */}
      <div className="mt-1.5 w-full flex justify-center">
        {isLocked ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-slate-100 text-slate-500 border border-slate-200/80">
            +{badge.xpReward} XP
          </span>
        ) : isInProgress ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-sky-50 text-sky-700 border border-sky-200">
            {badge.progressPercent}% · +{badge.xpReward} XP
          </span>
        ) : (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black font-mono shadow-2xs ${theme.xpBg}`}>
            +{badge.xpReward} XP
          </span>
        )}
      </div>
    </button>
  );
}
