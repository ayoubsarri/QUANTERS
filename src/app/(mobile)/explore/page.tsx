"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ExploreCategory, ExplorePost } from "@/lib/types/erp";

const FILTER_TABS: ("All" | ExploreCategory)[] = [
  "All",
  "QUANTA News",
  "Opportunities",
  "Scientific News",
  "Events",
];

const MYTH_CARDS = [
  {
    id: "m1",
    topic: "ASTROPHYSICS · JWST SPECTROSCOPY",
    myth: "A single dimethyl sulfide (DMS) spectral feature on an exoplanet automatically proves extraterrestrial life.",
    reality:
      "Abiotic photochemical pathways and overlapping methane/CO₂ absorption bands require ≥5σ multi-instrument transit confirmation before claiming a biosignature.",
    stat: "≥ 5σ",
    statLabel: "Detection Threshold",
    source: "JWST NIRSpec Exoplanet Transmission Consortium (2026)",
  },
  {
    id: "m2",
    topic: "AI & COMPUTATIONAL SCIENCE",
    myth: "Larger parameter counts alone guarantee accurate physical and mathematical reasoning.",
    reality:
      "Physics-informed constraints, symbolic verification, and curated domain datasets outperform raw parameter scaling on scientific benchmarks by 3.2×.",
    stat: "3.2×",
    statLabel: "Domain Solver Gain",
    source: "Nature Machine Intelligence · Scientific Foundation Benchmarks",
  },
  {
    id: "m3",
    topic: "QUANTUM COMPUTING · ERROR CORRECTION",
    myth: "Adding more physical qubits immediately speeds up every classical algorithm exponentially.",
    reality:
      "Quantum advantage is restricted to specific structured problems (e.g., Hamiltonian simulation, factoring) and requires fault-tolerant logical qubits below the surface-code threshold.",
    stat: "< 1%",
    statLabel: "Gate Error Threshold",
    source: "APS Physical Review X · Quantum Fault-Tolerance Review",
  },
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
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | ExploreCategory
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [mythIdx, setMythIdx] = useState(0);
  const [activeArticle, setActiveArticle] = useState<ExplorePost | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(["exp-1"]);

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

  const activeMyth = MYTH_CARDS[mythIdx % MYTH_CARDS.length];

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getTagBadgeStyle = (post: ExplorePost) => {
    if (post.tagLabel === "OPPORTUNITY" || post.tagTone === "amber") {
      return "bg-[#FFE500]/90 text-[#06182C] border-amber-300";
    }
    if (post.tagLabel === "QUANTA CLUB" || post.tagTone === "cyan") {
      return "bg-cyan-100 text-[#094C9C] border-cyan-300";
    }
    return "bg-[#E0F0FF] text-[#1D63EB] border-sky-200";
  };

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
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Explore{" "}
                <span className="font-serif italic font-normal text-[#1D63EB]">
                  The Dispatch
                </span>
              </h1>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Scientific journalism, fellowships, club dispatches & visual explainers
            </p>
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-[0_2px_10px_rgba(9,25,47,0.04)] transition-all"
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
                className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap active:scale-[0.98] transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)] border border-transparent"
                    : "bg-white/80 backdrop-blur-md text-slate-600 border border-white/80 hover:bg-white hover:text-slate-900 shadow-2xs"
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
              className="relative w-full h-[220px] sm:h-[250px] rounded-3xl overflow-hidden shadow-[0_12px_36px_rgba(6,25,75,0.18)] text-left group block focus:outline-none active:scale-[0.99] transition cursor-pointer border border-white/30"
            >
              <img
                src={heroPost.imageUrl}
                alt={heroPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030D1E] via-[#041226]/55 to-transparent" />

              {/* Top Tag Pill */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>IMPORTANT</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFE500] text-[#06182C] shadow-sm">
                    {heroPost.tagLabel}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950/70 text-sky-100 backdrop-blur-md border border-white/20 shrink-0">
                  {heroPost.readTime}
                </span>
              </div>

              {/* Bottom Headline & Meta */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="font-display text-base sm:text-lg font-extrabold leading-snug line-clamp-2">
                  {heroPost.title}
                </h2>
                <div className="mt-2 flex items-center justify-between text-xs text-sky-200/90 font-medium">
                  <span>
                    {heroPost.source} · {heroPost.date}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-[11px]">
                    <span>Read Breakdown</span>
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
                          ? "w-6 bg-[#1D63EB]"
                          : "w-1.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Priority Feed List: New & Important Dispatches First */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-extrabold text-slate-900">
                Latest &amp; Featured Dispatches
              </h2>
            </div>
            <span className="font-mono text-[11px] font-bold text-slate-400">
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
                style={{ animationDelay: `${100 + idx * 40}ms` }}
                className={`bg-white/85 backdrop-blur-xl rounded-3xl border p-3.5 sm:p-4 shadow-[0_6px_24px_rgba(9,25,47,0.05)] hover:border-[#1D63EB]/50 hover:bg-white/95 active:scale-[0.99] transition-all flex items-center gap-3.5 cursor-pointer animate-rise ${
                  isTopPriority
                    ? "border-[#1D63EB]/45 ring-2 ring-[#1D63EB]/15"
                    : "border-white/80"
                }`}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100/80 border border-white/80 shadow-inner">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 text-[#FFE500] font-mono text-[9px] font-extrabold backdrop-blur-xs">
                    0{idx + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {priorityBadge === "IMPORTANT" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[9.5px] font-extrabold uppercase tracking-wider shadow-2xs">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>IMPORTANT</span>
                        </span>
                      )}
                      {priorityBadge === "NEW" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#061E47] text-[#38E4FF] font-mono text-[9.5px] font-extrabold uppercase tracking-wider">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>NEW</span>
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-extrabold uppercase tracking-wider border ${getTagBadgeStyle(
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
                      className={`p-1.5 rounded-full hover:bg-slate-100/60 active:scale-[0.95] transition cursor-pointer ${
                        isSaved
                          ? "text-[#1D63EB]"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      aria-label="Bookmark article"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  <h3 className="font-display mt-1 text-sm sm:text-[15px] font-extrabold text-slate-900 leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <div className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="text-[#094C9C] font-bold">
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

        {/* Redesigned Scientific Fact Check Comparison Card */}
        <div
          className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_12px_36px_rgba(9,25,47,0.06)] overflow-hidden animate-rise"
          style={{ animationDelay: "160ms" }}
        >
          {/* Header Bar */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#062456] via-[#0A3882] to-[#1258C7] text-white flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#38E4FF]/20 border border-[#38E4FF]/40 text-[#38E4FF] font-mono text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                SCIENCE FACT CHECK
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 font-mono text-[10px] font-bold text-sky-100 backdrop-blur-xs">
                {activeMyth.topic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-extrabold text-sky-200 tabular-nums">
                {(mythIdx % MYTH_CARDS.length) + 1} / {MYTH_CARDS.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setMythIdx(
                      (prev) =>
                        (prev - 1 + MYTH_CARDS.length) % MYTH_CARDS.length
                    )
                  }
                  aria-label="Previous fact check card"
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white active:scale-[0.96] transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMythIdx((prev) => (prev + 1) % MYTH_CARDS.length)
                  }
                  aria-label="Next fact check card"
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white active:scale-[0.96] transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Body: Two Comparison Panels */}
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Panel 1: Misconception */}
            <div className="rounded-2xl p-4 bg-rose-50/80 backdrop-blur-md border border-rose-200/70 flex flex-col justify-between space-y-2.5 shadow-2xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-rose-700 font-mono text-[10.5px] font-extrabold uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Misconception</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9.5px] font-extrabold">
                    Unverified Claim
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  &ldquo;{activeMyth.myth}&rdquo;
                </p>
              </div>
            </div>

            {/* Panel 2: Scientific Consensus */}
            <div className="rounded-2xl p-4 bg-emerald-50/80 backdrop-blur-md border border-emerald-200/70 flex flex-col justify-between space-y-2.5 shadow-2xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-emerald-800 font-mono text-[10.5px] font-extrabold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Scientific Consensus</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 font-mono text-[10px] font-extrabold">
                    {activeMyth.stat} · {activeMyth.statLabel}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {activeMyth.reality}
                </p>
              </div>
            </div>
          </div>

          {/* Footer: Citation Strip */}
          <div className="px-4 sm:px-5 py-3 bg-white/60 backdrop-blur-md border-t border-white/80 flex items-center justify-between gap-2 text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold truncate">
              <BookOpen className="w-3.5 h-3.5 text-[#1D63EB] shrink-0" />
              <span className="truncate">
                <strong className="text-slate-800">Reference:</strong>{" "}
                {activeMyth.source}
              </span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D63EB] font-mono text-[10px] font-bold shrink-0 border border-blue-200/60">
              Peer-Reviewed
            </span>
          </div>
        </div>
      </div>

      {/* Article Reader Modal with 01/02/03 Stepped Breakdown */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-[480px] max-h-[88vh] rounded-t-3xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl overflow-hidden shadow-2xl border border-white/80 flex flex-col animate-rise">
            <div className="relative h-52 w-full shrink-0">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-900/75 text-white flex items-center justify-center hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-3.5 left-4 px-3 py-1 rounded-full font-mono text-[10px] font-extrabold uppercase tracking-wider bg-[#FFE500] text-[#06182C] shadow-sm">
                {activeArticle.tagLabel} · {activeArticle.category}
              </span>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5">
              <h2 className="font-display text-lg font-extrabold text-slate-900 leading-snug">
                {activeArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 pb-2.5 border-b border-slate-100">
                <span className="text-[#1D63EB] font-extrabold">
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
              <div className="rounded-2xl bg-[#F4F8FD] border-l-4 border-[#1D63EB] p-3.5 space-y-2">
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#094C9C]">
                  THE 3-STEP SCIENTIFIC BREAKDOWN
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-extrabold text-[#1D63EB]">
                      01
                    </span>
                    <span>
                      <strong>Core Finding:</strong> Verified by QUANTA
                      Scientific Committee for practical workshop integration.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-extrabold text-[#1D63EB]">
                      02
                    </span>
                    <span>
                      <strong>Why It Matters:</strong> Directly connects to
                      hands-on student lab tracks and skill badge projects.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-extrabold text-[#1D63EB]">
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

              <div className="p-3 rounded-2xl bg-[#EBF3FC]/80 border border-[#D4E4F7] text-xs text-slate-700 space-y-1">
                <div className="font-extrabold text-[#094C9C] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1D63EB]" />
                  <span>QUANTA Editorial Digest</span>
                </div>
                <p>
                  Curated by the QUANTA Media & Scientific Teams for University
                  of Algiers 1 members.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleSave(activeArticle.id)}
                  className="h-10 px-4 rounded-full border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      savedIds.includes(activeArticle.id)
                        ? "fill-[#1D63EB] text-[#1D63EB]"
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
                      href={activeArticle.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 px-4 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 active:scale-[0.98] transition"
                    >
                      <span>Open Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveArticle(null)}
                      className="h-10 px-5 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white text-xs font-extrabold shadow-[0_4px_14px_rgba(29,99,235,0.3)] hover:shadow-md active:scale-[0.98] transition cursor-pointer"
                    >
                      Done Reading
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveArticle(null)}
                    className="h-10 px-5 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white text-xs font-extrabold shadow-[0_4px_14px_rgba(29,99,235,0.3)] hover:shadow-md active:scale-[0.98] transition cursor-pointer"
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
