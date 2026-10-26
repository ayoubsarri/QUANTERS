"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  ExternalLink,
  ClipboardCopy,
  CheckCircle2,
  Award,
  Sparkles,
  Mail,
  Calendar,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { Member } from "@/lib/types/erp";
import { copyToClipboardReliable } from "@/lib/utils/memberKeyboardJump";

export default function AdminAlumniPage() {
  const { members, departments, teams } = useQuantersStore();

  const [search, setSearch] = useState("");
  const [copiedLinkMemberId, setCopiedLinkMemberId] = useState<string | null>(null);
  const [reunionToast, setReunionToast] = useState<string | null>(null);

  const alumniList = useMemo(() => {
    return members.filter((m) => m.status === "Alumni");
  }, [members]);

  const filteredAlumni = useMemo(() => {
    return alumniList.filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.fullName.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesId = m.quanterId.toLowerCase().includes(q);
        const matchesPosition = (m.alumniPosition || "").toLowerCase().includes(q);
        const matchesGrad = (m.graduationYear || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId && !matchesPosition && !matchesGrad) return false;
      }
      return true;
    });
  }, [alumniList, search]);

  const handleCopyAlumniLink = (m: Member) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/welcome`;
    copyToClipboardReliable(url);
    setCopiedLinkMemberId(m.id);
    setTimeout(() => setCopiedLinkMemberId(null), 2500);
  };

  const handleSendReunionRsvp = (m: Member) => {
    setReunionToast(`Annual Alumni Gathering RSVP request queued for ${m.fullName}!`);
    setTimeout(() => setReunionToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              QUANTA Alumni Network
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Graduated fellows, researchers, and former executive leaders of the Scientific Club.
          </p>
        </div>

        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          <span>← Back to Active Members</span>
        </Link>
      </div>

      {reunionToast && (
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2 animate-rise">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{reunionToast}</span>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Total Club Alumni
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">
              {alumniList.length}
            </div>
          </div>
          <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono font-bold text-sm">
            ALU
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-bold">
              Lifetime Laureates
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">
              {alumniList.filter((a) => a.xpTotal >= 1000).length}
            </div>
          </div>
          <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-mono font-bold text-sm">
            ★
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-bold">
              Active Mentors
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5 tabular-nums">
              {alumniList.filter((a) => a.alumniAccessEnabled !== false).length}
            </div>
          </div>
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono font-bold text-xs">
            LIVE
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            Alumni Directory Roster ({filteredAlumni.length})
          </span>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni by name, class, research title, or ID..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Alumni Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Alumni Member</th>
                <th className="py-3 px-4">Quanter ID</th>
                <th className="py-3 px-4">Class Year</th>
                <th className="py-3 px-4">Current Title / Research</th>
                <th className="py-3 px-4">Past Department</th>
                <th className="py-3 px-4">Lifetime XP</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlumni.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">No alumni records found</p>
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((m) => {
                  const dept = departments.find((d) => d.id === m.departmentId);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-indigo-200"
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
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10.5px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          Class of {m.graduationYear || "2026"}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs font-medium text-slate-700">
                        {m.alumniPosition || "Doctoral Researcher & Club Laureate"}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-semibold">
                        {dept ? dept.shortName : "Executive Bureau"}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap tabular-nums">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-bold">
                          +{m.xpTotal} XP
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap tabular-nums font-mono text-slate-600 font-bold">
                        {m.badgeIds?.length || 0} Badges
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyAlumniLink(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                            title="Copy Direct App Access Link"
                          >
                            <ClipboardCopy className="w-3 h-3" />
                            <span>{copiedLinkMemberId === m.id ? "Copied!" : "Copy Link"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReunionRsvp(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                            title="Send Annual Gathering RSVP"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Gathering RSVP</span>
                          </button>
                          <Link
                            href={`/admin/members/${m.id}`}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                            title="Open Member Profile Card"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
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
    </div>
  );
}
