"use client";

import React, { useId } from "react";

interface QuantersVectorWordmarkProps {
  height?: number;
  variant?: "light" | "dark" | "hero";
  className?: string;
}

/**
 * Official QUANTERS Vector Wordmark (from QUANTERS_vector_v2.svg)
 * Features custom geometric letterforms with the signature gradient 'A'.
 */
export function QuantersVectorWordmark({
  height = 24,
  variant = "dark",
  className = "",
}: QuantersVectorWordmarkProps) {
  const gradId = useId().replace(/:/g, "");
  const isLight = variant === "light";
  const letterFill = isLight ? "#09192F" : "#F7F8FA";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="48 60 1146 173"
      style={{ height: `${height}px`, width: "auto" }}
      className={`block shrink-0 select-none ${className}`}
      role="img"
      aria-label="QUANTERS"
    >
      <defs>
        <linearGradient id={`aGradient-${gradId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#087BEF" />
          <stop offset="0.48" stopColor="#12B8F4" />
          <stop offset="1" stopColor="#20D6D0" />
        </linearGradient>
      </defs>
      <path
        d="M764 -24C858 -24 947 -9 1029 19L1136 -110H1486L1259 156C1401 285 1488 484 1488 744C1488 1242 1169 1514 764 1514C357 1514 40 1242 40 744C40 250 357 -24 764 -24ZM608 552 772 336C769 336 767 336 764 336C569 336 460 487 460 744C460 1002 569 1154 764 1154C960 1154 1068 1002 1068 744C1068 623 1044 526 999 457L922 552Z"
        fill={letterFill}
        transform="translate(45.00,220) scale(0.105,-0.105)"
      />
      <path
        d="M722 -24C1111 -24 1364 194 1364 530V1490H960V564C960 425 862 326 722 326C584 326 484 426 484 564V1490H80V530C80 193 332 -24 722 -24Z"
        fill={letterFill}
        transform="translate(198.44,220) scale(0.105,-0.105)"
      />
      <path
        d="M0 0H455L528 245H1026L1097 0H1565L1060 1490H500ZM624 565 628 578C682 758 732 932 781 1113C829 932 878 758 930 578L934 565Z"
        fill={`url(#aGradient-${gradId})`}
        transform="translate(343.06,220) scale(0.105,-0.105)"
      />
      <path
        d="M80 0H496V544C496 604 496 721 491 855C561 726 627 611 669 544L1008 0H1432V1490H1016V944C1016 873 1017 752 1021 631C963 738 902 849 867 905L504 1490H80Z"
        fill={letterFill}
        transform="translate(500.38,220) scale(0.105,-0.105)"
      />
      <path
        d="M40 1138H464V0H880V1138H1304V1490H40Z"
        fill={letterFill}
        transform="translate(652.14,220) scale(0.105,-0.105)"
      />
      <path
        d="M80 0H1234V352H496V574H1177V914H496V1138H1234V1490H80Z"
        fill={letterFill}
        transform="translate(786.26,220) scale(0.105,-0.105)"
      />
      <path
        d="M80 0H496V466H682L905 0H1338L1065 556C1210 642 1292 785 1292 970C1292 1289 1069 1490 713 1490H80ZM496 788V1152H682C807 1152 886 1079 886 970C886 861 807 788 682 788Z"
        fill={letterFill}
        transform="translate(915.13,220) scale(0.105,-0.105)"
      />
      <path
        d="M704 -24C1108 -24 1339 154 1339 466C1339 704 1194 836 852 899L732 921C577 949 510 987 510 1058C510 1133 592 1186 709 1186C833 1186 916 1122 926 1018H1308C1298 1330 1073 1514 701 1514C339 1514 92 1321 92 1038C92 817 248 664 536 609L684 581C852 549 928 507 928 435C928 357 840 304 709 304C558 304 463 375 457 496H64C64 161 291 -24 704 -24Z"
        fill={letterFill}
        transform="translate(1051.25,220) scale(0.105,-0.105)"
      />
    </svg>
  );
}

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
 * Integrates the official 3-orbit QUANTA scientific emblem with the custom QUANTERS_vector_v2 wordmark.
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
  const subColor = isLight ? "text-slate-500" : "text-sky-200/90";

  const iconSize = Math.max(26, size);
  const wordmarkHeight = Math.max(14, Math.round(iconSize * 0.52));
  const subFontSize = Math.max(9, Math.round(wordmarkHeight * 0.45));

  const emblem = (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
    >
      <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md pointer-events-none scale-110" />
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
          <QuantersVectorWordmark height={wordmarkHeight} variant={variant} />

          {showBadge && (
            <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-mono font-bold uppercase tracking-wider bg-[#1D63EB]/15 text-[#38E4FF] border border-[#38E4FF]/30">
              ERP
            </span>
          )}
        </div>

        {showSubtitle && (
          <span
            className={`mt-1.5 tracking-[0.24em] font-display font-bold uppercase ${subColor} pl-[0.24em]`}
            style={{ fontSize: `${subFontSize}px` }}
          >
            BY QUANTA
          </span>
        )}
      </div>
    </div>
  );
}
