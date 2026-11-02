/**
 * QUANTERS v3.0 — Complete Full-Stack ERP & Governance Type System
 * Strictly aligned with QUANTERS_ERP_AND_STRUCTURE_PLAN_v2.1.md + v3.0 Human-Centric Upgrades
 */

export type MemberStatus =
  | "Pending"
  | "Trainee"
  | "Active"
  | "Inactive"
  | "Suspended"
  | "Resigned"
  | "Removed"
  | "Alumni";

export type RecognitionLabel =
  | "Star Member"
  | "Member of the Month"
  | "Department Champion"
  | "Senior Fellow"
  | "Promising Contributor";

export type DayOfWeek =
  | "Saturday"
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export type TimeSlot =
  | "08-09"
  | "09-10"
  | "10-11"
  | "11-12"
  | "12-13"
  | "13-14"
  | "14-15"
  | "15-16"
  | "16-17"
  | "17-18"
  | "Morning"
  | "Afternoon"
  | "Evening"
  | (string & {});

export const STUDY_HOUR_SLOTS: {
  key: TimeSlot;
  label: string;
  hours: string;
  period: "Morning" | "Afternoon" | "Evening";
}[] = [
  { key: "08-09", label: "08–09", hours: "08:00–09:00", period: "Morning" },
  { key: "09-10", label: "09–10", hours: "09:00–10:00", period: "Morning" },
  { key: "10-11", label: "10–11", hours: "10:00–11:00", period: "Morning" },
  { key: "11-12", label: "11–12", hours: "11:00–12:00", period: "Morning" },
  { key: "12-13", label: "12–13", hours: "12:00–13:00", period: "Afternoon" },
  { key: "13-14", label: "13–14", hours: "13:00–14:00", period: "Afternoon" },
  { key: "14-15", label: "14–15", hours: "14:00–15:00", period: "Afternoon" },
  { key: "15-16", label: "15–16", hours: "15:00–16:00", period: "Afternoon" },
  { key: "16-17", label: "16–17", hours: "16:00–17:00", period: "Evening" },
  { key: "17-18", label: "17–18", hours: "17:00–18:00", period: "Evening" },
];

export function isMemberAvailableInSlot(
  daySlots: TimeSlot[] | undefined,
  slotKey: TimeSlot
): boolean {
  if (!Array.isArray(daySlots) || daySlots.length === 0) return false;
  if (daySlots.includes(slotKey)) return true;
  const meta = STUDY_HOUR_SLOTS.find((s) => s.key === slotKey);
  if (meta && daySlots.includes(meta.period)) return true;
  return false;
}

export type AvailabilityGrid = Record<DayOfWeek, TimeSlot[]>;

/**
 * Simplified 4-Role Preview + Full RBAC Templates
 */
export type RoleTemplateName =
  | "Super Admin"
  | "Executive"
  | "HR Head"
  | "HR Member"
  | "Department Head"
  | "Co-Manager"
  | "Team Leader"
  | "Workshop Organizer"
  | "Check-in Operator"
  | "Reviewer"
  | "Editor"
  | "KPI Viewer"
  | "Member"
  | "Alumni";

export type SimplifiedAdminRole =
  | "Super Admin"
  | "HR & Executive"
  | "Department Head"
  | "KPI Viewer";

