"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Lock, X } from "lucide-react";
import { BottomNavBar } from "./BottomNavBar";
import { MilestoneCelebrationModal } from "./MilestoneCelebrationModal";
import { WaitingForApprovalScreen } from "./WaitingForApprovalScreen";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { isFirestoreQuotaExhausted } from "@/lib/firebase/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";

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
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const isAuthenticated = useQuantersStore((s) => s.isAuthenticated);
  const members = useQuantersStore((s) => s.members);
  const logout = useQuantersStore((s) => s.logout);
  const settings = useQuantersStore((s) => s.settings);
  const sessionStartedAt = useQuantersStore((s) => s.sessionStartedAt);

  const hasValidSession =
    isAuthenticated &&
    Boolean(currentMemberId) &&
    (!members.length || !members.some((m) => m.id === currentMemberId && (m.status === "Removed" || m.status === "Suspended")));

  const { lang, isRtl } = useTranslation();
  const [hydrated, setHydrated] = useState(false);
  const [showQuotaBanner, setShowQuotaBanner] = useState(false);

  useEffect(() => {
    setHydrated(true);
    useQuantersStore.getState().pullExactUpdatesFromServer().catch(() => {});
    if (isFirestoreQuotaExhausted()) {
      setShowQuotaBanner(true);
    }
    const onQuotaExhausted = () => setShowQuotaBanner(true);
    const onQuotaReset = () => setShowQuotaBanner(false);
    window.addEventListener("quanters:quota_exhausted", onQuotaExhausted);
    window.addEventListener("quanters:quota_reset", onQuotaReset);
    return () => {
      window.removeEventListener("quanters:quota_exhausted", onQuotaExhausted);
      window.removeEventListener("quanters:quota_reset", onQuotaReset);
    };
  }, []);

  const isPublicRoute = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const currentMember = members.find((m) => m.id === currentMemberId);
  const isPrivilegedRole = Boolean(
    currentMember &&
    (currentMember.roles.some((r) =>
      ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager"].includes(r)
    ) ||
    ["quantaclubdz@gmail.com", "ayoubsarri1@gmail.com", "hr.quanta@univ-alger.dz"].includes(currentMember.email.toLowerCase()))
  );

  const isPendingAdmission = Boolean(
    currentMember &&
    !isPrivilegedRole &&
    (currentMember.status === "Pending" ||
      (settings.onboardingAutoApprove === false &&
       !currentMember.onboardingTicks?.hrApproved &&
       currentMember.status !== "Active" &&
       currentMember.status !== "Alumni"))
  );

  // Auto-logout immediately if the member was deleted or removed by administration,
  // or if their session was revoked by a Super Admin security directive
  useEffect(() => {
    if (hydrated && isAuthenticated && currentMemberId) {
      const forceLogoutAllAt = Number(settings.forceLogoutAllAt || 0);
      const revokedAt = Number(settings.revokedSessionMemberIds?.[currentMemberId] || 0);
      if (
        (forceLogoutAllAt > 0 && sessionStartedAt < forceLogoutAllAt) ||
        (revokedAt > 0 && sessionStartedAt < revokedAt)
      ) {
        logout();
        router.replace("/welcome?logged_out=admin");
        return;
      }
      if (members.length > 0) {
        const active = members.find((x) => x.id === currentMemberId);
        if (active && (active.status === "Removed" || active.status === "Suspended")) {
          logout();
          router.replace("/welcome?deactivated=true");
        }
      }
    }
  }, [hydrated, isAuthenticated, currentMemberId, members, settings.forceLogoutAllAt, settings.revokedSessionMemberIds, sessionStartedAt, logout, router]);

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
              {isRtl ? "تسجيل دخول العضو مطلوب" : "Member Sign-In Required"}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isRtl
                ? "يرجى تسجيل الدخول بحساب عضوية كوانتا للوصول إلى مساحة العمل الخاصة بك."
                : "Please sign in with your personal QUANTA member account to access your private workspace."}
            </p>
          </div>
          <Link
            href="/welcome"
            className="w-full h-10 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/75 text-white font-display text-xs font-black flex items-center justify-center gap-2 shadow-sm hover:brightness-110 transition"
          >
            <span>{isRtl ? "الانتقال إلى تسجيل الدخول" : "Go to Member Sign In"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#7DD3FC] rtl:rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  // HR Admission Review Gate: If onboarding admission requires manual approval and member is pending
  // Exclude public catalog viewing routes (/workshops, /badges, /explore) so candidates can explore club schedules
  const isCatalogRoute = pathname === "/workshops" || pathname === "/badges" || pathname === "/explore";
  if (hydrated && !isPublicRoute && hasValidSession && isPendingAdmission && !isCatalogRoute) {
    return <WaitingForApprovalScreen />;
  }

  return (
    <div
      className={`min-h-dvh w-full max-w-full overflow-x-hidden flex flex-col pt-[env(safe-area-inset-top)] ${className}`}
    >
      {/* Quota Exhausted / Offline Local-First Notification Banner */}
      {showQuotaBanner && (
        <div className="w-full bg-[#FFFBEB] border-b border-[#FDE68A] text-[#92400E] px-3.5 py-2 flex items-center justify-between text-xs sticky top-0 z-50 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FEF3C7] text-[#D97706] shrink-0 font-bold text-xs">
              ⚡
            </span>
            <div className="min-w-0 leading-tight">
              <span className="font-semibold block sm:inline">
                {isRtl ? "الوضع المحلي نشط" : "Local Mode Active"}
              </span>
              <span className="hidden sm:inline"> — </span>
              <span className="text-[11px] text-[#B45309] block sm:inline">
                {isRtl
                  ? "تم الوصول لحد الحصة اليومية. مساحة العمل المحلية وبياناتك محفوظة بالكامل."
                  : "Daily cloud quota limit reached. Your local workspace and changes remain fully preserved."}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowQuotaBanner(false)}
            aria-label="Dismiss banner"
            className="p-1 rounded-md text-[#B45309] hover:bg-[#FDE68A]/60 transition shrink-0 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
