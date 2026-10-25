"use client";

import React from "react";
import { BottomNavBar } from "./BottomNavBar";
import { MilestoneCelebrationModal } from "./MilestoneCelebrationModal";

interface MobileAppShellProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  darkStatus?: boolean;
  className?: string;
}

export function MobileAppShell({
  children,
  hideBottomNav = false,
  darkStatus = false,
  className = "bg-[#F4F7FB]",
}: MobileAppShellProps) {
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
