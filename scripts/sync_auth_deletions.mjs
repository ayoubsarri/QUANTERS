/**
 * Automated Firebase Authentication User Deletion Engine
 * Synchronizes permanently deleted club members from Cloud Firestore (`settings.archivedMembers`)
 * and deletes their credentials from Firebase Authentication (Identity Toolkit).
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

// Protected system administrators whose Firebase Auth accounts must NEVER be deleted
const PROTECTED_ADMIN_EMAILS = new Set([
  "quantaclubdz@gmail.com",
  "hr.quanta@univ-alger.dz",
  "ayoubsarri1@gmail.com",
  "bellilisamy0@gmail.com",
  "quanta.hr.club@gmail.com",
  "hr.quantaclubdz@gmail.com",
  "quanta@univ-alger.dz",
  "hr@univ-alger.dz",
]);

export async function syncPermanentlyDeletedUsers() {
  const token = getAccessToken();

  // 1. Fetch current erp_state/main from Cloud Firestore
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

  const fields = firestoreRes.data?.fields || {};
  const activeMemberEmails = new Set(
    (fields.members?.arrayValue?.values || [])
      .map((v) => v.mapValue?.fields?.email?.stringValue?.toLowerCase()?.trim())
      .filter(Boolean)
  );

  const archivedMembers = fields.settings?.mapValue?.fields?.archivedMembers?.arrayValue?.values || [];
  const archivedEmails = new Set(
    archivedMembers
      .map((v) => v.mapValue?.fields?.email?.stringValue?.toLowerCase()?.trim())
      .filter(Boolean)
  );

  console.log(`Active members in ERP: ${activeMemberEmails.size}`);
  console.log(`Permanently archived members in ERP: ${archivedEmails.size}`);

  // 2. Fetch all users from Firebase Authentication
  console.log("2. Querying Firebase Authentication accounts...");
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
  console.log(`Total Firebase Auth users: ${authUsers.length}`);

  const uidsToDelete = [];

  for (const user of authUsers) {
    const email = (user.email || "").toLowerCase().trim();
    if (!email) {
      // Anonymous session left over
      uidsToDelete.push({ uid: user.localId, reason: "anonymous session" });
      continue;
    }

    if (PROTECTED_ADMIN_EMAILS.has(email)) {
      continue;
    }

    // If email is in archivedMembers OR is missing from active ERP members
    if (archivedEmails.has(email) || !activeMemberEmails.has(email)) {
      // Make sure it's not a legitimate un-archived member
      uidsToDelete.push({ uid: user.localId, email, reason: "purged or archived member" });
    }
  }

  if (uidsToDelete.length === 0) {
    console.log("✓ All Firebase Authentication accounts are synchronized. No orphaned accounts to delete.");
    return { deletedCount: 0 };
  }

  console.log(`3. Deleting ${uidsToDelete.length} orphaned/purged accounts from Firebase Authentication...`);
  for (const item of uidsToDelete) {
    console.log(`  - Deleting UID: ${item.uid} (${item.email || item.reason})`);
  }

  const batchRes = await requestJson(
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

  console.log("✓ Successfully deleted orphaned accounts from Firebase Authentication!");
  return { deletedCount: uidsToDelete.length, deletedUsers: uidsToDelete };
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith("sync_auth_deletions.mjs")) {
  syncPermanentlyDeletedUsers()
    .then((res) => {
      console.log("Result:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error during auth sync:", err);
      process.exit(1);
    });
}