export type FieldIconKey =
  // Software, Coding & Computing (Hard Tech)
  | "python"
  | "web-dev"
  | "data"
  | "ai-ml"
  | "cybersecurity"
  | "cloud-devops"
  | "competitive-programming"
  | "deep-learning"
  | "computer-vision"
  | "mobile-dev"
  | "database-sql"
  | "git-open-source"

  // Science & Research (Pure STEM)
  | "astronomy"
  | "astrophysics"
  | "quantum"
  | "chemistry"
  | "biotech"
  | "genetics"
  | "mathematics"
  | "optics"
  | "materials"
  | "spectroscopy"
  | "neuroscience"
  | "microbiology"
  | "renewable-energy"
  | "environmental-science"
  | "scientific-writing"
  | "health"

  // Engineering & Hardware (Hard Skills)
  | "arduino"
  | "robotics"
  | "electronics"
  | "circuit-design"
  | "printing"
  | "cad-modeling"
  | "mechanics"
  | "iot-embedded"
  | "sensors-telemetry"
  | "energy"

  // Club Activities & Workshops
  | "hackathon"
  | "stargazing"
  | "science-fair"
  | "seminar-hosting"
  | "journal-club"
  | "science-olympiad"
  | "field-trip"

  // Leadership & Governance
  | "club-presidency"
  | "leadership"
  | "legal-charter"
  | "treasury-finance"
  | "project-management"
  | "partnership-sponsorship"
  | "sponsorship"
  | "entrepreneurship"
  | "logistics"
  | "documentation"
  | "event-ops"
  | "crisis-management"

  // Soft Skills & Community
  | "public-speaking"
  | "debate-speech"
  | "peer-mentorship"
  | "science-communication"
  | "team-collaboration"
  | "negotiation-diplomacy"

  // Creative, Staging & Media
  | "ui-ux"
  | "media-photo"
  | "video"
  | "audiovisual"
  | "stage-sound-lighting"
  | "scientific-illustration";

export const UNIVERSITY_SPECIALTIES = [
  "Computer Science (Informatique Générale)",
  "Artificial Intelligence & Data Science",
  "Cybersecurity, Networks & Distributed Systems",
  "Software Engineering & Information Systems",
  "Applied Physics & Instrumentation",
  "Fundamental & Theoretical Physics",
  "Materials & Solid-State Physics",
  "Radiation, Nuclear & Medical Physics",
  "Astrophysics & Space Sciences",
  "Mathematics (Fundamental)",
  "Applied Mathematics, Probability & Statistics",
  "Operations Research & Modeling",
  "Chemistry (Fundamental & Organic)",
  "Analytical, Environmental & Pharmaceutical Chemistry",
  "Materials & Polymer Chemistry",
  "Biological Sciences & Cellular Biology",
  "Microbiology & Parasitology",
  "Biochemistry & Molecular Biology",
  "Biotechnology & Genomics",
  "Ecology, Marine & Environmental Sciences",
  "Geology & Earth Sciences",
  "Electronics, Embedded Systems & IoT",
  "Robotics, Control & Automation",
  "Electrical & Telecommunications Engineering",
  "Mechanical & Industrial Engineering",
  "Other Scientific / Technical Major",
] as const;

export type Capability =
  | "Members"
  | "Workshops"
  | "Check-in"
  | "Tasks"
  | "Points"
  | "Badges"
  | "Stats"
  | "Messages"
  | "Explore"
  | "Proposals"
  | "Former members"
  | "Cases"
  | "Settings"
  | "Audit";

export type AccessLevel = "View" | "Edit" | "Approve" | "Manage";

export type AccessScopeType = "Club" | "Department" | "Team" | "Workshop";

export interface AccessGrant {
  id: string;
  memberId: string;
  memberName: string;
  capability: Capability;
  level: AccessLevel;
  scopeType: AccessScopeType;
  scopeId?: string;
  scopeLabel: string;
  expiresAt?: string; // ISO date or undefined for Permanent
  grantedBy: string;
  grantedAt: string;
}

export interface Department {
  id: string; // Fixed 6 departments — cannot be deleted (§2.1)
  name: string;
  shortName: string;
  description: string;
  icon: string;
  headMemberId: string;
  coManagerMemberId: string;
}

export interface ScientificTeam {
  id: string;
  name: string;
  field: string;
  description: string;
  icon: string;
  leaderMemberId: string;
  memberIds: string[];
  archived: boolean;
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: MemberStatus;
  toStatus: MemberStatus;
  reason: string;
  actorName: string;
  decisionReference?: string;
  graduationYear?: string;
  suspensionEndDate?: string;
  date: string;
}

