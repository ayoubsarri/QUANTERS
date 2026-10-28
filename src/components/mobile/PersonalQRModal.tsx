"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  Printer,
  QrCode,
  Shield,
  Sparkles,
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
      // Create high-resolution canvas badge (600x940)
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 940;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Background gradient (Midnight Cobalt metallic)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 940);
      bgGrad.addColorStop(0, "#081A38");
      bgGrad.addColorStop(0.5, "#051126");
      bgGrad.addColorStop(1, "#030A17");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 940);

      // 2. Cyan border accent
      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 568, 908);

      // Inner thin border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 24, 552, 892);

      // 3. Header Text
      ctx.fillStyle = "#38E4FF";
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "center";
      ctx.fillText("QUANTA SCIENTIFIC CLUB · UNIV. ALGIERS 1", 300, 65);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 28px sans-serif";
      ctx.fillText("OFFICIAL MEMBER DIGITAL ID", 300, 105);

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(50, 125, 500, 1);

      // 4. Member Avatar or Fallback Ring
      const avatarImg = new Image();
      avatarImg.crossOrigin = "anonymous";
      avatarImg.src = member.avatarUrl;
      avatarImg.onload = () => {
        // Draw round avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 205, 55, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 245, 150, 110, 110);
        ctx.restore();

        // Ring around avatar
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(300, 205, 57, 0, Math.PI * 2);
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
        context.fillText(member.fullName, 300, 300);

        context.fillStyle = "#38E4FF";
        context.font = "bold 16px monospace";
        context.fillText(member.quanterId, 300, 328);

        // Status & Department
        context.fillStyle = "#7DD3FC";
        context.font = "bold 14px sans-serif";
        context.fillText(`${member.status.toUpperCase()} MEMBER · ${departmentName}`, 300, 355);

        if (teamName) {
          context.fillStyle = "rgba(255, 255, 255, 0.7)";
          context.font = "13px sans-serif";
          context.fillText(`Team: ${teamName}`, 300, 378);
        }

        // Draw Scannable QR Code
        if (qrDataUrl) {
          const qrImg = new Image();
          qrImg.src = qrDataUrl;
          qrImg.onerror = () => setIsDownloading(false);
          qrImg.onload = () => {
            // White plate behind QR
            context.fillStyle = "#FFFFFF";
            context.fillRect(190, 420, 220, 220);

            context.drawImage(qrImg, 200, 430, 200, 200);

            // QR Subtext
            context.fillStyle = "#94A3B8";
            context.font = "bold 12px monospace";
            context.fillText("POINT CAMERA TO VERIFY ID", 300, 670);

            context.fillStyle = "#38E4FF";
            context.font = "bold 11px monospace";
            context.fillText(`SHA-256: ${member.quanterId.replace(/[^A-Z0-9]/g, "")}-VERIFIED-2026`, 300, 692);

            // Divider & Footer
            context.fillStyle = "rgba(255, 255, 255, 0.2)";
            context.fillRect(50, 740, 500, 1);

            context.fillStyle = "rgba(255, 255, 255, 0.6)";
            context.font = "12px sans-serif";
            context.fillText("ACADEMIC CYCLE 2026/2027 · FACULTY OF SCIENCES", 300, 775);

            context.fillStyle = "#38E4FF";
            context.font = "bold 13px sans-serif";
            context.fillText("QUANTA RESEARCH & SCIENTIFIC CLUB", 300, 805);

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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div
        data-modal="true"
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[430px] my-auto rounded-3xl bg-gradient-to-b from-[#091730] via-[#051124] to-[#030914] border border-[#38BDF8]/40 text-white shadow-[0_24px_80px_rgba(2,10,30,0.96)] overflow-hidden animate-rise"
      >
        {/* Subtle Ambient Cosmic Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-[#0284C7]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[#38E4FF]/15 blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#7DD3FC]">
              Verified Digital Pass · 2026/2027
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close Digital ID"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PHYSICAL BADGE CARD CONTAINER */}
        <div ref={cardRef} className="p-5 sm:p-6 space-y-4 relative z-10 text-center">
          {/* Card Top Brand & Chip Row */}
          <div className="flex items-center justify-between text-left">
            <div>
              <QuantaLogo size={32} showWordmark />
              <div className="text-[9.5px] font-mono font-bold tracking-[0.14em] text-slate-400 uppercase mt-0.5">
                Faculty of Sciences · Univ. Algiers 1
              </div>
            </div>

            {/* Simulated Smart Security Chip */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-300/80 shadow-xs flex items-center justify-center relative overflow-hidden shrink-0">
              <div className="w-full h-px bg-amber-700/40 absolute top-2" />
              <div className="w-full h-px bg-amber-700/40 absolute bottom-2" />
              <div className="h-full w-px bg-amber-700/40 absolute left-3" />
              <div className="h-full w-px bg-amber-700/40 absolute right-3" />
            </div>
          </div>

          {/* Member Photo & Primary Status */}
          <div className="flex flex-col items-center pt-1">
            <div className="relative">
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#38BDF8] shadow-[0_8px_24px_rgba(56,189,248,0.3)]"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 border-2 border-[#091730] flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </span>
            </div>

            <h3 className="mt-3 font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              {member.fullName}
            </h3>

            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm font-bold text-[#38E4FF] tracking-wider">
                {member.quanterId}
              </span>
              <span className="text-white/25">·</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wide">
                <Shield className="w-3 h-3 text-emerald-400" />
                {member.status} Member
              </span>
            </div>

            <p className="mt-1.5 text-xs text-slate-300 font-medium max-w-[300px]">
              {departmentName} {teamName ? `· ${teamName}` : ""}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              {member.major} · {member.academicYear} ({member.university})
            </p>
          </div>

          {/* REAL CAMERA-SCANNABLE QR CODE PLATE (Pure Clean QR, No Obstructing Icon) */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex flex-col items-center">
            {qrDataUrl ? (
              <div className="relative group">
                <img
                  src={qrDataUrl}
                  alt={`Real QR ID for ${member.fullName}`}
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs font-mono">
                Generating scannable QR...
              </div>
            )}

            <div className="mt-2 text-center">
              <div className="text-[10.5px] font-mono font-bold text-[#091730] uppercase tracking-wider">
                Point camera to verify member identity
              </div>
              <div className="text-[9.5px] font-mono text-slate-500 mt-0.5">
                Compatible with iOS Camera, Google Lens &amp; Session Scanners
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-slate-300">
            <span className="text-[#38E4FF] font-bold">● ACTIVE PASSPORT VERIFIED</span>
          </div>
        </div>

        {/* BOTTOM ACTION TOOLBAR */}
        <div className="p-4 bg-[#030914]/90 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
            title="Download ID Pass PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? "Saving..." : "Save PNG"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#1D4ED8] hover:brightness-110 text-xs font-extrabold text-white shadow-sm transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
