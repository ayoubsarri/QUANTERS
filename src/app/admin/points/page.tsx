"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Coins,
  Crown,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import {
  handleMemberSelectKeyDown,
  isAssignableMember,
  sortMembersByName,
} from "@/lib/utils/memberKeyboardJump";

export default function AdminPointsPage() {
  const ledger = useQuantersStore((s) => s.ledger);
  const pointRules = useQuantersStore((s) => s.pointRules);
  const members = useQuantersStore((s) => s.members);
  const departments = useQuantersStore((s) => s.departments);
  const settings = useQuantersStore((s) => s.settings);

  const addManualPointsEntry = useQuantersStore((s) => s.addManualPointsEntry);
  const reversePointsEntry = useQuantersStore((s) => s.reversePointsEntry);
  const resolvePointsAppeal = useQuantersStore((s) => s.resolvePointsAppeal);
  const createPointRule = useQuantersStore((s) => s.createPointRule);
  const updatePointRule = useQuantersStore((s) => s.updatePointRule);
  const deletePointRule = useQuantersStore((s) => s.deletePointRule);
  const publishMonthlyHonours = useQuantersStore((s) => s.publishMonthlyHonours);
  const removeMonthlyHonours = useQuantersStore((s) => s.removeMonthlyHonours);
  const rolloverMonthlyCycle = useQuantersStore((s) => s.rolloverMonthlyCycle);
  const syncMonthlyScoresWithLedger = useQuantersStore((s) => s.syncMonthlyScoresWithLedger);

  const [activeTab, setActiveTab] = useState<"ledger" | "rules" | "appeals" | "motm">("ledger");
  const [banner, setBanner] = useState<string | null>(null);

  // Filter assignable student members (excluding Super Admin / System accounts)
  const assignableMembers = sortMembersByName(members.filter((m) => isAssignableMember(m)));
  const sortedMembers = assignableMembers;

  // Manual Point Entry Modal state
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(assignableMembers[0]?.id || "");
  const [selectedRuleId, setSelectedRuleId] = useState<string>(pointRules[0]?.id || "pr-1");
  const [customAmount, setCustomAmount] = useState<number>(pointRules[0]?.points || 15);
  const [manualReason, setManualReason] = useState<string>("");

  // Reverse Entry Modal state
  const [reversingEntryId, setReversingEntryId] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState<string>("");

  // Editable Point Rules CRUD state
  const [editingRuleValues, setEditingRuleValues] = useState<Record<string, number>>({});
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formRuleLabel, setFormRuleLabel] = useState("");
  const [formRuleCategory, setFormRuleCategory] = useState("Earning");
  const [formRulePoints, setFormRulePoints] = useState(20);
  const [formRuleDescription, setFormRuleDescription] = useState("");
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState("ALL");

  // Appeals resolution reason
  const [appealAdminNote, setAppealAdminNote] = useState<string>(
    "Verified university shuttle breakdown report with HR."
  );

  // Monthly Honours (MotM & 6 Department Champions) state
  const MONTH_OPTIONS = [
    "November 2026",
    "October 2026",
    "September 2026",
    "December 2026",
    "January 2027",
    "February 2027",
    "March 2027",
    "April 2027",
    "May 2027",
    "June 2027",
    "July 2027",
    "August 2027",
  ];
  const [selectedMonth, setSelectedMonth] = useState<string>(
    settings?.activeMotmMonth || "November 2026"
  );
  const [qualitativeScores, setQualitativeScores] = useState<Record<string, number>>({});
  const [selectedMotmIds, setSelectedMotmIds] = useState<string[]>([]);
  const [motmBonusXp, setMotmBonusXp] = useState<number>(50);
  const [broadcastNotif, setBroadcastNotif] = useState<boolean>(true);
  const [motmSearchQuery, setMotmSearchQuery] = useState<string>("");
  const [memberPickerOpen, setMemberPickerOpen] = useState<boolean>(false);
  const [rolloverModalOpen, setRolloverModalOpen] = useState(false);
  const [rolloverTargetMonth, setRolloverTargetMonth] = useState("November 2026");
  const [rolloverRecalculate, setRolloverRecalculate] = useState(true);
  const [showHonoursArchive, setShowHonoursArchive] = useState(false);
  const [motmCitation, setMotmCitation] = useState<string>(
    `Recognized for outstanding scientific dedication, peer collaboration, and exemplary club contribution in ${settings?.activeMotmMonth || "November 2026"}.`
  );

  const crownedMotmMembers = members.filter((m) =>
    m.recognitionLabels?.includes("Member of the Month")
  );

  const filteredMotmMembers = sortedMembers.filter((m) => {
    if (!motmSearchQuery.trim()) return true;
    const q = motmSearchQuery.toLowerCase();
    const dept = departments.find((d) => d.id === m.departmentId);
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.quanterId.toLowerCase().includes(q) ||
      (dept?.name && dept.name.toLowerCase().includes(q)) ||
      (m.levelTitle && m.levelTitle.toLowerCase().includes(q))
    );
  });

  const pendingAppeals = ledger.filter((l) => l.appealStatus === "Pending");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setManualOpen(false);
        setReversingEntryId(null);
        setRuleModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const isAnyOpen = manualOpen || Boolean(reversingEntryId) || ruleModalOpen;
    if (isAnyOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [manualOpen, reversingEntryId, ruleModalOpen]);

  const toggleMotmSelect = (id: string) => {
    setSelectedMotmIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllDeptChampions = () => {
    const topIds = departments
      .map((dept) => {
        const deptMembers = assignableMembers
          .filter((m) => m.departmentId === dept.id)
          .sort((a, b) => b.xpMonth - a.xpMonth);
        return deptMembers[0]?.id;
      })
      .filter(Boolean) as string[];
    setSelectedMotmIds((prev) => Array.from(new Set([...prev, ...topIds])));
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    setMotmCitation(
      `Recognized for outstanding scientific dedication, peer collaboration, and exemplary club contribution in ${newMonth}.`
    );
  };

  const handleRuleSelectChange = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    const found = pointRules.find((r) => r.id === ruleId);
    if (found) setCustomAmount(found.points);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !manualReason.trim()) return;
    const rule = pointRules.find((r) => r.id === selectedRuleId);
    addManualPointsEntry(
      selectedMemberId,
      Number(customAmount),
      rule?.label || "Manual Adjustment",
      manualReason.trim()
    );
    setManualReason("");
    setManualOpen(false);
    setBanner("Immutable ledger entry recorded and member XP balance updated.");
  };


  const handleOpenCreateRule = () => {
    setEditingRuleId(null);
    setFormRuleLabel("");
    setFormRuleCategory("Earning");
    setFormRulePoints(20);
    setFormRuleDescription("");
    setRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule: any) => {
    setEditingRuleId(rule.id);
    setFormRuleLabel(rule.label);
    setFormRuleCategory(rule.category);
    setFormRulePoints(rule.points);
    setFormRuleDescription(rule.description);
    setRuleModalOpen(true);
  };

  const handleSaveRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRuleLabel.trim()) return;

    if (editingRuleId) {
      updatePointRule(editingRuleId, {
        label: formRuleLabel.trim(),
        category: formRuleCategory.trim(),
        points: Number(formRulePoints),
        description: formRuleDescription.trim(),
      });
      setBanner(`Updated rule '${formRuleLabel}'.`);
    } else {
      createPointRule({
        label: formRuleLabel.trim(),
        category: formRuleCategory.trim(),
        points: Number(formRulePoints),
        description: formRuleDescription.trim(),
      });
      setBanner(`Created new point rule '${formRuleLabel}'.`);
    }
    setRuleModalOpen(false);
  };

  const handleReverseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversingEntryId || !reversalReason.trim()) return;
    reversePointsEntry(reversingEntryId, reversalReason.trim());
    setReversingEntryId(null);
    setReversalReason("");
    setBanner("Reversal entry recorded.");
  };

  const handlePublishMotm = (overrideIds?: string[]) => {
    const candidateIds = overrideIds && overrideIds.length > 0 ? overrideIds : selectedMotmIds;

    if (candidateIds.length === 0) {
      setBanner("Please choose or select at least one member to crown.");
      return;
    }

    const championIds = departments
      .map((dept) => {
        const deptMembers = assignableMembers
          .filter((m) => m.departmentId === dept.id)
          .sort((a, b) => b.xpMonth - a.xpMonth);
        return deptMembers[0]?.id;
      })
      .filter(Boolean) as string[];

    const bonus = Number(motmBonusXp) || 50;
    const note =
      motmCitation.trim() ||
      `Member of the Month — ${selectedMonth}: Recognized for outstanding scientific dedication and club contribution`;

    publishMonthlyHonours(
      candidateIds,
      championIds,
      bonus,
      note,
      "HR Administration",
      selectedMonth,
      broadcastNotif
    );

    const candidateNames = members
      .filter((m) => candidateIds.includes(m.id))
      .map((m) => m.fullName)
      .join(", ");

    setBanner(
      `🎉 Successfully crowned ${candidateNames} as Member(s) of the Month for ${selectedMonth} (+${bonus} XP each)!`
    );
    setSelectedMotmIds([]);
  };

  const handleClearMotm = (memberId?: string) => {
    removeMonthlyHonours(memberId);
    if (memberId) {
      const m = members.find((x) => x.id === memberId);
      setBanner(`Honours removed for ${m?.fullName || "member"}.`);
    } else {
      setBanner("All Member of the Month honours have been cleared.");
    }
  };

  return (
    <>
      <div className="space-y-4 max-w-[1500px] mx-auto">
        {/* Top Header — Member App Editorial Style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)]">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
            MERIT LEDGER &amp; MONTHLY RECOGNITION
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
            Points &amp; Honours
          </h1>
          <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
            Audit ledger entries, configure point rules, review appeals, and crown monthly winners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Manual Entry</span>
        </button>
      </div>

      {banner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{banner}</span>
          </div>
          <button type="button" onClick={() => setBanner(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4-Tab Switcher */}
      <div
        role="tablist"
        aria-label="Points and Honours Navigation"
        className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap gap-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "ledger"}
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2 min-h-[42px] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "ledger"
              ? "bg-[#182C4E] text-white shadow-sm ring-1 ring-[#182C4E]/20"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Points Ledger ({ledger.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "rules"}
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2 min-h-[42px] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "rules"
              ? "bg-[#182C4E] text-white shadow-sm ring-1 ring-[#182C4E]/20"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Point Rules ({pointRules.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "appeals"}
          onClick={() => setActiveTab("appeals")}
          className={`px-4 py-2 min-h-[42px] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "appeals"
              ? "bg-[#182C4E] text-white shadow-sm ring-1 ring-[#182C4E]/20"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Appeals Queue</span>
          {pendingAppeals.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
              {pendingAppeals.length}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "motm"}
          onClick={() => setActiveTab("motm")}
          className={`px-4 py-2 min-h-[42px] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "motm"
              ? "bg-[#182C4E] text-white shadow-sm ring-1 ring-[#182C4E]/20"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Monthly Honours</span>
        </button>
      </div>

      {/* TAB 1: IMMUTABLE POINTS LEDGER */}
      {activeTab === "ledger" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#0F1E36]">
                Immutable Points Ledger (+ / − Transactions)
              </h3>
              <p className="text-xs text-slate-500">
                Ledger rows cannot be edited or deleted. Use Reverse Entry to append an audited counter-entry.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Rule</th>
                  <th className="py-3.5 px-4">Reason / Context</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Actor &amp; Date</th>
                  <th className="py-3.5 px-4 text-right">Audited Reversal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {ledger.map((entry) => {
                  const isPositive = entry.amount >= 0;
                  const isReversed = Boolean(entry.reversedByEntryId);
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50/60 ${isReversed ? "opacity-60 bg-slate-50" : ""}`}
                    >
                      <td className="py-3.5 px-4 font-bold text-[#0F1E36]">{entry.memberName}</td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <span
                          className={
                            isPositive
                              ? "inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono text-[11px] font-bold tabular-nums whitespace-nowrap"
                              : "inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 font-mono text-[11px] font-bold tabular-nums whitespace-nowrap"
                          }
                        >
                          {isPositive ? `+${entry.amount}` : entry.amount} XP
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {entry.ruleLabel}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                        {entry.reason}
                        {entry.appealStatus && entry.appealStatus !== "None" && (
                          <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                            Appeal: {entry.appealStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          {entry.source}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums">
                        <div className="font-medium text-slate-700">{entry.actorName}</div>
                        <div>{entry.date}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isReversed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 tabular-nums">
                            <RotateCcw className="w-3 h-3" />
                            <span>Reversed ({entry.reversedByEntryId})</span>
                          </span>
                        ) : entry.source === "Reversal" ? (
                          <span className="text-xs font-bold text-indigo-600">
                            Counter-Entry
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReversingEntryId(entry.id);
                              setReversalReason("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reverse Entry</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EDITABLE POINT RULES TABLE WITH CATEGORY CRUD */}
      {activeTab === "rules" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#0F1E36]">
                Official Point Rules &amp; Categories ({pointRules.length} Rules)
              </h3>
              <p className="text-xs text-slate-500">
                Full CRUD: create custom rules, modify categories, edit XP values, and remove obsolete rules.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateRule}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 text-white font-bold text-xs shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Point Rule</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            {["ALL", ...Array.from(new Set(pointRules.map((r) => r.category)))].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setRuleCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  ruleCategoryFilter === cat
                    ? "bg-[#182C4E] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Rule ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Official Rule Label</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Points Value</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {pointRules
                  .filter((r) => ruleCategoryFilter === "ALL" || r.category === ruleCategoryFilter)
                  .map((rule) => {
                    const currentVal =
                      editingRuleValues[rule.id] !== undefined
                        ? editingRuleValues[rule.id]
                        : rule.points;

                    return (
                      <tr key={rule.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 text-xs font-mono text-slate-400">{rule.id}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              rule.category === "Earning"
                                ? "bg-emerald-50 text-emerald-700"
                                : rule.category === "Deduction"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-sky-50 text-sky-700"
                            }`}
                          >
                            {rule.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#0F1E36]">{rule.label}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">{rule.description}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                currentVal >= 0
                                  ? "inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono text-[11px] font-bold tabular-nums whitespace-nowrap"
                                  : "inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 font-mono text-[11px] font-bold tabular-nums whitespace-nowrap"
                              }
                            >
                              {currentVal >= 0 ? `+${currentVal}` : currentVal} XP
                            </span>
                            <input
                              type="number"
                              step={5}
                              value={currentVal}
                              onChange={(e) =>
                                setEditingRuleValues((prev) => ({
                                  ...prev,
                                  [rule.id]: Number(e.target.value),
                                }))
                              }
                              className="w-20 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold tabular-nums bg-slate-50/70 focus:bg-white focus:border-[#182C4E] focus:outline-none"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                updatePointRule(rule.id, Number(currentVal), rule.label);
                                setBanner(`Updated point rule '${rule.label}' to ${currentVal} XP.`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer"
                              title="Quick Save XP"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditRule(rule)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                              title="Edit All Details"
                            >
                              <span>Edit</span>
                            </button>
                            {pointRules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete rule '${rule.label}'?`)) {
                                    deletePointRule(rule.id);
                                    setBanner(`Deleted rule '${rule.label}'.`);
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                                title="Delete Rule"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 48h MEMBER APPEALS QUEUE */}
      {activeTab === "appeals" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-extrabold text-[#0F1E36]">
              48-Hour Member Point Deduction Appeals Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Members may appeal any point deduction within {settings.pointsAppealWindowHours} hours. Accepting an appeal automatically writes a reversal entry to the ledger.
            </p>
          </div>

          {ledger.filter((l) => l.appealStatus && l.appealStatus !== "None").length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/90 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-display font-extrabold text-sm text-[#0F1E36]">
                No Pending Point Deduction Appeals
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All member point entries and deductions are currently uncontested. New appeals submitted within the {settings.pointsAppealWindowHours}-hour window will appear here for administrative adjudication.
              </p>
            </div>
          )}

          {ledger.filter((l) => l.appealStatus && l.appealStatus !== "None").map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      item.amount >= 0
                        ? "inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono text-[11px] font-bold tabular-nums whitespace-nowrap"
                        : "inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 font-mono text-[11px] font-bold tabular-nums whitespace-nowrap"
                    }
                  >
                    {item.amount > 0 ? `+${item.amount}` : item.amount} XP
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                    {item.ruleLabel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Appeal Status: {item.appealStatus}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">{item.date}</span>
                </div>
                <div className="text-base font-extrabold text-[#0F1E36]">
                  {item.memberName} — Appeal against &ldquo;{item.ruleLabel}&rdquo;
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Original Deduction Reason:</strong> {item.reason} (by {item.actorName})
                </p>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                  <strong>Member Appeal Statement (within 48h):</strong> {item.appealReason}
                </div>
              </div>

              {item.appealStatus === "Pending" ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={appealAdminNote}
                    onChange={(e) => setAppealAdminNote(e.target.value)}
                    placeholder="HR Resolution note..."
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs w-64"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      resolvePointsAppeal(
                        item.id,
                        "Accepted",
                        appealAdminNote || "Valid excuse verified"
                      );
                      setBanner(
                        `Appeal accepted for ${item.memberName}: Auto-reversed ${item.amount} XP deduction in Ledger!`
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Accept Appeal (Auto-Reverse)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resolvePointsAppeal(
                        item.id,
                        "Rejected",
                        appealAdminNote || "Deduction upheld per Internal Law"
                      );
                      setBanner(`Appeal rejected for ${item.memberName}.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold"
                  >
                    Reject Appeal
                  </button>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-slate-500">
                  Resolved ({item.appealStatus})
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MONTHLY "MEMBER OF THE MONTH" & "6 DEPARTMENT CHAMPIONS" DESK */}
      {activeTab === "motm" && (
        <div className="space-y-4">
          {/* Monthly Cycle Management & Ledger Sync Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-black text-sm sm:text-base text-[#0F1E36]">
                    Monthly Scoring Cycle
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                    Active: {settings?.activeMotmMonth || selectedMonth}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly scores (<code className="font-mono">xpMonth</code>) calculate member activity and determine Department Nominees. Total &amp; Season XP are permanently safe.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  syncMonthlyScoresWithLedger(selectedMonth);
                  setBanner(
                    `✓ Recalculated and synchronized all members' Monthly XP from the verified ${selectedMonth} ledger!`
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Recalculate all members' Monthly XP directly from verified ledger entries"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Audit &amp; Sync with Ledger</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRolloverTargetMonth(
                    (settings?.activeMotmMonth || selectedMonth) === "October 2026"
                      ? "November 2026"
                      : "December 2026"
                  );
                  setRolloverModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:brightness-110 text-white text-xs font-display font-extrabold shadow-sm transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Month Cycle</span>
              </button>
            </div>
          </div>

          {/* Historical Laureates Archive (if past months exist) */}
          {settings?.monthlyHonoursHistory && settings.monthlyHonoursHistory.length > 0 && (
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowHonoursArchive((v) => !v)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Past Honours Archive ({settings.monthlyHonoursHistory.length} Month{settings.monthlyHonoursHistory.length > 1 ? "s" : ""})
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#0284C7]">
                  {showHonoursArchive ? "Hide Archive" : "View Past Laureates"}
                </span>
              </button>

              {showHonoursArchive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                  {settings.monthlyHonoursHistory.map((item) => (
                    <div
                      key={item.month}
                      className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-extrabold text-[#0F1E36]">
                          {item.month}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          +{item.bonusXp} XP Awarded
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 font-semibold">
                        ★ Laureates: {item.memberNames?.join(", ") || "Recorded"}
                      </div>
                      {item.citation && (
                        <p className="text-[11px] text-slate-500 italic">
                          &ldquo;{item.citation}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Crowned MOTM Card */}
          {crownedMotmMembers.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-amber-900 font-display font-extrabold text-sm sm:text-base">
                  <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm">
                    <Crown className="w-5 h-5 fill-current" />
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>Active Member(s) of the Month</span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-200/90 text-amber-900 border border-amber-300">
                      {settings?.activeMotmMonth || selectedMonth}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-800">
                    {crownedMotmMembers.length} {crownedMotmMembers.length === 1 ? "Laureate" : "Co-Laureates"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleClearMotm()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear All Honours</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {crownedMotmMembers.map((m) => {
                  const dept = departments.find((d) => d.id === m.departmentId);
                  return (
                    <div
                      key={m.id}
                      className="bg-white/90 backdrop-blur rounded-xl p-3.5 border border-amber-200/90 flex items-center justify-between gap-3 shadow-xs hover:border-amber-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces"}
                          alt={m.fullName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-display font-extrabold text-slate-900 text-sm truncate flex items-center gap-1.5">
                            <span className="truncate">{m.fullName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold shrink-0">
                              ★ MOTM
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            {dept?.name || "General"} · {m.quanterId}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                              Lvl {m.level}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              +{m.xpMonth} XP Month
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClearMotm(m.id)}
                        title="Remove title from this member"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Configuration Card: Crown Multiple Members with Custom Target Month, XP & Citation */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Crown className="w-4 h-4" />
                </span>
                <h3 className="font-display text-base font-extrabold text-[#0F1E36]">
                  Crown Member of the Month (Multi-Member &amp; Month Selection)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-9">
                Select the target honour month, search and pick multiple student members simultaneously, configure bonus XP, and publish official recognition club-wide.
              </p>
            </div>

            {/* Row 1: Target Month, XP Amount, and In-App Broadcast */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-1 bg-[#F8FAFD] p-3.5 rounded-xl border border-slate-200/70">
              {/* Target Month Selector */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Target Month / Honour Period</span>
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/90 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 cursor-pointer shadow-2xs"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reward Bonus XP */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bonus XP per Crowned Member</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={10}
                    max={500}
                    step={5}
                    value={motmBonusXp}
                    onChange={(e) => setMotmBonusXp(Number(e.target.value))}
                    className="w-20 px-3 py-2 rounded-xl border border-slate-200/90 bg-white text-xs font-mono font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 shadow-2xs"
                  />
                  <div className="flex items-center gap-1">
                    {[50, 75, 100, 150].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMotmBonusXp(preset)}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                          motmBonusXp === preset
                            ? "bg-[#0284C7] text-white shadow-2xs"
                            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70"
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Broadcast Notification Toggle */}
              <div className="md:col-span-3 flex items-end">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 cursor-pointer w-full shadow-2xs hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={broadcastNotif}
                    onChange={(e) => setBroadcastNotif(e.target.checked)}
                    className="w-4 h-4 text-[#0284C7] rounded cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      Broadcast In-App Alert
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Send to all members
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Row 2: Official Citation */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                Official Citation / Commendation Note
              </label>
              <input
                type="text"
                value={motmCitation}
                onChange={(e) => setMotmCitation(e.target.value)}
                placeholder="e.g. Recognized for outstanding scientific dedication and club contribution..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-[#F8FAFD] text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20"
              />
            </div>

            {/* Row 3: Multi-Member Selection Desk & Staging Tray */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Selected Candidates ({selectedMotmIds.length})
                  </span>
                  {selectedMotmIds.length > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                      +{selectedMotmIds.length * motmBonusXp} XP total
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllDeptChampions}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Select All 6 Dept Champions</span>
                  </button>
                  {selectedMotmIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedMotmIds([])}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear Selection</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Staging Chips Tray */}
              {selectedMotmIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-200">
                  {selectedMotmIds.map((id) => {
                    const m = members.find((x) => x.id === id);
                    if (!m) return null;
                    const dept = departments.find((d) => d.id === m.departmentId);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-white border border-amber-300 text-slate-900 shadow-2xs text-xs font-semibold"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"}
                          alt={m.fullName}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400"
                        />
                        <span className="font-bold">{m.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({dept?.name || "General"})
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMotmSelect(id)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove from selection"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Search & Filter Roster for Multi-Selection */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={motmSearchQuery}
                    onChange={(e) => setMotmSearchQuery(e.target.value)}
                    placeholder="Search by member name, ID (e.g. QNT-001), or department..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200/90 bg-[#F8FAFD] text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                  {motmSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMotmSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Scrollable Member Multi-Select List */}
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200/90 divide-y divide-slate-100 bg-white">
                  {filteredMotmMembers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No members match &quot;{motmSearchQuery}&quot;
                    </div>
                  ) : (
                    filteredMotmMembers.map((m) => {
                      const isSelected = selectedMotmIds.includes(m.id);
                      const isCrowned = m.recognitionLabels?.includes("Member of the Month");
                      const dept = departments.find((d) => d.id === m.departmentId);

                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMotmSelect(m.id)}
                          className={`flex items-center justify-between p-2.5 sm:px-3 hover:bg-slate-50 transition cursor-pointer select-none ${
                            isSelected ? "bg-sky-50/70" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"}
                                alt={m.fullName}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                              />
                              {isCrowned && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-[8px] font-black shadow-xs">
                                  ★
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-display font-extrabold text-xs text-[#0F1E36] flex items-center gap-1.5 truncate">
                                <span className="truncate">{m.fullName}</span>
                                {isCrowned && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                                    MOTM
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate">
                                {dept?.name || "Member"} · {m.quanterId} · Lvl {m.level} {m.levelTitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                              +{m.xpMonth} XP
                            </span>
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                                isSelected
                                  ? "bg-[#0284C7] border-[#0284C7] text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Crowning CTA Button */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                {selectedMotmIds.length === 0 ? (
                  <span>Select one or more members above to crown them.</span>
                ) : (
                  <span className="font-bold text-[#0F1E36]">
                    Ready to crown {selectedMotmIds.length} laureate{selectedMotmIds.length > 1 ? "s" : ""} for {selectedMonth}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handlePublishMotm()}
                disabled={selectedMotmIds.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFE500] hover:bg-[#FDE047] disabled:opacity-40 disabled:cursor-not-allowed text-[#09192F] font-display font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>
                  Crown {selectedMotmIds.length > 0 ? `${selectedMotmIds.length} Member(s)` : "Members"} for {selectedMonth} (+{motmBonusXp} XP each)
                </span>
              </button>
            </div>
          </div>

          {/* 6 Department Champions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-3.5 bg-[#F8FAFD] border-b border-slate-200/90 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Department Top Candidates &amp; Nominees
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select candidate(s) directly to crown them alongside Department Champions for {selectedMonth}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#0284C7]">
                  {selectedMotmIds.length} candidate(s) staged
                </span>
                {selectedMotmIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handlePublishMotm()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFE500] hover:bg-[#FDE047] text-[#09192F] font-bold text-[11px] shadow-2xs transition cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Crown Staged ({selectedMotmIds.length})</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFD] border-b border-slate-200/90 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Top Candidate</th>
                    <th className="py-3 px-4">Seniority</th>
                    <th className="py-3 px-4 text-center">Monthly XP</th>
                    <th className="py-3 px-4">Attendance &amp; On-Time</th>
                    <th className="py-3 px-4 text-center">Qualitative Score</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EDF8]">
                  {departments.map((dept) => {
                    const candidate =
                      assignableMembers
                        .filter((m) => m.departmentId === dept.id)
                        .sort((a, b) => b.xpMonth - a.xpMonth)[0] || null;
                    if (!candidate) {
                      return (
                        <tr key={dept.id} className="hover:bg-[#F8FAFD] transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{dept.name}</td>
                          <td colSpan={6} className="py-3 px-4 text-slate-400 italic">
                            No eligible student candidates in this department yet.
                          </td>
                        </tr>
                      );
                    }
                    const qualScore = qualitativeScores[candidate.id] ?? 92;
                    const isSelected = selectedMotmIds.includes(candidate.id);
                    const isAlreadyCrowned = candidate.recognitionLabels?.includes("Member of the Month");

                    return (
                      <tr key={dept.id} className="hover:bg-[#F8FAFD] transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">{dept.name}</td>
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-[#0F1E36] flex items-center gap-1.5">
                            <span>{candidate.fullName}</span>
                            {isAlreadyCrowned && (
                              <span className="text-[9px] font-mono font-bold px-1 rounded bg-amber-100 text-amber-800">
                                MOTM
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {candidate.quanterId}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                            Lvl {candidate.level} · {candidate.levelTitle}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono text-[11px] font-bold tabular-nums whitespace-nowrap">
                            +{candidate.xpMonth} XP
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {candidate.attendanceRate}% att. · {candidate.onTimeTaskRate}% on-time
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={50}
                            max={100}
                            value={qualScore}
                            onChange={(e) =>
                              setQualitativeScores((prev) => ({
                                ...prev,
                                [candidate.id]: Number(e.target.value),
                              }))
                            }
                            className="w-16 px-2 py-1 rounded-lg border border-slate-200/90 text-xs font-mono font-bold text-center"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handlePublishMotm([candidate.id])}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition cursor-pointer"
                            >
                              Crown Solo
                            </button>
                            <label className="inline-flex items-center gap-1 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleMotmSelect(candidate.id)}
                                className="w-3.5 h-3.5 text-[#0284C7] rounded cursor-pointer"
                              />
                              <span
                                className={`text-[10px] font-bold ${
                                  isSelected ? "text-[#0284C7]" : "text-slate-400"
                                }`}
                              >
                                {isSelected ? "Selected" : "Select"}
                              </span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* MANUAL POINT ENTRY MODAL (outside .animate-rise for centered viewport popup) */}
      {manualOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">+ Manual Point Entry</h2>
                <p className="text-xs text-sky-200">
                  Appends an audited transaction to the Immutable Points Ledger
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                aria-label="Close manual point entry dialog"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Member
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Press A–Z to jump to name
                  </span>
                </div>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(e, sortedMembers, (memberId: string) =>
                      setSelectedMemberId(memberId)
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  {sortedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId} · Current: {m.xpTotal} XP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Official Point Rule
                </label>
                <select
                  value={selectedRuleId}
                  onChange={(e) => handleRuleSelectChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  {pointRules.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} ({r.points > 0 ? `+${r.points}` : r.points} XP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  XP Amount (+ for Earning, − for Deduction)
                </label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-extrabold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Describe the verified achievement or breach..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualOpen(false)}
                  className="h-11 min-h-[44px] px-5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition active:scale-95 flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 min-h-[44px] px-6 rounded-xl text-sm font-bold bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white cursor-pointer transition active:scale-95 flex items-center justify-center shadow-xs"
                >
                  Append Ledger Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVERSE ENTRY MODAL */}
      {reversingEntryId && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-200" />
                <div>
                  <h2 className="text-lg font-extrabold">Reverse Ledger Entry</h2>
                  <p className="text-xs text-rose-200">
                    Original entry remains visible; appends an offsetting counter-entry
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReversingEntryId(null)}
                aria-label="Close reverse entry dialog"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReverseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mandatory Reversal Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="Explain why this entry is being reversed..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReversingEntryId(null)}
                  className="h-11 min-h-[44px] px-5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 min-h-[44px] px-5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer shadow-sm"
                >
                  Confirm Audited Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Point Rule Modal */}
      {ruleModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-rise">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#0284C7]/15 text-[#0284C7] flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {editingRuleId ? "Edit Point Rule" : "Create New Point Rule"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRuleModalOpen(false)}
                aria-label="Close point rule dialog"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRuleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
                  Rule Label
                </label>
                <input
                  type="text"
                  required
                  value={formRuleLabel}
                  onChange={(e) => setFormRuleLabel(e.target.value)}
                  placeholder="e.g. Workshop Speaker Hospitality"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formRuleCategory}
                    onChange={(e) => setFormRuleCategory(e.target.value)}
                    placeholder="Earning, Deduction, Bonus..."
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
                    Points (+ / −)
                  </label>
                  <input
                    type="number"
                    step={5}
                    required
                    value={formRulePoints}
                    onChange={(e) => setFormRulePoints(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8] font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
                  Description / Justification
                </label>
                <textarea
                  rows={2}
                  value={formRuleDescription}
                  onChange={(e) => setFormRuleDescription(e.target.value)}
                  placeholder="Official explanation and criteria for applying this XP rule..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRuleModalOpen(false)}
                  className="h-11 min-h-[44px] px-5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 min-h-[44px] px-5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 text-white font-extrabold transition cursor-pointer shadow-sm"
                >
                  {editingRuleId ? "Save Changes" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MONTHLY CYCLE ROLLOVER MODAL */}
      {rolloverModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-rise">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-display font-extrabold text-sm sm:text-base">
                    Rollover to New Month Cycle
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Archive current laureates and initialize monthly scores for the new period.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRolloverModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-700 space-y-1.5">
                <p className="font-bold text-[#0F1E36]">What happens during monthly rollover?</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>Current crowned laureates are archived into the <strong>Honours History</strong> registry.</li>
                  <li>Active &ldquo;Member of the Month&rdquo; titles are cleared so the new month starts fresh.</li>
                  <li><strong>Total XP (Lifetime rank)</strong> and <strong>Season XP</strong> are <strong>100% safe and untouched</strong>.</li>
                  <li>Monthly XP (<code className="font-mono">xpMonth</code>) is re-initialized for the new month.</li>
                </ul>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
                  Select Target New Month
                </label>
                <select
                  value={rolloverTargetMonth}
                  onChange={(e) => setRolloverTargetMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#F8FAFD] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 cursor-pointer"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFD] border border-slate-200/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rolloverRecalculate}
                    onChange={(e) => setRolloverRecalculate(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#0284C7] rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Recalculate scores from verified {rolloverTargetMonth} ledger entries
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-relaxed">
                      If checked, members who already earned points in {rolloverTargetMonth} will have their Monthly XP set to their verified ledger total. If unchecked, all members start at 0 XP.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRolloverModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rolloverMonthlyCycle(rolloverTargetMonth, rolloverRecalculate);
                    setSelectedMonth(rolloverTargetMonth);
                    setRolloverModalOpen(false);
                    setBanner(
                      `🎉 Successfully rolled over to ${rolloverTargetMonth}! Active titles archived and monthly scores initialized.`
                    );
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:brightness-110 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Confirm Rollover to {rolloverTargetMonth}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
