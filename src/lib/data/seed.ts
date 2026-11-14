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
export const SEED_WORKSHOPS: Workshop[] = [];

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
    "id": "quiz-2026-11-14-01",
    "domain": "الذكاء الاصطناعي للعلوم (AI for Science)",
    "icon": "ai-ml",
    "question": "ما هو الهدف الاستراتيجي الأبرز لمنظومات 'AI for Science' الحديثة لعام 2026 في المعامل البحثية؟",
    "options": [
      {
        "id": "a",
        "label": "الاستغناء الكامل عن القوانين الفيزيائية والكيميائية المعتمدة"
      },
      {
        "id": "b",
        "label": "أتمتة صياغة الفرضيات، تسريع تصميم الجزيئات واختصار مسارات التجارب المخبرية المعقدة"
      },
      {
        "id": "c",
        "label": "توليد ملفات الفيديو الترفيهية الفردية فقط"
      },
      {
        "id": "d",
        "label": "إغلاق المعامل الجامعية وقواعد البيانات العلمية"
      }
    ],
    "correctId": "b",
    "verdictTitle": "تسريع الاكتشاف العلمي عبر وكلاء الذكاء الاصطناعي",
    "explanation": "تعتمد ثورة 'AI for Science' على وكلاء أذكياء متعددي النماذج قادرين على قراءة ملايين الأوراق البحثية، صياغة فرضيات كيميائية وفيزيائية واختبارها محاكاةً في ثوانٍ معدودة.",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
    "isPinnedToday": true,
    "active": true
  },
  {
    "id": "quiz-2026-11-14-02",
    "domain": "الحوسبة والفيزياء الكمية (Quantum Physics)",
    "icon": "quantum",
    "question": "ما هي الظاهرة الفيزيائية الكمية التي تتيح للبت الكمي (Qubit) التواجد في حالتي 0 و 1 معاً في نفس اللحظة؟",
    "options": [
      {
        "id": "a",
        "label": "الانكسار الضوئي الكلاسيكي"
      },
      {
        "id": "b",
        "label": "التوصيل الحراري المباشر"
      },
      {
        "id": "c",
        "label": "الاحتكاك الكهرومغناطيسي السطحي"
      },
      {
        "id": "d",
        "label": "التراكب الكمي (Quantum Superposition)"
      }
    ],
    "correctId": "d",
    "verdictTitle": "التراكب الكمي: قوة المعالجة الخارقة",
    "explanation": "تتيح خاصية التراكب الكمي للكيوبت تمثيل حالات متعددة متزامنة، مما يمنح الحواسيب الكمية قدرة فائقة على حل معادلات التشفير والمحاكاة الجزيئية المعقدة.",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-14-03",
    "domain": "الفلك والفيزياء الفضائية (JWST Astrophysics)",
    "icon": "astronomy",
    "question": "في أي نطاق من الطيف الكهرومغناطيسي يرصد تلسكوب جيمس ويب (JWST) لاختراق سحب الغبار الكوني ورصد بدايات الكون؟",
    "options": [
      {
        "id": "a",
        "label": "الأشعة تحت الحمراء (Infrared Spectrum)"
      },
      {
        "id": "b",
        "label": "أشعة غاما ذات الطاقة المدمرة"
      },
      {
        "id": "c",
        "label": "الموجات الصوتية الميكانيكية"
      },
      {
        "id": "d",
        "label": "الأشعة فوق البنفسجية القصيرة فقط"
      }
    ],
    "correctId": "a",
    "verdictTitle": "رصد أعماق الكون بالأشعة تحت الحمراء",
    "explanation": "صُمم تلسكوب جيمس ويب للرصد في نطاق الأشعة تحت الحمراء القريبة والمتوسطة، لأن أطوالها الموجية تنفذ عبر الغبار الفضائي وتكشف الضوء المنزاح نحو الأحمر من أقدم المجرات.",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-14-04",
    "domain": "البيولوجيا الجزيئية وعلم الوراثة (PCR Diagnostics)",
    "icon": "genetics",
    "question": "ما هي التقنية المخبرية الثورية التي تتيح مضاعفة وتكبير قطعة محددة من الـ DNA ملايين المرات في وقت قياسي؟",
    "options": [
      {
        "id": "a",
        "label": "التقطير التجزيئي للبترول"
      },
      {
        "id": "b",
        "label": "التحليل الطيفي بالأشعة السينية"
      },
      {
        "id": "c",
        "label": "تفاعل البوليمراز المتسلسل (Polymerase Chain Reaction - PCR)"
      },
      {
        "id": "d",
        "label": "التبريد المغناطيسي الفائق"
      }
    ],
    "correctId": "c",
    "verdictTitle": "تقنية PCR لمضاعفة الحمض النووي",
    "explanation": "تعتمد تقنية PCR على دورات حرارية متكررة وأنزيم بلمرة مقاوم للحرارة لمضاعفة تسلسلات جينية محددة أسيّاً، وتعد ركيزة التشخيص الفيروسي والبحث الجيني الحديث.",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-14-05",
    "domain": "شبكات الحاسوب والإنترنت (Network Protocols)",
    "icon": "web-dev",
    "question": "ما هو بروتوكول طبقة النقل الذي يضمن وصول الحزم البرمجية بالترتيب الصحيح ودون أي فقدان للبيانات؟",
    "options": [
      {
        "id": "a",
        "label": "بروتوكول UDP غير الموجه"
      },
      {
        "id": "b",
        "label": "بروتوكول التحكم في النقل TCP (Transmission Control Protocol)"
      },
      {
        "id": "c",
        "label": "بروتوكول ICMP للرسائل التشخيصية"
      },
      {
        "id": "d",
        "label": "بروتوكول ARP لعناوين الذاكرة"
      }
    ],
    "correctId": "b",
    "verdictTitle": "موثوقية نقل البيانات عبر TCP",
    "explanation": "يضمن بروتوكول TCP عبر آلية المصافحة الثلاثية (Three-way Handshake) وإعادة الإرسال عند الفقدان وصول البيانات كاملة ومرتبة، وهو أساس تصفح الويب الآمن ونقل الملفات.",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-14-06",
    "domain": "النسبية الخاصة والفيزياء النظرية (Relativity)",
    "icon": "optics",
    "question": "وفقاً للنظرية النسبية الخاصة لآينشتاين، ماذا يحدث لتدفق الزمن لجسم يتحرك بسرعة تقترب من سرعة الضوء بالنسبة لراصد ساكن؟",
    "options": [
      {
        "id": "a",
        "label": "يتسارع الزمن بشكل لانهائي"
      },
      {
        "id": "b",
        "label": "ينعكس الزمن ليعود للماضي فوراً"
      },
      {
        "id": "c",
        "label": "لا يتأثر الزمن إطلاقاً ويبقى مطلقاً"
      },
      {
        "id": "d",
        "label": "يتباطأ تدفق الزمن (تمدد الزمن - Time Dilation)"
      }
    ],
    "correctId": "d",
    "verdictTitle": "تمدد الزمن النسبي عند السرعات العالية",
    "explanation": "تثبت النسبية الخاصة أن الزمن ليس مطلقاً، فكلما اقتربت سرعة المراقب من سرعة الضوء c يتباطأ معدل مرور ساعته مقارنة بالمراقب الساكن نتيجة تمدد نسيج الزمكان.",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-14-07",
    "domain": "هياكل البيانات والبرمجة (Data Structures)",
    "icon": "competitive-programming",
    "question": "أي من هياكل البيانات التالية يعمل بصرامة وفق مبدأ 'ما يدخل آخراً يخرج أولاً' (LIFO - Last In First Out)؟",
    "options": [
      {
        "id": "a",
        "label": "المكدس البرمجي (Stack)"
      },
      {
        "id": "b",
        "label": "طابور الانتظار (Queue)"
      },
      {
        "id": "c",
        "label": "المصفوفة الدائرية (Ring Buffer)"
      },
      {
        "id": "d",
        "label": "شجرة البحث الثنائية (Binary Search Tree)"
      }
    ],
    "correctId": "a",
    "verdictTitle": "المكدس البرمجي ومبدأ LIFO",
    "explanation": "يعتمد هيكل المكدس (Stack) على مبدأ LIFO حيث تتم عمليتا الإضافة (Push) والحذف (Pop) من قمة المكدس فقط، وهو الهيكل المستخدم في سجل استدعاء الدوال (Call Stack) وتراجع التحرير (Undo).",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-14-08",
    "domain": "الأمن السيبراني والتشفير (Cryptography)",
    "icon": "cybersecurity",
    "question": "ما هو نمط التشفير الذي يستخدم زوجاً من المفاتيح: مفتاحاً عاماً للتشفير ومفتاحاً سرياً خاصاً لفك التشفير؟",
    "options": [
      {
        "id": "a",
        "label": "التشفير التماثلي البسيط (Symmetric Cipher)"
      },
      {
        "id": "b",
        "label": "خوارزمية قيصر للإزاحة الخطية"
      },
      {
        "id": "c",
        "label": "التشفير غير المتماثل بالمفتاح العام (Asymmetric Public-Key Cryptography)"
      },
      {
        "id": "d",
        "label": "دالة التجزئة أحادية الاتجاه (One-way Hash)"
      }
    ],
    "correctId": "c",
    "verdictTitle": "التشفير بالمفتاح العام والخاص",
    "explanation": "يعتمد التشفير غير المتماثل (مثل RSA ومنحنيات إهليلجية ECC) على زوج مفاتيح رياضي، مما يسمح بتبادل البيانات الآمن وإنشاء التوقيعات الرقمية عبر شبكات مفتوحة دون مشاركة المفتاح السري.",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-14-09",
    "domain": "الكيمياء الحيوية والطاقة الخلوية (Biochemistry)",
    "icon": "biotech",
    "question": "ما هو الجزيء الحيوي الذي يُعد عملة الطاقة الأساسية لجميع العمليات الحيوية داخل خلايا الكائنات الحية؟",
    "options": [
      {
        "id": "a",
        "label": "حمض الفوليك"
      },
      {
        "id": "b",
        "label": "الكيراتين"
      },
      {
        "id": "c",
        "label": "الهيموغلوبين"
      },
      {
        "id": "d",
        "label": "أدينوسين ثلاثي الفوسفات (ATP - Adenosine Triphosphate)"
      }
    ],
    "correctId": "d",
    "verdictTitle": "جزيء ATP: عملة الطاقة الحيوية",
    "explanation": "يخزن جزيء ATP الطاقة الكيميائية في روابط الفوسفات عالية الطاقة، ويتم تحريرها عند تكسير رابطة لتغذية الانقباض العضلي، نقل الأيونات وتصنيع الجزيئات الحيوية.",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
    "isPinnedToday": false,
    "active": true
  },
  {
    "id": "quiz-2026-11-14-10",
    "domain": "رسالة ونشاطات نادي QUANTA العلمي",
    "icon": "leadership",
    "question": "ما الذي يميز نهج ورشات ومشاريع نادي QUANTA العلمي في إعداد الطلبة والباحثين؟",
    "options": [
      {
        "id": "a",
        "label": "الاكتفاء بالمحاضرات النظرية السمعية دون تطبيق حاسوبي أو تجريبي"
      },
      {
        "id": "b",
        "label": "العمل العملي المباشر، البرمجيات مفتوحة المصدر، وحل المشكلات الهندسية والبحثية الواقعية"
      },
      {
        "id": "c",
        "label": "حظر المشاركة في المسابقات العلمية والهاكاثونات الوطنية والدولية"
      },
      {
        "id": "d",
        "label": "منع تبادل الخبرات بين الأجيال والأعضاء القدامى"
      }
    ],
    "correctId": "b",
    "verdictTitle": "النهج التطبيقي الرائد لنادي QUANTA",
    "explanation": "يتبنى نادي QUANTA منهجية التعلم بالأقران والتطبيق التقني الفعلي في مجالات الذكاء الاصطناعي، الروبوتات والعلوم الدقيقة لخلق جيل باحث قادر على الابتكار والمنافسة عالمياً.",
    "xpReward": 2,
    "dateLabel": "2026-11-14",
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
    "id": "exp-ai4s-scientific-discovery-2026",
    "title": "AI for Science (AI4S): How Autonomous Generalist Agents are Accelerating Molecular Discovery & Quantum Physics",
    "summary": "The convergence of frontier reasoning models and physical sciences ushers in autonomous hypothesis generation, non-destructive quantum readouts, and automated enzyme design across global labs.",
    "content": "# AI for Science (AI4S): The 2026 Frontier of Autonomous Scientific Discovery\n\n## 1. The Paradigm Shift from Text LLMs to Generalist Scientific Agents\nThe era of viewing Artificial Intelligence merely as a code assistant or conversational interface has given way to **AI for Science (AI4S)**. In late 2026, scientific discovery is governed by multi-modal scientific reasoning agents capable of parsing topological manifolds, processing cryo-EM protein density maps, and formulating falsifiable hypotheses with minimal human intervention.\n\nRather than relying on brute-force trial-and-error laboratory screening, research institutions leverage closed-loop co-scientist platforms that continuously coordinate literature synthesis, simulation kernel executions, and robotic experiment planning.\n\n---\n\n## 2. Key 2026 Breakthrough Pillars\n\n### A. Non-Destructive Quantum Sensor Readouts\nA historic barrier in quantum computing and quantum biology has been the wave-function collapse during state measurement. Recent breakthroughs in micro-supercurrent sensor arrays allow quantum states in diamond nitrogen-vacancy (NV) lattices to be read without annihilating fragile qubit coherences, opening new avenues for room-temperature quantum memory.\n\n### B. Generative Enzyme Design & Variant Lethality Mapping\nFollowing the maturation of structural co-folding engines, models such as **PopEVE** and next-generation generative sequence-to-structure diffusion networks are now capable of predicting disease variant lethality directly from raw genomic callsets, reducing early-stage oncology target discovery timelines from four years to six weeks.\n\n### C. Formal Mathematical Proof Synthesis\nFrontier reasoning models regularly achieve benchmark-topping results in formal mathematics, automatically translating informal human lemmas into verified Lean 4 and Isabelle/HOL proofs and discovering novel bounds in harmonic analysis.\n\n---\n\n## 3. Quantitative Impact on Experimental Pipelines\n| Scientific Domain | Classical Time-to-Result | AI4S Accelerated Pipeline (2026) | Primary Methodology |\n|:---|:---|:---|:---|\n| **Protein-Ligand Interaction** | 6 - 18 Months (Assay) | **4 - 8 Hours (Predicted & Scored)** | Diffusion PLIF & Co-folding |\n| **Material Bandgap Optimization** | 9 Months (Synthesis) | **48 Hours (DFT + Surrogates)** | Graph Neural Operators |\n| **Quantum Qubit Decoherence Modeling** | Weeks (Numerical PDE) | **Real-Time (< 500 ms)** | Physics-Informed Neural Nets |\n| **Zero-Day Code Vulnerability Discovery** | Months (Manual Audit) | **Minutes (SEC-bench 88.2%)** | Test-Time Compute Reasoning |\n\n---\n\n## 4. QUANTA Research Directorate Integration\nWithin QUANTA Scientific Club, the Modeling, AI, and Biotechnology tracks are launching dedicated co-scientist sandbox environments. Students and researchers can connect their computational notebooks directly to verified open-source models, running high-throughput molecular dynamics and quantum calculations on our university cluster.",
    "category": "Scientific News",
    "tagLabel": "AI FOR SCIENCE (AI4S)",
    "tagTone": "cyan",
    "source": "Nature, Science & Google DeepMind Research",
    "readTime": "5 min read",
    "date": "Nov 14, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://deepmind.google/technologies/gemini/"
  },
  {
    "id": "exp-quantum-diamond-acoustic-readout",
    "title": "Room-Temperature Quantum Systems: Acoustic Diamond Flaws and Non-Destructive Qubit Readouts",
    "summary": "Physicists achieve coherent qubit preservation at ambient temperatures using microscopic vibrational memories in diamond lattices coupled with non-destructive supercurrent sensors.",
    "content": "# Room-Temperature Quantum Systems: Diamond Acoustic Memories & Sensor Breakthroughs\n\n## 1. Overcoming the Cryogenic Bottleneck\nFor decades, practical quantum computation has been tethered to multimillion-dollar dilution refrigerators operating near absolute zero ($15\\text{ mK}$). In late 2026, experimental condensed matter physicists achieved a milestone in ambient quantum coherence by harnessing **optically active nitrogen-vacancy (NV) centers in diamond** coupled to microscopic acoustic resonators.\n\n> *\"By treating atomic lattice vibrations like the harmonic strings of an instrument, quantum information can be stored in mechanical phononic states that resist thermal noise at room temperature.\"*\n\n---\n\n## 2. Core Technological Architecture\n- **Acoustic Phonon Storage:** High-frequency surface acoustic wave (SAW) resonators fabricated directly onto ultra-pure synthetic diamond crystals trap phononic energy with quality factors exceeding $Q > 10^7$.\n- **Non-Destructive Supercurrent Probing:** Superconducting quantum interference devices (SQUIDs) engineered with sub-micron weak links probe the stray magnetic dipole of individual NV electron spins without inducing decoherence.\n- **Spin-Phonon Coherence Times:** Hyperfine coherence lifetimes ($T_2$) at room temperature have crossed the millisecond threshold, sufficient to execute thousands of fault-tolerant Clifford gate operations.\n\n---\n\n## 3. Implications for Quantum Sensing & Biology\n1. **Intra-Cellular Magnetic Metrology:** Nanodiamonds functionalized with biocompatible lipid bilayers can measure action potentials inside living neurons with nanometer spatial precision.\n2. **Decentralized Quantum Repeaters:** Ambient quantum memories eliminate cryogenic infrastructure from quantum key distribution (QKD) nodes, accelerating metropolitan quantum internet rollouts.",
    "category": "Scientific News",
    "tagLabel": "QUANTUM COMPUTING",
    "tagTone": "indigo",
    "source": "Physical Review Letters & ScienceDaily",
    "readTime": "5 min read",
    "date": "Nov 14, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://journals.aps.org/prl/"
  },
  {
    "id": "exp-google-gemini-carbon",
    "title": "Google Gemini 4 Carbon & Claude Fable 5.2: The Frontier Benchmark in Automated Verification & Long-Horizon Agents",
    "summary": "Comparing the two landmark architectures defining late 2026 AI: Gemini 4 Carbon's 88.2% SEC-bench verification alongside Claude Fable's multi-day unattended codebase refactoring.",
    "content": "# Google Gemini 4 Carbon & Claude Fable 5.2: The 2026 Frontier Comparison\n\n## 1. Executive Benchmark Overview\nNovember 2026 marks the consolidation of two distinct paradigms in frontier artificial intelligence:\n1. **Google Gemini 4 Carbon:** The undisputed champion of formal mathematical deduction, test-time compute scaling, and autonomous cybersecurity verification (#1 Artificial Analysis Index, Score 59).\n2. **Anthropic Claude Fable 5.2:** The premier long-horizon agentic orchestrator designed for multi-day, unattended software migrations and cross-repository engineering workflows.\n\n---\n\n## 2. Quantitative Performance Matrix\n\n| Evaluation Benchmark | Metric | Gemini 4 Carbon | Claude Fable 5.2 | Industry Baseline |\n|:---|:---|:---:|:---:|:---:|\n| **Artificial Analysis v5.0** | Composite Reasoning Index | **59 (#1)** | 58 | 52 |\n| **SEC-bench Pro** | Vulnerability Identification | **88.2%** | 76.4% | 61.2% |\n| **CWE-bench** | Verified Automated Patching | **71.0%** | 68.5% | 49.0% |\n| **Multi-Day Refactor Drift** | Context Fidelity over 72h | 94.2% | **98.6% (#1)** | 71.0% |\n| **CursorBench 4.0** | Agentic IDE Engineering | **#1 Globally** | Runner-up | Baseline |\n\n---\n\n## 3. Practical Guidance for QUANTA Developers\n- **For Formal Audits & Security:** Use Gemini 4 Carbon when writing unit tests, fuzzing network interfaces, or verifying smart contracts.\n- **For Large Monorepo Migrations:** Use Claude Fable when refactoring legacy libraries across dozens of microservices where contextual drift must be avoided.",
    "category": "Scientific News",
    "tagLabel": "FRONTIER REASONING",
    "tagTone": "sky",
    "source": "Google DeepMind & Anthropic Research",
    "readTime": "5 min read",
    "date": "Nov 14, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://blog.google"
  },
  {
    "id": "exp-top-10-developer-repositories-2026",
    "title": "Top 10 Essential GitHub Repositories Every Developer & AI Engineer Should Star in 2026",
    "summary": "From OpenHands and Langflow to Ollama and Scrapling: A curated, essential directory of open-source frameworks, visual builders, and developer resources accelerating AI engineering.",
    "content": "# The Essential Developer & AI Builder Arsenal: Top 10 High-Impact GitHub Repositories\n\n## 1. Executive Overview\nIn modern software engineering and applied AI research, developer velocity depends heavily on selecting the right open-source foundation. Rather than reinventing distributed agents, custom scraping engines, or hosting budgets, engineering teams leverage battle-tested open-source repositories to accelerate production timelines.\n\nBelow is the official curated reference guide compiled by the **QUANTA Open Source & Developer Directorate**, detailing the ten most versatile repositories every student, software engineer, and researcher in the club should bookmark and leverage.\n\n---\n\n## 2. Core Repository Reference Matrix\n\n| Repository | What it does | Useful for |\n|:---|:---|:---|\n| [**OpenHands**](https://github.com/OpenHands/OpenHands) | A workspace for coding agents that can write code, run tests, fix errors, and automate development tasks. | **AI-assisted software development** |\n| [**Langflow**](https://github.com/langflow-ai/langflow) | A visual builder for AI agents and workflows. Supports RAG—answering questions using your documents—and publishing workflows through API or MCP. | **Building chatbots and AI workflows** |\n| [**Ollama**](https://github.com/ollama/ollama) | Runs supported language models locally and provides an API for your applications. Models need separate downloads. | **Local AI and experimenting without per-request API fees** |\n| [**Free-for-dev**](https://github.com/ripienaar/free-for-dev) | A directory of developer services offering free tiers, including hosting, databases, authentication, and APIs. | **Finding services for a low-budget project** |\n| [**Scrapling**](https://github.com/D4Vinci/Scrapling) | A Python framework for fetching webpages, extracting information, and building web crawlers. | **Collecting website data** |\n| [**Awesome**](https://github.com/sindresorhus/awesome) | A large directory of curated resource lists covering programming, science, design, and many other subjects. | **Discovering tools and learning resources** |\n| [**Awesome LLM Apps**](https://github.com/Shubhamsaboo/awesome-llm-apps) | A collection of example AI agents, skills, and RAG applications with source code. Individual examples may require paid APIs. | **Learning from working examples and adapting them** |\n| [**Open Design**](https://github.com/nexu-io/open-design) | An open-source AI design workspace for prototypes, websites, presentations, and other creative work. | **Combining design work with AI agents** |\n| [**Awesome MCP Servers**](https://github.com/punkpeye/awesome-mcp-servers) | A directory of MCP servers: connectors that let compatible AI assistants interact with tools and data sources. | **Finding integrations for AI assistants** |\n| [**Public APIs**](https://github.com/public-apis/public-apis) | A categorized directory of public APIs. Authentication requirements, free allowances, and restrictions vary by service. | **Finding data and services for an app** |\n\n---\n\n## 3. QUANTA Club Recommendations\nAll project teams participating in the upcoming **QUANTA Open Innovation Challenge** are strongly encouraged to integrate these repositories into their foundational architecture. Direct links are provided in the matrix above for easy cloning and bookmarking.",
    "category": "Opportunities",
    "tagLabel": "DEVELOPER TOOLS & REPOS",
    "tagTone": "sky",
    "source": "QUANTA Open Source & Developer Directorate",
    "readTime": "6 min read",
    "date": "Nov 14, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=80",
    "featuredInCarousel": true,
    "status": "Published",
    "externalUrl": "https://github.com/ripienaar/free-for-dev"
  },
  {
    "id": "exp-claude-fable-agentic-simulation",
    "title": "Claude Fable & Multi-Agent Simulations: Long-Horizon Autonomy and Generative World-Building in 2026",
    "summary": "Anthropic's Claude Fable 5.2 and Fable Studio's Showrunner platform redefine agentic computing—combining hours-long unattended codebase refactoring with persistent generative world-building.",
    "category": "Scientific News",
    "tagLabel": "AUTONOMOUS AGENTS & SIMULATION",
    "tagTone": "cyan",
    "source": "Anthropic Frontier Research & Fable Studio",
    "readTime": "6 min read",
    "date": "Nov 11, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
    "externalUrl": "https://anthropic.com"
  },
  {
    "id": "exp-handy-offline-stt",
    "title": "Handy: Open-Source Local-First Speech-to-Text Built with Rust & Tauri",
    "summary": "A privacy-first cross-platform desktop application delivering instant, offline Whisper and Parakeet speech-to-text with global push-to-talk and zero cloud dependencies.",
    "category": "Scientific News",
    "tagLabel": "AI & OPEN SOURCE",
    "tagTone": "cyan",
    "source": "GitHub Open Source (cjpais/handy)",
    "readTime": "4 min read",
    "date": "Nov 04, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
    "externalUrl": "https://github.com/cjpais/handy"
  },
  {
    "id": "exp-timimoun-short-film-festival-2026",
    "title": "Timimoun International Short Film Festival 2026 (2nd Edition): Cinema, Gourara Lab & Media Masterclasses",
    "summary": "The oasis city of Timimoun hosts its 2nd International Short Film Festival from Nov 26 to Dec 01, 2026, featuring the Gourara Media Lab and technical masterclasses for young Algerian creators.",
    "category": "Events",
    "tagLabel": "CULTURE & MEDIA",
    "tagTone": "amber",
    "source": "Algerian Ministry of Culture & Arts",
    "readTime": "4 min read",
    "date": "Nov 04, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
    "externalUrl": "https://www.m-culture.gov.dz"
  },
  {
    "id": "exp-optogenetics-senolytics-nature",
    "title": "Cellular Rejuvenation & Neural Circuit Control: Optogenetics and Targeted Senolytics in Nature",
    "summary": "Landmark papers published in Nature and Science showcase light-sensitive microbial channelrhodopsins restoring visual circuits, paired with selective senolytic clearing of inflammatory 'zombie' cells.",
    "category": "Scientific News",
    "tagLabel": "BIOLOGY & MEDICINE",
    "tagTone": "sky",
    "source": "Nature & Science Research Portals",
    "readTime": "5 min read",
    "date": "Nov 04, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
    "externalUrl": "https://www.nature.com"
  },
  {
    "id": "exp-global-fellowships-grants-2027",
    "title": "Global STEM Fellowships & Research Grants 2027: Application Windows Open for Algerian Students",
    "summary": "Comprehensive roadmap for fully-funded international graduate fellowships: DAAD, Chevening, Fulbright STEM, Erasmus Mundus, and CERN Summer Student Program deadlines.",
    "category": "Opportunities",
    "tagLabel": "FELLOWSHIPS & GRANTS",
    "tagTone": "sky",
    "source": "QUANTA Academic Affairs Directorate",
    "readTime": "6 min read",
    "date": "Nov 02, 2026",
    "imageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    "featuredInCarousel": false,
    "status": "Archived",
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
