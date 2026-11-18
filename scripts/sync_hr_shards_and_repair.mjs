import fs from "fs";
import os from "os";
import path from "path";

const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const token = config.tokens?.access_token;
const projectId = "quanters-d0312";

function fromFirestoreValue(val) {
  if (!val) return null;
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return parseInt(val.integerValue, 10);
  if ("doubleValue" in val) return val.doubleValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("nullValue" in val) return null;
  if ("arrayValue" in val) return (val.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in val) return fromFirestoreFields(val.mapValue.fields);
  return null;
}

function fromFirestoreFields(fields) {
  if (!fields) return {};
  const res = {};
  for (const [k, v] of Object.entries(fields)) res[k] = fromFirestoreValue(v);
  return res;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function getDoc(col, docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${col}/${docId}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return fromFirestoreFields(data.fields);
}

async function patchDocFields(col, docId, fieldsObj) {
  const fieldPaths = Object.keys(fieldsObj).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${col}/${docId}?${fieldPaths}`;
  const fields = {};
  for (const [k, v] of Object.entries(fieldsObj)) fields[k] = toFirestoreValue(v);
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data;
}

async function main() {
  console.log("=== REPAIRING & SYNCHRONIZING MAIN + MEMBERS_SHARD FOR HR APPROVALS ===");
  const main = await getDoc("erp_state", "main");
  const nowIso = new Date().toISOString();

  const updatedMembers = (main.members || []).map((m) => {
    // Ensure Bellili Samy & Benzaoui Israa carry updatedAt so stale mobile caches never revert them
    if (m.id === "mem-1795029261274" || m.id === "mem-1794582864758") {
      return {
        ...m,
        status: m.status === "Pending" ? "Trainee" : m.status,
        updatedAt: nowIso,
        onboardingTicks: {
          ...m.onboardingTicks,
          hrApproved: true,
          hrApprovedAt: m.onboardingTicks?.hrApprovedAt || nowIso,
          hrApprovedBy: m.onboardingTicks?.hrApprovedBy || "HR Directorate",
        },
      };
    }
    // Ensure Active / Super Admin / Alumni accounts don't carry undefined hrApproved
    if ((m.status === "Active" || m.status === "Alumni") && !m.onboardingTicks?.hrApproved) {
      return {
        ...m,
        onboardingTicks: {
          ...m.onboardingTicks,
          hrApproved: true,
          hrApprovedAt: m.onboardingTicks?.hrApprovedAt || nowIso,
          hrApprovedBy: m.onboardingTicks?.hrApprovedBy || "System Confirmation",
        },
      };
    }
    return m;
  });

  await patchDocFields("erp_state", "main", {
    members: updatedMembers,
    updatedAt: nowIso,
  });
  console.log("✓ erp_state/main patched.");

  await patchDocFields("erp_state", "members_shard", {
    shardId: "members_shard",
    members: updatedMembers,
    updatedAt: nowIso,
  });
  console.log("✓ erp_state/members_shard patched and synchronized with erp_state/main!");

  // Verify no pending mismatches remain
  const verifyMain = await getDoc("erp_state", "main");
  const verifyShard = await getDoc("erp_state", "members_shard");
  for (const name of ["Bellili Samy", "Benzaoui Israa"]) {
    const mm = verifyMain.members.find((x) => x.fullName === name);
    const ms = verifyShard.members.find((x) => x.fullName === name);
    console.log(name, "=> MAIN:", mm?.status, "hrApproved:", mm?.onboardingTicks?.hrApproved, "| SHARD:", ms?.status, "hrApproved:", ms?.onboardingTicks?.hrApproved);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
