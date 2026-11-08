"use client";

import { create } from "zustand";
import { isSuperAdminEmail } from "../firebase/config";
import {
  isFirestoreQuotaExhausted,
  pullErpStateFromFirestore,
  pushErpStateToFirestore,
  registerRecentDeletion,
  signOutFromFirebase,
} from "../firebase/auth";
import { hashCredentialDigest, verifyCredentialDigest } from "../utils/authSecurity";
import { generateInitialsAvatar, isDefaultOrPlaceholderAvatar } from "../utils/avatarUtils";
import {
  AccessGrant,
  AccessLevel,
  AccessScopeType,
  ActivityTypeKey,
  AppLanguage,
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
  ProposalVote,
  ProposalState,
  ProposalTypeKey,
  RecognitionLabel,
  RoleTemplateName,
  ScientificTeam,
  getRankForXp,
  getSeniorityForMember,
  parseYearsInClub,
  DEFAULT_RANK_LEVELS,
  SystemSettings,
  Workshop,
  WorkshopLevel,
  WorkshopStatus,
} from "../types/erp";
import {
  DEFAULT_AVAILABILITY,
  FALLBACK_SESSION_MEMBER,
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
  isHydrated: boolean;
  isAuthenticated: boolean;
  currentMemberId: string;
  activeAdminRole: RoleTemplateName;
  sessionStartedAt: number;
  forceLogoutAllSessions: (options?: { keepCurrentSession?: boolean }) => Promise<void>;
  forceLogoutSpecificMember: (memberId: string, reason?: string) => Promise<void>;
  restoreMemberSessionAccess: (memberId: string) => Promise<void>;
  activeLanguage: AppLanguage;
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
  projectCategories: string[];
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
  setLanguage: (lang: AppLanguage) => void;
  triggerCelebration: (payload: CelebrationPayload | null) => void;
  loginWithEmail: (
    email: string,
    password?: string,
    bypassPasswordCheck?: boolean
  ) => { ok: boolean; redirectPath: string; member?: Member; message?: string };
  loginWithGoogle: (
    email: string,
    fullName?: string,
    avatarUrl?: string
  ) => { ok: boolean; redirectPath: string; member?: Member; message?: string };
  registerWithGoogle: (
    email: string,
    fullName?: string,
    avatarUrl?: string,
    isAlumni?: boolean
  ) => { ok: boolean; redirectPath: string; member?: Member; message?: string };
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
  applyIncomingCloudSnapshot: (cloudData: Record<string, unknown>) => void;
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
    password?: string;
    phone: string;
    avatarUrl: string;
    university?: string;
    major: string;
    academicYear: Member["academicYear"];
    tenure: string;
    yearsInClub?: number;
    clubJoinYear?: number;
    graduationYear?: string;
    alumniPosition?: string;
    alumniAccessEnabled?: boolean;
    isAlumni?: boolean;
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
        | "alumniAccessEnabled"
        | "graduationYear"
        | "alumniPosition"
      >
    >
  ) => void;
  updateMemberFullAdmin: (
    memberId: string,
    updates: Partial<Member>,
    reason?: string
  ) => void;
  confirmTraineeToActive: (memberId: string, reason: string, actorName?: string) => void;
  approveMemberAdmission: (payload: {
    memberId: string;
    actorName?: string;
    notes?: string;
  }) => void;
  ensureWelcomeMessageDelivered: (memberId: string) => void;
  rejectMemberAdmission: (payload: {
    memberId: string;
    actorName?: string;
    reason: string;
  }) => void;
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
  resumeMembershipSelf: (payload: {
    memberId: string;
    reason?: string;
  }) => { ok: boolean; message: string };
  pauseOrResignMembershipSelf: (payload: {
    memberId: string;
    action: "pause" | "resign" | "resume";
    motif: string;
    passwordConfirm?: string;
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
  reactivateFormerMember: (
    memberId: string,
    toStatus: "Active" | "Trainee",
    reason: string,
    departmentIdOrActor?: string,
    teamId?: string
  ) => void;
  createAdminMember: (payload: {
    fullName: string;
    email: string;
    phone?: string;
    major?: string;
    academicYear?: Member["academicYear"];
    departmentId: string;
    teamId?: string;
    status?: MemberStatus;
    role?: RoleTemplateName;
  }) => Member;
  deleteMember: (memberId: string, reason?: string, permanent?: boolean) => void;

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
  updateWorkshop: (
    workshopId: string,
    updates: Partial<Omit<Workshop, "id">>,
    reason?: string
  ) => void;
  deleteWorkshop: (
    workshopId: string,
    isPermanent?: boolean,
    reason?: string
  ) => void;
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
  updateWorkshopCategory: (oldCat: string, newCat: string) => void;
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
  publishMonthlyHonours: (
    motmMemberId: string | string[],
    championMemberIds: string[],
    bonusXp?: number,
    citation?: string,
    actorName?: string,
    targetMonth?: string,
    broadcastAnnouncement?: boolean
  ) => void;
  removeMonthlyHonours: (memberId?: string) => void;
  rolloverMonthlyCycle: (
    targetNewMonth: string,
    recalculateFromLedger?: boolean,
    actorName?: string
  ) => void;
  syncMonthlyScoresWithLedger: (targetMonth?: string) => void;

  // §M6: Badges, Exams & Project Submissions
  addBadgeCategory: (category: string) => void;
  updateBadgeCategory: (oldCat: string, newCat: string) => void;
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
  addProjectCategory: (category: string) => void;
  deleteProjectCategory: (category: string) => void;
  updateProjectCategory: (oldCat: string, newCat: string) => void;
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
  voteOnProposal: (
    proposalId: string,
    decision: "Approved" | "Rejected",
    comment?: string
  ) => { ok: boolean; message: string };
  submitDailyQuizAnswer: (
    quizId: string,
    optionId: string
  ) => { ok: boolean; message: string; xpEarned?: number };

  // §M7 & §M9: Messages & Explore
  sendClubMessage: (payload: {
    recipientScope: string;
    priority: NotificationPriority;
    title: string;
    body: string;
    inApp: boolean;
    email: boolean;
    targetMemberId?: string;
    targetDepartmentId?: string;
    targetTeamId?: string;
  }) => void;
  deleteClubMessage: (messageId: string) => void;
  updateClubMessage: (messageId: string, updates: Partial<ClubMessage>) => void;
  deleteAllClubMessages: () => void;
  markMessageRead: (messageId: string, memberId?: string) => void;
  archiveClubMessage: (messageId: string) => void;
  unarchiveMessage: (messageId: string) => void;
  archiveAllReadMessages: () => void;
  createExplorePost: (post: Omit<ExplorePost, "id">) => void;
  updateExplorePost: (postId: string, updates: Partial<ExplorePost>) => void;
  deleteExplorePost: (postId: string) => void;
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
  "dailyQuizzes",
  "messages",
  "invitations",
  "accessGrants",
  "auditLogs",
  "grievances",
] as const;

export function sanitizeSystemSettings(settings: SystemSettings): SystemSettings {
  const sanitized = { ...settings };
  const isSuperAdminId = (id?: string) =>
    Boolean(
      id &&
      (id === "mem-super-quanta" ||
       id === "mem-super-hr" ||
       id.startsWith("mem-super") ||
       id.startsWith("session-"))
    );
  if (isSuperAdminId(sanitized.vicePresidentId)) {
    sanitized.vicePresidentId = "";
  }
  if (isSuperAdminId(sanitized.presidentId)) {
    sanitized.presidentId = "";
  }
  if (isSuperAdminId(sanitized.secretaryGeneralId)) {
    sanitized.secretaryGeneralId = "";
  }
  return sanitized;
}

interface TombstoneEntry {
  id: string;
  deletedAt: number;
}

let isCompactingQuota = false;
const TOMBSTONES_STORAGE_KEY = "quanters-tombstones-v3";
const TOMBSTONE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function getPersistentDeletedIds(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TOMBSTONES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, (string | TombstoneEntry)[]>;
    const now = Date.now();
    const result: Record<string, string[]> = {};
    const cleaned: Record<string, TombstoneEntry[]> = {};
    let pruned = false;

    for (const [col, items] of Object.entries(parsed)) {
      if (!Array.isArray(items)) continue;
      const validEntries: TombstoneEntry[] = [];
      const validIds: string[] = [];

      for (const item of items) {
        if (typeof item === "string") {
          // Migration from v2 string items
          validEntries.push({ id: item, deletedAt: now });
          validIds.push(item);
        } else if (item && typeof item === "object" && typeof item.id === "string") {
          if (now - item.deletedAt < TOMBSTONE_TTL_MS) {
            validEntries.push(item);
            validIds.push(item.id);
          } else {
            pruned = true; // Pruned expired tombstone
          }
        }
      }
      result[col] = validIds;
      cleaned[col] = validEntries;
    }

    if (pruned) {
      try {
        window.localStorage.setItem(TOMBSTONES_STORAGE_KEY, JSON.stringify(cleaned));
      } catch {}
    }
    return result;
  } catch {
    return {};
  }
}

