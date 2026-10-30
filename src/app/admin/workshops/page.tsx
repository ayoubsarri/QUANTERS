"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Maximize2,
  Minimize2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import {
  ActivityTypeKey,
  FieldIconKey,
  Workshop,
  WorkshopLevel,
  WorkshopStatus,
} from "@/lib/types/erp";
import { ALL_FIELD_ICONS, FieldIcon, FIELD_CATEGORIES } from "@/components/shared/FieldIcon";
import {
  handleMemberSelectKeyDown,
  sortMembersByName,
} from "@/lib/utils/memberKeyboardJump";

const WORKSHOP_STATUSES: WorkshopStatus[] = [
  "Running",
  "Published",
  "Full / Waitlist",
  "Completed",
  "Draft",
  "Archived",
];

const CATEGORIES: Workshop["category"][] = [
  "Python",
  "Arduino",
  "Astronomy",
  "3D Printing",
  "Data Science",
  "AI",
  "Cybersecurity",
  "Quantum Physics",
  "Biotech & Lab",
  "UI/UX & Design",
  "Scientific Writing",
  "Robotics",
  "General",
];

const LEVELS: WorkshopLevel[] = ["Beginner", "Intermediate", "Advanced"];

export default function AdminWorkshopsPage() {
  const {
    workshops,
    members,
    badges,
    workshopCategories,
    addWorkshopCategory,
    updateWorkshopCategory,
    deleteWorkshopCategory,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    updateWorkshopStatus,
    rotateWorkshopQrCode,
    correctAttendance,
  } = useQuantersStore();

  const sortedMembers = useMemo(() => sortMembersByName(members), [members]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [projectorWorkshopId, setProjectorWorkshopId] = useState<string | null>(
    null
  );
  const [rosterWorkshopId, setRosterWorkshopId] = useState<string | null>(null);

  // Category management state
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingWorkshopCat, setEditingWorkshopCat] = useState<string | null>(null);
  const [editingWorkshopCatVal, setEditingWorkshopCatVal] = useState("");

  // Create form state
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState<ActivityTypeKey>("Workshop");
  const [category, setCategory] = useState<string>("Computer Science & Programming");
  const [iconType, setIconType] = useState<FieldIconKey>("python");
  const [level, setLevel] = useState<WorkshopLevel>("Beginner");
  const [instructor, setInstructor] = useState("");
  const [eventDate, setEventDate] = useState("2026-11-18");
  const [planningOpenDate, setPlanningOpenDate] = useState("2026-11-10");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("17:00");
  const [dateLabel, setDateLabel] = useState("18 Nov 2026");
  const [timeRange, setTimeRange] = useState("14:00 - 17:00");
  const [location, setLocation] = useState("Faculty of Sciences · Lab A1");
  const [capacity, setCapacity] = useState(30);
  const [xpReward, setXpReward] = useState(150);
  const [description, setDescription] = useState("");
  const [linkedBadgeId, setLinkedBadgeId] = useState<string>("badge-python");

  // Activity Icon Picker filter & search
  const [iconCategoryFilter, setIconCategoryFilter] = useState<string>("All");
  const [iconSearch, setIconSearch] = useState<string>("");

  // Edit Workshop state
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editActivityType, setEditActivityType] = useState<ActivityTypeKey>("Workshop");
  const [editCategory, setEditCategory] = useState<string>("Computer Science & Programming");
  const [editIconType, setEditIconType] = useState<FieldIconKey>("python");
  const [editLevel, setEditLevel] = useState<WorkshopLevel>("Beginner");
  const [editInstructor, setEditInstructor] = useState("");
  const [editEventDate, setEditEventDate] = useState("2026-11-18");
  const [editPlanningOpenDate, setEditPlanningOpenDate] = useState("2026-11-10");
  const [editStartTime, setEditStartTime] = useState("14:00");
  const [editEndTime, setEditEndTime] = useState("17:00");
  const [editLocation, setEditLocation] = useState("Faculty of Sciences · Lab A1");
  const [editCapacity, setEditCapacity] = useState(30);
  const [editXpReward, setEditXpReward] = useState(150);
  const [editDescription, setEditDescription] = useState("");
  const [editLinkedBadgeId, setEditLinkedBadgeId] = useState<string>("");
  const [editStatus, setEditStatus] = useState<WorkshopStatus>("Published");
  const [editIconCategoryFilter, setEditIconCategoryFilter] = useState<string>("All");
  const [editIconSearch, setEditIconSearch] = useState<string>("");

  // Delete Workshop state
  const [deletingWorkshop, setDeletingWorkshop] = useState<Workshop | null>(null);
  const [deleteIsPermanent, setDeleteIsPermanent] = useState(false);

  // Projector State
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Audited Attendance Correction
  const [correctionMemberId, setCorrectionMemberId] = useState<string>("");
  const [correctionStatus, setCorrectionStatus] = useState<
    "Present" | "Excused" | "Absent"
  >("Present");

  const projectorWorkshop =
    workshops.find((w) => w.id === projectorWorkshopId) || null;
  const rosterWorkshop =
    workshops.find((w) => w.id === rosterWorkshopId) || null;

  // Toggle Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Live amphi digital clock (Runs ONLY when Projector Display modal is active to prevent page re-renders)
  useEffect(() => {
    if (!projectorWorkshop) return;
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [projectorWorkshop]);

  // Lock body scroll when Projector Display is open
  useEffect(() => {
    if (projectorWorkshop) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [projectorWorkshop]);

  // Real Camera-Scannable QR Code Generation
  useEffect(() => {
    if (!projectorWorkshop) {
      setQrDataUrl("");
      return;
    }
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const checkinUrl = `${origin}/checkin?workshopId=${projectorWorkshop.id}&code=${projectorWorkshop.liveSixDigitCode}&token=${projectorWorkshop.liveQrToken}`;
    QRCode.toDataURL(checkinUrl, {
      margin: 1,
      width: 600,
      errorCorrectionLevel: "H",
      color: {
        dark: "#040D1A",
        light: "#FFFFFF",
      },
    })
      .then(setQrDataUrl)
      .catch((err) => {
        console.error("Failed to generate QR code", err);
      });
  }, [
    projectorWorkshop?.id,
    projectorWorkshop?.liveSixDigitCode,
    projectorWorkshop?.liveQrToken,
  ]);

  // Countdown & QR rotation
  useEffect(() => {
    if (!projectorWorkshopId) return;
    setSecondsLeft(30);
    const interval = setInterval(() => {
      let shouldRotate = false;
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          shouldRotate = true;
          return 30;
        }
        return prev - 1;
      });
      if (shouldRotate) {
        rotateWorkshopQrCode(projectorWorkshopId);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [projectorWorkshopId, rotateWorkshopQrCode]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: workshops.length };
    WORKSHOP_STATUSES.forEach((st) => {
      counts[st] = workshops.filter((w) => w.status === st).length;
    });
    return counts;
  }, [workshops]);

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((ws) => {
      const matchesSearch =
        ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || ws.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workshops, searchQuery, statusFilter]);

  const filteredIcons = useMemo(() => {
    return ALL_FIELD_ICONS.filter((f) => {
      const matchesCategory =
        iconCategoryFilter === "All" || f.category === iconCategoryFilter;
      const matchesSearch =
        !iconSearch ||
        f.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
        f.code.toLowerCase().includes(iconSearch.toLowerCase()) ||
        f.key.toLowerCase().includes(iconSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [iconCategoryFilter, iconSearch]);

  const selectedMeta = useMemo(() => {
    return ALL_FIELD_ICONS.find((f) => f.key === iconType) || ALL_FIELD_ICONS[0];
  }, [iconType]);

  const handleStatusChange = (ws: Workshop, nextStatus: WorkshopStatus) => {
    updateWorkshopStatus(ws.id, nextStatus);
    setStatusFilter(nextStatus);
    setStatusToast(
      `Moved '${ws.title}' to ${nextStatus} case`
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let computedDateLabel = dateLabel.trim() || "Upcoming";
    if (eventDate) {
      try {
        const parts = eventDate.split("-");
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          computedDateLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        }
      } catch {
        computedDateLabel = eventDate;
      }
    }
    const computedTimeRange = startTime && endTime ? `${startTime} - ${endTime}` : (timeRange.trim() || "14:00 - 17:00");

    createWorkshop({
      title: title.trim(),
      activityType,
      category,
      iconType,
      level,
      instructor: instructor.trim() || "QUANTA Instructor",
      dateLabel: computedDateLabel,
      timeRange: computedTimeRange,
      location: location.trim() || "Faculty of Sciences",
      capacity: Number(capacity) || 25,
      xpReward: Number(xpReward) || 120,
      description:
        description.trim() || "Scientific session with verified check-in.",
      linkedBadgeId: linkedBadgeId || undefined,
      status: "Published",
    });
    setCreateOpen(false);
    setStatusFilter("Published");
    setStatusToast(`Created '${title.trim()}' — Live in Members App!`);
    setTitle("");
    setDescription("");
  };

  const filteredEditIcons = useMemo(() => {
    return ALL_FIELD_ICONS.filter((f) => {
      const matchesCategory =
        editIconCategoryFilter === "All" || f.category === editIconCategoryFilter;
      const matchesSearch =
        !editIconSearch ||
        f.label.toLowerCase().includes(editIconSearch.toLowerCase()) ||
        f.code.toLowerCase().includes(editIconSearch.toLowerCase()) ||
        f.key.toLowerCase().includes(editIconSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [editIconCategoryFilter, editIconSearch]);

  const selectedEditMeta = useMemo(() => {
    return ALL_FIELD_ICONS.find((f) => f.key === editIconType) || ALL_FIELD_ICONS[0];
  }, [editIconType]);

  const openEditModal = (ws: Workshop) => {
    setEditingWorkshop(ws);
    setEditTitle(ws.title);
    setEditActivityType((ws.activityType as ActivityTypeKey) || "Workshop");
    setEditCategory(ws.category || "Computer Science & Programming");
    setEditIconType(ws.iconType || "python");
    setEditLevel(ws.level || "Beginner");
    setEditInstructor(ws.instructor || "");
    setEditEventDate(ws.eventDate || "2026-11-18");
    setEditPlanningOpenDate(ws.planningOpenDate || "2026-11-10");
    setEditStartTime(ws.startTime || "14:00");
    setEditEndTime(ws.endTime || "17:00");
    setEditLocation(ws.location || "Faculty of Sciences · Lab A1");
    setEditCapacity(ws.capacity || 30);
    setEditXpReward(ws.xpReward || 150);
    setEditDescription(ws.description || "");
    setEditLinkedBadgeId(ws.linkedBadgeId || "");
    setEditStatus(ws.status || "Published");
    setEditIconCategoryFilter("All");
    setEditIconSearch("");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop || !editTitle.trim()) return;

    let computedDateLabel = editingWorkshop.dateLabel;
    if (editEventDate) {
      try {
        const parts = editEventDate.split("-");
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          computedDateLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        }
      } catch {
        computedDateLabel = editEventDate;
      }
    }
    const computedTimeRange = `${editStartTime} - ${editEndTime}`;

    updateWorkshop(editingWorkshop.id, {
      title: editTitle.trim(),
      activityType: editActivityType,
      category: editCategory,
      iconType: editIconType,
      level: editLevel,
      instructor: editInstructor.trim() || "QUANTA Instructor",
      eventDate: editEventDate,
      planningOpenDate: editPlanningOpenDate,
      startTime: editStartTime,
      endTime: editEndTime,
      dateLabel: computedDateLabel,
      timeRange: computedTimeRange,
      location: editLocation.trim() || "Faculty of Sciences",
      capacity: Number(editCapacity) || 25,
      xpReward: Number(editXpReward) || 120,
      description: editDescription.trim() || "Scientific session with verified check-in.",
      linkedBadgeId: editLinkedBadgeId || undefined,
      status: editStatus,
    });

    setStatusToast(`Updated '${editTitle.trim()}' successfully!`);
    setEditingWorkshop(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingWorkshop) return;
    deleteWorkshop(deletingWorkshop.id, deleteIsPermanent);
    setStatusToast(
      deleteIsPermanent
        ? `Permanently deleted '${deletingWorkshop.title}' from database`
        : `Archived '${deletingWorkshop.title}'`
    );
    setDeletingWorkshop(null);
  };

  const getStatusBadgeStyle = (status: WorkshopStatus) => {
    switch (status) {
      case "Running":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "Published":
        return "bg-sky-50 text-[#0284C7] border-sky-300";
      case "Completed":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Full / Waitlist":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "Draft":
        return "bg-slate-100 text-slate-600 border-slate-300";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const renderWorkshopRows = (list: Workshop[]) =>
    list.map((ws) => {
      const checkedInCount = ws.attendanceRecords.filter(
        (r) => r.status === "Present"
      ).length;
      const enrolled =
        ws.registeredMemberIds?.length ?? ws.capacity - ws.seatsLeft;
      const pct = Math.min(
        100,
        Math.round((enrolled / (ws.capacity || 1)) * 100)
      );

      return (
        <tr key={ws.id} className="hover:bg-[#F8FAFD] transition-colors">
          {/* Workshop Info */}
          <td className="py-3.5 px-4">
            <div className="flex items-start gap-3">
              <FieldIcon
                field={ws.iconType || ws.category}
                size={28}
                boxed
              />
              <div className="min-w-0">
                <div className="font-extrabold text-[#0F1E36] leading-snug">
                  {ws.title}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold bg-[#F0F6FF] text-[#0284C7]">
                    {ws.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {ws.level}
                  </span>
                </div>
              </div>
            </div>
          </td>

          {/* Instructor & Schedule */}
          <td className="py-3.5 px-4 text-slate-600">
            <div className="font-bold text-slate-800">{ws.instructor}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              {ws.dateLabel} · {ws.timeRange}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {ws.location}
            </div>
          </td>

          {/* Capacity */}
          <td className="py-3.5 px-4">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 mb-1">
              <span>
                {enrolled}/{ws.capacity}
              </span>
              <span className="text-slate-400 text-[10px]">
                {ws.seatsLeft} left
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1D63EB] to-[#29D2FF]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
              {checkedInCount} checked-in
            </div>
          </td>

          {/* XP Reward */}
          <td className="py-3.5 px-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50/90 text-emerald-700 border border-emerald-200/80 font-mono text-[11px] font-semibold tabular-nums whitespace-nowrap">
              +{ws.xpReward} XP
            </span>
          </td>

          {/* Status Case Selector */}
          <td className="py-3.5 px-4">
            <select
              value={ws.status}
              onChange={(e) =>
                handleStatusChange(ws, e.target.value as WorkshopStatus)
              }
              aria-label={`Change status for ${ws.title}`}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${getStatusBadgeStyle(
                ws.status
              )}`}
            >
              {WORKSHOP_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </td>

          {/* Actions */}
          <td className="py-3.5 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setProjectorWorkshopId(ws.id)}
                title="Open Projector Display"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Maximize2 className="w-3 h-3 text-[#38E4FF]" />
                <span className="hidden xl:inline">Projector</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRosterWorkshopId(ws.id);
                  setCorrectionMemberId(sortedMembers[0]?.id || "");
                }}
                title="View & manage attendance roster"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <Users className="w-3 h-3 text-[#0284C7]" />
                <span>Roster ({ws.attendanceRecords.length})</span>
              </button>

              <button
                type="button"
                onClick={() => openEditModal(ws)}
                title="Edit Workshop details"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/90 text-xs font-bold transition cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-amber-600" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeletingWorkshop(ws);
                  setDeleteIsPermanent(false);
                }}
                title="Delete or Archive Workshop"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>Delete</span>
              </button>
            </div>
          </td>
        </tr>
      );
    });

  return (
    <>
      <div className="space-y-4 max-w-[1500px] mx-auto">
        {/* Top Header — Member App Editorial Style */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
              LABORATORY &amp; SESSION OPERATIONS
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
              Workshops &amp; Activities
            </h1>
            <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
              Schedule sessions, manage lifecycle status cases, and launch live projector QR screens.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workshop</span>
          </button>
        </div>

        {/* Status Transition Confirmation Toast */}
        {statusToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusToast}</span>
            </div>
            <div className="flex items-center gap-2">
              {statusFilter !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("All");
                    setStatusToast(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-[11px] font-extrabold cursor-pointer"
                >
                  View All Cases ({workshops.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setStatusToast(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Status Case Tabs & Search Bar */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Status Case Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStatusFilter("All")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  statusFilter === "All"
                    ? "bg-[#182C4E] text-white shadow-xs"
                    : "bg-[#F4F7FB] text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                All Cases ({statusCounts.All})
              </button>
              {WORKSHOP_STATUSES.map((st) => {
                const isSelected = statusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#182C4E] text-white shadow-xs"
                        : "bg-[#F4F7FB] text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    <span>{st}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      {statusCounts[st] || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[230px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, instructor, or lab..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl focus:outline-none focus:border-[#182C4E]"
              />
            </div>
          </div>
        </div>

        {/* Workshops Grouped by Status Case (when All) or Single Status Case Table */}
        {statusFilter === "All" ? (
          <div className="space-y-4">
            {WORKSHOP_STATUSES.map((caseStatus) => {
              const caseItems = filteredWorkshops.filter(
                (w) => w.status === caseStatus
              );
              if (caseItems.length === 0) return null;

              return (
                <div
                  key={caseStatus}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
                >
                  <div className="px-4 py-2.5 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getStatusBadgeStyle(
                          caseStatus
                        )}`}
                      >
                        {caseStatus}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {caseItems.length} session{caseItems.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStatusFilter(caseStatus)}
                      className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                    >
                      Open {caseStatus} Case →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/90 bg-white text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          <th className="py-2.5 px-4 min-w-[240px]">Workshop</th>
                          <th className="py-2.5 px-4 min-w-[180px]">
                            Instructor &amp; Schedule
                          </th>
                          <th className="py-2.5 px-4 min-w-[140px]">Capacity</th>
                          <th className="py-2.5 px-4 min-w-[120px]">XP Reward</th>
                          <th className="py-2.5 px-4 min-w-[140px]">Status Case</th>
                          <th className="py-2.5 px-4 text-right min-w-[210px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2EDF8] text-xs">
                        {renderWorkshopRows(caseItems)}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getStatusBadgeStyle(
                    statusFilter as WorkshopStatus
                  )}`}
                >
                  {statusFilter} Case
                </span>
                <span className="text-xs font-bold text-slate-600">
                  ({filteredWorkshops.length} session
                  {filteredWorkshops.length === 1 ? "" : "s"})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStatusFilter("All")}
                className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
              >
                Show All Cases
              </button>
            </div>

            {filteredWorkshops.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No workshops currently in the <strong>{statusFilter}</strong> case.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/90 bg-white text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 min-w-[240px]">Workshop</th>
                      <th className="py-3 px-4 min-w-[180px]">
                        Instructor &amp; Schedule
                      </th>
                      <th className="py-3 px-4 min-w-[140px]">Capacity</th>
                      <th className="py-3 px-4 min-w-[120px]">XP Reward</th>
                      <th className="py-3 px-4 min-w-[140px]">Status Case</th>
                      <th className="py-3 px-4 text-right min-w-[210px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EDF8] text-xs">
                    {renderWorkshopRows(filteredWorkshops)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* FULL-SCREEN PROJECTOR DISPLAY & VIEWPORT-CENTERED MODALS              */}
      {/* ===================================================================== */}

      {projectorWorkshop && (
        <div className="fixed inset-0 z-[200] w-full h-dvh overflow-hidden bg-[#030712] text-white flex flex-col justify-between p-3 sm:p-5 lg:p-7 select-none">
          {/* Subtle Ambient Cosmic Glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1D63EB]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#38E4FF]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 sm:pb-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>AMPHITHEATER LIVE SESSION</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-sky-300">
                <Sparkles className="w-3.5 h-3.5 text-[#38E4FF]" />
                <span>+{projectorWorkshop.xpReward} XP REWARD</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                <span>{projectorWorkshop.category}</span>
                <span className="text-white/20">·</span>
                <span>{projectorWorkshop.level}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block font-mono text-xs text-slate-400 tracking-wider">
                {currentTime}
              </span>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-[#38E4FF]" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#38E4FF]" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setProjectorWorkshopId(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:border-rose-400/40 text-white text-xs font-bold border border-white/15 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* 2-Column Main Stage — Zero-Scroll Mobile & Desktop Fit */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center my-auto max-w-6xl w-full mx-auto max-h-[82vh]">
            {/* Left 7 Cols */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FieldIcon field={projectorWorkshop.iconType} size={18} colored />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#38E4FF] font-bold">
                    QUANTA WORKSHOP · ATTENDANCE VERIFICATION
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] line-clamp-2">
                  {projectorWorkshop.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-semibold">
                  <Users className="w-3.5 h-3.5 text-[#38E4FF]" />
                  <span>{projectorWorkshop.instructor}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#38E4FF]" />
                  <span>{projectorWorkshop.location}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#38E4FF]" />
                  <span>
                    {projectorWorkshop.dateLabel} ({projectorWorkshop.timeRange})
                  </span>
                </span>
              </div>

              {/* 6-Digit Attendance Code Box */}
              <div className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/15 rounded-3xl p-4 sm:p-5 space-y-3 max-w-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    6-Digit Backup Code (Manual Entry)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      rotateWorkshopQrCode(projectorWorkshop.id);
                      setSecondsLeft(30);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-[#38E4FF] transition cursor-pointer border border-white/10"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Rotate Code</span>
                  </button>
                </div>

                <div className="py-2.5 sm:py-3.5 px-4 rounded-2xl bg-[#020710]/90 border border-[#38E4FF]/40 text-center shadow-[0_0_50px_rgba(56,228,255,0.18)]">
                  <span className="text-4xl sm:text-6xl lg:text-7xl font-mono font-black tracking-[0.25em] text-[#38E4FF] tabular-nums drop-shadow-[0_0_24px_rgba(56,228,255,0.5)]">
                    {projectorWorkshop.liveSixDigitCode}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Rotating security token refreshes in</span>
                    <span className="font-bold text-white tabular-nums">
                      {secondsLeft}s
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1D63EB] to-[#38E4FF] transition-all duration-1000"
                      style={{ width: `${(secondsLeft / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Attendance Counter & Live Stream */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-slate-300">
                    Checked-In:{" "}
                    <strong className="text-white text-sm font-black tabular-nums">
                      {
                        projectorWorkshop.attendanceRecords.filter(
                          (r) => r.status === "Present"
                        ).length
                      }
                    </strong>{" "}
                    / {projectorWorkshop.capacity} seats ({Math.round(
                      (projectorWorkshop.attendanceRecords.filter(
                        (r) => r.status === "Present"
                      ).length /
                        projectorWorkshop.capacity) *
                        100
                    )}%)
                  </span>
                </div>

                {/* Recent Check-Ins Feed */}
                <div className="text-xs text-slate-400 font-mono truncate">
                  {projectorWorkshop.attendanceRecords.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-400">Latest:</span>
                      <strong className="text-white">
                        {
                          members.find(
                            (m) =>
                              m.id ===
                              projectorWorkshop.attendanceRecords[
                                projectorWorkshop.attendanceRecords.length - 1
                              ].memberId
                          )?.fullName || "Member"
                        }
                      </strong>
                      <span className="text-slate-500">
                        (
                        {
                          projectorWorkshop.attendanceRecords[
                            projectorWorkshop.attendanceRecords.length - 1
                          ].checkedInAt
                        }
                        )
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Waiting for attendees to scan...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Giant High-Contrast Scannable QR Frame */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative group">
                {/* Glowing Aura */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1D63EB]/30 to-[#38E4FF]/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                {/* Pure White High-Contrast QR Card */}
                <div className="relative bg-white p-4 sm:p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center mx-auto border-4 border-white">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Session Check-In QR Code"
                      className="w-[min(38vh,270px)] h-[min(38vh,270px)] object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-[min(38vh,270px)] h-[min(38vh,270px)] flex items-center justify-center bg-slate-100 rounded-2xl">
                      <span className="text-xs font-mono text-slate-500">
                        Generating Real QR Code...
                      </span>
                    </div>
                  )}

                  <div className="mt-3 text-center">
                    <div className="font-mono text-xs font-black uppercase tracking-wider text-[#0A1628]">
                      SCAN WITH CAMERA OR QUANTERS APP
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Session Token: {projectorWorkshop.liveQrToken}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="relative z-10 border-t border-white/10 pt-2 sm:pt-3 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0 gap-2">
            <span className="truncate">
              QUANTA SCIENTIFIC CLUB · UNIVERSITY OF ALGIERS 1
            </span>
            <span className="hidden md:inline text-slate-500 text-[11px]">
              Tip: Press Fullscreen on projector screen for amphi presentation
            </span>
            <span className="shrink-0 text-slate-300 font-semibold">
              {projectorWorkshop.location}
            </span>
          </div>
        </div>
      )}

      {/* Roster & Attendance Modal */}
      {rosterWorkshop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[500px] bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-[#0F1E36]">
                  Attendance Roster · {rosterWorkshop.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {rosterWorkshop.attendanceRecords.length} records logged
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRosterWorkshopId(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {rosterWorkshop.attendanceRecords.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No attendance records yet for this session.
                </div>
              ) : (
                rosterWorkshop.attendanceRecords.map((rec) => {
                  const m = members.find((mem) => mem.id === rec.memberId);
                  return (
                    <div
                      key={rec.memberId}
                      className="py-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">
                          {m?.fullName || rec.memberId}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rec.checkedInAt}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {rec.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Manual Attendance Adjustment with Keyboard Letter Jump */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Manual Attendance Correction
                </span>
                <span className="text-[10px] text-slate-400">
                  Press A–Z to jump to member
                </span>
              </div>
              <div className="flex gap-2">
                <select
                  value={correctionMemberId}
                  onChange={(e) => setCorrectionMemberId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(
                      e,
                      sortedMembers,
                      correctionMemberId,
                      setCorrectionMemberId
                    )
                  }
                  className="flex-1 px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-800"
                >
                  {sortedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
                <select
                  value={correctionStatus}
                  onChange={(e) =>
                    setCorrectionStatus(
                      e.target.value as "Present" | "Excused" | "Absent"
                    )
                  }
                  className="px-2 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-bold"
                >
                  <option value="Present">Present</option>
                  <option value="Excused">Excused</option>
                  <option value="Absent">Absent</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!correctionMemberId) return;
                    correctAttendance(
                      rosterWorkshop.id,
                      correctionMemberId,
                      correctionStatus,
                      "Manual Admin Correction"
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#182C4E] text-white text-xs font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Workshop Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[500px] bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#0F1E36]">
                New Workshop / Activity
              </h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Neural Networks"
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) =>
                      setActivityType(e.target.value as ActivityTypeKey)
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Scientific Activity">Scientific Activity</option>
                    <option value="Lab Session">Lab Session</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Hackathon Prep">Hackathon Prep</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Linked Badge
                  </label>
                  <select
                    value={linkedBadgeId}
                    onChange={(e) => setLinkedBadgeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  >
                    <option value="">None</option>
                    {badges.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Activity Icon &amp; Domain
                  </label>
                  {/* Selected Preview Pill */}
                  {selectedMeta && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200/90 text-xs font-bold text-[#0284C7] shadow-2xs">
                      <div className={`w-4 h-4 rounded-md ${selectedMeta.bgTint} ${selectedMeta.textColor} flex items-center justify-center shrink-0`}>
                        <FieldIcon field={selectedMeta.key} size={12} colored />
                      </div>
                      <span className="font-semibold text-slate-800">{selectedMeta.label}</span>
                      <span className="text-[10px] font-mono text-sky-500">({selectedMeta.code})</span>
                    </span>
                  )}
                </div>

                {/* Category Filter Pills & Search */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                    {([ "All", ...FIELD_CATEGORIES ] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setIconCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                          iconCategoryFilter === cat
                            ? "bg-[#182C4E] text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat === "All" ? `All (${ALL_FIELD_ICONS.length})` : cat.split(" & ")[0]}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder="Search icon..."
                    className="w-28 sm:w-32 px-2 py-0.5 text-[11px] bg-white border border-slate-200/90 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                  />
                </div>

                {/* Grid of rich, labeled, domain-colored icon cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200/90 max-h-48 overflow-y-auto">
                  {filteredIcons.map((f) => {
                    const isSelected = iconType === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setIconType(f.key)}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? "bg-white border-[#0284C7] ring-2 ring-[#0284C7]/20 shadow-2xs"
                            : "bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg ${f.bgTint} ${f.textColor} border ${f.borderColor} flex items-center justify-center shrink-0`}
                        >
                          <FieldIcon field={f.key} size={15} colored />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[11px] font-bold truncate ${
                              isSelected ? "text-[#0F1E36]" : "text-slate-700"
                            }`}
                          >
                            {f.label}
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-400 truncate">
                            {f.code} · {f.category.split(" & ")[0]}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setManageCategoriesOpen(true)}
                      className="text-[10.5px] font-bold text-[#0284C7] hover:underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  >
                    {workshopCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as WorkshopLevel)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructor(s)
                </label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Instructor or speaker name"
                  className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                />
              </div>

              {/* Precise Date Pickers: Event Date + Planning Open Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Planning Open Date
                  </label>
                  <input
                    type="date"
                    value={planningOpenDate}
                    onChange={(e) => setPlanningOpenDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Precise Time Pickers: Start Hour & End Hour */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#182C4E] text-white text-xs font-bold cursor-pointer"
                >
                  Publish Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category CRUD Modal */}
      {manageCategoriesOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-rise">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Manage Workshop Categories
                </h3>
                <p className="text-xs text-slate-500">
                  Add, view, and delete workshop categories.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManageCategoriesOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category list */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {workshopCategories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  {editingWorkshopCat === cat ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <input
                        type="text"
                        value={editingWorkshopCatVal}
                        onChange={(e) => setEditingWorkshopCatVal(e.target.value)}
                        className="px-2 py-0.5 rounded-lg border border-slate-300 text-xs font-semibold w-full"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editingWorkshopCatVal.trim() && editingWorkshopCatVal.trim() !== cat) {
                            updateWorkshopCategory(cat, editingWorkshopCatVal.trim());
                          }
                          setEditingWorkshopCat(null);
                        }}
                        className="p-1 hover:text-emerald-700 text-emerald-600 cursor-pointer"
                        title="Save rename"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingWorkshopCat(null)}
                        className="p-1 hover:text-slate-700 text-slate-400 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-slate-800">{cat}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWorkshopCat(cat);
                            setEditingWorkshopCatVal(cat);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                          title="Rename category"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {workshopCategories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteWorkshopCategory(cat)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete category"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add new category form */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Add New Category
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Quantum & Optics Lab"
                  className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8]"
                />
                <button
                  type="button"
                  disabled={!newCategoryName.trim()}
                  onClick={() => {
                    if (!newCategoryName.trim()) return;
                    addWorkshopCategory(newCategoryName.trim());
                    setNewCategoryName("");
                  }}
                  className="h-9 px-3.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setManageCategoriesOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workshop Modal */}
      {editingWorkshop && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[540px] bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F1E36]">
                    Edit Workshop / Activity
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {editingWorkshop.id}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingWorkshop(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Workshop or activity title"
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl focus:outline-none focus:border-[#182C4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={editActivityType}
                    onChange={(e) =>
                      setEditActivityType(e.target.value as ActivityTypeKey)
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Scientific Activity">Scientific Activity</option>
                    <option value="Lab Session">Lab Session</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Hackathon Prep">Hackathon Prep</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Case
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as WorkshopStatus)
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-bold"
                  >
                    {WORKSHOP_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  >
                    {workshopCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Level
                  </label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value as WorkshopLevel)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Activity Icon &amp; Domain
                  </label>
                  {selectedEditMeta && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200/90 text-xs font-bold text-[#0284C7] shadow-2xs">
                      <div className={`w-4 h-4 rounded-md ${selectedEditMeta.bgTint} ${selectedEditMeta.textColor} flex items-center justify-center shrink-0`}>
                        <FieldIcon field={selectedEditMeta.key} size={12} colored />
                      </div>
                      <span className="font-semibold text-slate-800">{selectedEditMeta.label}</span>
                      <span className="text-[10px] font-mono text-sky-500">({selectedEditMeta.code})</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                    {(["All", ...FIELD_CATEGORIES] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditIconCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                          editIconCategoryFilter === cat
                            ? "bg-[#182C4E] text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat === "All" ? `All (${ALL_FIELD_ICONS.length})` : cat.split(" & ")[0]}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={editIconSearch}
                    onChange={(e) => setEditIconSearch(e.target.value)}
                    placeholder="Search icon..."
                    className="w-28 sm:w-32 px-2 py-0.5 text-[11px] bg-white border border-slate-200/90 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                  />
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  {filteredEditIcons.map((f) => {
                    const isSelected = editIconType === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setEditIconType(f.key)}
                        title={`${f.label} (${f.code}) · ${f.category}`}
                        className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white border-[#0284C7] ring-2 ring-[#0284C7]/20 shadow-sm"
                            : "bg-white/60 hover:bg-white border-slate-200/70 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg ${f.bgTint} ${f.textColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                          <FieldIcon field={f.key} size={16} colored />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-600 truncate w-full mt-1">
                          {f.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instructor & Linked Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instructor(s)
                  </label>
                  <input
                    type="text"
                    value={editInstructor}
                    onChange={(e) => setEditInstructor(e.target.value)}
                    placeholder="Instructor or speaker name"
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Linked Badge
                  </label>
                  <select
                    value={editLinkedBadgeId}
                    onChange={(e) => setEditLinkedBadgeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  >
                    <option value="">None</option>
                    {badges.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates & Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editEventDate}
                    onChange={(e) => setEditEventDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Planning Open Date
                  </label>
                  <input
                    type="date"
                    value={editPlanningOpenDate}
                    onChange={(e) => setEditPlanningOpenDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={editXpReward}
                    onChange={(e) => setEditXpReward(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingWorkshop(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-bold cursor-pointer hover:brightness-110 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Workshop Confirmation Modal */}
      {deletingWorkshop && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-rise">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F1E36]">
                    Delete Workshop
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {deletingWorkshop.id}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingWorkshop(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-xs font-black text-[#0F1E36]">
                {deletingWorkshop.title}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {deletingWorkshop.dateLabel} · {deletingWorkshop.timeRange} · {deletingWorkshop.location}
              </div>
              <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-600">
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-bold">
                  {deletingWorkshop.attendanceRecords.length} Attendance Records
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-bold">
                  {deletingWorkshop.registeredMemberIds?.length || 0} Registered Members
                </span>
              </div>
            </div>

            {/* Deletion Mode Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Select Action:
              </label>

              <button
                type="button"
                onClick={() => setDeleteIsPermanent(false)}
                className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  !deleteIsPermanent
                    ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/30"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  !deleteIsPermanent ? "border-amber-600 bg-amber-600" : "border-slate-300"
                }`}>
                  {!deleteIsPermanent && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950">
                    Archive Workshop (Recommended)
                  </div>
                  <div className="text-[11px] text-amber-800/80 leading-relaxed mt-0.5">
                    Hides the workshop from active mobile lists while preserving all attendance logs and member XP earned.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeleteIsPermanent(true)}
                className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  deleteIsPermanent
                    ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-300/30"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  deleteIsPermanent ? "border-rose-600 bg-rose-600" : "border-slate-300"
                }`}>
                  {deleteIsPermanent && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-950">
                    Permanently Delete from Database
                  </div>
                  <div className="text-[11px] text-rose-800/80 leading-relaxed mt-0.5">
                    Completely purges this workshop from cloud storage and state snapshots. This action cannot be undone.
                  </div>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingWorkshop(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition shadow-xs ${
                  deleteIsPermanent
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {deleteIsPermanent ? "Permanently Delete" : "Archive Workshop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
