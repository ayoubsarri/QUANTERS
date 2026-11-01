import fs from "fs";
import os from "os";
import path from "path";

const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const token = config.tokens?.access_token;
const projectId = "quanters-d0312";

if (!token) {
  console.error("No access token found in firebase-tools.json");
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

async function updateDocFields(collection, docId, fieldsToUpdate) {
  const maskQuery = Object.keys(fieldsToUpdate)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?${maskQuery}`;

  const firestoreFields = {};
  for (const [k, v] of Object.entries(fieldsToUpdate)) {
    firestoreFields[k] = toFirestoreValue(v);
  }

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: firestoreFields }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Firestore update error: ${JSON.stringify(data.error)}`);
  }
  return data;
}

function computeMemberSeniorityAndBaseScore(member) {
  const cleanTenure = String(member.tenure || "").trim().toLowerCase();
  const isAlumni = member.status === "Alumni" || cleanTenure.includes("alumni");
  if (isAlumni) {
    return {
      level: 8,
      levelTitle: "Quanta Laureate",
      baseTotalXp: 1800,
    };
  }

  const isBureau =
    cleanTenure.includes("bureau") ||
    cleanTenure.includes("leadership") ||
    (Array.isArray(member.roles) && member.roles.includes("Super Admin"));

  if (isBureau) {
    return {
      level: 3,
      levelTitle: "Executive Quanter",
      baseTotalXp: 350,
    };
  }

  if (
    cleanTenure.includes("2+") ||
    cleanTenure.includes("2 years") ||
    cleanTenure.includes("3 year") ||
    cleanTenure.includes("senior")
  ) {
    return {
      level: 3,
      levelTitle: "2 Years Member",
      baseTotalXp: 300,
    };
  }

  if (cleanTenure === "1 year" || cleanTenure.includes("1 year")) {
    return {
      level: 2,
      levelTitle: "1 Year Member",
      baseTotalXp: 150,
    };
  }

  // Level 1 Novice strictly for new members (< 1 year, 1 semester, new trainee, new member)
  return {
    level: 1,
    levelTitle: "Novice Quanter",
    baseTotalXp: 50,
  };
}

async function main() {
  console.log("=== CORRECTING REGISTERED MEMBERS SENIORITY & SCORES IN FIRESTORE ===");
  const main = await getDoc("erp_state", "main");
  const members = Array.isArray(main.members) ? main.members : [];

  console.log(`Fetched ${members.length} members from erp_state/main.`);

  const updatedMembers = members.map((m) => {
    const { level, levelTitle, baseTotalXp } = computeMemberSeniorityAndBaseScore(m);
    
    // Earned activity is whatever they earned beyond initial grant (or total minus 50)
    // Activity score = xpMonth or earned score
    const activityEarned = Math.max(0, m.xpMonth || 0);

    // Calculate corrected total XP:
    // If baseTotalXp is higher than current, elevate to baseTotalXp + activityEarned
    // If current xpTotal is already higher, preserve it
    const correctedTotalXp = Math.max(m.xpTotal, baseTotalXp + (activityEarned > 0 && baseTotalXp > 50 ? 0 : 0));
    const finalTotalXp = Math.max(correctedTotalXp, baseTotalXp + (m.xpMonth > 0 && m.xpTotal > 50 ? (m.xpTotal - 50) : 0));

    const cleanTenure = String(m.tenure || "").trim().toLowerCase();
    const isActuallyNew = cleanTenure === "new member" || cleanTenure === "1 semester" || cleanTenure === "new trainee";
    const cleanedRoles = isActuallyNew && Array.isArray(m.roles)
      ? m.roles.filter((r) => r !== "Executive" && r !== "Super Admin")
      : m.roles;
    const isBureauMember = isActuallyNew ? false : m.isBureauMember;

    // Notice: Monthly score (xpMonth) is STRICTLY UNCHANGED
    return {
      ...m,
      level,
      levelTitle,
      roles: cleanedRoles && cleanedRoles.length > 0 ? cleanedRoles : ["Member"],
      isBureauMember: Boolean(isBureauMember),
      xpTotal: isActuallyNew ? (m.xpTotal > 100 ? 50 + (m.xpMonth || 0) : Math.max(m.xpTotal, baseTotalXp)) : Math.max(m.xpTotal, baseTotalXp),
      xpSeason: isActuallyNew ? (m.xpSeason > 100 ? 50 + (m.xpMonth || 0) : Math.max(m.xpSeason, baseTotalXp)) : Math.max(m.xpSeason, baseTotalXp),
      // xpMonth remains untouched
    };
  });

  console.log("\n--- CORRECTION SUMMARY ---");
  members.forEach((orig, idx) => {
    const updated = updatedMembers[idx];
    const changed =
      orig.level !== updated.level ||
      orig.levelTitle !== updated.levelTitle ||
      orig.xpTotal !== updated.xpTotal;
    console.log(
      `[${idx + 1}] ${updated.fullName.padEnd(25)} | Tenure: ${(updated.tenure || "").padEnd(12)} | Lvl: ${orig.level} (${orig.levelTitle}) -> ${updated.level} (${updated.levelTitle}) | XP: ${orig.xpTotal} -> ${updated.xpTotal} (Month XP: ${updated.xpMonth})${changed ? " [CORRECTED]" : " [OK]"}`
    );
  });

  // 1. Update erp_state/main
  console.log("\nSaving to Firestore erp_state/main...");
  await updateDocFields("erp_state", "main", {
    members: updatedMembers,
    updatedAt: new Date().toISOString(),
  });
  console.log("Successfully updated erp_state/main!");

  // 2. Update erp_state/members_shard
  console.log("Saving to Firestore erp_state/members_shard...");
  try {
    await updateDocFields("erp_state", "members_shard", {
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    });
    console.log("Successfully updated erp_state/members_shard!");
  } catch (e) {
    console.log("members_shard update notice:", e.message);
  }

  // 3. Update local data/quanters-db.json if exists
  if (fs.existsSync("data/quanters-db.json")) {
    try {
      const localDb = JSON.parse(fs.readFileSync("data/quanters-db.json", "utf8"));
      localDb.members = updatedMembers;
      fs.writeFileSync("data/quanters-db.json", JSON.stringify(localDb, null, 2), "utf8");
      console.log("Updated data/quanters-db.json successfully.");
    } catch (e) {
      console.log("Local db update notice:", e.message);
    }
  }

  console.log("\n=== ALL REGISTERED MEMBERS CORRECTED SUCCESSFULLY! ===");
}

main().catch(console.error);
