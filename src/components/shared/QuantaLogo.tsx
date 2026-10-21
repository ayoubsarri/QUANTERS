"use client";

import React from "react";

interface QuantaLogoProps {
  size?: number; // Approximate height scaling
  showWordmark?: boolean;
  variant?: "light" | "dark" | "hero";
  className?: string;
  showSubtitle?: boolean;
  showBadge?: boolean;
  centered?: boolean;
}

/**
 * Official QUANTERS Pure Typographic Wordmark
 * Tight geometric sans-serif with two-tone blue/cyan Λ ('A') and 'BY QUANTA' subtitle.
 */
export function QuantaLogo({
  size = 32,
  variant = "dark",
  className = "",
  showSubtitle = true,
  showBadge = false,
  centered = false,
}: QuantaLogoProps) {
  const isLight = variant === "light";
  const textColor = isLight ? "text-[#09192F]" : "text-white";
  const subColor = isLight ? "text-slate-500" : "text-slate-300/90";

  const fontSize = Math.max(18, Math.round(size * 0.78));
  const subSize = Math.max(9, Math.round(fontSize * 0.34));
  const chevronHeight = Math.max(14, Math.round(fontSize * 0.76));
  const chevronWidth = Math.max(14, Math.round(chevronHeight * 0.92));

  return (
    <div
      className={`inline-flex flex-col ${
        centered ? "items-center text-center" : "items-start"
      } select-none leading-none ${className}`}
    >
      <div
        className="inline-flex items-baseline font-display font-black tracking-[-0.02em]"
        style={{ fontSize: `${fontSize}px`, lineHeight: 1 }}
      >
        <span className={textColor}>QU</span>
        {/* Two-Tone Blue/Cyan Lambda 'A' matching official brand mark */}
        <span
          className="relative inline-flex items-end justify-center shrink-0 mx-[0.01em] translate-y-[0.03em]"
          style={{ width: `${chevronWidth}px`, height: `${chevronHeight}px` }}
        >
          <svg
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient
                id="quanta-lambda-left"
                x1="2"
                y1="25"
                x2="13"
                y2="1"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#29D2FF" />
                <stop offset="55%" stopColor="#0E6EFF" />
                <stop offset="100%" stopColor="#0051E6" />
              </linearGradient>
              <linearGradient
                id="quanta-lambda-right"
                x1="13"
                y1="1"
                x2="24"
                y2="25"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#1488FF" />
                <stop offset="45%" stopColor="#29D2FF" />
                <stop offset="100%" stopColor="#5CEBFF" />
              </linearGradient>
            </defs>
            {/* Left leg */}
            <path
              d="M13 1.2L1.4 25H8.2L13 13.4V1.2Z"
              fill="url(#quanta-lambda-left)"
            />
            {/* Right leg */}
            <path
              d="M13 1.2L24.6 25H17.8L13 13.4V1.2Z"
              fill="url(#quanta-lambda-right)"
            />
          </svg>
        </span>
        <span className={textColor}>NTERS</span>

        {showBadge && (
          <span className="ml-2.5 px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase tracking-wider bg-white/10 text-sky-200 border border-white/15 self-center">
            ERP
          </span>
        )}
      </div>

      {showSubtitle && (
        <div
          className={`mt-1.5 tracking-[0.36em] font-display uppercase font-bold ${subColor} ${
            centered ? "pl-[0.36em]" : ""
          }`}
          style={{ fontSize: `${subSize}px` }}
        >
          BY QUANTA
        </div>
      )}
    </div>
  );
}
