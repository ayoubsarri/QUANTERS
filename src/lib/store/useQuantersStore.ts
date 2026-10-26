"use client";

import { create } from "zustand";
import {
  AccessGrant,
  AccessLevel,
  AccessScopeType,
  ActivityTypeKey,
  AuditLogEntry,
  AvailabilityGrid,
  Badge,
  BadgeExam,
  ExamCompletionRecord,
  Capability,
  ClubMessage,
  ClubTask,
  DailyQuizItem,
  DailyQuoteItem,
  Department,
  ExplorePost,
  FieldIconKey,
  GrievanceCategory,
  GrievanceStatus,
  GrievanceUrgency,
  Invitation,
  Member,
  MemberGrievance,
  MemberStatus,
  NotificationPriority,
  PointRule,
  PointsLedgerEntry,
  ProjectSubmission,
  Proposal,
  ProposalState,
  ProposalTypeKey,
  RecognitionLabel,
  RoleTemplateName,
  ScientificTeam,
  SystemSettings,
  Workshop,
  WorkshopLevel,
  WorkshopStatus,
} from "../types/erp";
import {
  SEED_ACCESS_GRANTS,
  SEED_AUDIT_LOGS,
  SEED_BADGES,
  SEED_DAILY_QUIZZES,
  SEED_DAILY_QUOTES_365,
  SEED_DEPARTMENTS,
  SEED_EXAMS,
  SEED_EXPLORE_POSTS,
  SEED_GRIEVANCES,
  SEED_INVITATIONS,
  SEED_LEDGER,
  SEED_MEMBERS,
  SEED_MESSAGES,
  SEED_POINT_RULES,
  SEED_PROJECT_SUBMISSIONS,
  SEED_PROPOSALS,
  SEED_SETTINGS,
  SEED_TASKS,
  SEED_TEAMS,
  SEED_WORKSHOPS,
} from "../data/seed";

export interface CelebrationPayload {
  open: boolean;
  type: "badge" | "checkin" | "confirmation" | "motm";
  title: string;
  subtitle: string;
  xpEarned: number;
  badgeName?: string;
}

interface QuantersStoreState {
  // Active session & authentication context
  isAuthenticated: boolean;
  currentMemberId: string;
  activeAdminRole: RoleTemplateName;
  mobileFrameMode: "phone" | "responsive";
  celebration: CelebrationPayload | null;

  // Offline & Quota-Saver Client Telemetry
  userLowDataMode: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncedAt: string | null;
  lastServerEtag: string | null;
  collectionVersions: Record<string, string>;

  // Core ERP collections
  departments: Department[];
  teams: ScientificTeam[];
  members: Member[];
  invitations: Invitation[];
  workshops: Workshop[];
  workshopCategories: string[];
  tasks: ClubTask[];
  pointRules: PointRule[];
  ledger: PointsLedgerEntry[];
  badges: Badge[];
  badgeCategories: string[];
  exams: BadgeExam[];
  examCompletions: ExamCompletionRecord[];
  projectSubmissions: ProjectSubmission[];
  proposals: Proposal[];
  explorePosts: ExplorePost[];
  dailyQuizzes: DailyQuizItem[];
  dailyQuotes: DailyQuoteItem[];
  messages: ClubMessage[];
  accessGrants: AccessGrant[];
  auditLogs: AuditLogEntry[];
  grievances: MemberGrievance[];
  settings: SystemSettings;

  // Session & Authentication actions
  setCurrentMemberId: (id: string) => void;
  setActiveAdminRole: (role: RoleTemplateName) => void;
  setMobileFrameMode: (mode: "phone" | "responsive") => void;
  triggerCelebration: (payload: CelebrationPayload | null) => void;
  loginWithEmail: (
    email: string,
    password?: string
  ) => { ok: boolean; redirectPath: string; member?: Member; message?: string };
  loginWithGoogle: (
    email: string,
    fullName?: string,
    avatarUrl?: string
  ) => { ok: boolean; redirectPath: string; member: Member };
  registerAccount: (payload: {
    fullName: string;
    email: string;
    password?: string;
    isAlumni?: boolean;
  }) => { ok: boolean; redirectPath: string; member?: Member; message?: string };
  changeMemberPassword: (payload: {
    oldEmail: string;
    newEmail?: string;
    newPassword: string;
  }) => { ok: boolean; message: string; member?: Member };
  logout: () => void;
  syncWithServer: (force?: boolean) => Promise<void>;
  pullExactUpdatesFromServer: () => Promise<void>;
  setUserLowDataMode: (enabled: boolean) => void;
  setOnlineStatus: (online: boolean) => void;
  saveToLocalCache: () => void;
  hydrateFromLocalCache: () => void;
  compactAndPruneQuota: () => { bytesSaved: number; prunedCount: number };

  // §2.1 & §2.2: Organization (Fixed Departments + Editable Teams)
  updateDepartmentMeta: (deptId: string, updates: Partial<Department>, reason: string) => void;
  moveMemberDepartment: (memberId: string, toDeptId: string, reason: string, actorName?: string) => void;
  createTeam: (team: Omit<ScientificTeam, "id" | "archived">) => void;
  updateTeam: (teamId: string, updates: Partial<ScientificTeam>) => void;
  deleteOrArchiveTeam: (teamId: string, reason: string) => void;
  addMemberToTeam: (memberId: string, teamId: string) => void;
  removeMemberFromTeam: (memberId: string, teamId: string, reason: string) => void;

  // §3 & §4: Onboarding, Statuses, Confirmations, Resignations & Removals
  completeFirstTimeProfile: (payload: {
    fullName: string;
    email?: string;
    phone: string;
    avatarUrl: string;
    major: string;
    academicYear: Member["academicYear"];
    tenure: string;
    departmentId: string;
    teamId?: string;
    wilaya?: string;
    commune?: string;
    housingType?: Member["housingType"];
    commuteTime?: Member["commuteTime"];
    canStayLate?: boolean;
    hasLaptop?: boolean;
    pcCapability?: Member["pcCapability"];
    equipmentTags?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    cvUrl?: string;
    skills?: string[];
    availability: AvailabilityGrid;
    outsideActivitiesAndVolunteering: string;
    declaresOtherStudentOrg: boolean;
  }) => void;
  updateMemberProfileSelf: (
    memberId: string,
    updates: Partial<
      Pick<
        Member,
        | "avatarUrl"
        | "bio"
        | "phone"
        | "wilaya"
        | "commune"
        | "housingType"
        | "commuteTime"
        | "canStayLate"
        | "hasLaptop"
        | "pcCapability"
        | "equipmentTags"
        | "githubUrl"
        | "linkedinUrl"
        | "portfolioUrl"
        | "cvUrl"
        | "availability"
        | "outsideActivitiesAndVolunteering"
        | "skills"
      >
    >
  ) => void;
  confirmTraineeToActive: (memberId: string, reason: string, actorName?: string) => void;
  assignBuddyToMember: (traineeId: string, buddyId: string) => void;
  changeMemberStatus: (payload: {
    memberId: string;
    toStatus: MemberStatus;
    reason: string;
    actorName: string;
    decisionReference?: string;
    graduationYear?: string;
    suspensionEndDate?: string;
  }) => void;
  pauseOrResignMembershipSelf: (payload: {
    memberId: string;
    action: "pause" | "resign";
    motif: string;
    passwordConfirm: string;
    pauseUntilDate?: string;
  }) => { ok: boolean; message: string };
  submitGrievance: (payload: {
    subject: string;
    category: GrievanceCategory;
    urgency: GrievanceUrgency;
    details: string;
    isAnonymous: boolean;
  }) => { ok: boolean; message: string };
  resolveGrievance: (
    grievanceId: string,
    status: GrievanceStatus,
    hrNotes: string,
    actorName?: string
  ) => void;
  reactivateFormerMember: (memberId: string, toStatus: "Active" | "Trainee", reason: string, actorName?: string) => void;

  // §3.1: Invitations
  createInvitations: (emails: string[], prefilledDepartmentId?: string) => void;
  resendInvitation: (invitationId: string) => void;
  cancelInvitation: (invitationId: string) => void;

  // §M3: Workshops & Check-in
  registerForWorkshop: (workshopId: string, memberId: string) => void;
  cancelWorkshopRegistration: (workshopId: string, memberId: string) => void;
  verifyWorkshopCheckIn: (
    workshopId: string,
    memberId: string,
    codeOrToken: string,
    method: "Member Scanned QR" | "Organizer Scanned Member QR" | "6-Digit Code"
  ) => { ok: boolean; message: string };
  correctAttendance: (
    workshopId: string,
    memberId: string,
    status: "Present" | "Excused" | "Absent",
    reason: string,
    actorName?: string
  ) => void;
  createWorkshop: (ws: {
    title: string;
    activityType?: ActivityTypeKey;
    category: Workshop["category"];
    iconType?: FieldIconKey;
    level: WorkshopLevel;
    instructor: string;
    dateLabel: string;
    timeRange: string;
    location: string;
    capacity: number;
    xpReward: number;
    description: string;
    linkedBadgeId?: string;
    status?: WorkshopStatus;
  }) => void;
  updateWorkshopStatus: (workshopId: string, status: WorkshopStatus) => void;
  rotateWorkshopQrCode: (workshopId: string) => void;

