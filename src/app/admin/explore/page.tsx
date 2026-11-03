"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  Eye,
  Code2,
  Copy,
  FileCode2,
  FileJson,
  HelpCircle,
  Newspaper,
  Pencil,
  Pin,
  Plus,
  Quote,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Minus,
  RemoveFormatting,
  Columns2,
  Table,
} from "lucide-react";
import { MarkdownArticleRenderer } from "@/components/shared/MarkdownArticleRenderer";
import { FieldIcon, ALL_FIELD_ICONS } from "@/components/shared/FieldIcon";
import { useQuantersStore, isPersistentDeletedId } from "@/lib/store/useQuantersStore";
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
  "Prophet Muhammad",
  "Algerian Scholars",
  "Muslim Scientists",
  "Ancient Greece & Antiquity",
  "World Scientists",
];

export default function AdminExplorePage() {
  const explorePosts = useQuantersStore((s) => s.explorePosts);
  const createExplorePost = useQuantersStore((s) => s.createExplorePost);
  const updateExplorePost = useQuantersStore((s) => s.updateExplorePost);
  const deleteExplorePost = useQuantersStore((s) => s.deleteExplorePost);
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
  const updateDailyQuote = useQuantersStore((s) => s.updateDailyQuote);
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
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<ExploreCategory>("Scientific News");
  const [tagLabel, setTagLabel] = useState("ASTRONOMY");
  const [tagTone, setTagTone] = useState<ExplorePost["tagTone"]>("sky");
  const [source, setSource] = useState("QUANTA Editorial");
  const [readTime, setReadTime] = useState("3 min read");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
  );
  const [featuredInCarousel, setFeaturedInCarousel] = useState(true);
  const [externalUrl, setExternalUrl] = useState("");
  const [content, setContent] = useState("");
  const [articleEditorTab, setArticleEditorTab] = useState<"write" | "split" | "preview">("write");
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const PRESET_READ_TIMES = ["2 min read", "3 min read", "5 min read", "8 min read", "12 min read"];

  const handleAutoCalcReadTime = () => {
    const fullText = `${title} ${summary} ${content}`.trim();
    const words = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;
    const mins = Math.max(1, Math.round(words / 180));
    setReadTime(`${mins} min read`);
  };

  const applyMarkdownFormat = (
    type:
      | "bold"
      | "italic"
      | "underline"
      | "strike"
      | "h1"
      | "h2"
      | "h3"
      | "quote"
      | "bullet"
      | "number"
      | "code"
      | "link"
      | "table"
      | "line"
      | "clear"
  ) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = content.substring(start, end);

    let prefix = "";
    let suffix = "";
    let defaultText = "";

    switch (type) {
      case "bold":
        prefix = "**";
        suffix = "**";
        defaultText = "bold text";
        break;
      case "italic":
        prefix = "*";
        suffix = "*";
        defaultText = "italic text";
        break;
      case "underline":
        prefix = "<u>";
        suffix = "</u>";
        defaultText = "underlined text";
        break;
      case "strike":
        prefix = "~~";
        suffix = "~~";
        defaultText = "strikethrough text";
        break;
      case "h1":
        prefix = "\n\n# ";
        suffix = "\n";
        defaultText = "Article Main Title";
        break;
      case "h2":
        prefix = "\n\n## ";
        suffix = "\n";
        defaultText = "Section Heading";
        break;
      case "h3":
        prefix = "\n\n### ";
        suffix = "\n";
        defaultText = "Subheading";
        break;
      case "quote":
        prefix = "\n> ";
        suffix = "\n";
        defaultText = "Scientific insight or pull-quote";
        break;
      case "bullet":
        if (selected.includes("\n")) {
          const listified = selected
            .split("\n")
            .map((line) => (line.trim().startsWith("- ") ? line : `- ${line}`))
            .join("\n");
          const newContent = content.substring(0, start) + listified + content.substring(end);
          setContent(newContent);
          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start + listified.length);
          });
          return;
        }
        prefix = "\n- ";
        suffix = "\n";
        defaultText = "Point item";
        break;
      case "number":
        if (selected.includes("\n")) {
          const numbered = selected
            .split("\n")
            .map((line, idx) => `${idx + 1}. ${line.replace(/^\d+\.\s*/, "")}`)
            .join("\n");
          const newContent = content.substring(0, start) + numbered + content.substring(end);
          setContent(newContent);
          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start + numbered.length);
          });
          return;
        }
        prefix = "\n1. ";
        suffix = "\n";
        defaultText = "Numbered item";
        break;
      case "code":
        if (selected.includes("\n")) {
          prefix = "\n```typescript\n";
          suffix = "\n```\n";
          defaultText = "// code snippet or formula";
        } else {
          prefix = "`";
          suffix = "`";
          defaultText = "code";
        }
        break;
      case "link":
        prefix = "[";
        suffix = "](https://example.com)";
        defaultText = "Link text";
        break;
      case "table":
        prefix = "\n\n| Parameter | Value | Reference |\n|---|---|---|\n| Metric A | 98.4% | Verified |\n| Metric B | 1.2 ms | Real-time |\n\n";
        suffix = "";
        defaultText = "";
        break;
      case "line":
        prefix = "\n\n---\n\n";
        suffix = "";
        defaultText = "";
        break;
      case "clear":
        if (selected) {
          const cleaned = selected
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/<u>/g, "")
            .replace(/<\/u>/g, "")
            .replace(/~~/g, "")
            .replace(/`/g, "")
            .replace(/^#+\s+/gm, "")
            .replace(/^>\s+/gm, "")
            .replace(/^[-*]\s+/gm, "")
            .replace(/^\d+\.\s+/gm, "");
          const newContent = content.substring(0, start) + cleaned + content.substring(end);
          setContent(newContent);
          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start + cleaned.length);
          });
          return;
        }
        break;
    }

    const insertedText = selected || defaultText;
    const replacement = prefix + insertedText + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Keep focus and smoothly place cursor inside or after format
    requestAnimationFrame(() => {
      textarea.focus();
      const selectionStart = start + prefix.length;
      const selectionEnd = selectionStart + insertedText.length;
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const openCreateArticleModal = () => {
    setEditingPostId(null);
    setTitle("");
    setSummary("");
    setCategory("Scientific News");
    setTagLabel("SCIENCE");
    setTagTone("sky");
    setSource("QUANTA Editorial");
    setReadTime("4 min read");
    setImageUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80");
    setFeaturedInCarousel(true);
    setExternalUrl("");
    setContent("");
    setArticleEditorTab("write");
    setCreateOpen(true);
  };

  const openEditArticleModal = (post: ExplorePost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSummary(post.summary);
    setCategory(post.category);
    setTagLabel(post.tagLabel);
    setTagTone(post.tagTone || "sky");
    setSource(post.source);
    setReadTime(post.readTime);
    setImageUrl(post.imageUrl);
    setFeaturedInCarousel(Boolean(post.featuredInCarousel));
    setExternalUrl(post.externalUrl || "");
    setContent(post.content || "");
    setArticleEditorTab("write");
    setCreateOpen(true);
  };

  // --- TAB 2: DAILY QUIZ STATE ---
  const [editingQuiz, setEditingQuiz] = useState<DailyQuizItem | null>(null);
  const [quizJsonModalOpen, setQuizJsonModalOpen] = useState(false);
  const [quizJsonInput, setQuizJsonInput] = useState("");
  const [quizJsonValidation, setQuizJsonValidation] = useState<{ count: number; error?: string } | null>(null);
  const [quizJsonMode, setQuizJsonMode] = useState<"append" | "replace">("append");

  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizSearch, setQuizSearch] = useState("");
  const [quizDomain, setQuizDomain] = useState("ASTROPHYSICS · SPECTROSCOPY");
  const [quizIcon, setQuizIcon] = useState<FieldIconKey>("astronomy");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState<Array<{ id: string; label: string }>>([
    { id: "a", label: "" },
    { id: "b", label: "" },
    { id: "c", label: "" },
  ]);
  const [quizCorrectId, setQuizCorrectId] = useState<string>("a");
  const [quizVerdictTitle, setQuizVerdictTitle] = useState("");
  const [quizExplanation, setQuizExplanation] = useState("");
  const [quizXpReward, setQuizXpReward] = useState<number>(15);
  const [quizDateLabel, setQuizDateLabel] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [quizPinToday, setQuizPinToday] = useState<boolean>(true);
  const [quizFormError, setQuizFormError] = useState<string | null>(null);

  // --- TAB 3: QUOTES LIBRARY STATE ---
  const [editingQuote, setEditingQuote] = useState<DailyQuoteItem | null>(null);
  const [editQuoteText, setEditQuoteText] = useState("");
  const [editQuoteAuthor, setEditQuoteAuthor] = useState("");
  const [editQuoteRole, setEditQuoteRole] = useState("");
  const [editQuoteCategory, setEditQuoteCategory] = useState<QuoteCategory>("Muslim Scientists");
  const [editQuoteDay, setEditQuoteDay] = useState(1);

  const [quoteJsonModalOpen, setQuoteJsonModalOpen] = useState(false);
  const [quoteJsonInput, setQuoteJsonInput] = useState("");
  const [quoteJsonValidation, setQuoteJsonValidation] = useState<{ count: number; error?: string } | null>(null);

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteCategoryFilter, setQuoteCategoryFilter] = useState<string>("All");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quotePage, setQuotePage] = useState(1);
  const QUOTES_PER_PAGE = 18;

  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteTextAr, setNewQuoteTextAr] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
  const [newQuoteAuthorAr, setNewQuoteAuthorAr] = useState("");
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

  const handleExportQuizzesJson = () => {
    const list = dailyQuizzes.filter((q) => !isPersistentDeletedId("dailyQuizzes", q.id));
    const cleanList = list.map((q) => ({
      domain: q.domain,
      icon: q.icon,
      dateLabel: q.dateLabel || new Date().toISOString().slice(0, 10),
      question: q.question,
      options: q.options,
      correctId: q.correctId || q.options[0]?.id || "a",
      verdictTitle: q.verdictTitle,
      explanation: q.explanation || q.verdictTitle,
      xpReward: q.xpReward,
      isPinnedToday: Boolean(q.isPinnedToday),
      active: q.active !== false,
    }));
    const jsonStr = JSON.stringify(cleanList, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quanters-daily-quizzes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBanner(`Exported ${cleanList.length} daily quizzes to JSON file!`);
  };

  const handleCopyQuizzesJson = () => {
    const list = dailyQuizzes.filter((q) => !isPersistentDeletedId("dailyQuizzes", q.id));
    const cleanList = list.map((q) => ({
      domain: q.domain,
      icon: q.icon,
      dateLabel: q.dateLabel || new Date().toISOString().slice(0, 10),
      question: q.question,
      options: q.options,
      correctId: q.correctId || q.options[0]?.id || "a",
      verdictTitle: q.verdictTitle,
      explanation: q.explanation || q.verdictTitle,
      xpReward: q.xpReward,
      isPinnedToday: Boolean(q.isPinnedToday),
      active: q.active !== false,
    }));
    navigator.clipboard.writeText(JSON.stringify(cleanList, null, 2));
    setBanner(`Copied ${cleanList.length} daily quizzes as JSON!`);
  };

  // Filtered Quizzes
  const filteredQuizzes = dailyQuizzes
    .filter((q) => !isPersistentDeletedId("dailyQuizzes", q.id))
    .filter(
      (q) =>
        !quizSearch.trim() ||
        q.question.toLowerCase().includes(quizSearch.toLowerCase()) ||
        q.domain.toLowerCase().includes(quizSearch.toLowerCase()) ||
        q.verdictTitle.toLowerCase().includes(quizSearch.toLowerCase()) ||
        (q.dateLabel && q.dateLabel.includes(quizSearch))
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
    if (editingPostId) {
      updateExplorePost(editingPostId, {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim() || undefined,
        category,
        tagLabel: tagLabel.trim().toUpperCase() || "SCIENCE",
        tagTone,
        source: source.trim() || "QUANTA",
        readTime: readTime.trim() || "3 min read",
        imageUrl:
          imageUrl.trim() ||
          "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
        featuredInCarousel,
        externalUrl: externalUrl.trim() || undefined,
      });
      setBanner(`Updated article '${title.trim()}'!`);
    } else {
      createExplorePost({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim() || undefined,
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
      setBanner("New Explore article published to the club feed!");
    }
    setEditingPostId(null);
    setTitle("");
    setSummary("");
    setCreateOpen(false);
  };

  const openNewQuizModal = () => {
    setEditingQuiz(null);
    setQuizDomain("ASTROPHYSICS · SPECTROSCOPY");
    setQuizIcon("astronomy");
    setQuizXpReward(15);
    setQuizQuestion("");
    setQuizOptions([
      { id: "a", label: "" },
      { id: "b", label: "" },
      { id: "c", label: "" },
    ]);
    setQuizCorrectId("a");
    setQuizVerdictTitle("");
    setQuizExplanation("");
    setQuizDateLabel(new Date().toISOString().slice(0, 10));
    setQuizPinToday(false);
    setQuizFormError(null);
    setQuizModalOpen(true);
  };

  const openEditQuizModal = (quiz: DailyQuizItem) => {
    setEditingQuiz(quiz);
    setQuizDomain(quiz.domain || "GENERAL SCIENCE");
    setQuizIcon(quiz.icon || "science");
    setQuizXpReward(quiz.xpReward || 15);
    setQuizQuestion(quiz.question || "");
    setQuizOptions(
      quiz.options && quiz.options.length >= 2
        ? quiz.options.map((o) => ({ id: o.id, label: o.label }))
        : [
            { id: "a", label: "" },
            { id: "b", label: "" },
          ]
    );
    setQuizCorrectId(quiz.correctId || quiz.options[0]?.id || "a");
    setQuizVerdictTitle(quiz.verdictTitle || "");
    setQuizExplanation(quiz.explanation || "");
    setQuizDateLabel(quiz.dateLabel || new Date().toISOString().slice(0, 10));
    setQuizPinToday(!!quiz.isPinnedToday);
    setQuizFormError(null);
    setQuizModalOpen(true);
  };

  const handleAddQuizOption = () => {
    if (quizOptions.length >= 4) return;
    const nextLetter = String.fromCharCode(97 + quizOptions.length);
    setQuizOptions((prev) => [...prev, { id: nextLetter, label: "" }]);
  };

  const handleRemoveQuizOption = (indexToRemove: number) => {
    if (quizOptions.length <= 2) return;
    setQuizOptions((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      const reindexed = filtered.map((opt, i) => ({
        id: String.fromCharCode(97 + i),
        label: opt.label,
      }));
      if (!reindexed.some((o) => o.id === quizCorrectId)) {
        setQuizCorrectId(reindexed[0].id);
      }
      return reindexed;
    });
  };

  const handleCreateDailyQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizFormError(null);

    if (!quizQuestion.trim()) {
      setQuizFormError("Please enter the quiz question.");
      return;
    }

    const cleanedOptions = quizOptions
      .map((o) => ({ id: o.id.trim().toLowerCase(), label: o.label.trim() }))
      .filter((o) => o.label.length > 0);

    if (cleanedOptions.length < 2) {
      setQuizFormError("Please provide at least 2 non-empty options.");
      return;
    }

    const matchingCorrect = cleanedOptions.find(
      (o) => o.id === quizCorrectId.toLowerCase()
    );
    const finalCorrectId = matchingCorrect ? matchingCorrect.id : cleanedOptions[0].id;

    const payload = {
      domain: quizDomain.trim().toUpperCase() || "GENERAL SCIENCE",
      icon: quizIcon,
      question: quizQuestion.trim(),
      options: cleanedOptions,
      correctId: finalCorrectId,
      verdictTitle: quizVerdictTitle.trim() || "Verified Scientific Principle",
      explanation:
        quizExplanation.trim() ||
        quizVerdictTitle.trim() ||
        "Confirmed by verified scientific methodology.",
      xpReward: Number(quizXpReward) || 15,
      dateLabel: quizDateLabel.trim() || new Date().toISOString().slice(0, 10),
      isPinnedToday: quizPinToday,
      active: true,
    };

    if (editingQuiz) {
      updateDailyQuiz(editingQuiz.id, payload);
      setBanner(`Updated Daily Quiz '${quizQuestion.slice(0, 35)}...'!`);
      setEditingQuiz(null);
    } else {
      createDailyQuiz(payload);
      setBanner("New Daily Quiz published and synced live to Member App!");
    }

    setQuizModalOpen(false);
  };

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim() || !newQuoteAuthor.trim()) return;
    const clampedDay = Math.max(1, Math.min(365, Number(newQuoteDay) || 1));
    const createdId = `quote-custom-${Date.now()}`;
    createDailyQuote({
      dayOfYear: clampedDay,
      text: newQuoteText.trim(),
      textAr: newQuoteTextAr.trim() || undefined,
      author: newQuoteAuthor.trim(),
      authorAr: newQuoteAuthorAr.trim() || undefined,
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
    setNewQuoteTextAr("");
    setNewQuoteAuthor("");
    setNewQuoteAuthorAr("");
    setNewQuoteEra("");
    setQuoteModalOpen(false);
    setBanner(
      newQuotePinNow
        ? `Added & pinned new quote by ${newQuoteAuthor.trim()} as Today's Quote!`
        : `Added new quote by ${newQuoteAuthor.trim()} to the Quote Library (Day ${clampedDay})!`
    );
  };

  return (
    <>
      <div className="space-y-5 animate-rise">
        {/* Top Header & 3-Tab Switcher — Member App Editorial Style */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,30,54,0.04)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7] block mb-0.5">
                EXPLORE · DAILY QUIZ &amp; HERITAGE QUOTES ENGINE
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
                Editorial Dispatches, Daily Quiz &amp; Heritage Quotes
              </h1>
              <p className="font-editorial italic text-slate-500 text-sm mt-0.5">
                Powers Member App news dispatches, collapsible daily quiz, and heritage quote library.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeTab === "articles" && (
                <button
                  type="button"
                  onClick={openCreateArticleModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Explore Post</span>
                </button>
              )}
              {activeTab === "quiz" && (
                <button
                  type="button"
                  onClick={openNewQuizModal}
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
              <span>Quote of the Day ({dailyQuotes.length})</span>
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
                          ? "bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white"
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
                        ? "bg-[#182C4E] text-white"
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
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E]/90 text-[#29D2FF] backdrop-blur-sm">
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
                        <span className="font-bold text-[#0284C7]">
                          {post.category}
                        </span>
                        <span>
                          {post.source} · {post.readTime} · {post.date}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-[#0F1E36] text-base leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/70 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={post.status}
                        onChange={(e) => {
                          const next = e.target.value as ExplorePost["status"];
                          updateExplorePostStatus(post.id, next);
                          setBanner(
                            `Updated '${post.title}' lifecycle status to ${next}.`
                          );
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer ${
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

                      <button
                        type="button"
                        onClick={() => {
                          updateExplorePost(post.id, {
                            featuredInCarousel: !post.featuredInCarousel,
                          });
                          setBanner(
                            post.featuredInCarousel
                              ? `Removed '${post.title}' from Hero Carousel.`
                              : `Featured '${post.title}' in Top Hero Carousel!`
                          );
                        }}
                        title="Toggle Hero Carousel"
                        className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          post.featuredInCarousel
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditArticleModal(post)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteExplorePost(post.id);
                          setBanner(`Deleted article '${post.title}'.`);
                        }}
                        title="Delete Article"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                  <strong className="text-[#0F1E36]">
                    {dailyQuizzes.filter((q) => q.active).length}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={openNewQuizModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#182C4E] hover:bg-[#101F38] text-white text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>New Daily Quiz</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuizJsonInput("");
                    setQuizJsonValidation(null);
                    setQuizJsonMode("append");
                    setQuizJsonModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 transition cursor-pointer"
                  title="Import Daily Quizzes from JSON Format"
                >
                  <Code2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleExportQuizzesJson}
                  className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200/80 text-[#0284C7] transition cursor-pointer"
                  title="Export All Daily Quizzes to JSON File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filteredQuizzes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-2.5">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-extrabold text-[#0F1E36]">
                  No Daily Quizzes Created Yet
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Create interactive daily scientific quizzes that appear inside the Member Explore feed.
                </p>
                <button
                  type="button"
                  onClick={openNewQuizModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#182C4E] text-white text-xs font-bold hover:bg-[#101F38] transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Create First Daily Quiz</span>
                </button>
              </div>
            ) : (
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
                            {quiz.dateLabel && (
                              <span className="px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200/80 text-sky-800 font-mono text-[10px] font-bold">
                                {quiz.dateLabel}
                              </span>
                            )}
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
                          onClick={() => openEditQuizModal(quiz)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="Edit Quiz"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
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
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-[#0F1E36] leading-snug">
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

                  <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <div>
                      <strong className="text-slate-700">Verdict Note:</strong>{" "}
                      {quiz.verdictTitle}
                    </div>
                    {quiz.explanation && quiz.explanation !== quiz.verdictTitle && (
                      <div className="text-[11px] text-slate-600 line-clamp-2">
                        <strong className="text-slate-700">Scientific Rationale:</strong>{" "}
                        {quiz.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 3: QUOTE OF THE DAY · HERITAGE & SCIENCE LIBRARY
           ========================================================= */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            {/* Active Quote of the Day Hero Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0F1E36] via-[#182C4E] to-[#101F38] text-white p-5 sm:p-6 border border-[#2B4875] shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#7DD3FC] font-mono text-xs font-bold uppercase tracking-wider">
                      Live Quote of the Day · Day {activeQuoteToday.dayOfYear}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-sky-100 font-mono text-xs font-bold">
                      {activeQuoteToday.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-mono text-xs font-bold">
                      {settings.dailyQuoteMode === "pinned"
                        ? "Mode: Pinned Override"
                        : "Mode: Auto Calendar Rotation"}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg italic font-editorial text-white leading-relaxed">
                    &ldquo;{activeQuoteToday.text}&rdquo;
                  </p>

                  <p className="text-xs sm:text-sm font-mono text-sky-200">
                    — <strong className="text-white">{activeQuoteToday.author}</strong>
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
                        "Reset Daily Quote to Auto Calendar"
                      );
                      setBanner(
                        "Switched to Automatic Calendar Rotation!"
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-[#38BDF8] text-[#0F1E36] text-xs font-mono font-bold hover:brightness-105 transition cursor-pointer"
                  >
                    Auto Rotation
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

            {/* Filter & Search Bar for Quotes */}
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
                    placeholder="Search quotes by author, text, or tradition (e.g. Malek Bennabi, Ben Badis, Prophet, Ibn al-Haytham, Newton)..."
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
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteJsonInput("");
                      setQuoteJsonValidation(null);
                      setQuoteJsonModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 transition cursor-pointer"
                    title="Import Quotes from JSON"
                  >
                    <Code2 className="w-4 h-4" />
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

            {/* Paginated Quotes Grid */}
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
                          Day {q.dayOfYear}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                          {q.category}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm italic font-editorial text-[#0F1E36] leading-relaxed">
                        &ldquo;{q.text}&rdquo;
                      </p>
                      {q.textAr && (
                        <p className="text-xs sm:text-sm font-sans text-slate-700 leading-relaxed pt-1 border-t border-slate-100" dir="rtl">
                          &laquo;{q.textAr}&raquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0F1E36] truncate">
                          — {q.author}
                          {q.authorAr && (
                            <span className="text-slate-500 font-normal mx-1 font-sans" dir="rtl">
                              ({q.authorAr})
                            </span>
                          )}
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
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuote(q);
                            setEditQuoteText(q.text);
                            setEditQuoteAuthor(q.author);
                            setEditQuoteRole(q.eraOrRole || "");
                            setEditQuoteCategory(q.category);
                            setEditQuoteDay(q.dayOfYear);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="Edit Quote"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete quote by ${q.author}?`)) {
                              deleteDailyQuote(q.id);
                              setBanner(`Deleted quote by ${q.author}.`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer for Quotes */}
            {totalQuotePages > 1 && (
              <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Page <strong className="text-[#0F1E36]">{currentQuotePage}</strong> of{" "}
                  <strong className="text-[#0F1E36]">{totalQuotePages}</strong> ·{" "}
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
          MODAL 1: CREATE / EDIT EXPLORE ARTICLE (NEWSPAPER & MAGAZINE GRADE)
         ========================================================= */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-rise">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#0B172A] via-[#132542] to-[#182C4E] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold tracking-tight">
                      {editingPostId
                        ? "Edit Article"
                        : "Publish Article"}
                    </h2>
                  </div>
                  <p className="text-[11px] text-sky-200/80">
                    Newspaper-grade article authoring with rich typography and instant live reader preview
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePost}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs"
            >
              {/* Row 1: Headline */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Article Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Breakthrough in Quantum Error Correction Discovered by QUANTA Labs"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* Row 2: Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExploreCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#0284C7]"
                  >
                    {EXPLORE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Badge Tag Label
                  </label>
                  <input
                    type="text"
                    value={tagLabel}
                    onChange={(e) => setTagLabel(e.target.value)}
                    placeholder="QUANTUM / DISCOVERY"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Source / Publisher
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="QUANTA Editorial"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tone Accent
                  </label>
                  <select
                    value={tagTone}
                    onChange={(e) => setTagTone(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="sky">Cyan Blue</option>
                    <option value="purple">Cosmic Purple</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="amber">Warm Amber</option>
                    <option value="rose">Rose Red</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Read Time Selection (Compact & Reduced) */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/90">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Reading Time:</span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {["3 min", "5 min", "8 min", "12 min"].map((p) => {
                      const val = `${p} read`;
                      const active = readTime.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setReadTime(val)}
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold transition cursor-pointer ${
                            active
                              ? "bg-[#182C4E] text-white shadow-2xs"
                              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoCalcReadTime}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold text-[#0284C7] bg-[#E0F2FE] hover:bg-sky-100 border border-[#BAE6FD] shrink-0 transition cursor-pointer"
                  title="Auto-calculate read time from word count"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto</span>
                </button>
              </div>

              {/* Row 4: Cover Image & External URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    External Source Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://nature.com/articles/... or https://cern.ch"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Summary */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Lead Summary <span className="text-[10px] text-slate-400 font-normal lowercase font-sans">(2–3 sentences)</span> *
                </label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A concise summary displayed on feed cards and preview listings..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* Row 6: Office / Gmail Style Editorial Workspace (Compacted Ribbon + Full Body + Split / Preview) */}
              <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs">
                {/* Editor Top Bar with View Mode Switcher */}
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setArticleEditorTab("write")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        articleEditorTab === "write"
                          ? "bg-white text-[#182C4E] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Write</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleEditorTab("split")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        articleEditorTab === "split"
                          ? "bg-white text-[#182C4E] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Columns2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Split View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleEditorTab("preview")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        articleEditorTab === "preview"
                          ? "bg-white text-[#0284C7] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Newspaper Preview</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-500">
                    <span>
                      Words: <strong className="text-slate-800">{`${title} ${summary} ${content}`.trim().split(/\s+/).filter(Boolean).length}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Est: <strong className="text-[#0284C7]">{Math.max(1, Math.round(`${title} ${summary} ${content}`.trim().split(/\s+/).filter(Boolean).length / 180))} min</strong>
                    </span>
                  </div>
                </div>

                {/* Compacted Gmail / MS Word Ribbon Toolbar (Always available in Write & Split views) */}
                {articleEditorTab !== "preview" && (
                  <div className="flex flex-wrap items-center gap-0.5 px-2.5 py-1.5 bg-[#F8FAFC] border-b border-slate-200/80 text-xs">
                    {/* Group 1: Typography (B, I, U, S) */}
                    <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("bold")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-800 font-extrabold text-xs cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("italic")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-800 italic font-bold text-xs cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("underline")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Underline (Ctrl+U)"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("strike")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Group 2: Headings (H1, H2, H3) */}
                    <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("h1")}
                        className="px-1.5 h-6 rounded hover:bg-slate-200 text-slate-800 font-mono font-bold text-[10.5px] cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Heading 1 (Main Title)"
                      >
                        <Heading1 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("h2")}
                        className="px-1.5 h-6 rounded hover:bg-slate-200 text-slate-800 font-mono font-bold text-[10.5px] cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Heading 2 (Section)"
                      >
                        <Heading2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("h3")}
                        className="px-1.5 h-6 rounded hover:bg-slate-200 text-slate-800 font-mono font-bold text-[10.5px] cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Heading 3 (Subheading)"
                      >
                        <Heading3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Group 3: Lists & Quotes */}
                    <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("bullet")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Bulleted List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("number")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("quote")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Callout Blockquote"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Group 4: Inserts (Link, Code, Table, Divider) */}
                    <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("link")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Insert Hyperlink"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("code")}
                        className="px-1.5 h-6 rounded hover:bg-slate-200 text-slate-700 font-mono font-bold text-[10.5px] cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Code Snippet / Block"
                      >
                        &lt;/&gt;
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("table")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Insert Scientific Data Table"
                      >
                        <Table className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdownFormat("line")}
                        className="w-7 h-6 rounded hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center justify-center transition active:scale-95"
                        title="Horizontal Divider"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Group 5: Clear Format */}
                    <button
                      type="button"
                      onClick={() => applyMarkdownFormat("clear")}
                      className="w-7 h-6 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer flex items-center justify-center transition active:scale-95 ml-auto"
                      title="Clear Formatting on Selection"
                    >
                      <RemoveFormatting className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Editor Content Body */}
                {articleEditorTab === "write" && (
                  <div className="p-3">
                    <textarea
                      ref={contentTextareaRef}
                      rows={16}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={"Write the full in-depth article or news dispatch here using standard Markdown...\n\n## The Breakthrough\nScientists at the research facility have recorded remarkable quantum coherence intervals...\n\n> Key observation statement\n\n- Observation A: High-fidelity entanglement\n- Observation B: Zero phase deviation"}
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed bg-[#FCFDFE] focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                )}

                {articleEditorTab === "split" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                    {/* Left: Textarea Writer */}
                    <div className="p-3">
                      <textarea
                        ref={contentTextareaRef}
                        rows={16}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write markdown here, watch live preview on the right..."
                        className="w-full h-full min-h-[380px] p-3 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed bg-[#FCFDFE] focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>

                    {/* Right: Live Rendered Preview */}
                    <div className="p-4 bg-slate-50/50 max-h-[440px] overflow-y-auto space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        <span>Live Reader Preview</span>
                        <span className="text-emerald-600 font-bold">Synchronized</span>
                      </div>
                      {summary && (
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                          {summary}
                        </p>
                      )}
                      {content ? (
                        <MarkdownArticleRenderer content={content} />
                      ) : (
                        <p className="text-xs text-slate-400 italic py-6 text-center">
                          (Type in the editor on the left to see your formatted article appear here live.)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {articleEditorTab === "preview" && (
                  /* Full Live Newspaper Preview Mode */
                  <div className="p-5 bg-white space-y-4 max-h-[480px] overflow-y-auto">
                    <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                      <img
                        src={imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider bg-[#182C4E] text-[#7DD3FC] border border-[#38BDF8]/40">
                          {tagLabel || "SCIENCE"} · {category}
                        </span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                          {readTime}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h1 className="font-display text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                        {title || "Untitled Article Headline"}
                      </h1>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 border-b border-slate-100 pb-2">
                        <span className="font-bold text-[#182C4E]">{source || "QUANTA Editorial"}</span>
                        <span>·</span>
                        <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span>·</span>
                        <span className="font-mono text-[#0284C7]">{readTime}</span>
                      </div>

                      {summary && (
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed italic bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          {summary}
                        </p>
                      )}

                      {content ? (
                        <div className="pt-2">
                          <MarkdownArticleRenderer content={content} />
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-4 text-center">
                          (No full article body provided yet. Switch to "Write" or "Split View" tab to compose content.)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 7: Options */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={featuredInCarousel}
                  onChange={(e) => setFeaturedInCarousel(e.target.checked)}
                  className="rounded border-slate-300 text-[#0284C7] focus:ring-0"
                />
                <span>Feature in Top Hero Carousel on Mobile Explore Screen</span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white shadow-xs cursor-pointer"
                >
                  <Newspaper className="w-3.5 h-3.5 text-sky-400" />
                  <span>{editingPostId ? "Save Article Changes" : "Publish Article to Feed"}</span>
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
                <h2 className="text-lg font-extrabold">{editingQuiz ? "Edit Daily Quiz" : "Add Daily Quiz"}</h2>
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
              {quizFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{quizFormError}</span>
                </div>
              )}

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
                    Scheduled Date (YYYY-MM-DD)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={quizDateLabel}
                      onChange={(e) => setQuizDateLabel(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setQuizDateLabel(new Date().toISOString().slice(0, 10))}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition"
                      title="Set to Today"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Field Icon
                  </label>
                  <select
                    value={quizIcon}
                    onChange={(e) =>
                      setQuizIcon(e.target.value as FieldIconKey)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    {ALL_FIELD_ICONS.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    XP Reward (5-50 XP)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={quizXpReward}
                    onChange={(e) => setQuizXpReward(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold"
                  />
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
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Answer Options (Select the Correct Option) *
                  </label>
                  {quizOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddQuizOption}
                      className="text-xs font-bold text-[#0284C7] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Option ({String.fromCharCode(65 + quizOptions.length)})</span>
                    </button>
                  )}
                </div>

                {quizOptions.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctQuizOpt"
                      checked={quizCorrectId === item.id}
                      onChange={() => setQuizCorrectId(item.id)}
                      className="w-4 h-4 accent-[#182C4E] cursor-pointer"
                      title="Select as correct option"
                    />
                    <span className="w-6 text-xs font-mono font-bold text-slate-600 uppercase">
                      {item.id.toUpperCase()}.
                    </span>
                    <input
                      type="text"
                      required
                      value={item.label}
                      onChange={(e) => {
                        const next = [...quizOptions];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setQuizOptions(next);
                      }}
                      placeholder={`Option ${item.id.toUpperCase()} text...`}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                    {quizOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuizOption(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove this option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Short Verdict / Headline *
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Scientific Explanation / Educational Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={quizExplanation}
                  onChange={(e) => setQuizExplanation(e.target.value)}
                  placeholder="Explain why this answer is scientifically correct for the member to learn..."
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
                  {editingQuiz ? "Save Quiz Changes" : "Publish Daily Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: EDIT QUOTE
         ========================================================= */}
      {editingQuote && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Edit Quote</h2>
                <p className="text-xs text-sky-200">
                  Update text, author attribution, and sequence number.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuote(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editQuoteText.trim() || !editQuoteAuthor.trim()) return;
                updateDailyQuote(editingQuote.id, {
                  text: editQuoteText.trim(),
                  author: editQuoteAuthor.trim(),
                  eraOrRole: editQuoteRole.trim(),
                  category: editQuoteCategory,
                  dayOfYear: Number(editQuoteDay) || 1,
                });
                setBanner(`Updated quote by ${editQuoteAuthor.trim()}!`);
                setEditingQuote(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quote Text *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editQuoteText}
                  onChange={(e) => setEditQuoteText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm italic font-editorial"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={editQuoteAuthor}
                    onChange={(e) => setEditQuoteAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Era / Discipline
                  </label>
                  <input
                    type="text"
                    value={editQuoteRole}
                    onChange={(e) => setEditQuoteRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tradition / Category
                  </label>
                  <select
                    value={editQuoteCategory}
                    onChange={(e) => setEditQuoteCategory(e.target.value as QuoteCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
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
                    Day / Sequence #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editQuoteDay}
                    onChange={(e) => setEditQuoteDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#182C4E] text-white cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: IMPORT DAILY QUIZZES (JSON)
         ========================================================= */}
      {quizJsonModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode2 className="w-5 h-5 text-[#38BDF8]" />
                <div>
                  <h2 className="text-base font-extrabold">Import / Export Daily Quizzes (JSON)</h2>
                  <p className="text-xs text-sky-200">
                    Paste raw JSON array or export active quiz questions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuizJsonModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  JSON Schema &amp; Templates
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const sample = JSON.stringify([
                        {
                          domain: "QUANTUM OPTICS",
                          icon: "quantum",
                          dateLabel: new Date().toISOString().slice(0, 10),
                          question: "What is quantum photon entanglement?",
                          options: [
                            { id: "a", label: "Instantaneous correlation between quantum states" },
                            { id: "b", label: "Photons losing all kinetic momentum" },
                            { id: "c", label: "Transformation into thermal radiation" },
                            { id: "d", label: "Decay into virtual leptons" }
                          ],
                          correctId: "a",
                          verdictTitle: "Quantum Entanglement Confirmed",
                          explanation: "Entangled photons remain correlated such that measuring one instantly determines the state of the other regardless of distance.",
                          xpReward: 25,
                          isPinnedToday: true,
                          active: true
                        }
                      ], null, 2);
                      navigator.clipboard.writeText(sample);
                      setBanner("Copied Standard JSON Template!");
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-[#0284C7]" />
                    <span>Copy Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const compact = JSON.stringify([
                        {
                          domain: "ASTROPHYSICS",
                          icon: "astronomy",
                          dateLabel: new Date().toISOString().slice(0, 10),
                          question: "What constitutes the boundary of a black hole where light cannot escape?",
                          options: [
                            "Event Horizon",
                            "Photon Sphere",
                            "Accretion Disk",
                            "Ergosphere"
                          ],
                          correct: "a",
                          verdict: "General Relativity Confirmed",
                          explanation: "The event horizon marks the mathematical boundary beyond which escape velocity exceeds the speed of light.",
                          xp: 20
                        }
                      ], null, 2);
                      navigator.clipboard.writeText(compact);
                      setBanner("Copied Compact String Array Sample!");
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-emerald-600" />
                    <span>Copy Simple Sample</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyQuizzesJson}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[11px] font-bold text-[#0284C7] transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Current Quizzes ({filteredQuizzes.length})</span>
                  </button>
                </div>
              </div>

              {/* JSON Format Preview Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-sky-100 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-[#38BDF8]">Accepted JSON Format (Full Schema):</span>
                  <span className="text-[10px] text-slate-400">Supports 2 to 4 options, string arrays or objects</span>
                </div>
                <pre className="text-[11px] overflow-x-auto text-emerald-300 leading-snug p-2.5 rounded-xl bg-slate-950 border border-slate-800">
{`[
  {
    "domain": "QUANTUM OPTICS",
    "icon": "quantum",
    "dateLabel": "2026-11-03",
    "question": "What is quantum photon entanglement?",
    "options": [
      { "id": "a", "label": "Instantaneous correlation between quantum states" },
      { "id": "b", "label": "Photons losing all kinetic momentum" },
      { "id": "c", "label": "Transformation into thermal radiation" },
      { "id": "d", "label": "Decay into virtual leptons" }
    ],
    "correctId": "a",
    "verdictTitle": "Quantum Entanglement Confirmed",
    "explanation": "Entangled photons remain correlated such that measuring one determines the other.",
    "xpReward": 25,
    "isPinnedToday": true,
    "active": true
  }
]`}
                </pre>
              </div>

              {/* Import Mode Selector */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-700">Import Behavior:</span>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="quizImportMode"
                      checked={quizJsonMode === "append"}
                      onChange={() => setQuizJsonMode("append")}
                      className="accent-[#182C4E]"
                    />
                    <span>Append (Keep existing {filteredQuizzes.length} quizzes)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="quizImportMode"
                      checked={quizJsonMode === "replace"}
                      onChange={() => setQuizJsonMode("replace")}
                      className="accent-rose-600"
                    />
                    <span className="text-rose-600 font-bold">Replace All (Wipe &amp; replace)</span>
                  </label>
                </div>
              </div>

              {/* Input Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Paste JSON Array Here:
                </label>
                <textarea
                  rows={8}
                  value={quizJsonInput}
                  onChange={(e) => {
                    const txt = e.target.value;
                    setQuizJsonInput(txt);
                    if (!txt.trim()) {
                      setQuizJsonValidation(null);
                      return;
                    }
                    try {
                      const parsed = JSON.parse(txt);
                      if (!Array.isArray(parsed)) {
                        setQuizJsonValidation({ count: 0, error: "Must be a JSON array: [ {...}, {...} ]" });
                      } else {
                        const valid = parsed.filter((item) => item && (item.question || item.q) && (item.options || item.opts));
                        setQuizJsonValidation(
                          valid.length > 0
                            ? { count: valid.length }
                            : { count: 0, error: "No valid quiz items found. Each item needs 'question' and 'options'." }
                        );
                      }
                    } catch (err: any) {
                      setQuizJsonValidation({ count: 0, error: err.message || "Invalid JSON syntax" });
                    }
                  }}
                  placeholder="Paste JSON array here..."
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:border-[#182C4E]"
                />
              </div>

              {quizJsonValidation && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold ${
                    quizJsonValidation.error
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {quizJsonValidation.error ? (
                    `Syntax Error: ${quizJsonValidation.error}`
                  ) : (
                    `✓ Valid JSON: ${quizJsonValidation.count} daily quiz items detected!`
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportQuizzesJson}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#0284C7] hover:bg-sky-50 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Active Quizzes (.json)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuizJsonModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!quizJsonValidation || quizJsonValidation.count === 0}
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(quizJsonInput);
                        if (!Array.isArray(parsed)) return;

                        if (quizJsonMode === "replace") {
                          for (const oldQ of dailyQuizzes) {
                            deleteDailyQuiz(oldQ.id);
                          }
                        }

                        let added = 0;
                        for (const q of parsed) {
                          const questionText = String(q.question || q.q || "").trim();
                          if (!questionText) continue;

                          const rawOpts = q.options || q.opts;
                          let opts: Array<{ id: string; label: string }> = [];

                          if (Array.isArray(rawOpts)) {
                            opts = rawOpts
                              .map((opt: any, idx: number) => {
                                if (typeof opt === "string") {
                                  return {
                                    id: String.fromCharCode(97 + idx),
                                    label: opt.trim(),
                                  };
                                }
                                return {
                                  id: String(opt.id || String.fromCharCode(97 + idx)).toLowerCase().trim(),
                                  label: String(opt.label || opt.text || "").trim(),
                                };
                              })
                              .filter((o) => o.label.length > 0);
                          } else if (rawOpts && typeof rawOpts === "object") {
                            opts = Object.entries(rawOpts)
                              .map(([key, val]) => ({
                                id: key.toLowerCase().trim(),
                                label: String(val).trim(),
                              }))
                              .filter((o) => o.label.length > 0);
                          }

                          if (opts.length < 2) continue;

                          const rawCorrect = String(
                            q.correctId || q.correct || q.correctAnswer || q.answer || opts[0]?.id || "a"
                          )
                            .toLowerCase()
                            .trim();

                          const matchedCorrect = opts.find((o) => o.id === rawCorrect);
                          const correctId = matchedCorrect ? matchedCorrect.id : opts[0].id;

                          createDailyQuiz({
                            domain: String(q.domain || q.topic || q.category || "GENERAL SCIENCE").trim().toUpperCase(),
                            icon: (q.icon || "science") as FieldIconKey,
                            dateLabel: String(q.dateLabel || q.date || new Date().toISOString().slice(0, 10)).trim(),
                            question: questionText,
                            options: opts,
                            correctId,
                            verdictTitle: String(q.verdictTitle || q.verdict || "Verified Scientific Principle").trim(),
                            explanation: String(
                              q.explanation || q.rationale || q.verdictTitle || "Confirmed by verified scientific methodology."
                            ).trim(),
                            xpReward: Math.max(5, Math.min(50, Number(q.xpReward || q.xp || q.points) || 15)),
                            isPinnedToday: Boolean(q.isPinnedToday ?? q.pinned),
                            active: q.active !== false,
                          });
                          added++;
                        }

                        setQuizJsonModalOpen(false);
                        setBanner(
                          quizJsonMode === "replace"
                            ? `Replaced quizzes with ${added} newly imported items!`
                            : `Successfully appended ${added} daily quizzes from JSON!`
                        );
                      } catch (err: any) {
                        setQuizJsonValidation({ count: 0, error: err.message || "Failed to process JSON." });
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#182C4E] disabled:opacity-50 text-white cursor-pointer"
                  >
                    {quizJsonMode === "replace" ? "Replace All & Import" : "Import Quizzes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: IMPORT QUOTES (JSON)
         ========================================================= */}
      {quoteJsonModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-[#38BDF8]" />
                <div>
                  <h2 className="text-base font-extrabold">Import Quotes (JSON Format)</h2>
                  <p className="text-xs text-sky-200">
                    Paste raw JSON array of wisdom quotes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuoteJsonModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3.5 rounded-2xl bg-slate-900 text-sky-100 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-[#38BDF8]">Accepted JSON Format:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = JSON.stringify([
                        {
                          text: "Science is the shared heritage of all humanity.",
                          author: "Abdus Salam",
                          eraOrRole: "Theoretical Physicist · Nobel Laureate",
                          category: "Muslim Scientists",
                          dayOfYear: 366
                        }
                      ], null, 2);
                      navigator.clipboard.writeText(sample);
                      setBanner("Copied Sample Quote JSON!");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#7DD3FC] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Sample</span>
                  </button>
                </div>
                <pre className="text-[11px] overflow-x-auto text-emerald-300 leading-snug p-2 rounded-xl bg-slate-950 border border-slate-800">
{`[
  {
    "text": "Science is the shared heritage of all humanity.",
    "author": "Abdus Salam",
    "eraOrRole": "Theoretical Physicist · Nobel Laureate",
    "category": "Muslim Scientists",
    "dayOfYear": 366
  }
]`}
                </pre>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Paste JSON Array:
                </label>
                <textarea
                  rows={7}
                  value={quoteJsonInput}
                  onChange={(e) => {
                    const txt = e.target.value;
                    setQuoteJsonInput(txt);
                    if (!txt.trim()) {
                      setQuoteJsonValidation(null);
                      return;
                    }
                    try {
                      const parsed = JSON.parse(txt);
                      if (!Array.isArray(parsed)) {
                        setQuoteJsonValidation({ count: 0, error: "Must be a JSON array [ {...} ]" });
                      } else {
                        const valid = parsed.filter(item => item && item.text && item.author);
                        setQuoteJsonValidation(valid.length > 0 ? { count: valid.length } : { count: 0, error: "No valid quote items found." });
                      }
                    } catch (err: any) {
                      setQuoteJsonValidation({ count: 0, error: err.message });
                    }
                  }}
                  placeholder="Paste JSON array here..."
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              {quoteJsonValidation && (
                <div className={`p-2.5 rounded-xl text-xs font-bold ${quoteJsonValidation.error ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                  {quoteJsonValidation.error ? `Error: ${quoteJsonValidation.error}` : `✓ Valid: ${quoteJsonValidation.count} quotes detected!`}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuoteJsonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!quoteJsonValidation || quoteJsonValidation.count === 0}
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(quoteJsonInput);
                      let added = 0;
                      for (const q of parsed) {
                        if (q && q.text && q.author) {
                          createDailyQuote({
                            text: q.text,
                            textAr: q.textAr,
                            author: q.author,
                            authorAr: q.authorAr,
                            eraOrRole: q.eraOrRole || "",
                            eraOrRoleAr: q.eraOrRoleAr || "",
                            category: (q.category || "World Scientists") as QuoteCategory,
                            dayOfYear: Number(q.dayOfYear) || dailyQuotes.length + 1,
                            isCustom: true,
                          });
                          added++;
                        }
                      }
                      setQuoteJsonModalOpen(false);
                      setBanner(`Imported ${added} quotes from JSON!`);
                    } catch {}
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#182C4E] disabled:opacity-50 text-white cursor-pointer"
                >
                  Import Quotes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ADD QUOTE TO LIBRARY
         ========================================================= */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#182C4E] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">
                  Add Quote to Library
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
                  Quote Text (Original / English) *
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quote Text (Arabic / النص بالعربية - Optional)
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={newQuoteTextAr}
                  onChange={(e) => setNewQuoteTextAr(e.target.value)}
                  placeholder="أدخل نص الحكمة أو الآية بالعربية..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-sans"
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
                    Author / Source (Arabic / القائل بالعربية - Optional)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={newQuoteAuthorAr}
                    onChange={(e) => setNewQuoteAuthorAr(e.target.value)}
                    placeholder="مثال: مالك بن نبي / الحسن بن الهيثم"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-sans"
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
