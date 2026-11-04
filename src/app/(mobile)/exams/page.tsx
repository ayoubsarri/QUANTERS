"use client";

import React, { useState, useEffect } from "react";
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
  Target,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { FieldIcon } from "@/components/shared/FieldIcon";
import { FALLBACK_SESSION_MEMBER } from "@/lib/data/seed";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

type ExamCategoryFilter = "All" | "Science" | "Technology";

export default function ExamsHubPage() {
  const router = useRouter();
  const exams = useQuantersStore((s) => s.exams);
  const badges = useQuantersStore((s) => s.badges);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);

  const isAuthenticated = useQuantersStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const activeMember =
    isAuthenticated && currentMemberId
      ? members.find((m) => m.id === currentMemberId)
      : undefined;

  useEffect(() => {
    if (hydrated && (!isAuthenticated || !currentMemberId || !activeMember)) {
      router.replace("/welcome");
    }
  }, [hydrated, isAuthenticated, currentMemberId, activeMember, router]);

  const currentMember = activeMember || FALLBACK_SESSION_MEMBER;

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

  if (!hydrated || !isAuthenticated || !currentMemberId || !activeMember) {
    return (
      <div className="min-h-dvh w-full bg-[#030812] flex items-center justify-center p-6 text-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#38BDF8] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <MobileAppShell>
      <div className="flex-1 flex flex-col px-4 sm:px-5 pt-2 pb-6 space-y-3.5 animate-rise">
        {/* Editorial Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-[#182C4E] active:scale-[0.98] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <Link
              href="/badges"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-[11px] font-bold hover:bg-[#E2EEFC] active:scale-[0.98] transition"
            >
              <Award className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>My Badges</span>
            </Link>
          </div>

          <div className="pt-0.5">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7]">
              SKILL VERIFICATION
            </p>
            <h1 className="font-display text-xl font-black text-[#0F1E36] tracking-tight leading-tight">
              Skill &amp; Badge Exams
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Choose an assessment to verify your skills and unlock badges
            </p>
          </div>
        </div>

        {/* Top Summary Strip */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875]/60 shadow-[0_8px_24px_rgba(16,31,56,0.16)] flex items-center justify-between gap-2 text-xs font-extrabold flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-[#7DD3FC] shrink-0" />
            <span>{exams.length} Available Exams</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <span>70–80% Pass Threshold</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="inline-flex items-center gap-1.5 text-[#7DD3FC]">
            <Award className="w-4 h-4 shrink-0" />
            <span>Instant Badge + XP</span>
          </span>
        </div>

        {/* Search Bar + Category Filter Pills */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exams by skill, topic, or level..."
              className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875]/60 shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200/90 hover:text-[#182C4E]"
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
        <div className="space-y-3">
          {filteredExams.length === 0 ? (
            <div className="p-6 rounded-xl bg-white border border-slate-200/90 text-center space-y-1">
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
                  className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-[#2B4875]/50 transition-all space-y-3"
                >
                  {/* Top Row: Icon + Title + Status & Pills */}
                  <div className="flex items-start gap-3">
                    <FieldIcon
                      field={exam.iconName || exam.title}
                      size={26}
                      boxed
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-[14px] font-black text-[#0F1E36] leading-snug">
                          {exam.title}
                        </h2>
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-slate-600 text-[10px] font-extrabold shrink-0 border border-slate-200/90">
                            Available
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        {linkedBadge
                          ? `Unlocks Badge: ${linkedBadge.name}`
                          : "Official Club Skill Assessment"}
                      </p>

                      {/* Level & XP Pills */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[10px] font-extrabold">
                          {exam.level}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] font-mono text-[10px] font-extrabold tabular-nums">
                          +{exam.xpReward} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600 flex-wrap gap-y-1">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>{exam.durationMinutes} min</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.totalQuestionsCount} MCQs</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Target className="w-3.5 h-3.5 text-[#0284C7]" />
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
                    className="w-full h-9 px-4 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 hover:opacity-95 active:scale-[0.98] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
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
