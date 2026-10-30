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

// Authentic QUANTA Workshops & Scientific Labs
export const SEED_WORKSHOPS: Workshop[] = [
  {
    id: "ws-python",
    title: "Python for Scientists",
    activityType: "Workshop",
    category: "Python",
    iconType: "python",
    level: "Beginner",
    instructor: "Lotfi Benali & Ayoub Sarri",
    dateLabel: "Tomorrow",
    timeRange: "14:00 - 17:00",
    location: "Faculty of Sciences · Lab A1",
    capacity: 30,
    seatsLeft: 24,
    xpReward: 150,
    status: "Published",
    description:
      "Hands-on numerical computing with NumPy, SciPy, and Matplotlib for experimental physics, chemistry, and biology data.",
    objectives: [
      "Set up reproducible scientific Python notebooks",
      "Vectorize experimental data arrays with NumPy",
      "Plot publication-grade figures with Matplotlib",
    ],
    materials: ["Laptop with Python 3.11+", "Lab A1 Dataset Pack (CSV)"],
    linkedBadgeId: "badge-python",
    liveQrToken: "QUANTA-WS-PYTHON-2026-LIVE",
    liveSixDigitCode: "482910",
    registeredMemberIds: [],
    waitlistMemberIds: [],
    attendanceRecords: [],
  },
  {
    id: "ws-arduino",
    title: "Arduino & Electronics",
    activityType: "Workshop",
    category: "Arduino",
    iconType: "arduino",
    level: "Beginner",
    instructor: "Karim Hadj & Riad Touati",
    dateLabel: "12 Oct 2026",
    timeRange: "10:00 - 13:00",
    location: "Lab A1",
    capacity: 25,
    seatsLeft: 18,
    xpReward: 120,
    status: "Published",
    description:
      "Microcontroller interfacing, sensor calibration, breadboard prototyping, and real-time serial telemetry.",
    objectives: [
      "Build sensor acquisition circuits on breadboard",
      "Read analog/I2C sensors and log serial data",
      "Control actuators with PWM feedback loops",
    ],
    materials: ["Arduino Uno Kit (provided by QUANTA Logistics)", "USB-B Cable"],
    linkedBadgeId: "badge-electronics",
    liveQrToken: "QUANTA-WS-ARDUINO-2026",
    liveSixDigitCode: "739104",
    registeredMemberIds: [],
    waitlistMemberIds: [],
    attendanceRecords: [],
  },
  {
    id: "ws-astronomy",
    title: "Astronomy Observation",
    activityType: "Workshop",
    category: "Astronomy",
    iconType: "astronomy",
    level: "Intermediate",
    instructor: "Sara Mansouri & Ayoub Sarri",
    dateLabel: "25 Oct 2026",
    timeRange: "18:00 - 21:00",
    location: "Observatory",
    capacity: 20,
    seatsLeft: 12,
    xpReward: 180,
    status: "Published",
    description:
      "Equatorial telescope alignment, deep-sky celestial navigation, planetary imaging, and spectral classification.",
    objectives: [
      "Perform polar alignment on equatorial mounts",
      "Locate Messier objects and Jupiter's Galilean moons",
      "Capture and stack long-exposure astrophotography frames",
    ],
    materials: ["Red flashlight", "Stellarium Mobile App", "Field Observation Logbook"],
    linkedBadgeId: "badge-astro",
    liveQrToken: "QUANTA-WS-ASTRO-2026",
    liveSixDigitCode: "910284",
    registeredMemberIds: [],
    waitlistMemberIds: [],
    attendanceRecords: [],
  },
  {
    id: "ws-3dprinting",
    title: "3D Printing for Research",
    activityType: "Workshop",
    category: "3D Printing",
    iconType: "printing",
    level: "Beginner",
    instructor: "Lotfi Benali",
    dateLabel: "02 Nov 2026",
    timeRange: "14:00 - 17:00",
    location: "Innovation Lab",
    capacity: 24,
    seatsLeft: 20,
    xpReward: 100,
    status: "Published",
    description:
      "Parametric CAD modeling, STL slicing tolerances, and FDM/resin fabrication of custom laboratory holders and enclosures.",
    objectives: [
      "Design parametric lab fixtures in CAD",
      "Optimize infill, layer height, and support structures",
      "Calibrate bed leveling and extrusion flow",
    ],
    materials: ["Laptop with UltiMaker Cura / PrusaSlicer"],
    linkedBadgeId: "badge-innovation",
    liveQrToken: "QUANTA-WS-3D-2026",
    liveSixDigitCode: "558201",
    registeredMemberIds: [],
    waitlistMemberIds: [],
    attendanceRecords: [],
  },
  {
    id: "ws-ai-science",
    title: "AI & Neural Networks in Lab Research",
    activityType: "Scientific Activity",
    category: "AI",
    iconType: "ai-ml",
    level: "Intermediate",
    instructor: "Lotfi Benali & Nesrine Khelifi",
    dateLabel: "14 Nov 2026",
    timeRange: "13:30 - 16:30",
    location: "Faculty of Sciences · Amphi B",
    capacity: 45,
    seatsLeft: 19,
    xpReward: 160,
    status: "Published",
    description:
      "Deep learning architectures for spectral classification, molecular property prediction, and experimental signal denoising.",
    objectives: [
      "Train PyTorch models on real spectroscopic and astronomical data",
      "Evaluate physics-informed neural networks (PINNs)",
      "Deploy lightweight inference notebooks",
    ],
    materials: ["Laptop with Google Colab / PyTorch", "Spectra Benchmark Dataset"],
    linkedBadgeId: "badge-ai",
    liveQrToken: "QUANTA-WS-AI-2026",
    liveSixDigitCode: "620419",
    registeredMemberIds: [],
    waitlistMemberIds: [],
    attendanceRecords: [],
  },
  {
    id: "ws-quantum",
    title: "Quantum Computing & Qiskit Lab",
    activityType: "Lab Session",
    category: "Quantum Physics",
    iconType: "quantum",
    level: "Advanced",
    instructor: "Dr. Amine Cherif (Alumni Guest)",
    dateLabel: "19 Nov 2026",
    timeRange: "14:00 - 17:00",
    location: "Physics Computing Lab C3",
    capacity: 25,
    seatsLeft: 9,
    xpReward: 180,
    status: "Published",
    description:
      "Quantum gates, entanglement circuits, Grover's search algorithm, and executing quantum circuits on IBM Quantum simulators.",
    objectives: [
      "Construct Bell states and quantum teleportation circuits in Qiskit",
      "Simulate noise models and quantum error mitigation",
      "Earn Alumni-mentored Quantum Lab credit",
    ],
    materials: ["Python + Qiskit SDK", "Linear Algebra Refresher Sheet"],
    linkedBadgeId: "badge-research",
    liveQrToken: "QUANTA-WS-QUANTUM-2026",
    liveSixDigitCode: "884120",
    registeredMemberIds: [],
    waitlistMemberIds: [],
    attendanceRecords: [],
  },
  {
    id: "ws-latex",
    title: "Scientific Writing, LaTeX & Peer Review",
    activityType: "Workshop",
    category: "Scientific Writing",
    iconType: "scientific-writing",
    level: "Beginner",
    instructor: "Sara Mansouri & Yasmine Bouzid",
    dateLabel: "24 Nov 2026",
    timeRange: "10:00 - 12:30",
    location: "Seminar Room A2",
    capacity: 35,
    seatsLeft: 21,
    xpReward: 110,
    status: "Published",
    description:
      "Master academic typesetting in LaTeX/Overleaf, BibTeX reference management, and structured abstract authoring for student research papers.",
    objectives: [
      "Structure IEEE & Nature templates in Overleaf",
      "Typeset multi-line equations, matrices, and vector figures",
      "Automate citations with BibTeX and Zotero",
    ],
    materials: ["Overleaf Account", "Sample Manuscript Pack"],
    linkedBadgeId: "badge-comm",
    liveQrToken: "QUANTA-WS-LATEX-2026",
    liveSixDigitCode: "194028",
    registeredMemberIds: [],
    waitlistMemberIds: [],
    attendanceRecords: [],
  },
];

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

