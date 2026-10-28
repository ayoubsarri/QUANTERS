/**
 * QUANTERS — Optimized Clean Production Database Seed
 * Contains ONLY structural metadata:
 * - 6 Fixed QUANTA Departments
 * - 6 Editable Scientific Teams
 * - 16 Official Point Rules
 * - 365+ Heritage & Scientific Daily Quotes
 * - 5 Real Recent Scientific & AI Explore Articles
 * - System Governance Settings
 *
 * All transactional/operational collections (Members, Workshops, Tasks, Proposals,
 * Points Ledger, Badges, Exams, Project Submissions, Daily Quizzes, Messages,
 * Grievances, Invitations, Access Grants, Audit Logs) start EMPTY ([]).
 */

import {
  AccessGrant,
  AuditLogEntry,
  AvailabilityGrid,
  Badge,
  BadgeExam,
  ClubMessage,
  ClubTask,
  DailyQuizItem,
  DailyQuoteItem,
  Department,
  ExplorePost,
  Invitation,
  Member,
  MemberGrievance,
  PointRule,
  PointsLedgerEntry,
  ProjectSubmission,
  Proposal,
  ScientificTeam,
  SystemSettings,
  Workshop,
  DEFAULT_RANK_LEVELS,
} from "../types/erp";
import { SEED_DAILY_QUOTES_365 } from "./dailyQuotes365";

export { SEED_DAILY_QUOTES_365 };

export const DEFAULT_AVAILABILITY: AvailabilityGrid = {
  Saturday: ["08-09", "09-10", "10-11", "11-12", "13-14", "14-15", "15-16"],
  Sunday: ["13-14", "14-15", "15-16"],
  Monday: ["15-16", "16-17", "17-18"],
  Tuesday: ["13-14", "14-15", "16-17"],
  Wednesday: ["08-09", "09-10", "10-11"],
  Thursday: ["13-14", "14-15", "15-16", "16-17"],
  Friday: ["09-10", "10-11", "14-15", "15-16"],
};

/**
 * Unpersisted fallback session profile used ONLY when `members` is empty ([])
 * so mobile views (/home, /profile, /onboarding, /manager) never crash before
 * the first member registers.
 */
export const FALLBACK_SESSION_MEMBER: Member = {
  id: "session-guest",
  quanterId: "QT-00-0000",
  handle: "@guest",
  email: "",
  fullName: "Guest",
  phone: "",
  avatarUrl: "/icons/icon-192.png",
  bio: "",
  major: "Computer Science (Informatique Générale)",
  university: "University of Algiers 1",
  academicYear: "L3",
  tenure: "Guest Session",
  departmentId: "dept-it",
  teamId: undefined,
  roles: [],
  isBureauMember: false,
  status: "Trainee",
  statusSince: "Oct 2026",
  traineeStartDate: "2026-10-01",
  traineeDaysElapsed: 1,
  wilaya: "Algiers (16)",
  commune: "",
  housingType: "Family Home",
  commuteTime: "< 30 min",
  canStayLate: true,
  hasLaptop: true,
  pcCapability: "Coding & Dev",
  equipmentTags: ["Personal Laptop"],
  githubUrl: "",
  linkedinUrl: "",
  portfolioUrl: "",
  outsideActivitiesAndVolunteering: "",
  declaresOtherStudentOrg: false,
  availability: DEFAULT_AVAILABILITY,
  xpTotal: 0,
  xpSeason: 0,
  xpMonth: 0,
  level: 1,
  levelTitle: "Quanta Initiate",
  attendanceRate: 100,
  onTimeTaskRate: 100,
  recentActivityScore: 100,
  healthScore: 100,
  daysSinceLastActivity: 0,
  lateTasksThisMonth: 0,
  recognitionLabels: [],
  onboardingTicks: {
    profileComplete: false,
    buddyAssigned: false,
    firstTaskBeforeDay30: false,
    firstWorkshopAttended: false,
  },
  traineeEvaluation: {
    headEndorsed: false,
    coManagerEndorsed: false,
    notes: "",
  },
  skills: [],
  badgeIds: [],
  workshopsCompletedCount: 0,
  projectsCompletedCount: 0,
  eventsAttendedCount: 0,
  statusHistory: [],
  placementHistory: [],
};