export interface PlacementHistoryEntry {
  id: string;
  changeType: "Department Move" | "Team Assignment" | "Team Removal";
  fromName: string;
  toName: string;
  reason: string;
  actorName: string;
  date: string;
}

export interface OnboardingChecklist {
  profileComplete: boolean;
  buddyAssigned: boolean;
  firstTaskBeforeDay30: boolean;
  firstWorkshopAttended: boolean;
  hrApproved?: boolean;
  hrApprovedAt?: string;
  hrApprovedBy?: string;
}

export interface TraineeEvaluation {
  headEndorsed: boolean;
  coManagerEndorsed: boolean;
  notes: string;
  updatedAt?: string;
}

export type HousingType = "Family Home" | "University Residence (Cité)" | "Shared Apartment";
export type CommuteDuration = "< 30 min" | "30–60 min" | "> 1 hour" | "> 1h30";
export type PcCapability = "Coding & Dev" | "Design & Video" | "Office & Web" | "No Personal PC";

export interface Member {
  id: string;
  quanterId: string; // e.g. QT-26-0248
  handle: string; // e.g. @quanter0248
  email: string;
  passwordHash?: string; // One-way salted SHA-256 digest (never plaintext)
  authProvider?: "google" | "credentials";
  fullName: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  major: string;
  university: string;
  academicYear: "L1" | "L2" | "L3" | "M1" | "M2" | "Doctorate" | "Graduated";
  tenure: string;
  yearsInClub: number; // Quantitative seniority: 0 (new/trainee), 1 (1 yr), 2 (2 yrs), 3 (3+ yrs)
  clubJoinYear: number; // Explicit calendar join year: e.g. 2026, 2025, 2024, 2023
  departmentId: string; // Single department only (§2.1)
  teamId?: string; // At most one scientific team (§2.2)
  roles: RoleTemplateName[];
  isBureauMember: boolean; // For Law Art. 7 student-org conflict check (§3.2)
  buddyId?: string;
  status: MemberStatus;
  statusSince: string;
  traineeStartDate: string;
  traineeDaysElapsed: number;
  suspensionEndDate?: string;
  resignationManagerName?: string;
  resignationReason?: string;
  removalReason?: string;
  removalDecisionRef?: string;
  graduationYear?: string;
  alumniPosition?: string;
  alumniAccessEnabled?: boolean;
  preferredLanguage?: AppLanguage;
  // HR Extended KYC: Residence, Hardware/PC & Professional Links
  wilaya?: string;
  commune?: string;
  housingType?: HousingType;
  commuteTime?: CommuteDuration;
  canStayLate?: boolean;
  hasLaptop?: boolean;
  pcCapability?: PcCapability;
  equipmentTags?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  cvUrl?: string;
  outsideActivitiesAndVolunteering: string; // Single merged box (§3.2)
  declaresOtherStudentOrg: boolean; // Triggers warning ONLY if isBureauMember === true
  availability: AvailabilityGrid;
  xpTotal: number;
  xpSeason: number;
  xpMonth: number;
  level: number;
  levelTitle: string;
  attendanceRate: number; // 0-100
  onTimeTaskRate: number; // 0-100
  recentActivityScore: number; // 0-100
  healthScore: number; // 50% attendance + 35% on-time tasks + 15% recent (§6.4)
  daysSinceLastActivity: number;
  lateTasksThisMonth: number;
  recognitionLabels: RecognitionLabel[];
  onboardingTicks: OnboardingChecklist;
  traineeEvaluation: TraineeEvaluation;
  skills: string[];
  badgeIds: string[];
  quizAttempts?: Record<string, {
    optionId: string;
    correct: boolean;
    answeredAt: string;
    xpEarned: number;
  }>;
  workshopsCompletedCount: number;
  projectsCompletedCount: number;
  eventsAttendedCount: number;
  statusHistory: StatusHistoryEntry[];
  placementHistory: PlacementHistoryEntry[];
}

export type InvitationState = "Sent" | "Opened" | "Completed" | "Expired" | "Cancelled";

