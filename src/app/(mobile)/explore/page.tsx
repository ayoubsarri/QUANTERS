"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { FieldIcon } from "@/components/shared/FieldIcon";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { getCurrentDayOfYear, SEED_DAILY_QUIZZES } from "@/lib/data/seed";
import { ExploreCategory, ExplorePost } from "@/lib/types/erp";

const FILTER_TABS: ("All" | ExploreCategory)[] = [
  "All",
  "QUANTA News",
  "Opportunities",
  "Scientific News",
  "Events",
];

function getPostPriorityMeta(post: ExplorePost): {
  rank: number;
  priorityBadge: "IMPORTANT" | "NEW" | null;
} {
  if (post.category === "QUANTA News" || post.tagLabel === "QUANTA CLUB") {
    return { rank: 100, priorityBadge: "IMPORTANT" };
  }
  if (post.category === "Opportunities" || post.tagLabel === "OPPORTUNITY") {
    return { rank: 95, priorityBadge: "IMPORTANT" };
  }
  if (post.featuredInCarousel) {
    return { rank: 90, priorityBadge: "NEW" };
  }
  if (post.id === "exp-1" || post.id === "exp-2") {
    return { rank: 85, priorityBadge: "NEW" };
  }
  return { rank: 50, priorityBadge: null };
}

