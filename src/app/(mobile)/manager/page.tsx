"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Eye,
  Globe,
  History,
  Lock,
  MessageSquare,
  Orbit,
  Plus,
  QrCode,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ClubTask, Member, TaskCategory } from "@/lib/types/erp";
import {
  handleMemberListContainerKeyDown,
  handleMemberSelectKeyDown,
  sortMembersByName,
} from "@/lib/utils/memberKeyboardJump";

type ManagerSubTab = "Overview" | "Members" | "Tasks" | "Teams";
type TaskViewTab = "active" | "done";
type WorkspaceRoleMode =
  | "Dept Manager"
  | "Co-Manager"
  | "Team Leader"
  | "Department Member";
type TaskVisibilityScope =
  | "dept"
  | "all-club"
  | "team"
  | "other-dept-our-members";

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

export default function MobileManagerWorkspacePage() {
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);
  const members = useQuantersStore((s) => s.members);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const tasks = useQuantersStore((s) => s.tasks);
  const workshops = useQuantersStore((s) => s.workshops);
  const validateAndScoreTask = useQuantersStore((s) => s.validateAndScoreTask);
  const createTask = useQuantersStore((s) => s.createTask);
  const archiveTask = useQuantersStore((s) => s.archiveTask);
  const unarchiveTask = useQuantersStore((s) => s.unarchiveTask);
  const archiveAllCompletedTasks = useQuantersStore(
    (s) => s.archiveAllCompletedTasks
  );
  const sendClubMessage = useQuantersStore((s) => s.sendClubMessage);
  const verifyWorkshopCheckIn = useQuantersStore((s) => s.verifyWorkshopCheckIn);

  const currentMember =
    members.find((m) => m.id === currentMemberId) || members[0];

  const initialRoleMode: WorkspaceRoleMode = currentMember.roles.some((r) =>
    ["Department Head", "Super Admin", "HR Head", "Executive"].includes(r)
  )
    ? "Dept Manager"
    : currentMember.roles.includes("Co-Manager")
    ? "Co-Manager"
    : currentMember.roles.includes("Team Leader")
    ? "Team Leader"
    : "Department Member";

  const [roleMode, setRoleMode] = useState<WorkspaceRoleMode>(initialRoleMode);
  const [selectedDeptId, setSelectedDeptId] = useState(
    currentMember.departmentId || "dept-it"
  );
  const [selectedTeamId, setSelectedTeamId] = useState(
    currentMember.teamId || "team-astro"
  );
  const [taskScope, setTaskScope] = useState<TaskVisibilityScope>("dept");
  const [categoryFilter, setCategoryFilter] = useState<"All" | TaskCategory>(
    "All"
  );
  const [subTab, setSubTab] = useState<ManagerSubTab>("Overview");
  const [taskViewTab, setTaskViewTab] = useState<TaskViewTab>("active");
  const [restoredTaskIds, setRestoredTaskIds] = useState<string[]>([]);

  // Modals State
  const [activeTaskModal, setActiveTaskModal] = useState<ClubTask | null>(null);
  const [scoreType, setScoreType] = useState<"Full" | "Partial" | "Bonus">(
    "Full"
  );
  const [customScore, setCustomScore] = useState<number>(25);
  const [feedbackNote, setFeedbackNote] = useState(
    "Verified deliverable and attendance sheet on time. Great execution!"
  );

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] =
    useState<TaskCategory>("General");
  const [newTaskDeadline, setNewTaskDeadline] = useState("28 Oct 2026");
  const [newTaskLocation, setNewTaskLocation] = useState("Lab A1");
  const [newTaskScore, setNewTaskScore] = useState(25);
  const [newTaskAssigneeIds, setNewTaskAssigneeIds] = useState<string[]>([
    "mem-ayoub",
  ]);

  // Quick Message Modal
  const [quickMessageTarget, setQuickMessageTarget] = useState<Member | null>(
    null
  );
  const [quickMsgText, setQuickMsgText] = useState("");

  // Organizer Scan Member QR Modal
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanWorkshopId, setScanWorkshopId] = useState(
    workshops[0]?.id || "ws-python"
  );
  const [scanTargetMemberId, setScanTargetMemberId] = useState("mem-ayoub");
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const [toastBanner, setToastBanner] = useState<string | null>(null);

  const currentDept =
    departments.find((d) => d.id === selectedDeptId) || departments[0];
  const currentTeam =
    teams.find((t) => t.id === selectedTeamId) || teams[0];

  const isManagerOrCoManager =
    roleMode === "Dept Manager" || roleMode === "Co-Manager";
  const isTeamLeader = roleMode === "Team Leader";
  const canAssignTasks = isManagerOrCoManager || isTeamLeader;

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

  // Assignable members locked strictly to role scope:
  // - Dept Manager & Co-Manager -> ONLY members of their department (selectedDeptId)
  // - Team Leader -> ONLY members of their scientific team (selectedTeamId)
  const assignableMembers = sortMembersByName(
    isTeamLeader ? teamMembers : deptMembers
  );
  const sortedMembers = sortMembersByName(members);

  // Keep selected assignees valid when department/team or role changes
  useEffect(() => {
    const validIds = assignableMembers.map((m) => m.id);
    setNewTaskAssigneeIds((prev) => {
      const filtered = prev.filter((id) => validIds.includes(id));
      if (filtered.length > 0) return filtered;
      return validIds[0] ? [validIds[0]] : [];
    });
  }, [selectedDeptId, selectedTeamId, roleMode, members.length]);

  // Adjust taskScope when switching roles so each role sees its valid default scope
  const handleRoleModeChange = (nextRole: WorkspaceRoleMode) => {
    setRoleMode(nextRole);
    if (nextRole === "Team Leader") {
      setTaskScope("team");
    } else if (nextRole === "Department Member") {
      setTaskScope("dept");
    } else {
      setTaskScope("dept");
    }
  };

  // Visibility Scopes:
  // 1. Department Tasks (all tasks belonging to this department OR assigned to a member of this department)
  const deptTasks = tasks.filter(
    (t) =>
      t.departmentId === selectedDeptId ||
      t.assignees.some((a) => deptMemberIds.has(a.memberId))
  );

  // 2. Cross-Department Tasks for Our Department Members (tasks from OTHER departments where at least one assignee is in selectedDeptId)
  const crossDeptTasksForDeptMembers = tasks.filter(
    (t) =>
      t.departmentId !== selectedDeptId &&
      t.assignees.some((a) => deptMemberIds.has(a.memberId))
  );

  // 3. Scientific Team Tasks (for Team Leader)
  const scientificTeamTasks = tasks.filter(
    (t) =>
      t.teamId === selectedTeamId ||
      t.assignees.some((a) => teamMemberIds.has(a.memberId))
  );

  // 4. All Club Tasks (ONLY accessible to Dept Manager & Co-Manager)
  const allClubTasks = tasks;

  const rawScopedTasks = (() => {
    if (isManagerOrCoManager) {
      if (taskScope === "all-club") return allClubTasks;
      if (taskScope === "other-dept-our-members")
        return crossDeptTasksForDeptMembers;
      return deptTasks;
    }
    if (isTeamLeader) {
      if (taskScope === "team") return scientificTeamTasks;
      if (taskScope === "other-dept-our-members")
        return crossDeptTasksForDeptMembers;
      return deptTasks;
    }
    // Department Member: can see all tasks of their department (each other's tasks)
    // and can see other department tasks ONLY if assigned to members of their department
    if (taskScope === "other-dept-our-members") {
      return crossDeptTasksForDeptMembers;
    }
    return deptTasks;
  })();

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

  const displayedTasks = taskViewTab === "active" ? activeTasks : doneTasks;

  const deptHeadMember = members.find(
    (m) => m.id === currentDept.headMemberId
  );
  const deptCoManagerMember = members.find(
    (m) => m.id === currentDept.coManagerMemberId
  );

  const openTaskScoringModal = (task: ClubTask) => {
    if (!canAssignTasks) return;
    setActiveTaskModal(task);
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
    if (!activeTaskModal) return;
    if (!feedbackNote.trim()) return;

    const targetAssignee =
      activeTaskModal.assignees[0]?.memberId || "mem-ayoub";

    const validatorLabel =
      roleMode === "Dept Manager"
        ? `${deptHeadMember?.fullName || "Lotfi Benali"} (Dept Manager)`
        : roleMode === "Co-Manager"
        ? `${deptCoManagerMember?.fullName || "Nesrine Khelifi"} (Co-Manager)`
        : `${currentMember.fullName} (Team Leader)`;

    validateAndScoreTask({
      taskId: activeTaskModal.id,
      memberId: targetAssignee,
      scoreType,
      awardedScore: customScore,
      feedback: feedbackNote.trim(),
      validatorName: validatorLabel,
    });

    setRestoredTaskIds((prev) =>
      prev.filter((id) => id !== activeTaskModal.id)
    );
    setToastBanner(
      `Validated "${activeTaskModal.title}" (+${customScore} XP · ${scoreType}) — Moved to Done & Old Tasks`
    );
    setActiveTaskModal(null);
  };

  const handleArchiveSingleTask = (task: ClubTask, e: React.MouseEvent) => {
    e.stopPropagation();
    archiveTask(task.id);
    setRestoredTaskIds((prev) => prev.filter((id) => id !== task.id));
    setToastBanner(`Archived task "${task.title}" to Done & Old Tasks`);
  };

  const handleRestoreSingleTask = (task: ClubTask, e: React.MouseEvent) => {
    e.stopPropagation();
    unarchiveTask(task.id);
    setRestoredTaskIds((prev) => Array.from(new Set([...prev, task.id])));
    setToastBanner(`Restored "${task.title}" back to Active Tasks`);
  };

  const handleArchiveAllCompleted = () => {
    archiveAllCompletedTasks();
    setRestoredTaskIds([]);
    setToastBanner("All completed tasks archived to Done & Old Tasks");
  };

  const toggleAssigneeSelection = (memberId: string) => {
    // Enforce strict department/team membership check
    if (!assignableMembers.some((m) => m.id === memberId)) return;
    setNewTaskAssigneeIds((prev) => {
      if (prev.includes(memberId)) {
        return prev.length > 1 ? prev.filter((id) => id !== memberId) : prev;
      }
      return [...prev, memberId];
    });
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAssignTasks) return;

    const cleanTitle =
      newTaskTitle.trim() ||
      (isTeamLeader
        ? `Prepare ${currentTeam.name} Lab Protocol`
        : `Coordinate ${currentDept.shortName} Operations`);

    // Strictly filter assignees to allowed scope (own department for Manager/Co-Manager, own team for Team Leader)
    const allowedIds = new Set(assignableMembers.map((m) => m.id));
    const safeAssigneeIds = newTaskAssigneeIds.filter((id) =>
      allowedIds.has(id)
    );
    const finalAssignees =
      safeAssigneeIds.length > 0
        ? safeAssigneeIds
        : assignableMembers[0]
        ? [assignableMembers[0].id]
        : ["mem-ayoub"];

    createTask({
      title: cleanTitle,
      description: isTeamLeader
        ? `Assigned by Team Leader (${currentTeam.name}) to team members.`
        : `Assigned by ${roleMode} in ${currentDept.name} to department members.`,
      category: newTaskCategory,
      departmentId: selectedDeptId,
      teamId: isTeamLeader ? selectedTeamId : undefined,
      deadline: newTaskDeadline,
      locationOrShift: newTaskLocation,
      proposedScore: newTaskScore,
      assigneeIds: finalAssignees,
    });

    const scopeLabel = isTeamLeader
      ? `${currentTeam.name} team`
      : `${currentDept.shortName} department`;
    setToastBanner(
      `Assigned [${newTaskCategory}] task "${cleanTitle}" (${newTaskScore} XP) to ${finalAssignees.length} ${scopeLabel} member(s)`
    );
    setNewTaskTitle("");
    setCreateTaskOpen(false);
    setTaskViewTab("active");
  };

  const handleSendQuickMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMessageTarget) return;
    const body =
      quickMsgText.trim() ||
      `Hi ${quickMessageTarget.fullName}, please sync with ${currentDept.shortName} leadership before Saturday's session.`;

    sendClubMessage({
      recipientScope: quickMessageTarget.fullName,
      priority: "Info",
      title: `${roleMode} Note · ${currentDept.shortName}`,
      body,
      inApp: true,
      email: false,
    });

    setToastBanner(`Sent message to ${quickMessageTarget.fullName}`);
    setQuickMsgText("");
    setQuickMessageTarget(null);
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

  const renderUrgencyPill = (
    label: ClubTask["urgencyLabel"],
    archived?: boolean
  ) => {
    if (archived) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
          Archived
        </span>
      );
    }
    if (label === "Today") {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold">
          Today
        </span>
      );
    }
    if (label === "2 days left") {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
          2 days left
        </span>
      );
    }
    if (label === "In progress") {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
          In progress
        </span>
      );
    }
    if (label === "Completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1D63EB] text-[10px] font-extrabold">
          <Check className="w-3 h-3" />
          <span>Validated</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
        <Check className="w-3 h-3" />
        <span>To do</span>
      </span>
    );
  };

  return (
    <MobileAppShell>
      {/* Scrollable Workspace Content */}
      <div className="flex-1 flex flex-col px-4 sm:px-5 pt-3 pb-6 space-y-3.5 animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight leading-tight">
              Department Workspace
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 font-sans mt-0.5">
              Peer Task Visibility, Scoped Assignment &amp; Operations
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {canAssignTasks && (
              <button
                type="button"
                onClick={() => {
                  setScanFeedback(null);
                  setScanModalOpen(true);
                }}
                title="Organizer Scan Member QR"
                className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1D63EB] text-xs font-bold font-display active:scale-[0.98] flex items-center gap-1 shadow-2xs transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
            )}
            <Link
              href="/notifications"
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-xs active:scale-[0.98] transition"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Department Operational Clearance & Identity Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#062456] via-[#0A3882] to-[#1258C7] text-white p-5 space-y-2 shadow-[0_12px_36px_rgba(6,36,86,0.18)] border border-white/20 animate-rise">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#38E4FF] flex items-center gap-1.5 font-display">
              <Shield className="w-4 h-4" />
              <span>{roleMode} Clearance</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold border border-white/20 font-display">
              {currentDept.shortName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-sky-100/90 font-medium leading-relaxed font-sans">
            {roleMode === "Dept Manager" || roleMode === "Co-Manager"
              ? `Operational management authority for ${currentDept.name} tasks, member assignments, and check-in rosters.`
              : roleMode === "Team Leader"
              ? `Scientific leadership for ${currentTeam.name} — reviewing peer research deliverables and team assignments.`
              : `Department peer transparency for ${currentDept.name} member tasks and collaborative projects.`}
          </p>
        </div>

        {/* Department & Scientific Team Selectors */}
        <div
          className={`grid gap-2.5 ${
            isTeamLeader ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
          }`}
        >
          <div className="relative">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              aria-label="Select Department"
              className="w-full appearance-none px-4 py-2.5 pr-9 rounded-full bg-white/80 backdrop-blur-md border border-white/90 text-xs font-black text-slate-900 shadow-2xs focus:outline-none focus:bg-white focus:border-[#1D63EB] transition-all"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  Dept: {dept.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {isTeamLeader && (
            <div className="relative">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                aria-label="Select Scientific Team"
                className="w-full appearance-none px-4 py-2.5 pr-9 rounded-full bg-indigo-50/80 backdrop-blur-md border border-indigo-200 text-xs font-black text-indigo-950 shadow-2xs focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
              >
                {teams
                  .filter((t) => !t.archived)
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      Team: {team.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="w-4 h-4 text-indigo-600 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>

        {/* Sub-Tabs: Overview | Members | Tasks | Teams */}
        <div className="grid grid-cols-4 gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-white/80 shadow-[0_2px_12px_rgba(9,25,47,0.04)]">
          {(["Overview", "Members", "Tasks", "Teams"] as ManagerSubTab[]).map(
            (tab) => {
              const active = subTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSubTab(tab)}
                  className={`py-2 rounded-full text-xs font-extrabold active:scale-[0.98] transition cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              );
            }
          )}
        </div>

        {/* Toast Banner */}
        {toastBanner && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs text-emerald-950 font-bold animate-rise">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastBanner(null)}
              className="text-emerald-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 4-Column KPI Strip */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] text-center">
            <span className="text-xl sm:text-2xl font-black font-display text-slate-900 block leading-tight tabular-nums">
              {deptMembers.length.toLocaleString()}
            </span>
            <span className="text-xs font-bold font-display text-slate-500 leading-tight block mt-1">
              Members
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] text-center">
            <span className="text-xl sm:text-2xl font-black font-display text-[#1D63EB] block leading-tight tabular-nums">
              {activeTasks.length.toLocaleString()}
            </span>
            <span className="text-xs font-bold font-display text-slate-500 leading-tight block mt-1">
              Active
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] text-center">
            <span className="text-xl sm:text-2xl font-black font-display text-indigo-700 block leading-tight tabular-nums">
              {crossDeptTasksForDeptMembers.length.toLocaleString()}
            </span>
            <span className="text-xs font-bold font-display text-slate-500 leading-tight block mt-1">
              Cross-Dept
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] text-center">
            <span className="text-xl sm:text-2xl font-black font-display text-emerald-700 block leading-tight tabular-nums">
              {(isManagerOrCoManager ? allClubTasks.length : deptTasks.length).toLocaleString()}
            </span>
            <span className="text-xs font-bold font-display text-slate-500 leading-tight block mt-1">
              {isManagerOrCoManager ? "All Club" : "Total"}
            </span>
          </div>
        </div>

        {/* TASKS & VISIBILITY SECTION */}
        {(subTab === "Overview" || subTab === "Tasks") && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  {taskScope === "all-club"
                    ? "All Club Tasks (Manager & Co-Manager View)"
                    : taskScope === "team"
                    ? `${currentTeam.name} · Team Tasks`
                    : taskScope === "other-dept-our-members"
                    ? `Other Dept Tasks (${currentDept.shortName} Members Only)`
                    : `${currentDept.shortName} · Department Tasks (Peer View)`}
                </h2>
                <p className="text-[10.5px] text-slate-500">
                  {isManagerOrCoManager
                    ? `Managers & Co-Managers can view all tasks club-wide, and assign tasks to ${currentDept.shortName} members.`
                    : isTeamLeader
                    ? `Team Leaders can view team/dept tasks and assign tasks strictly to ${currentTeam.name} members.`
                    : `Department members can see all ${currentDept.shortName} peer tasks and cross-dept tasks involving ${currentDept.shortName} members.`}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {canAssignTasks && (
                  <>
                    <button
                      type="button"
                      onClick={handleArchiveAllCompleted}
                      className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/80 hover:bg-white text-slate-700 text-[10.5px] font-bold active:scale-[0.98] flex items-center gap-1 shadow-[0_2px_8px_rgba(9,25,47,0.04)] transition cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5 text-slate-600" />
                      <span>Archive Completed</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateTaskOpen(true)}
                      className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white text-[11px] font-black active:scale-[0.98] flex items-center gap-1 shadow-[0_4px_14px_rgba(29,99,235,0.25)] transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>
                        {isTeamLeader
                          ? `Assign Team Task`
                          : `Assign ${currentDept.shortName} Task`}
                      </span>
                    </button>
                  </>
                )}
                {!canAssignTasks && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/80 text-slate-600 text-[10.5px] font-bold shadow-2xs">
                    <Eye className="w-3 h-3 text-[#1D63EB]" />
                    <span>Peer Transparency Mode</span>
                  </span>
                )}
              </div>
            </div>

            {/* Scope Filter Bar based on Role Rules */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {isTeamLeader && (
                <button
                  type="button"
                  onClick={() => setTaskScope("team")}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap border transition cursor-pointer flex items-center gap-1.5 ${
                    taskScope === "team"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                      : "bg-white/80 backdrop-blur-md text-slate-600 border-white/80 hover:bg-white"
                  }`}
                >
                  <Orbit className="w-3.5 h-3.5" />
                  <span>
                    My Team Tasks ({scientificTeamTasks.length})
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setTaskScope("dept")}
                className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap border transition cursor-pointer flex items-center gap-1.5 ${
                  taskScope === "dept"
                    ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white border-transparent shadow-[0_4px_12px_rgba(29,99,235,0.3)]"
                    : "bg-white/80 backdrop-blur-md text-slate-600 border-white/80 hover:bg-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>
                  {currentDept.shortName} Member Tasks ({deptTasks.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTaskScope("other-dept-our-members")}
                className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap border transition cursor-pointer flex items-center gap-1.5 ${
                  taskScope === "other-dept-our-members"
                    ? "bg-gradient-to-r from-[#094C9C] to-[#062456] text-white border-transparent shadow-[0_4px_12px_rgba(9,76,156,0.3)]"
                    : "bg-white/80 backdrop-blur-md text-slate-600 border-white/80 hover:bg-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>
                  Other Depts · {currentDept.shortName} Members Only (
                  {crossDeptTasksForDeptMembers.length})
                </span>
              </button>

              {isManagerOrCoManager && (
                <button
                  type="button"
                  onClick={() => setTaskScope("all-club")}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap border transition cursor-pointer flex items-center gap-1.5 ${
                    taskScope === "all-club"
                      ? "bg-[#061E47] text-[#38E4FF] border-[#061E47] shadow-[0_4px_12px_rgba(6,30,71,0.3)]"
                      : "bg-white/80 backdrop-blur-md text-slate-600 border-white/80 hover:bg-white"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>All Club Tasks ({allClubTasks.length})</span>
                </button>
              )}
            </div>

            {/* Category Filter Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {(["All", ...ALL_TASK_CATEGORIES] as const).map((cat) => {
                const active = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer ${
                      active
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white/80 backdrop-blur-md text-slate-600 border border-white/80 hover:bg-white"
                    }`}
                  >
                    {cat === "General" ? "General (All-Hands)" : cat}
                  </button>
                );
              })}
            </div>

            {/* Segmented Switcher for Active Tasks vs Done & Old Tasks */}
            <div className="grid grid-cols-2 gap-1.5 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-white/80 shadow-[0_2px_12px_rgba(9,25,47,0.04)]">
              <button
                type="button"
                onClick={() => setTaskViewTab("active")}
                className={`py-2 px-3 rounded-full text-xs font-black active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  taskViewTab === "active"
                    ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Active Tasks ({activeTasks.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTaskViewTab("done")}
                className={`py-2 px-3 rounded-full text-xs font-black active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  taskViewTab === "done"
                    ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Done &amp; Old Tasks ({doneTasks.length})</span>
              </button>
            </div>

            <div className="space-y-3">
              {displayedTasks.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 text-center space-y-1.5 shadow-[0_4px_20px_rgba(9,25,47,0.03)]">
                  <p className="text-xs font-bold text-slate-700">
                    {taskViewTab === "active"
                      ? "No active tasks in this view"
                      : "No completed or archived tasks in this view"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {taskScope === "other-dept-our-members"
                      ? `Only tasks from other departments that include a member of ${currentDept.shortName} appear here.`
                      : "Switch tabs or assign a new task to get started."}
                  </p>
                </div>
              ) : (
                displayedTasks.map((task) => {
                  const isDoneOrArchived =
                    !restoredTaskIds.includes(task.id) &&
                    (Boolean(task.archived) ||
                      task.urgencyLabel === "Completed");
                  const taskDept = departments.find(
                    (d) => d.id === task.departmentId
                  );
                  const isCrossDept = task.departmentId !== selectedDeptId;

                  return (
                    <div
                      key={task.id}
                      onClick={() => openTaskScoringModal(task)}
                      className={`p-4 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_6px_24px_rgba(9,25,47,0.05)] transition space-y-3 ${
                        canAssignTasks
                          ? "hover:border-blue-300 hover:shadow-[0_8px_28px_rgba(29,99,235,0.08)] active:scale-[0.99] cursor-pointer"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-6 h-6 mt-0.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isDoneOrArchived
                                ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-xs"
                                : "border-2 border-slate-300 bg-white"
                            }`}
                          >
                            {isDoneOrArchived && (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-extrabold uppercase ${
                                  task.category === "General"
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : "bg-sky-50 text-[#1D63EB] border border-sky-200"
                                }`}
                              >
                                {task.category}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold ${
                                  isCrossDept
                                    ? "bg-purple-50 text-purple-800 border border-purple-200"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {taskDept?.shortName || "Club"}
                                {isCrossDept ? " (Cross-Dept)" : ""}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9.5px] font-extrabold tabular-nums border border-emerald-200/60">
                                +{task.proposedScore} XP
                              </span>
                            </div>

                            <p
                              className={`text-xs font-extrabold mt-1.5 leading-snug ${
                                isDoneOrArchived
                                  ? "text-slate-500 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {task.title}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Due: {task.deadline} · {task.locationOrShift}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {renderUrgencyPill(task.urgencyLabel, task.archived)}
                          {canAssignTasks &&
                            (isDoneOrArchived ? (
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleRestoreSingleTask(task, e)
                                }
                                className="px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/80 hover:bg-blue-50 text-slate-700 hover:text-[#1D63EB] text-[10px] font-bold active:scale-[0.98] inline-flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                title="Restore task to Active Tasks"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleArchiveSingleTask(task, e)
                                }
                                className="px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/80 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-[10px] font-bold active:scale-[0.98] inline-flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                title="Archive task to Done & Old Tasks"
                              >
                                <Archive className="w-3 h-3" />
                                <span>Archive</span>
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* Peer Assignee Chips */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Assigned Members:
                          </span>
                          {task.assignees.map((a) => {
                            const memObj = members.find(
                              (m) => m.id === a.memberId
                            );
                            const isFromSelectedDept =
                              memObj?.departmentId === selectedDeptId;
                            return (
                              <span
                                key={a.memberId}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                                  isFromSelectedDept
                                    ? "bg-[#EBF3FC] text-[#094C9C] border-[#D4E4F7]"
                                    : "bg-slate-50 text-slate-700 border-slate-200"
                                }`}
                              >
                                {memObj?.avatarUrl && (
                                  <img
                                    src={memObj.avatarUrl}
                                    alt={a.memberName}
                                    className="w-3.5 h-3.5 rounded-full object-cover"
                                  />
                                )}
                                <span>{a.memberName}</span>
                                <span className="text-[9.5px] opacity-75">
                                  ({a.roleInTask} · {a.status})
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* DEPARTMENT MEMBERS ROSTER */}
        {(subTab === "Overview" || subTab === "Members") && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">
                {currentDept.shortName} Department Members ({deptMembers.length})
              </h2>
              <button
                type="button"
                onClick={() => setSubTab("Members")}
                className="text-xs font-bold text-[#1D63EB] flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {deptMembers.map((mem) => {
                const roleLabel = mem.roles.includes("Department Head")
                  ? "Dept Manager (Head)"
                  : mem.roles.includes("Co-Manager")
                  ? "Co-Manager"
                  : mem.roles.includes("Team Leader")
                  ? "Team Leader"
                  : mem.status;

                const memberTaskCount = tasks.filter(
                  (t) =>
                    !t.archived &&
                    t.assignees.some((a) => a.memberId === mem.id)
                ).length;

                return (
                  <div
                    key={mem.id}
                    className="p-3.5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={mem.avatarUrl}
                        alt={mem.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {mem.fullName}
                          </p>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                            {mem.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 tabular-nums">
                          {roleLabel} · {mem.xpTotal} XP · {memberTaskCount}{" "}
                          active task(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuickMessageTarget(mem)}
                        className="w-9 h-9 rounded-full bg-white/90 border border-slate-200/80 text-[#1D63EB] hover:bg-blue-50 active:scale-[0.98] flex items-center justify-center transition cursor-pointer shadow-2xs"
                        title={`Message ${mem.fullName}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SCIENTIFIC TEAMS SUB-TAB */}
        {subTab === "Teams" && (
          <div className="space-y-3 animate-rise">
            <h2 className="text-sm font-extrabold text-slate-900">
              Scientific Teams ({teams.filter((t) => !t.archived).length})
            </h2>
            {teams
              .filter((t) => !t.archived)
              .map((team) => {
                const sizeWarning =
                  team.memberIds.length < 5 || team.memberIds.length > 8;
                const leader = members.find(
                  (m) => m.id === team.leaderMemberId
                );
                return (
                  <div
                    key={team.id}
                    className="p-4 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-slate-900">
                          {team.name}
                        </span>
                        <p className="text-[10.5px] font-semibold text-indigo-700">
                          Team Leader: {leader?.fullName || "Assigned Lead"}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums border ${
                          sizeWarning
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-blue-50 text-[#1D63EB] border-blue-200"
                        }`}
                      >
                        {team.memberIds.length} members
                        {sizeWarning ? " (Size < 5)" : ""}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {team.description}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* MODAL 1: QUICK TASK VALIDATION & SCORING */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleValidateTaskSubmit}
            className="w-full max-w-[420px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(9,25,47,0.2)] space-y-4 animate-rise"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D63EB] text-[10px] font-extrabold uppercase border border-blue-200/60">
                  Quick Task Validation
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {activeTaskModal.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Assignee:{" "}
                  {activeTaskModal.assignees
                    .map((a) => a.memberName)
                    .join(", ")}{" "}
                  · Base Score: {activeTaskModal.proposedScore} XP
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Type Selector: Full / Partial / Bonus */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Validation Score Decision
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Full", "Partial", "Bonus"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      handleScoreTypeChange(t, activeTaskModal.proposedScore)
                    }
                    className={`py-2 rounded-full text-xs font-bold border active:scale-[0.98] transition cursor-pointer ${
                      scoreType === t
                        ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white border-transparent shadow-xs"
                        : "bg-white/80 backdrop-blur-md text-slate-700 border-slate-200/80 hover:bg-white"
                    }`}
                  >
                    {t} Score
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Awarded Points (Category Limit: 5–50 XP)
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={customScore}
                onChange={(e) => setCustomScore(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs font-extrabold text-slate-900 tabular-nums focus:bg-white focus:border-[#1D63EB] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Manager Feedback Note{" "}
                <span className="text-rose-600">(Required)</span>
              </label>
              <textarea
                rows={2}
                required
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Write constructive feedback for the member's ledger..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs text-slate-800 resize-none focus:bg-white focus:border-[#1D63EB] transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:opacity-95 active:scale-[0.98] text-white font-black text-xs shadow-[0_4px_16px_rgba(29,99,235,0.25)] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Validate &amp; Credit +{customScore} XP to Ledger</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL 2: ASSIGN DEPARTMENT OR SCIENTIFIC TEAM TASK */}
      {createTaskOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleCreateTaskSubmit}
            className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border border-white/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(9,25,47,0.2)] space-y-3.5 animate-rise"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D63EB] text-[10px] font-extrabold uppercase border border-blue-200/60">
                  <Lock className="w-3 h-3" />
                  <span>
                    {isTeamLeader
                      ? `Team Scope: ${currentTeam.name} Only`
                      : `Dept Scope: ${currentDept.shortName} Only`}
                  </span>
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {isTeamLeader
                    ? `Assign Scientific Team Task`
                    : `Assign Department Task`}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isTeamLeader
                    ? `As Team Leader, you can only assign tasks to members of ${currentTeam.name}.`
                    : `As ${roleMode}, you can only assign tasks to members of ${currentDept.name}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateTaskOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Coordinate General Assembly setup & check-in desk"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:border-[#1D63EB] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Category (incl. General)
                </label>
                <select
                  value={newTaskCategory}
                  onChange={(e) =>
                    setNewTaskCategory(e.target.value as TaskCategory)
                  }
                  className="w-full px-3 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#1D63EB] transition-all"
                >
                  {ALL_TASK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "General"
                        ? "General (All-Hands / Club)"
                        : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Score (5–50 XP)
                </label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={newTaskScore}
                  onChange={(e) => setNewTaskScore(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs font-bold text-slate-900 tabular-nums focus:bg-white focus:border-[#1D63EB] transition-all"
                />
              </div>
            </div>

            {/* Strictly Scoped Member Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {isTeamLeader
                    ? `${currentTeam.name} Members (${assignableMembers.length})`
                    : `${currentDept.shortName} Department Members (${assignableMembers.length})`}
                </label>
                <span className="text-[10px] font-bold text-[#1D63EB]">
                  {newTaskAssigneeIds.length} selected
                </span>
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
                className="max-h-36 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/60 p-2 space-y-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D63EB]/30"
              >
                {assignableMembers.map((m) => {
                  const selected = newTaskAssigneeIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      data-member-name={m.fullName}
                      data-member-id={m.id}
                      onClick={() => toggleAssigneeSelection(m.id)}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs font-bold transition cursor-pointer ${
                        selected
                          ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-xs"
                          : "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200/70"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={m.avatarUrl}
                          alt={m.fullName}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <span className="truncate">{m.fullName}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                          selected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {m.roles[0] || "Member"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Deadline
                </label>
                <input
                  type="text"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs text-slate-800 focus:bg-white focus:border-[#1D63EB] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Location / Shift
                </label>
                <input
                  type="text"
                  value={newTaskLocation}
                  onChange={(e) => setNewTaskLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs text-slate-800 focus:bg-white focus:border-[#1D63EB] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:opacity-95 text-white font-black text-xs active:scale-[0.98] transition cursor-pointer shadow-[0_4px_16px_rgba(29,99,235,0.25)]"
            >
              {isTeamLeader
                ? `Assign Task to ${newTaskAssigneeIds.length} Team Member(s)`
                : `Assign Task to ${newTaskAssigneeIds.length} ${currentDept.shortName} Member(s)`}
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: QUICK MESSAGE TO DEPARTMENT MEMBER */}
      {quickMessageTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleSendQuickMessage}
            className="w-full max-w-[420px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(9,25,47,0.2)] space-y-3.5 animate-rise"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Message {quickMessageTarget.fullName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {quickMessageTarget.quanterId} · {currentDept.shortName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickMessageTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={3}
              value={quickMsgText}
              onChange={(e) => setQuickMsgText(e.target.value)}
              placeholder={`Write an in-app note to ${quickMessageTarget.fullName}...`}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs text-slate-800 resize-none focus:bg-white focus:border-[#1D63EB] transition-all"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:opacity-95 text-white font-black text-xs active:scale-[0.98] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_4px_16px_rgba(29,99,235,0.25)]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Direct Notification</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL 4: ORGANIZER SCAN MEMBER QR */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(9,25,47,0.2)] space-y-4 animate-rise">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D63EB] text-[10px] font-extrabold uppercase border border-blue-200/60">
                  Organizer QR Scanner
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Organizer Scan Member QR
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setScanModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active Workshop Session
                </label>
                <select
                  value={scanWorkshopId}
                  onChange={(e) => setScanWorkshopId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#1D63EB] transition-all"
                >
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} (+{w.xpReward} XP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Member Personal QR Badge Scanned
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Press A–Z to jump
                  </span>
                </div>
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
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#1D63EB] transition-all"
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
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                {scanFeedback}
              </div>
            )}

            <button
              type="button"
              onClick={handleOrganizerQrScan}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:opacity-95 text-white font-black text-xs active:scale-[0.98] flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_4px_16px_rgba(29,99,235,0.25)]"
            >
              <QrCode className="w-4 h-4" />
              <span>Verify Member QR &amp; Record Attendance</span>
            </button>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
