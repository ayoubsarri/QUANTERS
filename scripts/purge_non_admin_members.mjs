import fs from "fs";
import path from "path";
import os from "os";

const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const token = config.tokens?.access_token;

if (!token) {
  console.error("No Firebase access token found in configstore!");
  process.exit(1);
}

const ADMIN_EMAILS = new Set([
  "quantaclubdz@gmail.com",
  "bellilisamy0@gmail.com",
  "ayoubsarri1@gmail.com",
  "ayoubsarri5@gmail.com",
  "admin@quanta.club",
]);

function isAdminMember(m) {
  const f = m.mapValue?.fields || {};
  const email = (f.email?.stringValue || "").toLowerCase().trim();
  if (ADMIN_EMAILS.has(email)) return true;
  const roles = f.roles?.arrayValue?.values?.map((r) => r.stringValue) || [];
  return roles.includes("Super Admin") || roles.includes("Executive");
}

async function purgeMembers() {
  console.log("=== STARTING PURGE OF NON-ADMIN MEMBERS ===");

  // 1. Fetch /erp_state/main
  const mainUrl = `https://firestore.googleapis.com/v1/projects/quanters-d0312/databases/(default)/documents/erp_state/main`;
  const mainRes = await fetch(mainUrl, { headers: { Authorization: `Bearer ${token}` } });
  const mainData = await mainRes.json();

  const allMembersMain = mainData.fields?.members?.arrayValue?.values || [];
  console.log(`Current members in main: ${allMembersMain.length}`);

  const keptMembersMain = allMembersMain.filter(isAdminMember);
  const purgedMembersMain = allMembersMain.filter((m) => !isAdminMember(m));

  console.log(`Retaining ${keptMembersMain.length} Admin members:`);
  for (const km of keptMembersMain) {
    const f = km.mapValue.fields;
    console.log(`  - [ADMIN] ${f.fullName?.stringValue} (${f.email?.stringValue})`);
  }

  console.log(`Purging ${purgedMembersMain.length} Non-Admin members:`);
  for (const pm of purgedMembersMain) {
    const f = pm.mapValue.fields;
    console.log(`  - [PURGED] ${f.fullName?.stringValue} (${f.email?.stringValue})`);
  }

  // Update /erp_state/main with only admin members
  const updateMainUrl = `${mainUrl}?updateMask.fieldPaths=members`;
  const patchMainRes = await fetch(updateMainUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        members: {
          arrayValue: {
            values: keptMembersMain,
          },
        },
      },
    }),
  });
  console.log("Updated /erp_state/main status:", patchMainRes.status);

  // 2. Fetch /erp_state/members_shard
  const shardUrl = `https://firestore.googleapis.com/v1/projects/quanters-d0312/databases/(default)/documents/erp_state/members_shard`;
  const shardRes = await fetch(shardUrl, { headers: { Authorization: `Bearer ${token}` } });
  const shardData = await shardRes.json();

  if (shardData.fields?.members?.arrayValue?.values) {
    const keptMembersShard = shardData.fields.members.arrayValue.values.filter(isAdminMember);
    const updateShardUrl = `${shardUrl}?updateMask.fieldPaths=members`;
    const patchShardRes = await fetch(updateShardUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          members: {
            arrayValue: {
              values: keptMembersShard,
            },
          },
        },
      }),
    });
    console.log("Updated /erp_state/members_shard status:", patchShardRes.status);
  }

  // 3. Delete individual /members/{memberId} documents for purged members
  for (const pm of purgedMembersMain) {
    const id = pm.mapValue.fields.id?.stringValue;
    if (id) {
      const docUrl = `https://firestore.googleapis.com/v1/projects/quanters-d0312/databases/(default)/documents/members/${id}`;
      const delRes = await fetch(docUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Deleted document /members/${id} status:`, delRes.status);
    }
  }

  console.log("=== PURGE COMPLETED SUCCESSFULLY ===");
}

purgeMembers().catch((err) => {
  console.error("Purge failed:", err);
  process.exit(1);
});
