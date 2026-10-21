"use client";

import React from "react";

export function PlanetEmblem({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_0_14px_rgba(41,210,255,0.45)] animate-float-subtle"
    >
      <defs>
        <linearGradient id="planetBody" x1="18" y1="16" x2="62" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38E4FF" />
          <stop offset="55%" stopColor="#1D63EB" />
          <stop offset="100%" stopColor="#092B6B" />
        </linearGradient>
        <linearGradient id="planetRing" x1="4" y1="54" x2="76" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38E4FF" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#87D9F8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#29D2FF" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* Sparkle stars */}
      <circle cx="16" cy="18" r="1.5" fill="#87D9F8" opacity="0.85" />
      <circle cx="64" cy="15" r="1.8" fill="#FFFFFF" opacity="0.9" />
      <circle cx="66" cy="60" r="1.3" fill="#38E4FF" opacity="0.7" />
      {/* Planet Sphere */}
      <circle cx="40" cy="40" r="19" fill="url(#planetBody)" />
      {/* Highlight crescent */}
      <path
        d="M27 29C31 24 38 22 45 24C37 25 30 31 28 39C26.5 35.5 26 32 27 29Z"
        fill="#87D9F8"
        opacity="0.45"
      />
      {/* Orbital Ring */}
      <ellipse
        cx="40"
        cy="41"
        rx="33"
        ry="9.5"
        transform="rotate(-22 40 41)"
        stroke="url(#planetRing)"
        strokeWidth="3.2"
        fill="none"
      />
    </svg>
  );
}