export default function MobileExplorePage() {
  const explorePosts = useQuantersStore((s) => s.explorePosts);
  const storeQuizzes = useQuantersStore((s) => s.dailyQuizzes);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const addManualPointsEntry = useQuantersStore((s) => s.addManualPointsEntry);

  const [selectedCategory, setSelectedCategory] = useState<
    "All" | ExploreCategory
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [activeArticle, setActiveArticle] = useState<ExplorePost | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(["exp-1"]);

  // Interactive Daily Quiz State (Single Quiz of the Exact Day)
  const [isQuizExpanded, setIsQuizExpanded] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );
  const [rewardedRounds, setRewardedRounds] = useState<string[]>([]);

  const todayQuiz = React.useMemo(() => {
    const raw =
      storeQuizzes && storeQuizzes.length > 0
        ? storeQuizzes.filter((q) => q.active !== false)
        : SEED_DAILY_QUIZZES;
    const list = raw.length > 0 ? raw : SEED_DAILY_QUIZZES;
    const todayIso = new Date().toISOString().slice(0, 10);
    const exactDateMatch = list.find((q) => q.dateLabel === todayIso);
    if (exactDateMatch) return exactDateMatch;
    const pinned = list.find((q) => q.isPinnedToday);
    if (pinned) return pinned;
    const dayIdx = (getCurrentDayOfYear(0) - 1) % list.length;
    return list[dayIdx] || list[0];
  }, [storeQuizzes]);

  // Always sort published posts so Important / Featured / Newest appear first
  const publishedPosts = [...explorePosts]
    .filter((p) => p.status === "Published")
    .sort((a, b) => {
      const prioDiff =
        getPostPriorityMeta(b).rank - getPostPriorityMeta(a).rank;
      if (prioDiff !== 0) return prioDiff;
      return b.date.localeCompare(a.date);
    });

  const filteredPosts = publishedPosts.filter((p) => {
    const matchesCat =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const heroPost =
    publishedPosts[carouselIdx % publishedPosts.length] || publishedPosts[0];

  const activeChallenge = todayQuiz;
  const chosenOptionId = selectedAnswers[activeChallenge.id] || null;
  const isSolvedCorrect = chosenOptionId === activeChallenge.correctId;

  const handleSelectOption = (optionId: string) => {
    if (selectedAnswers[activeChallenge.id]) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeChallenge.id]: optionId,
    }));

    if (optionId === activeChallenge.correctId) {
      if (!rewardedRounds.includes(activeChallenge.id)) {
        setRewardedRounds((prev) => [...prev, activeChallenge.id]);
        addManualPointsEntry(
          currentMemberId,
          activeChallenge.xpReward,
          `Daily Quiz: ${activeChallenge.verdictTitle}`,
          "Quiz"
        );
      }
    }
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getTagBadgeStyle = (post: ExplorePost) => {
    if (post.tagLabel === "OPPORTUNITY" || post.tagTone === "amber") {
      return "bg-[#182C4E] text-[#7DD3FC] border-[#2B4875]";
    }
    if (post.tagLabel === "QUANTA CLUB" || post.tagTone === "cyan") {
      return "bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]";
    }
    return "bg-[#F0F6FF] text-[#182C4E] border-[#D5E3F5]";
  };

  const totalEarnedGameXp = rewardedRounds.length * 15;

  return (
    <MobileAppShell>
      <div className="px-4 pt-3 pb-8 sm:px-6 space-y-4">
        {/* Top Title & Search */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-rise"
          style={{ animationDelay: "0ms" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-black text-[#0F1E36] tracking-tight">
                Explore{" "}
                <span className="font-editorial italic font-normal text-[#0284C7]">
                  The Dispatch
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 font-sans">
              Scientific journalism, fellowships, club dispatches &amp; interactive lab challenges
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] shadow-2xs transition-all font-sans"
            />
          </div>
        </div>

        {/* Horizontal Filter Pills */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 animate-rise"
          style={{ animationDelay: "40ms" }}
        >
          {FILTER_TABS.map((tab) => {
            const active = selectedCategory === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedCategory(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-display whitespace-nowrap active:scale-[0.98] transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white shadow-[0_4px_12px_rgba(16,31,56,0.2)] border border-[#2B4875]/60"
                    : "bg-white text-slate-600 border border-slate-200/90 hover:bg-[#F0F6FF] hover:text-[#0F1E36]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Featured Editorial Hero Carousel Card */}
        {heroPost && (
          <div
            className="space-y-2 animate-rise"
            style={{ animationDelay: "80ms" }}
          >
            <button
              type="button"
              onClick={() => setActiveArticle(heroPost)}
              className="relative w-full h-[215px] sm:h-[250px] rounded-2xl overflow-hidden shadow-[0_14px_34px_rgba(15,30,54,0.16)] text-left group block focus:outline-none active:scale-[0.99] transition cursor-pointer border border-[#2B4875]/30"
            >
              <img
                src={heroPost.imageUrl}
                alt={heroPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/95 via-[#101F38]/55 to-transparent" />

              {/* Top Tag Pill */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-[#182C4E]/90 text-[#7DD3FC] border border-[#38BDF8]/40 backdrop-blur-md font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                    <span>FEATURED</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-white/95 text-[#0F1E36] font-mono shadow-2xs">
                    {heroPost.tagLabel}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#0F1E36]/80 text-sky-100 backdrop-blur-md border border-white/15 shrink-0 font-mono">
                  {heroPost.readTime}
                </span>
              </div>

              {/* Bottom Headline & Meta */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="font-display text-base sm:text-xl font-black leading-snug line-clamp-2 text-white">
                  {heroPost.title}
                </h2>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-sky-100/90 font-medium font-sans">
                  <span className="truncate">
                    {heroPost.source} · {heroPost.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#182C4E]/90 backdrop-blur-md border border-[#38BDF8]/35 text-[#7DD3FC] font-bold text-xs font-mono shrink-0">
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </button>

            {/* 5 Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5">
              {Array.from({ length: Math.min(5, publishedPosts.length || 1) }).map(
                (_, i) => {
                  const isCurrent =
                    i === carouselIdx % Math.min(5, publishedPosts.length || 1);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCarouselIdx(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        isCurrent
                          ? "w-6 bg-[#182C4E]"
                          : "w-1.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* SINGLE DAILY QUIZ BUTTON & COLLAPSIBLE CARD */}
        <div
          className="rounded-xl bg-white border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.05)] overflow-hidden animate-rise"
          style={{ animationDelay: "110ms" }}
        >
          <button
            type="button"
            onClick={() => setIsQuizExpanded((prev) => !prev)}
            aria-expanded={isQuizExpanded}
            aria-label="Open Daily Quiz"
            className="w-full px-3.5 py-2.5 bg-gradient-to-r from-[#182C4E] to-[#101F38] text-white flex items-center justify-between gap-2 cursor-pointer select-none text-left transition hover:brightness-105"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FieldIcon field={activeChallenge.icon} size={18} />
              <span className="font-display text-sm font-black tracking-tight text-white shrink-0">
                Quiz
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#0F1E36]/80 border border-[#38BDF8]/35 font-mono text-[11px] font-bold text-[#7DD3FC] tabular-nums shrink-0">
                +{activeChallenge.xpReward} XP
              </span>
              {!isQuizExpanded && (
                <span className="text-xs text-sky-100/85 font-sans truncate ml-1">
                  {activeChallenge.question}
                </span>
              )}
            </div>

            <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              {isQuizExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#7DD3FC]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#7DD3FC]" />
              )}
            </span>
          </button>

          {isQuizExpanded && (
            <div className="p-3.5 space-y-2.5 border-t border-[#2B4875]/30 animate-rise">
              <h3 className="text-xs sm:text-sm font-extrabold font-display text-[#0F1E36] leading-snug">
                {activeChallenge.question}
              </h3>

              <div className="space-y-1.5">
                {activeChallenge.options.map((opt, idx) => {
                  const isSelected = chosenOptionId === opt.id;
                  const isRightOption = opt.id === activeChallenge.correctId;
                  const showResult = Boolean(chosenOptionId);

                  let cardStyle =
                    "bg-[#F8FAFC] hover:bg-[#F0F6FF] border-slate-200/90 hover:border-[#182C4E]/40 text-[#0F1E36]";
                  let badgeStyle = "bg-[#182C4E] text-white";

                  if (showResult) {
                    if (isRightOption) {
                      cardStyle =
                        "bg-[#F0F6FF] border-[#0284C7] text-[#0F1E36]";
                      badgeStyle = "bg-[#0284C7] text-white";
                    } else if (isSelected && !isRightOption) {
                      cardStyle =
                        "bg-slate-100 border-slate-300 text-slate-500 opacity-85";
                      badgeStyle = "bg-slate-400 text-white";
                    } else {
                      cardStyle =
                        "bg-slate-50/70 border-slate-200/60 text-slate-400 opacity-65";
                      badgeStyle = "bg-slate-200 text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={showResult}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full py-2 px-2.5 rounded-lg border text-left transition-all flex items-center gap-2.5 ${cardStyle} ${
                        showResult ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded font-mono text-xs font-bold flex items-center justify-center shrink-0 ${badgeStyle}`}
                      >
                        {showResult && isRightOption ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </span>
                      <span className="flex-1 text-xs font-bold font-display leading-snug">
                        {opt.label}
                      </span>
                      {showResult && isRightOption && (
                        <span className="px-1.5 py-0.5 rounded bg-[#182C4E] text-[#7DD3FC] font-mono text-xs font-bold shrink-0">
                          +{activeChallenge.xpReward} XP
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {chosenOptionId && (
                <div className="p-2.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] flex items-center justify-between gap-2.5 animate-rise">
                  <p className="text-xs text-[#0F1E36] leading-snug font-sans flex-1 min-w-0">
                    <strong className="font-mono text-[#0284C7]">
                      {isSolvedCorrect ? "✓ Correct:" : "Answer:"}
                    </strong>{" "}
                    {activeChallenge.verdictTitle}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Priority Feed List: New & Important Dispatches First */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5 gap-2 flex-wrap">
            <h2 className="font-display text-base sm:text-lg font-black text-[#0F1E36]">
              Latest &amp; Featured Dispatches
            </h2>
            <span className="font-mono text-xs font-bold text-slate-400">
              {filteredPosts.length} STORIES
            </span>
          </div>

          {filteredPosts.map((post, idx) => {
            const isSaved = savedIds.includes(post.id);
            const { priorityBadge } = getPostPriorityMeta(post);
            const isTopPriority = priorityBadge === "IMPORTANT";
            return (
              <div
                key={post.id}
                onClick={() => setActiveArticle(post)}
                style={{ animationDelay: `${120 + idx * 40}ms` }}
                className={`bg-white rounded-xl border p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)] hover:border-[#182C4E]/45 active:scale-[0.99] transition-all flex items-center gap-3.5 cursor-pointer animate-rise ${
                  isTopPriority
                    ? "border-[#182C4E]/35 border-l-[3px] border-l-[#182C4E]"
                    : "border-slate-200/90"
                }`}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#101F38]/90 text-[#7DD3FC] font-mono text-xs font-bold backdrop-blur-xs">
                    0{idx + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {priorityBadge === "IMPORTANT" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#182C4E] text-[#7DD3FC] font-mono text-xs font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                          <span>PRIORITY</span>
                        </span>
                      )}
                      {priorityBadge === "NEW" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] font-mono text-xs font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3" />
                          <span>NEW</span>
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider border ${getTagBadgeStyle(
                          post
                        )}`}
                      >
                        {post.tagLabel}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(post.id);
                      }}
                      className={`p-1.5 rounded-full hover:bg-slate-100 active:scale-[0.95] transition cursor-pointer ${
                        isSaved
                          ? "text-[#182C4E]"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      aria-label="Bookmark article"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  <h3 className="font-display mt-1.5 text-sm sm:text-base font-black text-[#0F1E36] leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500 font-sans flex-wrap">
                    <span className="text-[#182C4E] font-bold">
                      {post.source}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{post.readTime}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Article Reader Modal with 01/02/03 Stepped Breakdown */}
      {activeArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[480px] max-h-[78dvh] sm:max-h-[82dvh] rounded-2xl bg-white overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-rise"
          >
            <div className="relative h-48 w-full shrink-0">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/95 via-[#101F38]/40 to-transparent" />
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-900/75 text-white flex items-center justify-center hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-3.5 left-4 px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider bg-[#182C4E] text-[#7DD3FC] border border-[#38BDF8]/35 shadow-sm">
                {activeArticle.tagLabel} · {activeArticle.category}
              </span>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5">
              <h2 className="font-display text-lg font-extrabold text-[#0F1E36] leading-snug">
                {activeArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 pb-2.5 border-b border-slate-100 flex-wrap">
                <span className="text-[#182C4E] font-extrabold">
                  {activeArticle.source}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {activeArticle.date}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" /> {activeArticle.readTime}
                </span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {activeArticle.summary}
              </p>

              {/* 01 / 02 / 03 Stepped Breakdown */}
              <div className="rounded-xl bg-[#F0F6FF] border-l-4 border-[#182C4E] p-3.5 space-y-2">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#182C4E]">
                  THE 3-STEP SCIENTIFIC BREAKDOWN
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-extrabold text-[#0284C7]">
                      01
                    </span>
                    <span>
                      <strong>Core Finding:</strong> Verified by QUANTA
                      Scientific Committee for practical workshop integration.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-extrabold text-[#0284C7]">
                      02
                    </span>
                    <span>
                      <strong>Why It Matters:</strong> Directly connects to
                      hands-on student lab tracks and skill badge projects.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-extrabold text-[#0284C7]">
                      03
                    </span>
                    <span>
                      <strong>How To Participate:</strong> Submit a follow-up
                      review or workshop proposal (+25 XP) via the Proposals
                      engine.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleSave(activeArticle.id)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      savedIds.includes(activeArticle.id)
                        ? "fill-[#182C4E] text-[#182C4E]"
                        : ""
                    }`}
                  />
                  <span>
                    {savedIds.includes(activeArticle.id) ? "Saved" : "Save"}
                  </span>
                </button>

                {activeArticle.externalUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={
                        /^https?:\/\//i.test(activeArticle.externalUrl.trim())
                          ? activeArticle.externalUrl.trim()
                          : "https://quanta-algiers.dz"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 active:scale-[0.98] transition"
                    >
                      <span>Open Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveArticle(null)}
                      className="h-10 px-5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold shadow-sm active:scale-[0.98] transition cursor-pointer"
                    >
                      Done Reading
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveArticle(null)}
                    className="h-10 px-5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold shadow-sm active:scale-[0.98] transition cursor-pointer"
                  >
                    Done Reading
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
