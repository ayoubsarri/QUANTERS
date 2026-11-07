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
  avatarUrl: "",
  bio: "",
  major: "Computer Science (Informatique Générale)",
  university: "University of Algiers 1",
  academicYear: "L3",
  tenure: "Guest Session",
  yearsInClub: 0,
  clubJoinYear: 2026,
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
  yearsInClub: 2,
  clubJoinYear: 2024,
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
  avatarUrl: "",
};

// Transactional collections for production launch: Super Admin ONLY
export const SEED_MEMBERS: Member[] = [SUPER_ADMIN_MEMBER];

// Authentic QUANTA Workshops & Scientific Labs
export const SEED_WORKSHOPS: Workshop[] = [
  {
    id: "ws-timimoun-media-lab-2026",
    title: "Timimoun Film & Media Lab: Field Cinematography, Sound Engineering & Short-Form Storytelling",
    activityType: "Workshop",
    category: "Scientific",
    iconType: "audiovisual",
    level: "Intermediate",
    instructor: "TISFF Masterclass Mentors & QUANTA Media Guild",
    dateLabel: "Thu, 05 Nov 2026",
    timeRange: "10:00 - 18:00",
    eventDate: "2026-11-05",
    planningOpenDate: "2026-11-01",
    startTime: "10:00",
    endTime: "18:00",
    location: "Gourara Cultural Palace & Hotel Gourara, Timimoun, Algeria",
    capacity: 50,
    seatsLeft: 18,
    xpReward: 45,
    status: "Published",
    description: "Field masterclass session organized in coordination with the 2nd Edition of the Timimoun International Short Film Festival. Covers natural lighting cinematography, desert wind acoustic audio capture, and mobile Ciné-Pocket short editing.",
    objectives: [
      "Master multi-track desert audio recording and wind suppression acoustics.",
      "Direct actors in high-contrast natural Saharan lighting.",
      "Participate in the Anis Djaad Gourara Lab script breakdown.",
      "Produce an ultra-short film entry for the Ciné-Pocket competition."
    ],
    materials: [
      "Digital cinema cameras / smartphones",
      "Directional shotgun microphones & deadcats",
      "Storyboarding notebooks",
      "Portable neutral density (ND) filters"
    ],
    liveQrToken: "live-qr-timimoun-2026",
    liveSixDigitCode: "514206",
    registeredMemberIds: [],
    waitlistMemberIds: [],
    attendanceRecords: []
  }
];
export const SEED_BADGES: Badge[] = [];
export const SEED_EXAMS: BadgeExam[] = [];
export const SEED_TASKS: ClubTask[] = [];
export const SEED_LEDGER: PointsLedgerEntry[] = [];
export const SEED_MESSAGES: ClubMessage[] = [
{
  "id": "msg-quiz-launch-1794071237331",
  "senderLabel": "QUANTA Administration",
  "senderRole": "Executive",
  "recipientScope": "All Members",
  "priority": "Official notice",
  "title": "⚡ تحديات اليوم العلمية الميسرة (+10 XP) متاحة الآن لجميع الأعضاء!",
  "body": "تحية علمية طيبة لجميع أعضاء نادي كوانتا،\n\nيسر إدارة النادي الإعلان عن إطلاق حزمة التحديات اليومية الجديدة لليوم (07 نوفمبر 2026) بنظام مكافآت مضاعف يمنح 10 نقاط خبرة (+10 XP) لكل إجابة صحيحة!\n\nلقد صُممت أسئلة اليوم لتكون ميسرة، تثقيفية وتفاعلية، وتغطي ركائز الحوسبة والعلوم الأساسية (أدوات Git، بايثون، الويب، الذكاء الاصطناعي، الأمن السيبراني، الفلك، وعتاد الحواسيب) بهدف إتاحة الفرصة لجميع الأعضاء بمختلف مستوياتهم لجمع النقاط وترقية تصنيفاتهم في النادي.\n\nكما نلفت انتباهكم لنشر مقال علمي وتقني متميز في قسم الاستكشاف بعنوان:\n\"The Essential Developer & AI Builder Arsenal: Top 10 High-Impact GitHub Repositories\"\nيستعرض أهم 10 مستودعات برمجية لا غنى عنها لكل مطور وباحث.\n\nسارعوا بدخول قسم الاستكشاف (Explore) والإجابة على التحديات الآن!",
  "timeAgo": "Just now",
  "unread": true,
  "archived": false,
  "channels": {
    "inApp": true,
    "email": false
  },
  "readMemberIds": [],
  "stats": {
    "totalRecipients": 25,
    "inAppReadCount": 0,
    "emailSentCount": 0,
    "emailFailedCount": 0
  },
  "actionLink": "/explore"
}
];
export const SEED_PROPOSALS: Proposal[] = [];
export const SEED_PROJECT_SUBMISSIONS: ProjectSubmission[] = [];
export const SEED_INVITATIONS: Invitation[] = [];
export const SEED_ACCESS_GRANTS: AccessGrant[] = [];
export const SEED_AUDIT_LOGS: AuditLogEntry[] = [];
export const SEED_DAILY_QUIZZES: DailyQuizItem[] = [
  {
    "id": "quiz-easy-git-01",
    "domain": "أدوات التطوير والبرمجيات الحرة (Git)",
    "icon": "git-open-source",
    "question": "ما هو الأمر البرمجي الأساسي في أداة Git المستخدم لتحميل نسخة من مستودع بعيد من GitHub إلى جهازك المحلي لأول مرة؟",
    "options": [
      {
        "id": "a",
        "label": "git clone <url>"
      },
      {
        "id": "b",
        "label": "git push origin main"
      },
      {
        "id": "c",
        "label": "git merge --abort"
      },
      {
        "id": "d",
        "label": "git delete repository"
      }
    ],
    "correctId": "a",
    "verdictTitle": "استنساخ المستودعات البرمجية باستخدام Git Clone",
    "explanation": "يُستخدم الأمر `git clone` لتحميل كامل تاريخ وملفات المستودع البعيد من منصات مثل GitHub إلى المجلد المحلي على جهاز المطور، بينما يُستخدم `git push` لرفع التعديلات المحلية.",
    "xpReward": 10,
    "dateLabel": "2026-11-07",
    "isPinnedToday": true,
    "active": true
  },
  {
    "id": "quiz-easy-python-02",
    "domain": "أساسيات لغة بايثون (Python)",
    "icon": "python",
    "question": "في لغة البرمجة بايثون (Python)، أي من أنواع البيانات التالية يعتبر غير قابل للتعديل بعد إنشائه (Immutable)؟",
    "options": [
      {
        "id": "a",
        "label": "الصف أو المجموعة الثابتة (Tuple)"
      },
      {
        "id": "b",
        "label": "القائمة (List)"
      },
      {
        "id": "c",
        "label": "القاموس (Dictionary)"
      },
      {
        "id": "d",
        "label": "المجموعة القابلة للتعديل (Set)"
      }
    ],
    "correctId": "a",
    "verdictTitle": "خاصية الثبات (Immutability) في لغة Python",
    "explanation": "في بايثون، تعتبر كائنات الـ `tuple` غير قابلة للتعديل (Immutable) بعد إنشائها، بينما القوائم `list` والقواميس `dict` والمجموعات `set` كائنات مرنة قابلة للتعديل والإضافة والحذف في الذاكرة.",
    "xpReward": 10,
    "dateLabel": "2026-11-07",
    "isPinnedToday": true,
    "active": true
  },
  {
    "id": "quiz-easy-web-03",
    "domain": "تطوير الويب والواجهات (Web Dev)",
    "icon": "web-dev",
    "question": "ما هي لغة الترميز الأساسية المستخدمة لبناء وتحديد هيكل وصفحات الويب (Web Pages) في المتصفح؟",
    "options": [
      {
        "id": "a",
        "label": "HTML (HyperText Markup Language)"
      },
      {
        "id": "b",
        "label": "CSS (Cascading Style Sheets)"
      },
      {
        "id": "c",
        "label": "SQL (Structured Query Language)"
      },
      {
        "id": "d",
        "label": "Docker Engine"
      }
    ],
    "correctId": "a",
    "verdictTitle": "هيكلية الويب القياسية بواسطة HTML",
    "explanation": "تعتبر HTML لغة الترميز القياسية التي تبني الهيكل الأساسي لمحتوى صفحات الويب وعناصرها، بينما تتولى لغة CSS تنسيق المظهر والألوان، ولغة JavaScript التفاعل والمنطق الديناميكي.",
    "xpReward": 10,
    "dateLabel": "2026-11-07",
    "isPinnedToday": true,
    "active": true
  },
  {
    "id": "quiz-easy-ai-04",
    "domain": "أساسيات الذكاء الاصطناعي (AI & ML)",
    "icon": "ai-ml",
    "question": "في تعلم الآلة (Machine Learning)، ما هو المصطلح الذي يطلق على مرحلة تعديل أوزان النموذج الإحصائي ليتعلم من البيانات المدخلة؟",
    "options": [
      {
        "id": "a",
        "label": "مرحلة التدريب (Model Training)"
      },
      {
        "id": "b",
        "label": "مرحلة الحذف التلقائي (Model Deletion)"
      },
      {
        "id": "c",
        "label": "فك الضغط الأرشيفي (Decompression)"
      },
      {
        "id": "d",
        "label": "إيقاف التشغيل الكامل (System Shutdown)"
      }
    ],
    "correctId": "a",
    "verdictTitle": "مرحلة تدريب النماذج في الذكاء الاصطناعي",
    "explanation": "مرحلة التدريب (Training) هي العملية التي يمر فيها النموذج على بيانات التدريب لتعديل الأوزان الرياضية (Weights & Biases) بهدف تقليل دالة الخسارة (Loss Function) وزيادة دقة التنبؤ.",
    "xpReward": 10,
    "dateLabel": "2026-11-07",
    "isPinnedToday": true,
    "active": true
  },
  {
    "id": "quiz-easy-security-05",
    "domain": "الأمن السيبراني والشبكات (Cybersecurity)",
    "icon": "cybersecurity",
    "question": "عند تصفح الإنترنت، ما هو البروتوكول المشفر والآمن الذي يرمز له بالقفل لضمان سرية البيانات بين المتصفح والخادم؟",
    "options": [
      {
        "id": "a",
        "label": "HTTPS (Hypertext Transfer Protocol Secure)"
      },
      {
        "id": "b",
        "label": "HTTP غير المشفر (نص واضح)"
      },
      {
        "id": "c",
        "label": "FTP القديم غير المحمي"
      },
      {
        "id": "d",
        "label": "Telnet عبر المنفذ 23"
      }
    ],
    "correctId": "a",
    "verdictTitle": "التشفير الآمن عبر بروتوكول HTTPS",
    "explanation": "يستخدم بروتوكول HTTPS طبقة تشفير أمان النقل (TLS/SSL) لتأمين وحماية البيانات الحساسة وكلمات المرور ومنع التنصت (Man-in-the-Middle) أثناء انتقال البيانات عبر الإنترنت.",
    "xpReward": 10,
    "dateLabel": "2026-11-07",
    "isPinnedToday": true,
    "active": true
  },
  {
    "id": "quiz-easy-space-06",
    "domain": "الفلك وعلوم الفضاء (Astronomy)",
    "icon": "astronomy",
    "question": "ما هو أقرب كوكب إلى الشمس في المجموعة الشمسية؟",
    "options": [
      {
        "id": "a",
        "label": "عطارد (Mercury)"
      },
      {
        "id": "b",
        "label": "المريخ (Mars)"
      },
      {
        "id": "c",
        "label": "المشتري (Jupiter)"
      },
      {
        "id": "d",
        "label": "نبتون (Neptune)"
      }
    ],
    "correctId": "a",
    "verdictTitle": "كوكب عطارد أقرب كواكب المجموعة الشمسية",
    "explanation": "عطارد هو الكوكب الأقرب للشمس بمسافة متوسطة تبلغ حوالي 58 مليون كيلومتر، وهو أيضاً أصغر كواكب المجموعة الشمسية حجماً ويكمل دورته حول الشمس في 88 يوماً أرضياً فقط.",
    "xpReward": 10,
    "dateLabel": "2026-11-07",
    "isPinnedToday": true,
    "active": true
  },
  {
    "id": "quiz-easy-hardware-07",
    "domain": "عتاد الحاسوب والأنظمة المضمنة (Hardware)",
    "icon": "circuit-design",
    "question": "ما هي الوحدة المسؤولة عن معالجة وتنفيذ الأوامر والعمليات الحسابية والمنطقية الأساسية في الحاسوب وتعتبر بمثابة عقله المدبر؟",
    "options": [
      {
        "id": "a",
        "label": "وحدة المعالجة المركزية (CPU - Central Processing Unit)"
      },
      {
        "id": "b",
        "label": "القرص الصلب الميكانيكي (Hard Disk)"
      },
      {
        "id": "c",
        "label": "كابل الطاقة الكهربائية"
      },
      {
        "id": "d",
        "label": "قارئ الأقراص الضوئية (DVD-ROM)"
      }
    ],
    "correctId": "a",
    "verdictTitle": "وحدة المعالجة المركزية CPU",
    "explanation": "تعتبر وحدة المعالجة المركزية (CPU) العقل المدبر للحاسوب، حيث تقوم بجلب التعليمات البرمجية من الذاكرة وفك شفرتها وتنفيذ العمليات الحسابية والمنطقية والتحكم في تدفق البيانات عبر النظام.",
    "xpReward": 10,
    "dateLabel": "2026-11-07",
    "isPinnedToday": true,
    "active": true
  }
];

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
  "id": "exp-top-10-developer-repositories-2026",
  "title": "The Essential Developer & AI Builder Arsenal: Top 10 High-Impact GitHub Repositories",
  "summary": "A curated executive selection of the most impactful open-source tools: from autonomous coding agents and visual RAG builders to local LLM engines, web crawlers, and free-tier infrastructure catalogs.",
  "content": "# The Essential Developer & AI Builder Arsenal: Top 10 High-Impact GitHub Repositories\n\n## 1. Executive Overview\nIn modern software engineering and applied AI research, developer velocity depends heavily on selecting the right open-source foundation. Rather than reinventing distributed agents, custom scraping engines, or hosting budgets, engineering teams leverage battle-tested open-source repositories to accelerate production timelines.\n\nBelow is the official curated reference guide compiled by the **QUANTA Open Source & Developer Directorate**, detailing the ten most versatile repositories every student, software engineer, and researcher in the club should bookmark and leverage.\n\n---\n\n## 2. Core Repository Reference Matrix\n\n| Repository | What it does | Useful for |\n|:---|:---|:---|\n| [**OpenHands**](https://github.com/OpenHands/OpenHands) | A workspace for coding agents that can write code, run tests, fix errors, and automate development tasks. | **AI-assisted software development** |\n| [**Langflow**](https://github.com/langflow-ai/langflow) | A visual builder for AI agents and workflows. Supports RAG—answering questions using your documents—and publishing workflows through API or MCP. | **Building chatbots and AI workflows** |\n| [**Ollama**](https://github.com/ollama/ollama) | Runs supported language models locally and provides an API for your applications. Models need separate downloads. | **Local AI and experimenting without per-request API fees** |\n| [**Free-for-dev**](https://github.com/ripienaar/free-for-dev) | A directory of developer services offering free tiers, including hosting, databases, authentication, and APIs. | **Finding services for a low-budget project** |\n| [**Scrapling**](https://github.com/D4Vinci/Scrapling) | A Python framework for fetching webpages, extracting information, and building web crawlers. | **Collecting website data** |\n| [**Awesome**](https://github.com/sindresorhus/awesome) | A large directory of curated resource lists covering programming, science, design, and many other subjects. | **Discovering tools and learning resources** |\n| [**Awesome LLM Apps**](https://github.com/Shubhamsaboo/awesome-llm-apps) | A collection of example AI agents, skills, and RAG applications with source code. Individual examples may require paid APIs. | **Learning from working examples and adapting them** |\n| [**Open Design**](https://github.com/nexu-io/open-design) | An open-source AI design workspace for prototypes, websites, presentations, and other creative work. | **Combining design work with AI agents** |\n| [**Awesome MCP Servers**](https://github.com/punkpeye/awesome-mcp-servers) | A directory of MCP servers: connectors that let compatible AI assistants interact with tools and data sources. | **Finding integrations for AI assistants** |\n| [**Public APIs**](https://github.com/public-apis/public-apis) | A categorized directory of public APIs. Authentication requirements, free allowances, and restrictions vary by service. | **Finding data and services for an app** |\n\n---\n\n## 3. Deep-Dive: Strategic Tool Categorization\n\n### I. Autonomous AI & Local Execution\n- **OpenHands (`OpenHands/OpenHands`):** Provides a sandboxed runtime environment (with Docker isolation) where autonomous agents interact directly with bash terminals, file trees, and git commits. Ideal for automated testing and refactoring pipelines.\n- **Langflow (`langflow-ai/langflow`):** A node-based visual drag-and-drop workspace for LangChain and LlamaIndex architectures. Enables rapid prototyping of multi-turn conversational agents with Retrieval-Augmented Generation (RAG) and instant MCP tool publishing.\n- **Ollama (`ollama/ollama`):** Bundles Llama 3, Qwen 2.5, DeepSeek, and Mistral models into a single native binary command. Exposes an OpenAI-compatible REST endpoint on localhost (`http://localhost:11434`), eliminating API token expenditure during local research and development.\n\n### II. Infrastructure on a Zero-Dollar Budget\n- **Free-for-dev (`ripienaar/free-for-dev`):** The gold standard catalog for student and indie projects. Covers free tiers across cloud hosting (Vercel, Cloudflare, Netlify), managed PostgreSQL/Redis databases (Supabase, Neon, Upstash), and serverless auth providers.\n- **Public APIs (`public-apis/public-apis`):** A comprehensive categorized directory of free REST endpoints spanning astronomy, weather, finance, biology, translation, and open government data.\n\n### III. Data Harvesting & Web Automation\n- **Scrapling (`D4Vinci/Scrapling`):** A modern, high-speed Python web extraction framework that handles dynamic JavaScript rendering, anti-scraping bypasses, and CSS/XPath querying with minimal memory overhead.\n\n### IV. Agent Tooling & Knowledge Hubs\n- **Awesome MCP Servers (`punkpeye/awesome-mcp-servers`):** Curated directory of Model Context Protocol (MCP) servers connecting LLM coding assistants to GitHub, PostgreSQL, Docker, Figma, and local filesystems.\n- **Awesome LLM Apps (`Shubhamsaboo/awesome-llm-apps`):** End-to-end reference implementations of autonomous AI researchers, legal assistants, coding agents, and multimodal vision analyzers.\n- **Open Design (`nexu-io/open-design`):** Open-source canvas workspace connecting visual design workflows with generative agents.\n\n---\n\n## 4. Recommendations for QUANTA Hackathons & Research\nQUANTA members participating in upcoming university hackathons, graduation projects (PFE), or club workshops are strongly advised to leverage **Free-for-dev** and **Ollama** to eliminate hosting costs, and deploy **Langflow** or **OpenHands** for rapid AI feature integration.",
  "category": "Scientific News",
  "tagLabel": "DEVELOPER TOOLS",
  "tagTone": "cyan",
  "source": "QUANTA Open Source & Developer Office",
  "readTime": "6 min read",
  "date": "Nov 07, 2026",
  "imageUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  "featuredInCarousel": true,
  "status": "Published"
},
{
    "id": "exp-vllm-pagedattention-breakdown",
    "title": "vLLM Deep Dive: Architecture of PagedAttention, KV Cache Virtualization & High-Throughput LLM Serving",
    "summary": "A comprehensive architectural breakdown of vLLM (vllm-project/vllm): solving memory fragmentation via OS-inspired virtual memory paging, continuous batching, and deploying quantized 8B–14B models on QUANTA hardware.",
    "content": "# vLLM Deep Dive: Architecture of PagedAttention & High-Throughput LLM Serving\n\n## 1. The Bottleneck: The KV Cache Memory Crisis\nIn autoregressive Large Language Model (LLM) inference, generating each token requires computing Key and Value tensors for all previous tokens in the sequence. In naive HuggingFace Transformers implementations:\n- Key and Value tensors must reside in contiguous physical VRAM allocations.\n- Memory must be pre-allocated for the maximum anticipated sequence length (e.g., 4096 or 8192 tokens) before generation begins.\n- As a result, **60% to 80% of GPU memory is lost to fragmentation and over-allocation**, capping concurrency at low single-digit requests even on enterprise GPUs.\n\n## 2. PagedAttention: OS Virtual Memory Applied to Transformers\nDeveloped by researchers at UC Berkeley and open-sourced in **vLLM** (`vllm-project/vllm`), **PagedAttention** introduces a paradigm shift directly inspired by virtual memory paging in operating systems:\n\n- **Logical to Physical Block Mapping:** Instead of allocating contiguous VRAM, KV cache tensors are partitioned into fixed-size blocks (e.g., 16 or 32 tokens per block).\n- **Block Table Architecture:** A lightweight centralized scheduler maintains a dynamic block table mapping logical token sequences to arbitrary non-contiguous physical memory blocks across VRAM.\n- **Near-Zero Memory Waste:** Memory fragmentation is reduced from >60% down to under **4%**, bounded strictly by the final incomplete block of a sequence.\n\n```\nLogical Tokens:   [Token 0-15]  -> Block Table -> [Physical Block #42 in VRAM]\n                  [Token 16-31] -> Block Table -> [Physical Block #07 in VRAM]\n```\n\n## 3. Continuous Batching & Iteration-Level Scheduling\nTraditional inference runtimes rely on *static batching*: requests in a batch wait until the longest sequence completes generation before new requests are admitted.\n\nvLLM implements **continuous (iteration-level) batching**:\n1. At every single forward pass (iteration), the scheduler dynamically evacuates completed sequences.\n2. New incoming requests are spliced immediately into the active matrix multiplication batch.\n3. This eliminates idle compute bubbles, driving hardware utilization from ~20% up to >85%.\n\n| Metric | Vanilla HuggingFace TGI | vLLM (PagedAttention) | Improvement |\n|---|---|---|---|\n| **Memory Fragmentation** | 60% – 80% | **< 4%** | **15x – 20x reduction** |\n| **Serving Throughput** | 120 – 180 tokens/sec | **550 – 850 tokens/sec** | **3.5x – 4.5x faster** |\n| **Concurrent Requests (24GB VRAM)** | 2 – 4 parallel streams | **18 – 32 parallel streams** | **8x concurrency** |\n| **Prefix Caching Latency** | Full recompute | **O(1) hash lookup** | **Zero TTFT penalty** |\n\n## 4. QUANTA Lab Deployment Guide\nQUANTA members can deploy high-throughput local models on university and club workstations using the following optimized setup:\n\n```bash\n# 1. Install vLLM with CUDA acceleration\npip install vllm\n\n# 2. Launch production OpenAI-compatible API server with AWQ 4-bit quantization\npython -m vllm.entrypoints.openai.api_server \\\n    --model Qwen/Qwen2.5-Coder-7B-Instruct-AWQ \\\n    --quantization awq \\\n    --gpu-memory-utilization 0.90 \\\n    --max-model-len 8192 \\\n    --port 8000\n```\n\nQUANTA AI & Software Engineering members can consume this endpoint directly across local code assistants, autonomous agent workflows, and hackathon prototypes.",
    "category": "Scientific News",
    "tagLabel": "GITHUB BREAKDOWN",
    "tagTone": "cyan",
    "source": "GitHub Engineering (vllm-project/vllm)",
    "readTime": "6 min read",
    "date": "Nov 06, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Archived"
  },
  {
    "id": "exp-gnome-materials-deepmind",
    "title": "GNoME & Autonomous Robotic Synthesis: DeepMind’s Discovery of 2.2M Crystals and the A-Lab Paradigm",
    "summary": "How Google DeepMind's Graph Networks for Materials Exploration (GNoME) expanded known stable crystalline structures by an order of magnitude, paired with Berkeley’s A-Lab autonomous robotic solid-state synthesis.",
    "content": "# GNoME & Autonomous Robotic Synthesis: Scaling Materials Discovery\n\n## 1. Expanding the Known Crystal Universe by 10x\nFor centuries, humanity cataloged approximately **20,000 experimentally verified stable inorganic crystalline structures** (recorded in the ICSD). Discovering a single novel functional material typically required months of trial-and-error solid-state synthesis and density functional theory (DFT) simulations.\n\nGoogle DeepMind’s **GNoME (Graph Networks for Materials Exploration)** published in *Nature* shattered this ceiling by predicting:\n- **2.2 million novel crystalline structures**.\n- **380,000 thermodynamically stable materials** lying directly on the convex hull of stability ($\\Delta E_{\\text{hull}} \\le 0 \\text{ meV/atom}$).\n- Expanding the cumulative sum of human crystal knowledge by an order of magnitude in a single computational campaign.\n\n## 2. Equivariant Graph Neural Networks (EGNN)\nGNoME operates on message-passing graph neural networks that respect Euclidean SE(3) symmetries (rotation, translation, and reflection invariance):\n- **Nodes** represent atoms parameterized by nuclear charge, valence states, and fractional coordinates.\n- **Edges** represent interatomic distances and chemical bonds up to a radial cutoff.\n- The model recursively refines structural geometries through active learning, validating candidate structures via high-throughput DFT relaxation until total ground-state energy converges.\n\n$\\mathbf{h}_i^{(l+1)} = \\phi_v \\left( \\mathbf{h}_i^{(l)}, \\sum_{j \\in \\mathcal{N}(i)} \\phi_e (\\mathbf{h}_i^{(l)}, \\mathbf{h}_j^{(l)}, \\| \\mathbf{r}_i - \\mathbf{r}_j \\|^2) \\right)$\n\n## 3. The A-Lab: Closed-Loop Autonomous Robotic Synthesis\nPredicting stability computationally is only half the battle. To validate physical reality, Berkeley Lab developed the **A-Lab**: an autonomous, robotic dry-lab facility driven by AI:\n1. **Robotic Powder Dispensing:** Automated robotic arms mill and measure stoichiometric precursor powders.\n2. **Furnace Heating Schedules:** Autonomous control of calcination and sintering ramps under controlled atmospheric environments.\n3. **In-Situ Powder X-Ray Diffraction (PXRD):** Robotic sample loaders scan the resulting ceramic pellets and run automated Rietveld phase refinement.\n4. **Active Learning Feedback Loop:** If impurities or unreacted precursors are detected, the system modifies chemical pathways in real time without human intervention.\n\n> In its inaugural 17-day autonomous campaign, the A-Lab successfully synthesized **41 novel out of 58 target inorganic compounds**—a success rate exceeding **71%**.\n\n## 4. Strategic Impact for QUANTA Physics & Materials\nThis paradigm opens transformative opportunities for solid-state battery electrolytes (superionic Li/Na conductors), high-temperature superconductors, and advanced thermoelectric harvesters. QUANTA members in Physics and Chemistry can leverage open-source crystallographic databases (Materials Project, OPTIMADE, COD) to simulate these candidate phases using club computing resources.",
    "category": "Scientific News",
    "tagLabel": "FRONTIER SCIENCE",
    "tagTone": "indigo",
    "source": "Nature (Materials Science & AI)",
    "readTime": "7 min read",
    "date": "Nov 06, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published"
  },
  {
    "id": "exp-agentic-pair-programming-paradigm",
    "title": "The Agentic Pair-Programming Paradigm: Typed TDD, Subagent Sandboxing & Zero-Hallucination Engineering",
    "summary": "Moving past naive chat prompts: how modern software engineers build production systems using deterministic type contracts, Red-Green-Refactor test loops, and autonomous subagent delegation.",
    "content": "# The Agentic Pair-Programming Paradigm: Typed TDD & Deterministic Agentic Engineering\n\n## 1. The Post-Chat Era in Software Engineering\nThe era of pasting code blocks into conversational web chatbots and hoping for the best is officially obsolete. In professional engineering environments, non-deterministic AI generation without architectural guardrails leads to:\n- Subtle state mutations and silent security regressions.\n- Hallucinated APIs that pass visual inspection but fail in runtime edge cases.\n- Massive technical debt and compounding architectural drift.\n\nThe **Agentic Pair-Programming Paradigm** treats autonomous AI agents not as oracle answer-generators, but as **high-velocity execution engines operating within mathematically verified constraints**.\n\n## 2. The Three Foundations of Industrial Agentic Development\n\n### I. Schema-First & Strict Type Contracts\nBefore writing a single line of business logic, define strict, immutable TypeScript interfaces, Rust structs, or Pydantic models. \n- Types are non-negotiable compile-time boundary gates.\n- When an agent works against an exhaustive type system with strict null checks, compiler feedback acts as an infallible error-correction loop.\n\n### II. Red-Green-Refactor TDD Harnesses\nNever allow an agent to write implementation code before a failing test exists:\n1. **Red Stage:** Agent writes a focused integration or unit test specifying the exact required behavior. Run test suite — verify it fails with expected assertion.\n2. **Green Stage:** Agent implements the minimal code required to satisfy the failing test.\n3. **Refactor Stage:** Clean up architecture, eliminate boilerplate, and verify zero regressions.\n\n### III. Sandboxed Specialized Subagents\nDecompose complex software challenges across isolated, specialized agents:\n- **Architect Subagent:** Analyzes dependencies, data schemas, and API contracts.\n- **Implementation Subagent:** Writes idiomatic code inside the task scope.\n- **Security & Forensic Auditor:** Audits code against OWASP Top 10, memory leaks, and authorization bypasses.\n\n## 3. The Model Context Protocol (MCP) Revolution\nBy exposing standardized RPC tools (such as database queries, git worktrees, and headless browser assertions) via **MCP (Model Context Protocol)**, agents interact directly with the real execution substrate rather than imagining system states.\n\n## 4. Action Plan for QUANTA Engineers\nAll QUANTA software teams, hackathon participants, and research developers are encouraged to implement this standard across club repositories:\n- Enforce strict typing (`strict: true` in `tsconfig.json`).\n- Adopt automated CI/CD verification gates.\n- Pair program with agentic CLI workflows to maximize cognitive leverage while preserving absolute code integrity.",
    "category": "QUANTA News",
    "tagLabel": "TECH PARADIGM",
    "tagTone": "sky",
    "source": "QUANTA IT & Tech Directorate",
    "readTime": "5 min read",
    "date": "Nov 06, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published"
  },
  {
    "id": "exp-global-fellowships-grants-2027",
    "title": "Global & African Fellowships 2026/2027: GSoC Roadmap, CERN Summer Students & Indaba Research Grants",
    "summary": "Curated, high-impact research, engineering, and open-source funding opportunities for Algerian and African university students, complete with application timelines, eligibility criteria, and preparation milestones.",
    "content": "# Global & African Fellowships 2026/2027: Opportunities, Stipends & Preparation Guide\n\n## 1. Executive Summary\nOne of the core missions of **QUANTA Club** is to provide ambitious STEM and computing students with direct access to prestigious international research institutes, global open-source fellowships, and funded travel grants.\n\nBelow is the verified strategic roadmap for major 2026/2027 funding programs open to Algerian university students (Licence, Master, and Engineering cycles).\n\n---\n\n## 2. Google Summer of Code (GSoC) 2027\n**Target Audience:** Software developers, scientific computing practitioners, and open-source contributors.\n- **Stipend:** $1,500 to $3,000+ USD (adjusted by purchasing power parity for Algeria).\n- **Format:** 12 to 22 weeks of remote, 1-on-1 mentored development with global open-source foundations.\n- **Key Organizations:**\n  - **Machine Learning & AI:** *vLLM, PyTorch Ecosystem, Hugging Face, OpenVINO*.\n  - **Scientific Computing:** *NumFOCUS, SciPy, SymPy, CERN-HSF, JuliaLang*.\n  - **Systems & OS:** *Linux Foundation, Apache Software Foundation, FreeBSD, Rust Foundation*.\n- **Application Timeline:**\n  - *Dec 2026 – Jan 2027:* Select target organization, join developer IRC/Discord, resolve beginner \"good first issues\".\n  - *Feb – Mar 2027:* Official organization list announced; draft and submit a detailed 10-page technical proposal.\n  - *May 2027:* Official contributor selections announced.\n\n---\n\n## 3. CERN Summer Student Programme (Geneva, Switzerland)\n**Target Audience:** Undergraduate and Master students in Physics, Computing, Electrical, and Mechanical Engineering.\n- **Funding:** **Full travel allowance + ~90 CHF / day living allowance (~2,700 CHF / month)** covering accommodation and dining in Geneva.\n- **Duration:** 8 to 13 weeks on-site at the European Organization for Nuclear Research (LHC).\n- **Core Activities:** Hands-on scientific research with international experimental collaborations (ATLAS, CMS, ALICE, LHCb, or CERN IT Data Center).\n- **Eligibility:** Enrolled in at least 3rd year of university studies with strong academic standing and proficiency in English or French.\n- **Application Window:** Opens November 2026, deadline typically late January 2027.\n\n---\n\n## 4. Deep Learning Indaba Research Grants & Travel Awards\n**Target Audience:** African researchers, graduate students, and AI practitioners.\n- **Benefits:** Full travel grant (flights, accommodation, registration) to attend the premier annual pan-African AI conference, plus project micro-grants for outstanding research posters.\n- **Focus Areas:** NLP for African languages, computer vision for agriculture, climate modeling, and foundational machine learning theory.\n- **Application Window:** Early 2027.\n\n---\n\n## 5. QUANTA Fellowship Mentorship Office Hours\nTo maximize acceptance rates among QUANTA members, the club’s Academic & External Affairs Committee is launching dedicated support sessions:\n- **Proposal Auditing:** Peer review of GSoC draft proposals and open-source PR portfolios.\n- **Statement of Purpose (SOP) Polish:** Aligning academic narratives to CERN and international standards.\n- **Mock Interviews:** Technical and behavioral interview preparation with club alumni studying and working abroad.",
    "category": "Opportunities",
    "tagLabel": "OPPORTUNITY",
    "tagTone": "amber",
    "source": "QUANTA Academic Affairs & External Relations",
    "readTime": "6 min read",
    "date": "Nov 06, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published"
  },
  {
    id: "exp-handy-offline-stt",
    title: "Handy: Open-Source Local-First Speech-to-Text Built with Rust & Tauri",
    summary: "A privacy-first cross-platform desktop application delivering instant, offline Whisper and Parakeet speech-to-text with global push-to-talk and zero cloud dependencies.",
    content: `# Handy: Local-First, Offline Speech-to-Text with Rust & Tauri

## 1. The Architecture of Local Audio Inference
In an era where voice data is routinely routed through cloud APIs, **Handy** (\`cjpais/handy\`) presents a clean, open-source paradigm: completely offline, real-time speech transcription that never transmits audio packets off the local machine.

Built with a lightweight **Rust backend** and **Tauri (TypeScript/React)** frontend, Handy bypasses heavy Chromium/Electron runtimes to deliver near-zero memory footprint and instantaneous global response.

> *"Your voice stays entirely on your computer. Zero cloud tokens, zero latency spikes, zero privacy compromises."*

## 2. Core Technical Capabilities
- **On-Device Whisper & Parakeet Models:** Evaluates multi-lingual acoustic and language models locally, leveraging CPU SIMD and GPU hardware acceleration (Metal, DirectML, CUDA).
- **Global Push-to-Talk / Hotkey Listener:** Low-level OS hotkey hooks capture speech system-wide and automatically type/paste the recognized output into the active cursor context of any app (VS Code, Obsidian, Slack, Browser).
- **LLM Cleanup Pipeline:** Optional post-processing hooks pipe raw transcriptions into local small language models to purge filler syllables, fix punctuation, and format code snippets in real time.
- **Cross-Platform Compilation:** Native binaries for macOS, Linux, and Windows with minimal system footprint.

## 3. Engineering Benchmark Summary
| Metric | Cloud API (Whisper v3) | Handy (Local On-Device) |
|---|---|---|
| **Privacy / Data Egress** | Transmitted to 3rd party | **100% On-Device (Zero Egress)** |
| **Median Latency** | 850 – 1400 ms | **180 – 320 ms (Local Buffer)** |
| **Offline Reliability** | Requires Internet | **100% Functional Air-Gapped** |
| **RAM Footprint** | Browser dependent | **< 65 MB base (Tauri/Rust)** |

## 4. QUANTA Lab Deployment
QUANTA Computer Science & AI members can inspect the repository, build custom phonetic dictionary extensions, and benchmark execution profiles during the upcoming Systems & Rust workshop track.`,
    category: "Scientific News",
    tagLabel: "AI & OPEN SOURCE",
    tagTone: "cyan",
    source: "GitHub Open Source (cjpais/handy)",
    readTime: "4 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&q=80",
    featuredInCarousel: true,
    status: "Archived",
    externalUrl: "https://github.com/cjpais/handy"
  },
  {
    id: "exp-google-gemini-carbon",
    title: "Google Gemini 4 Carbon: Breakthrough SOTA in Cybersecurity, Agentic Coding & Reasoning",
    summary: "Debuting at #1 on the Artificial Analysis Intelligence Index with an 88.2% SEC-bench score, Google's Carbon architecture sets a new watermark for automated vulnerability discovery and long-horizon coding.",
    content: `# Google Gemini 4 Carbon: Benchmarks & Cybersecurity Evaluation

## 1. Breakthrough Across Frontier Industry Leaderboards
Google announced **Gemini 4 Carbon**, establishing top rankings across major independent AI benchmarks. Most notably, Carbon secured the **#1 overall position on the Artificial Analysis Intelligence Index (v5.0)** with an index rating of **59**, surpassing competitive frontier models in structured multi-step reasoning.

Across 17 rigorous evaluation suites, Carbon ranked first in 15 categories, marking an architectural leap in test-time compute scaling and autonomous software verification.

## 2. Quantitative Cybersecurity Performance
A defining characteristic of Carbon is its specialized capability in offensive and defensive cybersecurity evaluation:
- **SEC-bench Pro (Vulnerability Discovery):** **88.2%** success rate identifying zero-day memory corruption, logic bugs, and authorization bypasses.
- **ExploitGym (Controlled Exploit Generation):** **54.8%**, demonstrating autonomous proof-of-concept construction.
- **CWE-bench (Automated Patch Synthesis):** **71.0%**, generating verified secure patches that resolve root causes without breaking test suites.
- **Secure Code Generation:** Produces verified vulnerability-free code at more than twice the success rate of the Argon generation.

> *"Carbon was evaluated under rigorous safety guardrails through Google's Fairwind Program, partnering with cybersecurity defenders to stress-test automated vulnerability mitigation."*

## 3. Agentic Software Engineering Leaderboard
| Benchmark Suite | Metric | Gemini 4 Carbon | Prior SOTA Baseline |
|---|---|---|---|
| **Artificial Analysis Index (v5.0)** | Composite Score | **59 (#1)** | 58 |
| **Terminal-Bench 4.0** | CLI Task Execution | **64.0%** | 52.4% |
| **FrontierCode v1.1** | Complex Algorithmic Code | **51.0%** | 43.8% |
| **SEC-bench Pro** | Bug Identification | **88.2%** | 69.1% |
| **CWE-bench** | Patching Verified Fixes | **71.0%** | 56.5% |

## 4. Architectural Significance for QUANTA Researchers
The emergence of agentic models capable of multi-hour terminal workflows without state drift validates our platform's emphasis on formal verification, typed sandboxes, and automated audit logging.`,
    category: "Scientific News",
    tagLabel: "FRONTIER AI & BENCHMARKS",
    tagTone: "indigo",
    source: "Google DeepMind & Artificial Analysis",
    readTime: "5 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    featuredInCarousel: true,
    status: "Archived",
    externalUrl: "https://blog.google"
  },
  {
    id: "exp-optogenetics-senolytics-nature",
    title: "Cellular Rejuvenation & Neural Circuit Control: Optogenetics and Targeted Senolytics in Nature",
    summary: "Landmark papers published in Nature and Science showcase light-sensitive microbial channelrhodopsins restoring visual circuits, paired with selective senolytic clearing of inflammatory 'zombie' cells.",
    content: `# Cellular Rejuvenation & Precision Neural Control: 2026 Biology Milestones

## 1. Optogenetics Enters Clinical Restoration
Work recognized in contemporary biological physics has elevated **optogenetics**—the genetic insertion of light-activated algal opsins into mammalian neurons—from laboratory circuit mapping to direct therapeutic translation.

Recent clinical milestones reported in *Nature* demonstrate targeted channelrhodopsin gene therapies restoring functional contrast perception and visual evoke potentials in patients with end-stage retinal degeneration. By optically pacing dormant retinal ganglion cells with micro-LED arrays, scientists achieve spatial resolution exceeding classical electrode implants by an order of magnitude.

## 2. Targeting Senescent "Zombie" Cells
Concurrently, research published in *Science* has detailed selective metabolic vulnerabilities in senescent cells—damaged cells that irreversibly arrest replication yet remain hypermetabolic, continuously secreting the destructive **Senescence-Associated Secretory Phenotype (SASP)**:
- **Targeted Proteolysis:** New senolytic conjugates selectively trigger apoptosis in $p16^{\\text{INK4a}}$-positive cells while leaving healthy somatic neighbors intact.
- **SASP Quenching:** Systemic clearance in mammalian models reduced circulating IL-6 and TNF-α, resulting in significant improvements in cardiovascular elasticity, osteogenic density, and cognitive stamina.

> *"Selective senolysis demonstrates that biological aging is not merely stochastic wear-and-tear, but an active biochemical signaling loop that can be therapeutically disrupted."*

## 3. Label-Free Live-Cell Interferometric Nanoscopy
Complementing these molecular therapies, breakthroughs in high-resolution label-free microscopy enable structural biologists to track macromolecular viral capsid self-assembly in real time. By measuring refractive index gradients rather than relying on phototoxic fluorescent dyes, scientists observed spontaneous trial-and-error pentameric clustering across living cell membranes without perturbing thermodynamic equilibrium.`,
    category: "Scientific News",
    tagLabel: "BIOLOGY & MEDICINE",
    tagTone: "sky",
    source: "Nature & Science Research Portals",
    readTime: "5 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&q=80",
    featuredInCarousel: true,
    status: "Archived",
    externalUrl: "https://www.nature.com"
  },
  {
    id: "exp-timimoun-short-film-festival-2026",
    title: "Timimoun International Short Film Festival 2026 (2nd Edition): Cinema, Gourara Lab & Media Masterclasses",
    summary: "From November 5 to 10, the red oasis of Timimoun hosts 63 short films from 39 nations, featuring 6 professional masterclasses, the Anis Djaad script residency, and smartphone youth film awards.",
    content: `# 2nd Edition of the Timimoun International Short Film Festival (TISFF)

## 1. The Red Oasis as a Global Cinematic Stage
Taking place from **November 5 to 10, 2026**, the historic Gourara oasis of **Timimoun, Algeria**, hosts the second edition of the **Timimoun International Short Film Festival (TISFF)**. Selected from over a thousand global submissions, the festival convenes filmmakers from **39 countries** showcasing **63 selected short films**.

The official competition evaluates **37 films** across three dedicated categories:
- **Fiction Shorts:** 16 international entries exploring contemporary narratives.
- **Documentary Films:** 13 works chronicling indigenous heritage and environmental frontiers.
- **Animated Works:** 8 animated shorts, highlighted by the opening screening of Alberto Segre's *"La Question"*.

## 2. Six Professional Masterclasses for Southern Youth
In partnership with vocational training centers across southern Algerian wilayas, TISFF delivers intensive hands-on technical masterclasses:
1. **Directing Actors & Scene Choreography:** Guiding authentic performances in naturalistic settings.
2. **Desert Cinematography & Optical Lighting:** Managing extreme dynamic ranges and harsh Saharan sun without washing out skin tones.
3. **Field Sound Engineering:** Wind suppression, boom handling, and spatial acoustics in open dune environments.
4. **Cinematic Editing & Rhythm:** Pacing short-form storytelling under 15-minute runtime caps.
5. **Color Grading & Digital Imaging Technician (DIT) Pipelines.**
6. **Mobile Filmmaking (Ciné-Pocket Yamina Chouikh):** A dedicated competition empowering young local creators to shoot, cut, and premiere 5-minute films entirely on smartphones.

## 3. Gourara Lab: The Anis Djaad Residency
Dedicated to the memory of Algerian screenwriter and director Anis Djaad, the **Gourara Lab** runs alongside the festival as a national fiction incubator. Selected young writers receive one-on-one mentorship from veteran script doctors and producers, refining screenplays before pitching to regional production funds.

> *"TISFF bridges heritage architecture with cutting-edge visual technology, proving that cinematic excellence thrives at the heart of the Sahara."*`,
    category: "Events",
    tagLabel: "SAHARAN CINEMA & MEDIA",
    tagTone: "amber",
    source: "DZEvent & Timimoun Cultural Commission",
    readTime: "4 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80",
    featuredInCarousel: true,
    status: "Archived",
    externalUrl: "https://www.dzevent.com/events/timimoun-international-short-film-festival-2nd-edition-mvpy67ym"
  },
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
  onboardingAutoApprove: false,
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