export interface Invitation {
  id: string;
  email: string;
  fullNameHint?: string;
  prefilledDepartmentId?: string;
  token: string;
  state: InvitationState;
  sentAt: string;
  expiresAt: string;
  invitedBy: string;
}

export type WorkshopLevel = "Beginner" | "Intermediate" | "Advanced";
export type WorkshopStatus =
  | "Draft"
  | "Published"
  | "Full / Waitlist"
  | "Running"
  | "Completed"
  | "Archived";

export type ActivityKind =
  | "Workshop"
  | "Scientific Activity"
  | "Lab Session"
  | "Seminar"
  | "Hackathon Prep";

export type ActivityTypeKey = ActivityKind;

export interface AttendanceRecord {
  id: string;
  workshopId: string;
  memberId: string;
  memberName: string;
  quanterId: string;
  method: "Member Scanned QR" | "Organizer Scanned Member QR" | "6-Digit Code" | "Manual Correction";
  checkedInAt: string;
  status: "Present" | "Excused" | "Absent";
  correctionReason?: string;
  correctedBy?: string;
}

export interface Workshop {
  id: string;
  title: string;
  activityType?: ActivityKind;
  category: string;
  iconType: FieldIconKey;
  level: WorkshopLevel;
  instructor: string;
  dateLabel: string;
  timeRange: string;
  eventDate?: string;
  planningOpenDate?: string;
  startTime?: string;
  endTime?: string;
  location: string;
  capacity: number;
  seatsLeft: number;
  xpReward: number;
  status: WorkshopStatus;
  description: string;
  objectives: string[];
  materials: string[];
  linkedBadgeId?: string;
  liveQrToken: string;
  liveSixDigitCode: string;
  registeredMemberIds: string[];
  waitlistMemberIds: string[];
  attendanceRecords: AttendanceRecord[];
}

export type TaskCategory =
  | "General"
  | "Logistics"
  | "Media"
  | "Scientific"
  | "Organisation"
  | "Sponsorship"
  | "Technical"
  | "Workshop Prep"
  | "Documentation"
  | "Community & HR"
  | "Design"
  | "Other";

export type TaskStatus =
  | "To do"
  | "In progress"
  | "Delivered"
  | "Validated"
  | "Late"
  | "Cancelled";

export interface TaskAssigneeLine {
  memberId: string;
  memberName: string;
  roleInTask: string;
  receiptConfirmed: boolean;
  status: TaskStatus;
  proofUrlOrNote?: string;
  proposedScore: number;
  awardedScore?: number;
  scoreType?: "Full" | "Partial" | "Bonus";
  managerFeedback?: string;
  validatedBy?: string;
  validatedAt?: string;
}

export interface ClubTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  departmentId: string;
  teamId?: string;
  linkedWorkshopOrEvent?: string;
  deadline: string;
  taskDate?: string;
  planningOpenDate?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  urgencyLabel: "Today" | "2 days left" | "In progress" | "To do" | "Completed";
  locationOrShift: string;
  proposedScore: number; // Within category min/max limits (§M4.2)
  checklist: { label: string; done: boolean }[];
  assignees: TaskAssigneeLine[];
  matrixPublished: boolean;
  archived?: boolean;
  createdAt: string;
}

export interface PointRule {
  id: string;
  label: string;
  points: number; // Positive or negative
  category: string;
  description: string;
}

export interface PointsLedgerEntry {
  id: string;
  memberId: string;
  memberName: string;
  amount: number; // + or -
  ruleLabel: string;
  reason: string;
  source: "Task" | "Workshop" | "Badge" | "Manual" | "Reversal" | "Monthly Honour";
  actorName: string;
  date: string;
  reversedByEntryId?: string;
  appealStatus?: "None" | "Pending" | "Accepted" | "Rejected";
  appealReason?: string;
}

export type BadgeClassification = "Hard Skill" | "Soft Skill";

