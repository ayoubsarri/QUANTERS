"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Calendar,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Zap,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function WorkshopCheckInScannerPage() {
  const { t, lang, isRtl } = useTranslation();
  const workshops = useQuantersStore((s) => s.workshops);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const verifyWorkshopCheckIn = useQuantersStore(
    (s) => s.verifyWorkshopCheckIn
  );

  const liveWorkshop =
    workshops.find((w) => w.status === "Running") ||
    workshops.find((w) => w.status === "Published") ||
    workshops[0] || {
      id: "ws-none",
      title: "No Active Workshop Scheduled",
      dateLabel: "Awaiting Schedule",
      timeRange: "--:--",
      location: "QUANTA Campus Hub",
      xpReward: 150,
      liveSixDigitCode: "000000",
      liveQrToken: "QT-LIVE-STANDBY",
    };

  const [sixDigitCode, setSixDigitCode] = useState("");
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(298); // 04:58

  // Real Camera Stream State & Refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 298));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const mins = String(Math.floor(secondsRemaining / 60)).padStart(2, "0");
  const secs = String(secondsRemaining % 60).padStart(2, "0");

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera device or browser API is unavailable on this device.");
      return;
    }

    try {
      // Prefer back camera (environment) on mobile devices
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      console.warn("Failed to acquire camera stream:", err);
      // Fallback to any available video stream
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (fallbackErr: unknown) {
        setCameraError(
          "Camera permission denied or camera not found. You can simulate scan or use the 6-digit code below."
        );
        setIsCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleVerifyScan = () => {
    const res = verifyWorkshopCheckIn(
      liveWorkshop.id,
      currentMemberId,
      liveWorkshop.liveQrToken,
      "Member Scanned QR"
    );
    setFeedback(res);
    stopCamera();
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sixDigitCode.trim().toUpperCase();
    if (clean.length !== 6) {
      setFeedback({
        ok: false,
        message: "Please enter the complete 6-digit session code displayed on the projector.",
      });
      return;
    }
    const res = verifyWorkshopCheckIn(
      liveWorkshop.id,
      currentMemberId,
      clean,
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
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-[#182C4E] min-h-[44px] min-w-[44px] py-2.5 px-2 -ml-2 rounded-lg active:scale-[0.98] transition"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{t.common.back}</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-[#182C4E] text-[10px] font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
              <span>{isRtl ? "جلسة مباشرة" : "Live Session"}</span>
            </span>
          </div>

          <div className="pt-0.5">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7]">
              {isRtl ? "التحقق المباشر · تسجيل الحضور" : "OPTICAL VERIFICATION · LIVE CHECK-IN"}
            </p>
            <h1 className="font-display text-xl font-black tracking-tight text-[#0F1E36] leading-tight">
              {t.checkin.title}
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

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-[10.5px] font-sans font-extrabold shrink-0 tabular-nums">
            <Award className="w-3 h-3 text-[#0284C7]" />
            <span>+{liveWorkshop.xpReward} XP</span>
          </span>
        </div>

        {/* Softened Cosmic Slate-Navy Optical Scanner Card */}
        <div className="rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875]/60 p-4 shadow-[0_12px_32px_rgba(16,31,56,0.22)] flex flex-col items-center space-y-3.5">
          {/* Optical Viewfinder Frame (Real Camera Video or Target) */}
          <div className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] rounded-2xl bg-[#070E1A] border-2 border-[#38BDF8]/40 mx-auto relative flex flex-col items-center justify-center overflow-hidden shadow-inner">
            {/* Live Camera Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isCameraActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
              }`}
            />

            {/* Simulated QR Target (Shown when camera is inactive) */}
            {!isCameraActive && (
              <div className="w-28 h-28 rounded-xl border border-[#38BDF8]/30 bg-white/5 flex flex-col items-center justify-center p-2.5 z-0">
                <QrCode className="w-14 h-14 text-[#7DD3FC]" />
                <span className="mt-1.5 text-[9px] font-mono text-[#7DD3FC]/80 font-bold">
                  {(liveWorkshop.liveQrToken || "QT-LIVE-STANDBY").slice(0, 14)}
                </span>
              </div>
            )}

            {/* Active Camera Live Badge */}
            {isCameraActive && (
              <div className="absolute top-2.5 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-sans text-[9px] font-bold uppercase tracking-wider z-20 shadow-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                <span>LIVE OPTICAL CAM</span>
              </div>
            )}

            {/* Stellar Cyan Corner Brackets (#38BDF8) */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-[3px] border-l-[3px] border-[#38BDF8] rounded-tl-lg pointer-events-none z-20" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-[3px] border-r-[3px] border-[#38BDF8] rounded-tr-lg pointer-events-none z-20" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-[3px] border-l-[3px] border-[#38BDF8] rounded-bl-lg pointer-events-none z-20" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-[3px] border-r-[3px] border-[#38BDF8] rounded-br-lg pointer-events-none z-20" />

            {/* Smooth Cyan Horizontal Scan Line */}
            <div className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_14px_#38BDF8] animate-scan-laser pointer-events-none z-20" />
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="w-full p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-[11px] font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-200 text-center font-medium">
            {isCameraActive
              ? "Align the projector QR inside the viewfinder and click Verify"
              : "Tap below to activate device optical camera for check-in"}
          </p>

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-center gap-2 flex-wrap">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="h-11 min-h-[44px] px-5 rounded-lg bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0F1E36] font-display font-black text-xs active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Session QR Code</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleVerifyScan}
                  className="h-11 min-h-[44px] px-4 rounded-lg bg-[#34D399] hover:bg-[#6EE7B7] text-[#062419] font-display font-black text-xs active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Zap className="w-4 h-4" />
                  <span>Verify QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="h-11 min-h-[44px] px-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Close Cam</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Compact White Card for 6-Digit Projector Code */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#182C4E]">
              {isRtl ? "رمز الجلسة المعروض (6 أرقام)" : "6-Digit Projector Code"}
            </span>
            <span className="text-[10.5px] text-slate-500 font-medium">
              {isRtl ? "إدخال يدوي" : "Manual Fallback"}
            </span>
          </div>

          <form onSubmit={handleCodeSubmit} className="flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              value={sixDigitCode}
              onChange={(e) => setSixDigitCode(e.target.value)}
              placeholder={isRtl ? "أدخل الرمز السداسي للورشة..." : "Enter 6-digit projector code"}
              className="flex-1 h-11 min-h-[44px] px-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs font-mono font-bold text-[#0F1E36] placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] focus:bg-white transition-all text-center tracking-[0.2em]"
            />
            <button
              type="submit"
              disabled={sixDigitCode.trim().length !== 6}
              aria-label="Verify 6-digit code"
              className="h-11 min-h-[44px] px-4 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 hover:opacity-95 text-white text-xs font-bold active:scale-[0.98] transition shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-cairo"
            >
              {t.checkin.verifyButton}
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
