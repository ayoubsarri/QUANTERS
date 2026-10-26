"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Sparkles,
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
    <MobileAppShell className="bg-[#F4F7FB]">
      <div className="flex-1 w-full max-w-[480px] mx-auto flex flex-col px-4 sm:px-5 pt-2 pb-6 space-y-3.5 animate-rise">
        {/* Top Editorial Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-[#182C4E] active:scale-[0.98] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-[#182C4E] text-[10px] font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
              <span>Live Session</span>
            </span>
          </div>

          <div className="pt-0.5">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7]">
              OPTICAL VERIFICATION · LIVE CHECK-IN
            </p>
            <h1 className="font-display text-xl font-black tracking-tight text-[#0F1E36] leading-tight">
              Session Check-In
            </h1>
          </div>
        </div>

        {/* Compact Session Bar */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3 shadow-2xs flex items-start justify-between gap-2.5">
          <div className="min-w-0 space-y-1">
            <h2 className="text-xs font-extrabold text-[#0F1E36] leading-snug">
              {liveWorkshop.title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#0284C7] shrink-0" />
                <span>
                  {liveWorkshop.dateLabel} · {liveWorkshop.timeRange}
                </span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0284C7] shrink-0" />
                <span>{liveWorkshop.location}</span>
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-[10.5px] font-mono font-extrabold shrink-0 tabular-nums">
            <Sparkles className="w-3 h-3 text-[#0284C7]" />
            <span>+{liveWorkshop.xpReward} XP</span>
          </span>
        </div>

        {/* Softened Cosmic Slate-Navy Optical Scanner Card */}
        <div className="rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875]/60 p-4 shadow-[0_12px_32px_rgba(16,31,56,0.22)] flex flex-col items-center space-y-3.5">
          {/* Compact Optical Viewfinder */}
          <div className="w-[200px] h-[200px] rounded-xl bg-[#0B1528] border border-[#38BDF8]/30 mx-auto relative flex flex-col items-center justify-center overflow-hidden">
            {/* Stellar Cyan Corner Brackets (#38BDF8) */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-[3px] border-l-[3px] border-[#38BDF8] rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-[3px] border-r-[3px] border-[#38BDF8] rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-[3px] border-l-[3px] border-[#38BDF8] rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-[3px] border-r-[3px] border-[#38BDF8] rounded-br-lg" />

            {/* Simulated QR Target Inside Viewfinder */}
            <div className="w-24 h-24 rounded-lg border border-[#38BDF8]/25 bg-white/5 flex flex-col items-center justify-center p-2.5">
              <QrCode className="w-12 h-12 text-[#7DD3FC]" />
              <span className="mt-1 text-[8.5px] font-mono text-[#7DD3FC]/80">
                {liveWorkshop.liveQrToken.slice(0, 14)}
              </span>
            </div>

            {/* Smooth Cyan Horizontal Scan Line */}
            <div className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_12px_#38BDF8] animate-scan-laser pointer-events-none" />
          </div>

          <p className="text-[11px] text-slate-200 text-center font-medium">
            Align the projector QR code inside the optical frame
          </p>

          <button
            type="button"
            onClick={handleSimulatedCameraScan}
            className="h-10 px-5 rounded-lg bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0F1E36] font-display font-black text-xs active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Session QR Code</span>
          </button>
        </div>

        {/* Compact White Card for 6-Digit Projector Code */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#182C4E]">
              6-Digit Projector Code
            </span>
            <span className="text-[10.5px] text-slate-500 font-medium">
              Manual Fallback
            </span>
          </div>

          <form onSubmit={handleCodeSubmit} className="flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              value={sixDigitCode}
              onChange={(e) => setSixDigitCode(e.target.value)}
              placeholder="Enter 6-digit projector code"
              className="flex-1 h-10 px-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs font-mono font-bold text-[#0F1E36] placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] focus:bg-white transition-all"
            />
            <button
              type="submit"
              aria-label="Verify 6-digit code"
              className="h-10 px-4 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 hover:opacity-95 text-white text-xs font-bold active:scale-[0.98] transition shrink-0 cursor-pointer"
            >
              Verify
            </button>
          </form>

          {feedback && (
            <div
              className={`p-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 animate-rise ${
                feedback.ok
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Compact Validity Timer Strip */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>QR code valid for {mins}:{secs}</span>
            </div>
            <span className="font-mono text-xs font-black text-[#182C4E] tabular-nums">
              {mins}:{secs}
            </span>
          </div>
        </div>
      </div>
    </MobileAppShell>
  );
}
