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

  // Unified Cosmic Slate-Navy & Stellar Cyan / Indigo Palette (No #D97706 or muddy browns)
  const toneColors = {
    blue: {
      stroke1: "#7DD3FC",
      stroke2: "#38BDF8",
      fill1: "#182C4E",
      fill2: "#101F38",
      glow: "rgba(56,189,248,0.22)",
    },
    cyan: {
      stroke1: "#BAE6FD",
      stroke2: "#38BDF8",
      fill1: "#162D4E",
      fill2: "#0F1E36",
      glow: "rgba(125,211,252,0.24)",
    },
    gold: {
      stroke1: "#E0F2FE",
      stroke2: "#38BDF8",
      fill1: "#1E365D",
      fill2: "#12233E",
      glow: "rgba(125,211,252,0.28)",
    },
    purple: {
      stroke1: "#93C5FD",
      stroke2: "#60A5FA",
      fill1: "#1A2B50",
      fill2: "#111E38",
      glow: "rgba(147,197,253,0.22)",
    },
  };

  const t = toneColors[badge.borderTone] || toneColors.blue;
  const uid = `hex-${badge.id}`;

  return (
    <button
      type="button"
      onClick={() => onClick?.(badge)}
      className="group relative flex flex-col items-center p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_3px_12px_rgba(15,30,54,0.04)] hover:shadow-md hover:border-[#182C4E]/35 active:scale-[0.97] transition-all text-center w-full cursor-pointer"
    >
      {/* Clean Hexagonal Emblem */}
      <div className="relative w-[74px] h-[80px] flex items-center justify-center mb-1.5">
        {!isLocked && (
          <div
            className="absolute inset-2 rounded-full blur-md opacity-60 group-hover:opacity-95 transition-opacity"
            style={{ background: t.glow }}
          />
        )}

        <svg
          width="74"
          height="80"
          viewBox="0 0 80 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <linearGradient id={`${uid}-bg`} x1="10" y1="6" x2="70" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isLocked ? "#E2E8F0" : t.fill1} />
              <stop offset="100%" stopColor={isLocked ? "#CBD5E1" : t.fill2} />
            </linearGradient>
            <linearGradient id={`${uid}-rim`} x1="6" y1="4" x2="74" y2="84" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isLocked ? "#94A3B8" : t.stroke1} />
              <stop offset="100%" stopColor={isLocked ? "#64748B" : t.stroke2} />
            </linearGradient>
          </defs>

          {/* Outer Hexagon Shield */}
          <polygon
            points="40,3 75,23 75,65 40,85 5,65 5,23"
            fill={`url(#${uid}-bg)`}
            stroke={`url(#${uid}-rim)`}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />

          {/* Inner Hexagon Track */}
          <polygon
            points="40,10 69,26.5 69,61.5 40,78 11,61.5 11,26.5"
            fill="none"
            stroke={isLocked ? "#94A3B8" : t.stroke1}
            strokeOpacity={isLocked ? "0.3" : "0.32"}
            strokeWidth="1"
            strokeDasharray={isInProgress ? "4 3" : undefined}
          />
        </svg>

        {/* Center Minimalist Vector Emblem */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {isLocked ? (
            <div className="w-8 h-8 rounded-full bg-slate-400/25 flex items-center justify-center">
              <Lock className="w-4 h-4 text-slate-600" />
            </div>
          ) : (
            <FieldIcon field={`${badge.name} ${badge.iconName}`} size={26} />
          )}
        </div>
      </div>

      {/* Badge Title */}
      <span
        className={`text-xs font-extrabold font-display leading-snug line-clamp-2 min-h-[32px] flex items-center justify-center px-1 ${
          isLocked ? "text-slate-400" : "text-[#0F1E36]"
        }`}
      >
        {badge.name}
      </span>

      {/* Harmonized XP Pill */}
      <div className="mt-1.5">
        {isLocked ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-slate-100 text-slate-500">
            +{badge.xpReward} XP
          </span>
        ) : isInProgress ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5]">
            {badge.progressPercent}% · +{badge.xpReward} XP
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-[#182C4E] text-[#7DD3FC] border border-[#2B4875]">
            +{badge.xpReward} XP
          </span>
        )}
      </div>
    </button>
  );
}