  // §M4: Tasks & Scoring
  createTask: (task: {
    title: string;
    description: string;
    category: ClubTask["category"];
    departmentId: string;
    teamId?: string;
    linkedWorkshopOrEvent?: string;
    deadline: string;
    locationOrShift: string;
    proposedScore: number;
    assigneeIds: string[];
  }) => void;
  updateTask: (
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      category?: ClubTask["category"];
      deadline?: string;
      locationOrShift?: string;
      proposedScore?: number;
      assigneeIds?: string[];
    }
  ) => void;
  confirmTaskReceipt: (taskId: string, memberId: string) => void;
  deliverTask: (taskId: string, memberId: string, proofUrlOrNote: string) => void;
  validateAndScoreTask: (payload: {
    taskId: string;
    memberId: string;
    scoreType: "Full" | "Partial" | "Bonus";
    awardedScore: number;
    feedback: string;
    validatorName?: string;
  }) => void;
  publishTaskMatrix: (taskId: string) => void;
  archiveTask: (taskId: string) => void;
  unarchiveTask: (taskId: string) => void;
  archiveAllCompletedTasks: () => void;
  // §M3: Workshops & Activities
  addWorkshopCategory: (category: string) => void;
  deleteWorkshopCategory: (category: string) => void;

  // §M4: Tasks & Event Matrix
  bulkScoreMembers: (memberIds: string[], points: number, reason: string, actorName?: string) => void;

  // §M5: Points Ledger, Rules, Appeals & Member of the Month
  addManualPointsEntry: (memberId: string, amount: number, ruleLabel: string, reason: string, actorName?: string) => void;
  reversePointsEntry: (entryId: string, reason: string, actorName?: string) => void;
  submitPointsAppeal: (entryId: string, appealReason: string) => void;
  resolvePointsAppeal: (entryId: string, decision: "Accepted" | "Rejected", reason: string) => void;
  createPointRule: (rule: Omit<PointRule, "id">) => void;
  updatePointRule: (ruleId: string, updatesOrPoints: Partial<PointRule> | number, label?: string) => void;
  deletePointRule: (ruleId: string) => void;
  publishMonthlyHonours: (motmMemberId: string, championMemberIds: string[], actorName?: string) => void;

  // §M6: Badges, Exams & Project Submissions
  addBadgeCategory: (category: string) => void;
  deleteBadgeCategory: (category: string) => void;
  createBadge: (badge: Omit<Badge, "id" | "memberState" | "progressPercent" | "awardedCount" | "archived">) => void;
  updateBadge: (id: string, updates: Partial<Badge>) => void;
  awardBadgeManually: (badgeId: string, memberIds: string[], reasonOrNote: string, actorName?: string) => void;
  revokeBadge: (badgeId: string, memberId: string, reason: string, actorName?: string) => void;
  deleteOrArchiveBadge: (badgeId: string, reason: string) => void;
  createBadgeExam: (exam: Omit<BadgeExam, "id" | "attemptsUsed">) => void;
  updateBadgeExam: (id: string, updates: Partial<BadgeExam>) => void;
  deleteBadgeExam: (id: string) => void;
  completeBadgeExam: (examId: string, scorePercent: number) => void;
  submitBadgeProject: (submission: Omit<ProjectSubmission, "id" | "submittedAt" | "status">) => void;
  reviewProjectSubmission: (
    submissionId: string,
    status: "Approved" | "Revision Requested" | "Rejected",
    comment: string
  ) => void;

  // §M8: Proposals
  submitProposal: (proposal: {
    type: ProposalTypeKey;
    title: string;
    description: string;
    expectedDate?: string;
    location?: string;
    specificFields: Record<string, string>;
  }) => void;
  reviewProposal: (
    proposalId: string,
    state: ProposalState,
    comment: string,
    convertToWorkshop?: boolean
  ) => void;

  // §M7 & §M9: Messages & Explore
  sendClubMessage: (payload: {
    recipientScope: string;
    priority: NotificationPriority;
    title: string;
    body: string;
    inApp: boolean;
    email: boolean;
  }) => void;
  markMessageRead: (messageId: string) => void;
  unarchiveMessage: (messageId: string) => void;
  archiveAllReadMessages: () => void;
  createExplorePost: (post: Omit<ExplorePost, "id">) => void;
  updateExplorePostStatus: (postId: string, status: ExplorePost["status"]) => void;

  // Daily Quiz & 365-Day Quote Library Actions
  createDailyQuiz: (quiz: Omit<DailyQuizItem, "id">) => void;
  updateDailyQuiz: (id: string, updates: Partial<DailyQuizItem>) => void;
  deleteDailyQuiz: (id: string) => void;
  pinDailyQuiz: (id: string) => void;
  createDailyQuote: (quote: Omit<DailyQuoteItem, "id">) => void;
  updateDailyQuote: (id: string, updates: Partial<DailyQuoteItem>) => void;
  deleteDailyQuote: (id: string) => void;
  setPinnedDailyQuote: (quoteId: string | null) => void;

  // §8 & §6.5: Smart Access Delegation & Super Admin Settings
  grantAccess: (grant: {
    memberId: string;
    capability: Capability;
    level: AccessLevel;
    scopeType: AccessScopeType;
    scopeLabel: string;
    expiresAt?: string;
    reason: string;
  }) => void;
  revokeAccess: (grantId: string, reason: string) => void;
  updateSettings: (updates: Partial<SystemSettings>, reason: string) => void;
}

const nowStamp = () => {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
};

const DELTA_ARRAY_KEYS = [
  "departments",
  "teams",
  "members",
  "workshops",
  "tasks",
  "pointRules",
  "ledger",
  "badges",
  "exams",
  "examCompletions",
  "projectSubmissions",
  "proposals",
  "explorePosts",
  "messages",
  "invitations",
  "accessGrants",
  "auditLogs",
  "grievances",
] as const;

let lastSyncedBaselineMap: Record<string, Map<string, string>> | null = null;
let lastSyncedSettingsJson: string | null = null;

function captureBaselineFromState(s: QuantersStoreState) {
  const nextMap: Record<string, Map<string, string>> = {};
  for (const key of DELTA_ARRAY_KEYS) {
    const itemMap = new Map<string, string>();
    const list = (s[key] as unknown as Array<{ id?: string }>) || [];
    for (const item of list) {
      if (item && typeof item.id === "string") {
        itemMap.set(item.id, JSON.stringify(item));
      }
    }
    nextMap[key] = itemMap;
  }
  lastSyncedBaselineMap = nextMap;
  lastSyncedSettingsJson = JSON.stringify(s.settings);
}

function computeClientDeltas(s: QuantersStoreState): {
  itemDeltas: Record<
    string,
    { upserted?: Record<string, unknown>[]; deletedIds?: string[] }
  >;
  settingsPatch?: SystemSettings;
  hasChanges: boolean;
} {
  if (!lastSyncedBaselineMap) {
    captureBaselineFromState(s);
    return { itemDeltas: {}, hasChanges: false };
  }

  const itemDeltas: Record<
    string,
    { upserted?: Record<string, unknown>[]; deletedIds?: string[] }
  > = {};
  let hasChanges = false;

  for (const key of DELTA_ARRAY_KEYS) {
    const prevMap = lastSyncedBaselineMap[key] || new Map<string, string>();
    const list =
      (s[key] as unknown as Array<Record<string, unknown> & { id?: string }>) || [];
    const currentIds = new Set<string>();
    const upserted: Record<string, unknown>[] = [];

    for (const item of list) {
      if (!item || typeof item.id !== "string") continue;
      currentIds.add(item.id);
      const serialized = JSON.stringify(item);
      if (prevMap.get(item.id) !== serialized) {
        upserted.push(item);
      }
    }

    const deletedIds: string[] = [];
    if (key !== "auditLogs") {
      for (const oldId of prevMap.keys()) {
        if (!currentIds.has(oldId)) {
          deletedIds.push(oldId);
        }
      }
    }

    if (upserted.length > 0 || deletedIds.length > 0) {
      itemDeltas[key] = {
        ...(upserted.length > 0 ? { upserted } : {}),
        ...(deletedIds.length > 0 ? { deletedIds } : {}),
      };
      hasChanges = true;
    }
  }

  let settingsPatch: SystemSettings | undefined;
  const currentSettingsJson = JSON.stringify(s.settings);
  if (lastSyncedSettingsJson !== currentSettingsJson) {
    settingsPatch = s.settings;
    hasChanges = true;
  }

  return { itemDeltas, settingsPatch, hasChanges };
}

const resolveRoleAndRedirect = (member: Member): {
  adminRole: RoleTemplateName;
  redirectPath: string;
} => {
  if (member.roles.includes("Super Admin")) {
    return { adminRole: "Super Admin", redirectPath: "/home" };
  }
  if (member.roles.includes("HR Head")) {
    return { adminRole: "HR Head", redirectPath: "/home" };
  }
  if (member.roles.includes("Executive")) {
    return { adminRole: "Executive", redirectPath: "/home" };
  }
  if (member.roles.includes("Department Head")) {
    return { adminRole: "Department Head", redirectPath: "/home" };
  }
  if (member.roles.includes("Co-Manager")) {
    return { adminRole: "Co-Manager", redirectPath: "/home" };
  }
  if (member.status === "Alumni") {
    return { adminRole: "Alumni", redirectPath: "/home" };
  }
  if (!member.onboardingTicks?.profileComplete) {
    return { adminRole: "Member", redirectPath: "/onboarding" };
  }
  return { adminRole: "Member", redirectPath: "/home" };
};

export const DEFAULT_WORKSHOP_CATEGORIES: string[] = [
  "Computer Science & Programming",
  "Physics & Space Sciences",
  "Electronics & Embedded Systems",
  "Data Science & AI",
  "Robotics & Automation",
  "Materials & Chemistry",
  "Biotechnology & Health",
  "UI/UX & Multimedia",
  "Leadership & Operations",
  "General Science",
];

export const DEFAULT_BADGE_CATEGORIES: string[] = [
  "Science",
  "Technology",
  "Hard Skills",
  "Soft Skills",
  "Leadership",
  "Club",
  "Programming",
  "Data & AI",
  "Hardware & IoT",
  "Scientific Writing",
  "Public Speaking",
  "Logistics & Ops",
];

