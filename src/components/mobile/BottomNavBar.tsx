"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNavBar() {
  const pathname = usePathname();

  const isWorkshops = pathname.startsWith("/workshops");
  const isExplore = pathname.startsWith("/explore");
  const isHome = pathname === "/home";
  const isBadges =
    pathname.startsWith("/badges") || pathname.startsWith("/exams");
  const isProfile = pathname.startsWith("/profile");

  const navItems = [
    {
      href: "/workshops",
      label: "Workshops",
      active: isWorkshops,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3L2 8.2L12 13.4L22 8.2L12 3Z"
            fill={active ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 10.8V16.2C6 17.8 8.7 19.2 12 19.2C15.3 19.2 18 17.8 18 16.2V10.8"
            fill={active ? "currentColor" : "none"}
            fillOpacity={active ? "0.2" : "0"}
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 9.8V15.2"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      href: "/explore",
      label: "Explore",
      active: isExplore,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill={active ? "currentColor" : "none"}
            fillOpacity={active ? "0.15" : "0"}
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <polygon
            points="16,8 13.5,13.5 8,16 10.5,10.5"
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="1.5" fill="white" />
        </svg>
      ),
    },
    {
      href: "/home",
      label: "Home",
      active: isHome,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.5L12 3.5L21 10.5V20C21 20.6 20.6 21 20 21H14.5V15.5C14.5 15 14 14.5 13.5 14.5H10.5C10 14.5 9.5 15 9.5 15.5V21H4C3.4 21 3 20.6 3 20V10.5Z"
            fill={active ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: "/badges",
      label: "Badges",
      active: isBadges,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2.5 20,7 20,17 12,21.5 4,17 4,7"
            fill={active ? "currentColor" : "none"}
            fillOpacity={active ? "0.15" : "0"}
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M9 12.2L11 14.2L15.2 10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: "Profile",
      active: isProfile,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="8"
            r="4"
            fill={active ? "currentColor" : "none"}
            fillOpacity={active ? "0.2" : "0"}
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <path
            d="M5 19.5C5.8 16 8.5 14 12 14C15.5 14 18.2 16 19 19.5"
            fill={active ? "currentColor" : "none"}
            fillOpacity={active ? "0.2" : "0"}
            stroke="currentColor"
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
      className="fixed bottom-3.5 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] z-40 select-none pointer-events-none"
    >
      {/* Glassify Floating Pill Capsule */}
      <div className="pointer-events-auto bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_12px_36px_rgba(9,25,47,0.12),0_4px_12px_rgba(9,25,47,0.04)] rounded-full p-1.5 flex items-center justify-between">
        {navItems.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 active:scale-95 ${
                item.active
                  ? "bg-gradient-to-b from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_16px_rgba(29,99,235,0.35)]"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
              }`}
            >
              <div className="flex items-center justify-center">
                {item.icon(item.active)}
              </div>
              <span
                className={`text-xs leading-none mt-1 tracking-tight font-display ${
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
