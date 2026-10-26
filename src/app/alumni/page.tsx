"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

export default function AlumniUnifiedRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return (
    <MobileAppShell
      hideBottomNav
      darkStatus
      className="bg-cosmic-space text-white"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <QuantaLogo size={54} showWordmark />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-extrabold">
          <GraduationCap className="w-4 h-4 text-[#FBB03B]" />
          <span>Opening QUANTERS Home...</span>
        </div>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#061E47] text-xs font-extrabold shadow-md hover:bg-sky-50 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#1D63EB]" />
          <span>Continue to Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </MobileAppShell>
  );
}
