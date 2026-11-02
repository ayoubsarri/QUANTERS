"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Download,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Target,
  Zap,
  Clock,
  Layers,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  FlaskConical,
  Atom,
  CheckCheck,
  FileText,
  Vote,
  Compass,
  Trophy,
  Medal,
  Gem,
  Hexagon,
  Crown,
  Activity,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { Member } from "@/lib/types/erp";
import { getEffectiveMemberAvatar } from "@/lib/utils/avatarUtils";

type PeriodKey = "This Month" | "Semester" | "Season";
type SortOption = "avg" | "total" | "attendance" | "health";
type StatsViewTab = "all" | "teams" | "depts" | "workshops" | "tasks" | "laureates";

function TierInsigniaBadge({ level }: { level: number }) {
  const configs: Record<number, { bg: string; border: string; icon: React.ReactNode }> = {
    1: { bg: "bg-amber-900/15", border: "border-amber-800/40", icon: <ShieldCheck className="w-3 h-3 text-amber-800" /> },
    2: { bg: "bg-slate-200", border: "border-slate-400", icon: <Hexagon className="w-3 h-3 text-slate-600" /> },
    3: { bg: "bg-orange-950/15", border: "border-orange-800/40", icon: <Atom className="w-3 h-3 text-orange-900" /> },
    4: { bg: "bg-slate-300", border: "border-slate-500", icon: <Zap className="w-3 h-3 text-slate-800" /> },
    5: { bg: "bg-amber-100", border: "border-amber-400", icon: <Award className="w-3 h-3 text-amber-600" /> },
    6: { bg: "bg-emerald-100", border: "border-emerald-400", icon: <Gem className="w-3 h-3 text-emerald-600" /> },
    7: { bg: "bg-sky-100", border: "border-sky-400", icon: <Compass className="w-3 h-3 text-sky-600" /> },
    8: { bg: "bg-purple-100", border: "border-purple-400", icon: <Sparkles className="w-3 h-3 text-purple-600" /> },
    9: { bg: "bg-cyan-100", border: "border-cyan-400", icon: <Gem className="w-3 h-3 text-cyan-600" /> },
    10: { bg: "bg-gradient-to-r from-amber-400/20 to-sky-400/20", border: "border-amber-500", icon: <Crown className="w-3 h-3 text-amber-600" /> },
  };

  const cfg = configs[level] || configs[1];

  return (
    <span className={`w-5 h-5 rounded-md ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 shadow-2xs`}>
      {cfg.icon}
    </span>
  );
}

