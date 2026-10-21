"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
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
  Scale,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { PersonalQRModal } from "@/components/mobile/PersonalQRModal";
import { PlanetEmblem } from "@/components/shared/PlanetEmblem";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { CommuteDuration, HousingType } from "@/lib/types/erp";

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
      <div className="px-4 pt-2 pb-6 space-y-3.5 animate-rise">
        {/* Top Title & Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-extrabold text-slate-900">Profile</h1>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <select
              value={currentMemberId}
              onChange={(e) => setCurrentMemberId(e.target.value)}
              className="text-[10.5px] font-bold bg-white border border-[#E2EDF8] text-slate-700 rounded-full px-2.5 py-1 shadow-xs cursor-pointer hover:border-[#1D63EB] transition"
              title="Switch Member Persona"
            >
              <option value="mem-ayoub">Ayoub Sarri (Lead)</option>
              <option value="mem-lina">Lina Benali (Member)</option>
              <option value="mem-walid">Walid Meziani (Trainee)</option>
              <option value="mem-alumni-1">Dr. Amine Cherif (Alumni)</option>
            </select>
            <button
              type="button"
              onClick={() => setLedgerModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E2EDF8] text-[11px] font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] shadow-sm cursor-pointer transition"
            >
              <History className="w-3.5 h-3.5 text-[#1D63EB]" />
              <span>Points Ledger</span>
            </button>
          </div>
        </div>

        {/* Member Identity Card */}
        <div className="bg-white rounded-2xl border border-[#E2EDF8] p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="relative shrink-0 group cursor-pointer active:scale-[0.98]"
                title="Change & auto-compress avatar"
              >
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#1D63EB] shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 truncate">
                    {member.fullName}
                  </h2>
                </div>
                <p className="text-xs font-bold text-[#1D63EB]">
                  {member.handle}{" "}
                  <span className="text-slate-400 font-mono text-[10.5px]">
                    ({member.quanterId})
                  </span>
                </p>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5 truncate">
                  {member.major} · {member.university}
                </p>
              </div>
            </div>

            {/* Right Mini QR Button -> Opens PersonalQRModal */}
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              aria-label="Show Personal Digital ID QR"
              className="w-10 h-10 rounded-xl bg-[#EBF3FC] hover:bg-[#E0F0FF] active:scale-[0.98] border border-[#E2EDF8] flex items-center justify-center text-[#094C9C] shrink-0 shadow-sm transition cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs italic text-slate-600">
            &ldquo;{member.bio}&rdquo;
          </p>
        </div>

        {/* Glassify Rounded Hero Card */}
        <div className="relative rounded-3xl p-5 text-white overflow-hidden bg-gradient-to-br from-[#062456] via-[#0A3882] to-[#1258C7] border border-white/20 shadow-[0_16px_40px_rgba(6,36,86,0.22)]">
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[#29D2FF]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs tracking-wider shadow-sm">
                  <span>Lv. {member.level}</span>
                </div>
                <span className="text-xs font-bold text-sky-200 uppercase tracking-wider">
                  {member.levelTitle}
                </span>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                  member.status === "Trainee"
                    ? "bg-amber-400/20 border border-amber-300/40 text-amber-200"
                    : "bg-emerald-400/20 border border-emerald-300/40 text-emerald-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    member.status === "Trainee"
                      ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                      : "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                  }`}
                />
                <span>
                  {member.status === "Trainee" ? "Trainee" : "Active Member"}
                </span>
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                  {member.xpSeason}{" "}
                  <span className="text-sm font-semibold text-sky-200 tracking-normal font-sans">
                    / 1,000 XP
                  </span>
                </div>
                <p className="text-[11px] font-medium text-sky-200/90 mt-0.5">
                  {Math.max(0, 1000 - member.xpSeason)} XP to reach Level {member.level + 1}
                </p>
              </div>

              <div className="animate-float-subtle shrink-0">
                <PlanetEmblem size={52} />
              </div>
            </div>

            <div className="mt-3.5 h-3 w-full rounded-full bg-black/25 backdrop-blur-md border border-white/15 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#29D2FF] via-[#38E4FF] to-[#60A5FA] shadow-[0_0_12px_rgba(41,210,255,0.7)] transition-all duration-500"
                style={{ width: `${xpProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4-Column Glassify Stat Cards */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] py-3 px-1.5 text-center">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums leading-tight">
              {member.badgeIds.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Badges
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] py-3 px-1.5 text-center">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums leading-tight">
              {member.workshopsCompletedCount}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Workshops
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] py-3 px-1.5 text-center">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums leading-tight">
              {member.projectsCompletedCount}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Projects
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] py-3 px-1.5 text-center">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums leading-tight">
              {member.xpTotal}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Total XP
            </div>
          </div>
        </div>

        {/* 3 Club Governance Rows */}
        <div className="bg-white rounded-2xl border border-[#E2EDF8] divide-y divide-slate-100 shadow-card overflow-hidden">
          {/* Row 1: Department */}
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#E0F0FF] text-[#1D63EB] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Department
                </span>
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {dept?.name || "IT and Technical Solutions"}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 shrink-0">
              Single Dept
            </span>
          </div>

          {/* Row 2: Scientific Team */}
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <Orbit className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Scientific Team
                </span>
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {team?.name || "Astronomy & Astrophysics"}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold shrink-0">
              {member.roles[0] || "Member"}
            </span>
          </div>

          {/* Row 3: Member Status + Trainee 3-Ring Tracker Modal Trigger */}
          <button
            type="button"
            onClick={() => setTraineeTrackerOpen(true)}
            className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 active:scale-[0.99] transition cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Member Status
                </span>
                <p className="text-xs font-extrabold text-emerald-700 truncate">
                  {member.status === "Active"
                    ? "Active Member"
                    : `${member.status} Member`}{" "}
                  · Since {member.statusSince}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#1D63EB] shrink-0">
              <span>3-Ring Tracker</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Residence & Professional Links Card */}
        <div className="bg-white rounded-2xl border border-[#E2EDF8] p-3.5 shadow-card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1D63EB]" />
              <span>Residence &amp; Professional Links</span>
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setEditHrModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E0F0FF] text-[#1D63EB] text-[10.5px] font-extrabold hover:bg-sky-100 active:scale-[0.98] transition cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Details</span>
              </button>
            </div>
          </div>

          {/* Residence & Commute Row */}
          <div className="p-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2EDF8] space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <MapPin className="w-3 h-3 text-[#1D63EB]" />
              <span>Residence &amp; Commute Logistics</span>
            </div>
            <p className="text-xs font-extrabold text-slate-900">
              {displayCommune} · {displayWilaya}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                <Home className="w-2.5 h-2.5 text-[#1D63EB]" />
                {displayHousing}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-bold text-[#094C9C]">
                Commute: {displayCommute}
              </span>
              {member.canStayLate !== false && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Saturday / Late Sessions</span>
                </span>
              )}
            </div>
          </div>

          {/* Clickable Digital Links Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <a
              href={member.githubUrl || "https://github.com/ayoub-sarri-quanta"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[10.5px] font-extrabold hover:bg-slate-800 active:scale-[0.98] transition"
            >
              <FolderGit2 className="w-3 h-3 text-[#38E4FF]" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
            </a>

            <a
              href={member.linkedinUrl || "https://linkedin.com/in/ayoub-sarri"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0A66C2] text-white text-[10.5px] font-extrabold hover:opacity-95 active:scale-[0.98] transition"
            >
              <Linkedin className="w-3 h-3" />
              <span>LinkedIn</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
            </a>

            <a
              href={
                member.portfolioUrl || "https://quanta-algiers.dz/members/ayoub"
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EBF3FC] text-[#094C9C] border border-[#E2EDF8] text-[10.5px] font-extrabold hover:bg-sky-100 active:scale-[0.98] transition"
            >
              <Globe className="w-3 h-3 text-[#1D63EB]" />
              <span>Portfolio</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
            </a>
          </div>
        </div>

        {/* Skills Section with + Add */}
        <div className="bg-white rounded-2xl border border-[#E2EDF8] p-3.5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Skills &amp; Competencies
            </h3>
            <button
              type="button"
              onClick={() => setAddingSkill((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E0F0FF] text-[#1D63EB] text-[10.5px] font-extrabold hover:bg-sky-100 active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {member.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-full bg-[#F4F7FB] border border-[#E2EDF8] text-slate-800 text-[11px] font-bold"
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
                className="h-8 px-3 rounded-lg bg-[#1D63EB] text-white text-xs font-bold active:scale-[0.98] cursor-pointer"
              >
                Save
              </button>
            </form>
          )}
        </div>

        {/* Account & Session Controls */}
        <div className="bg-white rounded-2xl border border-[#E2EDF8] p-3.5 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Signed-in Account
            </span>
            <span className="text-[11px] font-bold text-slate-700 truncate">
              {member.email}
            </span>
          </div>

          {member.roles.some((r) =>
            ["Super Admin", "Executive", "HR Head"].includes(r)
          ) && (
            <Link
              href="/admin/overview"
              className="w-full h-10 rounded-xl bg-[#09192F] hover:bg-[#122B4E] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#38E4FF]" />
              <span>Open Admin Console</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full h-10 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-extrabold flex items-center justify-center gap-2 active:scale-[0.99] transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
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
                  className="h-9 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-[#1D63EB] text-white text-xs font-extrabold hover:bg-blue-700 cursor-pointer active:scale-[0.98]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[350px] rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-rise">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Update Profile Avatar
              </h3>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
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

      {/* Trainee 3-Ring Qualification Tracker Modal */}
      {traineeTrackerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-[400px] rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl border border-slate-200 animate-rise">
            <div className="bg-hero-cobalt text-white p-5 relative">
              <button
                type="button"
                onClick={() => setTraineeTrackerOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#38E4FF]">
                3-Month Trainee Qualification
              </span>
              <h3 className="text-base font-extrabold mt-0.5">
                Confirmation &amp; Onboarding Tracker
              </h3>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* 3 Progress Rings */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-[#F4F7FB] border border-[#E2EDF8] space-y-1">
                  <div className="relative">
                    <ProgressRing percent={daysPct} strokeColor="#1D63EB" />
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[#1D63EB] tabular-nums">
                      {daysPct}%
                    </span>
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-800">
                    {member.traineeDaysElapsed} / {targetDays}d
                  </div>
                  <div className="text-[9.5px] text-slate-500">
                    3-Month Tenure
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#F4F7FB] border border-[#E2EDF8] space-y-1">
                  <div className="relative">
                    <ProgressRing percent={attPct} strokeColor="#059669" />
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-emerald-600 tabular-nums">
                      {attPct}%
                    </span>
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-800">
                    Target ≥{settings.confirmationAttendanceThreshold}%
                  </div>
                  <div className="text-[9.5px] text-slate-500">Attendance</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#F4F7FB] border border-[#E2EDF8] space-y-1">
                  <div className="relative">
                    <ProgressRing percent={xpQualPct} strokeColor="#D97706" />
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-amber-600 tabular-nums">
                      {xpQualPct}%
                    </span>
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-800">
                    {member.xpTotal} / {settings.confirmationXpThreshold} XP
                  </div>
                  <div className="text-[9.5px] text-slate-500">XP Target</div>
                </div>
              </div>

              {/* 4 Onboarding Checkpoints */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900">
                  4-Tick Onboarding Checklist
                </h4>
                {[
                  {
                    label: "First-Time Profile & Availability Complete",
                    done: member.onboardingTicks.profileComplete,
                  },
                  {
                    label: `Buddy Assigned (${buddy?.fullName || "Lotfi Benali"})`,
                    done: member.onboardingTicks.buddyAssigned,
                  },
                  {
                    label: "First Task Completed Before Day 30",
                    done: member.onboardingTicks.firstTaskBeforeDay30,
                  },
                  {
                    label: "First Workshop Attended via Live QR",
                    done: member.onboardingTicks.firstWorkshopAttended,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <span className="text-[11px] font-semibold text-slate-700">
                      {item.label}
                    </span>
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        item.done ? "text-emerald-600" : "text-slate-300"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Department Head & Co-Manager Endorsement */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-extrabold text-emerald-900">
                    Leadership Endorsements
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800">
                      {member.traineeEvaluation.headEndorsed ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      <span>Head</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800">
                      {member.traineeEvaluation.coManagerEndorsed ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      <span>Co-Manager</span>
                    </span>
                  </div>
                </div>
                {member.traineeEvaluation.notes && (
                  <p className="text-emerald-800 italic">
                    &ldquo;{member.traineeEvaluation.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points Ledger & 48h Appeal Modal */}
      {ledgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-[400px] max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-rise">
            <div className="bg-hero-cobalt text-white p-5 relative">
              <button
                type="button"
                onClick={() => setLedgerModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#38E4FF]">
                Verified Points Ledger
              </span>
              <h3 className="text-base font-extrabold mt-0.5">
                Points History &amp; 48h Appeal Window
              </h3>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 text-xs">
              {memberLedger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-[#F4F7FB] border border-[#E2EDF8] space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#1D63EB]">
                        {entry.source} · {entry.date}
                      </span>
                      <h4 className="font-extrabold text-slate-900">
                        {entry.ruleLabel}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {entry.reason}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums ${
                        entry.amount >= 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {entry.amount >= 0 ? `+${entry.amount}` : entry.amount} XP
                    </span>
                  </div>

                  {entry.amount < 0 && (
                    <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">
                        Appeal Status:{" "}
                        <strong className="text-amber-700">
                          {entry.appealStatus || "None"}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppealEntryId(entry.id);
                          setAppealReason(entry.appealReason || "");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-extrabold flex items-center gap-1 hover:bg-amber-200 active:scale-[0.98] cursor-pointer"
                      >
                        <Scale className="w-3 h-3" />
                        <span>48h Appeal</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {appealEntryId && (
                <form
                  onSubmit={handleAppealSubmit}
                  className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2"
                >
                  <label className="block text-[11px] font-extrabold text-amber-950">
                    Submit 48-Hour Points Deduction Appeal
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Explain the valid excuse or attach reference..."
                    className="w-full p-2 rounded-lg border border-amber-300 text-xs bg-white"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAppealEntryId(null)}
                      className="h-7 px-2.5 rounded-lg border border-slate-300 text-[10px] font-bold active:scale-[0.98] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-7 px-3 rounded-lg bg-[#1D63EB] text-white text-[10px] font-extrabold active:scale-[0.98] cursor-pointer"
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
