"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  Edit2,
  GraduationCap,
  Link2,
  Moon,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { DEFAULT_RANK_LEVELS, RankLevelThreshold, SystemSettings } from "@/lib/types/erp";
import { copyToClipboardReliable } from "@/lib/utils/memberKeyboardJump";

interface ErpTelemetry {
  dbSizeBytes: number;
  dbSizeKB: number;
  memberCount: number;
  quotaUsedPercent: number;
  estimatedDailyReadsPerUser?: number;
  estimatedDailyWritesPerUser?: number;
  firebaseSparkMaxUsers?: number;
  quotaReductionPercent?: number;
}

export default function AdminSettingsPage() {
  const settings = useQuantersStore((s) => s.settings);
  const updateSettings = useQuantersStore((s) => s.updateSettings);
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);
  const compactAndPruneQuota = useQuantersStore((s) => s.compactAndPruneQuota);
  const activeAdminRole = useQuantersStore((s) => s.activeAdminRole);
  const membersCount = useQuantersStore((s) => s.members.length);
  const ledgerCount = useQuantersStore((s) => s.ledger.length);
  const auditLogsCount = useQuantersStore((s) => s.auditLogs.length);

  const [formState, setFormState] = useState<SystemSettings>({
    ...settings,
    onboardingAutoApprove: settings.onboardingAutoApprove ?? true,
    qrRotationSeconds: settings.qrRotationSeconds ?? 30,
    checkinGraceMinutes: settings.checkinGraceMinutes ?? 15,
    waitlistAutoPromote: settings.waitlistAutoPromote ?? true,
    examFreezeMode: settings.examFreezeMode ?? false,
    quietHoursEnabled: settings.quietHoursEnabled ?? true,
    weeklyWorkloadCapHours: settings.weeklyWorkloadCapHours ?? 6,
    quotaSaverPreset: settings.quotaSaverPreset ?? "aggressive",
    syncStrategy: settings.syncStrategy ?? "debounced_30s",
    clientCacheTtlMinutes: settings.clientCacheTtlMinutes ?? 15,
    deltaSyncOnly: settings.deltaSyncOnly ?? true,
    disableVideoOnCellular: settings.disableVideoOnCellular ?? true,
    autoCompactHistoryLimit: settings.autoCompactHistoryLimit ?? 100,
  });

  const [banner, setBanner] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [telemetry, setTelemetry] = useState<ErpTelemetry>({
    dbSizeBytes: 43820,
    dbSizeKB: 42.8,
    memberCount: membersCount,
    quotaUsedPercent: 0.08,
    estimatedDailyReadsPerUser: 10,
    estimatedDailyWritesPerUser: 5,
    firebaseSparkMaxUsers: 4000,
    quotaReductionPercent: 85,
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

  // Advanced & Developer Options Accordion (collapsed by default)
  const [devOptionsExpanded, setDevOptionsExpanded] = useState(false);
  // Member Rank Levels Accordion (collapsed by default, expandable on demand)
  const [rankLevelsExpanded, setRankLevelsExpanded] = useState(false);

  // Dynamic Member Rank Levels & XP Progression System
  const rankLevels: RankLevelThreshold[] =
    formState.rankLevels && formState.rankLevels.length > 0
      ? formState.rankLevels
      : DEFAULT_RANK_LEVELS;

  const [editingRankLevel, setEditingRankLevel] = useState<RankLevelThreshold | null>(null);
  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [levelForm, setLevelForm] = useState<RankLevelThreshold>({
    level: 1,
    minXp: 0,
    maxXp: 999,
    title: "Novice Quanter",
    badgeName: "Novice",
    colorHex: "#38BDF8",
  });

  const handleOpenAddRank = () => {
    const nextLevel = rankLevels.length + 1;
    const lastLevel = rankLevels[rankLevels.length - 1];
    const nextMinXp = lastLevel
      ? typeof lastLevel.maxXp === "number"
        ? lastLevel.maxXp + 1
        : lastLevel.minXp + 1000
      : 0;
    setLevelForm({
      level: nextLevel,
      minXp: nextMinXp,
      maxXp: nextMinXp + 999,
      title: `Rank Lv. ${nextLevel}`,
      badgeName: "Scholar",
      colorHex: "#38BDF8",
    });
    setEditingRankLevel(null);
    setRankModalOpen(true);
  };

  const handleOpenEditRank = (rank: RankLevelThreshold) => {
    setEditingRankLevel(rank);
    setLevelForm({ ...rank });
    setRankModalOpen(true);
  };

  const handleSaveRankLevel = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: RankLevelThreshold[];
    if (editingRankLevel) {
      updated = rankLevels.map((r) =>
        r.level === editingRankLevel.level ? { ...levelForm } : r
      );
    } else {
      updated = [...rankLevels, { ...levelForm }];
    }
    updated.sort((a, b) => a.level - b.level);
    applyImmediatePatch(
      { rankLevels: updated },
      `Updated Rank Level Lv. ${levelForm.level} (${levelForm.title})`,
      `Saved Rank Level Lv. ${levelForm.level} (${levelForm.title})`
    );
    setRankModalOpen(false);
  };

  const handleDeleteRankLevel = (levelNum: number) => {
    if (rankLevels.length <= 1) {
      alert("At least one rank level must remain in the progression system.");
      return;
    }
    if (!window.confirm(`Delete Rank Level Lv. ${levelNum}?`)) return;
    const updated = rankLevels.filter((r) => r.level !== levelNum);
    applyImmediatePatch(
      { rankLevels: updated },
      `Deleted Rank Level Lv. ${levelNum}`,
      `Deleted Rank Level Lv. ${levelNum}`
    );
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
    const fullState = useQuantersStore.getState();
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      season: settings.currentSeasonLabel,
      departments: fullState.departments,
      teams: fullState.teams,
      members: fullState.members,
      workshops: fullState.workshops,
      tasks: fullState.tasks,
      pointRules: fullState.pointRules,
      ledger: fullState.ledger,
      badges: fullState.badges,
      exams: fullState.exams,
      projectSubmissions: fullState.projectSubmissions,
      proposals: fullState.proposals,
      explorePosts: fullState.explorePosts,
      messages: fullState.messages,
      accessGrants: fullState.accessGrants,
      auditLogs: fullState.auditLogs,
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
    URL.revokeObjectURL(url);
    setBanner("Exported full platform state JSON backup");
  };

  if (activeAdminRole !== "Super Admin" && activeAdminRole !== "Executive") {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto my-12 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 font-display">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Super Admin role is strictly required to modify platform governance parameters and operational quotas.
        </p>
      </div>
    );
  }

  const regOpen = formState.registrationOpen;
  const alumniActive = formState.alumniAccessGlobal;
  const autoApprove = formState.onboardingAutoApprove ?? true;
  const qrSec = formState.qrRotationSeconds ?? 30;
  const graceMin = formState.checkinGraceMinutes ?? 15;
  const waitlistAuto = formState.waitlistAutoPromote ?? true;
  const examFreeze = formState.examFreezeMode ?? false;
  const quietHours = formState.quietHoursEnabled ?? true;

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
      {/* Top Header — Member App Editorial Style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
            SYSTEM CONFIGURATION · {formState.currentSeasonLabel}
          </span>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
              Platform &amp; Governance Settings
            </h1>
          </div>
          <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
            Access gates, QR security protocols, academic protection rules, and HR qualification thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveAllThresholds()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0284C7]" />
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
                  <span className="text-xs font-bold text-[#0F1E36]">Member Registration Gate</span>
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
                  <span className="text-xs font-bold text-[#0F1E36]">Alumni Portal Access</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                      alumniActive
                        ? "bg-sky-50 text-[#0284C7] border-sky-200"
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
                    : "bg-[#182C4E] text-white border-[#182C4E]"
                }`}
              >
                {alumniActive ? "Mute" : "Activate"}
              </button>
            </div>

            {/* Row 3: Onboarding Admission Mode */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">Onboarding Admission Mode</div>
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
                    autoApprove ? "bg-white text-[#0284C7] shadow-2xs" : "text-slate-600"
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
                    !autoApprove ? "bg-white text-[#0284C7] shadow-2xs" : "text-slate-600"
                  }`}
                >
                  HR Approval
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ATTENDANCE & QR SECURITY */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#0284C7]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                2. Attendance &amp; QR Security
              </h2>
            </div>
          </div>

          <div className="p-4 divide-y divide-slate-100 space-y-3 flex-1">
            {/* Row 1: Projector QR Rotation Interval */}
            <div className="flex items-center justify-between gap-3 pt-0">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">
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
                      qrSec === sec ? "bg-white text-[#0284C7] shadow-2xs" : "text-slate-600"
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
                <div className="text-xs font-bold text-[#0F1E36]">Check-In Grace Window</div>
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
                      graceMin === min ? "bg-white text-[#0284C7] shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Waitlist Auto-Promotion */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0F1E36]">Waitlist Auto-Promotion</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                      waitlistAuto
                        ? "bg-sky-50 text-[#0284C7] border-sky-200"
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
                    ? "bg-sky-50 text-[#0284C7] border-sky-200 hover:bg-sky-100"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {waitlistAuto ? "Auto-Promote" : "Manual"}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: ACADEMIC PROTECTION & WORKLOAD GOVERNANCE */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#0284C7]" />
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
                  <span className="text-xs font-bold text-[#0F1E36]">
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
                  <span className="text-xs font-bold text-[#0F1E36]">
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
                <div className="text-xs font-bold text-[#0F1E36]">
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
                  className="w-16 px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-slate-200/90 font-mono text-xs font-extrabold text-[#0F1E36] text-center tabular-nums"
                />
                <span className="text-[11px] font-mono font-bold text-slate-400">tasks</span>
              </div>
            </div>

            {/* Row 4: Weekly Student Workload Cap (Hours) */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">
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
                  className="w-16 px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-slate-200/90 font-mono text-xs font-extrabold text-[#0F1E36] text-center tabular-nums"
                />
                <span className="text-[11px] font-mono font-bold text-slate-400">hrs/wk</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: HR QUALIFICATION & POINTS THRESHOLDS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0284C7]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                4. HR Qualification &amp; Points Thresholds
              </h2>
            </div>
          </div>

          <form onSubmit={handleSaveAllThresholds} className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Trainee Qualification Period */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex items-center justify-between gap-2">
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
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex items-center justify-between gap-2">
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
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex items-center justify-between gap-2">
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
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex items-center justify-between gap-2">
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
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex items-center justify-between gap-2">
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
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex items-center justify-between gap-2">
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#38E4FF]" />
                <span>Apply Thresholds</span>
              </button>
            </div>
          </form>
        </div>
      </div>

            {/* SECTION 5: MEMBER RANK LEVELS & XP PROGRESSION SYSTEM (COLLAPSIBLE ACCORDION) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setRankLevelsExpanded(!rankLevelsExpanded)}
          className="w-full px-4 py-3 bg-[#F8FAFD] hover:bg-slate-100/80 transition flex items-center justify-between gap-3 text-left cursor-pointer border-b border-slate-200/90"
        >
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-[#0284C7] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  5. Member Rank Levels &amp; XP Progression System
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
                  {rankLevels.length} Progression Tiers
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Configure XP thresholds, rank titles, and emblems across all {rankLevels.length} progression tiers (Lv. 1 {rankLevels[0]?.title || "Novice"} to Lv. {rankLevels[rankLevels.length - 1]?.level || 10} {rankLevels[rankLevels.length - 1]?.title || "Luminary"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono font-semibold text-slate-500 hidden sm:inline">
              {rankLevelsExpanded ? "Collapse" : "Expand"}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                rankLevelsExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {rankLevelsExpanded && (
          <div className="p-4 space-y-4 animate-rise">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="text-xs text-slate-500">
                Dynamic rank level calculation automatically updates member rank titles upon XP award.
              </span>
              <button
                type="button"
                onClick={handleOpenAddRank}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rank Level</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-50/60">
                    <th className="py-2.5 px-3">Level</th>
                    <th className="py-2.5 px-3">Rank Title</th>
                    <th className="py-2.5 px-3">XP Threshold</th>
                    <th className="py-2.5 px-3">Emblem / Badge</th>
                    <th className="py-2.5 px-3">Color Accent</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankLevels.map((rank) => (
                    <tr key={rank.level} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-mono font-black text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#182C4E] text-white font-mono font-bold text-[11px]">
                          Lv. {rank.level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {rank.title}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 whitespace-nowrap">
                        {typeof rank.maxXp === "number"
                          ? `${rank.minXp.toLocaleString()} – ${rank.maxXp.toLocaleString()} XP`
                          : `${rank.minXp.toLocaleString()}+ XP`}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{rank.badgeName || "Emblem"}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: rank.colorHex || "#38BDF8" }}
                          />
                          <span className="font-mono text-[10.5px] text-slate-500">
                            {rank.colorHex || "#38BDF8"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditRank(rank)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            title="Edit Rank Level"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRankLevel(rank.level)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Rank Level"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADVANCED & DEVELOPER OPTIONS (COLLAPSIBLE ACCORDION - COLLAPSED BY DEFAULT) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setDevOptionsExpanded(!devOptionsExpanded)}
          className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#182C4E] text-white flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#38E4FF]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Advanced &amp; Developer Options
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600 text-[10px] font-mono">
                  {devOptionsExpanded ? "Expanded" : "Click to Expand"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Firebase Free-Tier &amp; User Quota Optimizer, Database Snapshots, and WAL Engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              {devOptionsExpanded ? "Hide" : "Show"}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                devOptionsExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {devOptionsExpanded && (
          <div className="p-4 space-y-6 border-t border-slate-200/90 animate-rise bg-[#FAFBFD]">
            {/* SUB-SECTION: FIREBASE FREE-TIER & USER QUOTA OPTIMIZER */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0284C7]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Firebase Free-Tier &amp; User Quota Optimizer
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold">
                    {formState.quotaSaverPreset === "ultra"
                      ? "94% QUOTA SAVED"
                      : formState.quotaSaverPreset === "aggressive"
                        ? "85% QUOTA SAVED"
                        : "STANDARD MODE"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                  <span>
                    Est. Spark Free-Tier Capacity:{" "}
                    <strong className="text-[#0284C7]">
                      {formState.quotaSaverPreset === "ultra"
                        ? "10,000"
                        : formState.quotaSaverPreset === "aggressive"
                          ? "4,000"
                          : "700"}{" "}
                      Daily Active Users
                    </strong>
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Row A: 3 One-Click Quota Presets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      key: "standard" as const,
                      title: "Standard Mode",
                      badge: "0% Reduction",
                      desc: "Instant read/write sync · 256px WebP avatars · 5m local cache TTL",
                      patch: {
                        quotaSaverPreset: "standard" as const,
                        syncStrategy: "instant" as const,
                        clientCacheTtlMinutes: 5,
                        maxImageDimensionPx: 256,
                        webpCompressionQuality: 82,
                        disableVideoOnCellular: false,
                      },
                    },
                    {
                      key: "aggressive" as const,
                      title: "Aggressive Quota-Saver",
                      badge: "Recommended · -85% Reads/Writes",
                      desc: "30s batched writes · ETag 304 cache (15m TTL) · 160px WebP avatars (~8 KB)",
                      patch: {
                        quotaSaverPreset: "aggressive" as const,
                        syncStrategy: "debounced_30s" as const,
                        clientCacheTtlMinutes: 15,
                        maxImageDimensionPx: 160,
                        webpCompressionQuality: 75,
                        disableVideoOnCellular: true,
                      },
                    },
                    {
                      key: "ultra" as const,
                      title: "Ultra Free-Tier Mode",
                      badge: "Max Savings · -94% Quota",
                      desc: "Offline-first manual/exit sync · 60m cache TTL · 128px WebP (~4 KB) · Static hero poster",
                      patch: {
                        quotaSaverPreset: "ultra" as const,
                        syncStrategy: "manual_offline" as const,
                        clientCacheTtlMinutes: 60,
                        maxImageDimensionPx: 128,
                        webpCompressionQuality: 65,
                        disableVideoOnCellular: true,
                      },
                    },
                  ].map((item) => {
                    const active = (formState.quotaSaverPreset || "aggressive") === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          applyImmediatePatch(
                            item.patch,
                            `Switched Firebase Quota Optimizer preset to ${item.title}`,
                            `Activated ${item.title} (${item.badge})`
                          )
                        }
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                          active
                            ? "bg-[#EBF3FC] border-[#182C4E] shadow-xs"
                            : "bg-[#F8FAFD] border-slate-200/90 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-[#0F1E36]">
                              {item.title}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold ${
                                active
                                  ? "bg-[#182C4E] text-white"
                                  : "bg-slate-200/80 text-slate-700"
                              }`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Row B: Fine-Grained Quota & Offline Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {/* Write Sync Strategy */}
                  <div className="p-3 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Write Sync Strategy</div>
                      <div className="text-[10px] text-slate-500">Controls Firestore write frequency</div>
                    </div>
                    <select
                      value={formState.syncStrategy || "debounced_30s"}
                      onChange={(e) =>
                        applyImmediatePatch(
                          {
                            syncStrategy: e.target.value as SystemSettings["syncStrategy"],
                          },
                          "Updated write sync strategy",
                          `Write sync strategy set to ${e.target.value}`
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value="instant">Instant (Every Action)</option>
                      <option value="debounced_30s">Batched (30s Coalesced)</option>
                      <option value="manual_offline">Offline-First (Manual / Reconnect)</option>
                    </select>
                  </div>

                  {/* Client Local Cache TTL */}
                  <div className="p-3 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Client Cache TTL</div>
                      <div className="text-[10px] text-slate-500">How long data stays cached</div>
                    </div>
                    <select
                      value={formState.clientCacheTtlMinutes ?? 15}
                      onChange={(e) =>
                        applyImmediatePatch(
                          { clientCacheTtlMinutes: Number(e.target.value) },
                          "Updated client cache TTL",
                          `Client cache TTL set to ${e.target.value} minutes`
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value={5}>5 minutes</option>
                      <option value={15}>15 minutes (Standard)</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes (Ultra-Saver)</option>
                    </select>
                  </div>

                  {/* Max Image Dimension */}
                  <div className="p-3 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Avatar Max Bounds</div>
                      <div className="text-[10px] text-slate-500">Canvas compression target</div>
                    </div>
                    <select
                      value={formState.maxImageDimensionPx ?? 160}
                      onChange={(e) =>
                        applyImmediatePatch(
                          { maxImageDimensionPx: Number(e.target.value) },
                          "Updated max avatar dimension",
                          `Avatar max bounds set to ${e.target.value}px`
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value={128}>128×128px (~4 KB)</option>
                      <option value={160}>160×160px (~8 KB)</option>
                      <option value={256}>256×256px (~18 KB)</option>
                    </select>
                  </div>

                  {/* Prune Quota Button */}
                  <div className="p-3 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Auto-Compact WAL</div>
                      <div className="text-[10px] text-slate-500">Prune history &amp; free payload</div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const res = compactAndPruneQuota();
                        await syncWithServer(true);
                        setBanner(
                          `Compacted database payload: saved ${res.bytesSaved} bytes (${res.prunedCount} stale archived notices pruned)`
                        );
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Compact &amp; Free Quota</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SUB-SECTION: DATABASE & STATE SNAPSHOT ENGINE */}
            <div className="bg-white p-3.5 sm:px-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0284C7]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0F1E36]">
                      Database &amp; State Snapshot Engine
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      HEALTHY · {telemetry.dbSizeKB} KB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {telemetry.memberCount} members · {ledgerCount} ledger rows ·{" "}
                    {auditLogsCount} audit logs · Quota used: {telemetry.quotaUsedPercent}%
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#38E4FF]" />
                  <span>Export Full State JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT RANK LEVEL MODAL */}
      {rankModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#182C4E] text-white">
                  <Award className="w-4 h-4 text-[#38E4FF]" />
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {editingRankLevel ? `Edit Rank Lv. ${levelForm.level}` : "Add New Rank Level"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRankModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRankLevel} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Level Number *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={levelForm.level}
                    onChange={(e) =>
                      setLevelForm({ ...levelForm, level: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Badge Emblem Name
                  </label>
                  <input
                    type="text"
                    required
                    value={levelForm.badgeName || ""}
                    onChange={(e) =>
                      setLevelForm({ ...levelForm, badgeName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Official Rank Title *
                </label>
                <input
                  type="text"
                  required
                  value={levelForm.title}
                  onChange={(e) =>
                    setLevelForm({ ...levelForm, title: e.target.value })
                  }
                  placeholder="e.g. Quantum Explorer, Lab Specialist..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Minimum XP *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={levelForm.minXp}
                    onChange={(e) =>
                      setLevelForm({ ...levelForm, minXp: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Maximum XP
                  </label>
                  <input
                    type="number"
                    min={levelForm.minXp}
                    value={levelForm.maxXp ?? ""}
                    onChange={(e) =>
                      setLevelForm({
                        ...levelForm,
                        maxXp: e.target.value === "" ? undefined : parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="Infinity / Unbounded"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Color Accent (Hex Code)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={levelForm.colorHex || "#38BDF8"}
                    onChange={(e) =>
                      setLevelForm({ ...levelForm, colorHex: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={levelForm.colorHex || "#38BDF8"}
                    onChange={(e) =>
                      setLevelForm({ ...levelForm, colorHex: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRankModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingRankLevel ? "Save Rank Level" : "Create Rank Level"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
