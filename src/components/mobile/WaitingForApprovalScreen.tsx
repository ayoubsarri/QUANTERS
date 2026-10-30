"use client";

import React, { useState } from "react";
import {
  Clock,
  Check,
  RefreshCw,
  LogOut,
  FileCheck,
  Unlock,
  Sparkles,
  User,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { QuantaLogo } from "@/components/shared/QuantaLogo";

export function WaitingForApprovalScreen() {
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);
  const departments = useQuantersStore((s) => s.departments);
  const logout = useQuantersStore((s) => s.logout);
  const pullExactUpdatesFromServer = useQuantersStore(
    (s) => s.pullExactUpdatesFromServer
  );

  const [checking, setChecking] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState<string | null>(null);

  const member = members.find((m) => m.id === currentMemberId);
  const dept = departments.find((d) => d.id === member?.departmentId);

  const handleCheckStatus = async () => {
    setChecking(true);
    setLastCheckMessage(null);
    try {
      await pullExactUpdatesFromServer();
      const updated = useQuantersStore
        .getState()
        .members.find((m) => m.id === currentMemberId);

      if (
        updated &&
        (updated.status === "Trainee" ||
          updated.status === "Active" ||
          updated.onboardingTicks?.hrApproved)
      ) {
        setLastCheckMessage("Congratulations! Your admission has been approved.");
      } else {
        setLastCheckMessage("Your dossier is currently under review by the Bureau. Please check back shortly.");
      }
    } catch {
      setLastCheckMessage("Unable to reach server. Please check your network connection.");
    } finally {
      setChecking(false);
    }
  };

  const displayName = member?.fullName?.trim() || "Candidate Quanter";
  const displayId = member?.quanterId || "QT-26-Pending";
  const displayDept = dept?.shortName || dept?.name || "Technical Solutions";
  const avatarUrl =
    member?.avatarUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces";

  return (
    <div className="min-h-dvh max-h-dvh w-full bg-[#030713] text-white flex flex-col justify-between overflow-y-auto select-none relative">
      {/* 1. Immersive Cosmic Background Artwork (+20% more visible per user request) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="/brand/hr_waiting_cosmic_bg.png"
          alt="QUANTA Cosmic Mascot Background"
          className="w-full h-full object-cover object-center opacity-50 sm:opacity-60 scale-105 filter saturate-110"
        />
        {/* Soft Cosmic Vignettes to ensure 100% text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030713] via-[#030713]/65 to-[#030713]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030713_75%)]" />
      </div>

      {/* 2. Top Header Bar — Clean, perfectly aligned, zero text overlap */}
      <header className="relative z-20 shrink-0 px-4 py-3 sm:px-6 flex items-center justify-between border-b border-white/[0.08] bg-[#030713]/85 backdrop-blur-xl">
        <div className="flex items-center">
          <QuantaLogo size={24} showWordmark={true} variant="dark" />
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            if (typeof window !== "undefined") {
              window.location.replace("/welcome");
            }
          }}
          className="h-8 px-2.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Sign out of this session"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>

      {/* 3. Main Center Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 max-w-md mx-auto w-full text-center space-y-3.5 sm:space-y-4">
        
        {/* Executive Review Badge: Less curved (rounded-md), sleek tech style */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-400/35 text-amber-300 text-[10.5px] font-mono font-bold tracking-wider uppercase backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>EXECUTIVE REVIEW IN PROGRESS</span>
        </div>

        {/* Creative Holographic Candidate Card with Animated Perimeter Lines */}
        <div className="relative w-full max-w-[340px] mx-auto p-[1.5px] rounded-2xl overflow-hidden shadow-[0_0_36px_rgba(56,189,248,0.22)] group">
          {/* Animated Boundary Line 1: Rotating Conic Laser Sweep */}
          <div
            className="absolute -inset-[100%] animate-spin [animation-duration:8s] opacity-80 pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg, #38BDF8 0deg, #0284C7 35deg, transparent 65deg, transparent 180deg, #F59E0B 215deg, transparent 255deg, #38BDF8 360deg)",
            }}
          />

          {/* Animated Boundary Line 2: Counter-Rotating Secondary Aura */}
          <div
            className="absolute -inset-[100%] animate-spin [animation-duration:14s] [animation-direction:reverse] opacity-40 pointer-events-none"
            style={{
              background:
                "conic-gradient(from 180deg, transparent 0deg, #38BDF8 90deg, transparent 180deg, #00E5FF 270deg, transparent 360deg)",
            }}
          />

          {/* Inner Card Container */}
          <div className="relative rounded-[calc(1rem-1.5px)] bg-[#07152E]/90 backdrop-blur-2xl p-3.5 sm:p-4 border border-white/10 text-left overflow-hidden">
            {/* Subtle Horizontal Scanlight Line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#38BDF8]/10 to-transparent animate-pulse [animation-duration:3s] pointer-events-none" />

            {/* Profile Avatar & Details Row */}
            <div className="relative z-10 flex items-center gap-3.5">
              {/* Avatar with Animated Cyan Rim */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-2 ring-[#38BDF8]/60 shadow-[0_0_18px_rgba(56,189,248,0.4)] bg-[#0A1A36]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="w-7 h-7" />
                    </div>
                  )}
                </div>
                {/* Live Candidate Beacon */}
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#07152E] absolute -bottom-0.5 -right-0.5 shadow-[0_0_8px_#10B981] animate-pulse" />
              </div>

              {/* Name & Credentials */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display font-bold text-white text-base sm:text-lg tracking-tight truncate leading-snug">
                    {displayName}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-[#7DD3FC] mt-0.5">
                  <span className="font-bold text-white">{displayId}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 truncate">{displayDept}</span>
                </div>

                {/* Status Chip */}
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-[10px] font-mono text-amber-300">
                  <Clock className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                  <span className="truncate">Awaiting HR Accreditation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-1">
          <h1 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            Waiting for HR Approval
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto font-normal">
            Your registration dossier has been submitted to the Executive Bureau. Access to workspaces and research labs activates automatically once approved.
          </p>
        </div>

        {/* 4 Creative Connected Quantum Steps (Segmented horizontal stepper — zero line through boxes!) */}
        <div className="w-full max-w-[340px] mx-auto py-1">
          <div className="flex items-center justify-between">
            {/* Step 1: Account */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#04241B] border border-emerald-400/90 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="mt-1.5 text-[10px] font-mono font-bold text-emerald-300 tracking-tight">
                Account
              </span>
            </div>

            {/* Rail Segment 1 -> 2 (Completed Green Rail) */}
            <div className="flex-1 h-[2px] mx-1.5 -mt-3.5 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />

            {/* Step 2: Dossier */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#04241B] border border-emerald-400/90 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                <FileCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="mt-1.5 text-[10px] font-mono font-bold text-emerald-300 tracking-tight">
                Dossier
              </span>
            </div>

            {/* Rail Segment 2 -> 3 (Active Transition Gradient Rail) */}
            <div className="flex-1 h-[2px] mx-1.5 -mt-3.5 bg-gradient-to-r from-emerald-400 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />

            {/* Step 3: Review (Active) */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#221605] border border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.5)] animate-pulse">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="mt-1.5 text-[10px] font-mono font-black text-amber-300 tracking-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                Review
              </span>
            </div>

            {/* Rail Segment 3 -> 4 (Pending Muted Rail) */}
            <div className="flex-1 h-[2px] mx-1.5 -mt-3.5 bg-white/10" />

            {/* Step 4: Access (Final Destination - strictly NO 'access key' text!) */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#091528] border border-white/20 flex items-center justify-center text-slate-400">
                <Unlock className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="mt-1.5 text-[10px] font-mono font-semibold text-slate-400 tracking-tight">
                Access
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="w-full max-w-[340px] mx-auto space-y-2 pt-0.5">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0284C7] to-[#0369A1] hover:brightness-110 active:scale-[0.98] border border-[#38BDF8]/50 text-white font-display font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(2,132,199,0.35)] transition cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#E0F2FE] ${
                checking ? "animate-spin" : ""
              }`}
            />
            <span>
              {checking ? "Checking Live Admission..." : "Check Admission Status"}
            </span>
          </button>

          {lastCheckMessage && (
            <p className="text-[11px] text-center font-mono text-[#7DD3FC] py-1 px-2 animate-fade-in">
              {lastCheckMessage}
            </p>
          )}
        </div>

      </main>

      {/* 4. Discreet Minimal Footer */}
      <footer className="relative z-10 shrink-0 py-2.5 px-4 text-center border-t border-white/[0.06] bg-[#030713]/70 backdrop-blur-md">
        <p className="text-[10px] text-slate-400">
          QUANTA Scientific Club · For urgent inquiries:{" "}
          <span className="text-slate-300 font-mono">hr.quanta@univ-alger.dz</span>
        </p>
      </footer>
    </div>
  );
}
