"use client";

import React from "react";

interface PlanetEmblemProps {
  size?: number;
  className?: string;
}

/**
 * Authentic QUANTA Scientific Quantum Core Emblem
 * Encapsulates the official 3-orbit QUANTA mark in an optic-grade,
 * luminous frosted glass lens with quantum particle aura.
 */
export function PlanetEmblem({ size = 56, className = "" }: PlanetEmblemProps) {
  const outerSize = Math.max(36, size);
  const coreSize = Math.round(outerSize * 0.82);

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center select-none group ${className}`}
      style={{ width: `${outerSize}px`, height: `${outerSize}px` }}
      aria-label="QUANTA Quantum Core Emblem"
    >
      {/* 1. Ambient sub-atomic quantum aura */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/30 via-blue-500/25 to-[#29D2FF]/30 blur-md scale-110 pointer-events-none animate-pulse-subtle" />

      {/* 2. Concentric optic micro-ring */}
      <div className="absolute inset-0.5 rounded-full border border-cyan-300/40 opacity-75 pointer-events-none" />

      {/* 3. Luminous Frosted Quantum Lens */}
      <div
        className="relative z-10 w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-white/25 via-[#0C387D]/40 to-[#061E47]/70 backdrop-blur-md border border-white/35 shadow-[0_8px_24px_rgba(41,210,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)] animate-float-subtle overflow-hidden"
      >
        {/* Subtle specular reflection crescent */}
        <div className="absolute -top-1 left-2 right-2 h-1/2 rounded-t-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

        {/* Official QUANTA 3-Orbit Particle Core */}
        <img
          src="/brand/logo_quanta.png"
          alt="QUANTA Core"
          className="object-contain relative z-20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-105"
          style={{ width: `${coreSize}px`, height: `${coreSize}px` }}
        />
      </div>
    </div>
  );
}