export function recordPersistentDeletedId(collection: string, id: string) {
  if (typeof window === "undefined" || !id) return;
  try {
    const raw = window.localStorage.getItem(TOMBSTONES_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, TombstoneEntry[]>) : {};
    const list = Array.isArray(parsed[collection]) ? parsed[collection] : [];
    if (!list.some((item) => (typeof item === "string" ? item === id : item.id === id))) {
      parsed[collection] = [...list, { id, deletedAt: Date.now() }];
      window.localStorage.setItem(TOMBSTONES_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // Ignore storage errors
  }
}

export function isPersistentDeletedId(collection: string, id: string): boolean {
  if (typeof window === "undefined" || !id) return false;
  const all = getPersistentDeletedIds();
  return Boolean(all[collection]?.includes(id));
}

let lastSyncedBaselineMap: Record<string, Map<string, string>> | null = null;
let lastSyncedSettingsJson: string | null = null;
let debouncedSyncTimeout: NodeJS.Timeout | number | null = null;
let inFlightPullPromise: Promise<void> | null = null;

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
  lastSyncedSettingsJson = JSON.stringify({
    settings: s.settings,
    workshopCategories: s.workshopCategories,
    badgeCategories: s.badgeCategories,
    projectCategories: s.projectCategories,
    customQuotes: s.dailyQuotes.filter((q) => q.isCustom),
  });
}

function computeClientDeltas(s: QuantersStoreState): {
  itemDeltas: Record<
    string,
    { upserted?: Record<string, unknown>[]; deletedIds?: string[] }
  >;
  settingsPatch?: SystemSettings;
  hasChanges: boolean;
} {
  const itemDeltas: Record<
    string,
    { upserted?: Record<string, unknown>[]; deletedIds?: string[] }
  > = {};
  let hasChanges = !lastSyncedBaselineMap;

  for (const key of DELTA_ARRAY_KEYS) {
    const prevMap = lastSyncedBaselineMap?.[key] || new Map<string, string>();
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

    const tombstoneSet = new Set(getPersistentDeletedIds()[key] || []);
    const newlyDeletedIds: string[] = [];
    if (key !== "auditLogs" && lastSyncedBaselineMap) {
      for (const oldId of prevMap.keys()) {
        if (!currentIds.has(oldId)) {
          newlyDeletedIds.push(oldId);
        }
      }
    }

    if (upserted.length > 0 || newlyDeletedIds.length > 0) {
      const deletedIds = Array.from(new Set([...tombstoneSet, ...newlyDeletedIds]));
      itemDeltas[key] = {
        ...(upserted.length > 0 ? { upserted } : {}),
        ...(deletedIds.length > 0 ? { deletedIds } : {}),
      };
      hasChanges = true;
    }
  }

  let settingsPatch: SystemSettings | undefined;
  const currentSettingsJson = JSON.stringify({
    settings: s.settings,
    workshopCategories: s.workshopCategories,
    badgeCategories: s.badgeCategories,
    projectCategories: s.projectCategories,
    customQuotes: s.dailyQuotes.filter((q) => q.isCustom),
  });
  if (lastSyncedSettingsJson !== currentSettingsJson) {
    settingsPatch = s.settings;
    hasChanges = true;
  }

  return { itemDeltas, settingsPatch, hasChanges };
}

function mergeRemoteWithUnsyncedLocal(
  key: (typeof DELTA_ARRAY_KEYS)[number],
  remoteList: unknown[],
  localState: QuantersStoreState
): unknown[] {
  const localList =
    ((localState as unknown as Record<string, unknown>)[key] as
      | Array<Record<string, unknown> & { id?: string }>
      | undefined) || [];
  const mergedById = new Map<string, Record<string, unknown>>();
  const order: string[] = [];
  const prevMap = lastSyncedBaselineMap?.[key];

  // 1. Process remote items — strictly omitting any tombstoned (deleted) IDs
  for (const raw of remoteList) {
    if (raw && typeof raw === "object" && typeof (raw as { id?: unknown }).id === "string") {
      const id = (raw as { id: string }).id;
      if (isPersistentDeletedId(key, id)) continue;
      mergedById.set(id, raw as Record<string, unknown>);
      order.push(id);
    }
  }

  // 2. Only override remote item if local item has pending un-synced modifications
  for (const localItem of localList) {
    if (!localItem || typeof localItem.id !== "string") continue;
    const id = localItem.id;
    if (isPersistentDeletedId(key, id)) continue;

    const remoteItem = mergedById.get(id);
    if (!remoteItem) {
      // Only keep local-only item if client has active un-synced local offline creations
      if (localState.pendingSyncCount > 0 || (prevMap && !prevMap.has(id))) {
        if (!order.includes(id)) {
          order.push(id);
        }
        mergedById.set(id, localItem);
      }
    } else {
      const localTime = localItem.updatedAt
        ? new Date(localItem.updatedAt as string).getTime()
        : 0;
      const remoteTime = remoteItem.updatedAt
        ? new Date(remoteItem.updatedAt as string).getTime()
        : 0;

      // Concurrency & Persistence: Newer local edit or diverging edit always wins
      if (localTime > 0 && localTime >= remoteTime) {
        mergedById.set(id, { ...remoteItem, ...localItem });
      } else if (prevMap) {
        const baselineJson = prevMap.get(id);
        const localJson = JSON.stringify(localItem);
        // If local state diverged from baseline, keep local edit
        if (baselineJson && baselineJson !== localJson) {
          mergedById.set(id, { ...remoteItem, ...localItem });
        }
      }
    }
  }

  // 3. Final deduplicated result, strictly filtering out any tombstoned items
  const finalIds = Array.from(new Set(order)).filter((id) => !isPersistentDeletedId(key, id));
  return finalIds.map((id) => mergedById.get(id)!).filter(Boolean);
}

export const resolveRoleAndRedirect = (member: Member): {
  adminRole: RoleTemplateName;
  redirectPath: string;
} => {
  if (isSuperAdminEmail(member.email)) {
    return { adminRole: "Super Admin", redirectPath: "/admin/overview" };
  }
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
  if (member.roles.includes("KPI Viewer")) {
    return { adminRole: "KPI Viewer", redirectPath: "/admin/overview" };
  }
  if (member.roles.includes("Editor")) {
    return { adminRole: "Editor", redirectPath: "/admin/overview" };
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

export const DEFAULT_PROJECT_CATEGORIES: string[] = [
  "General",
  "Data Analysis",
  "Python Explorer",
  "Electronics",
  "Innovation",
  "Astrophysics",
  "Artificial Intelligence",
  "Robotics & IoT",
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
  isHydrated: false,
  isAuthenticated: false,
  currentMemberId: "",
  activeAdminRole: "Member",
  sessionStartedAt: Date.now(),
  activeLanguage: "en",
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
  badges: [],
  badgeCategories: DEFAULT_BADGE_CATEGORIES,
  exams: [],
  examCompletions: [],
  projectSubmissions: SEED_PROJECT_SUBMISSIONS,
  projectCategories: DEFAULT_PROJECT_CATEGORIES,
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
  setActiveAdminRole: (role) => {
    const state = get();
    const curMember = state.members.find((m) => m.id === state.currentMemberId);
    if (!curMember) return;
    const isSuper = curMember.roles.includes("Super Admin") || isSuperAdminEmail(curMember.email);
    if (!isSuper && !curMember.roles.includes(role)) {
      return;
    }
    set({ activeAdminRole: role });
  },
  setMobileFrameMode: (mode) => set({ mobileFrameMode: mode }),
  setLanguage: (lang) => {
    const validLang: AppLanguage = lang === "ar" ? "ar" : "en";
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("quanters_lang", validLang);
      } catch {}
    }
    if (typeof document !== "undefined") {
      document.documentElement.dir = validLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = validLang;
    }
    set((state) => {
      const curMember = state.members.find((m) => m.id === state.currentMemberId);
      if (curMember) {
        return {
          activeLanguage: validLang,
          members: state.members.map((m) =>
            m.id === state.currentMemberId ? { ...m, preferredLanguage: validLang } : m
          ),
        };
      }
      return { activeLanguage: validLang };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },
  triggerCelebration: (payload) => set({ celebration: payload }),

  loginWithEmail: (email, password, bypassPasswordCheck = false) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { ok: false, redirectPath: "/welcome", message: "Please enter your registered email address." };
    }

    const state = get();
    // Strictly authenticate by registered email address (NO ID / NO handle)
    const existing = state.members.find(
      (m) => m.email.toLowerCase() === cleanEmail
    );

    if (typeof password !== "string" || !password.trim()) {
      return {
        ok: false,
        redirectPath: "/welcome",
        message: "Password is required for email authentication.",
      };
    }

    const rawPass = password.trim();
    const legacyOrHash = existing?.passwordHash || (existing as unknown as { password?: string })?.password;
    const validPass =
      bypassPasswordCheck ||
      verifyCredentialDigest(
        cleanEmail,
        rawPass,
        legacyOrHash,
        isSuperAdminEmail(cleanEmail)
      );
    if (!validPass) {
      return {
        ok: false,
        redirectPath: "/welcome",
        message:
          "Invalid email or password. Please verify your credentials or use password recovery.",
      };
    }

    if (existing) {
      if (existing.status === "Removed") {
        return {
          ok: false,
          isDeleted: true,
          redirectPath: "/welcome",
          message: "YOUR_ACCOUNT_DELETED",
          member: existing,
        };
      }
      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);
      const { password: _legacy, ...cleanExisting } = existing as Member & { password?: string };
      const upgradedExisting: Member =
        password && !cleanExisting.passwordHash
          ? { ...cleanExisting, passwordHash: hashCredentialDigest(cleanEmail, password.trim()) }
          : cleanExisting;
      set({
        members: state.members.map((m) => (m.id === existing.id ? upgradedExisting : m)),
        isAuthenticated: true,
        currentMemberId: upgradedExisting.id,
        activeAdminRole: adminRole,
      });
      get().saveToLocalCache();
      return { ok: true, redirectPath, member: upgradedExisting };
    }

    if (isSuperAdminEmail(cleanEmail)) {
      const isHr = cleanEmail.startsWith("hr");
      const superMember: Member = {
        ...FALLBACK_SESSION_MEMBER,
        id: isHr ? "mem-super-hr" : "mem-super-quanta",
        email: cleanEmail,
        fullName: isHr ? "QUANTA HR Administration" : "QUANTA Super Admin",
        handle: isHr ? "@quanta_hr" : "@quanta_admin",
        roles: ["Super Admin", "Executive", "HR Head"],
        isBureauMember: true,
        status: "Active",
        onboardingTicks: {
          profileComplete: true,
          buddyAssigned: true,
          firstTaskBeforeDay30: true,
          firstWorkshopAttended: true,
        },
      };
      const existingAdmin = state.members.find((m) => m.email.toLowerCase() === cleanEmail);
      const activeMember = existingAdmin
        ? {
            ...existingAdmin,
            roles: Array.from(new Set(["Super Admin", "Executive", "HR Head", ...existingAdmin.roles])) as RoleTemplateName[],
            status: "Active" as const,
            isBureauMember: true,
          }
        : superMember;
      const nextMembers = existingAdmin
        ? state.members.map((m) => (m.id === existingAdmin.id ? activeMember : m))
        : [activeMember, ...state.members];
      set({
        members: nextMembers,
        isAuthenticated: true,
        currentMemberId: activeMember.id,
        activeAdminRole: "Super Admin",
  sessionStartedAt: Date.now(),
      });
      get().saveToLocalCache();
      get().syncWithServer(true).catch(() => {});
      return { ok: true, redirectPath: "/admin/overview", member: activeMember };
    }

    if (cleanEmail === "alumni@univ-alger.dz") {
      const alumniMember = state.members.find((m) => m.id === "mem-alumni-1") || state.members[0] || { ...FALLBACK_SESSION_MEMBER, status: "Alumni" };
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
      message: "No account found matching this email address. Please register or verify spelling.",
    };
  },

  loginWithGoogle: (email, fullName, avatarUrl) => {
    const cleanEmail = email.trim().toLowerCase();
    const state = get();
    const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (existing.status === "Removed") {
        return {
          ok: false,
          isDeleted: true,
          redirectPath: "/welcome",
          message: "YOUR_ACCOUNT_DELETED",
          member: existing,
        };
      }
      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);
      set({
        isAuthenticated: true,
        currentMemberId: existing.id,
        activeAdminRole: adminRole,
      });
      get().saveToLocalCache();
      return { ok: true, redirectPath, member: existing };
    }

    // STRICT ACCESS CONTROL: Unregistered Google accounts cannot log in on the Sign In screen
    return {
      ok: false,
      redirectPath: "/welcome",
      message: "No registered account found matching this Google email. Please click 'Create New Account' to register first.",
    };
  },

  registerWithGoogle: (email, fullName, avatarUrl, isAlumni = false) => {
    const cleanEmail = email.trim().toLowerCase();
    const state = get();
    const isSuper = isSuperAdminEmail(cleanEmail);

    if (!isAlumni && !isSuper && !state.settings.registrationOpen) {
      return {
        ok: false,
        redirectPath: "/welcome",
        message: "New member registration is currently paused by Club Administration.",
      };
    }

    const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.status === "Removed") {
        return {
          ok: false,
          isDeleted: true,
          redirectPath: "/welcome",
          message: "YOUR_ACCOUNT_DELETED",
          member: existing,
        };
      }
      return {
        ok: false,
        redirectPath: "/welcome",
        message: "An account with this email already exists. Please sign in instead.",
      };
    }

    const num = Math.floor(400 + Math.random() * 500);
    const derivedName =
      fullName?.trim() ||
      cleanEmail
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

    const autoApprove = state.settings.onboardingAutoApprove ?? false;
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      quanterId: isSuper ? "QT-00-0000" : `QT-26-0${num}`,
      handle: isSuper ? "@quanta_admin" : `@quanter0${num}`,
      email: cleanEmail,
      fullName: derivedName,
      phone: "+213 550 00 00 00",
      avatarUrl:
        avatarUrl && !isDefaultOrPlaceholderAvatar(avatarUrl)
          ? avatarUrl
          : generateInitialsAvatar(derivedName),
      bio: isSuper ? "QUANTA Club Administration" : "QUANTA Scientific Club Member",
      major: "Computer Science",
      university: "University of Algiers 1",
      academicYear: "L2",
      tenure: isSuper ? "Bureau Leadership" : isAlumni ? "Alumni" : "New Member",
      yearsInClub: isSuper ? 2 : isAlumni ? 3 : 0,
      clubJoinYear: isSuper ? 2024 : isAlumni ? 2023 : 2026,
      departmentId: "dept-it",
      teamId: "team-cs-ai",
      roles: isSuper ? ["Super Admin", "Executive", "HR Head"] : isAlumni ? ["Alumni"] : ["Member"],
      isBureauMember: isSuper,
      status: isSuper ? "Active" : isAlumni ? "Alumni" : (autoApprove ? "Trainee" : "Pending"),
      statusSince: "Oct 2026",
      traineeStartDate: new Date().toISOString().slice(0, 10),
      traineeDaysElapsed: 1,
      outsideActivitiesAndVolunteering: "",
      declaresOtherStudentOrg: false,
      availability: DEFAULT_AVAILABILITY,
      xpTotal: isSuper ? 100 : 0,
      xpSeason: isSuper ? 100 : 0,
      xpMonth: isSuper ? 100 : 0,
      level: 1,
      levelTitle: isSuper ? "Executive Quanter" : "Novice Quanter",
      attendanceRate: 100,
      onTimeTaskRate: 100,
      recentActivityScore: 100,
      healthScore: 100,
      daysSinceLastActivity: 0,
      lateTasksThisMonth: 0,
      recognitionLabels: [],
      onboardingTicks: {
        profileComplete: isSuper,
        buddyAssigned: isSuper,
        firstTaskBeforeDay30: isSuper,
        firstWorkshopAttended: isSuper,
        hrApproved: isSuper || isAlumni || autoApprove,
        hrApprovedAt: (isSuper || isAlumni || autoApprove) ? new Date().toISOString() : undefined,
        hrApprovedBy: isSuper ? "Super Admin Directive" : isAlumni ? "Alumni Auto-Confirmation" : autoApprove ? "System Auto-Admission" : undefined,
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

    const redirectPath = isSuper
      ? "/admin/overview"
      : state.settings.registrationOpen
      ? "/onboarding"
      : "/home";

    set({
      members: [newMember, ...state.members],
      currentMemberId: newMember.id,
      activeAdminRole: isSuper ? "Super Admin" : isAlumni ? "Alumni" : "Member",
      isAuthenticated: true,
      settings: {
        ...state.settings,
        archivedMembers: (state.settings.archivedMembers || []).filter(
          (a) => a.email.toLowerCase() !== cleanEmail
        ),
      },
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
    return { ok: true, redirectPath, member: newMember };
  },

  registerAccount: ({ fullName, email, password, isAlumni }) => {
    const cleanEmail = email.trim().toLowerCase();
    const state = get();
    const isSuper = isSuperAdminEmail(cleanEmail);
    if (!isAlumni && !isSuper && !state.settings.registrationOpen) {
      return {
        ok: false,
        redirectPath: "/welcome",
        message: "New member registration is currently paused by the club administration.",
      };
    }

    const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.status === "Removed") {
        return {
          ok: false,
          isDeleted: true,
          redirectPath: "/welcome",
          message: "YOUR_ACCOUNT_DELETED",
          member: existing,
        };
      }
      return {
        ok: false,
        redirectPath: "/welcome",
        message: "An account with this email address already exists. Please sign in instead.",
      };
    }

    if (password && password.trim().length < 8) {
      return {
        ok: false,
        redirectPath: "/welcome",
        message: "Password must be at least 8 characters long.",
      };
    }

    const num = Math.floor(400 + Math.random() * 500);
    const autoApprove = state.settings.onboardingAutoApprove ?? false;
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      quanterId: isAlumni ? `QT-23-0${num}` : `QT-26-0${num}`,
      handle: `@quanter0${num}`,
      email: cleanEmail,
      passwordHash: password?.trim() ? hashCredentialDigest(cleanEmail, password.trim()) : undefined,
      fullName: fullName.trim() || "New Quanter",
      phone: "+213 550 00 00 00",
      avatarUrl: generateInitialsAvatar(fullName.trim() || "New Quanter"),
      bio: isAlumni ? "QUANTA Club Alumni" : "Exploring today, a brighter tomorrow.",
      major: "Computer Science",
      university: "University of Algiers 1",
      academicYear: isAlumni ? "Graduated" : "L2",
      tenure: isAlumni ? "3 Years" : "New Member",
      yearsInClub: isAlumni ? 3 : 0,
      clubJoinYear: isAlumni ? 2023 : 2026,
      departmentId: "dept-it",
      teamId: "team-cs-ai",
      roles: isAlumni ? ["Alumni"] : ["Member"],
      isBureauMember: false,
      status: isAlumni ? "Alumni" : (autoApprove ? "Trainee" : "Pending"),
      statusSince: "Oct 2026",
      graduationYear: isAlumni ? "2026" : undefined,
      traineeStartDate: new Date().toISOString().slice(0, 10),
      traineeDaysElapsed: isAlumni ? 1000 : 1,
      outsideActivitiesAndVolunteering: "",
      declaresOtherStudentOrg: false,
      availability: DEFAULT_AVAILABILITY,
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
        hrApproved: isAlumni || autoApprove,
        hrApprovedAt: (isAlumni || autoApprove) ? new Date().toISOString() : undefined,
        hrApprovedBy: isAlumni ? "Alumni Auto-Confirmation" : autoApprove ? "System Auto-Admission" : undefined,
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

    const finalizedRegMember: Member = isSuper
      ? {
          ...newMember,
          roles: ["Super Admin", "Executive", "HR Head"],
          isBureauMember: true,
          status: "Active",
          onboardingTicks: {
            profileComplete: true,
            buddyAssigned: true,
            firstTaskBeforeDay30: true,
            firstWorkshopAttended: true,
          },
        }
      : newMember;
    const redirectPath = isSuper ? "/admin/overview" : isAlumni ? "/home" : "/onboarding";
    set({
      members: [finalizedRegMember, ...state.members],
      currentMemberId: finalizedRegMember.id,
      activeAdminRole: isSuper ? "Super Admin" : isAlumni ? "Alumni" : "Member",
      isAuthenticated: true,
      settings: {
        ...state.settings,
        archivedMembers: (state.settings.archivedMembers || []).filter(
          (a) => a.email.toLowerCase() !== cleanEmail
        ),
      },
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
    return { ok: true, redirectPath, member: finalizedRegMember };
  },

  changeMemberPassword: ({ oldEmail, newEmail, newPassword }) => {
    const state = get();
    if (!state.isAuthenticated) {
      return { ok: false, message: "Authentication required to change password." };
    }
    const cleanOldEmail = oldEmail.trim().toLowerCase();
    const cleanNewEmail = newEmail?.trim().toLowerCase() || "";
    const cleanPass = newPassword.trim();

    if (!cleanOldEmail) {
      return { ok: false, message: "Please enter your registered email address." };
    }
    if (cleanPass.length < 8) {
      return { ok: false, message: "New password must be at least 8 characters long." };
    }

    const currentMember = state.members.find((m) => m.id === state.currentMemberId);
    if (!currentMember || (currentMember.email.toLowerCase() !== cleanOldEmail && state.activeAdminRole !== "Super Admin")) {
      return { ok: false, message: "Unauthorized: You can only change your own password." };
    }

    // Strictly search by registered email address
    const target = state.members.find(
      (m) => m.email.toLowerCase() === cleanOldEmail
    );

    if (!target) {
      return {
        ok: false,
        message: "No account found matching that email address.",
      };
    }

    const { password: _legacyPass, ...cleanTarget } = target as Member & { password?: string };
    const effectiveEmail = cleanNewEmail || cleanTarget.email;
    const updatedMember: Member = {
      ...cleanTarget,
      email: effectiveEmail,
      passwordHash: hashCredentialDigest(effectiveEmail, cleanPass),
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
    get().syncWithServer(true).catch(() => {});
    return {
      ok: true,
      message: "Password updated successfully. You can now sign in with your new password.",
      member: updatedMember,
    };
  },

  logout: () => {
    signOutFromFirebase().catch(() => {});
    set({
      isAuthenticated: false,
      currentMemberId: "",
      activeAdminRole: "Member",
    });
    get().saveToLocalCache();
  },

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
      const currentMember = s.members.find((m) => m.id === s.currentMemberId);
      const isLeadershipOrAdmin = Boolean(
        currentMember && (
          currentMember.roles.includes("Super Admin") ||
          currentMember.roles.includes("Executive") ||
          currentMember.roles.includes("HR Head") ||
          currentMember.roles.includes("Department Head") ||
          isSuperAdminEmail(currentMember.email)
        )
      );

      // Strictly strip any plaintext password, and role-scope sensitive PII fields (PRIV-01)
      const sanitizedMembers = s.members.map((m) => {
        const { password: _legacy, passwordHash, ...rest } = m as Member & { password?: string };
        const isSelf = m.id === s.currentMemberId;

        // Admins and profile owners retain full KYC data
        if (isLeadershipOrAdmin || isSelf) {
          return isSelf && passwordHash ? { ...rest, passwordHash } : rest;
        }

        // For ordinary members or trainees, mask other members' sensitive personal contact & residence PII
        return {
          ...rest,
          phone: "🔒 Masked for privacy",
          wilaya: undefined,
          commune: undefined,
          housingType: undefined,
          commuteTime: undefined,
          cvUrl: undefined,
          passwordHash: undefined,
        };
      });
      const snapshot = {
        savedAt: new Date().toISOString(),
        isAuthenticated: s.isAuthenticated,
        currentMemberId: s.currentMemberId,
        activeAdminRole: s.activeAdminRole,
        userLowDataMode: s.userLowDataMode,
        pendingSyncCount: s.pendingSyncCount,
        lastSyncedAt: s.lastSyncedAt,
        lastServerEtag: s.lastServerEtag,
        collectionVersions: s.collectionVersions,
        departments: s.departments,
        teams: s.teams,
        members: sanitizedMembers,
        workshops: s.workshops,
        workshopCategories: s.workshopCategories,
        tasks: s.tasks,
        pointRules: s.pointRules,
        ledger: s.ledger,
        badges: s.badges,
        badgeCategories: s.badgeCategories,
        exams: s.exams,
        projectSubmissions: s.projectSubmissions,
        projectCategories: s.projectCategories,
        proposals: s.proposals,
        explorePosts: s.explorePosts,
        dailyQuizzes: s.dailyQuizzes,
        customDailyQuotes: s.dailyQuotes.filter((q) => q.isCustom),
        messages: s.messages,
        accessGrants: [], // Never persist sensitive RBAC grants to unencrypted client storage
        auditLogs: [], // Never dump audit trail in cleartext client storage
        grievances: s.grievances,
        settings: s.settings,
      };
      window.localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(snapshot));
    } catch (err) {
      // Automatic quota compaction fallback with re-entrancy protection
      if (!isCompactingQuota) {
        isCompactingQuota = true;
        try {
          get().compactAndPruneQuota();
          const s2 = get();
          const fallbackSnapshot = {
            savedAt: new Date().toISOString(),
            isAuthenticated: s2.isAuthenticated,
            currentMemberId: s2.currentMemberId,
            activeAdminRole: s2.activeAdminRole,
            collectionVersions: s2.collectionVersions,
            departments: s2.departments,
            teams: s2.teams,
            members: s2.members.map((m) => {
              const { password: _p, passwordHash: _ph, phone: _phn, ...safe } = m as Member & { password?: string };
              return safe;
            }),
            workshops: s2.workshops.slice(0, 50),
            tasks: s2.tasks.slice(0, 50),
            pointRules: s2.pointRules,
            ledger: s2.ledger.slice(0, 100),
            badges: s2.badges,
            messages: s2.messages.filter((m) => m.unread).slice(0, 15),
            accessGrants: [],
            auditLogs: [],
            grievances: s2.grievances.slice(0, 50),
            settings: s2.settings,
          };
          window.localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(fallbackSnapshot));
        } catch {
          // If still failing, silently ignore
        } finally {
          isCompactingQuota = false;
        }
      }
    }
  },

  hydrateFromLocalCache: () => {
    if (typeof window === "undefined") return;
    try {
      const lowDataRaw = window.localStorage.getItem("quanters-low-data-mode");
      const raw = window.localStorage.getItem("quanters-offline-cache-v10");
      if (!raw) {
        const storedLang = (window.localStorage.getItem("quanters_lang") || "en") as AppLanguage;
        const resolvedLang: AppLanguage = storedLang === "ar" ? "ar" : "en";
        if (typeof document !== "undefined") {
          document.documentElement.dir = resolvedLang === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = resolvedLang;
        }
        set({
          isHydrated: true,
          activeLanguage: resolvedLang,
          userLowDataMode: lowDataRaw ? lowDataRaw === "1" : false,
        });
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.members)) {
        const sanitizedHydratedMembers: Member[] = parsed.members.map(
          (m: Member & { password?: string }) => {
            const { password: legacyPassword, ...clean } = m;
            if (legacyPassword && !clean.passwordHash) {
              return {
                ...clean,
                passwordHash: hashCredentialDigest(clean.email, legacyPassword),
              };
            }
            return clean;
          }
        );
        const customQuotes: DailyQuoteItem[] = Array.isArray(parsed.customDailyQuotes)
          ? parsed.customDailyQuotes
          : [];
        const mergedQuotes = [
          ...customQuotes,
          ...SEED_DAILY_QUOTES_365.filter((sq) => !customQuotes.some((cq) => cq.id === sq.id)),
        ];
        const validAuth =
          Boolean(parsed.isAuthenticated) &&
          typeof parsed.currentMemberId === "string" &&
          parsed.currentMemberId.length > 0 &&
          sanitizedHydratedMembers.some((m: Member) => m.id === parsed.currentMemberId);

        const activeMember = validAuth
          ? sanitizedHydratedMembers.find((m: Member) => m.id === parsed.currentMemberId)
          : null;
        const verifiedRole = activeMember
          ? (activeMember.roles.includes(parsed.activeAdminRole)
              ? parsed.activeAdminRole
              : activeMember.roles[0] || "Member")
          : "Member";

        const storedLang = (window.localStorage.getItem("quanters_lang") || activeMember?.preferredLanguage || parsed?.settings?.defaultLanguage || "en") as AppLanguage;
        const resolvedLang: AppLanguage = storedLang === "ar" ? "ar" : "en";
        if (typeof document !== "undefined") {
          document.documentElement.dir = resolvedLang === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = resolvedLang;
        }

        set({
          isHydrated: true,
          activeLanguage: resolvedLang,
          isAuthenticated: validAuth,
          currentMemberId: validAuth ? parsed.currentMemberId : "",
          activeAdminRole: validAuth ? verifiedRole : "Member",
          userLowDataMode: lowDataRaw ? lowDataRaw === "1" : Boolean(parsed.userLowDataMode),
          pendingSyncCount: parsed.pendingSyncCount || 0,
          lastSyncedAt: parsed.lastSyncedAt || null,
          lastServerEtag: parsed.lastServerEtag || null,
          collectionVersions: parsed.collectionVersions || {},
          departments: parsed.departments || get().departments,
          teams: parsed.teams || get().teams,
          members: sanitizedHydratedMembers,
          workshops: Array.isArray(parsed.workshops)
            ? (parsed.workshops as Workshop[]).filter((w) => !isPersistentDeletedId("workshops", w.id))
            : [],
          workshopCategories: parsed.workshopCategories || get().workshopCategories,
          tasks: parsed.tasks || get().tasks,
          pointRules: parsed.pointRules || get().pointRules,
          ledger: parsed.ledger || get().ledger,
          badges: Array.isArray(parsed.badges)
            ? (parsed.badges as Badge[]).filter((b) => !isPersistentDeletedId("badges", b.id))
            : [],
          badgeCategories: parsed.badgeCategories || get().badgeCategories,
          exams: Array.isArray(parsed.exams)
            ? (parsed.exams as BadgeExam[]).filter((e) => !isPersistentDeletedId("exams", e.id))
            : [],
          projectSubmissions: parsed.projectSubmissions || get().projectSubmissions,
          projectCategories: parsed.projectCategories || get().projectCategories,
          proposals: parsed.proposals || get().proposals,
          explorePosts: parsed.explorePosts || get().explorePosts,
          dailyQuizzes: Array.isArray(parsed.dailyQuizzes)
            ? (parsed.dailyQuizzes as DailyQuizItem[]).filter(
                (q) => !isPersistentDeletedId("dailyQuizzes", q.id)
              )
            : [],
          dailyQuotes: mergedQuotes,
          messages: parsed.messages || get().messages,
          accessGrants: parsed.accessGrants || get().accessGrants,
          auditLogs: parsed.auditLogs || get().auditLogs,
          grievances: parsed.grievances || get().grievances,
          settings: sanitizeSystemSettings({ ...get().settings, ...(parsed.settings || {}) }),
        });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
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

    if (!isCompactingQuota) {
      get().saveToLocalCache();
    }
    return {
      bytesSaved: Math.max(512, beforeSize - afterSize),
      prunedCount,
    };
  },

  applyIncomingCloudSnapshot: (cloudData: Record<string, unknown>) => {
    if (!cloudData || typeof cloudData !== "object") return;

    // Ingest central tombstones to prevent ghost record resurrection
    if (cloudData.deletedIdsByCollection && typeof cloudData.deletedIdsByCollection === "object") {
      const incomingTombstones = cloudData.deletedIdsByCollection as Record<string, string[]>;
      for (const [col, ids] of Object.entries(incomingTombstones)) {
        if (Array.isArray(ids)) {
          for (const id of ids) {
            recordPersistentDeletedId(col, id);
          }
        }
      }
    }

    const current = get();
    const patchState: Partial<QuantersStoreState> = {
      isOnline: true,
      lastSyncedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    let hasArrayChanges = false;
    for (const key of DELTA_ARRAY_KEYS) {
      if (Array.isArray(cloudData[key])) {
        const merged = mergeRemoteWithUnsyncedLocal(
          key,
          cloudData[key] as unknown[],
          current
        );
        const currentArr = (current as unknown as Record<string, unknown>)[key];
        if (JSON.stringify(currentArr) !== JSON.stringify(merged)) {
          (patchState as Record<string, unknown>)[key] = merged;
          hasArrayChanges = true;
        }
      } else {
        const currentArr = (current as unknown as Record<string, unknown>)[key];
        if (Array.isArray(currentArr)) {
          const filtered = currentArr.filter((item: any) => !isPersistentDeletedId(key, item?.id));
          if (filtered.length !== currentArr.length) {
            (patchState as Record<string, unknown>)[key] = filtered;
            hasArrayChanges = true;
          }
        }
      }
    }
    if (
      Array.isArray(cloudData.workshopCategories) &&
      JSON.stringify(current.workshopCategories) !== JSON.stringify(cloudData.workshopCategories)
    ) {
      patchState.workshopCategories = cloudData.workshopCategories as string[];
      hasArrayChanges = true;
    }
    if (
      Array.isArray(cloudData.badgeCategories) &&
      JSON.stringify(current.badgeCategories) !== JSON.stringify(cloudData.badgeCategories)
    ) {
      patchState.badgeCategories = cloudData.badgeCategories as string[];
      hasArrayChanges = true;
    }
    if (
      Array.isArray(cloudData.projectCategories) &&
      JSON.stringify(current.projectCategories) !== JSON.stringify(cloudData.projectCategories)
    ) {
      patchState.projectCategories = cloudData.projectCategories as string[];
      hasArrayChanges = true;
    }
    if (Array.isArray(cloudData.customDailyQuotes)) {
      const customQ = cloudData.customDailyQuotes as DailyQuoteItem[];
      const mergedQ = [
        ...customQ,
        ...SEED_DAILY_QUOTES_365.filter((sq) => !customQ.some((cq) => cq.id === sq.id)),
      ];
      if (JSON.stringify(current.dailyQuotes) !== JSON.stringify(mergedQ)) {
        patchState.dailyQuotes = mergedQ;
        hasArrayChanges = true;
      }
    }
    if (cloudData.settings && typeof cloudData.settings === "object") {
      const newSettings = sanitizeSystemSettings({
        ...current.settings,
        ...(cloudData.settings as Partial<SystemSettings>),
      });
      if (JSON.stringify(current.settings) !== JSON.stringify(newSettings)) {
        patchState.settings = newSettings;
        hasArrayChanges = true;
      }
    }
    if (hasArrayChanges || !current.lastSyncedAt) {
      set(patchState);
      captureBaselineFromState(get());
      get().saveToLocalCache();
    }
  },

  pullExactUpdatesFromServer: async () => {
    if (inFlightPullPromise) {
      return inFlightPullPromise;
    }
    inFlightPullPromise = (async () => {
      const s = get();
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        set({ isOnline: false });
        return;
      }
      if (isFirestoreQuotaExhausted()) {
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

        const contentType = res.headers.get("content-type") || "";
        const json =
          res.ok && contentType.includes("application/json")
            ? await res.json().catch(() => null)
            : null;

        if (json?.ok) {
          const payload = json.isDelta ? json.delta : json.data;
          const current = get();
          const patchState: Partial<QuantersStoreState> = {
            isOnline: true,
            lastServerEtag: json.etag || s.lastServerEtag,
            collectionVersions: json.collectionVersions || s.collectionVersions,
          };

          if (payload && typeof payload === "object") {
            for (const key of DELTA_ARRAY_KEYS) {
              if (Array.isArray(payload[key])) {
                const merged = mergeRemoteWithUnsyncedLocal(
                  key,
                  payload[key] as unknown[],
                  current
                );
                const currentArr = (current as unknown as Record<string, unknown>)[key];
                if (JSON.stringify(currentArr) !== JSON.stringify(merged)) {
                  (patchState as Record<string, unknown>)[key] = merged;
                }
              } else {
                const currentArr = (current as unknown as Record<string, unknown>)[key];
                if (Array.isArray(currentArr)) {
                  const filtered = currentArr.filter((item: any) => !isPersistentDeletedId(key, item?.id));
                  if (filtered.length !== currentArr.length) {
                    (patchState as Record<string, unknown>)[key] = filtered;
                  }
                }
              }
            }
            if (payload.settings && typeof payload.settings === "object") {
              patchState.settings = sanitizeSystemSettings({ ...current.settings, ...payload.settings });
            }
          }

          set(patchState);
          // Also pull & merge Cloud Firestore so local dev and Firebase Cloud stay unified
          const cloudData = await pullErpStateFromFirestore().catch(() => null);
          if (cloudData && typeof cloudData === "object") {
            get().applyIncomingCloudSnapshot(cloudData);
          } else {
            captureBaselineFromState(get());
            get().saveToLocalCache();
          }
          return;
        }

        // Static Firebase Hosting fallback: pull directly from Cloud Firestore (quanters-d0312)
        const cloudData = await pullErpStateFromFirestore().catch(() => null);
        if (cloudData && typeof cloudData === "object") {
          get().applyIncomingCloudSnapshot(cloudData);
        }
      } catch {
        try {
          const cloudData = await pullErpStateFromFirestore().catch(() => null);
          if (cloudData && typeof cloudData === "object") {
            get().applyIncomingCloudSnapshot(cloudData);
          }
        } catch {
          // Silent background fallback: a pull NEVER triggers a push!
        }
      }
    })().finally(() => {
      inFlightPullPromise = null;
    });
    return inFlightPullPromise;
  },

  syncWithServer: async (force = false) => {
    const s = get();
    s.saveToLocalCache();

    // Quota circuit-breaker: if Firestore quota was exhausted, save locally and return immediately with 0ms delay!
    if (isFirestoreQuotaExhausted()) {
      const { hasChanges } = computeClientDeltas(s);
      set({
        isOnline: true,
        pendingSyncCount: s.pendingSyncCount + (hasChanges ? 1 : 0),
      });
      s.saveToLocalCache();
      return;
    }

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

    // Clear any pending debounced timeout to prevent double-write race conditions
    if (debouncedSyncTimeout) {
      clearTimeout(debouncedSyncTimeout as any);
      debouncedSyncTimeout = null;
    }

    // Debounce non-forced writes by 1.5s to coalesce rapid clicks and prevent quota thrashing
    if (!force) {
      debouncedSyncTimeout = setTimeout(() => {
        get().syncWithServer(true).catch(() => {});
      }, 1500);
      return;
    }

    // If this tab has never pulled baseline from server/Firestore and isn't forcing a write, pull first
    if (!lastSyncedBaselineMap && !force) {
      await get().pullExactUpdatesFromServer();
      return;
    }

    const { itemDeltas, settingsPatch, hasChanges } = computeClientDeltas(s);

    // Quota-Saver: If nothing changed locally and not forced, only pull unseen server deltas
    if (!hasChanges && !force && s.pendingSyncCount === 0) {
      await get().pullExactUpdatesFromServer();
      return;
    }

    const persistentTombstones = getPersistentDeletedIds();
    const deletedIdsByCollection: Record<string, string[]> = { ...persistentTombstones };
    for (const [k, delta] of Object.entries(itemDeltas)) {
      if (delta.deletedIds && delta.deletedIds.length > 0) {
        deletedIdsByCollection[k] = Array.from(
          new Set([...(deletedIdsByCollection[k] || []), ...delta.deletedIds])
        );
      }
    }

    const buildFirestoreSnapshot = () => {
      const currentSnap = get();
      const tombstones = getPersistentDeletedIds();
      const activeMember = currentSnap.members.find((m) => m.id === currentSnap.currentMemberId);
      const isSuper =
        currentSnap.activeAdminRole === "Super Admin" ||
        currentSnap.activeAdminRole === "Executive" ||
        currentSnap.activeAdminRole === "HR Head" ||
        (activeMember && (isSuperAdminEmail(activeMember.email) || activeMember.roles.includes("Super Admin")));

      const sanitizeMemberList = (list: Member[]) =>
        list
          .filter((m) => !tombstones.members?.includes(m.id))
          .map((m) => {
            const { password: _legacy, ...clean } = m as Member & { password?: string };
            return clean;
          });

      const fullMap: Record<string, unknown> = {
        _isAdmin: isSuper,
        _actorEmail: activeMember?.email || "quantaclubdz@gmail.com",
        departments: currentSnap.departments,
        teams: currentSnap.teams,
        members: sanitizeMemberList(currentSnap.members),
        invitations: currentSnap.invitations,
        workshops: currentSnap.workshops.filter((w) => !tombstones.workshops?.includes(w.id)),
        workshopCategories: currentSnap.workshopCategories,
        tasks: currentSnap.tasks.filter((t) => !tombstones.tasks?.includes(t.id)),
        pointRules: currentSnap.pointRules.filter((r) => !tombstones.pointRules?.includes(r.id)),
        ledger: currentSnap.ledger,
        badges: currentSnap.badges.filter((b) => !tombstones.badges?.includes(b.id)),
        badgeCategories: currentSnap.badgeCategories,
        exams: currentSnap.exams.filter((e) => !tombstones.exams?.includes(e.id)),
        examCompletions: currentSnap.examCompletions,
        projectSubmissions: currentSnap.projectSubmissions,
        projectCategories: currentSnap.projectCategories,
        proposals: currentSnap.proposals,
        explorePosts: currentSnap.explorePosts,
        dailyQuizzes: currentSnap.dailyQuizzes.filter((q) => !tombstones.dailyQuizzes?.includes(q.id)),
        customDailyQuotes: currentSnap.dailyQuotes.filter((q) => q.isCustom),
        messages: currentSnap.messages.filter((m) => !tombstones.messages?.includes(m.id)),
        accessGrants: currentSnap.accessGrants,
        auditLogs: currentSnap.auditLogs,
        grievances: currentSnap.grievances,
        settings: currentSnap.settings,
      };

      const changedCollectionKeys = Object.keys(itemDeltas);
      if (lastSyncedBaselineMap && (changedCollectionKeys.length > 0 || settingsPatch)) {
        const deltaPayload: Record<string, unknown> = {
          _isAdmin: isSuper,
          _actorEmail: activeMember?.email || "quantaclubdz@gmail.com",
        };
        for (const k of changedCollectionKeys) {
          if (k in fullMap) {
            deltaPayload[k] = fullMap[k];
          }
        }
        if (settingsPatch) {
          deltaPayload.settings = currentSnap.settings;
          deltaPayload.workshopCategories = currentSnap.workshopCategories;
          deltaPayload.badgeCategories = currentSnap.badgeCategories;
          deltaPayload.projectCategories = currentSnap.projectCategories;
          deltaPayload.customDailyQuotes = currentSnap.dailyQuotes.filter((q) => q.isCustom);
        }
        if (Object.keys(deltaPayload).length > 0) {
          return deltaPayload;
        }
      }

      return fullMap;
    };

    const applyMergedCloudResult = (cloudSaved: Record<string, unknown>) => {
      const current = get();
      const cloudPatch: Partial<QuantersStoreState> = {
        isOnline: true,
        pendingSyncCount: 0,
        lastSyncedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      for (const key of DELTA_ARRAY_KEYS) {
        if (Array.isArray(cloudSaved[key])) {
          (cloudPatch as Record<string, unknown>)[key] =
            mergeRemoteWithUnsyncedLocal(
              key,
              cloudSaved[key] as unknown[],
              current
            );
        }
      }
      if (cloudSaved.settings && typeof cloudSaved.settings === "object") {
        cloudPatch.settings = {
          ...current.settings,
          ...(cloudSaved.settings as Partial<SystemSettings>),
        };
      }
      set(cloudPatch);
      captureBaselineFromState(get());
      get().saveToLocalCache();
    };

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
      const contentType = resp.headers.get("content-type") || "";
      const json =
        resp.ok && contentType.includes("application/json")
          ? await resp.json().catch(() => null)
          : null;

      if (resp.ok && json?.ok) {
        const current = get();
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

        if (json?.serverDelta && typeof json.serverDelta === "object") {
          for (const key of DELTA_ARRAY_KEYS) {
            if (Array.isArray(json.serverDelta[key])) {
              (patchState as Record<string, unknown>)[key] =
                mergeRemoteWithUnsyncedLocal(
                  key,
                  json.serverDelta[key] as unknown[],
                  current
                );
            }
          }
          if (
            json.serverDelta.settings &&
            typeof json.serverDelta.settings === "object"
          ) {
            patchState.settings = sanitizeSystemSettings({
              ...current.settings,
              ...json.serverDelta.settings,
            });
          }
        }

        set(patchState);
        // Mirror & merge with Cloud Firestore
        const cloudSaved = await pushErpStateToFirestore(
          buildFirestoreSnapshot(),
          deletedIdsByCollection
        ).catch(() => null);
        if (cloudSaved) {
          applyMergedCloudResult(cloudSaved);
        } else {
          captureBaselineFromState(get());
          get().saveToLocalCache();
        }
        return;
      }

      // Static Firebase Hosting path (/api/erp returns 404/405): persist directly to Cloud Firestore
      const cloudSaved = await pushErpStateToFirestore(
        buildFirestoreSnapshot(),
        deletedIdsByCollection
      );
      if (cloudSaved) {
        applyMergedCloudResult(cloudSaved);
        return;
      }

      set({
        isOnline: false,
        pendingSyncCount: s.pendingSyncCount + 1,
      });
      get().saveToLocalCache();
    } catch {
      const cloudSaved = await pushErpStateToFirestore(
        buildFirestoreSnapshot(),
        deletedIdsByCollection
      );
      if (cloudSaved) {
        applyMergedCloudResult(cloudSaved);
        return;
      }
      set({
        isOnline: false,
        pendingSyncCount: s.pendingSyncCount + 1,
      });
      get().saveToLocalCache();
    }
  },

  updateDepartmentMeta: (deptId, updates, reason) => {
    set((state) => {
      const target = state.departments.find((d) => d.id === deptId);
      if (!target) return state;
      const nextDepartments = state.departments.map((d) =>
        d.id === deptId ? { ...d, ...updates } : d
      );
      const headIds = new Set(nextDepartments.map((d) => d.headMemberId).filter(Boolean));
      const coIds = new Set(nextDepartments.map((d) => d.coManagerMemberId).filter(Boolean));
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
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  moveMemberDepartment: (memberId, toDeptId, reason, actorName = "HR Administration") => {
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
                    changeType: "Department Move" as const,
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
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  createTeam: (team) => {
    const newTeamId = `team-${Date.now()}`;
    const initialLeaderId = (team.leaderMemberId || "").trim();
    const initialMemberIds = Array.from(
      new Set([
        ...(team.memberIds || []),
        ...(initialLeaderId ? [initialLeaderId] : []),
      ].filter(Boolean))
    );

    set((state) => {
      const nextTeams = [
        ...state.teams,
        {
          ...team,
          id: newTeamId,
          leaderMemberId: initialLeaderId,
          memberIds: initialMemberIds,
          archived: false,
        },
      ];
      const leaderIds = new Set(
        nextTeams
          .filter((t) => !t.archived && Boolean(t.leaderMemberId))
          .map((t) => t.leaderMemberId)
      );
      const nextMembers = state.members.map((m) => {
        const isLeader = leaderIds.has(m.id);
        const filtered = m.roles.filter((r) => r !== "Team Leader");
        const nextRoles: RoleTemplateName[] = [...filtered];
        if (isLeader) nextRoles.push("Team Leader");
        if (nextRoles.length === 0) nextRoles.push("Member");

        const updatedTeamId =
          m.id === initialLeaderId
            ? newTeamId
            : initialMemberIds.includes(m.id)
            ? newTeamId
            : m.teamId;

        return {
          ...m,
          roles: Array.from(new Set(nextRoles)),
          teamId: updatedTeamId,
        };
      });

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Department / Team Move",
        targetLabel: `Scientific Team: ${team.name}`,
        oldValue: "None",
        newValue: `Created (Leader: ${initialLeaderId || "Unassigned"})`,
        reason: "Created new scientific research team",
      };

      return {
        teams: nextTeams,
        members: nextMembers,
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateTeam: (teamId, updates) => {
    set((state) => {
      const currentTeam = state.teams.find((t) => t.id === teamId);
      if (!currentTeam) return state;

      const newLeaderId =
        updates.leaderMemberId !== undefined
          ? updates.leaderMemberId.trim()
          : currentTeam.leaderMemberId;

      let nextMemberIds = updates.memberIds ? [...updates.memberIds] : [...currentTeam.memberIds];
      if (newLeaderId && !nextMemberIds.includes(newLeaderId)) {
        nextMemberIds.push(newLeaderId);
      }
      nextMemberIds = Array.from(new Set(nextMemberIds.filter(Boolean)));

      const nextTeams = state.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              ...updates,
              leaderMemberId: newLeaderId,
              memberIds: nextMemberIds,
            }
          : t
      );

      const leaderIds = new Set(
        nextTeams
          .filter((t) => !t.archived && Boolean(t.leaderMemberId))
          .map((t) => t.leaderMemberId)
      );

      const nextMembers = state.members.map((m) => {
        const isLeader = leaderIds.has(m.id);
        const filtered = m.roles.filter((r) => r !== "Team Leader");
        const nextRoles: RoleTemplateName[] = [...filtered];
        if (isLeader) nextRoles.push("Team Leader");
        if (nextRoles.length === 0) nextRoles.push("Member");

        let memberTeamId = m.teamId;
        if (m.id === newLeaderId) {
          memberTeamId = teamId;
        }

        return {
          ...m,
          roles: Array.from(new Set(nextRoles)),
          teamId: memberTeamId,
        };
      });

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Department / Team Move",
        targetLabel: `Scientific Team: ${currentTeam.name}`,
        oldValue: `Leader: ${currentTeam.leaderMemberId || "Unassigned"}`,
        newValue: `Leader: ${newLeaderId || "Unassigned"}`,
        reason: "Updated team leadership/attributes",
      };

      return {
        teams: nextTeams,
        members: nextMembers,
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  deleteOrArchiveTeam: (teamId, reason) => {
    const currentTeam = get().teams.find((t) => t.id === teamId);
    if (!currentTeam) return;
    const canHardDelete = currentTeam.memberIds.length === 0;
    if (canHardDelete) {
      recordPersistentDeletedId("teams", teamId);
    }
    set((state) => {
      const team = state.teams.find((t) => t.id === teamId);
      if (!team) return state;
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
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  addMemberToTeam: (memberId, teamId) => {
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      const targetTeam = state.teams.find((t) => t.id === teamId);
      if (!member || !targetTeam) return state;

      const nextTeams = state.teams.map((t) =>
        t.id === teamId
          ? { ...t, memberIds: Array.from(new Set([...t.memberIds, memberId])) }
          : { ...t, memberIds: t.memberIds.filter((id) => id !== memberId) }
      );

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Department / Team Move",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: member.teamId || "No Team",
        newValue: targetTeam.name,
        reason: `Added to ${targetTeam.name}`,
      };

      return {
        teams: nextTeams,
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, teamId } : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  removeMemberFromTeam: (memberId, teamId, reason) => {
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      const team = state.teams.find((t) => t.id === teamId);
      if (!member || !team) return state;

      const nextTeams = state.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              memberIds: t.memberIds.filter((id) => id !== memberId),
              leaderMemberId: t.leaderMemberId === memberId ? "" : t.leaderMemberId,
            }
          : t
      );

      const leaderIds = new Set(
        nextTeams
          .filter((t) => !t.archived && Boolean(t.leaderMemberId))
          .map((t) => t.leaderMemberId)
      );

      const nextMembers = state.members.map((m) => {
        const isLeader = leaderIds.has(m.id);
        const filtered = m.roles.filter((r) => r !== "Team Leader");
        const nextRoles: RoleTemplateName[] = [...filtered];
        if (isLeader) nextRoles.push("Team Leader");
        if (nextRoles.length === 0) nextRoles.push("Member");

        if (m.id === memberId) {
          return {
            ...m,
            teamId: undefined,
            roles: Array.from(new Set(nextRoles)),
            placementHistory: [
              {
                id: `ph-${Date.now()}`,
                changeType: "Team Removal" as const,
                fromName: team.name,
                toName: "Unassigned",
                reason,
                actorName: state.activeAdminRole,
                date: new Date().toISOString().slice(0, 10),
              },
              ...m.placementHistory,
            ],
          };
        }
        return {
          ...m,
          roles: Array.from(new Set(nextRoles)),
        };
      });

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
        teams: nextTeams,
        members: nextMembers,
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  completeFirstTimeProfile: (payload) => {
    set((state) => {
      const cleanEmail = payload.email?.trim().toLowerCase() || "";
      const existing =
        (state.isAuthenticated && state.currentMemberId
          ? state.members.find(
              (m) =>
                m.id === state.currentMemberId &&
                (!cleanEmail || m.email.toLowerCase() === cleanEmail)
            )
          : undefined) ||
        (cleanEmail
          ? state.members.find((m) => m.email.toLowerCase() === cleanEmail)
          : undefined);

      const isAlumniTarget = Boolean(
        payload.isAlumni ||
        payload.tenure === "QUANTA Alumni" ||
        payload.tenure?.toLowerCase().includes("alumni") ||
        existing?.status === "Alumni"
      );

      if (existing) {
        const nextTenure = payload.tenure || existing.tenure;
        const targetYears = typeof payload.yearsInClub === "number" && !isNaN(payload.yearsInClub)
          ? payload.yearsInClub
          : parseYearsInClub(nextTenure, existing.yearsInClub);
        const joinYear = payload.clubJoinYear || existing.clubJoinYear || (2026 - targetYears);
        const targetSeniority = getSeniorityForMember({
          tenure: nextTenure,
          yearsInClub: targetYears,
          status: isAlumniTarget ? "Alumni" : existing.status,
          roles: isAlumniTarget ? ["Alumni"] : existing.roles,
        });
        const isOldMember = targetSeniority.level >= 2;
        const baseMinXp = isAlumniTarget
          ? 1800
          : targetSeniority.level === 3
          ? 300
          : targetSeniority.level === 2
          ? 150
          : 50;

        const nextTeams = payload.teamId
          ? state.teams.map((t) =>
              t.id === payload.teamId
                ? { ...t, memberIds: Array.from(new Set([...t.memberIds, existing.id])) }
                : { ...t, memberIds: t.memberIds.filter((id) => id !== existing.id) }
            )
          : state.teams;
        const autoApprove = state.settings.onboardingAutoApprove ?? false;
        const isAlreadyApproved = Boolean(existing.onboardingTicks?.hrApproved);
        const resolvedStatus: MemberStatus = isAlumniTarget
          ? "Alumni"
          : autoApprove
          ? (isOldMember ? "Active" : "Trainee")
          : isAlreadyApproved
          ? (isOldMember ? "Active" : existing.status === "Pending" ? "Trainee" : existing.status)
          : "Pending";
        const resolvedHrApproved = isAlumniTarget || (autoApprove ? true : isAlreadyApproved);

        return {
          teams: nextTeams,
          currentMemberId: existing.id,
          activeAdminRole: isAlumniTarget ? "Alumni" : state.activeAdminRole,
          isAuthenticated: true,
          members: state.members.map((m) =>
            m.id === existing.id
              ? {
                  ...m,
                  fullName: payload.fullName || m.fullName,
                  email: payload.email || m.email,
                  phone: payload.phone || m.phone,
                  avatarUrl: payload.avatarUrl || m.avatarUrl,
                  university: payload.university || m.university,
                  major: payload.major || m.major,
                  academicYear: isAlumniTarget ? "Graduated" : payload.academicYear,
                  tenure: nextTenure,
                  yearsInClub: targetYears,
                  clubJoinYear: joinYear,
                  graduationYear: payload.graduationYear || m.graduationYear || (isAlumniTarget ? "2026" : undefined),
                  alumniPosition: payload.alumniPosition || m.alumniPosition,
                  alumniAccessEnabled: payload.alumniAccessEnabled ?? m.alumniAccessEnabled ?? true,
                  status: resolvedStatus,
                  roles: isAlumniTarget ? ["Alumni"] : m.roles,
                  levelTitle: targetSeniority.levelTitle,
                  level: targetSeniority.level,
                  xpTotal: Math.max(m.xpTotal, baseMinXp),
                  xpSeason: Math.max(m.xpSeason, isAlumniTarget ? 600 : baseMinXp),
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
                    buddyAssigned: autoApprove && isOldMember ? true : m.onboardingTicks?.buddyAssigned,
                    firstTaskBeforeDay30: autoApprove && isOldMember ? true : m.onboardingTicks?.firstTaskBeforeDay30,
                    firstWorkshopAttended: autoApprove && isOldMember ? true : m.onboardingTicks?.firstWorkshopAttended,
                    hrApproved: resolvedHrApproved,
                    hrApprovedAt: resolvedHrApproved
                      ? (m.onboardingTicks?.hrApprovedAt || new Date().toISOString())
                      : undefined,
                    hrApprovedBy: resolvedHrApproved
                      ? (m.onboardingTicks?.hrApprovedBy || (isAlumniTarget ? "Alumni Auto-Confirmation" : autoApprove ? "System Auto-Admission" : undefined))
                      : undefined,
                  },
                }
              : m
          ),
        };
      }

      const nextTenure = payload.tenure || (isAlumniTarget ? "Alumni" : "New Member");
      const targetYears = typeof payload.yearsInClub === "number" && !isNaN(payload.yearsInClub)
        ? payload.yearsInClub
        : parseYearsInClub(nextTenure);
      const joinYear = payload.clubJoinYear || (2026 - targetYears);
      const newSeniority = getSeniorityForMember({
        tenure: nextTenure,
        yearsInClub: targetYears,
        status: isAlumniTarget ? "Alumni" : undefined,
        roles: isAlumniTarget ? ["Alumni"] : ["Member"],
      });
      const isOldMember = newSeniority.level >= 2;
      const newBaseXp = isAlumniTarget
        ? 1800
        : newSeniority.level === 3
        ? 300
        : newSeniority.level === 2
        ? 150
        : 50;

      const num = Math.floor(100 + Math.random() * 899);
      const newId = `mem-${Date.now()}`;
        const autoApprove = state.settings.onboardingAutoApprove ?? false;
        const newStatus: MemberStatus = isAlumniTarget
          ? "Alumni"
          : autoApprove
          ? (isOldMember ? "Active" : "Trainee")
          : "Pending";
        const newHrApproved = isAlumniTarget || autoApprove;

        const newMember: Member = {
        id: newId,
        quanterId: isAlumniTarget ? `QT-23-0${num}` : `QT-26-0${num}`,
        handle: `@quanter0${num}`,
        email: payload.email?.trim() || `member${num}@univ-alger.dz`,
        fullName: payload.fullName?.trim() || "New Quanter",
        phone: payload.phone || "+213 550 00 00 00",
        avatarUrl:
          payload.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces",
        bio: isAlumniTarget ? "QUANTA Club Alumni" : "Exploring today, a brighter tomorrow.",
        major: payload.major || "Computer Science",
        university: payload.university || "University of Algiers 1",
        academicYear: isAlumniTarget ? "Graduated" : (payload.academicYear || "L2"),
        tenure: nextTenure,
        yearsInClub: targetYears,
        clubJoinYear: joinYear,
        graduationYear: payload.graduationYear || (isAlumniTarget ? "2026" : undefined),
        alumniPosition: payload.alumniPosition || "",
        alumniAccessEnabled: isAlumniTarget ? (payload.alumniAccessEnabled ?? true) : undefined,
        departmentId: payload.departmentId || "dept-it",
        teamId: payload.teamId,
        wilaya: payload.wilaya,
        commune: payload.commune,
        housingType: payload.housingType,
        commuteTime: payload.commuteTime,
        canStayLate: payload.canStayLate,
        hasLaptop: payload.hasLaptop,
        pcCapability: payload.pcCapability,
        equipmentTags: payload.equipmentTags,
        githubUrl: payload.githubUrl,
        linkedinUrl: payload.linkedinUrl,
        portfolioUrl: payload.portfolioUrl,
        cvUrl: payload.cvUrl,
        roles: isAlumniTarget ? ["Alumni"] : ["Member"],
        isBureauMember: false,
        status: newStatus,
        statusSince: new Date().toISOString().slice(0, 10),
        traineeStartDate: new Date().toISOString().slice(0, 10),
        traineeDaysElapsed: isAlumniTarget || (autoApprove && isOldMember) ? 1000 : 1,
        outsideActivitiesAndVolunteering: payload.outsideActivitiesAndVolunteering || "",
        declaresOtherStudentOrg: Boolean(payload.declaresOtherStudentOrg),
        availability: payload.availability || DEFAULT_AVAILABILITY,
        xpTotal: newBaseXp,
        xpSeason: isAlumniTarget ? 600 : newBaseXp,
        xpMonth: 50,
        level: newSeniority.level,
        levelTitle: newSeniority.levelTitle,
        attendanceRate: 100,
        onTimeTaskRate: 100,
        recentActivityScore: 100,
        healthScore: 95,
        daysSinceLastActivity: 0,
        lateTasksThisMonth: 0,
        recognitionLabels: [],
        onboardingTicks: {
          profileComplete: true,
          buddyAssigned: autoApprove && isOldMember,
          firstTaskBeforeDay30: autoApprove && isOldMember,
          firstWorkshopAttended: autoApprove && isOldMember,
          hrApproved: newHrApproved,
          hrApprovedAt: newHrApproved ? new Date().toISOString() : undefined,
          hrApprovedBy: newHrApproved
            ? (isAlumniTarget ? "Alumni Auto-Confirmation" : isOldMember ? "Seniority Auto-Confirmation" : "System Auto-Admission")
            : undefined,
        },
        traineeEvaluation: { headEndorsed: false, coManagerEndorsed: false, notes: "" },
        skills: payload.skills && payload.skills.length > 0 ? payload.skills : ["Scientific Research"],
        badgeIds: [],
        workshopsCompletedCount: 0,
        projectsCompletedCount: 0,
        eventsAttendedCount: 0,
        statusHistory: [],
        placementHistory: [],
      };

      const nextTeams = payload.teamId
        ? state.teams.map((t) =>
            t.id === payload.teamId
              ? { ...t, memberIds: Array.from(new Set([...t.memberIds, newId])) }
              : t
          )
        : state.teams;

      const onboardingLedger: PointsLedgerEntry = {
        id: `led-onb-${Date.now()}`,
        memberId: newId,
        memberName: newMember.fullName,
        amount: 50,
        ruleLabel: "Onboarding Registration Completed",
        reason: `Completed QUANTA 6-Step Member Registration (${newMember.university} · ${newMember.major})`,
        source: "Manual",
        actorName: "QUANTERS Admission Gate",
        date: new Date().toISOString().slice(0, 10),
        appealStatus: "None",
      };

      const onboardingAudit: AuditLogEntry = {
        id: `aud-onb-${Date.now()}`,
        actorName: newMember.fullName,
        actorRole: "Member",
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `${newMember.fullName} (${newMember.quanterId})`,
        oldValue: "Applicant",
        newValue: "Trainee",
        reason: `Completed 6-step registration (${newMember.email})`,
      };

      return {
        members: [newMember, ...state.members],
        teams: nextTeams,
        ledger: [onboardingLedger, ...state.ledger],
        auditLogs: [onboardingAudit, ...state.auditLogs],
        currentMemberId: newId,
        isAuthenticated: true,
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateMemberProfileSelf: (memberId, updates) => {
    set((state) => {
      if (
        state.currentMemberId !== memberId &&
        !["Super Admin", "HR Head"].includes(state.activeAdminRole)
      ) {
        return state;
      }
      const allowedKeys = new Set([
        "fullName",
        "avatarUrl",
        "bio",
        "quote",
        "availability",
        "skills",
        "githubUrl",
        "linkedinUrl",
        "portfolioUrl",
        "cvUrl",
        "commune",
        "wilaya",
        "housingType",
        "commuteTime",
        "canStayLate",
        "hasLaptop",
        "pcCapability",
        "equipmentTags",
        "outsideActivitiesAndVolunteering",
        "phone",
        "major",
        "university",
        "academicYear",
        "tenure",
        "declaresOtherStudentOrg",
        "onboardingTicks",
        "birthDate",
      ]);
      const nowIso = new Date().toISOString();
      const sanitizedUpdates: Record<string, unknown> = { updatedAt: nowIso };
      for (const [k, v] of Object.entries(updates)) {
        if (allowedKeys.has(k)) {
          sanitizedUpdates[k] = v;
        }
      }
      return {
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, ...sanitizedUpdates } : m
        ),
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateMemberFullAdmin: (memberId, updates, reason = "Admin profile update") => {
    set((state) => {
      const currentMember = state.members.find((m) => m.id === memberId);
      if (!currentMember) return state;

      // Handle team membership sync if teamId was modified
      let nextTeams = state.teams;
      if (updates.teamId !== undefined && updates.teamId !== currentMember.teamId) {
        nextTeams = state.teams.map((t) => {
          if (updates.teamId && t.id === updates.teamId) {
            return {
              ...t,
              memberIds: Array.from(new Set([...t.memberIds, memberId])),
            };
          } else if (currentMember.teamId && t.id === currentMember.teamId) {
            return {
              ...t,
              memberIds: t.memberIds.filter((id) => id !== memberId),
              leaderMemberId: t.leaderMemberId === memberId ? "" : t.leaderMemberId,
            };
          }
          return t;
        });
      }

      // If roles changed or team leader role needs sync
      const leaderIds = new Set(
        nextTeams
          .filter((t) => !t.archived && Boolean(t.leaderMemberId))
          .map((t) => t.leaderMemberId)
      );

      const nextMembers = state.members.map((m) => {
        if (m.id !== memberId) {
          const isLead = leaderIds.has(m.id);
          if (m.roles.includes("Team Leader") && !isLead) {
            return { ...m, roles: m.roles.filter((r) => r !== "Team Leader") };
          }
          return m;
        }

        const nowIso = new Date().toISOString();
        const merged: Member = { ...m, ...updates, updatedAt: nowIso };

        // If academic year was edited to active student (L1-M2) and status wasn't explicitly passed, auto-reconcile to Active
        if (
          updates.academicYear &&
          updates.academicYear !== "Graduated" &&
          !updates.status &&
          m.status === "Alumni"
        ) {
          merged.status = "Active";
        }

        // Ensure status, tenure, academicYear and roles remain strictly consistent
        if (merged.status === "Active") {
          merged.roles = (merged.roles || []).filter((r) => r !== "Alumni");
          if (merged.roles.length === 0) merged.roles = ["Member"];
          if (merged.tenure === "QUANTA Alumni") merged.tenure = "2+ Years";
          if (merged.academicYear === "Graduated") merged.academicYear = "M2";
          merged.alumniAccessEnabled = false;
        } else if (merged.status === "Alumni") {
          if (!merged.roles.includes("Alumni")) {
            merged.roles = [...merged.roles, "Alumni"];
          }
          if (!merged.tenure || !merged.tenure.toLowerCase().includes("alumni")) {
            merged.tenure = "QUANTA Alumni";
          }
        }

        // Recalculate levelTitle and level if tenure/seniority or XP changed and wasn't explicitly overridden
        if (updates.tenure && !updates.levelTitle) {
          const cleanTenure = String(updates.tenure).trim().toLowerCase();
          if (cleanTenure.includes("alumni")) {
            merged.level = 8;
            merged.levelTitle = "Quanta Laureate";
          } else if (cleanTenure.includes("3 year")) {
            merged.level = 3;
            merged.levelTitle = "3 Years Member";
          } else if (cleanTenure.includes("2+") || cleanTenure.includes("2 years")) {
            merged.level = 3;
            merged.levelTitle = "2 Years Member";
          } else if (cleanTenure.includes("1 year")) {
            merged.level = 2;
            merged.levelTitle = "1 Year Member";
          } else if (cleanTenure.includes("bureau") || cleanTenure.includes("leadership")) {
            merged.level = 3;
            merged.levelTitle = "Executive Quanter";
          } else if (cleanTenure.includes("new")) {
            merged.level = 1;
            merged.levelTitle = "Novice Quanter";
          }
        }

        return merged;
      });

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Super Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `${updates.fullName || currentMember.fullName} (${currentMember.quanterId})`,
        oldValue: currentMember.fullName,
        newValue: updates.fullName || currentMember.fullName,
        reason,
      };

      return {
        members: nextMembers,
        teams: nextTeams,
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  confirmTraineeToActive: (memberId, reason, actorName = "HR Administration") => {
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
                statusSince: new Date().toISOString().slice(0, 10),
                onboardingTicks: {
                  ...m.onboardingTicks,
                  hrApproved: true,
                  hrApprovedAt: new Date().toISOString(),
                  hrApprovedBy: actorName,
                },
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
          subtitle: `${member.fullName} has completed the qualification review and is now an Official Active Member of QUANTA.`,
          xpEarned: 50,
        },
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

    ensureWelcomeMessageDelivered: (memberId: string) => {
    set((state) => {
      if (state.settings.welcomeMessageEnabled === false) return state;
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const isAdmitted =
        member.status === "Trainee" ||
        member.status === "Active" ||
        member.status === "Alumni" ||
        Boolean(member.onboardingTicks?.hrApproved);
      if (!isAdmitted) return state;

      const alreadyDelivered = state.messages.some(
        (m) =>
          m.targetMemberId === memberId &&
          (m.id.includes("msg-adm-") || m.id.includes("msg-welcome-"))
      );
      if (alreadyDelivered) return state;

      const rawTitle = (state.settings.welcomeMessageTitle || "").trim() || "🎉 Welcome to QUANTA! Your Admission is Approved";
      const rawBody =
        (state.settings.welcomeMessageBody || "").trim() ||
        "Congratulations {name}! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau. You now have full access to workshops, projects, quizzes, and community spaces.";
      const senderLabel = state.settings.welcomeMessageSenderLabel || "QUANTA Executive Bureau";
      const senderRole = state.settings.welcomeMessageSenderRole || "Executive";

      const memberName = (member.fullName || "").trim() || "Quanter";
      const formattedTitle = (rawTitle.replace(/\{name\}/gi, memberName)).trim() || "🎉 Welcome to QUANTA! Your Admission is Approved";
      const formattedBody = (rawBody.replace(/\{name\}/gi, memberName)).trim() || "Congratulations! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau.";

      const welcomeNotice: ClubMessage = {
        id: `msg-welcome-${member.id}-${Date.now()}`,
        senderLabel,
        senderRole,
        recipientScope: member.fullName,
        priority: "Official notice",
        title: formattedTitle,
        body: formattedBody,
        timeAgo: "Just now",
        unread: true,
        channels: { inApp: true, email: true },
        stats: {
          totalRecipients: 1,
          inAppReadCount: 0,
          emailSentCount: 1,
          emailFailedCount: 0,
        },
        targetMemberId: member.id,
        readMemberIds: [],
        actionLink: "/home",
      };

      return {
        messages: [welcomeNotice, ...state.messages],
      };
    });
  },

  approveMemberAdmission: ({ memberId, actorName = "HR Directorate", notes }) => {
    set((state) => {
      const currentActor = state.members.find((m) => m.id === state.currentMemberId);
      const isPrivileged = Boolean(
        currentActor &&
        (currentActor.roles.some((r) => ["Super Admin", "Executive", "HR Head"].includes(r)) ||
        ["quantaclubdz@gmail.com", "ayoubsarri1@gmail.com", "hr.quanta@univ-alger.dz"].includes(currentActor.email.toLowerCase()))
      );
      if (!isPrivileged) {
        console.warn("[Security Guard] Unauthorized admission approval rejected.");
        return state;
      }
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const targetStatus: MemberStatus = (member.tenure?.toLowerCase().includes("alumni")
        ? "Alumni"
        : "Trainee");

      const audit: AuditLogEntry = {
        id: `aud-adm-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: member.status,
        newValue: targetStatus,
        reason: notes ? `HR Admission Approved: ${notes}` : "HR Admission Approved by HR Directorate",
      };

      const welcomeEnabled = state.settings.welcomeMessageEnabled !== false;
      let newMessages = state.messages;

      if (welcomeEnabled) {
        const rawTitle = (state.settings.welcomeMessageTitle || "").trim() || "🎉 Welcome to QUANTA! Your Admission is Approved";
        const rawBody =
          (state.settings.welcomeMessageBody || "").trim() ||
          "Congratulations {name}! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau. You now have full access to workshops, projects, quizzes, and community spaces.";
        const senderLabel = state.settings.welcomeMessageSenderLabel || actorName || "QUANTA Executive Bureau";
        const senderRole = state.settings.welcomeMessageSenderRole || "Executive";

        const memberName = (member.fullName || "").trim() || "Quanter";
        const formattedTitle = (rawTitle.replace(/\{name\}/gi, memberName)).trim() || "🎉 Welcome to QUANTA! Your Admission is Approved";
        const formattedBody = (rawBody.replace(/\{name\}/gi, memberName)).trim() || "Congratulations! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau.";

        const admissionNotice: ClubMessage = {
          id: `msg-adm-${member.id}-${Date.now()}`,
          senderLabel,
          senderRole,
          recipientScope: member.fullName,
          priority: "Official notice",
          title: formattedTitle,
          body: formattedBody,
          timeAgo: "Just now",
          unread: true,
          channels: { inApp: true, email: true },
          stats: {
            totalRecipients: 1,
            inAppReadCount: 0,
            emailSentCount: 1,
            emailFailedCount: 0,
          },
          targetMemberId: member.id,
          readMemberIds: [],
          actionLink: "/home",
        };
        newMessages = [admissionNotice, ...state.messages];
      }

      const welcomeLedgerEntry: PointsLedgerEntry = {
        id: `led-adm-${member.id}-${Date.now()}`,
        memberId: member.id,
        memberName: member.fullName,
        amount: 50,
        reason: "Welcome Admission Bonus · Official Induction into QUANTA (+50 XP)",
        ruleLabel: "HR Induction XP Bonus",
        source: "Manual",
        actorName,
        date: new Date().toISOString().slice(0, 10),
      };

      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: targetStatus,
                statusSince: new Date().toISOString().slice(0, 10),
                xpTotal: (m.xpTotal || 0) + 50,
                xpSeason: (m.xpSeason || 0) + 50,
                onboardingTicks: {
                  ...m.onboardingTicks,
                  hrApproved: true,
                  hrApprovedAt: new Date().toISOString(),
                  hrApprovedBy: actorName,
                },
                statusHistory: [
                  {
                    id: `sh-${Date.now()}`,
                    fromStatus: m.status,
                    toStatus: targetStatus,
                    reason: notes ? `HR Admission Approved: ${notes}` : "HR Admission Approved",
                    actorName,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.statusHistory,
                ],
              }
            : m
        ),
        messages: newMessages,
        ledger: [welcomeLedgerEntry, ...state.ledger],
        auditLogs: [audit, ...state.auditLogs],
        celebration: {
          open: true,
          type: "confirmation",
          title: "Quanter Admitted!",
          subtitle: `${member.fullName} has been approved and inducted into QUANTA as ${targetStatus}.`,
          xpEarned: 50,
        },
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  rejectMemberAdmission: ({ memberId, actorName = "HR Directorate", reason }) => {
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const audit: AuditLogEntry = {
        id: `aud-rej-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `${member.fullName} (${member.quanterId})`,
        oldValue: member.status,
        newValue: "Removed" as MemberStatus,
        reason: `HR Admission Rejected: ${reason}`,
      };

      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: "Removed" as MemberStatus,
                removalReason: reason,
                statusSince: new Date().toISOString().slice(0, 10),
                onboardingTicks: {
                  ...m.onboardingTicks,
                  hrApproved: false,
                },
                statusHistory: [
                  {
                    id: `sh-${Date.now()}`,
                    fromStatus: m.status,
                    toStatus: "Removed" as MemberStatus,
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
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  forceLogoutAllSessions: async (options) => {
    const now = Date.now();
    set((state) => ({
      sessionStartedAt: options?.keepCurrentSession ? now + 1000 : state.sessionStartedAt,
      settings: {
        ...state.settings,
        forceLogoutAllAt: now,
      },
      auditLogs: [
        {
          id: `aud-rev-all-${now}`,
          actorName: state.activeAdminRole,
          actorRole: state.activeAdminRole,
          timestamp: nowStamp(),
          actionCategory: "Access Grant / Revoke",
          targetLabel: "Global Session Revocation",
          oldValue: "Active Sessions Permitted",
          newValue: `Terminated All Sessions at ${now}`,
          reason: "Super Admin Remote Global Session Revocation Directive",
        },
        ...state.auditLogs,
      ],
    }));
    get().saveToLocalCache();
    await get().syncWithServer(true).catch(() => {});
  },

  forceLogoutSpecificMember: async (memberId, reason = "Remote session terminated by Super Admin") => {
    const now = Date.now();
    set((state) => {
      const target = state.members.find((m) => m.id === memberId);
      const currentRevoked = state.settings.revokedSessionMemberIds || {};
      return {
        settings: {
          ...state.settings,
          revokedSessionMemberIds: {
            ...currentRevoked,
            [memberId]: now,
          },
        },
        auditLogs: [
          {
            id: `aud-rev-mem-${now}`,
            actorName: state.activeAdminRole,
            actorRole: state.activeAdminRole,
            timestamp: nowStamp(),
            actionCategory: "Access Grant / Revoke",
            targetLabel: target ? `${target.fullName} (${target.quanterId})` : memberId,
            oldValue: "Active Session Permitted",
            newValue: `Revoked Session at ${now}`,
            reason,
          },
          ...state.auditLogs,
        ],
      };
    });
    get().saveToLocalCache();
    await get().syncWithServer(true).catch(() => {});
  },

  restoreMemberSessionAccess: async (memberId) => {
    set((state) => {
      const currentRevoked = { ...(state.settings.revokedSessionMemberIds || {}) };
      delete currentRevoked[memberId];
      return {
        settings: {
          ...state.settings,
          revokedSessionMemberIds: currentRevoked,
        },
      };
    });
    get().saveToLocalCache();
    await get().syncWithServer(true).catch(() => {});
  },

  deleteClubMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  deleteAllClubMessages: () => {
    set({ messages: [] });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

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
  }) => {
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
                onboardingTicks:
                  toStatus === "Active"
                    ? {
                        ...m.onboardingTicks,
                        hrApproved: true,
                        hrApprovedAt: new Date().toISOString(),
                        hrApprovedBy: actorName,
                      }
                    : m.onboardingTicks,
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
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  resumeMembershipSelf: ({ memberId, reason }) => {
    const state = get();
    const member = state.members.find((m) => m.id === memberId);
    if (!member) return { ok: false, message: "Member account not found." };

    const prior =
      member.statusHistory.find(
        (sh) => sh.toStatus === "Active" || sh.toStatus === "Trainee"
      )?.toStatus || "Active";
    const resumeReason =
      reason?.trim() || "Resumed membership from paused/frozen status";

    const audit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: member.fullName,
      actorRole: member.roles[0] || "Member",
      timestamp: nowStamp(),
      actionCategory: "Status Change",
      targetLabel: `${member.fullName} (${member.quanterId})`,
      oldValue: member.status,
      newValue: prior,
      reason: resumeReason,
    };

    set((s) => ({
      members: s.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              status: prior,
              statusSince: new Date().toISOString().slice(0, 10),
              suspensionEndDate: undefined,
              statusHistory: [
                {
                  id: `sh-${Date.now()}`,
                  fromStatus: m.status,
                  toStatus: prior,
                  reason: resumeReason,
                  actorName: member.fullName,
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
    get().syncWithServer(true).catch(() => {});
    return {
      ok: true,
      message: `Welcome back! Your membership is now active as ${prior}.`,
    };
  },

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

    if (action === "resume") {
      return get().resumeMembershipSelf({ memberId, reason: motif });
    }

    const cleanPass = passwordConfirm ? passwordConfirm.trim() : "";
    const isGoogleAuth = cleanPass === "GOOGLE_VERIFIED";
    const legacyOrHash =
      member.passwordHash || (member as Member & { password?: string }).password;
    const validPass =
      isGoogleAuth ||
      (Boolean(legacyOrHash) && verifyCredentialDigest(member.email, cleanPass, legacyOrHash!));

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
    get().syncWithServer(true).catch(() => {});

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
    get().syncWithServer(true).catch(() => {});

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
    actorName = "HR Administration"
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
    get().syncWithServer(true).catch(() => {});
  },

  reactivateFormerMember: (memberId, toStatus, reason, departmentIdOrActor, teamId) => {
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const isDept = departmentIdOrActor && departmentIdOrActor.startsWith("dept-");
      const actorName = isDept ? "HR Administration" : (departmentIdOrActor || "HR Administration");
      const targetDeptId = isDept ? departmentIdOrActor : member.departmentId;
      const targetTeamId = teamId || member.teamId;

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

      const nextTeams = targetTeamId
        ? state.teams.map((t) =>
            t.id === targetTeamId
              ? { ...t, memberIds: Array.from(new Set([...t.memberIds, member.id])) }
              : t
          )
        : state.teams;

      return {
        teams: nextTeams,
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: toStatus,
                departmentId: targetDeptId,
                teamId: targetTeamId,
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
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  createAdminMember: (payload) => {
    const num = Math.floor(100 + Math.random() * 899);
    const newId = `mem-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    const status: MemberStatus = payload.status || "Active";
    const role: RoleTemplateName = payload.role || (status === "Alumni" ? "Alumni" : "Member");
    const newMember: Member = {
      id: newId,
      quanterId: status === "Alumni" ? `QT-23-0${num}` : `QT-26-0${num}`,
      handle: `@quanter0${num}`,
      email: payload.email.trim().toLowerCase(),
      fullName: payload.fullName.trim(),
      phone: payload.phone?.trim() || "+213 550 00 00 00",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces",
      bio: "QUANTA Scientific Club Member",
      major: payload.major?.trim() || "Computer Science",
      university: "University of Algiers 1",
      academicYear: payload.academicYear || "L3",
      tenure: status === "Active" ? "1 Year" : "New Member",
      yearsInClub: status === "Active" ? 1 : 0,
      clubJoinYear: status === "Active" ? 2025 : 2026,
      departmentId: payload.departmentId || "dept-it",
      teamId: payload.teamId || undefined,
      wilaya: "Algiers (16)",
      commune: "Bab Ezzouar",
      housingType: "Family Home",
      commuteTime: "< 30 min",
      canStayLate: true,
      hasLaptop: true,
      pcCapability: "Coding & Dev",
      equipmentTags: ["Personal Laptop"],
      roles: [role],
      isBureauMember: ["Super Admin", "Executive", "HR Head", "Department Head"].includes(role),
      status,
      statusSince: new Date().toISOString().slice(0, 10),
      traineeStartDate: new Date().toISOString().slice(0, 10),
      traineeDaysElapsed: status === "Active" ? 95 : 1,
      outsideActivitiesAndVolunteering: "",
      declaresOtherStudentOrg: false,
      availability: DEFAULT_AVAILABILITY,
      xpTotal: status === "Active" ? 150 : 50,
      xpSeason: status === "Active" ? 150 : 50,
      xpMonth: status === "Active" ? 150 : 50,
      level: status === "Active" ? 2 : 1,
      levelTitle: status === "Active" ? "1 Year Member" : "Novice Quanter",
      attendanceRate: 100,
      onTimeTaskRate: 100,
      recentActivityScore: 100,
      healthScore: 95,
      daysSinceLastActivity: 0,
      lateTasksThisMonth: 0,
      recognitionLabels: [],
      onboardingTicks: {
        profileComplete: true,
        buddyAssigned: status === "Active",
        firstTaskBeforeDay30: status === "Active",
        firstWorkshopAttended: status === "Active",
      },
      traineeEvaluation: { headEndorsed: status === "Active", coManagerEndorsed: status === "Active", notes: "" },
      skills: ["Scientific Research", "Python"],
      badgeIds: [],
      workshopsCompletedCount: 0,
      projectsCompletedCount: 0,
      eventsAttendedCount: 0,
      statusHistory: [],
      placementHistory: [],
    };

    set((state) => {
      const nextTeams = payload.teamId
        ? state.teams.map((t) =>
            t.id === payload.teamId
              ? { ...t, memberIds: Array.from(new Set([...t.memberIds, newId])) }
              : t
          )
        : state.teams;
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `${newMember.fullName} (${newMember.quanterId})`,
        oldValue: "None",
        newValue: `${status} (${role})`,
        reason: "Created via Admin Members Directory",
      };
      return {
        members: [newMember, ...state.members],
        teams: nextTeams,
        currentMemberId: state.members.length === 0 ? newId : state.currentMemberId,
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
    return newMember;
  },

  deleteMember: (memberId, reason = "Deleted via Admin Directory", permanent = false) => {
    set((state) => {
      const target = state.members.find((m) => m.id === memberId);
      if (!target) return state;

      if (!permanent) {
        // Option A: Move to Removed (Retains member in former members directory, reserves email)
        const audit: AuditLogEntry = {
          id: `aud-${Date.now()}`,
          actorName: "Admin",
          actorRole: state.activeAdminRole,
          timestamp: nowStamp(),
          actionCategory: "Status Change",
          targetLabel: `${target.fullName} (${target.quanterId})`,
          oldValue: target.status,
          newValue: "Removed",
          reason,
        };
        return {
          members: state.members.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  status: "Removed",
                  departmentId: "",
                  teamId: undefined,
                  statusHistory: [
                    {
                      id: `sh-${Date.now()}`,
                      fromStatus: m.status,
                      toStatus: "Removed",
                      date: nowStamp(),
                      actorName: "Admin",
                      reason,
                    },
                    ...m.statusHistory,
                  ],
                }
              : m
          ),
          departments: state.departments.map((d) => ({
            ...d,
            headMemberId: d.headMemberId === memberId ? "" : d.headMemberId,
            coManagerMemberId: d.coManagerMemberId === memberId ? "" : d.coManagerMemberId,
          })),
          teams: state.teams.map((t) => ({
            ...t,
            leaderMemberId: t.leaderMemberId === memberId ? "" : t.leaderMemberId,
            memberIds: t.memberIds.filter((id) => id !== memberId),
          })),
          auditLogs: [audit, ...state.auditLogs],
        };
      } else {
        // Option B: Permanent Delete & Archive (Purges from active/former members, releases email)
        recordPersistentDeletedId("members", memberId);
        const remaining = state.members.filter((m) => m.id !== memberId);
        const archivedRecord = {
          id: target.id,
          quanterId: target.quanterId,
          fullName: target.fullName,
          email: target.email,
          phone: target.phone,
          departmentId: target.departmentId,
          roles: target.roles,
          archivedAt: nowStamp(),
          archivedBy: "Admin",
          reason,
          lastStateSnapshot: target,
        };
        const audit: AuditLogEntry = {
          id: `aud-${Date.now()}`,
          actorName: "Admin",
          actorRole: state.activeAdminRole,
          timestamp: nowStamp(),
          actionCategory: "Status Change",
          targetLabel: `${target.fullName} (${target.quanterId})`,
          oldValue: target.status,
          newValue: "Permanently Deleted & Released",
          reason,
        };
        return {
          members: remaining,
          settings: {
            ...state.settings,
            archivedMembers: [archivedRecord, ...(state.settings.archivedMembers || [])],
          },
          departments: state.departments.map((d) => ({
            ...d,
            headMemberId: d.headMemberId === memberId ? "" : d.headMemberId,
            coManagerMemberId: d.coManagerMemberId === memberId ? "" : d.coManagerMemberId,
          })),
          teams: state.teams.map((t) => ({
            ...t,
            leaderMemberId: t.leaderMemberId === memberId ? "" : t.leaderMemberId,
            memberIds: t.memberIds.filter((id) => id !== memberId),
          })),
          currentMemberId:
            state.currentMemberId === memberId
              ? remaining[0]?.id || ""
              : state.currentMemberId,
          auditLogs: [audit, ...state.auditLogs],
        };
      }
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

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
          invitedBy: "HR Administration",
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
        const effectiveSeats = Math.max(0, w.capacity - w.registeredMemberIds.length);
        if (effectiveSeats <= 0) {
          return {
            ...w,
            seatsLeft: 0,
            waitlistMemberIds: Array.from(new Set([...w.waitlistMemberIds, memberId])),
          };
        }
        const nextRegistered = [...w.registeredMemberIds, memberId];
        return {
          ...w,
          seatsLeft: Math.max(0, w.capacity - nextRegistered.length),
          registeredMemberIds: nextRegistered,
        };
      }),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  cancelWorkshopRegistration: (workshopId, memberId) => {
    set((state) => ({
      workshops: state.workshops.map((w) => {
        if (w.id !== workshopId) return w;
        // Allow removing from waitlist if user was waitlisted
        if (w.waitlistMemberIds.includes(memberId)) {
          return {
            ...w,
            waitlistMemberIds: w.waitlistMemberIds.filter((id) => id !== memberId),
          };
        }
        if (!w.registeredMemberIds.includes(memberId)) return w;

        const nextRegistered = w.registeredMemberIds.filter((id) => id !== memberId);
        const shouldPromote =
          Boolean(state.settings.waitlistAutoPromote ?? true) &&
          Array.isArray(w.waitlistMemberIds) &&
          w.waitlistMemberIds.length > 0;

        if (shouldPromote) {
          const [promotedId, ...remainingWaitlist] = w.waitlistMemberIds;
          const finalReg = [...nextRegistered, promotedId];
          return {
            ...w,
            registeredMemberIds: finalReg,
            waitlistMemberIds: remainingWaitlist,
            seatsLeft: Math.max(0, w.capacity - finalReg.length),
          };
        }

        return {
          ...w,
          seatsLeft: Math.max(0, w.capacity - nextRegistered.length),
          registeredMemberIds: nextRegistered,
        };
      }),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  verifyWorkshopCheckIn: (workshopId, memberId, codeOrToken, method) => {
    const state = get();
    const ws = state.workshops.find((w) => w.id === workshopId);
    const member = state.members.find((m) => m.id === memberId);
    if (!ws || !member) return { ok: false, message: "Session or member not found." };

    if (ws.status !== "Running" && ws.status !== "Published") {
      return {
        ok: false,
        message: "This workshop session is not currently open for attendance check-in.",
      };
    }

    if (ws.eventDate) {
      const now = new Date();
      const graceMs = (state.settings.checkinGraceMinutes ?? 30) * 60 * 1000;
      const sessionEnd = ws.endTime
        ? new Date(`${ws.eventDate}T${ws.endTime}:00`)
        : new Date(`${ws.eventDate}T23:59:59`);
      if (now.getTime() > sessionEnd.getTime() + graceMs) {
        return { ok: false, message: "Check-in window has closed for this workshop session." };
      }
    }

    if (!ws.registeredMemberIds.includes(memberId)) {
      return {
        ok: false,
        message: "You are not registered for this workshop session. Please register first.",
      };
    }

    const alreadyCheckedIn = ws.attendanceRecords.some(
      (r) => r.memberId === memberId && r.status === "Present"
    );
    if (alreadyCheckedIn) {
      return { ok: false, message: "You have already checked in for this session." };
    }

    const cleanInput = codeOrToken.trim().toUpperCase();
    const expectedCode = (ws.liveSixDigitCode || "").trim().toUpperCase();
    const expectedToken = (ws.liveQrToken || "").trim().toUpperCase();

    const valid =
      (expectedCode && cleanInput === expectedCode) ||
      (expectedToken && cleanInput === expectedToken);

    if (!valid) {
      return {
        ok: false,
        message: "Invalid or expired session code. Please verify the code displayed on the projector.",
      };
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

    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});

    return { ok: true, message: `Checked in! +${ws.xpReward} XP added.` };
  },

  correctAttendance: (workshopId, memberId, status, reason, actorName = "Check-in Operator") =>
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

  updateWorkshop: (workshopId, updates, reason) => {
    set((state) => {
      const existing = state.workshops.find((w) => w.id === workshopId);
      if (!existing) return state;

      const updatedWs: Workshop = {
        ...existing,
        ...updates,
      };

      if (updates.capacity !== undefined) {
        const regCount = updatedWs.registeredMemberIds?.length || 0;
        updatedWs.seatsLeft = Math.max(0, updates.capacity - regCount);
      }

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `Workshop: ${updatedWs.title}`,
        oldValue: JSON.stringify({ title: existing.title, status: existing.status }),
        newValue: JSON.stringify({ title: updatedWs.title, status: updatedWs.status }),
        reason: reason || "Workshop details updated by organizer / admin",
      };

      return {
        workshops: state.workshops.map((w) => (w.id === workshopId ? updatedWs : w)),
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  deleteWorkshop: (workshopId, isPermanent = false, reason) => {
    recordPersistentDeletedId("workshops", workshopId);
    registerRecentDeletion(workshopId);
    set((state) => {
      const existing = state.workshops.find((w) => w.id === workshopId);
      if (!existing) return state;

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName: "Admin",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: `Workshop: ${existing.title}`,
        oldValue: existing.status,
        newValue: isPermanent ? "Permanently Deleted" : "Archived",
        reason: reason || (isPermanent ? "Workshop permanently removed" : "Workshop archived"),
      };

      return {
        workshops: isPermanent
          ? state.workshops.filter((w) => w.id !== workshopId)
          : state.workshops.map((w) => (w.id === workshopId ? { ...w, status: "Archived" } : w)),
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
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
    get().syncWithServer(true).catch(() => {});
  },

  updateWorkshopCategory: (oldCat: string, newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed || trimmed === oldCat) return;
    set((state) => ({
      workshopCategories: state.workshopCategories.map((c) => (c === oldCat ? trimmed : c)),
      workshops: state.workshops.map((w) =>
        w.category === oldCat ? { ...w, category: trimmed as any } : w
      ),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  deleteWorkshopCategory: (category: string) => {
    set((state) => ({
      workshopCategories: state.workshopCategories.filter((c) => c !== category),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  addBadgeCategory: (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.badgeCategories.includes(trimmed)) return state;
      return { badgeCategories: [...state.badgeCategories, trimmed] };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateBadgeCategory: (oldCat: string, newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed || trimmed === oldCat) return;
    set((state) => ({
      badgeCategories: state.badgeCategories.map((c) => (c === oldCat ? trimmed : c)),
      badges: state.badges.map((b) =>
        b.category === oldCat ? { ...b, category: trimmed } : b
      ),
      exams: state.exams.map((e) =>
        e.category === oldCat ? { ...e, category: trimmed } : e
      ),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  deleteBadgeCategory: (category: string) => {
    set((state) => ({
      badgeCategories: state.badgeCategories.filter((c) => c !== category),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  addProjectCategory: (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.projectCategories.includes(trimmed)) return state;
      return { projectCategories: [...state.projectCategories, trimmed] };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  deleteProjectCategory: (category: string) => {
    set((state) => ({
      projectCategories: state.projectCategories.filter((c) => c !== category),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateProjectCategory: (oldCat: string, newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    set((state) => ({
      projectCategories: state.projectCategories.map((c) =>
        c === oldCat ? trimmed : c
      ),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
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
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;
      const assignee = task.assignees.map((a) => (a.memberId === memberId ? a : null)).find(Boolean);
      // Immutability Guard: Cannot re-deliver an already validated task without explicit manager revision request
      if (assignee?.status === "Validated") {
        return state;
      }
      return {
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
      };
    }),

  validateAndScoreTask: ({
    taskId,
    memberId,
    scoreType,
    awardedScore,
    feedback,
    validatorName = "Department Head",
  }) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      const member = state.members.find((m) => m.id === memberId);
      if (!task || !member) return state;

      // STRICT SELF-VALIDATION GUARD: No user can score their own task, regardless of role!
      if (state.currentMemberId === memberId) {
        return state;
      }

      // Check manager privilege
      const allowedRoles: RoleTemplateName[] = [
        "Super Admin",
        "Executive",
        "Department Head",
        "Co-Manager",
      ];
      if (!allowedRoles.includes(state.activeAdminRole)) {
        return state;
      }

      // Prevent double-dipping: cannot score an already validated assignee
      const assignee = task.assignees.find((a) => a.memberId === memberId);
      if (assignee?.status === "Validated" && assignee.awardedScore !== undefined) {
        return state;
      }

      // Bound awarded score to task bounds + bonus cap
      const maxScoreAllowed = (task.proposedScore || 30) + 20;
      const safeScore = Math.max(0, Math.min(awardedScore, maxScoreAllowed));

      const newLedger: PointsLedgerEntry = {
        id: `led-${Date.now()}`,
        memberId,
        memberName: member.fullName,
        amount: safeScore,
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
        newValue: `Validated (+${safeScore} XP · ${scoreType})`,
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
                        awardedScore: safeScore,
                        managerFeedback: feedback,
                        validatedBy: validatorName,
                        validatedAt: new Date().toISOString().slice(0, 10),
                      }
                    : a
                ),
              }
            : t
        ),
        members: state.members.map((m) => {
          if (m.id !== memberId) return m;
          const newSeasonXp = Math.max(0, m.xpSeason + safeScore);
          return {
            ...m,
            xpTotal: Math.max(0, m.xpTotal + safeScore),
            xpSeason: newSeasonXp,
            xpMonth: Math.max(0, m.xpMonth + safeScore),
          };
        }),
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

  bulkScoreMembers: (memberIds, points, reason, actorName = "Department Head") =>
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
        members: state.members.map((m) => {
          if (!memberIds.includes(m.id)) return m;
          const newSeasonXp = Math.max(0, m.xpSeason + points);
          return {
            ...m,
            xpTotal: Math.max(0, m.xpTotal + points),
            xpSeason: newSeasonXp,
            xpMonth: Math.max(0, m.xpMonth + points),
          };
        }),
        ledger: [...newEntries, ...state.ledger],
      };
    }),

  addManualPointsEntry: (memberId, amount, ruleLabel, reason, actorName = "HR Administration") =>
    set((state) => {
      const allowedRoles: RoleTemplateName[] = [
        "Super Admin",
        "Executive",
        "HR Head",
        "Department Head",
        "Co-Manager",
      ];
      if (!allowedRoles.includes(state.activeAdminRole)) {
        return state;
      }
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
      const newSeasonXp = Math.max(0, member.xpSeason + amount);
      return {
        ledger: [entry, ...state.ledger],
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                xpTotal: Math.max(0, m.xpTotal + amount),
                xpSeason: newSeasonXp,
                xpMonth: Math.max(0, m.xpMonth + amount),
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),

  reversePointsEntry: (entryId, reason, actorName = "HR Administration") =>
    set((state) => {
      const target = state.ledger.find((l) => l.id === entryId);
      if (!target || target.reversedByEntryId || target.source === "Reversal") return state;
      const member = state.members.find((m) => m.id === target.memberId);
      if (!member) return state;

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

      const newTotal = Math.max(0, member.xpTotal - target.amount);
      const newSeason = Math.max(0, member.xpSeason - target.amount);
      const newMonth = Math.max(0, member.xpMonth - target.amount);

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
                xpTotal: newTotal,
                xpSeason: newSeason,
                xpMonth: newMonth,
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
    const entry = get().ledger.find((l) => l.id === entryId);
    if (!entry || entry.appealStatus !== "Pending") return;
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
    get().syncWithServer(true).catch(() => {});
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
    get().syncWithServer(true).catch(() => {});
  },

  deletePointRule: (ruleId) => {
    recordPersistentDeletedId("pointRules", ruleId);
    set((state) => ({
      pointRules: state.pointRules.filter((r) => r.id !== ruleId),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  publishMonthlyHonours: (
    motmMemberId,
    championMemberIds,
    bonusXp = 50,
    citation = "Published Monthly Club-Wide Member of the Month",
    actorName = "HR Administration",
    targetMonth,
    broadcastAnnouncement = true
  ) => {
    const safeBonus = Math.max(0, Number(bonusXp) || 50);
    const targetIds = Array.isArray(motmMemberId)
      ? Array.from(new Set(motmMemberId.filter(Boolean)))
      : motmMemberId
      ? [motmMemberId]
      : [];

    if (targetIds.length === 0) return;

    const currentMonthStr =
      targetMonth?.trim() ||
      new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    set((state) => {
      const crownedMembers = state.members.filter((m) => targetIds.includes(m.id));
      if (crownedMembers.length === 0) return state;

      const dateStamp = new Date().toISOString().slice(0, 10);
      const newEntries: PointsLedgerEntry[] = crownedMembers.map((m, idx) => ({
        id: `led-motm-${Date.now()}-${idx}`,
        memberId: m.id,
        memberName: m.fullName,
        amount: safeBonus,
        ruleLabel: "Member of the Month",
        reason:
          citation ||
          `Member of the Month — ${currentMonthStr} (+${safeBonus} XP)`,
        source: "Monthly Honour",
        actorName,
        date: dateStamp,
        appealStatus: "None",
      }));

      // Update members: all targetIds get "Member of the Month", champions get "Department Champion"
      const updatedMembers = state.members.map((m) => {
        const isMotm = targetIds.includes(m.id);
        const isChamp = championMemberIds.includes(m.id);
        const cleanLabels: RecognitionLabel[] = m.recognitionLabels.filter(
          (l) => l !== "Member of the Month" && l !== "Department Champion"
        );
        if (isMotm) cleanLabels.push("Member of the Month");
        if (isChamp) cleanLabels.push("Department Champion");
        return {
          ...m,
          recognitionLabels: cleanLabels,
          xpTotal: isMotm ? m.xpTotal + safeBonus : m.xpTotal,
          xpSeason: isMotm ? m.xpSeason + safeBonus : m.xpSeason,
          xpMonth: isMotm ? m.xpMonth + safeBonus : m.xpMonth,
        };
      });

      const crownedNames = crownedMembers.map((m) => m.fullName).join(", ");
      const celebrationTitle =
        crownedMembers.length > 1
          ? `Members of the Month · ${currentMonthStr}`
          : `Member of the Month · ${currentMonthStr}`;
      const celebrationSubtitle =
        crownedMembers.length > 1
          ? `${crownedNames} have been crowned QUANTA Members of the Month for ${currentMonthStr} (+${safeBonus} XP each)!`
          : `${crownedNames} has been crowned QUANTA Member of the Month for ${currentMonthStr} (+${safeBonus} XP)!`;

      // Optional Broadcast Message to all club members
      const newMessages = [...state.messages];
      if (broadcastAnnouncement) {
        const broadcastMsg: ClubMessage = {
          id: `msg-motm-${Date.now()}`,
          senderLabel: "QUANTA Administration",
          senderRole: "Executive",
          recipientScope: "All Members",
          priority: "Official notice",
          title: `🌟 إعلان نجم الشهر (${currentMonthStr}) — تهانينا لفرسان كوانتا!`,
          body: `تعلن إدارة نادي كوانتا بفخر واعتزاز عن تتويج نخبة من أعضائنا المتميزين بلقب نجم الشهر (${currentMonthStr}):\n\n${crownedMembers
            .map((m) => `⭐ ${m.fullName} (${m.levelTitle || "عضو متميز"})`)
            .join("\n")}\n\nتقديراً لجهودهم الاستثنائية، تفانيهم الأكاديمي والتقني، ومشاركتهم الفعالة في ورشات ومشاريع النادي، تم منح كل منهم مكافأة استحقاقية قدرها +${safeBonus} نقطة خبرة (XP).\n\nنتمنى لهم ولمزيد من أعضائنا دوام التألق والريادة!`,
          timeAgo: "Just now",
          unread: true,
          archived: false,
          channels: { inApp: true, email: false },
          readMemberIds: [],
          stats: {
            totalRecipients: state.members.length,
            inAppReadCount: 0,
            emailSentCount: 0,
            emailFailedCount: 0,
          },
          actionLink: "/home",
        };
        newMessages.unshift(broadcastMsg);
      }

      return {
        members: updatedMembers,
        ledger: [...newEntries, ...state.ledger],
        messages: newMessages,
        settings: {
          ...state.settings,
          activeMotmMonth: currentMonthStr,
          activeMotmMemberIds: targetIds,
          activeMotmCitation: citation,
        },
        celebration: {
          open: true,
          type: "motm",
          title: celebrationTitle,
          subtitle: celebrationSubtitle,
          xpEarned: safeBonus,
        },
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  removeMonthlyHonours: (memberId) => {
    set((state) => {
      const nextMembers = state.members.map((m) => {
        if (memberId && m.id !== memberId) return m;
        return {
          ...m,
          recognitionLabels: m.recognitionLabels.filter(
            (l) => l !== "Member of the Month" && l !== "Department Champion"
          ),
        };
      });
      const nextActiveIds = memberId
        ? (state.settings.activeMotmMemberIds || []).filter((id) => id !== memberId)
        : [];
      return {
        members: nextMembers,
        settings: {
          ...state.settings,
          activeMotmMemberIds: nextActiveIds,
          ...(nextActiveIds.length === 0
            ? { activeMotmMonth: undefined, activeMotmCitation: undefined }
            : {}),
        },
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  rolloverMonthlyCycle: (targetNewMonth, recalculateFromLedger = true, actorName = "HR Administration") => {
    set((state) => {
      const priorMonth = state.settings.activeMotmMonth || "October 2026";
      const priorCrowned = state.members.filter((m) =>
        m.recognitionLabels?.includes("Member of the Month")
      );

      const archiveRecord =
        priorCrowned.length > 0
          ? {
              month: priorMonth,
              memberIds: priorCrowned.map((m) => m.id),
              memberNames: priorCrowned.map((m) => m.fullName),
              citation:
                state.settings.activeMotmCitation ||
                `Honoured as Member of the Month for ${priorMonth}`,
              bonusXp: 50,
              crownedAt: new Date().toISOString(),
            }
          : null;

      const existingHistory = state.settings.monthlyHonoursHistory || [];
      const updatedHistory = archiveRecord
        ? [archiveRecord, ...existingHistory.filter((h) => h.month !== priorMonth)]
        : existingHistory;

      const monthMap: Record<string, string> = {
        january: "01",
        february: "02",
        march: "03",
        april: "04",
        may: "05",
        june: "06",
        july: "07",
        august: "08",
        september: "09",
        october: "10",
        november: "11",
        december: "12",
      };
      const cleanMonth = targetNewMonth.toLowerCase();
      let datePrefix = "";
      for (const [name, num] of Object.entries(monthMap)) {
        if (cleanMonth.includes(name)) {
          const yearMatch = targetNewMonth.match(/\d{4}/);
          const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
          datePrefix = `${year}-${num}`;
          break;
        }
      }

      const updatedMembers = state.members.map((m) => {
        let newXpMonth = 0;
        if (recalculateFromLedger && datePrefix) {
          const monthEntries = state.ledger.filter(
            (l) =>
              l.memberId === m.id &&
              (l.date || "").startsWith(datePrefix) &&
              !l.reversedByEntryId
          );
          newXpMonth = Math.max(0, monthEntries.reduce((sum, e) => sum + (e.amount || 0), 0));
        }

        const nextLabels = (m.recognitionLabels || []).filter(
          (l) => l !== "Member of the Month" && l !== "Department Champion"
        );

        return {
          ...m,
          recognitionLabels: nextLabels,
          xpMonth: newXpMonth,
        };
      });

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Settings Changed",
        targetLabel: `Monthly Cycle Rollover to ${targetNewMonth}`,
        oldValue: `Active Month: ${priorMonth}`,
        newValue: `Active Month: ${targetNewMonth} (Scores Rolled Over)`,
        reason: `Archived ${priorMonth} honours, stripped active titles, and initialized ${targetNewMonth} monthly scores.`,
      };

      return {
        members: updatedMembers,
        settings: {
          ...state.settings,
          activeMotmMonth: targetNewMonth,
          activeMotmMemberIds: [],
          activeMotmCitation: undefined,
          monthlyHonoursHistory: updatedHistory,
        },
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  syncMonthlyScoresWithLedger: (targetMonth) => {
    set((state) => {
      const monthStr = targetMonth || state.settings.activeMotmMonth || "November 2026";
      const monthMap: Record<string, string> = {
        january: "01",
        february: "02",
        march: "03",
        april: "04",
        may: "05",
        june: "06",
        july: "07",
        august: "08",
        september: "09",
        october: "10",
        november: "11",
        december: "12",
      };
      const cleanMonth = monthStr.toLowerCase();
      let datePrefix = "";
      for (const [name, num] of Object.entries(monthMap)) {
        if (cleanMonth.includes(name)) {
          const yearMatch = monthStr.match(/\d{4}/);
          const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
          datePrefix = `${year}-${num}`;
          break;
        }
      }

      if (!datePrefix) return state;

      const updatedMembers = state.members.map((m) => {
        const monthEntries = state.ledger.filter(
          (l) =>
            l.memberId === m.id &&
            (l.date || "").startsWith(datePrefix) &&
            !l.reversedByEntryId
        );
        const ledgerSum = Math.max(0, monthEntries.reduce((sum, e) => sum + (e.amount || 0), 0));
        return {
          ...m,
          xpMonth: ledgerSum,
        };
      });

      return {
        members: updatedMembers,
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

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

  awardBadgeManually: (badgeId, memberIds, reasonOrNote, actorName = "HR Administration") =>
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

  revokeBadge: (badgeId, memberId, reason, actorName = "HR Administration") =>
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

  deleteOrArchiveBadge: (badgeId, reason) => {
    const targetBadge = get().badges.find((b) => b.id === badgeId);
    if (!targetBadge) return;
    const canDelete = targetBadge.awardedCount === 0;
    recordPersistentDeletedId("badges", badgeId);
    registerRecentDeletion(badgeId);
    set((state) => {
      const badge = state.badges.find((b) => b.id === badgeId);
      if (!badge) return state;
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
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

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
    recordPersistentDeletedId("exams", id);
    set((state) => ({
      exams: state.exams.filter((e) => e.id !== id),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  completeBadgeExam: (examId, scorePercent) => {
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

      const alreadyPassed = (state.examCompletions || []).some(
        (c) => c.examId === examId && c.memberId === state.currentMemberId && c.passed
      );
      const curMember = state.members.find((m) => m.id === state.currentMemberId);
      const alreadyHasBadge = (curMember?.badgeIds || []).includes(exam.badgeId);

      const fullyUnlocked = !isDual || projectApproved;
      // Anti-Farming: Award XP only on the first passed attempt!
      const xpToAward = (alreadyPassed || alreadyHasBadge)
        ? 0
        : (fullyUnlocked ? exam.xpReward : Math.round(exam.xpReward / 2));

      const newLedgerEntry: PointsLedgerEntry | null = (xpToAward > 0 && curMember) ? {
        id: `led-${Date.now()}`,
        memberId: curMember.id,
        memberName: curMember.fullName,
        amount: xpToAward,
        ruleLabel: `Exam Passed: ${exam.title}`,
        reason: `Skill credential exam passed with score ${scorePercent}%`,
        source: "Badge",
        actorName: "Credential Examination Engine",
        date: new Date().toISOString().slice(0, 10),
        appealStatus: "None",
      } : null;

      return {
        ledger: newLedgerEntry ? [newLedgerEntry, ...state.ledger] : state.ledger,
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
        members: state.members.map((m) => {
          if (m.id !== state.currentMemberId) return m;
          const newSeasonXp = Math.max(0, m.xpSeason + xpToAward);
          return {
            ...m,
            xpTotal: Math.max(0, m.xpTotal + xpToAward),
            xpSeason: newSeasonXp,
            xpMonth: Math.max(0, m.xpMonth + xpToAward),
            badgeIds: fullyUnlocked
              ? Array.from(new Set([...m.badgeIds, exam.badgeId]))
              : m.badgeIds,
          };
        }),
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
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  submitBadgeProject: (submission) => {
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
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  reviewProjectSubmission: (submissionId, status, comment) => {
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
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

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
        submitterName: member?.fullName || "QUANTA Member",
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

  voteOnProposal: (proposalId, decision, comment) => {
    const state = get();
    const curMember = state.members.find((m) => m.id === state.currentMemberId);
    const prop = state.proposals.find((p) => p.id === proposalId);
    if (!curMember || !prop) return { ok: false, message: "Resource not found" };

    if (prop.submitterId === curMember.id) {
      return { ok: false, message: "Conflict of Interest: Submitters cannot vote on their own proposal." };
    }

    const isEligibleExec =
      curMember.status === "Active" &&
      (curMember.roles.includes("Executive") || curMember.roles.includes("Super Admin"));
    if (!isEligibleExec) {
      return { ok: false, message: "Unauthorized: Only active Executive Board members may vote." };
    }

    const existingVotes = prop.votes || {};
    const updatedVotes: Record<string, ProposalVote> = {
      ...existingVotes,
      [curMember.id]: {
        memberId: curMember.id,
        memberName: curMember.fullName,
        decision,
        timestamp: new Date().toISOString(),
        comment,
      },
    };

    const totalEligibleExecs = state.members.filter(
      (m) => m.status === "Active" && (m.roles.includes("Executive") || m.roles.includes("Super Admin"))
    ).length;
    const requiredTwoThirds = Math.max(1, Math.ceil((totalEligibleExecs * 2) / 3));
    const approveCount = Object.values(updatedVotes).filter((v) => v.decision === "Approved").length;
    const rejectCount = Object.values(updatedVotes).filter((v) => v.decision === "Rejected").length;

    let nextState: ProposalState = prop.state;
    if (prop.type === "Internal Law Amendment") {
      if (approveCount >= requiredTwoThirds) {
        nextState = "Approved";
      } else if (rejectCount > totalEligibleExecs - requiredTwoThirds) {
        nextState = "Rejected";
      } else {
        nextState = "Under Review";
      }
    }

    set((s) => ({
      proposals: s.proposals.map((p) =>
        p.id === proposalId ? { ...p, state: nextState, votes: updatedVotes } : p
      ),
    }));

    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
    return { ok: true, message: `Vote recorded (${approveCount}/${requiredTwoThirds} needed).` };
  },

  submitDailyQuizAnswer: (quizId, optionId) => {
    const state = get();
    const curMember = state.members.find((m) => m.id === state.currentMemberId);
    if (!curMember) return { ok: false, message: "Member session not found" };

    const quiz =
      (state.dailyQuizzes || []).find(
        (q) => q.id === quizId && q.active !== false && !isPersistentDeletedId("dailyQuizzes", q.id)
      ) ||
      SEED_DAILY_QUIZZES.find(
        (q) => q.id === quizId && !isPersistentDeletedId("dailyQuizzes", q.id)
      );
    if (!quiz) return { ok: false, message: "Daily challenge not found or inactive" };

    // Strictly enforce 1 attempt per challenge per member (no resets or replay farming)
    if (curMember.quizAttempts?.[quizId]) {
      return { ok: false, message: "Daily challenge already attempted (1/1 attempts used)." };
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const alreadyRewarded = (state.ledger || []).some(
      (e) =>
        e.memberId === curMember.id &&
        (e.ruleLabel?.includes(quiz.id) ||
          e.reason?.includes(quiz.id) ||
          (quiz.verdictTitle && e.reason?.includes(quiz.verdictTitle)))
    );
    if (alreadyRewarded) {
      return { ok: false, message: "Daily challenge already completed" };
    }

    const isCorrect = optionId === quiz.correctId;
    const safeXp = isCorrect ? Math.min(50, Math.max(5, quiz.xpReward || 15)) : 0;

    const attemptRecord = {
      optionId,
      correct: isCorrect,
      answeredAt: new Date().toISOString(),
      xpEarned: safeXp,
    };

    let nextLedger = state.ledger;
    if (isCorrect) {
      const newEntry: PointsLedgerEntry = {
        id: `led-${Date.now()}`,
        memberId: curMember.id,
        memberName: curMember.fullName,
        amount: safeXp,
        ruleLabel: `Daily Quiz: ${quiz.id}`,
        reason: `Daily Quiz verified: ${quiz.verdictTitle || quiz.id}`,
        source: "Badge",
        actorName: "Science Exploration Engine",
        date: todayIso,
        appealStatus: "None",
      };
      nextLedger = [newEntry, ...state.ledger];
    }

    set((s) => ({
      members: s.members.map((m) =>
        m.id === curMember.id
          ? {
              ...m,
              xpTotal: isCorrect ? m.xpTotal + safeXp : m.xpTotal,
              xpSeason: isCorrect ? m.xpSeason + safeXp : m.xpSeason,
              xpMonth: isCorrect ? m.xpMonth + safeXp : m.xpMonth,
              quizAttempts: {
                ...(m.quizAttempts || {}),
                [quizId]: attemptRecord,
              },
            }
          : m
      ),
      ledger: nextLedger,
    }));

    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
    return {
      ok: isCorrect,
      message: isCorrect
        ? `Correct! +${safeXp} XP awarded`
        : "Incorrect answer. 1/1 attempts used.",
      xpEarned: safeXp,
    };
  },

  sendClubMessage: ({ recipientScope, priority, title, body, inApp, email, targetMemberId, targetDepartmentId, targetTeamId }) =>
    set((state) => {
      if (!title?.trim() && !body?.trim()) return state;
      const cleanTitle = (title || "").trim() || "Notification";
      const cleanBody = (body || "").trim() || "No content provided.";
      const newMsg: ClubMessage = {
        id: `msg-${Date.now()}`,
        senderLabel: state.activeAdminRole === "HR Head" ? "HR Team" : state.activeAdminRole,
        senderRole: state.activeAdminRole.includes("HR") ? "HR" : "Executive",
        recipientScope,
        priority,
        title: cleanTitle,
        body: cleanBody,
        timeAgo: "Just now",
        unread: true,
        archived: false,
        channels: { inApp, email },
        targetMemberId,
        targetDepartmentId,
        targetTeamId,
        readMemberIds: [],
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

  markMessageRead: (messageId, memberId) => {
    set((state) => {
      const curMember = memberId || state.currentMemberId;
      return {
        messages: state.messages.map((m) => {
          if (m.id !== messageId) return m;
          const reads = Array.isArray(m.readMemberIds) ? [...m.readMemberIds] : [];
          if (curMember && !reads.includes(curMember)) {
            reads.push(curMember);
          }
          return {
            ...m,
            unread: false,
            archived: true,
            readMemberIds: reads,
            stats: {
              ...m.stats,
              inAppReadCount: (m.stats?.inAppReadCount || 0) + (m.unread ? 1 : 0),
            },
          };
        }),
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateClubMessage: (messageId, updates) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m
      ),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  archiveClubMessage: (messageId) => {
    set((state) => {
      const curMember = state.currentMemberId;
      return {
        messages: state.messages.map((m) => {
          if (m.id !== messageId) return m;
          const reads = Array.isArray(m.readMemberIds) ? [...m.readMemberIds] : [];
          if (curMember && !reads.includes(curMember)) {
            reads.push(curMember);
          }
          return {
            ...m,
            archived: true,
            unread: false,
            readMemberIds: reads,
          };
        }),
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

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

  createExplorePost: (post) => {
    set((state) => ({
      explorePosts: [{ ...post, id: `exp-${Date.now()}` }, ...state.explorePosts],
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateExplorePost: (postId, updates) => {
    set((state) => ({
      explorePosts: state.explorePosts.map((p) =>
        p.id === postId ? { ...p, ...updates } : p
      ),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  deleteExplorePost: (postId) => {
    recordPersistentDeletedId("explorePosts", postId);
    set((state) => ({
      explorePosts: state.explorePosts.filter((p) => p.id !== postId),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateExplorePostStatus: (postId, status) => {
    set((state) => ({
      explorePosts: state.explorePosts.map((p) => (p.id === postId ? { ...p, status } : p)),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  createDailyQuiz: (quiz) => {
    const nextItem: DailyQuizItem = {
      ...quiz,
      id: (quiz as Partial<DailyQuizItem>).id || `quiz-${Date.now()}`,
      active: quiz.active !== false,
    };
    set((state) => {
      const existing = quiz.isPinnedToday
        ? state.dailyQuizzes.map((q) => ({ ...q, isPinnedToday: false }))
        : state.dailyQuizzes;
      return {
        dailyQuizzes: [nextItem, ...existing.filter((q) => q.id !== nextItem.id)],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateDailyQuiz: (id, updates) => {
    set((state) => ({
      dailyQuizzes: state.dailyQuizzes.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  deleteDailyQuiz: (id) => {
    recordPersistentDeletedId("dailyQuizzes", id);
    set((state) => ({
      dailyQuizzes: state.dailyQuizzes.filter((q) => q.id !== id),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
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
    get().syncWithServer(true).catch(() => {});
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
    recordPersistentDeletedId("dailyQuotes", id);
    set((state) => ({
      dailyQuotes: state.dailyQuotes.filter((q) => q.id !== id),
      settings:
        state.settings.pinnedQuoteId === id
          ? { ...state.settings, dailyQuoteMode: "auto_365", pinnedQuoteId: undefined }
          : state.settings,
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
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

  revokeAccess: (grantId, reason) => {
    recordPersistentDeletedId("accessGrants", grantId);
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
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  updateSettings: (updates, reason) => {
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
        settings: sanitizeSystemSettings({ ...state.settings, ...updates }),
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },
}));

if (typeof window !== "undefined") {
  (window as unknown as { __QUANTERS_STORE__: typeof useQuantersStore }).__QUANTERS_STORE__ = useQuantersStore;
}
