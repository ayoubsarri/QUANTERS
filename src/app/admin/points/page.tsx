"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  Coins,
  Crown,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Scale,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
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
  const [qualitativeScores, setQualitativeScores] = useState<Record<string, number>>({});
  const [selectedMotmIds, setSelectedMotmIds] = useState<string[]>([]);
  const [motmDirectMemberId, setMotmDirectMemberId] = useState<string>("");
  const [motmBonusXp, setMotmBonusXp] = useState<number>(50);
  const [motmCitation, setMotmCitation] = useState<string>(
    "Recognized for outstanding scientific dedication, peer collaboration, and exemplary club contribution."
  );

  const crownedMotmMembers = members.filter((m) =>
    m.recognitionLabels?.includes("Member of the Month")
  );

  const pendingAppeals = ledger.filter((l) => l.appealStatus === "Pending");

  const toggleMotmSelect = (id: string) => {
    setSelectedMotmIds((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((x) => x !== id) : prev) : [...prev, id]
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

  const handlePublishMotm = (targetId?: string) => {
    const candidateIds = targetId
      ? [targetId]
      : motmDirectMemberId
      ? [motmDirectMemberId]
      : selectedMotmIds;

    if (candidateIds.length === 0) {
      setBanner("Please choose a member from the dropdown or select candidate(s) from the table.");
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
    const note = motmCitation.trim() || "Published Monthly Club-Wide Member of the Month";

    candidateIds.forEach((id) => {
      publishMonthlyHonours(id, championIds, bonus, note);
    });

    const candidateNames = members
      .filter((m) => candidateIds.includes(m.id))
      .map((m) => m.fullName)
      .join(", ");

    setBanner(
      `Crowned ${candidateNames} as Member of the Month (+${bonus} XP) and updated Department Champions.`
    );
    setSelectedMotmIds([]);
    setMotmDirectMemberId("");
  };

  const handleClearMotm = (memberId?: string) => {
    removeMonthlyHonours(memberId);
    setBanner("Member of the Month honours have been cleared.");
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
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "ledger"
              ? "bg-[#182C4E] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Points Ledger ({ledger.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "rules"
              ? "bg-[#182C4E] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Point Rules ({pointRules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("appeals")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "appeals"
              ? "bg-[#182C4E] text-white shadow-sm"
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
          onClick={() => setActiveTab("motm")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "motm"
              ? "bg-[#182C4E] text-white shadow-sm"
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
          {/* Active Crowned MOTM Card */}
          {crownedMotmMembers.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-amber-900 font-display font-extrabold text-sm sm:text-base">
                  <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm">
                    <Crown className="w-5 h-5 fill-current" />
                  </span>
                  <span>Active Member of the Month</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleClearMotm()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset / Clear Title</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {crownedMotmMembers.map((m) => {
                  const dept = departments.find((d) => d.id === m.departmentId);
                  return (
                    <div
                      key={m.id}
                      className="bg-white/90 backdrop-blur rounded-xl p-3.5 border border-amber-200/90 flex items-center justify-between gap-3 shadow-xs"
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
                            <span>{m.fullName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                              ★ MOTM
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            {dept?.name || "General"} · {m.quanterId}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                              Level {m.level} · {m.levelTitle}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              +{m.xpMonth} XP Month
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {m.xpTotal} XP Total
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

          {/* Configuration Card: Crown Any Member with Custom Reward XP & Citation */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h3 className="font-display text-sm sm:text-base font-extrabold text-[#0F1E36]">
                  Crown &amp; Configure Member of the Month
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 ml-8">
                Crown any active member from the roster, customize their bonus merit points, and attach an official commendation citation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              {/* Select Any Member */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                  Select Member to Crown
                </label>
                <select
                  value={motmDirectMemberId}
                  onChange={(e) => setMotmDirectMemberId(e.target.value)}
                  onKeyDown={(e) => handleMemberSelectKeyDown(e, sortedMembers, setMotmDirectMemberId)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/90 bg-[#F8FAFD] text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 cursor-pointer"
                >
                  <option value="">-- Choose any member ({sortedMembers.length} available) --</option>
                  {sortedMembers.map((m) => {
                    const dept = departments.find((d) => d.id === m.departmentId);
                    return (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({dept?.name || "Member"} · Lvl {m.level} {m.levelTitle} · {m.xpMonth} XP month)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Reward Bonus XP */}
              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                  Reward XP Amount
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={10}
                    max={500}
                    step={5}
                    value={motmBonusXp}
                    onChange={(e) => setMotmBonusXp(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-200/90 bg-[#F8FAFD] text-xs font-mono font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                  <div className="flex items-center gap-1">
                    {[50, 75, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMotmBonusXp(preset)}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                          motmBonusXp === preset
                            ? "bg-[#0284C7] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Commendation Citation */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                  Official Citation / Reason
                </label>
                <input
                  type="text"
                  value={motmCitation}
                  onChange={(e) => setMotmCitation(e.target.value)}
                  placeholder="e.g. Recognized for leading QSSC workshops..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/90 bg-[#F8FAFD] text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handlePublishMotm()}
                disabled={!motmDirectMemberId && selectedMotmIds.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFE500] hover:bg-[#FDE047] disabled:opacity-50 disabled:cursor-not-allowed text-[#09192F] font-display font-extrabold text-xs shadow-sm transition cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>
                  Crown Member of the Month (+{motmBonusXp} XP)
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
                  Select candidate(s) directly to crown them alongside Department Champions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#0284C7]">
                  {selectedMotmIds.length} candidate(s) selected
                </span>
                {selectedMotmIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handlePublishMotm()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFE500] hover:bg-[#FDE047] text-[#09192F] font-bold text-[11px] shadow-2xs transition cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Publish ({selectedMotmIds.length})</span>
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
                              onClick={() => handlePublishMotm(candidate.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition cursor-pointer"
                            >
                              Crown
                            </button>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
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
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
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
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white"
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
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
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
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white"
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
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
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
                  className="px-3.5 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 text-white font-extrabold transition cursor-pointer shadow-xs"
                >
                  {editingRuleId ? "Save Changes" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