export default function AdminStatsPage() {
  const members = useQuantersStore((s) => s.members);
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);
  const workshops = useQuantersStore((s) => s.workshops);
  const tasks = useQuantersStore((s) => s.tasks);
  const badges = useQuantersStore((s) => s.badges);
  const proposals = useQuantersStore((s) => s.proposals);
  const settings = useQuantersStore((s) => s.settings);

  const [period, setPeriod] = useState<PeriodKey>("Season");
  const [activeTab, setActiveTab] = useState<StatsViewTab>("all");
  const [deptSortBy, setDeptSortBy] = useState<SortOption>("avg");
  const [teamSortBy, setTeamSortBy] = useState<SortOption>("avg");
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Exclude governance accounts from member scoring
  const isExcludedFromScoring = (m: (typeof members)[number]) =>
    m.roles.includes("Super Admin") ||
    m.roles.includes("Executive") ||
    m.email.toLowerCase() === "quantaclubdz@gmail.com" ||
    m.email.toLowerCase() === "hr.quanta@univ-alger.dz" ||
    m.id === "mem-super-quanta" ||
    m.id === "mem-super-hr";

  const scoringMembers = useMemo(() => members.filter((m) => !isExcludedFromScoring(m)), [members]);

  const getMemberPeriodScore = (m: (typeof members)[number]) => {
    if (period === "This Month") return m.xpMonth || 0;
    return m.xpSeason || 0;
  };

  // Vitality Metrics
  const totalClubXp = scoringMembers.reduce((sum, m) => sum + getMemberPeriodScore(m), 0);
  const totalCheckins = workshops.reduce(
    (sum, w) => sum + w.attendanceRecords.filter((r) => r.status === "Present").length,
    0
  );
  const avgAttendance = Math.round(
    scoringMembers.reduce((s, m) => s + (m.attendanceRate || 0), 0) / Math.max(1, scoringMembers.length)
  );
  const avgTaskOnTime = Math.round(
    scoringMembers.reduce((s, m) => s + (m.onTimeTaskRate || 0), 0) / Math.max(1, scoringMembers.length)
  );
  const totalBadgesAwarded = badges.reduce((sum, b) => sum + (b.awardedCount || 0), 0);

  // Workshop fill rate telemetry
  const totalWorkshopCapacity = workshops.reduce((sum, w) => sum + (w.capacity || 0), 0);
  const totalWorkshopRegistered = workshops.reduce((sum, w) => sum + (w.registeredMemberIds?.length || 0), 0);
  const workshopFillRate = Math.min(
    100,
    Math.round((totalWorkshopRegistered / Math.max(1, totalWorkshopCapacity)) * 100)
  );
  const workshopCheckinRate = Math.min(
    100,
    Math.round((totalCheckins / Math.max(1, totalWorkshopRegistered)) * 100)
  );

  // Task breakdown telemetry
  const completedTasks = tasks.filter((t) => t.urgencyLabel === "Completed" || t.assignees?.some((a) => a.status === "Validated")).length;
  const overdueTasks = tasks.filter((t) => t.assignees?.some((a) => a.status === "Late")).length;
  const pendingTasks = tasks.filter((t) => t.urgencyLabel === "In progress" || t.assignees?.some((a) => a.status === "In progress" || a.status === "To do")).length;
  const taskCompletionRate = Math.round((completedTasks / Math.max(1, tasks.length)) * 100);

  // Proposals telemetry
  const approvedProposals = proposals.filter((p) => p.state === "Approved").length;
  const proposalApprovalRate = Math.round((approvedProposals / Math.max(1, proposals.length)) * 100);

  // 10-Tier Rank Distribution Spectrum
  const rankLevels = settings.rankLevels || [
    { level: 1, minXp: 0, title: "Wooden Quanter" },
    { level: 2, minXp: 1000, title: "Stone Observer" },
    { level: 3, minXp: 2000, title: "Copper Researcher" },
    { level: 4, minXp: 3000, title: "Iron Expert" },
    { level: 5, minXp: 4000, title: "Gold Pioneer" },
    { level: 6, minXp: 5000, title: "Emerald Scholar" },
    { level: 7, minXp: 6000, title: "Sapphire Explorer" },
    { level: 8, minXp: 7000, title: "Amethyst Inventor" },
    { level: 9, minXp: 8000, title: "Diamond Legend" },
    { level: 10, minXp: 10000, title: "Quantum Master" },
  ];

  const rankDistribution = useMemo(() => {
    return rankLevels.map((lvl) => {
      const count = scoringMembers.filter((m) => (m.level || 1) === lvl.level).length;
      const pct = Math.round((count / Math.max(1, scoringMembers.length)) * 100);
      return {
        ...lvl,
        count,
        pct,
      };
    });
  }, [rankLevels, scoringMembers]);

  // Scientific Teams Analytics (Restored & Celebrated)
  const activeTeams = useMemo(() => teams.filter((t) => !t.archived), [teams]);

  const teamRankings = useMemo(() => {
    return activeTeams
      .map((team) => {
        const teamMembers = scoringMembers.filter(
          (m) => m.teamId === team.id || team.memberIds?.includes(m.id)
        );
        const count = teamMembers.length;
        const totalScore = teamMembers.reduce((s, m) => s + getMemberPeriodScore(m), 0);
        const avgScore = count > 0 ? Math.round(totalScore / count) : 0;
        const teamAttendance = count > 0
          ? Math.round(teamMembers.reduce((s, m) => s + (m.attendanceRate || 0), 0) / count)
          : 0;
        const teamTaskRate = count > 0
          ? Math.round(teamMembers.reduce((s, m) => s + (m.onTimeTaskRate || 0), 0) / count)
          : 0;
        const healthScore = Math.round((teamAttendance * 0.5) + (teamTaskRate * 0.5));
        const leader = members.find((m) => m.id === team.leaderMemberId);

        return {
          team,
          memberCount: count,
          totalScore,
          avgScore,
          teamAttendance,
          teamTaskRate,
          healthScore,
          leader,
        };
      })
      .sort((a, b) => {
        if (teamSortBy === "avg") return b.avgScore - a.avgScore;
        if (teamSortBy === "total") return b.totalScore - a.totalScore;
        if (teamSortBy === "attendance") return b.teamAttendance - a.teamAttendance;
        return b.healthScore - a.healthScore;
      });
  }, [activeTeams, scoringMembers, teamSortBy, period, members]);

  // Department Analytics
  const deptRankings = useMemo(() => {
    return departments
      .map((dept) => {
        const deptMembers = scoringMembers.filter((m) => m.departmentId === dept.id);
        const count = Math.max(1, deptMembers.length);
        const totalScore = deptMembers.reduce((s, m) => s + getMemberPeriodScore(m), 0);
        const avgScore = Math.round(totalScore / count);
        const deptAttendance = Math.round(
          deptMembers.reduce((s, m) => s + (m.attendanceRate || 0), 0) / count
        );
        const deptTaskOnTime = Math.round(
          deptMembers.reduce((s, m) => s + (m.onTimeTaskRate || 0), 0) / count
        );
        const healthScore = Math.round((deptAttendance * 0.5) + (deptTaskOnTime * 0.5));

        return {
          dept,
          memberCount: deptMembers.length,
          totalScore,
          avgScore,
          deptAttendance,
          deptTaskOnTime,
          healthScore,
        };
      })
      .sort((a, b) => {
        if (deptSortBy === "avg") return b.avgScore - a.avgScore;
        if (deptSortBy === "total") return b.totalScore - a.totalScore;
        if (deptSortBy === "attendance") return b.deptAttendance - a.deptAttendance;
        return b.healthScore - a.healthScore;
      });
  }, [departments, scoringMembers, deptSortBy, period]);

  // Top Workshops by Enrollment & Attendance
  const topWorkshops = useMemo(() => {
    return [...workshops]
      .sort((a, b) => (b.registeredMemberIds?.length || 0) - (a.registeredMemberIds?.length || 0))
      .slice(0, 5);
  }, [workshops]);

  // Laureate Leaderboard Separation (Active Members vs Alumni Laureates)
  const [laureateTab, setLaureateTab] = useState<"members" | "alumni">("members");

  const isAlumniMember = (m: Member) =>
    m.status === "Alumni" ||
    m.roles.includes("Alumni") ||
    m.tenure === "QUANTA Alumni" ||
    Boolean(m.tenure?.toLowerCase().includes("alumni"));

  const activeScoringMembers = useMemo(() => {
    return scoringMembers.filter((m) => !isAlumniMember(m));
  }, [scoringMembers]);

  const alumniScoringMembers = useMemo(() => {
    return scoringMembers.filter((m) => isAlumniMember(m));
  }, [scoringMembers]);

  const topActiveMembers = useMemo(() => {
    return [...activeScoringMembers]
      .sort((a, b) => getMemberPeriodScore(b) - getMemberPeriodScore(a))
      .slice(0, 10);
  }, [activeScoringMembers, period]);

  const topAlumniMembers = useMemo(() => {
    return [...alumniScoringMembers]
      .sort((a, b) => getMemberPeriodScore(b) - getMemberPeriodScore(a))
      .slice(0, 10);
  }, [alumniScoringMembers, period]);

  const currentTopMembers = laureateTab === "alumni" ? topAlumniMembers : topActiveMembers;

  const handleExportCsv = () => {
    const headers = ["Category,Rank,QuanterID,FullName,Department,PeriodXP,TotalXP,AttendanceRate,TasksOnTimeRate\n"];
    const rows = currentTopMembers.map(
      (m, idx) =>
        `"${laureateTab === "alumni" ? "Alumni" : "Active Member"}",${idx + 1},${m.quanterId},"${m.fullName}",${m.departmentId},${getMemberPeriodScore(m)},${m.xpTotal},${m.attendanceRate}%,${m.onTimeTaskRate}%`
    );
    const blob = new Blob([headers.join("") + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QUANTERS_Telemetry_${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportToast("Exported comprehensive statistics CSV");
    setTimeout(() => setExportToast(null), 3000);
  };

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#182C4E] to-[#101F38] text-[#38E4FF] flex items-center justify-center border border-[#2B4875]/60 shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-display text-[#0F1E36] tracking-tight">
              Club Telemetry &amp; Performance
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-editorial italic text-slate-500 mt-1">
            Real-time analytics across Scientific Teams, Labs, Workshops, Tasks, and Laureates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#F4F7FB] border border-slate-200/90 rounded-xl">
            {(["This Month", "Semester", "Season"] as PeriodKey[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  period === p
                    ? "bg-[#182C4E] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#0F1E36]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#38E4FF]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {exportToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportToast}</span>
          </div>
          <button type="button" onClick={() => setExportToast(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SMART NAVIGATION SWITCHER (Easy & Original Navigation) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Telemetry", icon: <Activity className="w-3.5 h-3.5 text-[#38BDF8]" /> },
          { id: "teams", label: `Scientific Teams (${activeTeams.length})`, icon: <FlaskConical className="w-3.5 h-3.5 text-violet-400" /> },
          { id: "depts", label: `Departments (${departments.length})`, icon: <Building2 className="w-3.5 h-3.5 text-sky-400" /> },
          { id: "workshops", label: `Workshops & Labs (${workshops.length})`, icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> },
          { id: "tasks", label: `Tasks & Execution (${tasks.length})`, icon: <Target className="w-3.5 h-3.5 text-indigo-400" /> },
          { id: "laureates", label: "Laureates & Podium", icon: <Trophy className="w-3.5 h-3.5 text-amber-400" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as StatsViewTab)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#182C4E] text-white shadow-xs border border-[#2B4875]"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 8 EXECUTIVE VITALITY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Total Period XP */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Total XP ({period})
          </div>
          <div className="text-lg font-black text-[#0284C7] mt-0.5 tabular-nums font-display">
            {totalClubXp.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {scoringMembers.length} active members
          </div>
        </div>

        {/* Avg Attendance */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Avg Attendance
          </div>
          <div className="text-lg font-black text-emerald-600 mt-0.5 tabular-nums font-display">
            {avgAttendance}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {totalCheckins} check-ins
          </div>
        </div>

        {/* Task On-Time Rate */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Task Punctuality
          </div>
          <div className="text-lg font-black text-sky-600 mt-0.5 tabular-nums font-display">
            {avgTaskOnTime}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {completedTasks} completed
          </div>
        </div>

        {/* Workshop Fill Rate */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Seat Occupancy
          </div>
          <div className="text-lg font-black text-indigo-600 mt-0.5 tabular-nums font-display">
            {workshopFillRate}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {totalWorkshopRegistered}/{totalWorkshopCapacity} lab seats
          </div>
        </div>

        {/* Scientific Teams */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Research Teams
          </div>
          <div className="text-lg font-black text-violet-600 mt-0.5 tabular-nums font-display">
            {activeTeams.length}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Specialized labs
          </div>
        </div>

        {/* Badges Mastered */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Badges Earned
          </div>
          <div className="text-lg font-black text-amber-600 mt-0.5 tabular-nums font-display">
            {totalBadgesAwarded}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Across {badges.length} tracks
          </div>
        </div>

        {/* Proposals */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Proposals
          </div>
          <div className="text-lg font-black text-rose-600 mt-0.5 tabular-nums font-display">
            {proposals.length}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {proposalApprovalRate}% approved
          </div>
        </div>

        {/* Active Ratio */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Engagement
          </div>
          <div className="text-lg font-black text-teal-600 mt-0.5 tabular-nums font-display">
            {Math.round((scoringMembers.filter((m) => (m.xpSeason || 0) > 0).length / Math.max(1, scoringMembers.length)) * 100)}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Season active
          </div>
        </div>
      </div>

      {/* SECTION 1: SCIENTIFIC TEAMS BREAKDOWN (Restored & Elevated) */}
      {(activeTab === "all" || activeTab === "teams") && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center font-bold text-xs">
                <FlaskConical className="w-3.5 h-3.5 text-violet-600" />
              </span>
              <div>
                <h2 className="text-sm font-black font-display text-slate-900">
                  Scientific Teams &amp; Research Labs Matrix
                </h2>
                <p className="text-[11px] text-slate-500 font-editorial italic">
                  Performance across specialized scientific teams, researcher participation, and health indices.
                </p>
              </div>
            </div>

            {/* Sort pills */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <span className="text-slate-400 text-[10px] font-mono uppercase mr-1">Sort:</span>
              {(
                [
                  { key: "avg", label: "Avg XP" },
                  { key: "total", label: "Total XP" },
                  { key: "attendance", label: "Attendance" },
                  { key: "health", label: "Health" },
                ] as { key: SortOption; label: string }[]
              ).map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setTeamSortBy(s.key)}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    teamSortBy === s.key
                      ? "bg-[#182C4E] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2 px-3">Scientific Team</th>
                  <th className="py-2 px-3">Domain Focus</th>
                  <th className="py-2 px-3">Team Leader</th>
                  <th className="py-2 px-3">Members</th>
                  <th className="py-2 px-3">Avg XP</th>
                  <th className="py-2 px-3">Attendance</th>
                  <th className="py-2 px-3">Task Rate</th>
                  <th className="py-2 px-3 text-right">Health Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamRankings.map((row, idx) => (
                  <tr key={row.team.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-violet-50 text-violet-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-violet-200">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{row.team.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{row.team.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10.5px]">
                        {row.team.field || "General Science"}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {row.leader ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={row.leader.avatarUrl}
                            alt={row.leader.fullName}
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[120px]">
                            {row.leader.fullName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10.5px]">Unassigned</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 whitespace-nowrap">
                      {row.memberCount} {row.memberCount === 1 ? "member" : "members"}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                      <span className="font-mono font-bold text-[#0284C7] bg-[#F0F6FF] px-2 py-0.5 rounded border border-[#D5E3F5]">
                        {row.avgScore.toLocaleString()} XP
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                      <span className={`font-mono font-bold ${row.teamAttendance >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
                        {row.teamAttendance}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                      <span className={`font-mono font-bold ${row.teamTaskRate >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
                        {row.teamTaskRate}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#182C4E] text-white">
                        <Zap className="w-3 h-3 text-[#38E4FF]" />
                        <span>{row.healthScore}%</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: WORKSHOPS & PRACTICAL LABS TELEMETRY */}
      {(activeTab === "all" || activeTab === "workshops") && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              </span>
              <div>
                <h2 className="text-sm font-black font-display text-slate-900">
                  Workshops &amp; Practical Labs Analytics
                </h2>
                <p className="text-[11px] text-slate-500 font-editorial italic">
                  Seat capacity utilization, attendance check-in verification, and session impact.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
              <span>Verified Check-In Rate: <strong className="text-emerald-600">{workshopCheckinRate}%</strong></span>
            </div>
          </div>

          {/* 4 Mini Workshop Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[9.5px] font-mono font-bold text-slate-400 uppercase">Total Workshops</div>
              <div className="text-lg font-black text-slate-900 font-display mt-0.5">{workshops.length}</div>
              <div className="text-[10px] text-slate-500">{workshops.filter((w) => w.status === "Completed").length} completed</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[9.5px] font-mono font-bold text-slate-400 uppercase">Lab Seats Capacity</div>
              <div className="text-lg font-black text-indigo-600 font-display mt-0.5">{totalWorkshopCapacity}</div>
              <div className="text-[10px] text-slate-500">{totalWorkshopRegistered} registered</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[9.5px] font-mono font-bold text-slate-400 uppercase">Occupancy Rate</div>
              <div className="text-lg font-black text-[#0284C7] font-display mt-0.5">{workshopFillRate}%</div>
              <div className="text-[10px] text-slate-500">Overall lab fill</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[9.5px] font-mono font-bold text-slate-400 uppercase">Present Passes</div>
              <div className="text-lg font-black text-emerald-600 font-display mt-0.5">{totalCheckins}</div>
              <div className="text-[10px] text-slate-500">Scanned QR passes</div>
            </div>
          </div>

          {/* Top Workshops List */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Top Attended &amp; Highest Impact Sessions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2 px-3">Workshop Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Enrolled</th>
                    <th className="py-2 px-3 text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topWorkshops.map((w) => {
                    const present = w.attendanceRecords.filter((r) => r.status === "Present").length;
                    const enrolled = w.registeredMemberIds?.length || 0;
                    const pct = enrolled > 0 ? Math.round((present / enrolled) * 100) : 0;

                    return (
                      <tr key={w.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block text-xs">{w.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{w.id}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10.5px]">
                            {w.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {w.dateLabel || w.eventDate || "Scheduled"}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            w.status === "Completed"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                          {enrolled} / {w.capacity} seats
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-bold text-emerald-600">
                          {present} present ({pct}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 2-COLUMN SECTION: RANK DISTRIBUTION & DEPARTMENT VELOCITY */}
      {(activeTab === "all" || activeTab === "depts" || activeTab === "laureates") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN: 10-Tier Rank Progression Spectrum */}
          {(activeTab === "all" || activeTab === "laureates") && (
            <div className={`${activeTab === "all" ? "lg:col-span-5" : "lg:col-span-12"} bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-xs">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  <h2 className="text-sm font-black font-display text-slate-900">
                    10-Tier Rank Progression Spectrum
                  </h2>
                </div>
                <span className="text-[10.5px] font-mono font-bold text-slate-400">
                  {scoringMembers.length} Quantas
                </span>
              </div>

              <p className="text-xs text-slate-500 font-editorial italic">
                Distribution of club members across all 10 progression tiers from Lv. 1 Wooden to Lv. 10 Quantum Master.
              </p>

              <div className="space-y-2 pt-1">
                {rankDistribution.map((tier) => (
                  <div key={tier.level} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 min-w-0">
                        <TierInsigniaBadge level={tier.level} />
                        <span className="font-bold text-slate-800 truncate">
                          Lv. {tier.level} {tier.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                          ({tier.minXp.toLocaleString()} XP)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                        <span className="font-bold text-slate-900">{tier.count}</span>
                        <span className="text-slate-400">({tier.pct}%)</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          tier.level >= 8
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                            : tier.level >= 5
                            ? "bg-gradient-to-r from-amber-400 to-amber-500"
                            : "bg-gradient-to-r from-sky-400 to-blue-500"
                        }`}
                        style={{ width: `${Math.max(tier.count > 0 ? 4 : 0, tier.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RIGHT COLUMN: Department Velocity & Health Matrix */}
          {(activeTab === "all" || activeTab === "depts") && (
            <div className={`${activeTab === "all" ? "lg:col-span-7" : "lg:col-span-12"} bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0284C7]" />
                  <h2 className="text-sm font-black font-display text-slate-900">
                    Department Velocity &amp; Health Matrix
                  </h2>
                </div>

                {/* Sort pills */}
                <div className="flex items-center gap-1 text-[11px] font-bold">
                  <span className="text-slate-400 text-[10px] font-mono uppercase mr-1">Sort:</span>
                  {(
                    [
                      { key: "avg", label: "Avg XP" },
                      { key: "total", label: "Total XP" },
                      { key: "attendance", label: "Attendance" },
                      { key: "health", label: "Health" },
                    ] as { key: SortOption; label: string }[]
                  ).map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setDeptSortBy(s.key)}
                      className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                        deptSortBy === s.key
                          ? "bg-[#182C4E] text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2 px-3">Department</th>
                      <th className="py-2 px-3">Members</th>
                      <th className="py-2 px-3">Avg XP</th>
                      <th className="py-2 px-3">Attendance</th>
                      <th className="py-2 px-3">Task Rate</th>
                      <th className="py-2 px-3 text-right">Health Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deptRankings.map((row, idx) => (
                      <tr key={row.dept.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-[#F0F6FF] text-[#182C4E] font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">{row.dept.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{row.dept.shortName}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 whitespace-nowrap">
                          {row.memberCount}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                          <span className="font-mono font-bold text-[#0284C7] bg-[#F0F6FF] px-2 py-0.5 rounded border border-[#D5E3F5]">
                            {row.avgScore.toLocaleString()} XP
                          </span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                          <span className={`font-mono font-bold ${row.deptAttendance >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
                            {row.deptAttendance}%
                          </span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                          <span className={`font-mono font-bold ${row.deptTaskOnTime >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
                            {row.deptTaskOnTime}%
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-slate-900 text-white">
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>{row.healthScore}%</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: OPERATIONAL TASKS & PROPOSALS TELEMETRY */}
      {(activeTab === "all" || activeTab === "tasks") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tasks Execution Velocity */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-black font-display text-slate-900">
                  Tasks Execution Velocity &amp; Delivery
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-sky-600">{taskCompletionRate}% Complete</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
                <div className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Completed</div>
                <div className="text-lg font-black text-emerald-700 font-display mt-0.5">{completedTasks}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200/80">
                <div className="text-[10px] font-mono font-bold text-sky-800 uppercase">In Progress</div>
                <div className="text-lg font-black text-sky-700 font-display mt-0.5">{pendingTasks}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80">
                <div className="text-[10px] font-mono font-bold text-amber-800 uppercase">Late / Overdue</div>
                <div className="text-lg font-black text-amber-700 font-display mt-0.5">{overdueTasks}</div>
              </div>
            </div>

            {/* Task Velocity Bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${Math.round((completedTasks / Math.max(1, tasks.length)) * 100)}%` }}
                title="Completed"
              />
              <div
                className="bg-sky-400 h-full transition-all"
                style={{ width: `${Math.round((pendingTasks / Math.max(1, tasks.length)) * 100)}%` }}
                title="In Progress"
              />
              <div
                className="bg-amber-500 h-full transition-all"
                style={{ width: `${Math.round((overdueTasks / Math.max(1, tasks.length)) * 100)}%` }}
                title="Late"
              />
            </div>
          </div>

          {/* Proposals & Governance Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Vote className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-black font-display text-slate-900">
                  Community Proposals &amp; Initiatives
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-violet-600">{proposals.length} Total</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-200/80">
                <div className="text-[10px] font-mono font-bold text-violet-800 uppercase">Approved</div>
                <div className="text-lg font-black text-violet-700 font-display mt-0.5">{approvedProposals}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80">
                <div className="text-[10px] font-mono font-bold text-blue-800 uppercase">Under Review</div>
                <div className="text-lg font-black text-blue-700 font-display mt-0.5">
                  {proposals.filter((p) => p.state === "Under Review" || p.state === "Submitted").length}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-mono font-bold text-slate-600 uppercase">Approval Rate</div>
                <div className="text-lg font-black text-slate-800 font-display mt-0.5">{proposalApprovalRate}%</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-editorial italic pt-1">
              Member-driven innovation and research proposals evaluated under the 2/3 executive majority standard.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 5: TOP LAUREATES LEADERBOARD PODIUM */}
      {(activeTab === "all" || activeTab === "laureates") && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-black font-display text-slate-900">
                Top 10 Laureates &amp; Emerging Contributors ({period})
              </h2>
            </div>

            {/* Dedicated Separation Toggle: Active Members vs Alumni Laureates */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setLaureateTab("members")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  laureateTab === "members"
                    ? "bg-white text-[#0F1E36] shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Active Members ({activeScoringMembers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setLaureateTab("alumni")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  laureateTab === "alumni"
                    ? "bg-white text-indigo-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Alumni Laureates ({alumniScoringMembers.length})</span>
              </button>
            </div>
          </div>

          {/* Podium Top 3 */}
          {currentTopMembers.length >= 3 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Rank 2 (Silver) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col items-center text-center relative overflow-hidden order-2 sm:order-1">
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[9.5px] font-bold bg-slate-200 text-slate-800 shadow-2xs">
                  <Medal className="w-3 h-3 text-slate-600" />
                  <span>2nd Place · Silver</span>
                </span>
                <img
                  src={getEffectiveMemberAvatar(currentTopMembers[1])}
                  alt={currentTopMembers[1].fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 mt-5 shadow-xs"
                />
                <Link
                  href={`/admin/members/${currentTopMembers[1].id}`}
                  className="font-bold text-slate-900 text-sm hover:text-[#0284C7] mt-2 block"
                >
                  {currentTopMembers[1].fullName}
                </Link>
                <span className="font-mono text-[10px] text-slate-400">{currentTopMembers[1].quanterId}</span>
                <div className="mt-2 text-sm font-black text-[#0284C7] font-mono">
                  +{getMemberPeriodScore(currentTopMembers[1]).toLocaleString()} XP
                </div>
              </div>

              {/* Rank 1 (Gold) */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/80 to-white border-2 border-amber-300 flex flex-col items-center text-center relative overflow-hidden order-1 sm:order-2 shadow-sm">
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-400 text-amber-950 shadow-2xs">
                  <Trophy className="w-3 h-3 text-amber-950" />
                  <span>1st Place · Gold Laureate</span>
                </span>
                <img
                  src={getEffectiveMemberAvatar(currentTopMembers[0])}
                  alt={currentTopMembers[0].fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 mt-5 shadow-md"
                />
                <Link
                  href={`/admin/members/${currentTopMembers[0].id}`}
                  className="font-black text-slate-900 text-base hover:text-[#0284C7] mt-2 block"
                >
                  {currentTopMembers[0].fullName}
                </Link>
                <span className="font-mono text-xs text-slate-500 font-semibold">{currentTopMembers[0].quanterId}</span>
                <div className="mt-2 text-base font-black text-amber-600 font-mono">
                  +{getMemberPeriodScore(currentTopMembers[0]).toLocaleString()} XP
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col items-center text-center relative overflow-hidden order-3">
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[9.5px] font-bold bg-amber-100 text-amber-900 border border-amber-200/60 shadow-2xs">
                  <Award className="w-3 h-3 text-amber-700" />
                  <span>3rd Place · Bronze</span>
                </span>
                <img
                  src={getEffectiveMemberAvatar(currentTopMembers[2])}
                  alt={currentTopMembers[2].fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-200 mt-5 shadow-xs"
                />
                <Link
                  href={`/admin/members/${currentTopMembers[2].id}`}
                  className="font-bold text-slate-900 text-sm hover:text-[#0284C7] mt-2 block"
                >
                  {currentTopMembers[2].fullName}
                </Link>
                <span className="font-mono text-[10px] text-slate-400">{currentTopMembers[2].quanterId}</span>
                <div className="mt-2 text-sm font-black text-[#0284C7] font-mono">
                  +{getMemberPeriodScore(currentTopMembers[2]).toLocaleString()} XP
                </div>
              </div>
            </div>
          ) : currentTopMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentTopMembers.map((m, idx) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <img
                    src={getEffectiveMemberAvatar(m)}
                    alt={m.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/members/${m.id}`} className="font-bold text-slate-900 text-sm hover:text-[#0284C7] block truncate">
                      {m.fullName}
                    </Link>
                    <span className="font-mono text-[10px] text-slate-400">{m.quanterId}</span>
                  </div>
                  <div className="text-sm font-black text-[#0284C7] font-mono shrink-0">
                    +{getMemberPeriodScore(m).toLocaleString()} XP
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              No {laureateTab === "alumni" ? "alumni laureates" : "active members"} currently recorded with verified period scores.
            </div>
          )}

          {/* Table Roster Ranks 4 to 10 */}
          {currentTopMembers.length > 3 && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2 px-3">Rank</th>
                    <th className="py-2 px-3">Member</th>
                    <th className="py-2 px-3">Quanter ID</th>
                    <th className="py-2 px-3">Department</th>
                    <th className="py-2 px-3">Attendance</th>
                    <th className="py-2 px-3">Badges</th>
                    <th className="py-2 px-3 text-right">Period XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentTopMembers.slice(3).map((m, idx) => {
                    const dept = departments.find((d) => d.id === m.departmentId);

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2 px-3 font-mono font-bold text-slate-500">
                          #{idx + 4}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={getEffectiveMemberAvatar(m)}
                              alt={m.fullName}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <Link
                              href={`/admin/members/${m.id}`}
                              className="font-bold text-slate-900 hover:text-[#0284C7] truncate"
                            >
                              {m.fullName}
                            </Link>
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500">{m.quanterId}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {dept ? dept.shortName : "General"}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">
                          {m.attendanceRate}%
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">
                          {m.badgeIds?.length || 0}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#0284C7]">
                          +{getMemberPeriodScore(m).toLocaleString()} XP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
