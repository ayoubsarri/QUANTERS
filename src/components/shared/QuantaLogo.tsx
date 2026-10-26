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
 * Uses the exact QUANTERS_vector_v2.svg wordmark as the primary app logo,
 * and exact Asset 2.png (/brand/univ_quanta_asset2.png) when rendering the institutional mark.
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
  const subColor = isLight ? "text-slate-500" : "text-[#7DD3FC]";

  const iconSize = Math.max(24, size);
  const wordmarkHeight = Math.max(24, Math.round(iconSize * 0.92));
  const subFontSize = Math.max(9.5, Math.round(wordmarkHeight * 0.34));

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
      className={`inline-flex flex-col ${
        centered ? "items-center text-center" : "items-start"
      } leading-none select-none ${className}`}
    >
      {showSubtitle && (
        <span
          className={`mb-1.5 tracking-[0.2em] font-display font-extrabold uppercase ${subColor}`}
          style={{ fontSize: `${subFontSize}px` }}
        >
          BY QUANTA · ALGIERS 1
        </span>
      )}

      <div className="inline-flex items-center gap-1.5">
        <QuantersVectorWordmark height={wordmarkHeight} variant={variant} />

        {showBadge && (
          <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-mono font-bold uppercase tracking-wider bg-[#182C4E] text-[#7DD3FC] border border-[#38BDF8]/35">
            ERP
          </span>
        )}
      </div>
    </div>
  );
}
