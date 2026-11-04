"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  User,
  Shield,
  GraduationCap,
  Award,
  Laptop,
  Globe,
  Building,
  CheckCircle2,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import {
  Member,
  MemberStatus,
  RoleTemplateName,
  HousingType,
  CommuteDuration,
  PcCapability,
} from "@/lib/types/erp";
import { getEffectiveMemberAvatar } from "@/lib/utils/avatarUtils";

interface EditMemberModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedName: string) => void;
}

const ALL_ROLES: RoleTemplateName[] = [
  "Super Admin",
  "Executive",
  "HR Head",
  "Department Head",
  "Co-Manager",
  "Team Leader",
  "Editor",
  "KPI Viewer",
  "Alumni",
  "Member",
];

const ALL_STATUSES: MemberStatus[] = [
  "Active",
  "Trainee",
  "Pending",
  "Alumni",
  "Inactive",
  "Suspended",
  "Resigned",
  "Removed",
];

const TENURE_OPTIONS = [
  "New Member",
  "1 Year",
  "2+ Years",
  "3 Years",
  "QUANTA Alumni",
  "Bureau Leadership",
];

const ACADEMIC_YEARS = ["L1", "L2", "L3", "M1", "M2", "Doctorate", "Graduated"] as const;

export function EditMemberModal({
  member,
  isOpen,
  onClose,
  onSaved,
}: EditMemberModalProps) {
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);
  const allMembers = useQuantersStore((s) => s.members);
  const updateMemberFullAdmin = useQuantersStore((s) => s.updateMemberFullAdmin);

  const [activeTab, setActiveTab] = useState<
    "identity" | "academic" | "governance" | "residence" | "hardware"
  >("identity");

  // Form State
  const [fullName, setFullName] = useState("");
  const [quanterId, setQuanterId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [tenure, setTenure] = useState("");
  const [yearsInClub, setYearsInClub] = useState<number>(0);
  const [clubJoinYear, setClubJoinYear] = useState<number>(2026);

  const [level, setLevel] = useState<number>(1);
  const [levelTitle, setLevelTitle] = useState("");
  const [xpTotal, setXpTotal] = useState<number>(0);
  const [xpSeason, setXpSeason] = useState<number>(0);
  const [xpMonth, setXpMonth] = useState<number>(0);
  const [healthScore, setHealthScore] = useState<number>(95);

  const [status, setStatus] = useState<MemberStatus>("Active");
  const [departmentId, setDepartmentId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [buddyId, setBuddyId] = useState("");
  const [isBureauMember, setIsBureauMember] = useState(false);
  const [roles, setRoles] = useState<RoleTemplateName[]>([]);

  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [housingType, setHousingType] = useState<HousingType>("Family Home");
  const [commuteTime, setCommuteTime] = useState<CommuteDuration>("< 30 min");
  const [canStayLate, setCanStayLate] = useState(true);

  const [hasLaptop, setHasLaptop] = useState(true);
  const [pcCapability, setPcCapability] = useState<PcCapability>("Coding & Dev");
  const [equipmentTagsText, setEquipmentTagsText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [outsideActivities, setOutsideActivities] = useState("");
  const [declaresOtherStudentOrg, setDeclaresOtherStudentOrg] = useState(false);
  const [skillsText, setSkillsText] = useState("");

  const [alumniPosition, setAlumniPosition] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [alumniAccessEnabled, setAlumniAccessEnabled] = useState(false);

  const [auditReason, setAuditReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!member || !isOpen) return;
    setFullName(member.fullName || "");
    setQuanterId(member.quanterId || "");
    setEmail(member.email || "");
    setPhone(member.phone || "");
    setAvatarUrl(member.avatarUrl || "");

    setUniversity(member.university || "University of Algiers 1");
    setMajor(member.major || "");
    setAcademicYear(member.academicYear || "L3");
    setTenure(member.tenure || "1 Year");
    setYearsInClub(typeof member.yearsInClub === "number" ? member.yearsInClub : 1);
    setClubJoinYear(member.clubJoinYear || 2025);

    setLevel(member.level || 1);
    setLevelTitle(member.levelTitle || "Member");
    setXpTotal(member.xpTotal || 0);
    setXpSeason(typeof member.xpSeason === "number" ? member.xpSeason : member.xpTotal || 0);
    setXpMonth(member.xpMonth || 0);
    setHealthScore(member.healthScore ?? 95);

    setStatus(member.status || "Active");
    setDepartmentId(member.departmentId || "");
    setTeamId(member.teamId || "");
    setBuddyId(member.buddyId || "");
    setIsBureauMember(Boolean(member.isBureauMember));
    setRoles(member.roles || ["Member"]);

    setWilaya(member.wilaya || "Algiers (16)");
    setCommune(member.commune || "");
    setHousingType(member.housingType || "Family Home");
    setCommuteTime(member.commuteTime || "< 30 min");
    setCanStayLate(member.canStayLate ?? true);

    setHasLaptop(member.hasLaptop ?? true);
    setPcCapability(member.pcCapability || "Coding & Dev");
    setEquipmentTagsText((member.equipmentTags || []).join(", "));
    setGithubUrl(member.githubUrl || "");
    setLinkedinUrl(member.linkedinUrl || "");
    setPortfolioUrl(member.portfolioUrl || "");
    setCvUrl(member.cvUrl || "");
    setOutsideActivities(member.outsideActivitiesAndVolunteering || "");
    setDeclaresOtherStudentOrg(Boolean(member.declaresOtherStudentOrg));
    setSkillsText((member.skills || []).join(", "));

    setAlumniPosition(member.alumniPosition || "");
    setGraduationYear(member.graduationYear || "2026");
    setAlumniAccessEnabled(Boolean(member.alumniAccessEnabled));
    setAuditReason("Updated member details via Super Admin control panel");
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleRoleToggle = (role: RoleTemplateName) => {
    if (roles.includes(role)) {
      setRoles(roles.filter((r) => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSaving(true);
    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const equipmentTags = equipmentTagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updates: Partial<Member> = {
        fullName: fullName.trim(),
        quanterId: quanterId.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim(),

        university: university.trim(),
        major: major.trim(),
        academicYear: (academicYear as any) || undefined,
        tenure: tenure.trim(),
        yearsInClub: Number(yearsInClub) || 0,
        clubJoinYear: Number(clubJoinYear) || 2026,

        level: Number(level) || 1,
        levelTitle: levelTitle.trim(),
        xpTotal: Number(xpTotal) || 0,
        xpSeason: Number(xpSeason) || 0,
        xpMonth: Number(xpMonth) || 0,
        healthScore: Number(healthScore) || 0,

        status,
        departmentId,
        teamId: teamId || undefined,
        buddyId: buddyId || undefined,
        isBureauMember,
        roles: roles.length > 0 ? roles : ["Member"],

        wilaya: wilaya.trim(),
        commune: commune.trim(),
        housingType,
        commuteTime,
        canStayLate,

        hasLaptop,
        pcCapability,
        equipmentTags,
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        cvUrl: cvUrl.trim(),
        outsideActivitiesAndVolunteering: outsideActivities.trim(),
        declaresOtherStudentOrg,
        skills,

        alumniPosition: alumniPosition.trim(),
        graduationYear: graduationYear.trim(),
        alumniAccessEnabled,
      };

      updateMemberFullAdmin(member.id, updates, auditReason || "Super Admin profile update");
      onSaved?.(fullName.trim());
      onClose();
    } catch (err) {
      console.error("Failed to save member profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-rise">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0F1E36] to-[#182C4E] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                <span>Edit Member Profile</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  Super Admin Control
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Updating dossier for <strong className="text-white">{member.fullName}</strong> ({member.quanterId})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div role="tablist" aria-label="Member edit tabs" className="flex items-center gap-1.5 px-4 py-2 bg-slate-100/80 border-b border-slate-200 overflow-x-auto scrollbar-none">
          {[
            { id: "identity", label: "Identity & Contact", icon: User },
            { id: "academic", label: "Academics & Seniority", icon: GraduationCap },
            { id: "governance", label: "Status, Org & Roles", icon: Building },
            { id: "residence", label: "Residence & Logistics", icon: Globe },
            { id: "hardware", label: "Technical & Links", icon: Laptop },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer active:scale-98 ${
                  isSelected
                    ? "bg-white text-[#0F1E36] shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#0284C7]" : "text-slate-400"}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: IDENTITY & CONTACT */}
          {activeTab === "identity" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Khalil Hamidani"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Quanter ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quanterId}
                    onChange={(e) => setQuanterId(e.target.value)}
                    placeholder="QT-26-XXXX"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+213 555 000 000"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Avatar Image URL
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={getEffectiveMemberAvatar({ fullName, avatarUrl: avatarUrl || member.avatarUrl })}
                    alt={fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... or data:image/..."
                    className="flex-1 px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMICS & SENIORITY */}
          {activeTab === "academic" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    University
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="University of Algiers 1"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Academic Major / Specialty
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Physics / Computer Science"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tenure / Membership Category
                  </label>
                  <select
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    {TENURE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Years Inside the Club (Numeric)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={yearsInClub}
                    onChange={(e) => setYearsInClub(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Club Join Year (Calendar)
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    value={clubJoinYear}
                    onChange={(e) => setClubJoinYear(parseInt(e.target.value, 10) || 2026)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Rank & XP */}
              <div className="pt-3 border-t border-slate-200">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Rank Level, Score &amp; Points
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Rank Level (1–8)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={level}
                      onChange={(e) => setLevel(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Level Title
                    </label>
                    <input
                      type="text"
                      value={levelTitle}
                      onChange={(e) => setLevelTitle(e.target.value)}
                      placeholder="e.g. 1 Year Member"
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Health Score (0–100%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={healthScore}
                      onChange={(e) => setHealthScore(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Total XP (Lifetime)
                    </label>
                    <input
                      type="number"
                      value={xpTotal}
                      onChange={(e) => setXpTotal(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Season XP (Current Season)
                    </label>
                    <input
                      type="number"
                      value={xpSeason}
                      onChange={(e) => setXpSeason(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono font-bold text-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Month XP
                    </label>
                    <input
                      type="number"
                      value={xpMonth}
                      onChange={(e) => setXpMonth(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono font-bold text-sky-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNANCE, STATUS & ORG */}
          {activeTab === "governance" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Membership Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MemberStatus)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assigned Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="">-- No Department Assigned --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Scientific Research Team
                  </label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="">-- No Team Assigned --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.field})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assigned Senior Buddy
                  </label>
                  <select
                    value={buddyId}
                    onChange={(e) => setBuddyId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="">-- No Buddy Assigned --</option>
                    {allMembers
                      .filter((m) => m.id !== member.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.quanterId})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Roles Multi-Select Checkboxes */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-2">
                  Assigned Administrative &amp; Platform Roles
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_ROLES.map((r) => {
                    const checked = roles.includes(r);
                    return (
                      <label
                        key={r}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition text-xs font-semibold ${
                          checked
                            ? "bg-sky-50 text-[#0284C7] border-sky-300 font-bold"
                            : "bg-[#F8FAFD] text-slate-700 border-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleRoleToggle(r)}
                          className="rounded text-[#0284C7]"
                        />
                        <span>{r}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bureauToggle"
                  checked={isBureauMember}
                  onChange={(e) => setIsBureauMember(e.target.checked)}
                  className="rounded text-[#0284C7]"
                />
                <label htmlFor="bureauToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Official Executive Bureau Officer (Subject to Law Art. 7 Dual-Mandate restrictions)
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: RESIDENCE & LOGISTICS */}
          {activeTab === "residence" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Wilaya
                  </label>
                  <input
                    type="text"
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    placeholder="Algiers (16)"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Commune / District
                  </label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="e.g. Bab Ezzouar, Kouba, Bouzaréah"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Housing Type
                  </label>
                  <select
                    value={housingType}
                    onChange={(e) => setHousingType(e.target.value as HousingType)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="Family Home">Family Home</option>
                    <option value="University Residence (Cité)">University Residence (Cité)</option>
                    <option value="Shared Apartment">Shared Apartment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Commute Duration
                  </label>
                  <select
                    value={commuteTime}
                    onChange={(e) => setCommuteTime(e.target.value as CommuteDuration)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="< 30 min">&lt; 30 min</option>
                    <option value="30–60 min">30–60 min</option>
                    <option value="> 1 hour">&gt; 1 hour</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="stayLateToggle"
                  checked={canStayLate}
                  onChange={(e) => setCanStayLate(e.target.checked)}
                  className="rounded text-[#0284C7]"
                />
                <label htmlFor="stayLateToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Can stay late after 18:00 for evening hackathons and activities
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: TECHNICAL, LINKS & ALUMNI */}
          {activeTab === "hardware" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    PC / Compute Capability
                  </label>
                  <select
                    value={pcCapability}
                    onChange={(e) => setPcCapability(e.target.value as PcCapability)}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="Light Tasks">Light Tasks</option>
                    <option value="Coding & Dev">Coding &amp; Dev</option>
                    <option value="AI & Heavy Compute">AI &amp; Heavy Compute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Equipment / Hardware Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={equipmentTagsText}
                    onChange={(e) => setEquipmentTagsText(e.target.value)}
                    placeholder="Personal Laptop, GPU, Arduino"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Skills &amp; Expertise (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="Python, React, Machine Learning, UI/UX"
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Outside Activities, External Clubs &amp; Volunteering
                </label>
                <textarea
                  rows={2}
                  value={outsideActivities}
                  onChange={(e) => setOutsideActivities(e.target.value)}
                  placeholder="External responsibility, student unions, volunteer initiatives..."
                  className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              {/* Alumni-specific section */}
              <div className="pt-3 border-t border-slate-200 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mb-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Alumni Network Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-900 mb-1">
                      Professional Role / Company
                    </label>
                    <input
                      type="text"
                      value={alumniPosition}
                      onChange={(e) => setAlumniPosition(e.target.value)}
                      placeholder="e.g. AI Engineer at Google"
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-900 mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-950"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="alumniAccessToggle"
                      checked={alumniAccessEnabled}
                      onChange={(e) => setAlumniAccessEnabled(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <label htmlFor="alumniAccessToggle" className="text-[11px] font-bold text-indigo-900 cursor-pointer">
                      Grant Alumni Portal Access
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Reason */}
          <div className="pt-3 border-t border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Audit Note / Reason for Edits
            </label>
            <input
              type="text"
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              placeholder="e.g. Corrected spelling of member name per request"
              className="w-full px-3 py-2 bg-[#F8FAFD] border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              Changes sync immediately to local state and Cloud Firestore.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Member Dossier"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
