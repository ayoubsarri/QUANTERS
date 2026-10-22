"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Handshake,
  Lightbulb,
  MapPin,
  Scale,
  Search,
  Send,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { Proposal, ProposalState, ProposalTypeKey } from "@/lib/types/erp";

type ProposalTabMode = "new" | "mine" | "history";

interface ProposalTypeOption {
  key: ProposalTypeKey;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  reviewerLabel: string;
  accentBg: string;
  accentText: string;
}

const PROPOSAL_TYPES: ProposalTypeOption[] = [
  {
    key: "Event",
    label: "Event",
    shortLabel: "Event",
    icon: Calendar,
    reviewerLabel: "Reviewed by Executive Board",
    accentBg: "bg-blue-50",
    accentText: "text-[#1D63EB]",
  },
  {
    key: "Workshop",
    label: "Workshop",
    shortLabel: "Workshop",
    icon: GraduationCap,
    reviewerLabel: "Reviewed by Department Head",
    accentBg: "bg-sky-50",
    accentText: "text-sky-600",
  },
  {
    key: "Activity",
    label: "Activity",
    shortLabel: "Activity",
    icon: Compass,
    reviewerLabel: "Reviewed by Department Head",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-600",
  },
  {
    key: "Collaboration",
    label: "Collaboration",
    shortLabel: "Collaboration",
    icon: Handshake,
    reviewerLabel: "Reviewed by Executive Board",
    accentBg: "bg-indigo-50",
    accentText: "text-indigo-600",
  },
  {
    key: "Internal Law Amendment",
    label: "Internal Law Amendment",
    shortLabel: "Internal Law Amendment",
    icon: Scale,
    reviewerLabel: "Requires 2/3 Executive Approval",
    accentBg: "bg-amber-50",
    accentText: "text-amber-600",
  },
  {
    key: "Other",
    label: "Other",
    shortLabel: "Other",
    icon: Lightbulb,
    reviewerLabel: "Reviewed by Department Head",
    accentBg: "bg-purple-50",
    accentText: "text-purple-600",
  },
];

const STATE_STYLES: Record<
  ProposalState,
  { bg: string; text: string; border: string }
> = {
  Draft: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
  Submitted: {
    bg: "bg-blue-50",
    text: "text-[#1D63EB]",
    border: "border-blue-200",
  },
  "Under Review": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  Approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  "Changes Requested": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  Rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
};

