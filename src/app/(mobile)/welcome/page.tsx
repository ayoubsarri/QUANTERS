"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Monitor,
  Smartphone,
  User,
  X,
} from "lucide-react";
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

/**
 * Custom Architectural Orbital Crest for QUANTA Scientific Club · University of Algiers 1
 */
function UniversityOrbitalCrestSvg({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <circle
        cx="18"
        cy="18"
        r="16"
        className="fill-[#081A36]/80 stroke-[#38E4FF]/35"
        strokeWidth="1.2"
      />
      <ellipse
        cx="18"
        cy="18"
        rx="11.5"
        ry="4.8"
        transform="rotate(-28 18 18)"
        stroke="#38E4FF"
        strokeWidth="1.35"
        strokeOpacity="0.9"
      />
      <ellipse
        cx="18"
        cy="18"
        rx="11.5"
        ry="4.8"
        transform="rotate(28 18 18)"
        stroke="#60A5FA"
        strokeWidth="1.35"
        strokeOpacity="0.65"
      />
      <circle cx="18" cy="18" r="2.6" fill="#FFE500" />
      <circle cx="26.5" cy="13.5" r="1.5" fill="#38E4FF" />
      <circle cx="9.5" cy="22.5" r="1.4" fill="#38E4FF" />
    </svg>
  );
}

interface SavedLoginEntry {
  email: string;
  fullName: string;
  avatarUrl: string;
  roleLabel: string;
}

const SAVED_LOGINS_STORAGE_KEY = "quanters_saved_logins_v1";

// Shared in-memory Blob URL cache so the loop never makes repeated HTTP range requests
let sharedVideoBlobUrl: string | null = null;
let sharedVideoBlobPromise: Promise<string | null> | null = null;

function getOrLoadVideoBlobUrl(src: string): Promise<string | null> {
  if (sharedVideoBlobUrl) return Promise.resolve(sharedVideoBlobUrl);
  if (!sharedVideoBlobPromise) {
    sharedVideoBlobPromise = fetch(src)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob) return null;
        sharedVideoBlobUrl = URL.createObjectURL(blob);
        return sharedVideoBlobUrl;
      })
      .catch(() => null);
  }
  return sharedVideoBlobPromise;
}

/**
 * Dual-Buffered Zero-Saccade Seamless Loop Video Player
 * Combines the 211-frame optical-flow morphed video with an A/B pre-decoded
 * standby buffer swap so the browser never performs a visible EOF seek.
 */
