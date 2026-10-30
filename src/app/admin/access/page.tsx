"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  LogOut,
  Search,
  Plus,
  RotateCcw,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { RoleTemplateName } from "@/lib/types/erp";
import { handleMemberSelectKeyDown, sortMembersByName } from "@/lib/utils/memberKeyboardJump";

const ROLES: RoleTemplateName[] = [
  "Super Admin",
  "Executive",
  "HR Head",
  "Department Head",
  "Co-Manager",
  "Editor",
  "KPI Viewer",
];

export default function AdminAccessPage() {
  const members = useQuantersStore((s) => s.members);
  const departments = useQuantersStore((s) => s.departments);
  const activeAdminRole = useQuantersStore((s) => s.activeAdminRole);
  const settings = useQuantersStore((s) => s.settings);
  const forceLogoutAllSessions = useQuantersStore((s) => s.forceLogoutAllSessions);
  const forceLogoutSpecificMember = useQuantersStore((s) => s.forceLogoutSpecificMember);
  const restoreMemberSessionAccess = useQuantersStore((s) => s.restoreMemberSessionAccess);

  const [activeTab, setActiveTab] = useState<"roles" | "sessions">("roles");
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [selectedRole, setSelectedRole] = useState<RoleTemplateName>("Department Head");
  const [toast, setToast] = useState<string | null>(null);

  // Compact Live Guard state
  const [revokeProcessing, setRevokeProcessing] = useState<boolean>(false);
  const [keepMySessionOnGlobal, setKeepMySessionOnGlobal] = useState<boolean>(true);
  const [showGlobalConfirmModal, setShowGlobalConfirmModal] = useState<boolean>(false);
  const [sessionSearch, setSessionSearch] = useState<string>("");

  if (activeAdminRole !== "Super Admin" && activeAdminRole !== "Executive") {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto my-12 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 font-display">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Super Admin or Executive role is strictly required to modify access grants and assign administrative roles.
        </p>
      </div>
    );
  }

  const sortedMembers = sortMembersByName(members);

  // Members with admin/management roles
  const privilegedMembers = members.filter((m) =>
    m.roles.some((r) =>
      [
        "Super Admin",
        "Executive",
        "HR Head",
        "Department Head",
        "Co-Manager",
        "Editor",
        "KPI Viewer",
      ].includes(r)
    )
  );

  const revokedCount = settings.revokedSessionMemberIds
    ? Object.keys(settings.revokedSessionMemberIds).length
    : 0;

  const handleGrantRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    useQuantersStore.setState((s) => ({
      members: s.members.map((m) =>
        m.id === selectedMemberId
          ? {
              ...m,
              roles: Array.from(new Set([...m.roles, selectedRole])),
            }
          : m
      ),
    }));

    const mem = members.find((m) => m.id === selectedMemberId);
    setToast(`Granted ${selectedRole} to ${mem?.fullName || "Member"}`);
    setGrantModalOpen(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemoveRole = (memberId: string, roleToRemove: RoleTemplateName) => {
    useQuantersStore.setState((s) => ({
      members: s.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              roles: m.roles.filter((r) => r !== roleToRemove),
            }
          : m
      ),
    }));
    setToast(`Removed ${roleToRemove} role`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExecuteGlobalLogout = async () => {
    setRevokeProcessing(true);
    try {
      await forceLogoutAllSessions({ keepCurrentSession: keepMySessionOnGlobal });
      setShowGlobalConfirmModal(false);
      setToast(
        keepMySessionOnGlobal
          ? "All active member sessions across all devices have been terminated. Your session remains active."
          : "Global session revocation executed. All users including this session have been logged out."
      );
      setTimeout(() => setToast(null), 5000);
    } catch {
      setToast("Failed to execute global session revocation.");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setRevokeProcessing(false);
    }
  };

  const handleExecuteSpecificRevoke = async (memberId: string) => {
    setRevokeProcessing(true);
    try {
      await forceLogoutSpecificMember(memberId, "Individual session termination requested by administrator");
      const targetMember = members.find((m) => m.id === memberId);
      setToast(`Session terminated for ${targetMember?.fullName || memberId}.`);
      setTimeout(() => setToast(null), 4000);
    } catch {
      setToast("Failed to terminate member session.");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setRevokeProcessing(false);
    }
  };

  const handleRestoreMemberAccess = async (memberId: string) => {
    setRevokeProcessing(true);
    try {
      await restoreMemberSessionAccess(memberId);
      const targetMember = members.find((m) => m.id === memberId);
      setToast(`Session access restored for ${targetMember?.fullName || memberId}.`);
      setTimeout(() => setToast(null), 4000);
    } catch {
      setToast("Failed to restore member access.");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setRevokeProcessing(false);
    }
  };

  return (
    <>
      <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
              ORGANIGRAMME ROLE AUTHORITY &amp; DELEGATION
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
              Access &amp; Permissions
            </h1>
            <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
              Manage administrative roles, department leads, and scoped privileges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "roles" && (
              <button
                type="button"
                onClick={() => setGrantModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Grant Role</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "roles"
                ? "bg-[#182C4E] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Role Authority &amp; Scoped Grants ({privilegedMembers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sessions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "sessions"
                ? "bg-[#182C4E] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Active Sessions &amp; Security Revocation Live Guard</span>
            {revokedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-mono font-bold">
                {revokedCount}
              </span>
            )}
          </button>
        </div>

        {toast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toast}</span>
            </div>
            <button type="button" onClick={() => setToast(null)} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: ROLE AUTHORITY & SCOPED GRANTS */}
        {activeTab === "roles" && (
          <div className="space-y-4 animate-fade-in">
            {/* Primary Role Reference Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-[#0284C7] font-bold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Full platform authority, system settings, database synchronization, and audit log.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>HR Head</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Member records, onboarding verifications, attendance, points reversals, and awards.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-[#0284C7] font-bold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Department Head</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Departmental task validation, workshops, and trainee qualification reviews.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>KPI Viewer</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Read-only access to club performance telemetry, rankings, and analytics.
                </p>
              </div>
            </div>

            {/* Privileged Staff Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="p-3.5 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Administrative Staff ({privilegedMembers.length} Members)
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Assigned platform roles</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFD] border-b border-slate-200/90 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Assigned Roles</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EDF8]">
                    {privilegedMembers.map((m) => {
                      const dept = departments.find((d) => d.id === m.departmentId);
                      const adminRoles = m.roles.filter((r) => r !== "Member");

                      return (
                        <tr key={m.id} className="hover:bg-[#F8FAFD] transition-colors">
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

                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {adminRoles.map((r) => (
                                <span
                                  key={r}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F6FF] text-[#0284C7] border border-sky-200"
                                >
                                  <span>{r}</span>
                                  {r !== "Super Admin" && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRole(m.id, r as RoleTemplateName)}
                                      className="hover:text-rose-600 cursor-pointer ml-0.5"
                                      title="Revoke role"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMemberId(m.id);
                                setGrantModalOpen(true);
                              }}
                              className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                            >
                              + Add Role
                            </button>
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

        {/* TAB 2: ACTIVE SESSIONS & REMOTE SECURITY REVOCATION (COMPACT LIVE GUARD) */}
        {activeTab === "sessions" && (
          <div className="space-y-3.5 animate-fade-in max-w-3xl">
            {/* Reduced Compact Live Guard Notice */}
            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-center gap-2 text-xs text-amber-900 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[11.5px] text-amber-800 font-medium">
                Live Cloud Guard: Remote termination invalidates active cached tokens and logs target devices out immediately.
              </span>
            </div>

            {/* Compact Global Session Revocation Card */}
            <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Global Session Revocation Guard
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Remotely terminate active client sessions globally across phones, tablets, and computers.
                    </p>
                  </div>
                </div>

                <div className="text-[10.5px] font-mono text-slate-400">
                  Last Revocation:{" "}
                  <span className="font-bold text-slate-600">
                    {settings.forceLogoutAllAt
                      ? new Date(settings.forceLogoutAllAt).toLocaleString()
                      : "Never triggered"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keepMySessionOnGlobal}
                    onChange={(e) => setKeepMySessionOnGlobal(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Preserve my current Super Admin session on this device</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowGlobalConfirmModal(true)}
                  disabled={revokeProcessing || activeAdminRole !== "Super Admin"}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>
                    {keepMySessionOnGlobal
                      ? "Force Logout All Other Sessions"
                      : "Force Logout Everyone (Global)"}
                  </span>
                </button>
              </div>
            </div>

            {/* Terminate Specific Member Session Card with Search */}
            <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Terminate Specific Member Session
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Revoke active device session for a specific member without affecting others.
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="Search member by name, Quanter ID, or email..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#0284C7] bg-slate-50/50"
                />
              </div>

              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {members
                  .filter((m) => {
                    if (!sessionSearch.trim()) return true;
                    const q = sessionSearch.toLowerCase();
                    return (
                      m.fullName.toLowerCase().includes(q) ||
                      m.quanterId.toLowerCase().includes(q) ||
                      m.email.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 20)
                  .map((m) => {
                    const isRevoked = Boolean(settings.revokedSessionMemberIds?.[m.id]);
                    return (
                      <div key={m.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{m.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {m.quanterId} · {m.email}
                            </div>
                          </div>
                        </div>

                        {isRevoked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            Revoked
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleExecuteSpecificRevoke(m.id)}
                            disabled={revokeProcessing}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            Terminate Session
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Currently Revoked Sessions Table (if any) */}
            {settings.revokedSessionMemberIds && Object.keys(settings.revokedSessionMemberIds).length > 0 && (
              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    Currently Revoked Member Sessions ({Object.keys(settings.revokedSessionMemberIds).length})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Members listed here are blocked until un-revoked
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {Object.entries(settings.revokedSessionMemberIds).map(([memId, revokedTimestamp]) => {
                      const targetMem = members.find((m) => m.id === memId);
                      return (
                        <div
                          key={memId}
                          className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate">
                                {targetMem?.fullName || memId}
                              </div>
                              <div className="text-[10.5px] font-mono text-slate-400 truncate">
                                {targetMem?.quanterId || memId} · Revoked:{" "}
                                {new Date(revokedTimestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRestoreMemberAccess(memId)}
                            disabled={revokeProcessing || activeAdminRole !== "Super Admin"}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-emerald-700 text-[11px] font-bold transition shrink-0 cursor-pointer"
                            title="Allow this member to sign in again"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-400" />
                            <span>Restore Access</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grant Role Modal */}
      {grantModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#0F1E36]">Grant Administrative Role</h3>
              <button
                type="button"
                onClick={() => setGrantModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGrantRole} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Select Member</label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Press A–Z to jump
                  </span>
                </div>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(e, sortedMembers, setSelectedMemberId)
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-800"
                >
                  {sortedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as RoleTemplateName)}
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-800 font-bold"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGrantModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-[#182C4E] text-white rounded-xl cursor-pointer"
                >
                  Confirm Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: GLOBAL SESSION REVOCATION */}
      {showGlobalConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-rose-200 animate-rise">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Confirm Global Session Revocation
                </h3>
                <p className="text-xs text-slate-500">
                  Monotonic Timestamp Security Directive
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed space-y-1">
              <p className="font-bold">Are you sure you want to proceed?</p>
              <p className="text-[11.5px] text-rose-800">
                {keepMySessionOnGlobal
                  ? "All active sessions across all devices for all club members will be terminated immediately. Your current Super Admin session will remain active."
                  : "All active sessions including your current Super Admin session will be terminated globally. You will be redirected to the sign-in screen."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGlobalConfirmModal(false)}
                disabled={revokeProcessing}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteGlobalLogout}
                disabled={revokeProcessing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                {revokeProcessing ? "Executing..." : "Revoke All Sessions"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
