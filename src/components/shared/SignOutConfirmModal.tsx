"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: SignOutConfirmModalProps) {
  const { isRtl } = useTranslation();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[340px] rounded-2xl bg-gradient-to-b from-[#101F38] to-[#0A1424] border border-[#2B4875]/80 p-5 text-center shadow-2xl text-white space-y-4 animate-rise"
      >
        <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <LogOut className="w-5 h-5 rtl:rotate-180" />
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-base font-black tracking-tight text-white">
            {isRtl ? "تسجيل الخروج من كوانترز؟" : "Sign Out of QUANTERS?"}
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            {isRtl
              ? "هل أنت متأكد من رغبتك في إنهاء جلستك الحالية؟"
              : "Are you sure you want to end your current session?"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold font-display transition cursor-pointer active:scale-98"
          >
            {isRtl ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full h-11 min-h-[44px] flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-display transition cursor-pointer active:scale-98 shadow-sm"
          >
            {isRtl ? "تأكيد الخروج" : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
