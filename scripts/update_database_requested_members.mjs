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

function normalizeName(name) {
  return (name || "").toLowerCase().trim();
}

async function main() {
  console.log("=== APPLYING USER SPECIFIC UPDATES & AUTO-CONFIRMING OLD MEMBERS ===");
  const main = await getDoc("erp_state", "main");
  const members = Array.isArray(main.members) ? main.members : [];

  console.log(`Fetched ${members.length} members from Firestore.`);

  // Specific corrections requested:
  // 1. Nadil Chaima: 2 years in club
  // 2. Akram Fd: 1 year
  // 3. SAADI Maria: 2 years
  // 4. Abderrahmane Bent: 1 year
  // 5. Bouhenika Méroua Sarah: 1 year
  // And for ALL old members: auto Confirm Active not Trainee

  const updatedMembers = members.map((m) => {
    let tenure = m.tenure;
    const norm = normalizeName(m.fullName);

    if (norm.includes("nadil") && norm.includes("chaima")) {
      tenure = "2+ Years";
    } else if (norm.includes("akram") && norm.includes("fd")) {
      tenure = "1 Year";
    } else if (norm.includes("saadi") && norm.includes("maria")) {
      tenure = "2+ Years";
    } else if (norm.includes("abderrahmane") && norm.includes("bent")) {
      tenure = "1 Year";
    } else if (norm.includes("bouhenika") || (norm.includes("méroua") && norm.includes("sarah"))) {
      tenure = "1 Year";
    }

    const cleanTenure = String(tenure || "").trim().toLowerCase();
    const isAlumni = m.status === "Alumni" || cleanTenure.includes("alumni");
    const isBureauLeadership =
      cleanTenure.includes("bureau") ||
      cleanTenure.includes("leadership") ||
      (Array.isArray(m.roles) && m.roles.includes("Super Admin"));

    let level = 1;
    let levelTitle = "Novice Quanter";
    let baseTotalXp = 50;

    if (isAlumni) {
      level = 8;
      levelTitle = "Quanta Laureate";
      baseTotalXp = 1800;
    } else if (isBureauLeadership) {
      level = 3;
      levelTitle = "Executive Quanter";
      baseTotalXp = 350;
    } else if (cleanTenure.includes("2+") || cleanTenure.includes("2 year") || cleanTenure.includes("3 year")) {
      level = 3;
      levelTitle = "2 Years Member";
      baseTotalXp = 300;
    } else if (cleanTenure.includes("1 year")) {
      level = 2;
      levelTitle = "1 Year Member";
      baseTotalXp = 150;
    } else {
      level = 1;
      levelTitle = "Novice Quanter";
      baseTotalXp = 50;
    }

    const isOldMember = level >= 2;
    const finalStatus = isAlumni ? "Alumni" : isOldMember ? "Active" : m.status === "Pending" ? "Pending" : "Trainee";

    const roles = isOldMember && norm.includes("akram")
      ? ["Member"]
      : m.roles;

    const onboardingTicks = {
      ...(m.onboardingTicks || {}),
      profileComplete: true,
      buddyAssigned: isOldMember ? true : m.onboardingTicks?.buddyAssigned ?? false,
      firstTaskBeforeDay30: isOldMember ? true : m.onboardingTicks?.firstTaskBeforeDay30 ?? false,
      firstWorkshopAttended: isOldMember ? true : m.onboardingTicks?.firstWorkshopAttended ?? false,
      hrApproved: isOldMember || isAlumni || Boolean(m.onboardingTicks?.hrApproved),
      hrApprovedAt: isOldMember || isAlumni ? (m.onboardingTicks?.hrApprovedAt || new Date().toISOString()) : m.onboardingTicks?.hrApprovedAt,
      hrApprovedBy: isOldMember || isAlumni ? "Seniority Auto-Confirmation" : m.onboardingTicks?.hrApprovedBy || "System Auto-Admission",
    };

    return {
      ...m,
      tenure,
      level,
      levelTitle,
      status: finalStatus,
      roles,
      isBureauMember: isBureauLeadership,
      xpTotal: Math.max(m.xpTotal, baseTotalXp),
      xpSeason: Math.max(m.xpSeason, isAlumni ? 600 : baseTotalXp),
      // xpMonth is strictly untouched
      onboardingTicks,
    };
  });

  console.log("\n--- UPDATED ROSTER PREVIEW ---");
  updatedMembers.forEach((m, idx) => {
    console.log(
      `[${String(idx + 1).padStart(2, " ")}] ${m.fullName.padEnd(25)} | Tenure: ${(m.tenure || "").padEnd(12)} | Lvl: ${m.level} (${m.levelTitle.padEnd(17)}) | Status: ${m.status.padEnd(7)} | Total XP: ${String(m.xpTotal).padEnd(4)} | Month XP: ${m.xpMonth}`
    );
  });

  console.log("\nSaving to Cloud Firestore erp_state/main...");
  await updateDocFields("erp_state", "main", {
    members: updatedMembers,
    updatedAt: new Date().toISOString(),
  });
  console.log("Successfully updated erp_state/main!");

  console.log("Saving to Cloud Firestore erp_state/members_shard...");
  try {
    await updateDocFields("erp_state", "members_shard", {
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    });
    console.log("Successfully updated erp_state/members_shard!");
  } catch (e) {
    console.log("members_shard notice:", e.message);
  }

  // Update data/quanters-db.json
  if (fs.existsSync("data/quanters-db.json")) {
    const db = JSON.parse(fs.readFileSync("data/quanters-db.json", "utf8"));
    db.members = updatedMembers;
    fs.writeFileSync("data/quanters-db.json", JSON.stringify(db, null, 2), "utf8");
    console.log("Updated data/quanters-db.json!");
  }

  console.log("\n=== ALL DATABASE UPDATES COMPLETED SUCCESSFULLY ===");
}

main().catch(console.error);
