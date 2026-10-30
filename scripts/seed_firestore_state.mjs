import fs from "fs";
import path from "path";
import os from "os";

// Load Firebase CLI OAuth token
const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const token = config.tokens?.access_token;

if (!token) {
  console.error("No Firebase access token found in configstore!");
  process.exit(1);
}

// Convert JS primitive values to Firestore REST API value format
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue),
      },
    };
  }
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

// Convert Firestore REST document fields to JS object
function fromFirestoreFields(fields) {
  if (!fields) return {};
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    res[k] = fromFirestoreValue(v);
  }
  return res;
}

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

async function main() {
  console.log("=== SEEDING CLOUD FIRESTORE erp_state/main ===");
  const docUrl = `https://firestore.googleapis.com/v1/projects/quanters-d0312/databases/(default)/documents/erp_state/main`;
  
  // 1. Fetch current document
  console.log("Fetching current erp_state/main from Firestore...");
  const getRes = await fetch(docUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const currentDoc = await getRes.json();
  const currentFields = fromFirestoreFields(currentDoc.fields || {});

  // 2. Load seed data from seed.ts
  const seedContent = fs.readFileSync("src/lib/data/seed.ts", "utf8");
  
  // Extract SEED_WORKSHOPS
  const wsMatch = seedContent.match(/export const SEED_WORKSHOPS: Workshop\[\] = (\[[\s\S]*?\]);\s*export const SEED_BADGES/);
  // Extract SEED_BADGES
  const badgeMatch = seedContent.match(/export const SEED_BADGES: Badge\[\] = (\[[\s\S]*?\]);\s*export const SEED_EXAMS/);
  // Extract SEED_EXAMS
  const examMatch = seedContent.match(/export const SEED_EXAMS: BadgeExam\[\] = (\[[\s\S]*?\]);\s*export const SEED_TASKS/);

  // We can evaluate these cleanly in an isolated context
  const evalSeed = (str) => {
    return new Function(`return ${str}`)();
  };

  const seedWorkshops = evalSeed(wsMatch[1]);
  const seedBadges = evalSeed(badgeMatch[1]);
  const seedExams = evalSeed(examMatch[1]);

  console.log(`Parsed seeds: ${seedWorkshops.length} workshops, ${seedBadges.length} badges, ${seedExams.length} exams.`);

  // Merge workshops: preserve existing remote workshops (like "Python" ws-1793380183475), add missing seed workshops
  const existingWs = Array.isArray(currentFields.workshops) ? currentFields.workshops : [];
  const existingWsIds = new Set(existingWs.map(w => w.id));
  const mergedWorkshops = [...existingWs];
  for (const sw of seedWorkshops) {
    if (!existingWsIds.has(sw.id)) {
      mergedWorkshops.push(sw);
    }
  }

  // Merge badges: preserve any existing, add seed badges
  const existingBadges = Array.isArray(currentFields.badges) ? currentFields.badges : [];
  const existingBadgeIds = new Set(existingBadges.map(b => b.id));
  const mergedBadges = [...existingBadges];
  for (const sb of seedBadges) {
    if (!existingBadgeIds.has(sb.id)) {
      mergedBadges.push(sb);
    }
  }

  // Merge exams: preserve any existing, add seed exams
  const existingExams = Array.isArray(currentFields.exams) ? currentFields.exams : [];
  const existingExamIds = new Set(existingExams.map(e => e.id));
  const mergedExams = [...existingExams];
  for (const se of seedExams) {
    if (!existingExamIds.has(se.id)) {
      mergedExams.push(se);
    }
  }

  console.log(`Merged targets:`);
  console.log(`  Workshops: ${mergedWorkshops.length} items (${mergedWorkshops.map(w => w.title).join(", ")})`);
  console.log(`  Badges: ${mergedBadges.length} items (${mergedBadges.map(b => b.name).join(", ")})`);
  console.log(`  Exams: ${mergedExams.length} items (${mergedExams.map(e => e.title).join(", ")})`);

  // Patch erp_state/main using updateMask for workshops, badges, exams
  const patchUrl = `${docUrl}?updateMask.fieldPaths=workshops&updateMask.fieldPaths=badges&updateMask.fieldPaths=exams`;
  const patchBody = {
    fields: {
      workshops: toFirestoreValue(mergedWorkshops),
      badges: toFirestoreValue(mergedBadges),
      exams: toFirestoreValue(mergedExams),
    },
  };

  console.log("Writing merged updates to Cloud Firestore...");
  const patchRes = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patchBody),
  });

  if (!patchRes.ok) {
    const errText = await patchRes.text();
    console.error("Firestore PATCH failed:", patchRes.status, errText);
    process.exit(1);
  }

  console.log("✅ Successfully seeded erp_state/main in Cloud Firestore!");
}

main().catch(console.error);
