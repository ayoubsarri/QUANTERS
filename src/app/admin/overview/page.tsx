"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Mail,
  QrCode,
  ShieldAlert,
  Sparkles,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { DayOfWeek, isMemberAvailableInSlot, STUDY_HOUR_SLOTS, TimeSlot } from "@/lib/types/erp";

const DAYS: { key: DayOfWeek; short: string }[] = [
  { key: "Saturday", short: "Sat" },
  { key: "Sunday", short: "Sun" },
  { key: "Monday", short: "Mon" },
  { key: "Tuesday", short: "Tue" },
  { key: "Wednesday", short: "Wed" },
  { key: "Thursday", short: "Thu" },
  { key: "Friday", short: "Fri" },
];

const SLOTS = STUDY_HOUR_SLOTS;

export default function AdminOverviewPage() {
  const { t, lang, isRtl } = useTranslation();
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

  const isSuperAdminAccount = (m: (typeof members)[number]) =>
    m.roles.includes("Super Admin") ||
    m.roles.includes("Executive") ||
    m.email.toLowerCase() === "quantaclubdz@gmail.com" ||
    m.email.toLowerCase() === "hr.quanta@univ-alger.dz" ||
    m.id === "mem-super-quanta" ||
    m.id === "mem-super-hr";

  // Current active-roster student members (excludes Super Admin system account & Former: Resigned, Removed, Alumni)
  const currentMembers = members.filter(
    (m) =>
      !isSuperAdminAccount(m) &&
      ["Trainee", "Active", "Inactive", "Suspended"].includes(m.status)
  );
  const activeCount = currentMembers.filter((m) => m.status === "Active").length;
  const traineeCount = currentMembers.filter((m) => m.status === "Trainee").length;
  const inactiveCount = currentMembers.filter((m) => m.status === "Inactive").length;
  const suspendedCount = currentMembers.filter((m) => m.status === "Suspended").length;

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

  // Dynamic HR Action Queue lists derived from live members
  const policyConflictMembers = currentMembers.filter(
    (m) => m.isBureauMember && m.declaresOtherStudentOrg
  );
  const totalHrActionCount =
    traineesReadyToConfirm.length +
    traineesWithoutFirstTask.length +
    membersAtRisk.length +
    policyConflictMembers.length;

  // Top Contributors sorted by monthly XP then total XP
  const leaderboard = [...currentMembers]
    .sort((a, b) => b.xpMonth - a.xpMonth || b.xpTotal - a.xpTotal)
    .slice(0, 6);

  const motmLeader = leaderboard[0];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Action Feedback Toast */}
      {actionToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-display font-bold animate-rise">
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

      {/* 1. Member-App Style Editorial Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
            {isRtl ? "لوحة الإدارة التنفيذية · السنة الأكاديمية 2026 / 2027" : "EXECUTIVE CONSOLE · ACADEMIC CYCLE 2026 / 2027"}
          </span>
          <h1 className="font-display text-2xl sm:text-[26px] font-black text-[#0F1E36] tracking-tight leading-tight">
            {isRtl ? "نبض النادي وحوكمة العمليات" : "Club Pulse & Governance"}
          </h1>
          <p className="font-editorial italic text-slate-500 text-sm sm:text-base mt-0.5">
            {isRtl
              ? "مؤشرات الأعضاء الآنية، مصفوفة التفرغ الأكاديمي، وقوائم العمليات."
              : "Real-time roster telemetry, availability matrix, and operational queues."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/workshops"
            className="inline-flex items-center gap-2 bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white font-display font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-[0_6px_16px_rgba(15,30,54,0.16)] transition"
          >
            <QrCode className="w-3.5 h-3.5 text-[#7DD3FC]" />
            <span>{isRtl ? "الورشات ورمز QR" : "Workshops & QR"}</span>
          </Link>
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-2 bg-[#F0F6FF] hover:bg-[#E2EEFF] text-[#182C4E] border border-[#D5E3F5] font-display font-extrabold text-xs px-4 py-2.5 rounded-xl transition"
          >
            <Users className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{isRtl ? "دليل الأعضاء" : "Member Directory"}</span>
          </Link>
        </div>
      </header>

      {/* 2. Signature Wide-Format Cosmic Observatory Banner (Responsive & Mobile-Optimized) */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#040C1A] via-[#06142B] to-[#0A1F3E] text-white border border-[#38BDF8]/40 shadow-[0_16px_40px_rgba(2,10,24,0.36)]">
        {/* Ambient Cosmic Radial Dust & Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.18) 0%, transparent 55%)",
          }}
        />

        {/* Panoramic Cosmic Scene: Quantum Probe Satellite (Center) & Knitted Mascot with Telescope (Right) */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden opacity-35 sm:opacity-90 xl:opacity-100">
          <img
            src="/brand/admin_overview_banner_bg.webp"
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            className="h-full w-full object-cover object-right"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.65) 34%, black 50%, black 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.65) 34%, black 50%, black 100%)",
            }}
          />
        </div>

        <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col justify-between min-h-[176px] max-w-lg lg:max-w-xl">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#08152E]/90 border border-[#38BDF8]/45 text-[#7DD3FC] text-[10px] sm:text-[10.5px] font-mono font-bold tracking-[0.14em] uppercase backdrop-blur-md shadow-xs">
              <Sparkles className="w-3 h-3 shrink-0 text-[#38E4FF]" />
              <span className="truncate">QUANTA SCIENTIFIC CLUB · UNIVERSITY OF ALGIERS 1</span>
            </div>

            <h2 className="font-display text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-white leading-tight">
              {isRtl ? `6 أقسام و ${activeTeams.length} فرق علمية نشطة` : `6 Departments & ${activeTeams.length} Scientific Teams Active`}
            </h2>

            {/* Brand Lockup */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <img
                src="/brand/univ_quanta_asset2.png"
                alt="University of Algiers 1 & Quanta"
                className="h-[20px] w-auto object-contain opacity-95"
              />
              <span className="h-3.5 w-px bg-white/20" />
              <img
                src="/brand/QUANTERS_white_logo.svg"
                alt="QUANTERS"
                className="h-[22px] w-auto object-contain opacity-95 shrink-0"
              />
            </div>
          </div>

          {/* Redesigned 4-Metric Glass Telemetry Strip — Placed on the LEFT underneath the title & lockup */}
          <div className="mt-4 pt-3 border-t border-white/10 inline-grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5 bg-[#061226]/85 border border-[#38BDF8]/35 rounded-xl px-4 py-2.5 backdrop-blur-md w-fit shadow-xl">
            <div className="pr-3 border-r border-[#2B4875]/60">
              <div className="text-[9px] sm:text-[9.5px] font-mono uppercase tracking-wider text-slate-300 font-semibold whitespace-nowrap">
                {isRtl ? "الأعضاء النشطون" : "Active Members"}
              </div>
              <div className="font-display text-lg sm:text-xl font-black tabular-nums text-white mt-0.5">
                {activeCount}
              </div>
            </div>
            <div className="px-1.5 sm:px-3 sm:border-r border-[#2B4875]/60">
              <div className="text-[9px] sm:text-[9.5px] font-mono uppercase tracking-wider text-slate-300 font-semibold whitespace-nowrap">
                {isRtl ? "المتدربون" : "Trainees"}
              </div>
              <div className="font-display text-lg sm:text-xl font-black tabular-nums text-[#7DD3FC] mt-0.5">
                {traineeCount}
              </div>
            </div>
            <div className="px-1.5 sm:px-3 border-r border-[#2B4875]/60">
              <div className="text-[9px] sm:text-[9.5px] font-mono uppercase tracking-wider text-slate-300 font-semibold whitespace-nowrap">
                {isRtl ? "نسبة الحضور" : "Attendance"}
              </div>
              <div className="font-display text-lg sm:text-xl font-black tabular-nums text-emerald-300 mt-0.5">
                {avgAttendance}%
              </div>
            </div>
            <div className="pl-1.5 sm:pl-3">
              <div className="text-[9px] sm:text-[9.5px] font-mono uppercase tracking-wider text-slate-300 font-semibold whitespace-nowrap">
                {isRtl ? "الفرق العلمية" : "Sci. Teams"}
              </div>
              <div className="font-display text-lg sm:text-xl font-black tabular-nums text-amber-300 mt-0.5">
                {activeTeams.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Executive Telemetry Deck — Compact 4-Cell Cockpit */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Cell 1: Active Directory */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-[#0284C7]/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {isRtl ? "سجل الأعضاء النشط" : "ACTIVE DIRECTORY"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#F0F6FF] text-[#0284C7] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2 flex items-baseline justify-between gap-2">
            <div className="font-display text-2xl sm:text-3xl font-black text-[#0F1E36] tabular-nums">
              {currentMembers.length}
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              {activeCount} Active · {traineeCount} Trainees
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="text-slate-400 font-mono">
              {inactiveCount} Inactive · {suspendedCount} Susp.
            </span>
            <Link
              href="/admin/members"
              className="text-[#0284C7] hover:text-[#182C4E] font-display font-bold inline-flex items-center gap-1 transition"
            >
              <span>{isRtl ? "الدليل" : "Directory"}</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Cell 2: Probation Clearance */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-emerald-400 transition flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
              {isRtl ? "تأهيل العضوية الكاملة" : "PROBATION CLEARANCE"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2 flex items-baseline justify-between gap-2">
            <div className="font-display text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
              {traineesReadyToConfirm.length}
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              ≥90d & ≥75% Pres.
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="text-slate-500 font-sans">
              Eligible for confirmation
            </span>
            <Link
              href="/admin/members?status=Trainee"
              className="text-emerald-700 hover:text-emerald-900 font-display font-bold inline-flex items-center gap-1 transition"
            >
              <span>{isRtl ? "مراجعة" : "Triage"}</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Cell 3: Operational Anomalies */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-rose-400 transition flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600">
              {isRtl ? "مخاطر المتابعة والالتزام" : "COMPLIANCE & RISKS"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2 flex items-baseline justify-between gap-2">
            <div className="font-display text-2xl sm:text-3xl font-black text-rose-600 tabular-nums">
              {membersAtRisk.length + traineesWithoutFirstTask.length}
            </div>
            <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              {membersAtRisk.length} Low · {traineesWithoutFirstTask.length} Overdue
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="text-slate-500 font-sans">
              Action required by HR
            </span>
            <Link
              href="/admin/members?status=Inactive"
              className="text-rose-600 hover:text-rose-800 font-display font-bold inline-flex items-center gap-1 transition"
            >
              <span>{isRtl ? "فحص" : "Inspect"}</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Cell 4: Executive Triage */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-[#182C4E]/50 transition flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#182C4E]">
              {isRtl ? "طابور المراجعة التنفيذية" : "EXECUTIVE TRIAGE"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#F0F6FF] text-[#182C4E] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2 flex items-baseline justify-between gap-2">
            <div className="font-display text-2xl sm:text-3xl font-black text-[#182C4E] tabular-nums">
              {totalPendingReviews}
            </div>
            <span className="text-[11px] font-mono font-bold text-[#182C4E] bg-[#F0F6FF] px-2 py-0.5 rounded">
              {pendingTaskDeliveries}T · {pendingBadgeProjects}B · {pendingProposals}P
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="text-slate-500 font-sans">
              Pending deliveries &amp; votes
            </span>
            <Link
              href="/admin/proposals"
              className="text-[#0284C7] hover:text-[#182C4E] font-display font-bold inline-flex items-center gap-1 transition"
            >
              <span>{isRtl ? "الفتح" : "Queue"}</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Main Two-Column Executive Grid: Left Visual Heatmap | Right Action Queue + Top Contributors */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: 7-Day Club Availability Heatmap (Ultra-Compact Scientific Figure Style) */}
        <section className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)] space-y-2.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[9.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7]">
                {isRtl ? "مصفوفة التفرغ الأسبوعي" : "SCHEDULE TELEMETRY MATRIX"}
              </div>
              <h2 className="font-display text-sm sm:text-base font-black text-[#0F1E36] flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>
                  {isRtl
                    ? "الخريطة الحرارية لتفرغ الأعضاء (السبت – الجمعة)"
                    : "7-Day Club Availability Heatmap (Saturday – Friday)"}
                </span>
              </h2>
            </div>

            <Link
              href="/admin/members"
              className="text-[11px] font-display font-extrabold text-[#0284C7] hover:text-[#182C4E] inline-flex items-center gap-1 transition"
            >
              <span>{isRtl ? "تصفية الدليل حسب الفترات" : "Directory Slot Filter"}</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </Link>
          </div>

          {/* Ultra-Compact Scientific Heatmap Figure Matrix */}
          <div className="overflow-x-auto bg-[#F8FAFD] p-2 sm:p-2.5 rounded-xl border border-slate-200/80">
            <div className="min-w-[500px] space-y-1">
              {/* Column Headers: Days Sat - Fri */}
              <div className="grid grid-cols-8 gap-1.5 items-center">
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                  SLOT
                </div>
                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    className="text-center font-display text-[10.5px] sm:text-[11px] font-black text-[#0F1E36] py-0.5"
                  >
                    {d.short}
                  </div>
                ))}
              </div>

              {/* 3 Ultra-Compact Time-Slot Rows */}
              {SLOTS.map((slot) => (
                <div
                  key={slot.key}
                  className="grid grid-cols-8 gap-1.5 items-center"
                >
                  {/* Row Label */}
                  <div className="flex flex-col justify-center pr-1 leading-tight">
                    <span className="font-display text-[10px] sm:text-[10.5px] font-extrabold text-[#0F1E36]">
                      {slot.label}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">
                      {slot.hours}
                    </span>
                  </div>

                  {/* 7 Day Cells */}
                  {DAYS.map((day) => {
                    const freeMembers = currentMembers.filter((m) =>
                      isMemberAvailableInSlot(m.availability?.[day.key], slot.key)
                    );
                    const count = freeMembers.length;
                    const pct =
                      currentMembers.length > 0
                        ? Math.round((count / currentMembers.length) * 100)
                        : 0;

                    const heatClass =
                      pct >= 75
                        ? "bg-[#0B1E3B] text-white border border-[#182C4E] shadow-2xs"
                        : pct >= 50
                        ? "bg-[#0284C7] text-white border border-[#0369A1]"
                        : pct >= 25
                        ? "bg-[#BAE6FD] text-[#0369A1] border border-[#7DD3FC]"
                        : "bg-white text-slate-400 border border-slate-200/90";

                    return (
                      <Link
                        key={`${day.key}-${slot.key}`}
                        href={`/admin/members?day=${day.key}&slot=${slot.key}`}
                        title={`${day.key} ${slot.label}: ${count} members free (${pct}%)`}
                        className={`h-8 sm:h-9 rounded-md flex flex-col items-center justify-center transition-all hover:scale-[1.04] active:scale-95 cursor-pointer ${heatClass}`}
                      >
                        <span className="font-display text-xs sm:text-[13px] font-black tabular-nums leading-none">
                          {count}
                        </span>
                        <span className="text-[7px] sm:text-[7.5px] font-mono font-bold opacity-90 mt-0.5 tabular-nums">
                          {pct}%
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Heatmap Legend & Caption */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-[10px] text-slate-500">
            <span className="font-medium text-slate-600">
              Peak Windows:{" "}
              <strong className="font-display font-black text-[#0F1E36]">
                Saturday &amp; Thursday Afternoon
              </strong>
            </span>
            <div className="flex items-center gap-2 font-mono text-[9px] font-semibold">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-white border border-slate-300" />
                <span>&lt;25%</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#BAE6FD]" />
                <span>25–49%</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#0284C7]" />
                <span>50–74%</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#0B1E3B]" />
                <span>≥75%</span>
              </span>
            </div>
          </div>
        </section>

        {/* Right 5 Cols: Compact HR Action Queue + Top Contributors */}
        <div className="xl:col-span-5 space-y-6">
          {/* Compact HR Action Queue */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="font-display text-sm font-black text-[#0F1E36]">
                  HR Action Queue
                </h2>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  totalHrActionCount > 0
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {totalHrActionCount} Active {totalHrActionCount === 1 ? "Item" : "Items"}
              </span>
            </div>

            {totalHrActionCount === 0 ? (
              <div className="py-6 text-center space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="font-display text-xs font-extrabold text-[#0F1E36]">
                  All Clear · No Pending HR Alerts
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Trainee confirmations, onboarding buddy pairings, and attendance flags will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-1">
                {traineesReadyToConfirm.map((trainee) => (
                  <div
                    key={`confirm-${trainee.id}`}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-display text-xs font-extrabold text-[#0F1E36] truncate">
                        {trainee.fullName} · Ready to Confirm
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {trainee.traineeDaysElapsed}d elapsed · {trainee.attendanceRate}% attendance
                      </div>
                    </div>
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          confirmTraineeToActive(
                            trainee.id,
                            "Confirmed via HR Action Queue."
                          );
                          showToast(`${trainee.fullName} confirmed as Active Member (+50 XP)!`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs font-bold transition cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                    </div>
                  </div>
                ))}

                {traineesWithoutFirstTask.map((trainee) => {
                  const defaultBuddy = currentMembers.find(
                    (m) => m.status === "Active" && m.id !== trainee.id
                  );
                  return (
                    <div
                      key={`onboard-${trainee.id}`}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-display text-xs font-extrabold text-[#0F1E36] truncate">
                          {trainee.fullName} · Day {trainee.traineeDaysElapsed} Onboarding
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Needs buddy pairing &amp; starter task
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!trainee.onboardingTicks.buddyAssigned && defaultBuddy && (
                          <button
                            type="button"
                            onClick={() => {
                              assignBuddyToMember(trainee.id, defaultBuddy.id);
                              showToast(
                                `Assigned ${defaultBuddy.fullName} as Buddy for ${trainee.fullName}!`
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-display text-xs font-bold transition cursor-pointer"
                          >
                            + Buddy
                          </button>
                        )}
                        {!trainee.onboardingTicks.firstTaskBeforeDay30 && (
                          <button
                            type="button"
                            onClick={() => {
                              createTask({
                                title: "Onboarding Starter Task",
                                description: "Starter task assigned before Day 30.",
                                category: "General",
                                departmentId: trainee.departmentId,
                                deadline: new Date(Date.now() + 7 * 86400000)
                                  .toISOString()
                                  .slice(0, 10),
                                locationOrShift: "Department Desk",
                                proposedScore: 20,
                                assigneeIds: [trainee.id],
                              });
                              showToast(
                                `Assigned Starter Task (+20 XP) to ${trainee.fullName}!`
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white font-display text-xs font-bold transition cursor-pointer"
                          >
                            + Task
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {membersAtRisk.map((atRisk) => (
                  <div
                    key={`risk-${atRisk.id}`}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-display text-xs font-extrabold text-[#0F1E36] truncate">
                        {atRisk.fullName} · {atRisk.daysSinceLastActivity}d Silent
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Health score {atRisk.healthScore}% · Inactive flag
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sendClubMessage({
                          recipientScope: `${atRisk.fullName} (${atRisk.quanterId})`,
                          priority: "Action needed",
                          title: "HR Welfare & Activity Check-In",
                          body: `Hi ${atRisk.fullName}, please check in with HR regarding your availability.`,
                          inApp: true,
                          email: true,
                        });
                        showToast(`HR Check-In sent to ${atRisk.fullName}!`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-display text-xs font-bold shrink-0 transition cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Check-In</span>
                    </button>
                  </div>
                ))}

                {policyConflictMembers.map((conflictMember) => (
                  <div
                    key={`conflict-${conflictMember.id}`}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-display text-xs font-extrabold text-[#0F1E36] truncate flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{conflictMember.fullName} · Board Policy</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Dual student-org flag ({conflictMember.roles.join(", ")})
                      </div>
                    </div>
                    <Link
                      href={`/admin/members/${conflictMember.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#F0F6FF] hover:bg-[#E2EEFF] text-[#182C4E] border border-[#D5E3F5] font-display text-xs font-bold shrink-0 transition"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Top Contributors */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-black text-[#0F1E36] flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Top Contributors</span>
              </h2>
              <Link
                href="/admin/points"
                className="text-xs font-display font-extrabold text-[#0284C7] hover:text-[#182C4E] inline-flex items-center gap-1"
              >
                <span>Points Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!motmLeader ? (
              <div className="py-5 text-center text-xs text-slate-500">
                No active member XP entries recorded yet.
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] border border-[#2B4875]/75 rounded-2xl p-3.5 text-white mb-3 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={motmLeader.avatarUrl}
                      alt={motmLeader.fullName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#7DD3FC] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7DD3FC] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Monthly Star Leader</span>
                      </div>
                      <div className="font-display text-xs font-black truncate">
                        {motmLeader.fullName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-black text-emerald-300 tabular-nums">
                      +{motmLeader.xpMonth} XP
                    </div>
                    <div className="text-[10px] font-mono text-slate-300 tabular-nums">
                      {motmLeader.xpTotal} Total
                    </div>
                  </div>
                </div>

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
                          <span className="w-4 font-mono text-xs font-extrabold text-slate-400 tabular-nums">
                            #{idx + 2}
                          </span>
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                          <div className="truncate">
                            <div className="font-display text-xs font-bold text-[#0F1E36] truncate">
                              {m.fullName}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
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
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
