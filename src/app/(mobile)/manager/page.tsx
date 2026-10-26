"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Award,
  Bell,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Edit3,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Lock,
  Megaphone,
  MessageSquare,
  Orbit,
  Pin,
  Plus,
  QrCode,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  StickyNote,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import {
  ClubTask,
  Member,
  ScientificTeam,
  TaskCategory,
} from "@/lib/types/erp";
import {
  handleMemberListContainerKeyDown,
  handleMemberSelectKeyDown,
  sortMembersByName,
} from "@/lib/utils/memberKeyboardJump";

type ManagerSubTab = "Overview" | "Tasks" | "Members" | "Teams" | "Notes";
type TaskViewTab = "active" | "done";
type BrowseScopeMode = "department" | "team";

interface WorkspaceNote {
  id: string;
  scopeType: "department" | "team";
  scopeId: string;
  title: string;
  body: string;
  tag: "Operations" | "Briefing" | "Handover" | "Scientific";
  authorName: string;
  authorRole: string;
  updatedAt: string;
  pinned: boolean;
  archived: boolean;
}

const SEED_WORKSPACE_NOTES: WorkspaceNote[] = [
  {
    id: "note-events-1",
    scopeType: "department",
    scopeId: "dept-events",
    title: "QSSC'26 Scientific Tracks & Amphi Allocation",
    body: "Main Auditorium reserved for Saturday 09:00–16:30. All 6 scientific teams must finalize their workshop abstracts and demonstrator rosters by Thursday 18:00.",
    tag: "Operations",
    authorName: "Sara Mansouri",
    authorRole: "Events Manager",
    updatedAt: "Today · 11:20",
    pinned: true,
    archived: false,
  },
  {
    id: "note-it-1",
    scopeType: "department",
    scopeId: "dept-it",
    title: "Projector QR Check-In & Local Wi-Fi Relay",
    body: "Lab A1 and Main Amphi routers tested for 150 concurrent check-ins. Keep 6-digit fallback code visible on the secondary screen.",
    tag: "Briefing",
    authorName: "Lotfi Benali",
    authorRole: "IT Manager",
    updatedAt: "Yesterday · 17:45",
    pinned: true,
    archived: false,
  },
  {
    id: "note-team-astro-1",
    scopeType: "team",
    scopeId: "team-astro",
    title: "JWST Light-Curve Dataset & Telescope Calibration",
    body: "Prepared the cleaned FITS light-curve notebook for Saturday's practical session. Team members should review transit fitting parameters.",
    tag: "Scientific",
    authorName: "Ayoub Sarri",
    authorRole: "Team Leader",
    updatedAt: "Today · 09:15",
    pinned: true,
    archived: false,
  },
  {
    id: "note-archive-1",
    scopeType: "department",
    scopeId: "dept-events",
    title: "October Opening Ceremony Equipment Return",
    body: "All badges, lanyards, and acoustic cables checked back into storage room B2.",
    tag: "Handover",
    authorName: "Sara Mansouri",
    authorRole: "Events Manager",
    updatedAt: "18 Oct 2026",
    pinned: false,
    archived: true,
  },
];

const ALL_TASK_CATEGORIES: TaskCategory[] = [
  "General",
  "Logistics",
  "Media",
  "Scientific",
  "Organisation",
  "Sponsorship",
  "Technical",
  "Workshop Prep",
  "Documentation",
  "Community & HR",
  "Design",
  "Other",
];

const NOTES_STORAGE_KEY = "quanters-manager-notes-v1";

