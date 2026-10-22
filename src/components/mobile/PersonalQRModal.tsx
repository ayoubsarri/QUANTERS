"use client";

import React from "react";
import { CheckCircle2, QrCode, Shield, X } from "lucide-react";
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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 pb-16 sm:pb-4">
      <div
        data-modal="true"
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[360px] rounded-2xl bg-hero-cobalt text-white p-6 shadow-2xl border border-cyan-400/30 flex flex-col items-center text-center overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <QuantaLogo size={40} showWordmark />
        <span className="mt-1 text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-200">
          OFFICIAL MEMBER DIGITAL ID
        </span>

        <div className="mt-4 relative">
          <img
            src={member.avatarUrl}
            alt={member.fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#38E4FF] shadow-lg"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#061E47] flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </span>
        </div>

        <h3 className="mt-2.5 text-lg font-extrabold">{member.fullName}</h3>
        <p className="text-xs font-mono text-cyan-300">{member.quanterId}</p>

        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
          <Shield className="w-3 h-3" /> {member.status.toUpperCase()} MEMBER
        </div>

        <p className="mt-2 text-[11px] text-sky-100/90">
          {departmentName} {teamName ? `· ${teamName}` : ""}
        </p>

        {/* Simulated Crisp Scannable QR Matrix */}
        <div className="mt-4 p-3.5 bg-white rounded-2xl shadow-lg flex flex-col items-center">
          <div className="w-36 h-36 bg-slate-900 rounded-xl p-2 grid grid-cols-7 grid-rows-7 gap-1 relative">
            {Array.from({ length: 49 }).map((_, idx) => {
              const isCorner =
                idx < 3 ||
                (idx >= 4 && idx < 7) ||
                idx % 7 === 0 ||
                idx % 7 === 6 ||
                idx % 2 === 0 ||
                idx % 5 === 0;
              return (
                <div
                  key={idx}
                  className={`rounded-[2px] ${isCorner ? "bg-white" : "bg-slate-900"}`}
                />
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#061E47] border-2 border-white flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#38E4FF]" />
              </div>
            </div>
          </div>
          <span className="mt-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Present to Session Organizer for Check-in
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full h-10 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