export default function ProposalsPage() {
  const proposals = useQuantersStore((s) => s.proposals);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const badges = useQuantersStore((s) => s.badges);
  const submitProposal = useQuantersStore((s) => s.submitProposal);

  const [mode, setMode] = useState<ProposalTabMode>("new");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ProposalTypeKey>("Event");

  // Common Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expectedDate, setExpectedDate] = useState("2026-11-20");
  const [location, setLocation] = useState("Faculty of Sciences");

  // Dynamic Type-Specific Fields
  const [specificFields, setSpecificFields] = useState<Record<string, string>>({
    goal: "Organize an interactive campus astronomy and spectroscopy night",
    targetAudience: "All Faculty of Sciences students",
    expectedAttendance: "150",
    budgetEstimate: "12,000 DZD",
    neededDepartments: "Events, Logistics, Media, IT",
    partners: "CRAAG Observatory",
    instructor: "Ayoub Sarri",
    level: "Intermediate",
    objectives: "Hands-on practice and scientific modeling",
    sessions: "2 sessions × 2h",
    materialsNeeded: "Projector, Lab kits",
    capacity: "30",
    linkedBadge: "Astronomy Explorer",
    activityType: "Scientific Visit / Competition",
    participants: "25 members",
    transportNeeds: "University bus reservation",
    costEstimate: "5,000 DZD",
    partnerNameAndType: "USTHB Robotics Lab (Academic Lab)",
    contactPerson: "Dr. K. Mansouri · k.mansouri@usthb.dz",
    cooperationForm: "Joint workshop & equipment sharing",
    benefitsAndObligations: "Shared lab access + joint branding",
    articleConcerned: "Article 14 — Points & Evaluation Table",
    currentText: "Technical tasks are scored between 5 and 50 XP per deliverable.",
    proposedText: "Add +25 XP reward for peer-reviewed open-source scientific code.",
    justification: "Encourages reproducible code and open scientific collaboration.",
    area: "Mobile Check-in & Lab Inventory",
    problem: "Equipment borrowing currently tracked on paper sheets.",
    proposedSolution: "Add QR asset tags for lab kits inside QUANTERS.",
  });

  const [submittedBanner, setSubmittedBanner] = useState<string | null>(null);
  const [activeProposalDetail, setActiveProposalDetail] = useState<Proposal | null>(null);

  const updateSpecificField = (key: string, value: string) => {
    setSpecificFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle =
      title.trim() ||
      (selectedType === "Event"
        ? "Astronomy Night & Spectroscopy"
        : selectedType === "Workshop"
        ? "Scientific Python & Data Pipelines"
        : selectedType === "Internal Law Amendment"
        ? "Amend Art. 14 — Open-Source Contribution Points"
        : `${selectedType} Initiative Proposal`);

    const cleanDesc =
      description.trim() ||
      "Detailed member proposal submitted via the QUANTERS Proposals Engine with full operational objectives and resource requirements.";

    const relevantFields: Record<string, string> = {};
    if (selectedType === "Event") {
      relevantFields.goal = specificFields.goal || "";
      relevantFields.targetAudience = specificFields.targetAudience || "";
      relevantFields.expectedAttendance = specificFields.expectedAttendance || "";
      relevantFields.budgetEstimate = specificFields.budgetEstimate || "";
      relevantFields.neededDepartments = specificFields.neededDepartments || "";
      relevantFields.partners = specificFields.partners || "";
    } else if (selectedType === "Workshop") {
      relevantFields.instructor = specificFields.instructor || "";
      relevantFields.level = specificFields.level || "Beginner";
      relevantFields.objectives = specificFields.objectives || "";
      relevantFields.sessions = specificFields.sessions || "";
      relevantFields.materialsNeeded = specificFields.materialsNeeded || "";
      relevantFields.capacity = specificFields.capacity || "30";
      relevantFields.linkedBadge = specificFields.linkedBadge || "";
    } else if (selectedType === "Activity") {
      relevantFields.activityType = specificFields.activityType || "";
      relevantFields.participants = specificFields.participants || "";
      relevantFields.transportNeeds = specificFields.transportNeeds || "";
      relevantFields.costEstimate = specificFields.costEstimate || "";
    } else if (selectedType === "Collaboration") {
      relevantFields.partnerNameAndType = specificFields.partnerNameAndType || "";
      relevantFields.contactPerson = specificFields.contactPerson || "";
      relevantFields.cooperationForm = specificFields.cooperationForm || "";
      relevantFields.benefitsAndObligations = specificFields.benefitsAndObligations || "";
    } else if (selectedType === "Internal Law Amendment") {
      relevantFields.articleConcerned = specificFields.articleConcerned || "";
      relevantFields.currentText = specificFields.currentText || "";
      relevantFields.proposedText = specificFields.proposedText || "";
      relevantFields.justification = specificFields.justification || "";
    } else {
      relevantFields.area = specificFields.area || "";
      relevantFields.problem = specificFields.problem || "";
      relevantFields.proposedSolution = specificFields.proposedSolution || "";
    }

    submitProposal({
      type: selectedType,
      title: cleanTitle,
      description: cleanDesc,
      expectedDate:
        selectedType === "Internal Law Amendment" ? undefined : expectedDate,
      location: selectedType === "Internal Law Amendment" ? undefined : location,
      specificFields: relevantFields,
    });

    setSubmittedBanner(cleanTitle);
    setTitle("");
    setDescription("");
  };

  const myProposals = proposals.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());
    return p.submitterId === currentMemberId && matchesSearch;
  });

  const historyProposals = proposals.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.submitterName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const activeTypeConfig =
    PROPOSAL_TYPES.find((t) => t.key === selectedType) || PROPOSAL_TYPES[0];

  return (
    <MobileAppShell>
      <div className="flex-1 flex flex-col px-5 pt-2 pb-6 animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Proposals
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Turn your idea into an impact.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition"
            aria-label="Search proposals"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {searchOpen && (
          <div className="mb-3 relative animate-rise">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search proposals by title, type, or author..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D63EB]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 3 Mode Pills */}
        <div className="grid grid-cols-3 gap-1.5 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-white/80 shadow-[0_2px_12px_rgba(9,25,47,0.04)] mb-4">
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`py-2 px-2.5 rounded-full text-xs font-extrabold active:scale-[0.98] transition-all cursor-pointer ${
              mode === "new"
                ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            New Proposal
          </button>
          <button
            type="button"
            onClick={() => setMode("mine")}
            className={`py-2 px-2.5 rounded-full text-xs font-extrabold active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "mine"
                ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>My Proposals</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                mode === "mine"
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {myProposals.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("history")}
            className={`py-2 px-2.5 rounded-full text-xs font-extrabold active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "history"
                ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>History</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                mode === "history"
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {historyProposals.length}
            </span>
          </button>
        </div>

        {/* Submission Success Toast Banner */}
        {submittedBanner && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50/90 backdrop-blur-md border border-emerald-200/90 flex items-start justify-between gap-2.5 animate-rise shadow-2xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  Proposal Submitted for Review!
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  &ldquo;{submittedBanner}&rdquo; has been routed to{" "}
                  {selectedType === "Internal Law Amendment"
                    ? "the Executive Board (2/3 Quorum)"
                    : selectedType === "Event" || selectedType === "Collaboration"
                    ? "the Executive Board"
                    : "your Department Head"}
                  .
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedBanner(null);
                    setMode("mine");
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#1D63EB] underline"
                >
                  <span>View in My Proposals</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmittedBanner(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MODE 1: NEW PROPOSAL */}
        {mode === "new" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Proposal Type 3x2 Visual Icon Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  Proposal Type
                </label>
                <span className="text-[10px] font-semibold text-slate-500">
                  {activeTypeConfig.reviewerLabel}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {PROPOSAL_TYPES.map((item) => {
                  const Icon = item.icon;
                  const active = selectedType === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedType(item.key)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all active:scale-[0.98] min-h-[88px] cursor-pointer ${
                        active
                          ? "bg-white/95 border-[#1D63EB] ring-2 ring-[#1D63EB]/20 shadow-[0_4px_16px_rgba(29,99,235,0.1)]"
                          : "bg-white/80 backdrop-blur-md border-white/80 hover:bg-white hover:border-slate-300 shadow-2xs"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                          active
                            ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-xs"
                            : `${item.accentBg} ${item.accentText}`
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[11px] font-extrabold leading-tight ${
                          active ? "text-[#1D63EB]" : "text-slate-700"
                        }`}
                      >
                        {item.shortLabel}
                      </span>
                      {item.key === "Internal Law Amendment" && (
                        <span className="mt-1 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[8px] font-extrabold uppercase tracking-tight">
                          <Scale className="w-2.5 h-2.5" />
                          <span>2/3 Exec</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Governance Notice Banner when Internal Law Amendment is selected */}
            {selectedType === "Internal Law Amendment" && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start gap-2.5 animate-rise">
                <Scale className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">
                      Charter Governance Rule
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-950 text-[9px] font-bold">
                      <Scale className="w-2.5 h-2.5" />
                      <span>Requires 2/3 Executive Approval</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Amendments to the QUANTA Internal Law require a two-thirds quorum vote of the Executive Board and are logged permanently.
                  </p>
                </div>
              </div>
            )}

            {/* Common Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  selectedType === "Event"
                    ? "e.g. Astronomy Night"
                    : selectedType === "Workshop"
                    ? "e.g. LaTeX for Scientific Theses"
                    : selectedType === "Internal Law Amendment"
                    ? "e.g. Open-Source Contribution XP Rule"
                    : "e.g. Campus Scientific Initiative"
                }
                className="w-full px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-2xs transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain your idea, goals, and requirements..."
                className="w-full px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-2xs resize-none transition-all"
              />
            </div>

            {/* 2-Column Expected Date + Location (shown for non-Law-Amendment types) */}
            {selectedType !== "Internal Law Amendment" && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Expected Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-2xs transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Location"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Type-Specific Fields */}
            <div className="p-4 rounded-xl bg-white/85 backdrop-blur-xl border border-white/80 space-y-3.5 shadow-[0_4px_18px_rgba(9,25,47,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1D63EB]" />
                  <span>{selectedType} Specific Details</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Required Specs
                </span>
              </div>

              {selectedType === "Event" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Event Goal
                    </label>
                    <input
                      type="text"
                      value={specificFields.goal}
                      onChange={(e) => updateSpecificField("goal", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={specificFields.targetAudience}
                        onChange={(e) =>
                          updateSpecificField("targetAudience", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Budget Estimate
                      </label>
                      <input
                        type="text"
                        value={specificFields.budgetEstimate}
                        onChange={(e) =>
                          updateSpecificField("budgetEstimate", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Needed Departments
                    </label>
                    <input
                      type="text"
                      value={specificFields.neededDepartments}
                      onChange={(e) =>
                        updateSpecificField("neededDepartments", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}

              {selectedType === "Workshop" && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Instructor
                      </label>
                      <input
                        type="text"
                        value={specificFields.instructor}
                        onChange={(e) =>
                          updateSpecificField("instructor", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Level
                      </label>
                      <select
                        value={specificFields.level}
                        onChange={(e) =>
                          updateSpecificField("level", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Capacity (Seats)
                      </label>
                      <input
                        type="number"
                        value={specificFields.capacity}
                        onChange={(e) =>
                          updateSpecificField("capacity", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Linked Badge
                      </label>
                      <select
                        value={specificFields.linkedBadge}
                        onChange={(e) =>
                          updateSpecificField("linkedBadge", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      >
                        {badges.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "Activity" && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Activity Type
                      </label>
                      <input
                        type="text"
                        value={specificFields.activityType}
                        onChange={(e) =>
                          updateSpecificField("activityType", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Participants
                      </label>
                      <input
                        type="text"
                        value={specificFields.participants}
                        onChange={(e) =>
                          updateSpecificField("participants", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Transport / Logistics
                      </label>
                      <input
                        type="text"
                        value={specificFields.transportNeeds}
                        onChange={(e) =>
                          updateSpecificField("transportNeeds", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Estimated Cost
                      </label>
                      <input
                        type="text"
                        value={specificFields.costEstimate}
                        onChange={(e) =>
                          updateSpecificField("costEstimate", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "Collaboration" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Partner Name &amp; Type (Club, Lab, Company, Association)
                    </label>
                    <input
                      type="text"
                      value={specificFields.partnerNameAndType}
                      onChange={(e) =>
                        updateSpecificField("partnerNameAndType", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={specificFields.contactPerson}
                      onChange={(e) =>
                        updateSpecificField("contactPerson", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mutual Benefits &amp; Obligations
                    </label>
                    <input
                      type="text"
                      value={specificFields.benefitsAndObligations}
                      onChange={(e) =>
                        updateSpecificField("benefitsAndObligations", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}

              {selectedType === "Internal Law Amendment" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Article Concerned
                    </label>
                    <input
                      type="text"
                      value={specificFields.articleConcerned}
                      onChange={(e) =>
                        updateSpecificField("articleConcerned", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Current Text
                    </label>
                    <input
                      type="text"
                      value={specificFields.currentText}
                      onChange={(e) =>
                        updateSpecificField("currentText", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Proposed Text
                    </label>
                    <input
                      type="text"
                      value={specificFields.proposedText}
                      onChange={(e) =>
                        updateSpecificField("proposedText", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Justification
                    </label>
                    <input
                      type="text"
                      value={specificFields.justification}
                      onChange={(e) =>
                        updateSpecificField("justification", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}

              {selectedType === "Other" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Area / Domain
                    </label>
                    <input
                      type="text"
                      value={specificFields.area}
                      onChange={(e) => updateSpecificField("area", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Proposed Solution
                    </label>
                    <input
                      type="text"
                      value={specificFields.proposedSolution}
                      onChange={(e) =>
                        updateSpecificField("proposedSolution", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Proposal Button */}
            <button
              type="submit"
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:shadow-lg active:scale-[0.98] text-white font-black text-xs shadow-[0_6px_20px_rgba(29,99,235,0.35)] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Proposal</span>
            </button>
          </form>
        )}

        {/* MODE 2 & 3: MY PROPOSALS / HISTORY */}
        {(mode === "mine" || mode === "history") && (
          <div className="space-y-3 animate-rise">
            {(mode === "mine" ? myProposals : historyProposals).length === 0 ? (
              <div className="p-8 rounded-xl bg-white/80 backdrop-blur-xl border border-white/80 text-center shadow-2xs">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-black text-slate-800">
                  No proposals found
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Switch to &ldquo;New Proposal&rdquo; to submit your idea.
                </p>
              </div>
            ) : (
              (mode === "mine" ? myProposals : historyProposals).map((prop) => {
                const st = STATE_STYLES[prop.state];
                return (
                  <div
                    key={prop.id}
                    onClick={() => setActiveProposalDetail(prop)}
                    className="p-4 sm:p-5 rounded-xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_18px_rgba(9,25,47,0.04)] hover:border-[#1D63EB]/40 hover:bg-white/95 active:scale-[0.99] transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200/60">
                          {prop.type}
                        </span>
                        {prop.type === "Internal Law Amendment" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                            <Scale className="w-3 h-3" />
                            <span>Requires 2/3 Exec</span>
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold border ${st.bg} ${st.text} ${st.border}`}
                      >
                        {prop.state}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {prop.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {prop.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-[#1D63EB]" />
                        {prop.reviewerScope}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {prop.createdAt}
                      </span>
                    </div>

                    {prop.reviewerComment && (
                      <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-[11px] text-slate-700">
                        <span className="font-bold text-slate-900">
                          Reviewer Note:{" "}
                        </span>
                        {prop.reviewerComment}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Proposal Detail Modal */}
      {activeProposalDetail && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[420px] max-h-[76dvh] sm:max-h-[82dvh] overflow-y-auto bg-white/95 backdrop-blur-2xl rounded-2xl p-5 shadow-2xl border border-white/80 space-y-4 animate-rise"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#1D63EB] text-[10px] font-bold">
                    {activeProposalDetail.type}
                  </span>
                  {activeProposalDetail.type === "Internal Law Amendment" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                      <Scale className="w-3 h-3" />
                      <span>Requires 2/3 Executive Approval</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {activeProposalDetail.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Submitted by {activeProposalDetail.submitterName} ·{" "}
                  {activeProposalDetail.createdAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveProposalDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {activeProposalDetail.description}
            </p>

            {(activeProposalDetail.expectedDate ||
              activeProposalDetail.location) && (
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                {activeProposalDetail.expectedDate && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Expected Date
                    </span>
                    <span className="font-bold text-slate-800">
                      {activeProposalDetail.expectedDate}
                    </span>
                  </div>
                )}
                {activeProposalDetail.location && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Location
                    </span>
                    <span className="font-bold text-slate-800">
                      {activeProposalDetail.location}
                    </span>
                  </div>
                )}
              </div>
            )}

            {Object.keys(activeProposalDetail.specificFields).length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Structured Specifications
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  {Object.entries(activeProposalDetail.specificFields).map(
                    ([k, v]) => (
                      <div key={k} className="text-xs">
                        <span className="font-bold text-slate-700 capitalize">
                          {k.replace(/([A-Z])/g, " $1")}:{" "}
                        </span>
                        <span className="text-slate-600">{v}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {activeProposalDetail.reviewerComment && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                <span className="font-bold block mb-0.5">
                  Official Review Decision ({activeProposalDetail.reviewerScope}):
                </span>
                {activeProposalDetail.reviewerComment}
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveProposalDetail(null)}
              className="w-full h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold active:scale-[0.98] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
