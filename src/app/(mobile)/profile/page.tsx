"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FolderGit2,
  Globe,
  History,
  Home,
  KeyRound,
  LayoutDashboard,
  Linkedin,
  LogOut,
  Mail,
  MapPin,
  Orbit,
  Pause,
  PauseCircle,
  Pencil,
  Play,
  Plus,
  QrCode,
  Quote,
  RotateCcw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { PersonalQRModal } from "@/components/mobile/PersonalQRModal";
import { PlanetEmblem } from "@/components/shared/PlanetEmblem";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import {
  loadNotificationPrefs,
  NOTIFICATION_PREFS_KEY,
  dispatchSystemNotification,
} from "@/components/shared/PwaOfflineManager";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { signInWithFirebaseGooglePopup } from "@/lib/firebase/auth";
import { sanitizeExternalUrl } from "@/lib/utils/authSecurity";
import { getEffectiveMemberAvatar } from "@/lib/utils/avatarUtils";
import { DEFAULT_AVAILABILITY, FALLBACK_SESSION_MEMBER, getActiveDailyQuote } from "@/lib/data/seed";
import { SignOutConfirmModal } from "@/components/shared/SignOutConfirmModal";
import { EditMemberModal } from "@/components/admin/EditMemberModal";
import {
  AvailabilityGrid,
  CommuteDuration,
  DayOfWeek,
  GrievanceCategory,
  GrievanceUrgency,
  HousingType,
  isMemberAvailableInSlot,
  STUDY_HOUR_SLOTS,
  TimeSlot,
  DEFAULT_RANK_LEVELS,
} from "@/lib/types/erp";

const DAYS: DayOfWeek[] = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
const SLOTS: TimeSlot[] = STUDY_HOUR_SLOTS.map((s) => s.key);