function SeamlessLoopVideo({
  src = "/brand/welcome_loop.mp4",
  poster = "/brand/welcome_keyframe_1.png",
  className = "",
}: {
  src?: string;
  poster?: string;
  className?: string;
}) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const activeSlotRef = useRef<0 | 1>(0);
  const swappingRef = useRef(false);
  const [videoSrc, setVideoSrc] = useState<string>(src);

  useEffect(() => {
    let mounted = true;
    getOrLoadVideoBlobUrl(src).then((blobUrl) => {
      if (mounted && blobUrl) {
        setVideoSrc(blobUrl);
      }
    });
    return () => {
      mounted = false;
    };
  }, [src]);

  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB) return;

    const active = activeSlotRef.current === 0 ? vA : vB;
    const standby = activeSlotRef.current === 0 ? vB : vA;

    standby.pause();
    standby.currentTime = 0;
    active.play().catch(() => {});

    let rafId: number;
    const tick = () => {
      const curr = activeSlotRef.current === 0 ? videoARef.current : videoBRef.current;
      const next = activeSlotRef.current === 0 ? videoBRef.current : videoARef.current;

      if (
        curr &&
        next &&
        !swappingRef.current &&
        curr.duration > 1 &&
        curr.duration - curr.currentTime <= 0.14
      ) {
        swappingRef.current = true;
        const nextSlot: 0 | 1 = activeSlotRef.current === 0 ? 1 : 0;

        next.currentTime = 0;
        next.play().catch(() => {});
        activeSlotRef.current = nextSlot;
        setActiveSlot(nextSlot);

        window.setTimeout(() => {
          curr.pause();
          curr.currentTime = 0;
          swappingRef.current = false;
        }, 160);
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [videoSrc]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <video
        ref={videoARef}
        src={videoSrc}
        poster={poster}
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-150 ease-linear ${
          activeSlot === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      />
      <video
        ref={videoBRef}
        src={videoSrc}
        poster={poster}
        preload="auto"
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-150 ease-linear ${
          activeSlot === 1 ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      />
    </div>
  );
}

export default function WelcomeSplashPage() {
  const router = useRouter();

  const {
    departments,
    teams,
    loginWithEmail,
    loginWithGoogle,
    registerAccount,
    syncWithServer,
  } = useQuantersStore();

  // In-page Login Drawer state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  // Auth form fields
  const [email, setEmail] = useState("ayoub.sarri@univ-alger.dz");
  const [password, setPassword] = useState("quanta2026");
  const [fullName, setFullName] = useState("");
  const [registerAsAlumni, setRegisterAsAlumni] = useState(false);
  const [saveForQuickAccess, setSaveForQuickAccess] = useState(true);
  const [savedLogins, setSavedLogins] = useState<SavedLoginEntry[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Download App state & native install prompt capture
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [appDownloadedToast, setAppDownloadedToast] = useState(false);

  // Hydrate saved logins from localStorage (Quick Access ONLY for saved logins)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_LOGINS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedLogins(
            parsed.filter(
              (item) => item && typeof item.email === "string" && item.fullName
            )
          );
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const deriveMemberRoleBadge = (m?: {
    id: string;
    status?: string;
    departmentId?: string;
  }): string => {
    if (!m) return "Member";
    if (m.status === "Alumni") return "Alumni";
    const managedDept = departments.find((d) => d.headMemberId === m.id);
    if (managedDept) return `${managedDept.shortName} Manager`;
    const subDept = departments.find((d) => d.coManagerMemberId === m.id);
    if (subDept) return `${subDept.shortName} Sub-Manager`;
    const ledTeam = teams.find((t) => !t.archived && t.leaderMemberId === m.id);
    if (ledTeam) return "Team Leader";
    const dept = departments.find((d) => d.id === m.departmentId);
    return dept ? dept.shortName : "Member";
  };

  const persistSavedLogin = (memberObj?: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string;
    status?: string;
    departmentId?: string;
  }) => {
    if (!saveForQuickAccess || !memberObj) return;
    try {
      const entry: SavedLoginEntry = {
        email: memberObj.email,
        fullName: memberObj.fullName,
        avatarUrl: memberObj.avatarUrl,
        roleLabel: deriveMemberRoleBadge(memberObj),
      };
      const updated = [
        entry,
        ...savedLogins.filter(
          (item) => item.email.toLowerCase() !== entry.email.toLowerCase()
        ),
      ].slice(0, 6);
      setSavedLogins(updated);
      window.localStorage.setItem(
        SAVED_LOGINS_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // ignore storage errors
    }
  };

  const removeSavedLogin = (targetEmail: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = savedLogins.filter(
        (item) => item.email.toLowerCase() !== targetEmail.toLowerCase()
      );
      setSavedLogins(updated);
      window.localStorage.setItem(
        SAVED_LOGINS_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleDownloadAppClick = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice?.outcome === "accepted") {
          setAppDownloadedToast(true);
          window.setTimeout(() => setAppDownloadedToast(false), 3500);
        }
        setDeferredInstallPrompt(null);
        return;
      } catch {
        // Fallback to Download App modal
      }
    }
    setShowDownloadModal(true);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = loginWithEmail(email, password);
    if (!res.ok) {
      setErrorMsg(res.message || "Invalid credentials.");
      return;
    }
    persistSavedLogin(res.member);
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
    const res = registerAccount({
      fullName,
      email,
      password,
      isAlumni: registerAsAlumni,
    });
    if (!res.ok) {
      setErrorMsg(res.message || "Could not create account.");
      return;
    }
    persistSavedLogin(res.member);
    await syncWithServer();
    router.push(res.redirectPath);
  };

  const handleSavedAccountLogin = async (saved: SavedLoginEntry) => {
    setErrorMsg(null);
    const res = loginWithEmail(saved.email, "quanta2026");
    if (!res.ok) {
      const gRes = loginWithGoogle(saved.email, saved.fullName, saved.avatarUrl);
      await syncWithServer();
      router.push(gRes.redirectPath);
      return;
    }
    await syncWithServer();
    router.push(res.redirectPath);
  };

  return (
    <div className="min-h-dvh w-full bg-[#030812] text-white relative overflow-hidden select-none flex flex-col justify-between">
      {/* =====================================================================
          1. AMBIENT VIDEO BACKDROP
          - Phone (< lg): Full-bleed crystal-clear 9:16 crocheted astronaut loop
          - PC (lg+): Softly blurred atmospheric cosmos behind the 2-column stage
         ===================================================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <SeamlessLoopVideo
          src="/brand/welcome_loop.mp4"
          poster="/brand/welcome_keyframe_1.png"
          className={`transition-all duration-500 ${
            authOpen
              ? "scale-[1.04] brightness-[0.36] blur-[4px] lg:blur-2xl lg:brightness-[0.2]"
              : "scale-[1.01] lg:scale-110 lg:blur-2xl lg:brightness-[0.24]"
          }`}
        />

        {/* Subtle architectural dot grid on desktop */}
        <div className="hidden lg:block absolute inset-0 bg-quanta-grid-dark opacity-30" />

        {/* Phone Top & Bottom Vignettes (Leaves center 60% clear for the astronaut & galaxy) */}
        <div className="lg:hidden absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#030812]/90 via-[#030812]/40 to-transparent" />
        <div
          className={`lg:hidden absolute inset-x-0 bottom-0 transition-all duration-500 ${
            authOpen
              ? "h-full bg-[#030812]/65"
              : "h-64 bg-gradient-to-t from-[#030812] via-[#030812]/80 to-transparent"
          }`}
        />
      </div>

      {/* =====================================================================
          2. RESPONSIVE STAGE CONTAINER
          - Phone (< lg): Full-height vertical column (Top Brand -> Astronaut -> Bottom Dock)
          - PC (lg+): 12-Column Split Stage (Left 9:16 Uncropped Video Portal | Right Brand & Auth)
         ===================================================================== */}
      <div className="relative z-10 w-full max-w-[440px] lg:max-w-[1140px] mx-auto min-h-dvh px-5 sm:px-6 lg:px-10 py-5 sm:py-6 lg:py-8 flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center justify-between">
        {/* -------------------------------------------------------------------
            LEFT COLUMN (PC ONLY): Uncropped 9:16 Cinema Portal
           ------------------------------------------------------------------- */}
        <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
          <div className="relative w-full max-w-[380px] aspect-[9/16] max-h-[84dvh] rounded-2xl overflow-hidden border border-white/15 bg-[#040B18] shadow-[0_28px_90px_rgba(0,0,0,0.85)]">
            <SeamlessLoopVideo
              src="/brand/welcome_loop.mp4"
              poster="/brand/welcome_keyframe_1.png"
            />

            {/* Subtle top & bottom cinema frame gradients */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#030812]/65 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#030812]/90 via-[#030812]/35 to-transparent pointer-events-none" />

            {/* Clean Minimal Bottom Signature inside the PC Video Frame */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38E4FF] animate-pulse" />
                  <span className="font-mono text-xs tracking-[0.14em] text-[#38E4FF] uppercase font-bold">
                    CYCLE 2026 / 27
                  </span>
                </div>
                <div className="text-xs font-display font-medium text-slate-300 mt-0.5">
                  Explore · Build · Verify
                </div>
              </div>
              <img
                src="/brand/logo_quanta_opt.webp"
                alt="QUANTA"
                className="w-7 h-7 object-contain opacity-90 drop-shadow-[0_2px_8px_rgba(56,228,255,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------
            RIGHT / MAIN COLUMN (Phone Full Screen & PC Right 7 Columns)
           ------------------------------------------------------------------- */}
        <div className="w-full flex-1 lg:col-span-7 flex flex-col justify-between min-h-[calc(100dvh-2.5rem)] lg:min-h-[82dvh] lg:py-2">
          {/* A. ORIGINAL EDITORIAL BRAND LOCKUP & 4-PILLAR HAIRLINE BAR */}
          <header className="w-full space-y-3 animate-rise">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Pure Emblem + Geometric Wordmark */}
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 rounded-full bg-[#38E4FF]/20 blur-md pointer-events-none" />
                  <img
                    src="/brand/logo_quanta_opt.webp"
                    alt="QUANTA Logo"
                    className="w-10 h-10 sm:w-11 sm:h-11 object-contain relative z-10 drop-shadow-[0_4px_14px_rgba(56,228,255,0.5)]"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-2xl sm:text-3xl lg:text-[32px] tracking-[-0.03em] text-white leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                      QUANTERS
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#38E4FF] shadow-[0_0_10px_#38E4FF]" />
                  </div>
                  <div className="mt-1 flex items-center gap-2 whitespace-nowrap">
                    <span className="font-display text-xs font-extrabold tracking-[0.2em] text-[#38E4FF] uppercase leading-none">
                      BY QUANTA
                    </span>
                    <span className="text-white/25">•</span>
                    <span className="font-mono text-xs font-medium tracking-[0.08em] text-slate-300/90 leading-none">
                      ALGIERS 1
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Single-Line Architectural 4-Pillar Hairline Bar + Open Editorial Download Row (Zero AI Boxes) */}
            {!authOpen && (
              <div className="space-y-0">
                <div className="flex items-center justify-between border-y border-white/15 py-2 px-0.5 text-xs font-display font-extrabold tracking-[0.14em] uppercase whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  <span className="text-slate-200">DISCOVER</span>
                  <span className="text-white/25">/</span>
                  <span className="text-[#38E4FF]">LEARN</span>
                  <span className="text-white/25">/</span>
                  <span className="text-slate-200">PROVE</span>
                  <span className="text-white/25">/</span>
                  <span className="text-slate-200">BELONG</span>
                </div>

                {/* Open Unboxed Horizontal Download App Strip right under header text */}
                <button
                  type="button"
                  onClick={handleDownloadAppClick}
                  className="w-full flex items-center justify-between gap-2 border-b border-white/12 py-2 px-0.5 active:scale-[0.99] transition-all cursor-pointer group drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                >
                  <span className="font-editorial italic text-base sm:text-lg text-slate-200 group-hover:text-white transition-colors whitespace-nowrap leading-none">
                    Available for phone &amp; desktop
                  </span>

                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-[0.12em] uppercase text-[#38E4FF] group-hover:text-white transition-colors whitespace-nowrap">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="animate-download-bob text-[#38E4FF] group-hover:text-[#FFE500] transition-colors shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 2V10.5M8 10.5L4.8 7.3M8 10.5L11.2 7.3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.5 13.2H13.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="border-b border-[#38E4FF]/55 group-hover:border-white pb-0.5">
                      Download App
                    </span>
                  </span>
                </button>
              </div>
            )}
          </header>

          {/* B. CENTER STAGE
              - On Phone (< lg): Open transparent window so the floating crocheted astronaut & galaxy shine unobstructed
              - On PC (lg+): High-impact Editorial Manifesto Headline when Login is closed */}
          {!authOpen ? (
            <div className="my-auto py-4 lg:py-6">
              <div className="hidden lg:block space-y-4 max-w-[540px] animate-rise">
                <h1 className="font-display font-black text-4xl xl:text-[52px] tracking-[-0.03em] text-white leading-[1.06]">
                  More than a club,{" "}
                  <span className="block font-editorial italic font-normal text-[#38E4FF] text-5xl xl:text-[62px] tracking-normal mt-1">
                    a scientific journey.
                  </span>
                </h1>

                <p className="text-sm text-slate-300/90 leading-relaxed max-w-[460px]">
                  Join hands-on workshops, verify laboratory and technical skills,
                  collaborate across scientific teams, and build your academic
                  track record at the University of Algiers 1.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 w-full cursor-pointer lg:hidden"
              onClick={() => setAuthOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* C. BOTTOM INTERACTIVE DOCK
              - State 1 (!authOpen): Editorial Callout + [Start] Button + Creative Institutional Crest
              - State 2 (authOpen): In-Page Slide-Up Login & Account Sheet */}
          <footer className="w-full space-y-3.5">
            {!authOpen ? (
              <div className="w-full space-y-3.5 animate-rise">
                {/* Phone Editorial Statement right above Start button */}
                <div className="lg:hidden px-0.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                  <p className="font-display font-black text-xl sm:text-2xl tracking-[-0.02em] text-white leading-tight">
                    More than a club,{" "}
                    <span className="font-editorial italic font-normal text-[#38E4FF] text-[26px] sm:text-3xl">
                      a scientific journey.
                    </span>
                  </p>
                </div>

                {/* Primary Bottom Start Button (Substantial 56px Height) */}
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="w-full h-14 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#061326] shadow-[0_16px_40px_rgba(0,0,0,0.75)] active:scale-[0.99] transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display font-black text-lg tracking-tight text-[#061326]">
                      Start
                    </span>
                    <span className="h-4 w-px bg-slate-300" />
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                      Member Portal
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-[#07162E] group-hover:bg-[#1D63EB] text-[#38E4FF] group-hover:text-white flex items-center justify-center transition">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {/* Creative Architectural Institutional Signature (Zero Heavy Box):
                    QUANTA SCIENTIFIC CLUB · UNIVERSITY OF ALGIERS 1 */}
                <div className="pt-1">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-[#38E4FF]/35 to-transparent mb-3" />
                  <div className="flex items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UniversityOrbitalCrestSvg className="w-8 h-8 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-display font-extrabold text-xs tracking-[0.14em] text-white uppercase truncate">
                          QUANTA SCIENTIFIC CLUB
                        </div>
                        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-[#38E4FF] uppercase truncate">
                          UNIVERSITY OF ALGIERS 1
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block shrink-0 pl-3 border-l border-white/15 text-right">
                      <div className="font-mono text-xs font-semibold tracking-[0.1em] text-slate-300 uppercase">
                        FAC. SCIENCES
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* STATE B: Redesigned In-Page Login & Account Box */
              <div
                data-modal="true"
                role="dialog"
                aria-label="Member Sign In"
                className="w-full bg-gradient-to-b from-[#132441]/95 via-[#0E1B31]/98 to-[#091324]/98 backdrop-blur-2xl border border-[#2B4875]/75 rounded-2xl p-4 sm:p-5 shadow-[0_24px_64px_rgba(3,8,18,0.88)] space-y-3 text-left animate-rise"
              >
                {/* Top Row: Title + Close Icon */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#7DD3FC] block">
                      QUANTERS PORTAL
                    </span>
                    <h2 className="font-display text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                      {authMode === "signin" ? "Member Sign In" : "Create Account"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAuthOpen(false)}
                    aria-label="Close login panel"
                    className="w-8 h-8 rounded-lg bg-[#0B1528] hover:bg-[#182C4E] border border-[#2B4875] text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Segmented Mode Switcher */}
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#081223] border border-[#2B4875]/60">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setErrorMsg(null);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      authMode === "signin"
                        ? "bg-[#182C4E] text-white border border-[#38BDF8]/35 shadow-2xs"
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
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      authMode === "register"
                        ? "bg-[#182C4E] text-white border border-[#38BDF8]/35 shadow-2xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Quick Access: ONLY Rendered When User Has Saved Logins */}
                {savedLogins.length > 0 && authMode === "signin" && (
                  <div className="p-2.5 rounded-xl bg-[#081223]/90 border border-[#2B4875]/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[#7DD3FC]">
                      <span>Quick Access · Saved Logins</span>
                      <span className="text-slate-400">{savedLogins.length} saved</span>
                    </div>
                    <div className="space-y-1">
                      {savedLogins.map((saved) => (
                        <div
                          key={saved.email}
                          onClick={() => handleSavedAccountLogin(saved)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSavedAccountLogin(saved);
                            }
                          }}
                          className="w-full p-2 rounded-lg bg-[#11203A] hover:bg-[#182C4E] border border-[#2B4875]/70 flex items-center justify-between gap-2 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={saved.avatarUrl}
                              alt={saved.fullName}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#38BDF8]/40"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-white leading-tight truncate">
                                {saved.fullName}
                              </p>
                              <p className="text-[10px] font-mono text-[#7DD3FC] leading-tight truncate">
                                {saved.roleLabel} · {saved.email}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => removeSavedLogin(saved.email, e)}
                            aria-label={`Remove saved login for ${saved.fullName}`}
                            className="w-6 h-6 rounded-md hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
                            title="Remove saved login"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold text-center">
                    {errorMsg}
                  </div>
                )}

                {authMode === "signin" ? (
                  <form onSubmit={handleEmailSignIn} className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Email or Quanter ID
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#7DD3FC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          name="email"
                          aria-label="Email or Quanter ID"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@univ-alger.dz"
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#081223] border border-[#2B4875] text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-[#7DD3FC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          aria-label="Password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full h-10 pl-9 pr-9 rounded-xl bg-[#081223] border border-[#2B4875] text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Save login for Quick Access checkbox */}
                    <label className="flex items-center gap-2 pt-0.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveForQuickAccess}
                        onChange={(e) => setSaveForQuickAccess(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-[#2B4875] bg-[#081223] accent-[#38BDF8]"
                      />
                      <span className="text-[11px] font-medium text-slate-300">
                        Save login for Quick Access on this device
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#182C4E] hover:brightness-110 border border-[#38BDF8]/40 text-white font-display font-extrabold text-xs shadow-[0_8px_24px_rgba(2,132,199,0.3)] active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-2.5">
                    {/* Member vs Alumni Track Selector */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRegisterAsAlumni(false)}
                        className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                          !registerAsAlumni
                            ? "bg-[#182C4E] text-[#7DD3FC] border-[#38BDF8]/45"
                            : "bg-[#081223] text-slate-400 border-[#2B4875]/60"
                        }`}
                      >
                        Student Member
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterAsAlumni(true)}
                        className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                          registerAsAlumni
                            ? "bg-[#182C4E] text-[#7DD3FC] border-[#38BDF8]/45"
                            : "bg-[#081223] text-slate-400 border-[#2B4875]/60"
                        }`}
                      >
                        QUANTA Alumni
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#7DD3FC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Ayoub Sarri"
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#081223] border border-[#2B4875] text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#7DD3FC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@univ-alger.dz"
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#081223] border border-[#2B4875] text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-[#7DD3FC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full h-10 pl-9 pr-9 rounded-xl bg-[#081223] border border-[#2B4875] text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#182C4E] hover:brightness-110 border border-[#38BDF8]/40 text-white font-display font-extrabold text-xs shadow-[0_8px_24px_rgba(2,132,199,0.3)] active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Create Account &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </footer>
        </div>
      </div>

      {/* Download App Modal (Zero mention of PWA) */}
      {showDownloadModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="w-full max-w-[380px] bg-[#07152B] border border-[#38E4FF]/30 rounded-2xl p-5 shadow-[0_24px_80px_rgba(0,0,0,0.85)] space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#38E4FF]/15 border border-[#38E4FF]/35 flex items-center justify-center text-[#38E4FF] shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white leading-tight">
                    Download QUANTERS App
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Get instant home-screen &amp; desktop access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close download dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-[#38E4FF] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-xs font-display font-bold text-white">
                    On Phone (Android &amp; iOS)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tap your browser menu or Share icon and select{" "}
                    <span className="text-[#38E4FF] font-semibold">
                      Install App
                    </span>{" "}
                    or{" "}
                    <span className="text-[#38E4FF] font-semibold">
                      Add to Home Screen
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Monitor className="w-4 h-4 text-[#38E4FF] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-xs font-display font-bold text-white">
                    On Computer (Windows &amp; Mac)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click the{" "}
                    <span className="text-[#38E4FF] font-semibold">
                      Install QUANTERS
                    </span>{" "}
                    icon in the right side of your address bar.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDownloadModal(false);
                  setAppDownloadedToast(true);
                  window.setTimeout(() => setAppDownloadedToast(false), 3200);
                }}
                className="flex-1 h-10 rounded-xl bg-[#38E4FF] hover:bg-[#60ECFF] text-[#041022] font-display font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Got It · Ready to Install</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {appDownloadedToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#071B36]/95 border border-[#38E4FF]/40 text-white text-xs font-display font-bold shadow-xl">
          <Check className="w-4 h-4 text-[#38E4FF]" />
          <span>QUANTERS App ready on your device</span>
        </div>
      )}
    </div>
  );
}
