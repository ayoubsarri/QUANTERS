"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  FileJson,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { AuditLogEntry } from "@/lib/types/erp";

const ALL_AUDIT_CATEGORIES: AuditLogEntry["actionCategory"][] = [
  "Status Change",
  "Department / Team Move",
  "Points Entry / Reversal",
  "Attendance Correction",
  "Badge Award / Revoke",
  "Task Validation",
  "Proposal Decision",
  "Message Sent",
  "Access Grant / Revoke",
  "Settings Changed",
  "Registration Switch",
  "Data Export",
];

type DatePreset = "All Dates" | "Today" | "Last 7 Days" | "This Month" | "Custom Range";

export default function AdminAuditPage() {
  const auditLogs = useQuantersStore((s) => s.auditLogs);

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [datePreset, setDatePreset] = useState<DatePreset>("All Dates");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [banner, setBanner] = useState<string | null>(null);

  const handlePresetSelect = (preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (preset === "All Dates") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "Today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "Last 7 Days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      setStartDate(sevenDaysAgo.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === "This Month") {
      const ym = todayStr.slice(0, 7);
      setStartDate(`${ym}-01`);
      setEndDate(`${ym}-31`);
    }
  };

  const filtered = auditLogs.filter((log) => {
    const matchesCategory =
      categoryFilter === "All" || log.actionCategory === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.actorName.toLowerCase().includes(q) ||
      log.actorRole.toLowerCase().includes(q) ||
      log.targetLabel.toLowerCase().includes(q) ||
      log.reason.toLowerCase().includes(q) ||
      log.oldValue.toLowerCase().includes(q) ||
      log.newValue.toLowerCase().includes(q);

    const logDate = log.timestamp.slice(0, 10);
    const matchesStart = !startDate || logDate >= startDate;
    const matchesEnd = !endDate || logDate <= endDate;

    return matchesCategory && matchesSearch && matchesStart && matchesEnd;
  });

  const handleExportJson = () => {
    const fileName = `QUANTERS_Audit_Log_${startDate || "all"}_to_${endDate || "now"}.json`;
    const payload = {
      exportedAt: new Date().toISOString(),
      dateRange: {
        preset: datePreset,
        from: startDate || "all",
        to: endDate || "now",
      },
      categoryFilter,
      searchQuery: searchQuery || undefined,
      totalRecords: filtered.length,
      records: filtered,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    setBanner(`Exported ${filtered.length} audit record(s) to ${fileName}`);
  };

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto">
      {/* Header — Member App Editorial Style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
            IMMUTABLE GOVERNANCE LOG
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
            Audit Trail
          </h1>
          <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
            Append-only historical records of administrative actions, approvals, and date-scoped JSON exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-600 bg-[#F4F7FB] px-3 py-2 rounded-xl border border-slate-200/90 tabular-nums">
            {filtered.length} / {auditLogs.length} Records
          </span>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Export JSON ({filtered.length})</span>
            <Download className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </button>
        </div>
      </div>

      {banner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{banner}</span>
          </div>
          <button type="button" onClick={() => setBanner(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search, Category & Date Range Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        {/* Top Row: Search + Category Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actor, target, reason, or action..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl focus:outline-none focus:border-[#182C4E]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter Category"
            className="px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-700 font-semibold"
          >
            <option value="All">All Categories</option>
            {ALL_AUDIT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Bottom Row: Date Range Presets + From/To Date Pickers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Date Scope:</span>
            </span>
            {(
              [
                "All Dates",
                "Today",
                "Last 7 Days",
                "This Month",
                "Custom Range",
              ] as DatePreset[]
            ).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  datePreset === preset
                    ? "bg-[#182C4E] text-white shadow-2xs"
                    : "bg-[#F4F7FB] text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset("Custom Range");
                }}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F4F7FB] border border-slate-200/90 rounded-lg text-slate-700 focus:outline-none focus:border-[#182C4E]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset("Custom Range");
                }}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F4F7FB] border border-slate-200/90 rounded-lg text-slate-700 focus:outline-none focus:border-[#182C4E]"
              />
            </div>

            {(startDate || endDate || categoryFilter !== "All" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setDatePreset("All Dates");
                  setCategoryFilter("All");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold hover:bg-rose-100 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFD] border-b border-slate-200/90 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Change</th>
                <th className="py-3 px-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EDF8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-xs font-semibold text-slate-400">
                    No audit log entries match the selected date range or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFD] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#0F1E36]">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.actorRole}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F0F6FF] text-[#0284C7]">
                        {log.actionCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.targetLabel}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-slate-400 line-through truncate max-w-[100px]">
                          {log.oldValue || "None"}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-emerald-700 font-bold truncate max-w-[140px]">
                          {log.newValue}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic max-w-xs truncate">
                      &ldquo;{log.reason}&rdquo;
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
