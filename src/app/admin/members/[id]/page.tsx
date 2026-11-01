"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Laptop,
  Lock,
  Mail,
  MapPin,
  Monitor,
  PauseCircle,
  Phone,
  Plus,
  QrCode,
  ShieldAlert,
  Sparkles,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { sanitizeExternalUrl } from "@/lib/utils/authSecurity";
import { DayOfWeek, isMemberAvailableInSlot, MemberStatus, STUDY_HOUR_SLOTS, TimeSlot } from "@/lib/types/erp";
import { PersonalQRModal } from "@/components/mobile/PersonalQRModal";

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

type TabId = "profile" | "activity" | "badges" | "availability" | "history" | "hr";

export default function AdminMemberDetailCardPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const rawParamId = params?.id || "";
  const pathLastSegment = (pathname || "").split("/").filter(Boolean).pop() || "";
  const memberId =
    rawParamId && rawParamId !== "member"
      ? rawParamId
      : pathLastSegment || rawParamId;

  const {
    members,
    departments,
    teams,
    workshops,
    tasks,
    ledger,
    badges,
    confirmTraineeToActive,
    approveMemberAdmission,
    awardBadgeManually,
    changeMemberStatus,
    pullExactUpdatesFromServer,
  } = useQuantersStore();

  useEffect(() => {
    pullExactUpdatesFromServer().catch(() => {});
  }, [pullExactUpdatesFromServer]);

  const member =
    members.find(
      (m) =>
        m.id === memberId ||
        m.quanterId.toLowerCase() === memberId.toLowerCase() ||
        m.email.toLowerCase() === memberId.toLowerCase()
    ) ||
    (memberId.startsWith("mem-")
      ? members.find((m) => m.id.startsWith(memberId) || m.id.includes(memberId))
      : undefined);

  const isPendingAdmission = Boolean(
    member &&
      (member.status === "Pending" ||
        (!member.onboardingTicks?.hrApproved &&
          member.status !== "Active" &&
          member.status !== "Alumni"))
  );

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [showDigitalIdModal, setShowDigitalIdModal] = useState(false);

  // Award Badge Manually modal state
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState(badges[0]?.id || "badge-python");
  const [awardReason, setAwardReason] = useState("");

  // HR Status Transition modal state
  const [hrModalType, setHrModalType] = useState<MemberStatus | null>(null);
  const [hrReason, setHrReason] = useState("");
  const [hrActorName, setHrActorName] = useState("HR Administration");
  const [hrDecisionRef, setHrDecisionRef] = useState("DEC-BUREAU-2026-10");
  const [hrGraduationYear, setHrGraduationYear] = useState("2026");
  const [hrSuspensionEnd, setHrSuspensionEnd] = useState("2026-11-30");

  if (!member) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200/90 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
          <User className="w-5 h-5" />
        </div>
        <h2 className="text-base font-extrabold text-[#0F1E36]">Member Record Loading or Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Searching for member ID <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{memberId}</code>.
        </p>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#182C4E] text-white text-xs font-bold hover:brightness-110 transition mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Member Directory</span>
        </Link>
      </div>
    );
  }

  const department = departments.find((d) => d.id === member.departmentId);
  const team = teams.find((t) => t.id === member.teamId);
  const buddy = members.find((m) => m.id === member.buddyId);

  // Trainee 3-Ring Qualification metrics
  const timeRingPct = Math.min(100, Math.round((member.traineeDaysElapsed / 90) * 100));
  const attRingOk = member.attendanceRate >= 75;
  const taskRingOk = member.onTimeTaskRate >= 75;
  const lawArt7Conflict = member.isBureauMember && member.declaresOtherStudentOrg;

  // Member-specific logs
  const memberAttendance = workshops.flatMap((w) =>
    w.attendanceRecords
      .filter((r) => r.memberId === member.id)
      .map((r) => ({ ...r, workshopTitle: w.title, dateLabel: w.dateLabel }))
  );

  const memberTasks = tasks.filter((t) =>
    t.assignees.some((a) => a.memberId === member.id)
  );

  const memberLedger = ledger.filter((l) => l.memberId === member.id);
  const memberBadges = badges.filter((b) => member.badgeIds.includes(b.id));

  const handleAwardBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBadgeId || !awardReason.trim()) return;
    awardBadgeManually(selectedBadgeId, [member.id], awardReason.trim());
    setAwardModalOpen(false);
    setAwardReason("");
  };

  const handleStatusTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrModalType || !hrReason.trim()) return;
    changeMemberStatus({
      memberId: member.id,
      toStatus: hrModalType,
      reason: hrReason.trim(),
      actorName: hrActorName.trim() || "HR Administration",
      decisionReference: hrModalType === "Removed" ? hrDecisionRef : undefined,
      graduationYear: hrModalType === "Alumni" ? hrGraduationYear : undefined,
      suspensionEndDate: hrModalType === "Suspended" ? hrSuspensionEnd : undefined,
    });
    setHrModalType(null);
    setHrReason("");
  };

  const healthColor =
    member.healthScore >= 70
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : member.healthScore >= 50
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  const healthDotColor =
    member.healthScore >= 70
      ? "bg-emerald-500"
      : member.healthScore >= 50
      ? "bg-amber-500"
      : "bg-rose-500";

  const isPaused =
    member.status === "Inactive" &&
    (Boolean(member.suspensionEndDate) ||
      member.statusHistory.some(
        (sh) =>
          sh.reason.toLowerCase().includes("pause") ||
          sh.reason.toLowerCase().includes("frozen") ||
          sh.toStatus === "Inactive"
      ));

  const latestPauseRecord = member.statusHistory.find(
    (sh) =>
      sh.toStatus === "Inactive" &&
      (sh.reason.toLowerCase().includes("pause") ||
        sh.reason.toLowerCase().includes("frozen") ||
        Boolean(sh.suspensionEndDate))
  );

  const pauseDurationLabel =
    member.suspensionEndDate ||
    latestPauseRecord?.suspensionEndDate ||
    "Temporary Leave";
  const pauseReasonLabel =
    latestPauseRecord?.reason || "Voluntarily paused by member";
  const pauseDateLabel = latestPauseRecord?.date || member.statusSince;

  return (
    <>
      <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0284C7] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Member Directory
          </Link>
          <span className="text-xs font-mono font-bold text-slate-500 tabular-nums">
            Member Record · {member.quanterId}
          </span>
        </div>

      {/* Paused / Frozen Status Alert Banner (Shown prominently if member is Inactive / Paused) */}
      {isPaused && (
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <PauseCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black uppercase tracking-wider text-amber-950 font-display">
                    Membership Status: Paused (Frozen)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                    Duration: {pauseDurationLabel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-amber-800 bg-white/80 border border-amber-200">
                    Paused on {pauseDateLabel}
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 mt-1 font-medium leading-relaxed">
                  <strong>Reason given:</strong> {pauseReasonLabel}. Mandatory workshop attendance and task delivery are temporarily frozen.
                </p>
              </div>
            </div>

            {/* Quick Reactivate Actions directly on the banner */}
            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => {
                  setHrModalType("Active");
                  setHrReason("Reactivated to full Active status from paused state by HR");
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Return to Active</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHrModalType("Trainee");
                  setHrReason("Returned to Trainee qualification trial from paused state by HR");
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Return to Trainee</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Master Header + Trainee 3-Ring Confirmation Tracker */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:p-5">
          {/* Avatar & Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#182C4E]/20 shadow-sm shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-[#0F1E36]">{member.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F4F7FB] text-slate-700 border border-slate-200/90 tabular-nums">
                  {member.quanterId}
                </span>
                {isPaused ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                    <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Paused ({pauseDurationLabel})</span>
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      member.status === "Active"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold"
                        : "bg-[#F0F6FF] text-[#182C4E]"
                    }`}
                  >
                    {member.status === "Active" ? "Confirmed Active" : member.status}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs">
                  <Award className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Level {member.level} · {member.levelTitle}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-700">
                  Tenure: {member.tenure || "Active"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border tabular-nums ${healthColor}`}
                >
                  <span className={`w-2 h-2 rounded-full ${healthDotColor}`} />
                  Health {member.healthScore}%
                </span>
                <button
                  type="button"
                  onClick={() => setShowDigitalIdModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#091730] hover:bg-[#12264C] text-[#38E4FF] hover:text-white border border-[#38BDF8]/40 text-xs font-mono font-bold shadow-xs transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Digital ID Pass</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>
                  Department: <strong className="text-slate-800">{department?.name}</strong>
                </span>
                <span>·</span>
                <span>
                  Scientific Team:{" "}
                  <strong className="text-slate-800">{team?.name || "Unassigned"}</strong>
                </span>
              </div>

              {/* Roles & Recognition Labels */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {member.roles.map((r) => (
                  <span
                    key={r}
                    className="px-2.5 py-0.5 rounded-lg bg-[#182C4E] text-white text-[10px] font-bold uppercase tracking-wider"
                  >
                    {r}
                  </span>
                ))}
                {member.isBureauMember && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                    Executive Bureau Member
                  </span>
                )}
                {member.recognitionLabels.map((lbl) => (
                  <span
                    key={lbl}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold"
                  >
                    <Award className="w-3 h-3 text-amber-600" />
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right XP & Quick Stats */}
          <div className="flex items-center gap-3 bg-[#F4F7FB] border border-slate-200/90 rounded-2xl p-3.5 shrink-0">
            <div className="px-3 border-r border-slate-200/90">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total KPI XP</div>
              <div className="text-xl font-extrabold text-emerald-600 tabular-nums">
                +{member.xpTotal} XP
              </div>
            </div>
            <div className="px-3 border-r border-slate-200/90">
              <div className="text-[10px] font-bold uppercase text-slate-400">Season XP</div>
              <div className="text-xl font-extrabold text-[#0284C7] tabular-nums">
                {member.xpSeason}
              </div>
            </div>
            <div className="px-3">
              <div className="text-[10px] font-bold uppercase text-slate-400">This Month</div>
              <div className="text-xl font-extrabold text-[#0F1E36] tabular-nums">
                +{member.xpMonth}
              </div>
            </div>
          </div>
        </div>

        {/* Admission Review Banner (Shown prominently when candidate is Pending HR Accreditation) */}
        {isPendingAdmission && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-rise">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 font-display">
                    Admission Dossier Awaiting HR Accreditation
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200 text-amber-900 border border-amber-300">
                    Pending Admission
                  </span>
                </div>
                <p className="text-[11.5px] text-amber-800 leading-relaxed">
                  Candidate onboarding dossier has been submitted. Granting admission activates their workspace access, assigns Trainee status, and dispatches their official welcome notice.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-amber-950/80 font-mono pt-0.5">
                  <span>Major: <strong>{member.major}</strong></span>
                  <span>·</span>
                  <span>Year: <strong>{member.academicYear}</strong></span>
                  <span>·</span>
                  <span>Wilaya: <strong>{member.wilaya}</strong></span>
                  <span>·</span>
                  <span>Phone: <strong>{member.phone || "—"}</strong></span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                approveMemberAdmission({
                  memberId: member.id,
                  actorName: "HR Directorate",
                  notes: "Approved via Member Command Dossier",
                });
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-sm transition cursor-pointer shrink-0 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Admission &amp; Grant Access</span>
            </button>
          </div>
        )}

        {!isPendingAdmission && member.status === "Trainee" && (
          <div className="bg-slate-50/80 rounded-xl px-3 py-2.5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0F1E36]">
                Trainee Qualification
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-sky-100 text-sky-800">
                90d Window
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-3xl">
              {/* Tenure */}
              <div className="bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-500">Tenure</span>
                  <span className="font-mono font-bold text-slate-700">{member.traineeDaysElapsed}/90d</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(timeRingPct, 100)}%` }} />
                </div>
              </div>

              {/* Attendance */}
              <div className="bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-500">Attendance</span>
                  <span className={`font-mono font-bold ${attRingOk ? "text-emerald-600" : "text-amber-600"}`}>{member.attendanceRate}%</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${attRingOk ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min(member.attendanceRate, 100)}%` }} />
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-500">Tasks</span>
                  <span className={`font-mono font-bold ${taskRingOk ? "text-emerald-600" : "text-amber-600"}`}>{member.onTimeTaskRate}%</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${taskRingOk ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min(member.onTimeTaskRate, 100)}%` }} />
                </div>
              </div>

              {/* Review */}
              <div className="bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70 flex items-center justify-between">
                <span className="text-[10.5px] text-slate-500">Review</span>
                <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                  member.traineeEvaluation.headEndorsed && member.traineeEvaluation.coManagerEndorsed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {member.traineeEvaluation.headEndorsed && member.traineeEvaluation.coManagerEndorsed ? "2/2 Done" : "In Review"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                confirmTraineeToActive(
                  member.id,
                  "Confirmed as Official Active Member."
                )
              }
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Active</span>
            </button>
          </div>
        )}
      </section>

      {/* 6-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "activity", label: "Activity", icon: Activity },
          { id: "badges", label: "Badges", icon: Award },
          { id: "availability", label: "Availability", icon: Calendar },
          { id: "history", label: "History", icon: History },
          { id: "hr", label: "Governance", icon: Lock },
        ].map((t) => {
          const Icon = t.icon;
          const isCurrent = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as TabId)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                isCurrent
                  ? "bg-[#182C4E] text-white shadow-sm"
                  : "text-slate-600 hover:bg-[#F4F7FB] hover:text-[#0F1E36]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === "profile" && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Academic &amp; Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Email Address</div>
                  <a
                    href={`mailto:${member.email}`}
                    className="font-bold text-[#0F1E36] hover:text-[#0284C7] hover:underline transition mt-1 flex items-center gap-1.5"
                    title="Send Email"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>{member.email}</span>
                  </a>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Phone Number</div>
                  <a
                    href={`tel:${(member.phone || '').replace(/[^0-9+]/g, '')}`}
                    className="font-bold text-[#0F1E36] hover:text-[#0284C7] hover:underline transition mt-1 flex items-center gap-1.5"
                    title="Call Phone"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>{member.phone || '—'}</span>
                  </a>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    University &amp; Major
                  </div>
                  <div className="font-bold text-[#0F1E36] mt-1">
                    {member.major} · {member.university}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Academic Year &amp; Club Tenure
                  </div>
                  <div className="font-bold text-[#0F1E36] mt-1">
                    Year: {member.academicYear} · Tenure: {member.tenure}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Assigned Buddy</div>
                  <div className="font-bold text-[#0F1E36] mt-1">
                    {buddy ? `${buddy.fullName} (${buddy.quanterId})` : "No Buddy Assigned"}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Skills &amp; Tags</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.skills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200/90 text-[10px] font-bold text-[#182C4E]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Outside Activities & Volunteering + Law Art. 7 Warning */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#0F1E36] uppercase tracking-wider">
                  Outside Activities &amp; Volunteering
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  External Commitments
                </span>
              </div>

              {/* Prominent Bureau Conflict Warning */}
              {lawArt7Conflict && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-900 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-rose-800">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>EXECUTIVE BOARD DUAL-ORGANIZATION WARNING</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    <strong>{member.fullName}</strong> is an Executive Bureau Member (
                    {member.roles.join(", ")}) and declared active responsibility in another student
                    organization or syndicate. Per QUANTA governance rules, Bureau members may
                    not hold dual executive mandates in external student unions/clubs.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#F4F7FB] border border-slate-200/90 text-xs text-slate-800 leading-relaxed">
                {member.outsideActivitiesAndVolunteering ||
                  "No external activities or volunteering declared."}
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-500">
                  Declares Other Student Org/Union:
                </span>
                <span
                  className={`font-extrabold px-2.5 py-0.5 rounded-full ${
                    member.declaresOtherStudentOrg
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {member.declaresOtherStudentOrg ? "Yes (Declared)" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Extended HR KYC Cards: Residence/Commute & Hardware/PC/Professional Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* Card 1: Residence, Housing & Commute Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0284C7]" />
                  Residence &amp; Commute
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Wilaya</div>
                  <div className="font-extrabold text-[#0F1E36] mt-1">
                    {member.wilaya || "Algiers (16)"}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Commune / District
                  </div>
                  <div className="font-extrabold text-[#0F1E36] mt-1">
                    {member.commune || "Bab Ezzouar"}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Housing Type</div>
                  <div className="font-extrabold text-[#0F1E36] mt-1">
                    {member.housingType || "Family Home"}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Campus Commute Duration
                  </div>
                  <div className="font-extrabold text-[#0284C7] mt-1">
                    {member.commuteTime || "< 30 min"}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Hardware, PC & Professional Links Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#0284C7]" />
                  Hardware &amp; Workspace
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                    member.hasLaptop !== false && member.pcCapability !== "No Personal PC"
                      ? "bg-sky-50 text-[#182C4E] border-sky-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {member.hasLaptop !== false && member.pcCapability !== "No Personal PC" ? (
                    <>
                      <Laptop className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Personal Laptop · {member.pcCapability || "Coding & Dev"}</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-3.5 h-3.5 text-amber-700" />
                      <span>Needs Club Lab PC</span>
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Has Personal Laptop
                  </div>
                  <div className="font-extrabold text-[#0F1E36] mt-1">
                    {member.hasLaptop !== false && member.pcCapability !== "No Personal PC"
                      ? "Yes (Available for Workshops)"
                      : "No (Requires Lab Station)"}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    PC Capability Profile
                  </div>
                  <div className="font-extrabold text-[#182C4E] mt-1">
                    {member.pcCapability || "Coding & Dev"}
                  </div>
                </div>
                <div className="sm:col-span-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                    Personal Equipment &amp; Lab Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(member.equipmentTags && member.equipmentTags.length > 0
                      ? member.equipmentTags
                      : ["Personal Laptop", "Arduino Kit", "Scientific Calculator"]
                    ).map((eq) => (
                      <span
                        key={eq}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 text-[11px] font-bold text-slate-700"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clickable Professional Links */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 mr-1">
                  Professional Links:
                </span>
                <a
                  href={
                    sanitizeExternalUrl(member.githubUrl) ||
                    `https://github.com/${encodeURIComponent(member.handle.replace("@", ""))}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-[#29D2FF]" />
                </a>
                <a
                  href={sanitizeExternalUrl(member.linkedinUrl) || "https://linkedin.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={sanitizeExternalUrl(member.portfolioUrl) || "https://quanta-algiers.dz"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F4F7FB] hover:bg-slate-200 text-slate-800 border border-slate-200/90 text-xs font-bold transition"
                >
                  <span>Portfolio</span>
                  <ExternalLink className="w-3 h-3 text-[#0284C7]" />
                </a>
                <a
                  href={sanitizeExternalUrl(member.cvUrl) || "https://quanta-algiers.dz/cv"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition"
                >
                  <span>Academic CV</span>
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVITY */}
      {activeTab === "activity" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:p-5">
          {/* Attendance Log */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0F1E36]">
              Workshop Attendance Log ({memberAttendance.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {memberAttendance.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/90 text-xs"
                >
                  <div className="font-bold text-[#0F1E36]">{att.workshopTitle}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {att.dateLabel} · {att.method}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {att.status}
                  </span>
                </div>
              ))}
              {memberAttendance.length === 0 && (
                <p className="text-xs text-slate-400">No session check-ins recorded yet.</p>
              )}
            </div>
          </div>

          {/* Assigned Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0F1E36]">
              Assigned Club Tasks ({memberTasks.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {memberTasks.map((t) => {
                const line = t.assignees.find((a) => a.memberId === member.id);
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/90 text-xs"
                  >
                    <div className="font-bold text-[#0F1E36]">{t.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Role: {line?.roleInTask} · Due: {t.deadline}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-[#182C4E] text-[10px] font-bold">
                        {line?.status}
                      </span>
                      <span className="font-bold text-emerald-700 text-[11px]">
                        +{line?.awardedScore ?? t.proposedScore} pts
                      </span>
                    </div>
                  </div>
                );
              })}
              {memberTasks.length === 0 && (
                <p className="text-xs text-slate-400">No tasks assigned to this member.</p>
              )}
            </div>
          </div>

          {/* Personal Points Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0F1E36]">
              Personal Points Ledger ({memberLedger.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {memberLedger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/90 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-[#0F1E36]">{entry.ruleLabel}</div>
                    <div className="text-[11px] text-slate-500">{entry.reason}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {entry.date} · {entry.actorName}
                    </div>
                  </div>
                  <span
                    className={`font-extrabold text-xs px-2.5 py-1 rounded-full tabular-nums ${
                      entry.amount >= 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {entry.amount >= 0 ? `+${entry.amount}` : entry.amount} XP
                  </span>
                </div>
              ))}
              {memberLedger.length === 0 && (
                <p className="text-xs text-slate-400">No ledger entries recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BADGES */}
      {activeTab === "badges" && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0F1E36]">
                Unlocked Skill &amp; Contribution Badges ({memberBadges.length})
              </h3>
              <p className="text-xs text-slate-500">
                3D Hexagonal badges earned via MCQ exam, project review, or manual HR award
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAwardModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Award Badge Manually
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {memberBadges.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-[#F4F7FB] border border-slate-200/90 flex items-center gap-3.5"
              >
                <div className="w-12 h-12 clip-hexagon bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] border border-[#2B4875]/65 text-[#29D2FF] flex items-center justify-center font-extrabold text-xs shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-[#0F1E36] truncate">{b.name}</div>
                  <div className="text-[10px] text-slate-500">{b.category}</div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5 tabular-nums">
                    +{b.xpReward} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AVAILABILITY */}
      {activeTab === "availability" && (() => {
        let totalFree = 0;
        DAYS.forEach((d) => {
          STUDY_HOUR_SLOTS.forEach((s) => {
            if (isMemberAvailableInSlot(member.availability?.[d], s.key)) totalFree++;
          });
        });
        const totalSlots = DAYS.length * STUDY_HOUR_SLOTS.length;
        const freePct = Math.round((totalFree / totalSlots) * 100);

        return (
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3.5">
            {/* Header with stats and legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0F1E36]">
                    Weekly Availability Heat Map
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Hour-by-hour schedule density used for meeting & shift scheduling
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                  {totalFree} / {totalSlots} hrs Free ({freePct}%)
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> Free
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 inline-block" /> Study / Class
                  </span>
                </div>
              </div>
            </div>

            {/* Heat Map Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[620px] space-y-1.5">
                {/* Time slot headers */}
                <div className="grid grid-cols-12 gap-1.5 items-center text-center font-mono text-[10px] font-bold text-slate-400 pb-1">
                  <div className="col-span-2 text-left font-sans text-[11px] text-slate-600 font-bold uppercase">
                    Day
                  </div>
                  {STUDY_HOUR_SLOTS.map((s) => (
                    <div key={s.key} className="truncate" title={s.label}>
                      {s.label.split("–")[0]}
                    </div>
                  ))}
                </div>

                {/* Day Rows */}
                {DAYS.map((day) => {
                  let dayFree = 0;
                  STUDY_HOUR_SLOTS.forEach((s) => {
                    if (isMemberAvailableInSlot(member.availability?.[day], s.key)) dayFree++;
                  });

                  return (
                    <div
                      key={day}
                      className="grid grid-cols-12 gap-1.5 items-center p-1 rounded-lg hover:bg-slate-50/70 transition"
                    >
                      <div className="col-span-2 flex items-center justify-between pr-2">
                        <span className="text-xs font-bold text-slate-800">{day}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{dayFree}h</span>
                      </div>

                      {STUDY_HOUR_SLOTS.map((s) => {
                        const isFree = isMemberAvailableInSlot(member.availability?.[day], s.key);
                        return (
                          <div
                            key={s.key}
                            title={`${day} ${s.label}: ${isFree ? "Free / Available" : "Class / Study"}`}
                            className={`h-7 rounded-md transition cursor-pointer flex items-center justify-center text-[9.5px] font-mono font-bold ${
                              isFree
                                ? "bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600 scale-[1.02]"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-400"
                            }`}
                          >
                            {isFree ? "✓" : "·"}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 5: HISTORY */}
      {activeTab === "history" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:p-5">
          {/* Status History */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0F1E36]">
              Status Transition History (From → To, Who, Date, Reason)
            </h3>
            <div className="space-y-2.5">
              {member.statusHistory.map((sh) => (
                <div
                  key={sh.id}
                  className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F1E36]">
                      {sh.fromStatus} → {sh.toStatus}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{sh.date}</span>
                  </div>
                  <div className="text-slate-600">{sh.reason}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    Logged by: {sh.actorName}
                    {sh.decisionReference ? ` · Ref: ${sh.decisionReference}` : ""}
                  </div>
                </div>
              ))}
              {member.statusHistory.length === 0 && (
                <p className="text-xs text-slate-400">No status changes recorded since onboarding.</p>
              )}
            </div>
          </div>

          {/* Placement History */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0F1E36]">
              Department &amp; Team Placement History (From → To, Who, Date, Reason)
            </h3>
            <div className="space-y-2.5">
              {member.placementHistory.map((ph) => (
                <div
                  key={ph.id}
                  className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0284C7]">
                      [{ph.changeType}] {ph.fromName} → {ph.toName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{ph.date}</span>
                  </div>
                  <div className="text-slate-600">{ph.reason}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    Approved by: {ph.actorName}
                  </div>
                </div>
              ))}
              {member.placementHistory.length === 0 && (
                <p className="text-xs text-slate-400">
                  No department or scientific team transfers recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: HR GOVERNANCE */}
      {activeTab === "hr" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:p-5">
          {/* Health Score Breakdown Formula */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0F1E36]">
                HR Health Score Formula Breakdown
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border tabular-nums ${healthColor}`}>
                <span className={`w-2 h-2 rounded-full ${healthDotColor}`} />
                {member.healthScore}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Weighted composite: <strong>50% Attendance</strong> +{" "}
              <strong>35% On-Time Tasks</strong> + <strong>15% Recent Activity</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Workshop Attendance (50% weight)</span>
                  <span className="tabular-nums">{member.attendanceRate}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>On-Time Task Delivery (35% weight)</span>
                  <span className="tabular-nums">{member.onTimeTaskRate}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Recent 30-Day Activity (15% weight)</span>
                  <span className="tabular-nums">{member.recentActivityScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Governance Status Transition Actions */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Status Transition
              </h3>
              <span className="text-[11px] text-slate-400">Current: <strong className="text-slate-800">{member.status}</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Reactivate / Return to Active */}
              <button
                type="button"
                disabled={member.status === "Active"}
                onClick={() => {
                  setHrReason(isPaused ? `Resumed active membership from pause (${pauseReasonLabel})` : "Reactivated to Active Member: Returned from inactive status");
                  setHrModalType("Active");
                }}
                className={`p-3 rounded-xl border transition text-left ${
                  member.status === "Active"
                    ? "border-slate-200 bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed"
                    : "border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 cursor-pointer shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Reactivate to Active
                  </span>
                  {member.status === "Active" ? (
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-200 text-slate-600">Current</span>
                  ) : (member.status === "Inactive" || member.status === "Suspended") ? (
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-600 text-white">Recommended</span>
                  ) : null}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Restore full active membership privileges</div>
              </button>

              {/* Set as Trainee */}
              <button
                type="button"
                disabled={member.status === "Trainee"}
                onClick={() => {
                  setHrReason("Reinstated to Trainee status: Continuing onboarding qualification");
                  setHrModalType("Trainee");
                }}
                className={`p-3 rounded-xl border transition text-left ${
                  member.status === "Trainee"
                    ? "border-slate-200 bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed"
                    : "border-sky-300 bg-sky-50/80 hover:bg-sky-100 text-sky-950 cursor-pointer shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    Set as Trainee
                  </span>
                  {member.status === "Trainee" && (
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-200 text-slate-600">Current</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Resume onboarding qualification tracking</div>
              </button>

              {/* Pause (Inactive) */}
              <button
                type="button"
                disabled={member.status === "Inactive"}
                onClick={() => {
                  setHrReason("Marked Inactive: Exam leave or prolonged silence");
                  setHrModalType("Inactive");
                }}
                className={`p-3 rounded-xl border transition text-left ${
                  member.status === "Inactive"
                    ? "border-slate-200 bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed"
                    : "border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-950 cursor-pointer shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Pause Membership (Inactive)</span>
                  {member.status === "Inactive" && (
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-200 text-slate-600">Current</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Flag member for exam leave or temporary pause</div>
              </button>

              {/* Suspend */}
              <button
                type="button"
                disabled={member.status === "Suspended"}
                onClick={() => setHrModalType("Suspended")}
                className={`p-3 rounded-xl border transition text-left ${
                  member.status === "Suspended"
                    ? "border-slate-200 bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed"
                    : "border-rose-300 bg-rose-50/80 hover:bg-rose-100 text-rose-950 cursor-pointer shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Suspend Member</span>
                  {member.status === "Suspended" && (
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-200 text-slate-600">Current</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Temporary freeze with scheduled end date</div>
              </button>

              {/* Mark as Resigned */}
              <button
                type="button"
                onClick={() => setHrModalType("Resigned")}
                className="p-3 rounded-xl border border-slate-200 bg-[#F4F7FB] hover:bg-slate-200/70 text-left transition cursor-pointer shadow-2xs"
              >
                <div className="text-xs font-bold text-slate-800">Mark as Resigned</div>
                <div className="text-[11px] text-slate-500 mt-1">Move to Former Members archive</div>
              </button>

              {/* Remove Member */}
              <button
                type="button"
                onClick={() => setHrModalType("Removed")}
                className="p-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-left transition cursor-pointer shadow-2xs"
              >
                <div className="text-xs font-bold text-rose-900">Remove Member</div>
                <div className="text-[11px] text-rose-700/80 mt-1">Bureau dismissal moved to Former archive</div>
              </button>

              <button
                type="button"
                onClick={() => setHrModalType("Alumni")}
                className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition sm:col-span-2 cursor-pointer"
              >
                <div className="text-xs font-extrabold text-indigo-900">
                  Graduate to Alumni [Requires Graduation Year]
                </div>
                <div className="text-[11px] text-indigo-700 mt-0.5">
                  Honourable graduation with read-only Alumni Portal access
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Award Badge Manually Modal */}
      {awardModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0F1E36]">Award Badge Manually</h3>
              <button
                type="button"
                onClick={() => setAwardModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAwardBadge} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Badge</label>
                <select
                  value={selectedBadgeId}
                  onChange={(e) => setSelectedBadgeId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-bold"
                >
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (+{b.xpReward} XP)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Citation / Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  placeholder="Why is this badge being awarded?"
                  className="w-full px-3 py-2 border border-slate-200/90 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAwardModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-extrabold bg-[#182C4E] text-white"
                >
                  Award Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HR Status Transition Modal */}
      {hrModalType && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0F1E36]">
                Transition Member to: {hrModalType}
              </h3>
              <button
                type="button"
                onClick={() => setHrModalType(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleStatusTransition} className="mt-4 space-y-3.5 text-xs">
              {hrModalType === "Active" && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Reactivating to Full Active Status
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    This will immediately lift any pause, inactivity flag, or temporary freeze on <strong>{member.fullName}</strong>. Their profile will be fully restored with active club privileges, workshop check-in, and department task assignments.
                  </div>
                </div>
              )}

              {hrModalType === "Trainee" && (
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200/90 text-sky-800 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-xs text-sky-900">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    Reinstating as Trainee Member
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    This sets <strong>{member.fullName}</strong> to Trainee status with ongoing 3-ring qualification tracking and buddy assignment.
                  </div>
                </div>
              )}

              {hrModalType === "Suspended" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Suspension End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={hrSuspensionEnd}
                    onChange={(e) => setHrSuspensionEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200/90 rounded-xl font-semibold"
                  />
                </div>
              )}

              {hrModalType === "Resigned" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Manager Name Filing Resignation *
                  </label>
                  <input
                    type="text"
                    required
                    value={hrActorName}
                    onChange={(e) => setHrActorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200/90 rounded-xl font-semibold"
                  />
                </div>
              )}

              {hrModalType === "Removed" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bureau Decision Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={hrDecisionRef}
                    onChange={(e) => setHrDecisionRef(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200/90 rounded-xl font-semibold"
                  />
                </div>
              )}

              {hrModalType === "Alumni" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Graduation Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={hrGraduationYear}
                    onChange={(e) => setHrGraduationYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200/90 rounded-xl font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mandatory Official Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={hrReason}
                  onChange={(e) => setHrReason(e.target.value)}
                  placeholder="Enter official reason for audit log..."
                  className="w-full px-3 py-2 border border-slate-200/90 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHrModalType(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-extrabold bg-[#182C4E] text-white"
                >
                  Confirm {hrModalType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Official Member Digital ID Pass Modal */}
      <PersonalQRModal
        open={showDigitalIdModal}
        onClose={() => setShowDigitalIdModal(false)}
        member={member}
        departmentName={department?.name || "Unassigned"}
        teamName={team?.name}
      />
    </>
  );
}
