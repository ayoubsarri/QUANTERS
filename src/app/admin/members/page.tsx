"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  Filter,
  GraduationCap,
  Link2,
  Search,
  UserX,
  Users,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { DayOfWeek, Member, MemberStatus, TimeSlot } from "@/lib/types/erp";
import { copyToClipboardReliable } from "@/lib/utils/memberKeyboardJump";

const ACTIVE_STATUSES: MemberStatus[] = ["Trainee", "Active", "Inactive", "Suspended"];
const FORMER_STATUSES: MemberStatus[] = ["Resigned", "Removed"];
const ALUMNI_STATUSES: MemberStatus[] = ["Alumni"];

const ACADEMIC_YEARS: Member["academicYear"][] = [
  "L1",
  "L2",
  "L3",
  "M1",
  "M2",
  "Doctorate",
  "Graduated",
];

const DAYS: DayOfWeek[] = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
const SLOTS: TimeSlot[] = ["Morning", "Afternoon", "Evening"];

function AdminMembersContent() {
  const { members, departments, teams, reactivateFormerMember } = useQuantersStore();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "FORMER" | "ALUMNI">("ACTIVE");

  // Filters
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [freeDay, setFreeDay] = useState<DayOfWeek | "ALL">("ALL");
  const [freeSlot, setFreeSlot] = useState<TimeSlot | "ALL">("ALL");

  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [formLinkCopied, setFormLinkCopied] = useState(false);
  const [emailsCopied, setEmailsCopied] = useState(false);

  // Sync URL query parameters (tab, dept, team, status, day, slot)
  useEffect(() => {
    const params =
      searchParams && searchParams.toString()
        ? searchParams
        : typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;

    if (!params) return;

    const tabParam = params.get("tab")?.toLowerCase();
    const deptParam = params.get("dept");
    const teamParam = params.get("team");
    const statusParam = params.get("status") as MemberStatus | null;
    const dayParam = params.get("day") as DayOfWeek | null;
    const slotParam = params.get("slot") as TimeSlot | null;

    if (tabParam === "former") {
      if (typeof window !== "undefined") window.location.href = "/admin/former-members";
      return;
    } else if (tabParam === "alumni") {
      if (typeof window !== "undefined") window.location.href = "/admin/alumni";
      return;
    } else {
      setActiveTab("ACTIVE");
      setStatusFilter("ALL");
    }

    if (deptParam) {
      setDeptFilter(deptParam);
      if (!tabParam) setActiveTab("ACTIVE");
    }
    if (teamParam) {
      setTeamFilter(teamParam);
      if (!tabParam) setActiveTab("ACTIVE");
    }
    if (statusParam) {
      setStatusFilter(statusParam);
      if (ALUMNI_STATUSES.includes(statusParam)) {
        setActiveTab("ALUMNI");
      } else if (FORMER_STATUSES.includes(statusParam)) {
        setActiveTab("FORMER");
      } else {
        setActiveTab("ACTIVE");
      }
    }
    if (dayParam && DAYS.includes(dayParam)) {
      setFreeDay(dayParam);
      if (!tabParam) setActiveTab("ACTIVE");
    }
    if (slotParam && SLOTS.includes(slotParam)) {
      setFreeSlot(slotParam);
      if (!tabParam) setActiveTab("ACTIVE");
    }
  }, [searchParams]);

  // Split Active vs Former vs Alumni
  const activeRoster = useMemo(
    () => members.filter((m) => ACTIVE_STATUSES.includes(m.status)),
    [members]
  );
  const formerRoster = useMemo(
    () => members.filter((m) => FORMER_STATUSES.includes(m.status)),
    [members]
  );
  const alumniRoster = useMemo(
    () => members.filter((m) => ALUMNI_STATUSES.includes(m.status)),
    [members]
  );

  const displayedList = useMemo(() => {
    const source =
      activeTab === "ACTIVE"
        ? activeRoster
        : activeTab === "FORMER"
        ? formerRoster
        : alumniRoster;

    return source.filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.quanterId.toLowerCase().includes(q) ||
          m.major.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (deptFilter !== "ALL" && m.departmentId !== deptFilter) return false;
      if (teamFilter !== "ALL" && m.teamId !== teamFilter) return false;
      if (yearFilter !== "ALL" && m.academicYear !== yearFilter) return false;
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;

      if (freeDay !== "ALL") {
        const daySlots = m.availability?.[freeDay] || [];
        if (freeSlot !== "ALL") {
          if (!daySlots.includes(freeSlot)) return false;
        } else if (daySlots.length === 0) {
          return false;
        }
      }

      return true;
    });
  }, [
    activeTab,
    activeRoster,
    formerRoster,
    alumniRoster,
    search,
    deptFilter,
    teamFilter,
    yearFilter,
    statusFilter,
    freeDay,
    freeSlot,
  ]);

  const clearAllFilters = () => {
    setSearch("");
    setDeptFilter("ALL");
    setTeamFilter("ALL");
    setYearFilter("ALL");
    setStatusFilter("ALL");
    setFreeDay("ALL");
    setFreeSlot("ALL");
    if (typeof window !== "undefined") {
      const nextUrl =
        activeTab === "FORMER"
          ? "/admin/members?tab=former"
          : activeTab === "ALUMNI"
          ? "/admin/members?tab=alumni"
          : "/admin/members";
      window.history.replaceState(null, "", nextUrl);
    }
  };

  const hasActiveFilters =
    deptFilter !== "ALL" ||
    teamFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    freeDay !== "ALL" ||
    yearFilter !== "ALL";

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (deptFilter !== "ALL") {
      const d = departments.find((item) => item.id === deptFilter);
      labels.push(d ? d.name : deptFilter);
    }
    if (teamFilter !== "ALL") {
      const t = teams.find((item) => item.id === teamFilter);
      labels.push(t ? t.name : teamFilter);
    }
    if (statusFilter !== "ALL") {
      labels.push(`Status: ${statusFilter}`);
    }
    if (yearFilter !== "ALL") {
      labels.push(`Year: ${yearFilter}`);
    }
    if (freeDay !== "ALL") {
      labels.push(
        freeSlot !== "ALL" ? `Free: ${freeDay} (${freeSlot})` : `Free: ${freeDay}`
      );
    }
    return labels;
  }, [deptFilter, teamFilter, statusFilter, yearFilter, freeDay, freeSlot, departments, teams]);

  const handleCopyEmails = async () => {
    const emails = displayedList.map((m) => m.email).join(", ");
    await copyToClipboardReliable(emails);
    setEmailsCopied(true);
    setCopiedToast(`Copied ${displayedList.length} member emails to clipboard`);
    setTimeout(() => {
      setEmailsCopied(false);
      setCopiedToast(null);
    }, 3500);
  };

  const handleCopyRegistrationLink = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/onboarding`
        : "http://localhost:3000/onboarding";
    await copyToClipboardReliable(url);
    setFormLinkCopied(true);
    setCopiedToast(`Registration Form Link copied: ${url}`);
    setTimeout(() => {
      setFormLinkCopied(false);
      setCopiedToast(null);
    }, 3500);
  };

  const getStatusConfig = (status: MemberStatus) => {
    switch (status) {
      case "Active":
        return {
          pill: "bg-emerald-50 text-emerald-700 border border-emerald-200/90",
          dot: "bg-emerald-500",
        };
      case "Trainee":
        return {
          pill: "bg-sky-50 text-sky-700 border border-sky-200/90",
          dot: "bg-sky-500",
        };
      case "Inactive":
        return {
          pill: "bg-amber-50 text-amber-700 border border-amber-200/90",
          dot: "bg-amber-500",
        };
      case "Suspended":
        return {
          pill: "bg-rose-50 text-rose-700 border border-rose-200/90",
          dot: "bg-rose-500",
        };
      case "Alumni":
        return {
          pill: "bg-indigo-50 text-indigo-700 border border-indigo-200/90",
          dot: "bg-indigo-500",
        };
      case "Resigned":
        return {
          pill: "bg-slate-100 text-slate-600 border border-slate-200",
          dot: "bg-slate-400",
        };
      case "Removed":
        return {
          pill: "bg-rose-50 text-rose-700 border border-rose-200",
          dot: "bg-rose-500",
        };
      default:
        return {
          pill: "bg-slate-100 text-slate-600 border border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const currentTabStatuses =
    activeTab === "ACTIVE"
      ? ACTIVE_STATUSES
      : activeTab === "FORMER"
      ? FORMER_STATUSES
      : ALUMNI_STATUSES;

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
      {/* Top Header & Actions — Member App Editorial Style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
            PEOPLE &amp; ROSTER · {displayedList.length} RECORDS
          </span>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
              {activeTab === "FORMER"
                ? "Former Members Directory"
                : activeTab === "ALUMNI"
                ? "Alumni Honors Directory"
                : "Members Directory"}
            </h1>
          </div>
          <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
            {activeTab === "FORMER"
              ? "Archived HR records of resigned and removed members with reactivation controls."
              : activeTab === "ALUMNI"
              ? "Graduated QUANTA alumni laureates, class years, and career records."
              : "Overview and records of active club members and trainees."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {copiedToast && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{copiedToast}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyRegistrationLink}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              formLinkCopied
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white"
            }`}
          >
            {formLinkCopied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Form Link Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-[#38E4FF]" />
                <span>Copy Form Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyEmails}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              emailsCopied
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white"
            }`}
          >
            {emailsCopied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Emails Copied ({displayedList.length})</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="w-3.5 h-3.5" />
                <span>Copy Emails</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation: Active & Trainees | Dedicated Former Members | Dedicated Alumni */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/90 pb-1">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#182C4E] text-white shadow-sm">
          <Users className="w-3.5 h-3.5" />
          <span>Enrolled Members ({activeRoster.length})</span>
        </span>

        <Link
          href="/admin/former-members"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-white text-slate-600 hover:text-[#0F1E36] hover:bg-slate-50 border border-slate-200/90 transition shadow-xs"
        >
          <UserX className="w-3.5 h-3.5 text-slate-400" />
          <span>Former Members ({formerRoster.length}) →</span>
        </Link>

        <Link
          href="/admin/alumni"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-white text-slate-600 hover:text-[#0F1E36] hover:bg-slate-50 border border-slate-200/90 transition shadow-xs"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
          <span>Alumni Network ({alumniRoster.length}) →</span>
        </Link>
      </div>

      {/* Filter Strip */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-sm flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or major..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl focus:outline-none focus:border-[#182C4E]"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          aria-label="Department Filter"
          className="px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-700"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          aria-label="Scientific Team Filter"
          className="px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-700"
        >
          <option value="ALL">All Scientific Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {currentTabStatuses.length > 1 && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Status Filter"
            className="px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            {currentTabStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        )}

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          aria-label="Academic Year Filter"
          className="px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-700"
        >
          <option value="ALL">All Years</option>
          {ACADEMIC_YEARS.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        {activeTab === "ACTIVE" && (
          <select
            value={freeDay}
            onChange={(e) => setFreeDay(e.target.value as DayOfWeek | "ALL")}
            aria-label="Free Day Filter"
            className="px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-700"
          >
            <option value="ALL">Any Day</option>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        )}

        {activeTab === "ACTIVE" && freeDay !== "ALL" && (
          <select
            value={freeSlot}
            onChange={(e) => setFreeSlot(e.target.value as TimeSlot | "ALL")}
            aria-label="Free Slot Filter"
            className="px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-700"
          >
            <option value="ALL">All Slots</option>
            {SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={clearAllFilters}
          className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Active Filter Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#EBF3FF] border border-[#182C4E]/25 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-extrabold text-[#0B357D]">
              <Filter className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Filtered by:</span>
            </span>
            {activeFilterLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-white text-[#0284C7] font-bold border border-[#182C4E]/20 shadow-2xs"
              >
                {label}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}

      {/* Main Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-[#F8FAFD] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Department</th>
                {activeTab === "FORMER" ? (
                  <>
                    <th className="py-3 px-3">Exit Reason &amp; Record</th>
                    <th className="py-3 px-3 text-center">Exit Date</th>
                  </>
                ) : activeTab === "ALUMNI" ? (
                  <>
                    <th className="py-3 px-3">Graduation &amp; Position</th>
                    <th className="py-3 px-3 text-center">Class Year</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-3">Scientific Team</th>
                    <th className="py-3 px-3 text-center">Score / Health</th>
                  </>
                )}
                <th className="py-3 px-3 text-center">Points</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EDF8] text-xs">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No records match the selected filters.
                  </td>
                </tr>
              ) : (
                displayedList.map((m) => {
                  const dept = departments.find((d) => d.id === m.departmentId);
                  const team = teams.find((t) => t.id === m.teamId);
                  const statusCfg = getStatusConfig(m.status);

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#F8FAFD] transition-colors group"
                    >
                      {/* Member Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200/90 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-extrabold text-[#0F1E36] truncate">
                              {m.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {m.quanterId} · {m.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusCfg.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                          <span>{m.status}</span>
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {dept?.name || "Unassigned"}
                      </td>

                      {activeTab === "FORMER" ? (
                        <>
                          <td className="py-3 px-3 text-slate-600">
                            <div className="font-medium text-slate-700 line-clamp-1">
                              {m.resignationReason || m.removalReason || "Status transitioned"}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {m.resignationManagerName
                                ? `Recorded by ${m.resignationManagerName}`
                                : m.removalDecisionRef
                                ? `Ref: ${m.removalDecisionRef}`
                                : "HR Record"}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600">
                            {m.statusSince || "—"}
                          </td>
                        </>
                      ) : activeTab === "ALUMNI" ? (
                        <>
                          <td className="py-3 px-3 text-slate-600">
                            <div className="font-semibold text-[#0F1E36]">
                              {m.alumniPosition || m.major}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {team?.name || m.major}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono text-[11px] font-bold">
                              Class of {m.graduationYear || "2026"}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Scientific Team */}
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {team?.name || "—"}
                          </td>

                          {/* Health / Attendance */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-bold text-slate-700 tabular-nums">
                              {m.healthScore}%
                            </span>
                          </td>
                        </>
                      )}

                      {/* Points */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50/90 text-emerald-700 border border-emerald-200/80 font-mono text-[11px] font-semibold tabular-nums whitespace-nowrap">
                          +{m.xpTotal} XP
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {activeTab === "ACTIVE" || activeTab === "ALUMNI" ? (
                          <Link
                            href={`/admin/members/${m.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#182C4E] text-slate-700 hover:text-white text-xs font-bold transition"
                          >
                            <span>{activeTab === "ALUMNI" ? "Alumni File" : "Manage"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                reactivateFormerMember(
                                  m.id,
                                  "Active",
                                  "Reactivated by admin"
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-bold transition cursor-pointer"
                            >
                              Reactivate
                            </button>
                            <Link
                              href={`/admin/members/${m.id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                            >
                              Details
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminMembersPage() {
  return (
    <Suspense fallback={null}>
      <AdminMembersContent />
    </Suspense>
  );
}
