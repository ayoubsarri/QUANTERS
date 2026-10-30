import fs from "fs";

let content = fs.readFileSync("src/app/admin/members/page.tsx", "utf8").replace(/\r\n/g, "\n");

// 1. Update initial state & handleOpenDelete
content = content.replace(
  'const [deleteMode, setDeleteMode] = useState<"remove" | "permanent">("permanent");',
  'const [deleteMode, setDeleteMode] = useState<"remove" | "permanent">("remove");'
);

content = content.replace(
  'setDeleteMode("permanent");',
  'setDeleteMode("remove");'
);

// 2. Replace the modal markup with the streamlined, compact, recommended version
const modalTargetRegex = /\{\/\* TWO-CHOICE DELETE & REMOVAL CONFIRMATION MODAL \*\/\}[\s\S]*?\{\/\* Manual Member Enrolment Modal \*\/\}/;

const newModalMarkup = `{/* TWO-CHOICE DELETE & REMOVAL CONFIRMATION MODAL */}
      {deleteModalOpen && targetMember && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                  <Trash2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Member Deletion Protocol
                  </h3>
                  <p className="text-[11px] text-slate-500">Select archive or purge mode</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setTargetMember(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Member Card */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">{targetMember.fullName}</div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{targetMember.email}</div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10.5px] font-bold text-slate-600 shrink-0">
                {targetMember.quanterId}
              </span>
            </div>

            {/* Choice 1: Soft Remove (Recommended) */}
            <div
              onClick={() => setDeleteMode("remove")}
              className={\`p-3 rounded-xl border-2 cursor-pointer transition \${
                deleteMode === "remove"
                  ? "border-[#182C4E] bg-slate-50/90 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }\`}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <input
                    type="radio"
                    checked={deleteMode === "remove"}
                    onChange={() => setDeleteMode("remove")}
                    className="accent-[#182C4E]"
                  />
                  <span>Move to Former Members (Recommended)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-5 leading-normal">
                Archives records and disables login. Re-registration is blocked.
              </p>
            </div>

            {/* Choice 2: Permanent Purge */}
            <div
              onClick={() => setDeleteMode("permanent")}
              className={\`p-3 rounded-xl border-2 cursor-pointer transition \${
                deleteMode === "permanent"
                  ? "border-rose-600 bg-rose-50/50 shadow-xs"
                  : "border-slate-200 bg-white hover:border-rose-300"
              }\`}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-rose-950 text-xs flex items-center gap-2">
                  <input
                    type="radio"
                    checked={deleteMode === "permanent"}
                    onChange={() => setDeleteMode("permanent")}
                    className="accent-rose-600"
                  />
                  <span>Permanent Delete &amp; Free Email</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                  Purge &amp; Reset
                </span>
              </div>
              <p className="text-[11px] text-rose-700/80 mt-1 pl-5 leading-normal">
                Completely deletes member history and frees email for new registration.
              </p>
            </div>

            {/* Reason input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Reason / Reference Note (Optional)
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Account reset request, test account cleanup"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#182C4E]/20"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setTargetMember(null);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className={\`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer transition \${
                  deleteMode === "permanent"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-[#182C4E] hover:bg-[#101F38]"
                }\`}
              >
                {deleteMode === "permanent" ? "Purge Account" : "Move to Former Members"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Member Enrolment Modal */}`;

if (modalTargetRegex.test(content)) {
  content = content.replace(modalTargetRegex, newModalMarkup);
  console.log("Replaced modal markup successfully");
} else {
  console.log("Modal regex did not match");
}

fs.writeFileSync("src/app/admin/members/page.tsx", content);
