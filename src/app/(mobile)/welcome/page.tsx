"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

export default function WelcomeSplashPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userLowDataMode = useQuantersStore((s) => s.userLowDataMode);
  const quotaSaverPreset = useQuantersStore((s) => s.settings.quotaSaverPreset);
  const skipHeavyVideo = userLowDataMode || quotaSaverPreset === "ultra";

  useEffect(() => {
    if (!skipHeavyVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay fallback
      });
    }
  }, [skipHeavyVideo]);

  return (
    <MobileAppShell
      hideBottomNav
      darkStatus
      className="bg-[#030914] text-white relative min-h-dvh flex flex-col justify-between overflow-hidden select-none"
    >
      {/* 1. Full-Bleed Cosmic Looping Video Background (or Static Poster in Quota-Saver Mode) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {skipHeavyVideo ? (
          <img
            src="/brand/welcome_splash_bg.png"
            alt="QUANTERS Cosmic Backdrop"
            className="w-full h-full object-cover object-center scale-[1.01]"
          />
        ) : (
          <video
            ref={videoRef}
            src="/brand/welcome_loop.mp4"
            poster="/brand/welcome_splash_bg.png"
            preload="metadata"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center scale-[1.01]"
          />
        )}
        {/* Subtle top and bottom atmospheric gradients so typography is 100% legible without obscuring the astronaut */}
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#030914]/90 via-[#030914]/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#030914]/95 via-[#030914]/65 to-transparent" />
      </div>

      {/* 2. Upper Hero Branding: Centered QUANTERS Wordmark + 4 Pillars */}
      <header className="relative z-10 w-full max-w-[460px] mx-auto px-6 pt-11 sm:pt-14 flex flex-col items-center text-center animate-rise">
        <QuantaLogo
          size={58}
          showSubtitle
          centered
          variant="dark"
          className="drop-shadow-[0_6px_24px_rgba(0,0,0,0.75)]"
        />

        <div className="mt-6 space-y-1.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          <div className="font-display font-extrabold tracking-[0.3em] text-sm sm:text-base text-slate-200/95 uppercase pl-[0.3em]">
            DISCOVER
          </div>
          <div className="font-display font-black tracking-[0.3em] text-sm sm:text-base text-[#38E4FF] uppercase pl-[0.3em] drop-shadow-[0_0_14px_rgba(56,228,255,0.7)]">
            LEARN
          </div>
          <div className="font-display font-extrabold tracking-[0.3em] text-sm sm:text-base text-slate-200/95 uppercase pl-[0.3em]">
            PROVE
          </div>
          <div className="font-display font-extrabold tracking-[0.3em] text-sm sm:text-base text-slate-200/95 uppercase pl-[0.3em]">
            BELONG
          </div>
        </div>
      </header>

      {/* 3. Middle-Right Sky Handwritten Callout */}
      <div className="relative z-10 w-full max-w-[440px] mx-auto px-6 my-auto flex justify-end pointer-events-none">
        <div className="mr-1 sm:mr-4 -mt-4 -rotate-6 text-center font-script text-3xl sm:text-4xl leading-[1.08] text-blue-50/95 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          <div>More</div>
          <div>than a club,</div>
          <div>a scientific</div>
          <div>journey.</div>
        </div>
      </div>

      {/* 4. Bottom Action Dock & Institutional Signature */}
      <footer className="relative z-10 w-full max-w-[420px] mx-auto px-6 pb-8 sm:pb-10 flex flex-col items-center text-center space-y-3.5">
        {/* Primary Pill CTA matching reference */}
        <Link
          href="/login"
          className="w-full h-14 rounded-2xl bg-white hover:bg-slate-50 text-[#07152B] font-display font-black text-base sm:text-lg tracking-tight shadow-[0_12px_36px_rgba(0,0,0,0.65)] active:scale-[0.98] transition flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </Link>

        {/* Clean secondary navigation links */}
        <div className="flex items-center justify-center gap-4 text-xs sm:text-sm font-display font-bold text-sky-200/95">
          <Link
            href="/onboarding"
            className="hover:text-white transition underline underline-offset-4 decoration-sky-400/50"
          >
            New Member Registration
          </Link>
          <span className="text-slate-500">•</span>
          <Link
            href="/home"
            className="hover:text-white transition underline underline-offset-4 decoration-sky-400/50"
          >
            Enter Member Hub
          </Link>
        </div>

        {/* Official Club Signature */}
        <div className="pt-1 space-y-1 font-display font-bold text-xs tracking-[0.25em] text-slate-300 uppercase">
          <div>QUANTA SCIENTIFIC CLUB</div>
          <div className="text-[11px] tracking-[0.22em] text-slate-400">
            UNIVERSITY OF ALGIERS 1
          </div>
        </div>
      </footer>
    </MobileAppShell>
  );
}
