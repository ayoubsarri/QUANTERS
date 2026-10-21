"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardPlus,
  Clock,
  Flame,
  Mail,
  QrCode,
  ShieldAlert,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { PlanetEmblem } from "@/components/shared/PlanetEmblem";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { DayOfWeek, TimeSlot } from "@/lib/types/erp";

const DAYS: { key: DayOfWeek; short: string }[] = [
  { key: "Saturday", short: "Sat" },
  { key: "Sunday", short: "Sun" },
  { key: "Monday", short: "Mon" },
  { key: "Tuesday", short: "Tue" },
  { key: "Wednesday", short: "Wed" },
  { key: "Thursday", short: "Thu" },
  { key: "Friday", short: "Fri" },
];

const SLOTS: { key: TimeSlot; label: string; hours: string }[] = [
  { key: "Morning", label: "Morning", hours: "08:00–12:00" },
  { key: "Afternoon", label: "Afternoon", hours: "12:00–16:00" },
  { key: "Evening", label: "Evening", hours: "16:00–20:00" },
];

export default function AdminOverviewPage() {
  const {
    members,
    teams,
    departments,
    tasks,
    projectSubmissions,
    proposals,
    confirmTraineeToActive,
    assignBuddyToMember,
    createTask,
    sendClubMessage,
  } = useQuantersStore();

  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  // Current active-roster members (exclude Former: Resigned, Removed, Alumni)
  const currentMembers = members.filter((m) =>
    ["Trainee", "Active", "Inactive", "Suspended"].includes(m.status)
  );
  const activeCount = members.filter((m) => m.status === "Active").length;
  const traineeCount = members.filter((m) => m.status === "Trainee").length;
  const inactiveCount = members.filter((m) => m.status === "Inactive").length;
  const suspendedCount = members.filter((m) => m.status === "Suspended").length;

  const avgAttendance =
    currentMembers.length > 0
      ? Math.round(
          currentMembers.reduce((acc, m) => acc + m.attendanceRate, 0) /
            currentMembers.length
        )
      : 0;

  const activeTeams = teams.filter((t) => !t.archived);

  // Executive KPI calculations
  const traineesReadyToConfirm = members.filter(
    (m) =>
      m.status === "Trainee" &&
      m.traineeDaysElapsed >= 90 &&
      m.attendanceRate >= 75
  );

  const traineesWithoutFirstTask = members.filter(
    (m) =>
      m.status === "Trainee" &&
      m.traineeDaysElapsed >= 25 &&
      !m.onboardingTicks.firstTaskBeforeDay30
  );

  const membersAtRisk = currentMembers.filter((m) => m.healthScore < 50);

  const pendingTaskDeliveries = tasks.reduce(
    (acc, t) =>
      acc + t.assignees.filter((a) => a.status === "Delivered").length,
    0
  );
  const pendingBadgeProjects = projectSubmissions.filter(
    (p) => p.status === "Pending Review"
  ).length;
  const pendingProposals = proposals.filter(
    (p) => p.state === "Submitted" || p.state === "Under Review"
  ).length;
  const totalPendingReviews =
    pendingTaskDeliveries + pendingBadgeProjects + pendingProposals;

  // Dynamic Alerts references
  const karim = members.find((m) => m.id === "mem-karim");
  const walid = members.find((m) => m.id === "mem-walid");
  const riad = members.find((m) => m.id === "mem-riad");
  const nesrine = members.find((m) => m.id === "mem-nesrine");

  // Top Contributors sorted by monthly XP then total XP
  const leaderboard = [...currentMembers]
    .sort((a, b) => b.xpMonth - a.xpMonth || b.xpTotal - a.xpTotal)
    .slice(0, 6);

  const motmLeader = leaderboard[0];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-rise">
      {/* Action Feedback Toast */}
      {actionToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-rise">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionToast}</span>
          </span>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-white/80 hover:text-white ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Concise Club Pulse Top Hero Bar */}
      <section className="bg-hero-cobalt rounded-2xl p-5 sm:p-6 text-white shadow-[0_14px_34px_rgba(6,30,71,0.22)] relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#29D2FF]/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <PlanetEmblem size={56} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[#29D2FF] text-[10px] font-bold tracking-wider uppercase mb-1.5">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Club Pulse · 2026/2027</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Executive Command Center
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 4 Key Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#041226]/50 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-md w-full sm:w-auto">
              <div className="px-2 sm:border-r border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-blue-200/80 font-semibold">
                  Active
                </div>
                <div className="text-xl font-black tabular-nums text-white mt-0.5">
                  {activeCount}
                </div>
              </div>
              <div className="px-2 sm:border-r border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-blue-200/80 font-semibold">
                  Trainees
                </div>
                <div className="text-xl font-black tabular-nums text-[#29D2FF] mt-0.5">
                  {traineeCount}
                </div>
              </div>
              <div className="px-2 sm:border-r border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-blue-200/80 font-semibold">
                  Attendance
                </div>
                <div className="text-xl font-black tabular-nums text-emerald-300 mt-0.5">
                  {avgAttendance}%
                </div>
              </div>
              <div className="px-2">
                <div className="text-[10px] uppercase tracking-wider text-blue-200/80 font-semibold">
                  Teams
                </div>
                <div className="text-xl font-black tabular-nums text-amber-300 mt-0.5">
                  {activeTeams.length}
                </div>
              </div>
            </div>

            {/* 2 Quick CTA Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                href="/admin/workshops"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#29D2FF] hover:bg-[#38E4FF] text-[#041226] font-extrabold text-xs px-4 py-3 rounded-xl shadow-md transition"
              >
                <QrCode className="w-4 h-4" />
                <span>Workshops &amp; QR</span>
              </Link>
              <Link
                href="/admin/members"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs px-4 py-3 rounded-xl transition"
              >
                <Users className="w-4 h-4 text-[#29D2FF]" />
                <span>Member Directory</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 Spacious Executive KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Current Roster */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2EDF8] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600">
              Current Roster
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-[#1D63EB]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 tabular-nums">
              {currentMembers.length}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1 tabular-nums">
              {activeCount} Active · {traineeCount} Trainees
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] font-bold whitespace-nowrap">
            <span className="text-slate-400">
              {inactiveCount} Inactive · {suspendedCount} Susp.
            </span>
            <Link
              href="/admin/members"
              className="text-[#1D63EB] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View Roster</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Trainees Ready to Confirm */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2EDF8] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600">
              Trainees Ready to Confirm
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-emerald-600 tabular-nums">
              {traineesReadyToConfirm.length}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              ≥90 days &amp; ≥75% attendance
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] font-bold whitespace-nowrap">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              3-Month Track
            </span>
            <Link
              href="/admin/members?status=Trainee"
              className="text-emerald-700 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Review</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Attention Needed / At Risk */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2EDF8] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600">
              Attention Needed / At Risk
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-rose-600 tabular-nums">
              {membersAtRisk.length + traineesWithoutFirstTask.length}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {membersAtRisk.length} low health · {traineesWithoutFirstTask.length} missing 1st task
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] font-bold whitespace-nowrap">
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              HR Follow-up
            </span>
            <Link
              href="/admin/members?status=Inactive"
              className="text-rose-700 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Pending Reviews */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2EDF8] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600">
              Pending Reviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-indigo-600 tabular-nums">
              {totalPendingReviews}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1 tabular-nums">
              {pendingTaskDeliveries} Tasks · {pendingBadgeProjects} Badges ·{" "}
              {pendingProposals} Proposals
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] font-bold whitespace-nowrap">
            <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              Review Queue
            </span>
            <Link
              href="/admin/proposals"
              className="text-indigo-700 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Open Queue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Main Two-Column Executive Grid: Left Visual Heatmap | Right Action Queue + Top Contributors */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: True Visual 7-Day Club Availability Heatmap */}
        <section className="xl:col-span-7 bg-white rounded-2xl border border-[#E2EDF8] p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1D63EB]" />
                <span>7-Day Club Availability Heatmap (Saturday – Friday)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any slot block to view available members in the directory ({currentMembers.length} active roster)
              </p>
            </div>

            <Link
              href="/admin/members"
              className="text-xs font-bold text-[#1D63EB] hover:underline inline-flex items-center gap-1"
            >
              <span>Slot Finder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 7 Columns (Sat-Fri) × 3 Rows (Morning, Afternoon, Evening) Heatmap Matrix */}
          <div className="overflow-x-auto">
            <div className="min-w-[620px] space-y-2.5">
              {/* Column Headers: Sat - Fri */}
              <div className="grid grid-cols-8 gap-2.5 items-center">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                  Time Slot
                </div>
                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    className="text-center text-xs font-extrabold text-slate-700 py-1"
                  >
                    {d.short}
                  </div>
                ))}
              </div>

              {/* 3 Time-Slot Rows */}
              {SLOTS.map((slot) => (
                <div
                  key={slot.key}
                  className="grid grid-cols-8 gap-2.5 items-stretch"
                >
                  {/* Row Label */}
                  <div className="flex flex-col justify-center pr-2">
                    <span className="text-xs font-extrabold text-slate-800">
                      {slot.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {slot.hours}
                    </span>
                  </div>

                  {/* 7 Day Cells */}
                  {DAYS.map((day) => {
                    const freeMembers = currentMembers.filter((m) =>
                      m.availability?.[day.key]?.includes(slot.key)
                    );
                    const count = freeMembers.length;
                    const pct =
                      currentMembers.length > 0
                        ? Math.round((count / currentMembers.length) * 100)
                        : 0;

                    const heatClass =
                      pct >= 75
                        ? "bg-[#0B357D] text-white shadow-sm"
                        : pct >= 50
                        ? "bg-[#1D63EB] text-white"
                        : pct >= 25
                        ? "bg-[#DBEAFE] text-[#1E40AF]"
                        : "bg-slate-100 text-slate-500";

                    return (
                      <Link
                        key={`${day.key}-${slot.key}`}
                        href={`/admin/members?day=${day.key}&slot=${slot.key}`}
                        title={`${day.key} ${slot.label}: ${count} members free (${pct}%)`}
                        className={`rounded-xl p-3 flex flex-col items-center justify-center transition hover:scale-[1.03] ${heatClass}`}
                      >
                        <span className="text-lg font-black tabular-nums leading-none">
                          {count}
                        </span>
                        <span className="text-[10px] font-mono font-bold opacity-85 mt-1 tabular-nums">
                          {pct}%
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="pt-3 border-t border-[#E2EDF8] flex items-center justify-between gap-3 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-slate-600">
              Best workshop windows: <strong className="text-slate-900">Saturday &amp; Thursday Afternoon</strong>
            </span>
            <div className="flex items-center gap-3 flex-wrap text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#0B357D]" />
                <span>Peak (≥75%)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#1D63EB]" />
                <span>High (50–74%)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#DBEAFE] border border-blue-200" />
                <span>Moderate (25–49%)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                <span>Low (&lt;25%)</span>
              </span>
            </div>
          </div>
        </section>

        {/* Right 5 Cols: Compact HR Action Queue + Top Contributors */}
        <div className="xl:col-span-5 space-y-6">
          {/* Compact HR Action Queue */}
          <section className="bg-white rounded-2xl border border-[#E2EDF8] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EDF8]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-extrabold text-slate-900">
                  HR Action Queue
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                4 Active Items
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-1">
              {/* Action 1: Karim Hadj */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate">
                    Karim Hadj · Ready to Confirm
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {karim?.traineeDaysElapsed ?? 96}d elapsed · {karim?.attendanceRate ?? 84}% attendance
                  </div>
                </div>
                <div className="shrink-0">
                  {karim?.status === "Trainee" ? (
                    <button
                      type="button"
                      onClick={() => {
                        confirmTraineeToActive(
                          "mem-karim",
                          "Confirmed via HR Action Queue."
                        );
                        showToast("Karim Hadj confirmed as Active Member (+50 XP)!");
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirmed</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action 2: Walid Meziani */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate">
                    Walid Meziani · Day 26 Onboarding
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Needs buddy pairing &amp; starter task
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!walid?.onboardingTicks.buddyAssigned ? (
                    <button
                      type="button"
                      onClick={() => {
                        assignBuddyToMember("mem-walid", "mem-ayoub");
                        showToast("Assigned Ayoub Sarri as Buddy for Walid Meziani!");
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition cursor-pointer"
                    >
                      + Buddy
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      <Check className="w-3 h-3" />
                      <span>Buddy</span>
                    </span>
                  )}
                  {!walid?.onboardingTicks.firstTaskBeforeDay30 && (
                    <button
                      type="button"
                      onClick={() => {
                        createTask({
                          title: "Onboarding Starter Task: Media Kit Coverage",
                          description: "Starter task assigned before Day 30.",
                          category: "Media",
                          departmentId: "dept-media",
                          deadline: "2026-10-28",
                          locationOrShift: "Main Auditorium",
                          proposedScore: 20,
                          assigneeIds: ["mem-walid"],
                        });
                        showToast("Assigned Starter Task (+20 pts) to Walid Meziani!");
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      + Task
                    </button>
                  )}
                </div>
              </div>

              {/* Action 3: Riad Touati */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate">
                    Riad Touati · {riad?.daysSinceLastActivity ?? 34}d Silent
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Health score {riad?.healthScore ?? 39}% · Inactive flag
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sendClubMessage({
                      recipientScope: "Riad Touati (QT-26-0209)",
                      priority: "Action needed",
                      title: "HR Welfare & Activity Check-In",
                      body: "Hi Riad, please check in with HR regarding your availability.",
                      inApp: true,
                      email: true,
                    });
                    showToast("HR Check-In sent to Riad Touati!");
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Check-In</span>
                </button>
              </div>

              {/* Action 4: Nesrine Khelifi */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Nesrine Khelifi · Board Policy</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Dual student-org flag ({nesrine?.roles.join(", ")})
                  </div>
                </div>
                <Link
                  href="/admin/members/mem-nesrine"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 transition"
                >
                  Review
                </Link>
              </div>
            </div>
          </section>

          {/* Top Contributors */}
          <section className="bg-white rounded-2xl border border-[#E2EDF8] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Top Contributors</span>
              </h2>
              <Link
                href="/admin/points"
                className="text-xs font-bold text-[#1D63EB] hover:underline inline-flex items-center gap-1"
              >
                <span>Points Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {motmLeader && (
              <div className="bg-gradient-to-r from-[#061E47] via-[#0B3B8C] to-[#1D63EB] rounded-2xl p-3.5 text-white mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={motmLeader.avatarUrl}
                    alt={motmLeader.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Monthly Star Leader</span>
                    </div>
                    <div className="text-xs font-extrabold truncate">
                      {motmLeader.fullName}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-emerald-300 tabular-nums">
                    +{motmLeader.xpMonth} XP
                  </div>
                  <div className="text-[10px] text-blue-200 tabular-nums">
                    {motmLeader.xpTotal} Total
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {leaderboard.slice(1, 6).map((m, idx) => {
                const dept = departments.find((d) => d.id === m.departmentId);
                return (
                  <Link
                    key={m.id}
                    href={`/admin/members/${m.id}`}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-[#F4F7FB] transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-4 text-xs font-extrabold text-slate-400 tabular-nums">
                        #{idx + 2}
                      </span>
                      <img
                        src={m.avatarUrl}
                        alt={m.fullName}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {m.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {dept?.shortName}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50/90 text-emerald-700 border border-emerald-200/80 font-mono text-[11px] font-semibold tabular-nums">
                      +{m.xpMonth} XP
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
