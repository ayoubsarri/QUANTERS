import fs from "fs";

let code = fs.readFileSync("src/app/admin/messages/page.tsx", "utf8");

const needle = `Tracks In-App Read / Total progress bar and Email Sent / Failed counters
                </p>
              </div>
            </div>`;

const replacement = `Tracks In-App Read / Total progress bar and Email Sent / Failed counters
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to permanently delete ALL broadcast messages? This will remove all announcements from all members' inboxes."
                      )
                    ) {
                      deleteAllClubMessages();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="Delete all broadcast messages"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete All Messages</span>
                </button>
              )}
            </div>`;

if (code.includes(needle)) {
  code = code.replace(needle, replacement);
  fs.writeFileSync("src/app/admin/messages/page.tsx", code, "utf8");
  console.log("Successfully added Delete All Messages button!");
} else {
  // Try CRLF
  const needleCRLF = needle.replace(/\n/g, "\r\n");
  const repCRLF = replacement.replace(/\n/g, "\r\n");
  if (code.includes(needleCRLF)) {
    code = code.replace(needleCRLF, repCRLF);
    fs.writeFileSync("src/app/admin/messages/page.tsx", code, "utf8");
    console.log("Successfully added Delete All Messages button (CRLF)!");
  } else {
    console.error("Could not find needle in src/app/admin/messages/page.tsx");
  }
}