export type BadgeCategory =
  | "Hard Skills"
  | "Soft Skills"
  | "Science"
  | "Technology"
  | "Leadership"
  | "Club"
  | "Programming"
  | "Data & AI"
  | "Hardware & IoT"
  | "Scientific Writing"
  | "Public Speaking"
  | "Logistics & Ops"
  | (string & {});

export type BadgeEarningMethod = "exam" | "manual" | "project" | "automatic";

export type BadgeRequirementType = "exam" | "project" | "both" | "manual";

export interface ExamCompletionRecord {
  id: string;
  examId: string;
  badgeId: string;
  memberId: string;
  scorePercent: number;
  passed: boolean;
  completedAt: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
}

export interface BadgeExam {
  id: string;
  badgeId: string;
  title: string;
  category?: BadgeCategory;
  iconName?: FieldIconKey | string;
  level: WorkshopLevel;
  xpReward: number;
  durationMinutes: number;
  totalQuestionsCount: number;
  passingScorePercent: number;
  maxAttempts: number;
  attemptsUsed: number;
  rules: string[];
  questions: ExamQuestion[];
}

export interface ProjectSubmission {
  id: string;
  badgeId: string;
  badgeTitle: string;
  memberId: string;
  memberName: string;
  projectTitle: string;
  category: string;
  description: string;
  repoUrl?: string;
  driveUrl?: string;
  teamMembers: string[];
  fileNames: string[];
  submittedAt: string;
  status: "Pending Review" | "Approved" | "Revision Requested" | "Rejected";
  reviewerComment?: string;
}

export interface Badge {
  id: string;
  name: string;
  category: BadgeCategory;
  skillType?: BadgeClassification;
  iconName: string;
  borderTone: "blue" | "gold" | "cyan" | "purple";
  description: string;
  criteriaText: string;
  xpReward: number;
  earningMethods: BadgeEarningMethod[];
  requirementType?: BadgeRequirementType;
  linkedExamId?: string;
  memberState: "Unlocked" | "In Progress" | "Locked";
  progressPercent: number;
  awardedCount: number;
  awardedDate?: string;
  archived: boolean;
}

export type ProposalTypeKey =
  | "Event"
  | "Workshop"
  | "Activity"
  | "Collaboration"
  | "Internal Law Amendment"
  | "Other";

export type ProposalState =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Changes Requested"
  | "Rejected";

export interface ProposalVote {
  memberId: string;
  memberName: string;
  decision: "Approved" | "Rejected";
  timestamp: string;
  comment?: string;
}

export interface Proposal {
  id: string;
  type: ProposalTypeKey;
  title: string;
  description: string;
  submitterId: string;
  submitterName: string;
  expectedDate?: string;
  location?: string;
  specificFields: Record<string, string>;
  state: ProposalState;
  reviewerScope: "Department Head" | "Executive Board" | "Executive Board (2/3 Quorum)";
  reviewerComment?: string;
  convertedToId?: string;
  votes?: Record<string, ProposalVote>;
  createdAt: string;
}

export type ExploreCategory =
  | "Scientific News"
  | "Events"
  | "Opportunities"
  | "QUANTA News";

export interface ExplorePost {
  id: string;
  title: string;
  summary: string;
  content?: string;
  category: ExploreCategory;
  tagLabel: string;
  tagTone: "sky" | "amber" | "cyan" | "indigo";
  source: string;
  readTime: string;
  date: string;
  imageUrl: string;
  featuredInCarousel: boolean;
  status: "Draft" | "Review" | "Published" | "Archived";
  externalUrl?: string;
}

export interface DailyQuizOption {
  id: string;
  label: string;
  detail?: string;
}

export interface DailyQuizItem {
  id: string;
  domain: string;
  icon: FieldIconKey;
  telemetry?: string;
  scenario?: string;
  question: string;
  options: DailyQuizOption[];
  correctId?: string;
  verdictTitle: string;
  explanation?: string;
  xpReward: number;
  dateLabel?: string;
  isPinnedToday?: boolean;
  active: boolean;
}

