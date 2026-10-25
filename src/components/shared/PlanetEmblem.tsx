"use client";

import React from "react";

interface PlanetEmblemProps {
  size?: number;
  className?: string;
}

/**
 * Nano Banana Cosmic Galaxy & Quantum Ringed Planet Emblem
 * Matches the Welcome page crocheted astronaut & cyan spiral galaxy aesthetic.
 */
export function PlanetEmblem({ size = 58, className = "" }: PlanetEmblemProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-xl overflow-hidden border border-[#38E4FF]/35 bg-[#040917] shadow-[0_0_22px_rgba(56,228,255,0.35)] ${className}`}
      aria-label="QUANTA Cosmic Galaxy Emblem"
    >
      <img
        src="/brand/cosmic_galaxy_emblem.webp"
        alt="QUANTA Cosmic Galaxy"
        className="w-full h-full object-cover object-center scale-110 select-none pointer-events-none"
      />
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15 pointer-events-none" />
    </div>
  );
}
