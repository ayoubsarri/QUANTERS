"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function BottomNavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isWorkshops = pathname.startsWith("/workshops");
  const isExplore = pathname.startsWith("/explore");
  const isHome = pathname === "/home";
  const isBadges =
    pathname.startsWith("/badges") || pathname.startsWith("/exams");
  const isProfile = pathname.startsWith("/profile");

  const navItems = [
    {
      href: "/workshops",
      label: t.nav.workshops,
      active: isWorkshops,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3L2 8.2L12 13.4L22 8.2L12 3Z"
            fill={active ? "#38BDF8" : "none"}
            fillOpacity={active ? "0.28" : "0"}
            stroke={active ? "#7DD3FC" : "currentColor"}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 10.8V16.2C6 17.8 8.7 19.2 12 19.2C15.3 19.2 18 17.8 18 16.2V10.8"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 9.8V15.2"
            stroke={active ? "#7DD3FC" : "currentColor"}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      href: "/explore",
      label: t.nav.explore,
      active: isExplore,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill={active ? "#38BDF8" : "none"}
            fillOpacity={active ? "0.2" : "0"}
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <polygon
            points="16,8 13.5,13.5 8,16 10.5,10.5"
            fill={active ? "#7DD3FC" : "currentColor"}
          />
          <circle cx="12" cy="12" r="1.5" fill="white" />
        </svg>
      ),
    },
    {
      href: "/home",
      label: t.nav.home,
      active: isHome,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.5L12 3.5L21 10.5V20C21 20.6 20.6 21 20 21H14.5V15.5C14.5 15 14 14.5 13.5 14.5H10.5C10 14.5 9.5 15 9.5 15.5V21H4C3.4 21 3 20.6 3 20V10.5Z"
            fill={active ? "#38BDF8" : "none"}
            fillOpacity={active ? "0.25" : "0"}
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: "/badges",
      label: t.nav.badges,
      active: isBadges,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2.5 20,7 20,17 12,21.5 4,17 4,7"
            fill={active ? "#38BDF8" : "none"}
            fillOpacity={active ? "0.22" : "0"}
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M9 12.2L11 14.2L15.2 10"
            stroke={active ? "#7DD3FC" : "currentColor"}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: t.nav.profile,
      active: isProfile,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="8"
            r="4"
            fill={active ? "#38BDF8" : "none"}
            fillOpacity={active ? "0.25" : "0"}
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <path
            d="M5 19.5C5.8 16 8.5 14 12 14C15.5 14 18.2 16 19 19.5"
            stroke={active ? "#7DD3FC" : "currentColor"}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav
      aria-label="Primary Mobile Navigation"
      className="fixed bottom-3.5 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] z-40 select-none pointer-events-none pb-[env(safe-area-inset-bottom)]"
    >
      {/* Clean Light Floating Tab Dock with Softened Cosmic Slate-Navy Active Pill */}
      <div className="pointer-events-auto bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_10px_30px_rgba(15,30,54,0.1),0_2px_8px_rgba(15,30,54,0.04)] rounded-2xl p-1 sm:p-1.5 flex items-center justify-between">
        {navItems.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`flex-1 min-w-0 min-h-[46px] flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                item.active
                  ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white shadow-[0_4px_14px_rgba(16,31,56,0.24)] border border-[#2B4875]/60"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <div className="flex items-center justify-center shrink-0">
                {item.icon(item.active)}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight font-display whitespace-nowrap max-w-full px-0.5 ${
                  item.active ? "font-extrabold text-white" : "font-semibold text-slate-600"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
