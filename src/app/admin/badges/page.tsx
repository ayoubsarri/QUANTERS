"use client";

import React, { useState, useMemo } from "react";
import {
  Archive,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  FileCheck2,
  FileCode2,
  FileText,
  FolderGit2,
  Layers,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ALL_FIELD_ICONS, FieldIcon, FieldIconMeta } from "@/components/shared/FieldIcon";
import {
  Badge,
  BadgeCategory,
  BadgeEarningMethod,
  BadgeExam,
  BadgeRequirementType,
  ExamQuestion,
  WorkshopLevel,
} from "@/lib/types/erp";
import {
  handleMemberListContainerKeyDown,
  handleMemberSelectKeyDown,
  sortMembersByName,
} from "@/lib/utils/memberKeyboardJump";

const SAMPLE_EXAM_JSON = `[
  {
    "question": "What is the primary observational evidence for the expansion of the universe?",
    "options": [
      "Cosmic redshift of distant galaxies",
      "Gravitational lensing around black holes",
      "Solar neutrino oscillations",
      "Geomagnetic field reversals"
    ],
    "correctIndex": 0
  },
  {
    "question": "What happens at the event horizon of a Schwarzschild black hole?",
    "options": [
      "The escape velocity equals the speed of light",
      "Time runs infinitely faster for infalling matter",
      "All electromagnetic waves are amplified",
      "Hawking radiation ceases completely"
    ],
    "correctIndex": 0
  }
]`;

