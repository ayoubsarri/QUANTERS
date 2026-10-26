"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Plus,
  Shield,
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
  const { members, departments } = useQuantersStore();

  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [selectedRole, setSelectedRole] = useState<RoleTemplateName>("Department Head");
  const [toast, setToast] = useState<string | null>(null);

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

  return (
    <>
      <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
        {/* Header — Member App Editorial Style */}
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

        <button
          type="button"
          onClick={() => setGrantModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Grant Access</span>
        </button>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                  className="flex-1 py-2 text-xs font-bold bg-[#182C4E] text-white rounded-xl"
                >
                  Confirm Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
