import fs from 'fs';

let content = fs.readFileSync('src/app/admin/proposals/page.tsx', 'utf8');

// 1. Add hooks in store
const oldStoreHooks = `  const proposals = useQuantersStore((s) => s.proposals);
  const reviewProposal = useQuantersStore((s) => s.reviewProposal);`;

const newStoreHooks = `  const proposals = useQuantersStore((s) => s.proposals);
  const reviewProposal = useQuantersStore((s) => s.reviewProposal);
  const voteOnProposal = useQuantersStore((s) => s.voteOnProposal);
  const members = useQuantersStore((s) => s.members);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);

  const totalEligibleExecs = members.filter(
    (m) => m.status === "Active" && (m.roles.includes("Executive") || m.roles.includes("Super Admin"))
  ).length;
  const requiredTwoThirds = Math.max(1, Math.ceil((totalEligibleExecs * 2) / 3));`;

content = content.replace(oldStoreHooks.replace(/\r?\n/g, '\r\n'), newStoreHooks.replace(/\r?\n/g, '\r\n'));

// 2. Add ballot progress bar on card for Internal Law Amendment
const oldExecutiveBanner = `                  {isLawAmendment && (
                    <div className="px-3 py-2 rounded-xl bg-[#FEF3C7] border border-amber-300 text-[#B45309] text-xs font-extrabold flex items-center gap-2">
                      <Scale className="w-4 h-4 shrink-0" />
                      <span>Executive Board Review</span>
                    </div>
                  )}`;

const newExecutiveBanner = `                  {isLawAmendment && (() => {
                    const votes = prop.votes ? Object.values(prop.votes) : [];
                    const approveCount = votes.filter((v) => v.decision === "Approved").length;
                    const pct = Math.min(100, Math.round((approveCount / requiredTwoThirds) * 100));
                    return (
                      <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5 text-amber-800">
                            <Scale className="w-3.5 h-3.5 shrink-0" />
                            Executive 2/3 Majority Ballot
                          </span>
                          <span className="font-mono text-xs font-bold text-amber-900">
                            {approveCount} / {requiredTwoThirds} needed ({totalEligibleExecs} eligible)
                          </span>
                        </div>
                        <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: \`\${pct}%\` }}
                          />
                        </div>
                      </div>
                    );
                  })()}`;

content = content.replace(oldExecutiveBanner.replace(/\r?\n/g, '\r\n'), newExecutiveBanner.replace(/\r?\n/g, '\r\n'));

// 3. Add voting ballot in modal
const oldModalActions = `              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                </button>`;

const newModalActions = `              {reviewingProposal.type === "Internal Law Amendment" && (() => {
                const votes = reviewingProposal.votes ? Object.values(reviewingProposal.votes) : [];
                const approveCount = votes.filter((v) => v.decision === "Approved").length;
                return (
                  <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                        <Scale className="w-4 h-4 text-amber-700" />
                        <span>Executive Board Ballot (2/3 Quorum Required)</span>
                      </div>
                      <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        {approveCount} / {requiredTwoThirds} Required
                      </span>
                    </div>
                    {votes.length > 0 ? (
                      <div className="max-h-28 overflow-y-auto space-y-1.5 pt-1">
                        {votes.map((v) => (
                          <div key={v.memberId} className="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-lg border border-amber-100 shadow-2xs">
                            <div>
                              <span className="font-bold text-slate-800">{v.memberName}</span>
                              {v.comment && <p className="text-[11px] text-slate-500 italic">"{v.comment}"</p>}
                            </div>
                            <span className={\`px-2 py-0.5 rounded text-[10px] font-black \${v.decision === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}\`}>
                              {v.decision}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-800/80 italic">No executive votes cast yet.</p>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                {reviewingProposal.type === "Internal Law Amendment" ? (
                  <>
                    <button
                      type="button"
                      disabled={!reviewComment.trim()}
                      onClick={() => {
                        const res = voteOnProposal(reviewingProposal.id, "Rejected", reviewComment.trim());
                        if (res.ok) {
                          setToastMsg(\`Executive vote recorded: Rejected (\${res.message})\`);
                          setReviewingProposal(null);
                        } else {
                          setToastMsg(\`Vote failed: \${res.message}\`);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Cast Vote: Reject
                    </button>
                    <button
                      type="button"
                      disabled={!reviewComment.trim()}
                      onClick={() => {
                        const res = voteOnProposal(reviewingProposal.id, "Approved", reviewComment.trim());
                        if (res.ok) {
                          setToastMsg(\`Executive vote recorded: Approved (\${res.message})\`);
                          setReviewingProposal(null);
                        } else {
                          setToastMsg(\`Vote failed: \${res.message}\`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Cast 2/3 Vote: Approve
                    </button>
                    <button
                      type="button"
                      disabled={!reviewComment.trim()}
                      onClick={() => handleDecision("Approved", false)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                      title="Super Admin override"
                    >
                      Direct Executive Override
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}`;

content = content.replace(oldModalActions.replace(/\r?\n/g, '\r\n'), newModalActions.replace(/\r?\n/g, '\r\n'));

fs.writeFileSync('src/app/admin/proposals/page.tsx', content, 'utf8');
console.log('Successfully updated proposals page!');
