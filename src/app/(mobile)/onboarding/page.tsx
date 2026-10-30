"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Car,
  Check,
  CheckCircle2,
  Compass,
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
  Timer,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { formatAlgerianPhoneInput, validateAlgerianPhone } from "@/lib/utils/phoneValidation";
import {
  QUANTA_INTERNAL_LAW_CHAPTERS,
  QUANTA_INTERNAL_LAW_HEADER,
} from "@/lib/data/internalLaw";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { DEFAULT_AVAILABILITY } from "@/lib/data/seed";
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
  "QUANTA Alumni",
];

// Alumni batches strictly 2023 through 2026 (2027 and 2028 deleted per user request)
const ALUMNI_GRADUATION_YEARS = [
  "2023",
  "2024",
  "2025",
  "2026",
];

const ALUMNI_INDUSTRIES = [
  "Software Engineering & AI",
  "Academic Research & Higher Ed",
  "Data Science & Quant Finance",
  "Robotics & Embedded Systems",
  "Biotechnology & Health Tech",
  "Physics & Energy Systems",
  "Product Design & Tech Media",
  "Other Scientific / Tech Domain",
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
  const hydrateFromLocalCache = useQuantersStore((s) => s.hydrateFromLocalCache);
  const completeFirstTimeProfile = useQuantersStore(
    (s) => s.completeFirstTimeProfile
  );
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrateFromLocalCache();
    setHydrated(true);
  }, [hydrateFromLocalCache]);

  // Authenticated Session Member Resolution (resilient against initial render delays)
  const rawSessionMember = useMemo(() => {
    if (!isAuthenticated || !currentMemberId) return undefined;
    const direct = members.find((m) => m.id === currentMemberId);
    if (direct) return direct;
    const fallback = useQuantersStore.getState().members.find((m) => m.id === currentMemberId);
    return fallback;
  }, [isAuthenticated, currentMemberId, members]);

  // ROUTE SECURITY GUARD: Prevent opening /onboarding directly without an authenticated account
  // Strictly waits for client hydration before performing any session check
  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated || !currentMemberId) {
      router.replace("/welcome");
      return;
    }

    if (rawSessionMember && rawSessionMember.onboardingTicks?.profileComplete) {
      router.replace("/home");
    }
  }, [hydrated, isAuthenticated, currentMemberId, rawSessionMember, router]);

  const existingMember = rawSessionMember;
  const verifiedEmail = rawSessionMember?.email || "";

  const [step, setStep] = useState<number>(1);

  // Step 1: Identity & Avatar (Email is locked to authenticated session)
  const [fullName, setFullName] = useState(
    existingMember ? existingMember.fullName : ""
  );
  const [phone, setPhone] = useState(
    existingMember && existingMember.phone !== "+213 550 00 00 00"
      ? existingMember.phone
      : ""
  );
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneValidation = useMemo(() => validateAlgerianPhone(phone), [phone]);
  const canProceedStep1 = fullName.trim().length >= 2 && phoneValidation.isValid;
  const [avatarUrl, setAvatarUrl] = useState(
    existingMember?.avatarUrl || "/brand/logo_quanta_opt.webp"
  );

  // Sync state once session member resolves after hydration
  useEffect(() => {
    if (rawSessionMember) {
      if (rawSessionMember.fullName && !fullName) {
        setFullName(rawSessionMember.fullName);
      }
      if (rawSessionMember.phone && rawSessionMember.phone !== "+213 550 00 00 00" && !phone) {
        setPhone(rawSessionMember.phone);
      }
      if (rawSessionMember.avatarUrl && avatarUrl === "/brand/logo_quanta_opt.webp") {
        setAvatarUrl(rawSessionMember.avatarUrl);
      }
    }
  }, [rawSessionMember]);

  // Step 2: Where You Live & Commute (HR Logistics)
  const [wilaya, setWilaya] = useState(
    existingMember?.wilaya || "Algiers (16)"
  );
  const [commune, setCommune] = useState(existingMember?.commune || "");
  const [housingType, setHousingType] = useState<HousingType>(
    existingMember?.housingType || "Family Home"
  );
  const [commuteTime, setCommuteTime] = useState<CommuteDuration>(
    existingMember?.commuteTime || "< 30 min"
  );

  // Step 3: University, Specialty & Study Level
  const [selectedUniversity, setSelectedUniversity] = useState<string>(
    UNIVERSITY_OPTIONS.find((u) =>
      u.toLowerCase().includes((existingMember?.university || "").toLowerCase())
    ) || UNIVERSITY_OPTIONS[0]
  );
  const [customUniversity, setCustomUniversity] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    UNIVERSITY_SPECIALTIES.find((s) =>
      s.toLowerCase().includes((existingMember?.major || "").toLowerCase())
    ) || UNIVERSITY_SPECIALTIES[4]
  );
  const [customMajor, setCustomMajor] = useState("");
  const [academicYear, setAcademicYear] = useState<Member["academicYear"]>(
    existingMember?.academicYear || "L3"
  );
  const [tenure, setTenure] = useState(
    existingMember?.tenure || "New Trainee (2026/2027)"
  );

  // Alumni Branch State
  const isAlumni = tenure === "QUANTA Alumni";
  const [graduationYear, setGraduationYear] = useState(
    existingMember?.graduationYear || "2023"
  );
  const [alumniPosition, setAlumniPosition] = useState(
    existingMember?.alumniPosition || ""
  );
  const [alumniIndustry, setAlumniIndustry] = useState(
    "Software Engineering & AI"
  );
  const [alumniMentorshipWilling, setAlumniMentorshipWilling] = useState(true);

  // Step 4: Personal PC, Equipment & Links
  const [hasLaptop, setHasLaptop] = useState<boolean>(
    existingMember?.hasLaptop ?? true
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
  const [departmentId, setDepartmentId] = useState(
    existingMember?.departmentId || "dept-it"
  );
  const [teamId, setTeamId] = useState<string | undefined>(
    existingMember?.teamId
  );
  const [availability, setAvailability] = useState<AvailabilityGrid>(
    existingMember?.availability || DEFAULT_AVAILABILITY
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
    const validEmail = validateEmail(verifiedEmail);
    if (!fullName.trim() || !validEmail.isValid || !phoneValidation.isValid) {
      setStep(1);
      setPhoneTouched(true);
      return;
    }
    completeFirstTimeProfile({
      fullName: fullName.trim(),
      email: validEmail.normalized,
      phone: phoneValidation.e164 || phone.trim(),
      avatarUrl,
      university: effectiveUniversity,
      major: effectiveMajor,
      academicYear: isAlumni ? "Graduated" : academicYear,
      tenure,
      isAlumni,
      graduationYear: isAlumni ? graduationYear : undefined,
      alumniPosition: isAlumni ? alumniPosition.trim() : undefined,
      alumniAccessEnabled: isAlumni ? alumniMentorshipWilling : undefined,
      departmentId: isAlumni ? "dept-scientific" : departmentId,
      teamId: isAlumni ? undefined : teamId,
      wilaya,
      commune,
      housingType: isAlumni ? "Family Home" : housingType,
      commuteTime: isAlumni ? "< 30 min" : commuteTime,
      hasLaptop,
      pcCapability: hasLaptop ? "Coding & Dev" : "No Personal PC",
      equipmentTags,
      githubUrl: githubUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      cvUrl: cvUrl.trim() || undefined,
      availability: isAlumni ? DEFAULT_AVAILABILITY : availability,
      outsideActivitiesAndVolunteering: isAlumni
        ? alumniIndustry
          ? `Industry: ${alumniIndustry}`
          : ""
        : outsideActivitiesAndVolunteering,
      declaresOtherStudentOrg: isAlumni ? false : declaresOtherStudentOrg,
    });
    await syncWithServer(true);
    router.push("/home");
  };

  // Hydration state check
  if (!hydrated) {
    return (
      <MobileAppShell hideBottomNav>
        <div className="h-[100dvh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-500">Loading onboarding dossier...</p>
        </div>
      </MobileAppShell>
    );
  }

  // Guard against unauthenticated direct URL visitors
  if (!isAuthenticated || !currentMemberId) {
    return (
      <MobileAppShell hideBottomNav>
        <div className="h-[100dvh] flex flex-col items-center justify-center p-6 text-center animate-rise">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 text-[#0284C7] flex items-center justify-center shadow-sm mb-4">
            <Lock className="w-6 h-6 text-[#0284C7]" />
          </div>
          <h2 className="font-display text-base font-black text-[#0F1E36]">
            Authentication Required
          </h2>
          <p className="mt-2 text-xs text-slate-500 max-w-xs leading-relaxed">
            Please register an account or sign in with your email on the welcome portal before accessing the member onboarding dossier.
          </p>
          <Link
            href="/welcome"
            className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white font-display text-xs font-black shadow-md hover:brightness-110 active:scale-[0.98] transition"
          >
            <span>Go to Welcome Portal</span>
            <ArrowRight className="w-4 h-4 text-[#7DD3FC]" />
          </Link>
        </div>
      </MobileAppShell>
    );
  }

  if (!settings.registrationOpen) {
    return (
      <MobileAppShell hideBottomNav>
        <div className="h-[100dvh] flex flex-col items-center justify-center p-6 text-center animate-rise">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 text-[#182C4E] flex items-center justify-center shadow-sm mb-4">
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
            className="mt-6 w-full max-w-xs h-11 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/70 text-white font-display text-xs font-black flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:scale-[0.98] transition"
          >
            <span>Return to Member Home</span>
            <ArrowRight className="w-4 h-4 text-[#7DD3FC]" />
          </Link>
        </div>
      </MobileAppShell>
    );
  }

  const STUDENT_STEP_META = [
    { num: 1, title: "Identity & Avatar", icon: UserCheck },
    { num: 2, title: "Residence & Commute", icon: Home },
    { num: 3, title: "University & Club Tenure", icon: GraduationCap },
    { num: 4, title: "Equipment & Links", icon: Laptop },
    { num: 5, title: "Placement & Availability", icon: Building2 },
    { num: 6, title: "Activities & Charter", icon: ShieldCheck },
  ];

  const ALUMNI_STEP_META = [
    { num: 1, title: "Identity & Avatar", icon: UserCheck },
    { num: 2, title: "Residence Location", icon: Home },
    { num: 3, title: "Alma Mater & Club Tenure", icon: GraduationCap },
    { num: 4, title: "Career & Mentorship", icon: Award },
    { num: 5, title: "Alumni Charter & Review", icon: ShieldCheck },
  ];

  const activeSteps = isAlumni ? ALUMNI_STEP_META : STUDENT_STEP_META;
  const maxStep = activeSteps.length;
  const currentMeta = activeSteps[Math.min(step - 1, maxStep - 1)];
  const StepIcon = currentMeta.icon;

  return (
    <MobileAppShell hideBottomNav>
      <div className="h-[100dvh] max-h-[100dvh] flex flex-col p-2.5 sm:p-4 space-y-2.5 overflow-hidden select-none">
        {/* Compact, Brand-Accurate Solid Header respecting official QUANTERS logo colors */}
        <div className="shrink-0 rounded-2xl bg-white border border-slate-200/90 p-3 sm:px-4 shadow-[0_2px_12px_rgba(15,30,54,0.04)] space-y-2 animate-rise">
          {/* Top Row: Exit + Official QUANTERS Logo + Step Counter */}
          <div className="flex items-center justify-between">
            <Link
              href="/welcome"
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-[#0F1E36] hover:bg-slate-100 active:scale-95 transition"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Exit</span>
            </Link>

            {/* Official QUANTERS Logo: sharp navy letterforms & vibrant cyan-turquoise "A" */}
            <div className="flex items-center justify-center">
              <QuantaLogo size={22} showWordmark variant="light" centered />
            </div>

            <span className="text-[11px] font-mono font-black text-[#0284C7] bg-[#F0F6FF] border border-[#D5E3F5] px-2.5 py-1 rounded-lg tabular-nums">
              Step {step} / {maxStep}
            </span>
          </div>

          {/* Sleek Segment Progress Line */}
          <div
            className={`grid gap-1.5 ${
              isAlumni ? "grid-cols-5" : "grid-cols-6"
            }`}
          >
            {activeSteps.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => (s.num <= step ? setStep(s.num) : undefined)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  s.num <= step
                    ? "bg-gradient-to-r from-[#087BEF] to-[#20D6D0]"
                    : "bg-slate-200/90 hover:bg-slate-300"
                }`}
                title={s.title}
              />
            ))}
          </div>

          {/* Step Title Row */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7] block">
                {isAlumni
                  ? "QUANTA ALUMNI · PROFESSIONAL DOSSIER"
                  : "MEMBER REGISTRATION · ACADEMIC DOSSIER"}
              </span>
              <h1 className="font-display text-sm sm:text-base font-black text-[#0F1E36] tracking-tight truncate">
                {step}. {currentMeta.title}
              </h1>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#F0F6FF] border border-[#D5E3F5] flex items-center justify-center text-[#0284C7] shrink-0">
              <StepIcon className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Step Card — Solid, Fixed Boundaries, Scrollable Inside Only When Needed */}
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_18px_rgba(15,30,54,0.05)] flex flex-col overflow-hidden animate-rise">
          {/* Scrollable Form Body */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3.5">
            {/* STEP 1: Identity & Avatar */}
            {step === 1 && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-[#F0F6FF]/80 border border-[#D5E3F5]">
                  <AvatarUploader
                    currentAvatarUrl={avatarUrl}
                    onAvatarCompressed={(url) => setAvatarUrl(url)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                    Full Name (Official University Record)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-sm font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#0F1E36] flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-[#0284C7]" />
                      <span>Registered Account Email</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      <Lock className="w-3 h-3" />
                      <span>Verified Session</span>
                    </span>
                  </div>
                  <input
                    type="email"
                    value={verifiedEmail}
                    readOnly
                    disabled
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-sm font-mono font-semibold text-slate-700 cursor-not-allowed select-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#0F1E36] flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-[#0284C7]" />
                      <span>Phone Number (WhatsApp / Emergency)</span>
                    </label>
                    {phoneValidation.carrier && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                          phoneValidation.carrier === "Mobilis"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : phoneValidation.carrier === "Djezzy"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {phoneValidation.carrier}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhoneTouched(true);
                        setPhone(formatAlgerianPhoneInput(e.target.value));
                      }}
                      onBlur={() => setPhoneTouched(true)}
                      className={`w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#F8FAFC] border text-sm font-mono font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none transition ${
                        phoneTouched && phone.length > 3 && !phoneValidation.isValid
                          ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                          : phoneValidation.isValid
                          ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                          : "border-slate-200/90 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15"
                      }`}
                      placeholder="05 / 06 / 07 XX XX XX XX"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {phoneValidation.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : phoneTouched && phone.length > 3 ? (
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                      ) : null}
                    </div>
                  </div>
                  {phoneTouched && phone.length > 0 && !phoneValidation.isValid && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <span>⚠</span> {phoneValidation.errorMessage || "Please enter a valid Algerian mobile number."}
                    </p>
                  )}
                  {phoneValidation.isValid && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                      <span>✓</span> Valid Algerian mobile number ({phoneValidation.carrier || "National"} · {phoneValidation.formatted})
                    </p>
                  )}
                  {!phoneTouched && !phone && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Algerian national format: 05, 06, or 07 (Mobilis, Djezzy, Ooredoo) followed by 8 digits.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Where You Live & Commute (HR Logistics) */}
            {step === 2 && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                    Wilaya of Residence
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WILAYA_OPTIONS.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWilaya(w)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border active:scale-[0.98] transition cursor-pointer ${
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
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#0284C7]" />
                    <span>Commune / District</span>
                  </label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-sm font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                    placeholder="e.g. Bab Ezzouar, Alger Centre, Kouba..."
                  />
                </div>

                {isAlumni ? (
                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950">
                        Alumni Regional Network
                      </h4>
                      <p className="text-[11px] text-indigo-800 leading-relaxed mt-0.5">
                        Your residence location helps QUANTA connect local and diaspora alumni chapters for regional symposiums, scientific conferences, and network dinners.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Housing Type Cards — Compact Responsive Horizontal Row */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#0F1E36] flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-[#0284C7]" />
                          <span>Housing Type</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Academic Year Residence
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            value: "Family Home" as HousingType,
                            title: "Family Home",
                            subtitle: "Family House",
                            icon: Home,
                          },
                          {
                            value: "University Residence (Cité)" as HousingType,
                            title: "Campus Cité",
                            subtitle: "Cité U Dorm",
                            icon: Building2,
                          },
                          {
                            value: "Shared Apartment" as HousingType,
                            title: "Colocation",
                            subtitle: "Shared Flat",
                            icon: Users,
                          },
                        ].map((item) => {
                          const isSelected = housingType === item.value;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setHousingType(item.value)}
                              className={`p-2 sm:p-2.5 rounded-xl text-center border transition-all active:scale-[0.97] cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                isSelected
                                  ? "bg-[#F0F6FF] text-[#0F1E36] border-[#0284C7] shadow-2xs ring-1 ring-[#0284C7]"
                                  : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-[#F8FAFC]"
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 ${
                                  isSelected
                                    ? "bg-[#0284C7] text-white shadow-2xs"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="w-full min-w-0">
                                <div className="text-[11px] sm:text-xs font-bold font-display text-[#0F1E36] truncate leading-tight">
                                  {item.title}
                                </div>
                                <p className="text-[9.5px] sm:text-[10px] text-slate-400 truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Campus Commute Time Cards — Compact Responsive Horizontal Row */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#0F1E36] flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5 text-[#0284C7]" />
                          <span>Campus Commute Time</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Door-to-door to Faculty
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            value: "< 30 min" as CommuteDuration,
                            title: "< 30 min",
                            subtitle: "Walk / Metro",
                            icon: Zap,
                            accent: "emerald",
                          },
                          {
                            value: "30–60 min" as CommuteDuration,
                            title: "30–60 min",
                            subtitle: "Bus / Tram",
                            icon: Timer,
                            accent: "sky",
                          },
                          {
                            value: "> 1h30" as CommuteDuration,
                            title: "> 1h30",
                            subtitle: "Train / Suburb",
                            icon: Compass,
                            accent: "amber",
                          },
                        ].map((item) => {
                          const isSelected = commuteTime === item.value;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setCommuteTime(item.value)}
                              className={`p-2 sm:p-2.5 rounded-xl text-center border transition-all active:scale-[0.97] cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                isSelected
                                  ? "bg-gradient-to-b from-[#0F1E36] to-[#0A1628] text-white border-[#38BDF8] shadow-2xs ring-1 ring-[#38BDF8]"
                                  : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-[#F8FAFC]"
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 ${
                                  isSelected
                                    ? "bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30"
                                    : item.accent === "emerald"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : item.accent === "sky"
                                    ? "bg-sky-50 text-sky-600"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="w-full min-w-0">
                                <div
                                  className={`text-[11px] sm:text-xs font-black font-display tracking-tight truncate leading-tight ${
                                    isSelected ? "text-white" : "text-[#0F1E36]"
                                  }`}
                                >
                                  {item.title}
                                </div>
                                <p
                                  className={`text-[9.5px] sm:text-[10px] truncate mt-0.5 ${
                                    isSelected ? "text-slate-300" : "text-slate-400"
                                  }`}
                                >
                                  {item.subtitle}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 3: University, Specialty & Study Level */}
            {step === 3 && (
              <div className="space-y-3.5">
                {/* University / Institution Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-[#0284C7]" />
                    <span>University / Higher Education Institution</span>
                  </label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-sm font-bold text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                  >
                    {UNIVERSITY_OPTIONS.map((univ) => (
                      <option key={univ} value={univ}>
                        {univ}
                      </option>
                    ))}
                  </select>

                  {selectedUniversity ===
                    "Other University / Higher School" && (
                    <input
                      type="text"
                      value={customUniversity}
                      onChange={(e) => setCustomUniversity(e.target.value)}
                      placeholder="Specify your university or higher school name..."
                      className="mt-2 w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#0284C7] text-xs font-semibold text-[#0F1E36] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>

                {/* Faculty of Sciences & Tech Specialty */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#0F1E36]">
                      Faculty of Sciences &amp; Tech Specialty
                    </label>
                    <span className="text-[10px] font-mono font-bold text-[#0284C7]">
                      {filteredSpecialties.length} majors
                    </span>
                  </div>
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={specialtySearch}
                      onChange={(e) => setSpecialtySearch(e.target.value)}
                      placeholder="Filter majors (Physics, AI, Biology, Math...)"
                      className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                    />
                  </div>
                  <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 rounded-2xl border border-slate-200/90 p-2 bg-[#F8FAFC]">
                    {filteredSpecialties.map((spec) => {
                      const active = selectedSpecialty === spec;
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => setSelectedSpecialty(spec)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs active:scale-[0.99] transition flex items-center justify-between gap-2 cursor-pointer ${
                            active
                              ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white font-extrabold shadow-2xs"
                              : "bg-white text-slate-700 hover:bg-[#F0F6FF] font-semibold border border-slate-100"
                          }`}
                        >
                          <span className="leading-snug">{spec}</span>
                          {active && (
                            <CheckCircle2 className="w-4 h-4 text-[#7DD3FC] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSpecialty ===
                    "Other Scientific / Technical Major" && (
                    <input
                      type="text"
                      value={customMajor}
                      onChange={(e) => setCustomMajor(e.target.value)}
                      placeholder="Specify your exact specialty or faculty..."
                      className="mt-2 w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#0284C7] text-xs font-semibold text-[#0F1E36] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                    Academic Study Level
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {ACADEMIC_YEARS.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setAcademicYear(yr)}
                        className={`h-9 rounded-xl text-xs font-extrabold border active:scale-[0.98] transition cursor-pointer ${
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
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5 flex items-center justify-between">
                    <span>Club Tenure &amp; Affiliation</span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      Select background
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TENURE_OPTIONS.map((t) => {
                      const isAlumniOpt = t === "QUANTA Alumni";
                      const isSelected = tenure === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTenure(t);
                            if (isAlumniOpt) {
                              setAcademicYear("Graduated");
                            }
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border active:scale-[0.98] transition cursor-pointer flex items-center justify-between gap-1.5 ${
                            isSelected
                              ? isAlumniOpt
                                ? "bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-amber-300 border-indigo-500 shadow-sm"
                                : "bg-[#F0F6FF] text-[#182C4E] border-[#0284C7]/60"
                              : isAlumniOpt
                              ? "bg-indigo-50/70 text-indigo-900 border-indigo-200/90 hover:bg-indigo-100/70"
                              : "bg-[#F8FAFC] text-slate-700 border-slate-200/90 hover:border-[#182C4E]/40"
                          } ${isAlumniOpt ? "col-span-2" : ""}`}
                        >
                          <span className="flex items-center gap-1.5">
                            {isAlumniOpt && (
                              <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                            <span>{t}</span>
                          </span>
                          {isSelected && (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isAlumniOpt
                                  ? "text-amber-300"
                                  : "text-[#0284C7]"
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Equipment & Professional Links (For Students) */}
            {step === 4 && !isAlumni && (
              <div className="space-y-3.5">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#F0F6FF]/80 border border-[#D5E3F5] cursor-pointer">
                  <div className="pr-2">
                    <span className="text-xs font-extrabold text-[#0F1E36] block">
                      Do you have a personal Laptop or PC you can bring to workshops?
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Used by organizers to allocate lab workstations
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasLaptop}
                    onChange={(e) => setHasLaptop(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-[#182C4E] focus:ring-[#182C4E]"
                  />
                </label>

                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                    Extra Equipment &amp; Hardware
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EXTRA_EQUIPMENT_OPTIONS.map((eq) => {
                      const active = equipmentTags.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => toggleEquipmentTag(eq)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border active:scale-[0.98] transition cursor-pointer ${
                            active
                              ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border-[#2B4875]"
                              : "bg-[#F8FAFC] text-slate-600 border-slate-200/90 hover:border-[#182C4E]/40"
                          }`}
                        >
                          {active ? (
                            <Check className="w-3.5 h-3.5 text-[#7DD3FC] shrink-0" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>{eq}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
                  <label className="block text-xs font-bold text-[#0F1E36]">
                    Digital Portfolio &amp; Professional Links (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="relative">
                      <FolderGit2 className="w-4 h-4 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="GitHub / GitLab URL"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="LinkedIn Profile Link"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="Portfolio / Behance / Drive"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={cvUrl}
                        onChange={(e) => setCvUrl(e.target.value)}
                        placeholder="Academic CV / Resume URL"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Career, Workplace & Mentorship (For Alumni — 2023 through 2026 strictly) */}
            {step === 4 && isAlumni && (
              <div className="space-y-3.5 animate-rise">
                {/* Graduation Year strictly 2023 to 2026 */}
                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5 flex items-center justify-between">
                    <span>Graduation Year</span>
                    <span className="text-[10px] font-mono text-indigo-700 font-bold">
                      University of Algiers 1
                    </span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ALUMNI_GRADUATION_YEARS.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setGraduationYear(yr)}
                        className={`h-11 rounded-xl text-xs font-extrabold border active:scale-[0.98] transition cursor-pointer ${
                          graduationYear === yr
                            ? "bg-indigo-950 text-amber-300 border-indigo-700 shadow-2xs"
                            : "bg-[#F8FAFC] text-slate-700 border-slate-200/90 hover:border-indigo-400"
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Role & Workplace */}
                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>Current Position &amp; Organization / Research Lab</span>
                  </label>
                  <input
                    type="text"
                    value={alumniPosition}
                    onChange={(e) => setAlumniPosition(e.target.value)}
                    placeholder="e.g. AI Research Engineer, PhD Researcher, Software Engineer..."
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-sm font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition"
                  />
                </div>

                {/* Industry / Expertise Domain */}
                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                    Scientific &amp; Professional Domain
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ALUMNI_INDUSTRIES.map((ind) => {
                      const isSelected = alumniIndustry === ind;
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => setAlumniIndustry(ind)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border text-left flex items-center justify-between gap-2 active:scale-[0.98] transition cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50 text-indigo-950 border-indigo-500 shadow-2xs"
                              : "bg-[#F8FAFC] text-slate-700 border-slate-200/90 hover:border-indigo-300"
                          }`}
                        >
                          <span className="truncate">{ind}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mentorship Interest Toggle Card */}
                <label className="flex items-start justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/70 to-indigo-50/70 border border-amber-200/80 cursor-pointer">
                  <div className="pr-2 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-extrabold text-[#0F1E36]">
                        Open to Mentoring QUANTA Student Members
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Be featured in the Alumni Mentors roster for masterclasses, career advice, and research proposal feedback.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={alumniMentorshipWilling}
                    onChange={(e) =>
                      setAlumniMentorshipWilling(e.target.checked)
                    }
                    className="mt-1 w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-600"
                  />
                </label>

                {/* Professional Links */}
                <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
                  <label className="block text-xs font-bold text-[#0F1E36]">
                    Professional Profiles &amp; Publications (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="relative">
                      <Linkedin className="w-4 h-4 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="LinkedIn Profile URL"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="relative">
                      <FolderGit2 className="w-4 h-4 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="GitHub / GitLab URL"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="Personal Site / ResearchGate"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={cvUrl}
                        onChange={(e) => setCvUrl(e.target.value)}
                        placeholder="Academic CV / Resume URL"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-[#0F1E36] focus:bg-white focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Placement & 7-Day Availability (For Students) */}
            {step === 5 && !isAlumni && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                    Operational Department (Select 1 of 6)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {departments.map((dept) => {
                      const active = departmentId === dept.id;
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => setDepartmentId(dept.id)}
                          className={`text-left px-3 py-2.5 rounded-xl border text-xs active:scale-[0.98] transition flex items-center justify-between gap-1.5 cursor-pointer ${
                            active
                              ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] border-[#2B4875] text-white font-extrabold shadow-2xs"
                              : "bg-[#F8FAFC] border-slate-200/90 text-slate-700 hover:border-[#182C4E]/40 font-semibold"
                          }`}
                        >
                          <span className="leading-snug">{dept.shortName}</span>
                          {active && (
                            <CheckCircle2 className="w-4 h-4 text-[#7DD3FC] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                    Scientific Research Team (Optional)
                  </label>
                  <select
                    value={teamId || ""}
                    onChange={(e) =>
                      setTeamId(e.target.value ? e.target.value : undefined)
                    }
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-semibold text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#0284C7]"
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

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
                    <div>
                      <span className="text-xs font-bold text-[#0F1E36] block">
                        7-Day Study &amp; Free Hours Matrix (08:00 – 20:00)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Tap your free hours between classes
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-extrabold text-[#182C4E] bg-[#F0F6FF] border border-[#D5E3F5] px-2.5 py-0.5 rounded-lg tabular-nums">
                      {totalSelectedSlots} hrs free
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                    {DAYS.map((day) => {
                      const activeSlots = normalizeDayHourlySlots(
                        availability[day]
                      );
                      const allSelected = activeSlots.length === SLOTS.length;
                      return (
                        <div
                          key={day}
                          className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#0F1E36]">
                              {day}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-slate-500 tabular-nums">
                                {activeSlots.length}/{SLOTS.length} hrs
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleAllDaySlots(day)}
                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[#0284C7] hover:bg-[#F0F6FF] cursor-pointer transition"
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
                                  className={`py-1.5 px-1 rounded-md text-[10px] font-mono font-extrabold active:scale-[0.97] transition cursor-pointer text-center ${
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

            {/* STEP 5: Alumni Laureate Dossier Verification & Charter (For Alumni) */}
            {step === 5 && isAlumni && (
              <div className="space-y-3.5 animate-rise">
                {/* Prestigious Alumni Laureate Card */}
                <div className="rounded-2xl bg-gradient-to-br from-[#071328] via-[#0E2042] to-[#1E1B4B] text-white p-4 border border-indigo-500/40 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl || "/brand/logo_quanta_opt.webp"}
                      alt={fullName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400/80 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-black text-sm text-white truncate">
                          {fullName || "QUANTA Alumnus"}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/40 text-[9.5px] font-mono font-black uppercase tracking-wider shrink-0">
                          Fellow '{graduationYear ? graduationYear.slice(-2) : "23"}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#38BDF8] truncate mt-0.5">
                        {alumniPosition || "Distinguished Club Alumnus"}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-300 font-semibold mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {effectiveUniversity} · {effectiveMajor}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[9.5px] font-mono uppercase text-slate-400 block font-bold">
                        Network Rank
                      </span>
                      <span className="font-extrabold text-amber-300">
                        Quanta Laureate (Rank 08)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[9.5px] font-mono uppercase text-slate-400 block font-bold">
                        Mentorship Status
                      </span>
                      <span className="font-extrabold text-emerald-300">
                        {alumniMentorshipWilling
                          ? "Active Mentor"
                          : "Network Member"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alumni Charter & Honor Code */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={charterConfirmed}
                      onChange={(e) => setCharterConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-emerald-950 leading-snug block">
                        I accept the QUANTA Alumni Network Charter &amp; Scientific Honor Code.
                      </span>
                      <p className="text-[10.5px] text-emerald-800 leading-relaxed">
                        I pledge to uphold academic integrity, foster scientific innovation, and support current student researchers of University of Algiers 1.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Dossier Summary Notice */}
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Residence / Region:</span>
                    <span className="font-bold text-[#0F1E36]">
                      {commune ? `${commune} (${wilaya})` : wilaya}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Domain of Expertise:</span>
                    <span className="font-bold text-indigo-700">
                      {alumniIndustry}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Alumni Privileges:</span>
                    <span className="font-bold text-emerald-700">
                      Lifetime Access &amp; Laureate Honor
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Outside Activities & Charter (Only For Students) */}
            {step === 6 && !isAlumni && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-extrabold text-[#0F1E36] mb-1.5">
                    Other Clubs, Associations &amp; Volunteering Experience
                  </label>
                  <textarea
                    rows={2.5}
                    value={outsideActivitiesAndVolunteering}
                    onChange={(e) =>
                      setOutsideActivitiesAndVolunteering(e.target.value)
                    }
                    className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs text-[#0F1E36] focus:bg-white focus:outline-none focus:border-[#0284C7]"
                    placeholder="Share any other student clubs, associations, or volunteering initiatives..."
                  />
                </div>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declaresOtherStudentOrg}
                    onChange={(e) =>
                      setDeclaresOtherStudentOrg(e.target.checked)
                    }
                    className="mt-0.5 w-4 h-4 rounded text-[#182C4E] focus:ring-[#182C4E]"
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

                <div className="p-3 rounded-2xl bg-[#F0F6FF]/85 border border-[#D5E3F5] text-xs space-y-1.5">
                  <div className="font-extrabold text-[#182C4E] flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                    <span>QUANTA Charter &amp; Registration Summary</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Member:</span>
                    <span className="font-bold text-[#0F1E36] text-right truncate">
                      {fullName || "New Member"} · {commune || wilaya}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">University:</span>
                    <span className="font-bold text-[#0F1E36] text-right truncate">
                      {effectiveUniversity}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Major:</span>
                    <span className="font-bold text-[#0F1E36] text-right truncate">
                      {effectiveMajor} ({academicYear})
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Hardware &amp; Dept:</span>
                    <span className="font-bold text-[#0284C7] text-right">
                      {hasLaptop ? "Laptop" : "No PC"} ·{" "}
                      {
                        departments.find((d) => d.id === departmentId)
                          ?.shortName
                      }
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={charterConfirmed}
                        onChange={(e) => setCharterConfirmed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"
                      />
                      <span className="text-xs font-bold text-emerald-950 leading-snug">
                        I accept the QUANTA Internal Charter and confirm my
                        registration profile is accurate.
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowInternalLaw((v) => !v)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 text-white text-[10.5px] font-display font-bold shrink-0 shadow-2xs transition cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3 text-[#7DD3FC]" />
                      <span>{showInternalLaw ? "Hide Law" : "Read Law"}</span>
                    </button>
                  </div>

                  {showInternalLaw && (
                    <div className="mt-2 rounded-xl bg-white border border-slate-200/90 shadow-md overflow-hidden animate-rise">
                      {/* Official Header */}
                      <div className="bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white p-3 border-b border-[#2B4875]/70">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7DD3FC] flex items-center gap-1">
                              <Scale className="w-3 h-3" />
                              <span>OFFICIAL CLUB CHARTER · DECISION N° 44</span>
                            </span>
                            <h4 className="font-display text-xs font-black text-white">
                              {QUANTA_INTERNAL_LAW_HEADER.titleAr}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowInternalLaw(false)}
                            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 cursor-pointer"
                            aria-label="Close Internal Law"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Chapter Filter Pills */}
                        <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
                          <button
                            type="button"
                            onClick={() => setLawChapterFilter("ALL")}
                            className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold shrink-0 cursor-pointer transition ${
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
                              className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold shrink-0 cursor-pointer transition ${
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

                      {/* Scrollable Organized Chapters & Articles */}
                      <div className="max-h-[220px] overflow-y-auto p-2.5 space-y-2 bg-white">
                        {QUANTA_INTERNAL_LAW_CHAPTERS.filter(
                          (ch) =>
                            lawChapterFilter === "ALL" ||
                            ch.id === lawChapterFilter
                        ).map((ch) => (
                          <div
                            key={ch.id}
                            className="rounded-lg border border-slate-200/90 bg-[#F8FAFD] overflow-hidden"
                          >
                            <div className="px-2.5 py-1.5 bg-[#F0F6FF] border-b border-[#D5E3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span
                                dir="rtl"
                                className="text-[11px] font-extrabold text-[#0F1E36]"
                              >
                                {ch.chapterTitleAr}
                              </span>
                              <span className="text-[9.5px] font-mono font-bold text-[#0284C7]">
                                {ch.chapterTitleEn}
                              </span>
                            </div>

                            <div className="p-2 space-y-1.5">
                              {ch.articles.map((art) => (
                                <div
                                  key={art.id}
                                  dir="rtl"
                                  className="p-2 rounded bg-white border border-slate-200/80 space-y-1 text-right"
                                >
                                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-0.5">
                                    <span className="text-[10.5px] font-extrabold text-[#182C4E]">
                                      {art.articleAr}: {art.titleAr}
                                    </span>
                                  </div>
                                  <ul className="space-y-0.5 text-[10px] text-slate-700 leading-relaxed list-disc pr-3">
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
                      <div className="px-3 py-2 bg-[#F8FAFC] border-t border-slate-200/80 flex items-center justify-between gap-2">
                        <span className="text-[9.5px] font-mono text-slate-500">
                          University of Algiers 1 · Faculty of Sciences
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCharterConfirmed(true);
                            setShowInternalLaw(false);
                          }}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-display font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Accept &amp; Close</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pinned Bottom Footer — Solid & Crisp */}
          <div className="shrink-0 p-3 sm:p-3.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2.5">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="h-11 px-4.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 text-xs font-bold text-[#0F1E36] hover:bg-[#F0F6FF] active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < maxStep ? (
              <button
                type="button"
                disabled={step === 1 && !canProceedStep1}
                onClick={() => {
                  if (step === 1) {
                    setPhoneTouched(true);
                    if (!canProceedStep1) return;
                  }
                  setStep((s) => s + 1);
                }}
                className={`h-11 px-6 rounded-xl font-display text-xs font-black active:scale-[0.98] transition flex items-center gap-2 shadow-sm ${
                  step === 1 && !canProceedStep1
                    ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                    : "bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/75 text-white cursor-pointer"
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#7DD3FC]" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!charterConfirmed}
                onClick={handleFinish}
                className={`h-11 px-6 rounded-xl font-display text-xs font-black active:scale-[0.98] transition flex items-center gap-2 ${
                  charterConfirmed
                    ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/75 text-white cursor-pointer shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#7DD3FC]" />
                <span>
                  {isAlumni ? "Complete Alumni Dossier" : "Complete Registration"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </MobileAppShell>
  );
}
