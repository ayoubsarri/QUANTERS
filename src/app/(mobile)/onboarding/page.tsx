"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  FolderGit2,
  Globe,
  GraduationCap,
  Home,
  Laptop,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import {
  AvailabilityGrid,
  CommuteDuration,
  DayOfWeek,
  HousingType,
  Member,
  PcCapability,
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

const SLOTS: TimeSlot[] = ["Morning", "Afternoon", "Evening"];

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

const PC_CAPABILITY_OPTIONS: PcCapability[] = [
  "Coding & Dev",
  "Design & Video",
  "Office & Web",
  "No Personal PC",
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
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const completeFirstTimeProfile = useQuantersStore(
    (s) => s.completeFirstTimeProfile
  );
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);

  const currentMember =
    members.find((m) => m.id === currentMemberId) || members[0];

  const [step, setStep] = useState<number>(1);

  // Step 1: Identity & Avatar
  const [fullName, setFullName] = useState(currentMember.fullName);
  const [email, setEmail] = useState(currentMember.email);
  const [phone, setPhone] = useState(currentMember.phone);
  const [avatarUrl, setAvatarUrl] = useState(currentMember.avatarUrl);

  // Step 2: Where You Live & Commute (HR Logistics)
  const [wilaya, setWilaya] = useState(currentMember.wilaya || "Algiers (16)");
  const [commune, setCommune] = useState(
    currentMember.commune || "Bab Ezzouar"
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

  // Step 3: University Specialty & Study Level
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

  // Step 4: Personal PC, Equipment & Links
  const [hasLaptop, setHasLaptop] = useState<boolean>(
    currentMember.hasLaptop ?? true
  );
  const [pcCapability, setPcCapability] = useState<PcCapability>(
    currentMember.pcCapability || "Coding & Dev"
  );
  const [equipmentTags, setEquipmentTags] = useState<string[]>(
    currentMember.equipmentTags && currentMember.equipmentTags.length > 0
      ? currentMember.equipmentTags
      : ["Personal Laptop", "Arduino / Electronics Kit"]
  );
  const [githubUrl, setGithubUrl] = useState(currentMember.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(
    currentMember.linkedinUrl || ""
  );
  const [portfolioUrl, setPortfolioUrl] = useState(
    currentMember.portfolioUrl || ""
  );
  const [cvUrl, setCvUrl] = useState(currentMember.cvUrl || "");

  // Step 5: Placement & 7-Day Availability
  const [departmentId, setDepartmentId] = useState(currentMember.departmentId);
  const [teamId, setTeamId] = useState<string | undefined>(
    currentMember.teamId
  );
  const [availability, setAvailability] = useState<AvailabilityGrid>(
    currentMember.availability
  );

  // Step 6: Outside Activities & Charter
  const [outsideActivitiesAndVolunteering, setOutsideActivitiesAndVolunteering] =
    useState(currentMember.outsideActivitiesAndVolunteering);
  const [declaresOtherStudentOrg, setDeclaresOtherStudentOrg] = useState(
    currentMember.declaresOtherStudentOrg
  );
  const [charterConfirmed, setCharterConfirmed] = useState(false);

  const filteredSpecialties = useMemo(() => {
    const q = specialtySearch.trim().toLowerCase();
    if (!q) return [...UNIVERSITY_SPECIALTIES];
    return UNIVERSITY_SPECIALTIES.filter((s) => s.toLowerCase().includes(q));
  }, [specialtySearch]);

  const toggleSlot = (day: DayOfWeek, slot: TimeSlot) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || [];
      const exists = daySlots.includes(slot);
      return {
        ...prev,
        [day]: exists
          ? daySlots.filter((s) => s !== slot)
          : [...daySlots, slot],
      };
    });
  };

  const toggleEquipmentTag = (tag: string) => {
    setEquipmentTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const totalSelectedSlots = Object.values(availability).reduce(
    (acc, list) => acc + list.length,
    0
  );

  const effectiveMajor =
    selectedSpecialty === "Other Scientific / Technical Major" &&
    customMajor.trim()
      ? customMajor.trim()
      : selectedSpecialty;

  const handleFinish = async () => {
    if (!charterConfirmed) return;
    completeFirstTimeProfile({
      fullName,
      email,
      phone,
      avatarUrl,
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
      pcCapability: hasLaptop ? pcCapability : "No Personal PC",
      equipmentTags,
      githubUrl: githubUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      cvUrl: cvUrl.trim() || undefined,
      availability,
      outsideActivitiesAndVolunteering,
      declaresOtherStudentOrg,
    });
    await syncWithServer();
    router.push("/home");
  };

  if (!settings.registrationOpen) {
    return (
      <MobileAppShell hideBottomNav>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-rise">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Member Registration Paused
          </h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-xs">
            Direct registration is currently closed for this recruitment window.
            Existing members and alumni can enter their workspace directly.
          </p>
          <Link
            href="/home"
            className="mt-6 w-full max-w-xs h-11 rounded-xl bg-[#1D63EB] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 active:scale-[0.98] transition"
          >
            <span>Return to Member Home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </MobileAppShell>
    );
  }

  const STEP_META = [
    { num: 1, title: "Identity & Avatar", icon: UserCheck },
    { num: 2, title: "Residence & Commute", icon: Home },
    { num: 3, title: "Specialty & Study Level", icon: GraduationCap },
    { num: 4, title: "Personal PC & Links", icon: Laptop },
    { num: 5, title: "Placement & Availability", icon: Building2 },
    { num: 6, title: "Activities & Charter", icon: ShieldCheck },
  ];

  const currentMeta = STEP_META[step - 1];
  const StepIcon = currentMeta.icon;

  return (
    <MobileAppShell hideBottomNav>
      <div className="flex-1 flex flex-col px-4 pt-3 pb-6 sm:px-6">
        {/* Top Navigation Bar */}
        <div
          className="flex items-center justify-between mb-3 animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <Link
            href="/welcome"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 active:scale-[0.98] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Welcome</span>
          </Link>
          <QuantaLogo size={28} showWordmark variant="light" />
          <span className="text-[11px] font-extrabold text-[#1D63EB] bg-[#E0F0FF] px-2.5 py-0.5 rounded-full tabular-nums">
            Step {step} of 6
          </span>
        </div>

        {/* 6-Segment Interactive Progress Bar */}
        <div
          className="grid grid-cols-6 gap-1.5 mb-3.5 animate-rise"
          style={{ animationDelay: "40ms" }}
        >
          {STEP_META.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                s.num <= step ? "bg-[#1D63EB]" : "bg-slate-200 hover:bg-slate-300"
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Step Title Banner */}
        <div
          className="rounded-2xl bg-gradient-to-br from-[#062456] via-[#0A3882] to-[#1258C7] text-white p-5 shadow-[0_12px_36px_rgba(6,36,86,0.18)] border border-white/20 mb-4 flex items-center justify-between animate-rise"
          style={{ animationDelay: "80ms" }}
        >
          <div>
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#38E4FF] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Member Registration · Academic Dossier</span>
            </span>
            <h1 className="text-base sm:text-lg font-black mt-1">
              {step}. {currentMeta.title}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#38E4FF] shrink-0">
            <StepIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Step Body Card */}
        <div
          className="flex-1 bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 p-5 sm:p-6 shadow-[0_8px_32px_rgba(9,25,47,0.06)] flex flex-col justify-between animate-rise"
          style={{ animationDelay: "120ms" }}
        >
          {/* STEP 1: Identity & Avatar */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-[#EBF3FC] border border-[#E2EDF8]">
                <AvatarUploader
                  currentAvatarUrl={avatarUrl}
                  onAvatarCompressed={(url) => setAvatarUrl(url)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name (Official University Record)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1D63EB]"
                  placeholder="e.g. Ayoub Sarri"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#1D63EB]" />
                  <span>University / Personal Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1D63EB]"
                  placeholder="ayoub.sarri@univ-alger.dz"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#1D63EB]" />
                  <span>Phone Number (WhatsApp / Emergency)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1D63EB]"
                  placeholder="+213 558 42 19 04"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Where You Live & Commute (HR Logistics) */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Wilaya of Residence
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {WILAYA_OPTIONS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWilaya(w)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border active:scale-[0.98] transition cursor-pointer ${
                        wilaya === w
                          ? "bg-[#1D63EB] text-white border-[#1D63EB] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1D63EB]" />
                  <span>Commune / District</span>
                </label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1D63EB]"
                  placeholder="e.g. Bab Ezzouar, Kouba, Alger Centre, Hydra..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Housing Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {HOUSING_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHousingType(h)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center justify-between gap-2 active:scale-[0.98] transition cursor-pointer ${
                        housingType === h
                          ? "bg-[#E0F0FF] text-[#094C9C] border-[#1D63EB]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate">{h}</span>
                      {housingType === h && (
                        <CheckCircle2 className="w-4 h-4 text-[#1D63EB] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Campus Commute Time
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {COMMUTE_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCommuteTime(c)}
                      className={`h-9 rounded-xl text-[11px] font-bold border active:scale-[0.98] transition cursor-pointer ${
                        commuteTime === c
                          ? "bg-[#1D63EB] text-white border-[#1D63EB]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-sky-50/80 border border-sky-200 cursor-pointer">
                <div className="pr-2">
                  <span className="text-xs font-extrabold text-slate-900 block">
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
                  className="w-4 h-4 rounded text-[#1D63EB] focus:ring-[#1D63EB]"
                />
              </label>
            </div>
          )}

          {/* STEP 3: University Specialty & Study Level */}
          {step === 3 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Faculty of Sciences & Tech Specialty (26 Official Majors)
                </label>
                <div className="relative mb-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={specialtySearch}
                    onChange={(e) => setSpecialtySearch(e.target.value)}
                    placeholder="Filter majors (Physics, AI, Biology, Math, Chemistry...)"
                    className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1D63EB]"
                  />
                </div>
                <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1 rounded-xl border border-slate-200 p-1.5 bg-slate-50/60">
                  {filteredSpecialties.map((spec) => {
                    const active = selectedSpecialty === spec;
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setSelectedSpecialty(spec)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] active:scale-[0.99] transition flex items-center justify-between gap-2 cursor-pointer ${
                          active
                            ? "bg-[#1D63EB] text-white font-bold shadow-sm"
                            : "bg-white text-slate-700 hover:bg-sky-50 font-medium border border-slate-100"
                        }`}
                      >
                        <span className="truncate">{spec}</span>
                        {active && (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
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
                    className="mt-2 w-full h-9 px-3 rounded-xl border border-[#1D63EB] text-xs font-semibold text-slate-900"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Academic Study Level
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {ACADEMIC_YEARS.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr)}
                      className={`h-8 rounded-xl text-[11px] font-bold border active:scale-[0.98] transition cursor-pointer ${
                        academicYear === yr
                          ? "bg-[#1D63EB] text-white border-[#1D63EB] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Club Tenure
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TENURE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTenure(t)}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border active:scale-[0.98] transition cursor-pointer ${
                        tenure === t
                          ? "bg-[#061E47] text-white border-[#061E47]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Personal PC, Equipment & Links */}
          {step === 4 && (
            <div className="space-y-3.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#EBF3FC] border border-[#E2EDF8] cursor-pointer">
                <div className="pr-2">
                  <span className="text-xs font-extrabold text-[#094C9C] block">
                    Do you have a personal Laptop or PC you can bring to workshops?
                  </span>
                  <span className="text-[10.5px] text-slate-600">
                    Used by organizers to allocate lab workstations
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={hasLaptop}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasLaptop(checked);
                    if (!checked) setPcCapability("No Personal PC");
                    else if (pcCapability === "No Personal PC")
                      setPcCapability("Coding & Dev");
                  }}
                  className="w-4 h-4 rounded text-[#1D63EB] focus:ring-[#1D63EB]"
                />
              </label>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  PC Capability Profile
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {PC_CAPABILITY_OPTIONS.map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => {
                        setPcCapability(cap);
                        setHasLaptop(cap !== "No Personal PC");
                      }}
                      className={`h-8 px-2.5 rounded-xl text-[11px] font-bold border active:scale-[0.98] transition cursor-pointer ${
                        pcCapability === cap
                          ? "bg-[#1D63EB] text-white border-[#1D63EB]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Extra Equipment & Hardware
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EXTRA_EQUIPMENT_OPTIONS.map((eq) => {
                    const active = equipmentTags.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipmentTag(eq)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border active:scale-[0.98] transition cursor-pointer ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {active ? (
                          <Check className="w-3 h-3 shrink-0" />
                        ) : (
                          <Plus className="w-3 h-3 shrink-0" />
                        )}
                        <span>{eq}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-700">
                  Digital Portfolio & Professional Links (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <FolderGit2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="GitHub / GitLab (https://github.com/...)"
                      className="w-full h-9 pl-8 pr-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-900"
                    />
                  </div>
                  <div className="relative">
                    <Linkedin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="LinkedIn Profile Link"
                      className="w-full h-9 pl-8 pr-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-900"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="Portfolio / Behance / Drive Link"
                      className="w-full h-9 pl-8 pr-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-900"
                    />
                  </div>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={cvUrl}
                      onChange={(e) => setCvUrl(e.target.value)}
                      placeholder="CV / Academic Resume Link"
                      className="w-full h-9 pl-8 pr-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-900"
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                        className={`text-left px-2.5 py-2 rounded-xl border text-[11px] active:scale-[0.98] transition flex items-center justify-between gap-1 cursor-pointer ${
                          active
                            ? "bg-[#E0F0FF] border-[#1D63EB] text-[#094C9C] font-extrabold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                        }`}
                      >
                        <span className="truncate">{dept.shortName}</span>
                        {active && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1D63EB] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Scientific Research Team (Optional)
                </label>
                <select
                  value={teamId || ""}
                  onChange={(e) =>
                    setTeamId(e.target.value ? e.target.value : undefined)
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-[#1D63EB]"
                >
                  <option value="">No Scientific Team yet (Department only)</option>
                  {teams
                    .filter((t) => !t.archived)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.field})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700">
                    7-Day Availability Matrix (Tap free slots)
                  </span>
                  <span className="text-[10.5px] font-extrabold text-[#1D63EB] bg-[#E0F0FF] px-2 py-0.5 rounded-full tabular-nums">
                    {totalSelectedSlots} slots free
                  </span>
                </div>

                <div className="space-y-1">
                  {DAYS.map((day) => {
                    const activeSlots = availability[day] || [];
                    return (
                      <div
                        key={day}
                        className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg bg-slate-50 border border-slate-200/80"
                      >
                        <span className="text-[11px] font-bold text-slate-800 w-16">
                          {day.slice(0, 3)}
                        </span>
                        <div className="flex-1 grid grid-cols-3 gap-1">
                          {SLOTS.map((slot) => {
                            const isSelected = activeSlots.includes(slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => toggleSlot(day, slot)}
                                className={`h-6.5 py-1 rounded-md text-[10px] font-extrabold active:scale-[0.98] transition cursor-pointer ${
                                  isSelected
                                    ? "bg-[#1D63EB] text-white shadow-sm"
                                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                {slot}
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
                <label className="block text-xs font-extrabold text-slate-900 mb-1">
                  Other Clubs, Associations & Volunteering Experience
                </label>
                <textarea
                  rows={3}
                  value={outsideActivitiesAndVolunteering}
                  onChange={(e) =>
                    setOutsideActivitiesAndVolunteering(e.target.value)
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1D63EB]"
                  placeholder="Share any other student clubs, associations, or volunteering initiatives..."
                />
              </div>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declaresOtherStudentOrg}
                  onChange={(e) => setDeclaresOtherStudentOrg(e.target.checked)}
                  className="mt-0.5 rounded text-[#1D63EB] focus:ring-[#1D63EB]"
                />
                <span className="text-[11px] text-slate-700 leading-snug">
                  <strong>I belong to another university student organization</strong>{" "}
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

              <div className="p-3 rounded-xl bg-[#EBF3FC] border border-[#E2EDF8] text-[11px] space-y-1">
                <div className="font-extrabold text-[#094C9C] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#1D63EB]" />
                  <span>QUANTA Charter & Registration Summary</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Member & Residence:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {fullName} · {commune} ({wilaya})
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Specialty:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[220px] text-right">
                    {effectiveMajor} ({academicYear})
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">PC & Placement:</span>
                  <span className="font-bold text-[#1D63EB] text-right">
                    {hasLaptop ? pcCapability : "No PC"} ·{" "}
                    {departments.find((d) => d.id === departmentId)?.shortName}
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={charterConfirmed}
                  onChange={(e) => setCharterConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-600"
                />
                <span className="text-xs font-bold text-emerald-950 leading-snug">
                  I accept the QUANTA Internal Charter and confirm my academic
                  and technical registration profile is accurate.
                </span>
              </label>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="h-11 px-5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-white active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                className="h-11 px-6 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:opacity-95 text-white text-xs font-black active:scale-[0.98] transition flex items-center gap-1.5 shadow-[0_4px_16px_rgba(29,99,235,0.25)] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!charterConfirmed}
                onClick={handleFinish}
                className={`h-11 px-6 rounded-full text-xs font-black active:scale-[0.98] transition flex items-center gap-1.5 shadow-md ${
                  charterConfirmed
                    ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white cursor-pointer shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Registration</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </MobileAppShell>
  );
}
