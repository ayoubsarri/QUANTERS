"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  Eye,
  Lock,
  Mail,
  Send,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import {
  GrievanceStatus,
  MemberGrievance,
  NotificationPriority,
} from "@/lib/types/erp";
import {
  handleMemberSelectKeyDown,
  sortMembersByName,
} from "@/lib/utils/memberKeyboardJump";

export default function AdminMessagesPage() {
  const messages = useQuantersStore((s) => s.messages);
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);
  const members = useQuantersStore((s) => s.members);
  const grievances = useQuantersStore((s) => s.grievances);
  const sendClubMessage = useQuantersStore((s) => s.sendClubMessage);
  const resolveGrievance = useQuantersStore((s) => s.resolveGrievance);
  const activeAdminRole = useQuantersStore((s) => s.activeAdminRole);

  const isHrOrAdmin = [
    "Super Admin",
    "HR Head",
    "Executive",
  ].includes(activeAdminRole);

  const [mainTab, setMainTab] = useState<"broadcast" | "grievances">(
    "broadcast"
  );
  const [selectedGrievance, setSelectedGrievance] =
    useState<MemberGrievance | null>(null);
  const [hrNotesInput, setHrNotesInput] = useState("");
  const [statusSelect, setStatusSelect] =
    useState<GrievanceStatus>("Under Investigation");

  const [recipientType, setRecipientType] = useState<
    | "Everyone"
    | "Department"
    | "Scientific Team"
    | "All Trainees"
    | "Specific Member"
  >("Everyone");
  const [selectedTarget, setSelectedTarget] = useState<string>(
    "All Active & Trainee Members"
  );
  const [priority, setPriority] =
    useState<NotificationPriority>("Official notice");
  const [inApp, setInApp] = useState<boolean>(true);
  const [email, setEmail] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [banner, setBanner] = useState<string | null>(null);

  const pendingGrievances = grievances.filter(
    (g) => g.status === "Pending HR Review" || g.status === "Under Investigation"
  );

  const handleRecipientTypeChange = (
    next:
      | "Everyone"
      | "Department"
      | "Scientific Team"
      | "All Trainees"
      | "Specific Member"
  ) => {
    setRecipientType(next);
    if (next === "Everyone") setSelectedTarget("Everyone (Whole Club)");
    if (next === "Department")
      setSelectedTarget(departments[0]?.name || "IT and Technical Solutions");
    if (next === "Scientific Team")
      setSelectedTarget(teams[0]?.name || "Astronomy & Astrophysics");
    if (next === "All Trainees")
      setSelectedTarget("All Trainees (Qualification Cohort)");
    if (next === "Specific Member")
      setSelectedTarget(members[0]?.fullName || "");
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    if (!inApp && !email) return;

    sendClubMessage({
      recipientScope: selectedTarget,
      priority,
      title: title.trim(),
      body: body.trim(),
      inApp,
      email,
    });

    setBanner(
      `Dispatched '${title.trim()}' to ${selectedTarget} via ${[
        inApp ? "In-App Notification" : "",
        email ? "University Email SMTP" : "",
      ]
        .filter(Boolean)
        .join(" + ")}!`
    );
    setTitle("");
    setBody("");
  };

  const handleResolveGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    resolveGrievance(
      selectedGrievance.id,
      statusSelect,
      hrNotesInput.trim(),
      "HR Administration"
    );
    setBanner(`Updated grievance '${selectedGrievance.subject}' to ${statusSelect}`);
    setSelectedGrievance(null);
    setHrNotesInput("");
  };

  const sortedMembers = sortMembersByName(members);

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
      {/* Header — Member App Editorial Style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
            OFFICIAL COMMUNICATIONS &amp; DISPATCH
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
            Messages &amp; Announcements
          </h1>
          <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
            Broadcast messages and manage member reports.
          </p>
        </div>

        {/* Tab Switcher (Grievance tab only accessible to HR and Bureau) */}
        {isHrOrAdmin && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMainTab("broadcast")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                mainTab === "broadcast"
                  ? "bg-white text-[#0F1E36] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Broadcasts ({messages.length})
            </button>
            <button
              type="button"
              onClick={() => setMainTab("grievances")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                mainTab === "grievances"
                  ? "bg-[#182C4E] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Confidential Grievances</span>
              {pendingGrievances.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono font-black">
                  {pendingGrievances.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {banner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{banner}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mainTab === "grievances" && isHrOrAdmin ? (
        /* ==============================================================
           CONFIDENTIAL GRIEVANCES VIEW (STRICTLY HR ONLY)
           ============================================================== */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#09192F] text-white border border-[#2B4875]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-black text-base text-white">
                  Confidential Member Grievance Desk
                </h2>
                <p className="text-xs text-slate-300">
                  Visible ONLY to HR Head &amp; Executive Bureau. Department managers have zero access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold">
                {pendingGrievances.length} Pending Review
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-slate-300 font-mono text-xs font-bold">
                {grievances.length} Total Filed
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Subject &amp; Category</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Submitter Identity</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {grievances.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-slate-400 text-xs"
                      >
                        No grievances submitted yet. The grievance queue is clear.
                      </td>
                    </tr>
                  ) : (
                    grievances.map((grv) => {
                      const dept = departments.find(
                        (d) => d.id === grv.memberDepartmentId
                      );
                      return (
                        <tr key={grv.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4 align-top max-w-sm">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold mb-1">
                              {grv.category}
                            </span>
                            <div className="font-extrabold text-slate-900 text-xs">
                              {grv.subject}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                              {grv.details}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                                grv.urgency === "Urgent"
                                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                                  : grv.urgency === "Important"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-sky-100 text-sky-800 border border-sky-300"
                              }`}
                            >
                              {grv.urgency}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 align-top text-xs">
                            {grv.isAnonymous ? (
                              <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] font-bold">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Anonymous Quanter</span>
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-slate-900">
                                  {grv.memberName}
                                </div>
                                <div className="text-[10.5px] text-[#0284C7] font-mono">
                                  {dept?.shortName || "Club Member"}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 align-top font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {grv.submittedAt}
                          </td>

                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                                grv.status === "Pending HR Review"
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : grv.status === "Under Investigation"
                                  ? "bg-sky-50 text-sky-800 border-sky-300"
                                  : grv.status === "Resolved"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : "bg-slate-100 text-slate-600 border-slate-300"
                              }`}
                            >
                              {grv.status}
                            </span>
                            {grv.hrNotes && (
                              <p className="text-[10px] text-slate-500 italic mt-1 max-w-[160px] truncate">
                                Note: {grv.hrNotes}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGrievance(grv);
                                setStatusSelect(grv.status);
                                setHrNotesInput(grv.hrNotes || "");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#182C4E] hover:brightness-110 text-white font-display font-extrabold text-xs transition cursor-pointer shadow-2xs"
                            >
                              Review &amp; Act
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grievance Detail & Resolution Modal */}
          {selectedGrievance && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
              <div className="w-full max-w-[500px] rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 animate-rise max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block mb-1">
                      {selectedGrievance.category} · {selectedGrievance.urgency}
                    </span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {selectedGrievance.subject}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Submitted on {selectedGrievance.submittedAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedGrievance(null)}
                    className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-3.5 space-y-3">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Submitter Identity
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      {selectedGrievance.isAnonymous ? (
                        <span className="font-mono font-bold text-slate-600 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Anonymous Submission (Protected by Platform)</span>
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">
                            {selectedGrievance.memberName}
                          </div>
                          <div className="text-[11px] font-mono text-[#0284C7]">
                            {selectedGrievance.memberEmail}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Grievance Details
                    </span>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {selectedGrievance.details}
                    </div>
                  </div>

                  <form
                    onSubmit={handleResolveGrievanceSubmit}
                    className="pt-2 border-t border-slate-200 space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Update HR Status
                      </label>
                      <select
                        value={statusSelect}
                        onChange={(e) =>
                          setStatusSelect(e.target.value as GrievanceStatus)
                        }
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none"
                      >
                        <option value="Pending HR Review">Pending HR Review</option>
                        <option value="Under Investigation">Under Investigation</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        HR Investigation / Resolution Note
                      </label>
                      <textarea
                        rows={3}
                        value={hrNotesInput}
                        onChange={(e) => setHrNotesInput(e.target.value)}
                        placeholder="Document actions taken, mediation meetings scheduled, or outcome..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGrievance(null)}
                        className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 h-9 rounded-xl bg-[#182C4E] hover:brightness-110 text-white font-extrabold text-xs cursor-pointer transition shadow-xs"
                      >
                        Save HR Resolution
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==============================================================
           STANDARD BROADCAST VIEW
           ============================================================== */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* LEFT: DUAL-CHANNEL COMPOSER */}
          <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white">
              <h2 className="text-base font-extrabold">
                Dual-Channel Message Composer
              </h2>
              <p className="text-xs text-sky-200">
                Simultaneously delivers to Member Mobile App and University Email
              </p>
            </div>

            <form onSubmit={handleSend} className="p-6 space-y-4">
              {/* Recipient Scope Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  1. Recipient Group Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(
                    [
                      "Everyone",
                      "Department",
                      "Scientific Team",
                      "All Trainees",
                      "Specific Member",
                    ] as const
                  ).map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => handleRecipientTypeChange(rt)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition ${
                        recipientType === rt
                          ? "bg-[#182C4E] text-white border-[#182C4E]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {rt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Target Dropdown */}
              {recipientType === "Department" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Department
                  </label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recipientType === "Scientific Team" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Scientific Team
                  </label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recipientType === "Specific Member" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Select Member
                    </label>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Press A–Z to jump to name
                    </span>
                  </div>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    onKeyDown={(e) =>
                      handleMemberSelectKeyDown(
                        e,
                        sortedMembers,
                        (memberId: string) => {
                          const found = sortedMembers.find(
                            (m) => m.id === memberId
                          );
                          if (found) setSelectedTarget(found.fullName);
                        }
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    {sortedMembers.map((m) => (
                      <option key={m.id} value={m.fullName}>
                        {m.fullName} ({m.quanterId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  2. Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      "Info",
                      "Action needed",
                      "Official notice",
                    ] as NotificationPriority[]
                  ).map((p) => {
                    const isSelected = priority === p;
                    const pillClasses =
                      p === "Official notice"
                        ? "bg-amber-50 text-amber-800 border-amber-200/90"
                        : p === "Action needed"
                        ? "bg-rose-50 text-rose-700 border-rose-200/90"
                        : "bg-sky-50 text-sky-700 border-sky-200/90";
                    const dotClasses =
                      p === "Official notice"
                        ? "bg-amber-500"
                        : p === "Action needed"
                        ? "bg-rose-500"
                        : "bg-sky-500";

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${pillClasses} ${
                          isSelected
                            ? "ring-2 ring-slate-900/80 shadow-xs"
                            : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses}`}
                        />
                        <span className="truncate">{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dual Delivery Channels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  3. Delivery Channels
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-extrabold cursor-pointer ${
                      inApp
                        ? "bg-blue-50 border-[#182C4E] text-[#0284C7]"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={inApp}
                      onChange={(e) => setInApp(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0284C7]"
                    />
                    <Bell className="w-4 h-4" />
                    <span>In-App Notification</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-extrabold cursor-pointer ${
                      email
                        ? "bg-blue-50 border-[#182C4E] text-[#0284C7]"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={email}
                      onChange={(e) => setEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0284C7]"
                    />
                    <Mail className="w-4 h-4" />
                    <span>Send via Email</span>
                  </label>
                </div>
              </div>

              {/* Title & Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory General Assembly — This Saturday 10:00"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Message Body *
                </label>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write official club message or action instructions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-sm font-extrabold shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                Send Message ({selectedTarget})
              </button>
            </form>
          </div>

          {/* RIGHT: SENT MESSAGES & DELIVERY TRACKER TABLE */}
          <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F1E36]">
                  Sent Messages &amp; Real-Time Delivery Tracker ({messages.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Tracks In-App Read / Total progress bar and Email Sent / Failed counters
                </p>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Message &amp; Priority</th>
                    <th className="py-3.5 px-4">Recipient Scope</th>
                    <th className="py-3.5 px-4">Channels</th>
                    <th className="py-3.5 px-4">In-App Read / Total</th>
                    <th className="py-3.5 px-4 text-right">Email Sent / Failed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {messages.map((msg) => {
                    const readPct = Math.min(
                      100,
                      Math.round(
                        (msg.stats.inAppReadCount /
                          Math.max(1, msg.stats.totalRecipients)) *
                          100
                      )
                    );
                    return (
                      <tr key={msg.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 align-top min-w-[230px]">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10.5px] font-bold border whitespace-nowrap shrink-0 ${
                                msg.priority === "Action needed"
                                  ? "bg-rose-50 text-rose-700 border-rose-200/90"
                                  : msg.priority === "Official notice"
                                  ? "bg-amber-50 text-amber-800 border-amber-200/90"
                                  : "bg-sky-50 text-sky-700 border-sky-200/90"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  msg.priority === "Action needed"
                                    ? "bg-rose-500"
                                    : msg.priority === "Official notice"
                                    ? "bg-amber-500"
                                    : "bg-sky-500"
                                }`}
                              />
                              <span>{msg.priority}</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                              {msg.timeAgo}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-[#0F1E36] mt-1.5">
                            {msg.title}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                            {msg.body}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 align-top text-xs font-bold text-slate-700">
                          {msg.recipientScope}
                          <div className="text-[11px] font-normal text-slate-400">
                            by {msg.senderLabel}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-col gap-1 text-[11px] font-bold">
                            {msg.channels.inApp && (
                              <span className="inline-flex items-center gap-1 text-[#0284C7]">
                                <Check className="w-3 h-3" /> In-App
                              </span>
                            )}
                            {msg.channels.email && (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <Check className="w-3 h-3" /> Email
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top tabular-nums">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                            <span>
                              {msg.stats.inAppReadCount} /{" "}
                              {msg.stats.totalRecipients} Read
                            </span>
                            <span className="text-[#0284C7]">{readPct}%</span>
                          </div>
                          <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-xp-progress rounded-full"
                              style={{ width: `${readPct}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top text-right tabular-nums text-xs">
                          {msg.channels.email ? (
                            <div>
                              <div className="font-extrabold text-emerald-700">
                                {msg.stats.emailSentCount} Sent
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {msg.stats.emailFailedCount} Failed
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">In-App Only</span>
                          )}
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
    </div>
  );
}
