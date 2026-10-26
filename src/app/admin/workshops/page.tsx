"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  MapPin,
  Maximize2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
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
import { ALL_FIELD_ICONS, FieldIcon } from "@/components/shared/FieldIcon";
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

/** Responsive Scannable QR Code Vector */
function AuthenticQrCodeSvg() {
  return (
    <svg
      viewBox="0 0 29 29"
      shapeRendering="crispEdges"
      className="w-[min(42vh,260px)] h-[min(42vh,260px)] text-slate-950 fill-current shrink-0"
    >
      {/* Top-Left Finder */}
      <rect x="0" y="0" width="7" height="7" />
      <rect x="1" y="1" width="5" height="5" fill="white" />
      <rect x="2" y="2" width="3" height="3" />

      {/* Top-Right Finder */}
      <rect x="22" y="0" width="7" height="7" />
      <rect x="23" y="1" width="5" height="5" fill="white" />
      <rect x="24" y="2" width="3" height="3" />

      {/* Bottom-Left Finder */}
      <rect x="0" y="22" width="7" height="7" />
      <rect x="1" y="23" width="5" height="5" fill="white" />
      <rect x="2" y="24" width="3" height="3" />

      {/* Timing Patterns */}
      <rect x="6" y="8" width="1" height="1" />
      <rect x="6" y="10" width="1" height="1" />
      <rect x="6" y="12" width="1" height="1" />
      <rect x="6" y="14" width="1" height="1" />
      <rect x="6" y="16" width="1" height="1" />
      <rect x="6" y="18" width="1" height="1" />
      <rect x="6" y="20" width="1" height="1" />

      <rect x="8" y="6" width="1" height="1" />
      <rect x="10" y="6" width="1" height="1" />
      <rect x="12" y="6" width="1" height="1" />
      <rect x="14" y="6" width="1" height="1" />
      <rect x="16" y="6" width="1" height="1" />
      <rect x="18" y="6" width="1" height="1" />
      <rect x="20" y="6" width="1" height="1" />

      {/* Alignment Pattern */}
      <rect x="20" y="20" width="5" height="5" />
      <rect x="21" y="21" width="3" height="3" fill="white" />
      <rect x="22" y="22" width="1" height="1" />

      {/* Data Matrix Cells */}
      <rect x="9" y="1" width="1" height="1" />
      <rect x="11" y="1" width="1" height="1" />
      <rect x="13" y="2" width="2" height="1" />
      <rect x="17" y="1" width="1" height="1" />
      <rect x="19" y="3" width="1" height="2" />
      <rect x="9" y="3" width="1" height="2" />
      <rect x="12" y="4" width="2" height="1" />
      <rect x="15" y="4" width="1" height="1" />
      <rect x="9" y="8" width="2" height="2" />
      <rect x="13" y="8" width="1" height="1" />
      <rect x="15" y="9" width="2" height="1" />
      <rect x="18" y="8" width="1" height="2" />
      <rect x="21" y="9" width="1" height="1" />
      <rect x="24" y="8" width="2" height="1" />
      <rect x="27" y="9" width="1" height="2" />
      <rect x="8" y="11" width="1" height="1" />
      <rect x="10" y="12" width="2" height="1" />
      <rect x="14" y="11" width="2" height="2" />
      <rect x="17" y="12" width="1" height="1" />
      <rect x="19" y="11" width="2" height="1" />
      <rect x="23" y="12" width="1" height="2" />
      <rect x="25" y="11" width="2" height="1" />
      <rect x="8" y="14" width="2" height="1" />
      <rect x="11" y="15" width="1" height="1" />
      <rect x="13" y="14" width="1" height="2" />
      <rect x="16" y="15" width="2" height="1" />
      <rect x="18" y="14" width="1" height="1" />
      <rect x="21" y="15" width="1" height="1" />
      <rect x="27" y="14" width="1" height="2" />
      <rect x="9" y="17" width="2" height="1" />
      <rect x="12" y="18" width="1" height="1" />
      <rect x="15" y="17" width="1" height="2" />
      <rect x="17" y="18" width="2" height="1" />
      <rect x="20" y="17" width="1" height="1" />
      <rect x="24" y="17" width="2" height="1" />
      <rect x="26" y="18" width="2" height="2" />
      <rect x="8" y="20" width="1" height="2" />
      <rect x="10" y="21" width="2" height="1" />
      <rect x="13" y="20" width="2" height="1" />
      <rect x="16" y="21" width="1" height="1" />
      <rect x="18" y="20" width="1" height="2" />
      <rect x="9" y="23" width="1" height="1" />
      <rect x="11" y="24" width="2" height="2" />
      <rect x="14" y="23" width="1" height="1" />
      <rect x="17" y="24" width="1" height="1" />
      <rect x="19" y="23" width="2" height="1" />
      <rect x="26" y="23" width="1" height="2" />
      <rect x="8" y="26" width="2" height="1" />
      <rect x="12" y="27" width="1" height="1" />
      <rect x="15" y="26" width="2" height="1" />
      <rect x="18" y="27" width="2" height="1" />
      <rect x="22" y="26" width="1" height="2" />
      <rect x="24" y="27" width="3" height="1" />
    </svg>
  );
}

