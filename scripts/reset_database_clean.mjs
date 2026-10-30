/**
 * Database Clean Reset Script for QUANTERS (quanters-d0312)
 * Retains ONLY Super Admins, Explore Posts, and Daily Quotes.
 * Empties workshops, messages, tasks, proposals, ledger, auditLogs, grievances, etc.
 */

import fs from "fs";
import path from "path";
import https from "https";

const PROJECT_NUMBER = "815338551488";
const PROJECT_ID = "quanters-d0312";

function getAccessToken() {
  const home = process.env.USERPROFILE || process.env.HOME;
  const configstorePath = path.join(home, ".config", "configstore", "firebase-tools.json");
  if (!fs.existsSync(configstorePath)) {
    throw new Error(`Firebase configstore not found at ${configstorePath}`);
  }
  const config = JSON.parse(fs.readFileSync(configstorePath, "utf8"));
  const token = config.tokens?.access_token;
  if (!token) {
    throw new Error("No active Firebase CLI access token found.");
  }
  return token;
}

function requestJson(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed || body)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, raw: body });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        }
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

const SUPER_ADMIN_EMAILS = new Set([
  "quantaclubdz@gmail.com",
  "ayoubsarri1@gmail.com",
  "hr.quanta@univ-alger.dz",
  "bellilisamy0@gmail.com",
  "quanta.hr.club@gmail.com",
  "hr.quantaclubdz@gmail.com",
  "quanta@univ-alger.dz",
  "hr@univ-alger.dz",
]);

// Convert JS object to Firestore REST Field Values
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
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

// Convert Firestore REST Field Values to JS object
function fromFirestoreValue(val) {
  if (!val) return null;
  if ("nullValue" in val) return null;
  if ("booleanValue" in val) return val.booleanValue;
  if ("integerValue" in val) return parseInt(val.integerValue, 10);
  if ("doubleValue" in val) return val.doubleValue;
  if ("stringValue" in val) return val.stringValue;
  if ("arrayValue" in val) {
    return (val.arrayValue?.values || []).map(fromFirestoreValue);
  }
  if ("mapValue" in val) {
    const res = {};
    for (const [k, v] of Object.entries(val.mapValue?.fields || {})) {
      res[k] = fromFirestoreValue(v);
    }
    return res;
  }
  return null;
}

