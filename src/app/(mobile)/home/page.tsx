"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Clock,
  FileCheck2,
  FolderGit2,
  GraduationCap,
  Lightbulb,
  MapPin,
  QrCode,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { PlanetEmblem } from "@/components/shared/PlanetEmblem";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
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
  const firstName =
    member.fullName.startsWith("Dr.")
      ? "Dr. Amine"
      : member.fullName.split(" ")[0] || "Ayoub";
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
  const alumniFeaturedWorkshop =
    workshops.find((w) => w.id === "ws-quantum") || nextWorkshop;
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

  // Alumni interactive toggles
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false);
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

  // ============================================================================
  // ALUMNI UNIFIED HOME VIEW
  // ============================================================================
  if (isAlumni) {
    return (
      <MobileAppShell>
        <div className="px-4 pt-3 pb-6 sm:px-6 space-y-3.5">
          {/* Alumni Top Greeting Header */}
          <div
            className="flex items-center justify-between gap-2 animate-rise"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Link href="/profile" className="relative shrink-0">
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-300/80 shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 px-1.5 py-0.5 rounded-full bg-[#FBB03B] text-[#061E47] text-[10px] font-black font-mono">
                  ’{member.graduationYear?.slice(-2) || "26"}
                </span>
              </Link>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-black tracking-wide font-display">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>
                    QUANTA Alumni Fellow · Class of {member.graduationYear || "2026"}
                  </span>
                </span>
                <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 truncate mt-0.5">
                  Welcome back, {firstName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/notifications"
                className="relative w-10 h-10 rounded-full bg-white/85 backdrop-blur-md border border-white/80 flex items-center justify-center text-slate-700 hover:bg-white shadow-2xs active:scale-[0.98] transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4.5 px-1 rounded-full bg-[#ED1C24] text-white text-xs font-black flex items-center justify-center tabular-nums shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Prestige Alumni Fellowship Honors Card (Nano Banana Static Cosmic Banner) */}
          <div
            className="rounded-2xl bg-[#040917] text-white p-5 sm:p-6 border border-[#38E4FF]/30 shadow-[0_18px_44px_rgba(3,8,18,0.45)] relative overflow-hidden animate-rise"
            style={{ animationDelay: "60ms" }}
          >
            {/* Nano Banana Static Crocheted Astronaut & Cyan Spiral Galaxy Artwork */}
            <img
              src="/brand/hero_rank_banner.webp"
              alt="QUANTERS Cosmic Explorer Banner"
              className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030812]/95 via-[#051026]/80 to-[#030812]/25 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030812]/90 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between gap-2 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#07162E]/80 backdrop-blur-md border border-[#38E4FF]/35 text-[#38E4FF] text-xs font-black tracking-wider uppercase font-display">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Honorary Fellowship</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 drop-shadow">
                Class of {member.graduationYear || "2026"}
              </span>
            </div>

            <div className="mt-3.5 relative z-10 max-w-[68%]">
              <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {member.fullName}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-sky-200/95 mt-1 leading-relaxed font-sans drop-shadow">
                {member.alumniPosition ||
                  "Doctoral Researcher in Quantum Photonics · Faculty of Sciences"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/15 relative z-10">
              <div className="p-2.5 rounded-xl bg-[#040D1E]/75 backdrop-blur-md border border-white/15 text-center">
                <span className="text-base sm:text-lg font-black font-display text-amber-300 block leading-tight tabular-nums">
                  3,450 XP
                </span>
                <span className="text-xs font-bold font-display text-sky-200/90 block mt-0.5">
                  Lifetime Legacy
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#040D1E]/75 backdrop-blur-md border border-white/15 text-center">
                <span className="text-base sm:text-lg font-black font-display text-white block leading-tight truncate">
                  Former President
                </span>
                <span className="text-xs font-bold font-display text-sky-200/90 block mt-0.5">
                  Distinction
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#040D1E]/75 backdrop-blur-md border border-white/15 text-center">
                <span className="text-base sm:text-lg font-black font-display text-[#38E4FF] block leading-tight">
                  Advisory
                </span>
                <span className="text-xs font-bold font-display text-sky-200/90 block mt-0.5">
                  Scientific Council
                </span>
              </div>
            </div>
          </div>

          {/* Creative Action Modules for Alumni */}
          <div className="space-y-3 animate-rise" style={{ animationDelay: "120ms" }}>
            {/* Module 1: Propose an Alumni Keynote or Workshop */}
            <Link
              href="/proposals"
              className="p-4 sm:p-5 rounded-xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_18px_rgba(9,25,47,0.04)] hover:shadow-[0_8px_24px_rgba(29,99,235,0.08)] active:scale-[0.99] transition flex items-start justify-between gap-3 group cursor-pointer"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#1D63EB] text-xs font-black uppercase tracking-wider border border-blue-200/60 font-display">
                    Speaker Series
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-display">Open Channel</span>
                </div>
                <h3 className="text-base font-extrabold font-display text-slate-900 group-hover:text-[#1D63EB] transition-colors">
                  Host an Alumni Keynote or Masterclass
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed font-sans">
                  Share your scientific research, PhD insights, or industry expertise with active club researchers.
                </p>
              </div>
              <div className="w-11 h-11 rounded-full bg-blue-50 text-[#1D63EB] flex items-center justify-center shrink-0 group-hover:bg-[#1D63EB] group-hover:text-white transition-all shadow-2xs">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>

            {/* Module 2: 2-Column Bento for Project Advisory & Club Labs */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/projects/submit"
                className="p-4 rounded-xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_18px_rgba(9,25,47,0.04)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] active:scale-[0.99] transition space-y-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold font-display text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Advisory &amp; Jury
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-normal font-sans">
                    Review student capstone projects &amp; badges.
                  </p>
                </div>
              </Link>

              <Link
                href="/workshops"
                className="p-4 rounded-xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_18px_rgba(9,25,47,0.04)] hover:shadow-[0_8px_24px_rgba(29,99,235,0.08)] active:scale-[0.99] transition space-y-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#1D63EB] border border-sky-200/60 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold font-display text-slate-900 group-hover:text-[#1D63EB] transition-colors">
                    Club Labs &amp; Sessions
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-normal font-sans">
                    Drop in as guest mentor in active club labs.
                  </p>
                </div>
              </Link>
            </div>

            {/* Module 3: Annual Alumni Gathering VIP Invitation Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_18px_rgba(9,25,47,0.04)] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-200 font-display">
                    <CalendarCheck2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Annual Alumni Gala · Nov 2026</span>
                  </span>
                  <h3 className="text-base font-extrabold font-display text-slate-900 mt-2">
                    QSSC’ 2026 Alumni Keynote &amp; Mentorship Circle
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium font-sans">
                    Saturday, 14 Nov 2026 · 15:00 · Faculty of Sciences Main Auditorium
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRsvpConfirmed((v) => !v)}
                className={`w-full h-10 rounded-xl text-xs font-black active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  rsvpConfirmed
                    ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
                    : "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_16px_rgba(29,99,235,0.25)]"
                }`}
              >
                {rsvpConfirmed ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {rsvpConfirmed
                    ? "RSVP Confirmed — VIP Alumni Seat Reserved"
                    : "Reserve VIP Alumni Seat"}
                </span>
              </button>

              <label className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs cursor-pointer">
                <div>
                  <span className="font-black text-slate-800 block text-[11px]">
                    Mentor a Scientific Team
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Available for technical office hours and research feedback
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={mentorTeamOptIn}
                  onChange={(e) => setMentorTeamOptIn(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1D63EB] focus:ring-[#1D63EB] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Open Workshops & Activities Card */}
          {alumniFeaturedWorkshop && (
            <div
              className="animate-rise space-y-1.5"
              style={{ animationDelay: "180ms" }}
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Open Scientific Labs
                </h2>
                <Link
                  href="/workshops"
                  className="text-xs font-bold text-[#1D63EB] hover:underline"
                >
                  Browse all ({workshops.length})
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_18px_rgba(9,25,47,0.04)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FieldIcon
                    field={alumniFeaturedWorkshop.iconType}
                    size={26}
                    boxed
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-amber-50 text-amber-900 border border-amber-200">
                        {alumniFeaturedWorkshop.activityType || "Lab Session"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-sky-50 text-[#1D63EB] border border-sky-200">
                        {alumniFeaturedWorkshop.level}
                      </span>
                    </div>
                    <h3 className="text-xs font-black text-slate-900 mt-1 truncate">
                      {alumniFeaturedWorkshop.title}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 font-medium">
                      {alumniFeaturedWorkshop.dateLabel} · {alumniFeaturedWorkshop.location}
                    </p>
                  </div>
                </div>
                <Link
                  href="/workshops"
                  className="h-8.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black flex items-center shrink-0 active:scale-[0.98] transition cursor-pointer shadow-2xs"
                >
                  View
                </Link>
              </div>
            </div>
          )}

          {/* Latest QUANTA News */}
          {featuredNews && (
            <div
              className="animate-rise space-y-1.5"
              style={{ animationDelay: "240ms" }}
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Latest Scientific News
                </h2>
                <Link
                  href="/explore"
                  className="text-xs font-bold text-[#1D63EB] hover:underline"
                >
                  Explore Feed
                </Link>
              </div>
              <Link
                href="/explore"
                className="block rounded-xl bg-white/85 backdrop-blur-xl border border-white/80 overflow-hidden shadow-[0_4px_18px_rgba(9,25,47,0.04)] hover:border-sky-300 active:scale-[0.99] transition"
              >
                <div className="relative h-32 w-full">
                  <img
                    src={featuredNews.imageUrl}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-[#38E4FF] text-[#061E47]">
                    {featuredNews.tagLabel}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-xs font-black leading-snug line-clamp-2">
                      {featuredNews.title}
                    </h3>
                    <p className="text-[10px] text-sky-200 mt-0.5 font-medium">
                      {featuredNews.source} · {featuredNews.readTime}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </MobileAppShell>
    );
  }

  // ============================================================================
  // ACTIVE / TRAINEE MEMBER HOME VIEW
  // ============================================================================
  return (
    <MobileAppShell>
      <div className="px-4 pt-3 pb-6 sm:px-6 space-y-4">
        {/* Top Editorial & Technical Greeting Header (Zero AI Bubble Styling) */}
        <div
          className="flex items-center justify-between gap-3 animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/profile" className="relative shrink-0 group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-900/85 bg-slate-950 shadow-[0_6px_16px_rgba(3,8,18,0.14)] transition-transform duration-200 group-hover:scale-105 active:scale-95">
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#F4F7FB] shadow-xs" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 uppercase tracking-wider whitespace-nowrap">
                <span className="font-bold text-slate-900">
                  {dept?.shortName || "Logistics"}
                </span>
                <span className="text-slate-300">·</span>
                <span>{member.quanterId}</span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5 truncate">
                <h1 className="text-2xl font-black font-display text-slate-950 tracking-tight leading-none">
                  {firstName},
                </h1>
                <span className="font-editorial italic text-xl text-slate-600 truncate leading-none">
                  science needs you.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {(member.isBureauMember ||
              member.roles.some((r) =>
                [
                  "Super Admin",
                  "Executive",
                  "HR Head",
                  "Department Head",
                  "Co-Manager",
                  "Team Leader",
                ].includes(r)
              )) && (
              <Link
                href="/manager"
                className="h-10 px-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-mono font-bold text-slate-800 hover:border-slate-900 flex items-center justify-center transition active:scale-95 shadow-2xs"
                title="Department & Team Operations"
              >
                <span>Desk</span>
              </Link>
            )}
            <Link
              href="/notifications"
              className="relative w-10 h-10 rounded-xl bg-white border border-slate-200/90 text-slate-800 hover:border-slate-900 flex items-center justify-center transition active:scale-95 shadow-2xs group"
              aria-label="Notifications"
            >
              <svg
                width="18"
                height="18"
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
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ED1C24] ring-2 ring-white" />
              )}
            </Link>
          </div>
        </div>

        {/* Nano Banana Cosmic Crocheted Astronaut & Cyan Spiral Galaxy Hero Card
            - Sharp architectural frame (rounded-xl), zero boxes covering the astronaut on the right */}
        <div
          className="relative rounded-xl p-5 sm:p-6 text-white overflow-hidden bg-[#040814] border border-slate-900 shadow-[0_18px_42px_rgba(3,8,18,0.34)] animate-rise group"
          style={{ animationDelay: "50ms" }}
        >
          {/* Static Nano Banana Artwork with subtle zero-gravity drift */}
          <img
            src="/brand/hero_rank_banner.webp"
            alt="QUANTERS Crocheted Astronaut & Cyan Spiral Galaxy"
            className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none animate-zero-g"
          />
          {/* Left-only dark contrast gradient so the right 42% (astronaut + galaxy) is 100% unobstructed */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030812]/96 via-[#040B1B]/72 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#030812]/90 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-[60%]">
            {/* Line 1: Unboxed Mono Status + Rank Index */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  member.status === "Trainee"
                    ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                    : "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                }`}
              />
              <span className="font-mono text-xs font-bold tracking-[0.14em] text-[#38E4FF] uppercase">
                RANK 0{member.level}
              </span>
              <span className="text-white/30 text-xs">·</span>
              <span className="font-mono text-xs text-slate-300 uppercase tracking-wider">
                {member.status === "Trainee" ? "Trainee" : "Active"}
              </span>
            </div>

            {/* Line 2: Creative Mixed Font Title (Display + Editorial Italic) */}
            <div className="mt-1 flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                {member.levelTitle.split(" ")[0] || "Quantum"}
              </span>
              <span className="font-editorial italic font-normal text-2xl sm:text-[26px] text-[#38E4FF] leading-none">
                {member.levelTitle.split(" ").slice(1).join(" ") || "Explorer"}
              </span>
            </div>

            {/* Line 3: Large Tabular XP Readout */}
            <div className="mt-3 flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-4xl sm:text-5xl font-black font-display text-white tracking-[-0.03em] tabular-nums leading-none">
                {member.xpSeason.toLocaleString()}
              </span>
              <span className="text-xs font-black font-mono tracking-[0.18em] text-[#38E4FF] uppercase">
                XP
              </span>
            </div>

            {/* Line 4: Concise Target Specification */}
            <p className="mt-1 font-mono text-xs text-slate-300/95 whitespace-nowrap">
              <span className="text-white font-bold tabular-nums">
                {Math.round((member.xpSeason / 1000) * 100)}%
              </span>{" "}
              target · {Math.max(0, 1000 - member.xpSeason).toLocaleString()} XP to 0{member.level + 1}
            </p>
          </div>

          {/* Architectural 2px Hairline Progress Bar with Glowing Playhead */}
          <div className="relative z-10 mt-4 pt-0.5">
            <div className="h-1 w-full bg-white/15 relative overflow-visible">
              <div
                className="h-full bg-gradient-to-r from-[#38E4FF] to-[#FFE500] shadow-[0_0_10px_#38E4FF] transition-all duration-700 relative"
                style={{ width: `${xpProgressPct}%` }}
              >
                <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-[#38E4FF] ring-2 ring-[#040814] shadow-[0_0_10px_#38E4FF]" />
              </div>
            </div>
          </div>
        </div>

        {/* Open Swiss Architectural 4-Metric Specification Grid (Zero Bubble Box) */}
        <div
          className="border-y border-slate-200/90 py-3 grid grid-cols-4 divide-x divide-slate-200/80 animate-rise"
          style={{ animationDelay: "100ms" }}
        >
          <Link
            href="/badges"
            className="flex flex-col items-start px-2.5 first:pl-1 hover:translate-x-0.5 transition-transform cursor-pointer group"
          >
            <span className="font-mono text-xs text-slate-400 leading-none">01</span>
            <span className="text-xl sm:text-2xl font-black font-display text-slate-950 tabular-nums leading-tight mt-0.5 group-hover:text-[#1D63EB] transition-colors">
              {member.badgeIds.length}
            </span>
            <span className="text-xs font-medium text-slate-600 leading-none mt-0.5 whitespace-nowrap">
              Badges
            </span>
          </Link>

          <Link
            href="/workshops"
            className="flex flex-col items-start px-2.5 hover:translate-x-0.5 transition-transform cursor-pointer group"
          >
            <span className="font-mono text-xs text-slate-400 leading-none">02</span>
            <span className="text-xl sm:text-2xl font-black font-display text-slate-950 tabular-nums leading-tight mt-0.5 group-hover:text-[#1D63EB] transition-colors">
              {member.workshopsCompletedCount}
            </span>
            <span className="text-xs font-medium text-slate-600 leading-none mt-0.5 whitespace-nowrap">
              Sessions
            </span>
          </Link>

          <Link
            href="/projects/submit"
            className="flex flex-col items-start px-2.5 hover:translate-x-0.5 transition-transform cursor-pointer group"
          >
            <span className="font-mono text-xs text-slate-400 leading-none">03</span>
            <span className="text-xl sm:text-2xl font-black font-display text-slate-950 tabular-nums leading-tight mt-0.5 group-hover:text-[#1D63EB] transition-colors">
              {member.projectsCompletedCount}
            </span>
            <span className="text-xs font-medium text-slate-600 leading-none mt-0.5 whitespace-nowrap">
              Projects
            </span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-start px-2.5 hover:translate-x-0.5 transition-transform cursor-pointer group"
          >
            <span className="font-mono text-xs text-slate-400 leading-none">04</span>
            <span className="text-xl sm:text-2xl font-black font-display text-slate-950 tabular-nums leading-tight mt-0.5 group-hover:text-[#1D63EB] transition-colors">
              {member.xpTotal.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-600 leading-none mt-0.5 whitespace-nowrap">
              Total XP
            </span>
          </Link>
        </div>

        {/* Royal-Cobalt & Warm-Gold Editorial Honour Ribbon (Star of the Month) */}
        <div
          className="rounded-xl bg-gradient-to-r from-[#0B3B8C] via-[#1554C8] to-[#1D63EB] text-white border border-[#1D63EB]/40 border-l-[3px] border-l-[#FFE500] px-3.5 py-2.5 shadow-[0_8px_22px_rgba(29,99,235,0.2)] animate-rise"
          style={{ animationDelay: "150ms" }}
        >
          <button
            type="button"
            onClick={() => setShowMotmDetails((v) => !v)}
            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0 whitespace-nowrap overflow-hidden">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#FFE500] shrink-0 transition-transform duration-300 group-hover:rotate-12"
              >
                <polygon
                  points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.7 5.8,21 7,14.1 2,9.3 9,8.5"
                  fill="currentColor"
                  fillOpacity="0.3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              <span className="font-editorial italic text-base text-[#FFE500] shrink-0">
                Star of the Month
              </span>
              <span className="text-white/35 text-xs">·</span>
              <span className="text-xs font-display font-bold text-white truncate">
                {motmMember.fullName}
              </span>
              <span className="font-mono text-xs font-bold text-[#7CEEFF] shrink-0">
                +50 XP
              </span>
            </div>
            {showMotmDetails ? (
              <ChevronUp className="w-4 h-4 text-sky-200 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-sky-200 shrink-0" />
            )}
          </button>

          {showMotmDetails && (
            <div className="mt-2.5 pt-2.5 border-t border-white/15 flex items-center justify-between gap-3 text-xs text-sky-100">
              <div className="flex items-center gap-2.5">
                <img
                  src={motmMember.avatarUrl}
                  alt={motmMember.fullName}
                  className="w-7 h-7 rounded-lg object-cover border border-[#FFE500]/70"
                />
                <div>
                  <p className="font-bold text-white">
                    {motmMember.levelTitle} · {motmMember.xpMonth} XP this month
                  </p>
                  <p className="text-xs text-sky-200/90">
                    96% workshop attendance &amp; scientific leadership
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-[#FFE500] uppercase tracking-wider shrink-0">
                [Laureate]
              </span>
            </div>
          )}
        </div>

        {/* Next Workshop Precision Laboratory Ticket (Harmonized with Royal Blue Tab Bar) */}
        {nextWorkshop && (
          <div
            className="animate-rise space-y-1.5"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-baseline justify-between px-0.5">
              <div className="flex items-baseline gap-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#094C9C]">
                  NEXT SESSION
                </h2>
                <span className="font-editorial italic text-base text-slate-500">
                  scheduled lab
                </span>
              </div>
              <Link
                href="/workshops"
                className="font-mono text-xs font-bold text-[#1D63EB] hover:underline"
              >
                All sessions →
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-[#DCE9F9] shadow-[0_6px_20px_rgba(29,99,235,0.06)] overflow-hidden transition-all duration-200 hover:border-[#1D63EB]/50">
              {/* Top Technical Spec Header Strip in Soft Sky & Royal Blue */}
              <div className="bg-gradient-to-r from-[#EBF3FC] to-[#F4F8FD] text-[#094C9C] px-4 py-2 flex items-center justify-between font-mono text-xs border-b border-[#DCE9F9]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D63EB]" />
                  <span className="uppercase tracking-[0.12em] font-bold text-[#094C9C]">
                    {nextWorkshop.level} · TRACK
                  </span>
                </div>
                <span className="font-bold text-[#1D63EB] tabular-nums">
                  +{nextWorkshop.xpReward} XP
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start gap-3.5">
                  <FieldIcon field={nextWorkshop.iconType} size={28} boxed />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black font-display text-slate-950 leading-snug">
                      {nextWorkshop.title}
                    </h3>
                    <div className="mt-1.5 space-y-1 text-xs text-slate-600 font-mono">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#1D63EB] shrink-0" />
                        <span>
                          {nextWorkshop.dateLabel} · {nextWorkshop.timeRange}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1D63EB]/70 shrink-0" />
                        <span className="truncate">{nextWorkshop.location}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
                    {nextWorkshop.seatsLeft} seats open
                  </span>

                  <div className="flex items-center gap-2">
                    {!isRegisteredNext ? (
                      <button
                        type="button"
                        onClick={() =>
                          registerForWorkshop(nextWorkshop.id, member.id)
                        }
                        className="h-8 px-3.5 rounded-lg bg-[#EBF3FC] hover:bg-[#DCE9F9] text-[#094C9C] text-xs font-bold font-display active:scale-[0.98] transition cursor-pointer"
                      >
                        Reserve Seat
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-700">
                        <Check className="w-3.5 h-3.5" /> Registered
                      </span>
                    )}
                    <Link
                      href="/checkin"
                      className="h-8 px-3.5 rounded-lg bg-gradient-to-b from-[#1D63EB] to-[#0A4CC7] text-white text-xs font-bold font-display shadow-[0_4px_12px_rgba(29,99,235,0.28)] hover:brightness-105 active:scale-[0.98] transition flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5 text-white" />
                      <span>Check-in</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Operations & Custom Technical Emblem Trio (Harmonized with Royal Blue Tab Bar) */}
        <div
          className="space-y-2.5 animate-rise"
          style={{ animationDelay: "260ms" }}
        >
          {/* Primary Action Banner: Optical QR Check-In in Royal Blue Gradient */}
          <Link
            href="/checkin"
            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-[#0A449E] via-[#1557CE] to-[#1D63EB] border border-[#1D63EB]/40 text-white flex items-center justify-between shadow-[0_8px_22px_rgba(29,99,235,0.22)] hover:brightness-105 active:scale-[0.99] transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {/* Custom Optical Viewfinder SVG Icon */}
              <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 8V5.5C4 4.7 4.7 4 5.5 4H8M16 4H18.5C19.3 4 20 4.7 20 5.5V8M20 16V18.5C20 19.3 19.3 20 18.5 20H16M8 20H5.5C4.7 20 4 19.3 4 18.5V16"
                    stroke="#7CEEFF"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  <rect x="8.5" y="8.5" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="1.6" />
                  <path d="M5 12H19" stroke="#FFE500" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs sm:text-sm font-black font-display tracking-tight text-white">
                    Live Session
                  </span>
                  <span className="font-editorial italic text-base text-[#7CEEFF]">
                    Check-In
                  </span>
                </div>
                <span className="font-mono text-xs text-sky-100/90 block">
                  Scan room projector or enter 6-digit code
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-white group-hover:translate-x-0.5 transition-transform shrink-0">
              <span>SCAN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Secondary Coordinated Tool Trio with Royal-Blue Custom Technical SVG Icons */}
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/exams"
              className="p-3 rounded-xl bg-white border border-[#DCE9F9] hover:border-[#1D63EB] hover:-translate-y-0.5 active:scale-[0.98] transition-all group text-left flex flex-col justify-between shadow-[0_3px_12px_rgba(29,99,235,0.05)]"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] border border-[#CFE2F9] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polygon
                      points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5"
                      stroke="#1D63EB"
                      strokeWidth="1.8"
                      fill="#1D63EB"
                      fillOpacity="0.14"
                    />
                    <path d="M9 12.2L11 14.2L15.2 9.8" stroke="#094C9C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-mono text-xs text-[#1D63EB]/70 font-bold">01</span>
              </div>
              <div>
                <span className="text-xs font-black font-display text-slate-950 block leading-tight group-hover:text-[#1D63EB] transition-colors">
                  Skill Exams
                </span>
                <span className="font-mono text-xs text-slate-500 block mt-0.5">
                  6 assessments
                </span>
              </div>
            </Link>

            <Link
              href="/projects/submit"
              className="p-3 rounded-xl bg-white border border-[#DCE9F9] hover:border-[#1D63EB] hover:-translate-y-0.5 active:scale-[0.98] transition-all group text-left flex flex-col justify-between shadow-[0_3px_12px_rgba(29,99,235,0.05)]"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] border border-[#CFE2F9] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="7" cy="7" r="2.2" stroke="#1D63EB" strokeWidth="1.8" />
                    <circle cx="17" cy="7" r="2.2" stroke="#0284C7" strokeWidth="1.8" />
                    <circle cx="12" cy="17" r="2.2" stroke="#094C9C" strokeWidth="1.8" />
                    <path d="M8.8 8.5L11 15M15.2 8.5L13 15" stroke="#1D63EB" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-mono text-xs text-[#1D63EB]/70 font-bold">02</span>
              </div>
              <div>
                <span className="text-xs font-black font-display text-slate-950 block leading-tight group-hover:text-[#1D63EB] transition-colors">
                  Projects
                </span>
                <span className="font-mono text-xs text-slate-500 block mt-0.5">
                  Submit proof
                </span>
              </div>
            </Link>

            <Link
              href="/proposals"
              className="p-3 rounded-xl bg-white border border-[#DCE9F9] hover:border-[#1D63EB] hover:-translate-y-0.5 active:scale-[0.98] transition-all group text-left flex flex-col justify-between shadow-[0_3px_12px_rgba(29,99,235,0.05)]"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] border border-[#CFE2F9] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z"
                      stroke="#1D63EB"
                      strokeWidth="1.8"
                      fill="#1D63EB"
                      fillOpacity="0.16"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="1.6" fill="#094C9C" />
                  </svg>
                </div>
                <span className="font-mono text-xs text-[#1D63EB]/70 font-bold">03</span>
              </div>
              <div>
                <span className="text-xs font-black font-display text-slate-950 block leading-tight group-hover:text-[#1D63EB] transition-colors">
                  Proposals
                </span>
                <span className="font-mono text-xs text-slate-500 block mt-0.5">
                  Pitch ideas
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* My Assigned Tasks Card with Architectural Hairline Layout */}
        <div
          className="bg-white rounded-xl border border-[#DCE9F9] p-4 sm:p-5 shadow-[0_6px_20px_rgba(29,99,235,0.05)] animate-rise"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#094C9C]">
                ASSIGNED TASKS
              </h2>
              <span className="font-editorial italic text-base text-slate-500">
                missions
              </span>
            </div>

            {/* Segmented Toggle: Active (N) | Done & History (M) */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-[#EBF3FC] border border-[#DCE9F9]">
              <button
                type="button"
                onClick={() => setTaskTab("active")}
                className={`px-2.5 py-1 rounded-md text-xs font-bold font-display active:scale-[0.98] transition cursor-pointer ${
                  taskTab === "active"
                    ? "bg-gradient-to-b from-[#1D63EB] to-[#0A4CC7] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active ({activeTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTaskTab("done")}
                className={`px-2.5 py-1 rounded-md text-xs font-bold font-display active:scale-[0.98] transition cursor-pointer ${
                  taskTab === "done"
                    ? "bg-gradient-to-b from-[#1D63EB] to-[#0A4CC7] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Done ({doneAndOldTasks.length})
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
                    className="py-3 first:pt-0 last:pb-0 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1D63EB]">
                          {task.category} // {line.roleInTask}
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold font-display text-slate-950 mt-0.5">
                          {task.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {task.deadline} · {task.locationOrShift}
                          </span>
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900 shrink-0 tabular-nums border-b border-slate-900/40 pb-0.5">
                        +{line.proposedScore} XP
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1.5 flex-wrap">
                      <span className="font-mono text-xs text-slate-500">
                        STATE:{" "}
                        <strong className="text-slate-900 font-bold uppercase">
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
                            className="h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-display active:scale-[0.98] transition cursor-pointer"
                          >
                            Confirm Receipt
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 font-sans">
                            <Check className="w-3.5 h-3.5" /> Confirmed
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
                              className="h-8 px-3 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs font-bold font-display active:scale-[0.98] transition flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Deliver Proof</span>
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() => archiveTask(task.id)}
                          className="h-8 px-3 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold font-display active:scale-[0.98] transition flex items-center gap-1 cursor-pointer"
                          title="Archive to Done & History"
                        >
                          <Archive className="w-3 h-3" />
                          <span>Archive</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeTasks.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  All assigned tasks are completed and archived! Check{" "}
                  <strong>Done & History</strong>.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {doneAndOldTasks.map((task) => {
                const line = task.assignees.find(
                  (a) => a.memberId === member.id
                );
                if (!line) return null;
                const xpAwarded = line.awardedScore ?? line.proposedScore;
                return (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-800">
                            {task.category} · {line.roleInTask}
                          </span>
                          {line.scoreType && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                              {line.scoreType} Score
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-extrabold text-slate-900 mt-0.5">
                          {task.title}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white shrink-0 tabular-nums">
                        +{xpAwarded} XP
                      </span>
                    </div>

                    {line.managerFeedback && (
                      <div className="p-2 rounded-lg bg-white border border-emerald-200/70 text-[10.5px] text-slate-700">
                        <span className="font-extrabold text-emerald-900">
                          Manager Feedback ({line.validatedBy || "Lead"}):{" "}
                        </span>
                        <span className="italic">“{line.managerFeedback}”</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Check className="w-3 h-3" />
                        {line.status === "Validated"
                          ? `Validated ${line.validatedAt || ""}`
                          : "Archived"}
                      </span>
                      {task.archived && line.status !== "Validated" && (
                        <button
                          type="button"
                          onClick={() => unarchiveTask(task.id)}
                          className="text-[10px] font-extrabold text-[#1D63EB] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> Restore to Active
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {doneAndOldTasks.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  No archived or validated tasks yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Latest News Card (See all -> /explore) */}
        {featuredNews && (
          <div
            className="animate-rise"
            style={{ animationDelay: "420ms" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Latest News
              </h2>
              <Link
                href="/explore"
                className="text-xs font-bold text-[#1D63EB] hover:underline"
              >
                See all
              </Link>
            </div>

            <Link
              href="/explore"
              className="block bg-white rounded-2xl border border-[#E2EDF8] overflow-hidden shadow-card hover:border-sky-300 active:scale-[0.99] transition"
            >
              <div className="relative h-32 w-full">
                <img
                  src={featuredNews.imageUrl}
                  alt={featuredNews.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#38E4FF] text-[#061E47]">
                  {featuredNews.tagLabel}
                </span>
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h3 className="text-xs font-extrabold leading-snug line-clamp-2">
                    {featuredNews.title}
                  </h3>
                  <p className="text-[10px] text-sky-200 mt-0.5">
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
            className="w-full max-w-[380px] rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-rise"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Deliver Task Proof
              </h3>
              <button
                type="button"
                onClick={() => setDeliverModalTaskId(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleDeliverSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Deliverable Link or Completion Summary
                </label>
                <textarea
                  rows={3}
                  required
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Paste GitHub/Drive link or describe completed work..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1D63EB]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeliverModalTaskId(null)}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-[#1D63EB] text-white text-xs font-extrabold hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer"
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
