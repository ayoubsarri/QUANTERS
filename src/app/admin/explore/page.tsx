"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Compass,
  ExternalLink,
  Newspaper,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ExploreCategory, ExplorePost } from "@/lib/types/erp";

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

export default function AdminExplorePage() {
  const explorePosts = useQuantersStore((s) => s.explorePosts);
  const createExplorePost = useQuantersStore((s) => s.createExplorePost);
  const updateExplorePostStatus = useQuantersStore((s) => s.updateExplorePostStatus);

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [banner, setBanner] = useState<string | null>(null);

  // Create Post Form state
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

  const filteredPosts = explorePosts.filter((p) => {
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

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
      date: "Oct 20, 2026",
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

  return (
    <>
      <div className="space-y-6 animate-rise">
        {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0F0FF] text-[#1D63EB]">
              Explore Feed Content Management System
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Powers Mobile Explore Feed (Scientific News · Events · QUANTA News · Opportunities)
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Explore Feed Editorial CMS &amp; Lifecycle Publishing
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Curate scientific digests, research internships, and club news across Draft → Review → Published → Archived states.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Explore Post
        </button>
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

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
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
            <span className="text-xs font-bold text-slate-500 mr-1">Lifecycle:</span>
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
          <span className="text-xs font-bold text-slate-500 mr-1">4 Categories:</span>
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

      {/* Posts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between"
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
                  <span className="font-bold text-[#1D63EB]">{post.category}</span>
                  <span>
                    {post.source} · {post.readTime} · {post.date}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3">{post.summary}</p>
              </div>
            </div>

            {/* Lifecycle Status Switcher */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/70 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500">Lifecycle State:</span>
              <select
                value={post.status}
                onChange={(e) => {
                  const next = e.target.value as ExplorePost["status"];
                  updateExplorePostStatus(post.id, next);
                  setBanner(`Updated '${post.title}' lifecycle status to ${next}.`);
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
                  <option key={st} value={st} className="bg-white text-slate-800">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* CREATE EXPLORE POST MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#061E47] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Create Explore Article / Opportunity</h2>
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

            <form onSubmit={handleCreatePost} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
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
                    onChange={(e) => setCategory(e.target.value as ExploreCategory)}
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
    </>
  );
}