export const useQuantersStore = create<QuantersStoreState>((set, get) => ({
  isAuthenticated: true,
  currentMemberId: "mem-ayoub",
  activeAdminRole: "Super Admin",
  mobileFrameMode: "phone",
  celebration: null,

  userLowDataMode: false,
  isOnline: true,
  pendingSyncCount: 0,
  lastSyncedAt: null,
  lastServerEtag: null,
  collectionVersions: {},

  departments: SEED_DEPARTMENTS,
  teams: SEED_TEAMS,
  members: SEED_MEMBERS,
  invitations: SEED_INVITATIONS,
  workshops: SEED_WORKSHOPS,
  workshopCategories: DEFAULT_WORKSHOP_CATEGORIES,
  tasks: SEED_TASKS,
  pointRules: SEED_POINT_RULES,
  ledger: SEED_LEDGER,
  badges: SEED_BADGES,
  badgeCategories: DEFAULT_BADGE_CATEGORIES,
  exams: SEED_EXAMS,
  examCompletions: [
    {
      id: "comp-seed-1",
      examId: "exam-astrophysics",
      badgeId: "badge-astro",
      memberId: "mem-ayoub",
      scorePercent: 92,
      passed: true,
      completedAt: "2026-10-15",
    },
  ],
  projectSubmissions: SEED_PROJECT_SUBMISSIONS,
  proposals: SEED_PROPOSALS,
  explorePosts: SEED_EXPLORE_POSTS,
  dailyQuizzes: SEED_DAILY_QUIZZES,
  dailyQuotes: SEED_DAILY_QUOTES_365,
  messages: SEED_MESSAGES.map((m) => ({ ...m, archived: m.archived ?? !m.unread })),
  accessGrants: SEED_ACCESS_GRANTS,
  auditLogs: SEED_AUDIT_LOGS,
  grievances: SEED_GRIEVANCES,
  settings: SEED_SETTINGS,

  setCurrentMemberId: (id) => {
    set((state) => {
      const m = state.members.find((item) => item.id === id);
      if (!m) return { currentMemberId: id, isAuthenticated: true };
      const { adminRole } = resolveRoleAndRedirect(m);
      return {
        currentMemberId: id,
        activeAdminRole: adminRole,
        isAuthenticated: true,
      };
    });
    get().saveToLocalCache();
  },
  setActiveAdminRole: (role) => set({ activeAdminRole: role }),
  setMobileFrameMode: (mode) => set({ mobileFrameMode: mode }),
  triggerCelebration: (payload) => set({ celebration: payload }),

  loginWithEmail: (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { ok: false, redirectPath: "/welcome", message: "Please enter your email or Quanter ID." };
    }

    const state = get();
    const existing = state.members.find(
      (m) =>
        m.email.toLowerCase() === cleanEmail ||
        m.handle.toLowerCase() === cleanEmail ||
        m.handle.replace("@", "").toLowerCase() === cleanEmail ||
        m.quanterId.toLowerCase() === cleanEmail ||
        m.fullName.toLowerCase() === cleanEmail
    );

    if (password !== undefined) {
      const rawPass = password.trim();
      const cleanPass = rawPass.toLowerCase();
      const firstToken = existing
        ? existing.fullName.replace(/^dr\.\s*/i, "").split(" ")[0].toLowerCase()
        : "";
      const matchesCustomPass = Boolean(
        existing?.password &&
          (rawPass === existing.password ||
            cleanPass === existing.password.toLowerCase())
      );
      const validPass =
        matchesCustomPass ||
        cleanPass === "quanta2026" ||
        cleanPass === "123456" ||
        cleanPass === "password" ||
        (firstToken && cleanPass === `${firstToken}123`);
      if (!validPass) {
        return {
          ok: false,
          redirectPath: "/welcome",
          message:
            "Invalid password. Forgot your password? Contact quantaclubdz@gmail.com or hr.quanta@univ-alger.dz.",
        };
      }
    }

    if (existing) {
      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);
      set({
        isAuthenticated: true,
        currentMemberId: existing.id,
        activeAdminRole: adminRole,
      });
      get().saveToLocalCache();
      return { ok: true, redirectPath, member: existing };
    }

    if (cleanEmail === "admin@univ-alger.dz" || cleanEmail === "president@univ-alger.dz") {
      const adminMember = state.members.find((m) => m.id === "mem-lotfi") || state.members[0];
      set({
        isAuthenticated: true,
        currentMemberId: adminMember.id,
        activeAdminRole: "Super Admin",
      });
      get().saveToLocalCache();
      return { ok: true, redirectPath: "/admin/overview", member: adminMember };
    }

    if (cleanEmail === "hr@univ-alger.dz") {
      const hrMember = state.members.find((m) => m.id === "mem-yasmine") || state.members[0];
      set({
        isAuthenticated: true,
        currentMemberId: hrMember.id,
        activeAdminRole: "HR Head",
      });
      get().saveToLocalCache();
      return { ok: true, redirectPath: "/admin/overview", member: hrMember };
    }

    if (cleanEmail === "alumni@univ-alger.dz") {
      const alumniMember = state.members.find((m) => m.id === "mem-alumni-1") || state.members[0];
      set({
        isAuthenticated: true,
        currentMemberId: alumniMember.id,
        activeAdminRole: "Alumni",
      });
      get().saveToLocalCache();
      return { ok: true, redirectPath: "/home", member: alumniMember };
    }

    return {
      ok: false,
      redirectPath: "/welcome",
      message: "No member account found for this email or Quanter ID.",
    };
  },

  loginWithGoogle: (email, fullName, avatarUrl) => {
    const cleanEmail = email.trim().toLowerCase();
    const state = get();
    const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);

    if (existing) {
      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);
      set({
        isAuthenticated: true,
        currentMemberId: existing.id,
        activeAdminRole: adminRole,
      });
      get().saveToLocalCache();
      return { ok: true, redirectPath, member: existing };
    }

    const num = Math.floor(400 + Math.random() * 500);
    const derivedName =
      fullName?.trim() ||
      cleanEmail
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      quanterId: `QT-26-0${num}`,
      handle: `@quanter0${num}`,
      email: cleanEmail,
      fullName: derivedName,
      phone: "+213 550 00 00 00",
      avatarUrl:
        avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces",
      bio: "QUANTA Scientific Club Member",
      major: "Computer Science",
      university: "University of Algiers 1",
      academicYear: "L2",
      tenure: "New Member",
      departmentId: "dept-it",
      teamId: "team-cs-ai",
      roles: ["Member"],
      isBureauMember: false,
      status: "Trainee",
      statusSince: "Oct 2026",
      traineeStartDate: new Date().toISOString().slice(0, 10),
      traineeDaysElapsed: 1,
      outsideActivitiesAndVolunteering: "",
      declaresOtherStudentOrg: false,
      availability: state.members[0].availability,
      xpTotal: 50,
      xpSeason: 50,
      xpMonth: 50,
      level: 1,
      levelTitle: "Novice Quanter",
      attendanceRate: 100,
      onTimeTaskRate: 100,
      recentActivityScore: 100,
      healthScore: 95,
      daysSinceLastActivity: 0,
      lateTasksThisMonth: 0,
      recognitionLabels: [],
      onboardingTicks: {
        profileComplete: false,
        buddyAssigned: false,
        firstTaskBeforeDay30: false,
        firstWorkshopAttended: false,
      },
      traineeEvaluation: { headEndorsed: false, coManagerEndorsed: false, notes: "" },
      skills: ["Python", "Scientific Research"],
      badgeIds: [],
      workshopsCompletedCount: 0,
      projectsCompletedCount: 0,
      eventsAttendedCount: 0,
      statusHistory: [],
      placementHistory: [],
    };

    const redirectPath = state.settings.registrationOpen ? "/onboarding" : "/home";
    set({
      members: [newMember, ...state.members],
      currentMemberId: newMember.id,
      activeAdminRole: "Member",
      isAuthenticated: true,
    });
    return { ok: true, redirectPath, member: newMember };
  },

  registerAccount: ({ fullName, email, password, isAlumni }) => {
    const cleanEmail = email.trim().toLowerCase();
    const state = get();
    if (!isAlumni && !state.settings.registrationOpen) {
      return {
        ok: false,
        redirectPath: "/welcome",
        message: "New member registration is currently paused by the club administration.",
      };
    }

    const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);
      set({
        isAuthenticated: true,
        currentMemberId: existing.id,
        activeAdminRole: adminRole,
      });
      return { ok: true, redirectPath, member: existing };
    }

    const num = Math.floor(400 + Math.random() * 500);
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      quanterId: isAlumni ? `QT-23-0${num}` : `QT-26-0${num}`,
      handle: `@quanter0${num}`,
      email: cleanEmail,
      password: password?.trim() || "quanta2026",
      fullName: fullName.trim() || "New Quanter",
      phone: "+213 550 00 00 00",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces",
      bio: isAlumni ? "QUANTA Club Alumni" : "Exploring today, a brighter tomorrow.",
      major: "Computer Science",
      university: "University of Algiers 1",
      academicYear: isAlumni ? "Graduated" : "L2",
      tenure: isAlumni ? "3 Years" : "New Member",
      departmentId: "dept-it",
      teamId: "team-cs-ai",
      roles: isAlumni ? ["Alumni"] : ["Member"],
      isBureauMember: false,
      status: isAlumni ? "Alumni" : "Trainee",
      statusSince: "Oct 2026",
      graduationYear: isAlumni ? "2026" : undefined,
      traineeStartDate: new Date().toISOString().slice(0, 10),
      traineeDaysElapsed: isAlumni ? 1000 : 1,
      outsideActivitiesAndVolunteering: "",
      declaresOtherStudentOrg: false,
      availability: state.members[0].availability,
      xpTotal: isAlumni ? 1800 : 50,
      xpSeason: isAlumni ? 600 : 50,
      xpMonth: 50,
      level: isAlumni ? 8 : 1,
      levelTitle: isAlumni ? "Quanta Laureate" : "Novice Quanter",
      attendanceRate: 100,
      onTimeTaskRate: 100,
      recentActivityScore: 100,
      healthScore: 95,
      daysSinceLastActivity: 0,
      lateTasksThisMonth: 0,
      recognitionLabels: [],
      onboardingTicks: {
        profileComplete: Boolean(isAlumni),
        buddyAssigned: false,
        firstTaskBeforeDay30: false,
        firstWorkshopAttended: false,
      },
      traineeEvaluation: { headEndorsed: false, coManagerEndorsed: false, notes: "" },
      skills: ["Scientific Research"],
      badgeIds: [],
      workshopsCompletedCount: 0,
      projectsCompletedCount: 0,
      eventsAttendedCount: 0,
      statusHistory: [],
      placementHistory: [],
    };

    const redirectPath = isAlumni ? "/home" : "/onboarding";
    set({
      members: [newMember, ...state.members],
      currentMemberId: newMember.id,
      activeAdminRole: isAlumni ? "Alumni" : "Member",
      isAuthenticated: true,
    });
    return { ok: true, redirectPath, member: newMember };
  },

  changeMemberPassword: ({ oldEmail, newEmail, newPassword }) => {
    const cleanOldEmail = oldEmail.trim().toLowerCase();
    const cleanNewEmail = newEmail?.trim().toLowerCase() || "";
    const cleanPass = newPassword.trim();

    if (!cleanOldEmail) {
      return { ok: false, message: "Please enter your registered email address." };
    }
    if (cleanPass.length < 4) {
      return { ok: false, message: "New password must be at least 4 characters." };
    }

    const state = get();
    const target = state.members.find(
      (m) =>
        m.email.toLowerCase() === cleanOldEmail ||
        m.quanterId.toLowerCase() === cleanOldEmail ||
        m.handle.toLowerCase() === cleanOldEmail ||
        m.handle.replace("@", "").toLowerCase() === cleanOldEmail
    );

    if (!target) {
      return {
        ok: false,
        message: "No account found matching that email address.",
      };
    }

    const updatedMember: Member = {
      ...target,
      email: cleanNewEmail || target.email,
      password: cleanPass,
    };

    set((s) => ({
      members: s.members.map((m) => (m.id === target.id ? updatedMember : m)),
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowStamp(),
          actorName: target.fullName,
          actorRole: target.roles[0] || "Member",
          actionCategory: "Settings Changed",
          targetLabel: target.fullName,
          oldValue: "Password",
          newValue: "Updated via email verification",
          reason: `Password changed for ${updatedMember.email}`,
        },
        ...s.auditLogs,
      ],
    }));

    get().saveToLocalCache();
    return {
      ok: true,
      message: "Password updated successfully. You can now sign in with your new password.",
      member: updatedMember,
    };
  },

  logout: () =>
    set({
      isAuthenticated: false,
    }),

  setUserLowDataMode: (enabled) => {
    set({ userLowDataMode: enabled });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("quanters-low-data-mode", enabled ? "1" : "0");
      } catch {
        // Ignore storage error
      }
    }
  },

  setOnlineStatus: (online) => set({ isOnline: online }),

  saveToLocalCache: () => {
    if (typeof window === "undefined") return;
    try {
      const s = get();
      const snapshot = {
        savedAt: new Date().toISOString(),
        currentMemberId: s.currentMemberId,
        activeAdminRole: s.activeAdminRole,
        userLowDataMode: s.userLowDataMode,
        pendingSyncCount: s.pendingSyncCount,
        lastSyncedAt: s.lastSyncedAt,
        lastServerEtag: s.lastServerEtag,
        collectionVersions: s.collectionVersions,
        departments: s.departments,
        teams: s.teams,
        members: s.members,
        workshops: s.workshops,
        workshopCategories: s.workshopCategories,
        tasks: s.tasks,
        pointRules: s.pointRules,
        ledger: s.ledger,
        badges: s.badges,
        badgeCategories: s.badgeCategories,
        exams: s.exams,
        projectSubmissions: s.projectSubmissions,
        proposals: s.proposals,
        explorePosts: s.explorePosts,
        dailyQuizzes: s.dailyQuizzes,
        customDailyQuotes: s.dailyQuotes.filter((q) => q.isCustom),
        messages: s.messages,
        accessGrants: s.accessGrants,
        auditLogs: s.auditLogs,
        grievances: s.grievances,
        settings: s.settings,
      };
      window.localStorage.setItem("quanters-offline-cache-v6", JSON.stringify(snapshot));
    } catch {
      // Ignore quota exceeded
    }
  },

  hydrateFromLocalCache: () => {
    if (typeof window === "undefined") return;
    try {
      const lowDataRaw = window.localStorage.getItem("quanters-low-data-mode");
      const raw = window.localStorage.getItem("quanters-offline-cache-v6");
      if (!raw) {
        if (lowDataRaw) set({ userLowDataMode: lowDataRaw === "1" });
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.members) && parsed.members.length > 0) {
        const customQuotes: DailyQuoteItem[] = Array.isArray(parsed.customDailyQuotes)
          ? parsed.customDailyQuotes
          : [];
        const mergedQuotes = [
          ...customQuotes,
          ...SEED_DAILY_QUOTES_365.filter((sq) => !customQuotes.some((cq) => cq.id === sq.id)),
        ];
        set({
          currentMemberId: parsed.currentMemberId || get().currentMemberId,
          activeAdminRole: parsed.activeAdminRole || get().activeAdminRole,
          userLowDataMode: lowDataRaw ? lowDataRaw === "1" : Boolean(parsed.userLowDataMode),
          pendingSyncCount: parsed.pendingSyncCount || 0,
          lastSyncedAt: parsed.lastSyncedAt || null,
          lastServerEtag: parsed.lastServerEtag || null,
          collectionVersions: parsed.collectionVersions || {},
          departments: parsed.departments || get().departments,
          teams: parsed.teams || get().teams,
          members: parsed.members,
          workshops: parsed.workshops || get().workshops,
          workshopCategories: parsed.workshopCategories || get().workshopCategories,
          tasks: parsed.tasks || get().tasks,
          pointRules: parsed.pointRules || get().pointRules,
          ledger: parsed.ledger || get().ledger,
          badges: parsed.badges || get().badges,
          badgeCategories: parsed.badgeCategories || get().badgeCategories,
          exams: parsed.exams || get().exams,
          projectSubmissions: parsed.projectSubmissions || get().projectSubmissions,
          proposals: parsed.proposals || get().proposals,
          explorePosts: parsed.explorePosts || get().explorePosts,
          dailyQuizzes: parsed.dailyQuizzes || get().dailyQuizzes,
          dailyQuotes: mergedQuotes,
          messages: parsed.messages || get().messages,
          accessGrants: parsed.accessGrants || get().accessGrants,
          auditLogs: parsed.auditLogs || get().auditLogs,
          grievances: parsed.grievances || get().grievances,
          settings: { ...get().settings, ...(parsed.settings || {}) },
        });
      }
    } catch {
      // Ignore parse error
    }
  },

  compactAndPruneQuota: () => {
    const s = get();
    const beforeSize = JSON.stringify({
      members: s.members,
      messages: s.messages,
      tasks: s.tasks,
      ledger: s.ledger,
    }).length;

    const limit = s.settings.autoCompactHistoryLimit || 100;
    // Keep all unread messages + up to 15 most recent archived messages
    const unreadMsgs = s.messages.filter((m) => m.unread);
    const archivedMsgs = s.messages.filter((m) => !m.unread).slice(0, 15);
    const compactedMessages = [...unreadMsgs, ...archivedMsgs];
    const prunedCount = Math.max(0, s.messages.length - compactedMessages.length);

    // Compact external Unsplash URLs to smaller width parameter (w=160&q=75) to save bandwidth quota
    const compactedMembers = s.members.map((m) => ({
      ...m,
      avatarUrl: m.avatarUrl.includes("images.unsplash.com")
        ? m.avatarUrl.replace(/w=\d+/g, "w=160").replace(/h=\d+/g, "h=160")
        : m.avatarUrl,
    }));

    const compactedLedger = s.ledger.slice(0, limit);

    set({
      messages: compactedMessages,
      members: compactedMembers,
      ledger: compactedLedger,
    });

    const afterSize = JSON.stringify({
      members: compactedMembers,
      messages: compactedMessages,
      tasks: s.tasks,
      ledger: compactedLedger,
    }).length;

    get().saveToLocalCache();
    return {
      bytesSaved: Math.max(512, beforeSize - afterSize),
      prunedCount,
    };
  },

  pullExactUpdatesFromServer: async () => {
    const s = get();
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      set({ isOnline: false });
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (s.lastServerEtag) {
        headers["If-None-Match"] = s.lastServerEtag;
      }
      const hasKnownVersions =
        s.collectionVersions && Object.keys(s.collectionVersions).length > 0;
      const url = hasKnownVersions
        ? `/api/erp?versions=${encodeURIComponent(
            JSON.stringify(s.collectionVersions)
          )}`
        : "/api/erp";

      const res = await fetch(url, { headers });
      if (res.status === 304) {
        set({ isOnline: true });
        return;
      }
      if (!res.ok) return;

      const json = await res.json().catch(() => null);
      if (!json?.ok) return;

      const payload = json.isDelta ? json.delta : json.data;
      const patchState: Partial<QuantersStoreState> = {
        isOnline: true,
        lastServerEtag: json.etag || s.lastServerEtag,
        collectionVersions: json.collectionVersions || s.collectionVersions,
      };

      if (payload && typeof payload === "object") {
        for (const key of DELTA_ARRAY_KEYS) {
          if (Array.isArray(payload[key])) {
            (patchState as Record<string, unknown>)[key] = payload[key];
          }
        }
        if (payload.settings && typeof payload.settings === "object") {
          patchState.settings = { ...s.settings, ...payload.settings };
        }
      }

      set(patchState);
      captureBaselineFromState(get());
      get().saveToLocalCache();
    } catch {
      // Silent background fallback
    }
  },

  syncWithServer: async (force = false) => {
    const s = get();
    s.saveToLocalCache();

    // If browser is offline or manual_offline strategy is active (unless forced)
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      set({
        isOnline: false,
        pendingSyncCount: s.pendingSyncCount + 1,
      });
      s.saveToLocalCache();
      return;
    }

    if (
      !force &&
      (s.settings.syncStrategy === "manual_offline" || s.userLowDataMode)
    ) {
      set({ pendingSyncCount: s.pendingSyncCount + 1 });
      s.saveToLocalCache();
      return;
    }

    const { itemDeltas, settingsPatch, hasChanges } = computeClientDeltas(s);

    // Quota-Saver: If nothing changed locally and not forced, only pull unseen server deltas
    if (!hasChanges && !force && s.pendingSyncCount === 0) {
      await get().pullExactUpdatesFromServer();
      return;
    }

    try {
      const resp = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemDeltas,
          data: settingsPatch ? { settings: settingsPatch } : {},
          clientVersions: s.collectionVersions,
        }),
      });
      if (resp.ok) {
        const json = await resp.json().catch(() => null);
        const patchState: Partial<QuantersStoreState> = {
          isOnline: true,
          pendingSyncCount: 0,
          lastSyncedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          lastServerEtag: json?.etag || s.lastServerEtag,
          collectionVersions: json?.collectionVersions || s.collectionVersions,
        };

        // Apply any concurrent server delta for collections modified on the server
        if (json?.serverDelta && typeof json.serverDelta === "object") {
          for (const key of DELTA_ARRAY_KEYS) {
            if (Array.isArray(json.serverDelta[key])) {
              (patchState as Record<string, unknown>)[key] =
                json.serverDelta[key];
            }
          }
          if (
            json.serverDelta.settings &&
            typeof json.serverDelta.settings === "object"
          ) {
            patchState.settings = {
              ...s.settings,
              ...json.serverDelta.settings,
            };
          }
        }

        set(patchState);
        captureBaselineFromState(get());
        get().saveToLocalCache();
      }
    } catch {
      // Offline resilient fallback: queue mutation locally for automatic replay when back online
      set({
        isOnline: false,
        pendingSyncCount: s.pendingSyncCount + 1,
      });
      get().saveToLocalCache();
    }
  },

  updateDepartmentMeta: (deptId, updates, reason) =>
    set((state) => {
      const target = state.departments.find((d) => d.id === deptId);
      if (!target) return state;
      const nextDepartments = state.departments.map((d) =>
        d.id === deptId ? { ...d, ...updates } : d
      );
      const headIds = new Set(nextDepartments.map((d) => d.headMemberId));
      const coIds = new Set(nextDepartments.map((d) => d.coManagerMemberId));
      const nextMembers = state.members.map((m) => {
        const filtered = m.roles.filter(
          (r) => r !== "Department Head" && r !== "Co-Manager"
        );
        const nextRoles: RoleTemplateName[] = [...filtered];
        if (headIds.has(m.id)) nextRoles.unshift("Department Head");
        if (coIds.has(m.id)) nextRoles.push("Co-Manager");
        if (nextRoles.length === 0) nextRoles.push("Member");
        return { ...m, roles: Array.from(new Set(nextRoles)) };
      });
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Super Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Settings Changed",
        targetLabel: `Department: ${target.name}`,
        oldValue: target.name,
        newValue: updates.name || target.name,
        reason,
      };
      return {
        departments: nextDepartments,
        members: nextMembers,
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  moveMemberDepartment: (memberId, toDeptId, reason, actorName = "Yasmine Bouzid (HR Head)") =>
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      const fromDept = state.departments.find((d) => d.id === member?.departmentId);
      const toDept = state.departments.find((d) => d.id === toDeptId);
      if (!member || !toDept || member.departmentId === toDeptId) return state;

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Department / Team Move",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: fromDept?.name || member.departmentId,
        newValue: toDept.name,
        reason,
      };

      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                departmentId: toDeptId,
                placementHistory: [
                  {
                    id: `ph-${Date.now()}`,
                    changeType: "Department Move",
                    fromName: fromDept?.name || m.departmentId,
                    toName: toDept.name,
                    reason,
                    actorName,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.placementHistory,
                ],
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  createTeam: (team) =>
    set((state) => {
      const nextTeams = [
        ...state.teams,
        {
          ...team,
          id: `team-${Date.now()}`,
          archived: false,
        },
      ];
      const leaderIds = new Set(
        nextTeams.filter((t) => !t.archived).map((t) => t.leaderMemberId)
      );
      const nextMembers = state.members.map((m) => {
        const filtered = m.roles.filter((r) => r !== "Team Leader");
        const nextRoles: RoleTemplateName[] = [...filtered];
        if (leaderIds.has(m.id)) nextRoles.push("Team Leader");
        if (nextRoles.length === 0) nextRoles.push("Member");
        return { ...m, roles: Array.from(new Set(nextRoles)) };
      });
      return {
        teams: nextTeams,
        members: nextMembers,
      };
    }),

  updateTeam: (teamId, updates) =>
    set((state) => {
      const nextTeams = state.teams.map((t) =>
        t.id === teamId ? { ...t, ...updates } : t
      );
      const leaderIds = new Set(
        nextTeams.filter((t) => !t.archived).map((t) => t.leaderMemberId)
      );
      const nextMembers = state.members.map((m) => {
        const filtered = m.roles.filter((r) => r !== "Team Leader");
        const nextRoles: RoleTemplateName[] = [...filtered];
        if (leaderIds.has(m.id)) nextRoles.push("Team Leader");
        if (nextRoles.length === 0) nextRoles.push("Member");
        return { ...m, roles: Array.from(new Set(nextRoles)) };
      });
      return {
        teams: nextTeams,
        members: nextMembers,
      };
    }),

  deleteOrArchiveTeam: (teamId, reason) =>
    set((state) => {
      const team = state.teams.find((t) => t.id === teamId);
      if (!team) return state;
      const canHardDelete = team.memberIds.length === 0;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Department / Team Move",
        targetLabel: `Scientific Team: ${team.name}`,
        oldValue: "Active Team",
        newValue: canHardDelete ? "Deleted (0 members)" : "Archived (has members)",
        reason,
      };
      return {
        teams: canHardDelete
          ? state.teams.filter((t) => t.id !== teamId)
          : state.teams.map((t) => (t.id === teamId ? { ...t, archived: true } : t)),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  addMemberToTeam: (memberId, teamId) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId
          ? { ...t, memberIds: Array.from(new Set([...t.memberIds, memberId])) }
          : { ...t, memberIds: t.memberIds.filter((id) => id !== memberId) }
      ),
      members: state.members.map((m) => (m.id === memberId ? { ...m, teamId } : m)),
    })),

  removeMemberFromTeam: (memberId, teamId, reason) =>
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      const team = state.teams.find((t) => t.id === teamId);
      if (!member || !team) return state;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Department / Team Move",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: team.name,
        newValue: "No Team",
        reason,
      };
      return {
        teams: state.teams.map((t) =>
          t.id === teamId ? { ...t, memberIds: t.memberIds.filter((id) => id !== memberId) } : t
        ),
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                teamId: undefined,
                placementHistory: [
                  {
                    id: `ph-${Date.now()}`,
                    changeType: "Team Removal",
                    fromName: team.name,
                    toName: "Unassigned",
                    reason,
                    actorName: state.activeAdminRole,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.placementHistory,
                ],
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  completeFirstTimeProfile: (payload) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === state.currentMemberId
          ? {
              ...m,
              fullName: payload.fullName || m.fullName,
              email: payload.email || m.email,
              phone: payload.phone || m.phone,
              avatarUrl: payload.avatarUrl || m.avatarUrl,
              major: payload.major || m.major,
              academicYear: payload.academicYear,
              tenure: payload.tenure,
              departmentId: payload.departmentId,
              teamId: payload.teamId,
              wilaya: payload.wilaya ?? m.wilaya,
              commune: payload.commune ?? m.commune,
              housingType: payload.housingType ?? m.housingType,
              commuteTime: payload.commuteTime ?? m.commuteTime,
              canStayLate: payload.canStayLate ?? m.canStayLate,
              hasLaptop: payload.hasLaptop ?? m.hasLaptop,
              pcCapability: payload.pcCapability ?? m.pcCapability,
              equipmentTags: payload.equipmentTags ?? m.equipmentTags,
              githubUrl: payload.githubUrl ?? m.githubUrl,
              linkedinUrl: payload.linkedinUrl ?? m.linkedinUrl,
              portfolioUrl: payload.portfolioUrl ?? m.portfolioUrl,
              cvUrl: payload.cvUrl ?? m.cvUrl,
              skills: payload.skills && payload.skills.length > 0 ? payload.skills : m.skills,
              availability: payload.availability,
              outsideActivitiesAndVolunteering: payload.outsideActivitiesAndVolunteering,
              declaresOtherStudentOrg: payload.declaresOtherStudentOrg,
              onboardingTicks: {
                ...m.onboardingTicks,
                profileComplete: true,
              },
            }
          : m
      ),
    })),

  updateMemberProfileSelf: (memberId, updates) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === memberId ? { ...m, ...updates } : m)),
    })),

  confirmTraineeToActive: (memberId, reason, actorName = "Yasmine Bouzid (HR Head)") =>
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: member.status,
        newValue: "Active",
        reason,
      };
      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: "Active",
                statusSince: "Oct 2026",
                statusHistory: [
                  {
                    id: `sh-${Date.now()}`,
                    fromStatus: m.status,
                    toStatus: "Active",
                    reason,
                    actorName,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.statusHistory,
                ],
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
        celebration: {
          open: true,
          type: "confirmation",
          title: "Official Member Confirmed!",
          subtitle: `${member.fullName} has completed the 3-month qualification and is now an Official Active Member of QUANTA.`,
          xpEarned: 50,
        },
      };
    }),

  assignBuddyToMember: (traineeId, buddyId) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === traineeId
          ? {
              ...m,
              buddyId,
              onboardingTicks: { ...m.onboardingTicks, buddyAssigned: true },
            }
          : m
      ),
    })),

  changeMemberStatus: ({
    memberId,
    toStatus,
    reason,
    actorName,
    decisionReference,
    graduationYear,
    suspensionEndDate,
  }) =>
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: member.status,
        newValue: toStatus,
        reason: decisionReference
          ? `${reason} (Decision Ref: ${decisionReference})`
          : reason,
      };
      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: toStatus,
                statusSince: new Date().toISOString().slice(0, 10),
                resignationManagerName: toStatus === "Resigned" ? actorName : m.resignationManagerName,
                resignationReason: toStatus === "Resigned" ? reason : m.resignationReason,
                removalReason: toStatus === "Removed" ? reason : m.removalReason,
                removalDecisionRef: toStatus === "Removed" ? decisionReference : m.removalDecisionRef,
                graduationYear: toStatus === "Alumni" ? graduationYear || "2026" : m.graduationYear,
                alumniAccessEnabled: toStatus === "Alumni" ? true : m.alumniAccessEnabled,
                suspensionEndDate: toStatus === "Suspended" ? suspensionEndDate : undefined,
                statusHistory: [
                  {
                    id: `sh-${Date.now()}`,
                    fromStatus: m.status,
                    toStatus,
                    reason,
                    actorName,
                    decisionReference,
                    graduationYear,
                    suspensionEndDate,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.statusHistory,
                ],
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  pauseOrResignMembershipSelf: ({
    memberId,
    action,
    motif,
    passwordConfirm,
    pauseUntilDate,
  }) => {
    const state = get();
    const member = state.members.find((m) => m.id === memberId);
    if (!member) return { ok: false, message: "Member account not found." };

    const cleanPass = passwordConfirm.trim();
    const isGoogleAuth = cleanPass === "GOOGLE_VERIFIED";
    const validPass =
      isGoogleAuth ||
      (member.password && cleanPass === member.password) ||
      cleanPass === "quanta2026" ||
      cleanPass === "123456";

    if (!validPass) {
      return {
        ok: false,
        message:
          "Incorrect password. Please enter your correct account password or verify with Google to confirm.",
      };
    }

    if (!motif.trim()) {
      return {
        ok: false,
        message: "Please provide a reason (motif) for pausing or resigning.",
      };
    }

    const toStatus: MemberStatus = action === "pause" ? "Inactive" : "Resigned";
    const actionLabel =
      action === "pause" ? "Paused (Frozen)" : "Voluntary Resignation";

    const audit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: member.fullName,
      actorRole: member.roles[0] || "Member",
      timestamp: nowStamp(),
      actionCategory: "Status Change",
      targetLabel: `${member.fullName} (${member.quanterId})`,
      oldValue: member.status,
      newValue: toStatus,
      reason: `${actionLabel}: ${motif}${
        pauseUntilDate ? ` (Return: ${pauseUntilDate})` : ""
      }`,
    };

    set((s) => ({
      members: s.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              status: toStatus,
              statusSince: new Date().toISOString().slice(0, 10),
              resignationManagerName:
                action === "resign" ? "Self (Voluntary)" : undefined,
              resignationReason: action === "resign" ? motif : undefined,
              suspensionEndDate: action === "pause" ? pauseUntilDate : undefined,
              statusHistory: [
                {
                  id: `sh-${Date.now()}`,
                  fromStatus: m.status,
                  toStatus,
                  reason: `${actionLabel}: ${motif}`,
                  actorName: member.fullName,
                  suspensionEndDate: pauseUntilDate,
                  date: new Date().toISOString().slice(0, 10),
                },
                ...m.statusHistory,
              ],
            }
          : m
      ),
      auditLogs: [audit, ...s.auditLogs],
    }));

    get().saveToLocalCache();
    get().syncWithServer().catch(() => {});

    return {
      ok: true,
      message:
        action === "pause"
          ? "Membership paused successfully. Your status is now Inactive."
          : "Resignation submitted successfully. Your status is now Resigned.",
    };
  },

  submitGrievance: ({
    subject,
    category,
    urgency,
    details,
    isAnonymous,
  }) => {
    const state = get();
    const member = state.members.find((m) => m.id === state.currentMemberId);
    if (!subject.trim() || !details.trim()) {
      return {
        ok: false,
        message: "Please provide both a subject and grievance details.",
      };
    }

    const newGrievance: MemberGrievance = {
      id: `grv-${Date.now()}`,
      memberId: isAnonymous ? "anonymous" : member?.id || "unknown",
      memberName: isAnonymous
        ? "Confidential Quanter"
        : member?.fullName || "Club Member",
      memberEmail: isAnonymous
        ? "confidential@univ-alger.dz"
        : member?.email || "",
      memberDepartmentId: isAnonymous ? undefined : member?.departmentId,
      isAnonymous,
      subject: subject.trim(),
      category,
      urgency,
      details: details.trim(),
      submittedAt: nowStamp(),
      status: "Pending HR Review",
    };

    const audit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: isAnonymous ? "Anonymous Member" : member?.fullName || "Member",
      actorRole: "Member",
      timestamp: nowStamp(),
      actionCategory: "Settings Changed",
      targetLabel: `Confidential Grievance: ${subject}`,
      oldValue: "None",
      newValue: `Submitted (${urgency})`,
      reason: `HR Confidential Complaint filed under ${category}`,
    };

    set((s) => ({
      grievances: [newGrievance, ...s.grievances],
      auditLogs: [audit, ...s.auditLogs],
    }));

    get().saveToLocalCache();
    get().syncWithServer().catch(() => {});

    return {
      ok: true,
      message:
        "Your grievance has been securely submitted to the HR Department. It is strictly confidential.",
    };
  },

  resolveGrievance: (
    grievanceId,
    status,
    hrNotes,
    actorName = "Yasmine Bouzid (HR Head)"
  ) => {
    set((s) => {
      const target = s.grievances.find((g) => g.id === grievanceId);
      if (!target) return s;

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: s.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Settings Changed",
        targetLabel: `Grievance: ${target.subject}`,
        oldValue: target.status,
        newValue: status,
        reason: hrNotes || "HR Status update on grievance",
      };

      return {
        grievances: s.grievances.map((g) =>
          g.id === grievanceId
            ? {
                ...g,
                status,
                hrNotes,
                hrHandledBy: actorName,
                resolvedAt: ["Resolved", "Dismissed"].includes(status)
                  ? nowStamp()
                  : undefined,
              }
            : g
        ),
        auditLogs: [audit, ...s.auditLogs],
      };
    });

    get().saveToLocalCache();
    get().syncWithServer().catch(() => {});
  },

  reactivateFormerMember: (memberId, toStatus, reason, actorName = "Yasmine Bouzid (HR Head)") =>
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: member.status,
        newValue: toStatus,
        reason: `Reactivated: ${reason}`,
      };
      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: toStatus,
                statusSince: new Date().toISOString().slice(0, 10),
                statusHistory: [
                  {
                    id: `sh-${Date.now()}`,
                    fromStatus: m.status,
                    toStatus,
                    reason: `Reactivated: ${reason}`,
                    actorName,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.statusHistory,
                ],
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  createInvitations: (emails, prefilledDepartmentId) =>
    set((state) => {
      const newInvites: Invitation[] = emails
        .map((e) => e.trim())
        .filter(Boolean)
        .map((email, idx) => ({
          id: `inv-${Date.now()}-${idx}`,
          email,
          prefilledDepartmentId,
          token: `INV-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          state: "Sent",
          sentAt: new Date().toISOString().slice(0, 10),
          expiresAt: new Date(Date.now() + state.settings.invitationValidityDays * 86400000)
            .toISOString()
            .slice(0, 10),
          invitedBy: "Yasmine Bouzid (HR Head)",
        }));
      return { invitations: [...newInvites, ...state.invitations] };
    }),

  resendInvitation: (invitationId) =>
    set((state) => ({
      invitations: state.invitations.map((inv) =>
        inv.id === invitationId
          ? {
              ...inv,
              state: "Sent",
              sentAt: new Date().toISOString().slice(0, 10),
            }
          : inv
      ),
    })),

  cancelInvitation: (invitationId) =>
    set((state) => ({
      invitations: state.invitations.map((inv) =>
        inv.id === invitationId ? { ...inv, state: "Cancelled" } : inv
      ),
    })),

  registerForWorkshop: (workshopId, memberId) => {
    set((state) => ({
      workshops: state.workshops.map((w) => {
        if (w.id !== workshopId) return w;
        if (w.registeredMemberIds.includes(memberId)) return w;
        if (w.seatsLeft <= 0) {
          return {
            ...w,
            waitlistMemberIds: Array.from(new Set([...w.waitlistMemberIds, memberId])),
          };
        }
        return {
          ...w,
          seatsLeft: Math.max(0, w.seatsLeft - 1),
          registeredMemberIds: [...w.registeredMemberIds, memberId],
        };
      }),
    }));
    get().syncWithServer().catch(() => {});
  },

  cancelWorkshopRegistration: (workshopId, memberId) => {
    set((state) => ({
      workshops: state.workshops.map((w) => {
        if (w.id !== workshopId) return w;
        if (!w.registeredMemberIds.includes(memberId)) return w;
        return {
          ...w,
          seatsLeft: w.seatsLeft + 1,
          registeredMemberIds: w.registeredMemberIds.filter((id) => id !== memberId),
        };
      }),
    }));
    get().syncWithServer().catch(() => {});
  },

  verifyWorkshopCheckIn: (workshopId, memberId, codeOrToken, method) => {
    const state = get();
    const ws = state.workshops.find((w) => w.id === workshopId) || state.workshops[0];
    const member = state.members.find((m) => m.id === memberId);
    if (!ws || !member) return { ok: false, message: "Session or member not found." };

    const alreadyCheckedIn = ws.attendanceRecords.some(
      (r) => r.memberId === memberId && r.status === "Present"
    );
    if (alreadyCheckedIn) {
      return { ok: false, message: "You have already checked in for this session." };
    }

    const cleanInput = codeOrToken.trim().toUpperCase();
    const valid =
      cleanInput === "SCAN-OK" ||
      cleanInput === ws.liveSixDigitCode ||
      cleanInput === ws.liveQrToken.toUpperCase() ||
      cleanInput.length === 6;

    if (!valid) {
      return { ok: false, message: "Invalid or expired session code. Please verify with the organizer." };
    }

    const newRecord = {
      id: `att-${Date.now()}`,
      workshopId: ws.id,
      memberId: member.id,
      memberName: member.fullName,
      quanterId: member.quanterId,
      method,
      checkedInAt: "Just now",
      status: "Present" as const,
    };

    const newLedgerEntry: PointsLedgerEntry = {
      id: `led-${Date.now()}`,
      memberId: member.id,
      memberName: member.fullName,
      amount: ws.xpReward,
      ruleLabel: "Workshop Attendance",
      reason: `Verified check-in at '${ws.title}' (${method})`,
      source: "Workshop",
      actorName: "System (Live QR Check-In)",
      date: new Date().toISOString().slice(0, 10),
      appealStatus: "None",
    };

    set((s) => ({
      workshops: s.workshops.map((w) =>
        w.id === ws.id
          ? { ...w, attendanceRecords: [newRecord, ...w.attendanceRecords] }
          : w
      ),
      members: s.members.map((m) =>
        m.id === member.id
          ? {
              ...m,
              xpTotal: m.xpTotal + ws.xpReward,
              xpSeason: m.xpSeason + ws.xpReward,
              xpMonth: m.xpMonth + ws.xpReward,
              workshopsCompletedCount: m.workshopsCompletedCount + 1,
              onboardingTicks: { ...m.onboardingTicks, firstWorkshopAttended: true },
            }
          : m
      ),
      ledger: [newLedgerEntry, ...s.ledger],
      celebration: {
        open: true,
        type: "checkin",
        title: "Attendance Verified!",
        subtitle: `You checked in to '${ws.title}' at ${ws.location}.`,
        xpEarned: ws.xpReward,
        badgeName: "Python Explorer",
      },
    }));

    return { ok: true, message: `Checked in! +${ws.xpReward} XP added.` };
  },

  correctAttendance: (workshopId, memberId, status, reason, actorName = "Ayoub Sarri (Check-in Operator)") =>
    set((state) => {
      const ws = state.workshops.find((w) => w.id === workshopId);
      const member = state.members.find((m) => m.id === memberId);
      if (!ws || !member) return state;

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Attendance Correction",
        targetLabel: `${member.fullName} · ${ws.title}`,
        oldValue: "Unrecorded / Previous",
        newValue: status,
        reason,
      };

      const existing = ws.attendanceRecords.find((r) => r.memberId === memberId);
      const updatedRecords = existing
        ? ws.attendanceRecords.map((r) =>
            r.memberId === memberId
              ? { ...r, status, correctionReason: reason, correctedBy: actorName }
              : r
          )
        : [
            {
              id: `att-${Date.now()}`,
              workshopId,
              memberId,
              memberName: member.fullName,
              quanterId: member.quanterId,
              method: "Manual Correction" as const,
              checkedInAt: nowStamp(),
              status,
              correctionReason: reason,
              correctedBy: actorName,
            },
            ...ws.attendanceRecords,
          ];

      return {
        workshops: state.workshops.map((w) =>
          w.id === workshopId ? { ...w, attendanceRecords: updatedRecords } : w
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  createWorkshop: (ws) => {
    const newWs: Workshop = {
      id: `ws-${Date.now()}`,
      title: ws.title,
      activityType: ws.activityType || "Workshop",
      category: ws.category,
      iconType: ws.iconType || "python",
      level: ws.level,
      instructor: ws.instructor,
      dateLabel: ws.dateLabel,
      timeRange: ws.timeRange,
      location: ws.location,
      capacity: ws.capacity,
      seatsLeft: ws.capacity,
      xpReward: ws.xpReward,
      status: ws.status || "Published",
      description: ws.description,
      objectives: ["Hands-on practical session", "Verified skill assessment"],
      materials: ["Laptop"],
      linkedBadgeId: ws.linkedBadgeId,
      liveQrToken: `QUANTA-WS-${Date.now()}`,
      liveSixDigitCode: String(Math.floor(100000 + Math.random() * 900000)),
      registeredMemberIds: [],
      waitlistMemberIds: [],
      attendanceRecords: [],
    };
    set((state) => ({
      workshops: [newWs, ...state.workshops],
    }));
    get().syncWithServer().catch(() => {});
  },

  updateWorkshopStatus: (workshopId, status) => {
    set((state) => ({
      workshops: state.workshops.map((w) => (w.id === workshopId ? { ...w, status } : w)),
    }));
    get().syncWithServer().catch(() => {});
  },

  rotateWorkshopQrCode: (workshopId) =>
    set((state) => ({
      workshops: state.workshops.map((w) =>
        w.id === workshopId
          ? {
              ...w,
              liveQrToken: `QUANTA-WS-${w.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
              liveSixDigitCode: String(Math.floor(100000 + Math.random() * 900000)),
            }
          : w
      ),
    })),

  addWorkshopCategory: (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.workshopCategories.includes(trimmed)) return state;
      return { workshopCategories: [...state.workshopCategories, trimmed] };
    });
    get().saveToLocalCache();
  },

  deleteWorkshopCategory: (category: string) => {
    set((state) => ({
      workshopCategories: state.workshopCategories.filter((c) => c !== category),
    }));
    get().saveToLocalCache();
  },

  addBadgeCategory: (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.badgeCategories.includes(trimmed)) return state;
      return { badgeCategories: [...state.badgeCategories, trimmed] };
    });
    get().saveToLocalCache();
  },

  deleteBadgeCategory: (category: string) => {
    set((state) => ({
      badgeCategories: state.badgeCategories.filter((c) => c !== category),
    }));
    get().saveToLocalCache();
  },

  createTask: (task) =>
    set((state) => {
      const assignees = task.assigneeIds.map((id) => {
        const m = state.members.find((mem) => mem.id === id);
        return {
          memberId: id,
          memberName: m?.fullName || "Member",
          roleInTask: "Assignee",
          receiptConfirmed: false,
          status: "To do" as const,
          proposedScore: task.proposedScore,
        };
      });
      const newTask: ClubTask = {
        id: `task-${Date.now()}`,
        title: task.title,
        description: task.description,
        category: task.category,
        departmentId: task.departmentId,
        teamId: task.teamId,
        linkedWorkshopOrEvent: task.linkedWorkshopOrEvent,
        deadline: task.deadline,
        urgencyLabel: "To do",
        locationOrShift: task.locationOrShift,
        proposedScore: task.proposedScore,
        checklist: [],
        assignees,
        matrixPublished: false,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return {
        tasks: [newTask, ...state.tasks],
        members: state.members.map((m) =>
          task.assigneeIds.includes(m.id)
            ? {
                ...m,
                onboardingTicks: { ...m.onboardingTicks, firstTaskBeforeDay30: true },
              }
            : m
        ),
      };
    }),

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const nextScore = updates.proposedScore ?? t.proposedScore;
        const nextAssignees = updates.assigneeIds
          ? updates.assigneeIds.map((id) => {
              const existing = t.assignees.find((a) => a.memberId === id);
              if (existing) {
                return { ...existing, proposedScore: nextScore };
              }
              const m = state.members.find((mem) => mem.id === id);
              return {
                memberId: id,
                memberName: m?.fullName || "Member",
                roleInTask: "Assignee",
                receiptConfirmed: false,
                status: "To do" as const,
                proposedScore: nextScore,
              };
            })
          : t.assignees.map((a) => ({ ...a, proposedScore: nextScore }));
        return {
          ...t,
          title: updates.title ?? t.title,
          description: updates.description ?? t.description,
          category: updates.category ?? t.category,
          deadline: updates.deadline ?? t.deadline,
          locationOrShift: updates.locationOrShift ?? t.locationOrShift,
          proposedScore: nextScore,
          assignees: nextAssignees,
        };
      }),
    })),

  confirmTaskReceipt: (taskId, memberId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignees: t.assignees.map((a) =>
                a.memberId === memberId ? { ...a, receiptConfirmed: true, status: "In progress" } : a
              ),
            }
          : t
      ),
    })),

  deliverTask: (taskId, memberId, proofUrlOrNote) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignees: t.assignees.map((a) =>
                a.memberId === memberId
                  ? { ...a, status: "Delivered", proofUrlOrNote, receiptConfirmed: true }
                  : a
              ),
            }
          : t
      ),
    })),

  validateAndScoreTask: ({
    taskId,
    memberId,
    scoreType,
    awardedScore,
    feedback,
    validatorName = "Lotfi Benali (Dept Head)",
  }) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      const member = state.members.find((m) => m.id === memberId);
      if (!task || !member) return state;

      const newLedger: PointsLedgerEntry = {
        id: `led-${Date.now()}`,
        memberId,
        memberName: member.fullName,
        amount: awardedScore,
        ruleLabel: `Task Validated (${scoreType})`,
        reason: `${task.title} — Feedback: ${feedback}`,
        source: "Task",
        actorName: validatorName,
        date: new Date().toISOString().slice(0, 10),
        appealStatus: "None",
      };

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: validatorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Task Validation",
        targetLabel: `${member.fullName} · ${task.title}`,
        oldValue: "Delivered",
        newValue: `Validated (+${awardedScore} XP · ${scoreType})`,
        reason: feedback,
      };

      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                urgencyLabel: "Completed",
                assignees: t.assignees.map((a) =>
                  a.memberId === memberId
                    ? {
                        ...a,
                        status: "Validated",
                        scoreType,
                        awardedScore,
                        managerFeedback: feedback,
                        validatedBy: validatorName,
                        validatedAt: new Date().toISOString().slice(0, 10),
                      }
                    : a
                ),
              }
            : t
        ),
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                xpTotal: m.xpTotal + awardedScore,
                xpSeason: m.xpSeason + awardedScore,
                xpMonth: m.xpMonth + awardedScore,
              }
            : m
        ),
        ledger: [newLedger, ...state.ledger],
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  publishTaskMatrix: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, matrixPublished: true } : t)),
    })),

  archiveTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, archived: true, urgencyLabel: "Completed" } : t
      ),
    })),

  unarchiveTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, archived: false } : t)),
    })),

  archiveAllCompletedTasks: () =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.urgencyLabel === "Completed" || t.assignees.every((a) => a.status === "Validated")
          ? { ...t, archived: true, urgencyLabel: "Completed" }
          : t
      ),
    })),

  bulkScoreMembers: (memberIds, points, reason, actorName = "Lotfi Benali") =>
    set((state) => {
      const newEntries: PointsLedgerEntry[] = memberIds.map((id, idx) => {
        const m = state.members.find((mem) => mem.id === id);
        return {
          id: `led-bulk-${Date.now()}-${idx}`,
          memberId: id,
          memberName: m?.fullName || "Member",
          amount: points,
          ruleLabel: "Bulk Event / Task Score",
          reason,
          source: "Task",
          actorName,
          date: new Date().toISOString().slice(0, 10),
          appealStatus: "None",
        };
      });
      return {
        members: state.members.map((m) =>
          memberIds.includes(m.id)
            ? {
                ...m,
                xpTotal: m.xpTotal + points,
                xpSeason: m.xpSeason + points,
                xpMonth: m.xpMonth + points,
              }
            : m
        ),
        ledger: [...newEntries, ...state.ledger],
      };
    }),

  addManualPointsEntry: (memberId, amount, ruleLabel, reason, actorName = "Yasmine Bouzid (HR Head)") =>
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;
      const entry: PointsLedgerEntry = {
        id: `led-${Date.now()}`,
        memberId,
        memberName: member.fullName,
        amount,
        ruleLabel,
        reason,
        source: "Manual",
        actorName,
        date: new Date().toISOString().slice(0, 10),
        appealStatus: "None",
      };
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Points Entry / Reversal",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: `${member.xpTotal} XP`,
        newValue: `${member.xpTotal + amount} XP (${amount > 0 ? `+${amount}` : amount})`,
        reason: `${ruleLabel}: ${reason}`,
      };
      return {
        ledger: [entry, ...state.ledger],
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                xpTotal: m.xpTotal + amount,
                xpSeason: m.xpSeason + amount,
                xpMonth: m.xpMonth + amount,
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  reversePointsEntry: (entryId, reason, actorName = "Yasmine Bouzid (HR Head)") =>
    set((state) => {
      const target = state.ledger.find((l) => l.id === entryId);
      if (!target || target.reversedByEntryId) return state;
      const reversalId = `led-rev-${Date.now()}`;
      const reversalEntry: PointsLedgerEntry = {
        id: reversalId,
        memberId: target.memberId,
        memberName: target.memberName,
        amount: -target.amount,
        ruleLabel: `Reversal of: ${target.ruleLabel}`,
        reason: `Reversed (${reason})`,
        source: "Reversal",
        actorName,
        date: new Date().toISOString().slice(0, 10),
        appealStatus: "None",
      };
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Points Entry / Reversal",
        targetLabel: `${target.memberName}`,
        oldValue: `${target.amount > 0 ? `+${target.amount}` : target.amount} XP (${target.ruleLabel})`,
        newValue: `Reversed (${-target.amount} XP)`,
        reason,
      };
      return {
        ledger: [
          reversalEntry,
          ...state.ledger.map((l) =>
            l.id === entryId ? { ...l, reversedByEntryId: reversalId } : l
          ),
        ],
        members: state.members.map((m) =>
          m.id === target.memberId
            ? {
                ...m,
                xpTotal: m.xpTotal - target.amount,
                xpSeason: m.xpSeason - target.amount,
                xpMonth: m.xpMonth - target.amount,
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  submitPointsAppeal: (entryId, appealReason) =>
    set((state) => ({
      ledger: state.ledger.map((l) =>
        l.id === entryId ? { ...l, appealStatus: "Pending", appealReason } : l
      ),
    })),

  resolvePointsAppeal: (entryId, decision, reason) => {
    if (decision === "Accepted") {
      get().reversePointsEntry(entryId, `Appeal Accepted: ${reason}`);
    }
    set((state) => ({
      ledger: state.ledger.map((l) =>
        l.id === entryId ? { ...l, appealStatus: decision } : l
      ),
    }));
  },

  createPointRule: (rule) => {
    const newRule: PointRule = {
      id: `pr-${Date.now()}`,
      ...rule,
    };
    set((state) => ({
      pointRules: [...state.pointRules, newRule],
    }));
    get().saveToLocalCache();
    get().syncWithServer().catch(() => {});
  },

  updatePointRule: (ruleId, updatesOrPoints, label) => {
    set((state) => ({
      pointRules: state.pointRules.map((r) => {
        if (r.id !== ruleId) return r;
        if (typeof updatesOrPoints === "number") {
          return { ...r, points: updatesOrPoints, ...(label ? { label } : {}) };
        }
        return { ...r, ...updatesOrPoints };
      }),
    }));
    get().saveToLocalCache();
    get().syncWithServer().catch(() => {});
  },

  deletePointRule: (ruleId) => {
    set((state) => ({
      pointRules: state.pointRules.filter((r) => r.id !== ruleId),
    }));
    get().saveToLocalCache();
    get().syncWithServer().catch(() => {});
  },

  publishMonthlyHonours: (motmMemberId, championMemberIds, actorName = "Yasmine Bouzid (HR Head)") =>
    set((state) => {
      const motm = state.members.find((m) => m.id === motmMemberId);
      if (!motm) return state;
      const newEntry: PointsLedgerEntry = {
        id: `led-motm-${Date.now()}`,
        memberId: motm.id,
        memberName: motm.fullName,
        amount: 50,
        ruleLabel: "Member of the Month",
        reason: "Published Monthly Club-Wide Member of the Month (+50 XP)",
        source: "Monthly Honour",
        actorName,
        date: new Date().toISOString().slice(0, 10),
        appealStatus: "None",
      };
      return {
        members: state.members.map((m) => {
          const isMotm = m.id === motmMemberId;
          const isChamp = championMemberIds.includes(m.id);
          const cleanLabels: RecognitionLabel[] = m.recognitionLabels.filter(
            (l) => l !== "Member of the Month" && l !== "Department Champion"
          );
          if (isMotm) cleanLabels.push("Member of the Month");
          if (isChamp) cleanLabels.push("Department Champion");
          return {
            ...m,
            recognitionLabels: cleanLabels,
            xpTotal: isMotm ? m.xpTotal + 50 : m.xpTotal,
            xpSeason: isMotm ? m.xpSeason + 50 : m.xpSeason,
            xpMonth: isMotm ? m.xpMonth + 50 : m.xpMonth,
          };
        }),
        ledger: [newEntry, ...state.ledger],
        celebration: {
          open: true,
          type: "motm",
          title: "Member of the Month!",
          subtitle: `${motm.fullName} has been crowned QUANTA Member of the Month (+50 XP) alongside 6 Department Champions!`,
          xpEarned: 50,
        },
      };
    }),

  createBadge: (badge) =>
    set((state) => ({
      badges: [
        {
          ...badge,
          id: `badge-${Date.now()}`,
          memberState: "Locked",
          progressPercent: 0,
          awardedCount: 0,
          archived: false,
        },
        ...state.badges,
      ],
    })),

  awardBadgeManually: (badgeId, memberIds, reasonOrNote, actorName = "Yasmine Bouzid (HR Head)") =>
    set((state) => {
      const badge = state.badges.find((b) => b.id === badgeId);
      if (!badge) return state;

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Badge Award / Revoke",
        targetLabel: `Badge: ${badge.name} (${memberIds.length} member(s))`,
        oldValue: "Locked / In Progress",
        newValue: `Unlocked (+${badge.xpReward} XP)`,
        reason: reasonOrNote,
      };

      return {
        badges: state.badges.map((b) =>
          b.id === badgeId
            ? {
                ...b,
                memberState: memberIds.includes(state.currentMemberId) ? "Unlocked" : b.memberState,
                progressPercent: memberIds.includes(state.currentMemberId) ? 100 : b.progressPercent,
                awardedCount: b.awardedCount + memberIds.length,
                awardedDate: "Today",
              }
            : b
        ),
        members: state.members.map((m) =>
          memberIds.includes(m.id)
            ? {
                ...m,
                badgeIds: Array.from(new Set([...m.badgeIds, badgeId])),
                xpTotal: m.xpTotal + badge.xpReward,
                xpSeason: m.xpSeason + badge.xpReward,
                xpMonth: m.xpMonth + badge.xpReward,
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
        celebration: {
          open: true,
          type: "badge",
          title: "Achievement Unlocked!",
          subtitle: `Awarded '${badge.name}' badge — ${reasonOrNote}`,
          xpEarned: badge.xpReward,
          badgeName: badge.name,
        },
      };
    }),

  revokeBadge: (badgeId, memberId, reason, actorName = "Yasmine Bouzid (HR Head)") =>
    set((state) => {
      const badge = state.badges.find((b) => b.id === badgeId);
      const member = state.members.find((m) => m.id === memberId);
      if (!badge || !member) return state;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Badge Award / Revoke",
        targetLabel: `${member.fullName} · ${badge.name}`,
        oldValue: "Unlocked",
        newValue: "Revoked",
        reason,
      };
      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? { ...m, badgeIds: m.badgeIds.filter((id) => id !== badgeId) }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  updateBadge: (id, updates) => {
    set((state) => ({
      badges: state.badges.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
    get().syncWithServer().catch(() => {});
  },

  deleteOrArchiveBadge: (badgeId, reason) =>
    set((state) => {
      const badge = state.badges.find((b) => b.id === badgeId);
      if (!badge) return state;
      const canDelete = badge.awardedCount === 0;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Badge Award / Revoke",
        targetLabel: `Badge: ${badge.name}`,
        oldValue: "Active",
        newValue: canDelete ? "Deleted (0 awards)" : "Archived (already awarded)",
        reason,
      };
      return {
        badges: canDelete
          ? state.badges.filter((b) => b.id !== badgeId)
          : state.badges.map((b) => (b.id === badgeId ? { ...b, archived: true } : b)),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  createBadgeExam: (examData) => {
    const newExam: BadgeExam = {
      ...examData,
      id: `exam-${Date.now()}`,
      attemptsUsed: 0,
      totalQuestionsCount: examData.questions?.length || 0,
    };
    set((state) => ({
      exams: [...state.exams, newExam],
    }));
    get().syncWithServer().catch(() => {});
  },

  updateBadgeExam: (id, updates) => {
    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === id
          ? {
              ...e,
              ...updates,
              totalQuestionsCount: updates.questions ? updates.questions.length : e.totalQuestionsCount,
            }
          : e
      ),
    }));
    get().syncWithServer().catch(() => {});
  },

  deleteBadgeExam: (id) => {
    set((state) => ({
      exams: state.exams.filter((e) => e.id !== id),
    }));
    get().syncWithServer().catch(() => {});
  },

  completeBadgeExam: (examId, scorePercent) =>
    set((state) => {
      const exam = state.exams.find((e) => e.id === examId);
      if (!exam) return state;
      const passed = scorePercent >= exam.passingScorePercent;
      if (!passed) {
        return {
          exams: state.exams.map((e) =>
            e.id === examId ? { ...e, attemptsUsed: e.attemptsUsed + 1 } : e
          ),
        };
      }

      const newCompletion: ExamCompletionRecord = {
        id: `comp-${Date.now()}`,
        examId,
        badgeId: exam.badgeId,
        memberId: state.currentMemberId,
        scorePercent,
        passed: true,
        completedAt: new Date().toISOString().slice(0, 10),
      };

      const targetBadge = state.badges.find((b) => b.id === exam.badgeId);
      const isDual =
        targetBadge?.requirementType === "both" ||
        (targetBadge?.earningMethods.includes("exam") && targetBadge?.earningMethods.includes("project"));

      // Check if project is approved
      const projectApproved = state.projectSubmissions.some(
        (s) => s.memberId === state.currentMemberId && s.badgeId === exam.badgeId && s.status === "Approved"
      );

      const fullyUnlocked = !isDual || projectApproved;
      const xpToAward = fullyUnlocked ? exam.xpReward : Math.round(exam.xpReward / 2);

      return {
        exams: state.exams.map((e) =>
          e.id === examId ? { ...e, attemptsUsed: e.attemptsUsed + 1 } : e
        ),
        examCompletions: [...(state.examCompletions || []), newCompletion],
        badges: state.badges.map((b) =>
          b.id === exam.badgeId
            ? {
                ...b,
                memberState: fullyUnlocked ? "Unlocked" : "In Progress",
                progressPercent: fullyUnlocked ? 100 : 50,
                awardedDate: fullyUnlocked ? "Today" : b.awardedDate,
              }
            : b
        ),
        members: state.members.map((m) =>
          m.id === state.currentMemberId
            ? {
                ...m,
                xpTotal: m.xpTotal + xpToAward,
                xpSeason: m.xpSeason + xpToAward,
                xpMonth: m.xpMonth + xpToAward,
                badgeIds: fullyUnlocked
                  ? Array.from(new Set([...m.badgeIds, exam.badgeId]))
                  : m.badgeIds,
              }
            : m
        ),
        celebration: {
          open: true,
          type: "badge",
          title: fullyUnlocked ? "Achievement Unlocked!" : "Step 1 of 2 Complete!",
          subtitle: fullyUnlocked
            ? `You passed '${exam.title}' with ${scorePercent}% and unlocked the verified badge!`
            : `You passed '${exam.title}' with ${scorePercent}%! Step 1 of 2 completed. Now submit your project to unlock the badge.`,
          xpEarned: xpToAward,
          badgeName: exam.title,
        },
      };
    }),

  submitBadgeProject: (submission) =>
    set((state) => ({
      projectSubmissions: [
        {
          ...submission,
          id: `sub-${Date.now()}`,
          submittedAt: new Date().toISOString().slice(0, 10),
          status: "Pending Review",
        },
        ...state.projectSubmissions,
      ],
      members: state.members.map((m) =>
        m.id === submission.memberId
          ? { ...m, projectsCompletedCount: m.projectsCompletedCount + 1 }
          : m
      ),
    })),

  reviewProjectSubmission: (submissionId, status, comment) =>
    set((state) => {
      const sub = state.projectSubmissions.find((s) => s.id === submissionId);
      if (!sub) return state;
      const badge = state.badges.find((b) => b.id === sub.badgeId);
      const isDual =
        badge?.requirementType === "both" ||
        (badge?.earningMethods.includes("exam") && badge?.earningMethods.includes("project"));

      // Check if exam is passed
      const examPassed = (state.examCompletions || []).some(
        (c) => c.memberId === sub.memberId && (c.badgeId === sub.badgeId || c.examId === badge?.linkedExamId) && c.passed
      );

      const fullyUnlocked = status === "Approved" && (!isDual || examPassed);
      const baseReward = badge?.xpReward || 120;
      const xp = status === "Approved" ? (fullyUnlocked ? baseReward : Math.round(baseReward / 2)) : 0;

      return {
        projectSubmissions: state.projectSubmissions.map((s) =>
          s.id === submissionId ? { ...s, status, reviewerComment: comment } : s
        ),
        badges:
          status === "Approved"
            ? state.badges.map((b) =>
                b.id === sub.badgeId
                  ? {
                      ...b,
                      memberState: fullyUnlocked ? "Unlocked" : "In Progress",
                      progressPercent: fullyUnlocked ? 100 : 50,
                      awardedDate: fullyUnlocked ? "Today" : b.awardedDate,
                    }
                  : b
              )
            : state.badges,
        members:
          status === "Approved"
            ? state.members.map((m) =>
                m.id === sub.memberId
                  ? {
                      ...m,
                      xpTotal: m.xpTotal + xp,
                      xpSeason: m.xpSeason + xp,
                      xpMonth: m.xpMonth + xp,
                      badgeIds: fullyUnlocked
                        ? Array.from(new Set([...m.badgeIds, sub.badgeId]))
                        : m.badgeIds,
                    }
                  : m
              )
            : state.members,
      };
    }),

  submitProposal: (proposal) =>
    set((state) => {
      const member = state.members.find((m) => m.id === state.currentMemberId);
      const reviewerScope =
        proposal.type === "Internal Law Amendment"
          ? "Executive Board (2/3 Quorum)"
          : proposal.type === "Event" || proposal.type === "Collaboration"
          ? "Executive Board"
          : "Department Head";

      const newProp: Proposal = {
        id: `prop-${Date.now()}`,
        type: proposal.type,
        title: proposal.title,
        description: proposal.description,
        submitterId: state.currentMemberId,
        submitterName: member?.fullName || "Ayoub Sarri",
        expectedDate: proposal.expectedDate,
        location: proposal.location,
        specificFields: proposal.specificFields,
        state: "Submitted",
        reviewerScope,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { proposals: [newProp, ...state.proposals] };
    }),

  reviewProposal: (proposalId, newState, comment, convertToWorkshop = false) =>
    set((state) => {
      const prop = state.proposals.find((p) => p.id === proposalId);
      if (!prop) return state;

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Executive / Head Reviewer",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Proposal Decision",
        targetLabel: `${prop.type}: ${prop.title}`,
        oldValue: prop.state,
        newValue: convertToWorkshop ? "Approved & Converted to Workshop" : newState,
        reason: comment,
      };

      const newWorkshops =
        convertToWorkshop && newState === "Approved"
          ? [
              {
                id: `ws-conv-${Date.now()}`,
                title: prop.title,
                category: "General" as const,
                iconType: "python" as const,
                level: (prop.specificFields.level as WorkshopLevel) || "Beginner",
                instructor: prop.specificFields.instructor || prop.submitterName,
                dateLabel: prop.expectedDate || "Upcoming",
                timeRange: "14:00 - 17:00",
                location: prop.location || "Faculty of Sciences",
                capacity: Number(prop.specificFields.capacity) || 30,
                seatsLeft: Number(prop.specificFields.capacity) || 30,
                xpReward: 120,
                status: "Published" as const,
                description: prop.description,
                objectives: [prop.specificFields.objectives || "Converted from approved member proposal"],
                materials: [prop.specificFields.materialsNeeded || "Standard kit"],
                liveQrToken: `QUANTA-PROP-${Date.now()}`,
                liveSixDigitCode: String(Math.floor(100000 + Math.random() * 900000)),
                registeredMemberIds: [],
                waitlistMemberIds: [],
                attendanceRecords: [],
              },
              ...state.workshops,
            ]
          : state.workshops;

      return {
        proposals: state.proposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                state: newState,
                reviewerComment: comment,
                convertedToId: convertToWorkshop ? `ws-conv` : p.convertedToId,
              }
            : p
        ),
        workshops: newWorkshops,
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  sendClubMessage: ({ recipientScope, priority, title, body, inApp, email }) =>
    set((state) => {
      const newMsg: ClubMessage = {
        id: `msg-${Date.now()}`,
        senderLabel: state.activeAdminRole === "HR Head" ? "HR Team" : state.activeAdminRole,
        senderRole: state.activeAdminRole.includes("HR") ? "HR" : "Executive",
        recipientScope,
        priority,
        title,
        body,
        timeAgo: "Just now",
        unread: true,
        channels: { inApp, email },
        stats: {
          totalRecipients: state.members.length,
          inAppReadCount: 0,
          emailSentCount: email ? state.members.length : 0,
          emailFailedCount: 0,
        },
      };
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: state.activeAdminRole,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Message Sent",
        targetLabel: `To: ${recipientScope}`,
        oldValue: "-",
        newValue: `${title} [${inApp ? "In-App " : ""}${email ? "+ Email" : ""}]`,
        reason: `Priority: ${priority}`,
      };
      return {
        messages: [newMsg, ...state.messages],
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  markMessageRead: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              unread: false,
              archived: true,
              stats: { ...m.stats, inAppReadCount: m.stats.inAppReadCount + (m.unread ? 1 : 0) },
            }
          : m
      ),
    })),

  unarchiveMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, archived: false, unread: true } : m
      ),
    })),

  archiveAllReadMessages: () =>
    set((state) => ({
      messages: state.messages.map((m) =>
        !m.unread ? { ...m, archived: true } : m
      ),
    })),

  createExplorePost: (post) =>
    set((state) => ({
      explorePosts: [{ ...post, id: `exp-${Date.now()}` }, ...state.explorePosts],
    })),

  updateExplorePostStatus: (postId, status) =>
    set((state) => ({
      explorePosts: state.explorePosts.map((p) => (p.id === postId ? { ...p, status } : p)),
    })),

  createDailyQuiz: (quiz) => {
    set((state) => {
      const nextItem: DailyQuizItem = {
        ...quiz,
        id: `lc-${Date.now()}`,
      };
      const existing = quiz.isPinnedToday
        ? state.dailyQuizzes.map((q) => ({ ...q, isPinnedToday: false }))
        : state.dailyQuizzes;
      return {
        dailyQuizzes: [nextItem, ...existing],
      };
    });
    get().saveToLocalCache();
  },

  updateDailyQuiz: (id, updates) => {
    set((state) => ({
      dailyQuizzes: state.dailyQuizzes.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    }));
    get().saveToLocalCache();
  },

  deleteDailyQuiz: (id) => {
    set((state) => ({
      dailyQuizzes: state.dailyQuizzes.filter((q) => q.id !== id),
    }));
    get().saveToLocalCache();
  },

  pinDailyQuiz: (id) => {
    set((state) => ({
      dailyQuizzes: state.dailyQuizzes.map((q) => ({
        ...q,
        isPinnedToday: q.id === id,
        active: q.id === id ? true : q.active,
      })),
    }));
    get().saveToLocalCache();
  },

  createDailyQuote: (quote) => {
    set((state) => {
      const newQuote: DailyQuoteItem = {
        ...quote,
        id: `quote-custom-${Date.now()}`,
        isCustom: true,
      };
      return {
        dailyQuotes: [newQuote, ...state.dailyQuotes],
      };
    });
    get().saveToLocalCache();
  },

  updateDailyQuote: (id, updates) => {
    set((state) => ({
      dailyQuotes: state.dailyQuotes.map((q) =>
        q.id === id ? { ...q, ...updates, isCustom: true } : q
      ),
    }));
    get().saveToLocalCache();
  },

  deleteDailyQuote: (id) => {
    set((state) => ({
      dailyQuotes: state.dailyQuotes.filter((q) => q.id !== id),
      settings:
        state.settings.pinnedQuoteId === id
          ? { ...state.settings, dailyQuoteMode: "auto_365", pinnedQuoteId: undefined }
          : state.settings,
    }));
    get().saveToLocalCache();
  },

  setPinnedDailyQuote: (quoteId) => {
    set((state) => ({
      settings: {
        ...state.settings,
        dailyQuoteMode: quoteId ? "pinned" : "auto_365",
        pinnedQuoteId: quoteId || undefined,
      },
    }));
    get().saveToLocalCache();
  },

  grantAccess: ({ memberId, capability, level, scopeType, scopeLabel, expiresAt, reason }) =>
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;
      const newGrant: AccessGrant = {
        id: `ag-${Date.now()}`,
        memberId,
        memberName: member.fullName,
        capability,
        level,
        scopeType,
        scopeLabel,
        expiresAt,
        grantedBy: state.activeAdminRole,
        grantedAt: new Date().toISOString().slice(0, 10),
      };
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: state.activeAdminRole,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Access Grant / Revoke",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: "Standard Scope",
        newValue: `${capability} — ${level} on ${scopeLabel} (${expiresAt ? `until ${expiresAt}` : "Permanent"})`,
        reason,
      };
      return {
        accessGrants: [newGrant, ...state.accessGrants],
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  revokeAccess: (grantId, reason) =>
    set((state) => {
      const target = state.accessGrants.find((g) => g.id === grantId);
      if (!target) return state;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: state.activeAdminRole,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Access Grant / Revoke",
        targetLabel: target.memberName,
        oldValue: `${target.capability} — ${target.level} (${target.scopeLabel})`,
        newValue: "Revoked",
        reason,
      };
      return {
        accessGrants: state.accessGrants.filter((g) => g.id !== grantId),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  updateSettings: (updates, reason) =>
    set((state) => {
      const isRegSwitch =
        typeof updates.registrationOpen === "boolean" &&
        updates.registrationOpen !== state.settings.registrationOpen;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Super Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: isRegSwitch ? "Registration Switch" : "Settings Changed",
        targetLabel: isRegSwitch ? "Global Registration Switch" : "System Business Rules",
        oldValue: isRegSwitch
          ? state.settings.registrationOpen
            ? "OPEN"
            : "PAUSED"
          : "Previous Config",
        newValue: isRegSwitch
          ? updates.registrationOpen
            ? "OPEN"
            : "PAUSED"
          : JSON.stringify(updates),
        reason,
      };
      return {
        settings: { ...state.settings, ...updates },
        auditLogs: [audit, ...state.auditLogs],
      };
    }),
}));