// 6 Fixed, Undeletable Club Departments
export const SEED_DEPARTMENTS: Department[] = [
  {
    id: "dept-it",
    name: "IT and Technical Solutions",
    shortName: "IT & Tech",
    description:
      "Software platforms, digital infrastructure, AI systems, and technical support.",
    icon: "Cpu",
    headMemberId: "",
    coManagerMemberId: "",
  },
  {
    id: "dept-events",
    name: "Events and Scientific Activities",
    shortName: "Events & Science",
    description:
      "Workshops, scientific conferences, competitions, and academic programming.",
    icon: "Calendar",
    headMemberId: "",
    coManagerMemberId: "",
  },
  {
    id: "dept-hr",
    name: "HR and Internal Development",
    shortName: "HR & Dev",
    description:
      "Member onboarding, KPI tracking, evaluations, training, and internal governance.",
    icon: "Users",
    headMemberId: "",
    coManagerMemberId: "",
  },
  {
    id: "dept-er",
    name: "External Relations and Sponsorship",
    shortName: "External Relations",
    description:
      "Institutional partnerships, sponsorships, speakers, and inter-club diplomacy.",
    icon: "Handshake",
    headMemberId: "",
    coManagerMemberId: "",
  },
  {
    id: "dept-media",
    name: "Media and Digital Marketing",
    shortName: "Media & Design",
    description:
      "Visual identity, scientific journalism, photography, video production, and social media.",
    icon: "Camera",
    headMemberId: "",
    coManagerMemberId: "",
  },
  {
    id: "dept-logistics",
    name: "Finance, Logistics and Equipment",
    shortName: "Finance & Logistics",
    description:
      "Venue setup, laboratory equipment custody, budgeting, and field operations.",
    icon: "Package",
    headMemberId: "",
    coManagerMemberId: "",
  },
];

// 6 Editable Scientific Teams (Starting with empty member rosters)
export const SEED_TEAMS: ScientificTeam[] = [
  {
    id: "team-astro",
    name: "Astronomy & Astrophysics",
    field: "Physics & Astronomy",
    description:
      "Observational astronomy, exoplanet data analysis, cosmology, and telescope nights.",
    icon: "Orbit",
    leaderMemberId: "",
    memberIds: [],
    archived: false,
  },
  {
    id: "team-cs-ai",
    name: "CS & Artificial Intelligence",
    field: "Computer Science & AI",
    description:
      "Machine learning for science, computational modeling, and research algorithms.",
    icon: "BrainCircuit",
    leaderMemberId: "",
    memberIds: [],
    archived: false,
  },
  {
    id: "team-math",
    name: "Mathematics & Modeling",
    field: "Mathematics",
    description:
      "Applied mathematics, cryptography, olympiad preparation, and statistical physics.",
    icon: "Sigma",
    leaderMemberId: "",
    memberIds: [],
    archived: false,
  },
  {
    id: "team-bio",
    name: "Biology & Life Sciences",
    field: "Biology & Biotech",
    description:
      "Bioinformatics, molecular genetics, ecology, and laboratory research protocols.",
    icon: "Dna",
    leaderMemberId: "",
    memberIds: [],
    archived: false,
  },
  {
    id: "team-health",
    name: "Health Sciences & Biophysics",
    field: "Health Sciences",
    description:
      "Medical physics, public health awareness, and biomedical instrumentation.",
    icon: "HeartPulse",
    leaderMemberId: "",
    memberIds: [],
    archived: false,
  },
  {
    id: "team-chem",
    name: "Chemistry & Materials",
    field: "Chemistry & Materials",
    description:
      "Nanomaterials, crystallography, green chemistry, and spectroscopy.",
    icon: "FlaskConical",
    leaderMemberId: "",
    memberIds: [],
    archived: false,
  },
];

