"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  FileText,
  Scale,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { Proposal, ProposalState, ProposalTypeKey } from "@/lib/types/erp";

const PROPOSAL_TYPES: ProposalTypeKey[] = [
  "Event",
  "Workshop",
  "Activity",
  "Collaboration",
  "Internal Law Amendment",
  "Other",
];

const PROPOSAL_STATES: ProposalState[] = [
  "Submitted",
  "Under Review",
  "Approved",
  "Changes Requested",
  "Rejected",
];

export default function AdminProposalsPage() {
  const proposals = useQuantersStore((s) => s.proposals);
  const reviewProposal = useQuantersStore((s) => s.reviewProposal);

  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [stateFilter, setStateFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [reviewingProposal, setReviewingProposal] = useState<Proposal | null>(null);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredProposals = proposals.filter((p) => {
    const matchesType = typeFilter === "All" || p.type === typeFilter;
    const matchesState = stateFilter === "All" || p.state === stateFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.submitterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesState && matchesSearch;
  });

  const handleDecision = (nextState: ProposalState, convertToWorkshop = false) => {
    if (!reviewingProposal || !reviewComment.trim()) return;
    reviewProposal(reviewingProposal.id, nextState, reviewComment.trim(), convertToWorkshop);
    setToastMsg(
      convertToWorkshop
        ? `Approved '${reviewingProposal.title}' and published it to the Workshops schedule.`
        : `Proposal '${reviewingProposal.title}' updated to '${nextState}'.`
    );
    setReviewingProposal(null);
    setReviewComment("");
  };

  const getStateBadge = (state: ProposalState) => {
    switch (state) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Under Review":
        return "bg-blue-50 text-[#1D63EB] border-blue-200";
      case "Submitted":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Changes Requested":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <>
      <div className="space-y-4 max-w-[1500px] mx-auto animate-rise">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2EDF8] shadow-sm">
          <div>
            <h1 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
              Proposals Review
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Review member initiatives, workshop proposals, and collaboration requests
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-[#F4F7FB] px-3 py-1.5 rounded-xl border border-[#E2EDF8]">
              {filteredProposals.length} Proposals
            </span>
          </div>
        </div>

        {toastMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposals by title, submitter, or content..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">State:</span>
              {["All", ...PROPOSAL_STATES].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStateFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    stateFilter === st
                      ? "bg-[#1D63EB] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 mr-1">Proposal Type:</span>
            {["All", ...PROPOSAL_TYPES].map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setTypeFilter(tp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  typeFilter === tp
                    ? "bg-[#061E47] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProposals.map((prop) => {
            const isLawAmendment = prop.type === "Internal Law Amendment";

            return (
              <div
                key={prop.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition ${
                  isLawAmendment
                    ? "border-amber-300 ring-1 ring-amber-200/60"
                    : "border-slate-200/80"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-slate-100 text-slate-800">
                        {prop.type}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStateBadge(
                          prop.state
                        )}`}
                      >
                        {prop.state}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums">{prop.createdAt}</span>
                  </div>

                  {isLawAmendment && (
                    <div className="px-3 py-2 rounded-xl bg-[#FEF3C7] border border-amber-300 text-[#B45309] text-xs font-extrabold flex items-center gap-2">
                      <Scale className="w-4 h-4 shrink-0" />
                      <span>Executive Board Review</span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{prop.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{prop.description}</p>
                  </div>

                  {/* Dynamic Specific Fields Preview */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(prop.specificFields).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="font-bold text-slate-700 capitalize">
                          {k.replace(/([A-Z])/g, " $1")}:{" "}
                        </span>
                        <span className="text-slate-600">{v}</span>
                      </div>
                    ))}
                  </div>

                  {prop.reviewerComment && (
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700">
                      <strong className="text-[#1D63EB]">Reviewer Note:</strong>{" "}
                      {prop.reviewerComment}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Submitted by <strong className="text-slate-800">{prop.submitterName}</strong> ·{" "}
                    <strong className="text-[#1D63EB]">{prop.reviewerScope}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewingProposal(prop);
                      setReviewComment(
                        prop.reviewerComment ||
                          "Reviewed against club feasibility and scheduling criteria."
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Review &amp; Decide</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Viewport-Centered Review Proposal Modal */}
      {reviewingProposal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#061E47] text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold">
                  Review Proposal — {reviewingProposal.type}
                </h2>
                <p className="text-xs text-sky-200 mt-0.5">
                  Submitted by {reviewingProposal.submitterName} · {reviewingProposal.reviewerScope}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewingProposal(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {reviewingProposal.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">{reviewingProposal.description}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                {Object.entries(reviewingProposal.specificFields).map(([k, v]) => (
                  <div key={k}>
                    <span className="font-bold text-slate-800 capitalize">
                      {k.replace(/([A-Z])/g, " $1")}:{" "}
                    </span>
                    <span className="text-slate-600">{v}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reviewer Decision Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Provide feedback or decision note for the submitter..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1D63EB]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!reviewComment.trim()}
                  onClick={() => handleDecision("Rejected", false)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={!reviewComment.trim()}
                  onClick={() => handleDecision("Changes Requested", false)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  disabled={!reviewComment.trim()}
                  onClick={() => handleDecision("Approved", false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Approve {reviewingProposal.type}
                </button>

                {reviewingProposal.type === "Workshop" && (
                  <button
                    type="button"
                    disabled={!reviewComment.trim()}
                    onClick={() => handleDecision("Approved", true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D63EB] hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm disabled:opacity-40 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Approve &amp; Publish Workshop</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
