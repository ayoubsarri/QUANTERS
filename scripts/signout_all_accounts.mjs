/**
 * Sign Out & Revoke All Accounts in Firebase Authentication
 * Updates all users with validSince timestamp to invalidate all refresh tokens,
 * ensuring all active sessions across all devices are terminated.
 */

import fs from "fs";
import path from "path";
import https from "https";

const PROJECT_NUMBER = "815338551488";

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

export async function signoutAllAccounts() {
  const token = getAccessToken();
  console.log("1. Fetching all Firebase Authentication accounts...");

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
  console.log(`Found ${authUsers.length} user accounts in Firebase Auth.`);

  const nowEpoch = String(Math.floor(Date.now() / 1000));
  let revokedCount = 0;

  for (const user of authUsers) {
    console.log(`Revoking active sessions for UID: ${user.localId} (${user.email || "no-email"})...`);
    try {
      await requestJson(
        `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_NUMBER}/accounts:update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
        {
          localId: user.localId,
          validSince: nowEpoch,
        }
      );
      revokedCount++;
    } catch (err) {
      console.warn(`  Warning: Could not revoke tokens for ${user.localId}:`, err.message);
    }
  }

  console.log(`✓ Successfully signed out and revoked active tokens for ${revokedCount} accounts!`);
  return { revokedCount, totalUsers: authUsers.length };
}

if (process.argv[1]?.endsWith("signout_all_accounts.mjs")) {
  signoutAllAccounts()
    .then((res) => {
      console.log("Signout Result:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Signout Error:", err);
      process.exit(1);
    });
}
