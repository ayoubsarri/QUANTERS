"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FileCheck2,
  FolderGit2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { HexagonBadgeCard } from "@/components/badges/HexagonBadgeCard";
import { PlanetEmblem } from "@/components/shared/PlanetEmblem";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { Badge, BadgeCategory } from "@/lib/types/erp";

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
  const badges = useQuantersStore((s) => s.badges);
  const exams = useQuantersStore((s) => s.exams);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const activeBadges = badges.filter((b) => !b.archived);
  const unlockedCount = activeBadges.filter((b) => b.memberState === "Unlocked").length;
  const lockedCount = activeBadges.filter((b) => b.memberState === "Locked").length;

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
        {/* Top Glassify Summary Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#062456] via-[#0A3882] to-[#1258C7] border border-white/20 shadow-[0_16px_40px_rgba(6,36,86,0.22)] text-white animate-rise">
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold font-display text-sky-100 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#38E4FF]" />
                <span>Skill Badges &amp; Credentials</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
                My Skill Badges
              </h1>
              <p className="text-xs sm:text-sm text-sky-200/90 font-medium mt-1 font-sans">
                {unlockedCount} Unlocked · {lockedCount} Locked · {CATEGORY_PILLS.length - 1} Categories
              </p>
            </div>
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <PlanetEmblem size={48} />
            </div>
          </div>
        </div>

        {/* Action Header & Quick Exam Link */}
        <div
          className="flex items-center justify-between animate-rise"
          style={{ animationDelay: "20ms" }}
        >
          <div>
            <h2 className="text-sm sm:text-base font-extrabold font-display text-slate-800">
              Filter Credentials
            </h2>
          </div>
          <Link
            href="/exams"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#1D63EB] text-xs font-extrabold font-display border border-white/80 shadow-2xs hover:bg-white active:scale-[0.98] transition cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Exams Hub</span>
          </Link>
        </div>

        {/* Row 1: Status Pills (All | Unlocked | In Progress | Locked) */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5 animate-rise"
          style={{ animationDelay: "40ms" }}
        >
          {STATUS_PILLS.map((pill) => {
            const active = statusFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold font-display whitespace-nowrap active:scale-[0.98] transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)] border border-transparent"
                    : "bg-white/80 backdrop-blur-md text-slate-600 border border-white/80 hover:bg-white hover:text-slate-900 shadow-2xs"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Row 2: Category Pills (All | Hard Skills | Soft Skills | Science | Technology) */}
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
                className={`px-4 py-1.5 rounded-full text-xs font-bold font-display whitespace-nowrap active:scale-[0.98] transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-[#062456] to-[#0A3882] text-white border border-transparent shadow-xs"
                    : "bg-white/70 backdrop-blur-md text-[#094C9C] border border-white/80 hover:bg-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Hexagonal Badge Grid Container */}
        <div
          className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-4 sm:p-5 shadow-[0_6px_24px_rgba(9,25,47,0.05)] animate-rise"
          style={{ animationDelay: "80ms" }}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 gap-x-2">
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl overflow-hidden shadow-2xl border border-white/80 flex flex-col animate-rise">
            <div className="bg-gradient-to-br from-[#062456] via-[#0A3882] to-[#1258C7] text-white p-5 relative flex items-center gap-4 border-b border-white/10">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="bg-white/10 rounded-2xl p-1.5 border border-white/15 shrink-0">
                <HexagonBadgeCard badge={selectedBadge} />
              </div>

              <div className="min-w-0 pr-6">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#38E4FF] text-[#061E47] uppercase tracking-wider">
                  {selectedBadge.category}
                </span>
                <h2 className="mt-1.5 text-lg font-black leading-tight">
                  {selectedBadge.name}
                </h2>
                <p className="mt-0.5 text-xs text-amber-300 font-extrabold">
                  +{selectedBadge.xpReward} XP · {selectedBadge.memberState}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed font-medium">
                {selectedBadge.description}
              </p>

              <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-2xs space-y-1">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1D63EB]" />
                  <span>Verification Criteria</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {selectedBadge.criteriaText}
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-600">Qualification Progress</span>
                  <span className="text-[#1D63EB] font-mono font-extrabold tabular-nums">
                    {selectedBadge.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950/20 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#38E4FF] to-[#1D63EB] transition-all duration-500"
                    style={{ width: `${selectedBadge.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Earned by {selectedBadge.awardedCount} Quanters
                </span>
                {selectedBadge.awardedDate && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Unlocked {selectedBadge.awardedDate}
                  </span>
                )}
              </div>

              {/* Action Buttons Launching Online Exam Lobby / Exams Hub or Project Submission */}
              <div className="pt-2 space-y-2">
                {matchingExam ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/exams/${matchingExam.id}`}
                      className="flex-1 h-11 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white text-xs font-extrabold shadow-[0_4px_14px_rgba(29,99,235,0.3)] hover:shadow-md active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Open Exam Lobby</span>
                    </Link>
                    <Link
                      href="/exams"
                      className="flex-1 h-11 rounded-full bg-white/80 backdrop-blur-md text-[#094C9C] border border-white/90 shadow-2xs text-xs font-extrabold hover:bg-white active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Browse All</span>
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/exams"
                    className="w-full h-11 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white text-xs font-extrabold shadow-[0_4px_14px_rgba(29,99,235,0.3)] hover:shadow-md active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Take Exam (Exams Hub)</span>
                  </Link>
                )}

                <Link
                  href="/projects/submit"
                  className="w-full h-11 rounded-full bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] text-[#92400E] border border-amber-300/80 text-xs font-extrabold hover:shadow-sm active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                >
                  <FolderGit2 className="w-4 h-4 text-[#92400E]" />
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
