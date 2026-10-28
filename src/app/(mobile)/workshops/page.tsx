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
import { useTranslation } from "@/lib/i18n/useTranslation";

type WorkshopFilter = "All" | "Upcoming" | "Completed" | "Mine";

const FILTER_TABS: WorkshopFilter[] = ["All", "Upcoming", "Completed", "Mine"];

export default function MobileWorkshopsPage() {
  const { t, lang, isRtl } = useTranslation();
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

  return (
    <MobileAppShell>
      <div className="px-4 pt-3 pb-6 sm:px-6 space-y-4">
        {/* Top Cosmic Header Banner matching Welcome Page Aesthetic */}
        <div
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 bg-[#0B1528] border border-[#2B4875]/60 shadow-[0_16px_38px_rgba(11,21,40,0.26)] text-white animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <img
            src="/brand/hero_rank_banner.webp"
            alt="QUANTERS Cosmic Lab Banner"
            className="absolute inset-0 w-full h-full object-cover object-right opacity-90 select-none pointer-events-none animate-zero-g"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528]/96 via-[#101F38]/78 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="min-w-0 max-w-[65%]">
              <span className="font-mono text-xs font-bold tracking-[0.18em] text-[#7DD3FC] uppercase block">
                {isRtl ? `دليل الورشات · ${workshops.length} جلسات` : `CATALOG · 0${workshops.length} SESSIONS`}
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight mt-1 leading-tight drop-shadow">
                {isRtl ? (
                  t.workshops.catalogTitle
                ) : (
                  <>
                    Workshops{" "}
                    <span className="font-editorial italic font-normal text-sky-200">
                      &amp; Labs
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs font-mono text-slate-300/90 mt-1 drop-shadow">
                {t.workshops.catalogSubtitle}
              </p>
            </div>
            <Link
              href="/checkin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#182C4E]/95 hover:bg-[#38BDF8] text-[#7DD3FC] hover:text-[#0F1E36] text-xs font-bold font-mono uppercase tracking-wider shadow-md active:scale-[0.98] transition border border-[#38BDF8]/40 shrink-0 backdrop-blur-md"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isRtl ? "رمز الحضور" : "QR Pass"}</span>
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
            const tabLabel = isRtl
              ? (tab === "All" ? t.workshops.allFilter : tab === "Upcoming" ? t.workshops.upcomingFilter : tab === "Completed" ? t.workshops.completedFilter : t.workshops.registeredFilter)
              : tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`relative pb-2.5 text-xs sm:text-sm font-bold font-display tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? "text-[#182C4E]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <span>{tabLabel}</span>
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-[2.5px] bg-[#182C4E] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Workshops & Activities — Clean Unified Cards */}
        {filteredWorkshops.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center space-y-2 animate-rise">
            <div className="w-12 h-12 rounded-xl bg-[#F0F6FF] text-[#182C4E] flex items-center justify-center mx-auto border border-[#D5E3F5]">
              <Calendar className="w-6 h-6 text-[#0284C7]" />
            </div>
            <h3 className="font-display font-extrabold text-sm text-[#0F1E36]">
              No Scheduled Sessions Yet
            </h3>
            <p className="text-xs text-slate-500 font-editorial italic max-w-xs mx-auto">
              New workshops, scientific labs, and club activities will be scheduled and published here.
            </p>
          </div>
        ) : (
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
                className="group bg-white rounded-xl border border-slate-200/90 border-l-[3px] border-l-[#182C4E] p-4 shadow-[0_3px_14px_rgba(15,30,54,0.04)] hover:border-[#182C4E]/50 hover:shadow-[0_8px_22px_rgba(15,30,54,0.08)] active:scale-[0.99] transition-all cursor-pointer animate-rise"
              >
                <div className="flex items-start gap-3.5">
                  <FieldIcon field={ws.iconType} size={26} boxed />

                  <div className="flex-1 min-w-0">
                    {/* Top Specification Metadata Line */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                        <span className="text-[#0284C7]">{actKind}</span>
                        <span className="text-slate-300">·</span>
                        <span>{ws.level}</span>
                        {ws.status === "Running" && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="inline-flex items-center gap-1 text-[#0284C7]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                              <span>LIVE</span>
                            </span>
                          </>
                        )}
                        {isAttended && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-[#182C4E]">VERIFIED</span>
                          </>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] border border-[#D5E3F5] text-xs font-bold font-mono text-[#182C4E] shrink-0 tabular-nums">
                        +{ws.xpReward} XP
                      </span>
                    </div>

                    <h2 className="mt-1 text-base sm:text-lg font-black font-display text-[#0F1E36] leading-snug tracking-tight group-hover:text-[#0284C7] transition-colors">
                      {ws.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                        <span>
                          {ws.dateLabel} · {ws.timeRange}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#182C4E]/70 shrink-0" />
                        <span>{ws.location}</span>
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 tabular-nums">
                        <Users className="w-3.5 h-3.5 text-[#182C4E]" />
                        <span>{ws.seatsLeft} seats open</span>
                      </span>

                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isRegistered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-mono font-bold uppercase tracking-wider">
                            <Check className="w-3 h-3 text-[#0284C7]" />
                            <span>Enrolled</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              registerForWorkshop(ws.id, currentMemberId)
                            }
                            className="h-7 px-3 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_3px_10px_rgba(16,31,56,0.2)] hover:brightness-105 active:scale-[0.98] transition cursor-pointer border border-[#2B4875]/60"
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
      )}
    </div>

      {/* Workshop Detail Modal */}
      {activeWorkshop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[440px] max-h-[78dvh] sm:max-h-[82dvh] rounded-2xl bg-white overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-rise"
          >
            <div className="bg-gradient-to-r from-[#182C4E] to-[#101F38] text-white p-5 relative border-b border-[#2B4875]/60">
              <button
                type="button"
                onClick={() => setSelectedWorkshopId(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <FieldIcon field={activeWorkshop.iconType} size={28} boxed />
                <div className="pr-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/10 text-sky-100 border border-white/15 font-mono">
                      {resolveActivityType(activeWorkshop)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#38BDF8]/20 text-[#7DD3FC] border border-[#38BDF8]/35 font-mono">
                      +{activeWorkshop.xpReward} XP
                    </span>
                  </div>

                  <h2 className="mt-1.5 text-base font-extrabold leading-snug text-white">
                    {activeWorkshop.title}
                  </h2>
                  <p className="text-xs text-sky-200 mt-0.5">
                    Instructed by {activeWorkshop.instructor}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-[#F0F6FF] border border-[#D5E3F5]">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase font-mono">
                    Date &amp; Time
                  </span>
                  <p className="font-bold text-[#0F1E36] mt-0.5">
                    {activeWorkshop.dateLabel} · {activeWorkshop.timeRange}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase font-mono">
                    Venue &amp; Capacity
                  </span>
                  <p className="font-bold text-[#0F1E36] mt-0.5">
                    {activeWorkshop.location} ({activeWorkshop.seatsLeft} left)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-[#0F1E36] mb-1">
                  Syllabus &amp; Overview
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {activeWorkshop.description}
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-[#0F1E36] mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Learning Objectives &amp; Materials</span>
                </h3>
                <ul className="space-y-1 text-slate-700">
                  {activeWorkshop.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Post-Workshop Feedback Box */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0F1E36] flex items-center gap-1.5">
                    <MessageSquarePlus className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Post-Workshop Feedback</span>
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="text-[#0284C7] cursor-pointer"
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
                  <p className="text-xs font-bold text-[#182C4E] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
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
                      placeholder="Share quick feedback on lab materials..."
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white"
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
                      className="h-9 px-3.5 rounded-lg bg-[#182C4E] text-white text-xs font-bold active:scale-[0.98] transition cursor-pointer"
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
                    className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-extrabold hover:bg-slate-200 active:scale-[0.98] transition cursor-pointer"
                  >
                    {t.workshops.cancelRegistration}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      registerForWorkshop(activeWorkshop.id, currentMemberId)
                    }
                    className="flex-1 h-11 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold shadow-sm active:scale-[0.98] transition cursor-pointer"
                  >
                    {t.workshops.registerNow}
                  </button>
                )}

                <Link
                  href="/checkin"
                  className="flex-1 h-11 rounded-xl bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-extrabold hover:bg-[#E0F2FE] active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4 text-[#0284C7]" />
                  <span>{isRtl ? "رمز الحضور المباشر" : "Live QR Check-in"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
