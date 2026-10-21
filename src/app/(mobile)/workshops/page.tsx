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
      <div className="px-4 pt-3 pb-6 sm:px-6 space-y-3.5">
        {/* Top Header */}
        <div
          className="flex items-center justify-between gap-2 animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              Workshops &amp; Activities
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 font-sans">
              Hands-on labs, scientific sessions &amp; club activities
            </p>
          </div>
          <Link
            href="/checkin"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#062456] to-[#0A3882] text-white text-xs font-extrabold font-display shadow-sm hover:shadow-md active:scale-[0.98] transition border border-white/20 shrink-0"
          >
            <QrCode className="w-4 h-4 text-[#38E4FF]" />
            <span>Check-in</span>
          </Link>
        </div>

        {/* Filter Pills: All | Upcoming | Completed | Mine */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 animate-rise"
          style={{ animationDelay: "40ms" }}
        >
          {FILTER_TABS.map((tab) => {
            const active = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold font-display active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)] border border-transparent"
                    : "bg-white/80 backdrop-blur-md text-slate-600 border border-white/80 hover:bg-white hover:text-slate-900 shadow-2xs"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Workshops & Activities Cards List */}
        <div className="space-y-3">
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
                className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-4 sm:p-5 shadow-[0_6px_24px_rgba(9,25,47,0.05)] hover:border-[#1D63EB]/40 hover:bg-white/95 active:scale-[0.99] transition-all cursor-pointer animate-rise"
              >
                <div className="flex items-start gap-3.5">
                  <FieldIcon field={ws.iconType} size={30} boxed />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base sm:text-lg font-black font-display text-slate-900 leading-snug">
                        {ws.title}
                      </h2>
                      <span className="px-3 py-1 rounded-full text-xs font-black font-mono bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0 tabular-nums shadow-2xs">
                        +{ws.xpReward} XP
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold font-display border ${getActivityChipClass(
                          actKind
                        )}`}
                      >
                        {actKind}
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold font-display border ${getLevelChipClass(
                          ws.level
                        )}`}
                      >
                        {ws.level}
                      </span>
                      {ws.status === "Running" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold font-display bg-emerald-500/15 text-emerald-700 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Live Now</span>
                        </span>
                      )}
                      {isAttended && (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold font-display bg-sky-100 text-[#094C9C] border border-sky-200/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1D63EB]" />
                          <span>Attended</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 space-y-1 text-xs sm:text-sm text-slate-600 sm:flex sm:items-center sm:gap-4 sm:space-y-0 font-sans">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#1D63EB] shrink-0" />
                        <span>
                          {ws.dateLabel} · {ws.timeRange}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{ws.location}</span>
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 tabular-nums font-sans">
                        <Users className="w-3.5 h-3.5 text-[#1D63EB]" />
                        {ws.seatsLeft} seats left
                      </span>

                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isRegistered ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200 shadow-2xs">
                            <Check className="w-3 h-3" />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              registerForWorkshop(ws.id, currentMemberId)
                            }
                            className="h-8 px-4 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white text-[11px] font-extrabold hover:shadow-md active:scale-[0.98] transition cursor-pointer"
                          >
                            Register
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-[440px] max-h-[86vh] rounded-t-3xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl overflow-hidden shadow-2xl border border-white/80 flex flex-col animate-rise">
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
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/15 text-sky-100 border border-white/20">
                      {resolveActivityType(activeWorkshop)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#38E4FF] text-[#061E47]">
                      {activeWorkshop.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
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
