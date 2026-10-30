"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  ExternalLink,
  Award,
  Sparkles,
  Mail,
  Filter,
  LayoutGrid,
  List,
  CheckCircle2,
  Shield,
  Building,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

export default function AdminAlumniPage() {
  const { members, departments, updateMemberProfileSelf } = useQuantersStore();

  const [search, setSearch] = useState("");
  const [selectedCohort, setSelectedCohort] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const alumniList = useMemo(() => {
    return members.filter((m) => m.status === "Alumni");
  }, [members]);

  const cohorts = useMemo(() => {
    const set = new Set<string>();
    alumniList.forEach((a) => {
      if (a.graduationYear) set.add(a.graduationYear);
    });
    return ["All", ...Array.from(set).sort().reverse()];
  }, [alumniList]);

  const filteredAlumni = useMemo(() => {
    return alumniList.filter((m) => {
      if (selectedCohort !== "All" && (m.graduationYear || "2026") !== selectedCohort) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.fullName.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesId = m.quanterId.toLowerCase().includes(q);
        const matchesPosition = (m.alumniPosition || "").toLowerCase().includes(q);
        const matchesGrad = (m.graduationYear || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId && !matchesPosition && !matchesGrad) {
          return false;
        }
      }
      return true;
    });
  }, [alumniList, search, selectedCohort]);

  const toggleAlumniAccess = (memberId: string, currentVal?: boolean) => {
    const nextVal = currentVal === false ? true : false;
    updateMemberProfileSelf(memberId, { alumniAccessEnabled: nextVal });
    setToastMsg(`Alumni access ${nextVal ? "enabled" : "restricted"} for fellow.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#182C4E] to-[#101F38] text-[#7DD3FC] flex items-center justify-center border border-[#2B4875]/60 shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-display text-[#0F1E36] tracking-tight">
              Alumni &amp; Fellows Network
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-editorial italic text-slate-500 mt-1">
            Graduated researchers, project laureates, and former executive leaders of QUANTA.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-[#F4F7FB] border border-slate-200/90 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "grid" ? "bg-white text-[#182C4E] shadow-2xs" : "text-slate-400 hover:text-slate-700"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "table" ? "bg-white text-[#182C4E] shadow-2xs" : "text-slate-400 hover:text-slate-700"
              }`}
              title="Table Roster View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/admin/members"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <span>← Active Members</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Alumni Fellows
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#0F1E36] mt-0.5 tabular-nums font-display">
              {alumniList.length}
            </div>
            <span className="text-[10.5px] text-slate-500 font-medium">In permanent registry</span>
          </div>
          <span className="w-9 h-9 rounded-xl bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] flex items-center justify-center font-mono font-bold text-xs">
            ALU
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold block">
              Lifetime Laureates
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tabular-nums font-display">
              {alumniList.filter((a) => a.xpTotal >= 1000).length}
            </div>
            <span className="text-[10.5px] text-amber-600 font-medium">≥ 1,000 Lifetime XP</span>
          </div>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-mono font-bold text-sm">
            ★
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-bold block">
              Active Mentors
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 tabular-nums font-display">
              {alumniList.filter((a) => a.alumniAccessEnabled !== false).length}
            </div>
            <span className="text-[10.5px] text-emerald-600 font-medium">Portal access granted</span>
          </div>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono font-bold text-[10.5px]">
            LIVE
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold block">
              Recorded Cohorts
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-700 mt-0.5 tabular-nums font-display">
              {Math.max(1, cohorts.length - 1)}
            </div>
            <span className="text-[10.5px] text-indigo-600 font-medium">Graduation classes</span>
          </div>
          <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-mono font-bold text-xs">
            YR
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Cohort Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Class:</span>
          </span>
          {cohorts.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCohort(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCohort === c
                  ? "bg-[#182C4E] text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {c === "All" ? "All Cohorts" : `Class of ${c}`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni by name, research, or ID..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8] focus:bg-white transition font-medium"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredAlumni.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 shadow-2xs">
          <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
          <p className="font-bold text-slate-700 text-sm">No alumni records match your filter</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the cohort filter or search query</p>
        </div>
      ) : viewMode === "grid" ? (
        /* CREATIVE FELLOW CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAlumni.map((m) => {
            const dept = departments.find((d) => d.id === m.departmentId);
            const isMentorActive = m.alumniAccessEnabled !== false;

            return (
              <div
                key={m.id}
                className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Accent top gradient bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

                <div className="space-y-3">
                  {/* Top Header: Avatar + Identity */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={m.avatarUrl}
                          alt={m.fullName}
                          className="w-11 h-11 rounded-xl object-cover border-2 border-indigo-100 shadow-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-white flex items-center justify-center text-[8px] font-bold text-white shadow-2xs">
                          ★
                        </span>
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="font-black text-slate-900 text-sm hover:text-[#0284C7] truncate block tracking-tight"
                        >
                          {m.fullName}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">{m.quanterId}</span>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded font-mono text-[9.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Class of {m.graduationYear || "2026"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mentor Status Pill */}
                    <button
                      type="button"
                      onClick={() => toggleAlumniAccess(m.id, isMentorActive)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer border ${
                        isMentorActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={isMentorActive ? "Alumni Portal Access: Active" : "Alumni Portal Access: Restricted"}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isMentorActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      <span>{isMentorActive ? "Mentor" : "Archived"}</span>
                    </button>
                  </div>

                  {/* Research & Position Description */}
                  <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                      Current Focus &amp; Position
                    </span>
                    <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">
                      {m.alumniPosition || "Doctoral Researcher & Club Laureate in STEM"}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{dept ? dept.shortName : "Executive Bureau"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-mono font-bold text-slate-900">+{m.xpTotal} XP</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`mailto:${m.email}?subject=QUANTA%20Alumni%20Network`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[130px] font-mono text-[10.5px]">{m.email}</span>
                  </a>

                  <Link
                    href={`/admin/members/${m.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white text-xs font-bold transition shadow-2xs"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3 text-[#7DD3FC]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE ROSTER VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3.5">Fellow Member</th>
                  <th className="py-2.5 px-3.5">Quanter ID</th>
                  <th className="py-2.5 px-3.5">Cohort</th>
                  <th className="py-2.5 px-3.5">Position &amp; Research</th>
                  <th className="py-2.5 px-3.5">Department</th>
                  <th className="py-2.5 px-3.5">Lifetime XP</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlumni.map((m) => {
                  const dept = departments.find((d) => d.id === m.departmentId);
                  const isMentorActive = m.alumniAccessEnabled !== false;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-indigo-100"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/members/${m.id}`}
                              className="font-bold text-slate-900 hover:text-[#0284C7] truncate block text-xs"
                            >
                              {m.fullName}
                            </Link>
                            <span className="font-mono text-[10px] text-slate-400 truncate block">{m.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-600 whitespace-nowrap text-xs">
                        {m.quanterId}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] font-mono">
                          Class of {m.graduationYear || "2026"}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 max-w-xs font-medium text-slate-700 truncate">
                        {m.alumniPosition || "Doctoral Researcher & Club Laureate"}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 font-semibold text-xs">
                        {dept ? dept.shortName : "Executive"}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap tabular-nums">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10.5px] font-bold">
                          +{m.xpTotal} XP
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleAlumniAccess(m.id, isMentorActive)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border cursor-pointer ${
                            isMentorActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isMentorActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                          <span>{isMentorActive ? "Active" : "Archived"}</span>
                        </button>
                      </td>

                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
