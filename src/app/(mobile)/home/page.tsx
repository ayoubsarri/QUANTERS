"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  GraduationCap,
  MapPin,
  QrCode,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { FieldIcon } from "@/components/shared/FieldIcon";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

export default function MobileHomeHubPage() {
  const members = useQuantersStore((s) => s.members);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const workshops = useQuantersStore((s) => s.workshops);
  const tasks = useQuantersStore((s) => s.tasks);
  const explorePosts = useQuantersStore((s) => s.explorePosts);
  const messages = useQuantersStore((s) => s.messages);
  const departments = useQuantersStore((s) => s.departments);
  const registerForWorkshop = useQuantersStore((s) => s.registerForWorkshop);
  const confirmTaskReceipt = useQuantersStore((s) => s.confirmTaskReceipt);
  const deliverTask = useQuantersStore((s) => s.deliverTask);
  const archiveTask = useQuantersStore((s) => s.archiveTask);
  const unarchiveTask = useQuantersStore((s) => s.unarchiveTask);

  const member =
    members.find((m) => m.id === currentMemberId) || members[0];
  const isAlumni = member.status === "Alumni";
  const dept = departments.find((d) => d.id === member.departmentId);

  const motmMember =
    members.find((m) => m.recognitionLabels.includes("Member of the Month")) ||
    members.find((m) => m.id === "mem-sara") ||
    members[1];

  const unreadCount = messages.filter((m) => m.unread).length;
  const nextWorkshop =
    workshops.find((w) => w.status === "Running") ||
    workshops.find((w) => w.status === "Published") ||
    workshops[0];
  const featuredNews =
    explorePosts.find((p) => p.id === "exp-1") || explorePosts[0];

  const myTasksAll = tasks.filter((t) =>
    t.assignees.some((a) => a.memberId === member.id)
  );
  const activeTasks = myTasksAll.filter((t) => {
    const line = t.assignees.find((a) => a.memberId === member.id);
    return !t.archived && line?.status !== "Validated";
  });
  const doneAndOldTasks = myTasksAll.filter((t) => {
    const line = t.assignees.find((a) => a.memberId === member.id);
    return Boolean(t.archived) || line?.status === "Validated";
  });

  const [taskTab, setTaskTab] = useState<"active" | "done">("active");
  const [showMotmDetails, setShowMotmDetails] = useState(false);
  const [deliverModalTaskId, setDeliverModalTaskId] = useState<string | null>(
    null
  );
  const [proofText, setProofText] = useState("");
  const [mentorTeamOptIn, setMentorTeamOptIn] = useState(true);

  const isRegisteredNext = nextWorkshop?.registeredMemberIds.includes(
    member.id
  );

  const xpSeasonMax = 1000;
  const xpProgressPct = Math.min(
    100,
    Math.round(((member.xpSeason || 820) / xpSeasonMax) * 100)
  );

  const handleDeliverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverModalTaskId || !proofText.trim()) return;
    deliverTask(deliverModalTaskId, member.id, proofText.trim());
    setDeliverModalTaskId(null);
    setProofText("");
  };

  return (
    <MobileAppShell>
      <div className="px-4 pt-3 pb-6 sm:px-6 space-y-3.5">
        {/* Top Editorial & Technical Greeting Header (Unified for Member & Alumni) */}
        <div
          className="flex items-center justify-between gap-1.5 sm:gap-2 animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
            <Link href="/profile" className="relative shrink-0 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[#182C4E]/30 bg-[#101F38] shadow-[0_4px_12px_rgba(15,30,54,0.12)] transition-transform duration-200 group-hover:scale-105 active:scale-95">
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#38BDF8] border-2 border-[#F4F7FB]" />
            </Link>

            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider truncate">
                <span className="font-bold text-[#0284C7] shrink-0">
                  {isAlumni
                    ? `ALUMNI ’${member.graduationYear?.slice(-2) || "26"}`
                    : dept?.shortName || "IT & Tech"}
                </span>
                <span className="text-slate-300 shrink-0 hidden sm:inline">·</span>
                <span className="shrink-0 hidden sm:inline">{member.quanterId}</span>
              </div>

              <h1 className="text-[15px] sm:text-lg font-black font-display text-[#0F1E36] tracking-tight leading-tight whitespace-nowrap truncate mt-0.5">
                {member.fullName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Link
              href="/admin/overview"
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/75 text-[9.5px] sm:text-[11px] font-mono font-bold text-white flex items-center gap-1 sm:gap-1.5 justify-center transition active:scale-95 shadow-2xs shrink-0 whitespace-nowrap"
              title="Open Admin Console"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0" />
              <span>Open Admin Console</span>
            </Link>

            <Link
              href="/manager"
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg bg-white border border-slate-200/90 text-[10px] sm:text-[11px] font-mono font-bold text-[#0F1E36] hover:border-[#182C4E] flex items-center justify-center transition active:scale-95 shadow-2xs shrink-0"
              title="Department & Team Operations"
            >
              <span>Desk</span>
            </Link>

            <Link
              href="/notifications"
              className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200/90 text-[#0F1E36] hover:border-[#182C4E] flex items-center justify-center transition active:scale-95 shadow-2xs group shrink-0"
              aria-label="Notifications"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform duration-200 group-hover:rotate-6"
              >
                <path
                  d="M18 8C18 6.4 17.4 4.8 16.2 3.7C15.1 2.6 13.6 2 12 2C10.4 2 8.9 2.6 7.8 3.7C6.6 4.8 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.7 21C13.5 21.3 13.3 21.6 12.9 21.8C12.6 21.9 12.3 22 12 22C11.7 22 11.4 21.9 11.1 21.8C10.7 21.6 10.5 21.3 10.3 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0284C7] ring-2 ring-white" />
              )}
            </Link>
          </div>
        </div>

        {/* Nano Banana Cosmic Crocheted Astronaut & Cyan Spiral Galaxy Hero Card */}
        <div
          className="relative rounded-xl p-4 sm:p-5 text-white overflow-hidden bg-[#040814] border border-slate-900 shadow-[0_16px_38px_rgba(3,8,18,0.32)] animate-rise group"
          style={{ animationDelay: "50ms" }}
        >
          <img
            src="/brand/hero_rank_banner.webp"
            alt="QUANTERS Crocheted Astronaut & Cyan Spiral Galaxy"
            className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none animate-zero-g"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030812]/96 via-[#040B1B]/72 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#030812]/90 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-[66%]">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
              <span className="font-mono text-xs font-bold tracking-[0.12em] text-[#7DD3FC] uppercase">
                {isAlumni ? `FELLOW ’${member.graduationYear?.slice(-2) || "26"}` : `RANK 0${member.level}`}
              </span>
              <span className="text-white/30 text-xs">·</span>
              <span className="font-mono text-xs text-slate-300 uppercase tracking-wider">
                {member.status}
              </span>
            </div>

            <div className="mt-1 flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                {member.levelTitle.split(" ")[0] || "Quantum"}
              </span>
              <span className="font-editorial italic font-normal text-2xl sm:text-[26px] text-[#7DD3FC] leading-none">
                {member.levelTitle.split(" ").slice(1).join(" ") || "Explorer"}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-3xl sm:text-4xl font-black font-display text-white tracking-[-0.03em] tabular-nums leading-none">
                {(isAlumni ? member.xpTotal : member.xpSeason).toLocaleString()}
              </span>
              <span className="text-xs font-black font-mono tracking-[0.16em] text-[#7DD3FC] uppercase">
                {isAlumni ? "LIFETIME XP" : "XP"}
              </span>
            </div>

            <p className="mt-1 font-mono text-xs text-slate-300/95">
              {isAlumni ? (
                <span>
                  {member.alumniPosition || "Doctoral Researcher · Former President"}
                </span>
              ) : (
                <>
                  <span className="text-white font-bold tabular-nums">
                    {Math.round((member.xpSeason / 1000) * 100)}%
                  </span>{" "}
                  · {Math.max(0, 1000 - member.xpSeason).toLocaleString()} XP to R0{member.level + 1}
                </>
              )}
            </p>
          </div>

          <div className="relative z-10 mt-3.5 pt-0.5">
            <div className="h-[3px] w-full bg-white/15 rounded-full relative overflow-visible">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#E0F2FE] shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-700 relative"
                style={{ width: `${isAlumni ? 100 : xpProgressPct}%` }}
              >
                <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-[#38BDF8] shadow-[0_0_10px_#38BDF8]" />
              </div>
            </div>
          </div>
        </div>

        {/* Open Swiss Architectural 4-Metric Grid (Zero Numeration 01..04) */}
        <div
          className="border-y border-slate-200/90 py-2.5 grid grid-cols-4 divide-x divide-slate-200/80 animate-rise"
          style={{ animationDelay: "90ms" }}
        >
          <Link
            href="/badges"
            className="flex flex-col items-start px-2.5 first:pl-1 hover:translate-x-0.5 transition-transform cursor-pointer group"
          >
            <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
              {member.badgeIds.length}
            </span>
            <span className="text-xs font-medium text-slate-500 leading-none mt-0.5 whitespace-nowrap">
              Badges
            </span>
          </Link>

          <Link
            href="/workshops"
            className="flex flex-col items-start px-2.5 hover:translate-x-0.5 transition-transform cursor-pointer group"
          >
            <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
              {member.workshopsCompletedCount}
            </span>
            <span className="text-xs font-medium text-slate-500 leading-none mt-0.5 whitespace-nowrap">
              Sessions
            </span>
          </Link>

          <Link
            href="/projects/submit"
            className="flex flex-col items-start px-2.5 hover:translate-x-0.5 transition-transform cursor-pointer group"
          >
            <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
              {member.projectsCompletedCount}
            </span>
            <span className="text-xs font-medium text-slate-500 leading-none mt-0.5 whitespace-nowrap">
              Projects
            </span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-start px-2.5 hover:translate-x-0.5 transition-transform cursor-pointer group"
          >
            <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
              {member.xpTotal.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500 leading-none mt-0.5 whitespace-nowrap">
              Total XP
            </span>
          </Link>
        </div>

        {/* Alumni Mentorship & Advisory Strip (Only shown when in Alumni Mode — No Gala Card) */}
        {isAlumni && (
          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-[0_4px_14px_rgba(15,30,54,0.04)] flex items-center justify-between gap-2.5 animate-rise">
            <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input
                type="checkbox"
                checked={mentorTeamOptIn}
                onChange={(e) => setMentorTeamOptIn(e.target.checked)}
                className="w-4 h-4 rounded accent-[#182C4E] cursor-pointer shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-extrabold font-display text-[#0F1E36] block leading-tight">
                  Alumni Scientific Mentorship
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Open to advising student research teams &amp; jury reviews
                </span>
              </div>
            </label>
            <Link
              href="/proposals"
              className="px-2.5 py-1.5 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-[11px] font-mono font-bold hover:bg-[#E0F2FE] transition shrink-0"
            >
              Host Talk →
            </Link>
          </div>
        )}

        {/* Softened Cosmic Slate-Navy Editorial Honour Ribbon (Star of the Month) */}
        <div
          className="rounded-xl bg-gradient-to-r from-[#12223D] via-[#182C4E] to-[#1D355E] text-white border border-[#2B4875]/65 border-l-[3px] border-l-[#38BDF8] px-3 py-2 shadow-[0_6px_18px_rgba(16,31,56,0.14)] animate-rise"
          style={{ animationDelay: "130ms" }}
        >
          <button
            type="button"
            onClick={() => setShowMotmDetails((v) => !v)}
            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0 whitespace-nowrap overflow-hidden">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#7DD3FC] shrink-0 transition-transform duration-300 group-hover:rotate-12"
              >
                <polygon
                  points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.7 5.8,21 7,14.1 2,9.3 9,8.5"
                  fill="currentColor"
                  fillOpacity="0.28"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              <span className="font-editorial italic text-base text-[#BAE6FD] shrink-0">
                Star<span className="hidden sm:inline"> of the Month</span>
              </span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-xs font-display font-bold text-white">
                {motmMember.fullName}
              </span>
              <span className="font-mono text-xs font-bold text-[#7DD3FC] shrink-0">
                +50 XP
              </span>
            </div>
            {showMotmDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-300 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
            )}
          </button>

          {showMotmDetails && (
            <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between gap-3 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <img
                  src={motmMember.avatarUrl}
                  alt={motmMember.fullName}
                  className="w-7 h-7 rounded-lg object-cover border border-[#7DD3FC]/60"
                />
                <div>
                  <p className="font-bold text-white">
                    {motmMember.levelTitle} · {motmMember.xpMonth} XP this month
                  </p>
                  <p className="text-xs text-slate-300">
                    96% workshop attendance &amp; scientific leadership
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-[#7DD3FC] uppercase tracking-wider shrink-0">
                [Laureate]
              </span>
            </div>
          )}
        </div>

        {/* Next Session — Clean Unified Card */}
        {nextWorkshop && (
          <div
            className="animate-rise space-y-1.5"
            style={{ animationDelay: "170ms" }}
          >
            <div className="flex items-baseline justify-between px-0.5">
              <div className="flex items-baseline gap-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#101F38]">
                  NEXT SESSION
                </h2>
                <span className="font-editorial italic text-base text-slate-500">
                  scheduled lab
                </span>
              </div>
              <Link
                href="/workshops"
                className="font-mono text-xs font-bold text-[#182C4E] hover:text-[#0284C7] hover:underline"
              >
                All sessions →
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-[0_4px_18px_rgba(15,30,54,0.05)] transition-all duration-200 hover:border-[#182C4E]/40">
              <div className="flex items-start gap-3">
                <FieldIcon field={nextWorkshop.iconType} size={26} boxed />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {nextWorkshop.level} · Lab Session
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] text-[#162847] border border-[#D5E3F5] font-mono text-xs font-bold tabular-nums shrink-0">
                      +{nextWorkshop.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-base font-black font-display text-[#0F1E36] leading-snug mt-0.5">
                    {nextWorkshop.title}
                  </h3>

                  <div className="mt-1 space-y-0.5 text-xs text-slate-600 font-mono">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#182C4E] shrink-0" />
                      <span>
                        {nextWorkshop.dateLabel} · {nextWorkshop.timeRange}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{nextWorkshop.location}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
                  {nextWorkshop.seatsLeft} seats open
                </span>

                <div className="flex items-center gap-2">
                  {!isRegisteredNext ? (
                    <button
                      type="button"
                      onClick={() =>
                        registerForWorkshop(nextWorkshop.id, member.id)
                      }
                      className="h-8 px-3 rounded-lg bg-[#F0F6FF] hover:bg-[#E2EEFC] text-[#162847] border border-[#D5E3F5] text-xs font-bold font-display active:scale-[0.98] transition cursor-pointer"
                    >
                      Reserve Seat
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F0F6FF] text-[#162847] border border-[#D5E3F5] font-mono text-xs font-bold">
                      <Check className="w-3.5 h-3.5 text-[#0284C7]" /> Enrolled
                    </span>
                  )}
                  <Link
                    href="/checkin"
                    className="h-8 px-3 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-bold font-display border border-[#2B4875]/60 shadow-[0_4px_12px_rgba(16,31,56,0.2)] hover:brightness-110 active:scale-[0.98] transition flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#7DD3FC]" />
                    <span>Check-in</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Live Session Check-In Bar + Compact Skill Exams / Projects / Proposals Trio (Zero Numeration) */}
        <div
          className="space-y-2 animate-rise"
          style={{ animationDelay: "220ms" }}
        >
          {/* Compact Single-Row Live Session Check-In Strip */}
          <Link
            href="/checkin"
            className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#12223D] via-[#182C4E] to-[#1D355E] border border-[#2B4875]/65 text-white flex items-center justify-between gap-2 shadow-[0_6px_18px_rgba(16,31,56,0.16)] hover:brightness-110 active:scale-[0.99] transition group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-[#7DD3FC]/35 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 8V5.5C4 4.7 4.7 4 5.5 4H8M16 4H18.5C19.3 4 20 4.7 20 5.5V8M20 16V18.5C20 19.3 19.3 20 18.5 20H16M8 20H5.5C4.7 20 4 19.3 4 18.5V16"
                    stroke="#7DD3FC"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  <rect x="8.5" y="8.5" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M5 12H19" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-black font-display tracking-tight text-white">
                    Live Check-In
                  </span>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="font-mono text-[11px] text-slate-300">
                    QR or 6-digit code
                  </span>
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 border border-[#7DD3FC]/30 font-mono text-[11px] font-bold text-[#7DD3FC] group-hover:translate-x-0.5 transition-transform shrink-0">
              <span>SCAN</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          {/* Compact 3-Column Tool Trio: Skill Exams / Projects / Proposals (Zero 01/02/03 Numeration) */}
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/exams"
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-[#182C4E]/60 active:scale-[0.98] transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 shadow-[0_3px_10px_rgba(15,30,54,0.04)]"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polygon
                    points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5"
                    stroke="#7DD3FC"
                    strokeWidth="1.75"
                    fill="#38BDF8"
                    fillOpacity="0.2"
                  />
                  <path d="M9 12.2L11 14.2L15.2 9.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] sm:text-xs font-black font-display text-[#0F1E36] block leading-tight group-hover:text-[#0284C7] transition-colors">
                  Skill Exams
                </span>
                <span className="font-mono text-[10px] text-slate-500 block leading-tight mt-0.5">
                  6 exams
                </span>
              </div>
            </Link>

            <Link
              href="/projects/submit"
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-[#182C4E]/60 active:scale-[0.98] transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 shadow-[0_3px_10px_rgba(15,30,54,0.04)]"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="7" cy="7" r="2.2" stroke="#7DD3FC" strokeWidth="1.75" />
                  <circle cx="17" cy="7" r="2.2" stroke="#BAE6FD" strokeWidth="1.75" />
                  <circle cx="12" cy="17" r="2.2" stroke="#FFFFFF" strokeWidth="1.75" />
                  <path d="M8.8 8.5L11 15M15.2 8.5L13 15" stroke="#7DD3FC" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] sm:text-xs font-black font-display text-[#0F1E36] block leading-tight group-hover:text-[#0284C7] transition-colors">
                  Projects
                </span>
                <span className="font-mono text-[10px] text-slate-500 block leading-tight mt-0.5">
                  Submit
                </span>
              </div>
            </Link>

            <Link
              href="/proposals"
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-[#182C4E]/60 active:scale-[0.98] transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 shadow-[0_3px_10px_rgba(15,30,54,0.04)]"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z"
                    stroke="#7DD3FC"
                    strokeWidth="1.75"
                    fill="#38BDF8"
                    fillOpacity="0.22"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] sm:text-xs font-black font-display text-[#0F1E36] block leading-tight group-hover:text-[#0284C7] transition-colors">
                  Proposals
                </span>
                <span className="font-mono text-[10px] text-slate-500 block leading-tight mt-0.5">
                  Pitch idea
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* My Assigned Tasks Card with Compact Done/Archive List */}
        {!isAlumni && (
          <div
            className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-[0_4px_18px_rgba(15,30,54,0.05)] animate-rise"
            style={{ animationDelay: "280ms" }}
          >
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#101F38]">
                  ASSIGNED TASKS
                </h2>
                <span className="font-editorial italic text-base text-slate-500">
                  missions
                </span>
              </div>

              {/* Segmented Toggle: Active (N) | Icon-Only Archive */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5]">
                <button
                  type="button"
                  onClick={() => setTaskTab("active")}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold font-display active:scale-[0.98] transition cursor-pointer ${
                    taskTab === "active"
                      ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Active ({activeTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskTab("done")}
                  title="Done & Archive"
                  aria-label="Done & Archive"
                  className={`p-1.5 rounded-md active:scale-[0.98] transition cursor-pointer flex items-center justify-center ${
                    taskTab === "done"
                      ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {taskTab === "active" ? (
              <div className="divide-y divide-slate-200/80">
                {activeTasks.map((task) => {
                  const line = task.assignees.find(
                    (a) => a.memberId === member.id
                  );
                  if (!line) return null;
                  return (
                    <div
                      key={task.id}
                      className="py-2.5 first:pt-0 last:pb-0 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
                            {task.category} // {line.roleInTask}
                          </span>
                          <h3 className="text-sm font-extrabold font-display text-[#0F1E36] mt-0.5">
                            {task.title}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {task.deadline} · {task.locationOrShift}
                            </span>
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] text-[#162847] border border-[#D5E3F5] font-mono text-xs font-bold shrink-0 tabular-nums">
                          +{line.proposedScore} XP
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                        <span className="font-mono text-xs text-slate-500">
                          STATE:{" "}
                          <strong className="text-[#0F1E36] font-bold uppercase">
                            {line.status}
                          </strong>
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!line.receiptConfirmed ? (
                            <button
                              type="button"
                              onClick={() =>
                                confirmTaskReceipt(task.id, member.id)
                              }
                              className="h-7 px-2.5 rounded-lg bg-[#F0F6FF] hover:bg-[#E2EEFC] text-[#162847] border border-[#D5E3F5] text-xs font-bold font-display active:scale-[0.98] transition cursor-pointer"
                            >
                              Confirm Receipt
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-[#162847] flex items-center gap-1 font-mono">
                              <Check className="w-3.5 h-3.5 text-[#0284C7]" /> Confirmed
                            </span>
                          )}

                          {line.status !== "Delivered" &&
                            line.status !== "Validated" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeliverModalTaskId(task.id);
                                  setProofText(line.proofUrlOrNote || "");
                                }}
                                className="h-7 px-2.5 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-bold font-display border border-[#2B4875]/60 active:scale-[0.98] transition flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3 h-3 text-[#7DD3FC]" />
                                <span>Deliver Proof</span>
                              </button>
                            )}

                          <button
                            type="button"
                            onClick={() => archiveTask(task.id)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-[0.98] transition flex items-center justify-center cursor-pointer"
                            title="Archive"
                            aria-label="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {activeTasks.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-500">
                    All assigned tasks are completed and archived.
                  </div>
                )}
              </div>
            ) : (
              /* Small, Compact Done & Archived Task Rows */
              <div className="space-y-1.5">
                {doneAndOldTasks.map((task) => {
                  const line = task.assignees.find(
                    (a) => a.memberId === member.id
                  );
                  if (!line) return null;
                  const xpAwarded = line.awardedScore ?? line.proposedScore;
                  return (
                    <div
                      key={task.id}
                      className="py-2 px-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 h-4 rounded bg-[#182C4E] text-[#7DD3FC] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0F1E36] leading-tight">
                            {task.title}
                          </p>
                          <span className="text-[10.5px] font-mono text-slate-500">
                            {task.category} · {line.status === "Validated" ? "Validated" : "Archived"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold font-mono bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] tabular-nums">
                          +{xpAwarded} XP
                        </span>
                        {task.archived && line.status !== "Validated" && (
                          <button
                            type="button"
                            onClick={() => unarchiveTask(task.id)}
                            className="p-1 rounded bg-white border border-slate-200 text-[#182C4E] hover:bg-[#F0F6FF] cursor-pointer"
                            title="Restore to Active"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {doneAndOldTasks.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-500">
                    No archived or validated tasks yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Latest News Card (See all -> /explore) */}
        {featuredNews && (
          <div
            className="animate-rise"
            style={{ animationDelay: "340ms" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F1E36]">
                Latest News
              </h2>
              <Link
                href="/explore"
                className="text-xs font-mono font-bold text-[#182C4E] hover:text-[#0284C7]"
              >
                See all →
              </Link>
            </div>

            <Link
              href="/explore"
              className="block bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-[0_4px_16px_rgba(15,30,54,0.04)] hover:border-[#182C4E]/40 active:scale-[0.99] transition"
            >
              <div className="relative h-32 w-full">
                <img
                  src={featuredNews.imageUrl}
                  alt={featuredNews.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/90 via-[#101F38]/30 to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#182C4E]/90 text-[#7DD3FC] border border-[#38BDF8]/35">
                  {featuredNews.tagLabel}
                </span>
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h3 className="text-xs font-extrabold leading-snug line-clamp-2">
                    {featuredNews.title}
                  </h3>
                  <p className="text-xs text-sky-200 mt-0.5 font-mono">
                    {featuredNews.source} · {featuredNews.readTime}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* 1-Tap Deliver Task Proof Modal */}
      {deliverModalTaskId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 pb-16 sm:pb-4">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[380px] rounded-xl bg-white p-5 shadow-2xl border border-slate-200 animate-rise"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold font-display text-[#0F1E36]">
                Deliver Task Proof
              </h3>
              <button
                type="button"
                onClick={() => setDeliverModalTaskId(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleDeliverSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deliverable Link or Completion Summary
                </label>
                <textarea
                  rows={3}
                  required
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Paste GitHub/Drive link or describe completed work..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#182C4E]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeliverModalTaskId(null)}
                  className="h-9 px-3.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold border border-[#2B4875]/60 active:scale-[0.98] transition cursor-pointer"
                >
                  Submit Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
