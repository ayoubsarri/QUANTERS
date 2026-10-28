import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const cfg = {
  apiKey: 'AIzaSyC6pIhe81IqNuINx7Wd-TfgBLBJuW4Z6Yw',
  authDomain: 'quanters-d0312.firebaseapp.com',
  projectId: 'quanters-d0312'
};
const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

const SUPER_ADMIN_MEMBER = {
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
  availability: {
    Saturday: ["08-09", "09-10", "10-11", "11-12", "13-14", "14-15", "15-16"],
    Sunday: ["13-14", "14-15", "15-16"],
    Monday: ["15-16", "16-17", "17-18"],
    Tuesday: ["13-14", "14-15", "16-17"],
    Wednesday: ["08-09", "09-10", "10-11"],
    Thursday: ["13-14", "14-15", "15-16", "16-17"],
    Friday: ["09-10", "10-11", "14-15", "15-16"],
  },
  traineeEvaluation: {
    headEndorsed: true,
    coManagerEndorsed: true,
    notes: "Super Admin Account",
  },
  statusHistory: [],
  placementHistory: [],
  avatarUrl: "/icons/icon-192.png",
};

async function cleanSlate() {
  await signInAnonymously(auth);
  console.log("Authenticated with Firebase");

  const docRef = doc(db, "erp_state", "main");
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error("Doc erp_state/main does not exist");
  }
  const current = snap.data();

  // 1. Scrub ALL occurrences of Yacine Brahimi from audit logs
  const cleanedAuditLogs = (current.auditLogs || []).map((log) => {
    let clean = { ...log };
    if (clean.actorName && /yacine/i.test(clean.actorName)) {
      clean.actorName = "Former Member";
    }
    if (clean.targetLabel && /yacine/i.test(clean.targetLabel)) {
      clean.targetLabel = clean.targetLabel.replace(/Yacine\s*Brahimi/gi, "Former Member");
    }
    if (clean.reason && /yacine/i.test(clean.reason)) {
      clean.reason = clean.reason.replace(/Yacine\s*Brahimi/gi, "Former Member").replace(/yacine\.brahimi[^\s)]*/gi, "[redacted]");
    }
    return clean;
  });

  const resetAuditLog = {
    id: `aud-${Date.now()}`,
    actorName: "Super Admin",
    actorRole: "Super Admin",
    timestamp: new Date().toISOString(),
    actionCategory: "Settings Changed",
    targetLabel: "Platform Database Clean Slate",
    oldValue: "Previous Multi-Member/Workshop State",
    newValue: "Super Admin Only (quantaclubdz@gmail.com) | 0 Workshops | 5 Explore | 0 Daily Quizzes",
    reason: "Production clean-slate reset requested by Super Admin",
  };

  const finalAuditLogs = [resetAuditLog, ...cleanedAuditLogs];

  // 2. Clean badges criteria text
  const cleanedBadges = (current.badges || []).map((b) => {
    if (b.criteriaText && b.criteriaText.includes("Scientific Python Workshop")) {
      return {
        ...b,
        criteriaText: "Pass the online skill exam (≥70%) or submit a verified repository.",
      };
    }
    return b;
  });

  // 3. Clean team description
  const cleanedTeams = (current.teams || []).map((t) => {
    if (t.id === "team-cs-ai") {
      return {
        ...t,
        description: "Machine learning for science, computational modeling, and research algorithms.",
      };
    }
    return t;
  });

  // 4. Explore posts: Keep exactly 5 official articles
  const explorePosts = (current.explorePosts || []).slice(0, 5);

  const payload = {
    members: [SUPER_ADMIN_MEMBER],
    workshops: [], // Deleted "Scientific Python & Data Analysis Lab"
    tasks: [],
    proposals: [],
    projectSubmissions: [],
    examCompletions: [],
    grievances: [],
    ledger: [], // Cleared all ledger entries
    dailyQuizzes: [], // Daily Quiz Manager (0)
    customDailyQuotes: [], // Quote of the Day (365) via standard 365 quotes
    explorePosts: explorePosts, // Exactly 5 Explore articles
    badges: cleanedBadges,
    teams: cleanedTeams,
    auditLogs: finalAuditLogs,
    updatedAt: new Date().toISOString(),
  };

  console.log("Updating erp_state/main with clean slate...");
  await updateDoc(docRef, payload);
  console.log("SUCCESS! Firestore erp_state/main updated cleanly.");
}

cleanSlate().then(() => process.exit(0)).catch(err => {
  console.error("FAIL:", err);
  process.exit(1);
});
