"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Menu,
  Monitor,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { isFirestoreQuotaExhausted } from "@/lib/firebase/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t, lang, isRtl } = useTranslation();
  const isAuthenticated = useQuantersStore((s) => s.isAuthenticated);
  const activeAdminRole = useQuantersStore((s) => s.activeAdminRole);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);
  const messages = useQuantersStore((s) => s.messages);
  const celebration = useQuantersStore((s) => s.celebration);
  const triggerCelebration = useQuantersStore((s) => s.triggerCelebration);
  const logout = useQuantersStore((s) => s.logout);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissedMobileNotice, setDismissedMobileNotice] = useState(false);
  const [showQuotaBanner, setShowQuotaBanner] = useState(false);

  useEffect(() => {
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

  const currentMember =
    isAuthenticated && currentMemberId
      ? members.find((m) => m.id === currentMemberId)
      : undefined;
  const hasAdminAccess = Boolean(
    isAuthenticated &&
      currentMember &&
      currentMember.roles.some((r) =>
        [
          "Super Admin",
          "Executive",
          "HR Head",
          "Department Head",
          "Co-Manager",
          "KPI Viewer",
          "Editor",
        ].includes(r)
      )
  );

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#071326] p-6 text-white text-center">
        <div className="max-w-md w-full bg-[#0B1A33] border border-[#2B4875] rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg text-white">
              {!isAuthenticated || !currentMember
                ? "Admin Authentication Required"
                : "Admin Console Restricted"}
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {!isAuthenticated || !currentMember
                ? "Please sign in with an authorized QUANTA Executive, HR Head, or Department Manager account to access the Admin Console."
                : "This console is reserved exclusively for Club Executives, HR Heads, and Department Managers. You are currently signed in as a regular member."}
            </p>
          </div>
          <Link
            href={!isAuthenticated || !currentMember ? "/welcome" : "/home"}
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:brightness-110 text-white text-xs font-display font-extrabold shadow-md transition"
          >
            {!isAuthenticated || !currentMember
              ? "Sign In at Member Portal"
              : "Return to Member App"}
          </Link>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter((m) => m.unread && !m.archived).length;

  const quickResults =
    searchQuery.trim().length >= 2
      ? members
          .filter(
            (m) =>
              m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.quanterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5)
      : [];

  return (
    <div className="h-screen w-full flex bg-[#F4F7FB] text-[#0F1E36] overflow-hidden">
      {/* Responsive Admin Sidebar (Fixed on PC, Slide-over Drawer on Mobile) */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (Independent scroll container) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Quota Exhausted / Local Offline Mode Notification Banner */}
        {showQuotaBanner && (
          <div className="w-full bg-[#FFFBEB] border-b border-[#FDE68A] text-[#92400E] px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-40 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FEF3C7] text-[#D97706] shrink-0 font-bold text-xs">
                ⚡
              </span>
              <div className="min-w-0 text-xs">
                <span className="font-bold text-[#92400E]">
                  {isRtl ? "الوضع المحلي دون إنترنت نشط" : "Local Offline Mode Active"}
                </span>{" "}
                —{" "}
                <span className="text-[#B45309]">
                  {isRtl
                    ? "تم الوصول لحد الحصة اليومية السحابية. التعديلات الإدارية محفوظة محلياً بأمان وستتم مزامنتها تلقائياً عند تجدد الحصة."
                    : "Cloud daily quota limit reached. Administrative changes are safely preserved in local storage and will sync automatically when quota refreshes."}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowQuotaBanner(false)}
              aria-label="Dismiss banner"
              className="p-1 rounded-md text-[#B45309] hover:bg-[#FDE68A]/60 transition shrink-0 ml-3"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header Bar matching Member App Style */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-[0_2px_10px_rgba(15,30,54,0.03)]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#F0F6FF] border border-[#D5E3F5] text-[#182C4E] hover:bg-[#E2EEFF] transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? "ابحث عن عضو بالاسم أو معرّف كوانتا أو البريد..." : "Search member by name, Quanter ID, or email..."}
                className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 text-xs font-medium bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-[#0F1E36] placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] focus:bg-white transition"
              />
              {searchFocused && quickResults.length > 0 && (
                <div className="absolute left-0 right-0 top-11 bg-white rounded-2xl border border-slate-200/90 shadow-[0_14px_34px_rgba(15,30,54,0.12)] py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7]">
                    {isRtl ? "دليل الأعضاء" : "Member Directory"}
                  </div>
                  {quickResults.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onMouseDown={() => {
                        router.push(`/admin/members/${m.id}`);
                        setSearchQuery("");
                      }}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#F4F7FB] text-left transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={m.avatarUrl}
                          alt={m.fullName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="truncate">
                          <div className="font-display text-xs font-extrabold text-[#0F1E36] truncate">
                            {m.fullName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            {m.quanterId} · {m.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] shrink-0">
                        {m.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Active Role Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] px-3 py-1.5 rounded-xl text-xs font-display font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>{activeAdminRole}</span>
              {activeAdminRole === "KPI Viewer" && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 ml-1 font-bold">
                  Read Only
                </span>
              )}
            </div>

            {/* Member App Quick Switch */}
            <Link
              href="/home"
              className="hidden md:inline-flex items-center gap-1.5 bg-white hover:bg-[#F0F6FF] text-[#182C4E] border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs font-display font-bold transition"
              title={isRtl ? "فتح تطبيق الأعضاء" : "Open Member App"}
            >
              <span>{isRtl ? "تطبيق الأعضاء" : "Member App"}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#0284C7]" />
            </Link>

            {/* Notification Bell */}
            <Link
              href="/admin/messages"
              className="relative p-2 rounded-xl bg-white border border-slate-200/90 text-[#182C4E] hover:bg-[#F0F6FF] transition"
              title="Messages & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/welcome");
              }}
              className="inline-flex items-center gap-1.5 bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-display font-extrabold px-3 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#7DD3FC]" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Device Notice */}
        {!dismissedMobileNotice && (
          <div className="lg:hidden mx-4 mt-4 p-3.5 rounded-2xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875]/65 shadow-md flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0B1528] border border-[#38BDF8]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Monitor className="w-4 h-4 text-[#7DD3FC]" />
              </div>
              <div>
                <div className="font-display text-xs font-extrabold text-white">
                  Admin Console is optimized for PC &amp; Desktop
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  For multi-column HR tables and projector QR screens, we recommend opening Admin on a PC. You can also continue in responsive mobile mode below.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setDismissedMobileNotice(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#0284C7] text-white text-[11px] font-display font-bold"
                  >
                    Continue on Mobile
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDismissedMobileNotice(true)}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4F7FB]">
          {children}
        </main>
      </div>

      {/* Admin Celebration / Confirmation Toast Modal */}
      {celebration?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 text-center animate-rise">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-black text-[#0F1E36]">{celebration.title}</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{celebration.subtitle}</p>
            {celebration.xpEarned > 0 && (
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold tabular-nums">
                +{celebration.xpEarned} XP Awarded
              </div>
            )}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => triggerCelebration(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white font-display text-xs font-extrabold transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