export async function resetDatabaseClean() {
  const token = getAccessToken();

  console.log("1. Fetching master ERP state from Cloud Firestore...");
  const firestoreRes = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/erp_state/main`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const rawFields = firestoreRes.data?.fields || {};
  const currentDoc = {};
  for (const [k, v] of Object.entries(rawFields)) {
    currentDoc[k] = fromFirestoreValue(v);
  }

  console.log("Current document collections loaded.");

  // Filter members: KEEP ONLY SUPER ADMINS
  const existingMembers = Array.isArray(currentDoc.members) ? currentDoc.members : [];
  const keptMembers = existingMembers.filter((m) => {
    const email = (m?.email || "").toLowerCase().trim();
    return SUPER_ADMIN_EMAILS.has(email);
  });

  // Ensure official Super Admin profiles exist
  const keptEmails = new Set(keptMembers.map((m) => (m?.email || "").toLowerCase().trim()));

  if (!keptEmails.has("quantaclubdz@gmail.com")) {
    keptMembers.push({
      id: "mem-super-quanta",
      quanterId: "QT-00-0000",
      handle: "@quanta_admin",
      email: "quantaclubdz@gmail.com",
      fullName: "QUANTA Super Admin",
      phone: "",
      wilaya: "Algiers (16)",
      commune: "",
      university: "University of Algiers 1",
      housingType: "Family Home",
      commuteTime: "< 30 min",
      canStayLate: true,
      major: "Computer Science (Informatique Générale)",
      academicYear: "L3",
      tenure: "Bureau Leadership (2026/2027)",
      hasLaptop: true,
      pcCapability: "Coding & Dev",
      equipmentTags: ["Personal Laptop"],
      githubUrl: "",
      linkedinUrl: "",
      portfolioUrl: "",
      departmentId: "dept-it",
      roles: ["Super Admin", "Executive", "HR Head"],
      isBureauMember: true,
      status: "Active",
      statusSince: "Oct 2026",
      attendanceRate: 100,
      onTimeTaskRate: 100,
      recentActivityScore: 100,
      healthScore: 100,
      level: 1,
      levelTitle: "Quanta Initiate",
      xpTotal: 0,
      xpSeason: 0,
      xpMonth: 0,
      badgeIds: [],
    });
  }

  if (!keptEmails.has("ayoubsarri1@gmail.com")) {
    keptMembers.push({
      id: "mem-ayoub-sarri",
      quanterId: "QT-01-0001",
      handle: "@ayoub_sarri",
      email: "ayoubsarri1@gmail.com",
      fullName: "Ayoub Sarri",
      phone: "",
      wilaya: "Algiers (16)",
      commune: "",
      university: "University of Algiers 1",
      housingType: "Family Home",
      commuteTime: "< 30 min",
      canStayLate: true,
      major: "Computer Science",
      academicYear: "Master",
      tenure: "Executive Leadership",
      hasLaptop: true,
      pcCapability: "Coding & Dev",
      equipmentTags: ["Personal Laptop"],
      departmentId: "dept-it",
      roles: ["Super Admin", "Executive"],
      isBureauMember: true,
      status: "Active",
      statusSince: "Oct 2026",
      attendanceRate: 100,
      onTimeTaskRate: 100,
      recentActivityScore: 100,
      healthScore: 100,
      level: 1,
      levelTitle: "Quanta Initiate",
      xpTotal: 0,
      xpSeason: 0,
      xpMonth: 0,
      badgeIds: [],
    });
  }

  console.log(`Preserved ${keptMembers.length} Super Admin members:`, keptMembers.map(m => m.email));

  // Explore Posts & Quotes: KEEP
  const keptExplorePosts = Array.isArray(currentDoc.explorePosts) ? currentDoc.explorePosts : [];
  const keptCustomQuotes = Array.isArray(currentDoc.customDailyQuotes) ? currentDoc.customDailyQuotes : [];

  console.log(`Preserved ${keptExplorePosts.length} Explore posts and ${keptCustomQuotes.length} Custom Quotes.`);

  // Clean settings
  const cleanSettings = {
    ...(currentDoc.settings || {}),
    archivedMembers: [], // Unban / clean permanently deleted records so users can re-register
  };

  // Build clean master state payload
  const cleanMasterDoc = {
    ...currentDoc,
    members: keptMembers,
    workshops: [],
    messages: [],
    tasks: [],
    proposals: [],
    ledger: [],
    auditLogs: [],
    grievances: [],
    examCompletions: [],
    projectSubmissions: [],
    invitations: [],
    accessGrants: [],
    explorePosts: keptExplorePosts,
    customDailyQuotes: keptCustomQuotes,
    settings: cleanSettings,
    updatedAt: new Date().toISOString(),
  };

  // Convert to Firestore fields format
  const fieldsPayload = {};
  for (const [k, v] of Object.entries(cleanMasterDoc)) {
    fieldsPayload[k] = toFirestoreValue(v);
  }

  console.log("2. Writing cleaned database to Firestore erp_state/main...");
  await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/erp_state/main`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    { fields: fieldsPayload }
  );

  console.log("✓ Cloud Firestore erp_state/main successfully reset and cleaned!");

  // 3. Sync Firebase Auth accounts to delete any remaining non-superadmin accounts
  console.log("3. Syncing Firebase Authentication users...");
  const authRes = await requestJson(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_NUMBER}/accounts:query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    { maxResults: 500 }
  );

  const authUsers = authRes.data?.userInfo || [];
  const uidsToDelete = [];

  for (const user of authUsers) {
    const email = (user.email || "").toLowerCase().trim();
    if (!email) {
      uidsToDelete.push({ uid: user.localId, reason: "anonymous session" });
      continue;
    }
    if (SUPER_ADMIN_EMAILS.has(email)) {
      continue;
    }
    uidsToDelete.push({ uid: user.localId, email, reason: "purged test user" });
  }

  if (uidsToDelete.length > 0) {
    console.log(`Deleting ${uidsToDelete.length} non-admin accounts from Firebase Auth...`);
    await requestJson(
      `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_NUMBER}/accounts:batchDelete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      {
        localIds: uidsToDelete.map((u) => u.uid),
        force: true,
      }
    );
    console.log("✓ Firebase Authentication cleaned! Non-admin accounts removed.");
  } else {
    console.log("✓ Firebase Authentication already clean. Only Super Admins remain.");
  }

  return {
    success: true,
    superAdminsCount: keptMembers.length,
    explorePostsCount: keptExplorePosts.length,
    quotesCount: keptCustomQuotes.length,
    workshopsCount: 0,
    messagesCount: 0,
    tasksCount: 0,
    authDeletedCount: uidsToDelete.length,
  };
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith("reset_database_clean.mjs")) {
  resetDatabaseClean()
    .then((res) => {
      console.log("Clean Reset Complete:", JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error during clean reset:", err);
      process.exit(1);
    });
}
