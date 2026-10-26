"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Phone,
  Plus,
  ShieldAlert,
  Sparkles,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { DayOfWeek, MemberStatus, TimeSlot } from "@/lib/types/erp";

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

type TabId = "profile" | "activity" | "badges" | "availability" | "history" | "hr";

export default function AdminMemberDetailCardPage() {
  const params = useParams<{ id: string }>();
  const memberId = params?.id || "mem-ayoub";

  const {
    members,
    departments,
    teams,
    workshops,
    tasks,
    ledger,
    badges,
    confirmTraineeToActive,
    awardBadgeManually,
    changeMemberStatus,
  } = useQuantersStore();

  const member = members.find((m) => m.id === memberId) || members[0];
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Award Badge Manually modal state
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState(badges[0]?.id || "badge-python");
  const [awardReason, setAwardReason] = useState("");

  // HR Status Transition modal state
  const [hrModalType, setHrModalType] = useState<MemberStatus | null>(null);
  const [hrReason, setHrReason] = useState("");
  const [hrActorName, setHrActorName] = useState("Yasmine Bouzid (HR Head)");
  const [hrDecisionRef, setHrDecisionRef] = useState("DEC-BUREAU-2026-10");
  const [hrGraduationYear, setHrGraduationYear] = useState("2026");
  const [hrSuspensionEnd, setHrSuspensionEnd] = useState("2026-11-30");

  if (!member) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200/90">
        <p className="text-sm font-bold text-slate-700">Member not found.</p>
        <Link href="/admin/members" className="text-xs font-bold text-[#0284C7] underline mt-2 block">
          Return to Member Directory
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
      actorName: hrActorName.trim() || "Yasmine Bouzid (HR Head)",
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

  return (
    <>
      <div className="space-y-6 max-w-[1500px] mx-auto animate-rise">
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

      {/* Member Master Header + Trainee 3-Ring Confirmation Tracker */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#182C4E]/20 shadow-sm shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#0F1E36]">{member.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F4F7FB] text-slate-700 border border-slate-200/90 tabular-nums">
                  {member.quanterId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F0F6FF] text-[#182C4E]">
                  {member.status}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border tabular-nums ${healthColor}`}
                >
                  <span className={`w-2 h-2 rounded-full ${healthDotColor}`} />
                  Health {member.healthScore}%
                </span>
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
                <span>·</span>
                <span className="tabular-nums">
                  Level {member.level} ({member.levelTitle})
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

        {/* Trainee 3-Ring Confirmation Tracker */}
        <div className="bg-[#F4F7FB] rounded-2xl p-4 border border-slate-200/90 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <div className="text-xs font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                Trainee 3-Ring Qualification Tracker
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                3-Month Qualification: Time (90d) + Attendance (≥75%) + On-Time Tasks + Head &amp;
                Co-Manager Evaluation
              </p>
            </div>

            {/* Ring 1: Time 3m */}
            <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90">
              <div className="w-8 h-8 rounded-full border-2 border-[#182C4E] flex items-center justify-center text-[10px] font-extrabold text-[#0284C7] tabular-nums">
                {timeRingPct}%
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#0F1E36]">Ring 1 · Time (3m)</div>
                <div className="text-[10px] text-slate-500 tabular-nums">
                  {member.traineeDaysElapsed} / 90 days
                </div>
              </div>
            </div>

            {/* Ring 2: Attendance >= 75% */}
            <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold tabular-nums ${
                  attRingOk
                    ? "border-emerald-500 text-emerald-600"
                    : "border-amber-500 text-amber-600"
                }`}
              >
                {member.attendanceRate}%
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#0F1E36]">Ring 2 · Attendance</div>
                <div className="text-[10px] text-slate-500">Target ≥75%</div>
              </div>
            </div>

            {/* Ring 3: Tasks on time */}
            <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold tabular-nums ${
                  taskRingOk
                    ? "border-emerald-500 text-emerald-600"
                    : "border-amber-500 text-amber-600"
                }`}
              >
                {member.onTimeTaskRate}%
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#0F1E36]">Ring 3 · Tasks On-Time</div>
                <div className="text-[10px] text-slate-500">
                  {member.lateTasksThisMonth} late this month
                </div>
              </div>
            </div>
          </div>

          {/* Head / Co-Manager Evaluation Box + 1-Click Confirm as Active */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 text-[11px]">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  Head:{" "}
                  {member.traineeEvaluation.headEndorsed ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-700">
                      <Check className="w-3 h-3" /> Endorsed
                    </span>
                  ) : (
                    "Pending"
                  )}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  Co-Mgr:{" "}
                  {member.traineeEvaluation.coManagerEndorsed ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-700">
                      <Check className="w-3 h-3" /> Endorsed
                    </span>
                  ) : (
                    "Pending"
                  )}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[220px]">
                {member.traineeEvaluation.notes || "Awaiting end-of-cycle evaluation note."}
              </div>
            </div>

            {member.status === "Trainee" ? (
              <button
                type="button"
                onClick={() =>
                  confirmTraineeToActive(
                    member.id,
                    "Confirmed as Official Active Member from 6-Tab Member Card."
                  )
                }
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
              >
                Confirm as Active
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
                <Check className="w-3.5 h-3.5" />
                Official {member.status}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 6-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm">
        {[
          { id: "profile", label: "1. Profile", icon: User },
          { id: "activity", label: "2. Activity", icon: Activity },
          { id: "badges", label: "3. Badges", icon: Award },
          { id: "availability", label: "4. Availability", icon: Calendar },
          { id: "history", label: "5. History", icon: History },
          { id: "hr", label: "6. HR Governance", icon: Lock },
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-[#0F1E36] uppercase tracking-wider">
                Academic, Contact &amp; Onboarding Wizard Answers
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Email Address</div>
                  <div className="font-bold text-[#0F1E36] mt-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#0284C7]" />
                    {member.email}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Phone Number</div>
                  <div className="font-bold text-[#0F1E36] mt-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#0284C7]" />
                    {member.phone}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    University &amp; Major
                  </div>
                  <div className="font-bold text-[#0F1E36] mt-1">
                    {member.major} · {member.university}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Academic Year &amp; Club Tenure
                  </div>
                  <div className="font-bold text-[#0F1E36] mt-1">
                    Year: {member.academicYear} · Tenure: {member.tenure}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Assigned Buddy</div>
                  <div className="font-bold text-[#0F1E36] mt-1">
                    {buddy ? `${buddy.fullName} (${buddy.quanterId})` : "No Buddy Assigned"}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
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
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Residence, Housing & Commute Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0284C7]" />
                  Residence, Housing &amp; Commute Card
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                    member.canStayLate !== false
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {member.canStayLate !== false ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Can Stay After 16:30 / Saturdays</span>
                    </>
                  ) : (
                    <span>Daytime Shifts Only (&lt;16:30)</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Wilaya</div>
                  <div className="font-extrabold text-[#0F1E36] mt-1">
                    {member.wilaya || "Algiers (16)"}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Commune / District
                  </div>
                  <div className="font-extrabold text-[#0F1E36] mt-1">
                    {member.commune || "Bab Ezzouar"}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Housing Type</div>
                  <div className="font-extrabold text-[#0F1E36] mt-1">
                    {member.housingType || "Family Home"}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
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
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#0284C7]" />
                  Hardware, PC &amp; Professional Links Card
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
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Has Personal Laptop
                  </div>
                  <div className="font-extrabold text-[#0F1E36] mt-1">
                    {member.hasLaptop !== false && member.pcCapability !== "No Personal PC"
                      ? "Yes (Available for Workshops)"
                      : "No (Requires Lab Station)"}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    PC Capability Profile
                  </div>
                  <div className="font-extrabold text-[#182C4E] mt-1">
                    {member.pcCapability || "Coding & Dev"}
                  </div>
                </div>
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
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
                    member.githubUrl && /^https?:\/\//i.test(member.githubUrl.trim())
                      ? member.githubUrl.trim()
                      : `https://github.com/${member.handle.replace("@", "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-[#29D2FF]" />
                </a>
                <a
                  href={
                    member.linkedinUrl && /^https?:\/\//i.test(member.linkedinUrl.trim())
                      ? member.linkedinUrl.trim()
                      : "https://linkedin.com"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={
                    member.portfolioUrl && /^https?:\/\//i.test(member.portfolioUrl.trim())
                      ? member.portfolioUrl.trim()
                      : "https://quanta-algiers.dz"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F4F7FB] hover:bg-slate-200 text-slate-800 border border-slate-200/90 text-xs font-bold transition"
                >
                  <span>Portfolio</span>
                  <ExternalLink className="w-3 h-3 text-[#0284C7]" />
                </a>
                <a
                  href={
                    member.cvUrl && /^https?:\/\//i.test(member.cvUrl.trim())
                      ? member.cvUrl.trim()
                      : "https://quanta-algiers.dz/cv"
                  }
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
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
      {activeTab === "availability" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F1E36]">
              Visual Weekly Availability Grid (Saturday – Friday × Morning / Afternoon / Evening)
            </h3>
            <p className="text-xs text-slate-500">
              Used by the Free Slot Finder to match {member.fullName} with workshop &amp; logistics
              shifts
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 text-[10px] font-extrabold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Day</th>
                  {SLOTS.map((s) => (
                    <th key={s} className="py-2.5 px-3 text-center">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{day}</td>
                    {SLOTS.map((slot) => {
                      const isFree = member.availability?.[day]?.includes(slot);
                      return (
                        <td key={slot} className="py-2 px-2 text-center">
                          <div
                            className={`inline-flex items-center justify-center gap-1 w-full py-2 px-3 rounded-xl font-bold text-xs ${
                              isFree
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-50 text-slate-400"
                            }`}
                          >
                            {isFree ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Free Slot</span>
                              </>
                            ) : (
                              "Busy"
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: HISTORY */}
      {activeTab === "history" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status History */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0F1E36]">
              Status Transition History (From → To, Who, Date, Reason)
            </h3>
            <div className="space-y-2.5">
              {member.statusHistory.map((sh) => (
                <div
                  key={sh.id}
                  className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90 text-xs space-y-1"
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0F1E36]">
              Department &amp; Team Placement History (From → To, Who, Date, Reason)
            </h3>
            <div className="space-y-2.5">
              {member.placementHistory.map((ph) => (
                <div
                  key={ph.id}
                  className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200/90 text-xs space-y-1"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Health Score Breakdown Formula */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
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
                  <span>1. Workshop Attendance (50% weight)</span>
                  <span className="tabular-nums">{member.attendanceRate}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>2. On-Time Task Delivery (35% weight)</span>
                  <span className="tabular-nums">{member.onTimeTaskRate}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/90">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>3. Recent 30-Day Activity (15% weight)</span>
                  <span className="tabular-nums">{member.recentActivityScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Governance Status Transition Actions */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#0F1E36]">
              Governance Status Transition Actions (Logged to Audit Log)
            </h3>
            <p className="text-xs text-slate-500">
              Every status transition requires an official reason and mandatory governance metadata.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHrModalType("Inactive")}
                className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-left transition cursor-pointer"
              >
                <div className="text-xs font-extrabold text-amber-900">Set Inactive</div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Flag member for ≥30 days silence or exam leave
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHrModalType("Suspended")}
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-left transition cursor-pointer"
              >
                <div className="text-xs font-extrabold text-rose-900">
                  Suspend [Requires End Date]
                </div>
                <div className="text-[11px] text-rose-700 mt-0.5">
                  Temporary disciplinary freeze with mandatory end date
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHrModalType("Resigned")}
                className="p-3.5 rounded-xl border border-slate-200 bg-[#F4F7FB] hover:bg-slate-200/70 text-left transition cursor-pointer"
              >
                <div className="text-xs font-extrabold text-[#0F1E36]">
                  Set Resigned [Reason + Manager Name]
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Voluntary departure moved to Former Members archive
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHrModalType("Removed")}
                className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-left transition cursor-pointer"
              >
                <div className="text-xs font-extrabold text-rose-900">
                  Set Removed [Reason + Decision Ref]
                </div>
                <div className="text-[11px] text-rose-700 mt-0.5">
                  Bureau removal decision moved to Former Members archive
                </div>
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
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6">
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
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6">
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
    </>
  );
}
