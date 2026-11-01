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
  if ("arrayValue" in val) {
    return (val.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ("mapValue" in val) {
    return fromFirestoreFields(val.mapValue.fields);
  }
  return null;
}

function fromFirestoreFields(fields) {
  if (!fields) return {};
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    res[k] = fromFirestoreValue(v);
  }
  return res;
}

async function getDoc(collection, docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(`Firestore error: ${JSON.stringify(data.error)}`);
  }
  return fromFirestoreFields(data.fields);
}

async function main() {
  try {
    const shard = await getDoc("erp_state", "members_shard");
    console.log("members_shard found, fields:", Object.keys(shard));
  } catch (e) {
    console.log("members_shard check:", e.message);
  }

  const main = await getDoc("erp_state", "main");
  const members = Array.isArray(main.members) ? main.members : [];
  console.log(`Found ${members.length} members in erp_state/main.`);

  members.forEach((m, idx) => {
    console.log(
      `[${idx + 1}] ID: ${m.id} | ${(m.fullName || "N/A").padEnd(25)} | Tenure: ${(m.tenure || "N/A").padEnd(12)} | Status: ${(m.status || "").padEnd(8)} | Lvl: ${m.level} (${m.levelTitle || "N/A"}) | Total XP: ${m.xpTotal} | Month XP: ${m.xpMonth}`
    );
  });
}

main().catch(console.error);
