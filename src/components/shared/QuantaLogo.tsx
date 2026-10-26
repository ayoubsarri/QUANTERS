"use client";

import React from "react";

interface QuantersVectorWordmarkProps {
  height?: number;
  variant?: "light" | "dark" | "hero";
  className?: string;
}

/**
 * Official QUANTERS Vector Wordmark (renders exact /brand/quanters_vector_v2.svg as provided)
 */
export function QuantersVectorWordmark({
  height = 28,
  className = "",
}: QuantersVectorWordmarkProps) {
  return (
    <img
      src="/brand/quanters_vector_v2.svg"
      alt="QUANTERS"
      style={{ height: `${height}px`, width: "auto" }}
      className={`block shrink-0 select-none object-contain object-left ${className}`}
    />
  );
}

interface QuantaLogoProps {
  size?: number;
  showWordmark?: boolean;
  variant?: "light" | "dark" | "hero";
  className?: string;
  showSubtitle?: boolean;
  showBadge?: boolean;
  centered?: boolean;
}

/**
 * Authentic QUANTERS Brand Identity System
 * Places the QUANTERS vector logo in the upper row and aligns the
 * "BY QUANTA ─── ALGIERS 1" architectural line flush with the left (Q) and right (S) edges below it.
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
  const primarySubColor = isLight ? "text-[#0284C7]" : "text-[#38E4FF]";
  const secondarySubColor = isLight ? "text-slate-500" : "text-slate-300";
  const ruleGradient = isLight
    ? "from-[#0284C7]/45 via-slate-300 to-slate-300/70"
    : "from-[#38E4FF]/60 via-[#38BDF8]/30 to-white/20";

  const iconSize = Math.max(24, size);
  const wordmarkHeight = Math.max(24, Math.round(iconSize * 0.92));
  const subFontSize = Math.max(9, Math.round(wordmarkHeight * 0.28));

  if (!showWordmark) {
    return (
      <div className={`inline-flex items-center shrink-0 select-none ${className}`}>
        <img
          src="/brand/univ_quanta_asset2.png"
          alt="University of Algiers 1 · Quanta"
          style={{ height: `${iconSize}px`, width: "auto" }}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-start ${
        centered ? "mx-auto items-center" : ""
      } leading-none select-none ${className}`}
    >
      {/* Upper Row: Official QUANTERS Vector Logo */}
      <div className="inline-flex items-center gap-2">
        <QuantersVectorWordmark height={wordmarkHeight} variant={variant} />

        {showBadge && (
          <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-mono font-bold uppercase tracking-wider bg-[#182C4E] text-[#7DD3FC] border border-[#38BDF8]/35">
            ERP
          </span>
        )}
      </div>

      {/* Lower Row: Subtitle Flush-Aligned with Q (Left) */}
      {showSubtitle && (
        <div
          className="inline-flex items-center gap-2 mt-1.5"
          style={{ fontSize: `${subFontSize}px` }}
        >
          <span
            className={`font-display font-extrabold tracking-[0.2em] uppercase leading-none whitespace-nowrap ${primarySubColor}`}
          >
            BY QUANTA
          </span>
          <span className="opacity-35 leading-none">·</span>
          <span
            className={`font-mono font-bold tracking-[0.14em] uppercase leading-none whitespace-nowrap ${secondarySubColor}`}
          >
            ALGIERS 1
          </span>
        </div>
      )}
    </div>
  );
}
