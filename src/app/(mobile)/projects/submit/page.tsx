"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Cloud,
  ExternalLink,
  FolderGit2,
  Plus,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { FALLBACK_SESSION_MEMBER } from "@/lib/data/seed";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { sanitizeExternalUrl } from "@/lib/utils/authSecurity";

const CATEGORY_TO_BADGE: Record<string, { badgeId: string; badgeTitle: string }> = {
  General: { badgeId: "badge-open-science", badgeTitle: "Open Science & Community Leader" },
  "Data Analysis": { badgeId: "badge-data", badgeTitle: "Data Analysis" },
  "Python Explorer": { badgeId: "badge-python", badgeTitle: "Python Explorer" },
  Electronics: { badgeId: "badge-electronics", badgeTitle: "Electronics" },
  Innovation: { badgeId: "badge-innovation", badgeTitle: "Innovation & Prototyping" },
  Astrophysics: { badgeId: "badge-astro", badgeTitle: "Astronomy Explorer" },
  "Artificial Intelligence": { badgeId: "badge-ai", badgeTitle: "AI & Neural Networks" },
  "Robotics & IoT": { badgeId: "badge-robotics", badgeTitle: "Robotics & Automation" },
};

export default function SubmitProjectPage() {
  const router = useRouter();

  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);
  const badges = useQuantersStore((s) => s.badges);
  const projectSubmissions = useQuantersStore((s) => s.projectSubmissions);
  const projectCategories = useQuantersStore((s) => s.projectCategories);
  const submitBadgeProject = useQuantersStore((s) => s.submitBadgeProject);

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

  const [projectTitle, setProjectTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [submittedSuccess, setSubmittedSuccess] = useState<string | null>(null);

  const handleAddTeamMember = () => {
    const trimmed = memberInput.trim();
    if (!trimmed) return;
    if (!teamMembers.includes(trimmed)) {
      setTeamMembers((prev) => [...prev, trimmed]);
    }
    setMemberInput("");
  };

  const handleRemoveTeamMember = (name: string) => {
    setTeamMembers((prev) => prev.filter((m) => m !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle =
      projectTitle.trim() || "Scientific Open Project Deliverable";
    const cleanDesc =
      description.trim() ||
      "Delivered verified open science research repository, documentation, and data artifacts for club evaluation.";

    const finalTeam = [...teamMembers];
    if (memberInput.trim() && !finalTeam.includes(memberInput.trim())) {
      finalTeam.push(memberInput.trim());
      setTeamMembers(finalTeam);
      setMemberInput("");
    }

    const matchedBadge =
      badges.find(
        (b) =>
          b.category.toLowerCase() === category.toLowerCase() ||
          b.name.toLowerCase().includes(category.toLowerCase())
      ) || badges[0];

    const badgeId = matchedBadge?.id || "badge-test-python";
    const badgeTitle = matchedBadge?.name || `${category} Milestone`;

    submitBadgeProject({
      badgeId,
      badgeTitle,
      memberId: currentMember.id,
      memberName: currentMember.fullName,
      projectTitle: cleanTitle,
      category,
      description: cleanDesc,
      repoUrl: repoUrl.trim() || undefined,
      driveUrl: driveUrl.trim() || undefined,
      teamMembers: finalTeam,
      fileNames: [],
    });

    setSubmittedSuccess(cleanTitle);
    setProjectTitle("");
    setDescription("");
    setRepoUrl("");
    setDriveUrl("");
  };

  const mySubmissions = projectSubmissions.filter(
    (s) => s.memberId === currentMember.id
  );

  if (!hydrated || !isAuthenticated || !currentMemberId || !activeMember) {
    return (
      <div className="min-h-dvh w-full bg-[#030812] flex items-center justify-center p-6 text-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#38BDF8] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <MobileAppShell>
      <div className="flex-1 flex flex-col px-4 sm:px-5 pt-2 pb-6 animate-rise">
        {/* Editorial Header */}
        <div className="mb-4 space-y-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-[#182C4E] active:scale-[0.98] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-[#F0F6FF] text-[#182C4E] text-[10.5px] font-black border border-[#D5E3F5]">
              Badge Qualification
            </span>
          </div>

          <div className="pt-0.5">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7]">
              CAPSTONE &amp; BADGE PROOF
            </p>
            <h1 className="font-display text-xl font-black tracking-tight text-[#0F1E36] leading-tight">
              Submit Project
            </h1>
          </div>
        </div>

        {/* Submission Confirmation Toast */}
        {submittedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-2.5 animate-rise">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-emerald-950">
                  Project Submitted for Reviewer Grading!
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                  &ldquo;{submittedSuccess}&rdquo; is now queued in the Badge Reviewer inbox.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmittedSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Project Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Project Title"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all"
            />
          </div>

          {/* Dynamic Category Dropdown (General + Admin-Editable Categories) */}
          <div>
            <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#182C4E] transition-all cursor-pointer"
            >
              {projectCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, objectives, methodologies, and outcomes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all resize-none"
            />
          </div>

          {/* Google Drive / Cloud Deliverables Link */}
          <div>
            <label className="block text-xs font-bold text-[#0F1E36] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Google Drive / Cloud Link</span>
              </span>
              <span className="text-slate-400 font-medium text-[10.5px]">
                (Docs, Slides, CAD, Data)
              </span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Provide shareable Google Drive, OneDrive, or Dropbox folder with public or view-only link.
            </p>
          </div>

          {/* GitHub / Repository Link */}
          <div>
            <label className="block text-xs font-bold text-[#0F1E36] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>GitHub / Repository Demo Link</span>
              </span>
              <span className="text-slate-400 font-medium text-[10.5px]">
                (Code &amp; Repositories)
              </span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/quanta-algiers/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all"
              />
            </div>
          </div>

          {/* Team Members (optional) */}
          <div>
            <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
              Team Members{" "}
              <span className="text-slate-400 font-medium">(optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  list="club-members-autocomplete"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTeamMember();
                    }
                  }}
                  placeholder="Type name or select member..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all"
                />
                <datalist id="club-members-autocomplete">
                  {members.map((m) => (
                    <option key={m.id} value={m.fullName} />
                  ))}
                </datalist>
              </div>
              <button
                type="button"
                onClick={handleAddTeamMember}
                className="px-3.5 h-10 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 hover:opacity-95 active:scale-[0.98] text-white flex items-center justify-center gap-1 shrink-0 transition cursor-pointer font-bold text-xs"
                aria-label="Add team member"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {teamMembers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {teamMembers.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-[#182C4E] text-[11px] font-bold"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeamMember(name)}
                      className="hover:text-[#0F1E36] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Project Button */}
          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 hover:opacity-95 active:scale-[0.98] text-white font-display font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#38E4FF]" />
            <span>Submit Project for Review</span>
          </button>
        </form>

        {/* My Previous Submissions */}
        {mySubmissions.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2">
            <h3 className="text-[11px] font-black text-[#182C4E] uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>My Previous Submissions ({mySubmissions.length})</span>
            </h3>
            {mySubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-xl bg-white border border-slate-200/90 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#0F1E36] leading-snug">
                      {sub.projectTitle}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Category: {sub.category} · Badge: {sub.badgeTitle} · {sub.submittedAt}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 border ${
                      sub.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : sub.status === "Pending Review"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1 border-t border-slate-100 flex-wrap">
                  {sanitizeExternalUrl(sub.driveUrl) && (
                    <a
                      href={sanitizeExternalUrl(sub.driveUrl)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0284C7] hover:underline"
                    >
                      <Cloud className="w-3 h-3" />
                      <span>Google Drive Link</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>
                  )}
                  {sanitizeExternalUrl(sub.repoUrl) && (
                    <a
                      href={sanitizeExternalUrl(sub.repoUrl)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-700 hover:text-[#182C4E] hover:underline"
                    >
                      <FolderGit2 className="w-3 h-3 text-slate-500" />
                      <span>GitHub Repo</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileAppShell>
  );
}
