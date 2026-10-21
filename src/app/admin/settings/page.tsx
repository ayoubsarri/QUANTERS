"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Database,
  Download,
  GraduationCap,
  Link2,
  Moon,
  QrCode,
  RefreshCw,
  Save,
  ShieldCheck,
  Sliders,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { SystemSettings } from "@/lib/types/erp";
import { copyToClipboardReliable } from "@/lib/utils/memberKeyboardJump";

interface ErpTelemetry {
  dbSizeBytes: number;
  dbSizeKB: number;
  memberCount: number;
  quotaUsedPercent: number;
}

export default function AdminSettingsPage() {
  const state = useQuantersStore();
  const { settings, updateSettings, syncWithServer } = state;

  const [formState, setFormState] = useState<SystemSettings>({
    ...settings,
    onboardingAutoApprove: settings.onboardingAutoApprove ?? true,
    restrictUniversityEmail: settings.restrictUniversityEmail ?? true,
    qrRotationSeconds: settings.qrRotationSeconds ?? 30,
    checkinGraceMinutes: settings.checkinGraceMinutes ?? 15,
    geofenceVerification: settings.geofenceVerification ?? true,
    waitlistAutoPromote: settings.waitlistAutoPromote ?? true,
    examFreezeMode: settings.examFreezeMode ?? false,
    quietHoursEnabled: settings.quietHoursEnabled ?? true,
    weeklyWorkloadCapHours: settings.weeklyWorkloadCapHours ?? 6,
  });

  const [banner, setBanner] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [telemetry, setTelemetry] = useState<ErpTelemetry>({
    dbSizeBytes: 43820,
    dbSizeKB: 42.8,
    memberCount: state.members.length,
    quotaUsedPercent: 0.08,
  });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/erp")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.telemetry) setTelemetry(json.telemetry);
      })
      .catch(() => {});
  }, []);

  const applyImmediatePatch = (patch: Partial<SystemSettings>, reason: string, msg: string) => {
    setFormState((prev) => ({ ...prev, ...patch }));
    updateSettings(patch, reason);
    setBanner(msg);
  };

  const handleCopyRegistrationLink = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/onboarding`
        : "http://localhost:3000/onboarding";
    await copyToClipboardReliable(url);
    setLinkCopied(true);
    setBanner(`Copied registration form link to clipboard (${url})`);
    setTimeout(() => setLinkCopied(false), 3500);
  };

  const handleSaveAllThresholds = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings(formState, "Updated club governance & threshold parameters");
    setBanner("Saved all governance settings and HR thresholds");
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    await syncWithServer();
    setSyncing(false);
    setBanner("Synchronized state with server database");
  };

  const handleExportBackup = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      season: settings.currentSeasonLabel,
      departments: state.departments,
      teams: state.teams,
      members: state.members,
      workshops: state.workshops,
      tasks: state.tasks,
      pointRules: state.pointRules,
      ledger: state.ledger,
      badges: state.badges,
      exams: state.exams,
      projectSubmissions: state.projectSubmissions,
      proposals: state.proposals,
      explorePosts: state.explorePosts,
      messages: state.messages,
      accessGrants: state.accessGrants,
      auditLogs: state.auditLogs,
      settings: formState,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quanters-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setBanner("Exported full platform state JSON backup");
  };

  const regOpen = formState.registrationOpen;
  const alumniActive = formState.alumniAccessGlobal;
  const autoApprove = formState.onboardingAutoApprove ?? true;
  const restrictEmail = formState.restrictUniversityEmail ?? true;
  const qrSec = formState.qrRotationSeconds ?? 30;
  const graceMin = formState.checkinGraceMinutes ?? 15;
  const geofence = formState.geofenceVerification ?? true;
  const waitlistAuto = formState.waitlistAutoPromote ?? true;
  const examFreeze = formState.examFreezeMode ?? false;
  const quietHours = formState.quietHoursEnabled ?? true;

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EDF8] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
              Platform &amp; Governance Settings
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-[#1D63EB] border border-sky-200/80 font-mono text-[10px] font-bold">
              {formState.currentSeasonLabel}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Access gates, QR security protocols, academic protection rules, and HR qualification thresholds
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveAllThresholds()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save All Changes</span>
        </button>
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

      {/* 4-SECTION GOVERNANCE CONSOLE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SECTION 1: ACCESS & REGISTRATION CONTROLS */}
        <div className="bg-white rounded-2xl border border-[#E2EDF8] shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-[#E2EDF8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1D63EB]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                1. Access &amp; Registration Controls
              </h2>
            </div>
          </div>

          <div className="p-4 divide-y divide-slate-100 space-y-3 flex-1">
            {/* Row 1: Member Registration Gate */}
            <div className="flex items-center justify-between gap-3 pt-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Member Registration Gate</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                      regOpen
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {regOpen ? "OPEN" : "PAUSED"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Allow new students to submit the onboarding application form
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyRegistrationLink}
                  title="Copy Form Link"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    linkCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Form Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3 h-3" />
                      <span>Copy Form Link</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyImmediatePatch(
                      { registrationOpen: !regOpen },
                      "Toggled member registration gate",
                      `Member Registration Gate is now ${!regOpen ? "OPEN" : "PAUSED"}`
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    regOpen
                      ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {regOpen ? "Pause" : "Open"}
                </button>
              </div>
            </div>

            {/* Row 2: Alumni Portal Access */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Alumni Portal Access</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                      alumniActive
                        ? "bg-sky-50 text-[#1D63EB] border-sky-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {alumniActive ? "ACTIVE" : "MUTED"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Read-only access for graduated alumni to view workshops &amp; certificates
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  applyImmediatePatch(
                    { alumniAccessGlobal: !alumniActive },
                    "Toggled alumni portal access",
                    `Alumni Portal Access is now ${!alumniActive ? "ACTIVE" : "MUTED"}`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer shrink-0 ${
                  alumniActive
                    ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    : "bg-[#1D63EB] text-white border-[#1D63EB]"
                }`}
              >
                {alumniActive ? "Mute" : "Activate"}
              </button>
            </div>

            {/* Row 3: Onboarding Admission Mode */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">Onboarding Admission Mode</div>
                <p className="text-[11px] text-slate-500">
                  Auto-admit applicants as Trainees or require manual HR approval
                </p>
              </div>

              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    applyImmediatePatch(
                      { onboardingAutoApprove: true },
                      "Set onboarding mode to Auto-Admit as Trainee",
                      "Onboarding Admission Mode: Auto-Admit as Trainee"
                    )
                  }
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    autoApprove ? "bg-white text-[#1D63EB] shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Auto-Trainee
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyImmediatePatch(
                      { onboardingAutoApprove: false },
                      "Set onboarding mode to Manual HR Approval",
                      "Onboarding Admission Mode: Manual HR Approval"
                    )
                  }
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    !autoApprove ? "bg-white text-[#1D63EB] shadow-2xs" : "text-slate-600"
                  }`}
                >
                  HR Approval
                </button>
              </div>
            </div>

            {/* Row 4: University Email Domain Filter */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">
                  University Email Domain Filter
                </div>
                <p className="text-[11px] text-slate-500">
                  Restrict sign-ups to official <code className="font-mono">@univ-alger.dz</code> addresses
                </p>
              </div>

              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    applyImmediatePatch(
                      { restrictUniversityEmail: true },
                      "Restricted registration to @univ-alger.dz domain",
                      "Email Filter: Restricted to @univ-alger.dz"
                    )
                  }
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    restrictEmail ? "bg-white text-[#1D63EB] shadow-2xs" : "text-slate-600"
                  }`}
                >
                  @univ-alger.dz
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyImmediatePatch(
                      { restrictUniversityEmail: false },
                      "Allowed all email domains for registration",
                      "Email Filter: All Domains Allowed"
                    )
                  }
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    !restrictEmail ? "bg-white text-[#1D63EB] shadow-2xs" : "text-slate-600"
                  }`}
                >
                  All Domains
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ATTENDANCE & QR SECURITY */}
        <div className="bg-white rounded-2xl border border-[#E2EDF8] shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-[#E2EDF8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#1D63EB]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                2. Attendance &amp; QR Security
              </h2>
            </div>
          </div>

          <div className="p-4 divide-y divide-slate-100 space-y-3 flex-1">
            {/* Row 1: Projector QR Rotation Interval */}
            <div className="flex items-center justify-between gap-3 pt-0">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">
                  Projector QR Rotation Interval
                </div>
                <p className="text-[11px] text-slate-500">
                  Cryptographic token refresh rate during live workshop check-in
                </p>
              </div>

              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                {([15, 30, 60] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() =>
                      applyImmediatePatch(
                        { qrRotationSeconds: sec },
                        `Changed QR rotation interval to ${sec}s`,
                        `Projector QR Rotation set to ${sec}s`
                      )
                    }
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition cursor-pointer ${
                      qrSec === sec ? "bg-white text-[#1D63EB] shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Check-In Grace Window */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">Check-In Grace Window</div>
                <p className="text-[11px] text-slate-500">
                  Allowed arrival window after session start before marking late
                </p>
              </div>

              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                {([5, 15, 30] as const).map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() =>
                      applyImmediatePatch(
                        { checkinGraceMinutes: min },
                        `Changed check-in grace window to ${min} min`,
                        `Check-In Grace Window set to ${min} min`
                      )
                    }
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition cursor-pointer ${
                      graceMin === min ? "bg-white text-[#1D63EB] shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Campus Geofence Verification */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Campus Geofence Verification
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                      geofence
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {geofence ? "ENABLED" : "DISABLED"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Verify member proximity to Faculty of Sciences lecture halls
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  applyImmediatePatch(
                    { geofenceVerification: !geofence },
                    "Toggled campus geofence verification",
                    `Campus Geofence Verification ${!geofence ? "ENABLED" : "DISABLED"}`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer shrink-0 ${
                  geofence
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {geofence ? "Enabled" : "Disabled"}
              </button>
            </div>

            {/* Row 4: Waitlist Auto-Promotion */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Waitlist Auto-Promotion</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                      waitlistAuto
                        ? "bg-sky-50 text-[#1D63EB] border-sky-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {waitlistAuto ? "AUTO" : "MANUAL"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Automatically promote next waitlisted member when a workshop seat opens
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  applyImmediatePatch(
                    { waitlistAutoPromote: !waitlistAuto },
                    "Toggled waitlist auto-promotion",
                    `Waitlist Auto-Promotion ${!waitlistAuto ? "ENABLED" : "DISABLED"}`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer shrink-0 ${
                  waitlistAuto
                    ? "bg-sky-50 text-[#1D63EB] border-sky-200 hover:bg-sky-100"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {waitlistAuto ? "Auto-Promote" : "Manual"}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: ACADEMIC PROTECTION & WORKLOAD GOVERNANCE */}
        <div className="bg-white rounded-2xl border border-[#E2EDF8] shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-[#E2EDF8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#1D63EB]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                3. Academic Protection &amp; Workload Governance
              </h2>
            </div>
          </div>

          <div className="p-4 divide-y divide-slate-100 space-y-3 flex-1">
            {/* Row 1: University Exam-Freeze Mode */}
            <div className="flex items-center justify-between gap-3 pt-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    University Exam-Freeze Mode
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                      examFreeze
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {examFreeze ? "FROZEN" : "NORMAL"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pause non-critical club deadlines &amp; late deductions during university exams
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  applyImmediatePatch(
                    { examFreezeMode: !examFreeze },
                    "Toggled University Exam-Freeze Mode",
                    `University Exam-Freeze Mode ${!examFreeze ? "ACTIVATED" : "DEACTIVATED"}`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer shrink-0 ${
                  examFreeze
                    ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {examFreeze ? "Freeze Active" : "Enable Freeze"}
              </button>
            </div>

            {/* Row 2: Nocturnal Quiet Hours (23:00 - 07:30) */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Nocturnal Quiet Hours (23:00 – 07:30)
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                      quietHours
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {quietHours ? "HOLD" : "OFF"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Hold push notifications overnight and deliver at 07:30 morning digest
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  applyImmediatePatch(
                    { quietHoursEnabled: !quietHours },
                    "Toggled nocturnal quiet hours",
                    `Nocturnal Quiet Hours (23:00–07:30) ${!quietHours ? "ENABLED" : "DISABLED"}`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer shrink-0 ${
                  quietHours
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {quietHours ? "Active" : "Disabled"}
              </button>
            </div>

            {/* Row 3: Max Simultaneous Active Tasks per Member */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">
                  Max Simultaneous Active Tasks per Member
                </div>
                <p className="text-[11px] text-slate-500">
                  Prevents burnout by capping concurrent unvalidated tasks (1 to 5)
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={formState.maxActiveTasksPerMember}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      maxActiveTasksPerMember: Math.max(1, Math.min(5, Number(e.target.value))),
                    })
                  }
                  className="w-16 px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-[#E2EDF8] font-mono text-xs font-extrabold text-slate-900 text-center tabular-nums"
                />
                <span className="text-[11px] font-mono font-bold text-slate-400">tasks</span>
              </div>
            </div>

            {/* Row 4: Weekly Student Workload Cap (Hours) */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">
                  Weekly Student Workload Cap (Hours)
                </div>
                <p className="text-[11px] text-slate-500">
                  Recommended weekly club commitment ceiling per student (3 to 10 hrs)
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={formState.weeklyWorkloadCapHours ?? 6}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      weeklyWorkloadCapHours: Math.max(3, Math.min(10, Number(e.target.value))),
                    })
                  }
                  className="w-16 px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-[#E2EDF8] font-mono text-xs font-extrabold text-slate-900 text-center tabular-nums"
                />
                <span className="text-[11px] font-mono font-bold text-slate-400">hrs/wk</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: HR QUALIFICATION & POINTS THRESHOLDS */}
        <div className="bg-white rounded-2xl border border-[#E2EDF8] shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-[#E2EDF8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1D63EB]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                4. HR Qualification &amp; Points Thresholds
              </h2>
            </div>
          </div>

          <form onSubmit={handleSaveAllThresholds} className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Trainee Qualification Period */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E2EDF8] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Trainee Period</div>
                  <div className="text-[10px] text-slate-400">Months before Active</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formState.traineeDurationMonths}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        traineeDurationMonths: Number(e.target.value),
                      })
                    }
                    className="w-14 px-2 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-extrabold text-center tabular-nums"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-400">mo</span>
                </div>
              </div>

              {/* Minimum Attendance Rate */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E2EDF8] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Min Attendance Rate</div>
                  <div className="text-[10px] text-slate-400">Qualification target</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={formState.confirmationAttendanceThreshold}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        confirmationAttendanceThreshold: Number(e.target.value),
                      })
                    }
                    className="w-14 px-2 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-extrabold text-center tabular-nums"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-400">%</span>
                </div>
              </div>

              {/* Active Confirmation Bonus (XP) */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E2EDF8] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Confirmation Bonus</div>
                  <div className="text-[10px] text-slate-400">Trainee → Active XP</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step={10}
                    value={formState.confirmationXpThreshold}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        confirmationXpThreshold: Number(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-extrabold text-emerald-700 text-center tabular-nums"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-400">XP</span>
                </div>
              </div>

              {/* Inactivity Flag Threshold (Days) */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E2EDF8] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Inactivity Flag</div>
                  <div className="text-[10px] text-slate-400">Auto-flag in HR Cases</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={7}
                    max={90}
                    value={formState.inactivityFlagDays}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        inactivityFlagDays: Number(e.target.value),
                      })
                    }
                    className="w-14 px-2 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-extrabold text-center tabular-nums"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-400">days</span>
                </div>
              </div>

              {/* Points Appeal Window (Hours) */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E2EDF8] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Points Appeal Window</div>
                  <div className="text-[10px] text-slate-400">Deduction contest limit</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={12}
                    max={168}
                    value={formState.pointsAppealWindowHours}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        pointsAppealWindowHours: Number(e.target.value),
                      })
                    }
                    className="w-14 px-2 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-extrabold text-center tabular-nums"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-400">hrs</span>
                </div>
              </div>

              {/* Scientific Team Target Size (Min - Max) */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E2EDF8] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Team Target Size</div>
                  <div className="text-[10px] text-slate-400">Min – Max members</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={formState.teamSizeMin}
                    onChange={(e) =>
                      setFormState({ ...formState, teamSizeMin: Number(e.target.value) })
                    }
                    className="w-11 px-1.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-extrabold text-center tabular-nums"
                  />
                  <span className="text-xs font-bold text-slate-400">–</span>
                  <input
                    type="number"
                    min={3}
                    max={25}
                    value={formState.teamSizeMax}
                    onChange={(e) =>
                      setFormState({ ...formState, teamSizeMax: Number(e.target.value) })
                    }
                    className="w-11 px-1.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-extrabold text-center tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Changes are logged in the immutable Audit Trail
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#06182C] hover:bg-[#0B2E59] text-white text-xs font-bold transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#38E4FF]" />
                <span>Apply Thresholds</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* COMPACT DATABASE & BACKUP BAR */}
      <div className="bg-white p-3.5 sm:px-5 rounded-2xl border border-[#E2EDF8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#1D63EB]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">
                Database &amp; State Snapshot Engine
              </span>
              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                HEALTHY · {telemetry.dbSizeKB} KB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              {telemetry.memberCount} members · {state.ledger.length} ledger rows ·{" "}
              {state.auditLogs.length} audit logs · Quota used: {telemetry.quotaUsedPercent}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>Sync Now</span>
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#06182C] hover:bg-[#0B2E59] text-white text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#38E4FF]" />
            <span>Export Full State JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