export type AppLanguage = "en" | "ar";

export type QuoteCategory =
  | "Quran & Revelation"
  | "Prophet Muhammad"
  | "Algerian Scholars"
  | "Muslim Scientists"
  | "Ancient Greece & Antiquity"
  | "World Scientists";

export interface DailyQuoteItem {
  id: string;
  dayOfYear: number; // 1..365
  text: string;
  textAr?: string;
  author: string;
  authorAr?: string;
  eraOrRole: string;
  eraOrRoleAr?: string;
  category: QuoteCategory;
  categoryAr?: string;
  isCustom?: boolean;
}

export type NotificationPriority = "Action needed" | "Official notice" | "Info" | "Message";

export interface ClubMessage {
  id: string;
  senderLabel: string;
  senderRole: "HR" | "System" | "Scientific Team" | "Executive";
  recipientScope: string;
  priority: NotificationPriority;
  title: string;
  body: string;
  timeAgo: string;
  unread: boolean;
  archived?: boolean; // Automatically set true when read
  channels: {
    inApp: boolean;
    email: boolean;
  };
  stats: {
    totalRecipients: number;
    inAppReadCount: number;
    emailSentCount: number;
    emailFailedCount: number;
  };
  actionLink?: string;
  targetMemberId?: string;
  targetDepartmentId?: string;
  targetTeamId?: string;
  readMemberIds?: string[];
}

export type GrievanceCategory =
  | "Interpersonal & Respect"
  | "Workload & Tasks"
  | "Fairness & Evaluation"
  | "Misconduct / Harassment"
  | "Governance Conflict"
  | "Other";

export type GrievanceUrgency = "Standard" | "Important" | "Urgent";
export type GrievanceStatus =
  | "Pending HR Review"
  | "Under Investigation"
  | "Resolved"
  | "Dismissed";

