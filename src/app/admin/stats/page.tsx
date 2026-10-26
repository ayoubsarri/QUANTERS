"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

type PeriodKey = "This Month" | "Semester" | "Season";

export default function AdminStatsPage() {
  const members = useQuantersStore((s) => s.members);
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);
  const workshops = useQuantersStore((s) => s.workshops);
  const tasks = useQuantersStore((s) => s.tasks);
  const badges = useQuantersStore((s) => s.badges);

  const [period, setPeriod] = useState<PeriodKey>("Season");
  const [deptSortBy, setDeptSortBy] = useState<"avg" | "total">("avg");
  const [exportToast, setExportToast] = useState<string | null>(null);

  const getMemberPeriodScore = (m: (typeof members)[number]) => {
    if (period === "This Month") return m.xpMonth;
    return m.xpSeason;
  };

  const totalClubXp = members.reduce((sum, m) => sum + getMemberPeriodScore(m), 0);
  const totalCheckins = workshops.reduce(
    (sum, w) => sum + w.attendanceRecords.filter((r) => r.status === "Present").length,
    0
  );
  const avgAttendance = Math.round(
    members.reduce((s, m) => s + m.attendanceRate, 0) / Math.max(1, members.length)
  );
  const avgTaskOnTime = Math.round(
    members.reduce((s, m) => s + m.onTimeTaskRate, 0) / Math.max(1, members.length)
  );
  const totalBadgesAwarded = badges.reduce((sum, b) => sum + b.awardedCount, 0);

  // Department Analytics
  const deptRankings = departments
    .map((dept) => {
      const deptMembers = members.filter((m) => m.departmentId === dept.id);
      const count = deptMembers.length || 1;
      const totalScore = deptMembers.reduce((s, m) => s + getMemberPeriodScore(m), 0);
      const avgScore = Math.round(totalScore / count);
      return {
        dept,
        memberCount: deptMembers.length,
        totalScore,
        avgScore,
      };
    })
    .sort((a, b) => (deptSortBy === "avg" ? b.avgScore - a.avgScore : b.totalScore - a.totalScore));

  const maxScore = Math.max(1, ...deptRankings.map((d) => (deptSortBy === "avg" ? d.avgScore : d.totalScore)));

  // Team Analytics
  const teamRankings = teams
    .filter((t) => !t.archived)
    .map((team) => {
      const teamMembers = members.filter(
        (m) => m.teamId === team.id || team.memberIds.includes(m.id)
      );
      const count = Math.max(1, team.memberIds.length);
      const totalScore = teamMembers.reduce((s, m) => s + getMemberPeriodScore(m), 0);
      const avgScore = Math.round(totalScore / count);
      return {
        team,
        memberCount: team.memberIds.length,
        totalScore,
        avgScore,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  // Top Contributors
  const topMembers = [...members]
    .sort((a, b) => getMemberPeriodScore(b) - getMemberPeriodScore(a))
    .slice(0, 10);

  const handleExportCsv = () => {
    const headers = ["Rank,QuanterID,FullName,Department,PeriodXP,TotalXP,AttendanceRate\n"];
    const rows = topMembers.map(
      (m, idx) =>
        `${idx + 1},${m.quanterId},"${m.fullName}",${m.departmentId},${getMemberPeriodScore(m)},${m.xpTotal},${m.attendanceRate}%`
    );
    const blob = new Blob([headers.join("") + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QUANTERS_Stats_${period}.csv`;
    link.click();
    setExportToast("Exported statistics CSV");
    setTimeout(() => setExportToast(null), 3000);
  };

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
      {/* Top Header — Member App Editorial Style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
            CLUB TELEMETRY &amp; FAIRNESS METRICS
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
            Platform Statistics
          </h1>
          <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
            Key telemetry, department engagement, and member leaderboards.
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
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportToast}</span>
          </div>
          <button type="button" onClick={() => setExportToast(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Total XP ({period})
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0284C7] mt-1 tabular-nums">
            {totalClubXp.toLocaleString()} XP
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Across {members.length} members
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Avg Attendance
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 tabular-nums">
            {avgAttendance}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {totalCheckins} verified check-ins
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            On-Time Task Delivery
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0F1E36] mt-1 tabular-nums">
            {avgTaskOnTime}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {tasks.length} total assignments
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Credentials Issued
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0284C7] mt-1 tabular-nums">
            {totalBadgesAwarded}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {badges.length} active badges
          </div>
        </div>
      </div>

      {/* Two-Column Analytics: Departments & Scientific Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Departments Performance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/90">
            <h2 className="text-sm font-extrabold text-[#0F1E36] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0284C7]" />
              <span>Department Engagement</span>
            </h2>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setDeptSortBy("avg")}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  deptSortBy === "avg"
                    ? "bg-[#182C4E] text-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Avg Score
              </button>
              <button
                type="button"
                onClick={() => setDeptSortBy("total")}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  deptSortBy === "total"
                    ? "bg-[#182C4E] text-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Total XP
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {deptRankings.map((item, idx) => {
              const val = deptSortBy === "avg" ? item.avgScore : item.totalScore;
              const pct = Math.min(100, Math.round((val / maxScore) * 100));

              return (
                <div key={item.dept.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {idx + 1}. {item.dept.name}
                    </span>
                    <span className="font-mono font-bold text-slate-600 tabular-nums">
                      {val.toLocaleString()} {deptSortBy === "avg" ? "avg XP" : "XP"} ({item.memberCount} members)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F4F7FB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1D63EB] to-[#29D2FF] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scientific Teams Activity */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/90">
            <h2 className="text-sm font-extrabold text-[#0F1E36] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0284C7]" />
              <span>Scientific Teams Ranking</span>
            </h2>
            <span className="font-mono text-xs text-slate-400 font-bold">
              {teamRankings.length} Teams
            </span>
          </div>

          <div className="divide-y divide-[#E2EDF8] max-h-72 overflow-y-auto">
            {teamRankings.map((t, idx) => (
              <div key={t.team.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#0F1E36]">
                    {idx + 1}. {t.team.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {t.team.field} · {t.memberCount} members
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#D8F3E5] text-[#0D7A49] font-mono text-[10.5px] font-bold tabular-nums">
                    +{t.totalScore} XP
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                    {t.avgScore} avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Contributors Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-3.5 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Top 10 Contributors · {period}
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Ranked by earned XP</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFD] border-b border-slate-200/90 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4 text-center">Tasks On-Time</th>
                <th className="py-3 px-4 text-right">Period XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EDF8]">
              {topMembers.map((m, idx) => {
                const dept = departments.find((d) => d.id === m.departmentId);
                const score = getMemberPeriodScore(m);

                return (
                  <tr key={m.id} className="hover:bg-[#F8FAFD] transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.avatarUrl}
                          alt={m.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200/90 shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-[#0F1E36]">{m.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{m.quanterId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {dept?.name || "Unassigned"}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {m.attendanceRate}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {m.onTimeTaskRate}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#D8F3E5] text-[#0D7A49] font-mono text-xs font-bold tabular-nums">
                        +{score} XP
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
