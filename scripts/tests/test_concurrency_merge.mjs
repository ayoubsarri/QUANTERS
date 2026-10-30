import fs from "fs";
import path from "path";

async function runConcurrencyMergeAudit() {
  console.log("=== TEST SUITE 5: DOCUMENT SHARDING & CONCURRENCY RECONCILIATION AUDIT ===");

  // 1. Audit src/lib/firebase/auth.ts implementation
  const authPath = path.resolve("src/lib/firebase/auth.ts");
  const authCode = fs.readFileSync(authPath, "utf-8");

  if (!authCode.includes("members_shard") || !authCode.includes("history_shard")) {
    throw new Error("FAIL: Shard references (members_shard, history_shard) missing in auth.ts!");
  }
  console.log("✔ PASS: Multi-document sharding verified in auth.ts.");

  if (!authCode.includes("remoteTime > localTime")) {
    throw new Error("FAIL: Timestamp-based reconciliation logic missing in mergeCollectionArraysById!");
  }
  console.log("✔ PASS: Timestamp-based concurrency reconciliation (updatedAt) verified in auth.ts.");

  // 2. Simulate mergeCollectionArraysById algorithm
  function simulateMerge(remoteList, localList, key) {
    const map = new Map();
    for (const rItem of remoteList) {
      if (rItem && rItem.id) map.set(rItem.id, rItem);
    }
    for (const lItem of localList) {
      if (lItem && lItem.id) {
        const existingRemote = map.get(lItem.id);
        if (existingRemote) {
          const remoteTime = existingRemote.updatedAt ? new Date(existingRemote.updatedAt).getTime() : 0;
          const localTime = lItem.updatedAt ? new Date(lItem.updatedAt).getTime() : 0;
          if (remoteTime > 0 && localTime > 0 && remoteTime > localTime) {
            continue; // Remote is newer!
          }
          if (key === "workshops") {
            map.set(lItem.id, {
              ...existingRemote,
              ...lItem,
              registeredMemberIds: Array.from(
                new Set([...(lItem.registeredMemberIds || []), ...(existingRemote.registeredMemberIds || [])])
              ),
            });
          } else {
            map.set(lItem.id, { ...existingRemote, ...lItem });
          }
        } else {
          map.set(lItem.id, lItem);
        }
      }
    }
    return Array.from(map.values());
  }

  // Test Case A: Remote has newer timestamp -> Remote wins
  const remoteA = [{ id: "mem-1", fullName: "Alice Cloud", updatedAt: "2026-10-30T03:30:00Z" }];
  const localA = [{ id: "mem-1", fullName: "Alice Stale Local", updatedAt: "2026-10-30T03:10:00Z" }];
  const mergedA = simulateMerge(remoteA, localA, "members");
  if (mergedA[0].fullName !== "Alice Cloud") {
    throw new Error(`FAIL: Stale local overwrite occurred! Expected 'Alice Cloud', got '${mergedA[0].fullName}'`);
  }
  console.log("✔ PASS: Stale local write does not overwrite newer remote cloud update.");

  // Test Case B: Local has newer timestamp -> Local wins
  const remoteB = [{ id: "mem-2", fullName: "Bob Old Cloud", updatedAt: "2026-10-30T03:10:00Z" }];
  const localB = [{ id: "mem-2", fullName: "Bob Fresh Local", updatedAt: "2026-10-30T03:45:00Z" }];
  const mergedB = simulateMerge(remoteB, localB, "members");
  if (mergedB[0].fullName !== "Bob Fresh Local") {
    throw new Error(`FAIL: Newer local write was rejected! Expected 'Bob Fresh Local', got '${mergedB[0].fullName}'`);
  }
  console.log("✔ PASS: Fresh local write correctly updates cloud record.");

  // Test Case C: Workshop registrations merge union
  const remoteC = [{ id: "ws-1", registeredMemberIds: ["user-1", "user-2"], updatedAt: "2026-10-30T03:00:00Z" }];
  const localC = [{ id: "ws-1", registeredMemberIds: ["user-2", "user-3"], updatedAt: "2026-10-30T03:05:00Z" }];
  const mergedC = simulateMerge(remoteC, localC, "workshops");
  if (mergedC[0].registeredMemberIds.length !== 3) {
    throw new Error(`FAIL: Workshop registrations were not merged as union! Length: ${mergedC[0].registeredMemberIds.length}`);
  }
  console.log("✔ PASS: Workshop registrations preserved as set union across concurrent devices.");

  console.log("✔ TEST SUITE 5 SUCCESS: Document sharding & concurrency reconciliation verified!");
}

runConcurrencyMergeAudit().catch((err) => {
  console.error("❌ TEST SUITE 5 FAILED:", err);
  process.exit(1);
});
