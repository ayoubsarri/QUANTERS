"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { BottomNavBar } from "./BottomNavBar";
import { MilestoneCelebrationModal } from "./MilestoneCelebrationModal";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { QuantaLogo } from "@/components/shared/QuantaLogo";

interface MobileAppShellProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  darkStatus?: boolean;
  className?: string;
}

const PUBLIC_PATHS = ["/welcome", "/onboarding"];

export function MobileAppShell({
  children,
  hideBottomNav = false,
  darkStatus = false,
  className = "bg-[#F4F7FB]",
}: MobileAppShellProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const hasValidSession = useQuantersStore(
    (s) =>
      s.isAuthenticated &&
      Boolean(s.currentMemberId) &&
      s.members.some((m) => m.id === s.currentMemberId)
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isPublicRoute = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  useEffect(() => {
    if (hydrated && !isPublicRoute && !hasValidSession) {
      router.replace("/welcome");
    }
  }, [hydrated, isPublicRoute, hasValidSession, router]);

  if (hydrated && !isPublicRoute && !hasValidSession) {
    return (
      <div className="min-h-dvh w-full bg-[#F4F7FB] flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-xl bg-white border border-slate-200/90 p-6 text-center shadow-[0_12px_32px_rgba(15,30,54,0.08)] space-y-4">
          <div className="flex justify-center">
            <QuantaLogo size={30} showWordmark variant="light" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F0F6FF] border border-[#D5E3F5] text-[#0284C7] flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-base font-black text-[#0F1E36]">
              Member Sign-In Required
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please sign in with your personal QUANTA member account to access your private workspace.
            </p>
          </div>
          <Link
            href="/welcome"
            className="w-full h-10 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/75 text-white font-display text-xs font-black flex items-center justify-center gap-2 shadow-sm hover:brightness-110 transition"
          >
            <span>Go to Member Sign In</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#7DD3FC]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-dvh w-full max-w-full overflow-x-hidden flex flex-col pt-[env(safe-area-inset-top)] ${className}`}
    >
      {/* Responsive Multi-Viewport Container: Full-bleed on phones (360-640px), spacious on Tablet (768px) & PC (1440px) */}
      <div
        className={`flex-1 w-full flex flex-col ${
          darkStatus
            ? "min-h-dvh"
            : `max-w-[680px] md:max-w-[740px] lg:max-w-[800px] mx-auto ${
                hideBottomNav ? "pb-8" : "pb-28 sm:pb-32"
              }`
        }`}
      >
        {children}
      </div>

      {/* Standardized 5-Tab Bottom Navigation Bar (Home in Center) */}
      {!hideBottomNav && <BottomNavBar />}

      {/* Global Milestone / XP / Badge Celebration Overlay */}
      <MilestoneCelebrationModal />
    </div>
  );
}
