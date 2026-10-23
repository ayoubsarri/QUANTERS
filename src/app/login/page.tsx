"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  User,
  UserPlus,
  X,
} from "lucide-react";
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
    email: "ayoub.sarri@univ-alger.dz",
    role: "Member",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
  },
  {
    name: "Lotfi Benali",
    email: "lotfi.benali@univ-alger.dz",
    role: "Admin",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces",
  },
  {
    name: "Dr. Amine Cherif",
    email: "dr.amine.cherif@alumni-quanta.dz",
    role: "Alumni",
    avatar:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=128&h=128&fit=crop&crop=faces",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, registerAccount, syncWithServer } =
    useQuantersStore();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("ayoub.sarri@univ-alger.dz");
  const [password, setPassword] = useState("quanta2026");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const m = new URLSearchParams(window.location.search).get("mode");
      if (m === "register") setMode("register");
    }
  }, []);

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

  const handleGoogleLogin = async (accEmail: string, name?: string, avatar?: string) => {
    setErrorMsg(null);
    const res = loginWithGoogle(accEmail, name, avatar);
    setShowGoogleChooser(false);
    await syncWithServer();
    router.push(res.redirectPath);
  };

  return (
    <div className="min-h-dvh w-full bg-[#040C1A] text-white flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Subtle Ambient Cosmic Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-[#1D63EB]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[#38E4FF]/10 blur-[100px]" />
      </div>

      {/* Top Brand Logo */}
      <header className="relative z-10 pt-6 sm:pt-8 flex flex-col items-center">
        <Link href="/welcome" className="hover:opacity-95 transition">
          <QuantaLogo size={42} showSubtitle={true} />
        </Link>
      </header>

      {/* Centered Auth Card */}
      <main className="relative z-10 w-full max-w-[390px] my-auto">
        <div className="bg-[#0A1A30]/80 backdrop-blur-xl border border-white/12 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-5">
          <div className="text-center space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-xs font-medium text-slate-400">
              {mode === "signin"
                ? "Enter your credentials or continue with Google"
                : "Register to access workshops and club tracks"}
            </p>
          </div>

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={() => setShowGoogleChooser(true)}
            className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2.5 transition active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <GoogleLogoSvg className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-white/10 flex-1" />
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
              or
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          {mode === "signin" ? (
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
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
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
                    placeholder="Password"
                    className="w-full h-10 pl-9 pr-9 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                className="w-full h-11 mt-1 rounded-xl bg-[#1D63EB] hover:bg-[#2563EB] text-white font-display font-extrabold text-xs shadow-[0_4px_14px_rgba(29,99,235,0.4)] active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
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
                    placeholder="e.g. Amine Cherif"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
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
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
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
                    className="w-full h-10 pl-9 pr-9 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38E4FF] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                className="w-full h-11 mt-1 rounded-xl bg-[#1D63EB] hover:bg-[#2563EB] text-white font-display font-extrabold text-xs shadow-[0_4px_14px_rgba(29,99,235,0.4)] active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle Between Sign In and Register */}
          <div className="pt-2 text-center text-xs text-slate-400">
            {mode === "signin" ? (
              <span>
                New member?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMsg(null);
                  }}
                  className="font-bold text-[#38E4FF] hover:underline cursor-pointer"
                >
                  Create account
                </button>
              </span>
            ) : (
              <span>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                  }}
                  className="font-bold text-[#38E4FF] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-4 text-center font-mono text-[10px] text-slate-500 uppercase tracking-wider">
        Faculty of Sciences · University of Algiers 1
      </footer>

      {/* Google Quick Sign-In Modal */}
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
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {QUICK_SIGNIN_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleLogin(acc.email, acc.name, acc.avatar)}
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
    </div>
  );
}