// Production official Super Admin member profile
export const SUPER_ADMIN_MEMBER: Member = {
  id: "mem-super-quanta",
  quanterId: "QT-00-0000",
  handle: "@quanta_admin",
  email: "quantaclubdz@gmail.com",
  fullName: "QUANTA Super Admin",
  phone: "",
  wilaya: "Algiers (16)",
  commune: "",
  university: "University of Algiers 1",
  housingType: "Family Home",
  commuteTime: "< 30 min",
  canStayLate: true,
  major: "Computer Science (Informatique Générale)",
  academicYear: "L3",
  tenure: "Bureau Leadership (2026/2027)",
  hasLaptop: true,
  pcCapability: "Coding & Dev",
  equipmentTags: ["Personal Laptop"],
  githubUrl: "",
  linkedinUrl: "",
  portfolioUrl: "",
  departmentId: "dept-it",
  roles: ["Super Admin", "Executive", "HR Head"],
  isBureauMember: true,
  declaresOtherStudentOrg: false,
  status: "Active",
  statusSince: "Oct 2026",
  traineeStartDate: "2026-10-01",
  traineeDaysElapsed: 1,
  attendanceRate: 100,
  onTimeTaskRate: 100,
  recentActivityScore: 100,
  healthScore: 100,
  daysSinceLastActivity: 0,
  level: 1,
  levelTitle: "Quanta Initiate",
  xpTotal: 0,
  xpSeason: 0,
  xpMonth: 0,
  badgeIds: [],
  workshopsCompletedCount: 0,
  projectsCompletedCount: 0,
  lateTasksThisMonth: 0,
  eventsAttendedCount: 0,
  bio: "QUANTA Scientific Club Super Administrator",
  outsideActivitiesAndVolunteering: "",
  skills: ["Club Governance", "Scientific Computing"],
  recognitionLabels: [],
  onboardingTicks: {
    profileComplete: true,
    firstWorkshopAttended: true,
    firstTaskBeforeDay30: true,
    buddyAssigned: true,
  },
  availability: DEFAULT_AVAILABILITY,
  traineeEvaluation: {
    headEndorsed: true,
    coManagerEndorsed: true,
    notes: "Super Admin Account",
  },
  statusHistory: [],
  placementHistory: [],
  avatarUrl: "/icons/icon-192.png",
};

// Transactional collections for production launch: Super Admin ONLY
export const SEED_MEMBERS: Member[] = [SUPER_ADMIN_MEMBER];

// Workshops collection initialized empty (zero active workshops)
export const SEED_WORKSHOPS: Workshop[] = [];

export const SEED_BADGES: Badge[] = [
  {
    id: "badge-test-python",
    name: "Python Scientific Explorer",
    category: "Technology",
    skillType: "Hard Skill",
    iconName: "python",
    borderTone: "cyan",
    description:
      "Verified command of Python scientific computing, array manipulation, and experimental data analysis pipelines.",
    criteriaText:
      "Pass the online skill exam (≥70%) or submit a verified repository.",
    xpReward: 120,
    earningMethods: ["exam", "project"],
    requirementType: "both",
    linkedExamId: "exam-test-python",
    memberState: "In Progress",
    progressPercent: 50,
    awardedCount: 0,
    archived: false,
  },
  {
    id: "badge-test-quantum",
    name: "Astrophysics & Quantum Pioneer",
    category: "Science",
    skillType: "Hard Skill",
    iconName: "astrophysics",
    borderTone: "gold",
    description:
      "Foundational mastery of stellar spectroscopy, exoplanet transit photometry, and quantum state mechanics.",
    criteriaText:
      "Pass the Astrophysics & Quantum Foundations assessment (≥70%) or present a research digest with the Astronomy Team.",
    xpReward: 150,
    earningMethods: ["exam", "manual"],
    requirementType: "exam",
    linkedExamId: "exam-test-quantum",
    memberState: "Locked",
    progressPercent: 0,
    awardedCount: 0,
    archived: false,
  },
];

