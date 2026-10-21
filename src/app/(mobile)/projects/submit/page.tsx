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
  Sparkles,
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
  const settings = useQuantersStore((s) => s.settings);
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
      <div className="flex-1 flex flex-col px-4 sm:px-5 pt-3 pb-6 animate-rise">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-900 hover:text-[#1D63EB] active:scale-[0.98] transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[19px] font-black tracking-tight">
              Submit Project
            </span>
          </button>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1D63EB] text-[10.5px] font-black border border-blue-200/60 shadow-2xs">
            Badge Qualification
          </span>
        </div>

        {/* Submission Confirmation Toast */}
        {submittedSuccess && (
          <div className="mb-4 p-3.5 rounded-3xl bg-emerald-50/90 backdrop-blur-md border border-emerald-200 flex items-start justify-between gap-2.5 animate-rise shadow-[0_4px_16px_rgba(16,185,129,0.12)]">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Exoplanet Data Analysis"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-2xs transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-2xs transition-all"
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
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, objectives, and results..."
              className="w-full px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-2xs transition-all resize-none"
            />
          </div>

          {/* Repository / Demo Link (optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
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
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-2xs transition-all"
              />
            </div>
          </div>

          {/* Team Members (optional) with Blue + Button */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
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
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63EB] shadow-2xs transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTeamMember}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:opacity-95 active:scale-[0.98] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(29,99,235,0.25)] transition cursor-pointer"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-[#1D63EB] text-[11px] font-bold shadow-2xs"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeamMember(name)}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dashed Cloud Upload Dropzone */}
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
              className="w-full p-6 rounded-3xl border-2 border-dashed border-blue-300/80 bg-white/70 backdrop-blur-md hover:bg-white active:scale-[0.99] transition flex flex-col items-center justify-center text-center group shadow-2xs cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50/90 border border-blue-100 shadow-2xs flex items-center justify-center text-[#1D63EB] mb-2 group-hover:scale-105 transition-transform">
                <CloudUpload className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-slate-800">
                Upload files
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                PDF, ZIP, or images up to 50 MB
              </span>
            </button>

            {/* Attached Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                {uploadedFiles.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="px-3.5 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCode2 className="w-4 h-4 text-[#1D63EB] shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">
                        {f.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
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
                      className="text-slate-400 hover:text-rose-600 ml-2 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full-width Royal Blue Submit Project Button */}
          <button
            type="submit"
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:opacity-95 active:scale-[0.98] text-white font-black text-sm shadow-[0_8px_24px_rgba(29,99,235,0.28)] transition cursor-pointer"
          >
            Submit Project
          </button>
        </form>

        {/* My Recent Submissions Status Strip */}
        {mySubmissions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-200/60 space-y-2.5">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-[#1D63EB]" />
              <span>Your Submitted Projects ({mySubmissions.length})</span>
            </h3>
            {mySubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(9,25,47,0.04)] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {sub.projectTitle}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Badge: {sub.badgeTitle} · {sub.submittedAt}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 border ${
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
