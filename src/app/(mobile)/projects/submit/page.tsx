"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  FileCode2,
  FolderGit2,
  Link2,
  Plus,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

const CATEGORY_TO_BADGE: Record<string, { badgeId: string; badgeTitle: string }> = {
  "Data Analysis": { badgeId: "badge-data", badgeTitle: "Data Analysis" },
  "Python Explorer": { badgeId: "badge-python", badgeTitle: "Python Explorer" },
  Electronics: { badgeId: "badge-electronics", badgeTitle: "Electronics" },
  Innovation: { badgeId: "badge-innovation", badgeTitle: "Innovation" },
  Astrophysics: { badgeId: "badge-astro", badgeTitle: "Astronomy Explorer" },
};

export default function SubmitProjectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);
  const projectSubmissions = useQuantersStore((s) => s.projectSubmissions);
  const submitBadgeProject = useQuantersStore((s) => s.submitBadgeProject);

  const currentMember =
    members.find((m) => m.id === currentMemberId) || members[0];

  const [projectTitle, setProjectTitle] = useState("");
  const [category, setCategory] = useState("Data Analysis");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>(["Karim Hadj"]);
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; sizeLabel: string; compressed?: boolean }[]
  >([
    {
      name: "exoplanet_transit_analysis.pdf",
      sizeLabel: "1.4 MB",
      compressed: false,
    },
  ]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const nextFiles = Array.from(files).map((f) => {
      const isImage = f.type.startsWith("image/");
      const kb = Math.max(12, Math.round(f.size / 1024));
      return {
        name: isImage
          ? f.name.replace(/\.(png|jpg|jpeg)$/i, ".webp")
          : f.name,
        sizeLabel:
          kb > 1024
            ? `${(kb / 1024).toFixed(1)} MB`
            : `${isImage ? Math.round(kb * 0.35) : kb} KB`,
        compressed: isImage,
      };
    });

    setUploadedFiles((prev) => [...prev, ...nextFiles]);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle =
      projectTitle.trim() || "Exoplanet Data Analysis & Light-Curve Modeling";
    const cleanDesc =
      description.trim() ||
      "Cleaned Kepler/TESS transit photometry dataset in Python and extracted planetary radius and orbital period with uncertainty bounds.";

    const mapped = CATEGORY_TO_BADGE[category] || CATEGORY_TO_BADGE["Data Analysis"];

    submitBadgeProject({
      badgeId: mapped.badgeId,
      badgeTitle: mapped.badgeTitle,
      memberId: currentMember.id,
      memberName: currentMember.fullName,
      projectTitle: cleanTitle,
      category,
      description: cleanDesc,
      repoUrl: repoUrl.trim() || "https://github.com/quanta-algiers/exoplanet-analysis",
      teamMembers,
      fileNames: uploadedFiles.map((f) => f.name),
    });

    setSubmittedSuccess(cleanTitle);
    setProjectTitle("");
    setDescription("");
    setRepoUrl("");
  };

  const mySubmissions = projectSubmissions.filter(
    (s) => s.memberId === currentMember.id
  );

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
              placeholder="e.g. Exoplanet Data Analysis"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#182C4E] transition-all"
            >
              <option value="Data Analysis">Data Analysis</option>
              <option value="Python Explorer">Python Explorer</option>
              <option value="Electronics">Electronics</option>
              <option value="Innovation">Innovation</option>
              <option value="Astrophysics">Astrophysics</option>
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
              placeholder="Describe your project, objectives, and results..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all resize-none"
            />
          </div>

          {/* Repository / Demo Link (optional) */}
          <div>
            <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
              Repository / Demo Link{" "}
              <span className="text-slate-400 font-medium">(optional)</span>
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all"
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
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTeamMember();
                    }
                  }}
                  placeholder="Add member"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E] transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTeamMember}
                className="w-10 h-10 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 hover:opacity-95 active:scale-[0.98] text-white flex items-center justify-center shrink-0 transition cursor-pointer"
                aria-label="Add team member"
              >
                <Plus className="w-4 h-4" />
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

          {/* Compact Cloud Upload Dropzone */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.zip,.py,.ipynb,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-xl border border-dashed border-[#2B4875]/40 bg-[#F0F6FF]/50 hover:bg-[#F0F6FF] active:scale-[0.99] transition flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-[#D5E3F5] flex items-center justify-center text-[#182C4E] mb-1.5 group-hover:scale-105 transition-transform">
                <CloudUpload className="w-4 h-4 text-[#0284C7]" />
              </div>
              <span className="text-xs font-black text-[#0F1E36]">
                Upload files
              </span>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                PDF, ZIP, or images up to 50 MB
              </span>
            </button>

            {/* Attached Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {uploadedFiles.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200/90 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <FileCode2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                      <span className="font-semibold text-slate-800 break-all">
                        {f.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
                        ({f.sizeLabel})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setUploadedFiles((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Project Button */}
          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 hover:opacity-95 active:scale-[0.98] text-white font-display font-black text-xs transition cursor-pointer"
          >
            Submit Project
          </button>
        </form>

        {/* My Previous Submissions — Small, Compact Rows */}
        {mySubmissions.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2">
            <h3 className="text-[11px] font-black text-[#182C4E] uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>My Previous Submissions ({mySubmissions.length})</span>
            </h3>
            {mySubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-2.5 rounded-lg bg-white border border-slate-200/90 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#0F1E36] leading-snug">
                    {sub.projectTitle}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Badge: {sub.badgeTitle} · {sub.submittedAt}
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
            ))}
          </div>
        )}
      </div>
    </MobileAppShell>
  );
}