export default function AdminBadgesPage() {
  const badges = useQuantersStore((s) => s.badges);
  const exams = useQuantersStore((s) => s.exams);
  const projectSubmissions = useQuantersStore((s) => s.projectSubmissions);
  const members = useQuantersStore((s) => s.members);
  const badgeCategories = useQuantersStore((s) => s.badgeCategories);
  const addBadgeCategory = useQuantersStore((s) => s.addBadgeCategory);
  const deleteBadgeCategory = useQuantersStore((s) => s.deleteBadgeCategory);

  const createBadge = useQuantersStore((s) => s.createBadge);
  const updateBadge = useQuantersStore((s) => s.updateBadge);
  const awardBadgeManually = useQuantersStore((s) => s.awardBadgeManually);
  const revokeBadge = useQuantersStore((s) => s.revokeBadge);
  const deleteOrArchiveBadge = useQuantersStore((s) => s.deleteOrArchiveBadge);
  const createBadgeExam = useQuantersStore((s) => s.createBadgeExam);
  const updateBadgeExam = useQuantersStore((s) => s.updateBadgeExam);
  const deleteBadgeExam = useQuantersStore((s) => s.deleteBadgeExam);
  const reviewProjectSubmission = useQuantersStore((s) => s.reviewProjectSubmission);

  const [activeTab, setActiveTab] = useState<"library" | "exams" | "projects">("library");
  const [skillTypeFilter, setSkillTypeFilter] = useState<"All" | "Hard Skill" | "Soft Skill">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [requirementFilter, setRequirementFilter] = useState<string>("All");
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [banner, setBanner] = useState<string | null>(null);

  // --- BADGE CREATION MODAL STATE ---
  const [createOpen, setCreateOpen] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeSkillType, setNewBadgeSkillType] = useState<"Hard Skill" | "Soft Skill">("Hard Skill");
  const [newBadgeCategory, setNewBadgeCategory] = useState<BadgeCategory>("Science");
  const [newBadgeTone, setNewBadgeTone] = useState<Badge["borderTone"]>("blue");
  const [newBadgeIcon, setNewBadgeIcon] = useState("Telescope");
  const [newBadgeXp, setNewBadgeXp] = useState(120);
  const [newBadgeDesc, setNewBadgeDesc] = useState("");
  const [newBadgeCriteria, setNewBadgeCriteria] = useState("");
  const [newBadgeRequirement, setNewBadgeRequirement] = useState<BadgeRequirementType>("both");
  const [newBadgeLinkedExamId, setNewBadgeLinkedExamId] = useState<string>(exams[0]?.id || "");
  const [badgeIconCategoryFilter, setBadgeIconCategoryFilter] = useState<string>("All");
  const [badgeIconSearch, setBadgeIconSearch] = useState<string>("");

  // --- BADGE EDIT MODAL STATE ---
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [editBadgeName, setEditBadgeName] = useState("");
  const [editBadgeSkillType, setEditBadgeSkillType] = useState<"Hard Skill" | "Soft Skill">("Hard Skill");
  const [editBadgeCategory, setEditBadgeCategory] = useState<BadgeCategory>("Science");
  const [editBadgeTone, setEditBadgeTone] = useState<Badge["borderTone"]>("blue");
  const [editBadgeIcon, setEditBadgeIcon] = useState("Telescope");
  const [editBadgeXp, setEditBadgeXp] = useState(120);
  const [editBadgeDesc, setEditBadgeDesc] = useState("");
  const [editBadgeCriteria, setEditBadgeCriteria] = useState("");
  const [editBadgeRequirement, setEditBadgeRequirement] = useState<BadgeRequirementType>("both");
  const [editBadgeLinkedExamId, setEditBadgeLinkedExamId] = useState<string>("");

  // --- MANUAL ASSIGN STATE ---
  const [assigningBadge, setAssigningBadge] = useState<Badge | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(["mem-ayoub"]);
  const [assignReason, setAssignReason] = useState("Demonstrated deep practical proficiency in laboratory workshops.");

  // --- REVOKE STATE ---
  const [revokingBadge, setRevokingBadge] = useState<Badge | null>(null);
  const [revokeMemberId, setRevokeMemberId] = useState<string>(members[0]?.id || "mem-ayoub");
  const [revokeReason, setRevokeReason] = useState("");

  // --- EXAMS MANAGER STATE ---
  const [examSearch, setExamSearch] = useState("");
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState("");
  const [examBadgeId, setExamBadgeId] = useState(badges[0]?.id || "");
  const [examCategory, setExamCategory] = useState<BadgeCategory>("Science");
  const [examLevel, setExamLevel] = useState<WorkshopLevel>("Beginner");
  const [examXpReward, setExamXpReward] = useState(100);
  const [examDuration, setExamDuration] = useState(60);
  const [examPassingScore, setExamPassingScore] = useState(70);
  const [examMaxAttempts, setExamMaxAttempts] = useState(2);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);

  // --- EXAM JSON IMPORT MODAL STATE ---
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonInputText, setJsonInputText] = useState("");
  const [jsonMode, setJsonMode] = useState<"append" | "replace">("append");
  const [jsonValidationMsg, setJsonValidationMsg] = useState<{ count: number; error?: string } | null>(null);

  // --- PROJECT REVIEWS STATE ---
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({
    "sub-1": "Rigorous transit analysis matching theoretical light curve parameters. Well done!",
  });

  const sortedMembers = sortMembersByName(members);

  const toggleMemberSelect = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Filtered badges list
  const filteredBadges = badges.filter((b) => {
    if (skillTypeFilter !== "All" && b.skillType !== skillTypeFilter) return false;
    if (categoryFilter !== "All" && b.category !== categoryFilter) return false;
    if (requirementFilter !== "All") {
      const isDual =
        b.requirementType === "both" ||
        (b.earningMethods.includes("exam") && b.earningMethods.includes("project"));
      if (requirementFilter === "both" && !isDual) return false;
      if (requirementFilter === "exam" && (isDual || !b.earningMethods.includes("exam"))) return false;
      if (requirementFilter === "project" && (isDual || !b.earningMethods.includes("project"))) return false;
      if (requirementFilter === "manual" && (isDual || !b.earningMethods.includes("manual"))) return false;
    }
    return true;
  });

  // Filtered exams list
  const filteredExams = exams.filter((ex) => {
    if (!examSearch.trim()) return true;
    const q = examSearch.toLowerCase();
    return (
      ex.title.toLowerCase().includes(q) ||
      ex.level.toLowerCase().includes(q) ||
      (ex.category || "").toLowerCase().includes(q)
    );
  });

  // Handle Create Badge Submit
  const handleCreateBadgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeName.trim()) return;

    let methods: BadgeEarningMethod[] = [];
    if (newBadgeRequirement === "both") {
      methods = ["exam", "project"];
    } else if (newBadgeRequirement === "exam") {
      methods = ["exam"];
    } else if (newBadgeRequirement === "project") {
      methods = ["project"];
    } else {
      methods = ["manual"];
    }

    createBadge({
      name: newBadgeName.trim(),
      category: newBadgeCategory,
      skillType: newBadgeSkillType,
      borderTone: newBadgeTone,
      iconName: newBadgeIcon,
      xpReward: newBadgeXp,
      description: newBadgeDesc.trim() || `Verified credentials in ${newBadgeName}`,
      criteriaText: newBadgeCriteria.trim() || `Complete verification criteria for ${newBadgeName}`,
      earningMethods: methods,
      requirementType: newBadgeRequirement,
      linkedExamId: newBadgeLinkedExamId || undefined,
    });

    setBanner(`Created badge '${newBadgeName}' with ${newBadgeRequirement === "both" ? "Dual Exam + Project" : newBadgeRequirement} requirement!`);
    setCreateOpen(false);
    setNewBadgeName("");
    setNewBadgeDesc("");
    setNewBadgeCriteria("");
  };

  // Handle Edit Badge Open
  const openEditBadgeModal = (badge: Badge) => {
    setEditingBadge(badge);
    setEditBadgeName(badge.name);
    setEditBadgeCategory(badge.category);
    setEditBadgeSkillType(badge.skillType || "Hard Skill");
    setEditBadgeTone(badge.borderTone);
    setEditBadgeIcon(badge.iconName);
    setEditBadgeXp(badge.xpReward);
    setEditBadgeDesc(badge.description);
    setEditBadgeCriteria(badge.criteriaText);
    const isDual =
      badge.requirementType === "both" ||
      (badge.earningMethods.includes("exam") && badge.earningMethods.includes("project"));
    setEditBadgeRequirement(
      isDual
        ? "both"
        : badge.earningMethods.includes("exam")
        ? "exam"
        : badge.earningMethods.includes("project")
        ? "project"
        : "manual"
    );
    setEditBadgeLinkedExamId(badge.linkedExamId || exams.find((e) => e.badgeId === badge.id)?.id || "");
  };

  // Handle Edit Badge Submit
  const handleEditBadgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBadge || !editBadgeName.trim()) return;

    let methods: BadgeEarningMethod[] = [];
    if (editBadgeRequirement === "both") {
      methods = ["exam", "project"];
    } else if (editBadgeRequirement === "exam") {
      methods = ["exam"];
    } else if (editBadgeRequirement === "project") {
      methods = ["project"];
    } else {
      methods = ["manual"];
    }

    updateBadge(editingBadge.id, {
      name: editBadgeName.trim(),
      category: editBadgeCategory,
      skillType: editBadgeSkillType,
      borderTone: editBadgeTone,
      iconName: editBadgeIcon,
      xpReward: editBadgeXp,
      description: editBadgeDesc.trim(),
      criteriaText: editBadgeCriteria.trim(),
      earningMethods: methods,
      requirementType: editBadgeRequirement,
      linkedExamId: editBadgeLinkedExamId || undefined,
    });

    setBanner(`Updated badge '${editBadgeName}'!`);
    setEditingBadge(null);
  };

  // Handle Manual Assign
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBadge || selectedMemberIds.length === 0) return;
    awardBadgeManually(assigningBadge.id, selectedMemberIds, assignReason);
    setBanner(`Awarded '${assigningBadge.name}' to ${selectedMemberIds.length} member(s)!`);
    setAssigningBadge(null);
  };

  // Handle Revoke
  const handleRevokeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingBadge || !revokeReason.trim()) return;
    revokeBadge(revokingBadge.id, revokeMemberId, revokeReason);
    setBanner(`Revoked '${revokingBadge.name}' from member.`);
    setRevokingBadge(null);
    setRevokeReason("");
  };

  // --- EXAM CREATE / EDIT MODAL OPEN ---
  const openCreateExamModal = () => {
    setEditingExamId(null);
    setExamTitle("");
    setExamBadgeId(badges[0]?.id || "");
    setExamCategory("Science");
    setExamLevel("Beginner");
    setExamXpReward(100);
    setExamDuration(60);
    setExamPassingScore(70);
    setExamMaxAttempts(2);
    setExamQuestions([
      {
        id: `q-${Date.now()}-1`,
        question: "Sample Question: What is the scientific principle underlying this module?",
        options: ["First core principle", "Second alternative", "Third hypothesis", "Fourth counter-example"],
        correctIndex: 0,
      },
    ]);
    setExamModalOpen(true);
  };

  const openEditExamModal = (exam: BadgeExam) => {
    setEditingExamId(exam.id);
    setExamTitle(exam.title);
    setExamBadgeId(exam.badgeId);
    setExamCategory(exam.category || "Science");
    setExamLevel(exam.level);
    setExamXpReward(exam.xpReward);
    setExamDuration(exam.durationMinutes);
    setExamPassingScore(exam.passingScorePercent);
    setExamMaxAttempts(exam.maxAttempts);
    setExamQuestions(exam.questions || []);
    setExamModalOpen(true);
  };

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    if (editingExamId) {
      updateBadgeExam(editingExamId, {
        title: examTitle.trim(),
        badgeId: examBadgeId,
        category: examCategory,
        level: examLevel,
        xpReward: examXpReward,
        durationMinutes: examDuration,
        passingScorePercent: examPassingScore,
        maxAttempts: examMaxAttempts,
        questions: examQuestions,
        totalQuestionsCount: examQuestions.length,
      });
      setBanner(`Updated exam '${examTitle}' with ${examQuestions.length} questions!`);
    } else {
      createBadgeExam({
        badgeId: examBadgeId,
        title: examTitle.trim(),
        category: examCategory,
        level: examLevel,
        xpReward: examXpReward,
        durationMinutes: examDuration,
        passingScorePercent: examPassingScore,
        maxAttempts: examMaxAttempts,
        rules: [
          "Stable internet connection required",
          "Timed assessment with automatic submission",
          `Minimum score of ${examPassingScore}% required to pass`,
        ],
        questions: examQuestions,
        totalQuestionsCount: examQuestions.length,
      });
      setBanner(`Created new exam '${examTitle}' with ${examQuestions.length} questions!`);
    }
    setExamModalOpen(false);
  };

  // Add individual MCQ question
  const addEmptyQuestion = () => {
    setExamQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        question: "",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: 0,
      },
    ]);
  };

  // Remove question
  const removeQuestion = (idx: number) => {
    setExamQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Open JSON import modal
  const openJsonImport = () => {
    setJsonInputText("");
    setJsonValidationMsg(null);
    setJsonModalOpen(true);
  };

  // Validate JSON on the fly
  const validateJson = (text: string) => {
    setJsonInputText(text);
    if (!text.trim()) {
      setJsonValidationMsg(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setJsonValidationMsg({ count: 0, error: "JSON must be an array of question objects [ {...}, {...} ]" });
        return;
      }
      let valid = 0;
      for (const item of parsed) {
        if (item && typeof item.question === "string" && Array.isArray(item.options) && item.options.length >= 2) {
          valid++;
        }
      }
      if (valid === 0) {
        setJsonValidationMsg({ count: 0, error: "No valid question items found. Each item needs 'question' and 'options'." });
      } else {
        setJsonValidationMsg({ count: valid });
      }
    } catch (err: any) {
      setJsonValidationMsg({ count: 0, error: err.message || "Invalid JSON syntax" });
    }
  };

  // Apply JSON import
  const applyJsonImport = () => {
    if (!jsonValidationMsg || jsonValidationMsg.count === 0) return;
    try {
      const parsed = JSON.parse(jsonInputText);
      const converted: ExamQuestion[] = [];

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (item && typeof item.question === "string" && Array.isArray(item.options)) {
          let correctIdx = 0;
          if (typeof item.correctIndex === "number") {
            correctIdx = item.correctIndex;
          } else if (typeof item.answer === "number") {
            correctIdx = item.answer;
          } else if (typeof item.correctAnswer === "string") {
            const foundIdx = item.options.indexOf(item.correctAnswer);
            if (foundIdx >= 0) correctIdx = foundIdx;
          }

          converted.push({
            id: `q-json-${Date.now()}-${i + 1}`,
            question: String(item.question).trim(),
            options: item.options.map((opt: any) => String(opt).trim()),
            correctIndex: Math.max(0, Math.min(correctIdx, item.options.length - 1)),
          });
        }
      }

      if (jsonMode === "replace") {
        setExamQuestions(converted);
      } else {
        setExamQuestions((prev) => [...prev, ...converted]);
      }

      setJsonModalOpen(false);
      setBanner(`Successfully loaded ${converted.length} questions from JSON into the exam!`);
    } catch {
      // Error handled by validator
    }
  };

  const filteredBadgeIcons = useMemo(() => {
    return ALL_FIELD_ICONS.filter((f) => {
      const matchesCategory =
        badgeIconCategoryFilter === "All" || f.category === badgeIconCategoryFilter;
      const matchesSearch =
        !badgeIconSearch ||
        f.label.toLowerCase().includes(badgeIconSearch.toLowerCase()) ||
        f.code.toLowerCase().includes(badgeIconSearch.toLowerCase()) ||
        f.key.toLowerCase().includes(badgeIconSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [badgeIconCategoryFilter, badgeIconSearch]);

  const selectedBadgeIconMeta = useMemo(() => {
    return ALL_FIELD_ICONS.find((f) => f.key === newBadgeIcon) || ALL_FIELD_ICONS[0];
  }, [newBadgeIcon]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-rise">
          <span>{banner}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10.5px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Badges &amp; Assessment Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F1E36]">
            Badges, Exams &amp; Evaluations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage verifiable badge credentials, dual requirements (Exam + Project), and timed online exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "library" && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Create Badge</span>
            </button>
          )}

          {activeTab === "exams" && (
            <button
              type="button"
              onClick={openCreateExamModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Create Exam</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("library")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "library"
              ? "bg-[#182C4E] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Badge Library ({badges.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("exams")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "exams"
              ? "bg-[#182C4E] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Exams Manager ({exams.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "projects"
              ? "bg-[#182C4E] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Project Submissions ({projectSubmissions.length})</span>
        </button>
      </div>

      {/* TAB 1: BADGE LIBRARY */}
      {activeTab === "library" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Requirement:</span>
              {(
                [
                  { key: "All", label: "All Requirements" },
                  { key: "both", label: "Dual: Exam + Project" },
                  { key: "exam", label: "Exam Only" },
                  { key: "project", label: "Project Only" },
                  { key: "manual", label: "Manual Award" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setRequirementFilter(f.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    requirementFilter === f.key
                      ? "bg-[#182C4E] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-[#F4F7FB] text-xs font-bold text-slate-800"
              >
                <option value="All">All Categories</option>
                {badgeCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setManageCategoriesOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Manage Categories
              </button>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredBadges.map((badge) => {
              const canHardDelete = badge.awardedCount === 0;
              const isDual =
                badge.requirementType === "both" ||
                (badge.earningMethods.includes("exam") && badge.earningMethods.includes("project"));

              return (
                <div
                  key={badge.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E2EDF8] shadow-xs hover:border-[#38BDF8]/40 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Icon, Name, Category, XP */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <FieldIcon field={badge.iconName} size={24} boxed />
                        <div>
                          <h3 className="font-extrabold text-xs text-[#0F1E36] line-clamp-1">
                            {badge.name}
                          </h3>
                          <span className="text-[10px] font-mono text-[#0284C7] font-semibold">
                            {badge.category}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono text-[10.5px] font-bold tabular-nums whitespace-nowrap">
                        +{badge.xpReward} XP
                      </span>
                    </div>

                    {/* Requirement Pill */}
                    <div className="mt-2.5">
                      {isDual ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>Dual: Exam + Project</span>
                        </div>
                      ) : badge.earningMethods.includes("exam") ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold">
                          <BookOpen className="w-3 h-3 text-sky-600" />
                          <span>Exam Only</span>
                        </div>
                      ) : badge.earningMethods.includes("project") ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                          <FolderGit2 className="w-3 h-3 text-amber-600" />
                          <span>Project Only</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                          <Award className="w-3 h-3 text-slate-500" />
                          <span>Manual / Committee</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {badge.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2.5 mt-2.5 border-t border-slate-100">
                      <span className="font-bold tabular-nums">
                        {badge.awardedCount} Earned
                      </span>
                      {badge.archived && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          Archived
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2.5 mt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAssigningBadge(badge);
                        setSelectedMemberIds(["mem-ayoub"]);
                      }}
                      className="col-span-2 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white text-[11px] font-bold transition cursor-pointer"
                    >
                      <Award className="w-3 h-3" />
                      <span>Award</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditBadgeModal(badge)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                      title="Edit Badge"
                    >
                      <Pencil className="w-3 h-3" />
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
                      className={`inline-flex items-center justify-center p-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        canHardDelete
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                      }`}
                      title={canHardDelete ? "Delete Badge" : "Archive Badge"}
                    >
                      {canHardDelete ? <Trash2 className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EXAMS MANAGER */}
      {activeTab === "exams" && (
        <div className="space-y-4">
          {/* Search & Actions Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                placeholder="Search exams by title, level, or category..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Total Exams: <strong className="text-slate-800">{exams.length}</strong>
              </span>
              <button
                type="button"
                onClick={openCreateExamModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#182C4E] hover:bg-[#101F38] text-white text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Create Exam</span>
              </button>
            </div>
          </div>

          {/* Exams Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.map((ex) => {
              const linkedBadge = badges.find((b) => b.id === ex.badgeId);

              return (
                <div
                  key={ex.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#38BDF8]/40 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <FieldIcon field={ex.iconName || ex.title} size={26} boxed />
                        <div>
                          <h3 className="font-extrabold text-sm text-[#0F1E36] line-clamp-1">
                            {ex.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold uppercase text-[#0284C7]">
                              {ex.category || "Science"}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                              {ex.level}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono text-[10.5px] font-bold">
                        +{ex.xpReward} XP
                      </span>
                    </div>

                    {/* Linked Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">
                        Target Badge: <strong>{linkedBadge?.name || ex.badgeId}</strong>
                      </span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-[#F8FAFC] border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400">Duration</div>
                        <div className="text-xs font-mono font-black text-slate-800 mt-0.5">
                          {ex.durationMinutes}m
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F8FAFC] border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400">Pass Mark</div>
                        <div className="text-xs font-mono font-black text-emerald-700 mt-0.5">
                          {ex.passingScorePercent}%
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F8FAFC] border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400">Questions</div>
                        <div className="text-xs font-mono font-black text-indigo-700 mt-0.5">
                          {ex.questions?.length || 0} Qs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => openEditExamModal(ex)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182C4E] hover:bg-[#101F38] text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit Exam</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the exam '${ex.title}'?`)) {
                          deleteBadgeExam(ex.id);
                          setBanner(`Deleted exam '${ex.title}'.`);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PROJECT SUBMISSIONS */}
      {activeTab === "projects" && (
        <div className="space-y-3.5">
          {projectSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
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
                <h3 className="font-extrabold text-sm text-[#0F1E36]">
                  {sub.projectTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {sub.description}
                </p>
              </div>

              {sub.repoUrl && (
                <a
                  href={sub.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0284C7] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{sub.repoUrl}</span>
                </a>
              )}

              {/* Reviewer Comment & Grading Controls */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-[11px] font-bold text-slate-600">
                  Reviewer Evaluation Feedback
                </label>
                <input
                  type="text"
                  value={reviewComments[sub.id] ?? (sub.reviewerComment || "")}
                  onChange={(e) =>
                    setReviewComments((prev) => ({
                      ...prev,
                      [sub.id]: e.target.value,
                    }))
                  }
                  placeholder="Provide feedback on the methodology, reproducibility, and code quality..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      reviewProjectSubmission(
                        sub.id,
                        "Revision Requested",
                        reviewComments[sub.id] || "Please revise data visualization per feedback."
                      );
                      setBanner("Requested revision for project submission.");
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold cursor-pointer"
                  >
                    Request Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      reviewProjectSubmission(
                        sub.id,
                        "Approved",
                        reviewComments[sub.id] || "Project approved. Criteria satisfied!"
                      );
                      setBanner(`Approved project '${sub.projectTitle}' and updated badge progress!`);
                    }}
                    className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Approve (Award Credit)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          MODAL: CREATE BADGE
         ========================================================= */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Create New Badge</h2>
                <p className="text-xs text-sky-200">
                  Configure title, category, and requirements (Exam, Project, or Dual).
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

            <form onSubmit={handleCreateBadgeSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Badge Title *
                </label>
                <input
                  type="text"
                  required
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  placeholder="e.g. Quantum Computing Specialist"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newBadgeCategory}
                    onChange={(e) => setNewBadgeCategory(e.target.value as BadgeCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    {badgeCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={500}
                    value={newBadgeXp}
                    onChange={(e) => setNewBadgeXp(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Requirement Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Earning Requirement Mode *
                </label>
                <div className="space-y-1.5">
                  {(
                    [
                      {
                        key: "both",
                        title: "Dual Requirement: Online Exam + Project (Both Required)",
                        desc: "Member must pass the online exam AND submit an approved project to unlock.",
                      },
                      {
                        key: "exam",
                        title: "Online Exam Only",
                        desc: "Passing the timed online exam unlocks the badge immediately.",
                      },
                      {
                        key: "project",
                        title: "Project Submission Only",
                        desc: "Submitting an approved practical project unlocks the badge.",
                      },
                      {
                        key: "manual",
                        title: "Manual / Committee Award",
                        desc: "Awarded manually by Club Managers or Scientific Committee.",
                      },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                        newBadgeRequirement === item.key
                          ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/20"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="newBadgeReq"
                        checked={newBadgeRequirement === item.key}
                        onChange={() => setNewBadgeRequirement(item.key)}
                        className="mt-0.5 accent-[#182C4E]"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {(newBadgeRequirement === "both" || newBadgeRequirement === "exam") && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Linked Online Exam
                  </label>
                  <select
                    value={newBadgeLinkedExamId}
                    onChange={(e) => setNewBadgeLinkedExamId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="">-- Auto-create / Select Exam --</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title} ({ex.level})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Badge Icon &amp; Domain
                  </label>
                  {/* Selected Preview */}
                  {selectedBadgeIconMeta && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200/90 text-xs font-bold text-[#0284C7] shadow-2xs">
                      <div className={`w-4 h-4 rounded-md ${selectedBadgeIconMeta.bgTint} ${selectedBadgeIconMeta.textColor} flex items-center justify-center shrink-0`}>
                        <FieldIcon field={selectedBadgeIconMeta.key} size={12} colored />
                      </div>
                      <span className="font-semibold text-slate-800">{selectedBadgeIconMeta.label}</span>
                      <span className="text-[10px] font-mono text-sky-500">({selectedBadgeIconMeta.code})</span>
                    </span>
                  )}
                </div>

                {/* Category Pills & Search */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                    {(
                      [
                        "All",
                        "Software & Tech",
                        "Engineering & Hardware",
                        "Science & Research",
                        "Creative & Media",
                        "Leadership & Operations",
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setBadgeIconCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                          badgeIconCategoryFilter === cat
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
                    value={badgeIconSearch}
                    onChange={(e) => setBadgeIconSearch(e.target.value)}
                    placeholder="Search icon..."
                    className="w-28 sm:w-32 px-2 py-0.5 text-[11px] bg-white border border-slate-200/90 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                  />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200/90 max-h-44 overflow-y-auto">
                  {filteredBadgeIcons.map((f: FieldIconMeta) => {
                    const isSelected = newBadgeIcon === f.key || newBadgeIcon === f.label;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setNewBadgeIcon(f.key)}
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description &amp; Criteria
                </label>
                <textarea
                  rows={2}
                  value={newBadgeDesc}
                  onChange={(e) => setNewBadgeDesc(e.target.value)}
                  placeholder="Describe the skills and competence verified by this badge..."
                  className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#182C4E] text-white cursor-pointer"
                >
                  Create Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: EDIT BADGE
         ========================================================= */}
      {editingBadge && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Edit Badge: {editingBadge.name}</h2>
                <p className="text-xs text-sky-200">
                  Update requirement structure, XP reward, and descriptors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBadge(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditBadgeSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Badge Title
                </label>
                <input
                  type="text"
                  required
                  value={editBadgeName}
                  onChange={(e) => setEditBadgeName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={editBadgeCategory}
                    onChange={(e) => setEditBadgeCategory(e.target.value as BadgeCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    {badgeCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={500}
                    value={editBadgeXp}
                    onChange={(e) => setEditBadgeXp(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Requirement Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Earning Requirement Mode
                </label>
                <div className="space-y-1.5">
                  {(
                    [
                      {
                        key: "both",
                        title: "Dual Requirement: Online Exam + Project (Both Required)",
                        desc: "Member must pass the online exam AND submit an approved project to unlock.",
                      },
                      {
                        key: "exam",
                        title: "Online Exam Only",
                        desc: "Passing the timed online exam unlocks the badge immediately.",
                      },
                      {
                        key: "project",
                        title: "Project Submission Only",
                        desc: "Submitting an approved practical project unlocks the badge.",
                      },
                      {
                        key: "manual",
                        title: "Manual / Committee Award",
                        desc: "Awarded manually by Club Managers or Scientific Committee.",
                      },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                        editBadgeRequirement === item.key
                          ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/20"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="editBadgeReq"
                        checked={editBadgeRequirement === item.key}
                        onChange={() => setEditBadgeRequirement(item.key)}
                        className="mt-0.5 accent-[#182C4E]"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editBadgeDesc}
                  onChange={(e) => setEditBadgeDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBadge(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#182C4E] text-white cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: CREATE / EDIT EXAM WITH MCQ BUILDER & JSON IMPORT
         ========================================================= */}
      {examModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">
                  {editingExamId ? `Edit Exam: ${examTitle}` : "Create New Online Exam"}
                </h2>
                <p className="text-xs text-sky-200">
                  Configure exam parameters and multiple-choice questions (manual or JSON import).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExamModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExamSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* General Exam Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="e.g. Astrophysics & Relativity Basics"
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Linked Target Badge *
                  </label>
                  <select
                    value={examBadgeId}
                    onChange={(e) => setExamBadgeId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200 rounded-xl font-bold"
                  >
                    {badges.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (+{b.xpReward} XP)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Level
                  </label>
                  <select
                    value={examLevel}
                    onChange={(e) => setExamLevel(e.target.value as WorkshopLevel)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200 rounded-xl"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={examPassingScore}
                    onChange={(e) => setExamPassingScore(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
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
                    value={examXpReward}
                    onChange={(e) => setExamXpReward(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* MCQ QUESTION BANK SECTION */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-[#0F1E36]">
                      MCQ Question Bank ({examQuestions.length} Questions)
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={addEmptyQuestion}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>

                    {/* Small Icon Box for JSON Import */}
                    <button
                      type="button"
                      onClick={openJsonImport}
                      className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 transition cursor-pointer"
                      title="Import Questions from JSON Format"
                    >
                      <Code2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {examQuestions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-black text-slate-700">
                          Question #{qIdx + 1}
                        </span>
                        {examQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIdx)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...examQuestions];
                          updated[qIdx].question = e.target.value;
                          setExamQuestions(updated);
                        }}
                        placeholder={`e.g. Enter question text #${qIdx + 1}...`}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-semibold"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-1.5 rounded-xl border ${
                              q.correctIndex === optIdx
                                ? "bg-emerald-50/70 border-emerald-300"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctIndex === optIdx}
                              onChange={() => {
                                const updated = [...examQuestions];
                                updated[qIdx].correctIndex = optIdx;
                                setExamQuestions(updated);
                              }}
                              className="accent-emerald-600"
                            />
                            <span className="w-4 text-[11px] font-mono font-bold text-slate-500">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => {
                                const updated = [...examQuestions];
                                updated[qIdx].options[optIdx] = e.target.value;
                                setExamQuestions(updated);
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="flex-1 text-xs bg-transparent focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#182C4E] text-white cursor-pointer"
                >
                  {editingExamId ? "Save Exam Changes" : "Publish Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: IMPORT MCQ QUESTIONS VIA JSON
         ========================================================= */}
      {jsonModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-[#38BDF8]" />
                <div>
                  <h2 className="text-base font-extrabold">Import MCQ Questions (JSON Format)</h2>
                  <p className="text-xs text-sky-200">
                    Paste raw JSON for the QCM questions array only (no title or wrapper).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setJsonModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Format Spec Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-sky-100 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-[#38BDF8]">Accepted JSON Format:</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SAMPLE_EXAM_JSON);
                      setBanner("Copied Sample JSON to clipboard!");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#7DD3FC] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Sample</span>
                  </button>
                </div>
                <pre className="text-[11px] overflow-x-auto text-emerald-300 leading-snug p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {SAMPLE_EXAM_JSON}
                </pre>
                <p className="text-[11px] text-slate-400">
                  • <code>question</code>: Question prompt text.<br />
                  • <code>options</code>: Array of choice strings (2 to 6 choices).<br />
                  • <code>correctIndex</code>: 0-based integer index pointing to the correct choice (0 = A, 1 = B...).
                </p>
              </div>

              {/* Paste Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Paste JSON Array Here:
                </label>
                <textarea
                  rows={8}
                  value={jsonInputText}
                  onChange={(e) => validateJson(e.target.value)}
                  placeholder="Paste your JSON array of questions here..."
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              {/* Live Validation Pill */}
              {jsonValidationMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    jsonValidationMsg.error
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {jsonValidationMsg.error ? (
                    <span>Error: {jsonValidationMsg.error}</span>
                  ) : (
                    <span>✓ Valid: {jsonValidationMsg.count} questions ready to import!</span>
                  )}
                </div>
              )}

              {/* Mode: Append vs Replace */}
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                <span>Import Mode:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="jsonMode"
                    checked={jsonMode === "append"}
                    onChange={() => setJsonMode("append")}
                    className="accent-[#182C4E]"
                  />
                  <span>Append to existing questions</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="jsonMode"
                    checked={jsonMode === "replace"}
                    onChange={() => setJsonMode("replace")}
                    className="accent-[#182C4E]"
                  />
                  <span>Replace existing questions</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setJsonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!jsonValidationMsg || jsonValidationMsg.count === 0}
                  onClick={applyJsonImport}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#182C4E] hover:bg-[#101F38] disabled:opacity-50 text-white cursor-pointer"
                >
                  Load Questions into Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: ASSIGN BADGE MANUALLY
         ========================================================= */}
      {assigningBadge && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#38BDF8]" />
                <div>
                  <h2 className="text-base font-extrabold">
                    Assign Badge Manually: {assigningBadge.name}
                  </h2>
                  <p className="text-xs text-sky-200">
                    Awards +{assigningBadge.xpReward} XP and logs verification proof.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningBadge(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recipients ({selectedMemberIds.length} Selected)
                </label>
                <div
                  tabIndex={0}
                  onKeyDown={(e) =>
                    handleMemberListContainerKeyDown(e, sortedMembers, toggleMemberSelect)
                  }
                  className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
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
                  Verification Reason / Proof Note *
                </label>
                <textarea
                  rows={2}
                  required
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F4F7FB] border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningBadge(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#182C4E] text-white cursor-pointer"
                >
                  Award Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: MANAGE BADGE CATEGORIES CRUD
         ========================================================= */}
      {manageCategoriesOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-rise">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Manage Badge Categories
                </h3>
                <p className="text-xs text-slate-500">
                  Add and delete badge classification domains.
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
                Add New Category
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="e.g. Quantum Science & Computing"
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
                  className="h-9 px-3.5 rounded-xl bg-[#182C4E] hover:bg-[#101F38] disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
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
  );
}
