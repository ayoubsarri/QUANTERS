import fs from "fs";
import path from "path";
import https from "https";

const home = process.env.USERPROFILE || process.env.HOME;
const configstorePath = path.join(home, ".config", "configstore", "firebase-tools.json");

if (!fs.existsSync(configstorePath)) {
  console.error("Firebase configstore not found at:", configstorePath);
  process.exit(1);
}

const configstore = JSON.parse(fs.readFileSync(configstorePath, "utf8"));
const token = configstore.tokens?.access_token;
if (!token) {
  console.error("No access token found in Firebase configstore.");
  process.exit(1);
}

const exportPath = path.join(process.cwd(), "users_export_temp.json");
if (!fs.existsSync(exportPath)) {
  console.error("Export file not found at:", exportPath);
  process.exit(1);
}

const exportData = JSON.parse(fs.readFileSync(exportPath, "utf8"));
const allUsers = exportData.users || [];

const PRESERVED_EMAILS = new Set([
  "quantaclubdz@gmail.com",
  "ayoubsarri1@gmail.com",
  "hr.quanta@univ-alger.dz",
  "bellilisamy0@gmail.com",
  "fedouabenchabane@gmail.com",
  "masterstudent442@gmail.com",
  "benkacirkawthar18@gmail.com",
  "akramfd689@gmail.com",
  "ahfarah627@gmail.com",
  "physicsstudents10@gmail.com",
  "techdzpro06@gmail.com",
  "loutfi.belabbas@univ-alger.dz",
  "karim.hadj.2026@univ-alger.dz",
  "nassim.zerrouki.2026@univ-alger.dz",
]);

const uidsToDelete = [];

for (const user of allUsers) {
  const email = (user.email || "").toLowerCase().trim();
  if (!email) {
    // Anonymous user
    uidsToDelete.push({ uid: user.localId, reason: "anonymous" });
  } else if (
    email.includes("test") ||
    email.includes("probe") ||
    email.startsWith("test.") ||
    email.includes("karim.astronomy") ||
    email.includes("karim.astrophysics")
  ) {
    if (!PRESERVED_EMAILS.has(email)) {
      uidsToDelete.push({ uid: user.localId, email, reason: "test account" });
    }
  }
}

console.log(`Total users in export: ${allUsers.length}`);
console.log(`Identified ${uidsToDelete.length} accounts to delete.`);
console.log(`Preserved ${allUsers.length - uidsToDelete.length} legitimate accounts.`);

async function deleteBatch(uids) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      localIds: uids,
      force: true,
    });

    const req = https.request(
      "https://identitytoolkit.googleapis.com/v1/projects/815338551488/accounts:batchDelete",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true });
          } else {
            reject(new Error(`Failed with status ${res.statusCode}: ${body}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  const BATCH_SIZE = 80;
  let deletedCount = 0;

  for (let i = 0; i < uidsToDelete.length; i += BATCH_SIZE) {
    const batch = uidsToDelete.slice(i, i + BATCH_SIZE).map((item) => item.uid);
    try {
      await deleteBatch(batch);
      deletedCount += batch.length;
      console.log(`Deleted batch ${Math.floor(i / BATCH_SIZE) + 1} (${deletedCount} / ${uidsToDelete.length})...`);
    } catch (err) {
      console.error(`Error deleting batch starting at index ${i}:`, err.message);
    }
  }

  console.log(`Successfully purged ${deletedCount} anonymous & test accounts from Firebase Auth!`);
}

run();
