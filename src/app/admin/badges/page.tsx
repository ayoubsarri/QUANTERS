"use client";

import React, { useState } from "react";
import {
  Archive,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  FolderGit2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ALL_FIELD_ICONS, FieldIcon } from "@/components/shared/FieldIcon";
import { Badge, BadgeCategory, BadgeEarningMethod } from "@/lib/types/erp";
import {
  handleMemberListContainerKeyDown,
  handleMemberSelectKeyDown,
  sortMembersByName,
} from "@/lib/utils/memberKeyboardJump";

export default function AdminBadgesPage() {
  const badges = useQuantersStore((s) => s.badges);
  const exams = useQuantersStore((s) => s.exams);
  const projectSubmissions = useQuantersStore((s) => s.projectSubmissions);
  const members = useQuantersStore((s) => s.members);
  const badgeCategories = useQuantersStore((s) => s.badgeCategories);
  const addBadgeCategory = useQuantersStore((s) => s.addBadgeCategory);
  const deleteBadgeCategory = useQuantersStore((s) => s.deleteBadgeCategory);

  const createBadge = useQuantersStore((s) => s.createBadge);
  const awardBadgeManually = useQuantersStore((s) => s.awardBadgeManually);
  const revokeBadge = useQuantersStore((s) => s.revokeBadge);
  const deleteOrArchiveBadge = useQuantersStore((s) => s.deleteOrArchiveBadge);
  const reviewProjectSubmission = useQuantersStore((s) => s.reviewProjectSubmission);

  const [activeTab, setActiveTab] = useState<"library" | "exams" | "projects">("library");
  const [skillTypeFilter, setSkillTypeFilter] = useState<"All" | "Hard Skill" | "Soft Skill">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [banner, setBanner] = useState<string | null>(null);

  // Create Badge Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeSkillType, setNewBadgeSkillType] = useState<"Hard Skill" | "Soft Skill">("Hard Skill");
  const [newBadgeCategory, setNewBadgeCategory] = useState<BadgeCategory>("Science");
  const [newBadgeTone, setNewBadgeTone] = useState<Badge["borderTone"]>("blue");
  const [newBadgeIcon, setNewBadgeIcon] = useState("Telescope");
  const [newBadgeXp, setNewBadgeXp] = useState(120);
  const [newBadgeDesc, setNewBadgeDesc] = useState("");
  const [newBadgeCriteria, setNewBadgeCriteria] = useState("");
  const [newBadgeMethods, setNewBadgeMethods] = useState<BadgeEarningMethod[]>([
    "manual",
    "project",
  ]);

  // Assign Badge Manually Modal state
  const [assigningBadge, setAssigningBadge] = useState<Badge | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(["mem-ayoub"]);
  const [assignReason, setAssignReason] = useState(
    "Passed on-site practical circuit & code review in Lab A1."
  );

  // Revoke Badge Modal state
  const [revokingBadge, setRevokingBadge] = useState<Badge | null>(null);
  const [revokeMemberId, setRevokeMemberId] = useState<string>(members[0]?.id || "mem-ayoub");
  const [revokeReason, setRevokeReason] = useState("");

  // Online Exam Editor state
  const [examDuration, setExamDuration] = useState<number>(exams[0]?.durationMinutes || 60);
  const [examPassingScore, setExamPassingScore] = useState<number>(
    exams[0]?.passingScorePercent || 70
  );
  const [examMaxAttempts, setExamMaxAttempts] = useState<number>(exams[0]?.maxAttempts || 2);
  const [newMcqQuestion, setNewMcqQuestion] = useState("");
  const [extraQuestions, setExtraQuestions] = useState<
    { id: string; question: string; options: string[]; correctIndex: number }[]
  >([]);

  // Project Review Comment state
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({
    "sub-1":
      "Excellent Kepler/TESS light-curve detrending and transit depth calculation. Approved for Data Analysis badge!",
  });

  const sortedMembers = sortMembersByName(members);

  const toggleEarningMethod = (method: BadgeEarningMethod) => {
    setNewBadgeMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const toggleMemberSelect = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeName.trim()) return;
    createBadge({
      name: newBadgeName.trim(),
      category: newBadgeCategory,
      iconName: newBadgeIcon,
      borderTone: newBadgeTone,
      description:
        newBadgeDesc.trim() || "Official verified QUANTA scientific & technical skill badge.",
      criteriaText:
        newBadgeCriteria.trim() || "Complete the associated workshop and pass verification.",
      xpReward: Number(newBadgeXp) || 120,
      earningMethods: newBadgeMethods.length ? newBadgeMethods : ["manual"],
    });
    setNewBadgeName("");
    setNewBadgeDesc("");
    setNewBadgeCriteria("");
    setCreateOpen(false);
    setBanner("New Hexagonal Skill Badge added to the QUANTA Badge Library (0 awards — Deletable).");
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBadge || selectedMemberIds.length === 0 || !assignReason.trim()) return;
    awardBadgeManually(assigningBadge.id, selectedMemberIds, assignReason.trim());
    setBanner(
      `Assigned '${assigningBadge.name}' (+${assigningBadge.xpReward} XP) to ${selectedMemberIds.length} member(s) and triggered Milestone Celebration!`
    );
    setAssigningBadge(null);
  };

  const handleRevokeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingBadge || !revokeMemberId || !revokeReason.trim()) return;
    revokeBadge(revokingBadge.id, revokeMemberId, revokeReason.trim());
    setBanner(`Revoked '${revokingBadge.name}' with mandatory audit trail entry.`);
    setRevokingBadge(null);
    setRevokeReason("");
  };

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || "exam-astrophysics");
  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const allExamQuestions = [...(activeExam?.questions || []), ...extraQuestions];

  const filteredBadges = badges.filter((b) => {
    const isSoft =
      b.skillType === "Soft Skill" ||
      b.category === "Soft Skills" ||
      b.category === "Leadership" ||
      b.category === "Public Speaking" ||
      b.category === "Scientific Writing" ||
      b.category === "Logistics & Ops";
    const resolvedSkillType = isSoft ? "Soft Skill" : "Hard Skill";
    const matchesSkillType =
      skillTypeFilter === "All" || resolvedSkillType === skillTypeFilter;
    const matchesCategory =
      categoryFilter === "All" || b.category === categoryFilter;
    return matchesSkillType && matchesCategory;
  });

  const toneBadgeBox: Record<Badge["borderTone"], string> = {
    blue: "bg-[#071E3D] border-[#38E4FF]/60 shadow-[0_0_12px_rgba(56,228,255,0.18)]",
    cyan: "bg-[#052038] border-[#22D3EE]/60 shadow-[0_0_12px_rgba(34,211,238,0.18)]",
    gold: "bg-[#1D1908] border-[#FDE047]/60 shadow-[0_0_12px_rgba(250,204,21,0.2)]",
    purple: "bg-[#181036] border-[#C084FC]/60 shadow-[0_0_12px_rgba(192,132,252,0.18)]",
  };

  const categoryChipStyle: Record<string, string> = {
    Science: "bg-sky-50 text-[#0284C7] border-sky-200/80",
    Technology: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    "Soft Skills": "bg-amber-50 text-amber-800 border-amber-200/80",
    "Hard Skills": "bg-blue-50 text-blue-700 border-blue-200/80",
    Leadership: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    Club: "bg-purple-50 text-purple-700 border-purple-200/80",
    Programming: "bg-cyan-50 text-cyan-800 border-cyan-200/80",
    "Data & AI": "bg-violet-50 text-violet-800 border-violet-200/80",
    "Hardware & IoT": "bg-orange-50 text-orange-800 border-orange-200/80",
    "Scientific Writing": "bg-teal-50 text-teal-800 border-teal-200/80",
    "Public Speaking": "bg-yellow-50 text-yellow-800 border-yellow-200/80",
    "Logistics & Ops": "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <>
      <div className="space-y-3.5 max-w-[1500px] mx-auto animate-rise">
        {/* Header — Member App Editorial Style */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
              SKILL VERIFICATION &amp; ASSESSMENTS
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
              Badges &amp; Credentials
            </h1>
            <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
              Manage skill badges, online assessment exams, and student project reviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAssigningBadge(badges[0] || null);
                setSelectedMemberIds(["mem-ayoub"]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-[#38E4FF]" />
              <span>Award Manually</span>
            </button>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Badge</span>
            </button>
          </div>
        </div>

        {banner && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{banner}</span>
            </div>
            <button type="button" onClick={() => setBanner(null)} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3-Tab Switcher + Category Quick Filters */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "library"
                  ? "bg-[#182C4E] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Badge Library ({badges.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("exams")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "exams"
                  ? "bg-[#182C4E] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Exams Manager ({exams.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "projects"
                  ? "bg-[#182C4E] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Project Submissions ({projectSubmissions.length})</span>
            </button>
          </div>

          {activeTab === "library" && (
            <div className="flex flex-wrap items-center gap-2 pr-1">
              {/* Skill Type Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                {(["All", "Hard Skill", "Soft Skill"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSkillTypeFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      skillTypeFilter === st
                        ? "bg-white text-[#0284C7] shadow-xs"
                        : "text-slate-600 hover:text-[#0F1E36]"
                    }`}
                  >
                    {st === "All" ? "All Skills" : st === "Hard Skill" ? "Hard Skills" : "Soft Skills"}
                  </button>
                ))}
              </div>

              {/* Category Pills & CRUD */}
              <div className="flex flex-wrap items-center gap-1">
                {["All", ...badgeCategories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setManageCategoriesOpen(true)}
                  className="px-2 py-0.5 rounded-lg text-[10.5px] font-bold text-[#0284C7] bg-[#F0F6FF] hover:bg-[#E0EFFE] transition cursor-pointer"
                >
                  + Manage Categories
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: COMPACT BADGE LIBRARY (3-TO-4 COLUMN GRID) */}
        {activeTab === "library" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredBadges.map((badge) => {
              const canHardDelete = badge.awardedCount === 0;
              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#BFD9FB] transition flex flex-col justify-between ${
                    badge.archived ? "opacity-60 bg-slate-50/70" : ""
                  }`}
                >
                  <div>
                    {/* Top Row: Compact Emblem + Title + Category Chip + +XP Pill */}
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                          toneBadgeBox[badge.borderTone] || toneBadgeBox.blue
                        }`}
                      >
                        <FieldIcon field={`${badge.name} ${badge.iconName}`} size={22} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                categoryChipStyle[badge.category] || categoryChipStyle.Science
                              }`}
                            >
                              {badge.category}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {badge.skillType || (badge.category === "Soft Skills" || badge.category === "Leadership" ? "Soft" : "Hard")}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono text-[10.5px] font-bold tabular-nums whitespace-nowrap">
                            +{badge.xpReward} XP
                          </span>
                        </div>
                        <h3 className="font-extrabold text-[#0F1E36] text-xs leading-snug mt-1 truncate">
                          {badge.name}
                        </h3>
                      </div>
                    </div>

                    {/* Concise 2-line description */}
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {badge.description}
                    </p>

                    {/* Meta Pills: Awarded Count + Earning Methods */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 tabular-nums">
                          {badge.awardedCount} Awarded
                        </span>
                        {badge.archived && (
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800">
                            Archived
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {badge.earningMethods.map((m) => (
                          <span
                            key={m}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-indigo-50/80 text-indigo-700"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clean, compact bottom action bar with 3 tight buttons: Award, Revoke, Archive/Delete */}
                  <div className="flex items-center gap-1.5 pt-2.5 mt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAssigningBadge(badge);
                        setSelectedMemberIds(["mem-ayoub"]);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-[11px] font-bold transition cursor-pointer"
                    >
                      <Award className="w-3 h-3" />
                      <span>Award</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRevokingBadge(badge);
                        setRevokeReason("");
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                    >
                      Revoke
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        deleteOrArchiveBadge(
                          badge.id,
                          canHardDelete
                            ? "Deleted unused badge (0 awards)"
                            : "Archived badge to preserve historical member awards"
                        );
                        setBanner(
                          canHardDelete
                            ? `Deleted '${badge.name}' (had 0 awards).`
                            : `Archived '${badge.name}' (${badge.awardedCount} members keep their earned badge).`
                        );
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        canHardDelete
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      {canHardDelete ? (
                        <>
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-3 h-3" />
                          <span>Archive</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: ONLINE EXAMS MANAGER (COMPACT) */}
        {activeTab === "exams" && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-3.5">
              <div className="flex items-center gap-2.5">
                <label className="text-xs font-bold text-slate-700">Select Exam:</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200/90 bg-[#F4F7FB] text-xs font-bold text-slate-800"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} ({ex.level})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBanner(
                    `Saved Online Exam settings: ${examDuration} min duration, ${examPassingScore}% pass mark, ${examMaxAttempts} max attempts.`
                  )
                }
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Save Configuration
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">
                  Duration (Min)
                </label>
                <input
                  type="number"
                  value={examDuration}
                  onChange={(e) => setExamDuration(Number(e.target.value))}
                  className="w-20 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-extrabold tabular-nums text-right"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={examPassingScore}
                  onChange={(e) => setExamPassingScore(Number(e.target.value))}
                  className="w-20 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-extrabold tabular-nums text-emerald-700 text-right"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">
                  Max Attempts
                </label>
                <input
                  type="number"
                  value={examMaxAttempts}
                  onChange={(e) => setExamMaxAttempts(Number(e.target.value))}
                  className="w-20 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-extrabold tabular-nums text-right"
                />
              </div>
            </div>

            {/* MCQ Question Bank */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                MCQ Question Bank ({allExamQuestions.length} Active Questions)
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {allExamQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="font-bold text-xs text-[#0F1E36]">
                      Q{idx + 1}. {q.question}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={opt}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center justify-between ${
                            optIdx === q.correctIndex
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                              : "bg-white border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="truncate">
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {optIdx === q.correctIndex && (
                            <Check className="w-3 h-3 text-emerald-700 shrink-0 ml-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Quick Question */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  value={newMcqQuestion}
                  onChange={(e) => setNewMcqQuestion(e.target.value)}
                  placeholder="Add a new MCQ question to the exam bank..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newMcqQuestion.trim()) return;
                    setExtraQuestions((prev) => [
                      ...prev,
                      {
                        id: `q-custom-${Date.now()}`,
                        question: newMcqQuestion.trim(),
                        options: [
                          "Redshift spectroscopy",
                          "Radial velocity Doppler shift",
                          "Solar flare magnetometry",
                          "Cosmic microwave background",
                        ],
                        correctIndex: 1,
                      },
                    ]);
                    setNewMcqQuestion("");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  + Add Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECT SUBMISSIONS GRADING DESK (COMPACT) */}
        {activeTab === "projects" && (
          <div className="space-y-3.5">
            {projectSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200/80">
                      Target Badge: {sub.badgeTitle}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                        sub.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : sub.status === "Pending Review"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    Submitted: {sub.submittedAt}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-[#0F1E36]">{sub.projectTitle}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Submitted by <strong className="text-slate-800">{sub.memberName}</strong> · Team:{" "}
                    {sub.teamMembers.join(", ") || "Solo"}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{sub.description}</p>
                </div>

                {/* Repo & Files */}
                <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  {sub.repoUrl && (
                    <a
                      href={
                        /^https?:\/\//i.test(sub.repoUrl.trim())
                          ? sub.repoUrl.trim()
                          : "https://github.com"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#0284C7] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {sub.repoUrl}
                    </a>
                  )}
                  {sub.fileNames.map((fn) => (
                    <span
                      key={fn}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700"
                    >
                      <FileCode2 className="w-3 h-3 text-[#0284C7]" />
                      {fn}
                    </span>
                  ))}
                </div>

                {/* Reviewer Comment & Grading Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-2.5 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={reviewComments[sub.id] ?? sub.reviewerComment ?? ""}
                    onChange={(e) =>
                      setReviewComments((prev) => ({ ...prev, [sub.id]: e.target.value }))
                    }
                    placeholder="Write technical review feedback..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  />

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        reviewProjectSubmission(
                          sub.id,
                          "Rejected",
                          reviewComments[sub.id] || "Does not meet reproducibility criteria."
                        );
                        setBanner(`Project '${sub.projectTitle}' marked as Rejected.`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        reviewProjectSubmission(
                          sub.id,
                          "Revision Requested",
                          reviewComments[sub.id] || "Please include uncertainty error bars on plot 2."
                        );
                        setBanner(`Requested revision for '${sub.projectTitle}'.`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer"
                    >
                      Request Revision
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        reviewProjectSubmission(
                          sub.id,
                          "Approved",
                          reviewComments[sub.id] || "Approved! High-precision analysis."
                        );
                        setBanner(
                          `Approved '${sub.projectTitle}' — Minted '${sub.badgeTitle}' Badge + XP to ${sub.memberName}!`
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Approve (Mint Badge + XP)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE BADGE MODAL (outside .animate-rise for centered viewport popup) */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold">New Skill Badge</h2>
                <p className="text-xs text-sky-200">
                  Configure badge details, category, and earning path
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

            <form onSubmit={handleCreateBadge} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Badge Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  placeholder="e.g. Quantum Computing Foundations"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-[#F4F7FB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Skill Type
                  </label>
                  <select
                    value={newBadgeSkillType}
                    onChange={(e) =>
                      setNewBadgeSkillType(e.target.value as "Hard Skill" | "Soft Skill")
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-[#F4F7FB]"
                  >
                    <option value="Hard Skill">Hard Skill</option>
                    <option value="Soft Skill">Soft Skill</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newBadgeCategory}
                    onChange={(e) => setNewBadgeCategory(e.target.value as BadgeCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-[#F4F7FB]"
                  >
                    {badgeCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Frame Color
                  </label>
                  <select
                    value={newBadgeTone}
                    onChange={(e) => setNewBadgeTone(e.target.value as Badge["borderTone"])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-[#F4F7FB]"
                  >
                    <option value="blue">Cobalt Blue</option>
                    <option value="gold">Solar Gold</option>
                    <option value="cyan">Electric Cyan</option>
                    <option value="purple">Nebula Purple</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    step={10}
                    value={newBadgeXp}
                    onChange={(e) => setNewBadgeXp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold tabular-nums bg-[#F4F7FB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Badge Icon
                </label>
                <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-slate-50 border border-slate-200 max-h-40 overflow-y-auto">
                  {ALL_FIELD_ICONS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setNewBadgeIcon(f.key)}
                      title={f.label}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition ${
                        newBadgeIcon === f.key
                          ? "bg-[#F0F6FF] border-[#182C4E] ring-2 ring-[#1D63EB]/20"
                          : "bg-white border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <FieldIcon field={f.key} size={22} />
                      <span className="text-[9px] font-bold text-slate-700 truncate w-full text-center">
                        {f.label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Allowed Earning Methods
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["exam", "project", "manual", "automatic"] as BadgeEarningMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleEarningMethod(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border uppercase ${
                        newBadgeMethods.includes(m)
                          ? "bg-[#182C4E] text-white border-[#182C4E]"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description &amp; Criteria
                </label>
                <textarea
                  rows={2}
                  value={newBadgeDesc}
                  onChange={(e) => setNewBadgeDesc(e.target.value)}
                  placeholder="Describe the skill certified by this badge..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white"
                >
                  Create Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN BADGE MANUALLY MODAL */}
      {assigningBadge && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FBB03B]" />
                <div>
                  <h2 className="text-lg font-extrabold">
                    Assign Badge Manually — {assigningBadge.name}
                  </h2>
                  <p className="text-xs text-sky-200">
                    Awards +{assigningBadge.xpReward} XP and logs verification proof in Audit Trail
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningBadge(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Badge
                </label>
                <select
                  value={assigningBadge.id}
                  onChange={(e) => {
                    const found = badges.find((b) => b.id === e.target.value);
                    if (found) setAssigningBadge(found);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                >
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (+{b.xpReward} XP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Select Recipients ({selectedMemberIds.length} selected)
                  </label>
                  <span className="text-[10px] font-semibold text-[#0284C7]">
                    Press A–Z to jump to name
                  </span>
                </div>
                <div
                  tabIndex={0}
                  onKeyDown={(e) =>
                    handleMemberListContainerKeyDown(e, sortedMembers, toggleMemberSelect)
                  }
                  className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D63EB]/30"
                >
                  {sortedMembers.map((m) => {
                    const checked = selectedMemberIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        data-member-name={m.fullName}
                        data-member-id={m.id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold cursor-pointer border ${
                          checked
                            ? "bg-blue-50 border-[#182C4E] text-[#0284C7]"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMemberSelect(m.id)}
                        />
                        <span className="truncate">{m.fullName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mandatory Verification Reason / Proof Note *
                </label>
                <textarea
                  rows={2}
                  required
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningBadge(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white"
                >
                  Mint Badge &amp; Credit +{assigningBadge.xpReward} XP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOKE BADGE MODAL */}
      {revokingBadge && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Revoke Badge — {revokingBadge.name}</h2>
                <p className="text-xs text-rose-200">Requires mandatory audit trail reason</p>
              </div>
              <button
                type="button"
                onClick={() => setRevokingBadge(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRevokeSubmit} className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Select Member
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Press A–Z to jump
                  </span>
                </div>
                <select
                  value={revokeMemberId}
                  onChange={(e) => setRevokeMemberId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(e, sortedMembers, setRevokeMemberId)
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  {sortedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mandatory Revocation Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="State why this badge award is being revoked..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevokingBadge(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirm Revocation
                </button>
              </div>
            </form>
          </div>
        
      {/* Badge Category CRUD Modal */}
      {manageCategoriesOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-rise">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Manage Badge Categories
                </h3>
                <p className="text-xs text-slate-500">
                  Add new badge domains and remove obsolete categories.
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

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {badgeCategories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <span className="font-bold text-slate-800">{cat}</span>
                  {badgeCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteBadgeCategory(cat)}
                      className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Add New Badge Category
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="e.g. Nanotechnology & Optics"
                  className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8]"
                />
                <button
                  type="button"
                  disabled={!newCategoryInput.trim()}
                  onClick={() => {
                    if (!newCategoryInput.trim()) return;
                    addBadgeCategory(newCategoryInput.trim());
                    setNewCategoryInput("");
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

    </div>
      )}
    </>
  );
}
