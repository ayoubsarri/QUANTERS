"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Archive,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronDown,
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
import { FieldIcon } from "@/components/shared/FieldIcon";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

export default function MobileHomeHubPage() {
  const members = useQuantersStore((s) => s.members);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const setCurrentMemberId = useQuantersStore((s) => s.setCurrentMemberId);
  const workshops = useQuantersStore((s) => s.workshops);
  const tasks = useQuantersStore((s) => s.tasks);
  const explorePosts = useQuantersStore((s) => s.explorePosts);
  const messages = useQuantersStore((s) => s.messages);
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
          {/* Alumni Top Greeting Header + 1-Tap Switch to Active Member */}
          <div
            className="flex items-start justify-between gap-2 animate-rise"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Link href="/profile" className="relative shrink-0">
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#FBB03B] shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.2 rounded-full bg-[#FBB03B] text-[#061E47] text-[8px] font-black">
                  ’{member.graduationYear?.slice(-2) || "26"}
                </span>
              </Link>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9.5px] font-extrabold">
                  <GraduationCap className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>
                    QUANTA Alumni · Class of {member.graduationYear || "2026"}
                  </span>
                </span>
                <h1 className="text-[15px] font-extrabold text-slate-900 truncate mt-0.5 flex items-center gap-1.5">
                  <span>Welcome back, {firstName}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={currentMemberId}
                onChange={(e) => setCurrentMemberId(e.target.value)}
                className="text-[10.5px] font-bold bg-white border border-[#E2EDF8] text-slate-700 rounded-full px-2 py-1 shadow-xs cursor-pointer hover:border-[#1D63EB] transition"
                title="Switch Member Persona"
              >
                <option value="mem-ayoub">Ayoub (Lead)</option>
                <option value="mem-lina">Lina (Simple Member)</option>
                <option value="mem-walid">Walid (Trainee)</option>
                <option value="mem-alumni-1">Dr. Amine (Alumni)</option>
              </select>
              <Link
                href="/notifications"
                className="relative w-9 h-9 rounded-full bg-white border border-[#E2EDF8] flex items-center justify-center text-slate-700 hover:bg-slate-50 shadow-sm active:scale-[0.98] transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#ED1C24] text-white text-[9px] font-extrabold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Gold/Cobalt Alumni Honors 2.5D Hero Card */}
          <div
            className="rounded-[32px] p-5 sm:p-6 text-white overflow-hidden border border-amber-300/40 border-t-amber-200/80 shadow-[0_24px_50px_-10px_rgba(30,20,5,0.5),0_8px_20px_rgba(30,20,5,0.25),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.5)] animate-rise relative"
            style={{
              animationDelay: "60ms",
              background:
                "radial-gradient(ellipse at 20% 0%, #1E3A8A 0%, #0F172A 60%, #080B14 100%)",
            }}
          >
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 text-[#FBB03B] text-[10.5px] font-extrabold uppercase tracking-wider shadow-[0_0_12px_rgba(251,176,59,0.25)]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Honoris Causa · Former President</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight font-display drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]">
                    {member.levelTitle || "Quanta Laureate"}
                  </span>
                </div>
                <p className="text-xs text-sky-100/90 font-medium max-w-[340px]">
                  {member.alumniPosition ||
                    "Doctoral Researcher in Quantum Photonics · USTHB / Paris-Saclay"}
                </p>
              </div>
              <div className="animate-float-subtle shrink-0 filter drop-shadow-[0_8px_16px_rgba(251,191,36,0.3)]">
                <PlanetEmblem size={56} />
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-white/15 space-y-2 relative z-10">
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                <span className="text-sky-100 font-extrabold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                  <span>Level {member.level} · {member.levelTitle}</span>
                </span>
                <span className="text-[#38E4FF] font-mono tabular-nums font-black">
                  {member.xpSeason} / 1,000 XP
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-950/80 border border-white/15 overflow-hidden p-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#FBB03B] to-[#FEF08A] transition-all duration-700 shadow-[0_0_12px_rgba(251,176,59,0.8)]"
                  style={{ width: `${xpProgressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Full App Access · Zero Attendance Quotas</span>
                </span>
                <span className="font-extrabold text-[#FBB03B] tabular-nums">
                  {member.xpTotal.toLocaleString()} Lifetime XP
                </span>
              </div>
            </div>
          </div>

          {/* 4 Quick Action Tiles for Alumni */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-rise"
            style={{ animationDelay: "120ms" }}
          >
            <Link
              href="/workshops"
              className="rounded-2xl bg-[#1D63EB] text-white p-3 flex flex-col items-center justify-center text-center shadow-sm hover:opacity-95 active:scale-[0.98] transition"
            >
              <BookOpen className="w-5 h-5 mb-1.5" />
              <span className="text-[10.5px] font-extrabold leading-tight">
                Workshops & Activities
              </span>
            </Link>

            <Link
              href="/badges"
              className="rounded-2xl bg-[#FEF3C7] text-[#92400E] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:opacity-95 active:scale-[0.98] transition border border-amber-200"
            >
              <Award className="w-5 h-5 mb-1.5" />
              <span className="text-[10.5px] font-extrabold leading-tight">
                My Badges
              </span>
            </Link>

            <Link
              href="/proposals"
              className="rounded-2xl bg-[#BBF7D0] text-[#15803D] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:opacity-95 active:scale-[0.98] transition"
            >
              <Lightbulb className="w-5 h-5 mb-1.5" />
              <span className="text-[10.5px] font-extrabold leading-tight">
                Propose Guest Session
              </span>
            </Link>

            <Link
              href="/exams"
              className="rounded-2xl bg-[#D6ECFA] text-[#1D63B8] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:opacity-95 active:scale-[0.98] transition"
            >
              <FileCheck2 className="w-5 h-5 mb-1.5" />
              <span className="text-[10.5px] font-extrabold leading-tight">
                Badge Exams
              </span>
            </Link>
          </div>

          {/* Alumni Mentorship & Gathering Card */}
          <div
            className="bg-white rounded-2xl border border-[#E2EDF8] p-4 shadow-card space-y-3 animate-rise"
            style={{ animationDelay: "180ms" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  <CalendarCheck2 className="w-3 h-3" /> Annual Alumni Gathering
                </span>
                <h2 className="text-sm font-extrabold text-slate-900 mt-1">
                  QSSC’ 2026 Alumni Keynote & Mentorship Circle
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Saturday, 14 Nov 2026 · 15:00 · Faculty of Sciences Main
                  Auditorium
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRsvpConfirmed((v) => !v)}
              className={`w-full h-9 rounded-xl text-xs font-extrabold active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                rsvpConfirmed
                  ? "bg-emerald-600 text-white"
                  : "bg-[#1D63EB] hover:bg-blue-700 text-white"
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
                  : "RSVP for Annual Alumni Gathering"}
              </span>
            </button>

            <label className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs cursor-pointer">
              <div>
                <span className="font-extrabold text-slate-800 block">
                  Mentor a Scientific Team
                </span>
                <span className="text-[10.5px] text-slate-500">
                  Available for guest lectures and research review
                </span>
              </div>
              <input
                type="checkbox"
                checked={mentorTeamOptIn}
                onChange={(e) => setMentorTeamOptIn(e.target.checked)}
                className="w-4 h-4 rounded text-[#1D63EB] focus:ring-[#1D63EB]"
              />
            </label>
          </div>

          {/* Open Workshops & Activities Card */}
          {alumniFeaturedWorkshop && (
            <div
              className="animate-rise"
              style={{ animationDelay: "240ms" }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Open Workshops & Activities
                </h2>
                <Link
                  href="/workshops"
                  className="text-xs font-bold text-[#1D63EB] hover:underline"
                >
                  Browse all ({workshops.length})
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2EDF8] p-3.5 shadow-card">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3">
                    <FieldIcon
                      field={alumniFeaturedWorkshop.iconType}
                      size={24}
                      boxed
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-amber-100 text-amber-800">
                          {alumniFeaturedWorkshop.activityType || "Lab Session"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-sky-50 text-[#1D63EB] border border-sky-200">
                          {alumniFeaturedWorkshop.level}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                        {alumniFeaturedWorkshop.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {alumniFeaturedWorkshop.dateLabel} ·{" "}
                        {alumniFeaturedWorkshop.location}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/workshops"
                    className="h-8 px-3 rounded-xl bg-[#061E47] text-white text-[11px] font-extrabold flex items-center shrink-0 active:scale-[0.98] transition"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Latest QUANTA News */}
          {featuredNews && (
            <div
              className="animate-rise"
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Latest QUANTA News
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
      </MobileAppShell>
    );
  }

  // ============================================================================
  // ACTIVE / TRAINEE MEMBER HOME VIEW
  // ============================================================================
  return (
    <MobileAppShell>
      <div className="px-4 pt-3 pb-6 sm:px-6 space-y-3.5">
        {/* Top Greeting Header */}
        <div
          className="flex items-center justify-between gap-2 animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/profile" className="relative shrink-0">
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                Good evening,
              </p>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight truncate">
                {firstName}
              </h1>
              <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                Keep exploring. Science needs you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={currentMemberId}
              onChange={(e) => setCurrentMemberId(e.target.value)}
              className="text-[10.5px] font-bold bg-white border border-[#E2EDF8] text-slate-700 rounded-full px-2 py-1 shadow-xs cursor-pointer hover:border-[#1D63EB] transition max-w-[112px] sm:max-w-none truncate"
              title="Switch Member Persona"
            >
              <option value="mem-ayoub">Ayoub (Lead)</option>
              <option value="mem-lina">Lina (Member)</option>
              <option value="mem-walid">Walid (Trainee)</option>
              <option value="mem-alumni-1">Dr. Amine (Alumni)</option>
            </select>
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
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#E0F0FF] text-[#094C9C] text-[10.5px] font-extrabold border border-sky-200 hover:bg-sky-100 active:scale-[0.98] transition"
                title="Department & Team Operations"
              >
                <Shield className="w-3 h-3 text-[#1D63EB] shrink-0" />
                <span className="hidden sm:inline">Department</span>
                <span>Desk</span>
              </Link>
            )}
            <Link
              href="/notifications"
              className="relative w-9 h-9 rounded-full bg-white border border-[#E2EDF8] flex items-center justify-center text-slate-700 hover:bg-slate-50 shadow-sm active:scale-[0.98] transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#ED1C24] text-white text-[9px] font-extrabold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Glassify Rounded Hero Card */}
        <div
          className="relative rounded-3xl p-5 sm:p-6 text-white overflow-hidden bg-gradient-to-br from-[#062456] via-[#0A3882] to-[#1258C7] border border-white/20 shadow-[0_16px_40px_rgba(6,36,86,0.22)] animate-rise"
          style={{ animationDelay: "60ms" }}
        >
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[#29D2FF]/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Row: Frosted Level Pill + Title + Status */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs tracking-wider shadow-sm">
                  <span>Lv. {member.level}</span>
                </div>
                <span className="text-xs font-bold text-sky-200 uppercase tracking-wider">
                  {member.levelTitle}
                </span>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                  member.status === "Trainee"
                    ? "bg-amber-400/20 border border-amber-300/40 text-amber-200"
                    : "bg-emerald-400/20 border border-emerald-300/40 text-emerald-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    member.status === "Trainee"
                      ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                      : "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                  }`}
                />
                <span>
                  {member.status === "Trainee" ? "Trainee" : "Active Member"}
                </span>
              </span>
            </div>

            {/* Central Metric Block */}
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                  {member.xpSeason}{" "}
                  <span className="text-sm font-semibold text-sky-200 tracking-normal font-sans">
                    / 1,000 XP
                  </span>
                </div>
                <p className="text-[11px] font-medium text-sky-200/90 mt-0.5">
                  {Math.max(0, 1000 - member.xpSeason)} XP to reach Level {member.level + 1}
                </p>
              </div>

              <div className="animate-float-subtle shrink-0">
                <PlanetEmblem size={52} />
              </div>
            </div>

            {/* Frosted Progress Bar */}
            <div className="mt-3.5 h-3 w-full rounded-full bg-black/25 backdrop-blur-md border border-white/15 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#29D2FF] via-[#38E4FF] to-[#60A5FA] shadow-[0_0_12px_rgba(41,210,255,0.7)] transition-all duration-500"
                style={{ width: `${xpProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4-Column Glassify Stat Cards */}
        <div
          className="grid grid-cols-4 gap-2 sm:gap-2.5 animate-rise"
          style={{ animationDelay: "120ms" }}
        >
          <Link
            href="/badges"
            className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] py-3 px-1.5 text-center hover:bg-white hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums leading-tight">
              {member.badgeIds.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Badges
            </div>
          </Link>
          <Link
            href="/workshops"
            className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] py-3 px-1.5 text-center hover:bg-white hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums leading-tight">
              {member.workshopsCompletedCount}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Workshops
            </div>
          </Link>
          <Link
            href="/projects/submit"
            className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] py-3 px-1.5 text-center hover:bg-white hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums leading-tight">
              {member.projectsCompletedCount}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Projects
            </div>
          </Link>
          <Link
            href="/profile"
            className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] py-3 px-1.5 text-center hover:bg-white hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums leading-tight">
              {member.xpTotal}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Total XP
            </div>
          </Link>
        </div>

        {/* Collapsible Gold Member of the Month Spotlight Strip */}
        <div
          className="rounded-2xl bg-gradient-to-r from-amber-50 via-[#FEF3C7]/80 to-amber-50 border border-amber-200/90 px-3.5 py-2.5 shadow-sm animate-rise"
          style={{ animationDelay: "180ms" }}
        >
          <button
            type="button"
            onClick={() => setShowMotmDetails((v) => !v)}
            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-6 h-6 rounded-full bg-amber-400/25 border border-amber-400/50 flex items-center justify-center text-amber-700 shrink-0">
                <Award className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-extrabold text-amber-950 truncate">
                Star of the Month: {motmMember.fullName} ·{" "}
                <span className="text-amber-700">+50 XP</span>
              </span>
            </div>
            {showMotmDetails ? (
              <ChevronUp className="w-4 h-4 text-amber-800 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-800 shrink-0" />
            )}
          </button>

          {showMotmDetails && (
            <div className="mt-2 pt-2 border-t border-amber-200/70 flex items-center justify-between gap-3 text-[11px] text-amber-900">
              <div className="flex items-center gap-2">
                <img
                  src={motmMember.avatarUrl}
                  alt={motmMember.fullName}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400"
                />
                <div>
                  <p className="font-bold">
                    {motmMember.levelTitle} · {motmMember.xpMonth} XP this month
                  </p>
                  <p className="text-[10px] text-amber-800">
                    96% workshop attendance & exemplary scientific leadership
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-extrabold text-[10px] shrink-0">
                Honour Roll
              </span>
            </div>
          )}
        </div>

        {/* Next Workshop Card */}
        {nextWorkshop && (
          <div
            className="animate-rise"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Next Workshop
              </h2>
              <Link
                href="/workshops"
                className="text-xs font-bold text-[#1D63EB] hover:underline"
              >
                See all
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2EDF8] p-3.5 shadow-card">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-3">
                  <FieldIcon field={nextWorkshop.iconType} size={24} boxed />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {nextWorkshop.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#1D63EB] border border-sky-200">
                        {nextWorkshop.level}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {nextWorkshop.dateLabel} · {nextWorkshop.timeRange}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{nextWorkshop.location}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 tabular-nums">
                  +{nextWorkshop.xpReward} XP
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 tabular-nums">
                  <Users className="w-3.5 h-3.5 text-[#1D63EB]" />
                  {nextWorkshop.seatsLeft} seats left
                </span>

                <div className="flex items-center gap-2">
                  {!isRegisteredNext ? (
                    <button
                      type="button"
                      onClick={() =>
                        registerForWorkshop(nextWorkshop.id, member.id)
                      }
                      className="h-8 px-3.5 rounded-xl bg-[#1D63EB] text-white text-xs font-extrabold hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer"
                    >
                      Join
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <Check className="w-3.5 h-3.5" /> Registered
                    </span>
                  )}
                  <Link
                    href="/checkin"
                    className="h-8 px-3.5 rounded-xl bg-[#061E47] text-white text-xs font-extrabold hover:bg-slate-900 active:scale-[0.98] transition flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#38E4FF]" />
                    <span>Check-in</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4 Colored Quick-Action Tiles */}
        <div
          className="grid grid-cols-4 gap-2 sm:gap-2.5 animate-rise"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/checkin"
            className="rounded-2xl bg-[#1D63EB] text-white py-3 px-1.5 flex flex-col items-center justify-center text-center shadow-sm hover:bg-blue-700 active:scale-[0.98] transition"
          >
            <QrCode className="w-5 h-5 mb-1.5" />
            <span className="text-[10.5px] font-extrabold leading-tight">
              Scan QR
            </span>
          </Link>

          <Link
            href="/exams"
            className="rounded-2xl bg-[#D6ECFA] text-[#094C9C] border border-sky-200 py-3 px-1.5 flex flex-col items-center justify-center text-center shadow-xs hover:bg-sky-200/80 active:scale-[0.98] transition"
          >
            <FileCheck2 className="w-5 h-5 mb-1.5 text-[#1D63EB]" />
            <span className="text-[10.5px] font-extrabold leading-tight">
              Exams
            </span>
          </Link>

          <Link
            href="/projects/submit"
            className="rounded-2xl bg-[#FDE68A] text-[#92400E] border border-amber-300/80 py-3 px-1.5 flex flex-col items-center justify-center text-center shadow-xs hover:bg-amber-200 active:scale-[0.98] transition"
          >
            <FolderGit2 className="w-5 h-5 mb-1.5 text-[#92400E]" />
            <span className="text-[10.5px] font-extrabold leading-tight">
              Submit Project
            </span>
          </Link>

          <Link
            href="/proposals"
            className="rounded-2xl bg-[#BBF7D0] text-[#15803D] border border-emerald-300/80 py-3 px-1.5 flex flex-col items-center justify-center text-center shadow-xs hover:bg-emerald-200 active:scale-[0.98] transition"
          >
            <Lightbulb className="w-5 h-5 mb-1.5 text-[#15803D]" />
            <span className="text-[10.5px] font-extrabold leading-tight">
              Proposals
            </span>
          </Link>
        </div>

        {/* My Assigned Tasks Card with Active | Done & History Segmented Pill Toggle */}
        <div
          className="bg-white rounded-2xl border border-[#E2EDF8] p-3.5 shadow-card animate-rise"
          style={{ animationDelay: "360ms" }}
        >
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-[#1D63EB]" />
              <span>My Assigned Tasks</span>
            </h2>

            {/* Segmented Pill Toggle: Active (N) | Done & History (M) */}
            <div className="inline-flex items-center p-0.5 rounded-full bg-[#F4F7FB] border border-[#E2EDF8]">
              <button
                type="button"
                onClick={() => setTaskTab("active")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold active:scale-[0.98] transition cursor-pointer ${
                  taskTab === "active"
                    ? "bg-[#1D63EB] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active ({activeTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTaskTab("done")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold active:scale-[0.98] transition cursor-pointer ${
                  taskTab === "done"
                    ? "bg-[#061E47] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Done & History ({doneAndOldTasks.length})
              </button>
            </div>
          </div>

          {taskTab === "active" ? (
            <div className="space-y-2">
              {activeTasks.map((task) => {
                const line = task.assignees.find(
                  (a) => a.memberId === member.id
                );
                if (!line) return null;
                return (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2EDF8] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#1D63EB]">
                          {task.category} · {line.roleInTask}
                        </span>
                        <h3 className="text-xs font-extrabold text-slate-900">
                          {task.title}
                        </h3>
                        <p className="text-[10.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            Due: {task.deadline} · {task.locationOrShift}
                          </span>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0 tabular-nums">
                        +{line.proposedScore} XP
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-600">
                        Status:{" "}
                        <strong className="text-slate-900">{line.status}</strong>
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!line.receiptConfirmed ? (
                          <button
                            type="button"
                            onClick={() =>
                              confirmTaskReceipt(task.id, member.id)
                            }
                            className="h-7 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold active:scale-[0.98] transition cursor-pointer"
                          >
                            Confirm Receipt
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Confirmed
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
                              className="h-7 px-2.5 rounded-lg bg-[#1D63EB] hover:bg-blue-700 text-white text-[10px] font-extrabold active:scale-[0.98] transition flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Deliver Proof</span>
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() => archiveTask(task.id)}
                          className="h-7 px-2.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-[10px] font-extrabold active:scale-[0.98] transition flex items-center gap-1 cursor-pointer"
                          title="Archive to Done & History"
                        >
                          <Archive className="w-2.5 h-2.5" />
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
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                              {line.scoreType} Score
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-extrabold text-slate-900 mt-0.5">
                          {task.title}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shrink-0 tabular-nums">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-rise">
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
