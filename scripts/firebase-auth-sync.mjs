/**
 * QUANTERS — Firebase Authentication Admin CLI Sync
 * Integrates directly with Google Identity Toolkit API using existing Firebase CLI credentials
 * 
 * Usage:
 *   node scripts/firebase-auth-sync.mjs list
 *   node scripts/firebase-auth-sync.mjs delete <emailOrUid>
 *   node scripts/firebase-auth-sync.mjs prune
 */

import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ID = 'quanters-d0312';

function getAccessToken() {
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const configPath = path.join(home, '.config', 'configstore', 'firebase-tools.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('Firebase CLI credentials not found at ' + configPath);
  }
  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw);
  const token = parsed?.tokens?.access_token;
  if (!token) {
    throw new Error('No access token found in firebase-tools.json. Please run `firebase login`.');
  }
  return token;
}

async function listUsers() {
  const token = getAccessToken();
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:batchGet?maxResults=100`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list users: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.users || [];
}

async function deleteUserByUid(uid) {
  const token = getAccessToken();
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:delete`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ localId: uid })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to delete user ${uid}: ${res.status} ${err}`);
  }
  return await res.json();
}

async function main() {
  const [,, command, target] = process.argv;

  if (command === 'list') {
    const users = await listUsers();
    console.log(`Found ${users.length} users in Firebase Authentication (${PROJECT_ID}):`);
    for (const u of users) {
      console.log(`- UID: ${u.localId} | Email: ${u.email} | Disabled: ${Boolean(u.disabled)}`);
    }
    return;
  }

  if (command === 'delete') {
    if (!target) {
      console.error('Usage: node scripts/firebase-auth-sync.mjs delete <emailOrUid>');
      process.exit(1);
    }
    const users = await listUsers();
    const cleanTarget = target.trim().toLowerCase();
    const found = users.find(u => u.localId === target || (u.email && u.email.toLowerCase() === cleanTarget));
    if (!found) {
      console.log(`No user found matching "${target}" in Firebase Authentication.`);
      return;
    }
    console.log(`Deleting user from Firebase Auth: ${found.email} (${found.localId})...`);
    await deleteUserByUid(found.localId);
    console.log(`✅ Successfully deleted ${found.email} from Firebase Authentication!`);
    return;
  }

  if (command === 'prune') {
    console.log('Fetching active/archived members from store...');
    const users = await listUsers();
    const PROTECTED_EMAILS = [
      'quantaclubdz@gmail.com',
      'ayoubsarri1@gmail.com',
      'hr.quanta@univ-alger.dz',
      'bellilisamy0@gmail.com'
    ];
    let deletedCount = 0;
    for (const u of users) {
      if (u.email && !PROTECTED_EMAILS.includes(u.email.toLowerCase()) && u.disabled) {
        console.log(`Pruning disabled user: ${u.email}...`);
        await deleteUserByUid(u.localId);
        deletedCount++;
      }
    }
    console.log(`✅ Pruned ${deletedCount} users from Firebase Authentication.`);
    return;
  }

  console.log(`
QUANTERS Firebase Auth CLI Utility:
  node scripts/firebase-auth-sync.mjs list
  node scripts/firebase-auth-sync.mjs delete <emailOrUid>
  node scripts/firebase-auth-sync.mjs prune
`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
