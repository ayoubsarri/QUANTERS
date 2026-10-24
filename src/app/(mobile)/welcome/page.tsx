"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  KeyRound,
  Mail,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

function GoogleLogoSvg({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  );
}

const QUICK_SIGNIN_ACCOUNTS = [
  {
    name: "Ayoub Sarri",
    shortLabel: "Ayoub",
    email: "ayoub.sarri@univ-alger.dz",
    role: "Member",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
  },
  {
    name: "Lotfi Benali",
    shortLabel: "Lotfi",
    email: "lotfi.benali@univ-alger.dz",
    role: "Admin",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces",
  },
  {
    name: "Dr. Amine Cherif",
    shortLabel: "Dr. Amine",
    email: "dr.amine.cherif@alumni-quanta.dz",
    role: "Alumni",
    avatar:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=128&h=128&fit=crop&crop=faces",
  },
];

type BackdropMode = "video" | "keyframe1" | "keyframe2";

export default function WelcomeSplashPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    loginWithEmail,
    loginWithGoogle,
    registerAccount,
    syncWithServer,
    userLowDataMode,
    settings,
  } = useQuantersStore();

  const skipHeavyVideo = userLowDataMode || settings.quotaSaverPreset === "ultra";

  // In-page Login Drawer state ("START BOTTOM THEN IN SAME PAGE THE LOGIN APPEAR")
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [backdropMode, setBackdropMode] = useState<BackdropMode>("keyframe1");

  // Auth form fields
  const [email, setEmail] = useState("ayoub.sarri@univ-alger.dz");
  const [password, setPassword] = useState("quanta2026");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  useEffect(() => {
    if (backdropMode === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback if autoplay is blocked
      });
    }
  }, [backdropMode]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = loginWithEmail(email, password);
    if (!res.ok) {
      setErrorMsg(res.message || "Invalid credentials.");
      return;
    }
    await syncWithServer();
    router.push(res.redirectPath);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg("Please provide your full name and email.");
      return;
    }
    const res = registerAccount({ fullName, email, password });
    if (!res.ok) {
      setErrorMsg(res.message || "Could not create account.");
      return;
    }
    await syncWithServer();
    router.push(res.redirectPath);
  };

  const handleQuickPersonaLogin = async (
    accEmail: string,
    name?: string,
    avatar?: string
  ) => {
    setErrorMsg(null);
    const res = loginWithGoogle(accEmail, name, avatar);
    setShowGoogleChooser(false);
    await syncWithServer();
    router.push(res.redirectPath);
  };

  const activePoster =
    backdropMode === "keyframe2"
      ? "/brand/welcome_keyframe_2.png"
      : "/brand/welcome_keyframe_1.png";

  return (
    <MobileAppShell
      hideBottomNav
      darkStatus
      className="bg-[#030914] text-white relative min-h-dvh flex flex-col justify-between overflow-hidden select-none"
    >
      {/* 1. Full-Bleed Cosmic Video / Yarn Astronaut Keyframe Stage */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {backdropMode === "video" ? (
          <video
            ref={videoRef}
            src="/brand/welcome_loop.mp4"
            poster="/brand/welcome_keyframe_1.png"
            preload="metadata"
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover object-center transition-all duration-500 ${
              authOpen ? "scale-[1.04] brightness-[0.45] blur-[3px]" : "scale-[1.01]"
            }`}
          />
        ) : (
          <img
            src={activePoster}
            alt="QUANTERS Knitted Astronaut Keyframe"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/brand/welcome_splash_bg.png";
            }}
            className={`w-full h-full object-cover object-center transition-all duration-500 ${
              authOpen ? "scale-[1.04] brightness-[0.45] blur-[3px]" : "scale-[1.01]"
            }`}
          />
        )}

        {/* Top & Bottom Atmospheric Vignette */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#030914]/90 via-[#030914]/40 to-transparent" />
        <div
          className={`absolute inset-x-0 bottom-0 transition-all duration-500 ${
            authOpen
              ? "h-full bg-[#030914]/55"
              : "h-72 bg-gradient-to-t from-[#030914] via-[#030914]/75 to-transparent"
          }`}
        />
      </div>

      {/* 2. Top Brand Header + Compact Keyframe Switcher */}
      <header
        className={`relative z-10 w-full max-w-[440px] mx-auto px-5 transition-all duration-300 ${
          authOpen ? "pt-4 sm:pt-6" : "pt-5 sm:pt-7"
        } flex flex-col items-center text-center`}
      >
        {/* Ultra-Compact Single-Line Backdrop Switcher */}
        <div className="mb-2 inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-[#081528]/85 backdrop-blur-md border border-white/10 text-[10px] font-mono whitespace-nowrap">
          <button
            type="button"
            onClick={() => setBackdropMode("keyframe1")}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
              backdropMode === "keyframe1"
                ? "bg-[#1D63EB] text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <ImageIcon className="w-2.5 h-2.5 shrink-0" />
            <span>Keyframe 1</span>
          </button>
          <button
            type="button"
            onClick={() => setBackdropMode("keyframe2")}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
              backdropMode === "keyframe2"
                ? "bg-[#1D63EB] text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Sparkles className="w-2.5 h-2.5 shrink-0" />
            <span>Keyframe 2</span>
          </button>
          <button
            type="button"
            onClick={() => setBackdropMode("video")}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
              backdropMode === "video"
                ? "bg-[#1D63EB] text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Film className="w-2.5 h-2.5 shrink-0" />
            <span>Loop Video</span>
          </button>
        </div>

        <QuantaLogo
          size={authOpen ? 40 : 48}
          showSubtitle
          centered
          variant="dark"
          className="drop-shadow-[0_6px_24px_rgba(0,0,0,0.75)] transition-all duration-300"
        />

        {/* 4 Pillars — sits cleanly above the astronaut helmet */}
        {!authOpen && (
          <div className="mt-2.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] animate-rise">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-display font-extrabold tracking-[0.2em] text-slate-100 uppercase">
              <span>DISCOVER</span>
              <span className="text-sky-400">·</span>
              <span className="text-[#38E4FF] drop-shadow-[0_0_12px_rgba(56,228,255,0.65)]">
                LEARN
              </span>
              <span className="text-sky-400">·</span>
              <span>PROVE</span>
              <span className="text-sky-400">·</span>
              <span>BELONG</span>
            </div>
          </div>
        )}
      </header>

      {/* 3. Center Stage Spacer + Handwritten Callout */}
      {!authOpen ? (
        <div className="relative z-10 w-full max-w-[440px] mx-auto px-6 my-auto flex justify-end pointer-events-none">
          <div className="mr-1 sm:mr-3 mt-16 -rotate-6 text-center font-script text-2xl sm:text-3xl leading-[1.08] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
            <div>More</div>
            <div>than a club,</div>
            <div>a scientific</div>
            <div>journey.</div>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 w-full cursor-pointer"
          onClick={() => setAuthOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 4. Bottom Interactive Dock: Either [Start] Splash Dock OR In-Page Login Sheet */}
      <footer className="relative z-20 w-full max-w-[420px] mx-auto px-4 pb-6 sm:pb-8 flex flex-col items-center">
        {!authOpen ? (
          /* STATE A: Clean Bottom Start Dock */
          <div className="w-full space-y-3.5 text-center animate-rise">
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="w-full h-13.5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#07152B] font-display font-black text-base tracking-tight shadow-[0_12px_36px_rgba(0,0,0,0.65)] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center justify-center gap-3.5 text-xs font-display font-bold text-sky-200/95">
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
                Explore Platform
              </Link>
            </div>

            <div className="pt-0.5 font-mono text-[10px] tracking-[0.16em] text-slate-400/90 uppercase">
              QUANTA SCIENTIFIC CLUB · UNIVERSITY OF ALGIERS 1
            </div>
          </div>
        ) : (
          /* STATE B: In-Page Slide-Up Login & Account Sheet */
          <div
            data-modal="true"
            role="dialog"
            aria-label="Member Sign In"
            className="w-full bg-[#081528]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.75)] space-y-4 text-left animate-rise"
          >
            {/* Sheet Top Header: Segmented Switcher + Collapse Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex p-1 rounded-lg bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-extrabold transition cursor-pointer ${
                    authMode === "signin"
                      ? "bg-[#1D63EB] text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-extrabold transition cursor-pointer ${
                    authMode === "register"
                      ? "bg-[#1D63EB] text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <button
                type="button"
                onClick={() => setAuthOpen(false)}
                aria-label="Close login panel"
                className="h-8 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            {/* 1-Tap Google Sign-In Button */}
            <button
              type="button"
              onClick={() => setShowGoogleChooser(true)}
              className="w-full h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer shadow-xs"
            >
              <GoogleLogoSvg className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-white/10 flex-1" />
              <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                or credentials
              </span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            {authMode === "signin" ? (
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Email or Quanter ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="email"
                      aria-label="Email or Quanter ID"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@univ-alger.dz"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      aria-label="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full h-10 pl-9 pr-9 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10.5 py-2.5 rounded-xl bg-[#1D63EB] hover:bg-[#2563EB] text-white font-display font-extrabold text-xs shadow-[0_4px_14px_rgba(29,99,235,0.4)] active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Sign In to QUANTERS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ayoub Sarri"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@univ-alger.dz"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full h-10 pl-9 pr-9 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10.5 py-2.5 rounded-xl bg-[#1D63EB] hover:bg-[#2563EB] text-white font-display font-extrabold text-xs shadow-[0_4px_14px_rgba(29,99,235,0.4)] active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Create Account &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 1-Tap Quick Demo Persona Strip */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                <span>1-Tap Quick Sign-In</span>
                <Link
                  href="/onboarding"
                  className="text-[#38E4FF] hover:underline font-sans font-bold normal-case"
                >
                  Full KYC Form →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {QUICK_SIGNIN_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() =>
                      handleQuickPersonaLogin(acc.email, acc.name, acc.avatar)
                    }
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/12 border border-white/10 flex items-center gap-1.5 text-left transition cursor-pointer"
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/20"
                    />
                    <div className="min-w-0">
                      <div className="text-[10.5px] font-extrabold text-white truncate leading-tight">
                        {acc.shortLabel}
                      </div>
                      <div className="text-[9px] font-mono text-sky-300 leading-tight">
                        {acc.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </footer>

      {/* Google Quick Account Chooser Modal */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-[#0A1A30] border border-white/15 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <GoogleLogoSvg className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Choose account</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleChooser(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {QUICK_SIGNIN_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() =>
                    handleQuickPersonaLogin(acc.email, acc.name, acc.avatar)
                  }
                  className="w-full p-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3 text-left transition cursor-pointer"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {acc.email}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-sky-200">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
