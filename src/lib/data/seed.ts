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
    "id": "quiz-2026-11-11-01",
    "domain": "الذكاء الاصطناعي ونماذج التفكير (Gemini 4 Carbon)",
    "icon": "ai-ml",
    "question": "ما هي الميزة التقنية الأبرز لنموذج Gemini 4 Carbon التي مكنته من تصدر مؤشرات التفكير البرمجي لعام 2026؟",
    "options": [
      {
        "id": "a",
        "label": "التفكير العميق والتحقق الذاتي واكتشاف الثغرات الأمنية بدقة 88.2% على SEC-bench Pro"
      },
      {
        "id": "b",
        "label": "العمل فقط كآلة حاسبة بسيطة للعمليات الحسابية المحدودة"
      },
      {
        "id": "c",
        "label": "توليد ملفات صوتية فقط دون دعم الأكواد البرمجية"
      }
    ],
    "correctId": "a",
    "verdictTitle": "ريادة Gemini 4 Carbon في التفكير البرمجي والأمن السيبراني",
    "explanation": "تصدر نموذج Gemini 4 Carbon مؤشر Artificial Analysis v5 بنتيجة 59 بفضل قدرته على التفكير المنطقي متعدد الخطوات والتحقق الذاتي من الكود وكشف الثغرات الأمنية المعقدة بنسبة 88.2%.",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": true,
    "active": true
  },
  {
    "id": "quiz-2026-11-11-02",
    "domain": "الأنظمة المستقلة والوكلاء الأذكياء (Claude Fable)",
    "icon": "cybersecurity",
    "question": "ما هي القدرة الأساسية التي تميز عائلة نماذج Claude Fable 5.2 المطورة للوكلاء البرمجيين؟",
    "options": [
      {
        "id": "a",
        "label": "العمل المستقل طويل الأمد وتنسيق الوكلاء عبر مستودعات برمجية ضخمة مع التفكير الممتد"
      },
      {
        "id": "b",
        "label": "اقتصارها على كتابة رسائل بريد إلكتروني قصيرة جداً"
      },
      {
        "id": "c",
        "label": "توقفها عن العمل بمجرد تجاوز الكود 10 أسطر"
      }
    ],
    "correctId": "a",
    "verdictTitle": "الاستقلالية طويلة الأمد لنماذج Claude Fable 5.2",
    "explanation": "صُممت عائلة Claude Fable لإنجاز المهام البرمجية والهندسية المعقدة متعددة الساعات (Long-Horizon Tasks) عبر مستودعات برمجية متعددة وتصحيح الأخطاء ذاتياً بدعم آليات التفكير التكيفي.",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-11-03",
    "domain": "إدارة النسخ والمستودعات البرمجية (Git)",
    "icon": "git-open-source",
    "question": "ما هو الأمر المختصر في Git لإنشاء فرع برمجي جديد (Branch) والانتقال إليه فوراً؟",
    "options": [
      {
        "id": "a",
        "label": "git checkout -b <branch-name>"
      },
      {
        "id": "b",
        "label": "git reset --hard"
      },
      {
        "id": "c",
        "label": "git commit -m \"delete\""
      }
    ],
    "correctId": "a",
    "verdictTitle": "إنشاء الفروع والانتقال المباشر في Git",
    "explanation": "يُستخدم الأمر `git checkout -b <branch-name>` (أو `git switch -c <branch-name>`) لإنشاء فرع عمل جديد والتبديل إليه في خطوة واحدة، مما يتيح تجربة الميزات بأمان.",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-11-04",
    "domain": "الفلك وعلوم الفضاء (Cosmology)",
    "icon": "astronomy",
    "question": "ما هو أقرب كوكب إلى الشمس في مجموعتنا الشمسية؟",
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
        "label": "نبتون (Neptune)"
      }
    ],
    "correctId": "a",
    "verdictTitle": "كوكب عطارد: الجار الأقرب لشمسنا",
    "explanation": "عطارد هو الكوكب الأقرب للشمس ويدور حولها في 88 يوماً فقط، ويتميز بفارق حراري هائل بين نهاره الحارق وليله شديد البرودة لانعدام الغلاف الجوي الكثيف.",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-11-05",
    "domain": "البيولوجيا الجزيئية وعلم الوراثة (Genetics)",
    "icon": "genetics",
    "question": "ما هو الجزيء الحيوي الحامل للتعليمات الوراثية الأساسية داخل خلايا الكائنات الحية؟",
    "options": [
      {
        "id": "a",
        "label": "حمض الديوكسي ريبونوكليك (DNA)"
      },
      {
        "id": "b",
        "label": "سكر الجلوكوز"
      },
      {
        "id": "c",
        "label": "بيكربونات الصوديوم"
      }
    ],
    "correctId": "a",
    "verdictTitle": "جزيء الـ DNA وسر الحياة الجينية",
    "explanation": "يحمل جزيء الـ DNA الشفرة الوراثية على هيئة تتابعات من القواعد النيتروجينية الأربع (A, T, C, G) المشفرة لبناء البروتينات الحيوية واستمرار الوظائف الخلوية.",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-11-06",
    "domain": "الفيزياء الكونية والثوابت الطبيعية (Physics)",
    "icon": "optics",
    "question": "كم تبلغ سرعة الضوء القصوى في الفراغ الكوني (c) تقريباً؟",
    "options": [
      {
        "id": "a",
        "label": "300,000 كيلومتر في الثانية تقريباً (3 × 10⁸ م/ث)"
      },
      {
        "id": "b",
        "label": "340 متر في الثانية فقط"
      },
      {
        "id": "c",
        "label": "1,000 كيلومتر في الساعة"
      }
    ],
    "correctId": "a",
    "verdictTitle": "سرعة الضوء: الحد الأقصى للسرعة الكونية",
    "explanation": "تبلغ سرعة الضوء في الفراغ 299,792,458 م/ث، وهي ثابت فيزيائي أساسي يمثل أقصى سرعة يمكن أن تنتقل بها المعلومات أو الطاقة في الكون وفق النسبية الخاصة.",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-11-07",
    "domain": "بيئة بايثون والبرمجيات الحرة (Python Ecosystem)",
    "icon": "python",
    "question": "ما هو مدير الحزم الافتراضي والرسمي لتثبيت المكتبات الخارجية في لغة بايثون؟",
    "options": [
      {
        "id": "a",
        "label": "pip (Pip Installs Packages)"
      },
      {
        "id": "b",
        "label": "npm"
      },
      {
        "id": "c",
        "label": "cargo"
      }
    ],
    "correctId": "a",
    "verdictTitle": "أداة pip لإدارة مكتبات بايثون",
    "explanation": "تعتبر أداة pip مدير الحزم القياسي المدمج مع بايثون، ويتيح للمطورين تثبيت وإدارة آلاف الحزم مفتوحة المصدر مباشرة من مستودع PyPI الرسمي.",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-11-08",
    "domain": "الخوارزميات وهياكل البيانات (Data Structures)",
    "icon": "mathematics",
    "question": "ما هو التعقيد الزمني (Time Complexity) للوصول إلى عنصر في مصفوفة (Array) عبر الفهرس (Index)؟",
    "options": [
      {
        "id": "a",
        "label": "O(1) - وصول لحظي ثابت"
      },
      {
        "id": "b",
        "label": "O(n) - مسح خطي بطيء"
      },
      {
        "id": "c",
        "label": "O(n²) - زمن تربيعي"
      }
    ],
    "correctId": "a",
    "verdictTitle": "الوصول المباشر O(1) في المصفوفات",
    "explanation": "تخزن المصفوفات عناصرها في خلايا ذاكرة متتالية، مما يتيح للمعالج حساب عنوان الذاكرة المباشر لأي فهرس في خطوة حسابية واحدة وثابتة O(1).",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-11-09",
    "domain": "بنية وتطوير الويب الحديث (Web Platform)",
    "icon": "web-dev",
    "question": "ما هي اللغة القياسية المستخدمة لبناء وتوصيف الهيكل الأساسي لصفحات الويب؟",
    "options": [
      {
        "id": "a",
        "label": "HTML (HyperText Markup Language)"
      },
      {
        "id": "b",
        "label": "SQL"
      },
      {
        "id": "c",
        "label": "Assembly"
      }
    ],
    "correctId": "a",
    "verdictTitle": "لغة HTML ركيزة صفحات الإنترنت",
    "explanation": "تمثل HTML لغة التوصيف القياسية العالمية التي تحدد هيكل صفحات الويب من نصوص وعناوين وصور ونماذج وروابط تشعبية.",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-11-10",
    "domain": "رسالة ورؤية نادي QUANTA العلمي",
    "icon": "leadership",
    "question": "ما هو الهدف الاستراتيجي الأسمى لنادي QUANTA العلمي في جامعة البليدة 1 والساحة الجامعية؟",
    "options": [
      {
        "id": "a",
        "label": "ترسيخ التميز العلمي والبحثي، وتمكين الطلبة تقنياً، وتطوير مشاريع وابتكارات مفتوحة المصدر"
      },
      {
        "id": "b",
        "label": "تنظيم المسابقات الترفيهية الفردية فقط دون محتوى علمي"
      },
      {
        "id": "c",
        "label": "إغلاق المعامل البحثية والورش التقنية"
      }
    ],
    "correctId": "a",
    "verdictTitle": "رسالة نادي QUANTA: المعرفة والابتكار والمجتمع",
    "explanation": "يهدف نادي كوانتا منذ انطلاقته إلى بناء مجتمع طلابي وبحثي رائد يعتمد أعلى معايير النزاهة العلمية وتطوير الحلول التقنية المبتكرة التي تخدم الوطن والمجتمع العلمي.",
    "xpReward": 2,
    "dateLabel": "2026-11-11",
    "isPinnedToday": false,
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
    "id": "exp-google-gemini-carbon",
    "title": "Google Gemini 4 Carbon: The New Benchmark Champion in Deep Reasoning, SEC-bench Pro & Agentic Coding",
    "summary": "Ranked #1 on the Artificial Analysis Intelligence Index with an 88.2% SEC-bench Pro score, Google's Gemini 4 Carbon sets a new milestone in test-time compute, long-horizon coding, and automated vulnerability verification.",
    "content": "# Google Gemini 4 Carbon: Benchmarks & Deep Reasoning Architecture\n\n## 1. Breakthrough Across Frontier Industry Leaderboards\nGoogle announced **Gemini 4 Carbon**, establishing undisputed top rankings across major independent AI benchmarks. Most notably, Carbon secured the **#1 overall position on the Artificial Analysis Intelligence Index (v5.0)** with an index rating of **59**, surpassing all competitive frontier reasoning models in structured multi-step logical deduction and test-time compute scaling.\n\nAcross 17 rigorous evaluation suites, Carbon ranked first in 15 categories, marking an architectural leap in autonomous software verification, complex symbolic mathematics, and extended context synthesis.\n\n---\n\n## 2. Quantitative Cybersecurity Performance: SEC-bench Pro\nA defining characteristic of Carbon is its specialized capability in offensive and defensive cybersecurity evaluation, tested in partnership with Google's Fairwind Defense program:\n- **SEC-bench Pro (Vulnerability Discovery):** **88.2%** success rate identifying zero-day memory corruption, logic flaws, and authorization bypasses in production C/C++, Rust, and Go codebases.\n- **ExploitGym (Controlled Exploit Generation):** **54.8%**, demonstrating autonomous proof-of-concept construction under sandboxed environments.\n- **CWE-bench (Automated Patch Synthesis):** **71.0%**, synthesizing verified secure patches that eliminate root causes without causing regression failures in adjacent test suites.\n- **Secure Code Generation:** Generates verified vulnerability-free code at more than twice the success rate of the previous Argon architecture.\n\n> *\"Carbon was evaluated under rigorous safety guardrails through Google's Fairwind Program, partnering with cybersecurity defenders to stress-test automated vulnerability mitigation and formal verification.\"*\n\n---\n\n## 3. Agentic Software Engineering Leaderboard\n| Benchmark Suite | Metric | Gemini 4 Carbon | Prior SOTA Baseline |\n|:---|:---|:---|:---|\n| **Artificial Analysis Index (v5.0)** | Composite Score | **59 (#1)** | 58 |\n| **Terminal-Bench 4.0** | CLI Task Execution | **64.0%** | 52.4% |\n| **FrontierCode v1.1** | Complex Algorithmic Code | **51.0%** | 43.8% |\n| **SEC-bench Pro** | Bug & Vuln Identification | **88.2%** | 69.1% |\n| **CWE-bench** | Patching & Verification | **71.0%** | 56.5% |\n| **CursorBench 4.0** | Multi-File Agentic Coding | **#1 Globally** | Runner-up |\n\n---\n\n## 4. Architectural Significance for QUANTA Researchers\nFor the QUANTA AI, Modeling, and Cybersecurity divisions, Gemini 4 Carbon demonstrates that test-time search and iterative code self-verification are now essential paradigms. Autonomous coding agents are no longer just completion engines—they act as rigorous pair-programmers capable of compiling, executing, and auditing entire software architectures autonomously.",
    "category": "Scientific News",
    "tagLabel": "FRONTIER AI & REASONING",
    "tagTone": "indigo",
    "source": "Google DeepMind & Artificial Analysis",
    "readTime": "5 min read",
    "date": "Nov 11, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://blog.google"
  },
  {
    "id": "exp-claude-fable-agentic-simulation",
    "title": "Claude Fable & Multi-Agent Simulations: Long-Horizon Autonomy and Generative World-Building in 2026",
    "summary": "Anthropic's Claude Fable 5.2 and Fable Studio's Showrunner platform redefine agentic computing—combining hours-long unattended codebase refactoring with persistent generative world-building.",
    "content": "# Claude Fable & Multi-Agent Simulations: Long-Horizon Autonomy and Synthetic Worlds\n\n## 1. Long-Horizon Autonomy in Claude Fable 5.2\nAnthropic's announcement of **Claude Fable 5.2** represents a critical inflection point for autonomous systems. Engineered for demanding, long-horizon technical tasks, Fable is purpose-built to operate unattended for hours—and across complex workflows, for multiple days—while checking and correcting its own intermediate execution states.\n\nGenerating outputs up to **30% faster** than its predecessor with adaptive extended thinking modes, Fable 5.2 navigates massive multi-repository architectures, manages distributed sub-agents, and solves abstract physics and hardware problems without state drift.\n\n---\n\n## 2. The Dual Frontier: Claude Fable vs. Claude Mythos\nAnthropic introduced a dual-tier model release strategy:\n- **Claude Fable 5.2:** Built with industrial-grade cyber defense and biology safeguards, making it publicly available across major cloud providers (Amazon Bedrock, Google Cloud Vertex AI) and native APIs at optimized pricing ($8/M input tokens, $40/M output tokens).\n- **Claude Mythos 5.2:** Built on the identical core frontier architecture, but reserved for verified sovereign and research institutions through specialized Life Sciences and Cyber Verification programs.\n\n> *\"Fable is targeted squarely at developers, researchers, and enterprises tackling the hardest open-ended technical challenges that push standard LLMs past their limits.\"*\n\n---\n\n## 3. Fable Studio & The Showrunner Platform (SHOW-1 Model)\nIn parallel with frontier reasoning models, **Fable Studio** (backed by Amazon's Alexa Fund) has pioneered generative multi-agent simulation through its **Showrunner** platform. Often dubbed the *\"Netflix of AI\"*, Showrunner utilizes the proprietary **SHOW-1** model to orchestrate complete episodic productions from text prompts and directorial constraints.\n\nKey innovations in SHOW-1 include:\n- **Persistent Character Canon & Worlds:** Unlike traditional video generation tools that generate disconnected clips, Showrunner maintains continuous spatial memories, narrative arcs, and character styles across full multi-season series.\n- **Dynamic \"Playable\" Media:** Viewers can branch storylines in real time, with the simulation dynamically synthesizing dialogue, voice acting, camera angles, and animations on the fly.\n- **Theatrical Milestones (*Gods Don't Give Gifts*):** Fable's sci-fi feature film, produced in collaboration with human artists and voiced by Grimes, demonstrated the viability of AI-augmented cinematic pipelines.\n\n---\n\n## 4. Synthesis: The Complementary AI Frontier of 2026\n| Dimension | Google Gemini 4 Carbon | Anthropic Claude Fable 5.2 |\n|:---|:---|:---|\n| **Core Superpower** | Test-Time Compute & Formal Code Verification | Long-Horizon Autonomy & Asynchronous Sub-Agents |\n| **Top Benchmark** | #1 Artificial Analysis Index (Score 59) | SOTA in Multi-Day Software Migration |\n| **Cybersecurity** | SEC-bench Pro 88.2% / CWE-bench 71.0% | Adaptive Extended Thinking with Guardrails |\n| **Deployment** | Antigravity AI Engine / Google Cloud | Claude Platform / Bedrock / Vertex AI |\n\n---\n\n## 5. QUANTA Workshop Integration\nMembers of the QUANTA Computer Science & Creative Tech divisions will explore Claude Fable's agentic APIs and Fable simulation patterns in our upcoming **Agentic Architectures & World-Building Masterclass**.",
    "category": "Scientific News",
    "tagLabel": "AUTONOMOUS AGENTS & SIMULATION",
    "tagTone": "cyan",
    "source": "Anthropic Frontier Research & Fable Studio",
    "readTime": "6 min read",
    "date": "Nov 11, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://anthropic.com"
  },
  {
    "id": "exp-top-10-developer-repositories-2026",
    "title": "Top 10 Essential GitHub Repositories Every Developer & AI Engineer Should Star in 2026",
    "summary": "From OpenHands and Langflow to Ollama and Scrapling: A curated, essential directory of open-source frameworks, visual builders, and developer resources accelerating AI engineering.",
    "content": "# The Essential Developer & AI Builder Arsenal: Top 10 High-Impact GitHub Repositories\n\n## 1. Executive Overview\nIn modern software engineering and applied AI research, developer velocity depends heavily on selecting the right open-source foundation. Rather than reinventing distributed agents, custom scraping engines, or hosting budgets, engineering teams leverage battle-tested open-source repositories to accelerate production timelines.\n\nBelow is the official curated reference guide compiled by the **QUANTA Open Source & Developer Directorate**, detailing the ten most versatile repositories every student, software engineer, and researcher in the club should bookmark and leverage.\n\n---\n\n## 2. Core Repository Reference Matrix\n\n| Repository | What it does | Useful for |\n|:---|:---|:---|\n| [**OpenHands**](https://github.com/OpenHands/OpenHands) | A workspace for coding agents that can write code, run tests, fix errors, and automate development tasks. | **AI-assisted software development** |\n| [**Langflow**](https://github.com/langflow-ai/langflow) | A visual builder for AI agents and workflows. Supports RAG—answering questions using your documents—and publishing workflows through API or MCP. | **Building chatbots and AI workflows** |\n| [**Ollama**](https://github.com/ollama/ollama) | Runs supported language models locally and provides an API for your applications. Models need separate downloads. | **Local AI and experimenting without per-request API fees** |\n| [**Free-for-dev**](https://github.com/ripienaar/free-for-dev) | A directory of developer services offering free tiers, including hosting, databases, authentication, and APIs. | **Finding services for a low-budget project** |\n| [**Scrapling**](https://github.com/D4Vinci/Scrapling) | A Python framework for fetching webpages, extracting information, and building web crawlers. | **Collecting website data** |\n| [**Awesome**](https://github.com/sindresorhus/awesome) | A large directory of curated resource lists covering programming, science, design, and many other subjects. | **Discovering tools and learning resources** |\n| [**Awesome LLM Apps**](https://github.com/Shubhamsaboo/awesome-llm-apps) | A collection of example AI agents, skills, and RAG applications with source code. Individual examples may require paid APIs. | **Learning from working examples and adapting them** |\n| [**Open Design**](https://github.com/nexu-io/open-design) | An open-source AI design workspace for prototypes, websites, presentations, and other creative work. | **Combining design work with AI agents** |\n| [**Awesome MCP Servers**](https://github.com/punkpeye/awesome-mcp-servers) | A directory of MCP servers: connectors that let compatible AI assistants interact with tools and data sources. | **Finding integrations for AI assistants** |\n| [**Public APIs**](https://github.com/public-apis/public-apis) | A categorized directory of public APIs. Authentication requirements, free allowances, and restrictions vary by service. | **Finding data and services for an app** |\n\n---\n\n## 3. Deep-Dive: Architectural Breakdown\n\n### A. Autonomous Coding & Visual Pipelines (OpenHands & Langflow)\n- **OpenHands:** Integrates headless container execution with agentic reasoning loops. Coding assistants can spin up Docker environments, clone repositories, run unit tests, and iteratively rewrite code until all assertions pass.\n- **Langflow:** Democratizes multi-agent orchestration by providing a drag-and-drop ReactFlow canvas. It natively exposes endpoints compatible with the Model Context Protocol (MCP), allowing visual agent pipelines to be consumed as local CLI tools.\n\n### B. Local-First AI & Web Scraping (Ollama & Scrapling)\n- **Ollama:** The de facto gold standard for running quantization-efficient LLMs (Llama 3, Mistral, DeepSeek) locally on Apple Silicon and CUDA GPUs. It delivers an OpenAI-compatible HTTP endpoint for zero-latency, private offline development.\n- **Scrapling:** A cutting-edge Python library optimized for resilient scraping. It circumvents brittle XPath and CSS selectors by utilizing adaptive element matching and anti-fingerprinting stealth headers.\n\n### C. Zero-Cost Infrastructure & Integrations (Free-for-dev & Public APIs)\n- **Free-for-dev:** For student initiatives and club hackathons, this repository catalogues hundreds of IaaS, PaaS, DBaaS, and monitoring services providing generous persistent free tiers (Cloudflare, Supabase, Vercel, Neon).\n- **Public APIs:** An exhaustive, community-maintained collection of thousands of free REST endpoints spanning astronomy, weather, biology, economics, and sports.\n\n---\n\n## 4. QUANTA Club Recommendations\nAll project teams participating in the upcoming **QUANTA Open Innovation Challenge** are strongly encouraged to integrate these repositories into their foundational architecture. Direct links are provided in the matrix above for easy cloning and bookmarking.",
    "category": "Opportunities",
    "tagLabel": "DEVELOPER TOOLS & REPOS",
    "tagTone": "sky",
    "source": "QUANTA Open Source & Developer Directorate",
    "readTime": "6 min read",
    "date": "Nov 11, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://github.com/ripienaar/free-for-dev"
  },
  {
    "id": "exp-handy-offline-stt",
    "title": "Handy: Open-Source Local-First Speech-to-Text Built with Rust & Tauri",
    "summary": "A privacy-first cross-platform desktop application delivering instant, offline Whisper and Parakeet speech-to-text with global push-to-talk and zero cloud dependencies.",
    "content": "# Handy: Local-First, Offline Speech-to-Text with Rust & Tauri\n\n## 1. The Architecture of Local Audio Inference\nIn an era where voice data is routinely routed through cloud APIs, **Handy** (`cjpais/handy`) presents a clean, open-source paradigm: completely offline, real-time speech transcription that never transmits audio packets off the local machine.\n\nBuilt with a lightweight **Rust backend** and **Tauri (TypeScript/React)** frontend, Handy bypasses heavy Chromium/Electron runtimes to deliver near-zero memory footprint and instantaneous global response.\n\n> *\"Your voice stays entirely on your computer. Zero cloud tokens, zero latency spikes, zero privacy compromises.\"*\n\n## 2. Core Technical Capabilities\n- **On-Device Whisper & Parakeet Models:** Evaluates multi-lingual acoustic and language models locally, leveraging CPU SIMD and GPU hardware acceleration (Metal, DirectML, CUDA).\n- **Global Push-to-Talk / Hotkey Listener:** Low-level OS hotkey hooks capture speech system-wide and automatically type/paste the recognized output into the active cursor context of any app (VS Code, Obsidian, Slack, Browser).\n- **LLM Cleanup Pipeline:** Optional post-processing hooks pipe raw transcriptions into local small language models to purge filler syllables, fix punctuation, and format code snippets in real time.\n- **Cross-Platform Compilation:** Native binaries for macOS, Linux, and Windows with minimal system footprint.\n\n## 3. Engineering Benchmark Summary\n| Metric | Cloud API (Whisper v3) | Handy (Local On-Device) |\n|---|---|---|\n| **Privacy / Data Egress** | Transmitted to 3rd party | **100% On-Device (Zero Egress)** |\n| **Median Latency** | 850 – 1400 ms | **180 – 320 ms (Local Buffer)** |\n| **Offline Reliability** | Requires Internet | **100% Functional Air-Gapped** |\n| **RAM Footprint** | Browser dependent | **< 65 MB base (Tauri/Rust)** |\n\n## 4. QUANTA Lab Deployment\nQUANTA Computer Science & AI members can inspect the repository, build custom phonetic dictionary extensions, and benchmark execution profiles during the upcoming Systems & Rust workshop track.",
    "category": "Scientific News",
    "tagLabel": "AI & OPEN SOURCE",
    "tagTone": "cyan",
    "source": "GitHub Open Source (cjpais/handy)",
    "readTime": "4 min read",
    "date": "Nov 04, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://github.com/cjpais/handy"
  },
  {
    "id": "exp-timimoun-short-film-festival-2026",
    "title": "Timimoun International Short Film Festival 2026 (2nd Edition): Cinema, Gourara Lab & Media Masterclasses",
    "summary": "The oasis city of Timimoun hosts its 2nd International Short Film Festival from Nov 26 to Dec 01, 2026, featuring the Gourara Media Lab and technical masterclasses for young Algerian creators.",
    "content": "# Timimoun International Short Film Festival 2026 (2nd Edition)\n\n## 1. Cultural & Cinematographic Landmark in Gourara\nThe **Timimoun International Short Film Festival** returns for its second edition from **November 26 to December 01, 2026**, transforming the red oasis of the Algerian Sahara into a focal point for international cinema, digital media production, and cultural heritage.\n\n## 2. Core Pillars of the 2026 Edition\n- **Gourara Media Lab:** Intensive incubator workshops covering scriptwriting, sound design, visual editing, and color grading.\n- **International Competition:** 35 curated short films representing over 18 countries.\n- **Algerian Heritage in 4K:** Documenting traditional khattara water architecture and vernacular earthen architecture using modern cinematography.\n\n## 3. Student Participation\nQUANTA Audiovisual & Media Directorate is coordinating with festival organizers to sponsor delegate passes for student creators interested in masterclasses on drone cinematography and documentary sound recording.",
    "category": "Events",
    "tagLabel": "CULTURE & MEDIA",
    "tagTone": "amber",
    "source": "Algerian Ministry of Culture & Arts",
    "readTime": "4 min read",
    "date": "Nov 04, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://www.m-culture.gov.dz"
  },
  {
    "id": "exp-optogenetics-senolytics-nature",
    "title": "Cellular Rejuvenation & Neural Circuit Control: Optogenetics and Targeted Senolytics in Nature",
    "summary": "Landmark papers published in Nature and Science showcase light-sensitive microbial channelrhodopsins restoring visual circuits, paired with selective senolytic clearing of inflammatory 'zombie' cells.",
    "content": "# Cellular Rejuvenation & Precision Neural Control: 2026 Biology Milestones\n\n## 1. Optogenetics Enters Clinical Restoration\nWork recognized in contemporary biological physics has elevated **optogenetics**—the genetic insertion of light-activated algal opsins into mammalian neurons—from laboratory circuit mapping to direct therapeutic translation.\n\nRecent clinical milestones reported in *Nature* demonstrate targeted channelrhodopsin gene therapies restoring functional contrast perception and visual evoke potentials in patients with end-stage retinal degeneration.\n\n## 2. Targeting Senescent \"Zombie\" Cells\nConcurrently, research published in *Science* has detailed selective metabolic vulnerabilities in senescent cells—damaged cells that irreversibly arrest replication yet remain hypermetabolic, continuously secreting the destructive **Senescence-Associated Secretory Phenotype (SASP)**.",
    "category": "Scientific News",
    "tagLabel": "BIOLOGY & MEDICINE",
    "tagTone": "sky",
    "source": "Nature & Science Research Portals",
    "readTime": "5 min read",
    "date": "Nov 04, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Published",
    "externalUrl": "https://www.nature.com"
  },
  {
    "id": "exp-global-fellowships-grants-2027",
    "title": "Global STEM Fellowships & Research Grants 2027: Application Windows Open for Algerian Students",
    "summary": "Comprehensive roadmap for fully-funded international graduate fellowships: DAAD, Chevening, Fulbright STEM, Erasmus Mundus, and CERN Summer Student Program deadlines.",
    "content": "# Global STEM Fellowships & Research Grants: 2027 Candidate Roadmap\n\n## 1. Strategic Timeline\nAlgerian undergraduate and master's students pursuing advanced research in artificial intelligence, biotechnology, quantum computing, and renewable energy can now access official application portals for major global research grants.\n\n## 2. Featured Fellowship Portfolios\n- **DAAD Research Internships in Science and Engineering (RISE):** Fully-funded 3-month research placements at leading German universities.\n- **Fulbright Science & Technology Awards:** Comprehensive graduate study funding in the United States.\n- **CERN Summer Student Programme (Geneva):** 8 to 13 weeks of hands-on experimental particle physics and computing work.\n- **Erasmus Mundus Joint Masters:** European Commission scholarships covering tuition, travel, and monthly living stipends.",
    "category": "Opportunities",
    "tagLabel": "FELLOWSHIPS & GRANTS",
    "tagTone": "sky",
    "source": "QUANTA Academic Affairs Directorate",
    "readTime": "6 min read",
    "date": "Nov 02, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Published",
    "externalUrl": "https://www.daad.de/en/"
  },
  {
    "id": "exp-neural-operators-fluids",
    "title": "Fourier Neural Operators: Zero-Shot Super-Resolution in Non-Linear Fluid Dynamics",
    "summary": "Parametrizing partial differential equations directly in infinite-dimensional function space allows Fourier Neural Operators to simulate Navier-Stokes turbulence 10,000 times faster than classical mesh solvers.",
    "category": "Scientific News",
    "tagLabel": "AI & COMPUTATIONAL PHYSICS",
    "tagTone": "cyan",
    "source": "QUANTA AI & Modeling Lab",
    "readTime": "5 min read",
    "date": "Oct 30, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
    "externalUrl": "https://arxiv.org/abs/2010.08895"
  },
  {
    "id": "exp-crispr-cas12a-diagnostics",
    "title": "CRISPR-Cas12a Electrochemical Aptasensors: Femtomolar Viral RNA Detection at Room Temperature",
    "summary": "Coupling collateral single-stranded DNA cleavage with gold nanoparticle microelectrodes yields ultra-portable, reagent-free diagnostic platforms for rapid infectious disease screening.",
    "category": "Scientific News",
    "tagLabel": "BIOMEDICAL ENGINEERING",
    "tagTone": "sky",
    "source": "QUANTA Biotechnology Division",
    "readTime": "5 min read",
    "date": "Oct 29, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
    "externalUrl": "https://www.nature.com/articles/s41587-020-00803-x"
  },
  {
    "id": "exp-polariton-halide-lasers",
    "title": "Bose-Einstein Condensation of Exciton-Polaritons in Perovskite Optical Microcavities",
    "summary": "Demonstrating macroscopic quantum phase coherence at room temperature using all-inorganic lead-halide perovskite microcrystals paves the way for ultra-low threshold polariton lasers.",
    "category": "Scientific News",
    "tagLabel": "QUANTUM OPTICS & CONDENSED MATTER",
    "tagTone": "indigo",
    "source": "QUANTA Photonics & Nanotech Lab",
    "readTime": "6 min read",
    "date": "Oct 27, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
    "externalUrl": "https://www.science.org/doi/10.1126/science.aay6662"
  },
  {
    "id": "exp-jwst-exoplanet-coronagraphy",
    "title": "Atmospheric Methane & Carbon Isotopes in Directly Imaged Exoplanets with JWST NIRCam",
    "summary": "Direct coronagraphic spectroscopy of young gas giants reveals non-equilibrium carbon chemistry and isotopic ratios constraining planet formation pathways beyond the snow line.",
    "category": "Scientific News",
    "tagLabel": "ASTROPHYSICS & EXOPLANETS",
    "tagTone": "amber",
    "source": "QUANTA Astrophysics Working Group",
    "readTime": "5 min read",
    "date": "Oct 24, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
    "externalUrl": "https://webbtelescope.org"
  },
  {
    "id": "exp-swarm-robotics-consensus",
    "title": "Decentralized Byzantine Consensus in Autonomous Aerial Robot Swarms via Asynchronous Gossip",
    "summary": "Novel distributed algorithms ensure collision-free formation flight and target tracking even when up to 30% of drones experience adversarial GPS spoofing or communication dropouts.",
    "category": "Opportunities",
    "tagLabel": "ROBOTICS & AUTONOMOUS SYSTEMS",
    "tagTone": "cyan",
    "source": "QUANTA Robotics & Control Group",
    "readTime": "5 min read",
    "date": "Oct 21, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
    "externalUrl": "https://ieeexplore.ieee.org"
  }
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
