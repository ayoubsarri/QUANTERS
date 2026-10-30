"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Crown,
  Edit3,
  Plus,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { Department, ScientificTeam } from "@/lib/types/erp";
import { handleMemberSelectKeyDown, isAssignableMember, sortMembersByName } from "@/lib/utils/memberKeyboardJump";

export default function AdminOrgStructurePage() {
  const {
    departments,
    teams,
    members,
    settings,
    updateSettings,
    updateDepartmentMeta,
    createTeam,
    updateTeam,
    deleteOrArchiveTeam,
    addMemberToTeam,
    removeMemberFromTeam,
  } = useQuantersStore();

  const [savedToast, setSavedToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3500);
  };

  const isSuperAdminAccount = (m: (typeof members)[number]) =>
    m.roles.includes("Super Admin") ||
    m.email.toLowerCase() === "quantaclubdz@gmail.com" ||
    m.email.toLowerCase() === "hr.quanta@univ-alger.dz" ||
    m.id === "mem-super-quanta" ||
    m.id === "mem-super-hr";

  const eligibleLeaderMembers = sortMembersByName(
    members.filter(
      (m) =>
        !isSuperAdminAccount(m) &&
        ["Active", "Trainee"].includes(m.status)
    )
  );

  // Active members eligible for leadership/team selection (sorted A-Z for keyboard jump)
  const activeMembers = sortMembersByName(
    members.filter(
      (m) =>
        !isSuperAdminAccount(m) &&
        ["Active", "Trainee", "Inactive", "Suspended"].includes(m.status)
    )
  );

  // Executive Officers Modal State — Super Admin is NOT defaulted to VP/SG
  const currentPresidentId = settings.presidentId || "";
  const currentVpId = settings.vicePresidentId || "";
  const currentSgId = settings.secretaryGeneralId || "";

  const [execModalOpen, setExecModalOpen] = useState(false);
  const [selectedPresidentId, setSelectedPresidentId] = useState(currentPresidentId);
  const [selectedVpId, setSelectedVpId] = useState(currentVpId);
  const [selectedSgId, setSelectedSgId] = useState(currentSgId);

  // Create / Edit Scientific Team modal state
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ScientificTeam | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamField, setTeamField] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamLeaderId, setTeamLeaderId] = useState(activeMembers[0]?.id || "");

  // Edit Department Leaders Modal
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [selectedHeadId, setSelectedHeadId] = useState("");
  const [selectedCoManagerId, setSelectedCoManagerId] = useState("");

  // Manage Team Members Modal
  const [managingTeamId, setManagingTeamId] = useState<string | null>(null);
  const [selectedAddMemberId, setSelectedAddMemberId] = useState(
    activeMembers[0]?.id || ""
  );

  const managingTeam = teams.find((t) => t.id === managingTeamId) || null;

  const minSize = settings.teamSizeMin || 5;
  const maxSize = settings.teamSizeMax || 8;

  const openExecModal = () => {
    setSelectedPresidentId(
      settings.presidentId && !isSuperAdminAccount({ id: settings.presidentId } as any)
        ? settings.presidentId
        : ""
    );
    setSelectedVpId(
      settings.vicePresidentId && !isSuperAdminAccount({ id: settings.vicePresidentId } as any)
        ? settings.vicePresidentId
        : ""
    );
    setSelectedSgId(
      settings.secretaryGeneralId && !isSuperAdminAccount({ id: settings.secretaryGeneralId } as any)
        ? settings.secretaryGeneralId
        : ""
    );
    setExecModalOpen(true);
  };

  const handleSaveExecOfficers = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPresident = isSuperAdminAccount({ id: selectedPresidentId } as any) ? "" : selectedPresidentId;
    const cleanVp = isSuperAdminAccount({ id: selectedVpId } as any) ? "" : selectedVpId;
    const cleanSg = isSuperAdminAccount({ id: selectedSgId } as any) ? "" : selectedSgId;

    updateSettings(
      {
        presidentId: cleanPresident,
        vicePresidentId: cleanVp,
        secretaryGeneralId: cleanSg,
      },
      "Updated Executive Bureau Officers (President, VP, SG)"
    );
    setExecModalOpen(false);
    triggerToast("Executive Bureau Leadership updated");
  };

  const openCreateTeamModal = () => {
    setEditingTeam(null);
    setTeamName("");
    setTeamField("Physics & Quantum Computing");
    setTeamDesc("");
    const assignable = members.filter((m) => isAssignableMember(m));
    setTeamLeaderId(assignable[0]?.id || "");
    setTeamModalOpen(true);
  };

  const openEditTeamModal = (t: ScientificTeam) => {
    setEditingTeam(t);
    setTeamName(t.name);
    setTeamField(t.field);
    setTeamDesc(t.description);
    setTeamLeaderId(t.leaderMemberId);
    setTeamModalOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    if (editingTeam) {
      updateTeam(editingTeam.id, {
        name: teamName.trim(),
        field: teamField.trim(),
        description: teamDesc.trim(),
        leaderMemberId: teamLeaderId,
      });
      triggerToast(`Updated ${teamName.trim()}`);
    } else {
      createTeam({
        name: teamName.trim(),
        field: teamField.trim(),
        description: teamDesc.trim(),
        icon: "Atom",
        leaderMemberId: teamLeaderId,
        memberIds: [teamLeaderId],
      });
      triggerToast(`Created ${teamName.trim()}`);
    }
    setTeamModalOpen(false);
  };

  const handleSaveDeptLeaders = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    updateDepartmentMeta(
      editingDept.id,
      {
        headMemberId: selectedHeadId,
        coManagerMemberId: selectedCoManagerId,
      },
      `Updated leadership for ${editingDept.name}`
    );
    triggerToast(`Updated managers for ${editingDept.name}`);
    setEditingDept(null);
  };

  const presidentMember = eligibleLeaderMembers.find((m) => m.id === currentPresidentId);
  const vpMember = eligibleLeaderMembers.find((m) => m.id === currentVpId);
  const sgMember = eligibleLeaderMembers.find((m) => m.id === currentSgId);

  const execCards = [
    {
      roleTitle: "Club President",
      badgeText: "PRESIDENT",
      accent: "bg-amber-50 text-amber-700 border-amber-200",
      member: presidentMember,
    },
    {
      roleTitle: "Vice President (VP)",
      badgeText: "VICE PRESIDENT",
      accent: "bg-sky-50 text-[#0284C7] border-sky-200",
      member: vpMember,
    },
    {
      roleTitle: "Secretary General (SG)",
      badgeText: "SECRETARY GENERAL",
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
      member: sgMember,
    },
  ];

  return (
    <>
      <div className="space-y-6 max-w-[1500px] mx-auto animate-rise">
        {/* Header — Member App Editorial Style */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
              ORGANIZATIONAL ARCHITECTURE · 6 DEPARTMENTS &amp; TEAMS
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
              Departments &amp; Scientific Teams
            </h1>
            <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
              Manage Executive Bureau officers, permanent operational departments, and research teams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {savedToast && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{savedToast}</span>
              </div>
            )}



            <button
              type="button"
              onClick={openCreateTeamModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Scientific Team</span>
            </button>
          </div>
        </div>

        {/* SECTION 0 — EXECUTIVE BUREAU LEADERSHIP (PRESIDENT, VP, SG) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#0F1E36] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
              <span>Executive Bureau Leadership</span>
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {execCards.map((card) => (
              <div
                key={card.roleTitle}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {card.member ? (
                    <img
                      src={card.member.avatarUrl}
                      alt={card.member.fullName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200/90 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center shrink-0 text-slate-400">
                      <ShieldCheck className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span
                      className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${card.accent}`}
                    >
                      {card.badgeText}
                    </span>
                    <div className="text-sm font-black text-[#0F1E36] truncate mt-1">
                      {card.member ? card.member.fullName : "Pending Appointment"}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {card.member ? `${card.member.quanterId} · ${card.member.major}` : "Position Open"}
                    </div>
                  </div>
                </div>

                {card.member ? (
                  <Link
                    href={`/admin/members/${card.member.id}`}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F4F7FB] hover:bg-[#E2EDF8] text-slate-700 text-xs font-bold shrink-0 transition"
                  >
                    Profile
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={openExecModal}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F4F7FB] hover:bg-[#E2EDF8] text-[#0284C7] text-xs font-bold shrink-0 transition cursor-pointer"
                  >
                    Assign →
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 1 — 6 FIXED DEPARTMENTS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#0F1E36] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0284C7]" />
              <span>Departments</span>
            </h2>
            <span className="font-mono text-xs font-bold text-slate-400">
              {departments.length} Departments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {departments.map((dept) => {
              const head = members.find((m) => m.id === dept.headMemberId);
              const coMgr = members.find((m) => m.id === dept.coManagerMemberId);
              const deptMembers = members.filter(
                (m) =>
                  m.departmentId === dept.id &&
                  ["Trainee", "Active", "Inactive", "Suspended"].includes(m.status)
              );

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-[#0F1E36]">
                        {dept.name}
                      </h3>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#F4F7FB] text-slate-600 border border-slate-200/90 shrink-0">
                        {deptMembers.length} members
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {dept.description}
                    </p>

                    {/* Leadership Card with Quick Edit */}
                    <div className="mt-3 p-2.5 rounded-xl bg-[#F8FAFD] border border-slate-200/90 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                          Leadership
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDept(dept);
                            setSelectedHeadId(dept.headMemberId);
                            setSelectedCoManagerId(dept.coManagerMemberId);
                          }}
                          className="text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer"
                        >
                          Change Managers
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-slate-800">
                        <span className="text-slate-500">Head:</span>
                        <span className="font-bold truncate max-w-[175px]">
                          {head?.fullName || "Unassigned"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-800">
                        <span className="text-slate-500">Co-Manager:</span>
                        <span className="font-bold truncate max-w-[175px]">
                          {coMgr?.fullName || "Unassigned"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Link to Filtered Members */}
                  <div className="pt-2 border-t border-slate-200/90 flex items-center justify-end">
                    <Link
                      href={`/admin/members?dept=${dept.id}`}
                      className="text-xs font-bold text-[#0284C7] hover:underline"
                    >
                      View Roster ({deptMembers.length}) →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2 — SCIENTIFIC TEAMS */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#0F1E36] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0284C7]" />
              <span>Scientific Teams</span>
            </h2>
            <span className="font-mono text-xs font-bold text-slate-400">
              {teams.filter((t) => !t.archived).length} Active Teams
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {teams
              .filter((t) => !t.archived)
              .map((team) => {
                const leader = members.find((m) => m.id === team.leaderMemberId);
                const count = team.memberIds.length;
                const inRange = count >= minSize && count <= maxSize;

                return (
                  <div
                    key={team.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-black text-[#0F1E36]">
                            {team.name}
                          </h3>
                          <div className="text-[10px] font-mono font-bold text-[#0284C7] mt-0.5">
                            {team.field}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                              inRange
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {count} members
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditTeamModal(team)}
                            className="p-1 rounded text-slate-400 hover:text-[#0284C7] cursor-pointer"
                            title="Edit Team"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {team.description}
                      </p>

                      <div className="mt-2.5 p-2.5 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-500">Lead: </span>
                          <span className="font-bold text-slate-800">
                            {leader?.fullName || "Unassigned"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setManagingTeamId(team.id);
                            setSelectedAddMemberId(activeMembers[0]?.id || "");
                          }}
                          className="text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer"
                        >
                          Manage Members
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/90 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          deleteOrArchiveTeam(team.id, "Admin request");
                          triggerToast(`Archived ${team.name}`);
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                      >
                        Archive
                      </button>

                      <Link
                        href={`/admin/members?team=${team.id}`}
                        className="text-xs font-bold text-[#0284C7] hover:underline"
                      >
                        View Roster ({team.memberIds.length}) →
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      {/* ===================================================================== */}
      {/* ROOT-LEVEL VIEWPORT-CENTERED MODALS (NO TRANSFORM ON PARENT)          */}
      {/* ===================================================================== */}



      {/* 2. Edit Department Leaders Modal */}
      {editingDept && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[420px] bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#0F1E36]">
                Change Managers · {editingDept.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeptLeaders} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Department Head
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Press A–Z to jump
                  </span>
                </div>
                <select
                  value={selectedHeadId}
                  onChange={(e) => setSelectedHeadId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(e, activeMembers, setSelectedHeadId)
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-800 font-semibold"
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Co-Manager
                </label>
                <select
                  value={selectedCoManagerId}
                  onChange={(e) => setSelectedCoManagerId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(e, activeMembers, setSelectedCoManagerId)
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-800 font-semibold"
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white rounded-xl transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create / Edit Scientific Team Modal */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[440px] bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#0F1E36]">
                {editingTeam ? "Edit Scientific Team" : "New Scientific Team"}
              </h3>
              <button
                type="button"
                onClick={() => setTeamModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Astrophysics & Cosmology"
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scientific Field
                </label>
                <input
                  type="text"
                  required
                  value={teamField}
                  onChange={(e) => setTeamField(e.target.value)}
                  placeholder="e.g. Physics / Astronomy"
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Team Leader
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Press A–Z to jump
                  </span>
                </div>
                <select
                  value={teamLeaderId}
                  onChange={(e) => setTeamLeaderId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(e, activeMembers, setTeamLeaderId)
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-semibold"
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Focus and research activities..."
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white rounded-xl transition cursor-pointer"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Manage Team Members Modal */}
      {managingTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[460px] bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-[#0F1E36]">
                  Manage Team Members · {managingTeam.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {managingTeam.memberIds.length} assigned (target {minSize}–{maxSize} members)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagingTeamId(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add Member Bar */}
            <div className="flex gap-2">
              <select
                value={selectedAddMemberId}
                onChange={(e) => setSelectedAddMemberId(e.target.value)}
                onKeyDown={(e) =>
                  handleMemberSelectKeyDown(e, activeMembers, setSelectedAddMemberId)
                }
                className="flex-1 px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-800 font-semibold"
              >
                {activeMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.quanterId})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!selectedAddMemberId) return;
                  addMemberToTeam(selectedAddMemberId, managingTeam.id);
                  triggerToast(`Added member to ${managingTeam.name}`);
                }}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Assigned Members List */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {managingTeam.memberIds.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No members currently assigned to this team.
                </div>
              ) : (
                managingTeam.memberIds.map((mId) => {
                  const m = members.find((item) => item.id === mId);
                  if (!m) return null;
                  const isLeader = m.id === managingTeam.leaderMemberId;
                  return (
                    <div
                      key={m.id}
                      className="py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={m.avatarUrl}
                          alt={m.fullName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-[#0F1E36] truncate flex items-center gap-1.5">
                            <span>{m.fullName}</span>
                            {isLeader && (
                              <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-50 text-[#0284C7]">
                                Lead
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {m.quanterId} · {m.major}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeMemberFromTeam(
                            m.id,
                            managingTeam.id,
                            "Removed via Manage Team Members modal"
                          )
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
                      >
                        <UserMinus className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Link
                href={`/admin/members?team=${managingTeam.id}`}
                className="text-xs font-bold text-[#0284C7] hover:underline"
              >
                Open Full Roster in Directory →
              </Link>
              <button
                type="button"
                onClick={() => setManagingTeamId(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