export interface MemberGrievance {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberDepartmentId?: string;
  isAnonymous: boolean;
  subject: string;
  category: GrievanceCategory;
  urgency: GrievanceUrgency;
  details: string;
  submittedAt: string;
  status: GrievanceStatus;
  hrNotes?: string;
  hrHandledBy?: string;
  resolvedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  actionCategory:
    | "Status Change"
    | "Department / Team Move"
    | "Points Entry / Reversal"
    | "Attendance Correction"
    | "Badge Award / Revoke"
    | "Task Validation"
    | "Proposal Decision"
    | "Message Sent"
    | "Access Grant / Revoke"
    | "Settings Changed"
    | "Registration Switch"
    | "Data Export";
  targetLabel: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface SystemSettings {
  registrationOpen: boolean;
  invitationValidityDays: number;
  alumniAccessGlobal: boolean;
  traineeDurationMonths: number;
  confirmationAttendanceThreshold: number;
  confirmationXpThreshold: number;
  inactivityFlagDays: number;
  firstTaskDeadlineDays: number;
  buddyAssignmentDays: number;
  maxActiveTasksPerMember: number;
  pointsAppealWindowHours: number;
  taskMatrixLeadDays: number;
  teamSizeMin: number;
  teamSizeMax: number;
  currentSeasonLabel: string;
  healthWeightAttendance: number;
  healthWeightTasks: number;
  healthWeightRecent: number;
  maxImageDimensionPx: number;
  webpCompressionQuality: number;
  // Executive Officers & Deep Operational Controls
  presidentId?: string;
  vicePresidentId?: string;
  secretaryGeneralId?: string;
  onboardingAutoApprove?: boolean;
  restrictUniversityEmail?: boolean;
  qrRotationSeconds?: number;
  checkinGraceMinutes?: number;
  waitlistAutoPromote?: boolean;
  examFreezeMode?: boolean;
  quietHoursEnabled?: boolean;
  weeklyWorkloadCapHours?: number;
  // Daily Quote (365-Day Library) & Quiz Controls
  dailyQuoteMode?: "auto_365" | "pinned";
  pinnedQuoteId?: string;
  dailyQuoteDayOffset?: number;
  // Firebase Free-Tier & User Quota Optimization Controls
  defaultLanguage?: AppLanguage;
  quotaSaverPreset?: "standard" | "aggressive" | "ultra";
  syncStrategy?: "instant" | "debounced_30s" | "manual_offline";
  clientCacheTtlMinutes?: number;
  deltaSyncOnly?: boolean;
  disableVideoOnCellular?: boolean;
  autoCompactHistoryLimit?: number;
  // Dynamic Rank & Level Progression Thresholds (Admin Editable CRUD)
  rankLevels?: RankLevelThreshold[];
  archivedMembers?: ArchivedMemberRecord[];
  // Active Sessions & Remote Security Revocation Controls (Super Admin)
  forceLogoutAllAt?: number;
  revokedSessionMemberIds?: Record<string, number>;
  // Post-Admission Automated Welcome Message Controls (Admin Editable)
  welcomeMessageEnabled?: boolean;
  welcomeMessageTitle?: string;
  welcomeMessageBody?: string;
  welcomeMessageSenderRole?: "Executive" | "HR" | "System";
  welcomeMessageSenderLabel?: string;
  // Real-Time Email Verification Multi-Key Pool (Admin Configurable)
  emailVerificationEnabled?: boolean;
  zerobounceApiKey1?: string;
  zerobounceApiKey2?: string;
  abstractApiKey1?: string;
  abstractApiKey2?: string;
  // Extended Club Governance Controls
  examRetakeCooldownHours?: number;
  dailyQuizResetHour?: number;
}

export interface RankLevelThreshold {
  level: number;
  minXp: number;
  maxXp?: number;
  title: string;
  badgeName?: string;
  colorHex?: string;
  emblemEmoji?: string;
}

export interface ArchivedMemberRecord {
  id: string;
  quanterId: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  roles: string[];
  archivedAt: string;
  archivedBy: string;
  reason: string;
  lastStateSnapshot?: any;
}

export const DEFAULT_RANK_LEVELS: RankLevelThreshold[] = [
  { level: 1, minXp: 0, maxXp: 999, title: "🪵 Wooden Quanter", badgeName: "Wooden", colorHex: "#A16207" },
  { level: 2, minXp: 1000, maxXp: 1999, title: "🪨 Stone Observer", badgeName: "Stone", colorHex: "#78716C" },
  { level: 3, minXp: 2000, maxXp: 2999, title: "🟤 Copper Researcher", badgeName: "Copper", colorHex: "#B45309" },
  { level: 4, minXp: 3000, maxXp: 3999, title: "⚙️ Iron Expert", badgeName: "Iron", colorHex: "#64748B" },
  { level: 5, minXp: 4000, maxXp: 4999, title: "🥇 Gold Pioneer", badgeName: "Gold", colorHex: "#EAB308" },
  { level: 6, minXp: 5000, maxXp: 5999, title: "💎 Emerald Scholar", badgeName: "Emerald", colorHex: "#10B981" },
  { level: 7, minXp: 6000, maxXp: 6999, title: "💠 Sapphire Explorer", badgeName: "Sapphire", colorHex: "#0284C7" },
  { level: 8, minXp: 7000, maxXp: 7999, title: "🔮 Amethyst Inventor", badgeName: "Amethyst", colorHex: "#8B5CF6" },
  { level: 9, minXp: 8000, maxXp: 9999, title: "💎 Diamond Legend", badgeName: "Diamond", colorHex: "#38BDF8" },
  { level: 10, minXp: 10000, title: "👑 Quantum Master", badgeName: "Quantum Master", colorHex: "#F59E0B" },
];

export function getRankForXp(
  xp: number,
  customLevels?: RankLevelThreshold[]
): { level: number; title: string; minXp: number; nextLevelXp: number } {
  const levels = customLevels && customLevels.length > 0 ? customLevels : DEFAULT_RANK_LEVELS;
  const sorted = [...levels].sort((a, b) => a.level - b.level);
  let matched = sorted[0];
  for (const l of sorted) {
    if (xp >= l.minXp) {
      matched = l;
    }
  }
  const next = sorted.find((l) => l.level === matched.level + 1);
  return {
    level: matched.level,
    title: matched.title,
    minXp: matched.minXp,
    nextLevelXp: next ? next.minXp : matched.maxXp ? matched.maxXp + 1 : matched.minXp + 2000,
  };
}

/**
 * Canonical parser for converting member tenure string to a numeric years in club value.
 */
export function parseYearsInClub(tenure?: string, fallbackYears?: number): number {
  if (typeof fallbackYears === "number" && !isNaN(fallbackYears)) {
    return Math.max(0, Math.floor(fallbackYears));
  }
  const clean = String(tenure || "").trim().toLowerCase();
  if (
    !clean ||
    clean.includes("new") ||
    clean.includes("trainee") ||
    clean.includes("semester") ||
    clean.includes("novice") ||
    clean.includes("guest")
  ) {
    return 0;
  }
  if (clean.includes("3 year") || clean.includes("3+ year") || clean.includes("3+")) {
    return 3;
  }
  if (clean.includes("2+") || clean.includes("2 year") || clean.includes("senior")) {
    return 2;
  }
  if (clean.includes("1 year")) {
    return 1;
  }
  if (clean.includes("alumni")) {
    return 3;
  }
  if (clean.includes("bureau") || clean.includes("leadership")) {
    return 2;
  }
  return 0;
}

/**
 * Calculates official member seniority level and title based on club tenure and standing.
 * Strictly decoupled from monthly XP or scoring fluctuations:
 * - Level 1: "Novice Quanter" (strictly for new members < 1 year / new recruit, 0 years)
 * - Level 2: "1 Year Member" (for members with 1 year club standing)
 * - Level 3: "2 Years Member" or "3 Years Member" (for members with 2+ or 3 years club standing)
 * - Level 8: "Quanta Laureate" (for verified club alumni)
 * - Executive / Bureau Leadership: "Executive Quanter"
 */
export function getSeniorityForMember(member: {
  tenure?: string;
  yearsInClub?: number;
  status?: string;
  roles?: string[];
  level?: number;
  levelTitle?: string;
}): { level: number; levelTitle: string; yearsInClub: number } {
  const cleanTenure = String(member.tenure || "").trim().toLowerCase();
  const isAlumni = member.status === "Alumni" || cleanTenure.includes("alumni");
  if (isAlumni) {
    const y = typeof member.yearsInClub === "number" ? member.yearsInClub : 3;
    return { level: 8, levelTitle: "Quanta Laureate", yearsInClub: Math.max(3, y) };
  }

  // True bureau leadership is explicitly recorded in tenure or Super Admin
  const isBureauLeadership =
    cleanTenure.includes("bureau") ||
    cleanTenure.includes("leadership") ||
    (Array.isArray(member.roles) && member.roles.includes("Super Admin"));

  if (isBureauLeadership) {
    const y = typeof member.yearsInClub === "number" ? member.yearsInClub : 2;
    return { level: 3, levelTitle: "Executive Quanter", yearsInClub: y };
  }

  // Pure numeric years calculation
  const y = typeof member.yearsInClub === "number" && !isNaN(member.yearsInClub)
    ? member.yearsInClub
    : parseYearsInClub(member.tenure);

  if (y >= 3) {
    return {
      level: 3,
      levelTitle: "3 Years Member",
      yearsInClub: y,
    };
  }

  if (y === 2) {
    return {
      level: 3,
      levelTitle: "2 Years Member",
      yearsInClub: 2,
    };
  }

  if (y === 1) {
    return {
      level: 2,
      levelTitle: "1 Year Member",
      yearsInClub: 1,
    };
  }

  // Default: Level 1 Novice strictly for new members (< 1 year, 0 years)
  return { level: 1, levelTitle: "Novice Quanter", yearsInClub: 0 };
}
