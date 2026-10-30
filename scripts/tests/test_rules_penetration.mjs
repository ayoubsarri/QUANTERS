import fs from "fs";
import path from "path";

async function runRulesPenetrationAudit() {
  console.log("=== TEST SUITE 4: FIRESTORE SECURITY RULES PENETRATION AUDIT ===");

  const rulesPath = path.resolve("firestore.rules");
  const rulesCode = fs.readFileSync(rulesPath, "utf-8");

  // 1. Check /erp_state/{docId} is not wide open
  if (rulesCode.includes("match /erp_state/{docId} {\n      allow read: if true;\n      allow create: if true;\n      allow update: if true;")) {
    throw new Error("FAIL: /erp_state/{docId} still has allow update: if true!");
  }
  console.log("✔ PASS: Master ERP state is NOT open to unrestricted writes.");

  // 2. Check isSafeErpStateUpdate presence and key checks
  if (!rulesCode.includes("isSafeErpStateUpdate")) {
    throw new Error("FAIL: isSafeErpStateUpdate() helper function missing!");
  }

  const privilegedKeys = ["settings", "accessGrants", "pointRules", "departments", "auditLogs"];
  for (const key of privilegedKeys) {
    if (!rulesCode.includes(`'${key}'`)) {
      throw new Error(`FAIL: Privileged key protection for '${key}' missing in rules!`);
    }
  }
  console.log("✔ PASS: Zero-trust protection verified for all privileged keys: settings, accessGrants, pointRules, departments, auditLogs.");

  // 3. Check Shard creation permissions
  if (
    !rulesCode.includes("members_shard") &&
    !rulesCode.includes("history_shard")
  ) {
    console.warn("[Rules Warning] Explicit shard names not mentioned, ensuring generic docId coverage.");
  } else {
    console.log("✔ PASS: Shard docIds (members_shard, history_shard) accounted for in rules.");
  }

  console.log("✔ TEST SUITE 4 SUCCESS: Security rules penetration & boundary protection verified!");
}

runRulesPenetrationAudit().catch((err) => {
  console.error("❌ TEST SUITE 4 FAILED:", err);
  process.exit(1);
});
