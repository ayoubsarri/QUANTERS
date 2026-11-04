"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  Check,
  Download,
  Shield,
  X,
} from "lucide-react";
import { Member } from "@/lib/types/erp";
import { QuantaLogo } from "../shared/QuantaLogo";

interface PersonalQRModalProps {
  open: boolean;
  onClose: () => void;
  member: Member;
  departmentName: string;
  teamName?: string;
}

export function PersonalQRModal({
  open,
  onClose,
  member,
  departmentName,
  teamName,
}: PersonalQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Real scannable verification URL encoded into the QR code
  const verificationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify?id=${member.quanterId || member.id}&name=${encodeURIComponent(member.fullName)}`
    : `https://quanta.club/verify?id=${member.quanterId || member.id}`;

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 360,
      color: {
        dark: "#050F22",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error("Error generating scannable QR Code:", err);
      });
  }, [open, verificationUrl]);

  if (!open) return null;

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      // Create high-resolution canvas badge (600x840)
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 840;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Background gradient (Midnight Cobalt metallic)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 840);
      bgGrad.addColorStop(0, "#081A38");
      bgGrad.addColorStop(0.5, "#051126");
      bgGrad.addColorStop(1, "#030A17");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 840);

      // 2. Cyan border accent
      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 568, 808);

      // Inner thin border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 24, 552, 792);

      // 3. Header Text
      ctx.fillStyle = "#38E4FF";
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "center";
      ctx.fillText("QUANTA SCIENTIFIC CLUB · UNIV. ALGIERS 1", 300, 65);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 26px sans-serif";
      ctx.fillText("OFFICIAL MEMBER DIGITAL ID", 300, 102);

      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(50, 120, 500, 1);

      // 4. Member Avatar or Fallback Ring
      const avatarImg = new Image();
      avatarImg.crossOrigin = "anonymous";
      avatarImg.src = member.avatarUrl;
      avatarImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 195, 52, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 248, 143, 104, 104);
        ctx.restore();

        // Ring around avatar
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(300, 195, 54, 0, Math.PI * 2);
        ctx.stroke();

        finishCardDrawing(canvas, ctx);
      };

      avatarImg.onerror = () => {
        finishCardDrawing(canvas, ctx);
      };

      const finishCardDrawing = (cnv: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
        // Name & Quanter ID
        context.fillStyle = "#FFFFFF";
        context.font = "900 24px sans-serif";
        context.textAlign = "center";
        context.fillText(member.fullName, 300, 285);

        context.fillStyle = "#38E4FF";
        context.font = "bold 16px monospace";
        context.fillText(member.quanterId, 300, 312);

        // Status & Department
        context.fillStyle = "#7DD3FC";
        context.font = "bold 14px sans-serif";
        context.fillText(`${member.status.toUpperCase()} MEMBER · ${departmentName}`, 300, 338);

        if (teamName) {
          context.fillStyle = "rgba(255, 255, 255, 0.7)";
          context.font = "13px sans-serif";
          context.fillText(`Team: ${teamName}`, 300, 360);
        }

        // Draw Scannable QR Code
        if (qrDataUrl) {
          const qrImg = new Image();
          qrImg.src = qrDataUrl;
          qrImg.onerror = () => setIsDownloading(false);
          qrImg.onload = () => {
            // White plate behind QR
            context.fillStyle = "#FFFFFF";
            context.fillRect(190, 395, 220, 220);

            context.drawImage(qrImg, 200, 405, 200, 200);

            // Clean QR Tag
            context.fillStyle = "#38E4FF";
            context.font = "bold 13px monospace";
            context.fillText("SCAN TO VERIFY OFFICIAL PASS", 300, 645);

            // Divider & Footer
            context.fillStyle = "rgba(255, 255, 255, 0.2)";
            context.fillRect(50, 680, 500, 1);

            context.fillStyle = "rgba(255, 255, 255, 0.6)";
            context.font = "12px sans-serif";
            context.fillText("ACADEMIC CYCLE 2026/2027 · FACULTY OF SCIENCES", 300, 715);

            context.fillStyle = "#38E4FF";
            context.font = "bold 13px sans-serif";
            context.fillText("QUANTA RESEARCH & SCIENTIFIC CLUB", 300, 745);

            // Download as image via blob URL (zero-copy memory cleanup)
            cnv.toBlob((blob) => {
              if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.download = `QUANTERS_Digital_ID_${member.quanterId}.png`;
                link.href = blobUrl;
                link.click();
                URL.revokeObjectURL(blobUrl);
              }
              cnv.width = 0;
              cnv.height = 0;
              setIsDownloading(false);
            }, "image/png");
          };
        } else {
          setIsDownloading(false);
        }
      };
    } catch (e) {
      console.error(e);
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 select-none overflow-hidden">
      <div
        data-modal="true"
        role="dialog"
        aria-modal="true"
        ref={cardRef}
        className="relative w-full max-w-[360px] sm:max-w-[380px] max-h-[min(90dvh,560px)] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0B1A35] via-[#071328] to-[#040C1A] border border-[#38BDF8]/40 text-white shadow-[0_24px_80px_rgba(2,10,30,0.96)] overflow-hidden flex flex-col justify-between animate-rise"
      >
        {/* Subtle Ambient Cosmic Glow */}
        <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-[#0284C7]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-[#38E4FF]/15 blur-3xl pointer-events-none" />

        {/* 1. Modal Top Bar */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/10 shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <QuantaLogo size={24} showWordmark={false} />
            <div>
              <div className="font-display font-black text-xs text-white leading-tight flex items-center gap-1.5">
                <span>QUANTA PASSPORT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[9px] font-mono text-[#38E4FF] tracking-wider">
                2026 / 2027
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Holographic Micro-Chip */}
            <div className="w-8 h-5 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-300/80 shadow-xs flex items-center justify-center relative overflow-hidden shrink-0">
              <div className="w-full h-px bg-amber-800/40 absolute top-1.5" />
              <div className="w-full h-px bg-amber-800/40 absolute bottom-1.5" />
              <div className="h-full w-px bg-amber-800/40 absolute left-2" />
              <div className="h-full w-px bg-amber-800/40 absolute right-2" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95"
              aria-label="Close Digital ID"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Compact Identity Lockup */}
        <div className="px-4 py-2.5 flex items-center gap-3 shrink-0 relative z-10 border-b border-white/5 bg-white/[0.02]">
          <div className="relative shrink-0 w-14 h-14">
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-14 h-14 min-w-[56px] max-w-[56px] min-h-[56px] max-h-[56px] rounded-xl object-cover border-2 border-[#38BDF8] shadow-[0_4px_16px_rgba(56,189,248,0.35)] shrink-0"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-md bg-emerald-500 border border-[#091730] flex items-center justify-center shadow-xs">
              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm sm:text-base font-black text-white tracking-tight truncate leading-tight">
              {member.fullName}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-xs font-bold text-[#38E4FF] tracking-wider">
                {member.quanterId}
              </span>
              <span className="text-white/30 text-[10px]">·</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[10.5px] font-bold">
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                <span>{member.status}</span>
              </span>
            </div>
            <div className="text-[10.5px] text-slate-300 truncate font-medium mt-0.5">
              {departmentName} {teamName ? `· ${teamName}` : ""}
            </div>
          </div>
        </div>

        {/* 3. Pro Scannable QR Core (Zero filler text) */}
        <div className="px-4 py-3 flex-1 flex flex-col items-center justify-center shrink-0 relative z-10">
          <div className="relative p-2 rounded-xl bg-white shadow-[0_12px_36px_rgba(0,0,0,0.6)] border-2 border-white flex flex-col items-center shrink-0">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR ID for ${member.fullName}`}
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-md"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center text-slate-500 text-xs font-mono">
                Generating QR...
              </div>
            )}
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#101F38] border border-[#2B4875]/70 text-xs font-medium text-[#7DD3FC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38E4FF] animate-pulse" />
            <span>SCAN TO VERIFY PASS</span>
          </div>
        </div>

        {/* 4. Bottom Action Toolbar */}
        <div className="px-4 py-2.5 bg-[#030914]/90 border-t border-white/10 flex items-center justify-between gap-2 shrink-0 relative z-10">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
            title="Download ID Pass PNG"
          >
            <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{isDownloading ? "Saving..." : "Save PNG"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#1D4ED8] hover:brightness-110 text-xs font-extrabold text-white shadow-sm transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
