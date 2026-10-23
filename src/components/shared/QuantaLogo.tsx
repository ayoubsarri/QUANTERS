"use client";

import React from "react";

interface QuantaLogoProps {
  size?: number; // Icon / base height in px
  showWordmark?: boolean;
  variant?: "light" | "dark" | "hero";
  className?: string;
  showSubtitle?: boolean;
  showBadge?: boolean;
  centered?: boolean;
}

/**
 * Authentic QUANTERS Brand Identity System
 * Integrates the official 3-orbit QUANTA scientific emblem with a high-contrast geometric wordmark.
 */
export function QuantaLogo({
  size = 36,
  showWordmark = true,
  variant = "dark",
  className = "",
  showSubtitle = true,
  showBadge = false,
  centered = false,
}: QuantaLogoProps) {
  const isLight = variant === "light";
  const textColor = isLight ? "text-[#09192F]" : "text-white";
  const subColor = isLight ? "text-slate-500" : "text-sky-200/90";

  const iconSize = Math.max(26, size);
  const fontSize = Math.max(16, Math.round(iconSize * 0.72));
  const subFontSize = Math.max(9, Math.round(fontSize * 0.36));

  const emblem = (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
    >
      {/* Subtle ambient particle glow behind official mark */}
      <div
        className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md pointer-events-none scale-110"
      />
      <img
        src="/brand/logo_quanta_opt.webp"
        alt="QUANTA"
        className="w-full h-full object-contain relative z-10 drop-shadow-[0_2px_10px_rgba(29,99,235,0.35)]"
      />
    </div>
  );

  if (!showWordmark) {
    return <div className={`inline-flex shrink-0 ${className}`}>{emblem}</div>;
  }

  return (
    <div
      className={`inline-flex ${
        centered ? "flex-col items-center text-center gap-2" : "flex-row items-center gap-2.5"
      } select-none ${className}`}
    >
      {emblem}

      <div className={`flex flex-col ${centered ? "items-center" : "items-start"} leading-none`}>
        <div className="inline-flex items-center gap-1.5">
          <span
            className={`font-display font-black tracking-[-0.03em] ${textColor} drop-shadow-xs flex items-center`}
            style={{ fontSize: `${fontSize}px` }}
          >
            QUANTERS
            <span className="w-1.5 h-1.5 rounded-full bg-[#38E4FF] ml-1 shrink-0 drop-shadow-[0_0_4px_#38E4FF]" />
          </span>

          {showBadge && (
            <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-mono font-bold uppercase tracking-wider bg-[#1D63EB]/15 text-[#38E4FF] border border-[#38E4FF]/30">
              ERP
            </span>
          )}
        </div>

        {showSubtitle && (
          <span
            className={`mt-1 tracking-[0.24em] font-display font-bold uppercase ${subColor} pl-[0.24em]`}
            style={{ fontSize: `${subFontSize}px` }}
          >
            BY QUANTA
          </span>
        )}
      </div>
    </div>
  );
}
