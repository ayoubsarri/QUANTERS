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
        className="relative w-full max-w-[360px] rounded-xl bg-gradient-to-b from-[#182C4E] to-[#0F1E36] border border-[#2B4875]/80 text-white p-5 shadow-2xl flex flex-col items-center text-center overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <QuantaLogo size={38} showWordmark />
        <span className="mt-1 text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-[#7DD3FC]">
          OFFICIAL MEMBER DIGITAL ID
        </span>

        <div className="mt-3.5 relative">
          <img
            src={member.avatarUrl}
            alt={member.fullName}
            className="w-20 h-20 rounded-xl object-cover border-2 border-[#38BDF8] shadow-lg"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-[#38BDF8] border-2 border-[#0F1E36] flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-[#0F1E36]" />
          </span>
        </div>

        <h3 className="mt-2.5 font-display text-lg font-black text-white">
          {member.fullName}
        </h3>
        <p className="text-xs font-mono font-bold text-[#7DD3FC]">
          {member.quanterId}
        </p>

        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/35 text-[#7DD3FC] text-[10.5px] font-bold">
          <Shield className="w-3 h-3 text-[#38BDF8]" />{" "}
          {member.status.toUpperCase()} MEMBER
        </div>

        <p className="mt-2 text-[11px] text-slate-300 font-medium">
          {departmentName} {teamName ? `· ${teamName}` : ""}
        </p>

        {/* Simulated Crisp Scannable QR Matrix */}
        <div className="mt-3.5 p-3 bg-white rounded-xl shadow-lg flex flex-col items-center">
          <div className="w-36 h-36 bg-[#0F1E36] rounded-lg p-2 grid grid-cols-7 grid-rows-7 gap-1 relative">
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
                  className={`rounded-[2px] ${isCorner ? "bg-white" : "bg-[#0F1E36]"}`}
                />
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#182C4E] border-2 border-white flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#38BDF8]" />
              </div>
            </div>
          </div>
          <span className="mt-2 text-[10px] font-bold text-[#182C4E] uppercase tracking-wider">
            Present to Session Organizer for Check-in
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-[#2B4875]/80 text-xs font-bold text-white transition cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
