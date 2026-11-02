"use client";

import React, { useEffect, useState } from "react";
import {
  verifyEmailWithFailover,
  VerificationProviderKey,
} from "@/lib/utils/emailVerification";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  Edit2,
  GraduationCap,
  Globe,
  Link2,
  LogOut,
  Mail,
  Moon,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Terminal,
  Trash2,
  Users,
  UserX,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { DEFAULT_RANK_LEVELS, RankLevelThreshold, SystemSettings } from "@/lib/types/erp";
import { copyToClipboardReliable } from "@/lib/utils/memberKeyboardJump";
import { useTranslation } from "@/lib/i18n/useTranslation";

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
  const { t, lang, setLanguage, isRtl } = useTranslation();
  const settings = useQuantersStore((s) => s.settings);
  const updateSettings = useQuantersStore((s) => s.updateSettings);
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);
  const compactAndPruneQuota = useQuantersStore((s) => s.compactAndPruneQuota);
  const activeAdminRole = useQuantersStore((s) => s.activeAdminRole);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);
  const forceLogoutAllSessions = useQuantersStore((s) => s.forceLogoutAllSessions);
  const forceLogoutSpecificMember = useQuantersStore((s) => s.forceLogoutSpecificMember);
  const restoreMemberSessionAccess = useQuantersStore((s) => s.restoreMemberSessionAccess);
  const membersCount = useQuantersStore((s) => s.members.length);
  const ledgerCount = useQuantersStore((s) => s.ledger.length);
  const auditLogsCount = useQuantersStore((s) => s.auditLogs.length);



  const [formState, setFormState] = useState<SystemSettings>({
    ...settings,
    onboardingAutoApprove: settings.onboardingAutoApprove ?? false,
    qrRotationSeconds: settings.qrRotationSeconds ?? 30,
    checkinGraceMinutes: settings.checkinGraceMinutes ?? 15,
    waitlistAutoPromote: settings.waitlistAutoPromote ?? true,
    examFreezeMode: settings.examFreezeMode ?? false,
    quietHoursEnabled: settings.quietHoursEnabled ?? true,
    weeklyWorkloadCapHours: settings.weeklyWorkloadCapHours ?? 6,
    examRetakeCooldownHours: settings.examRetakeCooldownHours ?? 24,
    quotaSaverPreset: settings.quotaSaverPreset ?? "aggressive",
    syncStrategy: settings.syncStrategy ?? "debounced_30s",
    clientCacheTtlMinutes: settings.clientCacheTtlMinutes ?? 15,
    deltaSyncOnly: settings.deltaSyncOnly ?? true,
    disableVideoOnCellular: settings.disableVideoOnCellular ?? true,
    autoCompactHistoryLimit: settings.autoCompactHistoryLimit ?? 100,
  });

  // Keep formState strictly synchronized with external store/Firestore updates
  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      ...settings,
      onboardingAutoApprove:
        typeof settings.onboardingAutoApprove === "boolean"
          ? settings.onboardingAutoApprove
          : prev.onboardingAutoApprove ?? false,
    }));
  }, [settings]);

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
    formState.rankLevels && formState.rankLevels.length > 0 && formState.rankLevels[0]?.title?.includes("Wooden")
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
  const autoApprove =
    typeof formState.onboardingAutoApprove === "boolean"
      ? formState.onboardingAutoApprove
      : typeof settings.onboardingAutoApprove === "boolean"
      ? settings.onboardingAutoApprove
      : false;
  const welcomeMsgEnabled = formState.welcomeMessageEnabled ?? true;
  const emailVerifyEnabled = formState.emailVerificationEnabled ?? true;
  const [testEmailInput, setTestEmailInput] = useState("");
  const [testEmailResult, setTestEmailResult] = useState<any>(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  const handleTestEmailVerification = async () => {
    if (!testEmailInput.trim()) return;
    setTestEmailLoading(true);
    setTestEmailResult(null);
    try {
      const keys: VerificationProviderKey[] = [];
      if (formState.zerobounceApiKey1) keys.push({ provider: "zerobounce", key: formState.zerobounceApiKey1, label: "ZeroBounce #1" });
      if (formState.zerobounceApiKey2) keys.push({ provider: "zerobounce", key: formState.zerobounceApiKey2, label: "ZeroBounce #2" });
      if (formState.abstractApiKey1) keys.push({ provider: "abstract", key: formState.abstractApiKey1, label: "AbstractAPI #1" });
      if (formState.abstractApiKey2) keys.push({ provider: "abstract", key: formState.abstractApiKey2, label: "AbstractAPI #2" });

      const res = await verifyEmailWithFailover(testEmailInput.trim(), keys);
      setTestEmailResult(res);
    } catch (err: any) {
      setTestEmailResult({
        valid: false,
        deliverable: false,
        status: "invalid",
        reason: err?.message || "Verification request failed",
      });
    } finally {
      setTestEmailLoading(false);
    }
  };
  const qrSec = formState.qrRotationSeconds ?? 30;
  const graceMin = formState.checkinGraceMinutes ?? 15;
  const waitlistAuto = formState.waitlistAutoPromote ?? true;
  const examFreeze = formState.examFreezeMode ?? false;
  const quietHours = formState.quietHoursEnabled ?? true;

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto">
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

      {/* PLATFORM LOCALIZATION & DIRECTION SWITCHER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shadow-xs">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0F1E36]">
              {lang === "ar" ? "لغة المنصة والواجهة" : "Platform Language & Layout Direction"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {lang === "ar"
                ? "التبديل الفوري بين واجهة المنصة باللغة العربية (RTL) أو الإنجليزية (LTR) وحفظ الإعداد الافتراضي"
                : "Instant hot-switching between Arabic (RTL) and English (LTR) with system default persistence"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#F1F5F9] border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              setLanguage("en");
              applyImmediatePatch({ defaultLanguage: "en" }, "Language Switch", "Switched platform interface to English (LTR)");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              lang === "en"
                ? "bg-white text-[#0F1E36] shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🇬🇧</span>
            <span>English (LTR)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLanguage("ar");
              applyImmediatePatch({ defaultLanguage: "ar" }, "Language Switch", "تم تبديل واجهة المنصة إلى اللغة العربية (RTL)");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer font-cairo ${
              lang === "ar"
                ? "bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🇩🇿</span>
            <span>العربية (RTL)</span>
          </button>
        </div>
      </div>

      {/* 2-SECTION CORE GATES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* SECTION 1: ACCESS & REGISTRATION CONTROLS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0284C7]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Access &amp; Registration Controls
              </h2>
            </div>
          </div>

          <div className="p-4 divide-y divide-slate-100 space-y-3">
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
                  {autoApprove
                    ? "Auto-Accepted: New applicants directly gain Trainee access upon completing registration."
                    : "HR Approval: Members see the Waiting Gate screen until reviewed and approved by HR."}
                </p>
              </div>

              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    applyImmediatePatch(
                      { onboardingAutoApprove: true },
                      "Set onboarding mode to Auto-Accepted",
                      "Onboarding Admission Mode: Auto-Accepted"
                    )
                  }
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    autoApprove ? "bg-white text-[#0284C7] shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Auto-Accepted
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyImmediatePatch(
                      { onboardingAutoApprove: false },
                      "Set onboarding mode to HR Approval Required",
                      "Onboarding Admission Mode: HR Approval Required"
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#0284C7]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Attendance &amp; QR Security
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

      </div>

      {/* DEDICATED FULL-WIDTH: POST-ADMISSION AUTOMATED WELCOME NOTICE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0284C7]" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Post-Admission Automated Welcome Notice
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              Auto-Dispatch On Approval
            </span>
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                setFormState((prev) => ({ ...prev, welcomeMessageEnabled: true }));
                applyImmediatePatch(
                  { welcomeMessageEnabled: true },
                  "Enabled post-admission welcome message",
                  "Welcome Message: Enabled"
                );
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                welcomeMsgEnabled ? "bg-white text-[#0284C7] shadow-2xs" : "text-slate-600"
              }`}
            >
              Enabled
            </button>
            <button
              type="button"
              onClick={() => {
                setFormState((prev) => ({ ...prev, welcomeMessageEnabled: false }));
                applyImmediatePatch(
                  { welcomeMessageEnabled: false },
                  "Disabled post-admission welcome message",
                  "Welcome Message: Disabled"
                );
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                !welcomeMsgEnabled ? "bg-white text-rose-600 shadow-2xs" : "text-slate-600"
              }`}
            >
              Disabled
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-[11.5px] text-slate-500 leading-relaxed max-w-3xl">
            Automatically sends an official personalized notification to members upon admission approval when they first open and navigate the platform. Delivered directly to their in-app inbox and archived after first read.
          </p>

          {welcomeMsgEnabled && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
              {/* Left Column: Metadata */}
              <div className="lg:col-span-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Sender Label
                    </label>
                    <input
                      type="text"
                      value={formState.welcomeMessageSenderLabel ?? "QUANTA Executive Bureau"}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          welcomeMessageSenderLabel: e.target.value,
                        }))
                      }
                      onBlur={() =>
                        applyImmediatePatch(
                          { welcomeMessageSenderLabel: formState.welcomeMessageSenderLabel ?? "QUANTA Executive Bureau" },
                          "Updated welcome message sender label",
                          `Sender: ${formState.welcomeMessageSenderLabel ?? "QUANTA Executive Bureau"}`
                        )
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#0284C7]"
                      placeholder="e.g. QUANTA Executive Bureau"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Sender Department / Role
                    </label>
                    <select
                      value={formState.welcomeMessageSenderRole ?? "Executive"}
                      onChange={(e) => {
                        const val = e.target.value as "Executive" | "HR" | "System";
                        setFormState((prev) => ({ ...prev, welcomeMessageSenderRole: val }));
                        applyImmediatePatch(
                          { welcomeMessageSenderRole: val },
                          `Updated welcome message sender role to ${val}`,
                          `Role: ${val}`
                        );
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#0284C7]"
                    >
                      <option value="Executive">Executive Bureau</option>
                      <option value="HR">HR Directorate</option>
                      <option value="System">System Automated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subject / Title
                  </label>
                  <input
                    type="text"
                    value={formState.welcomeMessageTitle ?? "🎉 Welcome to QUANTA! Your Admission is Approved"}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        welcomeMessageTitle: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      applyImmediatePatch(
                        { welcomeMessageTitle: formState.welcomeMessageTitle ?? "🎉 Welcome to QUANTA! Your Admission is Approved" },
                        "Updated welcome message title",
                        `Title: ${formState.welcomeMessageTitle ?? "🎉 Welcome to QUANTA! Your Admission is Approved"}`
                      )
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#0284C7]"
                    placeholder="e.g. 🎉 Welcome to QUANTA! Your Admission is Approved"
                  />
                </div>
              </div>

              {/* Right Column: Message Body */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Welcome Message Body
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Dynamic token: <code className="bg-sky-50 text-[#0284C7] px-1 py-0.5 rounded font-bold">{"{name}"}</code> for candidate's name
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={formState.welcomeMessageBody ?? "Congratulations {name}! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau. You now have full access to workshops, projects, quizzes, and community spaces."}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        welcomeMessageBody: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      applyImmediatePatch(
                        { welcomeMessageBody: formState.welcomeMessageBody ?? "Congratulations {name}! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau. You now have full access to workshops, projects, quizzes, and community spaces." },
                        "Updated welcome message body",
                        "Welcome Message Body Saved"
                      )
                    }
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white leading-relaxed font-sans focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-100 text-[11px] text-[#0369A1] font-mono mt-2">
                  Preview: &quot;Congratulations Selma Benali! Your membership application and onboarding dossier...&quot;
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2-SECTION POLICIES & THRESHOLDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* SECTION 3: ACADEMIC PROTECTION & WORKLOAD GOVERNANCE */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#0284C7]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Academic Policies
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

            {/* Row 5: Badge Exam Retake Cooldown */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">
                  Badge Exam Retake Cooldown
                </div>
                <p className="text-[11px] text-slate-500">
                  Mandatory preparation pause after a failed examination attempt
                </p>
              </div>

              <select
                value={formState.examRetakeCooldownHours ?? 24}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    examRetakeCooldownHours: Number(e.target.value),
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-slate-200/90 font-mono text-xs font-bold text-[#0F1E36]"
              >
                <option value={0}>Instant (Practice Mode)</option>
                <option value={24}>24 Hours Cooldown</option>
                <option value={48}>48 Hours Cooldown</option>
                <option value={72}>3 Days Cooldown</option>
                <option value={168}>7 Days (Rigorous)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: HR QUALIFICATION & POINTS THRESHOLDS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0284C7]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                HR &amp; Points
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
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Rank Progression
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
                  {rankLevels.length} Levels
                </span>
              </div>
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
            
            {/* SUB-SECTION: REAL-TIME EMAIL VERIFICATION FAILOVER POOL (DEV MODE) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              {/* Header with Spark Tier status */}
              <div className="px-4 py-3 bg-[#0A1629] text-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#0284C7]/20 border border-[#0284C7]/40 flex items-center justify-center text-[#38BDF8]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Cloud Edge &amp; Firebase Free-Tier Quota Architecture
                  </h3>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {formState.quotaSaverPreset === "ultra"
                      ? "94% QUOTA REDUCTION"
                      : formState.quotaSaverPreset === "aggressive"
                        ? "85% QUOTA REDUCTION"
                        : "STANDARD OPERATING MODE"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
                  <span>Spark Free Plan: <strong className="text-emerald-400">50K Reads / 20K Writes / Day</strong></span>
                </div>
              </div>

              {/* Live Spark Plan Capacity Telemetry Meters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3.5 bg-slate-50/70 border-b border-slate-200/80">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Daily Read Cap</div>
                  <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">50,000 ops / day</div>
                  <div className="h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: formState.quotaSaverPreset === "ultra" ? "6%" : formState.quotaSaverPreset === "aggressive" ? "15%" : "60%" }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Daily Write Cap</div>
                  <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">20,000 ops / day</div>
                  <div className="h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: formState.quotaSaverPreset === "ultra" ? "5%" : formState.quotaSaverPreset === "aggressive" ? "12%" : "45%" }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Free Egress Bandwidth</div>
                  <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">10 GB / month</div>
                  <div className="h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: "8%" }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Simultaneous Conns</div>
                  <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">100 concurrent sockets</div>
                  <div className="h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "14%" }} />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* 3 Architecture Presets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      key: "standard" as const,
                      title: "Standard Real-Time",
                      badge: "Zero Latency",
                      desc: "Instant read/write sync · 5m cache TTL · Real-time WebSocket subscriptions",
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
                      title: "Spark Shield (Recommended)",
                      badge: "-85% Consumption",
                      desc: "30s coalesced write batching · ETag 304 caching (15m TTL) · 160px WebP compression",
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
                      title: "Maximum Quota Protection",
                      badge: "-94% Consumption",
                      desc: "Offline-first manual sync · 60m local cache TTL · 128px WebP · Background video disabled",
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
                            `Switched Firebase Quota Architecture preset to ${item.title}`,
                            `Activated ${item.title} (${item.badge})`
                          )
                        }
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                          active
                            ? "bg-[#EBF3FC] border-[#182C4E] shadow-xs ring-1 ring-[#182C4E]/20"
                            : "bg-[#F8FAFD] border-slate-200/90 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#0F1E36]">
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
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Fine-Grained Infrastructure & Network Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {/* Write Coalescing Strategy */}
                  <div className="p-3 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Write Coalescing Strategy</div>
                      <div className="text-[10px] text-slate-500">Controls Firestore write dispatch</div>
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
                      <option value="instant">Instant (0s dispatch)</option>
                      <option value="debounced_30s">Coalesced (30s batching)</option>
                      <option value="manual_offline">Offline-First (Manual sync)</option>
                    </select>
                  </div>

                  {/* Local Storage Cache TTL */}
                  <div className="p-3 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Local Cache Retention (TTL)</div>
                      <div className="text-[10px] text-slate-500">Browser offline state lifetime</div>
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
                      <option value={5}>5 minutes (Real-time)</option>
                      <option value={15}>15 minutes (Standard)</option>
                      <option value={30}>30 minutes (Moderate)</option>
                      <option value={60}>60 minutes (Ultra-Saver)</option>
                    </select>
                  </div>

                  {/* Media Bandwidth Shield */}
                  <div className="p-3 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Avatar Compression Bounds</div>
                      <div className="text-[10px] text-slate-500">WebP canvas resolution target</div>
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

                  {/* 1-Click Compact WAL & Prune Payload */}
                  <div className="p-3 rounded-xl bg-[#F8FAFD] border border-slate-200/90 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Storage &amp; WAL Purge</div>
                      <div className="text-[10px] text-slate-500">Prune old tombstones &amp; payload</div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const res = compactAndPruneQuota();
                        await syncWithServer(true);
                        setBanner(
                          `Compacted database payload: freed ${res.bytesSaved} bytes (${res.prunedCount} stale notices pruned)`
                        );
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
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