export const SEED_EXAMS: BadgeExam[] = [
  {
    id: "exam-test-python",
    badgeId: "badge-test-python",
    title: "Python Scientific Explorer Assessment",
    category: "Technology",
    iconName: "python",
    level: "Beginner",
    xpReward: 120,
    durationMinutes: 30,
    totalQuestionsCount: 4,
    passingScorePercent: 70,
    maxAttempts: 2,
    attemptsUsed: 0,
    rules: [
      "Stable internet connection required",
      "Passing score is 70% or above to unlock the Python Scientific Explorer badge",
      "Submit your answers before the timer expires",
    ],
    questions: [
      {
        id: "q-py-1",
        question: "Which NumPy operation computes the element-wise dot product of two 1D vectors a and b?",
        options: ["np.dot(a, b)", "np.concat(a, b)", "np.split(a, b)", "np.where(a, b)"],
        correctIndex: 0,
      },
      {
        id: "q-py-2",
        question: "In Pandas, which method returns summary statistics (mean, std, quartiles) of numerical columns?",
        options: ["df.describe()", "df.head()", "df.rename()", "df.dropna()"],
        correctIndex: 0,
      },
      {
        id: "q-py-3",
        question: "Why are vectorized NumPy arrays faster than standard Python loops for numerical datasets?",
        options: [
          "Contiguous C-level memory layout and SIMD vector operations",
          "They automatically compress files to ZIP format",
          "They run exclusively inside HTML templates",
          "They disable floating-point precision",
        ],
        correctIndex: 0,
      },
      {
        id: "q-py-4",
        question: "Which Matplotlib function saves a high-resolution figure to disk for a scientific report?",
        options: ["plt.savefig('figure.png', dpi=300)", "plt.export_raw()", "plt.write_csv()", "plt.clear_axes()"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "exam-test-quantum",
    badgeId: "badge-test-quantum",
    title: "Astrophysics & Quantum Pioneer Exam",
    category: "Science",
    iconName: "astrophysics",
    level: "Intermediate",
    xpReward: 150,
    durationMinutes: 40,
    totalQuestionsCount: 4,
    passingScorePercent: 70,
    maxAttempts: 2,
    attemptsUsed: 0,
    rules: [
      "Stable internet connection required",
      "Passing score is 70% or above to unlock the Astrophysics & Quantum Pioneer badge",
      "Submit your answers before the timer expires",
    ],
    questions: [
      {
        id: "q-aq-1",
        question: "What observable dip in stellar brightness indicates a transiting exoplanet?",
        options: [
          "Periodic flux reduction in the transit light curve proportional to (Rp / Rs)²",
          "Permanent disappearance of the host star's magnetic field",
          "Sudden radio burst from galactic cosmic rays",
          "Complete gravitational collapse of the star",
        ],
        correctIndex: 0,
      },
      {
        id: "q-aq-2",
        question: "In quantum mechanics, what does the squared modulus |ψ(x, t)|² of a wave function represent?",
        options: [
          "Probability density of finding the particle at position x at time t",
          "Classical kinetic momentum of the system",
          "Rest mass energy of the atomic nucleus",
          "Thermal conductivity of the lattice",
        ],
        correctIndex: 0,
      },
      {
        id: "q-aq-3",
        question: "Which space telescope instrument suite detected methane and CO₂ in exoplanet K2-18 b?",
        options: [
          "JWST NIRISS and NIRSpec transmission spectroscopy",
          "Chandra X-Ray Grazing Incidence Mirrors",
          "LIGO Laser Interferometer Arms",
          "Voyager 1 Plasma Wave Subsystem",
        ],
        correctIndex: 0,
      },
      {
        id: "q-aq-4",
        question: "What physical law relates the peak wavelength of blackbody stellar radiation to surface temperature?",
        options: [
          "Wien's Displacement Law (λ_max · T = b)",
          "Hooke's Law of Elasticity",
          "Faraday's Law of Electrolysis",
          "Ohm's Law of Resistance",
        ],
        correctIndex: 0,
      },
    ],
  },
];
export const SEED_TASKS: ClubTask[] = [];
export const SEED_LEDGER: PointsLedgerEntry[] = [];
export const SEED_MESSAGES: ClubMessage[] = [];
export const SEED_PROPOSALS: Proposal[] = [];
export const SEED_PROJECT_SUBMISSIONS: ProjectSubmission[] = [];
export const SEED_INVITATIONS: Invitation[] = [];
export const SEED_ACCESS_GRANTS: AccessGrant[] = [];
export const SEED_AUDIT_LOGS: AuditLogEntry[] = [];
export const SEED_DAILY_QUIZZES: DailyQuizItem[] = [];
export const SEED_GRIEVANCES: MemberGrievance[] = [];

// 16 Official Club Point Rules
export const SEED_POINT_RULES: PointRule[] = [
  {
    id: "pr-1",
    label: "Attendance at a general meeting",
    points: 15,
    category: "Earning",
    description: "Verified check-in at a club-wide general assembly.",
  },
  {
    id: "pr-2",
    label: "Weekly meeting",
    points: 10,
    category: "Earning",
    description: "Verified attendance at a department or scientific team weekly sync.",
  },
  {
    id: "pr-3",
    label: "Early delivery",
    points: 25,
    category: "Earning",
    description: "Delivering an assigned task ≥24h ahead of deadline.",
  },
  {
    id: "pr-4",
    label: "On-time delivery",
    points: 15,
    category: "Earning",
    description: "Delivering an assigned task by the agreed deadline.",
  },
  {
    id: "pr-5",
    label: "Covering a shift",
    points: 30,
    category: "Earning",
    description: "Stepping in to cover a logistics or check-in shift for a teammate.",
  },
  {
    id: "pr-6",
    label: "Giving a workshop",
    points: 40,
    category: "Earning",
    description: "Preparing and instructing an official club workshop.",
  },
  {
    id: "pr-7",
    label: "Internal test",
    points: 35,
    category: "Earning",
    description: "Passing an internal technical or scientific qualification test.",
  },
  {
    id: "pr-8",
    label: "Sponsorship",
    points: 50,
    category: "Earning",
    description: "Securing an official partner or sponsor for a club activity.",
  },
  {
    id: "pr-9",
    label: "Buddy mentorship",
    points: 30,
    category: "Earning",
    description: "Guiding a Trainee through all 4 onboarding checkpoints.",
  },
  {
    id: "pr-10",
    label: "Scientific article",
    points: 25,
    category: "Earning",
    description: "Authoring a reviewed scientific digest published in Explore.",
  },
  {
    id: "pr-11",
    label: "Member of the Month",
    points: 50,
    category: "Earning",
    description: "Monthly club-wide excellence recognition award.",
  },
  {
    id: "pr-12",
    label: "Late arrival",
    points: -10,
    category: "Deduction",
    description: "Arriving >15 minutes late to an assigned shift or mandatory meeting.",
  },
  {
    id: "pr-13",
    label: "Unjustified absence",
    points: -25,
    category: "Deduction",
    description: "Missing a confirmed shift or mandatory meeting without prior excuse.",
  },
  {
    id: "pr-14",
    label: "Late delivery",
    points: -20,
    category: "Deduction",
    description: "Submitting an assigned task after the deadline without notice.",
  },
  {
    id: "pr-15",
    label: "Premises breach",
    points: -30,
    category: "Deduction",
    description: "Leaving club room or laboratory equipment untidy or unsecured.",
  },
  {
    id: "pr-16",
    label: "Unprofessional conduct",
    points: -40,
    category: "Deduction",
    description: "Breach of the QUANTA Internal Law code of conduct.",
  },
];

// 5 Real Recent Scientific & AI Explore Articles
export const SEED_EXPLORE_POSTS: ExplorePost[] = [
  {
    id: "exp-ai-alphafold3",
    title: "AlphaFold 3 & Generative AI: Mapping the Molecular Machinery of Life",
    summary:
      "Google DeepMind and Isomorphic Labs introduce a unified diffusion architecture capable of predicting the joint 3D structures of proteins, DNA, RNA, and small-molecule ligands with atomic precision—transforming structural biology and rational drug design.",
    category: "Scientific News",
    tagLabel: "AI & COMPUTING",
    tagTone: "sky",
    source: "Nature · DeepMind",
    readTime: "4 min read",
    date: "Oct 24, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://www.nature.com/articles/s41586-024-07487-w",
  },
  {
    id: "exp-science-jwst-k218b",
    title: "James Webb Space Telescope Detects Carbon-Bearing Molecules on Exoplanet K2-18 b",
    summary:
      "Transmission spectroscopy from JWST's NIRISS and NIRSpec instruments reveals an abundance of methane and carbon dioxide in the habitable-zone atmosphere of sub-Neptune K2-18 b, 120 light-years away, pointing toward a candidate Hycean world.",
    category: "Scientific News",
    tagLabel: "ASTROPHYSICS",
    tagTone: "sky",
    source: "NASA · ESA · JWST",
    readTime: "3 min read",
    date: "Oct 22, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://science.nasa.gov/mission/webb/",
  },
  {
    id: "exp-quantum-logical-qubits",
    title: "Below the Surface-Code Threshold: Fault-Tolerant Quantum Error Correction",
    summary:
      "Experimental physicists demonstrate logical qubit memories where scaling the surface-code distance exponentially suppresses logical error rates, crossing the critical threshold required for fault-tolerant quantum simulation.",
    category: "Scientific News",
    tagLabel: "QUANTUM PHYSICS",
    tagTone: "cyan",
    source: "Nature Physics",
    readTime: "5 min read",
    date: "Oct 19, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    featuredInCarousel: false,
    status: "Published",
    externalUrl: "https://www.nature.com/nphys/",
  },
  {
    id: "exp-biotech-crispr-prime",
    title: "CRISPR Prime Editing & Programmable RNA: Precision Gene Therapy Advances",
    summary:
      "Next-generation prime editors rewrite pathogenic point mutations and insertions without requiring double-stranded DNA breaks, opening new clinical pathways for hereditary blood and metabolic disorders.",
    category: "Opportunities",
    tagLabel: "BIOTECHNOLOGY",
    tagTone: "amber",
    source: "Cell · Broad Institute",
    readTime: "4 min read",
    date: "Oct 15, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
    featuredInCarousel: false,
    status: "Published",
    externalUrl: "https://www.cell.com/",
  },
  {
    id: "exp-quanta-season-launch",
    title:
      "QUANTA 2026/2027 New Strategy: Interdisciplinary Research, Skill Verification & Digital Governance",
    summary:
      "QUANTA Scientific Club unveils its 2026/2027 strategic roadmap at the University of Algiers 1: uniting 6 operational departments and 6 specialized scientific teams around weekly hands-on lab tracks, verified STEM skill badges, transparent KPI governance, and student-led research projects from concept to publication.",
    category: "QUANTA News",
    tagLabel: "QUANTA STRATEGY",
    tagTone: "cyan",
    source: "QUANTA Executive Board",
    readTime: "3 min read",
    date: "Oct 26, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://univ-alger.dz/",
  },
];

export function getCurrentDayOfYear(offsetDays = 0): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const rawDay = Math.floor(diff / oneDay) + offsetDays;
  return ((((rawDay - 1) % 365) + 365) % 365) + 1;
}

export function getActiveDailyQuote(
  quotes: DailyQuoteItem[],
  settings?: SystemSettings
): DailyQuoteItem {
  const list = quotes && quotes.length > 0 ? quotes : SEED_DAILY_QUOTES_365;
  if (settings?.dailyQuoteMode === "pinned" && settings.pinnedQuoteId) {
    const pinned = list.find((q) => q.id === settings.pinnedQuoteId);
    if (pinned) return pinned;
  }
  const day = getCurrentDayOfYear(settings?.dailyQuoteDayOffset || 0);
  return (
    list.find((q) => q.dayOfYear === day) ||
    list[(day - 1) % list.length] ||
    SEED_DAILY_QUOTES_365[0]
  );
}

export const SEED_SETTINGS: SystemSettings = {
  registrationOpen: true,
  invitationValidityDays: 7,
  alumniAccessGlobal: true,
  traineeDurationMonths: 3,
  confirmationAttendanceThreshold: 75,
  confirmationXpThreshold: 150,
  inactivityFlagDays: 30,
  firstTaskDeadlineDays: 30,
  buddyAssignmentDays: 7,
  maxActiveTasksPerMember: 2,
  pointsAppealWindowHours: 48,
  taskMatrixLeadDays: 5,
  teamSizeMin: 5,
  teamSizeMax: 8,
  currentSeasonLabel: "Academic Season 2026/2027 · Semester 1",
  healthWeightAttendance: 50,
  healthWeightTasks: 35,
  healthWeightRecent: 15,
  maxImageDimensionPx: 256,
  webpCompressionQuality: 78,
  dailyQuoteMode: "auto_365",
  dailyQuoteDayOffset: 0,
  quotaSaverPreset: "aggressive",
  syncStrategy: "debounced_30s",
  clientCacheTtlMinutes: 15,
  deltaSyncOnly: true,
  disableVideoOnCellular: true,
  autoCompactHistoryLimit: 100,
  rankLevels: DEFAULT_RANK_LEVELS,
  archivedMembers: [],
};
