"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  FolderGit2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { HexagonBadgeCard } from "@/components/badges/HexagonBadgeCard";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { Badge } from "@/lib/types/erp";
import { useTranslation } from "@/lib/i18n/useTranslation";

type StatusFilter = "All" | "Unlocked" | "In Progress" | "Locked";
type CategoryFilter =
  | "All"
  | "Hard Skills"
  | "Soft Skills"
  | "Science"
  | "Technology";

const STATUS_PILLS: { key: StatusFilter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Unlocked", label: "Unlocked" },
  { key: "In Progress", label: "In Progress" },
  { key: "Locked", label: "Locked" },
];

const CATEGORY_PILLS: CategoryFilter[] = [
  "All",
  "Hard Skills",
  "Soft Skills",
  "Science",
  "Technology",
];

export default function MobileBadgesPage() {
  const { t, lang, isRtl } = useTranslation();
  const badges = useQuantersStore((s) => s.badges);
  const exams = useQuantersStore((s) => s.exams);
  const projectSubmissions = useQuantersStore((s) => s.projectSubmissions);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const examCompletions = useQuantersStore((s) => s.examCompletions || []);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const activeBadges = badges.filter((b) => !b.archived);
  const unlockedCount = activeBadges.filter(
    (b) => b.memberState === "Unlocked"
  ).length;
  const lockedCount = activeBadges.filter(
    (b) => b.memberState === "Locked"
  ).length;

  const filteredBadges = activeBadges.filter((b) => {
    const matchesStatus =
      statusFilter === "All" || b.memberState === statusFilter;
    const isSoft =
      b.skillType === "Soft Skill" ||
      b.category === "Soft Skills" ||
      b.category === "Leadership" ||
      b.category === "Public Speaking" ||
      b.category === "Scientific Writing" ||
      b.category === "Logistics & Ops";
    const matchesCategory =
      categoryFilter === "All" ||
      (categoryFilter === "Hard Skills" && !isSoft) ||
      (categoryFilter === "Soft Skills" && isSoft) ||
      b.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const matchingExam = selectedBadge
    ? exams.find((e) => e.badgeId === selectedBadge.id)
    : undefined;

  return (
    <MobileAppShell>
      <div className="px-4 pt-3 pb-6 sm:px-6 space-y-4">
        {/* Top Cosmic Summary Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-[#0B1528] border border-[#2B4875]/60 shadow-[0_16px_38px_rgba(11,21,40,0.26)] text-white animate-rise">
          <img
            src="/brand/hero_rank_banner.webp"
            alt="QUANTERS Cosmic Badges Banner"
            className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528]/96 via-[#101F38]/76 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="max-w-[68%]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#182C4E]/90 backdrop-blur-md border border-[#38BDF8]/35 text-xs font-bold font-mono text-[#7DD3FC] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{isRtl ? "الشارات والاعتمادات" : "SKILL CREDENTIALS"}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                {isRtl ? "شارات الكفاءة والخبرة" : "My Skill Badges"}
              </h1>
              <p className="text-xs sm:text-sm text-sky-100/90 font-medium mt-1 font-sans drop-shadow">
                {isRtl
                  ? `${unlockedCount} مكتسبة · ${lockedCount} مغلقة · ${CATEGORY_PILLS.length - 1} مسارات`
                  : `${unlockedCount} Unlocked · ${lockedCount} Locked · ${CATEGORY_PILLS.length - 1} Tracks`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Header & Quick Exam Link */}
        <div
          className="flex items-center justify-between animate-rise"
          style={{ animationDelay: "20ms" }}
        >
          <h2 className="text-sm sm:text-base font-extrabold font-display text-[#0F1E36]">
            {isRtl ? "تصفية الشارات" : "Filter Credentials"}
          </h2>
          <Link
            href="/exams"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F0F6FF] text-[#182C4E] text-xs font-extrabold font-display border border-[#D5E3F5] hover:bg-[#E0F2FE] active:scale-[0.98] transition cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-[#0284C7]" />
            <span>{isRtl ? "مركز الاختبارات" : "Exams Hub"}</span>
          </Link>
        </div>

        {/* Row 1: Status Pills */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5 animate-rise"
          style={{ animationDelay: "40ms" }}
        >
          {STATUS_PILLS.map((pill) => {
            const active = statusFilter === pill.key;
            const pillDisplay = isRtl
              ? pill.key === "All"
                ? "الكل"
                : pill.key === "Unlocked"
                ? "مكتسبة"
                : pill.key === "In Progress"
                ? "قيد الإنجاز"
                : "مغلقة"
              : pill.label;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-display whitespace-nowrap active:scale-[0.98] transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white shadow-[0_4px_12px_rgba(16,31,56,0.2)] border border-[#2B4875]/60"
                    : "bg-white text-slate-600 border border-slate-200/90 hover:bg-[#F0F6FF] hover:text-[#0F1E36]"
                }`}
              >
                {pillDisplay}
              </button>
            );
          })}
        </div>

        {/* Row 2: Category Pills */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5 animate-rise"
          style={{ animationDelay: "60ms" }}
        >
          {CATEGORY_PILLS.map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-display whitespace-nowrap active:scale-[0.98] transition-all cursor-pointer ${
                  active
                    ? "bg-[#F0F6FF] text-[#182C4E] border border-[#38BDF8]/60 shadow-2xs"
                    : "bg-white/80 text-slate-500 border border-slate-200/80 hover:bg-white hover:text-[#0F1E36]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Hexagonal Badge Grid Container */}
        <div
          className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-[0_4px_18px_rgba(15,30,54,0.04)] animate-rise"
          style={{ animationDelay: "80ms" }}
        >
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
            {filteredBadges.map((badge) => (
              <HexagonBadgeCard
                key={badge.id}
                badge={badge}
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">
              No badges match the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* Badge Detail Sheet */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[420px] max-h-[78dvh] sm:max-h-[82dvh] rounded-2xl bg-white overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-rise"
          >
            <div className="bg-gradient-to-r from-[#182C4E] to-[#101F38] text-white p-5 relative flex items-center gap-4 border-b border-[#2B4875]/60">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="bg-white/10 rounded-xl p-1.5 border border-white/15 shrink-0">
                <HexagonBadgeCard badge={selectedBadge} />
              </div>

              <div className="min-w-0 pr-6">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-[#38BDF8]/20 text-[#7DD3FC] border border-[#38BDF8]/35 uppercase tracking-wider">
                  {selectedBadge.category}
                </span>
                <h2 className="mt-1.5 text-lg font-black leading-tight text-white">
                  {selectedBadge.name}
                </h2>
                <p className="mt-0.5 text-xs text-[#7DD3FC] font-mono font-bold">
                  +{selectedBadge.xpReward} XP · {selectedBadge.memberState}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <p className="text-slate-700 leading-relaxed font-medium">
                {selectedBadge.description}
              </p>

              <div className="p-3.5 rounded-xl bg-[#F0F6FF] border border-[#D5E3F5] space-y-1">
                <div className="font-extrabold text-[#0F1E36] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Verification Criteria</span>
                </div>
                <p className="text-xs text-slate-600">
                  {selectedBadge.criteriaText}
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600">Qualification Progress</span>
                  <span className="text-[#182C4E] font-mono font-extrabold tabular-nums">
                    {selectedBadge.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#182C4E] to-[#38BDF8] transition-all duration-500"
                    style={{ width: `${selectedBadge.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Earned by {selectedBadge.awardedCount} Quanters
                </span>
                {selectedBadge.awardedDate && (
                  <span className="text-[#0284C7] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                    Unlocked {selectedBadge.awardedDate}
                  </span>
                )}
              </div>

              {/* Dual Requirements 2-Step Checklist */}
              {selectedBadge && (() => {
                const isDual =
                  selectedBadge.requirementType === "both" ||
                  (selectedBadge.earningMethods.includes("exam") && selectedBadge.earningMethods.includes("project"));
                if (!isDual) return null;

                const examPassed = examCompletions.some(
                  (c) => c.memberId === currentMemberId && (c.badgeId === selectedBadge.id || c.examId === matchingExam?.id) && c.passed
                );
                const projectSub = projectSubmissions.find(
                  (s) => s.memberId === currentMemberId && s.badgeId === selectedBadge.id
                );
                const projectApproved = projectSub?.status === "Approved";
                const projectPending = projectSub?.status === "Pending Review";

                return (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Dual Requirements (Both Needed)</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {examPassed && projectApproved ? "Completed (2/2)" : examPassed || projectApproved ? "In Progress (1/2)" : "0/2 Steps"}
                      </span>
                    </div>

                    {/* Step 1: Online Exam */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${examPassed ? "bg-emerald-50/70 border-emerald-200" : "bg-white border-slate-200"}`}>
                      <div className="flex items-center gap-2">
                        {examPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                        <span className={examPassed ? "font-bold text-emerald-900" : "font-semibold text-slate-700"}>
                          Step 1: Pass Online Exam
                        </span>
                      </div>
                      {examPassed ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded">Passed ✓</span>
                      ) : matchingExam ? (
                        <Link href={`/exams/${matchingExam.id}`} className="text-[11px] font-bold text-[#0284C7] hover:underline">
                          Take Exam →
                        </Link>
                      ) : (
                        <Link href="/exams" className="text-[11px] font-bold text-[#0284C7] hover:underline">
                          Exams Hub →
                        </Link>
                      )}
                    </div>

                    {/* Step 2: Practical Project */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${projectApproved ? "bg-emerald-50/70 border-emerald-200" : projectPending ? "bg-amber-50/70 border-amber-200" : "bg-white border-slate-200"}`}>
                      <div className="flex items-center gap-2">
                        {projectApproved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : projectPending ? (
                          <Clock className="w-4 h-4 text-amber-600" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                        <span className={projectApproved ? "font-bold text-emerald-900" : projectPending ? "font-bold text-amber-900" : "font-semibold text-slate-700"}>
                          Step 2: Submit Project
                        </span>
                      </div>
                      {projectApproved ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded">Approved ✓</span>
                      ) : projectPending ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-white/80 px-2 py-0.5 rounded">Under Review ⏳</span>
                      ) : (
                        <Link href="/projects/submit" className="text-[11px] font-bold text-[#0284C7] hover:underline">
                          Submit Project →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {matchingExam ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/exams/${matchingExam.id}`}
                      className="flex-1 h-11 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold shadow-sm active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#7DD3FC]" />
                      <span>Open Exam Lobby</span>
                    </Link>
                    <Link
                      href="/exams"
                      className="flex-1 h-11 rounded-xl bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-extrabold hover:bg-[#E0F2FE] active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#0284C7]" />
                      <span>Browse All</span>
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/exams"
                    className="w-full h-11 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold shadow-sm active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-4 h-4 text-[#7DD3FC]" />
                    <span>Take Exam (Exams Hub)</span>
                  </Link>
                )}

                <Link
                  href="/projects/submit"
                  className="w-full h-11 rounded-xl bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-xs font-extrabold hover:bg-[#E0F2FE] active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                >
                  <FolderGit2 className="w-4 h-4 text-[#0284C7]" />
                  <span>Submit Project</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
