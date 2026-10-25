"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  MapPin,
  MessageSquarePlus,
  QrCode,
  Star,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { FieldIcon } from "@/components/shared/FieldIcon";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ActivityKind, Workshop } from "@/lib/types/erp";

type WorkshopFilter = "All" | "Upcoming" | "Completed" | "Mine";

const FILTER_TABS: WorkshopFilter[] = ["All", "Upcoming", "Completed", "Mine"];

export default function MobileWorkshopsPage() {
  const workshops = useQuantersStore((s) => s.workshops);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const registerForWorkshop = useQuantersStore((s) => s.registerForWorkshop);
  const cancelWorkshopRegistration = useQuantersStore(
    (s) => s.cancelWorkshopRegistration
  );

  const [filter, setFilter] = useState<WorkshopFilter>("All");
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(
    null
  );
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmittedIds, setFeedbackSubmittedIds] = useState<string[]>(
    []
  );

  const filteredWorkshops = workshops.filter((ws) => {
    if (filter === "Upcoming") {
      return ws.status === "Published" || ws.status === "Running";
    }
    if (filter === "Completed") {
      return ws.status === "Completed";
    }
    if (filter === "Mine") {
      return ws.registeredMemberIds.includes(currentMemberId);
    }
    return true;
  });

  const activeWorkshop =
    workshops.find((w) => w.id === selectedWorkshopId) || null;

  const getLevelChipClass = (level: Workshop["level"]) => {
    if (level === "Intermediate") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
    if (level === "Advanced") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-sky-50 text-[#1D63EB] border-sky-200";
  };

  const resolveActivityType = (ws: Workshop): ActivityKind => {
    if (ws.activityType) return ws.activityType;
    if (ws.id === "ws-astronomy" || ws.id === "ws-ai-science")
      return "Scientific Activity";
    if (
      ws.id === "ws-arduino" ||
      ws.id === "ws-3dprinting" ||
      ws.id === "ws-quantum"
    )
      return "Lab Session";
    return "Workshop";
  };

  const getActivityChipClass = (kind: ActivityKind) => {
    if (kind === "Scientific Activity") {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    if (kind === "Lab Session") {
      return "bg-teal-50 text-teal-800 border-teal-200";
    }
    return "bg-[#EBF3FC] text-[#094C9C] border-[#E2EDF8]";
  };

  return (
    <MobileAppShell>
      <div className="px-4 pt-3 pb-6 sm:px-6 space-y-4">
        {/* Top Cosmic Header Banner matching Welcome Page Aesthetic */}
        <div
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 bg-[#030711] border border-slate-800/90 shadow-[0_16px_38px_rgba(3,8,18,0.28)] text-white animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <img
            src="/brand/hero_rank_banner.webp"
            alt="QUANTERS Cosmic Lab Banner"
            className="absolute inset-0 w-full h-full object-cover object-right opacity-90 select-none pointer-events-none animate-zero-g"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02060E]/96 via-[#040B1A]/78 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="min-w-0 max-w-[62%]">
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#38E4FF] uppercase block">
                CATALOG · 0{workshops.length} SESSIONS
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight mt-1 leading-tight drop-shadow">
                Workshops{" "}
                <span className="font-editorial italic font-normal text-sky-200">
                  &amp; Labs
                </span>
              </h1>
              <p className="text-[11px] font-mono text-slate-300/90 mt-1 drop-shadow">
                Hands-on scientific sessions &amp; field work
              </p>
            </div>
            <Link
              href="/checkin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#050E20]/90 hover:bg-[#38E4FF] text-[#38E4FF] hover:text-slate-950 text-[11px] font-bold font-mono uppercase tracking-wider shadow-md active:scale-[0.98] transition border border-[#38E4FF]/35 shrink-0 backdrop-blur-md"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Pass</span>
            </Link>
          </div>
        </div>

        {/* Open Architectural Tab Strip: All | Upcoming | Completed | Mine */}
        <div
          className="flex items-center gap-5 border-b border-slate-200/90 overflow-x-auto animate-rise"
          style={{ animationDelay: "40ms" }}
        >
          {FILTER_TABS.map((tab) => {
            const active = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`relative pb-2.5 text-xs sm:text-sm font-bold font-display tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? "text-slate-950"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <span>{tab}</span>
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-[2.5px] bg-slate-950 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Workshops & Activities — Precision Laboratory Specification Cards */}
        <div className="space-y-2.5">
          {filteredWorkshops.map((ws, idx) => {
            const isRegistered =
              ws.registeredMemberIds.includes(currentMemberId);
            const isAttended = ws.attendanceRecords.some(
              (r) => r.memberId === currentMemberId && r.status === "Present"
            );
            const actKind = resolveActivityType(ws);

            return (
              <div
                key={ws.id}
                onClick={() => setSelectedWorkshopId(ws.id)}
                style={{ animationDelay: `${60 + idx * 45}ms` }}
                className="group bg-white rounded-xl border border-slate-200/90 border-l-[3px] border-l-[#0A4D96] p-4 shadow-[0_2px_10px_rgba(9,25,47,0.03)] hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(9,25,47,0.07)] hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer animate-rise"
              >
                <div className="flex items-start gap-3.5">
                  <FieldIcon field={ws.iconType} size={30} boxed />

                  <div className="flex-1 min-w-0">
                    {/* Top Specification Metadata Line (Zero Pill Soup) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        <span className="text-[#0A4D96]">{actKind}</span>
                        <span className="text-slate-300">·</span>
                        <span>{ws.level}</span>
                        {ws.status === "Running" && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>LIVE</span>
                            </span>
                          </>
                        )}
                        {isAttended && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-sky-700">VERIFIED</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs font-black font-mono text-emerald-700 shrink-0 tabular-nums">
                        +{ws.xpReward} XP
                      </span>
                    </div>

                    <h2 className="mt-1 text-base sm:text-lg font-black font-display text-slate-950 leading-snug tracking-tight group-hover:text-[#0A4D96] transition-colors">
                      {ws.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-mono text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {ws.dateLabel} · {ws.timeRange}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{ws.location}</span>
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-500 tabular-nums">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ws.seatsLeft} seats open</span>
                      </span>

                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isRegistered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[10.5px] font-mono font-bold uppercase tracking-wider">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Enrolled</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              registerForWorkshop(ws.id, currentMemberId)
                            }
                            className="h-7 px-3 rounded-lg bg-slate-950 hover:bg-[#0A4D96] text-white text-[10.5px] font-mono font-bold uppercase tracking-wider active:scale-[0.98] transition cursor-pointer"
                          >
                            Enroll →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workshop Detail Modal */}
      {activeWorkshop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[440px] max-h-[76dvh] sm:max-h-[82dvh] rounded-2xl bg-white/95 backdrop-blur-2xl overflow-hidden shadow-2xl border border-white/80 flex flex-col animate-rise"
          >
            <div className="bg-gradient-to-br from-[#062456] via-[#0A3882] to-[#1258C7] text-white p-5 relative border-b border-white/10">
              <button
                type="button"
                onClick={() => setSelectedWorkshopId(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <FieldIcon field={activeWorkshop.iconType} size={30} boxed />
                <div className="pr-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white/15 text-sky-100 border border-white/20">
                      {resolveActivityType(activeWorkshop)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#38E4FF] text-[#061E47]">
                      {activeWorkshop.level}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      +{activeWorkshop.xpReward} XP
                    </span>
                  </div>

                  <h2 className="mt-1.5 text-base font-extrabold leading-snug">
                    {activeWorkshop.title}
                  </h2>
                  <p className="text-[11px] text-sky-200 mt-0.5">
                    Instructed by {activeWorkshop.instructor}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Date &amp; Time
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {activeWorkshop.dateLabel} · {activeWorkshop.timeRange}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Venue &amp; Capacity
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {activeWorkshop.location} ({activeWorkshop.seatsLeft} left)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 mb-1">
                  Syllabus &amp; Overview
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {activeWorkshop.description}
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#1D63EB]" />
                  <span>Learning Objectives &amp; Materials</span>
                </h3>
                <ul className="space-y-1 text-slate-700">
                  {activeWorkshop.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Post-Workshop Feedback Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <MessageSquarePlus className="w-3.5 h-3.5 text-[#1D63EB]" />
                    <span>Post-Workshop Feedback</span>
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            star <= feedbackRating ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {feedbackSubmittedIds.includes(activeWorkshop.id) ? (
                  <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Thank you! Your feedback was logged for the Events &amp;
                      Scientific Activities team.
                    </span>
                  </p>
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share quick feedback on lab materials or pacing..."
                      className="flex-1 h-9 px-3 rounded-full border border-slate-200 text-[11px] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackSubmittedIds((prev) => [
                          ...prev,
                          activeWorkshop.id,
                        ]);
                        setFeedbackComment("");
                      }}
                      className="h-9 px-3.5 rounded-full bg-slate-900 text-white text-[11px] font-bold active:scale-[0.98] transition cursor-pointer"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: Register / Cancel + Live QR Check-in */}
              <div className="pt-2 flex items-center gap-2">
                {activeWorkshop.registeredMemberIds.includes(
                  currentMemberId
                ) ? (
                  <button
                    type="button"
                    onClick={() =>
                      cancelWorkshopRegistration(
                        activeWorkshop.id,
                        currentMemberId
                      )
                    }
                    className="flex-1 h-11 rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-extrabold hover:bg-red-100 active:scale-[0.98] transition cursor-pointer"
                  >
                    Cancel Registration
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      registerForWorkshop(activeWorkshop.id, currentMemberId)
                    }
                    className="flex-1 h-11 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white text-xs font-extrabold shadow-[0_4px_14px_rgba(29,99,235,0.3)] hover:shadow-md active:scale-[0.98] transition cursor-pointer"
                  >
                    Register Seat
                  </button>
                )}

                <Link
                  href="/checkin"
                  className="flex-1 h-11 rounded-full bg-gradient-to-r from-[#062456] to-[#0A3882] text-white text-xs font-extrabold hover:shadow-md active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4 text-[#38E4FF]" />
                  <span>Live QR Check-in</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
