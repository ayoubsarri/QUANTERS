"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  FolderGit2,
  Globe,
  GraduationCap,
  Home,
  Laptop,
  Landmark,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import {
  QUANTA_INTERNAL_LAW_CHAPTERS,
  QUANTA_INTERNAL_LAW_HEADER,
} from "@/lib/data/internalLaw";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { FALLBACK_SESSION_MEMBER } from "@/lib/data/seed";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { validateEmail } from "@/lib/utils/authSecurity";
import {
  AvailabilityGrid,
  CommuteDuration,
  DayOfWeek,
  HousingType,
  isMemberAvailableInSlot,
  Member,
  STUDY_HOUR_SLOTS,
  TimeSlot,
  UNIVERSITY_SPECIALTIES,
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

const WILAYA_OPTIONS = [
  "Algiers (16)",
  "Blida (09)",
  "Boumerdès (35)",
  "Tipaza (42)",
  "Other",
];

const HOUSING_OPTIONS: HousingType[] = [
  "Family Home",
  "University Residence (Cité)",
  "Shared Apartment",
];

const COMMUTE_OPTIONS: CommuteDuration[] = [
  "< 30 min",
  "30–60 min",
  "> 1 hour",
];

const UNIVERSITY_OPTIONS = [
  "University of Algiers 1 (Benyoucef Benkhedda)",
  "USTHB (Houari Boumediene University of Science & Technology)",
  "University of Algiers 2 (Abou El Kacem Saâdallah)",
  "University of Algiers 3 (Brahim Soltani Chaibout)",
  "ESI (Higher National School of Computer Science)",
  "ENP (National Polytechnic School)",
  "ENS (Higher Normal School — Kouba / Bouzaréah)",
  "ENSA / ENSV / ENSSMAL / EPAU",
  "University of Blida 1 (Saâd Dahlab)",
  "University of Boumerdès (UMBB)",
  "Other University / Higher School",
] as const;

const ACADEMIC_YEARS: Member["academicYear"][] = [
  "L1",
  "L2",
  "L3",
  "M1",
  "M2",
  "Doctorate",
  "Graduated",
];

const TENURE_OPTIONS = [
  "New Trainee (2026/2027)",
  "1 Semester",
  "1 Year",
  "2+ Years",
];

const EXTRA_EQUIPMENT_OPTIONS = [
  "Personal Laptop",
  "Camera / DSLR",
  "Arduino / Electronics Kit",
  "Graphic Tablet",
  "Car / Transport",
];

export default function OnboardingWizardPage() {
  const router = useRouter();
  const settings = useQuantersStore((s) => s.settings);
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);
  const members = useQuantersStore((s) => s.members);
  const isAuthenticated = useQuantersStore((s) => s.isAuthenticated);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const completeFirstTimeProfile = useQuantersStore(
    (s) => s.completeFirstTimeProfile
  );
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);

  const rawSessionMember =
    isAuthenticated && currentMemberId
      ? members.find((m) => m.id === currentMemberId)
      : undefined;
  // Only pre-fill if the user just registered a fresh incomplete Trainee account on /welcome
  const existingMember =
    rawSessionMember &&
    !rawSessionMember.onboardingTicks?.profileComplete &&
    !rawSessionMember.isBureauMember
      ? rawSessionMember
      : undefined;
  const currentMember = existingMember || FALLBACK_SESSION_MEMBER;

  const [step, setStep] = useState<number>(1);

  // Step 1: Identity & Avatar
  const [fullName, setFullName] = useState(
    existingMember ? existingMember.fullName : ""
  );
  const [email, setEmail] = useState(
    existingMember ? existingMember.email : ""
  );
  const [phone, setPhone] = useState(
    existingMember && existingMember.phone !== "+213 550 00 00 00"
      ? existingMember.phone
      : ""
  );
  const [avatarUrl, setAvatarUrl] = useState(currentMember.avatarUrl);

  // Step 2: Where You Live & Commute (HR Logistics)
  const [wilaya, setWilaya] = useState(currentMember.wilaya || "Algiers (16)");
  const [commune, setCommune] = useState(
    existingMember ? existingMember.commune || "" : ""
  );
  const [housingType, setHousingType] = useState<HousingType>(
    currentMember.housingType || "Family Home"
  );
  const [commuteTime, setCommuteTime] = useState<CommuteDuration>(
    currentMember.commuteTime || "< 30 min"
  );
  const [canStayLate, setCanStayLate] = useState<boolean>(
    currentMember.canStayLate ?? true
  );

  // Step 3: University, Specialty & Study Level
  const [selectedUniversity, setSelectedUniversity] = useState<string>(
    UNIVERSITY_OPTIONS.find((u) =>
      u.toLowerCase().includes((currentMember.university || "").toLowerCase())
    ) || UNIVERSITY_OPTIONS[0]
  );
  const [customUniversity, setCustomUniversity] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    UNIVERSITY_SPECIALTIES.find((s) =>
      s.toLowerCase().includes(currentMember.major.toLowerCase())
    ) || UNIVERSITY_SPECIALTIES[4]
  );
  const [customMajor, setCustomMajor] = useState("");
  const [academicYear, setAcademicYear] = useState<Member["academicYear"]>(
    currentMember.academicYear || "L3"
  );
  const [tenure, setTenure] = useState(
    currentMember.tenure || "New Trainee (2026/2027)"
  );

  // Step 4: Personal PC, Equipment & Links (PC Capability Profile deleted per request)
  const [hasLaptop, setHasLaptop] = useState<boolean>(
    currentMember.hasLaptop ?? true
  );
  const [equipmentTags, setEquipmentTags] = useState<string[]>(
    existingMember?.equipmentTags && existingMember.equipmentTags.length > 0
      ? existingMember.equipmentTags
      : ["Personal Laptop"]
  );
  const [githubUrl, setGithubUrl] = useState(existingMember?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(
    existingMember?.linkedinUrl || ""
  );
  const [portfolioUrl, setPortfolioUrl] = useState(
    existingMember?.portfolioUrl || ""
  );
  const [cvUrl, setCvUrl] = useState(existingMember?.cvUrl || "");

  // Step 5: Placement & 7-Day Availability
  const [departmentId, setDepartmentId] = useState(currentMember.departmentId);
  const [teamId, setTeamId] = useState<string | undefined>(
    existingMember?.teamId
  );
  const [availability, setAvailability] = useState<AvailabilityGrid>(
    currentMember.availability
  );

  // Step 6: Outside Activities & Charter
  const [outsideActivitiesAndVolunteering, setOutsideActivitiesAndVolunteering] =
    useState(existingMember?.outsideActivitiesAndVolunteering || "");
  const [declaresOtherStudentOrg, setDeclaresOtherStudentOrg] = useState(
    Boolean(existingMember?.declaresOtherStudentOrg)
  );
  const [charterConfirmed, setCharterConfirmed] = useState(false);
  const [showInternalLaw, setShowInternalLaw] = useState(false);
  const [lawChapterFilter, setLawChapterFilter] = useState<string>("ALL");

  const filteredSpecialties = useMemo(() => {
    const q = specialtySearch.trim().toLowerCase();
    if (!q) return [...UNIVERSITY_SPECIALTIES];
    return UNIVERSITY_SPECIALTIES.filter((s) => s.toLowerCase().includes(q));
  }, [specialtySearch]);

  const normalizeDayHourlySlots = (
    daySlots: TimeSlot[] | undefined
  ): TimeSlot[] => {
    const raw = daySlots || [];
    const expanded = SLOTS.filter((slotKey) =>
      isMemberAvailableInSlot(raw, slotKey)
    );
    return Array.from(new Set(expanded));
  };

  const toggleSlot = (day: DayOfWeek, slot: TimeSlot) => {
    setAvailability((prev) => {
      const daySlots = normalizeDayHourlySlots(prev[day]);
      const exists = daySlots.includes(slot);
      return {
        ...prev,
        [day]: exists
          ? daySlots.filter((s) => s !== slot)
          : [...daySlots, slot],
      };
    });
  };

  const toggleAllDaySlots = (day: DayOfWeek) => {
    setAvailability((prev) => {
      const daySlots = normalizeDayHourlySlots(prev[day]);
      const allSelected = daySlots.length === SLOTS.length;
      return {
        ...prev,
        [day]: allSelected ? [] : [...SLOTS],
      };
    });
  };

  const toggleEquipmentTag = (tag: string) => {
    setEquipmentTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const totalSelectedSlots = DAYS.reduce(
    (acc, d) => acc + normalizeDayHourlySlots(availability[d]).length,
    0
  );

  const effectiveUniversity =
    selectedUniversity === "Other University / Higher School" &&
    customUniversity.trim()
      ? customUniversity.trim()
      : selectedUniversity.replace(/\s*\(.*?\)\s*$/, "");

  const effectiveMajor =
    selectedSpecialty === "Other Scientific / Technical Major" &&
    customMajor.trim()
      ? customMajor.trim()
      : selectedSpecialty;

  const handleFinish = async () => {
    if (!charterConfirmed) return;
    const validEmail = validateEmail(email);
    if (!fullName.trim() || !validEmail.isValid) {
      setStep(1);
      return;
    }
    completeFirstTimeProfile({
      fullName: fullName.trim(),
      email: validEmail.normalized,
      phone: phone.trim(),
      avatarUrl,
      university: effectiveUniversity,
      major: effectiveMajor,
      academicYear,
      tenure,
      departmentId,
      teamId,
      wilaya,
      commune,
      housingType,
      commuteTime,
      canStayLate,
      hasLaptop,
      pcCapability: hasLaptop ? "Coding & Dev" : "No Personal PC",
      equipmentTags,
      githubUrl: githubUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      cvUrl: cvUrl.trim() || undefined,
      availability,
      outsideActivitiesAndVolunteering,
      declaresOtherStudentOrg,
    });
    await syncWithServer(true);
    router.push("/home");
  };

  if (!settings.registrationOpen) {
    return (
      <MobileAppShell hideBottomNav>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-rise">
          <div className="w-14 h-14 rounded-xl bg-[#F0F6FF] border border-[#D5E3F5] text-[#182C4E] flex items-center justify-center shadow-2xs mb-4">
            <Lock className="w-7 h-7 text-[#0284C7]" />
          </div>
          <h1 className="font-display text-xl font-black text-[#0F1E36]">
            Member Registration Paused
          </h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-xs">
            Direct registration is currently closed for this recruitment window.
            Existing members and alumni can enter their workspace directly.
          </p>
          <Link
            href="/home"
            className="mt-6 w-full max-w-xs h-11 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/70 text-white font-display text-xs font-black flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:scale-[0.98] transition"
          >
            <span>Return to Member Home</span>
            <ArrowRight className="w-4 h-4 text-[#7DD3FC]" />
          </Link>
        </div>
      </MobileAppShell>
    );
  }

  const STEP_META = [
    { num: 1, title: "Identity & Avatar", icon: UserCheck },
    { num: 2, title: "Residence & Commute", icon: Home },
    { num: 3, title: "University & Specialty", icon: GraduationCap },
    { num: 4, title: "Equipment & Links", icon: Laptop },
    { num: 5, title: "Placement & Availability", icon: Building2 },
    { num: 6, title: "Activities & Charter", icon: ShieldCheck },
  ];

  const currentMeta = STEP_META[step - 1];
  const StepIcon = currentMeta.icon;

  return (
    <MobileAppShell hideBottomNav>
      <div className="flex-1 flex flex-col px-4 pt-2.5 pb-6 sm:px-5 space-y-3">
        {/* Top Editorial Bar matching Member App */}
        <div
          className="flex items-center justify-between animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <Link
            href="/welcome"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-[#182C4E] active:scale-[0.98] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Welcome</span>
          </Link>
          <QuantaLogo size={26} showWordmark variant="light" />
          <span className="text-[11px] font-mono font-extrabold text-[#182C4E] bg-[#F0F6FF] border border-[#D5E3F5] px-2.5 py-0.5 rounded-lg tabular-nums">
            Step {step} / 6
          </span>
        </div>

        {/* 6-Segment Interactive Progress Bar */}
        <div
          className="grid grid-cols-6 gap-1.5 animate-rise"
          style={{ animationDelay: "30ms" }}
        >
          {STEP_META.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                s.num <= step
                  ? "bg-gradient-to-r from-[#182C4E] to-[#0284C7]"
                  : "bg-slate-200/90 hover:bg-slate-300"
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Step Title Banner — Unified Cosmic Slate-Navy Member App Style */}
        <div
          className="rounded-xl bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white p-4 shadow-[0_10px_28px_rgba(15,30,54,0.16)] border border-[#2B4875]/75 flex items-center justify-between gap-3 animate-rise"
          style={{ animationDelay: "60ms" }}
        >
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#7DD3FC] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>MEMBER REGISTRATION · ACADEMIC DOSSIER</span>
            </span>
            <h1 className="font-display text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
              {step}. {currentMeta.title}
            </h1>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-[#7DD3FC]/35 flex items-center justify-center text-[#7DD3FC] shrink-0">
            <StepIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Step Body Card — Crisp Member App Surface */}
        <div
          className="flex-1 bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-[0_4px_18px_rgba(15,30,54,0.05)] flex flex-col justify-between animate-rise"
          style={{ animationDelay: "90ms" }}
        >
          {/* STEP 1: Identity & Avatar */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-[#F0F6FF]/80 border border-[#D5E3F5]">
                <AvatarUploader
                  currentAvatarUrl={avatarUrl}
                  onAvatarCompressed={(url) => setAvatarUrl(url)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1">
                  Full Name (Official University Record)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#182C4E] transition"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>University / Personal Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#182C4E] transition"
                  placeholder="name@univ-alger.dz"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Phone Number (WhatsApp / Emergency)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#182C4E] transition"
                  placeholder="+213 5XX XX XX XX"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Where You Live & Commute (HR Logistics) */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1.5">
                  Wilaya of Residence
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {WILAYA_OPTIONS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWilaya(w)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold border active:scale-[0.98] transition cursor-pointer ${
                        wilaya === w
                          ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border-[#2B4875] shadow-2xs"
                          : "bg-[#F8FAFC] text-slate-700 border-slate-200/90 hover:border-[#182C4E]/40"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Commune / District</span>
                </label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#182C4E] transition"
                  placeholder="e.g. Bab Ezzouar, Alger Centre, Kouba..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1.5">
                  Housing Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {HOUSING_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHousingType(h)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border text-left flex items-center justify-between gap-2 active:scale-[0.98] transition cursor-pointer ${
                        housingType === h
                          ? "bg-[#F0F6FF] text-[#182C4E] border-[#0284C7]/60"
                          : "bg-[#F8FAFC] text-slate-700 border-slate-200/90 hover:border-[#182C4E]/40"
                      }`}
                    >
                      <span>{h}</span>
                      {housingType === h && (
                        <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1.5">
                  Campus Commute Time
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {COMMUTE_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCommuteTime(c)}
                      className={`h-9 rounded-lg text-[11px] font-extrabold border active:scale-[0.98] transition cursor-pointer ${
                        commuteTime === c
                          ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border-[#2B4875]"
                          : "bg-[#F8FAFC] text-slate-700 border-slate-200/90 hover:border-[#182C4E]/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#F0F6FF]/80 border border-[#D5E3F5] cursor-pointer">
                <div className="pr-2">
                  <span className="text-xs font-extrabold text-[#0F1E36] block">
                    Can attend late afternoon or Saturday sessions?
                  </span>
                  <span className="text-[10.5px] text-slate-500">
                    Helps HR schedule observatory nights and weekend workshops
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={canStayLate}
                  onChange={(e) => setCanStayLate(e.target.checked)}
                  className="w-4 h-4 rounded text-[#182C4E] focus:ring-[#182C4E]"
                />
              </label>
            </div>
          )}

          {/* STEP 3: University, Specialty & Study Level */}
          {step === 3 && (
            <div className="space-y-3.5">
              {/* University / Institution Selector */}
              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>University / Higher Education Institution</span>
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs font-bold text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#182C4E] transition"
                >
                  {UNIVERSITY_OPTIONS.map((univ) => (
                    <option key={univ} value={univ}>
                      {univ}
                    </option>
                  ))}
                </select>

                {selectedUniversity === "Other University / Higher School" && (
                  <input
                    type="text"
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    placeholder="Specify your university or higher school name..."
                    className="mt-2 w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#0284C7] text-xs font-semibold text-[#0F1E36] focus:bg-white focus:outline-none"
                  />
                )}
              </div>

              {/* Faculty of Sciences & Tech Specialty (26 Official Majors) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#0F1E36]">
                    Faculty of Sciences &amp; Tech Specialty (26 Official Majors)
                  </label>
                  <span className="text-[10px] font-mono font-bold text-[#0284C7]">
                    {filteredSpecialties.length} majors
                  </span>
                </div>
                <div className="relative mb-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={specialtySearch}
                    onChange={(e) => setSpecialtySearch(e.target.value)}
                    placeholder="Filter majors (Physics, AI, Biology, Math, Chemistry...)"
                    className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#182C4E] transition"
                  />
                </div>
                <div className="max-h-[145px] overflow-y-auto space-y-1 pr-1 rounded-xl border border-slate-200/90 p-1.5 bg-[#F8FAFC]">
                  {filteredSpecialties.map((spec) => {
                    const active = selectedSpecialty === spec;
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setSelectedSpecialty(spec)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] active:scale-[0.99] transition flex items-center justify-between gap-2 cursor-pointer ${
                          active
                            ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white font-extrabold shadow-2xs"
                            : "bg-white text-slate-700 hover:bg-[#F0F6FF] font-semibold border border-slate-100"
                        }`}
                      >
                        <span className="leading-snug">{spec}</span>
                        {active && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#7DD3FC] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedSpecialty === "Other Scientific / Technical Major" && (
                  <input
                    type="text"
                    value={customMajor}
                    onChange={(e) => setCustomMajor(e.target.value)}
                    placeholder="Specify your exact specialty or faculty..."
                    className="mt-2 w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#0284C7] text-xs font-semibold text-[#0F1E36] focus:bg-white focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1.5">
                  Academic Study Level
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {ACADEMIC_YEARS.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr)}
                      className={`h-8 rounded-lg text-[11px] font-extrabold border active:scale-[0.98] transition cursor-pointer ${
                        academicYear === yr
                          ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border-[#2B4875] shadow-2xs"
                          : "bg-[#F8FAFC] text-slate-700 border-slate-200/90 hover:border-[#182C4E]/40"
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1.5">
                  Club Tenure
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TENURE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTenure(t)}
                      className={`px-2.5 py-2 rounded-lg text-[11px] font-bold border active:scale-[0.98] transition cursor-pointer ${
                        tenure === t
                          ? "bg-[#F0F6FF] text-[#182C4E] border-[#0284C7]/60"
                          : "bg-[#F8FAFC] text-slate-700 border-slate-200/90 hover:border-[#182C4E]/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Equipment & Professional Links (PC Capability Profile Deleted) */}
          {step === 4 && (
            <div className="space-y-3.5">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F6FF]/80 border border-[#D5E3F5] cursor-pointer">
                <div className="pr-2">
                  <span className="text-xs font-extrabold text-[#0F1E36] block">
                    Do you have a personal Laptop or PC you can bring to workshops?
                  </span>
                  <span className="text-[10.5px] text-slate-600">
                    Used by organizers to allocate lab workstations
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={hasLaptop}
                  onChange={(e) => setHasLaptop(e.target.checked)}
                  className="w-4 h-4 rounded text-[#182C4E] focus:ring-[#182C4E]"
                />
              </label>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1.5">
                  Extra Equipment &amp; Hardware
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EXTRA_EQUIPMENT_OPTIONS.map((eq) => {
                    const active = equipmentTags.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipmentTag(eq)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border active:scale-[0.98] transition cursor-pointer ${
                          active
                            ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border-[#2B4875]"
                            : "bg-[#F8FAFC] text-slate-600 border-slate-200/90 hover:border-[#182C4E]/40"
                        }`}
                      >
                        {active ? (
                          <Check className="w-3 h-3 text-[#7DD3FC] shrink-0" />
                        ) : (
                          <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                        <span>{eq}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-[#0F1E36]">
                  Digital Portfolio &amp; Professional Links (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <FolderGit2 className="w-3.5 h-3.5 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="GitHub / GitLab (https://github.com/...)"
                      className="w-full h-9 pl-8 pr-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-[11px] font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#182C4E]"
                    />
                  </div>
                  <div className="relative">
                    <Linkedin className="w-3.5 h-3.5 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="LinkedIn Profile Link"
                      className="w-full h-9 pl-8 pr-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-[11px] font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#182C4E]"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="Portfolio / Behance / Drive Link"
                      className="w-full h-9 pl-8 pr-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-[11px] font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#182C4E]"
                    />
                  </div>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={cvUrl}
                      onChange={(e) => setCvUrl(e.target.value)}
                      placeholder="CV / Academic Resume Link"
                      className="w-full h-9 pl-8 pr-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-[11px] font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#182C4E]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Placement & 7-Day Availability */}
          {step === 5 && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1">
                  Operational Department (Select 1 of 6)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {departments.map((dept) => {
                    const active = departmentId === dept.id;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setDepartmentId(dept.id)}
                        className={`text-left px-2.5 py-2 rounded-lg border text-[11px] active:scale-[0.98] transition flex items-center justify-between gap-1 cursor-pointer ${
                          active
                            ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] border-[#2B4875] text-white font-extrabold shadow-2xs"
                            : "bg-[#F8FAFC] border-slate-200/90 text-slate-700 hover:border-[#182C4E]/40 font-semibold"
                        }`}
                      >
                        <span className="leading-snug">{dept.shortName}</span>
                        {active && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#7DD3FC] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F1E36] mb-1">
                  Scientific Research Team (Optional)
                </label>
                <select
                  value={teamId || ""}
                  onChange={(e) =>
                    setTeamId(e.target.value ? e.target.value : undefined)
                  }
                  className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs font-semibold text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#182C4E]"
                >
                  <option value="">
                    No Scientific Team yet (Department only)
                  </option>
                  {teams
                    .filter((t) => !t.archived)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.field})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div>
                    <span className="text-[11px] font-bold text-[#0F1E36] block">
                      7-Day Study &amp; Free Hours Matrix (08:00 – 20:00 Hour-by-Hour)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Tap your free hours between classes (08–09 through 19–20)
                    </span>
                  </div>
                  <span className="text-[10.5px] font-mono font-extrabold text-[#182C4E] bg-[#F0F6FF] border border-[#D5E3F5] px-2.5 py-0.5 rounded-lg tabular-nums">
                    {totalSelectedSlots} hrs free
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-0.5">
                  {DAYS.map((day) => {
                    const activeSlots = normalizeDayHourlySlots(
                      availability[day]
                    );
                    const allSelected = activeSlots.length === SLOTS.length;
                    return (
                      <div
                        key={day}
                        className="p-2 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-[#0F1E36]">
                            {day}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-500 tabular-nums">
                              {activeSlots.length}/{SLOTS.length} hrs free
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleAllDaySlots(day)}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-[#0284C7] hover:bg-[#F0F6FF] cursor-pointer transition"
                            >
                              {allSelected ? "Clear" : "All Day"}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                          {STUDY_HOUR_SLOTS.map((slotMeta) => {
                            const isSelected = activeSlots.includes(
                              slotMeta.key
                            );
                            return (
                              <button
                                key={slotMeta.key}
                                type="button"
                                onClick={() => toggleSlot(day, slotMeta.key)}
                                className={`py-1.5 px-1 rounded-lg text-[10px] font-mono font-extrabold active:scale-[0.97] transition cursor-pointer text-center ${
                                  isSelected
                                    ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875] shadow-2xs"
                                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
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
              </div>
            </div>
          )}

          {/* STEP 6: Outside Activities & Charter */}
          {step === 6 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#0F1E36] mb-1">
                  Other Clubs, Associations &amp; Volunteering Experience
                </label>
                <textarea
                  rows={3}
                  value={outsideActivitiesAndVolunteering}
                  onChange={(e) =>
                    setOutsideActivitiesAndVolunteering(e.target.value)
                  }
                  className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#182C4E]"
                  placeholder="Share any other student clubs, associations, or volunteering initiatives..."
                />
              </div>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declaresOtherStudentOrg}
                  onChange={(e) => setDeclaresOtherStudentOrg(e.target.checked)}
                  className="mt-0.5 rounded text-[#182C4E] focus:ring-[#182C4E]"
                />
                <span className="text-[11px] text-slate-700 leading-snug">
                  <strong>
                    I belong to another university student organization
                  </strong>{" "}
                  (Tracked for Executive Board non-duality policy).
                </span>
              </label>

              {declaresOtherStudentOrg && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[10.5px] text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Club Policy Notice:</strong> Regular members may
                    participate in outside organizations, while Executive
                    Bureau and Department Heads cannot hold dual seats.
                  </span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#F0F6FF]/85 border border-[#D5E3F5] text-[11px] space-y-1">
                <div className="font-extrabold text-[#182C4E] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                  <span>QUANTA Charter &amp; Registration Summary</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Member &amp; Residence:</span>
                  <span className="font-bold text-[#0F1E36] text-right">
                    {fullName || "New Member"} · {commune} ({wilaya})
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">University:</span>
                  <span className="font-bold text-[#0F1E36] text-right">
                    {effectiveUniversity}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Specialty:</span>
                  <span className="font-bold text-[#0F1E36] text-right">
                    {effectiveMajor} ({academicYear})
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Hardware &amp; Placement:</span>
                  <span className="font-bold text-[#0284C7] text-right">
                    {hasLaptop ? "Personal Laptop" : "No Personal PC"} ·{" "}
                    {departments.find((d) => d.id === departmentId)?.shortName}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={charterConfirmed}
                      onChange={(e) => setCharterConfirmed(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-600"
                    />
                    <span className="text-xs font-bold text-emerald-950 leading-snug">
                      I accept the QUANTA Internal Charter and confirm my
                      academic and technical registration profile is accurate.
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowInternalLaw((v) => !v)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 text-white text-[10.5px] font-display font-bold shrink-0 shadow-2xs transition cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 text-[#7DD3FC]" />
                    <span>
                      {showInternalLaw
                        ? "Hide Internal Law"
                        : "Read Internal Law"}
                    </span>
                  </button>
                </div>

                {showInternalLaw && (
                  <div className="mt-2 rounded-xl bg-white border border-slate-200/90 shadow-md overflow-hidden animate-rise">
                    {/* Official Header */}
                    <div className="bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white p-3.5 border-b border-[#2B4875]/70">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#7DD3FC] flex items-center gap-1">
                            <Scale className="w-3 h-3" />
                            <span>OFFICIAL CLUB CHARTER · DECISION N° 44</span>
                          </span>
                          <h4 className="font-display text-xs sm:text-sm font-black text-white">
                            {QUANTA_INTERNAL_LAW_HEADER.titleAr}
                          </h4>
                          <p className="text-[10.5px] text-slate-300">
                            {QUANTA_INTERNAL_LAW_HEADER.facultyAr} ·{" "}
                            {QUANTA_INTERNAL_LAW_HEADER.cycleAr}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowInternalLaw(false)}
                          className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 cursor-pointer"
                          aria-label="Close Internal Law"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Chapter Filter Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar">
                        <button
                          type="button"
                          onClick={() => setLawChapterFilter("ALL")}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 cursor-pointer transition ${
                            lawChapterFilter === "ALL"
                              ? "bg-[#38BDF8] text-[#091526]"
                              : "bg-white/10 text-slate-200 hover:bg-white/20"
                          }`}
                        >
                          All Chapters (12)
                        </button>
                        {QUANTA_INTERNAL_LAW_CHAPTERS.map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => setLawChapterFilter(ch.id)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 cursor-pointer transition ${
                              lawChapterFilter === ch.id
                                ? "bg-[#38BDF8] text-[#091526]"
                                : "bg-white/10 text-slate-200 hover:bg-white/20"
                            }`}
                          >
                            {ch.id === "ch-8-12"
                              ? "Ch. 8–12"
                              : `Ch. ${ch.chapterNumber}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Legal Reference Strip */}
                    <div
                      dir="rtl"
                      className="px-3.5 py-2 bg-[#F8FAFC] border-b border-slate-200/80 text-[10.5px] text-slate-600 leading-relaxed font-medium"
                    >
                      {QUANTA_INTERNAL_LAW_HEADER.legalRefAr}
                    </div>

                    {/* Scrollable Organized Chapters & Articles */}
                    <div className="max-h-[300px] overflow-y-auto p-3 space-y-3 bg-white">
                      {QUANTA_INTERNAL_LAW_CHAPTERS.filter(
                        (ch) =>
                          lawChapterFilter === "ALL" ||
                          ch.id === lawChapterFilter
                      ).map((ch) => (
                        <div
                          key={ch.id}
                          className="rounded-xl border border-slate-200/90 bg-[#F8FAFD] overflow-hidden"
                        >
                          <div className="px-3 py-2 bg-[#F0F6FF] border-b border-[#D5E3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span
                              dir="rtl"
                              className="text-xs font-extrabold text-[#0F1E36]"
                            >
                              {ch.chapterTitleAr}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#0284C7]">
                              {ch.chapterTitleEn}
                            </span>
                          </div>

                          <div className="p-2.5 space-y-2">
                            {ch.articles.map((art) => (
                              <div
                                key={art.id}
                                dir="rtl"
                                className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1.5 text-right"
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-1">
                                  <span className="text-[11px] font-extrabold text-[#182C4E]">
                                    {art.articleAr}: {art.titleAr}
                                  </span>
                                  <span
                                    dir="ltr"
                                    className="text-[9.5px] font-mono font-semibold text-slate-400"
                                  >
                                    {art.titleEn}
                                  </span>
                                </div>
                                <ul className="space-y-1 text-[11px] text-slate-700 leading-relaxed list-disc pr-4">
                                  {art.clausesAr.map((clause, idx) => (
                                    <li key={idx}>{clause}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reader Footer */}
                    <div className="px-3.5 py-2.5 bg-[#F8FAFC] border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-mono text-slate-500">
                        University of Algiers 1 · Faculty of Sciences
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCharterConfirmed(true);
                          setShowInternalLaw(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-display font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Charter &amp; Close</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wizard Navigation Footer — Member App Crisp Slate-Navy Style */}
          <div className="pt-4 mt-4 border-t border-slate-200/70 flex items-center justify-between gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="h-10 px-4 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs font-bold text-[#0F1E36] hover:bg-[#F0F6FF] hover:border-[#D5E3F5] active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="h-10 px-5 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/75 text-white font-display text-xs font-black active:scale-[0.98] transition flex items-center gap-1.5 shadow-[0_6px_18px_rgba(16,31,56,0.18)] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#7DD3FC]" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!charterConfirmed}
                onClick={handleFinish}
                className={`h-10 px-5 rounded-lg font-display text-xs font-black active:scale-[0.98] transition flex items-center gap-1.5 ${
                  charterConfirmed
                    ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/75 text-white cursor-pointer shadow-[0_6px_18px_rgba(16,31,56,0.2)]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#7DD3FC]" />
                <span>Complete Registration</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </MobileAppShell>
  );
}
