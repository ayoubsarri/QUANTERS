"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Newspaper,
  Pin,
  Plus,
  Quote,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { FieldIcon, ALL_FIELD_ICONS } from "@/components/shared/FieldIcon";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { getActiveDailyQuote, getCurrentDayOfYear } from "@/lib/data/seed";
import {
  DailyQuizItem,
  DailyQuoteItem,
  ExploreCategory,
  ExplorePost,
  FieldIconKey,
  QuoteCategory,
} from "@/lib/types/erp";

const EXPLORE_CATEGORIES: ExploreCategory[] = [
  "Scientific News",
  "Events",
  "QUANTA News",
  "Opportunities",
];

const POST_STATUSES: ExplorePost["status"][] = [
  "Draft",
  "Review",
  "Published",
  "Archived",
];

const QUOTE_CATEGORIES: QuoteCategory[] = [
  "Quran & Revelation",
  "Prophet Muhammad ﷺ",
  "Algerian Scholars",
  "Muslim Scientists",
  "Ancient Greece & Antiquity",
  "World Scientists",
];

export default function AdminExplorePage() {
  const explorePosts = useQuantersStore((s) => s.explorePosts);
  const createExplorePost = useQuantersStore((s) => s.createExplorePost);
  const updateExplorePostStatus = useQuantersStore(
    (s) => s.updateExplorePostStatus
  );

  const dailyQuizzes = useQuantersStore((s) => s.dailyQuizzes);
  const createDailyQuiz = useQuantersStore((s) => s.createDailyQuiz);
  const updateDailyQuiz = useQuantersStore((s) => s.updateDailyQuiz);
  const deleteDailyQuiz = useQuantersStore((s) => s.deleteDailyQuiz);
  const pinDailyQuiz = useQuantersStore((s) => s.pinDailyQuiz);

  const dailyQuotes = useQuantersStore((s) => s.dailyQuotes);
  const createDailyQuote = useQuantersStore((s) => s.createDailyQuote);
  const deleteDailyQuote = useQuantersStore((s) => s.deleteDailyQuote);
  const setPinnedDailyQuote = useQuantersStore((s) => s.setPinnedDailyQuote);
  const settings = useQuantersStore((s) => s.settings);
  const updateSettings = useQuantersStore((s) => s.updateSettings);

  const [activeTab, setActiveTab] = useState<"articles" | "quiz" | "quotes">(
    "articles"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "quiz" || t === "quotes" || t === "articles") {
      setActiveTab(t);
    }
  }, []);

  const [banner, setBanner] = useState<string | null>(null);

  // --- TAB 1: EXPLORE ARTICLES STATE ---
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<ExploreCategory>("Scientific News");
  const [tagLabel, setTagLabel] = useState("ASTRONOMY");
  const [tagTone] = useState<ExplorePost["tagTone"]>("sky");
  const [source, setSource] = useState("QUANTA Editorial");
  const [readTime, setReadTime] = useState("3 min read");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
  );
  const [featuredInCarousel, setFeaturedInCarousel] = useState(true);
  const [externalUrl] = useState("");

  // --- TAB 2: DAILY QUIZ STATE ---
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizSearch, setQuizSearch] = useState("");
  const [quizDomain, setQuizDomain] = useState("ASTROPHYSICS · SPECTROSCOPY");
  const [quizIcon, setQuizIcon] = useState<FieldIconKey>("astronomy");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [optALabel, setOptALabel] = useState("");
  const [optBLabel, setOptBLabel] = useState("");
  const [optCLabel, setOptCLabel] = useState("");
  const [quizCorrectId, setQuizCorrectId] = useState<"a" | "b" | "c">("a");
  const [quizVerdictTitle, setQuizVerdictTitle] = useState("");
  const [quizExplanation, setQuizExplanation] = useState("");
  const [quizXpReward, setQuizXpReward] = useState<number>(15);
  const [quizPinToday, setQuizPinToday] = useState<boolean>(true);

  // --- TAB 3: 365-DAY QUOTES STATE ---
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteCategoryFilter, setQuoteCategoryFilter] = useState<string>("All");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quotePage, setQuotePage] = useState(1);
  const QUOTES_PER_PAGE = 18;

  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
  const [newQuoteEra, setNewQuoteEra] = useState("");
  const [newQuoteCategory, setNewQuoteCategory] =
    useState<QuoteCategory>("Algerian Scholars");
  const [newQuoteDay, setNewQuoteDay] = useState<number>(
    getCurrentDayOfYear(0)
  );
  const [newQuotePinNow, setNewQuotePinNow] = useState<boolean>(true);

  // Filtered Articles
  const filteredPosts = explorePosts.filter((p) => {
    const matchesCat =
      categoryFilter === "All" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  // Filtered Quizzes
  const filteredQuizzes = dailyQuizzes.filter(
    (q) =>
      !quizSearch.trim() ||
      q.question.toLowerCase().includes(quizSearch.toLowerCase()) ||
      q.domain.toLowerCase().includes(quizSearch.toLowerCase()) ||
      q.verdictTitle.toLowerCase().includes(quizSearch.toLowerCase())
  );

  // Filtered 365 Quotes
  const filteredQuotes = dailyQuotes.filter((q) => {
    const matchesCat =
      quoteCategoryFilter === "All" || q.category === quoteCategoryFilter;
    const matchesSearch =
      !quoteSearch.trim() ||
      q.text.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.author.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.eraOrRole.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      String(q.dayOfYear) === quoteSearch.trim();
    return matchesCat && matchesSearch;
  });

  const totalQuotePages = Math.max(
    1,
    Math.ceil(filteredQuotes.length / QUOTES_PER_PAGE)
  );
  const currentQuotePage = Math.min(quotePage, totalQuotePages);
  const paginatedQuotes = filteredQuotes.slice(
    (currentQuotePage - 1) * QUOTES_PER_PAGE,
    currentQuotePage * QUOTES_PER_PAGE
  );

  const activeQuoteToday = getActiveDailyQuote(dailyQuotes, settings);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    createExplorePost({
      title: title.trim(),
      summary: summary.trim(),
      category,
      tagLabel: tagLabel.trim().toUpperCase() || "SCIENCE",
      tagTone,
      source: source.trim() || "QUANTA",
      readTime: readTime.trim() || "3 min read",
      date: "Oct 26, 2026",
      imageUrl:
        imageUrl.trim() ||
        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
      featuredInCarousel,
      status: "Published",
      externalUrl: externalUrl.trim() || undefined,
    });
    setTitle("");
    setSummary("");
    setCreateOpen(false);
    setBanner("New Explore article published to the club feed!");
  };

  const handleCreateDailyQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !quizQuestion.trim() ||
      !optALabel.trim() ||
      !optBLabel.trim() ||
      !optCLabel.trim()
    ) {
      return;
    }
    createDailyQuiz({
      domain: quizDomain.trim().toUpperCase() || "GENERAL SCIENCE",
      icon: quizIcon,
      question: quizQuestion.trim(),
      options: [
        { id: "a", label: optALabel.trim() },
        { id: "b", label: optBLabel.trim() },
        { id: "c", label: optCLabel.trim() },
      ],
      correctId: quizCorrectId,
      verdictTitle:
        quizVerdictTitle.trim() || "Verified Scientific Principle",
      explanation:
        quizExplanation.trim() ||
        quizVerdictTitle.trim() ||
        "Confirmed by experimental verification.",
      xpReward: Number(quizXpReward) || 15,
      dateLabel: "Daily Quiz",
      isPinnedToday: quizPinToday,
      active: true,
    });
    setQuizQuestion("");
    setOptALabel("");
    setOptBLabel("");
    setOptCLabel("");
    setQuizVerdictTitle("");
    setQuizExplanation("");
    setQuizModalOpen(false);
    setBanner(
      "New Daily Quiz published to the Member App Explore Quiz box!"
    );
  };

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim() || !newQuoteAuthor.trim()) return;
    const clampedDay = Math.max(1, Math.min(365, Number(newQuoteDay) || 1));
    const createdId = `quote-custom-${Date.now()}`;
    createDailyQuote({
      dayOfYear: clampedDay,
      text: newQuoteText.trim(),
      author: newQuoteAuthor.trim(),
      eraOrRole: newQuoteEra.trim() || newQuoteCategory,
      category: newQuoteCategory,
      isCustom: true,
    });
    if (newQuotePinNow) {
      setTimeout(() => {
        const latest = useQuantersStore.getState().dailyQuotes[0];
        if (latest) {
          setPinnedDailyQuote(latest.id);
        }
      }, 20);
    }
    setNewQuoteText("");
    setNewQuoteAuthor("");
    setNewQuoteEra("");
    setQuoteModalOpen(false);
    setBanner(
      newQuotePinNow
        ? `Added & pinned new quote by ${newQuoteAuthor.trim()} as Today's Quote!`
        : `Added new quote by ${newQuoteAuthor.trim()} to the 365-Day Library (Day ${clampedDay})!`
    );
  };

  return (
    <>
      <div className="space-y-5 animate-rise">
        {/* Top Header & 3-Tab Switcher */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0F0FF] text-[#1D63EB]">
                  Explore, Daily Quiz &amp; 365-Day Quote Engine
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Powers Member App News, Collapsible Daily Quiz &amp; Daily Quote of the Day
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Editorial Dispatches, Daily Quiz &amp; 365-Day Quotes
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeTab === "articles" && (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Explore Post</span>
                </button>
              )}
              {activeTab === "quiz" && (
                <button
                  type="button"
                  onClick={() => setQuizModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#182C4E] hover:bg-[#101F38] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#38BDF8]" />
                  <span>Add Daily Quiz</span>
                </button>
              )}
              {activeTab === "quotes" && (
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#182C4E] hover:bg-[#101F38] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#38BDF8]" />
                  <span>Add Quote to Library</span>
                </button>
              )}
            </div>
          </div>

          {/* 3-Tab Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab("articles")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "articles"
                  ? "bg-[#182C4E] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Explore Articles ({explorePosts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-[#182C4E] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Daily Quiz Manager ({dailyQuizzes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("quotes")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "quotes"
                  ? "bg-[#182C4E] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Quote className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Quote of the Day · 365-Day Library ({dailyQuotes.length})</span>
            </button>
          </div>
        </div>

        {banner && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{banner}</span>
            </div>
            <button type="button" onClick={() => setBanner(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================
            TAB 1: EXPLORE ARTICLES & DISPATCHES
           ========================================================= */}
        {activeTab === "articles" && (
          <>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles, sources, or opportunities..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 mr-1">
                    Lifecycle:
                  </span>
                  {["All", ...POST_STATUSES].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        statusFilter === st
                          ? "bg-[#061E47] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 mr-1">
                  4 Categories:
                </span>
                {["All", ...EXPLORE_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      categoryFilter === cat
                        ? "bg-[#1D63EB] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-40 w-full bg-slate-900 relative overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#061E47]/90 text-[#29D2FF] backdrop-blur-sm">
                          {post.tagLabel}
                        </span>
                        {post.featuredInCarousel && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#FBB03B] text-slate-950">
                            <Sparkles className="w-2.5 h-2.5" /> Hero Carousel
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-[#1D63EB]">
                          {post.category}
                        </span>
                        <span>
                          {post.source} · {post.readTime} · {post.date}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      Lifecycle State:
                    </span>
                    <select
                      value={post.status}
                      onChange={(e) => {
                        const next = e.target.value as ExplorePost["status"];
                        updateExplorePostStatus(post.id, next);
                        setBanner(
                          `Updated '${post.title}' lifecycle status to ${next}.`
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer ${
                        post.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : post.status === "Review"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : post.status === "Draft"
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-slate-200 text-slate-500 border-slate-300"
                      }`}
                    >
                      {POST_STATUSES.map((st) => (
                        <option
                          key={st}
                          value={st}
                          className="bg-white text-slate-800"
                        >
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* =========================================================
            TAB 2: DAILY QUIZ MANAGER
           ========================================================= */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quizSearch}
                  onChange={(e) => setQuizSearch(e.target.value)}
                  placeholder="Search daily quizzes by question or scientific domain..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Active in Member App:{" "}
                  <strong className="text-slate-900">
                    {dailyQuizzes.filter((q) => q.active).length}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setQuizModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#182C4E] hover:bg-[#101F38] text-white text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>New Daily Quiz</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredQuizzes.map((quiz, idx) => (
                <div
                  key={quiz.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between gap-4 ${
                    quiz.isPinnedToday
                      ? "border-[#0284C7] ring-1 ring-[#0284C7]/25"
                      : "border-slate-200/80"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <FieldIcon field={quiz.icon} size={22} boxed />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
                              {quiz.domain}
                            </span>
                            {quiz.isPinnedToday && (
                              <span className="px-2 py-0.5 rounded-md bg-[#182C4E] text-[#7DD3FC] font-mono text-[10px] font-bold uppercase">
                                Pinned First Today
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Question #{idx + 1} · +{quiz.xpReward} XP Reward
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!quiz.isPinnedToday && (
                          <button
                            type="button"
                            onClick={() => {
                              pinDailyQuiz(quiz.id);
                              setBanner(
                                `Pinned '${quiz.question.slice(0, 38)}...' as Today's Primary Quiz!`
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#E0F2FE] text-slate-700 hover:text-[#0369A1] text-xs font-bold transition cursor-pointer"
                          >
                            <Pin className="w-3 h-3" />
                            <span>Pin Today</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            updateDailyQuiz(quiz.id, { active: !quiz.active })
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            quiz.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {quiz.active ? "Active" : "Hidden"}
                        </button>
                        {dailyQuizzes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              deleteDailyQuiz(quiz.id);
                              setBanner("Deleted daily quiz item.");
                            }}
                            aria-label="Delete quiz"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {quiz.question}
                    </h3>

                    <div className="space-y-1.5">
                      {quiz.options.map((opt, optIdx) => {
                        const isCorrect = opt.id === quiz.correctId;
                        return (
                          <div
                            key={opt.id}
                            className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2.5 ${
                              isCorrect
                                ? "bg-[#F0F6FF] border-[#0284C7]/50 text-[#0F1E36] font-bold"
                                : "bg-slate-50 border-slate-200/70 text-slate-600"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? "bg-[#0284C7] text-white"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt.label}</span>
                            {isCorrect && (
                              <span className="text-[11px] font-mono font-bold text-[#0284C7]">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                    <strong className="text-slate-700">Verdict Note:</strong>{" "}
                    {quiz.verdictTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: QUOTE OF THE DAY · 365-DAY HERITAGE & SCIENCE LIBRARY
           ========================================================= */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            {/* Active Quote of the Day Hero Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0F1E36] via-[#182C4E] to-[#101F38] text-white p-5 sm:p-6 border border-[#2B4875] shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#7DD3FC] font-mono text-xs font-bold uppercase tracking-wider">
                      Live Quote of the Day · Day {activeQuoteToday.dayOfYear} / 365
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-sky-100 font-mono text-xs font-bold">
                      {activeQuoteToday.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-mono text-xs font-bold">
                      {settings.dailyQuoteMode === "pinned"
                        ? "Mode: Pinned Override"
                        : "Mode: Auto 365-Day Rotation"}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg italic font-editorial text-white leading-relaxed">
                    &ldquo;{activeQuoteToday.text}&rdquo;
                  </p>

                  <p className="text-xs sm:text-sm font-mono text-sky-200">
                    — <strong className="text-white">{activeQuoteToday.author}</strong>{" "}
                    <span className="text-slate-300">
                      ({activeQuoteToday.eraOrRole})
                    </span>
                  </p>
                </div>

                {/* Controls to step day or switch mode */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPinnedDailyQuote(null);
                      updateSettings(
                        {
                          dailyQuoteMode: "auto_365",
                          dailyQuoteDayOffset:
                            (settings.dailyQuoteDayOffset || 0) - 1,
                        },
                        "Stepped Daily Quote -1 Day"
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-bold text-white transition cursor-pointer"
                  >
                    ← Prev Day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPinnedDailyQuote(null);
                      updateSettings(
                        {
                          dailyQuoteMode: "auto_365",
                          dailyQuoteDayOffset: 0,
                          pinnedQuoteId: undefined,
                        },
                        "Reset Daily Quote to Auto 365-Day Calendar"
                      );
                      setBanner(
                        "Switched to Automatic 365-Day Calendar Rotation!"
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-[#38BDF8] text-[#0F1E36] text-xs font-mono font-bold hover:brightness-105 transition cursor-pointer"
                  >
                    Auto 365-Day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPinnedDailyQuote(null);
                      updateSettings(
                        {
                          dailyQuoteMode: "auto_365",
                          dailyQuoteDayOffset:
                            (settings.dailyQuoteDayOffset || 0) + 1,
                        },
                        "Stepped Daily Quote +1 Day"
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-bold text-white transition cursor-pointer"
                  >
                    Next Day →
                  </button>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar for the 365 Quotes */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-lg">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quoteSearch}
                    onChange={(e) => {
                      setQuoteSearch(e.target.value);
                      setQuotePage(1);
                    }}
                    placeholder="Search 365 quotes (e.g. Malek Bennabi, Ben Badis, Prophet, Quran, Ibn al-Haytham, Newton, Day #)..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    Showing {filteredQuotes.length} of {dailyQuotes.length} quotes
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuoteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#182C4E] hover:bg-[#101F38] text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Add Quote</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 mr-1">
                  Traditions:
                </span>
                {["All", ...QUOTE_CATEGORIES].map((cat) => {
                  const count =
                    cat === "All"
                      ? dailyQuotes.length
                      : dailyQuotes.filter((q) => q.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setQuoteCategoryFilter(cat);
                        setQuotePage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        quoteCategoryFilter === cat
                          ? "bg-[#182C4E] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paginated 365 Quotes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedQuotes.map((q) => {
                const isTodayActive = activeQuoteToday.id === q.id;
                return (
                  <div
                    key={q.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between gap-3 ${
                      isTodayActive
                        ? "border-[#0284C7] ring-1 ring-[#0284C7]/30 bg-[#F8FBFF]"
                        : "border-slate-200/80"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] border border-[#D5E3F5] font-mono text-[11px] font-bold text-[#182C4E]">
                          Day {q.dayOfYear} / 365
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                          {q.category}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm italic font-editorial text-slate-900 leading-relaxed">
                        &ldquo;{q.text}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0F1E36] truncate">
                          {q.author}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {q.eraOrRole}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isTodayActive ? (
                          <span className="px-2.5 py-1 rounded-lg bg-[#0284C7] text-white font-mono text-[11px] font-bold">
                            Active Today
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setPinnedDailyQuote(q.id);
                              setBanner(
                                `Pinned Day ${q.dayOfYear} quote by ${q.author} as Today's Active Quote!`
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#182C4E] text-slate-700 hover:text-white font-mono text-[11px] font-bold transition cursor-pointer"
                          >
                            <Pin className="w-3 h-3" />
                            <span>Set Today</span>
                          </button>
                        )}
                        {q.isCustom && (
                          <button
                            type="button"
                            onClick={() => deleteDailyQuote(q.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Delete custom quote"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer for 365 Quotes */}
            {totalQuotePages > 1 && (
              <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Page <strong className="text-slate-900">{currentQuotePage}</strong> of{" "}
                  <strong className="text-slate-900">{totalQuotePages}</strong> ·{" "}
                  {filteredQuotes.length} quotes
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentQuotePage <= 1}
                    onClick={() => setQuotePage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    disabled={currentQuotePage >= totalQuotePages}
                    onClick={() =>
                      setQuotePage((p) => Math.min(totalQuotePages, p + 1))
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================
          MODAL 1: CREATE EXPLORE POST
         ========================================================= */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#061E47] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">
                  Create Explore Article / Opportunity
                </h2>
                <p className="text-xs text-sky-200">
                  Publishes directly to the 4-category Explore Feed on the member app
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePost}
              className="p-6 space-y-4 max-h-[82vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CERN Summer Student Programme 2027 Applications Open"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ExploreCategory)
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    {EXPLORE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Badge Tag Label
                  </label>
                  <input
                    type="text"
                    value={tagLabel}
                    onChange={(e) => setTagLabel(e.target.value)}
                    placeholder="ASTRONOMY / OPPORTUNITY"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Source / Publisher
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Summary / Digest *
                </label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a concise scientific summary or opportunity details..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredInCarousel}
                  onChange={(e) => setFeaturedInCarousel(e.target.checked)}
                />
                <span>Feature in Top Hero Carousel on Mobile Explore Screen</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-[#1D63EB] hover:bg-blue-700 text-white"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: ADD DAILY QUIZ
         ========================================================= */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Add Daily Quiz</h2>
                <p className="text-xs text-sky-200">
                  Appears immediately inside the expandable Quiz box on the Member App
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuizModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateDailyQuiz}
              className="p-6 space-y-4 max-h-[82vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Scientific Domain / Topic *
                  </label>
                  <input
                    type="text"
                    required
                    value={quizDomain}
                    onChange={(e) => setQuizDomain(e.target.value)}
                    placeholder="e.g. QUANTUM PHYSICS · OPTICS"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Field Icon &amp; XP Reward
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={quizIcon}
                      onChange={(e) =>
                        setQuizIcon(e.target.value as FieldIconKey)
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    >
                      {ALL_FIELD_ICONS.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={quizXpReward}
                      onChange={(e) => setQuizXpReward(Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quiz Question *
                </label>
                <textarea
                  rows={2}
                  required
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  placeholder="Write a concise scientific question..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  3 Answer Options (Select the Correct Option) *
                </label>

                {(
                  [
                    { id: "a", label: "Option A", val: optALabel, set: setOptALabel },
                    { id: "b", label: "Option B", val: optBLabel, set: setOptBLabel },
                    { id: "c", label: "Option C", val: optCLabel, set: setOptCLabel },
                  ] as const
                ).map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctQuizOpt"
                      checked={quizCorrectId === item.id}
                      onChange={() => setQuizCorrectId(item.id)}
                      className="w-4 h-4 accent-[#182C4E] cursor-pointer"
                    />
                    <span className="w-6 text-xs font-mono font-bold text-slate-600 uppercase">
                      {item.id}.
                    </span>
                    <input
                      type="text"
                      required
                      value={item.val}
                      onChange={(e) => item.set(e.target.value)}
                      placeholder={`${item.label} text...`}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Short Verdict / Explanation Note *
                </label>
                <input
                  type="text"
                  required
                  value={quizVerdictTitle}
                  onChange={(e) => setQuizVerdictTitle(e.target.value)}
                  placeholder="e.g. Conservation of Angular Momentum Confirmed"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quizPinToday}
                  onChange={(e) => setQuizPinToday(e.target.checked)}
                />
                <span>Pin as Today&apos;s Primary Daily Quiz (#1 in Member App)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuizModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-[#182C4E] hover:bg-[#101F38] text-white cursor-pointer"
                >
                  Publish Daily Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ADD QUOTE TO 365-DAY LIBRARY
         ========================================================= */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">
                  Add Quote to 365-Day Library
                </h2>
                <p className="text-xs text-sky-200">
                  Add Islamic, Algerian, or World Scientific quotes &amp; optionally pin for today
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateQuote}
              className="p-6 space-y-4 max-h-[82vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quote Text *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                  placeholder="Enter the quote or verse..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Author / Source *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuoteAuthor}
                    onChange={(e) => setNewQuoteAuthor(e.target.value)}
                    placeholder="e.g. Malek Bennabi / Ibn al-Haytham"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Heritage / Tradition Category
                  </label>
                  <select
                    value={newQuoteCategory}
                    onChange={(e) =>
                      setNewQuoteCategory(e.target.value as QuoteCategory)
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    {QUOTE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Era / Scholarly Context
                  </label>
                  <input
                    type="text"
                    value={newQuoteEra}
                    onChange={(e) => setNewQuoteEra(e.target.value)}
                    placeholder="e.g. Algerian Philosopher & Engineer"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Day of Year (1 – 365)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={newQuoteDay}
                    onChange={(e) => setNewQuoteDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newQuotePinNow}
                  onChange={(e) => setNewQuotePinNow(e.target.checked)}
                />
                <span>Pin immediately as Today&apos;s Active Quote on Member App</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-[#182C4E] hover:bg-[#101F38] text-white cursor-pointer"
                >
                  Save Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
