import fs from "fs";

const code = fs.readFileSync("src/lib/store/useQuantersStore.ts", "utf8");
const lines = code.split("\n");
const startIdx = lines.findIndex((l) => l.includes("useQuantersStore = create<QuantersStoreState>"));

// Match 2 or 4 space indented action keys with `: (` or `: async (`
const actions = [];
for (let i = startIdx; i < lines.length; i++) {
  const m = lines[i].match(/^\s{2,4}([a-zA-Z0-9_]+):\s*(async\s*)?\(/);
  if (m && !["if", "for", "while", "switch", "catch"].includes(m[1])) {
    actions.push({ name: m[1], line: i + 1 });
  }
}

const localOnly = new Set([
  "setActiveLanguage",
  "setActiveAdminRole",
  "setCurrentMember",
  "setCurrentMemberId",
  "setMobileFrameMode",
  "setOnlineStatus",
  "setUserLowDataMode",
  "triggerCelebration",
  "dismissCelebration",
  "hydrateFromLocalCache",
  "saveToLocalCache",
  "applyIncomingCloudSnapshot",
  "pullExactUpdatesFromServer",
  "syncWithServer",
  "compactAndPruneQuota",
  "logout",
  "loginWithEmailPassword",
  "loginWithGoogle",
]);

const issues = [];
for (let idx = 0; idx < actions.length; idx++) {
  const a = actions[idx];
  if (localOnly.has(a.name)) continue;
  const endLine = idx + 1 < actions.length ? actions[idx + 1].line - 1 : lines.length;
  const body = lines.slice(a.line - 1, endLine).join("\n");
  if (!body.includes("set(") && !body.includes("set({")) continue;

  const hasSaveCache = body.includes("saveToLocalCache");
  const hasSyncTrue = body.includes("syncWithServer(true)");

  if (!hasSaveCache || !hasSyncTrue) {
    issues.push({
      name: a.name,
      line: a.line,
      hasSaveCache,
      hasSyncTrue,
    });
  }
}

console.log(`Scanned ${actions.length} actions. Found ${issues.length} missing saveToLocalCache or syncWithServer(true):`);
console.table(issues);

const deleteAudit = [];
for (let idx = 0; idx < actions.length; idx++) {
  const a = actions[idx];
  if (!/^(delete|remove|revoke)/i.test(a.name)) continue;
  const endLine = idx + 1 < actions.length ? actions[idx + 1].line - 1 : lines.length;
  const body = lines.slice(a.line - 1, endLine).join("\n");
  const hasFilter = body.includes(".filter(");
  const hasTombstone =
    body.includes("recordPersistentDeletedId") || body.includes("registerRecentDeletion");
  deleteAudit.push({ name: a.name, line: a.line, hasFilter, hasTombstone });
}
console.log("\nDelete/Remove/Revoke actions tombstone audit:");
console.table(deleteAudit);
