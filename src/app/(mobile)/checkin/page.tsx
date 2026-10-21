"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

export default function WorkshopCheckInScannerPage() {
  const workshops = useQuantersStore((s) => s.workshops);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const verifyWorkshopCheckIn = useQuantersStore(
    (s) => s.verifyWorkshopCheckIn
  );

  const liveWorkshop =
    workshops.find((w) => w.id === "ws-python") || workshops[0];

  const [sixDigitCode, setSixDigitCode] = useState("");
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(298); // 04:58

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 298));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = String(Math.floor(secondsRemaining / 60)).padStart(2, "0");
  const secs = String(secondsRemaining % 60).padStart(2, "0");

  const handleSimulatedCameraScan = () => {
    const res = verifyWorkshopCheckIn(
      liveWorkshop.id,
      currentMemberId,
      "SCAN-OK",
      "Member Scanned QR"
    );
    setFeedback(res);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = verifyWorkshopCheckIn(
      liveWorkshop.id,
      currentMemberId,
      sixDigitCode || liveWorkshop.liveSixDigitCode,
      "6-Digit Code"
    );
    setFeedback(res);
  };

  return (
    <MobileAppShell
      hideBottomNav
      darkStatus
      className="bg-cosmic-space text-white relative overflow-hidden"
    >
      <div className="flex-1 w-full max-w-[480px] mx-auto flex flex-col justify-between px-5 pt-4 pb-6 sm:py-8">
        {/* Top Bar: Workshop Check-in */}
        <div
          className="animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/workshops"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-100 hover:text-white active:scale-[0.98] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Workshop Check-in</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10.5px] font-extrabold shadow-[0_0_14px_rgba(16,185,129,0.3)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Session</span>
            </span>
          </div>

          {/* Session Header Info */}
          <div className="mt-4 text-center">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              {liveWorkshop.title}
            </h1>
            <p className="mt-1 text-[11px] text-sky-200/85 flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#38E4FF]" />
                {liveWorkshop.dateLabel} · {liveWorkshop.timeRange}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#38E4FF]" />
                {liveWorkshop.location}
              </span>
            </p>
          </div>
        </div>

        {/* Optical Viewfinder with Cyan Corner Brackets (#29D2FF) & Golden Laser */}
        <div
          className="my-4 flex flex-col items-center animate-rise"
          style={{ animationDelay: "60ms" }}
        >
          <div className="relative w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] rounded-3xl bg-slate-950/70 border border-white/15 shadow-[0_0_40px_rgba(41,210,255,0.25)] flex flex-col items-center justify-center overflow-hidden">
            {/* Cyan Corner Brackets (#29D2FF) */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-[#29D2FF] rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-[#29D2FF] rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-[#29D2FF] rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-[#29D2FF] rounded-br-xl" />

            {/* Subtle Simulated QR Target Inside Viewfinder */}
            <div className="w-28 h-28 rounded-2xl border border-cyan-400/25 bg-white/5 flex flex-col items-center justify-center p-3 backdrop-blur-xs">
              <QrCode className="w-14 h-14 text-cyan-300/70" />
              <span className="mt-1 text-[9px] font-mono text-sky-200/70">
                {liveWorkshop.liveQrToken.slice(0, 16)}
              </span>
            </div>

            {/* Animated Golden Horizontal Scan Line */}
            <div className="absolute left-4 right-4 h-[2.5px] bg-gradient-to-r from-transparent via-[#FBB03B] to-transparent shadow-[0_0_12px_#FBB03B] animate-scan-laser pointer-events-none" />
          </div>

          <p className="mt-3.5 text-[11px] text-sky-100/80 text-center font-medium">
            Point your camera at the workshop projector QR code
          </p>

          <button
            type="button"
            onClick={handleSimulatedCameraScan}
            className="mt-3.5 h-11 px-6 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#29D2FF] text-slate-950 font-black text-xs shadow-[0_4px_20px_rgba(41,210,255,0.35)] hover:opacity-95 active:scale-[0.98] transition flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Session QR Code</span>
          </button>
        </div>

        {/* OR Divider + 6-Digit Fallback Code Input */}
        <div
          className="space-y-3 animate-rise"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-[10px] font-black tracking-widest uppercase text-sky-200/70">
              OR ENTER SESSION CODE
            </span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={sixDigitCode}
                onChange={(e) => setSixDigitCode(e.target.value)}
                placeholder="Enter 6-digit projector code"
                className="flex-1 h-12 px-5 rounded-full bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-xs font-mono font-bold tracking-widest backdrop-blur-md focus:outline-none focus:border-[#29D2FF] focus:bg-white/15 transition-all"
              />
              <button
                type="submit"
                aria-label="Verify 6-digit code"
                className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:opacity-95 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(29,99,235,0.35)] active:scale-[0.98] transition shrink-0 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-sky-200/70 px-2 font-medium">
              <span>Displayed on room projector screen</span>
              <span className="text-emerald-300 font-bold tabular-nums">
                +{liveWorkshop.xpReward} XP Reward
              </span>
            </div>
          </form>

          {feedback && (
            <div
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-rise ${
                feedback.ok
                  ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                  : "bg-amber-500/20 border-amber-400/40 text-amber-200"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Bottom Stopwatch Card: QR code is valid for 04 : 58 */}
          <div className="rounded-full bg-white/10 border border-white/15 px-5 py-3 backdrop-blur-xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-sky-100 font-medium">
              <Clock className="w-4 h-4 text-[#38E4FF]" />
              <span>QR code is valid for</span>
            </div>
            <span className="font-mono text-sm font-black tracking-wider text-[#38E4FF] tabular-nums">
              {mins} : {secs}
            </span>
          </div>
        </div>
      </div>
    </MobileAppShell>
  );
}
