"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { FieldIcon } from "@/components/shared/FieldIcon";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

type ExamCategoryFilter = "All" | "Science" | "Technology";

export default function ExamsHubPage() {
  const router = useRouter();
  const exams = useQuantersStore((s) => s.exams);
  const badges = useQuantersStore((s) => s.badges);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);

  const currentMember =
    members.find((m) => m.id === currentMemberId) || members[0];

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<ExamCategoryFilter>("All");

  const filteredExams = exams.filter((exam) => {
    const linkedBadge = badges.find((b) => b.id === exam.badgeId);
    const resolvedCategory =
      exam.category ||
      linkedBadge?.category ||
      (exam.title.toLowerCase().includes("astro") ||
      exam.title.toLowerCase().includes("safety")
        ? "Science"
        : "Technology");

    const matchesCategory =
      categoryFilter === "All" || resolvedCategory === categoryFilter;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      exam.title.toLowerCase().includes(q) ||
      exam.level.toLowerCase().includes(q) ||
      (linkedBadge?.name.toLowerCase().includes(q) ?? false);

    return matchesCategory && matchesSearch;
  });

  return (
    <MobileAppShell>
      <div className="flex-1 flex flex-col px-5 pt-2 pb-6 space-y-4 animate-rise">
        {/* Top Back Navigation & Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-[#1D63EB] active:scale-[0.98] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <Link
              href="/badges"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#1D63EB] text-[11px] font-bold hover:bg-blue-100 active:scale-[0.98] transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>My Badges</span>
            </Link>
          </div>

          <div>
            <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Skill &amp; Badge Exams
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Choose an assessment to verify your skills and unlock badges
            </p>
          </div>
        </div>

        {/* Top Summary Strip */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#062456] via-[#0A3882] to-[#1258C7] text-white border border-white/20 shadow-[0_12px_36px_rgba(6,36,86,0.18)] flex items-center justify-between gap-2 text-xs font-extrabold flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-[#38E4FF] shrink-0" />
            <span>{exams.length} Available Exams</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-300 shrink-0" />
            <span>70–80% Pass Threshold</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="inline-flex items-center gap-1.5 text-[#38E4FF]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Instant Badge + XP</span>
          </span>
        </div>

        {/* Search Bar + Category Filter Pills */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exams by skill, topic, or level..."
              className="w-full pl-10 pr-8 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:bg-white focus:border-[#1D63EB] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {(["All", "Science", "Technology"] as ExamCategoryFilter[]).map(
              (cat) => {
                const active = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-extrabold active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)] border border-transparent"
                        : "bg-white/80 backdrop-blur-md text-slate-600 border border-white/80 hover:bg-white hover:text-slate-900 shadow-2xs"
                    }`}
                  >
                    {cat}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Exam Cards List */}
        <div className="space-y-3.5">
          {filteredExams.length === 0 ? (
            <div className="p-8 rounded-xl bg-white/80 backdrop-blur-xl border border-white/80 text-center space-y-1.5 shadow-2xs">
              <p className="text-sm font-black text-slate-800">
                No matching skill exams found
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Try clearing your search or switching category filters.
              </p>
            </div>
          ) : (
            filteredExams.map((exam) => {
              const linkedBadge = badges.find((b) => b.id === exam.badgeId);
              const isUnlocked =
                linkedBadge?.memberState === "Unlocked" ||
                (currentMember?.badgeIds?.includes(exam.badgeId) ?? false);

              return (
                <div
                  key={exam.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_18px_rgba(9,25,47,0.04)] hover:border-[#1D63EB]/40 hover:bg-white/95 transition-all space-y-3.5"
                >
                  {/* Top Row: Icon + Title + Status & Pills */}
                  <div className="flex items-start gap-3.5">
                    <FieldIcon
                      field={exam.iconName || exam.title}
                      size={28}
                      boxed
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-[15px] font-black text-slate-900 leading-snug">
                          {exam.title}
                        </h2>
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold shrink-0 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold shrink-0 border border-slate-200/60">
                            Available
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                        {linkedBadge
                          ? `Unlocks Badge: ${linkedBadge.name}`
                          : "Official Club Skill Assessment"}
                      </p>

                      {/* Level & Mint XP Pills */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1D63B8] border border-sky-200/80 text-[10px] font-extrabold">
                          {exam.level}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold tabular-nums">
                          +{exam.xpReward} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600 flex-wrap gap-y-1">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-[#1D63EB]" />
                      <span>{exam.durationMinutes} min</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.totalQuestionsCount} MCQs</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Target className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pass: {exam.passingScorePercent}%</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="tabular-nums">
                      Attempts: {exam.attemptsUsed}/{exam.maxAttempts}
                    </span>
                  </div>

                  {/* Primary Action Button */}
                  <Link
                    href={`/exams/${exam.id}`}
                    className="w-full h-11 px-4 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:shadow-md active:scale-[0.98] text-white font-extrabold text-xs shadow-[0_4px_14px_rgba(29,99,235,0.3)] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Exam Lobby</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MobileAppShell>
  );
}
