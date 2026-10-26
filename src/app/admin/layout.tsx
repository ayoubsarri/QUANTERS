"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  LogOut,
  Menu,
  Monitor,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { activeAdminRole, members, messages, celebration, triggerCelebration, logout } =
    useQuantersStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissedMobileNotice, setDismissedMobileNotice] = useState(false);

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
    <div className="h-screen w-full flex bg-[#F4F7FB] text-[#09192F] overflow-hidden">
      {/* Responsive Admin Sidebar (Fixed on PC, Slide-over Drawer on Mobile) */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (Independent scroll container) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#E2EAF4] px-4 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#F4F7FB] border border-[#E2EAF4] text-slate-700 hover:text-[#1D63EB]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by name, Quanter ID, or email..."
                className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-[#F4F7FB] border border-[#E2EAF4] rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D63EB] focus:bg-white transition"
              />
              {searchFocused && quickResults.length > 0 && (
                <div className="absolute left-0 right-0 top-11 bg-white rounded-xl border border-[#E2EAF4] shadow-xl py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Member Directory
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
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {m.fullName}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {m.quanterId} · {m.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E0F0FF] text-[#1D63EB] shrink-0">
                        {m.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Active Role Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#E0F0FF] text-[#094C9C] border border-[#1D63EB]/20 px-3 py-1.5 rounded-xl text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1D63EB]" />
              <span>{activeAdminRole}</span>
            </div>

            {/* Notification Bell */}
            <Link
              href="/admin/messages"
              className="relative p-2 rounded-xl bg-[#F4F7FB] border border-[#E2EAF4] text-slate-600 hover:text-[#1D63EB] hover:bg-[#E0F0FF]/50 transition"
              title="Messages & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
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
              className="inline-flex items-center gap-1.5 bg-[#09192F] hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#29D2FF]" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Device Notice: Recommends PC for Admin ERP while keeping everything 100% openable */}
        {!dismissedMobileNotice && (
          <div className="lg:hidden mx-4 mt-4 p-3.5 rounded-2xl bg-[#09192F] text-white border border-[#1D63EB]/40 shadow-md flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1D63EB]/25 border border-[#29D2FF]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Monitor className="w-4 h-4 text-[#29D2FF]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Admin Console is optimized for PC &amp; Desktop
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  For multi-column HR tables and projector QR screens, we recommend opening Admin on a PC. You can also continue in responsive mobile mode below.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setDismissedMobileNotice(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#1D63EB] text-white text-[11px] font-bold"
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
          <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xl max-w-md w-full p-6 text-center animate-rise">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">{celebration.title}</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{celebration.subtitle}</p>
            {celebration.xpEarned > 0 && (
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D8F3E5] text-[#0D7A49] text-xs font-extrabold tabular-nums">
                +{celebration.xpEarned} XP Awarded
              </div>
            )}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => triggerCelebration(null)}
                className="w-full py-2.5 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs font-bold transition"
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