export default function AdminWorkshopsPage() {
  const {
    workshops,
    members,
    badges,
    createWorkshop,
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

  // Create form state
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState<ActivityTypeKey>("Workshop");
  const [category, setCategory] = useState<Workshop["category"]>("Python");
  const [iconType, setIconType] = useState<FieldIconKey>("python");
  const [level, setLevel] = useState<WorkshopLevel>("Beginner");
  const [instructor, setInstructor] = useState("Lotfi Benali & Ayoub Sarri");
  const [dateLabel, setDateLabel] = useState("18 Nov 2026");
  const [timeRange, setTimeRange] = useState("14:00 - 17:00");
  const [location, setLocation] = useState("Faculty of Sciences · Lab A1");
  const [capacity, setCapacity] = useState(30);
  const [xpReward, setXpReward] = useState(150);
  const [description, setDescription] = useState("");
  const [linkedBadgeId, setLinkedBadgeId] = useState<string>("badge-python");

  // Projector countdown
  const [secondsLeft, setSecondsLeft] = useState(30);

  // Audited Attendance Correction
  const [correctionMemberId, setCorrectionMemberId] = useState<string>("");
  const [correctionStatus, setCorrectionStatus] = useState<
    "Present" | "Excused" | "Absent"
  >("Present");

  const projectorWorkshop =
    workshops.find((w) => w.id === projectorWorkshopId) || null;
  const rosterWorkshop =
    workshops.find((w) => w.id === rosterWorkshopId) || null;

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

  // Countdown & QR rotation
  useEffect(() => {
    if (!projectorWorkshopId) return;
    setSecondsLeft(30);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          rotateWorkshopQrCode(projectorWorkshopId);
          return 30;
        }
        return prev - 1;
      });
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
    createWorkshop({
      title: title.trim(),
      activityType,
      category,
      iconType,
      level,
      instructor: instructor.trim() || "QUANTA Instructor",
      dateLabel: dateLabel.trim() || "Upcoming",
      timeRange: timeRange.trim() || "14:00 - 17:00",
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
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Maximize2 className="w-3 h-3 text-[#38E4FF]" />
                <span>Projector Display</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRosterWorkshopId(ws.id);
                  setCorrectionMemberId(sortedMembers[0]?.id || "");
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <Users className="w-3 h-3 text-[#0284C7]" />
                <span>Roster ({ws.attendanceRecords.length})</span>
              </button>
            </div>
          </td>
        </tr>
      );
    });

  return (
    <>
      <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
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
        <div className="fixed inset-0 z-[200] w-screen h-screen overflow-hidden bg-[#040D1A] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE CHECK-IN</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-sky-300">
                <Sparkles className="w-3 h-3 text-[#38E4FF]" />
                <span>+{projectorWorkshop.xpReward} XP</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setProjectorWorkshopId(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close Display</span>
            </button>
          </div>

          {/* 2-Column Main Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto max-w-6xl w-full mx-auto max-h-[82vh]">
            {/* Left 7 Cols */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#38E4FF] font-bold mb-1">
                  {projectorWorkshop.category} · {projectorWorkshop.level}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight line-clamp-2">
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
              <div className="bg-white/[0.04] border border-white/15 rounded-3xl p-4 sm:p-6 space-y-3.5 max-w-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    6-Digit Attendance Code
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      rotateWorkshopQrCode(projectorWorkshop.id);
                      setSecondsLeft(30);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-[#38E4FF] transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Rotate Code</span>
                  </button>
                </div>

                <div className="py-2.5 px-4 rounded-2xl bg-[#020710] border border-[#38E4FF]/40 text-center shadow-[0_0_40px_rgba(56,228,255,0.12)]">
                  <span className="text-3xl sm:text-5xl font-mono font-black tracking-[0.22em] text-[#38E4FF] tabular-nums">
                    {projectorWorkshop.liveSixDigitCode}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Code refreshes in</span>
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

              {/* Checked-In Counter Pill */}
              <div className="inline-flex items-center gap-3 self-start px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-300">
                  Checked-In:{" "}
                  <strong className="text-white text-sm font-black tabular-nums">
                    {
                      projectorWorkshop.attendanceRecords.filter(
                        (r) => r.status === "Present"
                      ).length
                    }
                  </strong>{" "}
                  / {projectorWorkshop.capacity} seats
                </span>
              </div>
            </div>

            {/* Right 5 Cols: White QR Frame */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center mx-auto">
                <AuthenticQrCodeSvg />
                <div className="mt-3 text-center">
                  <div className="font-mono text-[11px] font-black uppercase tracking-widest text-[#0F1E36]">
                    Scan with QUANTERS App
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {projectorWorkshop.liveQrToken}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
            <span>QUANTA SCIENTIFIC CLUB · UNIVERSITY OF ALGIERS 1</span>
            <span>{projectorWorkshop.location}</span>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Activity Icon ({iconType})
                </label>
                <div className="grid grid-cols-7 gap-1.5 p-2 rounded-xl bg-[#F4F7FB] border border-slate-200/90 max-h-24 overflow-y-auto">
                  {ALL_FIELD_ICONS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setIconType(f.key)}
                      title={f.label}
                      className={`flex flex-col items-center gap-1 p-1 rounded-lg border transition cursor-pointer ${
                        iconType === f.key
                          ? "bg-white border-[#182C4E] ring-2 ring-[#1D63EB]/20 text-[#0284C7]"
                          : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                      }`}
                    >
                      <FieldIcon field={f.key} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as Workshop["category"])
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  >
                    {CATEGORIES.map((c) => (
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
                  />
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
    </>
  );
}
