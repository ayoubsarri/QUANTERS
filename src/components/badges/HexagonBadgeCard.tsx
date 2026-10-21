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

  const toneColors = {
    blue: {
      stroke1: "#38E4FF",
      stroke2: "#1D63EB",
      fill1: "#071E3D",
      fill2: "#0F3872",
      glow: "rgba(56,228,255,0.28)",
    },
    cyan: {
      stroke1: "#22D3EE",
      stroke2: "#0284C7",
      fill1: "#052038",
      fill2: "#0B466E",
      glow: "rgba(34,211,238,0.28)",
    },
    gold: {
      stroke1: "#FDE047",
      stroke2: "#D97706",
      fill1: "#1D1908",
      fill2: "#423009",
      glow: "rgba(250,204,21,0.32)",
    },
    purple: {
      stroke1: "#C084FC",
      stroke2: "#6366F1",
      fill1: "#181036",
      fill2: "#311F68",
      glow: "rgba(192,132,252,0.28)",
    },
  };

  const t = toneColors[badge.borderTone] || toneColors.blue;
  const uid = `hex-${badge.id}`;

  return (
    <button
      type="button"
      onClick={() => onClick?.(badge)}
      className="group relative flex flex-col items-center p-2.5 rounded-2xl bg-white border border-[#E2ECFA] shadow-card hover:shadow-md hover:border-[#BFD9FB] active:scale-[0.97] transition-all text-center w-full"
    >
      {/* Crafted Multi-Layer SVG Hexagonal Emblem */}
      <div className="relative w-[78px] h-[84px] flex items-center justify-center mb-1.5">
        {!isLocked && (
          <div
            className="absolute inset-2 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"
            style={{ background: t.glow }}
          />
        )}

        <svg
          width="78"
          height="84"
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
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Inner Precision Hexagon Track */}
          <polygon
            points="40,10 69,26.5 69,61.5 40,78 11,61.5 11,26.5"
            fill="none"
            stroke={isLocked ? "#94A3B8" : t.stroke1}
            strokeOpacity={isLocked ? "0.35" : "0.38"}
            strokeWidth="1.2"
            strokeDasharray={isInProgress ? "4 3" : undefined}
          />

          {/* Subtle top specular highlight */}
          {!isLocked && (
            <polygon
              points="40,10 66,25 40,36 14,25"
              fill="#FFFFFF"
              fillOpacity="0.07"
            />
          )}
        </svg>

        {/* Center Vector Emblem */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {isLocked ? (
            <div className="w-8 h-8 rounded-full bg-slate-400/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-slate-600" />
            </div>
          ) : (
            <FieldIcon field={`${badge.name} ${badge.iconName}`} size={29} />
          )}
        </div>
      </div>

      {/* Badge Title */}
      <span
        className={`text-[11px] font-bold leading-tight line-clamp-2 min-h-[26px] flex items-center justify-center px-0.5 ${
          isLocked ? "text-[#94A3B8]" : "text-[#0B2545]"
        }`}
      >
        {badge.name}
      </span>

      {/* Bottom Gold XP Pill or Progress */}
      <div className="mt-1.5">
        {isLocked ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#F1F5F9] text-[#64748B]">
            +{badge.xpReward} XP
          </span>
        ) : isInProgress ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#E0F0FF] text-[#1D63EB]">
            {badge.progressPercent}% · +{badge.xpReward} XP
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
            +{badge.xpReward} XP
          </span>
        )}
      </div>
    </button>
  );
}