function ProgressRing({
  percent,
  strokeColor,
}: {
  percent: number;
  strokeColor: string;
}) {
  const radius = 15.9155;
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <svg viewBox="0 0 36 36" className="w-12 h-12 mx-auto -rotate-90">
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke="#E2EDF8"
        strokeWidth="3.2"
      />
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3.2"
        strokeDasharray={`${clamped}, 100`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleLogoSvg({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      style={{ width: "18px", height: "18px", minWidth: "18px", minHeight: "18px", maxWidth: "18px", maxHeight: "18px" }}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  );
}

export default function MobileProfilePage() {
  const router = useRouter();
  const { t, lang, setLanguage, isRtl } = useTranslation();
  const members = useQuantersStore((s) => s.members);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const setCurrentMemberId = useQuantersStore((s) => s.setCurrentMemberId);
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);
  const ledger = useQuantersStore((s) => s.ledger);
  const settings = useQuantersStore((s) => s.settings);
  const dailyQuotes = useQuantersStore((s) => s.dailyQuotes);
  const activeAdminRole = useQuantersStore((s) => s.activeAdminRole);
  const updateMemberProfileSelf = useQuantersStore(
    (s) => s.updateMemberProfileSelf
  );
  const submitPointsAppeal = useQuantersStore((s) => s.submitPointsAppeal);
  const changeMemberPassword = useQuantersStore((s) => s.changeMemberPassword);
  const pauseOrResignMembershipSelf = useQuantersStore(
    (s) => s.pauseOrResignMembershipSelf
  );
  const resumeMembershipSelf = useQuantersStore(
    (s) => s.resumeMembershipSelf
  );
  const submitGrievance = useQuantersStore((s) => s.submitGrievance);
  const logout = useQuantersStore((s) => s.logout);
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);
  const userLowDataMode = useQuantersStore((s) => s.userLowDataMode);
  const setUserLowDataMode = useQuantersStore((s) => s.setUserLowDataMode);
  const isOnline = useQuantersStore((s) => s.isOnline);
  const setOnlineStatus = useQuantersStore((s) => s.setOnlineStatus);
  const pendingSyncCount = useQuantersStore((s) => s.pendingSyncCount);
  const lastSyncedAt = useQuantersStore((s) => s.lastSyncedAt);

  const isAuthenticated = useQuantersStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const activeMember =
    isAuthenticated && currentMemberId
      ? members.find((m) => m.id === currentMemberId)
      : undefined;

  React.useEffect(() => {
    if (hydrated && (!isAuthenticated || !currentMemberId || !activeMember)) {
      router.replace("/welcome");
    }
  }, [hydrated, isAuthenticated, currentMemberId, activeMember, router]);

  const member = activeMember || FALLBACK_SESSION_MEMBER;
  const dept = departments.find((d) => d.id === member.departmentId);
  const team = teams.find((t) => t.id === member.teamId);
  const buddy = members.find((m) => m.id === member.buddyId);

  const [qrOpen, setQrOpen] = useState(false);
  const [traineeTrackerOpen, setTraineeTrackerOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkillText, setNewSkillText] = useState("");
  const [appealEntryId, setAppealEntryId] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [editHrModalOpen, setEditHrModalOpen] = useState(false);
  const [adminEditModalOpen, setAdminEditModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleToast, setScheduleToast] = useState<string | null>(null);

  const [notifsActive, setNotifsActive] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const prefs = loadNotificationPrefs();
      return prefs.pushEnabled && ("Notification" in window ? Notification.permission === "granted" : false);
    } catch {
      return false;
    }
  });

  const handleToggleNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (notifsActive) {
      const prefs = loadNotificationPrefs();
      prefs.pushEnabled = false;
      window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
      setNotifsActive(false);
    } else {
      let perm = Notification.permission;
      if (perm === "default") {
        perm = await Notification.requestPermission();
      }
      if (perm === "granted") {
        const prefs = loadNotificationPrefs();
        prefs.pushEnabled = true;
        window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
        setNotifsActive(true);
        dispatchSystemNotification({
          title: "QUANTERS",
          body: "Notifications enabled. You will receive live club updates.",
          url: "/notifications",
        });
      } else {
        alert("Notifications are disabled in your browser settings. Please enable them to receive alerts.");
      }
    }
  };

  // Change Password by Old Email modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldEmailVerify, setOldEmailVerify] = useState("");
  const [newEmailOptional, setNewEmailOptional] = useState("");
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Pause or Resign Membership modal state
  const [pauseResignModalOpen, setPauseResignModalOpen] = useState(false);
  const [prGoogleVerified, setPrGoogleVerified] = useState(false);
  const [prAction, setPrAction] = useState<"pause" | "resign" | "resume">("pause");
  const [prMotif, setPrMotif] = useState("");
  const [prPassword, setPrPassword] = useState("");
  const [prPauseDuration, setPrPauseDuration] = useState("Until end of semester");
  const [prConfirmed, setPrConfirmed] = useState(false);
  const [prError, setPrError] = useState<string | null>(null);

  // Confidential Grievance modal state
  const [grievanceModalOpen, setGrievanceModalOpen] = useState(false);
  const [grvSubject, setGrvSubject] = useState("");
  const [grvCategory, setGrvCategory] =
    useState<GrievanceCategory>("Workload & Tasks");
  const [grvUrgency, setGrvUrgency] = useState<GrievanceUrgency>("Standard");
  const [grvDetails, setGrvDetails] = useState("");
  const [grvAnonymous, setGrvAnonymous] = useState(false);
  const [grvError, setGrvError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQrOpen(false);
        setTraineeTrackerOpen(false);
        setLedgerModalOpen(false);
        setAvatarModalOpen(false);
        setSignOutModalOpen(false);
        setEditHrModalOpen(false);
        setAdminEditModalOpen(false);
        setScheduleModalOpen(false);
        setPasswordModalOpen(false);
        setPauseResignModalOpen(false);
        setGrievanceModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeQuote = getActiveDailyQuote(dailyQuotes, settings);

  // HR & Residence / Links Edit State
  const [editCommune, setEditCommune] = useState(
    member.commune || "Bab Ezzouar"
  );
  const [editWilaya, setEditWilaya] = useState(
    member.wilaya || "Algiers (16)"
  );
  const [editHousing, setEditHousing] = useState<HousingType>(
    member.housingType || "Family Home"
  );
  const [editCommute, setEditCommute] = useState<CommuteDuration>(
    member.commuteTime || "< 30 min"
  );
  const [editGithub, setEditGithub] = useState(member.githubUrl || "");
  const [editLinkedin, setEditLinkedin] = useState(member.linkedinUrl || "");
  const [editPortfolio, setEditPortfolio] = useState(member.portfolioUrl || "");

  // Weekly Schedule Edit State
  const [editAvailability, setEditAvailability] = useState<AvailabilityGrid>(
    member.availability || DEFAULT_AVAILABILITY
  );

  const normalizeDaySlots = (daySlots: TimeSlot[] | undefined): TimeSlot[] => {
    const raw = daySlots || [];
    return SLOTS.filter((slotKey) => isMemberAvailableInSlot(raw, slotKey));
  };

  const toggleSlot = (day: DayOfWeek, slot: TimeSlot) => {
    setEditAvailability((prev) => {
      const current = normalizeDaySlots(prev[day]);
      const updated = current.includes(slot)
        ? current.filter((s) => s !== slot)
        : [...current, slot];
      return { ...prev, [day]: updated };
    });
  };

  const toggleDayAllSlots = (day: DayOfWeek) => {
    setEditAvailability((prev) => {
      const current = normalizeDaySlots(prev[day]);
      return {
        ...prev,
        [day]: current.length === SLOTS.length ? [] : [...SLOTS],
      };
    });
  };

  const handleSaveSchedule = async () => {
    updateMemberProfileSelf(member.id, { availability: editAvailability });
    await syncWithServer();
    setScheduleToast("Weekly availability schedule updated successfully!");
    setScheduleModalOpen(false);
    setTimeout(() => setScheduleToast(null), 3500);
  };

  const handleSelectWeekends = () => {
    setEditAvailability((prev) => ({
      ...prev,
      Saturday: [...SLOTS],
      Friday: [...SLOTS],
    }));
  };

  const handleClearAllSchedule = () => {
    setEditAvailability({
      Saturday: [],
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    });
  };

  const totalFreeSlots = DAYS.reduce(
    (acc, d) => acc + normalizeDaySlots(member.availability?.[d]).length,
    0
  );
  const editingFreeSlots = DAYS.reduce(
    (acc, d) => acc + normalizeDaySlots(editAvailability[d]).length,
    0
  );

  const memberLedger = ledger.filter((l) => l.memberId === member.id);

  // Dynamic Rank Tier Calculation - 100% synchronized with member's actual score
  const rankLevels =
    settings?.rankLevels && settings.rankLevels.length > 0
      ? settings.rankLevels
      : DEFAULT_RANK_LEVELS;
  const currentTier =
    rankLevels.find((r) => r.level === member.level) ||
    rankLevels.find(
      (r) =>
        (member.xpTotal || 0) >= r.minXp &&
        (typeof r.maxXp !== "number" || (member.xpTotal || 0) <= r.maxXp)
    ) ||
    rankLevels[0];
  const nextTier = rankLevels.find((r) => r.level === (currentTier?.level || member.level) + 1);
  const isAlumni = member.status === "Alumni";
  const currentScore = isAlumni
    ? member.xpTotal || 0
    : member.xpSeason ?? member.xpTotal ?? 0;
  const tierMin = currentTier?.minXp || 0;
  const tierMax =
    typeof currentTier?.maxXp === "number" ? currentTier.maxXp : tierMin + 1000;
  const tierSpan = Math.max(1, tierMax - tierMin + 1);
  const scoreInTier = Math.max(0, currentScore - tierMin);
  const xpProgressPct =
    typeof currentTier?.maxXp === "number"
      ? Math.min(100, Math.max(0, Math.round((scoreInTier / tierSpan) * 100)))
      : 100;
  const xpToNext = nextTier ? Math.max(0, nextTier.minXp - currentScore) : 0;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkillText.trim();
    if (!clean) return;
    if (!member.skills.includes(clean)) {
      updateMemberProfileSelf(member.id, {
        skills: [...member.skills, clean],
      });
    }
    setNewSkillText("");
    setAddingSkill(false);
  };

  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealEntryId || !appealReason.trim()) return;
    submitPointsAppeal(appealEntryId, appealReason.trim());
    setAppealEntryId(null);
    setAppealReason("");
  };

  const handleSaveHrProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMemberProfileSelf(member.id, {
      commune: editCommune.trim() || "Bab Ezzouar",
      wilaya: editWilaya.trim() || "Algiers (16)",
      housingType: editHousing,
      commuteTime: editCommute,
      githubUrl: editGithub.trim() || undefined,
      linkedinUrl: editLinkedin.trim() || undefined,
      portfolioUrl: editPortfolio.trim() || undefined,
    });
    await syncWithServer();
    setEditHrModalOpen(false);
  };

  // Trainee 3-Ring Qualification Metrics
  const targetDays = (settings.traineeDurationMonths || 3) * 30;
  const daysPct = Math.min(
    100,
    Math.round((member.traineeDaysElapsed / targetDays) * 100)
  );
  const attPct = Math.min(100, member.attendanceRate);
  const xpQualPct = Math.min(
    100,
    Math.round(
      (member.xpTotal / (settings.confirmationXpThreshold || 200)) * 100
    )
  );

  const displayCommune = member.commune || "Bab Ezzouar";
  const displayWilaya = member.wilaya || "Algiers (16)";
  const displayHousing = member.housingType || "Family Home";
  const displayCommute = member.commuteTime || "< 30 min";

  const isSuperAdmin = Boolean(
    member?.roles?.includes("Super Admin") || activeAdminRole === "Super Admin"
  );

  if (!hydrated || !isAuthenticated || !currentMemberId || !activeMember) {
    return (
      <div className="min-h-dvh w-full bg-[#030812] flex items-center justify-center p-6 text-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#38BDF8] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <MobileAppShell>
      {/* Floating Schedule Updated Toast */}
      {scheduleToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-[92vw] px-4 py-2.5 rounded-full bg-slate-900/95 text-white text-xs font-bold font-display shadow-2xl border border-white/20 flex items-center gap-2 backdrop-blur-md animate-rise">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{scheduleToast}</span>
        </div>
      )}

      <div className="px-4 pt-2 pb-6 space-y-3.5 animate-rise">
        {/* Top Title & Quick Actions — Clean Human Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/90">
          <div>
            <h1 className="text-2xl font-black font-display text-[#0F1E36] tracking-tight leading-none">
              {isRtl ? "الملف الشخصي" : "Profile"}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {member.fullName} · {member.handle}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setAdminEditModalOpen(true)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#182C4E] hover:bg-[#101F38] border border-amber-400/50 text-amber-300 flex items-center justify-center transition active:scale-95 shadow-2xs cursor-pointer"
                title="Super Admin Edit Member Profile"
                aria-label="Super Admin Edit Profile"
              >
                <Shield className="w-5 h-5 text-amber-400" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#182C4E] hover:bg-[#101F38] border border-[#2B4875]/80 text-white flex items-center justify-center transition active:scale-95 shadow-2xs cursor-pointer"
              title="Personal Digital ID QR"
              aria-label="Personal QR"
            >
              <QrCode className="w-5 h-5 text-[#7DD3FC]" />
            </button>

            <button
              type="button"
              onClick={() => setLedgerModalOpen(true)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#182C4E] hover:bg-[#101F38] border border-[#2B4875]/80 text-white flex items-center justify-center transition active:scale-95 shadow-2xs cursor-pointer"
              title="XP Ledger & History"
              aria-label="XP Ledger"
            >
              <History className="w-5 h-5 text-[#7DD3FC]" />
            </button>
          </div>
        </div>

        {/* Paused Membership Alert Banner */}
        {member.status === "Inactive" && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 border-2 border-amber-400/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-rise">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Pause className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950 font-display">
                    Membership Paused (Frozen)
                  </span>
                  {member.suspensionEndDate && (
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-200 text-amber-950 border border-amber-300">
                      Duration: {member.suspensionEndDate}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-900 font-medium mt-0.5 leading-snug">
                  {member.statusHistory?.[member.statusHistory.length - 1]?.reason || "Your membership is temporarily paused. Attendance & task obligations are on hold."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const res = resumeMembershipSelf({
                  memberId: member.id,
                  reason: "Member self-reactivated active membership via Profile",
                });
                setScheduleToast(res.message);
                setTimeout(() => setScheduleToast(null), 4000);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume Active Membership</span>
            </button>
          </div>
        )}

        {/* Unified Member Profile Card with Official Mascot Banner */}
        <div className="relative rounded-2xl p-4 sm:p-4.5 text-white overflow-hidden bg-[#071326] border border-[#2B4875]/80 shadow-[0_16px_36px_rgba(7,19,38,0.28)] animate-rise">
          {/* Official Profile Crocheted Astronaut Mascot Background (Atmospheric Edge Blend) */}
          <img
            src="/brand/mascot_profile.png"
            alt="QUANTA Mascot"
            className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071326] via-[#071326]/90 via-55% to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#071326]/85 to-transparent pointer-events-none" />

          {/* Member Identity Top Block — Pro Fitted Structure */}
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[#38BDF8]/40 shadow-md group cursor-pointer active:scale-95 transition bg-[#0F1E36]"
              title="Change avatar"
            >
              <img
                src={getEffectiveMemberAvatar(member)}
                alt={member.fullName}
                className="w-full h-full object-cover select-none"
              />
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-[#071326] shadow-[0_0_6px_#38BDF8]" />
            </button>

            <div className="min-w-0 flex-1 space-y-1">
              <div>
                <h2 className="text-base sm:text-lg font-black font-display text-white truncate tracking-tight leading-tight">
                  {member.fullName}
                </h2>
                <p className="text-xs text-sky-200/90 font-medium truncate leading-tight mt-0.5">
                  {member.handle} {dept ? `· ${dept.shortName}` : ""}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-300 font-sans leading-tight mt-0.5">
                  {team ? team.name : member.major}
                </p>
              </div>

              {/* Status & Role Badges — Side-by-Side Under Identity Text */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wide shadow-2xs shrink-0 ${
                    member.status === "Active"
                      ? "bg-[#064E3B] text-emerald-200 border border-emerald-500/40"
                      : member.status === "Alumni"
                      ? "bg-[#3B0764] text-purple-200 border border-purple-500/40"
                      : "bg-[#78350F] text-amber-200 border border-amber-500/40"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      member.status === "Active"
                        ? "bg-emerald-400"
                        : member.status === "Alumni"
                        ? "bg-purple-400"
                        : "bg-amber-400"
                    }`}
                  />
                  <span>{member.status === "Active" ? (isRtl ? "عضو نشط" : "Active Member") : member.status}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#0F284E] text-[#BAE6FD] border border-[#38BDF8]/40 text-[10px] sm:text-xs font-bold tracking-wide shadow-2xs shrink-0">
                  <Bookmark className="w-3 h-3 text-[#38BDF8]" />
                  <span>{member.roles[0] || member.levelTitle}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Separated Performance & XP Box (Dedicated Container with Badges, Sessions, Projects & Tenure) */}
        <div className="rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(15,30,54,0.06)] animate-rise space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans block">
                {isRtl ? "مستوى العضوية والتقدم" : "Performance & Progression"}
              </span>
              <h3 className="text-sm sm:text-base font-black font-display text-[#0F1E36] tracking-tight mt-0.5">
                Lv. {member.level} · {member.levelTitle}
              </h3>
            </div>
            <div className="text-right rtl:text-left">
              <span className="px-2 py-0.5 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-black font-display tabular-nums shadow-2xs">
                {isAlumni ? "Alumni Lifetime" : `${Math.round(xpProgressPct)}% to Lv. ${member.level + 1}`}
              </span>
            </div>
          </div>

          {/* XP Dual Showcase: Blue Gradient + Creative Graphic + Reversed Color Text */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-[#0B2347] via-[#103366] to-[#16498C] border border-[#38BDF8]/40 shadow-[0_4px_16px_rgba(16,51,102,0.22)] text-white group">
              {/* Creative Quantum Graphic Accent */}
              <div className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full bg-[#38BDF8]/15 blur-lg pointer-events-none" />
              <svg className="absolute right-2 bottom-1.5 w-9 h-9 text-white/[0.08] pointer-events-none select-none" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
              <span className="relative z-10 text-[11px] font-semibold text-sky-200 block">
                {isRtl ? "نقاط الموسم" : "Season XP"}
              </span>
              <div className="relative z-10 flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-display text-white tabular-nums tracking-tight drop-shadow-sm">
                  {(member.xpSeason ?? 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#7DD3FC]">XP</span>
              </div>
            </div>

            <div className="relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-[#0B2347] via-[#103366] to-[#16498C] border border-[#38BDF8]/40 shadow-[0_4px_16px_rgba(16,51,102,0.22)] text-white group">
              {/* Creative Starburst Graphic Accent */}
              <div className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full bg-[#38BDF8]/15 blur-lg pointer-events-none" />
              <svg className="absolute right-2 bottom-1.5 w-9 h-9 text-white/[0.08] pointer-events-none select-none" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.7 5.8,21 7,14.1 2,9.3 9,8.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="relative z-10 text-[11px] font-semibold text-sky-200 block">
                {isRtl ? "إجمالي النقاط" : "Total XP"}
              </span>
              <div className="relative z-10 flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-display text-white tabular-nums tracking-tight drop-shadow-sm">
                  {(member.xpTotal ?? 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#7DD3FC]">XP</span>
              </div>
            </div>
          </div>
          {/* Hairline Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full transition-all duration-700"
              style={{ width: `${isAlumni ? 100 : xpProgressPct}%` }}
            />
          </div>

          {/* Integrated 4-Column Architectural Data: Badges, Sessions, Projects, Tenure */}
          <div className="border-t border-slate-100 pt-2 grid grid-cols-4 divide-x divide-slate-100">
            <Link
              href="/badges"
              className="flex flex-col items-start px-2 hover:opacity-80 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
                {(member.badgeIds || []).length}
              </span>
              <span className="text-xs font-medium font-sans text-slate-500 leading-tight mt-0.5">
                {isRtl ? "الشارات" : "Badges"}
              </span>
            </Link>

            <Link
              href="/workshops"
              className="flex flex-col items-start px-2 hover:opacity-80 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
                {member.workshopsCompletedCount ?? 0}
              </span>
              <span className="text-xs font-medium font-sans text-slate-500 leading-tight mt-0.5">
                {isRtl ? "الورشات" : "Sessions"}
              </span>
            </Link>

            <Link
              href="/projects/submit"
              className="flex flex-col items-start px-2 hover:opacity-80 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
                {member.projectsCompletedCount ?? 0}
              </span>
              <span className="text-xs font-medium font-sans text-slate-500 leading-tight mt-0.5">
                {isRtl ? "المشاريع" : "Projects"}
              </span>
            </Link>

            <div className="flex flex-col items-start px-2">
              <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight">
                {typeof member.yearsInClub === "number" && member.yearsInClub > 0 ? `${member.yearsInClub}y` : "1y"}
              </span>
              <span className="text-xs font-medium font-sans text-slate-500 leading-tight mt-0.5">
                {isRtl ? "الأقدمية" : "Tenure"}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Club Governance Rows — Harmonized with Cosmic Slate-Navy & Glacial Ice (No 01/02/03 prefixes) */}
        <div className="bg-white rounded-xl border border-slate-200/90 divide-y divide-slate-100 shadow-[0_4px_16px_rgba(15,30,54,0.04)] overflow-hidden">
          {/* Row 1: Department */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#182C4E] border border-[#2B4875] text-[#7DD3FC] flex items-center justify-center shrink-0">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0284C7] block">
                  Department
                </span>
                <p className="text-sm font-extrabold font-display text-[#0F1E36]">
                  {dept?.name || "IT and Technical Solutions"}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase shrink-0">
              Primary
            </span>
          </div>

          {/* Row 2: Scientific Team */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#182C4E] border border-[#2B4875] text-[#7DD3FC] flex items-center justify-center shrink-0">
                <Orbit className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0284C7] block">
                  Scientific Team
                </span>
                <p className="text-sm font-extrabold font-display text-[#0F1E36]">
                  {team?.name || "Astronomy & Astrophysics"}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-mono font-bold shrink-0">
              {member.roles[0] || "Member"}
            </span>
          </div>

          {/* Row 3: Member Status + Trainee 3-Ring Tracker Modal Trigger */}
          <button
            type="button"
            onClick={() => setTraineeTrackerOpen(true)}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAFC] active:scale-[0.99] transition cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-[#0284C7] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0284C7] block">
                  Club Standing &amp; Roadmap
                </span>
                <p className="text-sm font-extrabold font-display text-[#0F1E36]">
                  {member.status === "Active" ? "Confirmed Active Quanter" : `${member.status} Status`} · Since {member.statusSince}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Track requirements, competencies &amp; milestones
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#182C4E] shrink-0">
              <span>Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* Residence & Professional Links Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F1E36] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0284C7]" />
              <span>Residence &amp; Links</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditHrModalOpen(true)}
              title="Edit Residence & Links"
              aria-label="Edit Details"
              className="w-7 h-7 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] flex items-center justify-center hover:bg-[#E0F2FE] active:scale-[0.95] transition cursor-pointer shadow-2xs"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Residence & Commute Row */}
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-1">
            <p className="text-xs font-extrabold text-[#0F1E36]">
              {displayCommune} · {displayWilaya}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-700">
                <Home className="w-3 h-3 text-[#182C4E]" />
                {displayHousing}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] border border-[#D5E3F5] text-xs font-bold text-[#182C4E]">
                {displayCommute}
              </span>
            </div>
          </div>

          {/* Clickable Digital Links Chips */}
          {(sanitizeExternalUrl(member.githubUrl) || sanitizeExternalUrl(member.linkedinUrl) || sanitizeExternalUrl(member.portfolioUrl)) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {sanitizeExternalUrl(member.githubUrl) && (
                <a
                  href={sanitizeExternalUrl(member.githubUrl)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#182C4E] text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] transition"
                >
                  <FolderGit2 className="w-3 h-3 text-[#7DD3FC]" />
                  <span>GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                </a>
              )}

              {sanitizeExternalUrl(member.linkedinUrl) && (
                <a
                  href={sanitizeExternalUrl(member.linkedinUrl)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-bold hover:bg-[#E0F2FE] active:scale-[0.98] transition"
                >
                  <Linkedin className="w-3 h-3 text-[#0284C7]" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                </a>
              )}

              {sanitizeExternalUrl(member.portfolioUrl) && (
                <a
                  href={sanitizeExternalUrl(member.portfolioUrl)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-bold hover:bg-[#E0F2FE] active:scale-[0.98] transition"
                >
                  <Globe className="w-3 h-3 text-[#0284C7]" />
                  <span>Portfolio</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                </a>
              )}
            </div>
          )}

          {/* Weekly Availability Schedule Section */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 font-display">
                <CalendarDays className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Weekly Schedule</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditAvailability(member.availability || {});
                  setScheduleModalOpen(true);
                }}
                title="Edit Weekly Schedule"
                aria-label="Edit Schedule"
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#182C4E] flex items-center justify-center hover:bg-[#F0F6FF] active:scale-[0.95] transition cursor-pointer shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-black font-display tabular-nums">
                {totalFreeSlots} slots free
              </span>
            </div>

            {/* Quick Micro-Badge Strip of Active Days */}
            <div className="grid grid-cols-7 gap-1 pt-0.5">
              {DAYS.map((day) => {
                const slots = (member.availability || {})[day] || [];
                const hasSlots = slots.length > 0;
                return (
                  <div
                    key={day}
                    className={`py-1.5 px-0.5 rounded-lg text-center border transition-all ${
                      hasSlots
                        ? "bg-white text-[#0F1E36] border-slate-200 shadow-2xs"
                        : "bg-slate-100/60 text-slate-400 border-transparent"
                    }`}
                  >
                    <span className="block text-[9px] font-black uppercase text-slate-400">
                      {day.slice(0, 3)}
                    </span>
                    <span
                      className={`block text-[10px] font-black font-display mt-0.5 ${
                        hasSlots ? "text-[#0284C7]" : "text-slate-300"
                      }`}
                    >
                      {slots.length > 0 ? `${slots.length}s` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Skills Section with inline + beside skills */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
          <div className="mb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F1E36]">
              Skills &amp; Competencies
            </h3>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            {(member.skills || []).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-[#0F1E36] text-xs font-bold"
              >
                {skill}
              </span>
            ))}
            <button
              type="button"
              onClick={() => setAddingSkill((v) => !v)}
              aria-label="Add skill"
              title="Add skill"
              className="w-7 h-7 rounded-lg bg-[#F0F6FF] hover:bg-[#E0F2FE] text-[#182C4E] border border-[#D5E3F5] flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {addingSkill && (
            <form onSubmit={handleAddSkill} className="mt-2.5 flex gap-1.5">
              <input
                type="text"
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                placeholder="Add skill (e.g. PyTorch, CAD)..."
                className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs"
              />
              <button
                type="submit"
                className="h-8 px-3 rounded-lg bg-[#182C4E] text-white text-xs font-bold active:scale-[0.98] cursor-pointer"
              >
                Save
              </button>
            </form>
          )}
        </div>

        {/* Account & Session Controls */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)] space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Signed-in Account
            </span>
            <span className="text-xs font-bold text-slate-700 break-all">
              {member.email}
            </span>
          </div>

          {/* Change Password, Grievance, and Membership on the same line */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setOldEmailVerify("");
                setNewEmailOptional("");
                setNewPasswordVal("");
                setConfirmPasswordVal("");
                setPasswordError(null);
                setPasswordModalOpen(true);
              }}
              className="h-10 px-2 rounded-xl bg-[#F0F6FF] hover:bg-[#E2EEFC] border border-[#D5E3F5] text-[#182C4E] text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer shadow-2xs truncate"
              title="Change Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <span className="truncate">{isRtl ? "كلمة المرور" : "Password"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGrvSubject("");
                setGrvCategory("Workload & Tasks");
                setGrvUrgency("Standard");
                setGrvDetails("");
                setGrvAnonymous(false);
                setGrvError(null);
                setGrievanceModalOpen(true);
              }}
              className="h-10 px-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:brightness-95 border border-amber-200 text-amber-900 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer shadow-2xs truncate"
              title="Submit Grievance"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{isRtl ? "شكوى" : "Grievance"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrAction(member.status === "Inactive" ? "resume" : "pause");
                setPrMotif(
                  member.status === "Inactive"
                    ? "Ready to return to active club participation"
                    : ""
                );
                setPrPassword("");
                setPrPauseDuration("15 Days");
                setPrConfirmed(false);
                setPrGoogleVerified(false);
                setPrError(null);
                setPauseResignModalOpen(true);
              }}
              className={`h-10 px-2 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer shadow-2xs truncate ${
                member.status === "Inactive"
                  ? "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-2xs font-extrabold"
                  : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
              }`}
            >
              {member.status === "Inactive" ? (
                <>
                  <Pause className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">Resume (Paused)</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="truncate">Membership</span>
                </>
              )}
            </button>
          </div>

          {/* Minimalist Platform Language Switcher */}
          <div className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 pl-1.5">
              <Globe className="w-4 h-4 text-[#0284C7]" />
              <span className="text-xs font-bold text-slate-800">
                {lang === "ar" ? "لغة المنصة" : "Language"}
              </span>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`h-7 px-2.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  lang === "en"
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={`h-7 px-2.5 rounded-md text-xs font-bold transition cursor-pointer font-cairo ${
                  lang === "ar"
                    ? "bg-[#0284C7] text-white shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                العربية
              </button>
            </div>
          </div>



          {member.roles.some((r) =>
            ["Super Admin", "Executive", "HR Head"].includes(r)
          ) && (
            <Link
              href="/admin/overview"
              className="w-full h-10 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition border border-[#2B4875]/60"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#7DD3FC]" />
              <span>{t.profile.openAdmin}</span>
            </Link>
          )}

          {/* Push Notification Preferences Toggle (Under Preferences / Security) */}
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="w-full h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between px-3.5 transition active:scale-[0.99] cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Bell
                className={`w-3.5 h-3.5 ${
                  notifsActive ? "text-[#0284C7]" : "text-slate-400"
                }`}
              />
              <span>System Push Notifications</span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                notifsActive
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  notifsActive ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              <span>{notifsActive ? (isRtl ? "مفعل" : "Active") : (isRtl ? "معطل" : "Inactive")}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSignOutModalOpen(true)}
            className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-extrabold flex items-center justify-center gap-2 active:scale-[0.99] transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.profile.signOut}</span>
          </button>
        </div>
      </div>

      {/* Universal Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={() => {
          setSignOutModalOpen(false);
          logout();
          router.push("/welcome");
        }}
      />

      {/* Change Password by Old Email Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-rise">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Change Password
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verify by writing your registered email address
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                aria-label="Close password modal"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {passwordError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPasswordError(null);
                if (
                  oldEmailVerify.trim().toLowerCase() !==
                  member.email.toLowerCase()
                ) {
                  setPasswordError(
                    "Please enter your exact registered email address to verify."
                  );
                  return;
                }
                if (newPasswordVal.trim().length < 4) {
                  setPasswordError(
                    "New password must be at least 4 characters."
                  );
                  return;
                }
                if (newPasswordVal.trim() !== confirmPasswordVal.trim()) {
                  setPasswordError(
                    "New password and confirmation do not match."
                  );
                  return;
                }
                const res = changeMemberPassword({
                  oldEmail: oldEmailVerify,
                  newEmail: newEmailOptional,
                  newPassword: newPasswordVal,
                });
                if (!res.ok) {
                  setPasswordError(res.message);
                  return;
                }
                await syncWithServer();
                setPasswordModalOpen(false);
                setScheduleToast("Password updated successfully!");
                setTimeout(() => setScheduleToast(null), 3500);
              }}
              className="space-y-2.5 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Old / Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={oldEmailVerify}
                    onChange={(e) => setOldEmailVerify(e.target.value)}
                    placeholder={member.email}
                    className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  New Email Address{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={newEmailOptional}
                  onChange={(e) => setNewEmailOptional(e.target.value)}
                  placeholder="Leave blank to keep current email"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordVal}
                  onChange={(e) => setConfirmPasswordVal(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="flex-1 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-[#182C4E] text-white font-extrabold text-xs cursor-pointer"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pause or Resign Membership Modal */}
      {pauseResignModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[400px] rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-rise max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-black font-display text-slate-900 leading-tight">
                  Membership Standing
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pause or update your club membership
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPauseResignModalOpen(false)}
                aria-label="Close modal"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer shrink-0 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {prError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{prError}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPrError(null);

                if (!prMotif.trim()) {
                  setPrError(
                    prAction === "resume"
                      ? "Please write a brief note for returning."
                      : "Please write a reason for this action."
                  );
                  return;
                }
                if (!prPassword.trim() && !prGoogleVerified && member.passwordHash) {
                  setPrError("Please enter your account password to verify identity.");
                  return;
                }
                if (!prConfirmed) {
                  setPrError("Please confirm your request to proceed.");
                  return;
                }

                const res = pauseOrResignMembershipSelf({
                  memberId: member.id,
                  action: prAction,
                  motif: prMotif.trim(),
                  passwordConfirm: prPassword.trim() || (prGoogleVerified ? "GOOGLE_VERIFIED" : undefined),
                  pauseUntilDate: prAction === "pause" ? prPauseDuration : undefined,
                });

                if (!res.ok) {
                  setPrError(res.message);
                  return;
                }

                setPauseResignModalOpen(false);
                setScheduleToast(res.message);
                setTimeout(() => setScheduleToast(null), 4000);
              }}
              className="space-y-3 text-xs"
            >
              {/* Action Switcher */}
              {member.status === "Inactive" ? (
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setPrAction("resume");
                      if (!prMotif) setPrMotif("Ready to return to active club participation");
                    }}
                    className={`py-2 px-1 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-center ${
                      prAction === "resume"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrAction("pause")}
                    className={`py-2 px-1 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-center ${
                      prAction === "pause"
                        ? "bg-white text-amber-900 shadow-xs border border-amber-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrAction("resign")}
                    className={`py-2 px-1 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-center ${
                      prAction === "resign"
                        ? "bg-white text-rose-900 shadow-xs border border-rose-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Resign
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPrAction("pause")}
                    className={`py-2 px-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-center ${
                      prAction === "pause"
                        ? "bg-white text-amber-900 shadow-xs border border-amber-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrAction("resign")}
                    className={`py-2 px-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-center ${
                      prAction === "resign"
                        ? "bg-white text-rose-900 shadow-xs border border-rose-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Resign
                  </button>
                </div>
              )}

              {/* Action Description Strip */}
              <div
                className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                  prAction === "resume"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : prAction === "pause"
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-rose-50 text-rose-900 border-rose-200"
                }`}
              >
                {prAction === "resume"
                  ? "Restores full active member status and participation in workshops and team missions."
                  : prAction === "pause"
                  ? "Freezes attendance and task requirements. Your XP, badges, and records remain safe."
                  : "Voluntary departure. Your record and achievements will be archived in the club alumni registry."}
              </div>

              {prAction === "pause" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pause Duration
                  </label>
                  <select
                    value={prPauseDuration}
                    onChange={(e) => setPrPauseDuration(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#182C4E]"
                  >
                    <option value="15 Days">15 Days</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                    <option value="3 Months">3 Months</option>
                  </select>
                </div>
              )}

              {/* Reason Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reason (Required)
                </label>
                <textarea
                  required
                  rows={2}
                  value={prMotif}
                  onChange={(e) => setPrMotif(e.target.value)}
                  placeholder={
                    prAction === "resume"
                      ? "Ready to return to club sessions..."
                      : prAction === "pause"
                      ? "Exams, project deadlines, personal leave..."
                      : "Graduation, relocation, personal reasons..."
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E]"
                />
              </div>

              {/* Identity Verification */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Verification
                </label>

                {!prGoogleVerified ? (
                  <div className="space-y-1.5">
                    <input
                      type="password"
                      value={prPassword}
                      onChange={(e) => setPrPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#182C4E]"
                    />

                    <button
                      type="button"
                      onClick={async () => {
                        setPrError(null);
                        const res = await signInWithFirebaseGooglePopup();
                        if (
                          res.ok &&
                          res.email &&
                          res.email.toLowerCase() === member.email.toLowerCase()
                        ) {
                          setPrGoogleVerified(true);
                          setPrPassword("GOOGLE_VERIFIED");
                        } else if (!res.ok) {
                          setPrError(res.message || "Google verification was cancelled or failed.");
                        } else {
                          setPrError(
                            `Google account (${res.email || "unknown"}) does not match member account (${member.email}).`
                          );
                        }
                      }}
                      className="w-full h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <GoogleLogoSvg className="w-3.5 h-3.5" />
                      <span>Or verify with Google</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified via Google</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPrGoogleVerified(false);
                        setPrPassword("");
                      }}
                      className="text-[11px] font-mono text-emerald-700 hover:underline cursor-pointer"
                    >
                      Use Password
                    </button>
                  </div>
                )}
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prConfirmed}
                  onChange={(e) => setPrConfirmed(e.target.checked)}
                  className="rounded border-slate-300 text-[#0284C7] focus:ring-0"
                />
                <span className="text-[11px] text-slate-700 font-medium">
                  I confirm this membership change.
                </span>
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPauseResignModalOpen(false)}
                  className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 h-9 rounded-xl font-extrabold text-xs text-white transition cursor-pointer shadow-xs ${
                    prAction === "resume"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : prAction === "pause"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {prAction === "resume"
                    ? "Confirm Resume"
                    : prAction === "pause"
                    ? "Confirm Pause"
                    : "Confirm Resign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confidential HR Grievance Modal */}
      {grievanceModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-rise max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-600 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-display text-slate-900 leading-tight">
                    Confidential Grievance
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Direct channel to HR Head &amp; Executive Bureau
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGrievanceModalOpen(false)}
                aria-label="Close modal"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer shrink-0 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Privacy Trust Banner */}
            <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <p className="text-[11px] text-slate-200 leading-snug">
                <strong className="text-white">Encrypted &amp; Confidential:</strong> Strictly accessible to HR Head only.
              </p>
            </div>

            {grvError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{grvError}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setGrvError(null);

                if (!grvSubject.trim() || !grvDetails.trim()) {
                  setGrvError("Please fill in both the subject and description.");
                  return;
                }

                const res = submitGrievance({
                  subject: grvSubject.trim(),
                  category: grvCategory,
                  urgency: grvUrgency,
                  details: grvDetails.trim(),
                  isAnonymous: grvAnonymous,
                });

                if (!res.ok) {
                  setGrvError(res.message);
                  return;
                }

                setGrievanceModalOpen(false);
                setScheduleToast("Grievance securely submitted to HR!");
                setTimeout(() => setScheduleToast(null), 4000);
              }}
              className="space-y-3 text-xs"
            >
              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="block font-bold text-slate-800 text-xs">
                    Submit Anonymously
                  </span>
                  <span className="block text-[10.5px] text-slate-500">
                    {grvAnonymous ? "Your identity is completely hidden" : "HR will see your name to follow up"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGrvAnonymous(!grvAnonymous)}
                  className={`w-10 h-6 rounded-full transition cursor-pointer relative shrink-0 ${
                    grvAnonymous ? "bg-[#0284C7]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block w-4.5 h-4.5 rounded-full bg-white shadow-xs transition transform ${
                      grvAnonymous ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  required
                  value={grvSubject}
                  onChange={(e) => setGrvSubject(e.target.value)}
                  placeholder="Brief summary of the issue..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#182C4E]"
                />
              </div>

              {/* Category & Urgency */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={grvCategory}
                    onChange={(e) => setGrvCategory(e.target.value as GrievanceCategory)}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-[11px] text-slate-800 font-semibold focus:outline-none"
                  >
                    <option value="Workload & Tasks">Workload &amp; Tasks</option>
                    <option value="Interpersonal & Respect">Interpersonal</option>
                    <option value="Fairness & Evaluation">Evaluation</option>
                    <option value="Misconduct / Harassment">Misconduct</option>
                    <option value="Governance Conflict">Governance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={grvUrgency}
                    onChange={(e) => setGrvUrgency(e.target.value as GrievanceUrgency)}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-[11px] text-slate-800 font-semibold focus:outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={grvDetails}
                  onChange={(e) => setGrvDetails(e.target.value)}
                  placeholder="Describe what occurred with context and dates..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setGrievanceModalOpen(false)}
                  className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-[#09192F] hover:bg-[#132C4E] text-white font-extrabold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Submit to HR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Personal Digital ID QR Modal */}
      <PersonalQRModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        member={member}
        departmentName={dept?.name || "IT and Technical Solutions"}
        teamName={team?.name}
      />

      {/* Edit Residence & Professional Links Modal */}
      {editHrModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-rise">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Edit Residence &amp; Professional Links
              </h3>
              <button
                type="button"
                onClick={() => setEditHrModalOpen(false)}
                aria-label="Close modal"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveHrProfile} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Commune / District
                  </label>
                  <input
                    type="text"
                    value={editCommune}
                    onChange={(e) => setEditCommune(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Wilaya
                  </label>
                  <input
                    type="text"
                    value={editWilaya}
                    onChange={(e) => setEditWilaya(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Housing Type
                  </label>
                  <select
                    value={editHousing}
                    onChange={(e) =>
                      setEditHousing(e.target.value as HousingType)
                    }
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="Family Home">Family Home</option>
                    <option value="University Residence (Cité)">
                      University Residence (Cité)
                    </option>
                    <option value="Shared Apartment">Shared Apartment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Commute Time
                  </label>
                  <select
                    value={editCommute}
                    onChange={(e) =>
                      setEditCommute(e.target.value as CommuteDuration)
                    }
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="< 30 min">&lt; 30 min</option>
                    <option value="30–60 min">30–60 min</option>
                    <option value="> 1 hour">&gt; 1 hour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={editGithub}
                  onChange={(e) => setEditGithub(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={editPortfolio}
                  onChange={(e) => setEditPortfolio(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditHrModalOpen(false)}
                  className="h-9 px-3.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold border border-[#2B4875]/60 cursor-pointer active:scale-[0.98]"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[350px] rounded-xl bg-white p-5 shadow-2xl border border-slate-200 animate-rise">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#0F1E36]">
                Update Profile Avatar
              </h3>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                aria-label="Close modal"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AvatarUploader
              currentAvatarUrl={member.avatarUrl}
              onAvatarCompressed={(url) =>
                updateMemberProfileSelf(member.id, { avatarUrl: url })
              }
            />
          </div>
        </div>
      )}

      {/* Weekly Availability Schedule Modal (Harmonized Cosmic Slate-Navy & Stellar Cyan) */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[440px] max-h-[78dvh] sm:max-h-[82dvh] rounded-xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-rise"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#182C4E] to-[#101F38] text-white p-4 relative shrink-0 border-b border-[#2B4875]/60">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                aria-label="Close schedule modal"
                className="absolute top-3.5 right-3.5 w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer active:scale-95 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7DD3FC]">
                  SCHEDULE MATRIX · 7-DAY CYCLE
                </span>
              </div>
              <h3 className="text-base font-black font-display tracking-tight">
                Edit Weekly Availability
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Tap time slots when you are free for labs &amp; team sessions
              </p>
            </div>

            {/* Quick Action Toolbar */}
            <div className="px-3.5 py-2 bg-[#F8FAFC] border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
              <span className="px-2.5 py-0.5 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-mono font-bold tabular-nums">
                {editingFreeSlots} slots selected
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectWeekends}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-[#F0F6FF] text-xs font-bold text-[#182C4E] cursor-pointer active:scale-95 transition"
                >
                  + Weekends
                </button>
                <button
                  type="button"
                  onClick={handleClearAllSchedule}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer active:scale-95 transition"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* 7-Day Matrix Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2 text-xs">
              {DAYS.map((day) => {
                const activeSlots = normalizeDaySlots(editAvailability[day]);
                const isWeekend = day === "Friday" || day === "Saturday";
                const allSelected = activeSlots.length === SLOTS.length;
                return (
                  <div
                    key={day}
                    className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#0F1E36] font-display text-xs">
                          {day}
                        </span>
                        {isWeekend && (
                          <span className="text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5]">
                            Weekend
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-mono font-bold text-slate-400">
                          {activeSlots.length > 0
                            ? `${activeSlots.length}/10 hrs free`
                            : "Busy"}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleDayAllSlots(day)}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-[#0284C7] hover:bg-[#F0F6FF] cursor-pointer"
                        >
                          {allSelected ? "Clear" : "All Day"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {STUDY_HOUR_SLOTS.map((slotMeta) => {
                        const isSelected = activeSlots.includes(slotMeta.key);
                        return (
                          <button
                            key={slotMeta.key}
                            type="button"
                            onClick={() => toggleSlot(day, slotMeta.key)}
                            className={`py-1.5 px-1 rounded-lg text-[10.5px] font-mono font-extrabold transition active:scale-[0.97] cursor-pointer text-center ${
                              isSelected
                                ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875] shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-[#182C4E]/40 hover:bg-[#F0F6FF]/50"
                            }`}
                          >
                            {slotMeta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="h-9 px-3.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="h-9 px-4 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-black font-display border border-[#2B4875]/60 flex items-center gap-1.5 active:scale-95 transition shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#7DD3FC]" />
                <span>Save Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trainee Qualification Roadmap Modal */}
      {traineeTrackerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[420px] max-h-[76dvh] sm:max-h-[82dvh] rounded-xl bg-white overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col animate-rise"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#182C4E] to-[#101F38] text-white p-4 relative shrink-0 border-b border-[#2B4875]/60">
              <button
                type="button"
                onClick={() => setTraineeTrackerOpen(false)}
                aria-label="Close qualification tracker"
                className="absolute top-3.5 right-3.5 w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer active:scale-95 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7DD3FC]">
                  PROBATIONARY CYCLE · 90 DAYS
                </span>
              </div>
              <h3 className="text-base font-black font-display tracking-tight">
                Trainee Roadmap &amp; Qualification
              </h3>
            </div>

            {/* Compact Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs overscroll-contain">
              {/* Status & Tenure Strip */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-display font-black text-xs">
                    {member.status === "Active" ? "✓" : "T"}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block leading-tight">
                      Standing
                    </span>
                    <span className="text-xs font-black font-display text-slate-900">
                      {member.status === "Active" ? "Confirmed Active Member" : "Trainee in Probation"}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10.5px] font-bold text-slate-600">
                  Day {member.traineeDaysElapsed} / {targetDays}
                </span>
              </div>

              {/* 3 Core Targets KPI Strip */}
              <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 grid grid-cols-3 divide-x divide-slate-200">
                <div className="px-2 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                    Tenure
                  </span>
                  <div className="text-base font-black font-display text-[#0284C7] tabular-nums mt-0.5">
                    {member.traineeDaysElapsed}d
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-500 block">
                    M{Math.min(3, Math.floor(member.traineeDaysElapsed / 30) + 1)} of 3
                  </span>
                </div>

                <div className="px-2 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                    Presence
                  </span>
                  <div className="text-base font-black font-display text-emerald-600 tabular-nums mt-0.5">
                    {attPct}%
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-500 block">
                    Goal ≥{settings.confirmationAttendanceThreshold}%
                  </span>
                </div>

                <div className="px-2 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                    Season XP
                  </span>
                  <div className="text-base font-black font-display text-amber-600 tabular-nums mt-0.5">
                    {typeof member.xpSeason === "number" ? member.xpSeason : member.xpTotal}
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-500 block">
                    Goal {settings.confirmationXpThreshold} XP
                  </span>
                </div>
              </div>

              {/* 4 Essential Milestones Checklist */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 font-display">
                    Core Milestones
                  </span>
                  <span className="text-[10.5px] font-mono font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md">
                    {Object.values(member.onboardingTicks).filter(Boolean).length}/4 Complete
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                  {[
                    {
                      label: "Profile & Availability Grid Complete",
                      done: member.onboardingTicks.profileComplete,
                    },
                    {
                      label: `Senior Mentor Assigned (${buddy?.fullName || "In matching"})`,
                      done: member.onboardingTicks.buddyAssigned,
                    },
                    {
                      label: "First Department Task Delivered & Graded",
                      done: member.onboardingTicks.firstTaskBeforeDay30,
                    },
                    {
                      label: "Hands-on Workshop Attended (QR Check-in)",
                      done: member.onboardingTicks.firstWorkshopAttended,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black ${
                            item.done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {item.done ? "✓" : String(idx + 1)}
                        </div>
                        <span className={`text-xs font-bold truncate ${item.done ? "text-slate-900" : "text-slate-600"}`}>
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wide ${
                          item.done ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-slate-400 bg-slate-100"
                        }`}
                      >
                        {item.done ? "Verified" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dual Leadership Endorsement */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Department Leadership Endorsement
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Department Head</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono text-[9.5px] font-bold ${
                        member.traineeEvaluation.headEndorsed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {member.traineeEvaluation.headEndorsed ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Co-Manager</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono text-[9.5px] font-bold ${
                        member.traineeEvaluation.coManagerEndorsed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {member.traineeEvaluation.coManagerEndorsed ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-400">
                QUANTA EXECUTIVE RATIFICATION
              </span>
              <button
                type="button"
                onClick={() => setTraineeTrackerOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#182C4E] hover:bg-[#2B4875] text-white text-xs font-bold font-display cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Ledger & 48h Appeal Modal */}
      {ledgerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[420px] max-h-[76dvh] sm:max-h-[82dvh] rounded-xl bg-white overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-rise"
          >
            <div className="bg-gradient-to-r from-[#182C4E] to-[#101F38] text-white p-4 relative border-b border-[#2B4875]/60">
              <button
                type="button"
                onClick={() => setLedgerModalOpen(false)}
                aria-label="Close verified points ledger"
                className="absolute top-3 right-3 w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7DD3FC]">
                VERIFIED POINTS LEDGER
              </span>
              <h3 className="text-base font-extrabold font-display mt-0.5">
                Points History &amp; 48h Appeal Window
              </h3>
            </div>

            <div className="p-3.5 overflow-y-auto space-y-2 text-xs">
              {memberLedger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#0284C7]">
                        {entry.source} · {entry.date}
                      </span>
                      <h4 className="font-extrabold text-[#0F1E36]">
                        {entry.ruleLabel}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {entry.reason}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold tabular-nums shrink-0 ${
                        entry.amount >= 0
                          ? "bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5]"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {entry.amount >= 0 ? `+${entry.amount}` : entry.amount} XP
                    </span>
                  </div>

                  {entry.amount < 0 && (
                    <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">
                        Appeal Status:{" "}
                        <strong className="text-[#0F1E36]">
                          {entry.appealStatus || "None"}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppealEntryId(entry.id);
                          setAppealReason(entry.appealReason || "");
                        }}
                        className="px-3 py-1.5 min-h-[36px] rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-bold flex items-center gap-1.5 hover:bg-[#E0F2FE] active:scale-[0.98] cursor-pointer transition"
                      >
                        <Scale className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>48h Appeal</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {appealEntryId && (
                <form
                  onSubmit={handleAppealSubmit}
                  className="p-3 rounded-xl bg-[#F0F6FF] border border-[#D5E3F5] space-y-2"
                >
                  <label className="block text-[11px] font-extrabold text-[#0F1E36]">
                    Submit 48-Hour Points Deduction Appeal
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Explain the valid excuse or attach reference..."
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAppealEntryId(null)}
                      className="h-9 min-h-[36px] px-3.5 rounded-lg border border-slate-300 bg-white text-xs font-bold active:scale-[0.98] cursor-pointer hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-9 min-h-[36px] px-4 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold active:scale-[0.98] cursor-pointer shadow-sm hover:brightness-110 transition"
                    >
                      Submit Appeal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Super Admin Edit Member Modal */}
      {isSuperAdmin && (
        <EditMemberModal
          member={member}
          isOpen={adminEditModalOpen}
          onClose={() => setAdminEditModalOpen(false)}
          onSaved={(savedName) => {
            setScheduleToast(`Profile for ${savedName || member.fullName} updated and synchronized!`);
            setTimeout(() => setScheduleToast(null), 4000);
          }}
        />
      )}
    </MobileAppShell>
  );
}
