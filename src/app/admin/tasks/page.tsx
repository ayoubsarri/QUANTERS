"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Kanban,
  Megaphone,
  Plus,
  Printer,
  RotateCcw,
  Table2,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ClubTask, TaskCategory, TaskStatus } from "@/lib/types/erp";
import {
  handleMemberListContainerKeyDown,
  sortMembersByName,
} from "@/lib/utils/memberKeyboardJump";

const TASK_CATEGORY_LIMITS: Record<TaskCategory, { min: number; max: number }> = {
  General: { min: 10, max: 35 },
  Logistics: { min: 10, max: 35 },
  Media: { min: 15, max: 40 },
  Scientific: { min: 20, max: 50 },
  Organisation: { min: 10, max: 35 },
  Sponsorship: { min: 20, max: 50 },
  Technical: { min: 15, max: 45 },
  "Workshop Prep": { min: 15, max: 40 },
  Documentation: { min: 10, max: 30 },
  "Community & HR": { min: 10, max: 35 },
  Design: { min: 15, max: 40 },
  Other: { min: 5, max: 30 },
};

const KANBAN_COLUMNS: TaskStatus[] = ["To do", "In progress", "Delivered", "Validated"];

export default function AdminTasksPage() {
  const tasks = useQuantersStore((s) => s.tasks);
  const members = useQuantersStore((s) => s.members);
  const departments = useQuantersStore((s) => s.departments);
  const teams = useQuantersStore((s) => s.teams);

  const createTask = useQuantersStore((s) => s.createTask);
  const validateAndScoreTask = useQuantersStore((s) => s.validateAndScoreTask);
  const publishTaskMatrix = useQuantersStore((s) => s.publishTaskMatrix);
  const archiveTask = useQuantersStore((s) => s.archiveTask);
  const unarchiveTask = useQuantersStore((s) => s.unarchiveTask);
  const archiveAllCompletedTasks = useQuantersStore((s) => s.archiveAllCompletedTasks);
  const bulkScoreMembers = useQuantersStore((s) => s.bulkScoreMembers);
  const confirmTaskReceipt = useQuantersStore((s) => s.confirmTaskReceipt);
  const deliverTask = useQuantersStore((s) => s.deliverTask);

  const [viewMode, setViewMode] = useState<"kanban" | "matrix">("kanban");
  const [lifecycleTab, setLifecycleTab] = useState<"active" | "archived" | "all">("active");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const createMemberListRef = useRef<HTMLDivElement>(null);
  const bulkMemberListRef = useRef<HTMLDivElement>(null);

  const sortedMembers = useMemo(() => sortMembersByName(members), [members]);

  // Validate & Score Modal state
  const [validatingItem, setValidatingItem] = useState<{
    task: ClubTask;
    memberId: string;
    memberName: string;
    proposedScore: number;
  } | null>(null);
  const [scoreType, setScoreType] = useState<"Full" | "Partial" | "Bonus">("Full");
  const [awardedScore, setAwardedScore] = useState<number>(25);
  const [feedback, setFeedback] = useState<string>("");

  // Create Task Modal state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Organisation");
  const [departmentId, setDepartmentId] = useState("dept-it");
  const [teamId, setTeamId] = useState<string>("team-astro");
  const [linkedWorkshopOrEvent] = useState("Python for Scientists");
  const [deadline, setDeadline] = useState("26 Oct 2026, 18:00");
  const [locationOrShift, setLocationOrShift] = useState("Faculty of Sciences · Lab A1");
  const [proposedScore, setProposedScore] = useState(25);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(["mem-ayoub"]);

  // Bulk Scoring state
  const [bulkMemberIds, setBulkMemberIds] = useState<string[]>(["mem-ayoub", "mem-sara"]);
  const [bulkPoints, setBulkPoints] = useState<number>(20);
  const [bulkReason, setBulkReason] = useState<string>(
    "Event Task Matrix completion — Workshop Logistics Shift"
  );

  // Global keyboard letter jump when Create Task or Bulk Score modal is open
  useEffect(() => {
    if (!createOpen && !bulkOpen) return;
    const handleGlobalLetterKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        ((target.tagName === "INPUT" && (target as HTMLInputElement).type !== "checkbox") ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      if (!e.key || e.key.length !== 1 || !/^[a-zA-Z]$/.test(e.key)) return;

      const container = createOpen
        ? createMemberListRef.current
        : bulkMemberListRef.current;
      if (!container) return;

      const letter = e.key.toLowerCase();
      const items = Array.from(
        container.querySelectorAll<HTMLElement>("[data-member-name]")
      );
      const matches = items.filter((el) =>
        (el.getAttribute("data-member-name") || "").trim().toLowerCase().startsWith(letter)
      );
      if (matches.length === 0) return;

      e.preventDefault();
      const activeEl = document.activeElement as HTMLElement | null;
      const currentIdx = matches.findIndex(
        (item) => item === activeEl || item.contains(activeEl)
      );
      const nextItem = matches[(currentIdx + 1) % matches.length];
      if (nextItem) {
        nextItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const focusable =
          nextItem.querySelector<HTMLElement>("input, button") || nextItem;
        focusable.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", handleGlobalLetterKey);
    return () => window.removeEventListener("keydown", handleGlobalLetterKey);
  }, [createOpen, bulkOpen]);

  const isTaskDoneOrArchived = (t: ClubTask) =>
    Boolean(t.archived) ||
    t.urgencyLabel === "Completed" ||
    (t.assignees.length > 0 && t.assignees.every((a) => a.status === "Validated"));

  const activeTasksCount = tasks.filter((t) => !t.archived).length;
  const archivedTasksCount = tasks.filter((t) => isTaskDoneOrArchived(t)).length;

  const filteredTasks = tasks.filter((t) => {
    if (deptFilter !== "All" && t.departmentId !== deptFilter) return false;
    if (lifecycleTab === "active") return !t.archived;
    if (lifecycleTab === "archived") return isTaskDoneOrArchived(t);
    return true;
  });

  const toggleAssignee = (id: string) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleBulkMember = (id: string) => {
    setBulkMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedAssigneeIds.length === 0) return;
    const limits = TASK_CATEGORY_LIMITS[category];
    const clampedScore = Math.max(limits.min, Math.min(limits.max, Number(proposedScore)));
    createTask({
      title: title.trim(),
      description: description.trim(),
      category,
      departmentId,
      teamId: teamId || undefined,
      linkedWorkshopOrEvent: linkedWorkshopOrEvent.trim() || undefined,
      deadline: deadline.trim() || "Upcoming",
      locationOrShift: locationOrShift.trim() || "Club Room",
      proposedScore: clampedScore,
      assigneeIds: selectedAssigneeIds,
    });
    setTitle("");
    setDescription("");
    setCreateOpen(false);
    setBannerMessage(
      `Task assigned to ${selectedAssigneeIds.length} member(s) with individual receipt and scoring tracking.`
    );
  };

  const openValidateModal = (
    task: ClubTask,
    memberId: string,
    memberName: string,
    propScore: number
  ) => {
    setValidatingItem({ task, memberId, memberName, proposedScore: propScore });
    setScoreType("Full");
    setAwardedScore(propScore);
    setFeedback("");
  };

  const handleScoreTypeChange = (type: "Full" | "Partial" | "Bonus") => {
    setScoreType(type);
    if (!validatingItem) return;
    if (type === "Full") setAwardedScore(validatingItem.proposedScore);
    if (type === "Partial") setAwardedScore(Math.max(5, Math.round(validatingItem.proposedScore * 0.6)));
    if (type === "Bonus") setAwardedScore(Math.min(50, validatingItem.proposedScore + 10));
  };

  const handleValidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatingItem || !feedback.trim()) return;
    validateAndScoreTask({
      taskId: validatingItem.task.id,
      memberId: validatingItem.memberId,
      scoreType,
      awardedScore: Number(awardedScore),
      feedback: feedback.trim(),
    });
    setBannerMessage(
      `Validated task for ${validatingItem.memberName} (+${awardedScore} XP · ${scoreType}).`
    );
    setValidatingItem(null);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkMemberIds.length === 0 || !bulkReason.trim()) return;
    bulkScoreMembers(bulkMemberIds, Number(bulkPoints), bulkReason.trim());
    setBulkOpen(false);
    setBannerMessage(
      `Bulk scored ${bulkMemberIds.length} members (+${bulkPoints} XP each).`
    );
  };

  const handlePublishAllMatrices = () => {
    tasks.forEach((t) => {
      if (!t.matrixPublished) publishTaskMatrix(t.id);
    });
    setBannerMessage("Event Task Matrix published to assigned members.");
  };

  const allLines = filteredTasks.flatMap((task) =>
    task.assignees.map((assignee) => ({
      task,
      assignee,
    }))
  );

  const limits = TASK_CATEGORY_LIMITS[category];

  return (
    <>
      <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2EDF8] shadow-sm">
          <div>
            <h1 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
              Tasks &amp; Operations Matrix
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Manage operational assignments, track deliverables, and validate scores
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                archiveAllCompletedTasks();
                setBannerMessage("Completed tasks moved to archive");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive Completed</span>
            </button>

            <button
              type="button"
              onClick={handlePublishAllMatrices}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-600" />
              <span>Publish Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#061E47] hover:bg-[#0A3780] text-white text-xs font-bold transition cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-[#FBB03B]" />
              <span>Bulk Score</span>
            </button>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {bannerMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bannerMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerMessage(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View Switcher, Lifecycle Segmented Tab Bar & Department Filter */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex p-1 rounded-xl bg-[#F4F7FB] border border-[#E2EDF8]">
              <button
                type="button"
                onClick={() => setLifecycleTab("active")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  lifecycleTab === "active"
                    ? "bg-[#1D63EB] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active Tasks ({activeTasksCount})
              </button>
              <button
                type="button"
                onClick={() => setLifecycleTab("archived")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  lifecycleTab === "archived"
                    ? "bg-[#1D63EB] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Done &amp; History ({archivedTasksCount})
              </button>
              <button
                type="button"
                onClick={() => setLifecycleTab("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  lifecycleTab === "all"
                    ? "bg-[#1D63EB] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Tasks ({tasks.length})
              </button>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-white text-[#1D63EB] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Kanban className="w-4 h-4" />
                <span>Kanban Board</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  viewMode === "matrix"
                    ? "bg-white text-[#1D63EB] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Table2 className="w-4 h-4" />
                <span>Task Matrix Table</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* VIEW 1: 4-COLUMN KANBAN BOARD */}
        {viewMode === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map((colStatus) => {
              const colItems = allLines.filter((item) => item.assignee.status === colStatus);

              return (
                <div
                  key={colStatus}
                  className="bg-slate-100/80 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col min-h-[460px]"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          colStatus === "To do"
                            ? "bg-slate-400"
                            : colStatus === "In progress"
                            ? "bg-[#1D63EB]"
                            : colStatus === "Delivered"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        {colStatus}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 tabular-nums">
                      {colItems.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {colItems.map(({ task, assignee }) => {
                      const dept = departments.find((d) => d.id === task.departmentId);
                      return (
                        <div
                          key={`${task.id}-${assignee.memberId}`}
                          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5 hover:border-[#1D63EB]/40 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-[#1D63EB] border border-sky-200/60">
                              {task.category} · {dept?.shortName || "Club"}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 tabular-nums whitespace-nowrap">
                              +{assignee.awardedScore ?? assignee.proposedScore} XP
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                              {task.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                              {task.description}
                            </p>
                          </div>

                          {/* Assignee & Receipt Status */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800">{assignee.memberName}</span>
                              <span className="text-[10.5px] text-slate-500">{assignee.roleInTask}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Receipt:</span>
                              {assignee.receiptConfirmed ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                  <Check className="w-3 h-3" /> Confirmed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => confirmTaskReceipt(task.id, assignee.memberId)}
                                  className="text-[#1D63EB] font-bold underline cursor-pointer"
                                >
                                  Confirm Receipt
                                </button>
                              )}
                            </div>
                            {assignee.proofUrlOrNote && (
                              <div className="text-[11px] text-slate-600 bg-white p-1.5 rounded-lg border border-slate-200">
                                <strong>Deliverable:</strong> {assignee.proofUrlOrNote}
                              </div>
                            )}
                            {assignee.managerFeedback && (
                              <div className="text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                                <strong>Feedback ({assignee.scoreType}):</strong>{" "}
                                {assignee.managerFeedback}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {task.deadline}
                            </span>
                            <span className="truncate max-w-[120px]">{task.locationOrShift}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-1 flex flex-wrap items-center gap-1.5">
                            {assignee.status === "In progress" && (
                              <button
                                type="button"
                                onClick={() =>
                                  deliverTask(
                                    task.id,
                                    assignee.memberId,
                                    "Submitted deliverable report & verified checklist."
                                  )
                                }
                                className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition cursor-pointer"
                              >
                                Mark Delivered
                              </button>
                            )}

                            {assignee.status !== "Validated" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openValidateModal(
                                    task,
                                    assignee.memberId,
                                    assignee.memberName,
                                    assignee.proposedScore
                                  )
                                }
                                className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                              >
                                Validate &amp; Score
                              </button>
                            )}

                            {task.archived ? (
                              <button
                                type="button"
                                onClick={() => {
                                  unarchiveTask(task.id);
                                  setBannerMessage(`Restored task '${task.title}' to Active Tasks.`);
                                }}
                                className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold transition cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  archiveTask(task.id);
                                  setBannerMessage(`Archived task '${task.title}' to History.`);
                                }}
                                className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-[11px] font-bold transition cursor-pointer"
                              >
                                <Archive className="w-3 h-3" />
                                Archive
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW 2: EVENT TASK MATRIX TABLE VIEW */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Event Task Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Member assignments, shift times, locations, receipt status, and validated scores
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
                {tasks.filter((t) => t.matrixPublished).length} / {tasks.length} Published
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Member</th>
                    <th className="py-3.5 px-4">Task &amp; Role</th>
                    <th className="py-3.5 px-4">Shift / Deadline</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Receipt</th>
                    <th className="py-3.5 px-4">Status &amp; Score</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {allLines.map(({ task, assignee }) => (
                    <tr key={`${task.id}-${assignee.memberId}`} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {assignee.memberName}
                        <div className="text-[11px] font-normal text-slate-500 flex items-center gap-1 mt-0.5">
                          {task.matrixPublished ? (
                            <>
                              <Megaphone className="w-3 h-3 text-amber-600" />
                              <span>Published</span>
                            </>
                          ) : (
                            "Draft"
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{task.title}</div>
                        <span className="text-xs text-[#1D63EB] font-medium">
                          {assignee.roleInTask} ({task.category})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 tabular-nums">
                        {task.deadline}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700">{task.locationOrShift}</td>
                      <td className="py-3.5 px-4">
                        {assignee.receiptConfirmed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {assignee.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 tabular-nums whitespace-nowrap">
                            +{assignee.awardedScore ?? assignee.proposedScore} XP
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {assignee.status === "Validated" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                              <Check className="w-3.5 h-3.5" /> Validated ({assignee.scoreType})
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                openValidateModal(
                                  task,
                                  assignee.memberId,
                                  assignee.memberName,
                                  assignee.proposedScore
                                )
                              }
                              className="px-3 py-1.5 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Validate &amp; Score
                            </button>
                          )}
                          {task.archived ? (
                            <button
                              type="button"
                              onClick={() => {
                                unarchiveTask(task.id);
                                setBannerMessage(`Restored task '${task.title}' to Active Tasks.`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                archiveTask(task.id);
                                setBannerMessage(`Archived task '${task.title}' to History.`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-bold cursor-pointer"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* VIEWPORT-CENTERED ROOT MODALS                                         */}
      {/* ===================================================================== */}

      {/* CREATE TASK MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#061E47] text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold">
                  Create Club Task &amp; Matrix Assignment
                </h2>
                <p className="text-xs text-sky-200 mt-0.5">
                  Assign task to one or more members (press any letter A–Z to jump to member names)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateTask}
              className="p-6 space-y-4 max-h-[82vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Setup Lab A1 Projector & Attendance Desk"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1D63EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const nextCat = e.target.value as TaskCategory;
                      setCategory(nextCat);
                      const lim = TASK_CATEGORY_LIMITS[nextCat];
                      setProposedScore(Math.max(lim.min, Math.min(lim.max, proposedScore)));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    {Object.keys(TASK_CATEGORY_LIMITS).map((c) => (
                      <option key={c} value={c}>
                        {c} ({TASK_CATEGORY_LIMITS[c as TaskCategory].min}–
                        {TASK_CATEGORY_LIMITS[c as TaskCategory].max} XP)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Proposed Score ({limits.min}–{limits.max} XP)
                  </label>
                  <input
                    type="number"
                    min={limits.min}
                    max={limits.max}
                    value={proposedScore}
                    onChange={(e) => setProposedScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Scientific Team (Optional)
                  </label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    <option value="">None</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Deadline / Shift Time
                  </label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Location / Post
                  </label>
                  <input
                    type="text"
                    value={locationOrShift}
                    onChange={(e) => setLocationOrShift(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Assign Members ({selectedAssigneeIds.length} selected) *
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      Tip: Press any key A–Z to jump to a name
                    </span>
                  </div>
                  <div
                    ref={createMemberListRef}
                    tabIndex={0}
                    onKeyDown={handleMemberListContainerKeyDown}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#1D63EB]"
                  >
                    {sortedMembers.map((m) => {
                      const checked = selectedAssigneeIds.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          data-member-name={m.fullName}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold cursor-pointer border transition focus-within:ring-2 focus-within:ring-[#1D63EB] ${
                            checked
                              ? "bg-blue-50 border-[#1D63EB] text-[#1D63EB]"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAssignee(m.id)}
                            className="rounded text-[#1D63EB]"
                          />
                          <span className="truncate">{m.fullName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Deliverable Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Clear instructions and expected deliverables..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1D63EB] hover:bg-blue-700 text-white cursor-pointer"
                >
                  Assign Task ({selectedAssigneeIds.length} Member(s))
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VALIDATE & SCORE MODAL */}
      {validatingItem && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#061E47] text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold">Validate &amp; Score Deliverable</h2>
                <p className="text-xs text-sky-200 mt-0.5">
                  {validatingItem.memberName} · {validatingItem.task.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValidatingItem(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleValidateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Select Validation Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Full", "Partial", "Bonus"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleScoreTypeChange(tier)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                        scoreType === tier
                          ? "bg-[#1D63EB] text-white border-[#1D63EB] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tier} Score
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Awarded XP Score (Proposed: {validatingItem.proposedScore} XP)
                </label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={awardedScore}
                  onChange={(e) => setAwardedScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-extrabold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Manager Feedback Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write feedback on quality and timeliness..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setValidatingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
                >
                  Approve &amp; Credit +{awardedScore} XP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK SCORING MODAL */}
      {bulkOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#061E47] text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold">Bulk Event &amp; Task Scoring</h2>
                <p className="text-xs text-sky-200 mt-0.5">
                  Score multiple shift members in one operation (press A–Z to jump to a name)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Select Participants ({bulkMemberIds.length} selected)
                </label>
                <div
                  ref={bulkMemberListRef}
                  tabIndex={0}
                  onKeyDown={handleMemberListContainerKeyDown}
                  className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#1D63EB]"
                >
                  {sortedMembers.map((m) => {
                    const checked = bulkMemberIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        data-member-name={m.fullName}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold cursor-pointer border transition focus-within:ring-2 focus-within:ring-[#1D63EB] ${
                          checked
                            ? "bg-blue-50 border-[#1D63EB] text-[#1D63EB]"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBulkMember(m.id)}
                        />
                        <span className="truncate">{m.fullName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  XP Points per Member
                </label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={bulkPoints}
                  onChange={(e) => setBulkPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason / Event Shift Name *
                </label>
                <input
                  type="text"
                  required
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1D63EB] hover:bg-blue-700 text-white cursor-pointer"
                >
                  Credit +{bulkPoints} XP to {bulkMemberIds.length} Members
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
