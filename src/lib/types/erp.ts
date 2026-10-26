/**
 * QUANTERS v3.0 — Complete Full-Stack ERP & Governance Type System
 * Strictly aligned with QUANTERS_ERP_AND_STRUCTURE_PLAN_v2.1.md + v3.0 Human-Centric Upgrades
 */

export type MemberStatus =
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

export type TimeSlot = "Morning" | "Afternoon" | "Evening";

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
  | "python"
  | "arduino"
  | "astronomy"
  | "printing"
  | "data"
  | "ai-ml"
  | "cybersecurity"
  | "web-dev"
  | "robotics"
  | "quantum"
  | "chemistry"
  | "biotech"
  | "mathematics"
  | "ui-ux"
  | "media-photo"
  | "scientific-writing"
  | "public-speaking"
  | "leadership"
  | "logistics"
  | "entrepreneurship"
  | "electronics";

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
}

export interface TraineeEvaluation {
  headEndorsed: boolean;
  coManagerEndorsed: boolean;
  notes: string;
  updatedAt?: string;
}

export type HousingType = "Family Home" | "University Residence (Cité)" | "Shared Apartment";
export type CommuteDuration = "< 30 min" | "30–60 min" | "> 1 hour";
export type PcCapability = "Coding & Dev" | "Design & Video" | "Office & Web" | "No Personal PC";

export interface Member {
  id: string;
  quanterId: string; // e.g. QT-26-0248
  handle: string; // e.g. @quanter0248
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  major: string;
  university: string;
  academicYear: "L1" | "L2" | "L3" | "M1" | "M2" | "Doctorate" | "Graduated";
  tenure: string;
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
  category:
    | "Python"
    | "Arduino"
    | "Astronomy"
    | "3D Printing"
    | "Data Science"
    | "AI"
    | "Cybersecurity"
    | "Quantum Physics"
    | "Biotech & Lab"
    | "UI/UX & Design"
    | "Scientific Writing"
    | "Robotics"
    | "General";
  iconType: FieldIconKey;
  level: WorkshopLevel;
  instructor: string;
  dateLabel: string;
  timeRange: string;
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
  category: "Earning" | "Deduction";
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
  | "Logistics & Ops";

export type BadgeEarningMethod = "exam" | "manual" | "project" | "automatic";

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
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
  reviewerScope: "Department Head" | "Executive Board (2/3 Quorum)" | "Executive Board";
  reviewerComment?: string;
  convertedToId?: string;
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
  correctId: string;
  verdictTitle: string;
  explanation: string;
  xpReward: number;
  dateLabel?: string;
  isPinnedToday?: boolean;
  active: boolean;
}

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
  author: string;
  eraOrRole: string;
  category: QuoteCategory;
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
  geofenceVerification?: boolean;
  waitlistAutoPromote?: boolean;
  examFreezeMode?: boolean;
  quietHoursEnabled?: boolean;
  weeklyWorkloadCapHours?: number;
  // Daily Quote (365-Day Library) & Quiz Controls
  dailyQuoteMode?: "auto_365" | "pinned";
  pinnedQuoteId?: string;
  dailyQuoteDayOffset?: number;
  // Firebase Free-Tier & User Quota Optimization Controls
  quotaSaverPreset?: "standard" | "aggressive" | "ultra";
  syncStrategy?: "instant" | "debounced_30s" | "manual_offline";
  clientCacheTtlMinutes?: number;
  deltaSyncOnly?: boolean;
  disableVideoOnCellular?: boolean;
  autoCompactHistoryLimit?: number;
}
