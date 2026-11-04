"use client";

import React from "react";
import { Award, Code2, Crown, Share2, Trophy, X } from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

export function MilestoneCelebrationModal() {
  const celebration = useQuantersStore((s) => s.celebration);
  const triggerCelebration = useQuantersStore((s) => s.triggerCelebration);

  const isOpen = Boolean(celebration && celebration.open);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") triggerCelebration(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, triggerCelebration]);

  if (!celebration || !celebration.open) return null;

  const isMotm = celebration.type === "motm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[380px] rounded-[32px] bg-cosmic-space text-white p-6 pt-8 pb-7 shadow-2xl border border-cyan-400/30 flex flex-col items-center text-center overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => triggerCelebration(null)}
          aria-label="Close milestone celebration"
          className="absolute top-4 right-4 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition cursor-pointer active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Decorative Confetti Dots (Matching QUANTA 4 node colors) */}
        <span className="absolute top-12 left-8 w-2.5 h-2.5 rounded-full bg-[#FBB03B] animate-bounce" />
        <span className="absolute top-20 right-10 w-2 h-4 rotate-45 bg-[#30C5F7]" />
        <span className="absolute top-28 left-12 w-3 h-1.5 -rotate-12 bg-[#ED1C24]" />
        <span className="absolute top-16 left-1/2 w-2 h-2 rounded-full bg-[#80C342]" />
        <span className="absolute bottom-32 right-8 w-2.5 h-2.5 rotate-12 bg-[#FBB03B]" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[#38E4FF] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-3.5 h-3.5" /> QUANTA Milestone
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow">
          {celebration.title}
        </h2>

        {/* Giant 3D Glowing Hexagon Emblem */}
        <div className="my-6 relative">
          <div className="absolute -inset-4 rounded-full bg-cyan-400/25 blur-xl animate-pulse" />
          <div
            className={`relative w-36 h-40 clip-hexagon p-[5px] bg-gradient-to-b ${
              isMotm
                ? "from-[#FBB03B] via-[#F59E0B] to-[#B45309]"
                : "from-[#38E4FF] via-[#1D63EB] to-[#094C9C]"
            } shadow-glow`}
          >
            <div className="w-full h-full clip-hexagon bg-[#071936] flex flex-col items-center justify-center p-4">
              {isMotm ? (
                <Crown className="w-16 h-16 text-[#FBB03B] drop-shadow-[0_0_15px_rgba(251,176,59,0.75)]" />
              ) : celebration.badgeName?.includes("Python") ? (
                <Code2 className="w-16 h-16 text-[#FBB03B] drop-shadow-[0_0_15px_rgba(56,228,255,0.75)]" />
              ) : (
                <Award className="w-16 h-16 text-[#38E4FF] drop-shadow-[0_0_15px_rgba(56,228,255,0.75)]" />
              )}
            </div>
          </div>
        </div>

        {celebration.badgeName && (
          <h3 className="text-xl font-extrabold text-white mb-1">{celebration.badgeName}</h3>
        )}

        <p className="text-xs text-slate-300 max-w-[270px] leading-relaxed">
          {celebration.subtitle}
        </p>

        {/* Glowing XP Pill */}
        <div className="mt-5 px-6 py-2 rounded-full bg-emerald-400/20 border border-emerald-300/60 shadow-[0_0_20px_rgba(52,211,153,0.35)]">
          <span className="text-lg font-extrabold text-emerald-300 tabular-nums">
            +{celebration.xpEarned} XP
          </span>
        </div>

        {/* Bottom Dual Buttons */}
        <div className="mt-7 w-full grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => triggerCelebration(null)}
            className="h-11 rounded-full bg-white/10 hover:bg-white/15 border border-cyan-300/30 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button
            type="button"
            onClick={() => triggerCelebration(null)}
            className="h-11 rounded-full bg-gradient-to-r from-[#1CB5E0] to-[#29D2FF] hover:opacity-95 text-[#041226] text-xs font-extrabold shadow-[0_6px_20px_rgba(41,210,255,0.45)] transition"
          >
            Awesome !
          </button>
        </div>
      </div>
    </div>
  );
}