export default function MobileManagerWorkspacePage() {
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);
  const members = useQuantersStore((s) => s.members);
  const settings = useQuantersStore((s) => s.settings);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const setCurrentMemberId = useQuantersStore((s) => s.setCurrentMemberId);
  const badges = useQuantersStore((s) => s.badges);
  const tasks = useQuantersStore((s) => s.tasks);
  const workshops = useQuantersStore((s) => s.workshops);
  const validateAndScoreTask = useQuantersStore((s) => s.validateAndScoreTask);
  const createTask = useQuantersStore((s) => s.createTask);
  const updateTask = useQuantersStore((s) => s.updateTask);
  const archiveTask = useQuantersStore((s) => s.archiveTask);
  const unarchiveTask = useQuantersStore((s) => s.unarchiveTask);
  const archiveAllCompletedTasks = useQuantersStore(
    (s) => s.archiveAllCompletedTasks
  );
  const updateTeam = useQuantersStore((s) => s.updateTeam);
  const sendClubMessage = useQuantersStore((s) => s.sendClubMessage);
  const verifyWorkshopCheckIn = useQuantersStore((s) => s.verifyWorkshopCheckIn);

  const activeTeams = teams.filter((t) => !t.archived);

  // Active signed-in member from the Organigramme
  const currentMember =
    members.find((m) => m.id === currentMemberId) || members[0];

  // Derive Organigramme Roles directly from Admin Dashboard state (departments, teams, settings)
  const managedDepts = departments.filter(
    (d) => d.headMemberId === currentMember.id
  );
  const subManagedDepts = departments.filter(
    (d) => d.coManagerMemberId === currentMember.id
  );
  const ledTeams = activeTeams.filter(
    (t) => t.leaderMemberId === currentMember.id
  );

  const isEventsManagerOrSub = departments.some(
    (d) =>
      d.id === "dept-events" &&
      (d.headMemberId === currentMember.id ||
        d.coManagerMemberId === currentMember.id)
  );

  // Build Organigramme Role Badges for a given member
  const getMemberOrganigrammeBadges = (mem: Member): string[] => {
    const pills: string[] = [];
    if (settings.presidentId === mem.id) pills.push("President");
    if (settings.vicePresidentId === mem.id) pills.push("Vice President");
    if (settings.secretaryGeneralId === mem.id) pills.push("Secretary General");

    departments.forEach((d) => {
      if (d.headMemberId === mem.id) {
        pills.push(`${d.shortName} Manager`);
      } else if (d.coManagerMemberId === mem.id) {
        pills.push(`${d.shortName} Sub-Manager`);
      }
    });

    activeTeams.forEach((t) => {
      if (t.leaderMemberId === mem.id) {
        pills.push(`${t.name} Leader`);
      }
    });

    if (pills.length === 0) {
      pills.push(mem.status === "Alumni" ? "Alumni" : "Member");
    }
    return pills;
  };

  const currentMemberRoleBadges = getMemberOrganigrammeBadges(currentMember);
  const primaryRoleLabel = currentMemberRoleBadges[0] || "Member";

  const [browseMode, setBrowseMode] = useState<BrowseScopeMode>("department");
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    managedDepts[0]?.id ||
      subManagedDepts[0]?.id ||
      currentMember.departmentId ||
      "dept-events"
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    ledTeams[0]?.id || currentMember.teamId || "team-astro"
  );

  // Sync default department / team when switching active Organigramme member
  useEffect(() => {
    const mDept =
      departments.find((d) => d.headMemberId === currentMember.id) ||
      departments.find((d) => d.coManagerMemberId === currentMember.id);
    const mTeam = activeTeams.find((t) => t.leaderMemberId === currentMember.id);

    if (mDept) {
      setSelectedDeptId(mDept.id);
      setBrowseMode("department");
    } else if (mTeam) {
      setSelectedTeamId(mTeam.id);
      setBrowseMode("team");
    } else {
      setSelectedDeptId(currentMember.departmentId || "dept-it");
      if (currentMember.teamId) setSelectedTeamId(currentMember.teamId);
    }
  }, [currentMember.id, departments, activeTeams.length]);

  const [subTab, setSubTab] = useState<ManagerSubTab>("Overview");
  const [taskViewTab, setTaskViewTab] = useState<TaskViewTab>("active");
  const [categoryFilter, setCategoryFilter] = useState<"All" | TaskCategory>(
    "All"
  );
  const [restoredTaskIds, setRestoredTaskIds] = useState<string[]>([]);

  // Workspace Notes State
  const [notes, setNotes] = useState<WorkspaceNote[]>(SEED_WORKSPACE_NOTES);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<WorkspaceNote | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteTag, setNoteTag] =
    useState<WorkspaceNote["tag"]>("Operations");
  const [notePinned, setNotePinned] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistNotes = (next: WorkspaceNote[]) => {
    setNotes(next);
    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  // Exact Organigramme Permission Rules:
  // 1. Department editing: Manager (headMemberId) or Sub-Manager (coManagerMemberId) of that department
  const canEditDepartment = (deptId: string): boolean => {
    return departments.some(
      (d) =>
        d.id === deptId &&
        (d.headMemberId === currentMember.id ||
          d.coManagerMemberId === currentMember.id)
    );
  };

  // 2. Scientific Team editing:
  //    - Events Manager / Events Sub-Manager can edit in ALL Scientific Teams
  //    - Team Leader (leaderMemberId) can edit in their own Scientific Team
  const canEditTeam = (teamId: string): boolean => {
    if (isEventsManagerOrSub) return true;
    return activeTeams.some(
      (t) => t.id === teamId && t.leaderMemberId === currentMember.id
    );
  };

  const canEditCurrentScope =
    browseMode === "department"
      ? canEditDepartment(selectedDeptId)
      : canEditTeam(selectedTeamId);

  // Current selected entities
  const currentDept =
    departments.find((d) => d.id === selectedDeptId) || departments[0];
  const currentTeam =
    teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Active members in selected department
  const deptMembers = members.filter(
    (m) =>
      m.departmentId === selectedDeptId &&
      m.status !== "Resigned" &&
      m.status !== "Removed"
  );
  const deptMemberIds = new Set(deptMembers.map((m) => m.id));

  // Active members in selected scientific team
  const teamMembers = members.filter(
    (m) =>
      (m.teamId === selectedTeamId ||
        currentTeam?.memberIds.includes(m.id)) &&
      m.status !== "Resigned" &&
      m.status !== "Removed"
  );
  const teamMemberIds = new Set(teamMembers.map((m) => m.id));

  const scopeMembers =
    browseMode === "department" ? deptMembers : teamMembers;
  const assignableMembers = sortMembersByName(scopeMembers);
  const sortedMembers = sortMembersByName(members);

  // Tasks for current scope
  const deptTasks = tasks.filter(
    (t) => t.departmentId === selectedDeptId && !t.teamId
  );
  const crossDeptMemberTasks = tasks.filter(
    (t) =>
      t.departmentId !== selectedDeptId &&
      t.assignees.some((a) => deptMemberIds.has(a.memberId))
  );
  const teamTasks = tasks.filter(
    (t) =>
      t.teamId === selectedTeamId ||
      (browseMode === "team" &&
        t.assignees.some((a) => teamMemberIds.has(a.memberId)))
  );

  const rawScopedTasks =
    browseMode === "department"
      ? [
          ...deptTasks,
          ...crossDeptMemberTasks.filter(
            (ct) => !deptTasks.some((dt) => dt.id === ct.id)
          ),
        ]
      : teamTasks;

  const scopedTasks =
    categoryFilter === "All"
      ? rawScopedTasks
      : rawScopedTasks.filter((t) => t.category === categoryFilter);

  const activeTasks = scopedTasks.filter(
    (t) =>
      restoredTaskIds.includes(t.id) ||
      (!t.archived && t.urgencyLabel !== "Completed")
  );
  const doneTasks = scopedTasks.filter(
    (t) =>
      !restoredTaskIds.includes(t.id) &&
      (t.archived || t.urgencyLabel === "Completed")
  );

  // Notes for current scope
  const scopedNotes = notes.filter((n) =>
    browseMode === "department"
      ? n.scopeType === "department" && n.scopeId === selectedDeptId
      : n.scopeType === "team" && n.scopeId === selectedTeamId
  );
  const activeNotes = scopedNotes
    .filter((n) => !n.archived)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  const archivedNotes = scopedNotes.filter((n) => n.archived);

  // Task Create / Edit Modal State
  const [taskFormModalOpen, setTaskFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ClubTask | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskCategory, setTaskCategory] = useState<TaskCategory>("General");
  const [taskDeadline, setTaskDeadline] = useState("28 Oct 2026");
  const [taskLocation, setTaskLocation] = useState("Lab A1");
  const [taskScore, setTaskScore] = useState(25);
  const [taskAssigneeIds, setTaskAssigneeIds] = useState<string[]>([
    "mem-ayoub",
  ]);

  // Task Validation & Scoring Modal State
  const [scoringTaskModal, setScoringTaskModal] = useState<ClubTask | null>(
    null
  );
  const [scoreType, setScoreType] = useState<"Full" | "Partial" | "Bonus">(
    "Full"
  );
  const [customScore, setCustomScore] = useState<number>(25);
  const [feedbackNote, setFeedbackNote] = useState(
    "Verified deliverable and attendance sheet on time. Great execution!"
  );

  // Read-Only Member Portfolio Modal State
  const [portfolioMember, setPortfolioMember] = useState<Member | null>(null);

  // Edit Scientific Team Details Modal State
  const [editingTeamModal, setEditingTeamModal] =
    useState<ScientificTeam | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamField, setEditTeamField] = useState("");
  const [editTeamDesc, setEditTeamDesc] = useState("");

  // Messaging Modal State (Direct Member or Scope Broadcast)
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTargetMember, setMessageTargetMember] =
    useState<Member | null>(null);
  const [messagePriority, setMessagePriority] = useState<
    "Info" | "Action needed" | "Official notice"
  >("Info");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");

  // Organizer Scan QR Modal
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanWorkshopId, setScanWorkshopId] = useState(
    workshops[0]?.id || "ws-python"
  );
  const [scanTargetMemberId, setScanTargetMemberId] = useState("mem-ayoub");
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Keep assignees in sync with current scope
  useEffect(() => {
    if (editingTask) return;
    const validIds = assignableMembers.map((m) => m.id);
    setTaskAssigneeIds((prev) => {
      const filtered = prev.filter((id) => validIds.includes(id));
      if (filtered.length > 0) return filtered;
      return validIds[0] ? [validIds[0]] : [];
    });
  }, [selectedDeptId, selectedTeamId, browseMode, editingTask, members.length]);

  const canModifyTask = (task: ClubTask): boolean => {
    if (task.teamId) return canEditTeam(task.teamId);
    return canEditDepartment(task.departmentId);
  };

  // Open Create Task Modal
  const openCreateTaskModal = (forceTeamId?: string) => {
    if (forceTeamId) {
      setBrowseMode("team");
      setSelectedTeamId(forceTeamId);
    }
    setEditingTask(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskCategory(
      browseMode === "team" || forceTeamId ? "Scientific" : "General"
    );
    setTaskDeadline("30 Oct 2026");
    setTaskLocation(
      browseMode === "team" || forceTeamId
        ? "Research Lab B2"
        : "Main Auditorium"
    );
    setTaskScore(25);
    const defaultAssignees = assignableMembers[0]
      ? [assignableMembers[0].id]
      : ["mem-ayoub"];
    setTaskAssigneeIds(defaultAssignees);
    setTaskFormModalOpen(true);
  };

  // Open Edit Task Modal
  const openEditTaskModal = (task: ClubTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canModifyTask(task)) return;
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setTaskCategory(task.category);
    setTaskDeadline(task.deadline);
    setTaskLocation(task.locationOrShift);
    setTaskScore(task.proposedScore);
    setTaskAssigneeIds(task.assignees.map((a) => a.memberId));
    setTaskFormModalOpen(true);
  };

  const toggleAssigneeSelection = (memberId: string) => {
    setTaskAssigneeIds((prev) => {
      if (prev.includes(memberId)) {
        return prev.length > 1 ? prev.filter((id) => id !== memberId) : prev;
      }
      return [...prev, memberId];
    });
  };

  const handleSaveTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCurrentScope && (!editingTask || !canModifyTask(editingTask))) {
      return;
    }

    const cleanTitle =
      taskTitle.trim() ||
      (browseMode === "team"
        ? `${currentTeam.name} Deliverable`
        : `${currentDept.shortName} Operations Task`);

    const finalAssignees =
      taskAssigneeIds.length > 0
        ? taskAssigneeIds
        : assignableMembers[0]
        ? [assignableMembers[0].id]
        : ["mem-ayoub"];

    if (editingTask) {
      updateTask(editingTask.id, {
        title: cleanTitle,
        description: taskDescription.trim() || editingTask.description,
        category: taskCategory,
        deadline: taskDeadline,
        locationOrShift: taskLocation,
        proposedScore: taskScore,
        assigneeIds: finalAssignees,
      });
      setToastBanner(`Updated task "${cleanTitle}" (${taskScore} XP)`);
    } else {
      createTask({
        title: cleanTitle,
        description:
          taskDescription.trim() ||
          (browseMode === "team"
            ? `Assigned in ${currentTeam.name} scientific team.`
            : `Assigned in ${currentDept.name} department.`),
        category: taskCategory,
        departmentId: browseMode === "team" ? "dept-events" : selectedDeptId,
        teamId: browseMode === "team" ? selectedTeamId : undefined,
        deadline: taskDeadline,
        locationOrShift: taskLocation,
        proposedScore: taskScore,
        assigneeIds: finalAssignees,
      });
      setToastBanner(
        `Added task "${cleanTitle}" (+${taskScore} XP) for ${finalAssignees.length} member(s)`
      );
    }

    setTaskFormModalOpen(false);
    setEditingTask(null);
    setTaskViewTab("active");
  };

  // Validate & Score Task
  const openTaskScoringModal = (task: ClubTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canModifyTask(task)) return;
    setScoringTaskModal(task);
    setScoreType("Full");
    setCustomScore(task.proposedScore);
    setFeedbackNote(
      "Verified deliverable and attendance sheet on time. Great execution!"
    );
  };

  const handleScoreTypeChange = (
    type: "Full" | "Partial" | "Bonus",
    base: number
  ) => {
    setScoreType(type);
    if (type === "Full") setCustomScore(base);
    if (type === "Partial") setCustomScore(Math.max(5, Math.round(base * 0.6)));
    if (type === "Bonus") setCustomScore(Math.min(50, base + 10));
  };

  const handleValidateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringTaskModal || !feedbackNote.trim()) return;

    const targetAssignee =
      scoringTaskModal.assignees[0]?.memberId || "mem-ayoub";

    validateAndScoreTask({
      taskId: scoringTaskModal.id,
      memberId: targetAssignee,
      scoreType,
      awardedScore: customScore,
      feedback: feedbackNote.trim(),
      validatorName: `${currentMember.fullName} (${primaryRoleLabel})`,
    });

    setRestoredTaskIds((prev) =>
      prev.filter((id) => id !== scoringTaskModal.id)
    );
    setToastBanner(`Validated "${scoringTaskModal.title}" (+${customScore} XP)`);
    setScoringTaskModal(null);
  };

  const handleArchiveSingleTask = (task: ClubTask, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canModifyTask(task)) return;
    archiveTask(task.id);
    setRestoredTaskIds((prev) => prev.filter((id) => id !== task.id));
    setToastBanner(`Archived "${task.title}"`);
  };

  const handleRestoreSingleTask = (task: ClubTask, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canModifyTask(task)) return;
    unarchiveTask(task.id);
    setRestoredTaskIds((prev) => Array.from(new Set([...prev, task.id])));
    setToastBanner(`Restored "${task.title}"`);
  };

  const handleArchiveAllCompleted = () => {
    if (!canEditCurrentScope) return;
    archiveAllCompletedTasks();
    setRestoredTaskIds([]);
    setToastBanner("Archived completed tasks");
  };

  // Notes Handlers
  const openAddNoteModal = () => {
    if (!canEditCurrentScope) return;
    setEditingNote(null);
    setNoteTitle("");
    setNoteBody("");
    setNoteTag(browseMode === "team" ? "Scientific" : "Operations");
    setNotePinned(true);
    setNoteModalOpen(true);
  };

  const openEditNoteModal = (note: WorkspaceNote) => {
    if (!canEditCurrentScope) return;
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteBody(note.body);
    setNoteTag(note.tag);
    setNotePinned(note.pinned);
    setNoteModalOpen(true);
  };

  const handleSaveNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCurrentScope) return;
    const cleanTitle =
      noteTitle.trim() ||
      (browseMode === "team"
        ? `${currentTeam.name} Lab Note`
        : `${currentDept.shortName} Operational Note`);
    const cleanBody =
      noteBody.trim() ||
      "Key operational checklist and session coordination update.";

    if (editingNote) {
      const updated = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: cleanTitle,
              body: cleanBody,
              tag: noteTag,
              pinned: notePinned,
              updatedAt: "Just now",
            }
          : n
      );
      persistNotes(updated);
      setToastBanner(`Updated note "${cleanTitle}"`);
    } else {
      const created: WorkspaceNote = {
        id: `note-${Date.now()}`,
        scopeType: browseMode,
        scopeId: browseMode === "department" ? selectedDeptId : selectedTeamId,
        title: cleanTitle,
        body: cleanBody,
        tag: noteTag,
        authorName: currentMember.fullName,
        authorRole: primaryRoleLabel,
        updatedAt: "Just now",
        pinned: notePinned,
        archived: false,
      };
      persistNotes([created, ...notes]);
      setToastBanner(`Added note "${cleanTitle}"`);
    }

    setNoteModalOpen(false);
    setEditingNote(null);
  };

  const toggleNotePin = (noteId: string) => {
    if (!canEditCurrentScope) return;
    persistNotes(
      notes.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const toggleNoteArchive = (noteId: string) => {
    if (!canEditCurrentScope) return;
    persistNotes(
      notes.map((n) => (n.id === noteId ? { ...n, archived: !n.archived } : n))
    );
  };

  // Team Details Edit Handlers
  const openEditTeamDetails = (team: ScientificTeam) => {
    if (!canEditTeam(team.id)) return;
    setEditingTeamModal(team);
    setEditTeamName(team.name);
    setEditTeamField(team.field);
    setEditTeamDesc(team.description);
  };

  const handleSaveTeamDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamModal || !canEditTeam(editingTeamModal.id)) return;
    updateTeam(editingTeamModal.id, {
      name: editTeamName.trim() || editingTeamModal.name,
      field: editTeamField.trim() || editingTeamModal.field,
      description: editTeamDesc.trim() || editingTeamModal.description,
    });
    setToastBanner(
      `Updated team "${editTeamName.trim() || editingTeamModal.name}"`
    );
    setEditingTeamModal(null);
  };

  // Messaging Handlers
  const openDirectMessageModal = (mem: Member) => {
    if (!canEditCurrentScope) return;
    setMessageTargetMember(mem);
    setMessagePriority("Info");
    setMessageTitle(
      `${
        browseMode === "team" ? currentTeam.name : currentDept.shortName
      } Coordination`
    );
    setMessageBody("");
    setMessageModalOpen(true);
  };

  const openBroadcastMessageModal = () => {
    if (!canEditCurrentScope) return;
    setMessageTargetMember(null);
    setMessagePriority("Official notice");
    setMessageTitle(
      `${
        browseMode === "team" ? currentTeam.name : currentDept.shortName
      } Update`
    );
    setMessageBody("");
    setMessageModalOpen(true);
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCurrentScope) return;
    const recipientLabel = messageTargetMember
      ? messageTargetMember.fullName
      : browseMode === "team"
      ? `Scientific Team: ${currentTeam.name}`
      : `Department: ${currentDept.name}`;

    const cleanTitle =
      messageTitle.trim() ||
      `${
        browseMode === "team" ? currentTeam.name : currentDept.shortName
      } Notice`;
    const cleanBody =
      messageBody.trim() ||
      `Please review the updated tasks and operational notes for this week's session.`;

    sendClubMessage({
      recipientScope: recipientLabel,
      priority: messagePriority,
      title: cleanTitle,
      body: cleanBody,
      inApp: true,
      email: false,
    });

    setToastBanner(`Sent message to ${recipientLabel}`);
    setMessageModalOpen(false);
    setMessageTargetMember(null);
  };

  const handleOrganizerQrScan = () => {
    const res = verifyWorkshopCheckIn(
      scanWorkshopId,
      scanTargetMemberId,
      "SCAN-OK",
      "Organizer Scanned Member QR"
    );
    setScanFeedback(res.message);
  };

  const deptHead = members.find((m) => m.id === currentDept.headMemberId);
  const deptSubManager = members.find(
    (m) => m.id === currentDept.coManagerMemberId
  );
  const teamLeader = members.find((m) => m.id === currentTeam.leaderMemberId);

  return (
    <MobileAppShell>
      <div className="flex-1 flex flex-col px-4 sm:px-5 pt-3 pb-6 space-y-3 animate-rise">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block">
              Organigramme &amp; Operations
            </span>
            <h1 className="text-lg sm:text-xl font-black font-display text-[#0F172A] tracking-tight">
              Manager Workspace
            </h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {canEditCurrentScope && (
              <button
                type="button"
                onClick={() => {
                  setScanFeedback(null);
                  setScanModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-[#0284C7] text-[11px] font-bold flex items-center gap-1 active:scale-[0.98] transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
            )}
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="w-8 h-8 rounded-lg bg-white border border-slate-200/90 flex items-center justify-center text-[#0F172A] hover:bg-[#F0F6FF] transition"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Organigramme Member & Role Identity Card (Synced with Admin Dashboard) */}
        <div className="rounded-xl bg-gradient-to-br from-[#182C4E] via-[#132441] to-[#0E1B31] text-white p-3.5 shadow-[0_10px_26px_rgba(16,31,56,0.16)] border border-[#2B4875]/60 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <img
              src={currentMember.avatarUrl}
              alt={currentMember.fullName}
              className="w-10 h-10 rounded-lg object-cover border border-[#38BDF8]/40 shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  {currentMember.fullName}
                </p>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#7DD3FC] flex items-center gap-1 shrink-0">
                  <Shield className="w-3 h-3 text-[#38BDF8]" />
                  <span>Organigramme</span>
                </span>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {currentMemberRoleBadges.map((badge) => (
                  <span
                    key={badge}
                    className="px-2 py-0.5 rounded-md bg-[#38BDF8]/15 text-[#7DD3FC] border border-[#38BDF8]/30 text-[9.5px] font-mono font-bold"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Switch active Organigramme member */}
          <div className="relative pt-1 border-t border-white/10">
            <select
              value={currentMember.id}
              onChange={(e) => setCurrentMemberId(e.target.value)}
              aria-label="Switch Organigramme Member"
              className="w-full appearance-none pl-2.5 pr-7 py-1.5 rounded-lg bg-[#0B1528]/80 border border-[#38BDF8]/35 text-[11px] font-bold text-[#7DD3FC] focus:outline-none cursor-pointer"
            >
              {members
                .filter(
                  (m) => m.status !== "Resigned" && m.status !== "Removed"
                )
                .map((m) => {
                  const roleSummary = getMemberOrganigrammeBadges(m)[0];
                  return (
                    <option
                      key={m.id}
                      value={m.id}
                      className="bg-[#0E1B31] text-white"
                    >
                      {m.fullName} · {roleSummary}
                    </option>
                  );
                })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#7DD3FC] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 mt-0.5" />
          </div>
        </div>

        {/* Scope Selector Bar: Browse Departments vs Scientific Teams */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="grid grid-cols-2 gap-1 bg-[#F4F7FB] p-1 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setBrowseMode("department")}
              className={`py-1.5 px-2.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                browseMode === "department"
                  ? "bg-[#182C4E] text-white shadow-2xs"
                  : "text-[#475569] hover:text-[#0F172A]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Departments (6)</span>
            </button>
            <button
              type="button"
              onClick={() => setBrowseMode("team")}
              className={`py-1.5 px-2.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                browseMode === "team"
                  ? "bg-[#182C4E] text-white shadow-2xs"
                  : "text-[#475569] hover:text-[#0F172A]"
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Scientific Teams ({activeTeams.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              {browseMode === "department" ? (
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  aria-label="Inspect Department"
                  className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  aria-label="Inspect Scientific Team"
                  className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                >
                  {activeTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              )}
              <ChevronDown className="w-4 h-4 text-[#475569] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {canEditCurrentScope && (
              <button
                type="button"
                onClick={openBroadcastMessageModal}
                className="px-2.5 py-2 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white text-[11px] font-bold flex items-center gap-1 shrink-0 active:scale-[0.98] transition cursor-pointer"
                title="Send message to this scope"
              >
                <Megaphone className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Message</span>
              </button>
            )}
          </div>

          {/* Scope Organigramme Leadership Strip */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[10.5px] text-[#475569]">
            {browseMode === "department" ? (
              <>
                <span className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-slate-200/80 font-semibold">
                  Manager:{" "}
                  <strong className="text-[#0F172A]">
                    {deptHead?.fullName || "Unassigned"}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-slate-200/80 font-semibold">
                  Sub-Manager:{" "}
                  <strong className="text-[#0F172A]">
                    {deptSubManager?.fullName || "Unassigned"}
                  </strong>
                </span>
              </>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-slate-200/80 font-semibold">
                Team Leader:{" "}
                <strong className="text-[#0F172A]">
                  {teamLeader?.fullName || "Unassigned"}
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* 5 Sub-Tabs: Overview | Tasks | Members | Teams | Notes */}
        <div className="grid grid-cols-5 gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          {(
            [
              "Overview",
              "Tasks",
              "Members",
              "Teams",
              "Notes",
            ] as ManagerSubTab[]
          ).map((tab) => {
            const active = subTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSubTab(tab)}
                className={`py-1.5 rounded-lg text-[10.5px] sm:text-[11px] font-bold transition cursor-pointer ${
                  active
                    ? "bg-[#182C4E] text-white shadow-2xs"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Toast Feedback */}
        {toastBanner && (
          <div className="p-2.5 rounded-xl bg-[#F0F6FF] border border-[#D5E3F5] flex items-center justify-between gap-2 text-xs text-[#0F172A] font-bold">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
              <span className="line-clamp-1">{toastBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastBanner(null)}
              className="text-[#64748B] hover:text-[#0F172A] cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Compact 4-Column KPI Strip */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setSubTab("Members")}
            className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-left hover:border-[#38BDF8] transition cursor-pointer"
          >
            <span className="text-base sm:text-lg font-black font-display text-[#0F172A] block leading-none tabular-nums">
              {scopeMembers.length}
            </span>
            <span className="text-[10px] font-semibold text-[#64748B] block mt-1">
              Members
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab("Tasks");
              setTaskViewTab("active");
            }}
            className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-left hover:border-[#38BDF8] transition cursor-pointer"
          >
            <span className="text-base sm:text-lg font-black font-display text-[#0284C7] block leading-none tabular-nums">
              {activeTasks.length}
            </span>
            <span className="text-[10px] font-semibold text-[#64748B] block mt-1">
              Active
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab("Tasks");
              setTaskViewTab("done");
            }}
            className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-left hover:border-[#38BDF8] transition cursor-pointer"
          >
            <span className="text-base sm:text-lg font-black font-display text-[#182C4E] block leading-none tabular-nums">
              {doneTasks.length}
            </span>
            <span className="text-[10px] font-semibold text-[#64748B] block mt-1 flex items-center gap-1">
              <Archive className="w-3 h-3 text-[#0284C7]" />
              <span>Done</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("Notes")}
            className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-left hover:border-[#38BDF8] transition cursor-pointer"
          >
            <span className="text-base sm:text-lg font-black font-display text-emerald-700 block leading-none tabular-nums">
              {activeNotes.length}
            </span>
            <span className="text-[10px] font-semibold text-[#64748B] block mt-1">
              Notes
            </span>
          </button>
        </div>

        {/* =========================================================
            SECTION A: TASKS & SMALL ARCHIVE BOXES (Overview + Tasks)
           ========================================================= */}
        {(subTab === "Overview" || subTab === "Tasks") && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span>Tasks</span>
              </h2>

              {canEditCurrentScope && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openCreateTaskModal()}
                    className="px-2.5 py-1.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white text-[11px] font-bold flex items-center gap-1 active:scale-[0.98] transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Add Task</span>
                  </button>
                </div>
              )}
            </div>

            {/* Compact Active vs Icon-Only Archive Toggle + Category Filter */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center rounded-lg bg-[#F4F7FB] p-0.5 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setTaskViewTab("active")}
                  className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition cursor-pointer ${
                    taskViewTab === "active"
                      ? "bg-[#182C4E] text-white shadow-2xs"
                      : "text-[#475569] hover:text-[#0F172A]"
                  }`}
                >
                  Active ({activeTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskViewTab("done")}
                  title="Done & Archive"
                  aria-label="Done & Archive"
                  className={`p-1.5 rounded-md transition cursor-pointer flex items-center justify-center ${
                    taskViewTab === "done"
                      ? "bg-[#182C4E] text-white shadow-2xs"
                      : "text-[#475569] hover:text-[#0F172A]"
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as "All" | TaskCategory)
                  }
                  aria-label="Filter Tasks by Category"
                  className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-slate-200 text-[10.5px] font-bold text-[#475569] focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {ALL_TASK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {canEditCurrentScope && taskViewTab === "active" && (
                  <button
                    type="button"
                    onClick={handleArchiveAllCompleted}
                    className="w-7 h-7 rounded-lg bg-[#F8FAFC] hover:bg-[#F0F6FF] border border-slate-200 text-[#0284C7] flex items-center justify-center cursor-pointer"
                    title="Archive completed tasks"
                    aria-label="Archive completed tasks"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Active Tasks List vs Compact Small Done/Archive Rows */}
            {taskViewTab === "active" ? (
              <div className="space-y-2">
                {activeTasks.length === 0 ? (
                  <div className="py-5 px-3 rounded-lg bg-[#F8FAFC] border border-slate-200/70 text-center">
                    <p className="text-xs font-bold text-[#475569]">
                      No active tasks
                    </p>
                  </div>
                ) : (
                  activeTasks.map((task) => {
                    const editable = canModifyTask(task);
                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 hover:border-[#D5E3F5] transition space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9.5px] font-mono font-bold uppercase">
                                {task.category}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#182C4E] text-[#7DD3FC] text-[9.5px] font-mono font-bold tabular-nums">
                                +{task.proposedScore} XP
                              </span>
                              <span className="text-[10px] font-semibold text-[#64748B]">
                                Due {task.deadline} · {task.locationOrShift}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#0F172A] mt-1 leading-snug">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {editable && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => openEditTaskModal(task, e)}
                                className="w-7 h-7 rounded-md bg-white border border-slate-200 hover:border-[#0284C7] text-[#0284C7] flex items-center justify-center cursor-pointer"
                                title="Edit task"
                                aria-label="Edit task"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => openTaskScoringModal(task, e)}
                                className="px-2 py-1 rounded-md bg-[#182C4E] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                title="Validate & Score XP"
                              >
                                <Check className="w-3 h-3 text-[#38BDF8]" />
                                <span>Score</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleArchiveSingleTask(task, e)}
                                className="w-7 h-7 rounded-md bg-white border border-slate-200 text-[#64748B] hover:text-[#0F172A] flex items-center justify-center cursor-pointer"
                                title="Archive task"
                                aria-label="Archive task"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Assignees Strip */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-200/60">
                          <span className="text-[9.5px] font-mono font-bold uppercase text-[#64748B]">
                            Assigned:
                          </span>
                          {task.assignees.map((a) => {
                            const memObj = members.find(
                              (m) => m.id === a.memberId
                            );
                            return (
                              <button
                                key={a.memberId}
                                type="button"
                                onClick={() =>
                                  memObj && setPortfolioMember(memObj)
                                }
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200/90 text-[10px] font-bold text-[#0F172A] hover:border-[#0284C7] cursor-pointer"
                                title="View Member Portfolio"
                              >
                                <span>{a.memberName}</span>
                                <span className="text-[9px] text-[#0284C7] font-mono">
                                  ({a.status})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* SMALL COMPACT DONE & ARCHIVE BOXES (Icon-only actions) */
              <div className="space-y-1.5">
                {doneTasks.length === 0 ? (
                  <div className="py-3 px-3 rounded-lg bg-[#F8FAFC] border border-slate-200/70 text-center">
                    <p className="text-[11px] font-semibold text-[#64748B]">
                      Empty
                    </p>
                  </div>
                ) : (
                  doneTasks.map((task) => {
                    const editable = canModifyTask(task);
                    const awarded =
                      task.assignees[0]?.awardedScore ?? task.proposedScore;
                    return (
                      <div
                        key={task.id}
                        className="py-2 px-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-4 h-4 rounded-full bg-[#182C4E] text-[#38BDF8] flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span className="text-[11px] font-bold text-[#475569] line-through line-clamp-1">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] font-mono text-[9.5px] font-bold tabular-nums">
                            +{awarded} XP
                          </span>
                          {editable && (
                            <button
                              type="button"
                              onClick={(e) => handleRestoreSingleTask(task, e)}
                              className="w-6 h-6 rounded bg-white border border-slate-200 text-[#475569] hover:text-[#0F172A] flex items-center justify-center cursor-pointer"
                              title="Restore"
                              aria-label="Restore"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            SECTION B: WORKSPACE NOTES & BRIEFINGS (Overview + Notes)
           ========================================================= */}
        {(subTab === "Overview" || subTab === "Notes") && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span>Notes</span>
              </h2>

              {canEditCurrentScope && (
                <button
                  type="button"
                  onClick={openAddNoteModal}
                  className="px-2.5 py-1.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white text-[11px] font-bold flex items-center gap-1 active:scale-[0.98] transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Add Note</span>
                </button>
              )}
            </div>

            {activeNotes.length === 0 ? (
              <div className="py-4 px-3 rounded-lg bg-[#F8FAFC] border border-slate-200/70 text-center">
                <p className="text-[11px] font-semibold text-[#64748B]">
                  No active notes yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {note.pinned && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#182C4E] text-[#7DD3FC] text-[9px] font-mono font-bold uppercase">
                            <Pin className="w-2.5 h-2.5" />
                            <span>Pinned</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9.5px] font-mono font-bold">
                          {note.tag}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {note.authorName} · {note.updatedAt}
                        </span>
                      </div>

                      {canEditCurrentScope && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleNotePin(note.id)}
                            className="w-6 h-6 rounded bg-white border border-slate-200 text-[#64748B] hover:text-[#0284C7] flex items-center justify-center cursor-pointer"
                            title={note.pinned ? "Unpin note" : "Pin note"}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditNoteModal(note)}
                            className="w-6 h-6 rounded bg-white border border-slate-200 text-[#64748B] hover:text-[#0F172A] flex items-center justify-center cursor-pointer"
                            title="Edit note"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleNoteArchive(note.id)}
                            className="w-6 h-6 rounded bg-white border border-slate-200 text-[#64748B] hover:text-[#0F172A] flex items-center justify-center cursor-pointer"
                            title="Archive note"
                          >
                            <Archive className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs font-bold text-[#0F172A]">
                      {note.title}
                    </p>
                    <p className="text-[11px] text-[#475569] leading-relaxed">
                      {note.body}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Small Compact Archived Notes Strip (Icon-Only) */}
            {archivedNotes.length > 0 && (
              <div className="pt-2 border-t border-slate-200/70 space-y-1">
                {archivedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="py-1.5 px-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/70 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Archive className="w-3 h-3 text-[#64748B] shrink-0" />
                      <span className="text-[11px] font-semibold text-[#64748B] line-through line-clamp-1">
                        {note.title}
                      </span>
                    </div>
                    {canEditCurrentScope && (
                      <button
                        type="button"
                        onClick={() => toggleNoteArchive(note.id)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 text-[#475569] hover:text-[#0F172A] flex items-center justify-center shrink-0 cursor-pointer"
                        title="Restore note"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            SECTION C: MEMBERS & ICON-ONLY PORTFOLIO (Overview + Members)
           ========================================================= */}
        {(subTab === "Overview" || subTab === "Members") && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span>Roster ({scopeMembers.length})</span>
              </h2>

              {canEditCurrentScope && (
                <button
                  type="button"
                  onClick={openBroadcastMessageModal}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-[#0284C7] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>Broadcast</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {scopeMembers.map((mem) => {
                const isDeptHead =
                  browseMode === "department" &&
                  currentDept.headMemberId === mem.id;
                const isDeptSub =
                  browseMode === "department" &&
                  currentDept.coManagerMemberId === mem.id;
                const isTeamLead =
                  browseMode === "team" &&
                  currentTeam.leaderMemberId === mem.id;

                const roleBadge = isDeptHead
                  ? "Manager"
                  : isDeptSub
                  ? "Sub-Manager"
                  : isTeamLead
                  ? "Team Leader"
                  : getMemberOrganigrammeBadges(mem)[0];

                return (
                  <div
                    key={mem.id}
                    className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={mem.avatarUrl}
                        alt={mem.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-white shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-[#0F172A]">
                            {mem.fullName}
                          </p>
                          <span className="px-1.5 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9.5px] font-mono font-bold">
                            {roleBadge}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-[#64748B] line-clamp-1 tabular-nums">
                          {mem.major} · {mem.xpTotal} XP · {mem.attendanceRate}%
                          att.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Icon-Only Portfolio Button */}
                      <button
                        type="button"
                        onClick={() => setPortfolioMember(mem)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200/90 hover:border-[#0284C7] text-[#0284C7] flex items-center justify-center transition cursor-pointer"
                        title={`Portfolio · ${mem.fullName}`}
                        aria-label={`Portfolio · ${mem.fullName}`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                      </button>

                      {canEditCurrentScope && (
                        <button
                          type="button"
                          onClick={() => openDirectMessageModal(mem)}
                          className="w-7 h-7 rounded-lg bg-[#182C4E] text-white flex items-center justify-center hover:bg-[#101F38] transition cursor-pointer"
                          title={`Message ${mem.fullName}`}
                          aria-label={`Message ${mem.fullName}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION D: SCIENTIFIC TEAMS DIRECTORY & TEAM EDITING
           ========================================================= */}
        {subTab === "Teams" && (
          <div className="space-y-2.5">
            {activeTeams.map((team) => {
              const editableTeam = canEditTeam(team.id);
              const leader = members.find(
                (m) => m.id === team.leaderMemberId
              );
              const tMembers = members.filter(
                (m) =>
                  team.memberIds.includes(m.id) || m.teamId === team.id
              );

              return (
                <div
                  key={team.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                        {team.name}
                      </h3>
                      <p className="text-[10.5px] font-semibold text-[#0284C7] mt-0.5">
                        {team.field} · Leader:{" "}
                        {leader?.fullName || "Assigned Leader"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setBrowseMode("team");
                          setSelectedTeamId(team.id);
                          setSubTab("Tasks");
                        }}
                        className="px-2 py-1 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-[#0284C7] text-[10px] font-bold cursor-pointer"
                      >
                        Open
                      </button>
                      {editableTeam && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditTeamDetails(team)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:border-[#0284C7] text-[#0284C7] flex items-center justify-center cursor-pointer"
                            title="Edit team details"
                            aria-label="Edit team details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openCreateTaskModal(team.id)}
                            className="w-7 h-7 rounded-lg bg-[#182C4E] text-white flex items-center justify-center cursor-pointer"
                            title="Add team task"
                            aria-label="Add team task"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    {team.description}
                  </p>

                  {/* Team Member Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-100">
                    <span className="text-[9.5px] font-mono font-bold uppercase text-[#64748B]">
                      Members ({tMembers.length}):
                    </span>
                    {tMembers.map((tm) => (
                      <button
                        key={tm.id}
                        type="button"
                        onClick={() => setPortfolioMember(tm)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-slate-200 hover:border-[#0284C7] text-[10px] font-bold text-[#0F172A] cursor-pointer"
                        title={`Portfolio · ${tm.fullName}`}
                      >
                        <span>{tm.fullName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          MODAL 1: ADD / EDIT TASK MODAL
         ========================================================= */}
      {taskFormModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-16 sm:pb-6">
          <form
            onSubmit={handleSaveTaskSubmit}
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[430px] max-h-[80dvh] overflow-y-auto bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xl space-y-3 animate-rise"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9.5px] font-mono font-bold uppercase">
                  {browseMode === "team"
                    ? currentTeam.name
                    : currentDept.shortName}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] mt-1">
                  {editingTask ? "Edit Task Details" : "Add Task"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTaskFormModalOpen(false);
                  setEditingTask(null);
                }}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Prepare Spectroscopy Workshop Kit & Check-In"
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A] focus:bg-white focus:border-[#0284C7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Brief Instructions
              </label>
              <textarea
                rows={2}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Deliverable details, shift timing, or coordination notes..."
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A] resize-none focus:bg-white focus:border-[#0284C7] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Category
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) =>
                    setTaskCategory(e.target.value as TaskCategory)
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-[#0F172A]"
                >
                  {ALL_TASK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  XP Score (5–50)
                </label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={taskScore}
                  onChange={(e) => setTaskScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Deadline
                </label>
                <input
                  type="text"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Location / Shift
                </label>
                <input
                  type="text"
                  value={taskLocation}
                  onChange={(e) => setTaskLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#0F172A]">
                  Assignees ({taskAssigneeIds.length} selected)
                </label>
              </div>
              <div
                tabIndex={0}
                onKeyDown={(e) =>
                  handleMemberListContainerKeyDown(
                    e,
                    assignableMembers,
                    toggleAssigneeSelection
                  )
                }
                className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 bg-[#F8FAFC] p-1.5 space-y-1"
              >
                {assignableMembers.map((m) => {
                  const selected = taskAssigneeIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleAssigneeSelection(m.id)}
                      className={`w-full px-2.5 py-1.5 rounded-md text-left flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                        selected
                          ? "bg-[#182C4E] text-white"
                          : "bg-white text-[#0F172A] border border-slate-200/70"
                      }`}
                    >
                      <span>{m.fullName}</span>
                      <span className="text-[10px] font-mono opacity-80">
                        {selected
                          ? "Selected"
                          : getMemberOrganigrammeBadges(m)[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white font-bold text-xs transition cursor-pointer"
            >
              {editingTask ? "Save Task Changes" : "Create & Assign Task"}
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL 2: VALIDATE & SCORE TASK
         ========================================================= */}
      {scoringTaskModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-16 sm:pb-6">
          <form
            onSubmit={handleValidateTaskSubmit}
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[410px] max-h-[80dvh] overflow-y-auto bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-rise"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9.5px] font-mono font-bold uppercase">
                  Task Validation
                </span>
                <h3 className="text-sm font-extrabold text-[#0F172A] mt-1">
                  {scoringTaskModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setScoringTaskModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(["Full", "Partial", "Bonus"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    handleScoreTypeChange(t, scoringTaskModal.proposedScore)
                  }
                  className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    scoreType === t
                      ? "bg-[#182C4E] text-white border-[#182C4E]"
                      : "bg-[#F8FAFC] text-[#475569] border-slate-200"
                  }`}
                >
                  {t} Score
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Awarded XP (5–50)
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={customScore}
                onChange={(e) => setCustomScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Validation Note
              </label>
              <textarea
                rows={2}
                required
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Validate &amp; Award +{customScore} XP</span>
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL 3: READ-ONLY MEMBER PORTFOLIO MODAL
         ========================================================= */}
      {portfolioMember && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[440px] max-h-[80dvh] overflow-y-auto bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-rise"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={portfolioMember.avatarUrl}
                  alt={portfolioMember.fullName}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9px] font-mono font-bold uppercase">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Member Portfolio</span>
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] mt-0.5">
                    {portfolioMember.fullName}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    {portfolioMember.major} ({portfolioMember.academicYear}) ·{" "}
                    {portfolioMember.quanterId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPortfolioMember(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#475569] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bio / Statement */}
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-slate-200/80 space-y-1">
              <span className="text-[9.5px] font-mono font-bold uppercase text-[#64748B]">
                Academic &amp; Scientific Bio
              </span>
              <p className="text-xs text-[#0F172A] leading-relaxed">
                {portfolioMember.bio ||
                  "Active scientific contributor focusing on experimental workshops and research deliverables."}
              </p>
            </div>

            {/* 3-Column Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-center">
                <span className="text-sm font-black text-[#182C4E] block tabular-nums">
                  Lv. {portfolioMember.level}
                </span>
                <span className="text-[9.5px] font-semibold text-[#475569]">
                  {portfolioMember.xpTotal} XP
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-center">
                <span className="text-sm font-black text-[#0284C7] block tabular-nums">
                  {portfolioMember.attendanceRate}%
                </span>
                <span className="text-[9.5px] font-semibold text-[#475569]">
                  Attendance
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-center">
                <span className="text-sm font-black text-emerald-700 block tabular-nums">
                  {portfolioMember.projectsCompletedCount}
                </span>
                <span className="text-[9.5px] font-semibold text-[#475569]">
                  Projects
                </span>
              </div>
            </div>

            {/* Verified Skills */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#64748B] block mb-1.5">
                Skills &amp; Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {portfolioMember.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md bg-[#F0F6FF] text-[#0F172A] border border-[#D5E3F5] text-[10.5px] font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Unlocked Badges */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#64748B] block mb-1.5">
                Earned Badges ({portfolioMember.badgeIds.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {portfolioMember.badgeIds.map((bid) => {
                  const bObj = badges.find((b) => b.id === bid);
                  return (
                    <span
                      key={bid}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#182C4E] text-white text-[10px] font-bold"
                    >
                      <Award className="w-3 h-3 text-[#38BDF8]" />
                      <span>{bObj?.name || bid}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Portfolio & External Links (Read-Only) */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#64748B] block mb-1.5">
                Portfolio &amp; Research Links
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {portfolioMember.githubUrl && (
                  <a
                    href={portfolioMember.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 hover:border-[#0284C7] text-xs font-bold text-[#0F172A] flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-[#182C4E]" />
                      <span>GitHub</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#64748B]" />
                  </a>
                )}
                {portfolioMember.linkedinUrl && (
                  <a
                    href={portfolioMember.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 hover:border-[#0284C7] text-xs font-bold text-[#0F172A] flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>LinkedIn</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#64748B]" />
                  </a>
                )}
                {portfolioMember.portfolioUrl && (
                  <a
                    href={portfolioMember.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 hover:border-[#0284C7] text-xs font-bold text-[#0F172A] flex items-center justify-between col-span-2"
                  >
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Personal Portfolio Website</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#64748B]" />
                  </a>
                )}
                {!portfolioMember.githubUrl &&
                  !portfolioMember.linkedinUrl &&
                  !portfolioMember.portfolioUrl && (
                    <p className="text-[11px] text-[#64748B] col-span-2">
                      No external links published yet.
                    </p>
                  )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              {canEditCurrentScope && (
                <button
                  type="button"
                  onClick={() => {
                    const target = portfolioMember;
                    setPortfolioMember(null);
                    openDirectMessageModal(target);
                  }}
                  className="flex-1 py-2 rounded-lg bg-[#182C4E] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Message {portfolioMember.fullName.split(" ")[0]}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPortfolioMember(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-[#0F172A] text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: ADD / EDIT WORKSPACE NOTE
         ========================================================= */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-16 sm:pb-6">
          <form
            onSubmit={handleSaveNoteSubmit}
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[410px] max-h-[80dvh] overflow-y-auto bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xl space-y-3 animate-rise"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9.5px] font-mono font-bold uppercase">
                  {browseMode === "team"
                    ? currentTeam.name
                    : currentDept.shortName}{" "}
                  Note
                </span>
                <h3 className="text-sm font-extrabold text-[#0F172A] mt-1">
                  {editingNote ? "Edit Operational Note" : "Add Workspace Note"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNoteModalOpen(false);
                  setEditingNote(null);
                }}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Note Title
              </label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Saturday Lab Safety & Equipment Handover"
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Tag
                </label>
                <select
                  value={noteTag}
                  onChange={(e) =>
                    setNoteTag(e.target.value as WorkspaceNote["tag"])
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-[#0F172A]"
                >
                  <option value="Operations">Operations</option>
                  <option value="Briefing">Briefing</option>
                  <option value="Handover">Handover</option>
                  <option value="Scientific">Scientific</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setNotePinned(!notePinned)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    notePinned
                      ? "bg-[#182C4E] text-white border-[#182C4E]"
                      : "bg-[#F8FAFC] text-[#475569] border-slate-200"
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{notePinned ? "Pinned" : "Pin Note"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Note Content
              </label>
              <textarea
                rows={3}
                required
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Write operational details, room codes, or team tasks..."
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white font-bold text-xs cursor-pointer"
            >
              {editingNote ? "Update Note" : "Save Note"}
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL 5: EDIT SCIENTIFIC TEAM DETAILS
         ========================================================= */}
      {editingTeamModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-16 sm:pb-6">
          <form
            onSubmit={handleSaveTeamDetails}
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[410px] max-h-[80dvh] overflow-y-auto bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xl space-y-3 animate-rise"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9.5px] font-mono font-bold uppercase">
                  Scientific Team Governance
                </span>
                <h3 className="text-sm font-extrabold text-[#0F172A] mt-1">
                  Edit Team Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeamModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Scientific Team Name
              </label>
              <input
                type="text"
                required
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Research Field / Domain
              </label>
              <input
                type="text"
                required
                value={editTeamField}
                onChange={(e) => setEditTeamField(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Description &amp; Mission
              </label>
              <textarea
                rows={3}
                required
                value={editTeamDesc}
                onChange={(e) => setEditTeamDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white font-bold text-xs cursor-pointer"
            >
              Save Team Details
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL 6: SEND DIRECT OR BROADCAST MESSAGE
         ========================================================= */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-16 sm:pb-6">
          <form
            onSubmit={handleSendMessageSubmit}
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[410px] max-h-[80dvh] overflow-y-auto bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xl space-y-3 animate-rise"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9.5px] font-mono font-bold uppercase">
                  {messageTargetMember
                    ? "Direct Member Message"
                    : "Scope Broadcast"}
                </span>
                <h3 className="text-sm font-extrabold text-[#0F172A] mt-1">
                  {messageTargetMember
                    ? `Message ${messageTargetMember.fullName}`
                    : `Broadcast to ${
                        browseMode === "team"
                          ? currentTeam.name
                          : currentDept.shortName
                      }`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMessageModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(["Info", "Official notice", "Action needed"] as const).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMessagePriority(p)}
                    className={`py-1.5 px-2 rounded-lg text-[10.5px] font-bold border transition cursor-pointer ${
                      messagePriority === p
                        ? "bg-[#182C4E] text-white border-[#182C4E]"
                        : "bg-[#F8FAFC] text-[#475569] border-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                Message
              </label>
              <textarea
                rows={3}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Write clear instructions or coordination details..."
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Send Notification</span>
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL 7: ORGANIZER SCAN MEMBER QR
         ========================================================= */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[410px] max-h-[80dvh] overflow-y-auto bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-rise"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[9.5px] font-mono font-bold uppercase">
                  Attendance Verification
                </span>
                <h3 className="text-sm font-extrabold text-[#0F172A] mt-0.5">
                  Organizer Scan Member QR
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setScanModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#475569] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Active Workshop / Session
                </label>
                <select
                  value={scanWorkshopId}
                  onChange={(e) => setScanWorkshopId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-[#0F172A]"
                >
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} (+{w.xpReward} XP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Member QR Pass
                </label>
                <select
                  value={scanTargetMemberId}
                  onChange={(e) => setScanTargetMemberId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(
                      e,
                      sortedMembers,
                      setScanTargetMemberId
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-[#0F172A]"
                >
                  {sortedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {scanFeedback && (
              <div className="p-2.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-xs font-bold text-[#0F172A]">
                {scanFeedback}
              </div>
            )}

            <button
              type="button"
              onClick={handleOrganizerQrScan}
              className="w-full py-2.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Verify Member QR &amp; Credit XP</span>
            </button>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
