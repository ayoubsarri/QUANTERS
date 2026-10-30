import fs from "fs";

let content = fs.readFileSync("src/app/admin/org/page.tsx", "utf8").replace(/\r\n/g, "\n");

// 1. Remove the button at top header
const btnTarget = `            <button
              type="button"
              onClick={openExecModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white text-xs font-bold transition cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Executive Officers</span>
            </button>`;

if (content.includes(btnTarget)) {
  content = content.replace(btnTarget, "");
  console.log("Removed header Change Executive Officers button");
}

// 2. Remove the section link
const linkTarget = `            <button
              type="button"
              onClick={openExecModal}
              className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
            >
              Change Executive Officers →
            </button>`;

if (content.includes(linkTarget)) {
  content = content.replace(linkTarget, "");
  console.log("Removed section link Change Executive Officers");
}

// 3. Remove the modal
const modalTarget = `      {/* 1. Change Executive Officers Modal */}
      {execModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[440px] bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black text-[#0F1E36]">
                  Change Executive Bureau Officers
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExecModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExecOfficers} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Club President
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Press A–Z to jump
                  </span>
                </div>
                <select
                  value={selectedPresidentId}
                  onChange={(e) => setSelectedPresidentId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(e, eligibleLeaderMembers, setSelectedPresidentId)
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-800 font-semibold"
                >
                  <option value="">-- Vacant / Election Pending --</option>
                  {eligibleLeaderMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vice President (VP)
                </label>
                <select
                  value={selectedVpId}
                  onChange={(e) => setSelectedVpId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(e, eligibleLeaderMembers, setSelectedVpId)
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-800 font-semibold"
                >
                  <option value="">-- Vacant / Election Pending --</option>
                  {eligibleLeaderMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Secretary General (SG)
                </label>
                <select
                  value={selectedSgId}
                  onChange={(e) => setSelectedSgId(e.target.value)}
                  onKeyDown={(e) =>
                    handleMemberSelectKeyDown(e, eligibleLeaderMembers, setSelectedSgId)
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200/90 rounded-xl text-slate-800 font-semibold"
                >
                  <option value="">-- Vacant / Election Pending --</option>
                  {eligibleLeaderMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.quanterId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExecModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-gradient-to-b from-[#182C4E] to-[#101F38] hover:brightness-110 border border-[#2B4875]/65 text-white rounded-xl transition cursor-pointer"
                >
                  Save Executive Bureau
                </button>
              </div>
            </form>
          </div>
        </div>
      )}`;

if (content.includes(modalTarget)) {
  content = content.replace(modalTarget, "");
  console.log("Removed Change Executive Officers modal");
}

fs.writeFileSync("src/app/admin/org/page.tsx", content);