// High-Standard Peer-Reviewed Scientific Dispatches (Dans les Normes)
export const SEED_EXPLORE_POSTS: ExplorePost[] = [
  {
    "id": "exp-neural-operators-fluids",
    "title": "Fourier Neural Operators: Zero-Shot Super-Resolution in Non-Linear Fluid Dynamics",
    "summary": "Parametrizing partial differential equations directly in infinite-dimensional function space allows Fourier Neural Operators to simulate Navier-Stokes turbulence 10,000 times faster than classical mesh solvers.",
    "content": "# Fourier Neural Operators: Zero-Shot Super-Resolution in Fluid Dynamics\n\n## 1. Escaping the Discrete Mesh Bottleneck\nClassical numerical simulation of turbulence and Navier-Stokes partial differential equations (PDEs) relies on fine spatial discretizations—finite difference (FDM), finite volume (FVM), or finite element (FEM) methods. As Reynolds numbers scale, mesh resolution must grow cubically, pushing computational requirements into petaflop regimes.\n\n> **Key Theoretical Breakthrough:** The **Fourier Neural Operator (FNO)** learns a continuous mapping between infinite-dimensional Hilbert spaces rather than approximating vector points on a fixed lattice.\n\n## 2. Mathematical Framework & Kernel Integral Formulation\nAn operator $\\mathcal{G}_\\theta: \\mathcal{A} \\to \\mathcal{U}$ is modeled through iterative kernel integration layers:\n\n$$v_{t+1}(x) = \\sigma \\left( W v_t(x) + \\left(\\mathcal{K} v_t\\right)(x) \\right)$$\n\nWhere the non-local kernel integral operator $\\mathcal{K}$ is computed directly in the frequency domain using the Fast Fourier Transform (FFT):\n\n$$\\left(\\mathcal{K} v_t\\right)(x) = \\mathcal{F}^{-1} \\left( R_\\phi \\cdot \\left(\\mathcal{F} v_t\\right) \\right)(x)$$\n\n- **Truncated Fourier Modes:** Higher frequencies above cutoff $k_{\\max}$ are filtered, achieving natural regularization.\n- **Mesh Invariance:** A model trained at a coarse $64 \\times 64$ resolution evaluates on a $512 \\times 512$ or continuous grid with **zero retraining** (zero-shot super-resolution).\n\n## 3. Practical Benchmark Metrics\n| Solver Architecture | Evaluation Time (s) | Relative $L_2$ Error | Memory Footprint |\n|---|---|---|---|\n| Classical Pseudo-Spectral | 2.45 s | Baseline (Exact) | High (Iterative) |\n| Standard U-Net ConvNet | 0.042 s | 8.92% (Mesh Tied) | Medium |\n| **Fourier Neural Operator (FNO)** | **0.003 s** | **1.14% (Zero-Shot)** | **Low (Cached)** |\n\n## 4. QUANTA Lab Implementation & Workshop Series\nWithin the QUANTA AI & Modeling track, students implement FNO architectures using PyTorch and benchmark vorticity fields on university GPU clusters. Practical sessions explore:\n1. Continuous parameter learning for Darcy flow and atmospheric advection.\n2. Physics-Informed Neural Operator (PINO) constraints penalizing mass conservation residual violations.",
    "category": "Scientific News",
    "tagLabel": "AI & COMPUTATIONAL PHYSICS",
    "tagTone": "cyan",
    "source": "QUANTA AI & Modeling Lab",
    "readTime": "5 min read",
    "date": "Oct 30, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://arxiv.org/abs/2010.08895"
  },
  {
    "id": "exp-crispr-cas12a-diagnostics",
    "title": "CRISPR-Cas12a Electrochemical Aptasensors: Femtomolar Viral RNA Detection at Room Temperature",
    "summary": "Coupling collateral single-stranded DNA cleavage with gold nanoparticle microelectrodes yields ultra-portable, reagent-free diagnostic platforms for rapid infectious disease screening.",
    "content": "# CRISPR-Cas12a Electrochemical Biosensors for Rapid Viral Detection\n\n## 1. Collateral Cleavage Transduction Mechanisms\nWhile CRISPR systems are historically celebrated for targeted gene editing, the discovery of **non-specific trans-cleavage activity** in Class 2 Cas12 and Cas13 endonucleases has revolutionized molecular diagnostics:\n- Upon specific guide-RNA (crRNA) hybridization with a target viral sequence, Cas12a undergoes an allosteric conformational shift.\n- This activates an indiscriminate single-stranded DNA (ssDNA) catalytic pocket that shreds adjacent non-target reporter probes at rates exceeding $10^4$ turnovers per minute.\n\n> *\"Collateral cleavage acts as a biological amplifier, turning a single target recognition event into millions of detectable electrochemical signals without requiring thermal PCR cycles.\"*\n\n## 2. Gold Microelectrode Architecture\nIn the QUANTA Biosensor setup, gold interdigitated microelectrodes (IDEs) are functionalized with methylene blue-conjugated hairpin oligonucleotides:\n1. In the absence of target pathogen, the stem-loop holds methylene blue close to the gold surface, facilitating fast electron transfer.\n2. In the presence of target viral cDNA, activated Cas12a rapidly cleaves the hairpin tether.\n3. The liberated redox reporter diffuses into the bulk solution, causing a sharp decrease in square-wave voltammetry (SWV) peak current.\n\n## 3. Key Analytical Parameters\n- **Limit of Detection (LoD):** $1.4 \\text{ fM}$ ($< 50$ copies/$\\mu\\text{L}$).\n- **Reaction Temperature:** Ambient room temperature ($22^{\\circ}\\text{C}$ to $28^{\\circ}\\text{C}$), eliminating bulky thermal cyclers.\n- **Assay Time:** Under 15 minutes from sample lysis to digital readout on a handheld smartphone interface.",
    "category": "Scientific News",
    "tagLabel": "BIOTECHNOLOGY",
    "tagTone": "sky",
    "source": "QUANTA Bio-Health Research",
    "readTime": "4 min read",
    "date": "Oct 29, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://www.nature.com/biomed/"
  },
  {
    "id": "exp-polariton-halide-lasers",
    "title": "Bose-Einstein Condensation of Exciton-Polaritons in Perovskite Optical Microcavities",
    "summary": "Strong light-matter coupling in 2D cesium lead bromide microcavities achieves non-equilibrium polariton condensation at room temperature, unlocking thresholdless coherent on-chip light sources.",
    "content": "# Polariton Condensation in 2D Halide Perovskite Microcavities\n\n## 1. Strong Light-Matter Coupling Regimes\nWhen an optical cavity resonance is tuned to the excitonic transition of a semiconductor with sufficient oscillator strength, the energy exchange between photons and excitons exceeds their respective dissipation rates. The system enters the **strong coupling regime**:\n- The eigenstates of the Hamiltonian are no longer pure photons or excitons, but hybrid bosonic quasiparticles termed **exciton-polaritons**.\n- Polaritons inherit an effective mass $10^4$ to $10^5$ times lighter than free electrons from their photonic component, while retaining particle-particle interaction from their excitonic dipole.\n\n## 2. Room-Temperature Condensation Dynamics\nBecause the critical temperature for Bose-Einstein condensation scales inversely with effective mass:\n$$T_c \\propto \\frac{\\hbar^2}{m^* k_B} n^{2/3}$$\nThe ultra-light mass of polaritons elevates condensation thresholds from sub-Kelvin helium temperatures directly to room temperature ($300\\text{ K}$) in high-binding-energy materials such as $\\text{CsPbBr}_3$ perovskites.\n\n> **Observation:** Above threshold optical pump fluences, polaritons spontaneously condense into the ground state ($k_\\parallel = 0$), emitting directional, monochromatic coherent laser light with negligible population inversion requirements.\n\n## 3. Potential for Integrated Quantum Photonic Circuits\nThese devices enable ultra-low-energy optical switches, optical logic gates operating at terahertz frequencies, and on-chip topological simulators.",
    "category": "Scientific News",
    "tagLabel": "QUANTUM PHOTONICS",
    "tagTone": "indigo",
    "source": "Physical Review Letters · Condensed Matter",
    "readTime": "6 min read",
    "date": "Oct 27, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Published",
    "externalUrl": "https://journals.aps.org/prl/"
  },
  {
    "id": "exp-jwst-exoplanet-coronagraphy",
    "title": "Atmospheric Methane & Carbon Isotopes in Directly Imaged Exoplanets with JWST NIRCam",
    "summary": "High-contrast coronagraphic spectroscopy detects pristine methane and carbon-13 depletion in a young gas giant 120 parsecs away, constraining volatile inheritance during disk runaway accretion.",
    "content": "# Direct Coronagraphic Imaging of Exoplanetary Atmospheres with JWST\n\n## 1. Disentangling Planetary Light from Stellar Glare\nDirectly detecting radiation from young gas giant exoplanets requires overcoming extreme contrast ratios—host stars typically shine $10^4$ to $10^6$ times brighter than their planetary companions at infrared wavelengths.\n\nThe James Webb Space Telescope NIRCam coronagraph utilizes Lyot masks and continuous wavefront sensing to null stellar diffraction rings, achieving raw contrasts of $10^{-5}$ at inner working angles of $0.4\\text{ arcseconds}$.\n\n## 2. Spectroscopic Signatures and Atmospheric Composition\nHigh-precision spectroscopy between $3.0\\text{ }\\mu\\text{m}$ and $5.0\\text{ }\\mu\\text{m}$ has resolved molecular bands with unprecedented signal-to-noise:\n- **Methane ($\\text{CH}_4$):** Clear absorption dips at $3.3\\text{ }\\mu\\text{m}$ rule out extreme disequilibrium chemistry and vertical convective quench zones.\n- **Carbon Monoxide ($\\text{CO}$) & Water Vapor ($\\text{H}_2\\text{O}$):** Carbon-to-oxygen ($C/O$) ratios measured at $0.58 \\pm 0.04$, indicating formation beyond the circumstellar water-ice snowline.\n- **Isotopic Ratios ($^{12}\\text{C}/^{13}\\text{C}$):** Elevated $^{12}\\text{C}$ suggests pebble accretion from pristine outer disk reservoirs.\n\n## 3. Implications for Giant Planet Migration\nComparing atmospheric metallicity across planetary mass regimes provides definitive test constraints against core accretion versus gravitational disk instability models.",
    "category": "Scientific News",
    "tagLabel": "ASTROPHYSICS",
    "tagTone": "amber",
    "source": "NASA Exoplanet Exploration & Nature Astronomy",
    "readTime": "7 min read",
    "date": "Oct 24, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Published",
    "externalUrl": "https://science.nasa.gov/mission/webb/"
  },
  {
    "id": "exp-swarm-robotics-consensus",
    "title": "Decentralized Byzantine Consensus in Autonomous Aerial Robot Swarms via Asynchronous Gossip",
    "summary": "Self-organizing micro-UAV swarms coordinate trajectory collision avoidance without centralized base-station telecommand, guaranteeing mission resilience under active jamming and GPS blackout.",
    "content": "# Decentralized Swarm Consensus in GPS-Denied Environments\n\n## 1. Overcoming the Single-Point-of-Failure Vulnerability\nTraditional multi-agent drone fleets depend on a central ground control station (GCS) to broadcast waypoint trajectories and arbitrate flight path conflicts. In contested or obstacle-dense environments (such as search-and-rescue operations inside collapsed structures or dense canopies), centralized radio links suffer packet dropouts, multi-path fading, and latency spikes.\n\n## 2. Asynchronous Consensus & Collision Avoidance Protocols\nBy implementing an asynchronous Byzantine-resilient consensus algorithm, every UAV in the swarm exchanges state updates solely with immediate optical and Ultra-Wideband (UWB) mesh neighbors:\n- **Local Spatial Hash Grid:** Agents broadcast relative position covariance ellipsoids.\n- **Distributed Quadratic Programming (DQP):** Each drone locally solves reciprocal velocity obstacles (RVO) while maintaining topological swarm formation cohesion.\n- **Fault Tolerance:** The swarm dynamically isolates unresponsive or compromised nodes without aborting the overarching mission objective.\n\n```python\n# Example Decentralized Swarm Velocity Consensus Kernel\ndef compute_reciprocal_obstacle_avoidance(agent_state, neighbors):\n    optimal_velocity = agent_state.preferred_velocity\n    for neighbor in neighbors:\n        relative_pos = neighbor.pos - agent_state.pos\n        relative_vel = agent_state.vel - neighbor.vel\n        # Truncate velocity cone intersection\n        if inside_velocity_obstacle(relative_pos, relative_vel, safety_margin=0.8):\n            optimal_velocity = project_outside_cone(optimal_velocity, relative_pos)\n    return optimal_velocity\n```\n\n## 3. Field Trials and Real-Time Latencies\nHardware experiments utilizing sub-250g quadrotors with on-board neuromorphic vision sensors demonstrate collision-free formation flights at speeds up to $6.5\\text{ m/s}$ with inter-agent communication delays under $8\\text{ ms}$.",
    "category": "Opportunities",
    "tagLabel": "ROBOTICS & EMBEDDED AI",
    "tagTone": "sky",
    "source": "IEEE Transactions on Robotics",
    "readTime": "5 min read",
    "date": "Oct 21, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Published",
    "externalUrl": "https://ieeexplore.ieee.org/"
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
  emailVerificationEnabled: true,
  zerobounceApiKey1: "",
  zerobounceApiKey2: "",
  abstractApiKey1: "",
  abstractApiKey2: "",
};
