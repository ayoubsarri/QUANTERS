"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  UserX,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  ClipboardCopy,
  CheckCircle2,
  Filter,
  Trash2,
  Archive,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { Member, MemberStatus } from "@/lib/types/erp";
import { copyToClipboardReliable } from "@/lib/utils/memberKeyboardJump";

export default function AdminFormerMembersPage() {
  const { members, departments, teams, settings, reactivateFormerMember, deleteMember } = useQuantersStore();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "Resigned" | "Removed" | "Archived">("ALL");
  const [reactivatingMember, setReactivatingMember] = useState<Member | null>(null);
  const [purgingMember, setPurgingMember] = useState<Member | null>(null);
  const [purgeReason, setPurgeReason] = useState("");
  const [reactivateStatus, setReactivateStatus] = useState<"Active" | "Trainee">("Active");
  const [targetDeptId, setTargetDeptId] = useState("");
  const [targetTeamId, setTargetTeamId] = useState("");
  const [reactivateReason, setReactivateReason] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReactivatingMember(null);
        setPurgingMember(null);
      }
    };
    if (reactivatingMember || purgingMember) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [reactivatingMember, purgingMember]);

  const formerMembers = useMemo(() => {
    return members.filter((m) => m.status === "Resigned" || m.status === "Removed");
  }, [members]);

  const filteredMembers = useMemo(() => {
    return formerMembers.filter((m) => {
      if (filterType !== "ALL" && m.status !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.fullName.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesId = m.quanterId.toLowerCase().includes(q);
        const matchesReason = (m.resignationReason || m.removalReason || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId && !matchesReason) return false;
      }
      return true;
    });
  }, [formerMembers, filterType, search]);

  const resignedCount = formerMembers.filter((m) => m.status === "Resigned").length;
  const removedCount = formerMembers.filter((m) => m.status === "Removed").length;

  const handleOpenReactivate = (m: Member) => {
    setReactivatingMember(m);
    setReactivateStatus("Active");
    setTargetDeptId(m.departmentId || departments[0]?.id || "");
    setTargetTeamId(m.teamId || "");
    setReactivateReason("");
  };

  const handleConfirmReactivate = () => {
    if (!reactivatingMember || !targetDeptId || !reactivateReason.trim()) return;
    const deptName = departments.find((d) => d.id === targetDeptId)?.shortName || "Department";
    reactivateFormerMember(
      reactivatingMember.id,
      reactivateStatus,
      `Reactivated to ${deptName}: ${reactivateReason.trim()}`,
      targetDeptId,
      targetTeamId
    );
    setToastMsg(`Successfully reactivated ${reactivatingMember.fullName} as ${reactivateStatus}!`);
    setReactivatingMember(null);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Former Members Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Archived records of resigned and removed members with departure motifs, audit references &amp; reactivation.
          </p>
        </div>

        {/* Quick Link to Active Members */}
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          <span>← Back to Active Members</span>
        </Link>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-rise">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Total Former Members
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">
              {formerMembers.length}
            </div>
          </div>
          <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center font-mono font-black text-sm">
            ALL
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Voluntary Resignations
            </span>
            <div className="text-2xl font-black text-slate-700 mt-0.5 tabular-nums">
              {resignedCount}
            </div>
          </div>
          <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-xs">
            RES
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-500 font-bold">
              Executive Removals
            </span>
            <div className="text-2xl font-black text-rose-700 mt-0.5 tabular-nums">
              {removedCount}
            </div>
          </div>
          <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-mono font-bold text-xs">
            REM
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 self-start">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterType === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Former ({formerMembers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Resigned")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterType === "Resigned"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Resigned Only ({resignedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Removed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterType === "Removed"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Removed Only ({removedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Archived")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterType === "Archived"
                ? "bg-white text-[#182C4E] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Governance Archive ({(settings.archivedMembers || []).length})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ID, or motif..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Table: Either Governance Archive OR Former Members */}
      {filterType === "Archived" ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Archived Account</th>
                  <th className="py-3 px-4">Quanter ID</th>
                  <th className="py-3 px-4">Released Email</th>
                  <th className="py-3 px-4">Platform Roles</th>
                  <th className="py-3 px-4">Archived At</th>
                  <th className="py-3 px-4">Archived By</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!settings.archivedMembers || settings.archivedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Archive className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600">No permanently purged records</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        When a member is permanently purged &amp; archived, their historical snapshot appears here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  settings.archivedMembers.map((arch) => (
                    <tr key={arch.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {arch.fullName}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {arch.quanterId}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                        {arch.email}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {arch.roles?.join(", ") || "Member"}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {arch.archivedAt}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {arch.archivedBy}
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-600">
                        {arch.reason}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Email Released
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Quanter ID</th>
                  <th className="py-3 px-4">Former Status</th>
                  <th className="py-3 px-4">Past Placement</th>
                  <th className="py-3 px-4">Reason / Departure Motif</th>
                  <th className="py-3 px-4">Decision Ref / Actor</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <UserX className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">No former members match your criteria</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing filters or search query</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const dept = departments.find((d) => d.id === m.departmentId);
                  const team = teams.find((t) => t.id === m.teamId);
                  const isResigned = m.status === "Resigned";

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 grayscale"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/members/${m.id}`}
                              className="font-bold text-slate-900 hover:text-[#0284C7] truncate block"
                            >
                              {m.fullName}
                            </Link>
                            <span className="font-mono text-[10.5px] text-slate-400 truncate block">
                              {m.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-600 whitespace-nowrap">
                        {m.quanterId}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isResigned ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10.5px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Resigned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10.5px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Removed
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">
                          {dept ? dept.shortName : "General Roster"}
                        </div>
                        {team && (
                          <div className="text-[10px] text-slate-400">
                            {team.name}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-600 font-medium line-clamp-2">
                          {m.resignationReason || m.removalReason || "No formal motif logged."}
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {m.removalDecisionRef ? (
                          <span className="font-bold text-rose-700">
                            {m.removalDecisionRef}
                          </span>
                        ) : m.resignationManagerName ? (
                          <span>By {m.resignationManagerName}</span>
                        ) : (
                          <span className="text-slate-400">Executive Bureau</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {m.statusSince || "N/A"}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenReactivate(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs transition cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reactivate</span>
                          </button>
                          <Link
                            href={`/admin/members/${m.id}`}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                            title="Open Member Profile Card"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setPurgingMember(m);
                              setPurgeReason("");
                            }}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Permanently Purge & Free Email"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Centered Reactivate Modal */}
      {reactivatingMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-rise">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <RotateCcw className="w-3.5 h-3.5" />
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Reactivate Former Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReactivatingMember(null)}
                aria-label="Close reactivate modal"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <img
                src={reactivatingMember.avatarUrl}
                alt={reactivatingMember.fullName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">
                  {reactivatingMember.fullName}
                </p>
                <p className="font-mono text-[10.5px] text-slate-500 truncate">
                  {reactivatingMember.quanterId} · Currently {reactivatingMember.status}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
                  Reactivation Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReactivateStatus("Active")}
                    className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      reactivateStatus === "Active"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    Active Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setReactivateStatus("Trainee")}
                    className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      reactivateStatus === "Trainee"
                        ? "bg-sky-50 text-sky-800 border-sky-300 ring-2 ring-sky-500/20"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    Trainee
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
                  Target Department
                </label>
                <select
                  value={targetDeptId}
                  onChange={(e) => setTargetDeptId(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
                  Target Scientific Team (Optional)
                </label>
                <select
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="">No Scientific Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
                  Audited Reason Note (Required)
                </label>
                <textarea
                  rows={3}
                  required
                  value={reactivateReason}
                  onChange={(e) => setReactivateReason(e.target.value)}
                  placeholder="e.g. Return endorsed by Executive Bureau after completing external study term..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReactivatingMember(null)}
                className="h-11 min-h-[44px] px-5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reactivateReason.trim()}
                onClick={handleConfirmReactivate}
                className="h-11 min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs transition cursor-pointer shadow-sm"
              >
                Confirm Reactivation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Purge & Free Email Modal */}
      {purgingMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Permanently Purge &amp; Release Email
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPurgingMember(null)}
                aria-label="Close purge modal"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/90 text-xs text-rose-900 leading-relaxed">
              <p className="font-bold">
                Are you sure you want to permanently purge {purgingMember.fullName} ({purgingMember.quanterId})?
              </p>
              <p className="mt-1 text-rose-700">
                This removes their record from the former members directory, saves an archival snapshot into Governance Archive, and releases their email (<strong className="font-mono text-rose-950">{purgingMember.email}</strong>) so they can register again as a new applicant without encountering &apos;account already exists&apos;.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audit / Purge Reason
              </label>
              <input
                type="text"
                value={purgeReason}
                onChange={(e) => setPurgeReason(e.target.value)}
                placeholder="e.g. Member requested full account reset..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPurgingMember(null)}
                className="h-11 min-h-[44px] px-5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMember(
                    purgingMember.id,
                    purgeReason.trim() || "Permanently purged & archived from former members directory",
                    true
                  );
                  setToastMsg(`Member '${purgingMember.fullName}' permanently purged and email released.`);
                  setPurgingMember(null);
                  setTimeout(() => setToastMsg(null), 3500);
                }}
                className="h-11 min-h-[44px] px-5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition cursor-pointer"
              >
                Purge &amp; Release Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
