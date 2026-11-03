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
  Library,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { FieldIcon } from "@/components/shared/FieldIcon";
import { useQuantersStore, isPersistentDeletedId } from "@/lib/store/useQuantersStore";
import { sanitizeExternalUrl } from "@/lib/utils/authSecurity";
import { getCurrentDayOfYear, SEED_DAILY_QUIZZES } from "@/lib/data/seed";
import { ExploreCategory, ExplorePost, DailyQuizItem } from "@/lib/types/erp";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { MarkdownArticleRenderer } from "@/components/shared/MarkdownArticleRenderer";

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
  const { t, lang, isRtl } = useTranslation();
  const explorePosts = useQuantersStore((s) => s.explorePosts);
  const storeQuizzes = useQuantersStore((s) => s.dailyQuizzes);
  const members = useQuantersStore((s) => s.members);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const ledger = useQuantersStore((s) => s.ledger);
  const submitDailyQuizAnswer = useQuantersStore((s) => s.submitDailyQuizAnswer);

  const [selectedCategory, setSelectedCategory] = useState<
    "All" | ExploreCategory
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [activeArticle, setActiveArticle] = useState<ExplorePost | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [readArticleIds, setReadArticleIds] = useState<string[]>([]);
  const [feedTab, setFeedTab] = useState<"latest" | "saved" | "library">("latest");

  // Load saved bookmarks & read articles from localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedKey = currentMemberId ? `quanters_saved_explore_${currentMemberId}` : "quanters_saved_explore";
      const rawSaved = localStorage.getItem(savedKey);
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed)) setSavedIds(parsed);
      }

      const readKey = currentMemberId ? `quanters_read_articles_${currentMemberId}` : "quanters_read_articles";
      const rawRead = localStorage.getItem(readKey);
      if (rawRead) {
        const parsed = JSON.parse(rawRead);
        if (Array.isArray(parsed)) setReadArticleIds(parsed);
      }
    } catch {}
  }, [currentMemberId]);

  // Open and auto-archive article for user
  const handleOpenArticle = (post: ExplorePost) => {
    setActiveArticle(post);
    if (post && post.id) {
      setReadArticleIds((prev) => {
        if (prev.includes(post.id)) return prev;
        const next = [...prev, post.id];
        try {
          const key = currentMemberId ? `quanters_read_articles_${currentMemberId}` : "quanters_read_articles";
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        const key = currentMemberId ? `quanters_saved_explore_${currentMemberId}` : "quanters_saved_explore";
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Interactive Daily Quiz State (Single Quiz of the Exact Day)
  const [isQuizExpanded, setIsQuizExpanded] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );
  const [rewardedRounds, setRewardedRounds] = useState<string[]>([]);

  // Restore completed quizzes and prior attempts from localStorage to prevent quiz reload XP farming
  React.useEffect(() => {
    if (typeof window === "undefined" || !currentMemberId) return;
    try {
      const stored = JSON.parse(
        localStorage.getItem(`quanters_completed_quizzes_${currentMemberId}`) || "[]"
      );
      if (Array.isArray(stored)) {
        setRewardedRounds((prev) => Array.from(new Set([...prev, ...stored])));
      }
      const attempts = JSON.parse(
        localStorage.getItem(`quanters_quiz_attempts_${currentMemberId}`) || "{}"
      );
      if (attempts && typeof attempts === "object") {
        setSelectedAnswers((prev) => ({ ...attempts, ...prev }));
      }
    } catch {}
  }, [currentMemberId]);

  const todayQuiz = React.useMemo(() => {
    // 1. Quizzes currently in store that are active and not tombstoned
    const activeQuizzes = (storeQuizzes || []).filter(
      (q) => q.active !== false && !isPersistentDeletedId("dailyQuizzes", q.id)
    );

    let list: DailyQuizItem[] = [];
    if (activeQuizzes.length > 0) {
      list = activeQuizzes;
    } else if (!storeQuizzes || storeQuizzes.length === 0) {
      // Only fallback to non-deleted seed quizzes if the store has no entries AND seed isn't tombstoned
      list = SEED_DAILY_QUIZZES.filter(
        (q) => !isPersistentDeletedId("dailyQuizzes", q.id)
      );
    }

    if (list.length === 0) return null;
    const todayIso = new Date().toISOString().slice(0, 10);
    const exactDateMatch = list.find((q) => q.dateLabel === todayIso);
    if (exactDateMatch) return exactDateMatch;
    const pinned = list.find((q) => q.isPinnedToday);
    if (pinned) return pinned;
    const dayIdx = (getCurrentDayOfYear(0) - 1) % list.length;
    return list[dayIdx] || list[0] || null;
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
    publishedPosts.length > 0
      ? publishedPosts[carouselIdx % publishedPosts.length] || publishedPosts[0]
      : null;

  const activeChallenge = todayQuiz;

  const currentMember = React.useMemo(
    () => members.find((m) => m.id === currentMemberId),
    [members, currentMemberId]
  );

  const recordedAttempt = React.useMemo(() => {
    if (!activeChallenge || !currentMember) return null;
    return currentMember.quizAttempts?.[activeChallenge.id] || null;
  }, [activeChallenge, currentMember]);

  const chosenOptionId =
    recordedAttempt?.optionId ||
    (activeChallenge ? selectedAnswers[activeChallenge.id] || null : null);

  const isSolvedCorrect =
    recordedAttempt !== null
      ? recordedAttempt.correct
      : activeChallenge
      ? chosenOptionId === activeChallenge.correctId
      : false;

  const isAlreadyRewarded = React.useMemo(() => {
    if (!activeChallenge || !currentMemberId) return false;
    const inLedger = ledger.some(
      (e) =>
        e.memberId === currentMemberId &&
        (e.ruleLabel?.includes(activeChallenge.id) ||
          e.reason?.includes(activeChallenge.id) ||
          e.ruleLabel?.includes(activeChallenge.verdictTitle) ||
          e.reason?.includes(activeChallenge.verdictTitle))
    );
    return inLedger || rewardedRounds.includes(activeChallenge.id);
  }, [ledger, activeChallenge, currentMemberId, rewardedRounds]);

  const isAlreadyAttempted =
    Boolean(recordedAttempt) ||
    Boolean(activeChallenge && selectedAnswers[activeChallenge.id]) ||
    isAlreadyRewarded;

  const handleSelectOption = (optionId: string) => {
    if (!activeChallenge || isAlreadyAttempted) return;

    // Immediately lock in local component state
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeChallenge.id]: optionId,
    }));

    // Cache to localStorage
    try {
      const key = `quanters_quiz_attempts_${currentMemberId}`;
      const existingLocal = JSON.parse(localStorage.getItem(key) || "{}");
      existingLocal[activeChallenge.id] = optionId;
      localStorage.setItem(key, JSON.stringify(existingLocal));
      if (optionId === activeChallenge.correctId) {
        const nextRewarded = Array.from(new Set([...rewardedRounds, activeChallenge.id]));
        setRewardedRounds(nextRewarded);
        localStorage.setItem(
          `quanters_completed_quizzes_${currentMemberId}`,
          JSON.stringify(nextRewarded)
        );
      }
    } catch {}

    // Submit attempt to store and Firestore (permanent one-time attempt)
    submitDailyQuizAnswer(activeChallenge.id, optionId);
  };

// toggleSave defined above with localStorage persistence

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
                {isRtl ? (
                  "استكشف مستجدات كوانتا"
                ) : (
                  <>
                    Explore{" "}
                    <span className="font-editorial italic font-normal text-[#0284C7]">
                      The Dispatch
                    </span>
                  </>
                )}
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 font-sans">
              {t.explore.subtitle}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "ابحث في المقالات والموضوعات..." : "Search articles, topics..."}
              className="w-full h-10 pl-10 pr-4 rtl:pl-4 rtl:pr-10 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm font-semibold text-[#0F1E36] placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] shadow-2xs transition-all font-sans"
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
            const tabLabel = isRtl
              ? tab === "All"
                ? "الكل"
                : tab === "QUANTA News"
                ? "أخبار كوانتا"
                : tab === "Opportunities"
                ? "الفرص والمنح"
                : tab === "Scientific News"
                ? "مستجدات علمية"
                : "الفعاليات"
              : tab;
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
                {tabLabel}
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
              onClick={() => handleOpenArticle(heroPost)}
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
        {activeChallenge && (
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
                {isAlreadyAttempted ? (
                  <span className={`px-2 py-0.5 rounded font-mono text-[10.5px] font-bold border shrink-0 ${
                    isSolvedCorrect
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-400/40"
                  }`}>
                    {isSolvedCorrect ? `+${activeChallenge.xpReward} XP Earned` : "Attempted (1/1)"}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-[#0F1E36]/80 border border-[#38BDF8]/35 font-mono text-[11px] font-bold text-[#7DD3FC] tabular-nums shrink-0">
                    +{activeChallenge.xpReward} XP
                  </span>
                )}
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
                          "bg-rose-50 border-rose-300 text-rose-900";
                        badgeStyle = "bg-rose-600 text-white";
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
                  <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-rise ${
                    isSolvedCorrect ? "bg-[#F0F6FF] border-[#D5E3F5]" : "bg-rose-50 border-rose-200"
                  }`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#0F1E36] leading-snug font-sans">
                        <strong className={`font-mono ${isSolvedCorrect ? "text-[#0284C7]" : "text-rose-600"}`}>
                          {isSolvedCorrect ? "✓ Correct:" : "✕ Attempted · Solution:"}
                        </strong>{" "}
                        {activeChallenge.verdictTitle}
                      </p>
                      {activeChallenge.explanation && activeChallenge.explanation !== activeChallenge.verdictTitle && (
                        <p className="text-[11px] text-slate-600 mt-1 font-sans leading-relaxed">
                          {activeChallenge.explanation}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-600 shrink-0 self-start sm:self-auto">
                      1/1 Attempt Used
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            DISPATCHES NAVIGATION: LATEST, SAVED & ARCHIVE
           ========================================================= */}
        <div className="space-y-3.5">
          {/* Sub-Tab Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-slate-200/80">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start">
              <button
                type="button"
                onClick={() => setFeedTab("latest")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  feedTab === "latest"
                    ? "bg-white text-[#0F1E36] shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{isRtl ? "الجديد" : "Latest"}</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedTab("saved")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  feedTab === "saved"
                    ? "bg-white text-[#0F1E36] shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{isRtl ? "المحفوظات" : "Saved"}</span>
                {savedIds.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                    {savedIds.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFeedTab("library")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  feedTab === "library"
                    ? "bg-white text-[#0F1E36] shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Library className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{isRtl ? "المكتبة" : "Library"}</span>
              </button>
            </div>

            <span className="font-mono text-xs font-bold text-slate-400 self-end sm:self-auto">
              {feedTab === "latest"
                ? `${Math.min(6, filteredPosts.length)} TOP STORIES`
                : feedTab === "saved"
                  ? `${publishedPosts.filter((p) => savedIds.includes(p.id)).length} SAVED`
                  : `${filteredPosts.length} IN LIBRARY`}
            </span>
          </div>

          {/* TAB 1: LATEST DISPATCHES (FAST, TOP STORIES) */}
          {feedTab === "latest" && (
            <div className="space-y-2.5 animate-rise">
              {filteredPosts.slice(0, 6).map((post, idx) => {
                const isSaved = savedIds.includes(post.id);
                const isRead = readArticleIds.includes(post.id);
                const { priorityBadge } = getPostPriorityMeta(post);
                const isTopPriority = priorityBadge === "IMPORTANT";
                return (
                  <div
                    key={post.id}
                    onClick={() => handleOpenArticle(post)}
                    style={{ animationDelay: `${100 + idx * 30}ms` }}
                    className={`bg-white rounded-2xl border p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)] hover:border-[#182C4E]/45 active:scale-[0.99] transition-all flex items-center gap-3.5 cursor-pointer ${
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
                      {isRead && (
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-600/95 text-white font-mono text-[9px] font-bold tracking-wider backdrop-blur-xs flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>READ</span>
                        </span>
                      )}
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
                          {isRead && (
                            <span className="px-2 py-0.5 rounded-md font-mono text-[9.5px] font-bold text-slate-400 bg-slate-100 border border-slate-200">
                              ARCHIVED
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(post.id);
                          }}
                          className={`p-1.5 rounded-full hover:bg-slate-100 active:scale-[0.95] transition cursor-pointer ${
                            isSaved
                              ? "text-[#0284C7]"
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

              {filteredPosts.length > 6 && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setFeedTab("library")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Library className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>View More in Library ({filteredPosts.length - 6} older dispatches)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED DISPATCHES (BOOKMARKED BY USER) */}
          {feedTab === "saved" && (
            <div className="space-y-2.5 animate-rise">
              {publishedPosts.filter((p) => savedIds.includes(p.id)).length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284C7] mx-auto shadow-xs">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {isRtl ? "لا توجد مقالات محفوظة بعد" : "No Saved Articles Yet"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      {isRtl
                        ? "اضغط على أيقونة الإشارة المرجعية بجانب أي مقال لحفظه في هذه القائمة والرجوع إليه لاحقاً."
                        : "Tap the bookmark icon on any dispatch to save it here for quick reference and offline reading."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedTab("latest")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#182C4E] text-white text-xs font-bold hover:brightness-110 cursor-pointer transition shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Browse Latest Dispatches</span>
                  </button>
                </div>
              ) : (
                publishedPosts
                  .filter((p) => savedIds.includes(p.id))
                  .map((post, idx) => (
                    <div
                      key={post.id}
                      onClick={() => handleOpenArticle(post)}
                      className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,30,54,0.04)] hover:border-[#0284C7]/50 active:scale-[0.99] transition-all flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#0284C7]/90 text-white font-mono text-xs font-bold backdrop-blur-xs">
                          SAVED
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider border ${getTagBadgeStyle(
                              post
                            )}`}
                          >
                            {post.tagLabel}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSave(post.id);
                            }}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-[#0284C7] active:scale-[0.95] transition cursor-pointer"
                            title="Remove from saved"
                          >
                            <Bookmark className="w-4 h-4 fill-current" />
                          </button>
                        </div>

                        <h3 className="font-display mt-1.5 text-sm sm:text-base font-black text-[#0F1E36] leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500 font-sans flex-wrap">
                          <span className="text-[#182C4E] font-bold">{post.source}</span>
                          <span>·</span>
                          <span className="font-mono">{post.readTime}</span>
                          <span>·</span>
                          <span>{post.date}</span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* TAB 3: LIBRARY (COMPLETE HISTORICAL DISPATCHES & ARTICLES) */}
          {feedTab === "library" && (
            <div className="space-y-2.5 animate-rise">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>{isRtl ? "سجل جميع المقالات والمستجدات العلمية في المكتبة" : "Complete dispatch library & permanent scientific archives"}</span>
                <span className="font-mono font-bold text-slate-800">{filteredPosts.length} total</span>
              </div>

              {filteredPosts.map((post, idx) => {
                const isSaved = savedIds.includes(post.id);
                const isRead = readArticleIds.includes(post.id);
                return (
                  <div
                    key={post.id}
                    onClick={() => handleOpenArticle(post)}
                    className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs hover:border-[#182C4E]/45 active:scale-[0.99] transition flex items-center gap-3.5 cursor-pointer"
                  >
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      {isRead && (
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-emerald-600 text-white font-mono text-[8px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10.5px] font-mono font-bold text-[#0284C7] uppercase">
                            {post.category} · {post.tagLabel}
                          </span>
                          {isRead && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-400">
                              READ
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(post.id);
                          }}
                          className={`p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer ${
                            isSaved ? "text-[#0284C7]" : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      <h3 className="font-display text-xs sm:text-sm font-bold text-[#0F1E36] leading-snug line-clamp-1 mt-0.5">
                        {post.title}
                      </h3>

                      <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-slate-500 flex-wrap">
                        <span>{post.source}</span>
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
          )}
        </div>
      </div>

      {/* =========================================================
          UPGRADED EDITORIAL NEWSPAPER & MAGAZINE ARTICLE VIEWER
         ========================================================= */}
      {activeArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-5 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-4xl max-h-[92dvh] rounded-3xl bg-white overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-rise"
          >
            {/* Top Sticky Bar */}
            <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2.5 py-0.5 rounded-md font-mono text-[10.5px] font-bold uppercase tracking-wider bg-[#182C4E] text-[#7DD3FC]">
                  {activeArticle.tagLabel}
                </span>
                <span className="text-xs font-bold text-slate-500 truncate hidden sm:inline">
                  {activeArticle.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleSave(activeArticle.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    savedIds.includes(activeArticle.id)
                      ? "bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7]"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${savedIds.includes(activeArticle.id) ? "fill-current text-[#0284C7]" : ""}`}
                  />
                  <span>{savedIds.includes(activeArticle.id) ? "Saved" : "Save"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Newspaper Layout */}
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {/* Hero Image */}
              <div className="relative h-56 sm:h-64 w-full shrink-0 bg-slate-900">
                <img
                  src={activeArticle.imageUrl}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold">{activeArticle.source}</span>
                  <span className="font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                    {activeArticle.readTime}
                  </span>
                </div>
              </div>

              {/* Editorial Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] leading-tight">
                  {activeArticle.title}
                </h1>

                <div className="flex items-center gap-3 text-xs font-medium text-slate-500 flex-wrap">
                  <span className="font-bold text-[#182C4E]">{activeArticle.source}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeArticle.date}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-[#0284C7]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeArticle.readTime}</span>
                  </span>
                </div>

                {/* Lead Summary Callout */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-[13px] leading-relaxed italic font-editorial">
                  {activeArticle.summary}
                </div>

                {/* Full Article Content with Markdown Parsing (if provided) */}
                {activeArticle.content ? (
                  <div className="pt-2">
                    <MarkdownArticleRenderer content={activeArticle.content} />
                  </div>
                ) : null}

                {/* Footer Actions */}
                <div className="pt-3 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleSave(activeArticle.id)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        savedIds.includes(activeArticle.id) ? "fill-[#0284C7] text-[#0284C7]" : ""
                      }`}
                    />
                    <span>{savedIds.includes(activeArticle.id) ? "Saved in Bookmarks" : "Save Article"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {activeArticle.externalUrl && (
                      <a
                        href={sanitizeExternalUrl(activeArticle.externalUrl) || "https://quanta-algiers.dz"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 px-4 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition"
                      >
                        <span>Original Source</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
