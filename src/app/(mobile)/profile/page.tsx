"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
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
  LayoutDashboard,
  Linkedin,
  LogOut,
  MapPin,
  Orbit,
  Pencil,
  Plus,
  QrCode,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { PersonalQRModal } from "@/components/mobile/PersonalQRModal";
import { PlanetEmblem } from "@/components/shared/PlanetEmblem";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import {
  AvailabilityGrid,
  CommuteDuration,
  DayOfWeek,
  HousingType,
  TimeSlot,
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
const SLOTS: TimeSlot[] = ["Morning", "Afternoon", "Evening"];

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

export default function MobileProfilePage() {
  const router = useRouter();
  const members = useQuantersStore((s) => s.members);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const setCurrentMemberId = useQuantersStore((s) => s.setCurrentMemberId);
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);
  const ledger = useQuantersStore((s) => s.ledger);
  const settings = useQuantersStore((s) => s.settings);
  const updateMemberProfileSelf = useQuantersStore(
    (s) => s.updateMemberProfileSelf
  );
  const submitPointsAppeal = useQuantersStore((s) => s.submitPointsAppeal);
  const logout = useQuantersStore((s) => s.logout);
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);
  const userLowDataMode = useQuantersStore((s) => s.userLowDataMode);
  const setUserLowDataMode = useQuantersStore((s) => s.setUserLowDataMode);
  const isOnline = useQuantersStore((s) => s.isOnline);
  const pendingSyncCount = useQuantersStore((s) => s.pendingSyncCount);
  const lastSyncedAt = useQuantersStore((s) => s.lastSyncedAt);

  const member =
    members.find((m) => m.id === currentMemberId) || members[0];
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
  const [editHrModalOpen, setEditHrModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleToast, setScheduleToast] = useState<string | null>(null);

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
  const [editGithub, setEditGithub] = useState(
    member.githubUrl || "https://github.com/ayoub-sarri-quanta"
  );
  const [editLinkedin, setEditLinkedin] = useState(
    member.linkedinUrl || "https://linkedin.com/in/ayoub-sarri"
  );
  const [editPortfolio, setEditPortfolio] = useState(
    member.portfolioUrl || "https://quanta-algiers.dz/members/ayoub"
  );

  // Weekly Schedule Edit State
  const [editAvailability, setEditAvailability] = useState<AvailabilityGrid>(
    member.availability || {
      Saturday: ["Morning", "Afternoon"],
      Sunday: ["Morning"],
      Monday: [],
      Tuesday: ["Afternoon"],
      Wednesday: [],
      Thursday: ["Afternoon", "Evening"],
      Friday: ["Morning"],
    }
  );

  const toggleSlot = (day: DayOfWeek, slot: TimeSlot) => {
    setEditAvailability((prev) => {
      const current = prev[day] || [];
      const updated = current.includes(slot)
        ? current.filter((s) => s !== slot)
        : [...current, slot];
      return { ...prev, [day]: updated };
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
      Saturday: Array.from(new Set([...(prev.Saturday || []), "Morning", "Afternoon"] as TimeSlot[])),
      Friday: Array.from(new Set([...(prev.Friday || []), "Morning", "Afternoon"] as TimeSlot[])),
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

  const totalFreeSlots = Object.values(member.availability || {}).reduce(
    (acc, slots) => acc + slots.length,
    0
  );
  const editingFreeSlots = Object.values(editAvailability).reduce(
    (acc, slots) => acc + slots.length,
    0
  );

  const memberLedger = ledger.filter((l) => l.memberId === member.id);

  const xpSeasonMax = 1000;
  const xpProgressPct = Math.min(
    100,
    Math.round(((member.xpSeason || 820) / xpSeasonMax) * 100)
  );

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
        {/* Top Title & Quick Actions — Editorial Header */}
        <div className="flex items-end justify-between gap-2 pb-2 border-b border-slate-200/90">
          <div className="min-w-0">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block">
              {member.status === "Alumni" ? "ALUMNI DOSSIER" : "DOSSIER"} · {member.quanterId}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-[#0F1E36] tracking-tight leading-none mt-1">
              Profile{" "}
              <span className="font-editorial italic font-normal text-slate-500 text-xl">
                &amp; Credentials
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setLedgerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-bold font-mono tracking-wider uppercase shadow-[0_4px_12px_rgba(16,31,56,0.2)] border border-[#2B4875]/60 hover:brightness-105 active:scale-[0.98] cursor-pointer transition shrink-0 whitespace-nowrap"
            >
              <History className="w-3.5 h-3.5 text-[#7DD3FC]" />
              <span>XP Ledger</span>
            </button>
          </div>
        </div>

        {/* Member Identity Dossier — Clean Architectural Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="relative shrink-0 group cursor-pointer active:scale-[0.98]"
                title="Change avatar"
              >
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-[#182C4E]/25 shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#38BDF8] border-2 border-white" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black font-display text-[#0F1E36] truncate tracking-tight">
                    {member.fullName}
                  </h2>
                </div>
                <p className="text-xs font-mono font-bold text-[#0284C7] mt-0.5">
                  {member.handle}{" "}
                  <span className="text-slate-400">· {member.quanterId}</span>
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5 font-sans">
                  {member.major} · {member.university}
                </p>
              </div>
            </div>

            {/* Right Mini QR Button -> Opens PersonalQRModal */}
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              aria-label="Show Personal Digital ID QR"
              className="w-10 h-10 rounded-lg bg-[#F0F6FF] hover:bg-[#E0F2FE] border border-[#D5E3F5] active:scale-[0.97] flex items-center justify-center text-[#182C4E] shrink-0 shadow-xs transition cursor-pointer"
            >
              <QrCode className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm italic text-slate-600 font-editorial">
            &ldquo;{member.bio}&rdquo;
          </p>
        </div>

        {/* Nano Banana Cosmic Crocheted Astronaut & Cyan Spiral Galaxy Hero Card (Zero Obstruction on Right) */}
        <div className="relative rounded-xl p-5 sm:p-6 text-white overflow-hidden bg-[#0B1528] border border-[#2B4875]/60 shadow-[0_16px_38px_rgba(11,21,40,0.26)] group">
          {/* Static Nano Banana Artwork with Subtle Zero-G Drift */}
          <img
            src="/brand/hero_rank_banner.webp"
            alt="QUANTERS Crocheted Astronaut & Cyan Spiral Galaxy"
            className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none animate-zero-g"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528]/96 via-[#101F38]/76 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0B1528]/90 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-[60%]">
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  member.status === "Trainee"
                    ? "bg-[#7DD3FC] shadow-[0_0_8px_#7DD3FC]"
                    : "bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]"
                }`}
              />
              <span className="text-xs font-black tracking-[0.18em] font-mono text-[#7DD3FC] uppercase">
                RANK 0{member.level}
              </span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {member.status === "Trainee" ? "Trainee" : "Active"}
              </span>
            </div>

            <p className="mt-1 text-sm sm:text-base font-editorial italic text-sky-100/95 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {member.levelTitle}
            </p>

            <div className="mt-3 flex items-baseline gap-1.5 drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
              <span className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight tabular-nums leading-none">
                {member.xpSeason.toLocaleString()}
              </span>
              <span className="text-xs font-black font-mono tracking-[0.18em] text-[#7DD3FC] uppercase">
                XP
              </span>
            </div>

            <p className="mt-1.5 text-xs font-mono text-slate-300/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              <span className="text-white font-bold tabular-nums">
                {Math.round((member.xpSeason / 1000) * 100)}%
              </span>{" "}
              · {Math.max(0, 1000 - member.xpSeason).toLocaleString()} XP to R0{member.level + 1}
            </p>
          </div>

          {/* Hairline Architectural Progress Track */}
          <div className="relative z-10 mt-4 pt-2.5 border-t border-white/10 flex items-center gap-3">
            <div className="relative h-[4px] flex-1 bg-white/15 rounded-full overflow-visible">
              <div
                className="h-full bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#E0F2FE] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.65)] transition-all duration-700"
                style={{ width: `${xpProgressPct}%` }}
              />
              <span
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#38BDF8]"
                style={{ left: `${xpProgressPct}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-sky-200/90 tabular-nums shrink-0">
              {member.xpSeason}/1000
            </span>
          </div>
        </div>

        {/* Open Architectural Specification Strip — Unboxed Swiss Grid (Zero 01..04 Numeration) */}
        <div className="border-y border-slate-200/90 py-2.5 grid grid-cols-4 divide-x divide-slate-200/80">
          <Link
            href="/badges"
            className="flex flex-col items-start px-2.5 py-0.5 hover:opacity-75 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
              {member.badgeIds.length}
            </span>
            <span className="text-xs font-medium font-sans text-slate-500 leading-tight mt-0.5">
              Badges
            </span>
          </Link>

          <Link
            href="/workshops"
            className="flex flex-col items-start px-2.5 py-0.5 hover:opacity-75 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
              {member.workshopsCompletedCount}
            </span>
            <span className="text-xs font-medium font-sans text-slate-500 leading-tight mt-0.5">
              Sessions
            </span>
          </Link>

          <Link
            href="/projects/submit"
            className="flex flex-col items-start px-2.5 py-0.5 hover:opacity-75 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight group-hover:text-[#0284C7] transition-colors">
              {member.projectsCompletedCount}
            </span>
            <span className="text-xs font-medium font-sans text-slate-500 leading-tight mt-0.5">
              Projects
            </span>
          </Link>

          <div className="flex flex-col items-start px-2.5 py-0.5">
            <span className="text-lg sm:text-xl font-black font-display text-[#0F1E36] tabular-nums leading-tight">
              {member.xpTotal.toLocaleString()}
            </span>
            <span className="text-xs font-medium font-sans text-slate-500 leading-tight mt-0.5">
              Total XP
            </span>
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
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block">
                  Standing &amp; Tenure
                </span>
                <p className="text-sm font-extrabold font-display text-[#0F1E36]">
                  {member.status === "Active"
                    ? "Active Member"
                    : `${member.status} Member`}{" "}
                  · Since {member.statusSince}
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
              <span>Residence &amp; Professional Links</span>
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setEditHrModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-bold hover:bg-[#E0F2FE] active:scale-[0.98] transition cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Details</span>
              </button>
            </div>
          </div>

          {/* Residence & Commute Row */}
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <MapPin className="w-3 h-3 text-[#0284C7]" />
              <span>Residence &amp; Commute Logistics</span>
            </div>
            <p className="text-xs font-extrabold text-[#0F1E36]">
              {displayCommune} · {displayWilaya}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-700">
                <Home className="w-3 h-3 text-[#182C4E]" />
                {displayHousing}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] border border-[#D5E3F5] text-xs font-bold text-[#182C4E]">
                Commute: {displayCommute}
              </span>
              {member.canStayLate !== false && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E0F2FE] border border-[#BAE6FD] text-xs font-bold text-[#0369A1]">
                  <Check className="w-3 h-3 text-[#0284C7]" />
                  <span>Saturday / Late Sessions</span>
                </span>
              )}
            </div>
          </div>

          {/* Clickable Digital Links Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <a
              href={
                member.githubUrl && /^https?:\/\//i.test(member.githubUrl.trim())
                  ? member.githubUrl.trim()
                  : "https://github.com/ayoub-sarri-quanta"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#182C4E] text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] transition"
            >
              <FolderGit2 className="w-3 h-3 text-[#7DD3FC]" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
            </a>

            <a
              href={
                member.linkedinUrl && /^https?:\/\//i.test(member.linkedinUrl.trim())
                  ? member.linkedinUrl.trim()
                  : "https://linkedin.com/in/ayoub-sarri"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-bold hover:bg-[#E0F2FE] active:scale-[0.98] transition"
            >
              <Linkedin className="w-3 h-3 text-[#0284C7]" />
              <span>LinkedIn</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
            </a>

            <a
              href={
                member.portfolioUrl && /^https?:\/\//i.test(member.portfolioUrl.trim())
                  ? member.portfolioUrl.trim()
                  : "https://quanta-algiers.dz/members/ayoub"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-bold hover:bg-[#E0F2FE] active:scale-[0.98] transition"
            >
              <Globe className="w-3 h-3 text-[#0284C7]" />
              <span>Portfolio</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
            </a>
          </div>

          {/* Weekly Availability Schedule Section */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 font-display">
                <CalendarDays className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Weekly Club Availability</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditAvailability(member.availability || {});
                  setScheduleModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[#182C4E] text-xs font-bold font-display hover:bg-[#F0F6FF] active:scale-[0.98] transition cursor-pointer shadow-2xs"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Schedule</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-black font-display tabular-nums">
                {totalFreeSlots} slots free
              </span>
              <span className="text-xs font-medium text-slate-500 font-sans">
                {totalFreeSlots >= 8
                  ? "Optimal for weekend labs & team missions"
                  : "Part-time availability registered"}
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

        {/* Skills Section with + Add */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F1E36]">
              Skills &amp; Competencies
            </h3>
            <button
              type="button"
              onClick={() => setAddingSkill((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-bold hover:bg-[#E0F2FE] active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {member.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-[#0F1E36] text-xs font-bold"
              >
                {skill}
              </span>
            ))}
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

        {/* Offline App Cache & Data Saver Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F1E36]">
                  Offline App Cache &amp; Data Saver
                </h3>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-xs font-bold border ${
                    isOnline
                      ? "bg-[#F0F6FF] text-[#0284C7] border-[#D5E3F5]"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {isOnline ? "ONLINE · CACHED" : "OFFLINE MODE"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {userLowDataMode
                  ? "Low-Data Quota Saver ON · Batches syncs & skips heavy video"
                  : "All app screens & member pass cached on device for offline use"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUserLowDataMode(!userLowDataMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                userLowDataMode
                  ? "bg-[#182C4E] text-white border-[#2B4875]"
                  : "bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-[#F0F6FF]"
              }`}
            >
              {userLowDataMode ? "Quota Saver: ON" : "Enable Data Saver"}
            </button>
          </div>

          {(pendingSyncCount > 0 || lastSyncedAt) && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                {pendingSyncCount > 0
                  ? `${pendingSyncCount} local change(s) queued for sync`
                  : `Last synced at ${lastSyncedAt}`}
              </span>
              {pendingSyncCount > 0 && isOnline && (
                <button
                  type="button"
                  onClick={() => syncWithServer(true)}
                  className="px-2.5 py-1 rounded-md bg-[#182C4E] text-white text-xs font-bold cursor-pointer"
                >
                  Sync Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Account & Session Controls */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)] space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Signed-in Account
            </span>
            <span className="text-xs font-bold text-slate-700 break-all">
              {member.email}
            </span>
          </div>

          {member.roles.some((r) =>
            ["Super Admin", "Executive", "HR Head"].includes(r)
          ) && (
            <Link
              href="/admin/overview"
              className="w-full h-10 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition border border-[#2B4875]/60"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#7DD3FC]" />
              <span>Open Admin Console</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/welcome");
            }}
            className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-extrabold flex items-center justify-center gap-2 active:scale-[0.99] transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

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
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
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
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
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
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer active:scale-95 transition"
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
                const activeSlots = editAvailability[day] || [];
                const isWeekend = day === "Friday" || day === "Saturday";
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
                      <span className="text-[10.5px] font-mono font-bold text-slate-400">
                        {activeSlots.length > 0
                          ? `${activeSlots.length} active`
                          : "Busy"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {SLOTS.map((slot) => {
                        const isSelected = activeSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleSlot(day, slot)}
                            className={`py-1.5 px-1 rounded-lg text-xs font-extrabold font-display transition active:scale-[0.97] cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875] shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-[#182C4E]/40 hover:bg-[#F0F6FF]/50"
                            }`}
                          >
                            <span className="leading-tight">{slot}</span>
                            <span
                              className={`text-[9.5px] font-mono ${
                                isSelected ? "text-[#7DD3FC]" : "text-slate-400"
                              }`}
                            >
                              {slot === "Morning"
                                ? "08–12h"
                                : slot === "Afternoon"
                                ? "12–16h"
                                : "16–20h"}
                            </span>
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
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer active:scale-95 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7DD3FC]">
                  STANDING &amp; QUALIFICATION
                </span>
              </div>
              <h3 className="text-base font-black font-display tracking-tight">
                3-Month Trainee Qualification
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Progression &amp; confirmation toward Full Active Membership
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs overscroll-contain">
              {/* Status Header Badge */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-display font-black text-xs">
                    {member.status === "Active" ? "✓" : "T"}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block font-display">
                      Current Standing
                    </span>
                    <p className="text-xs font-black font-display text-slate-900">
                      {member.status === "Active"
                        ? "Active Member (Confirmed)"
                        : "Trainee Member in Onboarding"}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[10.5px] font-bold text-slate-600 font-display">
                  Since {member.statusSince}
                </span>
              </div>

              {/* Core Confirmation Metrics: Unified Segmented Strip */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 font-display">
                    Core Confirmation Targets
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    3/3 Criteria
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 grid grid-cols-3 divide-x divide-slate-200/80">
                  {/* Metric 1: Tenure */}
                  <div className="px-2 text-center space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block font-display">
                      Tenure
                    </span>
                    <div className="text-base sm:text-lg font-black font-display text-blue-600 tabular-nums">
                      {member.traineeDaysElapsed}
                      <span className="text-[10px] text-slate-400 font-medium">/</span>
                      <span className="text-[11px] text-slate-600 font-medium">{targetDays}d</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-500 block">
                      Month {Math.min(3, Math.floor(member.traineeDaysElapsed / 30) + 1)}/3
                    </span>
                  </div>

                  {/* Metric 2: Attendance */}
                  <div className="px-2 text-center space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block font-display">
                      Presence
                    </span>
                    <div className="text-base sm:text-lg font-black font-display text-emerald-600 tabular-nums">
                      {attPct}%
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-500 block">
                      Target ≥{settings.confirmationAttendanceThreshold}%
                    </span>
                  </div>

                  {/* Metric 3: XP Target */}
                  <div className="px-2 text-center space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block font-display">
                      Total XP
                    </span>
                    <div className="text-base sm:text-lg font-black font-display text-amber-600 tabular-nums">
                      {member.xpTotal}
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-500 block">
                      Target {settings.confirmationXpThreshold} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Onboarding Milestones Roadmap: Clean Unified Card */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 font-display">
                    Onboarding Milestones
                  </h4>
                  <span className="text-[10.5px] font-extrabold text-[#1D63EB] bg-[#E0F0FF] px-2 py-0.5 rounded-full">
                    {Object.values(member.onboardingTicks).filter(Boolean).length}/4 Complete
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 overflow-hidden shadow-2xs">
                  {[
                    {
                      num: "1",
                      title: "Profile & Availability Complete",
                      desc: "Identity KYC, academic major & 7-day schedule verified",
                      done: member.onboardingTicks.profileComplete,
                    },
                    {
                      num: "2",
                      title: "Dedicated Mentor Pairing",
                      desc: `Paired with ${buddy?.fullName || "Senior Mentor"} for guidance`,
                      done: member.onboardingTicks.buddyAssigned,
                    },
                    {
                      num: "3",
                      title: "First Task Delivered Before Day 30",
                      desc: "Completed on schedule and validated by Department Head",
                      done: member.onboardingTicks.firstTaskBeforeDay30,
                    },
                    {
                      num: "4",
                      title: "Hands-on Workshop Attended",
                      desc: "Attended laboratory or club session via live QR scan",
                      done: member.onboardingTicks.firstWorkshopAttended,
                    },
                  ].map((item) => (
                    <div key={item.num} className="p-2.5 sm:p-3 flex items-start gap-2.5 hover:bg-slate-50/50 transition">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black ${
                          item.done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {item.done ? "✓" : item.num}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold font-display ${item.done ? "text-slate-900" : "text-slate-600"}`}>
                          {item.title}
                        </p>
                        <p className="text-[10.5px] text-slate-500 font-sans mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                      <span
                        className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wide ${
                          item.done ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-100"
                        }`}
                      >
                        {item.done ? "Verified" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Leadership Endorsements (Spacious, No Truncation) */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 font-display">
                    Department Leadership Endorsement
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-400">
                    Dual Approval
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                          member.traineeEvaluation.headEndorsed
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {member.traineeEvaluation.headEndorsed ? "✓" : "•"}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold text-slate-900 block">
                          Department Head Endorsement
                        </span>
                        <span className="text-[10px] text-slate-500 block font-sans">
                          {member.traineeEvaluation.headEndorsed
                            ? "Verified & approved for confirmation"
                            : "Evaluation review pending"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                        member.traineeEvaluation.headEndorsed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {member.traineeEvaluation.headEndorsed ? "Approved" : "In Review"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                          member.traineeEvaluation.coManagerEndorsed
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {member.traineeEvaluation.coManagerEndorsed ? "✓" : "•"}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold text-slate-900 block">
                          Co-Manager Endorsement
                        </span>
                        <span className="text-[10px] text-slate-500 block font-sans">
                          {member.traineeEvaluation.coManagerEndorsed
                            ? "Verified & approved for confirmation"
                            : "Co-management review pending"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                        member.traineeEvaluation.coManagerEndorsed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {member.traineeEvaluation.coManagerEndorsed ? "Approved" : "In Review"}
                    </span>
                  </div>
                </div>

                {member.traineeEvaluation.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10.5px] text-slate-600 italic leading-relaxed">
                    &ldquo;{member.traineeEvaluation.notes}&rdquo;
                  </div>
                )}
              </div>

              {/* Final Ratification Callout */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#1D63EB] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Full confirmation to Active Member status is ratified by the
                  Executive Bureau upon completing the 90-day cycle, meeting the
                  75% attendance threshold, and receiving dual department endorsement.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10.5px] font-bold text-slate-400 font-display">
                QUANTA Club ERP
              </span>
              <button
                type="button"
                onClick={() => setTraineeTrackerOpen(false)}
                className="h-8.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-black font-display active:scale-95 transition cursor-pointer"
              >
                Close Roadmap
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
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
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
                        className="px-2.5 py-1 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-[10px] font-bold flex items-center gap-1 hover:bg-[#E0F2FE] active:scale-[0.98] cursor-pointer"
                      >
                        <Scale className="w-3 h-3 text-[#0284C7]" />
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
                      className="h-7 px-2.5 rounded-lg border border-slate-300 bg-white text-[10px] font-bold active:scale-[0.98] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-7 px-3 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-[10px] font-extrabold active:scale-[0.98] cursor-pointer"
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
    </MobileAppShell>
  );
}
